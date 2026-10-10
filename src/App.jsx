import { useState, useEffect, useRef } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
import Caisse from './screens/Caisse'
import Menu from './screens/menu/Menu'
import NavBar from './components/NavBar'
import { DEVISES, detecterDevise, trouverDevise } from './devises'
import { db, auth } from './firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { lireParams, PARAMS_DEFAUT } from './screens/menu/Menu'

const styleTransition = `
  @keyframes screenIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .screen-in { animation: screenIn 0.25s ease both; }
`

const ACCES = {
  directeur:      ['dashboard','chambres','sejours','caisse','menu'],
  receptionniste: ['dashboard','chambres','sejours','caisse','menu'],
  caissier:       ['dashboard','caisse','menu'],
}

function versDate(dateFR, heure) {
  if (!dateFR) return null
  const [j, m, a] = dateFR.split('/').map(Number)
  const [h, min]  = (heure || '00:00').split(':').map(Number)
  return new Date(a, m - 1, j, h || 0, min || 0)
}

function periodeDuSejour(s) {
  const debut = versDate(s.dateArrivee, s.heureArrivee)
  const fin   = versDate(s.dateDepart || s.dateArrivee, s.heureDepart)
  return [debut, fin]
}

function periodesSeChevauchent(debutA, finA, debutB, finB) {
  if (!debutA || !finA || !debutB || !finB) return false
  return debutA < finB && debutB < finA
}

export function genererChambres(sejours = [], categories = PARAMS_DEFAUT.categories) {
  const chambres = []
  const maintenant = new Date()
  categories.forEach(cat => {
    for (let i = 1; i <= cat.nombre; i++) {
      const num = String(cat.debut + i)
      const enCours = sejours.find(s => s.chambre === num && s.statut === 'en_cours')
      const aVenir = sejours.find(s => {
        if (s.chambre !== num || s.statut !== 'a_venir') return false
        const [debut] = periodeDuSejour(s)
        if (!debut) return false
        const minutesAvant = (debut - maintenant) / 60000
        return minutesAvant <= 120 && minutesAvant > -1440
      })
      const sejour = enCours || aVenir
      chambres.push({
        num, cat: cat.nom,
        statut: sejour ? (sejour.statut === 'a_venir' ? 'a_venir' : 'occupee') : 'libre',
        tarifNuit: cat.tarifNuit, tarifHeure: cat.tarifHeure,
        client: sejour?.client || null,
        telephone: sejour?.telephone || null,
        dateDepart: sejour?.dateDepart || null,
        heureDepart: sejour?.heureDepart || null,
        probleme: null,
      })
    }
  })
  return chambres
}

