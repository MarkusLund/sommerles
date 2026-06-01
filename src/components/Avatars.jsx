import { AVATARS } from '../shared/game.js'

export default function Avatars({ child, onPick }) {
  const level = child.level.level

  return (
    <section className="card">
      <h2>🎭 Avatarer</h2>
      <p className="avatars-intro">
        Du låser opp en ny avatar for hvert level du klatrer! Trykk på en avatar du har låst opp for å bruke den.
      </p>

      <div className="avatar-grid">
        {AVATARS.map((a) => {
          const unlocked = a.level <= level
          const selected = child.avatar === a.emoji
          return (
            <button
              key={a.emoji}
              className={`avatar-card ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}`}
              disabled={!unlocked}
              onClick={() => unlocked && onPick(a.emoji)}
            >
              <div className="avatar-emoji">{unlocked ? a.emoji : '🔒'}</div>
              <div className="avatar-name">{a.name}</div>
              <div className="avatar-level">{unlocked ? `Level ${a.level}` : `Låses ved level ${a.level}`}</div>
              {selected && <div className="avatar-tag">I bruk</div>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
