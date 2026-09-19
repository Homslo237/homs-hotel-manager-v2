import { useState, useEffect } from 'react'
import { Search, X, AlertTriangle, Sparkles, CheckCircle, User, Phone, Moon, Wrench, Clock } from 'lucide-react'

// ─── Statuts ──────────────────────────────────────────────────────────────────
const statuts = {
  libre:      { label:'Libre',       couleur:'#2ECC71', bg:'#F0FFF4' },
  occupee:    { label:'Occupée',     couleur:'#1B3A6B', bg:'#EEF2FF' },
  a_venir:    { label:'À venir',     couleur:'#8B5CF6', bg:'#F5F3FF' },
  nettoyage:  { label:'Nettoyage',   couleur:'#C9A84C', bg:'#FFFBF0' },
  probleme:   { label:'Problème',    couleur:'#E74C3C', bg:'#FFF5F5' },
  hors_service:{ label:'Hors service', couleur:'#888',  bg:'#F5F5F5' },
}

const iconeStatut = {
  libre:        CheckCircle,
  occupee:      User,
  a_venir:      User,
  nettoyage:    Sparkles,
  probleme:     AlertTriangle,
  hors_service: Wrench,
}

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

// ─── Types de maintenance ─────────────────────────────────────────────────────
const typesMaintenance = [
  { id:'panne',       label:'Panne / Problème technique', emoji:'⚡', couleur:'#E74C3C', description:'Climatisation, plomberie, électricité...' },
  { id:'nettoyage',   label:'Nettoyage en cours',         emoji:'🧹', couleur:'#C9A84C', description:'Chambre en cours de nettoyage' },
  { id:'hors_service',label:'Hors service',               emoji:'🚫', couleur:'#888',    description:'Chambre bloquée jusqu\'à réparation' },
]

