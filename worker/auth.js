// Enkel familie-innlogging: ett brukernavn/passord (lagret som Worker-hemmeligheter
// AUTH_USERNAME / AUTH_PASSWORD), økt via signert httpOnly-cookie (JWT).
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

const COOKIE = 'session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 dager
const ALG = 'HS256'

// Konstant-tids strengsammenligning (unngår timing-lekkasje).
export function safeEqual(a, b) {
  a = String(a)
  b = String(b)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSession(c, username) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE
  const token = await sign({ sub: username, exp }, c.env.SESSION_SECRET, ALG)
  const secure = new URL(c.req.url).protocol === 'https:'
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function clearSession(c) {
  deleteCookie(c, COOKIE, { path: '/' })
}

export async function readSession(c) {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  try {
    return await verify(token, c.env.SESSION_SECRET, ALG)
  } catch {
    return null
  }
}
