# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Sommerles is a children's reading app (a simpler clone of sommerles.no): kids register
reading sessions to earn XP, level up, unlock avatars, and collect trophies. UI text and
domain vocabulary are **Norwegian** — keep new strings, labels, and comments in Norwegian
to match.

## ⚠️ Live data — do not lose user progress

This app is **in production with real users**. Children, readings, XP, and unlocked content
are real data that must never be lost. Before any change that touches the database:

- **Never** run destructive D1 commands against `--remote` (no `DROP`, `DELETE FROM`,
  `TRUNCATE`, or re-seeding the production database). `npm run db:remote` runs `schema.sql`,
  which is **idempotent** (`CREATE TABLE IF NOT EXISTS`) — keep it that way; never add
  destructive statements to `schema.sql`.
- **Schema changes must be additive and migration-based.** Add new columns/tables with
  `ALTER TABLE ... ADD COLUMN` / `CREATE TABLE IF NOT EXISTS`; never rename or drop columns
  that hold user data without an explicit, reviewed migration. Test migrations on `--local`
  first.
- Take a backup before risky remote operations (`wrangler d1 export sommerles --remote`).
- Treat `children` and `readings` rows as durable; the `DELETE` endpoints are user-initiated
  only — never trigger bulk deletes programmatically.

## Commands

```bash
npm install
npm run db:local    # apply schema.sql to a LOCAL D1 database (run once before first dev)
npm run dev         # runs Worker (wrangler, :8787) + Vite client (:5173) concurrently
```

Open http://localhost:5173 — Vite proxies `/api/*` to the Worker on :8787.

```bash
npm run build       # vite build → ./dist
npm run deploy      # vite build + wrangler deploy (Worker + static assets + D1, one deploy)
npm run db:remote   # apply schema.sql to the PRODUCTION D1 database
npm run db:create   # first-time only: create the D1 db, paste database_id into wrangler.toml
```

There is no test suite, linter, or typechecker configured.

## Architecture

Single Cloudflare Worker serves both the API and the static SPA on one deploy (free tier,
never sleeps). Key wiring in `wrangler.toml`: `run_worker_first = ["/api/*"]` routes API
requests to the Hono app; everything else falls back to `dist/index.html` (SPA via the
`[assets]` block). `main = "worker/index.js"`.

- **`worker/index.js`** — Hono app, the entire REST API. D1 is `c.env.DB`. Children stored
  raw; XP/level/unlocked-avatars are **derived at read time** by `decorateChild()`, never
  persisted (except the chosen `avatar` column). Reading XP is computed server-side via
  `xpForReading()` on insert and stored in the `readings.xp` column.
- **`worker/auth.js`** — single shared family login (one username/password). Session is a
  signed httpOnly JWT cookie (`hono/jwt`, HS256, 30-day). A middleware on `/api/*` (except
  `/api/auth/*`) rejects unauthenticated requests with 401.
- **`worker/books.js`** — `searchBooks()` for `GET /api/books/search?q=`. Queries
  Nasjonalbiblioteket first (best Norwegian coverage), fuzzy-fallback (Lucene `~2`), then
  Open Library; merges duplicates → `{ title, author, pages, words, cover, year, isbn, language, source }`.
- **`src/shared/game.js`** — single source of truth for all game rules, imported by **both**
  the Worker and the React client. Pure JS, zero dependencies. Defines `AVATARS`,
  `LEVEL_THRESHOLDS`, XP constants, `xpForReading`, `levelFromXp`, `statsFromReadings`,
  `TROPHIES`, `evaluateTrophies`. **Adjust XP curves, avatars, levels, and trophies here** —
  changes propagate to client and server at once.
- **`src/`** — Vite + React SPA. `App.jsx` holds top-level state; `api.js` is the fetch
  client (all requests credentialed via cookie). Stored user in `localStorage` is an
  optimistic hint only — `api.me()` re-validates the cookie session on load.

## Data model (`schema.sql`)

Two tables: `children` and `readings` (FK `child_id`, `ON DELETE CASCADE`). A "reading" has
`unit` (`minutter` | `sider`), `type` (`lese` | `lydbok` | `lest_for`), `amount`, optional
`pages`, and a `finished` flag. XP rule: 1 XP/minute, 2 XP/page, +25 finish bonus.

## Secrets / env

Worker needs `SESSION_SECRET`, `AUTH_USERNAME`, `AUTH_PASSWORD`. Locally these live in
`.dev.vars` (gitignored); in production set them as Worker secrets (`wrangler secret put`).

## Notes

- The `server/` directory holds a legacy local SQLite DB and is gitignored — the live backend
  is the Worker + D1. Don't reintroduce it.
- Custom-domain routing in `wrangler.toml` is intentionally commented out; the workers.dev URL
  is kept active (`workers_dev = true`) and the real domain redirects to it via Webhuset.
