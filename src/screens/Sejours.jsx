import { useState, useEffect } from 'react'
// ─── Styles Confetti ──────────────────────────────────────────────────────────
const CONFETTI_STYLES = `
  @keyframes confettiFall {
    0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes confettiPop {
    0%   { transform: scale(0) rotate(0deg);   opacity: 1; }
    50%  { transform: scale(1.2) rotate(180deg); opacity: 1; }
    100% { transform: scale(0.8) rotate(360deg); opacity: 0; }
  }
  @keyframes successPulse {
    0%   { transform: scale(0.8); opacity: 0; }
    50%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }
`

// ─── Particules confetti ──────────────────────────────────────────────────────
const COULEURS_CONFETTI = ['#C9A84C','#F5D98A','#2ECC71','#1B3A6B','#E8634A','#fff','#FFD700']
const FORMES = ['●', '■', '▲', '★', '◆']

function Confetti({ onFin }) {
  useEffect(() => {
    // Injecter styles
    const el = document.createElement('style')
    el.textContent = CONFETTI_STYLES
    document.head.appendChild(el)
    // Disparaître après 3s
    const t = setTimeout(onFin, 3000)
    return () => { clearTimeout(t); document.head.removeChild(el) }
  }, [])

  const particules = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    couleur: COULEURS_CONFETTI[Math.floor(Math.random() * COULEURS_CONFETTI.length)],
    forme: FORMES[Math.floor(Math.random() * FORMES.length)],
    taille: Math.random() * 14 + 8,
    duree: Math.random() * 1.5 + 1.5,
    delai: Math.random() * 0.8,
  }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {/* Message succès centré */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #1B3A6B, #2C5282)',
        borderRadius: '20px', padding: '20px 32px',
        textAlign: 'center', zIndex: 1000,
        boxShadow: '0 8px 32px rgba(27,58,107,0.5)',
        animation: 'successPulse 0.4s ease both',
        border: '2px solid #C9A84C',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
        <div style={{ color: '#C9A84C', fontWeight: '800', fontSize: '18px' }}>
          Séjour enregistré !
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>
          Bienvenue au client 🏨
        </div>
      </div>

      {/* Particules */}
      {particules.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-20px',
          color: p.couleur,
          fontSize: `${p.taille}px`,
          animation: `confettiFall ${p.duree}s ease-in ${p.delai}s both`,
          lineHeight: 1,
        }}>
          {p.forme}
        </div>
      ))}
    </div>
  )
}


import { Search, Plus, Clock, LogIn, X, RefreshCw, Printer, Share2, LogOut } from 'lucide-react'

// ─── Config par défaut (modifiable dans Menu → Directeur) ────────────────────
const CONFIG = {
  toleranceDepassementMinutes: 20,
  nomHotel: 'HOMS-HÔTEL',
}

// ─── Chambres par catégorie ───────────────────────────────────────────────────
const chambresParCategorie = {
  Standard: [
    { numero: '101', statut: 'libre' },
    { numero: '102', statut: 'libre' },
    { numero: '103', statut: 'occupee' },
    { numero: '104', statut: 'occupee' },
  ],
  Confort: [
    { numero: '201', statut: 'occupee' },
    { numero: '202', statut: 'occupee' },
    { numero: '203', statut: 'libre' },
    { numero: '205', statut: 'occupee' },
  ],
  Suite: [
    { numero: '301', statut: 'libre' },
    { numero: '302', statut: 'occupee' },
    { numero: '303', statut: 'libre' },
  ],
}

const tarifsNuit  = { Standard: 25000, Confort: 35000, Suite: 65000 }
const tarifsHeure = { Standard: 2500,  Confort: 3500,  Suite: 6500  }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function maintenant() {
  const d = new Date()
  return {
    date: d.toLocaleDateString('fr-FR'),
    heure: d.toTimeString().slice(0, 5),
  }
}

function diffNuits(dateArrivee, dateDepart) {
  const parse = s => { const [j,m,a]=s.split('/').map(Number); return new Date(a,m-1,j) }
  return Math.max(1, Math.round((parse(dateDepart)-parse(dateArrivee))/(1000*60*60*24)))
}

function diffHeures(h1, h2) {
  const toMin = s => { const [h,m]=s.split(':').map(Number); return h*60+m }
  return Math.max(1, Math.round((toMin(h2)-toMin(h1))/60))
}

