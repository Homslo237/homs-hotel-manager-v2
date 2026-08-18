import { Home, Users, AlertTriangle, Briefcase } from 'lucide-react'

const stats = [
  { label: 'Disponibles', valeur: 8, couleur: '#2ECC71', icone: Home },
  { label: 'Occupées', valeur: 12, couleur: '#1B3A6B', icone: Briefcase },
  { label: 'À nettoyer', valeur: 3, couleur: '#C9A84C', icone: Users },
  { label: 'Problèmes', valeur: 1, couleur: '#E74C3C', icone: AlertTriangle },
]

const arrivees = [
  { nom: 'M. Dupont Jean', chambre: '101', heure: '14h00' },
  { nom: 'Mme Kouassi Ama', chambre: '205', heure: '15h30' },
  { nom: 'M. Mbeki Carlos', chambre: '312', heure: '18h00' },
]

const departs = [
  { nom: 'Mme Diallo Fatou', chambre: '108', heure: '11h00' },
  { nom: 'M. Bamba Seydou', chambre: '214', heure: '12h00' },
]

export default function Dashboard() {
  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        padding: '24px 20px 20px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
          Bonjour 👋
        </p>
        <h1 style={{ color: '#C9A84C', fontSize: '22px', fontWeight: '700' }}>
          Tableau de bord
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>
          UNE VISION D'ENSEMBLE
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {stats.map((s, i) => {
            const Icone = s.icone
            return (
              <div key={i} style={{
                background: s.couleur, borderRadius: '12px',
                padding: '16px', color: 'white'
              }}>
                <Icone size={24} style={{ marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{s.valeur}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{
          background: '#F8F9FA', borderRadius: '12px',
          padding: '16px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>CA du jour</span>
            <span style={{ color: '#1B3A6B', fontWeight: '700' }}>485 000 FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>Taux d'occupation</span>
            <span style={{ color: '#2ECC71', fontWeight: '700' }}>75%</span>
          </div>
        </div>

        <h3 style={{ color: '#1B3A6B', fontWeight: '600', marginBottom: '12px' }}>
          Arrivées du jour
        </h3>
        {arrivees.map((a, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '10px',
            padding: '14px 16px', marginBottom: '8px',
            borderLeft: '4px solid #2ECC71',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.nom}</div>
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              Chambre {a.chambre} · {a.heure}
            </div>
          </div>
        ))}

        <h3 style={{ color: '#1B3A6B', fontWeight: '600', margin: '16px 0 12px' }}>
          Départs du jour
        </h3>
        {departs.map((d, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '10px',
            padding: '14px 16px', marginBottom: '8px',
            borderLeft: '4px solid #E8634A',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{d.nom}</div>
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              Chambre {d.chambre} · {d.heure}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
