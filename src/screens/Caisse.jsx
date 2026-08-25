import { useState } from 'react'
import { TrendingUp, TrendingDown, Plus, X, Share2, FileText } from 'lucide-react'

const fmt = (n) => Number(n||0).toLocaleString('fr-FR')
const maintenant = () => new Date().toTimeString().slice(0, 5)
const aujourdhui = () => new Date().toLocaleDateString('fr-FR')

const modesEntree = [
  { val:'Especes',          icon:'💵' },
  { val:'Orange Money',     icon:'🟠' },
  { val:'MTN Mobile Money', icon:'🟡' },
  { val:'Carte bancaire',   icon:'💳' },
]
const modesSortie = [
  { val:'Especes',          icon:'💵' },
  { val:'Orange Money',     icon:'🟠' },
  { val:'MTN Mobile Money', icon:'🟡' },
  { val:'Carte bancaire',   icon:'💳' },
]

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

function FormulaireEntree({ onClose, onAjouter }) {
  const [form, setForm] = useState({ libelle:'', emetteurNom:'', emetteurContact:'', montant:'', mode:'Especes' })
  const ok = form.libelle.trim() && form.montant && Number(form.montant) > 0
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#2ECC71', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>ENTREE DIVERSE</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Nouvelle entree</h2>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Libelle <span style={{color:'red'}}>*</span></label>
          <input value={form.libelle} onChange={e=>setForm({...form,libelle:e.target.value})} placeholder="Ex. Boissons, Depot special..." style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Nom emetteur</label>
          <input value={form.emetteurNom} onChange={e=>setForm({...form,emetteurNom:e.target.value})} placeholder="Ex. M. Kouassi Jean" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Contact emetteur</label>
          <input value={form.emetteurContact} onChange={e=>setForm({...form,emetteurContact:e.target.value})} placeholder="+225 07 00 00 00 00" type="tel" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Mode de paiement</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {modesEntree.map(m=>(
              <button key={m.val} onClick={()=>setForm({...form,mode:m.val})} style={{ padding:'10px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:form.mode===m.val?'2px solid #2ECC71':'2px solid #E0E0E0', background:form.mode===m.val?'#F0FFF4':'white', color:form.mode===m.val?'#2ECC71':'#666' }}>{m.icon} {m.val}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={labelStyle}>Montant (FCFA) <span style={{color:'red'}}>*</span></label>
          <input value={form.montant} onChange={e=>setForm({...form,montant:e.target.value})} placeholder="0" type="number" style={{ ...inputStyle, fontSize:'20px', fontWeight:'700' }}/>
        </div>
        <button onClick={() => { if(!ok) return; onAjouter({ id:Date.now(), sens:'entree', libelle:form.libelle.trim(), emetteurNom:form.emetteurNom.trim(), emetteurContact:form.emetteurContact.trim(), montant:Number(form.montant), mode:form.mode, heure:maintenant() }); onClose() }}
          disabled={!ok} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:ok?'pointer':'not-allowed', background:ok?'#2ECC71':'#CCC', color:'white', fontWeight:'800', fontSize:'15px' }}>
          Enregistrer
        </button>
      </div>
    </div>
  )
}

function FormulaireSortie({ onClose, onAjouter }) {
  const [form, setForm] = useState({ libelle:'', beneficiaireNom:'', beneficiaireContact:'', montant:'', mode:'Especes' })
  const ok = form.libelle.trim() && form.montant && Number(form.montant) > 0
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#E74C3C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>SORTIE DIVERSE</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Nouvelle sortie</h2>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Libelle <span style={{color:'red'}}>*</span></label>
          <input value={form.libelle} onChange={e=>setForm({...form,libelle:e.target.value})} placeholder="Ex. Salaire, Achat..." style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Nom beneficiaire</label>
          <input value={form.beneficiaireNom} onChange={e=>setForm({...form,beneficiaireNom:e.target.value})} placeholder="Ex. Mme Toure Aminata" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Contact beneficiaire</label>
          <input value={form.beneficiaireContact} onChange={e=>setForm({...form,beneficiaireContact:e.target.value})} placeholder="+225 07 00 00 00 00" type="tel" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Mode de paiement</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {modesSortie.map(m=>(
              <button key={m.val} onClick={()=>setForm({...form,mode:m.val})} style={{ padding:'10px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:form.mode===m.val?'2px solid #E74C3C':'2px solid #E0E0E0', background:form.mode===m.val?'#FFF5F5':'white', color:form.mode===m.val?'#E74C3C':'#666' }}>{m.icon} {m.val}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={labelStyle}>Montant (FCFA) <span style={{color:'red'}}>*</span></label>
          <input value={form.montant} onChange={e=>setForm({...form,montant:e.target.value})} placeholder="0" type="number" style={{ ...inputStyle, fontSize:'20px', fontWeight:'700' }}/>
        </div>
        <button onClick={() => { if(!ok) return; onAjouter({ id:Date.now(), sens:'sortie', libelle:form.libelle.trim(), beneficiaireNom:form.beneficiaireNom.trim(), beneficiaireContact:form.beneficiaireContact.trim(), montant:Number(form.montant), mode:form.mode, heure:maintenant() }); onClose() }}
          disabled={!ok} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:ok?'pointer':'not-allowed', background:ok?'#E74C3C':'#CCC', color:'white', fontWeight:'800', fontSize:'15px' }}>
          Enregistrer la sortie
        </button>
      </div>
    </div>
  )
}

function ModalPassation({ sejours, entrees, sorties, caisse, onClose }) {
  const [form, setForm] = useState({ numeroPassation:'001', vacation:'Matin (06h00 - 14h00)', recSortantNom:'', recEntrantNom:'', clePortesRemises:'', clePortesTotal:'', cleCaisseRemises:'', cleCaisseTotal:'', incidents:'', observations:'' })

  const totalEspeces = [...sejours,...entrees].filter(p=>p.mode==='Especes'||p.modePaiement==='Especes').reduce((s,p)=>s+(p.montantNum||p.montant||0),0)
  const totalOM      = [...sejours,...entrees].filter(p=>p.mode==='Orange Money'||p.modePaiement==='Orange Money').reduce((s,p)=>s+(p.montantNum||p.montant||0),0)
  const totalMOMO    = [...sejours,...entrees].filter(p=>p.mode==='MTN Mobile Money'||p.modePaiement==='MTN Mobile Money').reduce((s,p)=>s+(p.montantNum||p.montant||0),0)
  const totalCarte   = [...sejours,...entrees].filter(p=>p.mode==='Carte bancaire'||p.modePaiement==='Carte bancaire').reduce((s,p)=>s+(p.montantNum||p.montant||0),0)
  const totalRecettes = (caisse.totalSejours||0) + (caisse.totalEntrees||0)
  const totalDepenses = caisse.totalSorties||0
  const solde = totalRecettes - totalDepenses

  const handleImprimer = () => {
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Passation</title>
<style>@page{size:A4;margin:12mm}*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;font-size:9pt}body{color:#111}h1{font-size:13pt;font-weight:900;color:#1B3A6B}h2{font-size:9pt;font-weight:700;color:#1B3A6B;margin-bottom:4px}.col2{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}.box{border:1.5px solid #CBD5E0;border-radius:5px;padding:7px 10px}.entete{display:flex;justify-content:space-between;border:2px solid #1B3A6B;border-radius:6px;padding:8px 12px;margin-bottom:6px}table{width:100%;border-collapse:collapse}td,th{padding:3px 6px;border:1px solid #CBD5E0}th{background:#1B3A6B;color:white;font-size:8pt}.total-row td{font-weight:800;background:#F0F4FF}.gold{color:#C9A84C;font-weight:800}.footer{text-align:center;margin-top:8px;font-size:8pt;color:#666;border-top:1px solid #CBD5E0;padding-top:4px}</style></head><body>
<div class="entete"><div><h1>HOMS-HOTEL</h1><div style="font-weight:700;font-size:10pt;margin-top:4px">PROCES-VERBAL DE PASSATION DE SERVICE</div></div><div style="text-align:right"><div><strong>N°:</strong> ${form.numeroPassation}</div><div><strong>Date:</strong> ${aujourdhui()}</div><div><strong>Vacation:</strong> ${form.vacation}</div></div></div>
<div class="col2"><div class="box"><h2>RECEPTIONNISTE SORTANT</h2><div>Nom: ${form.recSortantNom||"_______________"}</div><div style="margin-top:6px">Signature: _______________</div></div><div class="box"><h2>RECEPTIONNISTE ENTRANT</h2><div>Nom: ${form.recEntrantNom||"_______________"}</div><div style="margin-top:6px">Signature: _______________</div></div></div>
<div class="col2"><div class="box"><h2>RECETTES</h2><table><tr><td>Sejours nuits</td><td style="text-align:right">${fmt(caisse.totalNuits||0)} F</td></tr><tr><td>Sejours heures</td><td style="text-align:right">${fmt(caisse.totalHeures||0)} F</td></tr><tr><td>Entrees diverses</td><td style="text-align:right">${fmt(caisse.totalEntrees||0)} F</td></tr><tr class="total-row"><td>TOTAL</td><td style="text-align:right" class="gold">${fmt(totalRecettes)} F</td></tr></table></div><div class="box"><h2>DEPENSES</h2><table>${sorties.length===0?'<tr><td colspan="2" style="text-align:center;color:#999">Aucune</td></tr>':sorties.map(s=>`<tr><td>${s.libelle}</td><td style="text-align:right">${fmt(s.montant)} F</td></tr>`).join('')}<tr class="total-row"><td>TOTAL</td><td style="text-align:right;color:#E74C3C">${fmt(totalDepenses)} F</td></tr></table></div></div>
<div class="col2"><div class="box" style="background:#F0F4FF"><h2>SOLDE NET</h2><table><tr><td>Recettes</td><td style="text-align:right">${fmt(totalRecettes)} F</td></tr><tr><td>Depenses</td><td style="text-align:right;color:#E74C3C">- ${fmt(totalDepenses)} F</td></tr><tr class="total-row"><td>SOLDE NET</td><td style="text-align:right" class="gold">${fmt(solde)} F</td></tr><tr><td>Ecart</td><td style="text-align:right;color:#2ECC71;font-weight:800">0 F</td></tr></table></div><div class="box"><h2>PAR MODE</h2><table><tr><td>Especes</td><td style="text-align:right">${fmt(totalEspeces)} F</td></tr><tr><td>Orange Money</td><td style="text-align:right">${fmt(totalOM)} F</td></tr><tr><td>MTN MoMo</td><td style="text-align:right">${fmt(totalMOMO)} F</td></tr><tr><td>Carte</td><td style="text-align:right">${fmt(totalCarte)} F</td></tr><tr class="total-row"><td>SOLDE</td><td style="text-align:right" class="gold">${fmt(solde)} F</td></tr></table></div></div>
<div class="box" style="margin-bottom:6px"><h2>CLES ET CAISSE</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px"><div>Cles portes remises: <strong>${form.clePortesRemises||"__"}</strong> / disponibles: <strong>${form.clePortesTotal||"__"}</strong></div><div>Cles caisse remises: <strong>${form.cleCaisseRemises||"__"}</strong> / disponibles: <strong>${form.cleCaisseTotal||"__"}</strong></div></div></div>
<div class="col2"><div class="box"><h2>INCIDENTS</h2><div style="min-height:28px;border-bottom:1px solid #CCC;margin-bottom:4px">${form.incidents||''}</div></div><div class="box"><h2>OBSERVATIONS</h2><div style="min-height:28px;border-bottom:1px solid #CCC">${form.observations||''}</div></div></div>
<div class="box" style="margin-top:6px;display:flex;justify-content:space-between"><div>Valide par le Directeur: _______________</div><div>Signature: _______________</div></div>
<div class="footer">Imprime le ${aujourdhui()} - HOMS-HOTEL by Homslovision</div></body></html>`
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'92vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#C9A84C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>CLOTURE DE VACATION</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Passation de service</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          <div><label style={labelStyle}>N° Passation</label><input value={form.numeroPassation} onChange={e=>setForm({...form,numeroPassation:e.target.value})} style={inputStyle}/></div>
          <div><label style={labelStyle}>Vacation</label>
            <select value={form.vacation} onChange={e=>setForm({...form,vacation:e.target.value})} style={inputStyle}>
              <option>Matin (06h00 - 14h00)</option>
              <option>Apres-midi (14h00 - 22h00)</option>
              <option>Nuit (22h00 - 06h00)</option>
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          <div><label style={labelStyle}>Receptionniste sortant</label><input value={form.recSortantNom} onChange={e=>setForm({...form,recSortantNom:e.target.value})} placeholder="Nom complet" style={inputStyle}/></div>
          <div><label style={labelStyle}>Receptionniste entrant</label><input value={form.recEntrantNom} onChange={e=>setForm({...form,recEntrantNom:e.target.value})} placeholder="Nom complet" style={inputStyle}/></div>
        </div>
        <div style={{ background:'#F0F4FF', borderRadius:'10px', padding:'12px', marginBottom:'14px' }}>
          <label style={{ ...labelStyle, color:'#1B3A6B' }}>Cles de portes remises / disponibles</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <input value={form.clePortesRemises} onChange={e=>setForm({...form,clePortesRemises:e.target.value})} placeholder="Remises" type="number" style={inputStyle}/>
            <input value={form.clePortesTotal} onChange={e=>setForm({...form,clePortesTotal:e.target.value})} placeholder="Disponibles" type="number" style={inputStyle}/>
          </div>
          <label style={{ ...labelStyle, color:'#1B3A6B', marginTop:'10px' }}>Cles de caisse remises / disponibles</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <input value={form.cleCaisseRemises} onChange={e=>setForm({...form,cleCaisseRemises:e.target.value})} placeholder="Remises" type="number" style={inputStyle}/>
            <input value={form.cleCaisseTotal} onChange={e=>setForm({...form,cleCaisseTotal:e.target.value})} placeholder="Disponibles" type="number" style={inputStyle}/>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          <div><label style={labelStyle}>Incidents</label><textarea value={form.incidents} onChange={e=>setForm({...form,incidents:e.target.value})} placeholder="Aucun incident..." rows={3} style={{ ...inputStyle, resize:'none' }}/></div>
          <div><label style={labelStyle}>Observations</label><textarea value={form.observations} onChange={e=>setForm({...form,observations:e.target.value})} placeholder="RAS..." rows={3} style={{ ...inputStyle, resize:'none' }}/></div>
        </div>
        <button onClick={handleImprimer} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <FileText size={18}/> Generer et imprimer le PDF
        </button>
      </div>
    </div>
  )
}

export default function Caisse({ sejours=[], entreesDiverses=[], sortiesDiverses=[], onAjouterEntree, onAjouterSortie, caisse={} }) {
  const [onglet,        setOnglet]        = useState('sejours')
  const [showEntree,    setShowEntree]    = useState(false)
  const [showSortie,    setShowSortie]    = useState(false)
  const [showPassation, setShowPassation] = useState(false)

  // Totaux depuis App.jsx (état global)
  const totalSejours = Number(caisse.totalSejours  || 0)
  const totalNuits   = Number(caisse.totalNuits    || 0)
  const totalHeures  = Number(caisse.totalHeures   || 0)
  const totalEntrees = Number(caisse.totalEntrees  || 0)
  const totalSorties = Number(caisse.totalSorties  || 0)
  const totalGeneral = Number(caisse.soldeNet      || 0)

  // Totaux par mode (séjours + entrées diverses)
  const allIn = [
    ...sejours.map(s => ({ mode: s.modePaiement, montant: s.montantNum||0 })),
    ...entreesDiverses.map(e => ({ mode: e.mode, montant: e.montant||0 }))
  ]
  const tEspeces = allIn.filter(p=>p.mode==='Especes').reduce((s,p)=>s+p.montant,0)
  const tOM      = allIn.filter(p=>p.mode==='Orange Money').reduce((s,p)=>s+p.montant,0)
  const tMOMO    = allIn.filter(p=>p.mode==='MTN Mobile Money').reduce((s,p)=>s+p.montant,0)
  const tCarte   = allIn.filter(p=>p.mode==='Carte bancaire').reduce((s,p)=>s+p.montant,0)

  const handlePartager = () => {
    const texte = `HOMS-HOTEL - CAISSE DU ${aujourdhui()}\nSolde net: ${fmt(totalGeneral)} FCFA\nSejours: ${fmt(totalSejours)} | Entrees: ${fmt(totalEntrees)} | Sorties: -${fmt(totalSorties)}`
    if (navigator.share) navigator.share({ title:'Rapport caisse', text:texte })
    else window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }

  return (
    <div style={{ paddingBottom:'80px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space
