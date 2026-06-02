import { Hono } from 'hono'
import {
  xpForReading,
  statsFromReadings,
  levelFromXp,
  milestoneSnapshots,
  AVATARS,
} from '../src/shared/game.js'
import { searchBooks } from './books.js'
import { safeEqual, createSession, clearSession, readSession } from './auth.js'

const app = new Hono()

// ── Hjelpere ────────────────────────────────────────────────────────────────
function nowIso() {
  return new Date().toISOString()
}

// ── Innlogging ──────────────────────────────────────────────────────────────
// Én fast familie-innlogging. Alt under /api/* (utenom /api/auth/*) krever økt.
app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/')) return next()
  const session = await readSession(c)
  if (!session) return c.json({ error: 'Ikke innlogget' }, 401)
  return next()
})

app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}))
  const okUser = safeEqual(username ?? '', c.env.AUTH_USERNAME)
  const okPass = safeEqual(password ?? '', c.env.AUTH_PASSWORD)
  if (!okUser || !okPass) return c.json({ error: 'Feil brukernavn eller passord' }, 401)
  await createSession(c, c.env.AUTH_USERNAME)
  return c.json({ username: c.env.AUTH_USERNAME })
})

app.post('/api/auth/logout', (c) => {
  clearSession(c)
  return c.json({ ok: true })
})

app.get('/api/auth/me', async (c) => {
  const session = await readSession(c)
  if (!session) return c.json({ error: 'Ikke innlogget' }, 401)
  return c.json({ username: session.sub })
})

async function readingsForChild(db, childId) {
  const { results } = await db
    .prepare('SELECT * FROM readings WHERE child_id = ? ORDER BY created_at DESC, id DESC')
    .bind(childId)
    .all()
  return results.map((r) => ({ ...r, finished: !!r.finished }))
}

// Beregn avledet tilstand (XP, level, låst-opp avatar).
async function decorateChild(db, child) {
  const readings = await readingsForChild(db, child.id)
  const stats = statsFromReadings(readings)
  const level = levelFromXp(stats.totalXp)
  return {
    ...child,
    stats,
    level,
    diplomas: milestoneSnapshots(readings),
    unlockedAvatars: AVATARS.filter((a) => a.level <= level.level).map((a) => a.emoji),
  }
}

// ── Boksøk ──────────────────────────────────────────────────────────────────
// Nasjonalbiblioteket primært (best norsk dekning) med fuzzy-fallback, og
// Open Library som fallback for utenlandske titler. Se worker/books.js.
app.get('/api/books/search', async (c) => {
  const q = (c.req.query('q') || '').trim()
  if (q.length < 2) return c.json([])
  try {
    return c.json(await searchBooks(q))
  } catch (err) {
    return c.json({ error: 'Kunne ikke nå boktjenesten' }, 502)
  }
})

// ── Barn ──────────────────────────────────────────────────────────────────
app.get('/api/children', async (c) => {
  const db = c.env.DB
  const { results } = await db.prepare('SELECT * FROM children ORDER BY created_at ASC').all()
  return c.json(await Promise.all(results.map((r) => decorateChild(db, r))))
})

app.post('/api/children', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const name = (body.name || '').toString().trim()
  const age = parseInt(body.age, 10)
  if (!name) return c.json({ error: 'Navn er påkrevd' }, 400)
  if (!Number.isFinite(age) || age < 1 || age > 120) return c.json({ error: 'Ugyldig alder' }, 400)
  const avatar = AVATARS[0].emoji
  const child = await db
    .prepare('INSERT INTO children (name, age, avatar, created_at) VALUES (?, ?, ?, ?) RETURNING *')
    .bind(name, age, avatar, nowIso())
    .first()
  return c.json(await decorateChild(db, child), 201)
})

app.patch('/api/children/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const body = await c.req.json()
  const child = await db.prepare('SELECT * FROM children WHERE id = ?').bind(id).first()
  if (!child) return c.json({ error: 'Fant ikke barnet' }, 404)

  // Bytte avatar – sjekk at den er låst opp.
  if (body.avatar != null) {
    const readings = await readingsForChild(db, id)
    const level = levelFromXp(statsFromReadings(readings).totalXp).level
    const avatarDef = AVATARS.find((a) => a.emoji === body.avatar)
    if (!avatarDef) return c.json({ error: 'Ukjent avatar' }, 400)
    if (avatarDef.level > level) return c.json({ error: 'Avataren er ikke låst opp ennå' }, 403)
    await db.prepare('UPDATE children SET avatar = ? WHERE id = ?').bind(body.avatar, id).run()
  }
  if (body.name != null && body.name.trim()) {
    await db.prepare('UPDATE children SET name = ? WHERE id = ?').bind(body.name.trim(), id).run()
  }
  if (body.age != null && Number.isFinite(parseInt(body.age, 10))) {
    await db.prepare('UPDATE children SET age = ? WHERE id = ?').bind(parseInt(body.age, 10), id).run()
  }
  const updated = await db.prepare('SELECT * FROM children WHERE id = ?').bind(id).first()
  return c.json(await decorateChild(db, updated))
})

app.delete('/api/children/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM children WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ── Lesinger ──────────────────────────────────────────────────────────────
app.get('/api/children/:id/readings', async (c) => {
  return c.json(await readingsForChild(c.env.DB, c.req.param('id')))
})

app.post('/api/children/:id/readings', async (c) => {
  const db = c.env.DB
  const childId = c.req.param('id')
  const child = await db.prepare('SELECT * FROM children WHERE id = ?').bind(childId).first()
  if (!child) return c.json({ error: 'Fant ikke barnet' }, 404)

  const body = await c.req.json()
  const title = (body.title || '').toString().trim()
  const author = (body.author || '').toString().trim() || null
  const type = ['lese', 'lydbok', 'lest_for'].includes(body.type) ? body.type : 'lese'
  const unit = body.unit === 'sider' ? 'sider' : 'minutter'
  const amount = Math.max(1, parseInt(body.amount, 10) || 0)
  const pages = body.pages != null ? Math.max(0, parseInt(body.pages, 10) || 0) : null
  const finished = body.finished ? 1 : 0

  if (!title) return c.json({ error: 'Tittel er påkrevd' }, 400)
  if (amount < 1) return c.json({ error: 'Antall må være minst 1' }, 400)

  const xp = xpForReading({ unit, amount, finished: !!finished })
  const reading = await db
    .prepare(
      `INSERT INTO readings (child_id, title, author, type, unit, amount, pages, finished, xp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .bind(childId, title, author, type, unit, amount, pages, finished, xp, nowIso())
    .first()

  const updatedChild = await decorateChild(db, child)
  return c.json(
    { reading: { ...reading, finished: !!reading.finished }, child: updatedChild, gainedXp: xp },
    201
  )
})

app.delete('/api/readings/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM readings WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

export default app
