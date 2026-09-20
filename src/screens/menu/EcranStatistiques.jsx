import { useState } from 'react'
import { X } from 'lucide-react'

const fmt = (n) => Number(n||0).toLocaleString('fr-FR')

function parseDateFR(dateFR) {
  if (!dateFR) return null
  const [j, m, a] = dateFR.split('/').map(Number)
  if (!j||!m||!a) return null
  return new Date(a, m-1, j)
}

function estDansLaPeriode(dateFR, periode) {
  const d = parseDateFR(dateFR)
  if (!d) return false
  const now = new Date()
  if (periode==='jour') return d.getDate()===now.getDate()&&d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()
  if (periode==='semaine') {
    const debut=new Date(now); const jour=now.getDay()===0?7:now.getDay()
    debut.setDate(now.getDate()-jour+1); debut.setHours(0,0,0,0)
    return d>=debut&&d<=now
  }
  if (periode==='mois') return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()
  if (periode==='annee') return d.getFullYear()===now.getFullYear()
  return true
}

// ─── Courbe SVG ───────────────────────────────────────────────────────────────
function CourbeRevenu({ data, couleur='#1B3A6B', couleur2='#E74C3C' }) {
  if (!data || data.length === 0) return null
  const W = 320, H = 120, PAD = 30
  const maxVal = Math.max(...data.map(d=>Math.max(d.entrees,d.sorties)), 1)
  const x = (i) => PAD + (i / (data.length-1||1)) * (W - PAD*2)
  const y = (v) => H - PAD - (v/maxVal)*(H-PAD*2)
  const pointsEntrees = data.map((d,i)=>`${x(i)},${y(d.entrees)}`).join(' ')
  const pointsSorties = data.map((d,i)=>`${x(i)},${y(d.sorties)}`).join(' ')
  const aireEntrees = `M ${x(0)},${y(data[0].entrees)} ` +
    data.slice(1).map((d,i)=>`L ${x(i+1)},${y(d.entrees)}`).join(' ') +
    ` L ${x(data.length-1)},${H-PAD} L ${x(0)},${H-PAD} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
      {[0,0.25,0.5,0.75,1].map((t,i) => (
        <g key={i}>
          <line x1={PAD} y1={y(maxVal*t)} x2={W-PAD} y2={y(maxVal*t)} stroke="#F0F0F0" strokeWidth="1"/>
          <text x={PAD-4} y={y(maxVal*t)+4} fontSize="8" fill="#CCC" textAnchor="end">{Math.round(maxVal*t/1000)}k</text>
        </g>
      ))}
      {data.map((d,i) => (
        <text key={i} x={x(i)} y={H-4} fontSize="8" fill="#CCC" textAnchor="middle">{d.label}</text>
      ))}
      <path d={aireEntrees} fill={couleur} opacity="0.08"/>
      <polyline points={pointsEntrees} fill="none" stroke={couleur} strokeWidth="2" strokeLinejoin="round"/>
      <polyline points={pointsSorties} fill="none" stroke={couleur2} strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3"/>
      {data.map((d,i) => <circle key={i} cx={x(i)} cy={y(d.entrees)} r="3" fill={couleur} stroke="white" strokeWidth="1.5"/>)}
      {data.map((d,i) => <circle key={i} cx={x(i)} cy={y(d.sorties)} r="3" fill={couleur2} stroke="white" strokeWidth="1.5"/>)}
    </svg>
  )
}

// ─── Barres SVG ───────────────────────────────────────────────────────────────
function GraphBarres({ data }) {
  if (!data || data.length === 0) return null
  const W = 320, H = 120, PAD = 30
  const maxVal = Math.max(...data.map(d=>d.valeur), 1)
  const barW = (W - PAD*2) / data.length - 6
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[0,0.5,1].map((t,i) => (
        <g key={i}>
          <line x1={PAD} y1={PAD+(1-t)*(H-PAD*2)} x2={W-PAD} y2={PAD+(1-t)*(H-PAD*2)} stroke="#F0F0F0" strokeWidth="1"/>
          <text x={PAD-4} y={PAD+(1-t)*(H-PAD*2)+4} fontSize="8" fill="#CCC" textAnchor="end">{Math.round(maxVal*t/1000)}k</text>
        </g>
      ))}
      {data.map((d,i) => {
        const bx = PAD + i*((W-PAD*2)/data.length) + 3
        const bh = (d.valeur/maxVal)*(H-PAD*2)
        return (
          <g key={i}>
            <rect x={bx} y={H-PAD-bh} width={barW} height={bh} fill={d.couleur} rx="3"/>
            <text x={bx+barW/2} y={H-2} fontSize="8" fill="#CCC" textAnchor="middle">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Donut SVG ────────────────────────────────────────────────────────────────
function GraphDonut({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s,d)=>s+d.valeur,0) || 1
  const CX=80, CY=80, R=60, RI=38
  let angle = -Math.PI/2
  const arcs = data.map(d => {
    const slice = (d.valeur/total)*Math.PI*2
    const x1=CX+R*Math.cos(angle), y1=CY+R*Math.sin(angle)
    angle += slice
    const x2=CX+R*Math.cos(angle), y2=CY+R*Math.sin(angle)
    const xi1=CX+RI*Math.cos(angle-slice), yi1=CY+RI*Math.sin(angle-slice)
    const xi2=CX+RI*Math.cos(angle), yi2=CY+RI*Math.sin(angle)
    const large = slice > Math.PI ? 1 : 0
    return { ...d, path:`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${RI} ${RI} 0 ${large} 0 ${xi1} ${yi1} Z`, pct:Math.round(d.valeur/total*100) }
  })
  const maxItem = data.reduce((a,b)=>a.valeur>b.valeur?a:b, data[0])
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink:0 }}>
        {arcs.map((a,i) => <path key={i} d={a.path} fill={a.couleur}/>)}
        <text x={CX} y={CY-6} textAnchor="middle" fontSize="11" fill="#1B3A6B" fontWeight="700">{maxItem.pct}%</text>
        <text x={CX} y={CY+10} textAnchor="middle" fontSize="8" fill="#999">{maxItem.label}</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {arcs.map((a,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:a.couleur, flexShrink:0 }}/>
            <div>
              <div style={{ fontSize:'11px', color:'#666' }}>{a.label}</div>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'#1B3A6B' }}>{a.pct}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EcranStatistiques({ onClose, historique = [] }) {
  const [periode, setPeriode] = useState('mois')
  const [onglet, setOnglet] = useState('kpi')

  const items = historique.filter(h => estDansLaPeriode(h.date, periode))
  const totalEntrees = items.filter(h=>h.type==='sejour'||h.type==='entree').reduce((s,h)=>s+(h.montant||0),0)
  const totalSorties = items.filter(h=>h.type==='sortie').reduce((s,h)=>s+(h.montant||0),0)
  const soldeNet     = totalEntrees - totalSorties
  const totalSejours = items.filter(h=>h.type==='sejour'&&!h.noShow).reduce((s,h)=>s+(h.montant||0),0)
  const totalNoShow  = items.filter(h=>h.noShow).reduce((s,h)=>s+(h.montant||0),0)
  const especes = items.filter(h=>(h.type==='sejour'||h.type==='entree')&&h.mode==='Espèces').reduce((s,h)=>s+(h.montant||0),0)
  const om      = items.filter(h=>(h.type==='sejour'||h.type==='entree')&&h.mode==='Orange Money').reduce((s,h)=>s+(h.montant||0),0)
  const momo    = items.filter(h=>(h.type==='sejour'||h.type==='entree')&&h.mode==='MTN Mobile Money').reduce((s,h)=>s+(h.montant||0),0)
  const carte   = items.filter(h=>(h.type==='sejour'||h.type==='entree')&&h.mode==='Carte bancaire').reduce((s,h)=>s+(h.montant||0),0)

  const clientsMap = {}
  items.filter(h=>h.type==='sejour'&&!h.noShow).forEach(h => {
    if (!h.client) return
    if (!clientsMap[h.client]) clientsMap[h.client] = { nom:h.client, total:0, sejours:0 }
    clientsMap[h.client].total += h.montant||0
    clientsMap[h.client].sejours += 1
  })
  const topClients = Object.values(clientsMap).sort((a,b)=>b.total-a.total).slice(0,5)

  const donneesCourbeSemaine = () => {
    const jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
    return jours.map((label, i) => {
      const now = new Date()
      const debutSemaine = new Date(now)
      const jour = now.getDay()===0?7:now.getDay()
      debutSemaine.setDate(now.getDate()-jour+1)
      debutSemaine.setHours(0,0,0,0)
      const jourCible = new Date(debutSemaine)
      jourCible.setDate(debutSemaine.getDate()+i)
      const itemsJour = historique.filter(h => {
        const d = parseDateFR(h.date)
        return d && d.toDateString()===jourCible.toDateString()
      })
      return {
        label,
        entrees: itemsJour.filter(h=>h.type==='sejour'||h.type==='entree').reduce((s,h)=>s+(h.montant||0),0),
        sorties: itemsJour.filter(h=>h.type==='sortie').reduce((s,h)=>s+(h.montant||0),0),
      }
    })
  }

  const donneesMois = () => {
    const moisLabels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
    return moisLabels.map((label, i) => {
      const itemsMois = historique.filter(h => {
        const d = parseDateFR(h.date)
        return d && d.getMonth()===i && d.getFullYear()===new Date().getFullYear()
      })
      return {
        label,
        entrees: itemsMois.filter(h=>h.type==='sejour'||h.type==='entree').reduce((s,h)=>s+(h.montant||0),0),
        sorties: itemsMois.filter(h=>h.type==='sortie').reduce((s,h)=>s+(h.montant||0),0),
      }
    })
  }

  const donneesCourbe = periode==='annee' ? donneesMois() : donneesCourbeSemaine()
  const revPAR = Math.round(totalSejours / 50)
  const periodes = [{id:'jour',label:'Jour'},{id:'semaine',label:'Semaine'},{id:'mois',label:'Mois'},{id:'annee',label:'Année'}]
  const onglets  = [{id:'kpi',label:'KPI'},{id:'revenus',label:'Revenus'},{id:'clients',label:'Clients'}]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'#F5F7FA', overflowY:'auto', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Statistiques</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'2px' }}>Reporting & analyses</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
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

        {/* ── KPI ── */}
        {historique.length > 0 && onglet === 'kpi' && (
          <>
            <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', borderRadius:'16px', padding:'20px', marginBottom:'12px' }}>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)', marginBottom:'6px' }}>💰 Solde net · {periodes.find(p=>p.id===periode)?.label}</div>
              <div style={{ fontSize:'34px', fontWeight:'800', color:'#C9A84C' }}>{fmt(soldeNet)} FCFA</div>
              <div style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'12px', color:'rgba(255,255,255,0.8)' }}>
                <span>📥 +{fmt(totalEntrees)}</span>
                <span style={{ color:'#FF8A80' }}>📤 -{fmt(totalSorties)}</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {[
                { label:'Recettes séjours', valeur:`${fmt(totalSejours)} FCFA`, couleur:'#2ECC71', icon:'🏨' },
                { label:'RevPAR',           valeur:`${fmt(revPAR)} FCFA`,       couleur:'#C9A84C', icon:'📊' },
                { label:'Mouvements',       valeur:items.length,                couleur:'#1B3A6B', icon:'📋' },
                { label:'No-show conservés',valeur:`${fmt(totalNoShow)} FCFA`,  couleur:'#E8634A', icon:'🚫' },
              ].map(k => (
                <div key={k.label} style={{ background:'white', borderRadius:'12px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderTop:`3px solid ${k.couleur}` }}>
                  <div style={{ fontSize:'18px', marginBottom:'4px' }}>{k.icon}</div>
                  <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{k.label}</div>
                  <div style={{ fontSize:'16px', fontWeight:'800', color:'#1B3A6B' }}>{k.valeur}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
                💳 Répartition par mode de paiement
              </div>
              <GraphDonut data={[
                { label:'Espèces',   valeur:especes, couleur:'#2ECC71' },
                { label:'Orange M.', valeur:om,      couleur:'#FF6600' },
                { label:'MTN MoMo',  valeur:momo,    couleur:'#C9A84C' },
                { label:'Carte',     valeur:carte,   couleur:'#1B3A6B' },
              ].filter(d=>d.valeur>0)}/>
            </div>
          </>
        )}

        {/* ── REVENUS ── */}
        {historique.length > 0 && onglet === 'revenus' && (
          <>
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>📈 Évolution des recettes</div>
              <div style={{ fontSize:'11px', color:'#CCC', marginBottom:'12px' }}>{periode==='annee'?'Par mois':'Par jour de la semaine'}</div>
              <CourbeRevenu data={donneesCourbe} couleur="#1B3A6B" couleur2="#E74C3C"/>
              <div style={{ display:'flex', gap:'16px', marginTop:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <div style={{ width:'12px', height:'3px', background:'#1B3A6B', borderRadius:'2px' }}/>
                  <span style={{ fontSize:'11px', color:'#666' }}>Recettes</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <div style={{ width:'12px', height:'3px', background:'#E74C3C', borderRadius:'2px' }}/>
                  <span style={{ fontSize:'11px', color:'#666' }}>Dépenses</span>
                </div>
              </div>
            </div>

            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>💳 Revenus par mode de paiement</div>
              <div style={{ fontSize:'11px', color:'#CCC', marginBottom:'12px' }}>Comparaison des canaux</div>
              <GraphBarres data={[
                { label:'Espèces', valeur:especes, couleur:'#2ECC71' },
                { label:'OM',      valeur:om,      couleur:'#FF6600' },
                { label:'MoMo',    valeur:momo,    couleur:'#C9A84C' },
                { label:'Carte',   valeur:carte,   couleur:'#1B3A6B' },
              ]}/>
            </div>

            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>📊 Récapitulatif</div>
              {[
                { label:'Total encaissé', montant:totalEntrees, couleur:'#2ECC71', icon:'📥' },
                { label:'Total dépensé',  montant:totalSorties, couleur:'#E74C3C', icon:'📤' },
                { label:'Solde net',      montant:soldeNet,     couleur:'#C9A84C', icon:'💰' },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ fontSize:'13px', color:'#666' }}>{r.icon} {r.label}</span>
                  <span style={{ fontWeight:'800', fontSize:'14px', color:r.couleur }}>{fmt(r.montant)} FCFA</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CLIENTS ── */}
        {historique.length > 0 && onglet === 'clients' && (
          <>
            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>🏆 Top clients</div>
              {topClients.length === 0 && <p style={{ color:'#999', fontSize:'13px', textAlign:'center', padding:'20px' }}>Aucun client sur cette période</p>}
              {topClients.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'18px', background:i===0?'#C9A84C':i===1?'#888':i===2?'#CD7F32':'#E0E0E0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', color:'white', fontSize:'14px', flexShrink:0 }}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':c.nom.charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>{c.nom}</div>
                    <div style={{ fontSize:'11px', color:'#999' }}>{c.sejours} séjour{c.sejours>1?'s':''}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:'800', fontSize:'13px', color:'#C9A84C' }}>{fmt(c.total)} FCFA</div>
                    {i===0 && <div style={{ fontSize:'10px', color:'#C9A84C', fontWeight:'700' }}>⭐ VIP</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>📊 Chiffres clés</div>
              {[
                { label:'Clients uniques',       valeur:Object.keys(clientsMap).length, icon:'👥' },
                { label:'Séjours enregistrés',   valeur:items.filter(h=>h.type==='sejour'&&!h.noShow).length, icon:'🏨' },
                { label:'Panier moyen / séjour', valeur:`${fmt(Math.round(totalSejours/Math.max(items.filter(h=>h.type==='sejour'&&!h.noShow).length,1)))} FCFA`, icon:'💰' },
                { label:'No-show conservés',     valeur:`${fmt(totalNoShow)} FCFA`, icon:'🚫' },
              ].map(s => (
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ fontSize:'13px', color:'#666' }}>{s.icon} {s.label}</span>
                  <span style={{ fontWeight:'800', fontSize:'13px', color:'#1B3A6B' }}>{s.valeur}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', borderRadius:'14px', padding:'20px', textAlign:'center' }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>👥</div>
              <div style={{ color:'#C9A84C', fontWeight:'800', fontSize:'15px', marginBottom:'6px' }}>Performances du personnel</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginBottom:'12px' }}>Réceptionnistes · Barmans · Restauratrices</div>
              <div style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'10px', padding:'8px 14px', display:'inline-block' }}>
                <span style={{ color:'#C9A84C', fontSize:'12px', fontWeight:'700' }}>🔓 Module Staff · Phase 2</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
