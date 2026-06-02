import { useEffect, useState, useCallback } from 'react'
import { api } from './api.js'
import Auth from './components/Auth.jsx'
import ProfilePicker from './components/ProfilePicker.jsx'
import Header from './components/Header.jsx'
import RegisterReading from './components/RegisterReading.jsx'
import Trophies from './components/Trophies.jsx'
import Avatars from './components/Avatars.jsx'
import Diplomas from './components/Diplomas.jsx'
import ReadingLog from './components/ReadingLog.jsx'
import Confetti from './components/Confetti.jsx'
import { crossedMilestones } from './shared/game.js'

const USER_KEY = 'sommerles_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

export default function App() {
  // Optimistisk: hvis vi har en lagret bruker, vis appen med en gang og
  // valider økten mot serveren i bakgrunnen. Ellers: undefined = laster.
  const [user, setUserState] = useState(loadStoredUser) // undefined = laster, null = ikke innlogget
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

  const setUser = useCallback((u) => {
    setUserState(u)
    try {
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
      else localStorage.removeItem(USER_KEY)
    } catch {
      /* localStorage utilgjengelig – fungerer fortsatt via cookie */
    }
  }, [])

  // Valider økten mot serveren (cookie). Bekrefter eller rydder lagret bruker.
  useEffect(() => {
    api
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
  }, [setUser])

  // Last barn så snart vi er innlogget.
  useEffect(() => {
    if (!user) return
    setLoading(true)
    refreshChildren().finally(() => setLoading(false))
  }, [user, refreshChildren])

  async function handleLogout() {
    await api.logout().catch(() => {})
    setActiveId(null)
    setReadings([])
    setChildren([])
    setUser(null)
  }

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
    const milestone = crossedMilestones(prevLevel, newLevel).slice(-1)[0] || null
    setCelebrate({
      xp: gainedXp,
      levelUp,
      level: newLevel,
      avatar: levelUp ? child.unlockedAvatars[child.unlockedAvatars.length - 1] : null,
      milestone,
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

  if (user === undefined || (user && loading)) {
    return (
      <div className="loading-screen">
        <div className="sun-spin">☀️</div>
        <p>Laster Sommerles …</p>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthed={setUser} />
  }

  if (!active) {
    return (
      <ProfilePicker
        children={children}
        onOpen={openChild}
        onCreate={handleCreate}
        onDelete={handleDeleteChild}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="app">
      {celebrate && (
        <Confetti
          data={celebrate}
          onClose={() => setCelebrate(null)}
          onSeePremier={() => {
            setCelebrate(null)
            setView('premier')
          }}
        />
      )}
      <Header child={active} onBack={backToPicker} onShowPremier={() => setView('premier')} />

      <nav className="tabs">
        <button className={view === 'profil' ? 'active' : ''} onClick={() => setView('profil')}>
          🏅 Profil
        </button>
        <button className={view === 'lesing' ? 'active' : ''} onClick={() => setView('lesing')}>
          ➕ Ny lesing
        </button>
        <button className={view === 'premier' ? 'active' : ''} onClick={() => setView('premier')}>
          🎖️ Premier
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
        {view === 'premier' && <Diplomas child={active} />}
        {view === 'avatarer' && (
          <Avatars child={active} onPick={handlePickAvatar} />
        )}
      </main>
    </div>
  )
}
