import { Home, BedDouble, Calendar, DollarSign, Menu } from 'lucide-react'

const onglets = [
  { id: 'dashboard', label: 'Accueil', icone: Home },
  { id: 'chambres', label: 'Chambres', icone: BedDouble },
  { id: 'sejours', label: 'Séjours', icone: Calendar },
  { id: 'caisse', label: 'Caisse', icone: DollarSign },
  { id: 'menu', label: 'Menu', icone: Menu },
]

export default function NavBar({ onglet, setOnglet }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px',
      background: 'white',
      borderTop: '1px solid #E0E0E0',
      display: 'flex',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      zIndex: 100
    }}>
      {onglets.map(o => {
        const Icone = o.icone
        const actif = onglet === o.id
        return (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{
            flex: 1, padding: '10px 4px 8px',
            background: 'none', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: '4px',
            color: actif ? '#1B3A6B' : '#999',
            borderTop: actif ? '3px solid #C9A84C' : '3px solid transparent',
          }}>
            <Icone size={22} />
            <span style={{ fontSize: '10px', fontWeight: actif ? '600' : '400' }}>
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