// ─── Modal Signalement Maintenance ───────────────────────────────────────────
function ModalMaintenance({ chambre, onClose, onSignaler, estDirecteur }) {
  const [type, setType]         = useState('panne')
  const [description, setDesc]  = useState('')
  const [bloquer, setBloquer]   = useState(false)

  const handleSignaler = () => {
    if (!description.trim()) { alert('Décrivez le problème.'); return }
    onSignaler({
      chambre: chambre.num,
      categorie: chambre.cat,
      type,
      description: description.trim(),
      bloquer: estDirecteur ? bloquer : false,
      date: new Date().toLocaleDateString('fr-FR'),
      heure: new Date().toTimeString().slice(0,5),
      statut: 'ouvert',
      id: Date.now(),
    })
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#E74C3C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>🔧 MAINTENANCE</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'4px' }}>Signaler un problème</h2>
        <p style={{ fontSize:'13px', color:'#888', marginBottom:'20px' }}>Chambre {chambre.num} · {chambre.cat}</p>

        {/* Type de signalement */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Type de signalement</label>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {typesMaintenance.map(t => (
              <button key={t.id} onClick={()=>setType(t.id)} style={{
                padding:'12px 14px', borderRadius:'12px', cursor:'pointer', textAlign:'left',
                border:type===t.id?`2px solid ${t.couleur}`:'2px solid #E0E0E0',
                background:type===t.id?t.couleur+'10':'white',
                display:'flex', alignItems:'center', gap:'12px'
              }}>
                <span style={{ fontSize:'22px' }}>{t.emoji}</span>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'13px', color:type===t.id?t.couleur:'#333' }}>{t.label}</div>
                  <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>{t.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Description <span style={{color:'red'}}>*</span></label>
          <textarea value={description} onChange={e=>setDesc(e.target.value)}
            placeholder="Ex. Le climatiseur ne fonctionne plus, fuite d'eau sous le lavabo..."
            rows={3} style={{ ...inputStyle, resize:'none', fontFamily:'inherit' }}/>
        </div>

        {/* Bloquer la chambre — Directeur seulement */}
        {estDirecteur && (
          <div style={{ marginBottom:'20px' }}>
            <div style={{ background:'#FFF8E1', border:'1px solid #C9A84C', borderRadius:'12px', padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>🔒 Bloquer la chambre</div>
                  <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>Empêche toute nouvelle réservation</div>
                </div>
                <button onClick={()=>setBloquer(!bloquer)} style={{
                  width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer',
                  background:bloquer?'#1B3A6B':'#E0E0E0', position:'relative', transition:'background 0.3s'
                }}>
                  <div style={{
                    width:'20px', height:'20px', borderRadius:'10px', background:'white',
                    position:'absolute', top:'3px', transition:'left 0.3s',
                    left:bloquer?'25px':'3px', boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
                  }}/>
                </button>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSignaler} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:'#E74C3C', color:'white', fontWeight:'800', fontSize:'15px'
        }}>
          🔧 Enregistrer le signalement
        </button>
      </div>
    </div>
  )
}

// ─── Modal Détail chambre ─────────────────────────────────────────────────────
function ModalChambre({ chambre, onClose, onChangerStatut, onSignalerMaintenance, estDirecteur, signalements=[] }) {
  const [nouveauStatut, setNouveauStatut] = useState(chambre.statut)
  const [noteProblem,   setNoteProblem]   = useState(chambre.probleme || '')
  const [showMaintenance, setShowMaintenance] = useState(false)
  const s = statuts[chambre.statut] || statuts.libre

  const signalementsActifs = signalements.filter(s => s.chambre === chambre.num && s.statut === 'ouvert')

  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
        <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px' }}>

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

          {/* Signalements actifs */}
          {signalementsActifs.length > 0 && (
            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>
                🔧 Signalements actifs ({signalementsActifs.length})
              </div>
              {signalementsActifs.map(sig => (
                <div key={sig.id} style={{ background:'#FFF5F5', border:'1px solid #E74C3C', borderRadius:'10px', padding:'10px 12px', marginBottom:'6px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontWeight:'700', fontSize:'12px', color:'#E74C3C' }}>
                      {typesMaintenance.find(t=>t.id===sig.type)?.emoji} {typesMaintenance.find(t=>t.id===sig.type)?.label}
                    </span>
                    <span style={{ fontSize:'11px', color:'#999' }}>{sig.date} {sig.heure}</span>
                  </div>
                  <div style={{ fontSize:'12px', color:'#666' }}>{sig.description}</div>
                  {estDirecteur && (
                    <button onClick={()=>{
                      onSignalerMaintenance({ ...sig, statut:'resolu' })
                    }} style={{ marginTop:'8px', padding:'4px 10px', borderRadius:'6px', border:'none', cursor:'pointer', background:'#E8F5E9', color:'#2ECC71', fontSize:'11px', fontWeight:'700' }}>
                      ✅ Marquer résolu
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Infos client */}
          {(chambre.statut==='occupee'||chambre.statut==='a_venir') && chambre.client && (
            <div style={{ background:'#F8F9FA', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' }}>
              <div style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B', marginBottom:'10px' }}>
                {chambre.statut==='a_venir' ? '📅 Réservation' : '👤 Client en cours'}
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
                  <span>Départ : {chambre.dateDepart} à {chambre.heureDepart}</span>
                </div>
              )}
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

          {/* Changer statut */}
          {(chambre.statut !== 'occupee' && chambre.statut !== 'a_venir') && (
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Changer le statut</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {Object.entries(statuts).filter(([k])=>k!=='occupee'&&k!=='a_venir'&&k!=='hors_service').map(([key, val]) => (
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
              <label style={labelStyle}>Description du problème</label>
              <textarea value={noteProblem} onChange={e=>setNoteProblem(e.target.value)}
                placeholder="Ex. Climatisation en panne..." rows={3} style={{ ...inputStyle, resize:'none' }}/>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <button onClick={() => { onChangerStatut(chambre.num, nouveauStatut, noteProblem); onClose() }}
              style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px' }}>
              Mettre à jour le statut
            </button>
            <button onClick={() => setShowMaintenance(true)}
              style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'2px solid #E74C3C', cursor:'pointer', background:'white', color:'#E74C3C', fontWeight:'800', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <Wrench size={16}/> Signaler maintenance
            </button>
          </div>
        </div>
      </div>

      {showMaintenance && (
        <ModalMaintenance
          chambre={chambre}
          estDirecteur={estDirecteur}
          onClose={() => setShowMaintenance(false)}
          onSignaler={(signalement) => {
            onSignalerMaintenance(signalement)
            if (signalement.bloquer) {
              onChangerStatut(chambre.num, 'hors_service', signalement.description)
            } else if (signalement.type === 'nettoyage') {
              onChangerStatut(chambre.num, 'nettoyage', '')
            } else if (signalement.type === 'panne') {
              onChangerStatut(chambre.num, 'probleme', signalement.description)
            }
          }}
        />
      )}
    </>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Chambres({ chambres:chambresProps=[], chambresStats={total:50,disponibles:37,occupees:8,nettoyer:3,problemes:2}, onMajStats, onMajChambre, utilisateur }) {
  const [chambres,        setChambres]        = useState([])
  const [recherche,       setRecherche]       = useState('')
  const [filtre,          setFiltre]          = useState('tous')
  const [filtrecat,       setFiltrecat]       = useState('tous')
  const [vue,             setVue]             = useState('grille')
  const [chambreSelectee, setChambreSelectee] = useState(null)
  const [signalements,    setSignalements]    = useState(() => {
    try { const s=localStorage.getItem('homs_maintenance'); return s?JSON.parse(s):[] } catch { return [] }
  })
  const [showMaintenanceListe, setShowMaintenanceListe] = useState(false)

  const estDirecteur = utilisateur?.role === 'directeur'

  useEffect(() => {
    if (chambresProps && chambresProps.length > 0) setChambres(chambresProps)
  }, [chambresProps])

  const sauvegarderSignalements = (liste) => {
    setSignalements(liste)
    try { localStorage.setItem('homs_maintenance', JSON.stringify(liste)) } catch {}
  }

  const handleSignalerMaintenance = (signalement) => {
    if (signalement.statut === 'resolu') {
      sauvegarderSignalements(signalements.map(s => s.id===signalement.id ? {...s,statut:'resolu'} : s))
    } else {
      sauvegarderSignalements([signalement, ...signalements])
    }
  }

  const total = chambres.length || chambresStats.total || 50
  const stats = {
    libre:        chambres.filter(c=>c.statut==='libre').length,
    occupee:      chambres.filter(c=>c.statut==='occupee').length,
    a_venir:      chambres.filter(c=>c.statut==='a_venir').length,
    nettoyage:    chambres.filter(c=>c.statut==='nettoyage').length,
    probleme:     chambres.filter(c=>c.statut==='probleme').length,
    hors_service: chambres.filter(c=>c.statut==='hors_service').length,
  }

  const signalementsOuverts = signalements.filter(s=>s.statut==='ouvert')

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
        probleme: nouveauStatut==='probleme'||nouveauStatut==='hors_service' ? note : null,
        client: nouveauStatut!=='occupee'&&nouveauStatut!=='a_venir' ? null : c.client,
      } : c
    ))
    if (onMajChambre) onMajChambre(num, nouveauStatut, note)
  }

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
    <div style={{ paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Chambres</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>
              {total} chambres · {stats.occupee} occupées · {stats.libre} libres
            </p>
          </div>
          {signalementsOuverts.length > 0 && (
            <button onClick={()=>setShowMaintenanceListe(!showMaintenanceListe)} style={{
              background:'#E74C3C', border:'none', borderRadius:'10px', padding:'8px 12px',
              cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'
            }}>
              <Wrench size={14} color="white"/>
              <span style={{ color:'white', fontWeight:'700', fontSize:'12px' }}>{signalementsOuverts.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Liste maintenance ouverte */}
      {showMaintenanceListe && signalementsOuverts.length > 0 && (
        <div style={{ background:'#FFF5F5', borderBottom:'2px solid #E74C3C', padding:'12px 20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#E74C3C', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>
            🔧 Maintenances ouvertes ({signalementsOuverts.length})
          </div>
          {signalementsOuverts.map(sig => (
            <div key={sig.id} style={{ background:'white', borderRadius:'10px', padding:'10px 12px', marginBottom:'6px', borderLeft:'3px solid #E74C3C' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'2px' }}>
                <span style={{ fontWeight:'700', fontSize:'12px', color:'#1B3A6B' }}>
                  Ch. {sig.chambre} · {typesMaintenance.find(t=>t.id===sig.type)?.emoji} {typesMaintenance.find(t=>t.id===sig.type)?.label}
                </span>
                <span style={{ fontSize:'10px', color:'#999' }}>{sig.date}</span>
              </div>
              <div style={{ fontSize:'12px', color:'#666' }}>{sig.description}</div>
              {estDirecteur && (
                <button onClick={()=>handleSignalerMaintenance({...sig,statut:'resolu'})} style={{ marginTop:'6px', padding:'3px 10px', borderRadius:'6px', border:'none', cursor:'pointer', background:'#E8F5E9', color:'#2ECC71', fontSize:'11px', fontWeight:'700' }}>
                  ✅ Résolu
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding:'16px 20px' }}>

        {/* Stats statuts */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'12px' }}>
          {[
            { key:'libre',        val:statuts.libre },
            { key:'occupee',      val:statuts.occupee },
            { key:'a_venir',      val:statuts.a_venir },
            { key:'nettoyage',    val:statuts.nettoyage },
            { key:'probleme',     val:statuts.probleme },
            { key:'hors_service', val:statuts.hors_service },
          ].map(({key, val}) => (
            <button key={key} onClick={() => setFiltre(filtre===key?'tous':key)}
              style={{ background:filtre===key?val.couleur:'white', borderRadius:'10px', padding:'8px 4px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:'none', cursor:'pointer', borderTop:`3px solid ${val.couleur}` }}>
              <div style={{ fontSize:'16px', fontWeight:'800', color:filtre===key?'white':val.couleur }}>{stats[key]||0}</div>
              <div style={{ fontSize:'8px', fontWeight:'600', color:filtre===key?'rgba(255,255,255,0.85)':'#888', marginTop:'2px' }}>{val.label}</div>
            </button>
          ))}
        </div>

        {/* Filtre catégorie */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px', overflowX:'auto', paddingBottom:'4px' }}>
          <button onClick={()=>setFiltrecat('tous')} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer', background:filtrecat==='tous'?'#1B3A6B':'#F0F0F0', color:filtrecat==='tous'?'white':'#666' }}>
            Toutes
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={()=>setFiltrecat(filtrecat===cat?'tous':cat)} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer', background:filtrecat===cat?'#1B3A6B':'#F0F0F0', color:filtrecat===cat?'white':'#666' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Recherche + vue */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#999' }}/>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="N° chambre, client..."
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
              const s = statuts[c.statut] || statuts.libre
              const Icone = iconeStatut[c.statut] || CheckCircle
              const sigActifs = signalements.filter(sig=>sig.chambre===c.num&&sig.statut==='ouvert')
              return (
                <div key={c.num} onClick={()=>setChambreSelectee(c)}
                  style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:`4px solid ${s.couleur}`, cursor:'pointer', position:'relative' }}>
                  {sigActifs.length > 0 && (
                    <div style={{ position:'absolute', top:'8px', right:'8px', background:'#E74C3C', borderRadius:'10px', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ color:'white', fontSize:'10px', fontWeight:'700' }}>{sigActifs.length}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B' }}>{c.num}</span>
                    <div style={{ background:s.bg, borderRadius:'8px', padding:'4px 6px' }}>
                      <Icone size={14} color={s.couleur}/>
                    </div>
                  </div>
                  <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{c.cat}</div>
                  {c.client && <div style={{ fontSize:'12px', color:'#333', fontWeight:'600', marginBottom:'2px' }}>👤 {c.client.split(' ').pop()}</div>}
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
              const sigActifs = signalements.filter(sig=>sig.chambre===c.num&&sig.statut==='ouvert')
              return (
                <div key={c.num} onClick={()=>setChambreSelectee(c)}
                  style={{ background:'white', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${s.couleur}`, display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
                    <span style={{ fontSize:'14px', fontWeight:'800', color:s.couleur }}>{c.num}</span>
                    {sigActifs.length > 0 && (
                      <div style={{ position:'absolute', top:'-4px', right:'-4px', background:'#E74C3C', borderRadius:'8px', width:'16px', height:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ color:'white', fontSize:'9px', fontWeight:'700' }}>{sigActifs.length}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>Ch. {c.num}</span>
                      <span style={{ background:s.couleur, color:'white', fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'10px' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>{c.cat} · {(c.tarifNuit||0).toLocaleString('fr-FR')} F/nuit</div>
                    {c.client && <div style={{ fontSize:'12px', color:'#333', fontWeight:'600', marginTop:'2px' }}>👤 {c.client}</div>}
                    {sigActifs.length > 0 && <div style={{ fontSize:'11px', color:'#E74C3C', marginTop:'2px' }}>🔧 {sigActifs.length} signalement{sigActifs.length>1?'s':''} actif{sigActifs.length>1?'s':''}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtrees.length===0 && chambres.length > 0 && (
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
          onSignalerMaintenance={handleSignalerMaintenance}
          estDirecteur={estDirecteur}
          signalements={signalements}
        />
      )}
    </div>
  )
}