function tempsRestant(s) {
  const now = new Date()
  let fin
  if (s.type === 'nuit') {
    const [j,m,a] = s.dateDepart.split('/').map(Number)
    fin = new Date(a, m-1, j, 12, 0)
  } else {
    const today = new Date()
    const [h,min] = s.heureDepart.split(':').map(Number)
    fin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, min)
  }
  const diffMs = fin - now
  if (diffMs < 0) {
    const depMin = Math.abs(Math.floor(diffMs/60000))
    return { label: `${Math.floor(depMin/60)}h${String(depMin%60).padStart(2,'0')}`, depasse: true, depasseMinutes: depMin }
  }
  const h = Math.floor(diffMs/3600000)
  const m = Math.floor((diffMs%3600000)/60000)
  if (h >= 24) return { label:`${Math.floor(h/24)}j ${h%24}h`, depasse:false }
  return { label:`${h}h${String(m).padStart(2,'0')}`, depasse:false }
}

// ─── Générateur de texte ticket ───────────────────────────────────────────────
function genererRecuEntree(s) {
  return `================================
  ${CONFIG.nomHotel} / REÇU D'ENTRÉE
================================
Client  : ${s.client}
Tél     : ${s.telephone}
Chambre : ${s.chambre} (${s.categorie})
Arrivée : ${s.dateArrivee} à ${s.heureArrivee}
Départ  : ${s.type==='nuit' ? s.dateDepart : s.dateArrivee} à ${s.heureDepart}
Durée   : ${s.duree}
--------------------------------
Montant : ${s.montant} FCFA
Paiement: ${s.modePaiement}
--------------------------------
Merci de votre confiance !
================================`
}

function genererRecuSortie(s, supplement, depassage) {
  const now = maintenant()
  const aSuppl = supplement > 0
  return `================================
  ${CONFIG.nomHotel} / REÇU DE SORTIE
================================
Client  : ${s.client}
Chambre : ${s.chambre}
Sortie  : ${now.date} à ${now.heure}${aSuppl ? `
Dépassement: ${depassage}
Supplément: ${supplement.toLocaleString('fr-FR')} FCFA
TOTAL DÛ : ${supplement.toLocaleString('fr-FR')} FCFA` : `
Aucun dépassement`}
================================
       À très bientôt !
================================`
}

// ─── Modal Reçu (entrée ou sortie) ───────────────────────────────────────────
function ModalRecu({ texte, titre, onClose }) {
  const handleImprimer = () => {
    const win = window.open('', '_blank')
    win.document.write(`<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap;">${texte}</pre>`)
    win.document.close()
    win.print()
  }
  const handlePartager = () => {
    if (navigator.share) {
      navigator.share({ title: titre, text: texte })
    } else {
      // Fallback WhatsApp
      const url = `https://wa.me/?text=${encodeURIComponent(texte)}`
      window.open(url, '_blank')
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'380px', overflow:'hidden' }}>
        {/* En-tête */}
        <div style={{ background:'#1B3A6B', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'#C9A84C', fontWeight:'800', fontSize:'15px' }}>{titre}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}>
            <X size={20} color="white" />
          </button>
        </div>

        {/* Ticket */}
        <div style={{ padding:'16px 20px' }}>
          <pre style={{
            fontFamily:'monospace', fontSize:'12px', lineHeight:'1.6',
            background:'#F8F8F8', padding:'14px', borderRadius:'8px',
            whiteSpace:'pre-wrap', color:'#222', margin:0,
            border:'1px dashed #CCC'
          }}>
            {texte}
          </pre>
        </div>

        {/* Boutons */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', padding:'0 20px 20px' }}>
          <button onClick={handleImprimer} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer',
            background:'#1B3A6B', color:'white', fontWeight:'700', fontSize:'13px'
          }}>
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={handlePartager} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer',
            background:'#25D366', color:'white', fontWeight:'700', fontSize:'13px'
          }}>
            <Share2 size={16} /> Partager
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Prolongation ───────────────────────────────────────────────────────
function ModalProlongation({ sejour, onClose, onProlonger }) {
  const [ajout, setAjout] = useState(1)
  const tarif = sejour.type==='nuit' ? tarifsNuit[sejour.categorie] : tarifsHeure[sejour.categorie]
  const supplement = tarif * ajout

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'360px' }}>
        <h3 style={{ color:'#1B3A6B', fontSize:'18px', fontWeight:'800', marginBottom:'4px' }}>Prolonger le séjour</h3>
        <p style={{ color:'#666', fontSize:'13px', marginBottom:'20px' }}>{sejour.client} · Ch. {sejour.chambre}</p>
        <label style={labelStyle}>Ajouter {sejour.type==='nuit' ? 'des nuits' : 'des heures'}</label>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
          <button onClick={() => setAjout(Math.max(1,ajout-1))} style={btnQtyStyle}>−</button>
          <span style={{ fontSize:'28px', fontWeight:'800', color:'#1B3A6B' }}>{ajout}</span>
          <button onClick={() => setAjout(ajout+1)} style={btnQtyStyle}>+</button>
          <span style={{ color:'#666', fontSize:'13px' }}>{sejour.type==='nuit' ? 'nuit(s)' : 'heure(s)'}</span>
        </div>
        <div style={{ background:'#F0F7F0', borderRadius:'10px', padding:'12px', marginBottom:'20px', border:'1px solid #2ECC71' }}>
          <div style={{ fontSize:'12px', color:'#666' }}>Supplément à encaisser</div>
          <div style={{ fontSize:'22px', fontWeight:'800', color:'#1B3A6B' }}>+{supplement.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:'10px', background:'#F0F0F0', fontWeight:'700', color:'#666', border:'none', cursor:'pointer' }}>Annuler</button>
          <button onClick={() => { onProlonger(sejour.id, ajout, supplement); onClose() }}
            style={{ flex:2, padding:'12px', borderRadius:'10px', background:'#1B3A6B', fontWeight:'700', color:'white', border:'none', cursor:'pointer' }}>
            ✅ Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'12px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }
const btnQtyStyle = { width:'40px', height:'40px', borderRadius:'10px', background:'#F0F0F0', fontWeight:'800', fontSize:'20px', color:'#1B3A6B', border:'none', cursor:'pointer' }

// ─── Formulaire nouveau séjour ────────────────────────────────────────────────
function FormulaireNouveauSejour({ onClose, onAjouter, chambresGenerees=[] }) {
  const now = maintenant()
  const [form, setForm] = useState({
    client:'', telephone:'', categorie:'Standard', chambre:'',
    statut:'en_cours',
    typeSejour:'nuit',
    dateArrivee: now.date, heureArrivee: now.heure,
    dateDepart: (() => { const d=new Date(); d.setDate(d.getDate()+1); return d.toLocaleDateString('fr-FR') })(),
    heureDepart: (() => { const [h,m]=now.heure.split(':').map(Number); const t=h*60+m+120; return `${String(Math.floor(t/60)%24).padStart(2,'0')}:${String(t%60).padStart(2,'0')}` })(),
    modePaiement:'Espèces',
  })
  const [recuEntree, setRecuEntree] = useState(null)

  // Chambres filtrées par catégorie depuis App.jsx (données réelles)
  const chambres = chambresGenerees.filter(c => c.cat === form.categorie)
  const chambresLibres = chambres.filter(c => c.statut === 'libre')

  const dureeCalculee = () => {
    if (form.typeSejour==='nuit') {
      const n = diffNuits(form.dateArrivee, form.dateDepart)
      return { valeur:n, label:`${n} nuit${n>1?'s':''}` }
    }
    const h = diffHeures(form.heureArrivee, form.heureDepart)
    return { valeur:h, label:`${h} heure${h>1?'s':''}` }
  }

  const montantTotal = () => {
    const d = dureeCalculee()
    return form.typeSejour==='nuit'
      ? (tarifsNuit[form.categorie]||0)*d.valeur
      : (tarifsHeure[form.categorie]||0)*d.valeur
  }

  const peutValider = form.client.trim() && form.telephone.trim() && form.chambre

  const handleValider = () => {
    if (!peutValider) return
    const d = dureeCalculee()
    const mt = montantTotal()
    const nouveau = {
      client: form.client.trim(),
      telephone: form.telephone.trim(),
      chambre: form.chambre,
      categorie: form.categorie,
      dateArrivee: form.dateArrivee,
      heureArrivee: form.heureArrivee,
      dateDepart: form.typeSejour==='nuit' ? form.dateDepart : form.dateArrivee,
      heureDepart: form.heureDepart,
      duree: d.label,
      type: form.typeSejour,
      statut: form.statut || 'en_cours',
      montant: mt.toLocaleString('fr-FR'),
      montantNum: mt,
      modePaiement: form.modePaiement,
    }
    const succes = onAjouter(nouveau)
    if (succes === false) {
      alert('Cette chambre est deja occupee ou reservee !')
      return
    }
    setRecuEntree(genererRecuEntree(nouveau))
  }

  // Affiche le reçu d'entrée après enregistrement
  if (recuEntree) {
    return (
      <ModalRecu
        texte={recuEntree}
        titre="🧾 REÇU D'ENTRÉE"
        onClose={onClose}
      />
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', width:'100%', borderRadius:'20px 20px 0 0', maxHeight:'93vh', overflowY:'auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ color:'#C9A84C', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>NOUVEAU DOSSIER</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#999" /></button>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'20px' }}>Enregistrer un séjour</h2>

        {/* Nom */}
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Nom du client <span style={{color:'red'}}>*</span></label>
          <input value={form.client} onChange={e=>setForm({...form,client:e.target.value})} placeholder="Ex. Aïssata Diallo" style={inputStyle} />
        </div>

        {/* Téléphone */}
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Téléphone <span style={{color:'red'}}>*</span></label>
          <input value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})} placeholder="+225 07 00 00 00 00" type="tel" style={inputStyle} />
        </div>

        {/* Toggle Entree maintenant / Reservation future */}
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Type de dossier</label>
          <div style={{ display:'flex', borderRadius:'10px', overflow:'hidden', border:'2px solid #E0E0E0' }}>
            {[
              {val:'en_cours', label:'Entree maintenant'},
              {val:'reserve',  label:'Reservation future'},
            ].map(t=>(
              <button key={t.val} onClick={()=>setForm({...form, statut:t.val})} style={{
                flex:1, padding:'11px 4px', fontWeight:'700', fontSize:'12px', border:'none', cursor:'pointer',
                background: form.statut===t.val ? '#1B3A6B' : 'white',
                color: form.statut===t.val ? 'white' : '#666',
              }}>{t.val==='en_cours' ? '🏨 ' : '📅 '}{t.label}</button>
            ))}
          </div>
          {form.statut==='reserve' && (
            <div style={{ background:'#FFF8F0', borderRadius:'10px', padding:'10px 12px', marginTop:'8px', border:'1px solid #C9A84C', fontSize:'12px', color:'#C9A84C', fontWeight:'600' }}>
              La chambre sera marquee Reservee et bloquee pour cette periode
            </div>
          )}
        </div>

        {/* Type chambre */}
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Type de chambre</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {Object.keys(chambresParCategorie).map(cat=>(
              <button key={cat} onClick={()=>setForm({...form,categorie:cat,chambre:''})} style={{
                flex:1, padding:'10px 6px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', cursor:'pointer',
                background: form.categorie===cat ? '#1B3A6B' : '#F0F0F0',
                color: form.categorie===cat ? 'white' : '#555',
                border: form.categorie===cat ? '2px solid #1B3A6B' : '2px solid transparent',
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Grille chambres */}
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>
            Chambre disponible <span style={{color:'red'}}>*</span>
            <span style={{ color:'#2ECC71', marginLeft:'6px', fontSize:'11px' }}>({chambresLibres.length} libre{chambresLibres.length>1?'s':''})</span>
          </label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
            {chambres.map(c=>(
              <button key={c.num} disabled={c.statut==='occupee' || c.statut==='reserve'}
                onClick={()=>c.statut==='libre'&&setForm({...form,chambre:c.num})}
                style={{
                  padding:'14px 8px', borderRadius:'10px', fontWeight:'700', fontSize:'16px',
                  border: form.chambre===c.num ? '2px solid #1B3A6B' : '2px solid #E0E0E0',
                  background: c.statut==='occupee' ? '#F5F5F5' : form.chambre===c.num ? '#EEF2FF' : 'white',
                  color: c.statut==='occupee' ? '#CCC' : '#1B3A6B',
                  cursor: c.statut==='occupee' ? 'not-allowed' : 'pointer',
                }}>
                {c.num}
                <div style={{ fontSize:'9px', fontWeight:'600', marginTop:'2px', color:c.statut==='occupee'?'#CCC':'#2ECC71' }}>
                  {c.statut==='occupee'?'Occupée':'Libre'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nuit / Heure */}
        <div style={{ marginBottom:'14px' 
