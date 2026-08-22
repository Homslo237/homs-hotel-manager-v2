import { useState, useEffect } from 'react'
import { Home, Briefcase, Sparkles, AlertTriangle, TrendingUp, Moon, Clock, LogIn, LogOut, RefreshCw } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('fr-FR')
const aujourdhui = () => new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
const heure = () => new Date().toTimeString().slice(0,5)

// ─── Données simulées (en Phase 2 : viendront de Firebase) ───────────────────
const chambresData = {
  total: 20,
  disponibles: 7,
  occupees: 8,
  nettoyer: 4,
  problemes: 1,
}

const sejoursEnCours = [
  { id:1, client:'M. Kouassi Ama',   chambre:'205', categorie:'Confort',   type:'nuit',  montant:105000, mode:'Orange Money',     dateDepart:'24/08/2026', heureDepart:'12:00' },
  { id:2, client:'Mme Diallo Fatou', chambre:'101', categorie:'Standard',  type:'nuit',  montant:50000,  mode:'Espèces',          dateDepart:'23/08/2026', heureDepart:'12:00' },
  { id:3, client:'M. Bamba Seydou',  chambre:'302', categorie:'Suite',     type:'heure', montant:19500,  mode:'MTN Mobile Money', dateDepart:'22/08/2026', heureDepart:'15:30' },
]

const arriveesDuJour = [
  { nom:'M. Dupont Jean',    chambre:'101', heure:'14h00', categorie:'Standard' },
  { nom:'Mme Kouassi Ama',  chambre:'203', heure:'15h30', categorie:'Confort'  },
  { nom:'M. Mbeki Carlos',  chambre:'301', heure:'18h00', categorie:'Suite'    },
]

const departsDuJour = [
  { nom:'Mme Traoré Aïcha',  chambre:'103', heure:'11h00', statut:'fait'     },
  { nom:'M. Nguessan Paul',  chambre:'202', heure:'12h00', statut:'en_attente' },
]

const caisse = {
  totalSejours:  174500,
  totalNuits:    155000,
  totalHeures:    19500,
  totalEntrees:   12000,
  totalSorties:   38500,
}

