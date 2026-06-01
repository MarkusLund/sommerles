import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'sommerles.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🐣',
    created_at TEXT NOT NULL
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
`)

export default db
