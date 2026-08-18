import { useState } from 'react'
import { Search } from 'lucide-react'

const chambres = [
  { num: '101', cat: 'Standard', statut: 'libre', tarif: '25 000' },
  { num: '102', cat: 'Standard', statut: 'occupee', client: 'M. Dupont', tarif: '25 000' },
  { num: '103', cat: 'Standard', statut: 'nettoyage', tarif: '25 000' },
  { num: '104', cat: 'Standard', statut: 'libre', tarif: '25 000' },
  { num: '201', cat: 'Confort', statut: 'occupee', client: 'Mme Kouassi', tarif: '35 000' },
  { num: '202', cat: 'Confort', statut: 'libre', tarif: '35 000' },
  { num: '203', cat: 'Confort', statut: 'occupee', client: 'M. Mbeki', tarif: '35 000' },
  { num: '204', cat: 'Confort', statut: 'probleme', tarif: '35 000' },
  { num: '301', cat: 'Suite', statut: 'libre', tarif: '65 000' },
  { num: '302', cat: 'Suite', statut: 'occupee', client: 'M. Bamba', tarif: '65 000' },
  { num: '303', cat: 'Suite', statut: 'nettoyage', tarif: '65 000' },
  { num: '304', cat: 'Suite', statut: 'libre', tarif: '65 000' },
]

const statuts = {
  libre: { label: 'Libre', couleur: '#2ECC71' },
  occupee: { label: 'Occupée', couleur: '#1B3A6B' },
  nettoyage: { label: 'Nettoyage', couleur: '#C9A84C' },
  probleme: { label: 'Problème', couleur: '#E74C3C' },
}

export default function Chambres() {
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')

  const filtrees = chambres.filter(c => {
    const matchRecherche = c.num.includes(recherche) ||
      c.cat.toLowerCase().includes(recherche.toLowerCase()) ||
      (c.client || '').toLowerCase().includes(recherche.toLowerCase())
    const matchFiltre = filtre === 'tous' || c.statut === filtre
    return matchRecherche && matchFiltre
  })

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        padding: '24px 20px 20px'
      }}>
        <h1 style={{ color: '#C9A84C', fontSize: '22px', fontWeight: '700' }}>
          Chambres
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>
          {chambres.length} chambres au total
        </p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: '#999'
          }} />
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher une chambre..."
            style={{
              width: '100%', padding: '12px 16px 12px 42px',
              border: '2px solid #E0E0E0', borderRadius: '10px',
              fontSize: '15px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
          {[['tous', 'Tous', '#1B3A6B'], ...Object.entries(statuts).map(([k, v]) => [k, v.label, v.couleur])].map(([val, lab, col]) => (
            <button key={val} onClick={() => setFiltre(val)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '600', whiteSpace: 'nowrap',
              background: filtre === val ? col : '#F0F0F0',
              color: filtre === val ? 'white' : '#666',
            }}>
              {lab}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filtrees.map((c, i) => {
            const s = statuts[c.statut]
            return (
              <div key={i} style={{
                background: 'white', borderRadius: '12px',
                padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                borderTop: `4px solid ${s.couleur}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#1B3A6B' }}>
                    {c.num}
                  </span>
                  <span style={{
                    background: s.couleur, color: 'white',
                    fontSize: '10px', fontWeight: '600',
                    padding: '3px 8px', borderRadius: '10px'
                  }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{c.cat}</div>
                {c.client && (
                  <div style={{ fontSize: '12px', color: '#333', marginTop: '4px', fontWeight: '500' }}>
                    {c.client}
                  </div>
                )}
                <div style={{ fontSize: '13px', color: '#C9A84C', fontWeight: '600', marginTop: '8px' }}>
                  {c.tarif} FCFA/nuit
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
