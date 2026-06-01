import { useEffect, useState, useCallback } from 'react'
import { api } from './api.js'
import ProfilePicker from './components/ProfilePicker.jsx'
import Header from './components/Header.jsx'
import RegisterReading from './components/RegisterReading.jsx'
import Trophies from './components/Trophies.jsx'
import Avatars from './components/Avatars.jsx'
import ReadingLog from './components/ReadingLog.jsx'
import Confetti from './components/Confetti.jsx'

export default function App() {
  const [children, setChildren] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [readings, setReadings] = useState([])
  const [view, setView] = useState('profil')
  const [loading, setLoading] = useState(true)
  const [celebrate, setCelebrate] = useState(null) // { xp, levelUp, avatar }

  const active = children.find((c) => c.id === activeId) || null

  const refreshChildren = useCallback(async () => {
    const list = await api.listChildren()
    setChildren(list)
    return list
  }, [])

  useEffect(() => {
    refreshChildren().finally(() => setLoading(false))
  }, [refreshChildren])

  const loadReadings = useCallback(async (id) => {
    setReadings(await api.listReadings(id))
  }, [])

  function openChild(id) {
    setActiveId(id)
    setView('profil')
    loadReadings(id)
  }

  function backToPicker() {
    setActiveId(null)
    setReadings([])
  }

  async function handleCreate(name, age) {
    const child = await api.createChild(name, age)
    await refreshChildren()
    openChild(child.id)
  }

  async function handleDeleteChild(id) {
    await api.deleteChild(id)
    if (id === activeId) backToPicker()
    await refreshChildren()
  }

  async function handleAddReading(form) {
    const prevLevel = active?.level.level ?? 1
    const { child, gainedXp } = await api.addReading(activeId, form)
    const list = await refreshChildren()
    await loadReadings(activeId)
    const newLevel = child.level.level
    const levelUp = newLevel > prevLevel
    setCelebrate({
      xp: gainedXp,
      levelUp,
      level: newLevel,
      avatar: levelUp ? child.unlockedAvatars[child.unlockedAvatars.length - 1] : null,
    })
  }

  async function handlePickAvatar(emoji) {
    await api.updateChild(activeId, { avatar: emoji })
    await refreshChildren()
  }

  async function handleDeleteReading(id) {
    await api.deleteReading(id)
    await refreshChildren()
    await loadReadings(activeId)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="sun-spin">☀️</div>
        <p>Laster Sommerles …</p>
      </div>
    )
  }

  if (!active) {
    return (
      <ProfilePicker
        children={children}
        onOpen={openChild}
        onCreate={handleCreate}
        onDelete={handleDeleteChild}
      />
    )
  }

  return (
    <div className="app">
      {celebrate && <Confetti data={celebrate} onClose={() => setCelebrate(null)} />}
      <Header child={active} onBack={backToPicker} />

      <nav className="tabs">
        <button className={view === 'profil' ? 'active' : ''} onClick={() => setView('profil')}>
          🏅 Profil
        </button>
        <button className={view === 'lesing' ? 'active' : ''} onClick={() => setView('lesing')}>
          ➕ Ny lesing
        </button>
        <button className={view === 'avatarer' ? 'active' : ''} onClick={() => setView('avatarer')}>
          🎭 Avatarer
        </button>
      </nav>

      <main className="content">
        {view === 'profil' && (
          <>
            <Trophies stats={active.stats} />
            <ReadingLog readings={readings} onDelete={handleDeleteReading} />
          </>
        )}
        {view === 'lesing' && <RegisterReading onAdd={handleAddReading} />}
        {view === 'avatarer' && (
          <Avatars child={active} onPick={handlePickAvatar} />
        )}
      </main>
    </div>
  )
}
