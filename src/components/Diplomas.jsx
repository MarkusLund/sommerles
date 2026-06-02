import { useState } from 'react'
import { MILESTONES, nextMilestone } from '../shared/game.js'
import Diploma from './Diploma.jsx'

export default function Diplomas({ child }) {
  const [open, setOpen] = useState(null) // milestone som vises i fullskjerm
  const level = child.level.level
  const next = nextMilestone(level)

  return (
    <section className="card">
      <div className="trophies-head">
        <h2>🎖️ Premier &amp; diplomer</h2>
        <span className="trophies-count">
          {MILESTONES.filter((m) => m.level <= level).length} av {MILESTONES.length} låst opp
        </span>
      </div>
      <p className="avatars-intro">
        Klatre til <strong>level 10, 20 og 30</strong> for å låse opp diplomer. Hvert diplom gir deg
        en ekte premie – vis det fram til en voksen for å hente den! 🎁
      </p>

      <div className="milestone-track">
        {MILESTONES.map((m) => {
          const earned = level >= m.level
          const xpLeft = (m.level - 1) * child.level.span - child.stats.totalXp
          return (
            <button
              key={m.level}
              className={`milestone-card tier-${m.tier} ${earned ? 'earned' : 'locked'}`}
              onClick={() => earned && setOpen(m)}
              disabled={!earned}
            >
              <div className="milestone-medal">{earned ? m.medal : '🔒'}</div>
              <div className="milestone-title">{m.title}</div>
              <div className="milestone-level">Level {m.level}</div>
              {earned ? (
                <div className="milestone-cta">Se diplom →</div>
              ) : (
                <div className="milestone-progress">
                  {next && next.level === m.level
                    ? `${Math.max(0, xpLeft)} XP igjen`
                    : 'Lås opp forrige først'}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {open && (
        <div className="diploma-overlay" onClick={() => setOpen(null)}>
          <div className="diploma-stage" onClick={(e) => e.stopPropagation()}>
            <Diploma
              child={child}
              milestone={open}
              stats={(child.diplomas && child.diplomas[open.level]) || child.stats}
            />
            <div className="diploma-actions">
              <button className="btn-ghost" onClick={() => setOpen(null)}>
                Lukk
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                🖨️ Skriv ut
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
