import { useState, useEffect } from 'react'
import { Search, X, AlertTriangle, Sparkles, CheckCircle, User, Phone, Moon } from 'lucide-react'

// ─── Statuts ──────────────────────────────────────────────────────────────────
const statuts = {
  libre:     { label:'Libre',     couleur:'#2ECC71', bg:'#F0FFF4', bgSombre:'#0F2818' },
  occupee:   { label:'Occupee',   couleur:'#1B3A6B', bg:'#EEF2FF', bgSombre:'#1A2744' },
  a_venir:   { label:'A venir',    couleur:'#8B5CF6', bg:'#F5F3FF', bgSombre:'#2A1F44' },
  nettoyage: { label:'Nettoyage', couleur:'#C9A84C', bg:'#FFFBF0', bgSombre:'#2E2711' },
  probleme:  { label:'Probleme',  couleur:'#E74C3C', bg:'#FFF5F5', bgSombre:'#2E1414' },
}
const iconeStatut = {
  libre:     CheckCircle,
  occupee:   User,
  a_venir:   User,
  nettoyage: Sparkles,
  probleme:  AlertTriangle,
}

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

// ─── Modal détail chambre ─────────────────────────────────────────────────────
function ModalChambre({ chambre, onClose, onChangerStatut }) {
  const [nouveauStatut, setNouveauStatut] = useState(chambre.statut)
  const [noteProblem,   setNoteProblem]   = useState(chambre.probleme || '')
  const s = statuts[chambre.statut] || statuts.libre

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'85vh', overflowY:'auto', padding:'20px 20px 40px' }}>

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
          <span style={{ fontWeight:'700', color:s.couleur }}>Statut : {s.label}</span>
        </div>

        {/* Infos client */}
        {(chambre.statut==='occupee'||chambre.statut==='a_venir') && chambre.client && (
          <div style={{ background:'#F8F9FA', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' }}>
            <div style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B', marginBottom:'10px' }}>
              {chambre.statut==='a_venir' ? '📅 Reservation' : '👤 Client en cours'}
            </div>
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
                <span>Depart : {chambre.dateDepart} a {chambre.heureDepart}</span>
              </div>
            )}
          </div>
        )}

        {/* Problème */}
        {chambre.statut==='probleme' && chambre.probleme && (
          <div style={{ background:'#FFF5F5', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #E74C3C' }}>
            <div style={{ fontWeight:'700', fontSize:'13px', color:'#E74C3C', marginBottom:'6px' }}>Probleme signale</div>
            <div style={{ fontSize:'13px', color:'#666' }}>{chambre.probleme}</div>
          </div>
        )}

        {/* Tarifs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          <div style={{ background:'#F8F9FA', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>Nuit</div>
            <div style={{ fontSize:'16px', fontWeight:'800', color:'#C9A84C' }}>{(chambre.tarifNuit||0).toLocaleString('fr-FR')}</div>
            <div style={{ fontSize:'10px', color:'#888' }}>FCFA</div>
          </div>
          <div style={{ background:'#F8F9FA', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>Heure</div>
            <div style={{ fontSize:'16px', fontWeight:'800', color:'#C9A84C' }}>{(chambre.tarifHeure||0).toLocaleString('fr-FR')}</div>
            <div style={{ fontSize:'10px', color:'#888' }}>FCFA</div>
          </div>
        </div>

        {/* Changer statut — seulement pour nettoyage et problème manuellement */}
        {(chambre.statut !== 'occupee' && chambre.statut !== 'a_venir') && (
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Changer le statut</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {Object.entries(statuts).filter(([k])=>k!=='occupee'&&k!=='a_venir').map(([key, val]) => (
                <button key={key} onClick={() => setNouveauStatut(key)} style={{
                  padding:'10px', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor:'pointer',
                  border: nouveauStatut===key ? `2px solid ${val.couleur}` : '2px solid #E0E0E0',
                  background: nouveauStatut===key ? val.bg : 'white',
                  color: nouveauStatut===key ? val.couleur : '#666',
                }}>{val.label}</button>
              ))}
            </div>
          </div>
        )}

        {nouveauStatut==='probleme' && (
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Description du probleme</label>
            <textarea value={noteProblem} onChange={e=>setNoteProblem(e.target.value)}
              placeholder="Ex. Climatisation en panne..." rows={3} style={{ ...inputStyle, resize:'none' }}/>
          </div>
        )}

        <button onClick={() => { onChangerStatut(chambre.num, nouveauStatut, noteProblem); onClose() }}
          style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px' }}>
          Mettre a jour
        </button>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Chambres({ chambres:chambresProps=[], chambresStats={total:50,disponibles:37,occupees:8,nettoyer:3,problemes:2}, onMajStats, onMajChambre, sombre=false }) {
  const [chambres,         setChambres]         = useState([])
  const [recherche,        setRecherche]        = useState('')
  const [filtre,           setFiltre]           = useState('tous')
  const [filtrecat,        setFiltrecat]        = useState('tous')
  const [vue,              setVue]              = useState('grille')
  const [chambreSelectee,  setChambreSelectee]  = useState(null)

  // Synchroniser avec App.jsx
  useEffect(() => {
    if (chambresProps && chambresProps.length > 0) {
      setChambres(chambresProps)
    }
  }, [chambresProps])

  const total    = chambres.length || chambresStats.total || 50
  const stats = {
    libre:     chambres.filter(c=>c.statut==='libre').length,
    occupee:   chambres.filter(c=>c.statut==='occupee').length,
    a_venir:   chambres.filter(c=>c.statut==='a_venir').length,
    nettoyage: chambres.filter(c=>c.statut==='nettoyage').length,
    probleme:  chambres.filter(c=>c.statut==='probleme').length,
  }

  const categories = [...new Set(chambres.map(c=>c.cat))].filter(Boolean)

  const filtrees = chambres.filter(c => {
    const matchR = (c.num||'').includes(recherche) ||
      (c.cat||'').toLowerCase().includes(recherche.toLowerCase()) ||
      (c.client||'').toLowerCase().includes(recherche.toLowerCase())
    const matchF = filtre==='tous' || c.statut===filtre
    const matchC = filtrecat==='tous' || c.cat===filtrecat
    return matchR && matchF && matchC
  })

  const handleChangerStatut = (num, nouveauStatut, note) => {
    setChambres(prev => prev.map(c =>
      c.num===num ? {
        ...c, statut:nouveauStatut,
        probleme: nouveauStatut==='probleme' ? note : null,
        client: nouveauStatut!=='occupee'&&nouveauStatut!=='a_venir' ? null : c.client,
      } : c
    ))
    if (onMajChambre) onMajChambre(num, nouveauStatut, note)
  }

  // ── Palette selon le thème ──
  const bg          = sombre ? '#0F172A' : '#F5F7FA'
  const cardBg       = sombre ? '#1E293B' : 'white'
  const cardShadow    = sombre ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)'
  const cardShadow2   = sombre ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)'
  const texteTitre    = sombre ? '#F1F5F9' : '#1B3A6B'
  const texteSecond   = sombre ? '#94A3B8' : '#888'
  const inputBg        = sombre ? '#1E293B' : 'white'
  const inputBorder    = sombre ? '#334155' : '#E0E0E0'
  const chipBg          = sombre ? '#1E293B' : '#F0F0F0'
  const chipTexte       = sombre ? '#94A3B8' : '#666'

  if (chambres.length === 0) {
    return (
      <div style={{ paddingBottom:'80px' }}>
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
          <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Chambres</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Chargement...</p>
        </div>
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#999' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏨</div>
          <p>Chargement des chambres...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom:'80px', background:bg, minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Chambres</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>
          {total} chambres · {stats.occupee} occupees · {stats.libre} libres · {stats.a_venir} reservees
        </p>
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* 5 cases statuts */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px', marginBottom:'12px' }}>
          {Object.entries(statuts).map(([key, val]) => (
            <button key={key} onClick={() => setFiltre(filtre===key?'tous':key)}
              style={{ background:filtre===key?val.couleur:cardBg, borderRadius:'10px', padding:'8px 4px', textAlign:'center', boxShadow:cardShadow, border:'none', cursor:'pointer', borderTop:`3px solid ${val.couleur}` }}>
              <div style={{ fontSize:'16px', fontWeight:'800', color:filtre===key?'white':val.couleur }}>{stats[key]||0}</div>
              <div style={{ fontSize:'8px', fontWeight:'600', color:filtre===key?'rgba(255,255,255,0.85)':texteSecond, marginTop:'2px' }}>{val.label}</div>
            </button>
          ))}
        </div>

        {/* Filtre catégorie */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px', overflowX:'auto', paddingBottom:'4px' }}>
          <button onClick={()=>setFiltrecat('tous')} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer', background:filtrecat==='tous'?'#1B3A6B':chipBg, color:filtrecat==='tous'?'white':chipTexte }}>
            Toutes
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={()=>setFiltrecat(filtrecat===cat?'tous':cat)} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer', background:filtrecat===cat?'#1B3A6B':chipBg, color:filtrecat===cat?'white':chipTexte }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Recherche + vue */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#999' }}/>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="N° chambre, client..."
              style={{ width:'100%', padding:'11px 12px 11px 36px', border:`2px solid ${inputBorder}`, borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', background:inputBg, color:texteTitre }}/>
          </div>
          <button onClick={()=>setVue(vue==='grille'?'liste':'grille')} style={{ padding:'0 14px', borderRadius:'10px', border:`2px solid ${inputBorder}`, background:inputBg, cursor:'pointer', fontWeight:'700', fontSize:'16px', color:chipTexte }}>
            {vue==='grille' ? '☰' : '⊞'}
          </button>
        </div>

        <p style={{ fontSize:'12px', color:texteSecond, marginBottom:'12px' }}>
          {filtrees.length} chambre{filtrees.length>1?'s':''} affichee{filtrees.length>1?'s':''}
        </p>

        {/* Vue Grille */}
        {vue==='grille' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {filtrees.map(c => {
              const s = statuts[c.statut] || statuts.libre
              const Icone = iconeStatut[c.statut] || CheckCircle
              return (
                <div key={c.num} onClick={()=>setChambreSelectee(c)}
                  style={{ background:cardBg, borderRadius:'12px', padding:'14px', boxShadow:cardShadow2, borderTop:`4px solid ${s.couleur}`, cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'20px', fontWeight:'800', color:texteTitre }}>{c.num}</span>
                    <div style={{ background: sombre ? s.bgSombre : s.bg, borderRadius:'8px', padding:'4px 6px' }}>
                      <Icone size={14} color={s.couleur}/>
                    </div>
                  </div>
                  <div style={{ fontSize:'11px', color:texteSecond, marginBottom:'4px' }}>{c.cat}</div>
                  {c.client && <div style={{ fontSize:'12px', color:texteTitre, fontWeight:'600', marginBottom:'2px' }}>👤 {c.client.split(' ').pop()}</div>}
                  {c.probleme && <div style={{ fontSize:'11px', color:'#E74C3C' }}>⚠️ {c.probleme.substring(0,20)}</div>}
                  <div style={{ fontSize:'11px', color:'#C9A84C', fontWeight:'700', marginTop:'6px' }}>
                    {(c.tarifNuit||0).toLocaleString('fr-FR')} F/nuit
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Vue Liste */}
        {vue==='liste' && (
          <div>
            {filtrees.map(c => {
              const s = statuts[c.statut] || statuts.libre
              return (
                <div key={c.num} onClick={()=>setChambreSelectee(c)}
                  style={{ background:cardBg, borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', boxShadow:cardShadow2, borderLeft:`4px solid ${s.couleur}`, display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background: sombre ? s.bgSombre : s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'14px', fontWeight:'800', color:s.couleur }}>{c.num}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:'700', fontSize:'14px', color:texteTitre }}>Ch. {c.num}</span>
                      <span style={{ background:s.couleur, color:'white', fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'10px' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize:'12px', color:texteSecond, marginTop:'2px' }}>{c.cat} · {(c.tarifNuit||0).toLocaleString('fr-FR')} F/nuit</div>
                    {c.client && <div style={{ fontSize:'12px', color:texteTitre, fontWeight:'600', marginTop:'2px' }}>👤 {c.client}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtrees.length===0 && chambres.length > 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:texteSecond }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🏨</div>
            <p>Aucune chambre trouvee</p>
          </div>
        )}
      </div>

      {chambreSelectee && (
        <ModalChambre
          chambre={chambreSelectee}
          onClose={()=>setChambreSelectee(null)}
          onChangerStatut={handleChangerStatut}
        />
      )}
    </div>
  )
}
