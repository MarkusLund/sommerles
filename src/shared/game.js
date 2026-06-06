// Felles spill-logikk for Sommerles. Importeres av både Hono-serveren og React-klienten.
// Ingen avhengigheter – ren JavaScript så den kan kjøre begge steder.

// ── Avatarer ──────────────────────────────────────────────────────────────
// Én ny avatar per level. Avatar for et gitt level låses opp når barnet når det levelet.
// Level 10/20/30 er milepæl-avatarer (rakett, drage-borg, krone) – se MILESTONES.
export const AVATARS = [
  { level: 1, emoji: '🐣', name: 'Bokkylling' },
  { level: 2, emoji: '🦊', name: 'Slureven' },
  { level: 3, emoji: '🐸', name: 'Lesefrosk' },
  { level: 4, emoji: '🐼', name: 'Pandaleser' },
  { level: 5, emoji: '🦉', name: 'Natteugla' },
  { level: 6, emoji: '🐙', name: 'Blekkspruten' },
  { level: 7, emoji: '🦁', name: 'Løveleser' },
  { level: 8, emoji: '🦄', name: 'Eventyrhest' },
  { level: 9, emoji: '🐉', name: 'Bokdragen' },
  { level: 10, emoji: '🚀', name: 'Romleser' },
  { level: 11, emoji: '🐬', name: 'Delfinen' },
  { level: 12, emoji: '🦅', name: 'Fjellørna' },
  { level: 13, emoji: '🐺', name: 'Skogsulven' },
  { level: 14, emoji: '🐅', name: 'Tigerleser' },
  { level: 15, emoji: '🐳', name: 'Hvalen' },
  { level: 16, emoji: '🦕', name: 'Langhalsen' },
  { level: 17, emoji: '🦖', name: 'Kjempeøgla' },
  { level: 18, emoji: '🦣', name: 'Mammuten' },
  { level: 19, emoji: '🦚', name: 'Påfuglen' },
  { level: 20, emoji: '🏰', name: 'Borgvokteren' },
  { level: 21, emoji: '🧙', name: 'Trollmannen' },
  { level: 22, emoji: '🧚', name: 'Eventyrfeen' },
  { level: 23, emoji: '🦸', name: 'Superleseren' },
  { level: 24, emoji: '🥷', name: 'Bokninjaen' },
  { level: 25, emoji: '🤖', name: 'Leseroboten' },
  { level: 26, emoji: '👽', name: 'Romvennen' },
  { level: 27, emoji: '🛸', name: 'UFO-piloten' },
  { level: 28, emoji: '🌟', name: 'Stjerneskuddet' },
  { level: 29, emoji: '☄️', name: 'Kometen' },
  { level: 30, emoji: '👑', name: 'Lesekongen' },
]

// ── Nivåer ────────────────────────────────────────────────────────────────
// Lineær progresjon: hvert level koster like mye XP. Like mye å gå 1→2 som 10→11.
// Terskel for level n = (n-1) * XP_PER_LEVEL. Toppen er MAX_LEVEL (30).
export const MAX_LEVEL = 30
export const XP_PER_LEVEL = 180

// ── XP-regler ───────────────────────────────────────────────────────────────
export const XP_PER_MINUTE = 2
export const XP_PER_PAGE = 4
export const XP_FINISH_BONUS = 150

// Type-faktor på lese-XP (ikke på fullfør-bonusen). Å lese selv gir full uttelling;
// lydbok og å bli lest for gir 75 %. Selv den laveste typen (1,5 XP/min, 3 XP/side)
// ligger over de gamle ratene (1/2), så alle typer gir nå mer XP enn før.
export const TYPE_XP_FACTOR = {
  lese: 1,
  lydbok: 0.75,
  lest_for: 0.75,
}

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

export function xpForReading({ unit, amount, finished, type }) {
  const a = Math.max(0, Number(amount) || 0)
  const factor = TYPE_XP_FACTOR[type] ?? 1
  let xp = (unit === 'sider' ? a * XP_PER_PAGE : a * XP_PER_MINUTE) * factor
  if (finished) xp += XP_FINISH_BONUS // fullfør-bonus er flat, uavhengig av type
  return Math.round(xp)
}

