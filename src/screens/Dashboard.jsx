import { useState, useEffect, useRef } from 'react'
import { Home, Briefcase, Sparkles, AlertTriangle, TrendingUp, Moon, Clock, LogIn, LogOut, RefreshCw } from 'lucide-react'

const STYLES = `
  @keyframes countUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeSlide { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse-ring { 0% { transform:scale(0.8); opacity:0.8; } 100% { transform:scale(1.6); opacity:0; } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .card-anim { animation: countUp 0.5s ease both; }
  .fade-slide { animation: fadeSlide 0.4s ease both; }
`

const fmt = (n) => Number(n||0).toLocaleString('fr-FR')
const heure = () => new Date().toTimeString().slice(0,5)

// CA des 7 derniers jours (statique pour l'instant)
const caJours = [
  { jour:'Lun', montant:185000 },
  { jour:'Mar', montant:220000 },
  { jour:'Mer', montant:195000 },
  { jour:'Jeu', montant:310000 },
  { jour:'Ven', montant:275000 },
  { jour:'Sam', montant:340000 },
  { jour:'Auj', montant:0 }, // sera remplacé par soldeNet
]

// Renvoie la date du jour au format JJ/MM/AAAA, identique au format
// utilisé partout ailleurs dans l'app pour dateArrivee/dateDepart.
function dateDuJourFR() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

