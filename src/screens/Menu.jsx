import { useState, useEffect } from 'react'
import {
  User, Hotel, Users, Wrench, BarChart2, BookOpen,
  Info, LogOut, ChevronRight, X, Settings,
  AlertTriangle, Plus, Trash2, Save, Building2, Upload,
  Eye, EyeOff, UserCheck, UserX, Clock, Lock, Camera,
  TrendingUp, TrendingDown, Award, Star
} from 'lucide-react'

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }
const fmt = (n) => Number(n||0).toLocaleString('fr-FR')

const paramsDefaut = {
  nomHotel: 'HOMS-HÔTEL',
  toleranceMinutes: 20,
  vacations: [
    { id:1, nom:'Matin',       debut:'06:00', fin:'14:00' },
    { id:2, nom:'Après-midi',  debut:'14:00', fin:'22:00' },
    { id:3, nom:'Nuit',        debut:'22:00', fin:'06:00' },
  ],
  categories: [
    { id:1, nom:'Standard', debut:100, nombre:20, tarifNuit:25000, tarifHeure:2500 },
    { id:2, nom:'Confort',  debut:200, nombre:20, tarifNuit:35000, tarifHeure:3500 },
    { id:3, nom:'Suite',    debut:300, nombre:10, tarifNuit:65000, tarifHeure:6500 },
  ]
}

const identiteDefaut = {
  nom:'', slogan:'', adresse:'',
  telephone1:'', telephone2:'', email:'',
  rccm:'', contribuable:'', mentionLegale:'',
  logoUrl: null,
}

const ROLES_LABELS = {
  directeur:      { label:'Directeur',      couleur:'#C9A84C', emoji:'👔' },
  receptionniste: { label:'Réceptionniste', couleur:'#2ECC71', emoji:'🛎️' },
  caissier:       { label:'Caissier',       couleur:'#E8634A', emoji:'💰' },
}

const QUESTIONS_SECRETES = [
  'Quel est le nom de votre animal de compagnie ?',
  'Quel est le prénom de votre mère ?',
  'Dans quelle ville êtes-vous né(e) ?',
  'Quel est votre plat préféré ?',
  'Quel est le nom de votre école primaire ?',
]

function lireUtilisateurs() {
  try { const s = localStorage.getItem('homs_utilisateurs'); return s ? JSON.parse(s) : [] } catch { return [] }
}
function sauvegarderUtilisateurs(liste) {
  try { localStorage.setItem('homs_utilisateurs', JSON.stringify(liste)) } catch {}
}
function lireProfil(userId) {
  try { const s = localStorage.getItem(`homs_profil_${userId}`); return s ? JSON.parse(s) : null } catch { return null }
}
function sauvegarderProfil(userId, profil) {
  try { localStorage.setItem(`homs_profil_${userId}`, JSON.stringify(profil)) } catch {}
}

function parseDateFR(dateFR) {
  if (!dateFR) return null
  const [j, m, a] = dateFR.split('/').map(Number)
  if (!j || !m || !a) return null
  return new Date(a, m - 1, j)
}

function estDansLaPeriode(dateFR, periode) {
  const d = parseDateFR(dateFR)
  if (!d) return false
  const now = new Date()
  if (periode === 'jour') return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
  if (periode === 'semaine') {
    const debut = new Date(now)
    const jour = now.getDay()===0?7:now.getDay()
    debut.setDate(now.getDate()-jour+1); debut.setHours(0,0,0,0)
    return d >= debut && d <= now
  }
  if (periode === 'mois') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
  if (periode === 'annee') return d.getFullYear()===now.getFullYear()
  return true
}

