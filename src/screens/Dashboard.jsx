import { useState, useEffect, useRef } from 'react'
import { Home, Briefcase, Sparkles, AlertTriangle, TrendingUp, Moon, Clock, LogIn, LogOut, RefreshCw } from 'lucide-react'

// ─── Styles d'animation ───────────────────────────────────────────────────────
const STYLES = `
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes barGrow {
    from { height: 0; }
    to   { height: var(--h); }
  }
  @keyframes lineGrow {
    from { stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes shimmerCard {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .card-anim { animation: countUp 0.5s ease both; }
  .fade-slide { animation: fadeSlide 0.4s ease both; }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('fr-FR')
const heure = () => new Date().toTimeString().slice(0,5)

// ─── Données ──────────────────────────────────────────────────────────────────
const TOTAL_CHAMBRES = 50
const chambresData = { total:TOTAL_CHAMBRES, disponibles:37, occupees:8, nettoyer:3, problemes:2 }

const caisse = { totalSejours:258500, totalNuits:225000, totalHeures:33500, totalEntrees:12000, totalSorties:38500 }

// CA des 7 derniers jours (pour le graphique)
const caJours = [
  { jour:'Lun', montant:185000 },
  { jour:'Mar', montant:220000 },
  { jour:'Mer', montant:195000 },
  { jour:'Jeu', montant:310000 },
  { jour:'Ven', montant:275000 },
  { jour:'Sam', montant:340000 },
  { jour:'Auj', montant:258500 },
]

const sejoursEnCours = [
  { id:1, client:'M. Kouassi Ama',   chambre:'205', categorie:'Confort',  type:'nuit',  montant:105000, dateDepart:'24/08/2026', heureDepart:'12:00' },
  { id:2, client:'Mme Diallo Fatou', chambre:'101', categorie:'Standard', type:'nuit',  montant:50000,  dateDepart:'23/08/2026', heureDepart:'12:00' },
  { id:3, client:'M. Bamba Seydou',  chambre:'302', categorie:'Suite',    type:'heure', montant:19500,  dateDepart:'22/08/2026', heureDepart:'15:30' },
  { id:4, client:'Mme Kouassi',      chambre:'201', categorie:'Confort',  type:'nuit',  montant:70000,  dateDepart:'25/08/2026', heureDepart:'12:00' },
  { id:5, client:'M. Mbeki Carlos',  chambre:'203', categorie:'Confort',  type:'heure', montant:14000,  dateDepart:'22/08/2026', heureDepart:'13:00' },
]

const arriveesDuJour = [
  { nom:'M. Dupont Jean',    chambre:'104', heure:'14h00', categorie:'Standard' },
  { nom:'Mme Traoré Aïcha', chambre:'208', heure:'15h30', categorie:'Confort'  },
  { nom:'M. Nguessan Paul',  chambre:'306', heure:'18h00', categorie:'Suite'    },
]

const departsDuJour = [
  { nom:'Mme Diallo Fatou', chambre:'103', heure:'11h00', statut:'fait'      },
  { nom:'M. Bamba Seydou',  chambre:'214', heure:'12h00', statut:'en_attente' },
  { nom:'M. Mbeki Carlos',  chambre:'203', heure:'13h00', statut:'en_attente' },
]

// ─── Graphique barres CA 7 jours ──────────────────────────────────────────────
function GraphiqueCA({ data, visible }) {
  const max = Math.max(...data.map(d => d.montant))
  return (
    <div style={{ marginTop:'16px' }}>
      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', marginBottom:'10px', letterSpacing:'1px' }}>
        CA DES 7 DERNIERS JOURS
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'70px' }}>
        {data.map((d, i) => {
          const pct = (d.montant / max) * 100
          const estAujourdhui = i === data.length - 1
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <div style={{ width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center', height:'54px' }}>
                <div style={{
                  width:'100%', borderRadius:'4px 4px 0 0',
                  background: estAujourdhui
                    ? 'linear-gradient(180deg, #F5D98A, #C9A84C)'
                    : 'rgba(255,255,255,0.25)',
                  height: visible ? `${pct}%` : '0%',
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

// ─── Jauge circulaire taux occupation ─────────────────────────────────────────
function JaugeCirculaire({ pct, couleur, label, valeur, visible }) {
  const r = 22
  const circonference = 2 * Math.PI * r
  const offset = circonference - (visible ? pct / 100 : 0) * circonference

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', flex:1 }}>
      <div style={{ position:'relative', width:'56px', height:'56px' }}>
        <svg width="56" height="56" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
          <circle cx="28" cy="28" r={r} fill="none"
            stroke={couleur} strokeWidth="5"
            strokeDasharray={circonference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'12px', fontWeight:'800', color:couleur }}>{valeur}</span>
        </div>
      </div>
      <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.6)', textAlign:'center' }}>{label}</div>
    </div>
  )
}

// ─── Compteur animé ───────────────────────────────────────────────────────────
function CompteurAnime({ valeur, duree = 1200, visible }) {
  const [affiche, setAffiche] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (!visible) return
    const debut = Date.now()
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

// ─── Dashboard principal ──────────────────────────────────────────────────────
export default function Dashboard({ utilisateur }) {
  const [heureActuelle, setHeureActuelle] = useState(heure())
  const [visible, setVisible] = useState(false)
  const [refresh, setRefresh] = useState(false)

  // Injection styles
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = STYLES
    document.head.appendChild(el)
    // Déclencher les animations après montage
    setTimeout(() => setVisible(true), 100)
    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setHeureActuelle(heure()), 60000)
    return () => clearInterval(interval)
  }, [])

  const soldeNet = caisse.totalSejours + caisse.totalEntrees - caisse.totalSorties
  const tauxOcc  = Math.round((chambresData.occupees / chambresData.total) * 100)

  const handleRefresh = () => {
    setRefresh(true)
    setVisible(false)
    setTimeout(() => { setVisible(true); setRefresh(false) }, 600)
  }

  const prenom = utilisateur?.email?.split('@')[0] || 'vous'

  return (
    <div style={{ paddingBottom:'90px', background:'#F5F7FA', minHeight:'100vh' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg, #0A1628, #1B3A6B, #2C5282)', padding:'24px 20px 28px', position:'relative', overflow:'hidden' }}>

        {/* Cercles décoratifs en arrière-plan */}
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(201,168,76,0.08)' }}/>
        <div style={{ position:'absolute', bottom:'-20px', left:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(201,168,76,0.05)' }}/>

        {/* Ligne 1 : Bonjour + Heure */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', margin:0 }}>
            Bonjour 👋 <span style={{ color:'#C9A84C', fontWeight:'700' }}>{prenom}</span>
          </p>
          <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'20px', letterSpacing:'1px' }}>
            {heureActuelle}
          </div>
        </div>
        {/* Ligne 2 : Titre + Date + Actualiser */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'16px', fontWeight:'800', letterSpacing:'0.5px', margin:0, whiteSpace:'nowrap' }}>
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

        {/* ── Jauges circulaires ── */}
        <div style={{ display:'flex', justifyContent:'space-around', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.1)', overflowX:'hidden', gap:'4px' }}>
          <JaugeCirculaire pct={tauxOcc}                             couleur="#2ECC71" label="Occupation"  valeur={`${tauxOcc}%`} visible={visible}/>
          <JaugeCirculaire pct={chambresData.disponibles/chambresData.total*100} couleur="#C9A84C" label="Disponibles" valeur={chambresData.disponibles} visible={visible}/>
          <JaugeCirculaire pct={chambresData.nettoyer/chambresData.total*100}    couleur="#E8634A" label="Nettoyage"   valeur={chambresData.nettoyer}    visible={visible}/>
          <JaugeCirculaire pct={chambresData.problemes/chambresData.total*100}   couleur="#E74C3C" label="Problèmes"   valeur={chambresData.problemes}    visible={visible}/>
        </div>
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* ── Carte CA animée ── */}
        <div style={{
          background:'linear-gradient(135deg, #1B3A6B, #0A1628)',
          borderRadius:'20px', padding:'20px',
          marginBottom:'16px', color:'white',
          boxShadow:'0 8px 32px rgba(27,58,107,0.3)',
          overflow:'hidden', position:'relative',
        }}>
          {/* Décor */}
          <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(201,168,76,0.06)' }}/>

          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
            <div style={{ position:'relative' }}>
              <TrendingUp size={18} color="#C9A84C"/>
              {visible && <div style={{ position:'absolute', inset:'-4px', borderRadius:'50%', border:'2px solid #C9A84C', animation:'pulse-ring 1.5s ease-out infinite' }}/>}
            </div>
            <span style={{ fontSize:'12px', opacity:0.7, letterSpacing:'1px' }}>SOLDE NET DU JOUR</span>
          </div>

          <div style={{ fontSize:'32px', fontWeight:'900', color:'#C9A84C', marginBottom:'4px' }}>
            {visible ? <CompteurAnime valeur={soldeNet} visible={visible}/> : '0'} <span style={{ fontSize:'16px', opacity:0.7 }}>FCFA</span>
          </div>

          {/* Barres CA 7 jours */}
          <GraphiqueCA data={caJours} visible={visible}/>

          {/* Détail */}
          <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', fontSize:'11px' }}>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>🌙 Nuits</div>
              <div style={{ color:'#C9A84C', fontWeight:'700' }}>{fmt(caisse.totalNuits)} F</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>⏱️ Heures</div>
              <div style={{ color:'#E8634A', fontWeight:'700' }}>{fmt(caisse.totalHeures)} F</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>📥 Entrées</div>
              <div style={{ color:'#2ECC71', fontWeight:'700' }}>+{fmt(caisse.totalEntrees)} F</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 10px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>📤 Sorties</div>
              <div style={{ color:'#FF8A80', fontWeight:'700' }}>-{fmt(caisse.totalSorties)} F</div>
            </div>
          </div>
        </div>

        {/* ── 4 cases chambres animées ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          {[
            { label:'Disponibles', valeur:chambresData.disponibles, couleur:'#2ECC71', icone:Home,          bg:'#F0FFF4', delay:'0s'   },
            { label:'Occupées',    valeur:chambresData.occupees,    couleur:'#1B3A6B', icone:Briefcase,     bg:'#EEF2FF', delay:'0.1s' },
            { label:'À nettoyer',  valeur:chambresData.nettoyer,    couleur:'#C9A84C', icone:Sparkles,      bg:'#FFFBF0', delay:'0.2s' },
            { label:'Problèmes',   valeur:chambresData.problemes,   couleur:'#E74C3C', icone:AlertTriangle, bg:'#FFF5F5', delay:'0.3s' },
          ].map((s,i) => {
            const Icone = s.icone
            const pct = Math.round((s.valeur / chambresData.total) * 100)
            return (
              <div key={i} className="card-anim" style={{
                background:'white', borderRadius:'16px', padding:'16px',
                boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
                animationDelay: s.delay,
                borderBottom: `3px solid ${s.couleur}`,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icone size={20} color={s.couleur}/>
                  </div>
                  <span style={{ fontSize:'11px', color:'#888', background:'#F5F5F5', padding:'2px 8px', borderRadius:'10px' }}>
                    /{chambresData.total}
                  </span>
                </div>
                <div style={{ fontSize:'30px', fontWeight:'900', color:s.couleur, lineHeight:1 }}>
                  {s.valeur}
                </div>
                <div style={{ fontSize:'12px', color:'#888', margin:'4px 0 10px' }}>{s.label}</div>
                {/* Barre animée */}
                <div style={{ height:'5px', background:'#F0F0F0', borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{
                    height:'5px', borderRadius:'3px',
                    background:`linear-gradient(90deg, ${s.couleur}99, ${s.couleur})`,
                    width: visible ? `${pct}%` : '0%',
                    transition:`width 1s ${s.delay} cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  }}/>
                </div>
                <div style={{ fontSize:'10px', color:s.couleur, fontWeight:'700', marginTop:'4px', textAlign:'right' }}>
                  {pct}%
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Séjours à l'heure ── */}
        {sejoursEnCours.filter(s=>s.type==='heure').length > 0 && (
          <div style={{ background:'linear-gradient(135deg, #FFF8F0, #FFF3E8)', borderRadius:'16px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #E8634A22', boxShadow:'0 2px 12px rgba(232,99,74,0.1)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
              <div style={{ position:'relative' }}>
                <Clock size={18} color="#E8634A"/>
                <div style={{ position:'absolute', inset:'-3px', borderRadius:'50%', border:'2px solid #E8634A', animation:'pulse-ring 2s ease-out infinite' }}/>
              </div>
              <span style={{ fontWeight:'800', fontSize:'13px', color:'#E8634A' }}>
                Séjours à l'heure · {sejoursEnCours.filter(s=>s.type==='heure').length} en cours
              </span>
            </div>
            {sejoursEnCours.filter(s=>s.type==='heure').map((s,i)=>(
              <div key={s.id} className="fade-slide" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'white', borderRadius:'10px', marginBottom:'6px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', animationDelay: (i*0.1)+'s' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#1B3A6B' }}>{s.client.split(' ').pop()}</div>
                  <div style={{ fontSize:'11px', color:'#888' }}>Ch. {s.chambre} · {s.categorie}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'12px', color:'#E8634A', fontWeight:'700' }}>jusqu'à {s.heureDepart}</div>
                  <div style={{ fontSize:'11px', color:'#C9A84C', fontWeight:'700' }}>{fmt(s.montant)} F</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Arrivées ── */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'#F0FFF4', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogIn size={16} color="#2ECC71"/>
            </div>
            <h3 style={{ color:'#1B3A6B', fontWeight:'800', fontSize:'15px', margin:0 }}>
              Arrivées du jour
            </h3>
            <span style={{ background:'#2ECC71', color:'white', fontSize:'11px', fontWeight:'800', padding:'3px 10px', borderRadius:'12px' }}>
              {arriveesDuJour.leng