// Returnerer { level, isMax, into, span, pct, xpToNext } for en gitt total-XP.
// Lineær: level = floor(xp / XP_PER_LEVEL) + 1, med tak på MAX_LEVEL.
export function levelFromXp(totalXp) {
  const xp = Math.max(0, totalXp || 0)
  const rawLevel = Math.floor(xp / XP_PER_LEVEL) + 1
  const level = Math.min(MAX_LEVEL, rawLevel)
  const isMax = level >= MAX_LEVEL
  const base = (level - 1) * XP_PER_LEVEL
  const span = XP_PER_LEVEL
  const into = isMax ? span : xp - base
  const pct = isMax ? 100 : Math.min(100, Math.round((into / span) * 100))
  return {
    level,
    isMax,
    into,
    span,
    pct,
    xpToNext: isMax ? 0 : base + span - xp,
  }
}

// ── Milepæler ─────────────────────────────────────────────────────────────
// Level 10, 20 og 30 er store milepæler. Når barnet når en milepæl, låses et
// diplom opp som gir rett til en FYSISK premie. Diplomet (med barnets navn og
// lesestatistikk) vises fram til en voksen for å hente premien.
export const MILESTONES = [
  {
    level: 10,
    tier: 'bronse',
    medal: '🥉',
    title: 'Bronsediplom',
    blurb: 'Du har lest deg helt til level 10 – tøft jobba!',
  },
  {
    level: 20,
    tier: 'solv',
    medal: '🥈',
    title: 'Sølvdiplom',
    blurb: 'Halvveis til toppen – du er en skikkelig lesehest!',
  },
  {
    level: 30,
    tier: 'gull',
    medal: '🥇',
    title: 'Gulldiplom',
    blurb: 'Du nådde toppen og ble Lesekongen – helt rått!',
  },
]

// Vag premie-tekst – den ekte premien avtales med en voksen.
export const PRIZE_TEXT = 'Vis dette diplomet til mamma eller pappa for å få en premie! 🎁'

export function milestoneForLevel(level) {
  return MILESTONES.find((m) => m.level === level) || null
}

// Alle milepæler barnet har nådd (oppnådd) på et gitt level.
export function reachedMilestones(level) {
  return MILESTONES.filter((m) => m.level <= level)
}

// Neste milepæl barnet jakter på, eller null hvis alle er nådd.
export function nextMilestone(level) {
  return MILESTONES.find((m) => m.level > level) || null
}

// Milepæler som krysses når man går fra `fromLevel` opp til `toLevel`.
export function crossedMilestones(fromLevel, toLevel) {
  return MILESTONES.filter((m) => m.level > fromLevel && m.level <= toLevel)
}

// «Fryser» hvert diplom til tidspunktet milepælen ble nådd. Rekonstrueres
// deterministisk fra lesehistorikken: les lesingene kronologisk, summér XP, og
// ta et øyeblikksbilde av statistikken (bøker, tid, sider, XP, dato) idet den
// lesingen som krysser milepæl-terskelen blir registrert. Returnerer et objekt
// { [level]: snapshot } for de milepælene barnet faktisk har nådd.
export function milestoneSnapshots(readings) {
  const ordered = [...readings].sort((a, b) => {
    const t = (a.created_at || '').localeCompare(b.created_at || '')
    return t !== 0 ? t : (a.id || 0) - (b.id || 0)
  })
  const snaps = {}
  let totalXp = 0
  let totalMinutes = 0
  let totalPages = 0
  let booksFinished = 0
  let mi = 0 // peker på neste milepæl vi venter på
  for (const r of ordered) {
    totalXp += r.xp || 0
    if (r.unit === 'minutter') totalMinutes += r.amount
    if (r.unit === 'sider') totalPages += r.amount
    if (r.finished) booksFinished += 1
    while (mi < MILESTONES.length && totalXp >= (MILESTONES[mi].level - 1) * XP_PER_LEVEL) {
      const m = MILESTONES[mi]
      snaps[m.level] = {
        level: m.level,
        totalXp,
        totalMinutes,
        totalPages,
        booksFinished,
        achievedAt: r.created_at || null,
      }
      mi++
    }
  }
  return snaps
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
