import { AVATARS, milestoneForLevel, AVATAR_BG_COLORS, avatarBgById } from '../shared/game.js'

export default function Avatars({ child, onPick, onPickBg }) {
  const level = child.level.level
  const currentBg = avatarBgById(child.avatar_bg)

  return (
    <section className="card">
      <h2>🎭 Avatarer</h2>
      <p className="avatars-intro">
        Du låser opp en ny avatar for hvert level du klatrer – helt opp til level 30! Avatarene med
        ⭐ er milepæl-avatarer (level 10, 20 og 30) som også gir deg et diplom og en premie. Trykk på
        en avatar du har låst opp for å bruke den.
      </p>

      <div className="avatar-grid">
        {AVATARS.map((a) => {
          const unlocked = a.level <= level
          const selected = child.avatar === a.emoji
          const milestone = milestoneForLevel(a.level)
          return (
            <button
              key={a.emoji}
              className={`avatar-card ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''} ${
                milestone ? `milestone tier-${milestone.tier}` : ''
              }`}
              disabled={!unlocked}
              onClick={() => unlocked && onPick(a.emoji)}
            >
              {milestone && <div className="avatar-star" title={milestone.title}>⭐</div>}
              <div
                className="avatar-emoji"
                style={
                  unlocked && !milestone
                    ? { background: `linear-gradient(160deg, ${currentBg.from}, ${currentBg.to})` }
                    : undefined
                }
              >
                {unlocked ? a.emoji : '🔒'}
              </div>
              <div className="avatar-name">{a.name}</div>
              <div className="avatar-level">{unlocked ? `Level ${a.level}` : `Låses ved level ${a.level}`}</div>
              {selected && <div className="avatar-tag">I bruk</div>}
            </button>
          )
        })}
      </div>

      <h3 className="bg-picker-title">🎨 Bakgrunnsfarge</h3>
      <p className="avatars-intro">Velg en farge til avatar-sirkelen din.</p>
      <div className="bg-swatch-grid">
        {AVATAR_BG_COLORS.map((c) => (
          <button
            key={c.id}
            className={`bg-swatch ${child.avatar_bg === c.id ? 'selected' : ''}`}
            title={c.label}
            onClick={() => onPickBg(c.id)}
            style={{ background: `linear-gradient(160deg, ${c.from}, ${c.to})` }}
          >
            {child.avatar_bg === c.id && <span className="bg-swatch-check">✓</span>}
          </button>
        ))}
      </div>
    </section>
  )
}
