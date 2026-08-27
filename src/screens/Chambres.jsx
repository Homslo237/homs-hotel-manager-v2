import { useState, useEffect } from 'react'
import { Search, X, AlertTriangle, Sparkles, CheckCircle, User, Phone, Moon } from 'lucide-react'

// ─── Configuration des chambres (synchronisée avec Menu → Directeur) ──────────
// En Phase 2 : viendra de Firebase / localStorage
const CONFIG_CHAMBRES = {
  categories: [
    { nom: 'Standard', debut: 100, nombre: 20, tarifNuit: 25000, tarifHeure: 2500 },
    { nom: 'Confort',  debut: 200, nombre: 20, tarifNuit: 35000, tarifHeure: 3500 },
    { nom: 'Suite',    debut: 300, nombre: 10, tarifNuit: 65000, tarifHeure: 6500 },
  ]
}

// ─── Génération automatique des 50 chambres ───────────────────────────────────
function genererChambres(config) {
  const chambres = []
  // Quelques chambres avec données de test
  const donneesTest = {
    '102': { statut:'occupee',   client:'M. Dupont Jean',    telephone:'+225 07 11 22 33', dateDepart:'23/08/2026', heureDepart:'12:00' },
    '105': { statut:'nettoyage' },
    '108': { statut:'probleme',  probleme:'Robinet qui fuit' },
    '201': { statut:'occupee',   client:'Mme Kouassi Ama',   telephone:'+225 05 44 55 66', dateDepart:'24/08/2026', heureDepart:'12:00' },
    '203': { statut:'occupee',   client:'M. Mbeki Carlos',   telephone:'+225 01 77 88 99', dateDepart:'22/08/2026', heureDepart:'11:00' },
    '205': { statut:'occupee',   client:'M. Kouassi Ama',    telephone:'+225 07 00 11 22', dateDepart:'24/08/2026', heureDepart:'12:00' },
    '207': { statut:'nettoyage' },
    '210': { statut:'probleme',  probleme:'Climatisation en panne' },
    '215': { statut:'occupee',   client:'Mme Traoré Aïcha',  telephone:'+225 07 33 44 55', dateDepart:'25/08/2026', heureDepart:'12:00' },
    '301': { statut:'occupee',   client:'M. Bamba Seydou',   telephone:'+225 07 55 66 77', dateDepart:'22/08/2026', heureDepart:'15:30' },
    '303': { statut:'nettoyage' },
    '305': { statut:'occupee',   client:'Mme Diallo Fatou',  telephone:'+225 05 88 99 00', dateDepart:'23/08/2026', heureDepart:'10:00' },
  }

  config.categories.forEach(cat => {
    for (let i = 1; i <= cat.nombre; i++) {
      const num = String(cat.debut + i)
      const test = donneesTest[num] || {}
      chambres.push({
        num,
        cat: cat.nom,
        statut: test.statut || 'libre',
        tarifNuit: cat.tarifNuit,
        tarifHeure: cat.tarifHeure,
        client: test.client || null,
        telephone: test.telephone || null,
        dateDepart: test.dateDepart || null,
        heureDepart: test.heureDepart || null,
        probleme: test.probleme || null,
      })
    }
  })
  return chambres
}

// ─── Statuts ──────────────────────────────────────────────────────────────────
const statuts = {
  libre:     { label:'Libre',     couleur:'#2ECC71', bg:'#F0FFF4' },
  occupee:   { label:'Occupée',   couleur:'#1B3A6B', bg:'#EEF2FF' },
  nettoyage: { label:'Nettoyage', couleur:'#C9A84C', bg:'#FFFBF0' },
  probleme:  { label:'Problème',  couleur:'#E74C3C', bg:'#FFF5F5' },
}
const iconeStatut = { libre:CheckCircle, occupee:User, nettoyage:Sparkles, probleme:AlertTriangle }

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

