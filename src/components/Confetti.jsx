import { useEffect } from 'react'

const PIECES = Array.from({ length: 40 })
const COLORS = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9f1c', '#c77dff']

export default function Confetti({ data, onClose }) {
  useEffect(() => {
    const ms = data.levelUp ? 4200 : 1800
    const t = setTimeout(onClose, ms)
    return () => clearTimeout(t)
  }, [data, onClose])

  return (
    <div className="celebrate" onClick={onClose}>
      <div className="confetti">
        {PIECES.map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i / PIECES.length) * 100}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${(i % 10) * 0.12}s`,
            }}
          />
        ))}
      </div>

      <div className="celebrate-card">
        {data.levelUp ? (
          <>
            <div className="celebrate-avatar">{data.avatar}</div>
            <h2>Level {data.level}! 🎉</h2>
            <p>Du gikk opp et level og låste opp en ny avatar!</p>
            <p className="celebrate-xp">+{data.xp} XP</p>
          </>
        ) : (
          <>
            <div className="celebrate-avatar">⭐</div>
            <h2>Bra jobba!</h2>
            <p className="celebrate-xp">+{data.xp} XP</p>
          </>
        )}
        <button className="btn-primary" onClick={onClose}>
          Fortsett
        </button>
      </div>
    </div>
  )
}
