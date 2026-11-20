import { Home, BedDouble, Plus, DollarSign, Menu } from 'lucide-react'

// ─── Onglets (sans Séjours — remplacé par le bouton +) ───────────────────────
const ONGLETS = [
  { id: 'dashboard', label: 'Accueil',  icone: Home      },
  { id: 'chambres',  label: 'Chambres', icone: BedDouble },
  { id: 'sejours',   label: null,       icone: Plus      }, // bouton central +
  { id: 'caisse',    label: 'Caisse',   icone: DollarSign},
  { id: 'menu',      label: 'Menu',     icone: Menu      },
]

// ─── Accès par rôle (même règle que dans App.jsx) ─────────────────────────────
const ACCES = {
  directeur:      ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  receptionniste: ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  caissier:       ['dashboard', 'caisse', 'menu'],
}

const NOMS_ROLES = { directeur: 'Directeur', receptionniste: 'Réceptionniste', caissier: 'Caissier' }

// Sur téléphone : barre fixe en bas de l'écran.
// Sur ordinateur (écran de 900 px et plus) : menu latéral à gauche. Les règles sont dans index.css (classes « homs-nav… »).
export default function NavBar({ onglet, setOnglet, role, onAjouterSejour }) {
  const accesRole = ACCES[role] || ACCES.receptionniste

  return (
    <div className="homs-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white',
      borderTop: '1px solid #E0E0E0',
      display: 'flex',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      zIndex: 90, // sous les fenêtres (formulaires, reçus, passation) qui, elles, sont à 100 et plus
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* Marque : visible seulement sur ordinateur */}
      <div className="homs-nav-marque">
        <img src="/logo-homs.png" alt="" style={{ height: '34px', display: 'block', marginBottom: '8px' }} onError={e => { e.target.style.display = 'none' }}/>
        <div style={{ color: '#C9A84C', fontWeight: '900', fontSize: '13px', letterSpacing: '2px' }}>HOMS-HÔTEL</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '2px', marginTop: '2px' }}>UNE VISION D'ENSEMBLE</div>
      </div>

      {ONGLETS.map(o => {
        const Icone = o.icone

        // ── Bouton central "+" (réservé aux rôles qui peuvent créer un séjour) ──
        if (o.id === 'sejours') {
          if (!accesRole.includes('sejours')) return null
          return (
            <button
              key="plus"
              className="homs-nav-plus"
              onClick={() => {
                // Va sur l'onglet séjours ET ouvre le formulaire
                setOnglet('sejours')
                if (onAjouterSejour) onAjouterSejour()
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0',
                position: 'relative',
              }}
            >
              <div className="homs-nav-cercle" style={{
                width: '52px', height: '52px', borderRadius: '26px',
                background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(27,58,107,0.45)',
                marginTop: '-20px', // Déborde légèrement au-dessus de la NavBar
                border: '3px solid white',
              }}>
                <Icone size={24} color="white" />
              </div>
              <span className="homs-nav-texte-mobile" style={{
                fontSize: '10px', fontWeight: '600',
                color: '#1B3A6B', marginTop: '2px'
              }}>
                Séjour
              </span>
              <span className="homs-nav-texte-ordi">Nouveau séjour</span>
            </button>
          )
        }

        // ── Onglets normaux ──
        if (!accesRole.includes(o.id)) return null
        const actif = onglet === o.id

        return (
          <button
            key={o.id}
            className={`homs-nav-item${actif ? ' homs-nav-actif' : ''}`}
            aria-current={actif ? 'page' : undefined}
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
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icone size={22} />
              {actif && (
                <div className="homs-nav-point" style={{
                  position: 'absolute', top: '-2px', right: '-4px',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#C9A84C', border: '1.5px solid white',
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

      {/* Rôle connecté : visible seulement sur ordinateur */}
      <div className="homs-nav-pied">{NOMS_ROLES[role] || ''}</div>
    </div>
  )
}
