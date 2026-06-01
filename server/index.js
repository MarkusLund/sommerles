import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import db from './db.js'
import { xpForReading, statsFromReadings, levelFromXp, AVATARS } from '../src/shared/game.js'

const app = new Hono()

// ── Hjelpere ────────────────────────────────────────────────────────────────
function nowIso() {
  return new Date().toISOString()
}

function readingsForChild(childId) {
  return db
    .prepare('SELECT * FROM readings WHERE child_id = ? ORDER BY created_at DESC, id DESC')
    .all(childId)
    .map((r) => ({ ...r, finished: !!r.finished }))
}

// Beregn avledet tilstand (XP, level, låst-opp avatar) og oppdater valgt avatar
// hvis den ikke lenger er lovlig (sjelden, men trygt).
function decorateChild(child) {
  const readings = readingsForChild(child.id)
  const stats = statsFromReadings(readings)
  const level = levelFromXp(stats.totalXp)
  return {
    ...child,
    finished: undefined,
    stats,
    level,
    unlockedAvatars: AVATARS.filter((a) => a.level <= level.level).map((a) => a.emoji),
  }
}

// ── Barn ──────────────────────────────────────────────────────────────────
app.get('/api/children', (c) => {
  const rows = db.prepare('SELECT * FROM children ORDER BY created_at ASC').all()
  return c.json(rows.map(decorateChild))
})

app.post('/api/children', async (c) => {
  const body = await c.req.json()
  const name = (body.name || '').toString().trim()
  const age = parseInt(body.age, 10)
  if (!name) return c.json({ error: 'Navn er påkrevd' }, 400)
  if (!Number.isFinite(age) || age < 1 || age > 120) return c.json({ error: 'Ugyldig alder' }, 400)
  const avatar = AVATARS[0].emoji
  const info = db
    .prepare('INSERT INTO children (name, age, avatar, created_at) VALUES (?, ?, ?, ?)')
    .run(name, age, avatar, nowIso())
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(info.lastInsertRowid)
  return c.json(decorateChild(child), 201)
})

app.patch('/api/children/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(id)
  if (!child) return c.json({ error: 'Fant ikke barnet' }, 404)

  // Bytte avatar – sjekk at den er låst opp.
  if (body.avatar != null) {
    const readings = readingsForChild(id)
    const level = levelFromXp(statsFromReadings(readings).totalXp).level
    const avatarDef = AVATARS.find((a) => a.emoji === body.avatar)
    if (!avatarDef) return c.json({ error: 'Ukjent avatar' }, 400)
    if (avatarDef.level > level) return c.json({ error: 'Avataren er ikke låst opp ennå' }, 403)
    db.prepare('UPDATE children SET avatar = ? WHERE id = ?').run(body.avatar, id)
  }
  if (body.name != null && body.name.trim()) {
    db.prepare('UPDATE children SET name = ? WHERE id = ?').run(body.name.trim(), id)
  }
  if (body.age != null && Number.isFinite(parseInt(body.age, 10))) {
    db.prepare('UPDATE children SET age = ? WHERE id = ?').run(parseInt(body.age, 10), id)
  }
  const updated = db.prepare('SELECT * FROM children WHERE id = ?').get(id)
  return c.json(decorateChild(updated))
})

app.delete('/api/children/:id', (c) => {
  const id = c.req.param('id')
  db.prepare('DELETE FROM children WHERE id = ?').run(id)
  return c.json({ ok: true })
})

// ── Lesinger ──────────────────────────────────────────────────────────────
app.get('/api/children/:id/readings', (c) => {
  return c.json(readingsForChild(c.req.param('id')))
})

app.post('/api/children/:id/readings', async (c) => {
  const childId = c.req.param('id')
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(childId)
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
  const info = db
    .prepare(
      `INSERT INTO readings (child_id, title, author, type, unit, amount, pages, finished, xp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(childId, title, author, type, unit, amount, pages, finished, xp, nowIso())

  const reading = db.prepare('SELECT * FROM readings WHERE id = ?').get(info.lastInsertRowid)
  const updatedChild = decorateChild(child)
  return c.json({ reading: { ...reading, finished: !!reading.finished }, child: updatedChild, gainedXp: xp }, 201)
})

app.delete('/api/readings/:id', (c) => {
  db.prepare('DELETE FROM readings WHERE id = ?').run(c.req.param('id'))
  return c.json({ ok: true })
})

const port = 3001
serve({ fetch: app.fetch, port })
console.log(`📚 Sommerles-server kjører på http://localhost:${port}`)
