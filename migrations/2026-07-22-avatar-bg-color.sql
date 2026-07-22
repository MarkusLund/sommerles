-- Engangs-migrering (IKKE idempotent – kjør nøyaktig én gang per database).
-- Legger til valgfri bakgrunnsfarge på avatar-sirkelen. Rent additivt.
-- Kjøres lokalt først:  wrangler d1 execute sommerles --local  --file=./migrations/2026-07-22-avatar-bg-color.sql
-- Deretter i prod:      wrangler d1 execute sommerles --remote --file=./migrations/2026-07-22-avatar-bg-color.sql
ALTER TABLE children ADD COLUMN avatar_bg TEXT NOT NULL DEFAULT 'sol';
