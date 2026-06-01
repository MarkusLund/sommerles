import { READING_TYPES } from '../shared/game.js'

function typeInfo(id) {
  return READING_TYPES.find((t) => t.id === id) || READING_TYPES[0]
}

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })
}

export default function ReadingLog({ readings, onDelete }) {
  if (!readings.length) {
    return (
      <section className="card">
        <h2>📒 Leselogg</h2>
        <p className="empty">Ingen lesing registrert ennå. Gå til «Registrer lesing» og kom i gang! 🚀</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>📒 Leselogg</h2>
      <ul className="log">
        {readings.map((r) => {
          const t = typeInfo(r.type)
          return (
            <li key={r.id} className="log-item">
              <div className="log-emoji">{t.emoji}</div>
              <div className="log-body">
                <div className="log-title">
                  {r.title} {r.finished && <span className="finished-tag">✓ ferdig</span>}
                </div>
                <div className="log-meta">
                  {r.author ? `${r.author} · ` : ''}
                  {r.amount} {r.unit} · {fmtDate(r.created_at)}
                </div>
              </div>
              <div className="log-xp">+{r.xp} XP</div>
              <button className="log-delete" title="Slett" onClick={() => onDelete(r.id)}>
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