// ─── localStorage — clés préfixées par UID ───────────────────────────────────
function storageKey(uid, key) {
  return uid ? `homs_${uid}_${key}` : `homs_${key}`
}
function sauvegarderLocal(uid, data) {
  try { localStorage.setItem(storageKey(uid, 'data_v1'), JSON.stringify(data)) } catch (e) {}
}
function chargerLocal(uid) {
  try {
    const raw = localStorage.getItem(storageKey(uid, 'data_v1'))
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}
function sauvegarderJournalLocal(uid, journal) {
  try { localStorage.setItem(storageKey(uid, 'journal'), JSON.stringify(journal)) } catch (e) {}
}
function chargerJournalLocal(uid) {
  try {
    const raw = localStorage.getItem(storageKey(uid, 'journal'))
    return raw ? JSON.parse(raw) : []
  } catch (e) { return [] }
}
function lireDeviseLocal(uid) {
  try { return localStorage.getItem(storageKey(uid, 'devise')) || null } catch { return null }
}
function sauvegarderDeviseLocal(uid, code) {
  try { localStorage.setItem(storageKey(uid, 'devise'), code) } catch {}
}
function lireThemeLocal(uid, userId) {
  try { return localStorage.getItem(`homs_${uid}_theme_${userId}`) === 'sombre' } catch { return false }
}

// ─── Firestore helpers ────────────────────────────────────────────────────────
async function sauvegarderFirestore(hotelId, sejours, entreesDiverses, sortiesDiverses, historique) {
  if (!hotelId || hotelId === 'admin_local') return
  try {
    await setDoc(doc(db, 'hotels', hotelId, 'data', 'caisse'), {
      sejours, entreesDiverses, sortiesDiverses, historique,
      updatedAt: new Date().toISOString(),
    })
  } catch (e) {}
}

async function sauvegarderJournalFirestore(hotelId, entrees) {
  if (!hotelId || hotelId === 'admin_local') return
  try {
    await setDoc(doc(db, 'hotels', hotelId, 'data', 'journal'), {
      entrees, updatedAt: new Date().toISOString(),
    })
  } catch (e) {}
}

function horodatageActuel() {
  const now = new Date()
  return `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
}

function jouerSonnerie(type = 'alerte') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const freqs = type === 'rappel' ? [440, 550] : type === 'urgent' ? [880, 440, 880] : [660, 440]
    let temps = ctx.currentTime
    freqs.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, temps)
      gain.gain.exponentialRampToValueAtTime(0.001, temps + 0.4)
      osc.start(temps); osc.stop(temps + 0.4)
      temps += 0.45
    })
  } catch (e) {}
}

function AlerteNoShow({ sejours, onLiberer, onPatienter }) {
  if (!sejours || sejours.length === 0) return null
  const s = sejours[0]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'360px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ background:'linear-gradient(135deg, #E74C3C, #C0392B)', padding:'20px', textAlign:'center' }}>
          <div style={{ fontSize:'36px', marginBottom:'8px' }}>⚠️</div>
          <div style={{ color:'white', fontWeight:'800', fontSize:'17px' }}>No-Show détecté</div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'12px', marginTop:'4px' }}>Client absent depuis plus d'1 heure</div>
        </div>
        <div style={{ padding:'20px' }}>
          <div style={{ background:'#FFF5F5', borderRadius:'12px', padding:'14px', marginBottom:'16px', border:'1px solid #FFCDD2' }}>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'#1B3A6B', marginBottom:'6px' }}>{s.client}</div>
            <div style={{ fontSize:'13px', color:'#666', marginBottom:'4px' }}>📞 {s.telephone}</div>
            <div style={{ fontSize:'13px', color:'#666', marginBottom:'4px' }}>🏨 Chambre {s.chambre} · {s.categorie}</div>
            <div style={{ fontSize:'13px', color:'#666', marginBottom:'4px' }}>📅 Arrivée prévue : {s.dateArrivee} à {s.heureArrivee}</div>
            <div style={{ fontSize:'13px', color:'#E74C3C', fontWeight:'700' }}>⏰ Dépassement : +1h sans présentation</div>
          </div>
          <div style={{ background:'#FFF8E1', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', fontSize:'12px', color:'#B7791F', fontWeight:'600' }}>💡 Que souhaitez-vous faire ?</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <button onClick={() => onLiberer(s.id)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#E74C3C', color:'white', fontWeight:'800', fontSize:'14px' }}>🔓 Libérer la chambre (No-Show)</button>
            <button onClick={() => onPatienter(s.id)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'2px solid #1B3A6B', cursor:'pointer', background:'white', color:'#1B3A6B', fontWeight:'800', fontSize:'14px' }}>⏳ Patienter encore</button>
          </div>
          {sejours.length > 1 && <div style={{ marginTop:'12px', textAlign:'center', fontSize:'12px', color:'#999' }}>+ {sejours.length - 1} autre{sejours.length > 2 ? 's' : ''} no-show en attente</div>}
        </div>
      </div>
    </div>
  )
}

function ModalChoixDevise({ codeDetecte, onValider }) {
  const codeInitial = codeDetecte || 'XOF'
  const [code, setCode] = useState(codeInitial)
  const devise = trouverDevise(code)
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'380px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'20px', textAlign:'center' }}>
          <div style={{ fontSize:'36px', marginBottom:'8px' }}>💱</div>
          <div style={{ color:'#C9A84C', fontWeight:'800', fontSize:'17px' }}>Devise de votre établissement</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', marginTop:'4px' }}>Bienvenue sur HOMS-HÔTEL MANAGER</div>
        </div>
        <div style={{ padding:'20px' }}>
          {codeDetecte ? (
            <div style={{ background:'#F0FFF4', border:'1px solid #2ECC71', borderRadius:'12px', padding:'12px 14px', marginBottom:'14px', fontSize:'13px', color:'#1B3A6B' }}>
              📍 D'après votre téléphone, nous vous recommandons : <strong>{trouverDevise(codeDetecte).nom} ({trouverDevise(codeDetecte).symbole})</strong>
            </div>
          ) : (
            <div style={{ background:'#FFF8E1', border:'1px solid #C9A84C', borderRadius:'12px', padding:'12px 14px', marginBottom:'14px', fontSize:'13px', color:'#666' }}>
              Nous n'avons pas pu détecter votre pays. Veuillez choisir votre devise.
            </div>
          )}
          <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }}>Choisir la devise</label>
          <select value={code} onChange={e=>setCode(e.target.value)} style={{ width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', background:'white', marginBottom:'12px' }}>
            {DEVISES.map(d => <option key={d.code} value={d.code}>{d.nom} ({d.code}) — {d.symbole}</option>)}
          </select>
          <div style={{ background:'#F0F4FF', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#1B3A6B', fontWeight:'600', marginBottom:'16px' }}>
            Sélection : <strong>{devise.nom}</strong> ({devise.symbole})
            <div style={{ fontWeight:'400', color:'#888', marginTop:'4px' }}>Le directeur pourra la modifier à tout moment dans Menu → Paramètres directeur.</div>
          </div>
          <button onClick={() => onValider(code)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'14px' }}>✅ Confirmer cette devise</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [ecran,             setEcran]             = useState('splash')
  const [onglet,            setOnglet]            = useState('dashboard')
  const [utilisateur,       setUtilisateur]       = useState(null)
  const [hotelId,           setHotelId]           = useState(null)
  const [cle,               setCle]               = useState(0)
  const [ouvrirFormulaire,  setOuvrirFormulaire]  = useState(false)
  const [themeSombre,       setThemeSombre]       = useState(false)
  const [codeDevise,        setCodeDevise]        = useState('XOF')
  const [showChoixDevise,   setShowChoixDevise]   = useState(false)
  const [chargementDonnees, setChargementDonnees] = useState(false)
  const [configChambres,    setConfigChambres]    = useState(PARAMS_DEFAUT.categories)

  const [sejours,         setSejours]         = useState([])
  const [entreesDiverses, setEntreesDiverses] = useState([])
  const [sortiesDiverses, setSortiesDiverses] = useState([])
  const [historique,      setHistorique]      = useState([])
  const [journal,         setJournal]         = useState([])
  const [alertesSonnees,  setAlertesSonnees]  = useState({})
  const [noShowASignaler, setNoShowASignaler] = useState([])
  const [noShowIgnores,   setNoShowIgnores]   = useState({})

  const intervalRef      = useRef(null)
  const saveTimeoutRef   = useRef(null)
  const hotelIdRef       = useRef(null)
  const snapshotUnsubRef = useRef(null)
  const localWriteRef    = useRef(false)

  useEffect(() => { hotelIdRef.current = hotelId }, [hotelId])

  const ajouterAuJournal = (entree, hId) => {
    setJournal(prev => {
      const maj = [{ ...entree, date: horodatageActuel(), id: Date.now() }, ...prev].slice(0, 500)
      const idHotel = hId || hotelIdRef.current
      sauvegarderJournalLocal(idHotel, maj)
      if (idHotel && idHotel !== 'admin_local') sauvegarderJournalFirestore(idHotel, maj)
      return maj
    })
  }

  const sauvegarderTout = (hId, s, ed, sd, h) => {
    sauvegarderLocal(hId, { sejours:s, entreesDiverses:ed, sortiesDiverses:sd, historique:h })
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      localWriteRef.current = true
      sauvegarderFirestore(hId, s, ed, sd, h).then(() => {
        setTimeout(() => { localWriteRef.current = false }, 1000)
      })
    }, 2000)
  }

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleTransition
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  // ── Écoute temps réel après connexion ──
  useEffect(() => {
    if (!hotelId || hotelId === 'admin_local') return
    setChargementDonnees(true)
    if (snapshotUnsubRef.current) snapshotUnsubRef.current()

    snapshotUnsubRef.current = onSnapshot(
      doc(db, 'hotels', hotelId, 'data', 'caisse'),
      (snap) => {
        setChargementDonnees(false)
        if (localWriteRef.current) return
        if (snap.exists()) {
          const data = snap.data()
          setSejours(data.sejours || [])
          setEntreesDiverses(data.entreesDiverses || [])
          setSortiesDiverses(data.sortiesDiverses || [])
          setHistorique(data.historique || [])
          sauvegarderLocal(hotelId, {
            sejours: data.sejours || [],
            entreesDiverses: data.entreesDiverses || [],
            sortiesDiverses: data.sortiesDiverses || [],
            historique: data.historique || [],
          })
        } else {
          setSejours([])
          setEntreesDiverses([])
          setSortiesDiverses([])
          setHistorique([])
        }
      },
      () => { setChargementDonnees(false) }
    )
    return () => { if (snapshotUnsubRef.current) snapshotUnsubRef.current() }
  }, [hotelId])

  // ── Sauvegarde automatique ──
  useEffect(() => {
    if (!hotelId) return
    sauvegarderTout(hotelId, sejours, entreesDiverses, sortiesDiverses, historique)
  }, [sejours, entreesDiverses, sortiesDiverses, historique])

  useEffect(() => {
    const verifier = () => {
      const now = new Date()
      const idsALiberer = []
      sejours.filter(s => s.statut === 'en_cours').forEach(s => {
        const [, fin] = periodeDuSejour(s)
        if (!fin) return
        const diffMin = (fin - now) / 60000
        if (diffMin > 0 && diffMin <= 5 && !alertesSonnees[`rappel_${s.id}`]) { jouerSonnerie('rappel'); setAlertesSonnees(prev => ({ ...prev, [`rappel_${s.id}`]: true })) }
        if (diffMin <= 0 && diffMin > -1 && !alertesSonnees[`alerte_${s.id}`]) { jouerSonnerie('alerte'); setAlertesSonnees(prev => ({ ...prev, [`alerte_${s.id}`]: true })) }
        if (diffMin <= -20 && !alertesSonnees[`urgent_${s.id}`]) { jouerSonnerie('urgent'); setAlertesSonnees(prev => ({ ...prev, [`urgent_${s.id}`]: true })) }
        if (diffMin <= -180) idsALiberer.push(s.id)
      })
      if (idsALiberer.length > 0) {
        setSejours(prev => prev.map(s => idsALiberer.includes(s.id) ? { ...s, statut:'termine', depassementNonRegle:true } : s))
      }
      const noShows = sejours.filter(s => {
        if (s.statut !== 'a_venir') return false
        if (noShowIgnores[s.id]) return false
        const [debut] = periodeDuSejour(s)
        if (!debut) return false
        return (now - debut) / 60000 >= 60
      })
      if (noShows.length > 0) setNoShowASignaler(noShows)
    }
    verifier()
    intervalRef.current = setInterval(verifier, 60000)
    return () => clearInterval(intervalRef.current)
  }, [sejours, alertesSonnees, noShowIgnores])

  const confirmerNoShow = (id) => {
    setSejours(prev => prev.map(s => s.id === id ? { ...s, statut:'no_show' } : s))
    setNoShowASignaler(prev => prev.filter(s => s.id !== id))
    jouerSonnerie('alerte')
  }

  const ignorerNoShow = (id) => {
    setNoShowIgnores(prev => ({ ...prev, [id]: true }))
    setNoShowASignaler(prev => prev.filter(s => s.id !== id))
  }

  const chambresGenerees = genererChambres(sejours, configChambres)
  const chambresStats = {
    total:       chambresGenerees.length,
    occupees:    chambresGenerees.filter(c => c.statut === 'occupee').length,
    disponibles: chambresGenerees.filter(c => c.statut === 'libre').length,
    nettoyer:    chambresGenerees.filter(c => c.statut === 'nettoyage').length,
    problemes:   chambresGenerees.filter(c => c.statut === 'probleme').length,
    aVenir:      chambresGenerees.filter(c => c.statut === 'a_venir').length,
  }

  const sejoursEncaisses = sejours.filter(s => ['en_cours','a_venir','termine','no_show'].includes(s.statut))
  const totalSejours   = sejoursEncaisses.reduce((sum, s) => sum + (s.montantNum || 0), 0)
  const totalNuits     = sejoursEncaisses.filter(s => s.type === 'nuit').reduce((sum, s) => sum + (s.montantNum || 0), 0)
  const totalHeures    = sejoursEncaisses.filter(s => s.type === 'heure').reduce((sum, s) => sum + (s.montantNum || 0), 0)
  const totalEntrees   = entreesDiverses.reduce((sum, e) => sum + (e.montant || 0), 0)
  const totalSorties   = sortiesDiverses.reduce((sum, s) => sum + (s.montant || 0), 0)
  const soldeNet       = totalSejours + totalEntrees - totalSorties
  const tauxOccupation = chambresStats.total > 0 ? Math.round((chambresStats.occupees / chambresStats.total) * 100) : 0
  const caisse = { totalSejours, totalNuits, totalHeures, totalEntrees, totalSorties, soldeNet }

  const ajouterSejour = (nouveau) => {
    const [debutNouveau, finNouveau] = periodeDuSejour(nouveau)
    const conflit = sejours.find(s => {
      if (s.chambre !== nouveau.chambre) return false
      if (s.statut !== 'en_cours' && s.statut !== 'a_venir') return false
      const [debutExistant, finExistant] = periodeDuSejour(s)
      return periodesSeChevauchent(debutNouveau, finNouveau, debutExistant, finExistant)
    })
    if (conflit) return false
    const statut = nouveau.statut || 'en_cours'
    const heureReelle = statut === 'en_cours' ? new Date().toTimeString().slice(0, 5) : nouveau.heureArrivee
    const ns = {
      ...nouveau, id:Date.now(), heureArrivee:heureReelle,
      montantNum: parseInt((nouveau.montant || '0').replace(/\s/g, ''), 10) || 0,
      statut,
    }
    setSejours(prev => [ns, ...prev])
    ajouterAuJournal({ type:'sejour_cree', utilisateur:utilisateur?.nom||'Inconnu', role:utilisateur?.role||'', details:`Séjour créé : ${ns.client} · Ch. ${ns.chambre} · ${ns.montant} FCFA` })
    return true
  }

  const terminerSejour = (id) => {
    const s = sejours.find(x => x.id === id)
    setSejours(prev => prev.map(s => s.id === id ? { ...s, statut:'termine' } : s))
    setAlertesSonnees(prev => { const u={...prev}; delete u[`rappel_${id}`]; delete u[`alerte_${id}`]; delete u[`urgent_${id}`]; return u })
    if (s) ajouterAuJournal({ type:'sejour_termine', utilisateur:utilisateur?.nom||'Inconnu', role:utilisateur?.role||'', details:`Séjour terminé : ${s.client} · Ch. ${s.chambre}` })
  }

  const activerReservation = (id) => {
    setSejours(prev => prev.map(s => s.id !== id ? s : { ...s, statut:'en_cours', heureArrivee:new Date().toTimeString().slice(0,5) }))
    setNoShowIgnores(prev => { const u={...prev}; delete u[id]; return u })
    setNoShowASignaler(prev => prev.filter(s => s.id !== id))
  }

  const prolongerSejour = (id, ajout, supplement) => {
    const s = sejours.find(x => x.id === id)
    setSejours(prev => prev.map(s => {
      if (s.id !== id) return s
      const nouveauMontant = (s.montantNum || 0) + supplement
      const historiquePrecedent = s.historiqueProlongations || []
      if (s.type === 'nuit') {
        const ancienneDateDepart = s.dateDepart
        const [j, m, a] = s.dateDepart.split('/').map(Number)
        const d = new Date(a, m-1, j)
        d.setDate(d.getDate() + (ajout || 0))
        const nouvelleDateDepart = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
        return { ...s, montantNum:nouveauMontant, montant:nouveauMontant.toLocaleString('fr-FR'), dateDepart:nouvelleDateDepart, historiqueProlongations:[...historiquePrecedent, { avant:ancienneDateDepart, apres:nouvelleDateDepart, montant:supplement, unite:'nuit' }] }
      } else {
        const ancienneHeureDepart = s.heureDepart
        const [h, min] = s.heureDepart.split(':').map(Number)
        const totalMin = h*60 + min + (ajout||0)*60
        const nouvelleHeureDepart = `${String(Math.floor(totalMin/60)%24).padStart(2,'0')}:${String(totalMin%60).padStart(2,'0')}`
        return { ...s, montantNum:nouveauMontant, montant:nouveauMontant.toLocaleString('fr-FR'), heureDepart:nouvelleHeureDepart, historiqueProlongations:[...historiquePrecedent, { avant:ancienneHeureDepart, apres:nouvelleHeureDepart, montant:supplement, unite:'heure' }] }
      }
    }))
    setAlertesSonnees(prev => { const u={...prev}; delete u[`rappel_${id}`]; delete u[`alerte_${id}`]; delete u[`urgent_${id}`]; return u })
    if (s) ajouterAuJournal({ type:'sejour_prolonge', utilisateur:utilisateur?.nom||'Inconnu', role:utilisateur?.role||'', details:`Séjour prolongé : ${s.client} · Ch. ${s.chambre} · +${supplement.toLocaleString('fr-FR')} FCFA` })
  }

  const changerOnglet = (nouvelOnglet) => {
    if (nouvelOnglet === onglet) return
    const accesRole = ACCES[utilisateur?.role] || ACCES.receptionniste
    if (!accesRole.includes(nouvelOnglet)) return
    setOnglet(nouvelOnglet)
    setCle(k => k + 1)
  }

  const handleConnexion = (user) => {
    const hId = user.uid && user.uid !== 'admin_local' ? user.uid : null

    // ── Réinitialiser complètement l'état ──
    setSejours([])
    setEntreesDiverses([])
    setSortiesDiverses([])
    setHistorique([])
    setJournal([])
    setAlertesSonnees({})
    setNoShowASignaler([])
    setNoShowIgnores([])

    // ── Charger les paramètres propres à cet hôtel ──
    const params = lireParams(hId)
    setConfigChambres(params.categories)

    // ── Charger la devise ──
    const deviseHotel = hId ? (lireDeviseLocal(hId) || detecterDevise() || 'XOF') : 'XOF'
    setCodeDevise(deviseHotel)

    // ── Charger le journal local ──
    setJournal(hId ? chargerJournalLocal(hId) : [])

    setHotelId(hId)
    setUtilisateur(user)
    setThemeSombre(hId ? lireThemeLocal(hId, user.nom) : false)
    setOnglet(user.role === 'caissier' ? 'caisse' : 'dashboard')
    setEcran('app')

    if (!lireDeviseLocal(hId)) setShowChoixDevise(true)

    // ── Journal connexion ──
    if (hId) {
      const now = new Date()
      const horodatage = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const entree = { type:'connexion', utilisateur:user.nom||'Inconnu', role:user.role||'', details:`${user.nom||'Utilisateur'} s'est connecté`, date:horodatage, id:Date.now() }
      setJournal(prev => {
        const maj = [entree, ...prev].slice(0, 500)
        sauvegarderJournalLocal(hId, maj)
        sauvegarderJournalFirestore(hId, maj)
        return maj
      })
    }
  }

  const handleDeconnexion = async () => {
    ajouterAuJournal({ type:'deconnexion', utilisateur:utilisateur?.nom||'Inconnu', role:utilisateur?.role||'', details:`${utilisateur?.nom||'Utilisateur'} s'est déconnecté` })
    if (snapshotUnsubRef.current) snapshotUnsubRef.current()
    try { await signOut(auth) } catch (e) {}
    setUtilisateur(null)
    setHotelId(null)
    setThemeSombre(false)
    setOnglet('dashboard')
    setSejours([])
    setEntreesDiverses([])
    setSortiesDiverses([])
    setHistorique([])
    setJournal([])
    setAlertesSonnees({})
    setNoShowASignaler([])
    setNoShowIgnores({})
    setConfigChambres(PARAMS_DEFAUT.categories)
    setCodeDevise('XOF')
    setEcran('connexion')
  }

  const handleValiderDevise = (code) => {
    if (hotelId) sauvegarderDeviseLocal(hotelId, code)
    setCodeDevise(code)
    setShowChoixDevise(false)
  }

  const cloturerCaisse = () => {
    const maintenant = new Date()
    const horodatage = `${String(maintenant.getDate()).padStart(2,'0')}/${String(maintenant.getMonth()+1).padStart(2,'0')}/${maintenant.getFullYear()} ${String(maintenant.getHours()).padStart(2,'0')}:${String(maintenant.getMinutes()).padStart(2,'0')}`
    const entreesSejours = sejours.filter(s => ['en_cours','a_venir','termine','no_show'].includes(s.statut)).map(s => ({ type:'sejour', client:s.client, chambre:s.chambre, montant:s.montantNum||0, mode:s.modePaiement, date:s.dateArrivee, cloture:horodatage, noShow:s.statut==='no_show' }))
    const entreesArchivees = entreesDiverses.map(e => ({ type:'entree', libelle:e.libelle, montant:e.montant||0, mode:e.mode, date:e.heure, cloture:horodatage }))
    const sortiesArchivees = sortiesDiverses.map(s => ({ type:'sortie', libelle:s.libelle, montant:s.montant||0, mode:s.mode, date:s.heure, cloture:horodatage }))
    setHistorique(prev => [...prev, ...entreesSejours, ...entreesArchivees, ...sortiesArchivees])
    setSejours(prev => prev.filter(s => s.statut !== 'termine' && s.statut !== 'no_show'))
    setEntreesDiverses([])
    setSortiesDiverses([])
    setNoShowASignaler([])
    ajouterAuJournal({ type:'cloture_caisse', utilisateur:utilisateur?.nom||'Inconnu', role:utilisateur?.role||'', details:`Clôture de caisse · Solde net : ${soldeNet.toLocaleString('fr-FR')} FCFA` })
  }

  const handleReinitialiser = () => {
    if (hotelId) {
      try { localStorage.removeItem(storageKey(hotelId, 'data_v1')) } catch (e) {}
    }
    setSejours([])
    setEntreesDiverses([])
    setSortiesDiverses([])
    setAlertesSonnees({})
    setNoShowASignaler([])
    setNoShowIgnores({})
  }

  if (ecran === 'splash')    return <Splash onFin={() => setEcran('connexion')}/>
  if (ecran === 'connexion') return <Connexion onConnexion={handleConnexion}/>

  const accesRole = ACCES[utilisateur?.role] || ACCES.receptionniste

  if (chargementDonnees) {
    return (
      <div style={{ minHeight:'100vh', background:'#F5F7FA', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
        <div style={{ width:'40px', height:'40px', border:'4px solid #E0E0E0', borderTopColor:'#1B3A6B', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color:'#1B3A6B', fontWeight:'700', fontSize:'14px' }}>Synchronisation des données...</p>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom:'70px', background: themeSombre ? '#0F172A' : '#F5F7FA', minHeight:'100vh' }}>
      <div key={cle} className="screen-in">
        {onglet === 'dashboard' && <Dashboard utilisateur={utilisateur} sejours={sejours} caisse={caisse} chambresStats={chambresStats} tauxOccupation={tauxOccupation} sombre={themeSombre} devise={trouverDevise(codeDevise).symbole}/>}
        {onglet === 'chambres' && accesRole.includes('chambres') && <Chambres chambres={chambresGenerees} chambresStats={chambresStats} sombre={themeSombre} devise={trouverDevise(codeDevise).symbole}/>}
        {onglet === 'sejours' && accesRole.includes('sejours') && <Sejours sejours={sejours} chambresGenerees={chambresGenerees} onAjouter={ajouterSejour} onTerminer={terminerSejour} onProlonger={prolongerSejour} onActiverReservation={activerReservation} ouvrirFormulaire={ouvrirFormulaire} onFormulaireOuvert={() => setOuvrirFormulaire(false)} sombre={themeSombre} devise={trouverDevise(codeDevise).symbole}/>}
        {onglet === 'caisse' && accesRole.includes('caisse') && <Caisse sejours={sejoursEncaisses} entreesDiverses={entreesDiverses} sortiesDiverses={sortiesDiverses} onAjouterEntree={e => setEntreesDiverses(prev => [e, ...prev])} onAjouterSortie={s => setSortiesDiverses(prev => [s, ...prev])} caisse={caisse} onCloturerCaisse={cloturerCaisse} chambres={chambresGenerees} devise={trouverDevise(codeDevise).symbole}/>}
        {onglet === 'menu' && <Menu
          utilisateur={utilisateur}
          onDeconnexion={handleDeconnexion}
          onReinitialiser={handleReinitialiser}
          historique={historique}
          journal={journal}
          onThemeChange={setThemeSombre}
          onDeviseChange={(code) => { setCodeDevise(code); if(hotelId) sauvegarderDeviseLocal(hotelId, code) }}
          onParamsChange={(params) => setConfigChambres(params.categories)}
          devise={trouverDevise(codeDevise).symbole}
          hotelId={hotelId}
          codeDevise={codeDevise}
        />}
      </div>

      <NavBar onglet={onglet} setOnglet={changerOnglet} role={utilisateur?.role} onAjouterSejour={() => { setOuvrirFormulaire(true); if (onglet !== 'sejours') changerOnglet('sejours') }}/>

      {noShowASignaler.length > 0 && ecran === 'app' && <AlerteNoShow sejours={noShowASignaler} onLiberer={confirmerNoShow} onPatienter={ignorerNoShow}/>}
      {showChoixDevise && ecran === 'app' && <ModalChoixDevise codeDetecte={detecterDevise()} onValider={handleValiderDevise}/>}
    </div>
  )
}
