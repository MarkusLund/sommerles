import { useState } from 'react'
import { api } from '../api.js'

export default function Auth({ onAuthed }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await api.login(username.trim(), password)
      onAuthed(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="logo">📚☀️</div>
        <h1>Sommerles</h1>
        <p className="auth-sub">Logg inn for å fortsette</p>
        <form onSubmit={submit}>
          <label>
            Brukernavn
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </label>
          <label>
            Passord
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={busy || !username.trim() || !password}
          >
            {busy ? 'Logger inn …' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
