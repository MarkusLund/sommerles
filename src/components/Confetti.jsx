import { useEffect } from 'react'

const PIECES = Array.from({ length: 40 })
const COLORS = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9f1c', '#c77dff']
const GOLD = ['#ffd700', '#ffb300', '#fff3b0', '#ffcf40', '#f4a300', '#fff8dc']

export default function Confetti({ data, onClose, onSeePremier }) {
  const milestone = data.milestone
  useEffect(() => {
    // Milepæler får ekstra lang feiring – ingen auto-lukk, barnet lukker selv.
    if (milestone) return
    const ms = data.levelUp ? 4200 : 1800
    const t = setTimeout(onClose, ms)
    return () => clearTimeout(t)
  }, [data, onClose, milestone])

  const pieceCount = milestone ? PIECES.length * 2 : PIECES.length

  return (
    <div className="celebrate" onClick={milestone ? undefined : onClose}>
      <div className="confetti">
        {Array.from({ length: pieceCount }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i / pieceCount) * 100}%`,
              background: milestone ? GOLD[i % GOLD.length] : COLORS[i % COLORS.length],
              animationDelay: `${(i % 12) * 0.1}s`,
            }}
          />
        ))}
      </div>

      {milestone ? (
        <div className={`celebrate-card milestone-pop tier-${milestone.tier}`}>
          <div className="celebrate-medal">{milestone.medal}</div>
          <div className="celebrate-kicker">Milepæl nådd!</div>
          <h2>{milestone.title}</h2>
          <p>
            Du nådde <strong>level {milestone.level}</strong> og låste opp et diplom – som gir deg en
            ekte premie! 🎁
          </p>
          <p className="celebrate-xp">+{data.xp} XP</p>
          <div className="celebrate-actions">
            <button className="btn-ghost" onClick={onClose}>
              Senere
            </button>
            <button className="btn-primary" onClick={onSeePremier}>
              🎖️ Se diplomet mitt
            </button>
          </div>
        </div>
      ) : data.levelUp ? (
        <div className="celebrate-card">
          <div className="celebrate-avatar">{data.avatar}</div>
          <h2>Level {data.level}! 🎉</h2>
          <p>Du gikk opp et level og låste opp en ny avatar!</p>
          <p className="celebrate-xp">+{data.xp} XP</p>
          <button className="btn-primary" onClick={onClose}>
            Fortsett
          </button>
        </div>
      ) : (
        <div className="celebrate-card">
          <div className="celebrate-avatar">⭐</div>
          <h2>Bra jobba!</h2>
          <p className="celebrate-xp">+{data.xp} XP</p>
          <button className="btn-primary" onClick={onClose}>
            Fortsett
          </button>
        </div>
      )}
    </div>
  )
}
