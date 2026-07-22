import { AVATARS, nextMilestone, milestoneForLevel, avatarBgById } from '../shared/game.js'

function fmtTime(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}t ${m}m` : `${m}m`
}

export default function Header({ child, onBack, onShowPremier }) {
  const { level, stats } = child
  const nextAvatar = AVATARS.find((a) => a.level === level.level + 1)
  const here = milestoneForLevel(level.level)
  const next = nextMilestone(level.level)
  const bg = avatarBgById(child.avatar_bg)

  return (
    <header className="header">
      <div className="header-top">
        <button className="switch-btn" onClick={onBack}>
          ↩ Bytt barn
        </button>
      </div>

      <div className="header-main">
        <div
          className={`header-avatar ${here ? `milestone-glow tier-${here.tier}` : ''}`}
          style={{ background: `linear-gradient(160deg, ${bg.from}, ${bg.to})` }}
        >
          {child.avatar}
        </div>
        <div className="header-info">
          <div className="header-name">Hei {child.name}!</div>
          <div className="level-row">
            <span className={`level-badge ${here ? `tier-${here.tier}` : ''}`}>
              {here ? `${here.medal} Level ${level.level}` : `Level ${level.level}`}
            </span>
            <div className="level-bar">
              <div className="level-fill" style={{ width: `${level.pct}%` }} />
            </div>
            <span className="level-xp">
              {level.isMax ? `${stats.totalXp} XP · toppen!` : `${level.xpToNext} XP til level ${level.level + 1}`}
            </span>
          </div>
          {next ? (
            <button className="milestone-hint" onClick={onShowPremier}>
              {next.medal}{' '}
              <strong>{Math.max(0, (next.level - 1) * level.span - stats.totalXp)} XP</strong> til{' '}
              {next.title} på level {next.level} – med ekte premie! →
            </button>
          ) : (
            !level.isMax && nextAvatar && (
              <div className="next-avatar-hint">
                Neste avatar: <span className="locked">{nextAvatar.emoji}</span> {nextAvatar.name}
              </div>
            )
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
