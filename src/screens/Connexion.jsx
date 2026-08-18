import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Connexion({ onConnexion }) {
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [visible, setVisible] = useState(false)
  const [erreur, setErreur] = useState('')

  const handleConnexion = () => {
    if (!email || !mdp) {
      setErreur('Veuillez remplir tous les champs')
      return
    }
    onConnexion()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        padding: '48px 20px 32px', textAlign: 'center'
      }}>
        <img src="/logo-homs.png" alt="HOMS"
          onError={e => e.target.style.display='none'}
          style={{ height: '80px', marginBottom: '16px' }} />
        <h1 style={{ color: '#C9A84C', fontSize: '20px', fontWeight: '700' }}>
          HOMS HOTEL MANAGER
        </h1>
      </div>

      <div style={{ flex: 1, padding: '32px 24px' }}>
        <h2 style={{ color: '#1B3A6B', fontSize: '22px', marginBottom: '8px' }}>
          Connexion
        </h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
          Accédez à votre tableau de bord
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#1B3A6B', fontWeight: '600',
            fontSize: '14px', marginBottom: '8px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErreur('') }}
            placeholder="votre@email.com"
            style={{
              width: '100%', padding: '14px 16px',
              border: '2px solid #E0E0E0', borderRadius: '10px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#1B3A6B', fontWeight: '600',
            fontSize: '14px', marginBottom: '8px' }}>Mot de passe</label>
          <div style={{ position: 'relative' }}>
            <input
              type={visible ? 'text' : 'password'}
              value={mdp}
              onChange={e => { setMdp(e.target.value); setErreur('') }}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '14px 48px 14px 16px',
                border: '2px solid #E0E0E0', borderRadius: '10px',
                fontSize: '16px'
              }}
            />
            <button onClick={() => setVisible(!visible)} style={{
              position: 'absolute', right: '14px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              color: '#999'
            }}>
              {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {erreur && (
          <p style={{ color: '#E74C3C', fontSize: '14px', marginBottom: '16px' }}>
            {erreur}
          </p>
        )}

        <button onClick={handleConnexion} style={{
          width: '100%', padding: '16px',
          background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
          color: 'white', borderRadius: '10px',
          fontSize: '16px', fontWeight: '600'
        }}>
          Se connecter
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '24px' }}>
        <img src="/logo-homslovision-blanc.png" alt="Homslovision"
          onError={e => e.target.style.display='none'}
          style={{ height: '30px', opacity: 0.6 }} />
        <p style={{ color: '#999', fontSize: '11px', marginTop: '6px' }}>
          Le futur maintenant
        </p>
      </div>
    </div>
  )
}
