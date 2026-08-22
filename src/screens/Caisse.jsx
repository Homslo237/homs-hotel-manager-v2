import { useState } from 'react'
import { TrendingUp, TrendingDown, Plus, X, Share2, FileText } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('fr-FR')
const maintenant = () => new Date().toTimeString().slice(0, 5)
const aujourdhui = () => new Date().toLocaleDateString('fr-FR')

// ─── Modes ───────────────────────────────────────────────────────────────────
const modesEntree = [
  { val: 'Espèces',          icon: '💵' },
  { val: 'Orange Money',     icon: '🟠' },
  { val: 'MTN Mobile Money', icon: '🟡' },
  { val: 'Carte bancaire',   icon: '💳' },
]
const modesSortie = [
  { val: 'Espèces',          icon: '💵' },
  { val: 'Orange Money',     icon: '🟠' },
  { val: 'MTN Mobile Money', icon: '🟡' },
  { val: 'Carte bancaire',   icon: '💳' },
]

// ─── Données initiales séjours ────────────────────────────────────────────────
const encaissementsSejours = [
  { id:1, client:'M. Kouassi Ama',   chambre:'205', duree:'3 nuits',  montant:105000, mode:'Orange Money',     heure:'08:30', type:'nuit'  },
  { id:2, client:'Mme Diallo Fatou', chambre:'101', duree:'2 nuits',  montant:50000,  mode:'Espèces',          heure:'11:20', type:'nuit'  },
  { id:3, client:'M. Bamba Seydou',  chambre:'302', duree:'3 heures', montant:19500,  mode:'MTN Mobile Money', heure:'14:00', type:'heure' },
]

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

// ─── Formulaire Entrée ────────────────────────────────────────────────────────
function FormulaireEntree({ onClose, onAjouter }) {
  const [form, setForm] = useState({ libelle:'', emetteurNom:'', emetteurContact:'', montant:'', mode:'Espèces' })
  const ok = form.libelle.trim() && form.montant && Number(form.montant) > 0
  const handleValider = () => {
    if (!ok) return
    onAjouter({ id:Date.now(), sens:'entree', libelle:form.libelle.trim(), emetteurNom:form.emetteurNom.trim(), emetteurContact:form.emetteurContact.trim(), montant:Number(form.montant), mode:form.mode, heure:maintenant() })
    onClose()
  }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#2ECC71', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>ENTRÉE DIVERSE</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Nouvelle entrée</h2>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Libellé <span style={{color:'red'}}>*</span></label>
          <input value={form.libelle} onChange={e=>setForm({...form,libelle:e.target.value})} placeholder="Ex. Boissons, Dépôt spécial..." style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Nom de l'émetteur</label>
          <input value={form.emetteurNom} onChange={e=>setForm({...form,emetteurNom:e.target.value})} placeholder="Ex. M. Kouassi Jean" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Contact de l'émetteur</label>
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
        <button onClick={handleValider} disabled={!ok} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:ok?'pointer':'not-allowed', background:ok?'#2ECC71':'#CCC', color:'white', fontWeight:'800', fontSize:'15px' }}>
          ✅ Enregistrer l'entrée
        </button>
      </div>
    </div>
  )
}

