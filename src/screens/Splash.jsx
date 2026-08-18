import { useState, useEffect } from 'react'

export default function Splash({ onFin }) {
  const [progression, setProgression] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgression(p => {
        if (p >= 100) { clearInterval(timer); onFin(); return 100 }
        return p + 2
      })
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1B3A6B 0%, #2C5282 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <img
        src="/logo-homs.png"
        alt="HOMS Hotel"
        onError={e => e.target.style.display='none'}
        style={{ width: '160px', marginBottom: '24px' }}
      />
      <h1 style={{ color: '#C9A84C', fontSize: '24px', fontWeight: '700', letterSpacing: '2px' }}>
        HOMS HOTEL MANAGER
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '8px' }}>
        UNE VISION D'ENSEMBLE
      </p>
      <div style={{
        width: '200px', height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px', marginTop: '48px'
      }}>
        <div style={{
          width: `${progression}%`, height: '100%',
          background: '#C9A84C', borderRadius: '2px',
          transition: 'width 0.1s'
        }} />
      </div>
      <img
        src="/logo-homslovision.png"
        alt="Homslovision"
        onError={e => e.target.style.display='none'}
        style={{ width: '120px', marginTop: '60px', opacity: 0.8 }}
      />
    </div>
  )
}
