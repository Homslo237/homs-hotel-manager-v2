import { useState } from 'react'
import { Search, Plus, Calendar, LogIn, Clock } from 'lucide-react'

const sejours = [
  {
    id: 1, client: 'M. Kouassi Ama', chambre: '205',
    categorie: 'Confort', arrivee: '18/08/2026',
    depart: '21/08/2026', duree: '3 nuits', type: 'nuit',
    statut: 'en_cours', montant: '105 000'
  },
  {
    id: 2, client: 'Mme Diallo Fatou', chambre: '101',
    categorie: 'Standard', arrivee: '17/08/2026',
    depart: '19/08/2026', duree: '2 nuits', type: 'nuit',
    statut: 'en_cours', montant: '50 000'
  },
  {
    id: 3, client: 'M. Bamba Seydou', chambre: '302',
    categorie: 'Suite', arrivee: '18/08/2026',
    depart: '20/08/2026', duree: '2 nuits', type: 'nuit',
    statut: 'en_cours', montant: '130 000'
  },
  {
    id: 4, client: 'Mme Mbeki Grace', chambre: '104',
    categorie: 'Standard', arrivee: '19/08/2026',
    depart: '19/08/2026', duree: '3 heures', type: 'heure',
    statut: 'en_cours', montant: '7 500'
  },
  {
    id: 5, client: 'M. Nguessan Paul', chambre: '202',
    categorie: 'Confort', arrivee: '19/08/2026',
    depart: '19/08/2026', duree: '2 heures', type: 'heure',
    statut: 'en_cours', montant: '5 000'
  },
  {
    id: 6, client: 'Mme Traoré Aïcha', chambre: '103',
    categorie: 'Standard', arrivee: '19/08/2026',
    depart: '19/08/2026', duree: '1 heure', type: 'heure',
    statut: 'en_cours', montant: '2 500'
  },
  {
    id: 7, client: 'M. Dupont Jean', chambre: '201',
    categorie: 'Confort', arrivee: '16/08/2026',
    depart: '18/08/2026', duree: '2 nuits', type: 'nuit',
    statut: 'termine', montant: '70 000'
  },
]

const statuts = {
  en_cours: { label: 'En cours', couleur: '#2ECC71' },
  a_venir: { label: 'À venir', couleur: '#C9A84C' },
  termine: { label: 'Terminé', couleur: '#999' },
}

export default function Sejours() {
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [typeFiltre, setTypeFiltre] = useState('tous')

  const filtres = [
    { id: 'tous', label: 'Tous' },
    { id: 'en_cours', label: 'En cours' },
    { id: 'a_venir', label: 'À venir' },
    { id: 'termine', label: 'Terminés' },
  ]

  const filtres_sejours = sejours.filter(s => {
    const matchRecherche = s.client.toLowerCase().includes(recherche.toLowerCase()) ||
      s.chambre.includes(recherche)
    const matchFiltre = filtre === 'tous' || s.statut === filtre
    const matchType = typeFiltre === 'tous' || s.type === typeFiltre
    return matchRecherche && matchFiltre && matchType
  })

  const enCours = sejours.filter(s => s.statut === 'en_cours').length
  const parHeure = sejours.filter(s => s.type === 'heure' && s.statut === 'en_cours').length
  const parNuit = sejours.filter(s => s.type === 'nuit' && s.statut === 'en_cours').length

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        padding: '24px 20px 20px'
      }}>
        <h1 style={{ color: '#C9A84C', fontSize: '22px', fontWeight: '700' }}>
          Séjours
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>
          {enCours} en cours · {parHeure} à l'heure · {parNuit} à la nuit
        </p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: '#2ECC71', borderRadius: '12px',
            padding: '14px', color: 'white', textAlign: 'center'
          }}>
            <LogIn size={20} style={{ marginBottom: '4px' }} />
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{parNuit}</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>À la nuit</div>
          </div>
          <div style={{
            background: '#E8634A', borderRadius: '12px',
            padding: '14px', color: 'white', textAlign: 'center'
          }}>
            <Clock size={20} style={{ marginBottom: '4px' }} />
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{parHeure}</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>À l'heure</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {['tous', 'nuit', 'heure'].map(t => (
            <button key={t} onClick={() => setTypeFiltre(t)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              fontWeight: '600',
              background: typeFiltre === t ? '#E8634A' : '#F0F0F0',
              color: typeFiltre === t ? 'white' : '#666',
            }}>
              {t === 'tous' ? 'Tous types' : t === 'nuit' ? '🌙 Nuit' : '⏱️ Heure'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={18} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: '#999'
          }} />
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher un client ou chambre..."
            style={{
              width: '100%', padding: '12px 16px 12px 42px',
              border: '2px solid #E0E0E0', borderRadius: '10px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
          {filtres.map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '600', whiteSpace: 'nowrap',
              background: filtre === f.id ? '#1B3A6B' : '#F0F0F0',
              color: filtre === f.id ? 'white' : '#666',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtres_sejours.map((s, i) => {
          const st = statuts[s.statut]
          return (
            <div key={i} style={{
              background: 'white', borderRadius: '12px',
              padding: '16px', marginBottom: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              borderLeft: `4px solid ${s.type === 'heure' ? '#E8634A' : st.couleur}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#1B3A6B' }}>
                  {s.client}
                </span>
                <span style={{
                  background: st.couleur, color: 'white',
                  fontSize: '10px', fontWeight: '600',
                  padding: '3px 8px', borderRadius: '10px'
                }}>
                  {st.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span>🏨 Ch. {s.chambre}</span>
                <span>📋 {s.categorie}</span>
                <span>{s.type === 'heure' ? '⏱️' : '🌙'} {s.duree}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#999' }}>
                  {s.arrivee} → {s.depart}
                </span>
                <span style={{ color: '#C9A84C', fontWeight: '700' }}>
                  {s.montant} FCFA
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button style={{
        position: 'fixed', bottom: '80px', right: '20px',
        width: '56px', height: '56px', borderRadius: '28px',
        background: '#1B3A6B', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(27,58,107,0.4)',
        zIndex: 50
      }}>
        <Plus size={24} />
      </button>
    </div>
  )
}
