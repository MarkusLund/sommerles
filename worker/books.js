// Boksøk: Nasjonalbiblioteket (primær, best norsk dekning) med fuzzy-fallback,
// og Open Library som siste fallback for utenlandske titler.
import { estimateWords } from '../src/shared/game.js'

const NB_URL = 'https://api.nb.no/catalog/v1/items'
const TIMEOUT = 8000

// "Nærum, Knut" → "Knut Nærum"
function flipName(name) {
  if (typeof name !== 'string') return null
  if (name.includes(',')) {
    const [last, first] = name.split(',').map((s) => s.trim())
    return first ? `${first} ${last}` : last
  }
  return name.trim()
}

function nbCover(links = {}) {
  const t = links.thumbnail_large || links.thumbnail_medium || links.thumbnail_small
  if (t?.href) return t.href
  if (links.thumbnail_custom?.href) return links.thumbnail_custom.href.replace('{width},{height}', '0,300')
  return null
}

function parseYear(issued) {
  if (!issued) return null
  const m = String(issued).match(/\d{4}/)
  return m ? Number(m[0]) : null
}

function normalizeNb(item) {
  const md = item.metadata || {}
  const ids = md.identifiers || {}
  const pages = typeof md.pageCount === 'number' && md.pageCount > 0 ? md.pageCount : null
  const authors = (md.creators || []).map(flipName).filter(Boolean)
  return {
    id: 'nb:' + (ids.sesamId || ids.urn || md.title),
    title: md.title,
    author: authors.slice(0, 3).join(', ') || null,
    pages,
    words: estimateWords(pages),
    cover: nbCover(item._links),
    year: parseYear(md.originInfo?.issued),
    language: md.languages?.[0]?.code || null,
    isbn: ids.isbn13?.[0] || ids.isbn10?.[0] || null,
    source: 'nb',
  }
}

async function nbFetch(q, size = 12) {
  const url =
    NB_URL +
    '?' +
    new URLSearchParams({ q, size: String(size), filter: 'mediatype:Bøker' })
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Sommerles-demo/0.1' },
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (!res.ok) throw new Error('NB ' + res.status)
  const data = await res.json()
  return (data._embedded?.items || []).map(normalizeNb).filter((b) => b.title)
}

// ISBN: fjern bindestrek/mellomrom, godta 10 (siste kan være X) eller 13 siffer.
// Bokstrekkoder er EAN-13, som er identisk med ISBN-13 – så en skannet strekkode
// kommer rett inn her.
function normalizeIsbn(q) {
  const s = String(q).replace(/[\s-]/g, '').toUpperCase()
  if (/^\d{13}$/.test(s)) return s
  if (/^\d{9}[\dX]$/.test(s)) return s
  return null
}

// Presist ISBN-oppslag mot NB (q tar ISBN direkte).
async function nbIsbnFetch(isbn) {
  return nbFetch(isbn, 5)
}

// Presist ISBN-oppslag mot Open Library via search.json sitt isbn-felt.
async function olIsbnFetch(isbn) {
  const url =
    'https://openlibrary.org/search.json?' +
    new URLSearchParams({
      isbn,
      limit: '5',
      fields: 'key,title,author_name,number_of_pages_median,cover_i,first_publish_year,language',
    })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Sommerles-demo/0.1' },
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (!res.ok) throw new Error('OL ' + res.status)
  const data = await res.json()
  return (data.docs || [])
    .filter((b) => b.title)
    .map((b) => {
      const pages = b.number_of_pages_median || null
      return {
        id: 'ol:' + b.key,
        title: b.title,
        author: (b.author_name || []).slice(0, 3).join(', ') || null,
        pages,
        words: estimateWords(pages),
        cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
        year: b.first_publish_year || null,
        language: b.language?.[0] || null,
        isbn,
        source: 'ol',
      }
    })
}

// Legg til Lucene fuzzy (~2) på ord lengre enn 3 tegn – fanger skrivefeil.
function toFuzzy(q) {
  return q
    .split(/\s+/)
    .map((t) => (t.length > 3 ? `${t}~2` : t))
    .join(' ')
}

async function olFetch(q) {
  const url =
    'https://openlibrary.org/search.json?' +
    new URLSearchParams({
      q,
      limit: '10',
      fields: 'key,title,author_name,number_of_pages_median,cover_i,first_publish_year,language',
    })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Sommerles-demo/0.1' },
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (!res.ok) throw new Error('OL ' + res.status)
  const data = await res.json()
  return (data.docs || [])
    .filter((b) => b.title)
    .map((b) => {
      const pages = b.number_of_pages_median || null
      return {
        id: 'ol:' + b.key,
        title: b.title,
        author: (b.author_name || []).slice(0, 3).join(', ') || null,
        pages,
        words: estimateWords(pages),
        cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
        year: b.first_publish_year || null,
        language: b.language?.[0] || null,
        isbn: null,
        source: 'ol',
      }
    })
}

// Slå sammen duplikater (samme tittel+forfatter), behold varianten med best
// metadata (omslag + sidetall), men i opprinnelig rekkefølge (presise treff først).
function dedupe(books) {
  const order = []
  const best = new Map()
  for (const b of books) {
    const key = `${(b.title || '').toLowerCase().trim()}|${(b.author || '').toLowerCase().trim()}`
    const score = (b.cover ? 2 : 0) + (b.pages ? 1 : 0)
    if (!best.has(key)) {
      order.push(key)
      best.set(key, { book: b, score })
    } else if (score > best.get(key).score) {
      best.set(key, { book: b, score })
    }
  }
  return order.map((k) => best.get(k).book)
}

export async function searchBooks(q) {
  // Ser det ut som et ISBN (f.eks. skannet strekkode)? Gjør presist oppslag.
  const isbn = normalizeIsbn(q)
  if (isbn) {
    let hits = []
    try {
      hits = await nbIsbnFetch(isbn)
    } catch {
      /* NB nede – prøv Open Library */
    }
    if (hits.length === 0) {
      try {
        hits = await olIsbnFetch(isbn)
      } catch {
        /* begge feilet */
      }
    }
    if (hits.length) return dedupe(hits).slice(0, 10)
    // Fant ingenting på ISBN – fall tilbake til vanlig tekstsøk under.
  }

  let results = []
  try {
    results = await nbFetch(q)
    // Få presise treff? Prøv fuzzy for å fange skrivefeil.
    if (results.length < 3) {
      const fuzzy = toFuzzy(q)
      if (fuzzy !== q) {
        try {
          const more = await nbFetch(fuzzy)
          results = dedupe([...results, ...more])
        } catch {
          /* behold presise treff */
        }
      }
    }
  } catch {
    /* NB nede – prøv Open Library */
  }

  if (results.length === 0) {
    try {
      results = await olFetch(q)
    } catch {
      /* begge feilet */
    }
  }

  return dedupe(results).slice(0, 10)
}
