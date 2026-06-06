-- Engangs-migrering (IKKE idempotent – kjør nøyaktig én gang per database).
-- XP-ratene ble doblet og en type-faktor ble innført i src/shared/game.js:
--   2 XP/min, 4 XP/side, +150 flat fullfør-bonus.
--   Type-faktor på lese-XP (ikke på bonusen): lese = 100 %, lydbok/lest_for = 75 %.
-- Vi regner xp på nytt fra grunnkolonnene (unit/amount/type/finished) så resultatet
-- blir nøyaktig likt xpForReading() for alle eksisterende lesinger.
-- Kjøres lokalt først:  wrangler d1 execute sommerles --local  --file=./migrations/2026-06-06-double-xp-and-type-factor.sql
-- Deretter i prod:      wrangler d1 execute sommerles --remote --file=./migrations/2026-06-06-double-xp-and-type-factor.sql
UPDATE readings
SET xp = CAST(ROUND(
      (CASE WHEN unit = 'sider' THEN amount * 4 ELSE amount * 2 END)
      * (CASE WHEN type = 'lese' THEN 1.0 ELSE 0.75 END)
    ) AS INTEGER)
    + (CASE WHEN finished = 1 THEN 150 ELSE 0 END);
