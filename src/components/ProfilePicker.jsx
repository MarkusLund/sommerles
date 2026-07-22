import { useState } from 'react'
import { avatarByEmoji, levelFromXp, avatarBgById } from '../shared/game.js'

export default function ProfilePicker({ children, onOpen, onCreate, onDelete, onLogout }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onCreate(name.trim(), age)
      setName('')
      setAge('')
      setAdding(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="picker">
      {onLogout && (
        <button className="logout-btn" onClick={onLogout} title="Logg ut">
          Logg ut
        </button>
      )}
      <div className="picker-hero">
        <div className="logo">📚☀️</div>
        <h1>Sommerles</h1>
        <p>Les så mye du kan i sommer – samle XP, gå opp i level og lås opp nye avatarer!</p>
      </div>

      <h2 className="picker-title">Hvem skal lese i dag?</h2>

      <div className="profile-grid">
        {children.map((c) => {
          const av = avatarByEmoji(c.avatar)
          const bg = avatarBgById(c.avatar_bg)
          return (
            <div key={c.id} className="profile-card" onClick={() => onOpen(c.id)}>
              <button
                className="card-delete"
                title="Slett profil"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Slette profilen til ${c.name}?`)) onDelete(c.id)
                }}
              >
                ✕
              </button>
              <div
                className="profile-avatar"
                style={{ background: `linear-gradient(160deg, ${bg.from}, ${bg.to})` }}
              >
                {c.avatar}
              </div>
              <div className="profile-name">{c.name}</div>
              <div className="profile-meta">{c.age} år · Level {c.level.level}</div>
              <div className="profile-xp">{c.stats.totalXp} XP</div>
            </div>
          )
        })}

        <button className="profile-card add" onClick={() => setAdding(true)}>
          <div className="profile-avatar">➕</div>
          <div className="profile-name">Ny profil</div>
        </button>
      </div>

      {adding && (
        <div className="modal-backdrop" onClick={() => !busy && setAdding(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>Lag en ny leseprofil</h3>
            <label>
              Navn
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="F.eks. Mathias"
                autoFocus
                maxLength={30}
              />
            </label>
            <label>
              Alder
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="F.eks. 8"
                min={1}
                max={120}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setAdding(false)} disabled={busy}>
                Avbryt
              </button>
              <button type="submit" className="btn-primary" disabled={busy || !name.trim() || !age}>
                {busy ? 'Lager …' : 'Lag profil'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
