// Felles spill-logikk for Sommerles. Importeres av både Hono-serveren og React-klienten.
// Ingen avhengigheter – ren JavaScript så den kan kjøre begge steder.

// ── Avatarer ──────────────────────────────────────────────────────────────
// Én ny avatar per level. Avatar for et gitt level låses opp når barnet når det levelet.
export const AVATARS = [
  { level: 1, emoji: '🐣', name: 'Bokkylling' },
  { level: 2, emoji: '🦊', name: 'Sluraven' },
  { level: 3, emoji: '🐸', name: 'Lesefrosk' },
  { level: 4, emoji: '🐼', name: 'Pandaleser' },
  { level: 5, emoji: '🦉', name: 'Natteugla' },
  { level: 6, emoji: '🐙', name: 'Blekkruse' },
  { level: 7, emoji: '🦁', name: 'Løveleser' },
  { level: 8, emoji: '🦄', name: 'Eventyrhest' },
  { level: 9, emoji: '🐉', name: 'Boktdragen' },
  { level: 10, emoji: '🚀', name: 'Romleser' },
]

// ── Nivåer ────────────────────────────────────────────────────────────────
// Kumulativ XP som kreves for å NÅ hvert level (level 1 = 0 XP).
export const LEVEL_THRESHOLDS = [0, 120, 300, 560, 900, 1320, 1840, 2460, 3200, 4060]

// ── XP-regler ───────────────────────────────────────────────────────────────
export const XP_PER_MINUTE = 1
export const XP_PER_PAGE = 2
export const XP_FINISH_BONUS = 25

// Estimat brukt når vi henter ekte bøker fra bok-API-et.
export const WORDS_PER_PAGE = 275 // grovt snitt for å anslå ordmengde fra sidetall
export const READING_WPM = 150 // ord per minutt for et barn – anslår lesetid

export function estimateWords(pages) {
  if (!pages) return null
  return Math.round((pages * WORDS_PER_PAGE) / 10) * 10
}

export function estimateMinutes(pages) {
  const words = estimateWords(pages)
  if (!words) return null
  return Math.max(1, Math.round(words / READING_WPM))
}

export const READING_TYPES = [
  { id: 'lese', label: 'Leste selv', emoji: '📖' },
  { id: 'lydbok', label: 'Hørte lydbok', emoji: '🎧' },
  { id: 'lest_for', label: 'Ble lest for', emoji: '👨‍👧' },
]

export const UNITS = [
  { id: 'minutter', label: 'Minutter', emoji: '⏱️' },
  { id: 'sider', label: 'Sider', emoji: '📄' },
]

export function xpForReading({ unit, amount, finished }) {
  const a = Math.max(0, Number(amount) || 0)
  let xp = unit === 'sider' ? a * XP_PER_PAGE : a * XP_PER_MINUTE
  if (finished) xp += XP_FINISH_BONUS
  return Math.round(xp)
}

// Returnerer { level, into, span, pct, current, next } for en gitt total-XP.
export function levelFromXp(totalXp) {
  const xp = Math.max(0, totalXp || 0)
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  const maxLevel = LEVEL_THRESHOLDS.length
  const base = LEVEL_THRESHOLDS[level - 1]
  const nextThreshold = level < maxLevel ? LEVEL_THRESHOLDS[level] : null
  const span = nextThreshold == null ? 0 : nextThreshold - base
  const into = xp - base
  const pct = nextThreshold == null ? 100 : Math.min(100, Math.round((into / span) * 100))
  return {
    level,
    isMax: level >= maxLevel,
    into,
    span,
    pct,
    xpToNext: nextThreshold == null ? 0 : nextThreshold - xp,
  }
}

export function avatarsForLevel(level) {
  return AVATARS.map((a) => ({ ...a, unlocked: a.level <= level }))
}

export function avatarByEmoji(emoji) {
  return AVATARS.find((a) => a.emoji === emoji) || AVATARS[0]
}

// ── Troféer ─────────────────────────────────────────────────────────────────
// Hvert trofé har et mål (goal) og en funksjon som henter fremgang fra statistikk.
export const TROPHIES = [
  { id: 'velkommen', name: 'Velkommen', desc: 'Opprettet leseprofil', emoji: '🎉', goal: 1, value: (s) => 1 },
  { id: 'lesehest_bronse', name: 'Lesehest bronse', desc: 'Les totalt 60 minutter', emoji: '🥉', goal: 60, value: (s) => s.totalMinutes },
  { id: 'lesehest_solv', name: 'Lesehest sølv', desc: 'Les totalt 180 minutter', emoji: '🥈', goal: 180, value: (s) => s.totalMinutes },
  { id: 'lesehest_gull', name: 'Lesehest gull', desc: 'Les totalt 500 minutter', emoji: '🥇', goal: 500, value: (s) => s.totalMinutes },
  { id: 'bokorm_bronse', name: 'Bokorm bronse', desc: 'Fullfør 1 bok', emoji: '🐛', goal: 1, value: (s) => s.booksFinished },
  { id: 'bokorm_solv', name: 'Bokorm sølv', desc: 'Fullfør 5 bøker', emoji: '📚', goal: 5, value: (s) => s.booksFinished },
  { id: 'bokorm_gull', name: 'Bokorm gull', desc: 'Fullfør 10 bøker', emoji: '🏆', goal: 10, value: (s) => s.booksFinished },
  { id: 'storleser', name: 'Storleser', desc: 'Les en bok på over 140 sider', emoji: '📕', goal: 1, value: (s) => s.bigBooks },
  { id: 'lydbokvenn', name: 'Lydbokvenn', desc: 'Hør lydbok 3 ganger', emoji: '🎧', goal: 3, value: (s) => s.audiobookSessions },
  { id: 'familielesing', name: 'Familielesing', desc: 'Bli lest for 3 ganger', emoji: '👨‍👧', goal: 3, value: (s) => s.readToSessions },
  { id: 'utholdende', name: 'Utholdende', desc: 'Registrer lesing 10 ganger', emoji: '🔥', goal: 10, value: (s) => s.sessions },
  { id: 'sidesluker', name: 'Sidesluker', desc: 'Les totalt 500 sider', emoji: '📄', goal: 500, value: (s) => s.totalPages },
]

// Bygg statistikk fra en liste lesinger.
export function statsFromReadings(readings) {
  const s = {
    totalXp: 0,
    totalMinutes: 0,
    totalPages: 0,
    booksFinished: 0,
    bigBooks: 0,
    audiobookSessions: 0,
    readToSessions: 0,
    sessions: readings.length,
  }
  for (const r of readings) {
    s.totalXp += r.xp || 0
    if (r.unit === 'minutter') s.totalMinutes += r.amount
    if (r.unit === 'sider') s.totalPages += r.amount
    if (r.finished) s.booksFinished += 1
    if (r.finished && (r.pages || 0) > 140) s.bigBooks += 1
    if (r.type === 'lydbok') s.audiobookSessions += 1
    if (r.type === 'lest_for') s.readToSessions += 1
  }
  return s
}

export function evaluateTrophies(stats) {
  return TROPHIES.map((t) => {
    const value = Math.min(t.goal, t.value(stats))
    return {
      id: t.id,
      name: t.name,
      desc: t.desc,
      emoji: t.emoji,
      goal: t.goal,
      value,
      earned: value >= t.goal,
    }
  })
}
