import { useState } from 'react'
import { api } from '../api.js'
import { MASCOT_ITEMS, MASCOT_SLOTS, RARITY_LABEL, mascotItemsForSlot } from '../shared/game.js'
import Dog, { AccessoryIcon, DOG_PORTRAIT_VIEWBOX } from './Dog.jsx'
import Gachapon from './Gachapon.jsx'

export default function Mascot({ child, onChildUpdate }) {
  const [changing, setChanging] = useState(null)
  const [error, setError] = useState('')
  const mascot = child.mascot || { owned: [], equipped: {} }
  const owned = new Set(mascot.owned || [])

  async function toggleItem(item) {
    if (!owned.has(item.id) || changing) return
    const isEquipped = mascot.equipped?.[item.slot] === item.id
    setChanging(item.id)
    setError('')
    try {
      const updatedChild = await api.equipMascotItem(child.id, item.slot, isEquipped ? null : item.id)
      onChildUpdate(updatedChild)
    } catch (err) {
      setError(err.message || 'Oi! Klarte ikke å bytte tilbehør.')
    } finally {
      setChanging(null)
    }
  }

  return (
    <div className="mascot-page">
      <section className="card mascot-hero">
        <div className="mascot-title">
          <span className="mascot-eyebrow">Din lesekompis</span>
          <h2>🐶 Møt Sommer!</h2>
          <p>Kle opp Sommer med skattene du finner i kapselmaskinen.</p>
        </div>
        <div className="mascot-dog-stage">
          <span className="mascot-stage-star one">★</span><span className="mascot-stage-star two">★</span>
          <Dog equipped={mascot.equipped} />
        </div>
      </section>

      <Gachapon child={child} onPulled={onChildUpdate} />

      <section className="card mascot-wardrobe">
        <div className="wardrobe-heading">
          <div className="wardrobe-preview" aria-hidden="true">
            <Dog equipped={mascot.equipped} viewBox={DOG_PORTRAIT_VIEWBOX} />
          </div>
          <div className="wardrobe-heading-text">
            <div><span className="mascot-eyebrow">Miks og match</span><h2>🧳 Garderoben</h2></div>
            <span className="wardrobe-count">{owned.size}/{MASCOT_ITEMS.length} funnet</span>
          </div>
        </div>
        <p className="wardrobe-intro">Trykk på noe du eier for å ta det på. Trykk én gang til for å ta det av – se Sommer skifte antrekk her oppe!</p>
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="wardrobe-groups">
          {MASCOT_SLOTS.map((slot) => (
            <section className="wardrobe-group" key={slot.id} aria-labelledby={`slot-${slot.id}`}>
              <h3 id={`slot-${slot.id}`}>{slot.name}</h3>
              <div className="wardrobe-grid">
                {mascotItemsForSlot(slot.id).map((item) => {
                  const unlocked = owned.has(item.id)
                  const equipped = mascot.equipped?.[slot.id] === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`wardrobe-item ${unlocked ? 'unlocked' : 'locked'} ${equipped ? 'equipped' : ''} rarity-${item.rarity}`}
                      disabled={!unlocked || Boolean(changing)}
                      onClick={() => toggleItem(item)}
                      aria-pressed={equipped}
                      aria-label={unlocked ? `${item.name}, ${equipped ? 'ta av' : 'ta på'}` : `${item.name}, låst`}
                    >
                      {equipped && <span className="wardrobe-equipped-badge">På</span>}
                      <span className="wardrobe-item-icon" aria-hidden="true">
                        {unlocked ? <AccessoryIcon item={item} /> : '🔒'}
                      </span>
                      <span className="wardrobe-item-name">{item.name}</span>
                      <span className={`rarity-badge rarity-${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
                      {changing === item.id && <span className="wardrobe-changing">Bytter …</span>}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
