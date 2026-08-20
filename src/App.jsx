import { useState } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
import Caisse from './screens/Caisse'
import Menu from './screens/Menu'
import NavBar from './components/NavBar'

export default function App() {
  const [ecran, setEcran] = useState('splash')
  const [onglet, setOnglet] = useState('dashboard')

  if (ecran === 'splash') {
    return <Splash onFin={() => setEcran('connexion')} />
  }

  if (ecran === 'connexion') {
    return <Connexion onConnexion={() => setEcran('app')} />
  }

  return (
    <div style={{ paddingBottom: '70px' }}>
      {onglet === 'dashboard' && <Dashboard />}
      {onglet === 'chambres' && <Chambres />}
      {onglet === 'sejours' && <Sejours />}
      {onglet === 'caisse' && <Caisse />}
      {onglet === 'menu' && (
        <Menu onDeconnexion={() => {
          setEcran('connexion')
          setOnglet('dashboard')
        }} />
      )}
      <NavBar onglet={onglet} setOnglet={setOnglet} />
    </div>
  )
      }
