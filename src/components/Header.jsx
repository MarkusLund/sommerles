import { AVATARS } from '../shared/game.js'

function fmtTime(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}t ${m}m` : `${m}m`
}

export default function Header({ child, onBack }) {
  const { level, stats } = child
  const nextAvatar = AVATARS.find((a) => a.level === level.level + 1)

  return (
    <header className="header">
      <button className="switch-btn" onClick={onBack}>
        ↩ Bytt barn
      </button>

      <div className="header-main">
        <div className="header-avatar">{child.avatar}</div>
        <div className="header-info">
          <div className="header-name">Hei {child.name}!</div>
          <div className="level-row">
            <span className="level-badge">Level {level.level}</span>
            <div className="level-bar">
              <div className="level-fill" style={{ width: `${level.pct}%` }} />
            </div>
            <span className="level-xp">
              {level.isMax ? `${stats.totalXp} XP · maks!` : `${level.xpToNext} XP til level ${level.level + 1}`}
            </span>
          </div>
          {!level.isMax && nextAvatar && (
            <div className="next-avatar-hint">
              Neste avatar: <span className="locked">{nextAvatar.emoji}</span> {nextAvatar.name}
            </div>
          )}
        </div>
      </div>

      <div className="header-stats">
        <div className="stat">
          <div className="stat-num">{stats.totalXp}</div>
          <div className="stat-label">XP</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats.booksFinished}</div>
          <div className="stat-label">Bøker lest</div>
        </div>
        <div className="stat">
          <div className="stat-num">{fmtTime(stats.totalMinutes)}</div>
          <div className="stat-label">Tid lest</div>
        </div>
      </div>
    </header>
  )
}