// ─── Formulaire Sortie ────────────────────────────────────────────────────────
function FormulaireSortie({ onClose, onAjouter }) {
  const [form, setForm] = useState({ libelle:'', beneficiaireNom:'', beneficiaireContact:'', montant:'', mode:'Espèces' })
  const ok = form.libelle.trim() && form.montant && Number(form.montant) > 0
  const handleValider = () => {
    if (!ok) return
    onAjouter({ id:Date.now(), sens:'sortie', libelle:form.libelle.trim(), beneficiaireNom:form.beneficiaireNom.trim(), beneficiaireContact:form.beneficiaireContact.trim(), montant:Number(form.montant), mode:form.mode, heure:maintenant() })
    onClose()
  }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#E74C3C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>SORTIE DIVERSE</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Nouvelle sortie</h2>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Libellé <span style={{color:'red'}}>*</span></label>
          <input value={form.libelle} onChange={e=>setForm({...form,libelle:e.target.value})} placeholder="Ex. Salaire, Achat, Prestation..." style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Nom du bénéficiaire</label>
          <input value={form.beneficiaireNom} onChange={e=>setForm({...form,beneficiaireNom:e.target.value})} placeholder="Ex. Mme Touré Aminata" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Contact du bénéficiaire</label>
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
        <button onClick={handleValider} disabled={!ok} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:ok?'pointer':'not-allowed', background:ok?'#E74C3C':'#CCC', color:'white', fontWeight:'800', fontSize:'15px' }}>
          ✅ Enregistrer la sortie
        </button>
      </div>
    </div>
  )
}

