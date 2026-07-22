import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { GACHA_COST, RARITY_LABEL, MASCOT_ITEMS } from '../shared/game.js'
import { AccessoryIcon } from './Dog.jsx'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Gachapon({ child, onPulled }) {
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  const mascot = child.mascot || {}
  const coins = mascot.coins ?? 0
  const cost = mascot.gachaCost ?? GACHA_COST
  const missing = Math.max(0, cost - coins)
  const allCollected = (mascot.owned?.length ?? 0) >= MASCOT_ITEMS.length
  const busy = phase !== 'idle' && phase !== 'revealed'

  async function pull() {
    if (busy || allCollected || coins < cost) return
    setError('')
    setResult(null)
    setPhase('shaking')

    try {
      const [data] = await Promise.all([api.pullGacha(child.id), wait(650)])
      if (!alive.current) return
      onPulled(data.child)
      setResult(data)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('opening'))
      })
      await wait(1050)
      if (alive.current) setPhase('revealed')
    } catch (err) {
      if (!alive.current) return
      setError(err.message || 'Oi! Kapselen satte seg fast. Prøv igjen!')
      setPhase('idle')
    }
  }

  function closeResult() {
    setResult(null)
    setPhase('idle')
  }

  return (
    <section className="card gachapon-card" aria-labelledby="gachapon-title">
      <div className="gachapon-copy">
        <span className="gachapon-kicker">Tilbehørsjakt!</span>
        <h2 id="gachapon-title">🎁 Kapselmaskinen</h2>
        <p>Mat maskinen med lesemynter og se hva Sommer får!</p>
        <div className="gachapon-balance" aria-live="polite"><span>🪙</span> {coins} mynter</div>
        <button className="btn-primary gachapon-pull" disabled={busy || allCollected || coins < cost} onClick={pull}>
          {allCollected ? 'Alt tilbehør samlet!' : busy ? 'Maskinen jobber …' : `Trekk kapsel (${cost} mynter)`}
        </button>
        {allCollected ? (
          <p className="gachapon-hint">Du har samlet alt tilbehør til Sommer – utrolig bra jobba! 🎉</p>
        ) : (
          missing > 0 && <p className="gachapon-hint">Les litt til – du mangler {missing} {missing === 1 ? 'mynt' : 'mynter'}.</p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>

      <div className={`gachapon-machine ${phase}`} aria-hidden="true">
        <div className="gachapon-globe">
          <span className="machine-capsule c1" /><span className="machine-capsule c2" /><span className="machine-capsule c3" />
          <span className="machine-capsule c4" /><span className="machine-capsule c5" />
        </div>
        <div className="gachapon-body">
          <div className="gachapon-coin-slot">MYNT</div>
          <div className="gachapon-knob"><span /></div>
          <div className="gachapon-chute" />
        </div>
        <div className="gachapon-foot" />
        {phase === 'opening' && (
          <div className="gachapon-prize-capsule">
            <span className="capsule-top" /><span className="capsule-bottom" />
          </div>
        )}
      </div>

      {result && phase === 'revealed' && (
        <div className="gachapon-result-backdrop" role="presentation" onClick={closeResult}>
          <div className={`gachapon-result rarity-${result.item.rarity}`} role="dialog" aria-modal="true" aria-labelledby="gacha-result-title" onClick={(event) => event.stopPropagation()}>
            <div className="gachapon-result-sparkles">✦ ✨ ✦</div>
            <div className="gachapon-result-emoji"><AccessoryIcon item={result.item} /></div>
            <span className={`rarity-badge rarity-${result.item.rarity}`}>{RARITY_LABEL[result.item.rarity]}</span>
            <h2 id="gacha-result-title">{result.item.name}!</h2>
            <p>Hurra, et nytt tilbehør til garderoben!</p>
            <button className="btn-primary" onClick={closeResult}>Kult!</button>
          </div>
        </div>
      )}
    </section>
  )
}
