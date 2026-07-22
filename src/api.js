async function req(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Feil (${res.status})`)
  }
  return res.json()
}

export const api = {
  me: () => req('/api/auth/me'),
  login: (username, password) =>
    req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  searchBooks: (q) => req(`/api/books/search?q=${encodeURIComponent(q)}`),
  listChildren: () => req('/api/children'),
  createChild: (name, age) =>
    req('/api/children', { method: 'POST', body: JSON.stringify({ name, age }) }),
  updateChild: (id, patch) =>
    req(`/api/children/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteChild: (id) => req(`/api/children/${id}`, { method: 'DELETE' }),
  listReadings: (id) => req(`/api/children/${id}/readings`),
  addReading: (id, reading) =>
    req(`/api/children/${id}/readings`, { method: 'POST', body: JSON.stringify(reading) }),
  deleteReading: (id) => req(`/api/readings/${id}`, { method: 'DELETE' }),
  pullGacha: (id) => req(`/api/children/${id}/gacha`, { method: 'POST' }),
  equipMascotItem: (id, slot, itemId) =>
    req(`/api/children/${id}`, { method: 'PATCH', body: JSON.stringify({ dogEquipped: { slot, itemId } }) }),
}