function GraphiqueCA({ data, visible }) {
  const max = Math.max(...data.map(d => d.montant), 1)
  return (
    <div style={{ marginTop:'16px' }}>
      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', marginBottom:'10px', letterSpacing:'1px' }}>
        CA DES 7 DERNIERS JOURS
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'70px' }}>
        {data.map((d, i) => {
          const pct = max > 0 ? (d.montant / max) * 100 : 0
          const estAujourdhui = i === data.length - 1
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <div style={{ width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center', height:'54px' }}>
                <div style={{
                  width:'100%', borderRadius:'4px 4px 0 0',
                  background: estAujourdhui ? 'linear-gradient(180deg, #F5D98A, #C9A84C)' : 'rgba(255,255,255,0.25)',
                  height: visible ? `${Math.max(pct, 4)}%` : '0%',
                  transition: `height ${0.4 + i * 0.08}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  boxShadow: estAujourdhui ? '0 0 8px rgba(201,168,76,0.6)' : 'none',
                  minHeight: '4px',
                }}/>
              </div>
              <div style={{ fontSize:'9px', color: estAujourdhui ? '#C9A84C' : 'rgba(255,255,255,0.5)', fontWeight: estAujourdhui ? '800' : '400' }}>
                {d.jour}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function JaugeCirculaire({ pct, couleur, label, valeur, visible }) {
  const r = 22
  const c = 2 * Math.PI * r
  const offset = c - (visible ? Math.min(pct,100) / 100 : 0) * c
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', flex:1 }}>
      <div style={{ position:'relative', width:'56px', height:'56px' }}>
        <svg width="56" height="56" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
          <circle cx="28" cy="28" r={r} fill="none" stroke={couleur} strokeWidth="5"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'12px', fontWeight:'800', color:couleur }}>{valeur}</span>
        </div>
      </div>
      <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{label}</div>
    </div>
  )
}

function CompteurAnime({ valeur, visible }) {
  const [affiche, setAffiche] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (!visible) return
    const debut = Date.now()
    const duree = 1200
    const animer = () => {
      const elapsed = Date.now() - debut
      const progress = Math.min(elapsed / duree, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAffiche(Math.round(eased * valeur))
      if (progress < 1) ref.current = requestAnimationFrame(animer)
    }
    ref.current = requestAnimationFrame(animer)
    return () => cancelAnimationFrame(ref.current)
  }, [visible, valeur])
  return <span>{fmt(affiche)}</span>
}

export default function Dashboard({ utilisateur, sejours=[], caisse={}, chambresStats={total:50,disponibles:37,occupees:8,nettoyer:3,problemes:2}, tauxOccupation=16 }) {
  const [heureActuelle, setHeureActuelle] = useState(heure())
  const [visible, setVisible] = useState(false)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = STYLES
    document.head.appendChild(el)
    setTimeout(() => setVisible(true), 100)
    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setHeureActuelle(heure()), 60000)
    return () => clearInterval(interval)
  }, [])

  const soldeNet   = Number(caisse.soldeNet   || 0)
  const totalNuits = Number(caisse.totalNuits  || 0)
  const totalHeur  = Number(caisse.totalHeures || 0)
  const totalEnt   = Number(caisse.totalEntrees|| 0)
  const totalSort  = Number(caisse.totalSorties|| 0)
  const tauxOcc    = Number(tauxOccupation || 0)

  // Mettre le solde d'aujourd'hui dans le graphique
  const graphData = [...caJours.slice(0,-1), { jour:'Auj', montant: soldeNet }]

  const handleRefresh = () => {
    setRefresh(true)
    setVisible(false)
    setTimeout(() => { setVisible(true); setRefresh(false) }, 600)
  }

  const prenom = utilisateur?.email?.split('@')[0] || 'vous'
  const sejoursEnCours = sejours.filter(s => s.statut === 'en_cours')

  // Arrivees du jour : reservations a venir dont l'arrivee est prevue aujourd'hui
  const aujourdhuiFR = dateDuJourFR()
  const arriveesDuJour = sejours
    .filter(s => s.statut === 'a_venir' && s.dateArrivee === aujourdhuiFR)
    .map(s => ({ nom: s.client, chambre: s.chambre, heure: s.heureArrivee, categorie: s.categorie }))

  // Departs du jour : sejours en cours dont le depart est prevu aujourd'hui
  const departsDuJour = sejoursEnCours
    .filter(s => s.dateDepart === aujourdhuiFR)
    .map(s => ({ nom: s.client, chambre: s.chambre, heure: s.heureDepart, statut: 'en_attente' }))

  return (
    <div style={{ paddingBottom:'90px', background:'#F5F7FA', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #0A1628, #1B3A6B, #2C5282)', padding:'20px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(201,168,76,0.08)' }}/>

        {/* Ligne 1 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', margin:0 }}>
            Bonjour 👋 <span style={{ color:'#C9A84C', fontWeight:'700' }}>{prenom}</span>
          </p>
          <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'20px' }}>{heureActuelle}</div>
        </div>

        {/* Ligne 2 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'16px', fontWeight:'800', margin:0, whiteSpace:'nowrap' }}>
              Tableau de bord
            </h1>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', marginTop:'3px', letterSpacing:'2px' }}>
              UNE VISION D'ENSEMBLE
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>
              {new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
            </div>
            <button onClick={handleRefresh} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:'8px', padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
              <RefreshCw size={12} color="#C9A84C" style={{ animation: refresh ? 'spin 0.6s linear infinite' : 'none' }}/>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'10px' }}>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Jauges */}
        <div style={{ display:'flex', justifyContent:'space-around', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.1)', gap:'4px' }}>
          <JaugeCirculaire pct={tauxOcc}                                                  couleur="#2ECC71" label="Occupation"  valeur={`${tauxOcc}%`}               visible={visible}/>
          <JaugeCirculaire pct={(chambresStats.disponibles/chambresStats.total)*100}      couleur="#C9A84C" label="Disponibles" valeur={chambresStats.disponibles}    visible={visible}/>
          <JaugeCirculaire pct={(chambresStats.nettoyer/chambresStats.total)*100}         couleur="#E8634A" label="Nettoyage"   valeur={chambresStats.nettoyer}       visible={visible}/>
          <JaugeCirculaire pct={(chambresStats.problemes/chambresStats.total)*100}        couleur="#E74C3C" label="Problèmes"   valeur={chambresStats.problemes}      visible={visible}/>
        </div>
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* Carte CA */}
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #0A1628)', borderRadius:'20px', padding:'20px', marginBottom:'16px', color:'white', boxShadow:'0 8px 32px rgba(27,58,107,0.3)', overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(201,168,76,0.06)' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
            <TrendingUp size={18} color="#C9A84C"/>
            <span style={{ fontSize:'12px', opacity:0.7, letterSpacing:'1px' }}>SOLDE NET DU JOUR</span>
          </div>
          <div style={{ fontSize:'32px', fontWeight:'900', color:'#C9A84C', marginBottom:'4px' }}>
            <CompteurAnime valeur={soldeNet} visible={visible}/> <span style={{ fontSize:'16px', opacity:0.7 }}>FCFA</span>
          </div>
          <GraphiqueCA data={graphData} visible={visible}/>
          <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', fontSize:'11px' }}>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>🌙 Nuits</div>
              <div style={{ color:'#C9A84C', fontWeight:'700' }}>{fmt(totalNuits)} F</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>⏱️ Heures</div>
              <div style={{ color:'#E8634A', fontWeight:'700' }}>{fmt(totalHeur)} F</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>📥 Entrées div.</div>
              <div style={{ color:'#2ECC71', fontWeight:'700' }}>+{fmt(totalEnt)} F</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>📤 Sorties</div>
              <div style={{ color:'#FF8A80', fontWeight:'700' }}>-{fmt(totalSort)} F</div>
            </div>
          </div>
        </div>

        {/* 5 cases chambres - hauteur reduite, incluant les reservations a venir */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'16px' }}>
          {[
            { label:'Disponibles', valeur:chambresStats.disponibles, couleur:'#2ECC71', icone:Home,          bg:'#F0FFF4', delay:0   },
            { label:'Occupées',    valeur:chambresStats.occupees,    couleur:'#1B3A6B', icone:Briefcase,     bg:'#EEF2FF', delay:0.1 },
            { label:'A venir',     valeur:chambresStats.aVenir||0,   couleur:'#8B5CF6', icone:Clock,         bg:'#F5F3FF', delay:0.15},
            { label:'A nettoyer',  valeur:chambresStats.nettoyer,    couleur:'#C9A84C', icone:Sparkles,      bg:'#FFFBF0', delay:0.2 },
            { label:'Problemes',   valeur:chambresStats.problemes,   couleur:'#E74C3C', icone:AlertTriangle, bg:'#FFF5F5', delay:0.3 },
          ].map((s,i) => {
            const Icone = s.icone
            const pct = Math.round(((s.valeur||0) / (chambresStats.total||50)) * 100)
            return (
              <div key={i} className="card-anim" style={{ background:'white', borderRadius:'12px', padding:'8px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', animationDelay: s.delay+'s', borderBottom:`3px solid ${s.couleur}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'7px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icone size={12} color={s.couleur}/>
                  </div>
                  <span style={{ fontSize:'9px', color:'#999' }}>/{chambresStats.total}</span>
                </div>
                <div style={{ fontSize:'20px', fontWeight:'900', color:s.couleur, lineHeight:1 }}>{s.valeur||0}</div>
                <div style={{ fontSize:'9px', color:'#888', margin:'2px 0 4px', whiteSpace:'nowrap' }}>{s.label}</div>
                <div style={{ height:'3px', background:'#F0F0F0', borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ height:'3px', borderRadius:'2px', background:s.couleur, width: visible ? `${pct}%` : '0%', transition:`width 1s ${s.delay}s ease` }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Séjours à l'heure */}
        {sejoursEnCours.filter(s=>s.type==='heure').length > 0 && (
          <div style={{ background:'#FFF8F0', borderRadius:'16px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #E8634A22' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
              <Clock size={18} color="#E8634A"/>
              <span style={{ fontWeight:'800', fontSize:'13px', color:'#E8634A' }}>
                Sejours a l'heure · {sejoursEnCours.filter(s=>s.type==='heure').length} en cours
              </span>
            </div>
            {sejoursEnCours.filter(s=>s.type==='heure').map((s,i)=>(
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'white', borderRadius:'10px', marginBottom:'6px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#1B3A6B' }}>{s.client.split(' ').pop()}</div>
                  <div style={{ fontSize:'11px', color:'#888' }}>Ch. {s.chambre} · {s.categorie}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'12px', color:'#E8634A', fontWeight:'700' }}>jusqu'a {s.heureDepart}</div>
                  <div style={{ fontSize:'11px', color:'#C9A84C', fontWeight:'700' }}>{fmt(s.montantNum)} F</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Arrivées */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'#F0FFF4', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogIn size={16} color="#2ECC71"/>
            </div>
            <h3 style={{ color:'#1B3A6B', fontWeight:'800', fontSize:'15px', margin:0 }}>Arrivées du jour</h3>
            <span style={{ background:'#2ECC71', color:'white', fontSize:'11px', fontWeight:'800', padding:'3px 10px', borderRadius:'12px' }}>
              {arriveesDuJour.length}
            </span>
          </div>
          {arriveesDuJour.map((a,i) => (
            <div key={i} className="fade-slide" style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'8px', borderLeft:'4px solid #2ECC71', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', animationDelay: (i*0.1)+'s' }}>
              <div>
                <div style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{a.nom}</div>
                <div style={{ color:'#888', fontSize:'12px', marginTop:'2px' }}>Ch. {a.chambre} · {a.categorie}</div>
              </div>
              <div style={{ background:'#F0FFF4', borderRadius:'10px', padding:'6px 12px', color:'#2ECC71', fontWeight:'800', fontSize:'13px' }}>
                {a.heure}
              </div>
            </div>
          ))}
        </div>

        {/* Départs */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'#FFF3E0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogOut size={16} color="#E8634A"/>
            </div>
            <h3 style={{ color:'#1B3A6B', fontWeight:'800', fontSize:'15px', margin:0 }}>Départs du jour</h3>
            <span style={{ background:'#E8634A', color:'white', fontSize:'11px', fontWeight:'800', padding:'3px 10px', borderRadius:'12px' }}>
              {departsDuJour.length}
            </span>
          </div>
          {departsDuJour.map((d,i) => (
            <div key={i} className="fade-slide" style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'8px', borderLeft:`4px solid ${d.statut==='fait'?'#CCC':'#E8634A'}`, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', animationDelay: (i*0.1)+'s' }}>
              <div>
                <div style={{ fontWeight:'700', fontSize:'14px', color:d.statut==='fait'?'#999':'#1B3A6B' }}>{d.nom}</div>
                <div style={{ color:'#888', fontSize:'12px', marginTop:'2px' }}>Ch. {d.chambre}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                <div style={{ background:d.statut==='fait'?'#F5F5F5':'#FFF3E0', borderRadius:'10px', padding:'6px 12px', color:d.statut==='fait'?'#999':'#E8634A', fontWeight:'800', fontSize:'13px' }}>{d.heure}</div>
                <div style={{ fontSize:'11px', fontWeight:'700', color:d.statut==='fait'?'#2ECC71':'#E8634A' }}>
                  {d.statut==='fait' ? 'Parti' : 'En attente'}
                </div>
              </div>
  </