// ─── Bannière accès réservé ───────────────────────────────────────────────────
function BanniereAccesReserve() {
  return (
    <div style={{ background:'#FFF8E1', border:'1px solid #C9A84C', borderRadius:'14px', padding:'20px', marginBottom:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center' }}>
      <Lock size={32} color="#C9A84C"/>
      <div style={{ fontWeight:'800', fontSize:'15px', color:'#1B3A6B' }}>Accès réservé au Directeur</div>
      <div style={{ fontSize:'13px', color:'#888' }}>Ces options sont disponibles uniquement pour le compte Directeur.</div>
    </div>
  )
}

// ─── Écran Statistiques Avancées ─────────────────────────────────────────────
function EcranStatistiques({ onClose, historique = [] }) {
  const [periode, setPeriode] = useState('jour')
  const [onglet, setOnglet] = useState('kpi')

  const items = historique.filter(h => estDansLaPeriode(h.date, periode))
  const totalEntrees = items.filter(h => h.type==='sejour'||h.type==='entree').reduce((s,h)=>s+(h.montant||0),0)
  const totalSorties = items.filter(h => h.type==='sortie').reduce((s,h)=>s+(h.montant||0),0)
  const soldeNet = totalEntrees - totalSorties
  const totalSejours = items.filter(h => h.type==='sejour').reduce((s,h)=>s+(h.montant||0),0)
  const totalNoShow = items.filter(h => h.noShow).reduce((s,h)=>s+(h.montant||0),0)

  const parMode = (mode) => items.filter(h=>(h.type==='sejour'||h.type==='entree')&&h.mode===mode).reduce((s,h)=>s+(h.montant||0),0)
  const especes = parMode('Espèces')
  const om      = parMode('Orange Money')
  const momo    = parMode('MTN Mobile Money')
  const carte   = parMode('Carte bancaire')
  const totalModes = especes + om + momo + carte || 1

  // Top clients
  const clientsMap = {}
  items.filter(h=>h.type==='sejour'&&!h.noShow).forEach(h => {
    if (!h.client) return
    if (!clientsMap[h.client]) clientsMap[h.client] = { nom:h.client, total:0, sejours:0 }
    clientsMap[h.client].total += h.montant||0
    clientsMap[h.client].sejours += 1
  })
  const topClients = Object.values(clientsMap).sort((a,b)=>b.total-a.total).slice(0,5)

  // Revenus par chambre (RevPAR approx)
  const nbChambres = 50
  const revPAR = Math.round(totalSejours / Math.max(nbChambres, 1))

  // Barre de progression pour les modes
  const BarMode = ({ label, icon, montant, couleur }) => {
    const pct = Math.round((montant / totalModes) * 100)
    return (
      <div style={{ marginBottom:'10px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
          <span style={{ fontSize:'12px', color:'#666' }}>{icon} {label}</span>
          <span style={{ fontSize:'12px', fontWeight:'700', color:'#1B3A6B' }}>{fmt(montant)} FCFA · {pct}%</span>
        </div>
        <div style={{ background:'#F0F0F0', borderRadius:'4px', height:'8px', overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, background:couleur, height:'100%', borderRadius:'4px', transition:'width 0.5s' }}/>
        </div>
      </div>
    )
  }

  const periodes = [
    {id:'jour',label:'Jour'},{id:'semaine',label:'Semaine'},
    {id:'mois',label:'Mois'},{id:'annee',label:'Année'},
  ]

  const onglets = [
    {id:'kpi',    label:'KPI'},
    {id:'revenus',label:'Revenus'},
    {id:'clients',label:'Clients'},
  ]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'#F5F7FA', overflowY:'auto', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Statistiques</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Reporting & analyses</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>

        {/* Sélecteur période */}
        <div style={{ display:'flex', borderRadius:'10px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.2)' }}>
          {periodes.map(p => (
            <button key={p.id} onClick={()=>setPeriode(p.id)} style={{
              flex:1, padding:'8px 4px', fontWeight:'700', fontSize:'12px', border:'none', cursor:'pointer',
              background:periode===p.id?'rgba(201,168,76,0.8)':'transparent',
              color:periode===p.id?'#1B3A6B':'rgba(255,255,255,0.7)',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:'flex', background:'white', borderBottom:'2px solid #F0F0F0' }}>
        {onglets.map(o => (
          <button key={o.id} onClick={()=>setOnglet(o.id)} style={{
            flex:1, padding:'12px 4px', fontWeight:'700', fontSize:'13px', border:'none', cursor:'pointer',
            background:'white', color:onglet===o.id?'#1B3A6B':'#999',
            borderBottom:onglet===o.id?'3px solid #C9A84C':'3px solid transparent',
          }}>{o.label}</button>
        ))}
      </div>

      <div style={{ padding:'16px 20px' }}>

        {historique.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#999' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📊</div>
            <p style={{ fontWeight:'700', fontSize:'15px', color:'#1B3A6B' }}>Aucune donnée</p>
            <p style={{ fontSize:'12px', marginTop:'4px' }}>Les statistiques apparaîtront après une première clôture de caisse.</p>
          </div>
        )}

        {historique.length > 0 && onglet === 'kpi' && (
          <>
            {/* Carte solde net */}
            <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', borderRadius:'16px', padding:'20px', marginBottom:'12px', color:'white' }}>
              <div style={{ fontSize:'13px', opacity:0.8, marginBottom:'6px' }}>💰 Solde net · {periodes.find(p=>p.id===periode)?.label}</div>
              <div style={{ fontSize:'34px', fontWeight:'800', color:'#C9A84C' }}>{fmt(soldeNet)} FCFA</div>
              <div style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'12px' }}>
                <span>📥 +{fmt(totalEntrees)}</span>
                <span style={{ color:'#FF8A80' }}>📤 -{fmt(totalSorties)}</span>
              </div>
            </div>

            {/* KPI grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              <div style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:'3px solid #2ECC71' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>Recettes séjours</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#1B3A6B' }}>{fmt(totalSejours)}</div>
                <div style={{ fontSize:'10px', color:'#999' }}>FCFA</div>
              </div>
              <div style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:'3px solid #C9A84C' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>RevPAR</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#1B3A6B' }}>{fmt(revPAR)}</div>
                <div style={{ fontSize:'10px', color:'#999' }}>FCFA / chambre</div>
              </div>
              <div style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:'3px solid #1B3A6B' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>Mouvements</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#1B3A6B' }}>{items.length}</div>
                <div style={{ fontSize:'10px', color:'#999' }}>opérations</div>
              </div>
              <div style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:'3px solid #E8634A' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>No-show conservés</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#E74C3C' }}>{fmt(totalNoShow)}</div>
                <div style={{ fontSize:'10px', color:'#999' }}>FCFA</div>
              </div>
            </div>

            {/* Modes de paiement */}
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                💳 Modes de paiement
              </div>
              <BarMode label="Espèces"        icon="💵" montant={especes} couleur="#2ECC71"/>
              <BarMode label="Orange Money"   icon="🟠" montant={om}      couleur="#FF6600"/>
              <BarMode label="MTN Mobile Money" icon="🟡" montant={momo}  couleur="#C9A84C"/>
              <BarMode label="Carte bancaire" icon="💳" montant={carte}   couleur="#1B3A6B"/>
            </div>

            {/* Détail mouvements */}
            <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>
              📋 Détail ({items.length} mouvement{items.length>1?'s':''})
            </div>
            {items.length===0 && <p style={{ fontSize:'13px', color:'#999', textAlign:'center', padding:'20px' }}>Aucun mouvement sur cette période</p>}
            {items.map((h,i) => (
              <div key={i} style={{ background:'white', borderRadius:'12px', padding:'12px 16px', marginBottom:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${h.type==='sortie'?'#E74C3C':h.noShow?'#E8634A':'#2ECC71'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>
                    {h.type==='sejour'?h.client:h.libelle}
                    {h.noShow && <span style={{ marginLeft:'6px', background:'#FFF0F0', color:'#E74C3C', fontSize:'9px', fontWeight:'700', padding:'2px 6px', borderRadius:'6px' }}>NO-SHOW</span>}
                  </span>
                  <span style={{ fontWeight:'800', fontSize:'13px', color:h.type==='sortie'?'#E74C3C':'#2ECC71' }}>
                    {h.type==='sortie'?'-':'+'}{fmt(h.montant)} FCFA
                  </span>
                </div>
                <div style={{ fontSize:'11px', color:'#999' }}>
                  {h.type==='sejour'?`Ch. ${h.chambre} · `:''}{h.mode} · {h.date}
                </div>
              </div>
            ))}
          </>
        )}

        {historique.length > 0 && onglet === 'revenus' && (
          <>
            {/* Répartition nuits vs heures */}
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                🌙 Nuits vs ⏱️ Heures
              </div>
              {(() => {
                const totalN = items.filter(h=>h.type==='sejour'&&!h.noShow).reduce((s,h)=>s+(h.montant||0),0) || 1
                const nuits  = items.filter(h=>h.type==='sejour'&&h.chambre&&!h.noShow).reduce((s,h)=>s+(h.montant||0),0)
                const heures = totalN - nuits
                const pctN = Math.round(nuits/totalN*100)
                const pctH = 100 - pctN
                return (
                  <>
                    <div style={{ display:'flex', height:'20px', borderRadius:'10px', overflow:'hidden', marginBottom:'10px' }}>
                      <div style={{ width:`${pctN}%`, background:'#1B3A6B' }}/>
                      <div style={{ width:`${pctH}%`, background:'#E8634A' }}/>
                    </div>
                    <div style={{ display:'flex', gap:'16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#1B3A6B' }}/>
                        <span style={{ fontSize:'12px', color:'#666' }}>Nuits {pctN}% · {fmt(nuits)} FCFA</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#E8634A' }}/>
                        <span style={{ fontSize:'12px', color:'#666' }}>Heures {pctH}% · {fmt(heures)} FCFA</span>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Recettes par vacation (basé sur cloture) */}
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                🔄 Recettes vs Dépenses
              </div>
              {[
                { label:'Total encaissé', montant:totalEntrees, couleur:'#2ECC71', icon:'📥' },
                { label:'Total dépensé', montant:totalSorties, couleur:'#E74C3C', icon:'📤' },
                { label:'Solde net',     montant:soldeNet,     couleur:'#C9A84C', icon:'💰' },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ fontSize:'13px', color:'#666' }}>{r.icon} {r.label}</span>
                  <span style={{ fontWeight:'800', fontSize:'14px', color:r.couleur }}>{fmt(r.montant)} FCFA</span>
                </div>
              ))}
            </div>

            {/* Sorties détaillées */}
            {items.filter(h=>h.type==='sortie').length > 0 && (
              <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>
                  📤 Détail dépenses
                </div>
                {items.filter(h=>h.type==='sortie').map((h,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F0F0F0' }}>
                    <span style={{ fontSize:'13px', color:'#1B3A6B', fontWeight:'600' }}>{h.libelle}</span>
                    <span style={{ fontWeight:'700', fontSize:'13px', color:'#E74C3C' }}>-{fmt(h.montant)} FCFA</span>
                  </div>
                ))}
              </div>
            )}

            {/* Par mode de paiement détaillé */}
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                💳 Encaissements par mode
              </div>
              {[
                { icon:'💵', label:'Espèces',          montant:especes, couleur:'#2ECC71' },
                { icon:'🟠', label:'Orange Money',      montant:om,      couleur:'#FF6600' },
                { icon:'🟡', label:'MTN Mobile Money',  montant:momo,    couleur:'#C9A84C' },
                { icon:'💳', label:'Carte bancaire',    montant:carte,   couleur:'#1B3A6B' },
              ].map(m => (
                <div key={m.label} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ fontSize:'20px' }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'12px', color:'#666', marginBottom:'3px' }}>{m.label}</div>
                    <div style={{ background:'#F0F0F0', borderRadius:'4px', height:'6px', overflow:'hidden' }}>
                      <div style={{ width:`${Math.round(m.montant/totalModes*100)}%`, background:m.couleur, height:'100%' }}/>
                    </div>
                  </div>
                  <span style={{ fontWeight:'800', fontSize:'13px', color:m.couleur, minWidth:'80px', textAlign:'right' }}>{fmt(m.montant)} F</span>
                </div>
              ))}
            </div>
          </>
        )}

        {historique.length > 0 && onglet === 'clients' && (
          <>
            {/* Top clients */}
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                🏆 Top clients
              </div>
              {topClients.length === 0 && (
                <p style={{ color:'#999', fontSize:'13px', textAlign:'center', padding:'20px' }}>Aucun client sur cette période</p>
              )}
              {topClients.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'18px', background: i===0?'#C9A84C':i===1?'#888':i===2?'#CD7F32':'#E0E0E0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', color:'white', fontSize:'14px', flexShrink:0 }}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':c.nom.charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>{c.nom}</div>
                    <div style={{ fontSize:'11px', color:'#999', marginTop:'2px' }}>{c.sejours} séjour{c.sejours>1?'s':''}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:'800', fontSize:'13px', color:'#C9A84C' }}>{fmt(c.total)} FCFA</div>
                    {i === 0 && <div style={{ fontSize:'10px', color:'#C9A84C', fontWeight:'700' }}>⭐ VIP</div>}
                    {i === 1 && <div style={{ fontSize:'10px', color:'#888', fontWeight:'700' }}>Régulier</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Statistiques clients */}
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                📊 Chiffres clés clients
              </div>
              {[
                { label:'Clients uniques', valeur: Object.keys(clientsMap).length, icon:'👥' },
                { label:'Séjours enregistrés', valeur: items.filter(h=>h.type==='sejour'&&!h.noShow).length, icon:'🏨' },
                { label:'Panier moyen / séjour', valeur: `${fmt(Math.round(totalSejours / Math.max(items.filter(h=>h.type==='sejour'&&!h.noShow).length, 1)))} FCFA`, icon:'💰' },
                { label:'Montant no-show conservé', valeur: `${fmt(totalNoShow)} FCFA`, icon:'🚫' },
              ].map(s => (
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ fontSize:'13px', color:'#666' }}>{s.icon} {s.label}</span>
                  <span style={{ fontWeight:'800', fontSize:'13px', color:'#1B3A6B' }}>{s.valeur}</span>
                </div>
              ))}
            </div>

            {/* Performances staff — bientôt */}
            <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'24px', marginBottom:'8px' }}>👥</div>
              <div style={{ color:'#C9A84C', fontWeight:'800', fontSize:'14px', marginBottom:'6px' }}>Performances du personnel</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginBottom:'12px' }}>Réceptionnistes, barmans, restauratrices — coming soon Phase 2</div>
              <div style={{ background:'rgba(201,168,76,0.2)', border:'1px solid #C9A84C', borderRadius:'10px', padding:'8px 12px', display:'inline-block' }}>
                <span style={{ color:'#C9A84C', fontSize:'12px', fontWeight:'700' }}>🔓 Module Staff · Phase 2</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Écran Mon Profil ─────────────────────────────────────────────────────────
