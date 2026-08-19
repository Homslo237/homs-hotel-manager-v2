import { useState } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
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
      {onglet === 'caisse' && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
          <h2>Caisse</h2>
          <p>Bientôt disponible</p>
        </div>
      )}
      {onglet === 'menu' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ color: '#1B3A6B', marginBottom: '20px' }}>Menu</h2>
          <button
            onClick={() => setEcran('connexion')}
            style={{
              background: '#E74C3C', color: 'white',
              padding: '12px 24px', borderRadius: '8px',
              fontSize: '16px', width: '100%'
            }}>
            Se déconnecter
          </button>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <img src="/logo-homslovision.png" alt="Homslovision"
              style={{ height: '40px' }}
              onError={e => e.target.style.display='none'} />
            <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
              Le futur maintenant
            </p>
          </div>
        </div>
      )}
      <NavBar onglet={onglet} setOnglet={setOnglet} />
    </div>
  )
}
