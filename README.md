# Sommerles ☀️📚

A reading app that tracks the reading progress of kids. Children register what they
read to earn XP, level up, unlock new avatars, and collect trophies — turning daily
reading into a game.

It is greatly inspired by [sommerles.no](https://www.sommerles.no), the Norwegian
public-library summer reading campaign. The key difference: **sommerles.no is aimed at
school children**, while this app is also designed for **kindergarten-age kids** — so
reading can be logged in minutes or pages, read by the child, listened to as an
audiobook, or read aloud to them by a parent. (The UI is in Norwegian.)

## Features

- 👧 **Multiple child profiles** — create and switch between profiles (name + age)
- 🔎 **Search real books** (National Library of Norway, with fuzzy fallback) — autofills
  title, author, page count, cover, and estimated word count / reading time
- 📖 **Log reading** in either **minutes** or **pages** (or fully manually)
- 🎧 Read it yourself / listened to an audiobook / was read to — all earn XP
- ⭐ **XP & levels** — 1 XP per minute, 2 XP per page, +25 XP for finishing a book
- 🎭 **Avatars** — a new avatar unlocks at every level
- 🏅 **Trophies** — 12 trophies to collect
- 🎉 Confetti celebration on level-up

## Tech stack

- **Frontend:** Vite + React
- **Backend:** [Hono](https://hono.dev/) running as a Cloudflare Worker (REST API)
- **Database:** SQLite via [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Hosting:** Cloudflare Workers — Worker, static assets, and D1 in a single deploy
  (free tier, never sleeps)
- **Book search:** [National Library of Norway catalog API](https://api.nb.no/) (free, no
  key, best Norwegian coverage) with [Open Library](https://openlibrary.org/developers/api)
  as a fallback, proxied through the Worker
- Shared game logic in `src/shared/game.js` (used by both client and server)

### Book search and estimates

The Worker exposes `GET /api/books/search?q=…` (see `worker/books.js`) which:

1. Queries the **National Library of Norway** first (best coverage of Norwegian books,
   real page counts + covers)
2. Falls back to **fuzzy search** (Lucene `~2`) when there are few hits — tolerates typos
3. Falls back to **Open Library** if the NB API doesn't respond or returns nothing
4. Merges duplicates and normalizes to
   `{ title, author, pages, words, cover, year, isbn, language, source }`

Word count and reading time are estimated from the page count (`WORDS_PER_PAGE`,
`READING_WPM` in `src/shared/game.js`). You can also log reading entirely manually
without searching.

## Getting started (local)

```bash
npm install
npm run db:local   # apply the schema to a local D1 database (run once)
npm run dev
```

`npm run dev` starts the Worker (wrangler, port 8787) and the Vite frontend (port 5173)
together. Open **http://localhost:5173** — Vite proxies `/api` to the Worker.

The Worker reads three secrets for the simple family login — `SESSION_SECRET`,
`AUTH_USERNAME`, and `AUTH_PASSWORD`. Locally these live in a `.dev.vars` file (gitignored):

```
SESSION_SECRET=<a long random string>
AUTH_USERNAME=<choose one>
AUTH_PASSWORD=<choose one>
```

## Deploy (Cloudflare)

```bash
npm run db:create   # first time: creates the D1 database; paste database_id into wrangler.toml
npm run db:remote   # applies the schema to the production database
npm run deploy      # builds the frontend and deploys Worker + static assets
```

Requires `npx wrangler login` first, and the three secrets set as Worker secrets
(`wrangler secret put SESSION_SECRET`, etc.). Goes live at
`https://sommerles.<account>.workers.dev` (or your own domain via the Cloudflare dashboard).

## Structure

```
worker/          Cloudflare Worker (Hono)
  index.js       REST API (children + readings), D1 via c.env.DB
  auth.js        Simple family login (signed httpOnly JWT cookie)
  books.js       Book search (National Library of Norway + Open Library)
schema.sql       D1 schema (children, readings)
wrangler.toml    Worker, D1, and asset config
src/
  shared/game.js Avatars, levels, XP rules, and trophies (shared client + server)
  components/     React components
  App.jsx         Main app
  api.js          API client
```

The XP table and avatars can be adjusted in `src/shared/game.js`.

## License

MIT