function EcranMonProfil({ onClose, utilisateur, onProfilChange }) {
  const userId = utilisateur?.nom || 'directeur'
  const profilSauvegarde = lireProfil(userId)
  const [profil, setProfil] = useState({
    nom: utilisateur?.nom || '',
    telephone: profilSauvegarde?.telephone || '',
    photoUrl: profilSauvegarde?.photoUrl || null,
  })
  const [ancienMdp, setAncienMdp] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmerMdp, setConfirmerMdp] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreurMdp, setErreurMdp] = useState('')
  const [successMdp, setSuccessMdp] = useState(false)

  const roleInfo = ROLES_LABELS[utilisateur?.role] || ROLES_LABELS.receptionniste

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2*1024*1024) { alert('Maximum 2 Mo.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setProfil(prev => ({ ...prev, photoUrl:ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSauvegarder = () => {
    const profilMaj = { ...profil }
    sauvegarderProfil(userId, profilMaj)
    if (utilisateur?.role !== 'directeur') {
      const utilisateurs = lireUtilisateurs()
      sauvegarderUtilisateurs(utilisateurs.map(u => u.nom===utilisateur?.nom ? {...u,nom:profil.nom} : u))
    }
    setSauvegarde(true)
    setTimeout(() => setSauvegarde(false), 2000)
    if (onProfilChange) onProfilChange(profilMaj)
  }

  const handleChangerMdp = () => {
    setErreurMdp('')
    if (!ancienMdp||!nouveauMdp||!confirmerMdp) { setErreurMdp('Remplissez tous les champs.'); return }
    if (nouveauMdp !== confirmerMdp) { setErreurMdp('Les mots de passe ne correspondent pas.'); return }
    if (nouveauMdp.length < 4) { setErreurMdp('Minimum 4 caractères.'); return }
    if (utilisateur?.role === 'directeur') {
      if (ancienMdp !== 'admin1234') { setErreurMdp('Ancien mot de passe incorrect.'); return }
    } else {
      const u = lireUtilisateurs().find(u => u.nom===utilisateur?.nom)
      if (!u||u.motDePasse!==ancienMdp) { setErreurMdp('Ancien mot de passe incorrect.'); return }
      sauvegarderUtilisateurs(lireUtilisateurs().map(u2 => u2.nom===utilisateur?.nom ? {...u2,motDePasse:nouveauMdp} : u2))
    }
    setSuccessMdp(true)
    setTimeout(() => setSuccessMdp(false), 2000)
    setAncienMdp(''); setNouveauMdp(''); setConfirmerMdp('')
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Mon profil</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Informations personnelles</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ marginBottom:'20px', textAlign:'center' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            {profil.photoUrl ? (
              <img src={profil.photoUrl} alt="Photo" style={{ width:'90px', height:'90px', borderRadius:'45px', objectFit:'cover', border:'3px solid #C9A84C' }}/>
            ) : (
              <div style={{ width:'90px', height:'90px', borderRadius:'45px', background:'linear-gradient(135deg, #1B3A6B, #2C5282)', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #C9A84C' }}>
                <span style={{ fontSize:'32px', fontWeight:'800', color:'white' }}>{profil.nom?profil.nom.charAt(0).toUpperCase():roleInfo.emoji}</span>
              </div>
            )}
            <label style={{ position:'absolute', bottom:0, right:0, background:'#C9A84C', borderRadius:'50%', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid white' }}>
              <Camera size={14} color="white"/>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
            </label>
          </div>
          <div style={{ marginTop:'10px', fontWeight:'700', fontSize:'16px', color:'#1B3A6B' }}>{profil.nom}</div>
          <div style={{ fontSize:'12px', color:roleInfo.couleur, fontWeight:'600' }}>{roleInfo.emoji} {roleInfo.label}</div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>👤 INFORMATIONS PERSONNELLES</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input value={profil.nom} onChange={e=>setProfil({...profil,nom:e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input type="tel" value={profil.telephone} onChange={e=>setProfil({...profil,telephone:e.target.value})} placeholder="+237 6XX XXX XX" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Rôle</label>
              <div style={{ padding:'11px 14px', background:'#F5F5F5', borderRadius:'10px', fontSize:'14px', color:'#888', border:'2px solid #E0E0E0' }}>
                {roleInfo.emoji} {roleInfo.label} — non modifiable
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSauvegarder} style={{
          width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:sauvegarde?'#2ECC71':'#1B3A6B', color:'white', fontWeight:'800', fontSize:'14px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.3s', marginBottom:'24px'
        }}>
          <Save size={16}/>
          {sauvegarde ? '✅ Profil mis à jour !' : 'Enregistrer les informations'}
        </button>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🔑 CHANGER MON MOT DE PASSE</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label style={labelStyle}>Ancien mot de passe</label>
              <div style={{ position:'relative' }}>
                <input type={voirMdp?'text':'password'} value={ancienMdp} onChange={e=>setAncienMdp(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight:'44px' }}/>
                <button onClick={()=>setVoirMdp(!voirMdp)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' }}>
                  {voirMdp?<EyeOff size={16} color="#999"/>:<Eye size={16} color="#999"/>}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input type={voirMdp?'text':'password'} value={nouveauMdp} onChange={e=>setNouveauMdp(e.target.value)} placeholder="Minimum 4 caractères" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Confirmer</label>
              <input type={voirMdp?'text':'password'} value={confirmerMdp} onChange={e=>setConfirmerMdp(e.target.value)} placeholder="Répétez le mot de passe" style={inputStyle}/>
            </div>
            {erreurMdp && <div style={{ background:'#FFF0F0', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#E74C3C', fontWeight:'600' }}>⚠️ {erreurMdp}</div>}
            {successMdp && <div style={{ background:'#E8F5E9', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#2ECC71', fontWeight:'600' }}>✅ Mot de passe mis à jour !</div>}
            <button onClick={handleChangerMdp} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'700', fontSize:'14px' }}>
              🔑 Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Écran Identité ───────────────────────────────────────────────────────────
function EcranIdentite({ onClose, onIdentiteChange }) {
  const [identite, setIdentite] = useState(() => {
    try { const s=localStorage.getItem('homs_identite'); return s?JSON.parse(s):identiteDefaut } catch { return identiteDefaut }
  })
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size>2*1024*1024) { alert('Maximum 2 Mo.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setIdentite(prev=>({...prev,logoUrl:ev.target.result}))
    reader.readAsDataURL(file)
  }

  const handleSauvegarder = () => {
    try {
      localStorage.setItem('homs_identite', JSON.stringify(identite))
      setSauvegarde(true)
      setTimeout(()=>setSauvegarde(false),2000)
      if (onIdentiteChange) onIdentiteChange(identite)
    } catch { alert('Erreur lors de la sauvegarde.') }
  }

  const champ = (label,cle,placeholder,type='text') => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={identite[cle]} placeholder={placeholder} onChange={e=>setIdentite({...identite,[cle]:e.target.value})} style={inputStyle}/>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Identité de l'établissement</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Logo, en-tête, contacts, infos légales</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🖼️ LOGO</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            {identite.logoUrl ? (
              <div style={{ textAlign:'center' }}>
                <img src={identite.logoUrl} alt="Logo" style={{ maxHeight:'100px', maxWidth:'100%', borderRadius:'8px', marginBottom:'10px' }}/>
                <br/>
                <label style={{ cursor:'pointer', color:'#1B3A6B', fontWeight:'700', fontSize:'13px', textDecoration:'underline' }}>
                  Changer le logo<input type="file" accept="image/*" onChange={handleLogo} style={{ display:'none' }}/>
                </label>
              </div>
            ) : (
              <label style={{ cursor:'pointer', display:'block' }}>
                <div style={{ border:'2px dashed #C9A84C', borderRadius:'10px', padding:'24px', textAlign:'center', background:'#FFFDF5' }}>
                  <Upload size={28} color="#C9A84C"/>
                  <div style={{ fontSize:'13px', color:'#888', marginTop:'8px', fontWeight:'600' }}>Appuyer pour choisir un logo</div>
                  <div style={{ fontSize:'11px', color:'#BBB', marginTop:'4px' }}>PNG ou JPG · max 2 Mo</div>
                </div>
                <input type="file" accept="image/*" onChange={handleLogo} style={{ display:'none' }}/>
              </label>
            )}
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🏨 EN-TÊTE DES REÇUS</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            {champ("Nom de l'établissement",'nom','Ex. HOMS-HÔTEL')}
            {champ('Slogan / devise','slogan','Ex. Votre confort, notre priorité')}
            {champ('Adresse complète','adresse','Rue, quartier, ville...')}
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>📞 CONTACTS</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={labelStyle}>Téléphone 1</label>
                <input type="tel" value={identite.telephone1} placeholder="+237 6XX XXX XX" onChange={e=>setIdentite({...identite,telephone1:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Téléphone 2</label>
                <input type="tel" value={identite.telephone2} placeholder="Optionnel" onChange={e=>setIdentite({...identite,telephone2:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            {champ('Email','email','hotel@exemple.com','email')}
          </div>
        </div>
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>📄 INFOS LÉGALES</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={labelStyle}>N° RCCM</label>
                <input value={identite.rccm} placeholder="Optionnel" onChange={e=>setIdentite({...identite,rccm:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>N° Contribuable</label>
                <input value={identite.contribuable} placeholder="Optionnel" onChange={e=>setIdentite({...identite,contribuable:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Mention sur les reçus</label>
              <textarea value={identite.mentionLegale} placeholder="Ex. Merci de votre confiance." onChange={e=>setIdentite({...identite,mentionLegale:e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical', fontFamily:'inherit' }}/>
            </div>
          </div>
        </div>
        <button onClick={handleSauvegarder} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:sauvegarde?'#2ECC71':'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.3s'
        }}>
          <Save size={18}/>{sauvegarde?'✅ Informations enregistrées !':'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

// ─── Écran Utilisateurs ───────────────────────────────────────────────────────
function EcranUtilisateurs({ onClose }) {
  const [utilisateurs, setUtilisateurs] = useState(()=>lireUtilisateurs())
  const [showForm, setShowForm] = useState(false)
  const [showMdp, setShowMdp] = useState({})
  const [form, setForm] = useState({ nom:'', role:'receptionniste', motDePasse:'', questionSecrete:QUESTIONS_SECRETES[0], reponseSecrete:'' })
  const [sauvegarde, setSauvegarde] = useState(false)

  const sauver = (liste) => { setUtilisateurs(liste); sauvegarderUtilisateurs(liste) }

  const handleAjouter = () => {
    if (!form.nom.trim()||!form.motDePasse.trim()||!form.reponseSecrete.trim()) { alert('Remplissez tous les champs.'); return }
    if (form.motDePasse.length<4) { alert('Mot de passe : minimum 4 caractères.'); return }
    sauver([...utilisateurs, { id:Date.now(), nom:form.nom.trim(), role:form.role, motDePasse:form.motDePasse, questionSecrete:form.questionSecrete, reponseSecrete:form.reponseSecrete.trim(), actif:true, derniereConnexion:null, dateCreation:new Date().toLocaleDateString('fr-FR') }])
    setForm({ nom:'', role:'receptionniste', motDePasse:'', questionSecrete:QUESTIONS_SECRETES[0], reponseSecrete:'' })
    setShowForm(false); setSauvegarde(true); setTimeout(()=>setSauvegarde(false),2000)
  }

  const toggleActif = (id) => sauver(utilisateurs.map(u=>u.id===id?{...u,actif:!u.actif}:u))
  const supprimer = (id) => { if(!window.confirm('Supprimer ?')) return; sauver(utilisateurs.filter(u=>u.id!==id)) }
  const roleInfo = (role) => ROLES_LABELS[role]||{ label:role, couleur:'#999', emoji:'👤' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Utilisateurs & Rôles</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>{utilisateurs.length} compte{utilisateurs.length>1?'s':''}</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ background:'#FFFBF0', border:'1px solid #C9A84C', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <span style={{ fontSize:'20px' }}>👔</span>
            <span style={{ fontWeight:'800', fontSize:'14px', color:'#1B3A6B' }}>Directeur</span>
            <span style={{ background:'#C9A84C', color:'white', fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px' }}>Par défaut</span>
          </div>
          <div style={{ fontSize:'12px', color:'#888' }}>Mot de passe : <strong>admin1234</strong> · Toujours actif</div>
          <div style={{ fontSize:'11px', color:'#C9A84C', marginTop:'4px', fontWeight:'600' }}>⚠️ À changer avant la mise en production</div>
        </div>

        {utilisateurs.length===0&&!showForm&&(
          <div style={{ textAlign:'center', padding:'30px 20px', color:'#999' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>👥</div>
            <p style={{ fontSize:'13px' }}>Aucun compte créé</p>
          </div>
        )}

        {utilisateurs.map(u=>{
          const ri=roleInfo(u.role)
          return (
            <div key={u.id} style={{ background:u.actif?'white':'#F9F9F9', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:`4px solid ${u.actif?ri.couleur:'#CCC'}`, opacity:u.actif?1:0.7 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'20px' }}>{ri.emoji}</span>
                  <div>
                    <div style={{ fontWeight:'800', fontSize:'14px', color:'#1B3A6B' }}>{u.nom}</div>
                    <span style={{ background:ri.couleur+'22', color:ri.couleur, fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'8px' }}>{ri.label}</span>
                  </div>
                </div>
                <span style={{ background:u.actif?'#E8F5E9':'#FFEBEE', color:u.actif?'#2ECC71':'#E74C3C', fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px' }}>
                  {u.actif?'✅ Actif':'🔴 Désactivé'}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <span style={{ fontSize:'12px', color:'#666' }}>🔑 {showMdp[u.id]?u.motDePasse:'••••••••'}</span>
                <button onClick={()=>setShowMdp(p=>({...p,[u.id]:!p[u.id]}))} style={{ background:'none', border:'none', cursor:'pointer', padding:'2px' }}>
                  {showMdp[u.id]?<EyeOff size={14} color="#999"/>:<Eye size={14} color="#999"/>}
                </button>
              </div>
              <div style={{ fontSize:'11px', color:'#999', marginBottom:'10px', display:'flex', alignItems:'center', gap:'4px' }}>
                <Clock size={11}/>{u.derniereConnexion?`Dernière connexion : ${u.derniereConnexion}`:'Jamais connecté'}
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>toggleActif(u.id)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'12px', background:u.actif?'#FFF0F0':'#E8F5E9', color:u.actif?'#E74C3C':'#2ECC71', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                  {u.actif?<><UserX size={13}/>Désactiver</>:<><UserCheck size={13}/>Activer</>}
                </button>
                <button onClick={()=>supprimer(u.id)} style={{ padding:'8px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#FFF0F0', color:'#E74C3C', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          )
        })}

        {showForm && (
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', border:'2px solid #1B3A6B' }}>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'#1B3A6B', marginBottom:'14px' }}>➕ Nouveau compte</div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Nom complet <span style={{color:'red'}}>*</span></label>
              <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Ex. Jean Dupont" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Rôle <span style={{color:'red'}}>*</span></label>
              <div style={{ display:'flex', gap:'8px' }}>
                {['receptionniste','caissier'].map(r=>{ const ri=roleInfo(r); return (
                  <button key={r} onClick={()=>setForm({...form,role:r})} style={{ flex:1, padding:'10px 6px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', cursor:'pointer', background:form.role===r?ri.couleur:'#F0F0F0', color:form.role===r?'white':'#555', border:form.role===r?`2px solid ${ri.couleur}`:'2px solid transparent' }}>
                    {ri.emoji} {ri.label}
                  </button>
                )})}
              </div>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Mot de passe <span style={{color:'red'}}>*</span></label>
              <input type="password" value={form.motDePasse} onChange={e=>setForm({...form,motDePasse:e.target.value})} placeholder="Minimum 4 caractères" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Question secrète <span style={{color:'red'}}>*</span></label>
              <select value={form.questionSecrete} onChange={e=>setForm({...form,questionSecrete:e.target.value})} style={{ ...inputStyle, background:'white' }}>
                {QUESTIONS_SECRETES.map(q=><option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Réponse secrète <span style={{color:'red'}}>*</span></label>
              <input value={form.reponseSecrete} onChange={e=>setForm({...form,reponseSecrete:e.target.value})} placeholder="Réponse à la question secrète" style={inputStyle}/>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', background:'#F0F0F0', fontWeight:'700', color:'#666', border:'none', cursor:'pointer' }}>Annuler</button>
              <button onClick={handleAjouter} style={{ flex:2, padding:'12px', borderRadius:'10px', background:'#1B3A6B', fontWeight:'700', color:'white', border:'none', cursor:'pointer' }}>✅ Créer le compte</button>
            </div>
          </div>
        )}

        {!showForm && (
          <button onClick={()=>setShowForm(true)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'2px dashed #1B3A6B', background:'transparent', color:'#1B3A6B', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter un agent
          </button>
        )}

        {sauvegarde && (
          <div style={{ marginTop:'12px', background:'#E8F5E9', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#2ECC71', fontWeight:'700', textAlign:'center' }}>
            ✅ Compte créé avec succès !
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Écran Directeur ──────────────────────────────────────────────────────────
function EcranDirecteur({ onClose }) {
  const [params, setParams] = useState(paramsDefaut)
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleSauvegarder = () => { setSauvegarde(true); setTimeout(()=>setSauvegarde(false),2000) }
  const ajouterVacation = () => setParams({...params,vacations:[...params.vacations,{id:Date.now(),nom:'Nouvelle vacation',debut:'00:00',fin:'08:00'}]})
  const supprimerVacation = (id) => setParams({...params,vacations:params.vacations.filter(v=>v.id!==id)})
  const modifierVacation = (id,champ,valeur) => setParams({...params,vacations:params.vacations.map(v=>v.id===id?{...v,[champ]:valeur}:v)})

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Paramètres Directeur</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Configuration de l'établissement</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🏨 ÉTABLISSEMENT</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom:'14px' }}>
              <label style={labelStyle}>Nom de l'hôtel</label>
              <input value={params.nomHotel} onChange={e=>setParams({...params,nomHotel:e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Nombre total de chambres</label>
              <input value={params.totalChambres} type="number" onChange={e=>setParams({...params,totalChambres:Number(e.target.value)})} style={inputStyle}/>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>⏱️ TOLÉRANCE DÉPASSEMENT</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <label style={labelStyle}>Durée de grâce après l'heure de départ prévue</label>
            <p style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>En dessous → pas de supplément. Au-dessus → supplément calculé.</p>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <input value={params.toleranceMinutes} type="number" min="0" max="120" onChange={e=>setParams({...params,toleranceMinutes:Number(e.target.value)})} style={{ ...inputStyle, width:'100px', fontSize:'22px', fontWeight:'800', textAlign:'center' }}/>
              <span style={{ fontSize:'16px', fontWeight:'700', color:'#1B3A6B' }}>minutes</span>
            </div>
            <div style={{ marginTop:'10px', background:'#FFF8E1', borderRadius:'8px', padding:'10px 12px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
              <AlertTriangle size={14} color="#C9A84C" style={{ marginTop:'1px', flexShrink:0 }}/>
              <span style={{ fontSize:'12px', color:'#666' }}>Actuellement : <strong>{params.toleranceMinutes} minutes</strong> de grâce.</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🔄 VACATIONS</div>
          <p style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>Définissez les tranches horaires de vos équipes.</p>
          {params.vacations.map((v,i)=>(
            <div key={v.id} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #1B3A6B' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>Vacation {i+1}</span>
                {params.vacations.length>1&&<button onClick={()=>supprimerVacation(v.id)} style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer' }}><Trash2 size={14} color="#E74C3C"/></button>}
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={labelStyle}>Nom</label>
                <input value={v.nom} onChange={e=>modifierVacation(v.id,'nom',e.target.value)} style={inputStyle}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={labelStyle}>Début</label><input type="time" value={v.debut} onChange={e=>modifierVacation(v.id,'debut',e.target.value)} style={inputStyle}/></div>
                <div><label style={labelStyle}>Fin</label><input type="time" value={v.fin} onChange={e=>modifierVacation(v.id,'fin',e.target.value)} style={inputStyle}/></div>
              </div>
            </div>
          ))}
          <button onClick={ajouterVacation} style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #1B3A6B', background:'transparent', color:'#1B3A6B', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter une vacation
          </button>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🛏️ CHAMBRES</div>
          {params.categories.map((cat,i)=>(
            <div key={cat.id} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #C9A84C' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>Catégorie {i+1}</span>
                {params.categories.length>1&&<button onClick={()=>setParams({...params,categories:params.categories.filter(c=>c.id!==cat.id)})} style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer' }}><Trash2 size={14} color="#E74C3C"/></button>}
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={labelStyle}>Nom</label>
                <input value={cat.nom} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,nom:e.target.value}:c)})} style={inputStyle}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                <div><label style={labelStyle}>N° de début</label><input type="number" value={cat.debut} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,debut:Number(e.target.value)}:c)})} style={inputStyle}/></div>
                <div><label style={labelStyle}>Nb de chambres</label><input type="number" value={cat.nombre} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,nombre:Number(e.target.value)}:c)})} style={inputStyle}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={labelStyle}>Tarif / nuit</label><input type="number" value={cat.tarifNuit} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,tarifNuit:Number(e.target.value)}:c)})} style={inputStyle}/></div>
                <div><label style={labelStyle}>Tarif / heure</label><input type="number" value={cat.tarifHeure} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,tarifHeure:Number(e.target.value)}:c)})} style={inputStyle}/></div>
              </div>
              <div style={{ marginTop:'8px', background:'#F0F4FF', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#1B3A6B', fontWeight:'600' }}>
                📊 {cat.nombre} chambres · du {cat.debut+1} au {cat.debut+cat.nombre}
              </div>
            </div>
          ))}
          <button onClick={()=>setParams({...params,categories:[...params.categories,{id:Date.now(),nom:'Nouvelle catégorie',debut:400,nombre:5,tarifNuit:50000,tarifHeure:5000}]})} style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #C9A84C', background:'transparent', color:'#C9A84C', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter une catégorie
          </button>
          <div style={{ marginTop:'10px', background:'#EEF2FF', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#1B3A6B', fontWeight:'700' }}>
            🏨 Total : {params.categories.reduce((s,c)=>s+c.nombre,0)} chambres configurées
          </div>
        </div>
        <button onClick={handleSauvegarder} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer', background:sauvegarde?'#2ECC71':'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.3s' }}>
          <Save size={18}/>{sauvegarde?'✅ Paramètres sauvegardés !':'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}

// ─── Menu items Directeur ─────────────────────────────────────────────────────
const menuItemsDirecteur = [
  {
    section: 'Directeur / Gérant',
    items: [
      { icone:Settings,  label:'Paramètres directeur',        sous:'Vacations, tolérance, établissement',    couleur:'#C9A84C', action:'directeur' },
      { icone:Building2, label:"Identité de l'établissement", sous:'Logo, en-tête, contacts, infos légales', couleur:'#2C5282', action:'identite' },
      { icone:Users,     label:'Utilisateurs & rôles',        sous:'Gérer le personnel et les accès',        couleur:'#1B3A6B', action:'utilisateurs' },
      { icone:BarChart2, label:'Rapports & statistiques',     sous:'KPI, revenus, top clients',              couleur:'#2ECC71', action:'statistiques' },
    ]
  },
  {
    section: 'Mon compte',
    items: [
      { icone:User,  label:'Mon profil',        sous:'Photo, nom, téléphone, mot de passe', couleur:'#1B3A6B', action:'profil' },
      { icone:Hotel, label:'Mon établissement', sous:'Nom, adresse, contacts',              couleur:'#2C5282', action:null },
    ]
  },
  {
    section: 'Opérations',
    items: [
      { icone:Wrench,   label:'Maintenance',            sous:'Signalements et réparations', couleur:'#E74C3C', action:null },
      { icone:BookOpen, label:'Journal des opérations', sous:'Historique des activités',    couleur:'#1B3A6B', action:null },
    ]
  },
  {
    section: 'À propos',
    items: [
      { icone:Info, label:'À propos de HOMS', sous:'Version 1.0 — Homslovision', couleur:'#E8634A', action:null },
    ]
  },
]

export default function Menu({ onDeconnexion, onReinitialiser, historique=[], utilisateur }) {
  const [ecranActif, setEcranActif] = useState(null)
  const [identite, setIdentite] = useState(() => {
    try { const s=localStorage.getItem('homs_identite'); return s?JSON.parse(s):identiteDefaut } catch { return identiteDefaut }
  })

  const userId = utilisateur?.nom || 'directeur'
  const [profilUtilisateur, setProfilUtilisateur] = useState(()=>lireProfil(userId))

  const estDirecteur = utilisateur?.role === 'directeur'
  const roleInfo = ROLES_LABELS[utilisateur?.role] || ROLES_LABELS.receptionniste
  const nomAffiche = profilUtilisateur?.nom || utilisateur?.nom || 'Utilisateur'
  const photoAffichee = profilUtilisateur?.photoUrl || null
  const premiereLettre = nomAffiche ? nomAffiche.charAt(0).toUpperCase() : 'H'

  return (
    <>
      <div style={{ background:'#F5F7FA', minHeight:'100vh', paddingBottom:'80px' }}>
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'32px 20px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          {photoAffichee ? (
            <img src={photoAffichee} alt="Photo profil" style={{ width:'72px', height:'72px', borderRadius:'36px', objectFit:'cover', marginBottom:'12px', border:'3px solid #C9A84C' }}/>
          ) : identite.logoUrl && estDirecteur ? (
            <img src={identite.logoUrl} alt="Logo" style={{ width:'72px', height:'72px', borderRadius:'36px', objectFit:'cover', marginBottom:'12px', border:'3px solid #C9A84C' }}/>
          ) : (
            <div style={{ width:'72px', height:'72px', borderRadius:'36px', background:roleInfo.couleur, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', fontSize:'28px', fontWeight:'700', color:'white' }}>
              {premiereLettre}
            </div>
          )}
          <div style={{ color:'white', fontWeight:'700', fontSize:'18px' }}>{nomAffiche}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', marginTop:'4px' }}>
            {estDirecteur ? (identite.nom||'HOMS-HÔTEL') : roleInfo.label}
          </div>
          {identite.adresse && estDirecteur && <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', marginTop:'4px' }}>📍 {identite.adresse}</div>}
          <div style={{ marginTop:'12px', background:`${roleInfo.couleur}33`, border:`1px solid ${roleInfo.couleur}`, borderRadius:'20px', padding:'4px 16px', fontSize:'12px', color:roleInfo.couleur }}>
            {roleInfo.emoji} {roleInfo.label}
          </div>
        </div>

        <div style={{ padding:'16px 20px' }}>

          {estDirecteur && menuItemsDirecteur.map((section,si) => (
            <div key={si} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'4px' }}>
                {section.section}
              </div>
              <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                {section.items.map((item,ii) => {
                  const Icone = item.icone
                  return (
                    <div key={ii} onClick={()=>item.action&&setEcranActif(item.action)}
                      style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px', borderBottom:ii<section.items.length-1?'1px solid #F0F0F0':'none', cursor:item.action?'pointer':'default', background:item.action?'white':'#FAFAFA' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:item.couleur+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icone size={20} color={item.couleur}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:'600', fontSize:'14px', color:item.action?'#1F2937':'#AAA' }}>{item.label}</div>
                        <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
                          {item.action?item.sous:item.sous+' — bientôt disponible'}
                        </div>
                      </div>
                      <ChevronRight size={16} color={item.action?'#D1D5DB':'#E0E0E0'}/>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {!estDirecteur && (
            <>
              <BanniereAccesReserve/>
              <div style={{ marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'4px' }}>Mon compte</div>
                <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div onClick={()=>setEcranActif('profil')} style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px', cursor:'pointer', borderBottom:'1px solid #F0F0F0' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#1B3A6B15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <User size={20} color="#1B3A6B"/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:'600', fontSize:'14px', color:'#1F2937' }}>Mon profil</div>
                      <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Photo, nom, téléphone, mot de passe</div>
                    </div>
                    <ChevronRight size={16} color="#D1D5DB"/>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#E8634A15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Info size={20} color="#E8634A"/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:'600', fontSize:'14px', color:'#1F2937' }}>À propos de HOMS</div>
                      <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Version 1.0 — Homslovision</div>
                    </div>
                    <ChevronRight size={16} color="#D1D5DB"/>
                  </div>
                </div>
              </div>
            </>
          )}

          {estDirecteur && (
            <div onClick={()=>{ if(window.confirm('Effacer toutes les donnees de test ?')) { if(onReinitialiser) onReinitialiser() } }}
              style={{ background:'#FFFBEB', border:'1px dashed #C9A84C', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Trash2 size={20} color="#C9A84C"/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:'600', fontSize:'14px', color:'#C9A84C' }}>Reinitialiser les donnees</div>
                <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Outil de test - efface sejours et caisse</div>
              </div>
              <ChevronRight size={16} color="#D1D5DB"/>
            </div>
          )}

          <div onClick={onDeconnexion} style={{ background:'white', borderRadius:'16px', padding:'14px 16px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogOut size={20} color="#E74C3C"/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'600', fontSize:'14px', color:'#E74C3C' }}>Se déconnecter</div>
              <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Retour à l'écran de connexion</div>
            </div>
            <ChevronRight size={16} color="#D1D5DB"/>
          </div>

          <div style={{ textAlign:'center', paddingTop:'8px' }}>
            <img src="/logo-homslovision-blanc.png" alt="Homslovision" style={{ height:'32px', opacity:0.7 }} onError={e=>e.target.style.display='none'}/>
          </div>
        </div>
      </div>

      {ecranActif==='directeur'    && <EcranDirecteur onClose={()=>setEcranActif(null)}/>}
      {ecranActif==='identite'     && <EcranIdentite onClose={()=>setEcranActif(null)} onIdentiteChange={setIdentite}/>}
      {ecranActif==='utilisateurs' && <EcranUtilisateurs onClose={()=>setEcranActif(null)}/>}
      {ecranActif==='statistiques' && <EcranStatistiques onClose={()=>setEcranActif(null)} historique={historique}/>}
      {ecranActif==='profil'       && <EcranMonProfil onClose={()=>setEcranActif(null)} utilisateur={utilisateur} onProfilChange={(p)=>setProfilUtilisateur(p)}/>}
    </>
  )
}