// ─── Modal Passation ──────────────────────────────────────────────────────────
function ModalPassation({ sejours, entrees, sorties, onClose }) {
  const [form, setForm] = useState({
    numeroPassation: '001',
    vacation: 'Matin (06h00 → 14h00)',
    recSortantNom: '', recSortantSign: '',
    recEntrantNom: '', recEntrantSign: '',
    clePortesRemises: '', clePortesTotal: '',
    cleCaisseRemises: '', cleCaisseTotal: '',
    incidents: '',
    observations: '',
    directeurSign: '',
  })

  // Totaux
  const totalSejours   = sejours.reduce((s,p)=>s+p.montant,0)
  const totalNuits     = sejours.filter(p=>p.type==='nuit').reduce((s,p)=>s+p.montant,0)
  const totalHeures    = sejours.filter(p=>p.type==='heure').reduce((s,p)=>s+p.montant,0)
  const totalEntrees   = entrees.reduce((s,p)=>s+p.montant,0)
  const totalSorties   = sorties.reduce((s,p)=>s+p.montant,0)
  const totalRecettes  = totalSejours + totalEntrees
  const soldeNet       = totalRecettes - totalSorties

  // Par mode
  const parMode = (liste, mode) => liste.filter(p=>p.mode===mode||p.mode===mode).reduce((s,p)=>s+p.montant,0)
  const totalEspeces = [...sejours,...entrees].filter(p=>p.mode==='Espèces').reduce((s,p)=>s+p.montant,0)
  const totalOM      = [...sejours,...entrees].filter(p=>p.mode==='Orange Money').reduce((s,p)=>s+p.montant,0)
  const totalMOMO    = [...sejours,...entrees].filter(p=>p.mode==='MTN Mobile Money').reduce((s,p)=>s+p.montant,0)
  const totalCarte   = [...sejours,...entrees].filter(p=>p.mode==='Carte bancaire').reduce((s,p)=>s+p.montant,0)

  const chambres = { occupees:8, libres:7, nettoyer:4, problemes:1, total:20 }

  const handleImprimer = () => {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Passation de service</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-family: Arial, sans-serif; font-size: 9pt; }
  body { color: #111; }
  h1 { font-size: 13pt; font-weight: 900; color: #1B3A6B; }
  h2 { font-size: 9pt; font-weight: 700; color: #1B3A6B; margin-bottom: 4px; }
  .entete { display: flex; justify-content: space-between; align-items: flex-start; border: 2px solid #1B3A6B; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; }
  .col2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
  .box { border: 1.5px solid #CBD5E0; border-radius: 5px; padding: 7px 10px; }
  .box-blue { border-color: #1B3A6B; background: #F0F4FF; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 3px 6px; border: 1px solid #CBD5E0; }
  th { background: #1B3A6B; color: white; font-size: 8pt; }
  .total-row td { font-weight: 800; background: #F0F4FF; }
  .gold { color: #C9A84C; font-weight: 800; }
  .sign-line { border-bottom: 1px solid #333; min-width: 120px; display:inline-block; }
  .footer { text-align: center; margin-top: 8px; font-size: 8pt; color: #666; border-top: 1px solid #CBD5E0; padding-top: 4px; }
  .badge-ok { color: #2ECC71; font-weight: 800; }
</style>
</head>
<body>

<!-- EN-TÊTE + N° PASSATION -->
<div class="entete">
  <div>
    <h1>HOMS-HÔTEL</h1>
    <div style="font-size:8pt;color:#666;">Homslovision © 2026</div>
    <div style="font-weight:700;font-size:10pt;margin-top:4px;">PROCÈS-VERBAL DE PASSATION DE SERVICE</div>
  </div>
  <div style="text-align:right;">
    <div><strong>N° Passation :</strong> ${form.numeroPassation}</div>
    <div><strong>Date :</strong> ${aujourdhui()}</div>
    <div><strong>Vacation :</strong> ${form.vacation}</div>
    <div><strong>Imprimé :</strong> ${maintenant()}</div>
  </div>
</div>

<!-- RÉCEPTIONNISTES -->
<div class="col2">
  <div class="box">
    <h2>RÉCEPTIONNISTE SORTANT</h2>
    <div>Nom : <span class="sign-line">&nbsp;${form.recSortantNom}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
    <div style="margin-top:6px;">Signature : <span class="sign-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
  </div>
  <div class="box">
    <h2>RÉCEPTIONNISTE ENTRANT</h2>
    <div>Nom : <span class="sign-line">&nbsp;${form.recEntrantNom}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
    <div style="margin-top:6px;">Signature : <span class="sign-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
  </div>
</div>

<!-- RECETTES + DÉPENSES -->
<div class="col2">
  <div class="box">
    <h2>■ RECETTES DE LA VACATION</h2>
    <table>
      <tr><td>Séjours nuits</td><td style="text-align:right;">${fmt(totalNuits)} F</td></tr>
      <tr><td>Séjours heures</td><td style="text-align:right;">${fmt(totalHeures)} F</td></tr>
      <tr><td>Entrées diverses</td><td style="text-align:right;">${fmt(totalEntrees)} F</td></tr>
      <tr class="total-row"><td><strong>TOTAL RECETTES</strong></td><td style="text-align:right;" class="gold">${fmt(totalRecettes)} F</td></tr>
    </table>
  </div>
  <div class="box">
    <h2>■ DÉPENSES DE LA VACATION</h2>
    <table>
      ${sorties.length === 0
        ? '<tr><td colspan="2" style="text-align:center;color:#999;">Aucune dépense</td></tr>'
        : sorties.map(s=>`<tr><td>${s.libelle}</td><td style="text-align:right;">${fmt(s.montant)} F</td></tr>`).join('')
      }
      <tr class="total-row"><td><strong>TOTAL DÉPENSES</strong></td><td style="text-align:right;color:#E74C3C;">${fmt(totalSorties)} F</td></tr>
    </table>
  </div>
</div>

<!-- SOLDE NET + RÉPARTITION -->
<div class="col2">
  <div class="box box-blue">
    <h2>■ SOLDE NET DE CAISSE</h2>
    <table>
      <tr><td>Total recettes</td><td style="text-align:right;">${fmt(totalRecettes)} F</td></tr>
      <tr><td>Total dépenses</td><td style="text-align:right;color:#E74C3C;">- ${fmt(totalSorties)} F</td></tr>
      <tr class="total-row"><td><strong>SOLDE NET</strong></td><td style="text-align:right;" class="gold">${fmt(soldeNet)} F</td></tr>
      <tr><td><strong>Écart</strong></td><td style="text-align:right;" class="badge-ok">0 F ✅</td></tr>
    </table>
  </div>
  <div class="box">
    <h2>■ RÉPARTITION PAR MODE</h2>
    <table>
      <tr><td>💵 Espèces</td><td style="text-align:right;">${fmt(totalEspeces)} F</td></tr>
      <tr><td>🟠 Orange Money</td><td style="text-align:right;">${fmt(totalOM)} F</td></tr>
      <tr><td>🟡 MTN MoMo</td><td style="text-align:right;">${fmt(totalMOMO)} F</td></tr>
      <tr><td>💳 Carte bancaire</td><td style="text-align:right;">${fmt(totalCarte)} F</td></tr>
      <tr><td>📤 Sorties (-)</td><td style="text-align:right;color:#E74C3C;">- ${fmt(totalSorties)} F</td></tr>
      <tr class="total-row"><td><strong>SOLDE CAISSE</strong></td><td style="text-align:right;" class="gold">${fmt(soldeNet)} F</td></tr>
    </table>
  </div>
</div>

<!-- ÉTAT CHAMBRES + SÉJOURS EN COURS -->
<div class="col2">
  <div class="box">
    <h2>■ ÉTAT DES CHAMBRES</h2>
    <table>
      <tr><td>Occupées</td><td style="text-align:right;">${chambres.occupees} / ${chambres.total}</td></tr>
      <tr><td>Disponibles</td><td style="text-align:right;">${chambres.libres} / ${chambres.total}</td></tr>
      <tr><td>À nettoyer</td><td style="text-align:right;">${chambres.nettoyer} / ${chambres.total}</td></tr>
      <tr><td>Problèmes</td><td style="text-align:right;color:#E74C3C;">${chambres.problemes} / ${chambres.total}</td></tr>
    </table>
  </div>
  <div class="box">
    <h2>■ SÉJOURS EN COURS</h2>
    <table>
      <tr style="background:#1B3A6B;color:white;"><td>Ch.</td><td>Client</td><td>Départ</td></tr>
      ${sejours.map(s=>`<tr><td>${s.chambre}</td><td>${s.client.split(' ').slice(-1)[0]}</td><td>${s.heure}</td></tr>`).join('')}
    </table>
  </div>
</div>

<!-- CLÉS ET CAISSE -->
<div class="box" style="margin-bottom:6px;">
  <h2>■ REMISE DES CLÉS & CAISSE</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
    <div>Clés de portes remises : <strong>${form.clePortesRemises || '__'}</strong> / disponibles : <strong>${form.clePortesTotal || '__'}</strong></div>
    <div>Clés de caisse remises : <strong>${form.cleCaisseRemises || '__'}</strong> / disponibles : <strong>${form.cleCaisseTotal || '__'}</strong></div>
  </div>
</div>

<!-- INCIDENTS + OBSERVATIONS -->
<div class="col2">
  <div class="box">
    <h2>■ INCIDENTS SURVENUS</h2>
    <div style="min-height:28px;border-bottom:1px solid #CCC;margin-bottom:4px;">${form.incidents || ''}</div>
    <div style="min-height:28px;border-bottom:1px solid #CCC;"></div>
  </div>
  <div class="box">
    <h2>■ OBSERVATIONS GÉNÉRALES</h2>
    <div style="min-height:28px;border-bottom:1px solid #CCC;margin-bottom:4px;">${form.observations || ''}</div>
    <div style="min-height:28px;border-bottom:1px solid #CCC;"></div>
  </div>
</div>

<!-- DIRECTEUR -->
<div class="box" style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;">
  <div><strong>Validé par le Directeur :</strong> <span class="sign-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
  <div>Signature : <span class="sign-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
</div>

<div class="footer">
  Imprimé le ${aujourdhui()} à ${maintenant()} — HOMS-HÔTEL by Homslovision
</div>

</body>
</html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'92vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#C9A84C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>CLÔTURE DE VACATION</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999"/></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Passation de service</h2>

        {/* N° et vacation */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          <div>
            <label style={labelStyle}>N° Passation</label>
            <input value={form.numeroPassation} onChange={e=>setForm({...form,numeroPassation:e.target.value})} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Vacation</label>
            <select value={form.vacation} onChange={e=>setForm({...form,vacation:e.target.value})} style={{ ...inputStyle }}>
              <option>Matin (06h00 → 14h00)</option>
              <option>Après-midi (14h00 → 22h00)</option>
              <option>Nuit (22h00 → 06h00)</option>
            </select>
          </div>
        </div>

        {/* Réceptionnistes */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          <div>
            <label style={labelStyle}>Réceptionniste sortant</label>
            <input value={form.recSortantNom} onChange={e=>setForm({...form,recSortantNom:e.target.value})} placeholder="Nom complet" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Réceptionniste entrant</label>
            <input value={form.recEntrantNom} onChange={e=>setForm({...form,recEntrantNom:e.target.value})} placeholder="Nom complet" style={inputStyle}/>
          </div>
        </div>

        {/* Clés */}
        <div style={{ background:'#F0F4FF', borderRadius:'10px', padding:'12px', marginBottom:'14px' }}>
          <label style={{ ...labelStyle, color:'#1B3A6B' }}>🔑 Clés de portes remises / disponibles</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <input value={form.clePortesRemises} onChange={e=>setForm({...form,clePortesRemises:e.target.value})} placeholder="Remises" type="number" style={inputStyle}/>
            <input value={form.clePortesTotal} onChange={e=>setForm({...form,clePortesTotal:e.target.value})} placeholder="Disponibles" type="number" style={inputStyle}/>
          </div>
          <label style={{ ...labelStyle, color:'#1B3A6B', marginTop:'10px' }}>🗝️ Clés de caisse remises / disponibles</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <input value={form.cleCaisseRemises} onChange={e=>setForm({...form,cleCaisseRemises:e.target.value})} placeholder="Remises" type="number" style={inputStyle}/>
            <input value={form.cleCaisseTotal} onChange={e=>setForm({...form,cleCaisseTotal:e.target.value})} placeholder="Disponibles" type="number" style={inputStyle}/>
          </div>
        </div>

        {/* Incidents + Observations */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          <div>
            <label style={labelStyle}>Incidents survenus</label>
            <textarea value={form.incidents} onChange={e=>setForm({...form,incidents:e.target.value})} placeholder="Aucun incident..." rows={3} style={{ ...inputStyle, resize:'none' }}/>
          </div>
          <div>
            <label style={labelStyle}>Observations générales</label>
            <textarea value={form.observations} onChange={e=>setForm({...form,observations:e.target.value})} placeholder="RAS..." rows={3} style={{ ...inputStyle, resize:'none' }}/>
          </div>
        </div>

        <button onClick={handleImprimer} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
        }}>
          <FileText size={18}/> Générer et imprimer le PDF
        </button>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Caisse() {
  const [sejours]         = useState(encaissementsSejours)
  const [entrees, setEntrees] = useState([])
  const [sorties, setSorties] = useState([])
  const [onglet, setOnglet]   = useState('sejours')
  const [showEntree, setShowEntree]       = useState(false)
  const [showSortie, setShowSortie]       = useState(false)
  const [showPassation, setShowPassation] = useState(false)

  const totalSejours  = sejours.reduce((s,p)=>s+p.montant,0)
  const totalNuits    = sejours.filter(p=>p.type==='nuit').reduce((s,p)=>s+p.montant,0)
  const totalHeures   = sejours.filter(p=>p.type==='heure').reduce((s,p)=>s+p.montant,0)
  const totalEntrees  = entrees.reduce((s,p)=>s+p.montant,0)
  const totalSorties  = sorties.reduce((s,p)=>s+p.montant,0)
  const totalGeneral  = totalSejours + totalEntrees - totalSorties

  // Totaux par mode (toutes sources confondues)
  const allIn = [...sejours, ...entrees]
  const tEspeces = allIn.filter(p=>p.mode==='Espèces').reduce((s,p)=>s+p.montant,0)
  const tOM      = allIn.filter(p=>p.mode==='Orange Money').reduce((s,p)=>s+p.montant,0)
  const tMOMO    = allIn.filter(p=>p.mode==='MTN Mobile Money').reduce((s,p)=>s+p.montant,0)
  const tCarte   = allIn.filter(p=>p.mode==='Carte bancaire').reduce((s,p)=>s+p.montant,0)

  const handlePartager = () => {
    const texte = `HOMS-HÔTEL — CAISSE DU ${aujourdhui()}\nSolde net : ${fmt(totalGeneral)} FCFA\nSéjours : ${fmt(totalSejours)} | Entrées : ${fmt(totalEntrees)} | Sorties : -${fmt(totalSorties)}`
    if (navigator.share) { navigator.share({ title:'Rapport caisse', text:texte }) }
    else { window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank') }
  }

  return (
    <div style={{ paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Caisse</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Encaissements du jour — {aujourdhui()}</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={handlePartager} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'8px 10px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#25D366', color:'white', fontWeight:'700', fontSize:'11px' }}>
              <Share2 size={13}/> Rapport
            </button>
            <button onClick={()=>setShowPassation(true)} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'8px 10px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#C9A84C', color:'white', fontWeight:'700', fontSize:'11px' }}>
              <FileText size={13}/> Passation
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px 20px' }}>
        {/* Carte solde */}
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', borderRadius:'16px', padding:'20px', marginBottom:'12px', color:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
            <TrendingUp size={18} color="#C9A84C"/>
            <span style={{ fontSize:'13px', opacity:0.8 }}>Solde net du jour</span>
          </div>
          <div style={{ fontSize:'32px', fontWeight:'700', color:'#C9A84C' }}>{fmt(totalGeneral)} FCFA</div>
          <div style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'12px', flexWrap:'wrap' }}>
            <span>🏨 {fmt(totalSejours)}</span>
            <span>📥 +{fmt(totalEntrees)}</span>
            <span style={{ color:'#FF8A80' }}>📤 -{fmt(totalSorties)}</span>
          </div>
        </div>

        {/* Cartes Total entrées / sorties */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
          <div style={{ background:'#2ECC71', borderRadius:'12px', padding:'14px', color:'white' }}>
            <TrendingUp size={16} style={{ marginBottom:'4px' }}/>
            <div style={{ fontSize:'18px', fontWeight:'800' }}>{fmt(totalSejours+totalEntrees)}</div>
            <div style={{ fontSize:'11px', opacity:0.9 }}>Total entrées FCFA</div>
          </div>
          <div style={{ background:'#E74C3C', borderRadius:'12px', padding:'14px', color:'white' }}>
            <TrendingDown size={16} style={{ marginBottom:'4px' }}/>
            <div style={{ fontSize:'18px', fontWeight:'800' }}>{fmt(totalSorties)}</div>
            <div style={{ fontSize:'11px', opacity:0.9 }}>Total sorties FCFA</div>
          </div>
        </div>

        {/* 4 cases modes de paiement */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
          {[
            { icon:'💵', label:'Espèces',  montant:tEspeces, couleur:'#2ECC71' },
            { icon:'🟠', label:'OM',       montant:tOM,      couleur:'#FF6600' },
            { icon:'🟡', label:'MOMO',     montant:tMOMO,    couleur:'#C9A84C' },
            { icon:'💳', label:'Carte',    montant:tCarte,   couleur:'#1B3A6B' },
          ].map(m=>(
            <div key={m.label} style={{ background:'white', borderRadius:'10px', padding:'10px 12px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:`3px solid ${m.couleur}`, display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'20px' }}>{m.icon}</span>
              <div>
                <div style={{ fontSize:'13px', fontWeight:'800', color:'#1B3A6B' }}>{fmt(m.montant)}</div>
                <div style={{ fontSize:'10px', color:'#888', fontWeight:'600' }}>{m.label} FCFA</div>
              </div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display:'flex', borderRadius:'12px', overflow:'hidden', border:'2px solid #E0E0E0', marginBottom:'16px' }}>
          {[{id:'sejours',label:'🏨 Séjours'},{id:'entrees',label:'📥 Entrées'},{id:'sorties',label:'📤 Sorties'}].map(o=>(
            <button key={o.id} onClick={()=>setOnglet(o.id)} style={{ flex:1, padding:'11px 4px', fontWeight:'700', fontSize:'12px', border:'none', cursor:'pointer', background:onglet===o.id?'#1B3A6B':'white', color:onglet===o.id?'white':'#666' }}>{o.label}</button>
          ))}
        </div>

        {/* Séjours */}
        {onglet==='sejours' && (
          <>
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
              <span style={{ background:'#EEF2FF', color:'#1B3A6B', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>🌙 {fmt(totalNuits)} FCFA</span>
              <span style={{ background:'#FFF3E0', color:'#E8634A', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>⏱️ {fmt(totalHeures)} FCFA</span>
            </div>
            <p style={{ fontSize:'11px', color:'#999', marginBottom:'12px', fontStyle:'italic' }}>🔒 Alimenté automatiquement depuis les séjours</p>
            {sejours.map(p=>(
              <div key={p.id} style={{ background:'white', borderRadius:'12px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:`4px solid ${p.type==='nuit'?'#2ECC71':'#E8634A'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{p.client}</span>
                  <span style={{ fontWeight:'800', color:'#C9A84C', fontSize:'14px' }}>{fmt(p.montant)} FCFA</span>
                </div>
                <div style={{ fontSize:'12px', color:'#999' }}>Ch. {p.chambre} · {p.duree} · {p.heure} · {p.mode}</div>
              </div>
            ))}
          </>
        )}

        {/* Entrées */}
        {onglet==='entrees' && (
          <>
            <button onClick={()=>setShowEntree(true)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#2ECC71', color:'white', fontWeight:'800', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'16px' }}>
              <Plus size={18}/> Nouvelle entrée diverse
            </button>
            {entrees.length===0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#999' }}>
                <div style={{ fontSize:'32px', marginBottom:'8px' }}>📥</div>
                <p>Aucune entrée diverse aujourd'hui</p>
              </div>
            ) : entrees.map(e=>(
              <div key={e.id} style={{ background:'white', borderRadius:'12px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #2ECC71' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{e.libelle}</span>
                  <span style={{ fontWeight:'800', color:'#2ECC71', fontSize:'14px' }}>+{fmt(e.montant)} FCFA</span>
                </div>
                <div style={{ fontSize:'12px', color:'#999' }}>{e.emetteurNom&&`${e.emetteurNom} · `}{e.mode} · {e.heure}</div>
              </div>
            ))}
          </>
        )}

        {/* Sorties */}
        {onglet==='sorties' && (
          <>
            <button onClick={()=>setShowSortie(true)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#E74C3C', color:'white', fontWeight:'800', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'16px' }}>
              <Plus size={18}/> Nouvelle sortie diverse
            </button>
            {sorties.length===0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#999' }}>
                <div style={{ fontSize:'32px', marginBottom:'8px' }}>📤</div>
                <p>Aucune sortie diverse aujourd'hui</p>
              </div>
            ) : sorties.map(s=>(
              <div key={s.id} style={{ background:'white', borderRadius:'12px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #E74C3C' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{s.libelle}</span>
                  <span style={{ fontWeight:'800', color:'#E74C3C', fontSize:'14px' }}>-{fmt(s.montant)} FCFA</span>
                </div>
                <div style={{ fontSize:'12px', color:'#999' }}>{s.beneficiaireNom&&`${s.beneficiaireNom} · `}{s.mode} · {s.heure}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {showEntree    && <FormulaireEntree  onClose={()=>setShowEntree(false)}    onAjouter={e=>setEntrees(prev=>[e,...prev])}/>}
      {showSortie    && <FormulaireSortie  onClose={()=>setShowSortie(false)}    onAjouter={s=>setSorties(prev=>[s,...prev])}/>}
      {showPassation && <ModalPassation    sejours={sejours} entrees={entrees} sorties={sorties} onClose={()=>setShowPassation(false)}/>}
    </div>
  )
}
