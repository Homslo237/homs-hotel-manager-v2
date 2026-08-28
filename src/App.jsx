import { useState, useEffect, useRef } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
import Caisse from './screens/Caisse'
import Menu from './screens/Menu'
import NavBar from './components/NavBar'

const styleTransition = `
  @keyframes screenIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .screen-in { animation: screenIn 0.25s ease both; }
`

const ACCES = {
  directeur:      ['dashboard','chambres','sejours','caisse','menu'],
  receptionniste: ['dashboard','chambres','sejours','caisse','menu'],
  caissier:       ['dashboard','caisse','menu'],
}

// ─── Configuration 50 chambres ────────────────────────────────────────────────
export const CONFIG_CHAMBRES = {
  categories: [
    { nom:'Standard', debut:100, nombre:20, tarifNuit:25000, tarifHeure:2500 },
    { nom:'Confort',  debut:200, nombre:20, tarifNuit:35000, tarifHeure:3500 },
    { nom:'Suite',    debut:300, nombre:10, tarifNuit:65000, tarifHeure:6500 },
  ]
}

// ─── Génération des 50 chambres ───────────────────────────────────────────────
export function genererChambres(sejours=[]) {
  const chambres = []
  CONFIG_CHAMBRES.categories.forEach(cat => {
    for (let i = 1; i <= cat.nombre; i++) {
      const num = String(cat.debut + i)
      const sejour = sejours.find(s =>
        s.chambre === num && (s.statut === 'en_cours' || s.statut === 'reserve')
      )
      chambres.push({
        num,
        cat: cat.nom,
        statut: sejour ? (sejour.statut === 'reserve' ? 'reserve' : 'occupee') : 'libre',
        tarifNuit: cat.tarifNuit,
        tarifHeure: cat.tarifHeure,
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

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'homs_data_v1'

function sauvegarder(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch(e) {}
}

function charger() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch(e) { return null }
}

// ─── Séjours initiaux (démo) ──────────────────────────────────────────────────
const SEJOURS_DEMO = [
  { id:1, client:'M. Kouassi Ama',   telephone:'+225 07 11 22 33', chambre:'205', categorie:'Confort',  dateArrivee:'18/08/2026', heureArrivee:'14:00', dateDepart:'28/08/2026', heureDepart:'12:00', duree:'3 nuits', type:'nuit',  statut:'en_cours', montant:'105 000', montantNum:105000, modePaiement:'Orange Money' },
  { id:2, client:'Mme Diallo Fatou', telephone:'+225 05 44 55 66', chambre:'101', categorie:'Standard', dateArrivee:'17/08/2026', heureArrivee:'10:00', dateDepart:'28/08/2026', heureDepart:'12:00', duree:'2 nuits', type:'nuit',  statut:'en_cours', montant:'50 000',  montantNum:50000,  modePaiement:'Especes' },
  { id:3, client:'M. Bamba Seydou',  telephone:'+225 01 77 88 99', chambre:'302', categorie:'Suite',    dateArrivee:'25/08/2026', heureArrivee:'09:30', dateDepart:'25/08/2026', heureDepart:'22:30', duree:'3 heures', type:'heure', statut:'en_cours', montant:'19 500',  montantNum:19500,  modePaiement:'MTN Mobile Money' },
]

const CHAMBRES_STATS_INITIALES = { total:50, disponibles:37, occupees:8, nettoyer:3, problemes:2 }

// ─── Sons d'alerte ────────────────────────────────────────────────────────────
function jouerSonnerie(type = 'alerte') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const freqs = type === 'rappel' ? [440, 550] : type === 'urgent' ? [880, 440, 880] : [660, 440]
    let temps = ctx.currentTime
    freqs.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, temps)
      gain.gain.exponentialRampToValueAtTime(0.001, temps + 0.4)
      osc.start(temps)
      osc.stop(temps + 0.4)
      temps += 0.45
    })
  } catch(e) {}
}

