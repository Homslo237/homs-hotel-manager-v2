import { Home, BedDouble, Calendar, DollarSign, Menu } from 'lucide-react'

// ─── Tous les onglets disponibles ─────────────────────────────────────────────
const ONGLETS = [
  { id: 'dashboard', label: 'Accueil',  icone: Home       },
  { id: 'chambres',  label: 'Chambres', icone: BedDouble  },
  { id: 'sejours',   label: 'Séjours',  icone: Calendar   },
  { id: 'caisse',    label: 'Caisse',   icone: DollarSign },
  { id: 'menu',      label: 'Menu',     icone: Menu       },
]

// ─── Onglets visibles par rôle ────────────────────────────────────────────────
const ACCES = {
  directeur:      ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  receptionniste: ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  caissier:       ['dashboard', 'caisse', 'menu'],
}

export default function NavBar({ onglet, setOnglet, role }) {
  // Filtrer les onglets selon le rôle connecté
  const accesRole = ACCES[role] || ACCES.receptionniste
  const ongletsFiltres = ONGLETS.filter(o => accesRole.includes(o.id))

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px',
      background: 'white',
      borderTop: '1px solid #E0E0E0',
      display: 'flex',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)', // iPhone X+
    }}>
      {ongletsFiltres.map(o => {
        const Icone = o.icone
        const actif = onglet === o.id
        return (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            style={{
              flex: 1, padding: '10px 4px 8px',
              background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '4px',
              cursor: 'pointer',
              color: actif ? '#1B3A6B' : '#999',
              borderTop: actif ? '3px solid #C9A84C' : '3px solid transparent',
              transition: 'color 0.2s',
              position: 'relative',
            }}
          >
            {/* Icône avec point indicateur si actif */}
            <div style={{ position: 'relative' }}>
              <Icone size={22} />
              {actif && (
                <div style={{
                  position: 'absolute', top: '-2px', right: '-4px',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#C9A84C',
                  border: '1.5px solid white',
                }} />
              )}
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: actif ? '700' : '400',
              color: actif ? '#1B3A6B' : '#999',
            }}>
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
                  }
