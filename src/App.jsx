import { useState, useEffect } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
import Caisse from './screens/Caisse'
import Menu from './screens/Menu'
import NavBar from './components/NavBar'

// ─── Styles de transition ─────────────────────────────────────────────────────
const styleTransition = `
  @keyframes screenIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .screen-in {
    animation: screenIn 0.25s ease both;
  }
`

// ─── Accès autorisés par rôle ─────────────────────────────────────────────────
const ACCES = {
  directeur:      ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  receptionniste: ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  caissier:       ['dashboard', 'caisse', 'menu'],
}

export default function App() {
  const [ecran,       setEcran]       = useState('splash')
  const [onglet,      setOnglet]      = useState('dashboard')
  const [utilisateur, setUtilisateur] = useState(null) // { email, role }
  const [cle,         setCle]         = useState(0)    // Force le re-render animé

  // Injection des styles de transition
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleTransition
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  // Changement d'onglet avec animation
  const changerOnglet = (nouvelOnglet) => {
    if (nouvelOnglet === onglet) return
    // Vérifier l'accès selon le rôle
    const accesRole = ACCES[utilisateur?.role] || ACCES.receptionniste
    if (!accesRole.includes(nouvelOnglet)) return
    setOnglet(nouvelOnglet)
    setCle(k => k + 1)
  }

  const handleConnexion = (user) => {
    setUtilisateur(user)
    // Onglet de départ selon le rôle
    if (user.role === 'caissier') setOnglet('caisse')
    else setOnglet('dashboard')
    setEcran('app')
  }

  const handleDeconnexion = () => {
    setUtilisateur(null)
    setOnglet('dashboard')
    setEcran('connexion')
  }

  // ── Écran Splash ──
  if (ecran === 'splash') {
    return <Splash onFin={() => setEcran('connexion')} />
  }

  // ── Écran Connexion ──
  if (ecran === 'connexion') {
    return <Connexion onConnexion={handleConnexion} />
  }

  // ── Application principale ──
  const accesRole = ACCES[utilisateur?.role] || ACCES.receptionniste

  return (
    <div style={{ paddingBottom: '70px', background: '#F5F7FA', minHeight: '100vh' }}>

      {/* Contenu de l'onglet actif — animé à chaque changement */}
      <div key={cle} className="screen-in">
        {onglet === 'dashboard' && (
          <Dashboard utilisateur={utilisateur} />
        )}
        {onglet === 'chambres' && accesRole.includes('chambres') && (
          <Chambres />
        )}
        {onglet === 'sejours' && accesRole.includes('sejours') && (
          <Sejours />
        )}
        {onglet === 'caisse' && accesRole.includes('caisse') && (
          <Caisse />
        )}
        {onglet === 'menu' && (
          <Menu
            utilisateur={utilisateur}
            onDeconnexion={handleDeconnexion}
          />
        )}
      </div>

      {/* Barre de navigation */}
      <NavBar
        onglet={onglet}
        setOnglet={changerOnglet}
        role={utilisateur?.role}
      />
    </div>
  )
}