export default function App() {
  const [ecran,            setEcran]            = useState('splash')
  const [onglet,           setOnglet]           = useState('dashboard')
  const [utilisateur,      setUtilisateur]      = useState(null)
  const [cle,              setCle]              = useState(0)
  const [ouvrirFormulaire, setOuvrirFormulaire] = useState(false)

  // ─── ÉTAT GLOBAL — chargé depuis localStorage ─────────────────────────────
  const [sejours,         setSejours]         = useState([])
  const [entreesDiverses, setEntreesDiverses] = useState([])
  const [sortiesDiverses, setSortiesDiverses] = useState([])
  const [chambresStats,   setChambresStats]   = useState(CHAMBRES_STATS_INITIALES)
  const [alertesSonnees,  setAlertesSonnees]  = useState({})
  const intervalRef = useRef(null)

  // ─── Chargement initial depuis localStorage ────────────────────────────────
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleTransition
    document.head.appendChild(el)

    const sauvegarde = charger()
    if (sauvegarde) {
      setSejours(sauvegarde.sejours || SEJOURS_DEMO)
      setEntreesDiverses(sauvegarde.entreesDiverses || [])
      setSortiesDiverses(sauvegarde.sortiesDiverses || [])
      setChambresStats(sauvegarde.chambresStats || CHAMBRES_STATS_INITIALES)
    } else {
      setSejours(SEJOURS_DEMO)
    }

    return () => document.head.removeChild(el)
  }, [])

  // ─── Sauvegarde automatique à chaque changement ───────────────────────────
  useEffect(() => {
    if (sejours.length > 0 || entreesDiverses.length > 0 || sortiesDiverses.length > 0) {
      sauvegarder({ sejours, entreesDiverses, sortiesDiverses, chambresStats })
    }
  }, [sejours, entreesDiverses, sortiesDiverses, chambresStats])

  // ─── Vérification dépassement + sonnerie toutes les minutes ───────────────
  useEffect(() => {
    const verifier = () => {
      const now = new Date()
      sejours.filter(s => s.statut === 'en_cours').forEach(s => {
        let fin
        if (s.type === 'nuit') {
          const [j,m,a] = (s.dateDepart||'01/01/2099').split('/').map(Number)
          fin = new Date(a, m-1, j, 12, 0)
        } else {
          const today = new Date()
          const [h,min] = (s.heureDepart||'23:59').split(':').map(Number)
          fin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, min)
        }
        const diffMin = (fin - now) / 60000

        // 5 min avant → sonnerie rappel
        if (diffMin > 0 && diffMin <= 5 && !alertesSonnees[`rappel_${s.id}`]) {
          jouerSonnerie('rappel')
          setAlertesSonnees(prev => ({...prev, [`rappel_${s.id}`]: true}))
        }
        // Heure exacte → sonnerie alerte
        if (diffMin <= 0 && diffMin > -1 && !alertesSonnees[`alerte_${s.id}`]) {
          jouerSonnerie('alerte')
          setAlertesSonnees(prev => ({...prev, [`alerte_${s.id}`]: true}))
        }
        // Après tolérance → sonnerie urgente (défaut 20 min)
        if (diffMin <= -20 && !alertesSonnees[`urgent_${s.id}`]) {
          jouerSonnerie('urgent')
          setAlertesSonnees(prev => ({...prev, [`urgent_${s.id}`]: true}))
        }
      })
    }

    intervalRef.current = setInterval(verifier, 60000)
    return () => clearInterval(intervalRef.current)
  }, [sejours, alertesSonnees])

  // ─── Calculs partagés ─────────────────────────────────────────────────────
  const sejoursEnCours = sejours.filter(s => s.statut === 'en_cours')
  const totalSejours   = sejoursEnCours.reduce((sum,s)=>sum+(s.montantNum||0),0)
  const totalNuits     = sejoursEnCours.filter(s=>s.type==='nuit').reduce((sum,s)=>sum+(s.montantNum||0),0)
  const totalHeures    = sejoursEnCours.filter(s=>s.type==='heure').reduce((sum,s)=>sum+(s.montantNum||0),0)
  const totalEntrees   = entreesDiverses.reduce((sum,e)=>sum+(e.montant||0),0)
  const totalSorties   = sortiesDiverses.reduce((sum,s)=>sum+(s.montant||0),0)
  const soldeNet       = totalSejours + totalEntrees - totalSorties
  const tauxOccupation = Math.round((chambresStats.occupees / chambresStats.total) * 100)
  const caisse = { totalSejours, totalNuits, totalHeures, totalEntrees, totalSorties, soldeNet }

  // ─── Chambres générées dynamiquement depuis les séjours ───────────────────
  const chambresGenerees = genererChambres(sejours)

  // ─── Actions globales ──────────────────────────────────────────────────────
  const ajouterSejour = (nouveau) => {
    // Vérifier doublon STRICTEMENT
    const chambreBloquee = sejours.find(s =>
      s.chambre === nouveau.chambre &&
      (s.statut === 'en_cours' || s.statut === 'reserve')
    )
    if (chambreBloquee) return false // Bloquer sans reçu

    const statut = nouveau.statut || 'en_cours'
    const heureReelle = statut === 'en_cours'
      ? new Date().toTimeString().slice(0,5) // Heure exacte de validation
      : nouveau.heureArrivee

    const ns = {
      ...nouveau,
      id: Date.now(),
      heureArrivee: heureReelle,
      montantNum: parseInt((nouveau.montant||'0').replace(/\s/g,''), 10) || 0,
      statut,
    }

    setSejours(prev => {
      const updated = [ns, ...prev]
      return updated
    })

    // Mettre à jour stats chambres
    setChambresStats(prev => ({
      ...prev,
      occupees:    prev.occupees + (statut === 'en_cours' ? 1 : 0),
      disponibles: Math.max(0, prev.disponibles - 1),
    }))

    return true // Succès → autoriser le reçu
  }

  const terminerSejour = (id) => {
    setSejours(prev => prev.map(s => s.id===id ? {...s, statut:'termine'} : s))
    setChambresStats(prev => ({
      ...prev,
      occupees:    Math.max(0, prev.occupees - 1),
      disponibles: prev.disponibles + 1,
    }))
    // Supprimer alertes de ce séjour
    setAlertesSonnees(prev => {
      const updated = {...prev}
      delete updated[`rappel_${id}`]
      delete updated[`alerte_${id}`]
      delete updated[`urgent_${id}`]
      return updated
    })
  }

  const prolongerSejour = (id, supplement) => {
    setSejours(prev => prev.map(s => {
      if (s.id !== id) return s
      const nouveauMontant = (s.montantNum||0) + supplement
      return { ...s, montantNum: nouveauMontant, montant: nouveauMontant.toLocaleString('fr-FR') }
    }))
    // Réinitialiser les alertes pour ce séjour prolongé
    setAlertesSonnees(prev => {
      const updated = {...prev}
      delete updated[`rappel_${id}`]
      delete updated[`alerte_${id}`]
      delete updated[`urgent_${id}`]
      return updated
    })
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  const changerOnglet = (nouvelOnglet) => {
    if (nouvelOnglet === onglet) return
    const accesRole = ACCES[utilisateur?.role] || ACCES.receptionniste
    if (!accesRole.includes(nouvelOnglet)) return
    setOnglet(nouvelOnglet)
    setCle(k => k + 1)
  }

  const handleConnexion = (user) => {
    setUtilisateur(user)
    setOnglet(user.role === 'caissier' ? 'caisse' : 'dashboard')
    setEcran('app')
  }

  const handleDeconnexion = () => {
    setUtilisateur(null)
    setOnglet('dashboard')
    setEcran('connexion')
  }

  if (ecran === 'splash')    return <Splash onFin={() => setEcran('connexion')} />
  if (ecran === 'connexion') return <Connexion onConnexion={handleConnexion} />

  const accesRole = ACCES[utilisateur?.role] || ACCES.receptionniste

  return (
    <div style={{ paddingBottom:'70px', background:'#F5F7FA', minHeight:'100vh' }}>
      <div key={cle} className="screen-in">

        {onglet === 'dashboard' && (
          <Dashboard
            utilisateur={utilisateur}
            sejours={sejours}
            caisse={caisse}
            chambresStats={chambresStats}
            tauxOccupation={tauxOccupation}
          />
        )}

        {onglet === 'chambres' && accesRole.includes('chambres') && (
          <Chambres
            chambres={chambresGenerees}
            chambresStats={chambresStats}
            onMajStats={setChambresStats}
            onMajChambre={(num, statut, note) => {
              // Mettre à jour stats quand statut change manuellement
              setChambresStats(prev => ({...prev}))
            }}
          />
        )}

        {onglet === 'sejours' && accesRole.includes('sejours') && (
          <Sejours
            sejours={sejours}
            chambresGenerees={chambresGenerees}
            onAjouter={ajouterSejour}
            onTerminer={terminerSejour}
            onProlonger={prolongerSejour}
            ouvrirFormulaire={ouvrirFormulaire}
            onFormulaireOuvert={() => setOuvrirFormulaire(false)}
          />
        )}

        {onglet === 'caisse' && accesRole.includes('caisse') && (
          <Caisse
            sejours={sejoursEnCours}
            entreesDiverses={entreesDiverses}
            sortiesDiverses={sortiesDiverses}
            onAjouterEntree={e => setEntreesDiverses(prev=>[e,...prev])}
            onAjouterSortie={s => setSortiesDiverses(prev=>[s,...prev])}
            caisse={caisse}
          />
        )}

        {onglet === 'menu' && (
          <Menu
            utilisateur={utilisateur}
            onDeconnexion={handleDeconnexion}
          />
        )}
      </div>

      <NavBar
        onglet={onglet}
        setOnglet={changerOnglet}
        role={utilisateur?.role}
        onAjouterSejour={() => {
          setOuvrirFormulaire(true)
          if (onglet !== 'sejours') changerOnglet('sejours')
        }}
      />
    </div>
  )
}

