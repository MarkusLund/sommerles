import { useState } from 'react'
import { READING_TYPES, UNITS, xpForReading, estimateWords, estimateMinutes, XP_FINISH_BONUS } from '../shared/game.js'
import BookSearch from './BookSearch.jsx'

export default function RegisterReading({ onAdd }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [type, setType] = useState('lese')
  const [unit, setUnit] = useState('minutter')
  const [amount, setAmount] = useState('')
  const [pages, setPages] = useState('')
  const [finished, setFinished] = useState(false)
  const [book, setBook] = useState(null) // valgt ekte bok (for omslag + estimat)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const preview = xpForReading({ unit, amount: Number(amount) || 0, finished })
  const pagesNum = Number(pages) || 0
  const estWords = estimateWords(pagesNum)
  const estMinutes = estimateMinutes(pagesNum)

  function selectBook(b) {
    setBook(b)
    setTitle(b.title || '')
    setAuthor(b.author || '')
    if (b.pages) setPages(String(b.pages))
  }

  function clearBook() {
    setBook(null)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onAdd({
        title: title.trim(),
        author: author.trim(),
        type,
        unit,
        amount: Number(amount),
        pages: pages ? Number(pages) : null,
        finished,
      })
      setTitle('')
      setAuthor('')
      setAmount('')
      setPages('')
      setFinished(false)
      setBook(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card register" onSubmit={submit}>
      <h2>➕ Registrer lesing</h2>

      <BookSearch onSelect={selectBook} />

      {book && (
        <div className="selected-book">
          {book.cover ? (
            <img src={book.cover} alt="" className="selected-cover" />
          ) : (
            <div className="selected-cover placeholder">📕</div>
          )}
          <div className="selected-info">
            <div className="selected-title">{book.title}</div>
            <div className="selected-meta">{book.author || 'Ukjent forfatter'}</div>
            <div className="selected-stats">
              {book.pages ? `${book.pages} sider` : 'Ukjent sidetall'}
              {book.words ? ` · ca. ${book.words.toLocaleString('no-NO')} ord` : ''}
            </div>
          </div>
          <button type="button" className="selected-clear" onClick={clearBook} title="Fjern">
            ✕
          </button>
        </div>
      )}

      <label>
        Boktittel
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hva leste du?" maxLength={160} />
      </label>

      <label>
        Forfatter <span className="optional">(valgfritt)</span>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Hvem skrev den?" maxLength={160} />
      </label>

      <div className="field-label">Hvordan leste du?</div>
      <div className="chip-row">
        {READING_TYPES.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`chip ${type === t.id ? 'selected' : ''}`}
            onClick={() => setType(t.id)}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="field-label">Registrer i</div>
      <div className="chip-row">
        {UNITS.map((u) => (
          <button
            type="button"
            key={u.id}
            className={`chip ${unit === u.id ? 'selected' : ''}`}
            onClick={() => setUnit(u.id)}
          >
            {u.emoji} {u.label}
          </button>
        ))}
      </div>

      <div className="amount-row">
        <label>
          Antall {unit === 'sider' ? 'sider' : 'minutter'}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min={1}
          />
        </label>
        <label>
          Sider i boka <span className="optional">(valgfritt)</span>
          <input
            type="number"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder="0"
            min={0}
          />
        </label>
      </div>

      {pagesNum > 0 && (estWords || estMinutes) && (
        <div className="estimate">
          📐 Anslag for hele boka: {estWords ? `ca. ${estWords.toLocaleString('no-NO')} ord` : ''}
          {estMinutes ? ` · ca. ${estMinutes} min lesetid` : ''}
          {estMinutes && (
            <button
              type="button"
              className="estimate-btn"
              onClick={() => {
                setUnit('minutter')
                setAmount(String(estMinutes))
              }}
            >
              Bruk som minutter
            </button>
          )}
        </div>
      )}

      <label className="checkbox">
        <input type="checkbox" checked={finished} onChange={(e) => setFinished(e.target.checked)} />
        Jeg ble ferdig med boka! <span className="bonus">+{XP_FINISH_BONUS} XP bonus</span>
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="register-footer">
        <div className="xp-preview">
          Gir <strong>{preview}</strong> XP
        </div>
        <button type="submit" className="btn-primary big" disabled={busy || !title.trim() || !amount}>
          {busy ? 'Lagrer …' : '📖 Registrer lesing'}
        </button>
      </div>
    </form>
  )
}
