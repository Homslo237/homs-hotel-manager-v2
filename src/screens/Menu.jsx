import { User, Hotel, Users, Wrench, BarChart2, BookOpen, Info, LogOut, ChevronRight } from 'lucide-react'

const menuItems = [
  {
    section: 'Gestion',
    items: [
      { icone: User, label: 'Mon profil', sous: 'Informations personnelles', couleur: '#1B3A6B' },
      { icone: Hotel, label: 'Mon établissement', sous: 'Paramètres de l\'hôtel', couleur: '#2C5282' },
      { icone: Users, label: 'Utilisateurs & rôles', sous: 'Gérer le personnel', couleur: '#1B3A6B' },
    ]
  },
  {
    section: 'Opérations',
    items: [
      { icone: Wrench, label: 'Maintenance', sous: 'Signalements et réparations', couleur: '#C9A84C' },
      { icone: BarChart2, label: 'Rapports', sous: 'Statistiques et exports', couleur: '#2ECC71' },
      { icone: BookOpen, label: 'Journal des opérations', sous: 'Historique des activités', couleur: '#1B3A6B' },
    ]
  },
  {
    section: 'À propos',
    items: [
      { icone: Info, label: 'À propos de HOMS', sous: 'Version 1.0 — Homslovision', couleur: '#E8634A' },
    ]
  },
]

export default function Menu({ onDeconnexion }) {
  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh', paddingBottom: '80px' }}>

      <div style={{
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        padding: '32px 20px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '36px',
          background: '#C9A84C', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px', fontSize: '28px', fontWeight: '700',
          color: 'white'
        }}>
          A
        </div>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
          Administrateur
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
          Hôtel HOMS · Gérant
        </div>
        <div style={{
          marginTop: '12px', background: 'rgba(201,168,76,0.2)',
          border: '1px solid #C9A84C', borderRadius: '20px',
          padding: '4px 16px', fontSize: '12px', color: '#C9A84C'
        }}>
          ✓ Accès administrateur
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>

        {menuItems.map((section, si) => (
          <div key={si} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '11px', fontWeight: '700', color: '#999',
              letterSpacing: '1px', textTransform: 'uppercase',
              marginBottom: '8px', paddingLeft: '4px'
            }}>
              {section.section}
            </div>

            <div style={{
              background: 'white', borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {section.items.map((item, ii) => {
                const Icone = item.icone
                return (
                  <div key={ii} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '14px 16px', gap: '14px',
                    borderBottom: ii < section.items.length - 1
                      ? '1px solid #F0F0F0' : 'none',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: item.couleur + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icone size={20} color={item.couleur} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                        {item.sous}
                      </div>
                    </div>
                    <ChevronRight size={16} color="#D1D5DB" />
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div
          onClick={onDeconnexion}
          style={{
            background: 'white', borderRadius: '16px',
            padding: '14px 16px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LogOut size={20} color="#E74C3C" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#E74C3C' }}>
              Se déconnecter
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Retour à l'écran de connexion
            </div>
          </div>
          <ChevronRight size={16} color="#D1D5DB" />
        </div>

        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <img
            src="/logo-homslovision-blanc.png"
            alt="Homslovision"
            style={{ height: '32px', opacity: 0.7 }}
            onError={e => e.target.style.display='none'}
          />
        </div>
      </div>
    </div>
  )
            }
