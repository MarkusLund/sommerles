import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

export default function BookSearch({ onSelect }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const boxRef = useRef(null)
  const debounce = useRef(null)

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      setError('')
      return
    }
    setLoading(true)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      try {
        const books = await api.searchBooks(q.trim())
        setResults(books)
        setOpen(true)
        setError('')
      } catch (err) {
        setError('Fikk ikke kontakt med boktjenesten – du kan registrere manuelt.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(debounce.current)
  }, [q])

  // Lukk dropdown ved klikk utenfor.
  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function pick(book) {
    onSelect(book)
    setQ('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="book-search" ref={boxRef}>
      <div className="field-label">🔎 Søk etter en ekte bok</div>
      <div className="search-input-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Skriv tittel eller forfatter …"
        />
        {loading && <span className="search-spinner">⏳</span>}
      </div>

      {error && <p className="search-hint">{error}</p>}

      {open && results.length > 0 && (
        <ul className="search-results">
          {results.map((b) => (
            <li key={b.id} className="search-result" onClick={() => pick(b)}>
              {b.cover ? (
                <img src={b.cover} alt="" className="result-cover" loading="lazy" />
              ) : (
                <div className="result-cover placeholder">📕</div>
              )}
              <div className="result-info">
                <div className="result-title">{b.title}</div>
                <div className="result-meta">
                  {b.author || 'Ukjent forfatter'}
                  {b.year ? ` · ${b.year}` : ''}
                </div>
                <div className="result-stats">
                  {b.pages ? `${b.pages} sider` : 'Ukjent sidetall'}
                  {b.words ? ` · ca. ${b.words.toLocaleString('no-NO')} ord` : ''}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && q.trim().length >= 2 && results.length === 0 && !error && (
        <p className="search-hint">Fant ingen bøker – fyll inn manuelt nedenfor.</p>
      )}
    </div>
  )
}
