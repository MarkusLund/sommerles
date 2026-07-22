-- Sommerles – D1 (SQLite) skjema.
-- Brukes både lokalt (wrangler ... --local) og i produksjon (--remote).

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🐣',
  avatar_bg TEXT NOT NULL DEFAULT 'sol',
  created_at TEXT NOT NULL,
  -- Maskot (hunden Sommer): tilbehør skaffes via gachapon-kapsler, betalt med
  -- mynter avledet fra XP (se src/shared/game.js). dog_owned/dog_equipped er
  -- JSON-lister/objekter; dog_coins_spent er totalt myntforbruk, brukt til å
  -- regne ut mynt-saldo.
  dog_owned TEXT NOT NULL DEFAULT '[]',
  dog_equipped TEXT NOT NULL DEFAULT '{}',
  dog_coins_spent INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  type TEXT NOT NULL,
  unit TEXT NOT NULL,
  amount INTEGER NOT NULL,
  pages INTEGER,
  finished INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_readings_child ON readings(child_id);
