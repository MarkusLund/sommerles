import { evaluateTrophies } from '../shared/game.js'

export default function Trophies({ stats }) {
  const trophies = evaluateTrophies(stats)
  const earned = trophies.filter((t) => t.earned).length

  return (
    <section className="card">
      <div className="trophies-head">
        <h2>🏅 Mine troféer</h2>
        <span className="trophies-count">{earned} av {trophies.length} opptjent</span>
      </div>

      <div className="trophy-grid">
        {trophies.map((t) => (
          <div key={t.id} className={`trophy ${t.earned ? 'earned' : 'locked'}`}>
            <div className="trophy-emoji">{t.emoji}</div>
            <div className="trophy-body">
              <div className="trophy-name">{t.name}</div>
              <div className="trophy-desc">{t.desc}</div>
              <div className="trophy-bar">
                <div className="trophy-fill" style={{ width: `${(t.value / t.goal) * 100}%` }} />
              </div>
              <div className="trophy-progress">
                {t.earned ? '✓ Klart!' : `${t.value} / ${t.goal}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
