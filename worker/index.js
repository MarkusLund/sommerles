import { Hono } from 'hono'
import {
  xpForReading,
  statsFromReadings,
  levelFromXp,
  milestoneSnapshots,
  AVATARS,
  coinsFromXp,
  rollGachaItem,
  mascotItemById,
  MASCOT_SLOTS,
  MASCOT_ITEMS,
  GACHA_COST,
  AVATAR_BG_COLORS,
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

function parseJsonColumn(raw, fallback) {
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

// Beregn avledet tilstand (XP, level, låst-opp avatar, maskot-mynter).
async function decorateChild(db, child) {
  const readings = await readingsForChild(db, child.id)
  const stats = statsFromReadings(readings)
  const level = levelFromXp(stats.totalXp)
  const owned = parseJsonColumn(child.dog_owned, [])
  const equipped = parseJsonColumn(child.dog_equipped, {})
  const coins = Math.max(0, coinsFromXp(stats.totalXp) - (child.dog_coins_spent || 0))
  const { dog_owned, dog_equipped, dog_coins_spent, ...rest } = child
  return {
    ...rest,
    stats,
    level,
    diplomas: milestoneSnapshots(readings),
    unlockedAvatars: AVATARS.filter((a) => a.level <= level.level).map((a) => a.emoji),
    mascot: { owned, equipped, coins, gachaCost: GACHA_COST },
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
  if (body.avatarBg != null) {
    if (!AVATAR_BG_COLORS.some((c) => c.id === body.avatarBg)) {
      return c.json({ error: 'Ukjent bakgrunnsfarge' }, 400)
    }
    await db.prepare('UPDATE children SET avatar_bg = ? WHERE id = ?').bind(body.avatarBg, id).run()
  }
  if (body.name != null && body.name.trim()) {
    await db.prepare('UPDATE children SET name = ? WHERE id = ?').bind(body.name.trim(), id).run()
  }
  if (body.age != null && Number.isFinite(parseInt(body.age, 10))) {
    await db.prepare('UPDATE children SET age = ? WHERE id = ?').bind(parseInt(body.age, 10), id).run()
  }

  // Ta på/av et maskot-tilbehør i en gitt slot. `null` tar av tilbehøret.
  if (body.dogEquipped != null) {
    const { slot, itemId } = body.dogEquipped
    const slotDef = MASCOT_SLOTS.find((s) => s.id === slot)
    if (!slotDef) return c.json({ error: 'Ukjent slot' }, 400)
    const owned = parseJsonColumn(child.dog_owned, [])
    if (itemId != null) {
      const item = mascotItemById(itemId)
      if (!item || item.slot !== slot) return c.json({ error: 'Ukjent tilbehør' }, 400)
      if (!owned.includes(itemId)) return c.json({ error: 'Tilbehøret er ikke ditt ennå' }, 403)
    }
    const equipped = parseJsonColumn(child.dog_equipped, {})
    if (itemId == null) delete equipped[slot]
    else equipped[slot] = itemId
    await db
      .prepare('UPDATE children SET dog_equipped = ? WHERE id = ?')
      .bind(JSON.stringify(equipped), id)
      .run()
  }

  const updated = await db.prepare('SELECT * FROM children WHERE id = ?').bind(id).first()
  return c.json(await decorateChild(db, updated))
})

// Mat mynter inn i gachapon-maskinen: trekk et tilfeldig tilbehør barnet
// ikke allerede eier.
app.post('/api/children/:id/gacha', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const child = await db.prepare('SELECT * FROM children WHERE id = ?').bind(id).first()
  if (!child) return c.json({ error: 'Fant ikke barnet' }, 404)

  const owned = parseJsonColumn(child.dog_owned, [])
  if (owned.length >= MASCOT_ITEMS.length) {
    return c.json({ error: 'Du har allerede samlet alt tilbehør! 🎉' }, 400)
  }

  const readings = await readingsForChild(db, id)
  const stats = statsFromReadings(readings)
  const coins = coinsFromXp(stats.totalXp) - (child.dog_coins_spent || 0)
  if (coins < GACHA_COST) return c.json({ error: 'Ikke nok mynter ennå' }, 400)

  const itemId = rollGachaItem(owned)
  const newOwned = [...owned, itemId]
  const newCoinsSpent = (child.dog_coins_spent || 0) + GACHA_COST

  await db
    .prepare('UPDATE children SET dog_owned = ?, dog_coins_spent = ? WHERE id = ?')
    .bind(JSON.stringify(newOwned), newCoinsSpent, id)
    .run()

  const updated = await db.prepare('SELECT * FROM children WHERE id = ?').bind(id).first()
  return c.json({
    item: mascotItemById(itemId),
    child: await decorateChild(db, updated),
  })
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

  const xp = xpForReading({ unit, amount, finished: !!finished, type })
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