// ─── Modal détail chambre ─────────────────────────────────────────────────────
function ModalChambre({ chambre, onClose, onChangerStatut }) {
  const [nouveauStatut, setNouveauStatut] = useState(chambre.statut)
  const [noteProblem, setNoteProblem] = useState(chambre.probleme || '')
  const s = statuts[chambre.statut]

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
          <span style={{ fontWeight:'700', color:s.couleur }}>Statut actuel : {s.label}</span>
        </div>

        {/* Infos client */}
        {chambre.statut==='occupee' && chambre.client && (
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
                <span>Départ : {chambre.dateDepart} à {chambre.heureDepart}</span>
              </div>
            )}
          </div>
        )}

        {/* Problème */}
        {chambre.statut==='probleme' && chambre.probleme && (
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

        {/* Changer statut */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Changer le statut</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {Object.entries(statuts).map(([key, val]) => (
              <button key={key} onClick={() => setNouveauStatut(key)} style={{
                padding:'10px', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor:'pointer',
                border: nouveauStatut===key ? `2px solid ${val.couleur}` : '2px solid #E0E0E0',
                background: nouveauStatut===key ? val.bg : 'white',
                color: nouveauStatut===key ? val.couleur : '#666',
              }}>{val.label}</button>
            ))}
          </div>
        </div>

        {nouveauStatut==='probleme' && (
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Description du problème</label>
            <textarea value={noteProblem} onChange={e=>setNoteProblem(e.target.value)}
              placeholder="Ex. Climatisation en panne, robinet qui fuit..."
              rows={3} style={{ ...inputStyle, resize:'none' }}/>
          </div>
        )}

        <button onClick={() => { onChangerStatut(chambre.num, nouveauStatut, noteProblem); onClose() }}
          style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px' }}>
          ✅ Mettre à jour la chambre
        </button>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Chambres({ chambres:chambresProps=[], chambresStats={}, onMajStats, onMajChambre }) {
  // Les 50 chambres viennent de App.jsx (dynamiques selon séjours réels)
  const [chambresLocales, setChambresLocales] = useState(chambresProps)

  // Synchroniser si les props changent
  useEffect(() => {
    if (chambresProps.length > 0) setChambresLocales(chambresProps)
  }, [chambresProps])
  const [recherche, setRecherche] = useState('')
  const [filtre,    setFiltre]    = useState('tous')
  const [filtrecat, setFiltrecat] = useState('tous')
  const [vue,       setVue]       = useState('grille')
  const [chambreSelectee, setChambreSelectee] = useState(null)

  const chambres = chambresLocales
  const total = chambres.length
  const stats = {
    libre:     chambres.filter(c=>c.statut==='libre').length,
    occupee:   chambres.filter(c=>c.statut==='occupee').length,
    nettoyage: chambres.filter(c=>c.statut==='nettoyage').length,
    probleme:  chambres.filter(c=>c.statut==='probleme').length,
  }
  const tauxOcc = Math.round((stats.occupee / total) * 100)

  const filtrees = chambres.filter(c => {
    const matchR = c.num.includes(recherche) ||
      c.cat.toLowerCase().includes(recherche.toLowerCase()) ||
      (c.client||'').toLowerCase().includes(recherche.toLowerCase())
    const matchF = filtre==='tous' || c.statut===filtre
    const matchC = filtrecat==='tous' || c.cat===filtrecat
    return matchR && matchF && matchC
  })

  const handleChangerStatut = (num, nouveauStatut, note) => {
    setChambresLocales(prev => prev.map(c =>
      c.num===num ? {
        ...c, statut:nouveauStatut,
        probleme: nouveauStatut==='probleme' ? note : null,
        client: nouveauStatut!=='occupee' ? null : c.client,
        telephone: nouveauStatut!=='occupee' ? null : c.telephone,
      } : c
    ))
    if (onMajChambre) onMajChambre(num, nouveauStatut, note)
  }

  return (
    <div style={{ paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Chambres</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>
          {total} chambres · {stats.occupee} occupées · {stats.libre} libres · {tauxOcc}% occupation
        </p>
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* 4 cases statuts cliquables */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'12px' }}>
          {Object.entries(statuts).map(([key, val]) => {
            const Icone = iconeStatut[key]
            return (
              <button key={key} onClick={() => setFiltre(filtre===key?'tous':key)} style={{
                background: filtre===key ? val.couleur : 'white',
                borderRadius:'12px', padding:'10px 4px', textAlign:'center',
                boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:'none', cursor:'pointer',
                borderTop:`3px solid ${val.couleur}`
              }}>
                <div style={{ fontSize:'18px', fontWeight:'800', color:filtre===key?'white':val.couleur }}>{stats[key]}</div>
                <div style={{ fontSize:'9px', fontWeight:'600', color:filtre===key?'rgba(255,255,255,0.85)':'#888', marginTop:'2px' }}>{val.label}</div>
              </button>
            )
          })}
        </div>

        {/* Filtre catégorie */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px', overflowX:'auto', paddingBottom:'4px' }}>
          <button onClick={()=>setFiltrecat('tous')} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer', background:filtrecat==='tous'?'#1B3A6B':'#F0F0F0', color:filtrecat==='tous'?'white':'#666' }}>
            Toutes
          </button>
          {config.categories.map(cat => (
            <button key={cat.nom} onClick={()=>setFiltrecat(filtrecat===cat.nom?'tous':cat.nom)} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer', background:filtrecat===cat.nom?'#1B3A6B':'#F0F0F0', color:filtrecat===cat.nom?'white':'#666' }}>
              {cat.nom} ({cat.nombre})
            </button>
          ))}
        </div>

        {/* Recherche + vue */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#999' }}/>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)}
              placeholder="N° chambre, client..."
              style={{ width:'100%', padding:'11px 12px 11px 36px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
          </div>
          <button onClick={()=>setVue(vue==='grille'?'liste':'grille')} style={{ padding:'0 14px', borderRadius:'10px', border:'2px solid #E0E0E0', background:'white', cursor:'pointer', fontWeight:'700', fontSize:'16px', color:'#666' }}>
            {vue==='grille' ? '☰' : '⊞'}
          </button>
        </div>

        <p style={{ fontSize:'12px', color:'#888', marginBottom:'12px' }}>
          {filtrees.length} chambre{filtrees.length>1?'s':''} affichée{filtrees.length>1?'s':''}
        </p>

        {/* Vue Grille */}
        {vue==='grille' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {filtrees.map(c => {
              const s = statuts[c.statut]
              const Icone = iconeStatut[c.statut]
              return (
                <div key={c.num} onClick={()=>setChambreSelectee(c)}
                  style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:`4px solid ${s.couleur}`, cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B' }}>{c.num}</span>
                    <div style={{ background:s.bg, borderRadius:'8px', padding:'4px 6px' }}>
                      <Icone size={14} color={s.couleur}/>
                    </div>
                  </div>
                  <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{c.cat}</div>
                  {c.client && <div style={{ fontSize:'12px', color:'#333', fontWeight:'600', marginBottom:'2px' }}>👤 {c.client.split(' ').pop()}</div>}
                  {c.probleme && <div style={{ fontSize:'11px', color:'#E74C3C' }}>⚠️ {c.probleme.substring(0,20)}...</div>}
                  <div style={{ fontSize:'11px', color:'#C9A84C', fontWeight:'700', marginTop:'6px' }}>
                    {c.tarifNuit.toLocaleString('fr-FR')} F/nuit
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
              const s = statuts[c.statut]
              return (
                <div key={c.num} onClick={()=>setChambreSelectee(c)}
                  style={{ background:'white', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${s.couleur}`, display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'14px', fontWeight:'800', color:s.couleur }}>{c.num}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>Ch. {c.num}</span>
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

        {filtrees.length===0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#999' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🏨</div>
            <p>Aucune chambre trouvée</p>
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
