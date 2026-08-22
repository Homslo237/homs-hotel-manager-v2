import { useState } from 'react'
import { Search, X, AlertTriangle, Sparkles, CheckCircle, User, Phone, Clock, Moon } from 'lucide-react'

// ─── Données chambres ─────────────────────────────────────────────────────────
const chambresInitiales = [
  { num:'101', cat:'Standard', statut:'libre',     tarifNuit:25000, tarifHeure:2500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
  { num:'102', cat:'Standard', statut:'occupee',   tarifNuit:25000, tarifHeure:2500,  client:'M. Dupont',  telephone:'+225 07 11 22 33', heureDepart:'12:00', dateDepart:'23/08/2026' },
  { num:'103', cat:'Standard', statut:'nettoyage', tarifNuit:25000, tarifHeure:2500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
  { num:'104', cat:'Standard', statut:'libre',     tarifNuit:25000, tarifHeure:2500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
  { num:'201', cat:'Confort',  statut:'occupee',   tarifNuit:35000, tarifHeure:3500,  client:'Mme Kouassi',telephone:'+225 05 44 55 66', heureDepart:'14:00', dateDepart:'24/08/2026' },
  { num:'202', cat:'Confort',  statut:'libre',     tarifNuit:35000, tarifHeure:3500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
  { num:'203', cat:'Confort',  statut:'occupee',   tarifNuit:35000, tarifHeure:3500,  client:'M. Mbeki',   telephone:'+225 01 77 88 99', heureDepart:'11:00', dateDepart:'22/08/2026' },
  { num:'204', cat:'Confort',  statut:'probleme',  tarifNuit:35000, tarifHeure:3500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null, probleme:'Climatisation en panne' },
  { num:'205', cat:'Confort',  statut:'occupee',   tarifNuit:35000, tarifHeure:3500,  client:'M. Kouassi Ama', telephone:'+225 07 00 11 22', heureDepart:'12:00', dateDepart:'24/08/2026' },
  { num:'301', cat:'Suite',    statut:'libre',     tarifNuit:65000, tarifHeure:6500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
  { num:'302', cat:'Suite',    statut:'occupee',   tarifNuit:65000, tarifHeure:6500,  client:'M. Bamba',   telephone:'+225 07 55 66 77', heureDepart:'15:30', dateDepart:'22/08/2026' },
  { num:'303', cat:'Suite',    statut:'nettoyage', tarifNuit:65000, tarifHeure:6500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
  { num:'304', cat:'Suite',    statut:'libre',     tarifNuit:65000, tarifHeure:6500,  client:null,         telephone:null,         heureDepart:null,  dateDepart:null },
]

const statuts = {
  libre:     { label:'Libre',     couleur:'#2ECC71', bg:'#F0FFF4' },
  occupee:   { label:'Occupée',   couleur:'#1B3A6B', bg:'#EEF2FF' },
  nettoyage: { label:'Nettoyage', couleur:'#C9A84C', bg:'#FFFBF0' },
  probleme:  { label:'Problème',  couleur:'#E74C3C', bg:'#FFF5F5' },
}

const iconeStatut = { libre: CheckCircle, occupee: User, nettoyage: Sparkles, probleme: AlertTriangle }

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

// ─── Modal détail chambre ─────────────────────────────────────────────────────
function ModalChambre({ chambre, onClose, onChangerStatut }) {
  const [nouveauStatut, setNouveauStatut] = useState(chambre.statut)
  const [noteProblem, setNoteProblem] = useState(chambre.probleme || '')
  const s = statuts[chambre.statut]

  const handleValider = () => {
    onChangerStatut(chambre.num, nouveauStatut, noteProblem)
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'85vh', overflowY:'auto', padding:'20px 20px 40px' }}>

        {/* En-tête */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <div>
            <span style={{ color:'#C9A84C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>CHAMBRE</span>
            <h2 style={{ fontSize:'28px', fontWeight:'800', color:'#1B3A6B' }}>N° {chambre.num}</h2>
            <span style={{ fontSize:'13px', color:'#888' }}>{chambre.cat}</span>
          </div>
          <button onClick={onClose} style={{ background:'#F0F0F0', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="#666"/>
          </button>
        </div>

        {/* Statut actuel */}
        <div style={{ background:s.bg, borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', border:`1px solid ${s.couleur}`, display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'10px', height:'10px', borderRadius:'5px', background:s.couleur }}/>
          <span style={{ fontWeight:'700', color:s.couleur }}>Statut actuel : {s.label}</span>
        </div>

        {/* Infos client si occupée */}
        {chambre.statut === 'occupee' && chambre.client && (
          <div style={{ background:'#F8F9FA', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' }}>
            <div style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B', marginBottom:'10px' }}>👤 Client en cours</div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', fontSize:'13px' }}>
              <User size={14} color="#666"/>
              <span style={{ fontWeight:'600' }}>{chambre.client}</span>
            </div>
            {chambre.telephone && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', fontSize:'13px', color:'#666' }}>
                <Phone size={14} color="#666"/>
                <span>{chambre.telephone}</span>
              </div>
            )}
            {chambre.dateDepart && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#666' }}>
                <Moon size={14} color="#666"/>
                <span>Départ prévu : {chambre.dateDepart} à {chambre.heureDepart}</span>
              </div>
            )}
          </div>
        )}

        {/* Note problème si problème */}
        {chambre.statut === 'probleme' && chambre.probleme && (
          <div style={{ background:'#FFF5F5', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #E74C3C' }}>
            <div style={{ fontWeight:'700', fontSize:'13px', color:'#E74C3C', marginBottom:'6px' }}>⚠️ Problème signalé</div>
            <div style={{ fontSize:'13px', color:'#666' }}>{chambre.probleme}</div>
          </div>
        )}

        {/* Tarifs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          <div style={{ background:'#F8F9FA', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>🌙 Tarif / nuit</div>
            <div style={{ fontSize:'16px', fontWeight:'800', color:'#C9A84C' }}>{chambre.tarifNuit.toLocaleString('fr-FR')}</div>
            <div style={{ fontSize:'10px', color:'#888' }}>FCFA</div>
          </div>
          <div style={{ background:'#F8F9FA', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>⏱️ Tarif / heure</div>
            <div style={{ fontSize:'16px', fontWeight:'800', color:'#C9A84C' }}>{chambre.tarifHeure.toLocaleString('fr-FR')}</div>
            <div style={{ fontSize:'10px', color:'#888' }}>FCFA</div>
          </div>
        </div>

        {/* Changer le statut */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Changer le statut</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {Object.entries(statuts).map(([key, val]) => (
              <button key={key} onClick={() => setNouveauStatut(key)} style={{
                padding:'10px', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor:'pointer',
                border: nouveauStatut === key ? `2px solid ${val.couleur}` : '2px solid #E0E0E0',
                background: nouveauStatut === key ? val.bg : 'white',
                color: nouveauStatut === key ? val.couleur : '#666',
              }}>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note si problème */}
        {nouveauStatut === 'probleme' && (
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Description du problème</label>
            <textarea value={noteProblem} onChange={e => setNoteProblem(e.target.value)}
              placeholder="Ex. Climatisation en panne, robinet qui fuit..."
              rows={3} style={{ ...inputStyle, resize:'none' }}/>
          </div>
        )}

        <button onClick={handleValider} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px'
        }}>
          ✅ Mettre à jour la chambre
        </button>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Chambres() {
  const [chambres, setChambres] = useState(chambresInitiales)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [vue, setVue] = useState('grille') // grille | liste
  const [chambreSelectee, setChambreSelectee] = useState(null)

  const filtrees = chambres.filter(c => {
    const matchR = c.num.includes(recherche) ||
      c.cat.toLowerCase().includes(recherche.toLowerCase()) ||
      (c.client || '').toLowerCase().includes(recherche.toLowerCase())
    const matchF = filtre === 'tous' || c.statut === filtre
    return matchR && matchF
  })

  // Stats
  const stats = {
    libre:     chambres.filter(c=>c.statut==='libre').length,
    occupee:   chambres.filter(c=>c.statut==='occupee').length,
    nettoyage: chambres.filter(c=>c.statut==='nettoyage').length,
    probleme:  chambres.filter(c=>c.statut==='probleme').length,
  }

  const handleChangerStatut = (num, nouveauStatut, note) => {
    setChambres(prev => prev.map(c =>
      c.num === num
        ? { ...c, statut: nouveauStatut, probleme: nouveauStatut === 'probleme' ? note : null,
            client: nouveauStatut !== 'occupee' ? null : c.client,
            telephone: nouveauStatut !== 'occupee' ? null : c.telephone }
        : c
    ))
  }

  return (
    <div style={{ paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Chambres</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>
          {chambres.length} chambres · {stats.occupee} occupées · {stats.libre} libres
        </p>
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* Résumé 4 cases */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px' }}>
          {Object.entries(statuts).map(([key, val]) => {
            const Icone = iconeStatut[key]
            return (
              <button key={key} onClick={() => setFiltre(key === filtre ? 'tous' : key)}
                style={{
                  background: filtre === key ? val.couleur : 'white',
                  borderRadius:'12px', padding:'10px 6px', textAlign:'center',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:'none', cursor:'pointer',
                  borderTop: `3px solid ${val.couleur}`
                }}>
                <div style={{ fontSize:'18px', fontWeight:'800', color: filtre === key ? 'white' : val.couleur }}>{stats[key]}</div>
                <div style={{ fontSize:'9px', fontWeight:'600', color: filtre === key ? 'rgba(255,255,255,0.85)' : '#888', marginTop:'2px' }}>{val.label}</div>
              </button>
            )
          })}
        </div>

        {/* Recherche + vue */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#999' }}/>
            <input value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher..."
              style={{ width:'100%', padding:'11px 12px 11px 36px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
          </div>
          <button onClick={() => setVue(vue==='grille'?'liste':'grille')} style={{
            padding:'0 14px', borderRadius:'10px', border:'2px solid #E0E0E0',
            background:'white', cursor:'pointer', fontWeight:'700', fontSize:'13px', color:'#666'
          }}>
            {vue === 'grille' ? '☰' : '⊞'}
          </button>
        </div>

        {/* Filtres statut */}
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', marginBottom:'16px', paddingBottom:'4px' }}>
          <button onClick={() => setFiltre('tous')} style={{
            padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer',
            background: filtre==='tous' ? '#1B3A6B' : '#F0F0F0',
            color: filtre==='tous' ? 'white' : '#666',
          }}>Tous ({chambres.length})</button>
          {Object.entries(statuts).map(([key, val]) => (
            <button key={key} onClick={() => setFiltre(key)} style={{
              padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer',
              background: filtre===key ? val.couleur : '#F0F0F0',
              color: filtre===key ? 'white' : '#666',
            }}>{val.label} ({stats[key]})</button>
          ))}
        </div>

        {/* ── VUE GRILLE ── */}
        {vue === 'grille' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {filtrees.map(c => {
              const s = statuts[c.statut]
              const Icone = iconeStatut[c.statut]
              return (
                <div key={c.num} onClick={() => setChambreSelectee(c)}
                  style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:`4px solid ${s.couleur}`, cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'22px', fontWeight:'800', color:'#1B3A6B' }}>{c.num}</span>
                    <div style={{ background:s.bg, borderRadius:'8px', padding:'4px 6px' }}>
                      <Icone size={14} color={s.couleur}/>
                    </div>
                  </div>
                  <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{c.cat}</div>
                  {c.client && (
                    <div style={{ fontSize:'12px', color:'#333', fontWeight:'600', marginBottom:'4px' }}>
                      👤 {c.client}
                    </div>
                  )}
                  {c.probleme && (
                    <div style={{ fontSize:'11px', color:'#E74C3C', marginBottom:'4px' }}>
                      ⚠️ {c.probleme}
                    </div>
                  )}
                  <div style={{ fontSize:'12px', color:'#C9A84C', fontWeight:'700', marginTop:'6px' }}>
                    {c.tarifNuit.toLocaleString('fr-FR')} F/nuit
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── VUE LISTE ── */}
        {vue === 'liste' && (
          <div>
            {filtrees.map(c => {
              const s = statuts[c.statut]
              const Icone = iconeStatut[c.statut]
              return (
                <div key={c.num} onClick={() => setChambreSelectee(c)}
                  style={{ background:'white', borderRadius:'12px', padding:'14px 16px', marginBottom:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:`4px solid ${s.couleur}`, display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'15px', fontWeight:'800', color:s.couleur }}>{c.num}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>Chambre {c.num}</span>
                      <span style={{ background:s.couleur, color:'white', fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'10px' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>{c.cat} · {c.tarifNuit.toLocaleString('fr-FR')} F/nuit</div>
                    {c.client && <div style={{ fontSize:'12px', color:'#333', fontWeight:'600', marginTop:'2px' }}>👤 {c.client}</div>}
                    {c.probleme && <div style={{ fontSize:'11px', color:'#E74C3C', marginTop:'2px' }}>⚠️ {c.probleme}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtrees.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#999' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🏨</div>
            <p>Aucune chambre trouvée</p>
          </div>
        )}
      </div>

      {chambreSelectee && (
        <ModalChambre
          chambre={chambreSelectee}
          onClose={() => setChambreSelectee(null)}
          onChangerStatut={handleChangerStatut}
        />
      )}
    </div>
  )
              }
              
