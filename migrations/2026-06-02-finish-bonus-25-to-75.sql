-- Engangs-migrering (IKKE idempotent – kjør nøyaktig én gang per database).
-- Fullfør-bonusen ble hevet fra 25 til 75 XP i src/shared/game.js.
-- Eksisterende lesinger har lagret XP med gammel bonus; løft fullførte med differansen (+50).
-- Kjøres lokalt først:  wrangler d1 execute sommerles --local  --file=./migrations/2026-06-02-finish-bonus-25-to-75.sql
-- Deretter i prod:      wrangler d1 execute sommerles --remote --file=./migrations/2026-06-02-finish-bonus-25-to-75.sql
UPDATE readings SET xp = xp + 50 WHERE finished = 1;
