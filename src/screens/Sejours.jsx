import { useState, useEffect } from 'react'

// ─── Helpers date/heure (identiques a App.jsx pour coherence) ────────────────
function versDateJS(dateFR, heure) {
  if (!dateFR) return null
  const [j, m, a] = dateFR.split('/').map(Number)
  const [h, min]  = (heure || '00:00').split(':').map(Number)
  return new Date(a, m - 1, j, h || 0, min || 0)
}
function periodeDuSejourJS(s) {
  const debut = versDateJS(s.dateArrivee, s.heureArrivee)
  const fin   = versDateJS(s.dateDepart || s.dateArrivee, s.heureDepart)
  return [debut, fin]
}
function periodesSeChevauchentJS(debutA, finA, debutB, finB) {
  if (!debutA || !finA || !debutB || !finB) return false
  return debutA < finB && debutB < finA
}
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
function FormulaireNouveauSejour({ onClose, onAjouter, chambresGenerees=[], tousLesSejours=[] }) {
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

  // L'heure d'arrivee reste alignee sur l'horloge tant que c'est une entree
  // immediate : la reception ne peut pas antidater ou postdater une entree.
  useEffect(() => {
    if (form.statut !== 'en_cours') return
    const t = setInterval(() => {
      setForm(f => f.statut==='en_cours' ? { ...f, heureArrivee: maintenant().heure } : f)
    }, 30000)
    return () => clearInterval(t)
  }, [form.statut])

  // Chambres de la categorie choisie
  const chambresCategorie = chambresGenerees.filter(c => c.cat === form.categorie)

  // Periode que l'utilisateur est en train de saisir dans le formulaire
  const dateDepartCalculee = form.typeSejour==='nuit' ? form.dateDepart : form.dateArrivee
  const [debutSaisi, finSaisi] = periodeDuSejourJS({
    dateArrivee: form.dateArrivee, heureArrivee: form.heureArrivee,
    dateDepart: dateDepartCalculee, heureDepart: form.heureDepart,
  })

  // Une chambre est disponible pour CETTE periode si aucun sejour actif ou a
  // venir sur cette meme chambre ne chevauche les dates/heures demandees.
  // C'est la vraie logique hoteliere : la meme chambre peut etre reservee
  // plusieurs fois par jour tant que les creneaux ne se recoupent pas.
  const chambres = chambresCategorie.map(c => {
    const conflit = tousLesSejours.find(s => {
      if (s.chambre !== c.num) return false
      if (s.statut !== 'en_cours' && s.statut !== 'a_venir') return false
      const [debutExistant, finExistant] = periodeDuSejourJS(s)
      return periodesSeChevauchentJS(debutSaisi, finSaisi, debutExistant, finExistant)
    })
    return { ...c, statut: conflit ? 'occupee' : 'libre' }
  })
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
              {val:'a_venir',  label:'Reservation future'},
            ].map(t=>(
              <button key={t.val} onClick={()=>setForm({...form, statut:t.val, heureArrivee: t.val==='en_cours' ? maintenant().heure : form.heureArrivee})} style={{
                flex:1, padding:'11px 4px', fontWeight:'700', fontSize:'12px', border:'none', cursor:'pointer',
                background: form.statut===t.val ? '#1B3A6B' : 'white',
                color: form.statut===t.val ? 'white' : '#666',
              }}>{t.val==='en_cours' ? '🏨 ' : '📅 '}{t.label}</button>
            ))}
          </div>
          {form.statut==='a_venir' && (
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
              <button key={c.num} disabled={c.statut==='occupee' || c.statut==='a_venir'}
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
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Type de séjour</label>
          <div style={{ display:'flex', borderRadius:'10px', overflow:'hidden', border:'2px solid #E0E0E0' }}>
            {[{val:'nuit',label:'🌙 À la nuit'},{val:'heure',label:'⏱️ A l heure'}].map(t=>(
              <button key={t.val} onClick={()=>setForm({...form,typeSejour:t.val})} style={{
                flex:1, padding:'12px', fontWeight:'700', fontSize:'13px', border:'none', cursor:'pointer',
                background:form.typeSejour===t.val?'#1B3A6B':'white',
                color:form.typeSejour===t.val?'white':'#666',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Dates / Heures */}
        {form.typeSejour==='nuit' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
            <div>
              <label style={labelStyle}>Date arrivee</label>
              <input type="date" value={form.dateArrivee.split('/').reverse().join('-')}
                onChange={e=>{const[a,m,j]=e.target.value.split('-');setForm({...form,dateArrivee:`${j}/${m}/${a}`})}}
                style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Date depart</label>
              <input type="date" value={form.dateDepart.split('/').reverse().join('-')}
                onChange={e=>{const[a,m,j]=e.target.value.split('-');setForm({...form,dateDepart:`${j}/${m}/${a}`})}}
                style={inputStyle}/>
            </div>
          </div>
        ):(
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
            <div>
              <label style={labelStyle}>Heure arrivee {form.statut==='en_cours' && <span style={{color:'#2ECC71',fontWeight:'600'}}>(heure actuelle)</span>}</label>
              <input type="time" value={form.heureArrivee}
                disabled={form.statut==='en_cours'}
                onChange={e=>setForm({...form,heureArrivee:e.target.value})}
                style={{...inputStyle, background: form.statut==='en_cours' ? '#F5F5F5' : 'white', color: form.statut==='en_cours' ? '#888' : '#000'}}/>
            </div>
            <div>
              <label style={labelStyle}>Heure depart</label>
              <input type="time" value={form.heureDepart} onChange={e=>setForm({...form,heureDepart:e.target.value})} style={inputStyle}/>
            </div>
          </div>
        )}

        {/* Mode paiement */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Mode de paiement</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[{val:'Espèces',icon:'💵'},{val:'Orange Money',icon:'🟠'},{val:'MTN Mobile Money',icon:'🟡'},{val:'Carte bancaire',icon:'💳'}].map(m=>(
              <button key={m.val} onClick={()=>setForm({...form,modePaiement:m.val})} style={{
                padding:'10px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer',
                border:form.modePaiement===m.val?'2px solid #C9A84C':'2px solid #E0E0E0',
                background:form.modePaiement===m.val?'#FFFBF0':'white',
                color:form.modePaiement===m.val?'#C9A84C':'#666',
              }}>{m.icon} {m.val}</button>
            ))}
          </div>
        </div>

        {/* Montant calculé */}
        {form.chambre && (
          <div style={{ background:'#F0F7F0', borderRadius:'12px', padding:'14px', marginBottom:'16px', border:'1px solid #2ECC71' }}>
            <div style={{ fontSize:'12px', color:'#666', marginBottom:'4px' }}>Montant total calculé</div>
            <div style={{ fontSize:'26px', fontWeight:'800', color:'#1B3A6B' }}>{montantTotal().toLocaleString('fr-FR')} FCFA</div>
            <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>Ch. {form.chambre} · {form.categorie} · {dureeCalculee().label}</div>
          </div>
        )}

        <button onClick={handleValider} disabled={!peutValider} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none',
          cursor:peutValider?'pointer':'not-allowed',
          background:peutValider?'#1B3A6B':'#CCC',
          color:'white', fontWeight:'800', fontSize:'15px',
        }}>
          ✅ Enregistrer le séjour
        </button>
      </div>
    </div>
  )
}

// ─── Séjours initiaux ─────────────────────────────────────────────────────────
const sejoursInitiaux = [
  { id:1, client:'M. Kouassi Ama', telephone:'+225 07 11 22 33', chambre:'205', categorie:'Confort', dateArrivee:'18/08/2026', heureArrivee:'14:00', dateDepart:'21/08/2026', heureDepart:'12:00', duree:'3 nuits', type:'nuit', statut:'en_cours', montant:'105 000', modePaiement:'Orange Money' },
  { id:2, client:'Mme Diallo Fatou', telephone:'+225 05 44 55 66', chambre:'101', categorie:'Standard', dateArrivee:'17/08/2026', heureArrivee:'10:00', dateDepart:'19/08/2026', heureDepart:'12:00', duree:'2 nuits', type:'nuit', statut:'en_cours', montant:'50 000', modePaiement:'Espèces' },
  { id:3, client:'M. Bamba Seydou', telephone:'+225 01 77 88 99', chambre:'302', categorie:'Suite', dateArrivee:'21/08/2026', heureArrivee:'09:30', dateDepart:'21/08/2026', heureDepart:'12:30', duree:'3 heures', type:'heure', statut:'en_cours', montant:'19 500', modePaiement:'MTN Mobile Money' },
]

const statuts = {
  en_cours: { label:'En cours',   couleur:'#2ECC71' },
  a_venir:  { label:'A venir',    couleur:'#8B5CF6' },
  termine:  { label:'Termine',    couleur:'#999'    },
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Sejours({ sejours:sejoursProps, chambresGenerees=[], onAjouter, onTerminer, onProlonger, onActiverReservation, ouvrirFormulaire, onFormulaireOuvert }) {
  // sejours viennent de App.jsx (état global)
  const sejours = sejoursProps || []
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [typeFiltre, setTypeFiltre] = useState('tous')
  const [showFormulaire, setShowFormulaire] = useState(false)
  const [showConfetti,   setShowConfetti]   = useState(false)

  // Ouvrir le formulaire depuis la NavBar (bouton +)
  useEffect(() => {
    if (ouvrirFormulaire) {
      setShowFormulaire(true)
      if (onFormulaireOuvert) onFormulaireOuvert()
    }
  }, [ouvrirFormulaire])
  const [sejourAProlonger, setSejourAProlonger] = useState(null)
  const [recuVisible, setRecuVisible] = useState(null)   // { texte, titre }

  const filtresSejours = sejours.filter(s => {
    const matchR = s.client.toLowerCase().includes(recherche.toLowerCase()) || s.chambre.includes(recherche)
    const matchF = filtre==='tous' || s.statut===filtre
    const matchT = typeFiltre==='tous' || s.type===typeFiltre
    return matchR && matchF && matchT
  })

  const enCours = sejours.filter(s=>s.statut==='en_cours').length
  const parHeure = sejours.filter(s=>s.type==='heure'&&s.statut==='en_cours').length
  const parNuit  = sejours.filter(s=>s.type==='nuit' &&s.statut==='en_cours').length

  const handleAjouter = (nouveau) => {
    if (!onAjouter) return
    const succes = onAjouter(nouveau)
    return succes // true=succes, false=chambre bloquee
  }

  const handleProlonger = (id, ajout, supplement) => {
    if (onProlonger) onProlonger(id, supplement)
  }

  const handleCheckout = (s) => {
    const tr = tempsRestant(s)
    let supplement = 0
    let depassage = ''
    if (tr.depasse && tr.depasseMinutes > CONFIG.toleranceDepassementMinutes) {
      const tarif = s.type==='nuit' ? tarifsNuit[s.categorie] : tarifsHeure[s.categorie]
      const unites = s.type==='nuit'
        ? Math.ceil(tr.depasseMinutes / (24*60))
        : Math.ceil(tr.depasseMinutes / 60)
      supplement = tarif * unites
      depassage = `${Math.floor(tr.depasseMinutes/60)}h${String(tr.depasseMinutes%60).padStart(2,'0')}`
    }
    const texte = genererRecuSortie(s, supplement, depassage)
    if (onTerminer) onTerminer(s.id)
    setRecuVisible({ texte, titre:"🧾 REÇU DE SORTIE" })
  }

  return (
    <div style={{ paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <h1 style={{ color:'#C9A84C', fontSize:'22px', fontWeight:'700' }}>Séjours</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>
          {enCours} en cours · {parHeure} à l'heure · {parNuit} à la nuit
        </p>
      </div>

      <div style={{ padding:'16px 20px' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          <div style={{ background:'#2ECC71', borderRadius:'12px', padding:'14px', color:'white', textAlign:'center' }}>
            <LogIn size={20} style={{ marginBottom:'4px' }} />
            <div style={{ fontSize:'22px', fontWeight:'700' }}>{parNuit}</div>
            <div style={{ fontSize:'11px', opacity:0.9 }}>À la nuit</div>
          </div>
          <div style={{ background:'#E8634A', borderRadius:'12px', padding:'14px', color:'white', textAlign:'center' }}>
            <Clock size={20} style={{ marginBottom:'4px' }} />
            <div style={{ fontSize:'22px', fontWeight:'700' }}>{parHeure}</div>
            <div style={{ fontSize:'11px', opacity:0.9 }}>A l'heure</div>
          </div>
        </div>

        {/* Filtres type */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
          {['tous','nuit','heure'].map(t=>(
            <button key={t} onClick={()=>setTypeFiltre(t)} style={{
              padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', border:'none', cursor:'pointer',
              background:typeFiltre===t?'#E8634A':'#F0F0F0',
              color:typeFiltre===t?'white':'#666',
            }}>{t==='tous'?'Tous types':t==='nuit'?'🌙 Nuit':'⏱️ Heure'}</button>
          ))}
        </div>

        {/* Recherche */}
        <div style={{ position:'relative', marginBottom:'12px' }}>
          <Search size={18} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#999' }} />
          <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Rechercher un client ou chambre..."
            style={{ ...inputStyle, paddingLeft:'42px' }} />
        </div>

        {/* Filtres statut */}
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', marginBottom:'16px', paddingBottom:'4px' }}>
          {[{id:'tous',label:'Tous'},{id:'en_cours',label:'En cours'},{id:'a_venir',label:'À venir'},{id:'termine',label:'Terminés'}].map(f=>(
            <button key={f.id} onClick={()=>setFiltre(f.id)} style={{
              padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap', border:'none', cursor:'pointer',
              background:filtre===f.id?'#1B3A6B':'#F0F0F0',
              color:filtre===f.id?'white':'#666',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Liste séjours */}
        {filtresSejours.length===0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#999' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🏨</div>
            <p>Aucun séjour trouvé</p>
          </div>
        )}

        {filtresSejours.map(s=>{
          const st = statuts[s.statut] || { label: s.statut || 'Inconnu', couleur: '#999' }
          const tr = s.statut==='en_cours' ? tempsRestant(s) : null
          return (
            <div key={s.id} style={{
              background:'white', borderRadius:'12px', padding:'16px', marginBottom:'10px',
              boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
              borderLeft:`4px solid ${tr?.depasse?'#E74C3C':s.type==='heure'?'#E8634A':st.couleur}`
            }}>
              {/* Nom + statut */}
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ fontWeight:'700', fontSize:'15px', color:'#1B3A6B' }}>{s.client}</span>
                <span style={{ background:tr?.depasse?'#E74C3C':st.couleur, color:'white', fontSize:'10px', fontWeight:'600', padding:'3px 8px', borderRadius:'10px' }}>
                  {tr?.depasse?'⚠️ Dépassé':st.label}
                </span>
              </div>

              {/* Téléphone */}
              <div style={{ fontSize:'12px', color:'#888', marginBottom:'6px' }}>📞 {s.telephone}</div>

              {/* Infos chambre */}
              <div style={{ display:'flex', gap:'10px', fontSize:'12px', color:'#666', marginBottom:'6px', flexWrap:'wrap' }}>
                <span>🏨 Ch. {s.chambre}</span>
                <span>📋 {s.categorie}</span>
                <span>{s.type==='heure'?'⏱️':'🌙'} {s.duree}</span>
                <span>💰 {s.modePaiement}</span>
              </div>

              {/* Temps */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'10px' }}>
                <span style={{ color:'#999' }}>
                  {s.type==='nuit' ? `${s.dateArrivee} → ${s.dateDepart}` : `${s.heureArrivee} → ${s.heureDepart}`}
                </span>
                {tr && (
                  <span style={{ color:tr.depasse?'#E74C3C':'#888', fontWeight:'600', fontSize:'11px' }}>
                    {tr.depasse?'🔴 Dépassé':`⏳ ${tr.label}`}
                  </span>
                )}
              </div>

              {/* Montant + boutons - autorise le retour a la ligne si 3 boutons */}
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <span style={{ color:'#C9A84C', fontWeight:'800', fontSize:'13px', whiteSpace:'nowrap' }}>{s.montant} FCFA</span>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {/* Reçu entrée */}
                  <button onClick={()=>setRecuVisible({ texte:genererRecuEntree(s), titre:"🧾 REÇU D'ENTRÉE" })}
                    style={{ display:'flex', alignItems:'center', gap:'2px', padding:'5px 8px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#EEF2FF', color:'#1B3A6B', fontWeight:'700', fontSize:'10px', whiteSpace:'nowrap' }}>
                    <Printer size={11}/> Entrée
                  </button>
                  {/* Prolonger ou Check-out */}
                  {s.statut==='en_cours' && (
                    <>
                      <button onClick={()=>setSejourAProlonger(s)}
                        style={{ display:'flex', alignItems:'center', gap:'2px', padding:'5px 8px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#FFF8E1', color:'#C9A84C', fontWeight:'700', fontSize:'10px', whiteSpace:'nowrap' }}>
                        <RefreshCw size={11}/> Prolonger
                      </button>
                      <button onClick={()=>handleCheckout(s)}
                        style={{ display:'flex', alignItems:'center', gap:'2px', padding:'5px 8px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#FFF0F0', color:'#E74C3C', fontWeight:'700', fontSize:'10px', whiteSpace:'nowrap' }}>
                        <LogOut size={11}/> Sortie
                      </button>
                    </>
                  )}
                  {/* Activer une reservation a venir : le client vient d'arriver */}
                  {s.statut==='a_venir' && (
                    <button onClick={()=>{ if(onActiverReservation) onActiverReservation(s.id) }}
                      style={{ display:'flex', alignItems:'center', gap:'2px', padding:'5px 8px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#F5F3FF', color:'#8B5CF6', fontWeight:'700', fontSize:'10px', whiteSpace:'nowrap' }}>
                      <LogIn size={11}/> Client arrive
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bouton + géré par la NavBar */}

      {showConfetti && <Confetti onFin={() => setShowConfetti(false)}/>}
      {showFormulaire && <FormulaireNouveauSejour onClose={()=>setShowFormulaire(false)} onAjouter={handleAjouter} chambresGenerees={chambresGenerees} tousLesSejours={sejours}/>}
      {sejourAProlonger && <ModalProlongation sejour={sejourAProlonger} onClose={()=>setSejourAProlonger(null)} onProlonger={handleProlonger}/>}
      {recuVisible && <ModalRecu texte={recuVisible.texte} titre={recuVisible.titre} onClose={()=>setRecuVisible(null)}/>}
    </div>
  )
}
