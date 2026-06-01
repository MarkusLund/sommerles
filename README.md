# Sommerles ☀️📚

En enklere klone av [sommerles.no](https://www.sommerles.no) – en leseapp for barn der man
samler XP, går opp i level og låser opp nye avatarer ved å registrere lesing.

## Funksjoner

- 👧 **Flere barneprofiler** – opprett og bytt mellom profiler (navn + alder)
- 🔎 **Søk i ekte bøker** (Open Library) – autofyller tittel, forfatter, sidetall, omslag og estimert ordtelling/lesetid
- 📖 **Registrer lesing** i enten **minutter** eller **sider** (også helt manuelt)
- 🎧 Leste selv / hørte lydbok / ble lest for – alt gir XP
- ⭐ **XP & level** – 1 XP per minutt, 2 XP per side, +25 XP når du fullfører en bok
- 🎭 **Avatarer** – én ny avatar låses opp for hvert level du klatrer
- 🏅 **Troféer** – 12 troféer å samle (Lesehest, Bokorm, Storleser, Lydbokvenn …)
- 🎉 Konfetti-feiring ved level-opp

## Teknologi

- **Frontend:** Vite + React
- **Backend:** Hono (Node) med REST-API
- **Database:** SQLite (better-sqlite3)
- **Boksøk:** [Open Library Search API](https://openlibrary.org/developers/api) (gratis, ingen nøkkel), proxyet gjennom serveren
- Delt spill-logikk i `src/shared/game.js` (brukes av både klient og server)

### Boksøk og estimater

Serveren har et endepunkt `GET /api/books/search?q=…` som spør Open Library og
normaliserer svaret til `{ title, author, pages, words, cover, year }`.
Ordtelling og lesetid anslås fra sidetallet (`WORDS_PER_PAGE`, `READING_WPM` i
`src/shared/game.js`). Du kan også registrere helt manuelt uten å søke.

## Kom i gang

```bash
npm install
npm run dev
```

Dette starter både API-serveren (port 3001) og Vite-frontenden (port 5173).
Åpne **http://localhost:5173**.

## Struktur

```
server/          Hono-backend
  db.js          SQLite-oppsett og skjema
  index.js       REST-API (barn + lesinger)
src/
  shared/game.js Avatarer, nivåer, XP-regler og troféer
  components/     React-komponenter
  App.jsx         Hovedapp
  api.js          API-klient
```

XP-tabellen og avatarene kan justeres i `src/shared/game.js`.