// ─── Composant Dashboard ──────────────────────────────────────────────────────
export default function Dashboard() {
  const [heureActuelle, setHeureActuelle] = useState(heure())
  const [refresh, setRefresh] = useState(false)

  // Horloge en temps réel
  useEffect(() => {
    const interval = setInterval(() => setHeureActuelle(heure()), 60000)
    return () => clearInterval(interval)
  }, [])

  const soldeNet = caisse.totalSejours + caisse.totalEntrees - caisse.totalSorties
  const tauxOccupation = Math.round((chambresData.occupees / chambresData.total) * 100)

  const handleRefresh = () => {
    setRefresh(true)
    setTimeout(() => setRefresh(false), 1000)
  }

  return (
    <div style={{ paddingBottom:'80px', background:'#F5F7FA', minHeight:'100vh' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>Bonjour 👋</p>
            <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Tableau de bord</h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', marginTop:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>
              UNE VISION D'ENSEMBLE
            </p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'#C9A84C', fontWeight:'800', fontSize:'18px' }}>{heureActuelle}</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', marginTop:'2px' }}>
              {new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
            </div>
            <button onClick={handleRefresh} style={{ marginTop:'6px', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'8px', padding:'5px 8px', cursor:'pointer' }}>
              <RefreshCw size={14} color="white" style={{ animation: refresh ? 'spin 1s linear' : 'none' }}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* ── 4 cases chambres ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          {[
            { label:'Disponibles', valeur:chambresData.disponibles, total:chambresData.total, couleur:'#2ECC71', icone:Home,          bg:'#F0FFF4' },
            { label:'Occupées',    valeur:chambresData.occupees,    total:chambresData.total, couleur:'#1B3A6B', icone:Briefcase,     bg:'#EEF2FF' },
            { label:'À nettoyer',  valeur:chambresData.nettoyer,    total:chambresData.total, couleur:'#C9A84C', icone:Sparkles,      bg:'#FFFBF0' },
            { label:'Problèmes',   valeur:chambresData.problemes,   total:chambresData.total, couleur:'#E74C3C', icone:AlertTriangle, bg:'#FFF5F5' },
          ].map((s,i) => {
            const Icone = s.icone
            const pct = Math.round((s.valeur/s.total)*100)
            return (
              <div key={i} style={{ background:'white', borderRadius:'14px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' }}>
                  <Icone size={18} color={s.couleur}/>
                </div>
                <div style={{ fontSize:'26px', fontWeight:'800', color:s.couleur }}>{s.valeur}</div>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'8px' }}>{s.label} / {s.total}</div>
                {/* Barre de progression */}
                <div style={{ height:'4px', background:'#F0F0F0', borderRadius:'2px' }}>
                  <div style={{ height:'4px', background:s.couleur, borderRadius:'2px', width:`${pct}%`, transition:'width 0.5s' }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Carte CA + Taux occupation ── */}
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', borderRadius:'16px', padding:'18px 20px', marginBottom:'16px', color:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
            <TrendingUp size={16} color="#C9A84C"/>
            <span style={{ fontSize:'12px', opacity:0.8 }}>Performance du jour</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div>
              <div style={{ fontSize:'11px', opacity:0.6, marginBottom:'4px' }}>Solde net caisse</div>
              <div style={{ fontSize:'22px', fontWeight:'800', color:'#C9A84C' }}>{fmt(soldeNet)}</div>
              <div style={{ fontSize:'10px', opacity:0.6 }}>FCFA</div>
            </div>
            <div>
              <div style={{ fontSize:'11px', opacity:0.6, marginBottom:'4px' }}>Taux d'occupation</div>
              <div style={{ fontSize:'22px', fontWeight:'800', color:'#2ECC71' }}>{tauxOccupation}%</div>
              <div style={{ fontSize:'10px', opacity:0.6 }}>{chambresData.occupees} / {chambresData.total} chambres</div>
            </div>
          </div>
          {/* Détail caisse */}
          <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.15)', display:'flex', gap:'16px', fontSize:'11px', flexWrap:'wrap' }}>
            <span>🌙 Nuits : {fmt(caisse.totalNuits)}</span>
            <span>⏱️ Heures : {fmt(caisse.totalHeures)}</span>
            <span>📥 +{fmt(caisse.totalEntrees)}</span>
            <span style={{ color:'#FF8A80' }}>📤 -{fmt(caisse.totalSorties)}</span>
          </div>
        </div>

        {/* ── Séjours à l'heure en cours ── */}
        {sejoursEnCours.filter(s=>s.type==='heure').length > 0 && (
          <div style={{ background:'#FFF8F0', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #E8634A' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <Clock size={16} color="#E8634A"/>
              <span style={{ fontWeight:'700', fontSize:'13px', color:'#E8634A' }}>Séjours à l'heure en cours</span>
            </div>
            {sejoursEnCours.filter(s=>s.type==='heure').map(s=>(
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#666', marginBottom:'4px' }}>
                <span>Ch.{s.chambre} · {s.client.split(' ').pop()}</span>
                <span style={{ color:'#C9A84C', fontWeight:'700' }}>jusqu'à {s.heureDepart}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Arrivées du jour ── */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
            <LogIn size={16} color="#2ECC71"/>
            <h3 style={{ color:'#1B3A6B', fontWeight:'700', fontSize:'15px' }}>
              Arrivées du jour
              <span style={{ background:'#2ECC71', color:'white', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', marginLeft:'8px' }}>
                {arriveesDuJour.length}
              </span>
            </h3>
          </div>
          {arriveesDuJour.map((a,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', borderLeft:'4px solid #2ECC71', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{a.nom}</div>
                <div style={{ color:'#888', fontSize:'12px', marginTop:'2px' }}>
                  Ch. {a.chambre} · {a.categorie}
                </div>
              </div>
              <div style={{ background:'#F0FFF4', borderRadius:'8px', padding:'4px 10px', color:'#2ECC71', fontWeight:'700', fontSize:'13px' }}>
                {a.heure}
              </div>
            </div>
          ))}
        </div>

        {/* ── Départs du jour ── */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
            <LogOut size={16} color="#E8634A"/>
            <h3 style={{ color:'#1B3A6B', fontWeight:'700', fontSize:'15px' }}>
              Départs du jour
              <span style={{ background:'#E8634A', color:'white', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', marginLeft:'8px' }}>
                {departsDuJour.length}
              </span>
            </h3>
          </div>
          {departsDuJour.map((d,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', borderLeft:`4px solid ${d.statut==='fait'?'#999':'#E8634A'}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:'700', fontSize:'14px', color: d.statut==='fait'?'#999':'#1B3A6B' }}>{d.nom}</div>
                <div style={{ color:'#888', fontSize:'12px', marginTop:'2px' }}>Ch. {d.chambre}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                <div style={{ background: d.statut==='fait'?'#F0F0F0':'#FFF3E0', borderRadius:'8px', padding:'4px 10px', color:d.statut==='fait'?'#999':'#E8634A', fontWeight:'700', fontSize:'13px' }}>
                  {d.heure}
                </div>
                <div style={{ fontSize:'10px', fontWeight:'700', color:d.statut==='fait'?'#2ECC71':'#E8634A' }}>
                  {d.statut==='fait' ? '✅ Parti' : '⏳ En attente'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Séjours en cours ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
            <Moon size={16} color="#1B3A6B"/>
            <h3 style={{ color:'#1B3A6B', fontWeight:'700', fontSize:'15px' }}>
              Séjours en cours
              <span style={{ background:'#1B3A6B', color:'white', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', marginLeft:'8px' }}>
                {sejoursEnCours.length}
              </span>
            </h3>
          </div>
          {sejoursEnCours.map(s=>(
            <div key={s.id} style={{ background:'white', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', borderLeft:`4px solid ${s.type==='heure'?'#E8634A':'#1B3A6B'}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{s.client}</span>
                <span style={{ color:'#C9A84C', fontWeight:'800', fontSize:'13px' }}>{fmt(s.montant)} F</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#888' }}>
                <span>Ch. {s.chambre} · {s.categorie} · {s.type==='heure'?'⏱️':'🌙'}</span>
                <span>Départ : {s.type==='nuit' ? s.dateDepart : s.heureDepart}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
