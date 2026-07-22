-- Engangs-migrering (IKKE idempotent – kjør nøyaktig én gang per database).
-- Legger til maskot-hunden Sommer: gachapon-tilbehør betalt med mynter avledet
-- fra XP. Rent additivt – rører ikke eksisterende kolonner eller data.
-- Kjøres lokalt først:  wrangler d1 execute sommerles --local  --file=./migrations/2026-07-22-mascot-gachapon.sql
-- Deretter i prod:      wrangler d1 execute sommerles --remote --file=./migrations/2026-07-22-mascot-gachapon.sql
ALTER TABLE children ADD COLUMN dog_owned TEXT NOT NULL DEFAULT '[]';
ALTER TABLE children ADD COLUMN dog_equipped TEXT NOT NULL DEFAULT '{}';
ALTER TABLE children ADD COLUMN dog_coins_spent INTEGER NOT NULL DEFAULT 0;
