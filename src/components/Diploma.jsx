import { MAX_LEVEL, PRIZE_TEXT } from '../shared/game.js'

function fmtTime(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h} t ${m} min` : `${m} min`
}

function fmtDate(iso) {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Selve diplomet. Brukes både i fullskjerm-visning og ved utskrift (window.print).
// `milestone` er en MILESTONES-oppføring; `stats` er øyeblikksbildet av lese-
// statistikken slik den var DA milepælen ble nådd (se milestoneSnapshots).
export default function Diploma({ child, milestone, stats }) {
  return (
    <div className={`diploma diploma-${milestone.tier}`}>
      <div className="diploma-sheen" aria-hidden="true" />
      <div className="diploma-corner tl" aria-hidden="true">✦</div>
      <div className="diploma-corner tr" aria-hidden="true">✦</div>
      <div className="diploma-corner bl" aria-hidden="true">✦</div>
      <div className="diploma-corner br" aria-hidden="true">✦</div>

      <div className="diploma-inner">
        <div className="diploma-kicker">Sommerles · Lesediplom</div>

        <div className="diploma-seal">
          <span className="diploma-seal-medal">{milestone.medal}</span>
          <span className="diploma-seal-ribbon" aria-hidden="true" />
        </div>

        <h1 className="diploma-title">{milestone.title}</h1>
        <p className="diploma-for">Tildeles</p>
        <p className="diploma-name">{child.name}</p>

        <p className="diploma-blurb">
          for å ha nådd <strong>level {milestone.level}</strong>
          {milestone.level === MAX_LEVEL ? ' og toppet hele Sommerles' : ''}. {milestone.blurb}
        </p>

        <div className="diploma-stats">
          <div className="diploma-stat">
            <div className="diploma-stat-num">{stats.booksFinished}</div>
            <div className="diploma-stat-label">bøker fullført</div>
          </div>
          <div className="diploma-stat">
            <div className="diploma-stat-num">{fmtTime(stats.totalMinutes)}</div>
            <div className="diploma-stat-label">lest til sammen</div>
          </div>
          <div className="diploma-stat">
            <div className="diploma-stat-num">{stats.totalXp}</div>
            <div className="diploma-stat-label">XP samlet</div>
          </div>
        </div>

        <div className="diploma-prize">
          <span className="diploma-prize-label">🎁 Premie</span>
          <span className="diploma-prize-text">{PRIZE_TEXT}</span>
        </div>

        <div className="diploma-footer">
          <span className="diploma-date">{fmtDate(stats.achievedAt)}</span>
          <span className="diploma-sign">Sommerles ☀️📚</span>
        </div>
      </div>
    </div>
  )
}
