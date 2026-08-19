import { useState } from 'react'
import { DollarSign, TrendingUp, Clock, Moon, Smartphone, Banknote, CreditCard } from 'lucide-react'

const paiements = [
  {
    id: 1, client: 'M. Kouassi Ama', chambre: '205',
    type: 'nuit', duree: '3 nuits', montant: 105000,
    mode: 'mobile', heure: '08:30'
  },
  {
    id: 2, client: 'Mme Traoré Aïcha', chambre: '103',
    type: 'heure', duree: '1 heure', montant: 2500,
    mode: 'especes', heure: '09:15'
  },
  {
    id: 3, client: 'M. Nguessan Paul', chambre: '202',
    type: 'heure', duree: '2 heures', montant: 5000,
    mode: 'especes', heure: '10:45'
  },
  {
    id: 4, client: 'Mme Diallo Fatou', chambre: '101',
    type: 'nuit', duree: '2 nuits', montant: 50000,
    mode: 'mobile', heure: '11:20'
  },
  {
    id: 5, client: 'M. Bamba Seydou', chambre: '302',
    type: 'nuit', duree: '2 nuits', montant: 130000,
    mode: 'carte', heure: '14:00'
  },
  {
    id: 6, client: 'Mme Mbeki Grace', chambre: '104',
    type: 'heure', duree: '3 heures', montant: 7500,
    mode: 'especes', heure: '16:30'
  },
]

const modes = {
  especes: { label: 'Espèces', icone: Banknote, couleur: '#2ECC71' },
  mobile: { label: 'Mobile Money', icone: Smartphone, couleur: '#C9A84C' },
  carte: { label: 'Carte', icone: CreditCard, couleur: '#1B3A6B' },
}

export default function Caisse() {
  const [filtre, setFiltre] = useState('tous')

  const total = paiements.reduce((sum, p) => sum + p.montant, 0)
  const totalNuit = paiements.filter(p => p.type === 'nuit').reduce((sum, p) => sum + p.montant, 0)
  const totalHeure = paiements.filter(p => p.type === 'heure').reduce((sum, p) => sum + p.montant, 0)
  const totalEspeces = paiements.filter(p => p.mode === 'especes').reduce((sum, p) => sum + p.montant, 0)
  const totalMobile = paiements.filter(p => p.mode === 'mobile').reduce((sum, p) => sum + p.montant, 0)
  const totalCarte = paiements.filter(p => p.mode === 'carte').reduce((sum, p) => sum + p.montant, 0)

  const filtres_paiements = paiements.filter(p =>
    filtre === 'tous' || p.mode === filtre
  )

  const formatMontant = (n) => n.toLocaleString('fr-FR')

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        padding: '24px 20px 20px'
      }}>
        <h1 style={{ color: '#C9A84C', fontSize: '22px', fontWeight: '700' }}>
          Caisse
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>
          Encaissements du jour — {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div style={{ padding: '16px 20px' }}>

        {/* Total du jour */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
          borderRadius: '16px', padding: '20px',
          marginBottom: '16px', color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={18} color="#C9A84C" />
            <span style={{ fontSize: '13px', opacity: 0.8 }}>CA du jour</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#C9A84C' }}>
            {formatMontant(total)} FCFA
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '12px' }}>
            <span>🌙 Nuits : {formatMontant(totalNuit)}</span>
            <span>⏱️ Heures : {formatMontant(totalHeure)}</span>
          </div>
        </div>

        {/* Répartition par mode */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Espèces', montant: totalEspeces, couleur: '#2ECC71', icone: '💵' },
            { label: 'Mobile', montant: totalMobile, couleur: '#C9A84C', icone: '📱' },
            { label: 'Carte', montant: totalCarte, couleur: '#1B3A6B', icone: '💳' },
          ].map((m, i) => (
            <div key={i} style={{
              background: m.couleur, borderRadius: '12px',
              padding: '12px', color: 'white', textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{m.icone}</div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>
                {formatMontant(m.montant)}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Filtres mode de paiement */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          {[
            { id: 'tous', label: 'Tous' },
            { id: 'especes', label: '💵 Espèces' },
            { id: 'mobile', label: '📱 Mobile Money' },
            { id: 'carte', label: '💳 Carte' },
          ].map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              fontWeight: '600', whiteSpace: 'nowrap',
              background: filtre === f.id ? '#1B3A6B' : '#F0F0F0',
              color: filtre === f.id ? 'white' : '#666',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste des paiements */}
        <h3 style={{ color: '#1B3A6B', fontWeight: '600', marginBottom: '12px', fontSize: '15px' }}>
          Détail des encaissements
        </h3>

        {filtres_paiements.map((p, i) => {
          const mode = modes[p.mode]
          const Icone = mode.icone
          return (
            <div key={i} style={{
              background: 'white', borderRadius: '12px',
              padding: '14px 16px', marginBottom: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: mode.couleur + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icone size={18} color={mode.couleur} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1B3A6B' }}>
                  {p.client}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                  Ch. {p.chambre} · {p.duree} · {p.heure}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#C9A84C', fontSize: '14px' }}>
                  {formatMontant(p.montant)}
                </div>
                <div style={{ fontSize: '10px', color: mode.couleur, fontWeight: '600' }}>
                  {mode.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
