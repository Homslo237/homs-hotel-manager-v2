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

// ─── Helpers date/heure ────────────────────────────────────────────────────────
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

// ─── Génération des 50 chambres — SOURCE UNIQUE DE VÉRITÉ ─────────────────────
export function genererChambres(sejours = []) {
  const chambres = []
  const maintenant = new Date()

  CONFIG_CHAMBRES.categories.forEach(cat => {
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
        num,
        cat: cat.nom,
        statut: sejour ? (sejour.statut === 'a_venir' ? 'a_venir' : 'occupee') : 'libre',
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (e) {}
}

function charger() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}

// ─── Séjours initiaux (démo) ──────────────────────────────────────────────────
const SEJOURS_DEMO = [
  { id:1, client:'M. Kouassi Ama',   telephone:'+225 07 11 22 33', chambre:'205', categorie:'Confort',  dateArrivee:'18/08/2026', heureArrivee:'14:00', dateDepart:'28/08/2026', heureDepart:'12:00', duree:'3 nuits', type:'nuit',  statut:'en_cours', montant:'105 000', montantNum:105000, modePaiement:'Orange Money' },
  { id:2, client:'Mme Diallo Fatou', telephone:'+225 05 44 55 66', chambre:'101', categorie:'Standard', dateArrivee:'17/08/2026', heureArrivee:'10:00', dateDepart:'28/08/2026', heureDepart:'12:00', duree:'2 nuits', type:'nuit',  statut:'en_cours', montant:'50 000',  montantNum:50000,  modePaiement:'Especes' },
  { id:3, client:'M. Bamba Seydou',  telephone:'+225 01 77 88 99', chambre:'302', categorie:'Suite',    dateArrivee:'25/08/2026', heureArrivee:'09:30', dateDepart:'25/08/2026', heureDepart:'22:30', duree:'3 heures', type:'heure', statut:'en_cours', montant:'19 500',  montantNum:19500,  modePaiement:'MTN Mobile Money' },
]

// ─── Sons d'alerte ─────────────────────────────────────────────────────────────
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
  } catch (e) {}
}

export default function App() {
  const [ecran,            setEcran]            = useState('splash')
  const [onglet,           setOnglet]           = useState('dashboard')
  const [utilisateur,      setUtilisateur]      = useState(null)
  const [cle,              setCle]              = useState(0)
  const [ouvrirFormulaire, setOuvrirFormulaire] = useState(false)

  const [sejours,         setSejours]         = useState([])
  const [entreesDiverses, setEntreesDiverses] = useState([])
  const [sortiesDiverses, setSortiesDiverses] = useState([])
  const [alertesSonnees,  setAlertesSonnees]  = useState({})
  const intervalRef = useRef(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleTransition
    document.head.appendChild(el)

    const sauvegarde = charger()
    if (sauvegarde) {
      setSejours(sauvegarde.sejours || SEJOURS_DEMO)
      setEntreesDiverses(sauvegarde.entreesDiverses || [])
      setSortiesDiverses(sauvegarde.sortiesDiverses || [])
    } else {
      setSejours(SEJOURS_DEMO)
    }

    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => {
    if (sejours.length > 0 || entreesDiverses.length > 0 || sortiesDiverses.length > 0) {
      sauvegarder({ sejours, entreesDiverses, sortiesDiverses })
    }
  }, [sejours, entreesDiverses, sortiesDiverses])

  useEffect(() => {
    const verifier = () => {
      const now = new Date()
      const idsALiberer = []

      sejours.filter(s => s.statut === 'en_cours').forEach(s => {
        const [, fin] = periodeDuSejour(s)
        if (!fin) return
        const diffMin = (fin - now) / 60000

        if (diffMin > 0 && diffMin <= 5 && !alertesSonnees[`rappel_${s.id}`]) {
          jouerSonnerie('rappel')
          setAlertesSonnees(prev => ({ ...prev, [`rappel_${s.id}`]: true }))
        }
        if (diffMin <= 0 && diffMin > -1 && !alertesSonnees[`alerte_${s.id}`]) {
          jouerSonnerie('alerte')
          setAlertesSonnees(prev => ({ ...prev, [`alerte_${s.id}`]: true }))
        }
        if (diffMin <= -20 && !alertesSonnees[`urgent_${s.id}`]) {
          jouerSonnerie('urgent')
          setAlertesSonnees(prev => ({ ...prev, [`urgent_${s.id}`]: true }))
        }

        // Liberation automatique de la chambre au-dela de 3h de depassement.
        // Le sejour passe "termine" avec une note pour facturation a posteriori ;
        // rien n'est efface, seule la chambre redevient disponible a la vente.
        if (diffMin <= -180) {
          idsALiberer.push(s.id)
        }
      })

      if (idsALiberer.length > 0) {
        setSejours(prev => prev.map(s =>
          idsALiberer.includes(s.id)
            ? { ...s, statut: 'termine', depassementNonRegle: true }
            : s
        ))
      }
    }

    intervalRef.current = setInterval(verifier, 60000)
    return () => clearInterval(intervalRef.current)
  }, [sejours, alertesSonnees])

  const chambresGenerees = genererChambres(sejours)
  const chambresStats = {
    total:       chambresGenerees.length,
    occupees:    chambresGenerees.filter(c => c.statut === 'occupee').length,
    disponibles: chambresGenerees.filter(c => c.statut === 'libre').length,
    nettoyer:    chambresGenerees.filter(c => c.statut === 'nettoyage').length,
    problemes:   chambresGenerees.filter(c => c.statut === 'probleme').length,
    aVenir:      chambresGenerees.filter(c => c.statut === 'a_venir').length,
  }

  const sejoursEnCours = sejours.filter(s => s.statut === 'en_cours')
  const totalSejours   = sejoursEnCours.reduce((sum, s) => sum + (s.montantNum || 0), 0)
  const totalNuits     = sejoursEnCours.filter(s => s.type === 'nuit').reduce((sum, s) => sum + (s.montantNum || 0), 0)
  const totalHeures    = sejoursEnCours.filter(s => s.type === 'heure').reduce((sum, s) => sum + (s.montantNum || 0), 0)
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
    const heureReelle = statut === 'en_cours'
      ? new Date().toTimeString().slice(0, 5)
      : nouveau.heureArrivee

    const ns = {
      ...nouveau,
      id: Date.now(),
      heureArrivee: heureReelle,
      montantNum: parseInt((nouveau.montant || '0').replace(/\s/g, ''), 10) || 0,
      statut,
    }

    setSejours(prev => [ns, ...prev])
    return true
  }

  const terminerSejour = (id) => {
    setSejours(prev => prev.map(s => (s.id === id ? { ...s, statut: 'termine' } : s)))
    setAlertesSonnees(prev => {
      const updated = { ...prev }
      delete updated[`rappel_${id}`]
      delete updated[`alerte_${id}`]
      delete updated[`urgent_${id}`]
      return updated
    })
  }

  const activerReservation = (id) => {
    setSejours(prev => prev.map(s => {
      if (s.id !== id) return s
      return { ...s, statut: 'en_cours', heureArrivee: new Date().toTimeString().slice(0, 5) }
    }))
  }

  const prolongerSejour = (id, supplement) => {
    setSejours(prev => prev.map(s => {
      if (s.id !== id) return s
      const nouveauMontant = (s.montantNum || 0) + supplement
      return { ...s, montantNum: nouveauMontant, montant: nouveauMontant.toLocaleString('fr-FR') }
    }))
    setAlertesSonnees(prev => {
      const updated = { ...prev }
      delete updated[`rappel_${id}`]
      delete updated[`alerte_${id}`]
      delete updated[`urgent_${id}`]
      return updated
    })
  }

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
    <div style={{ paddingBottom: '70px', background: '#F5F7FA', minHeight: '100vh' }}>
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
          />
        )}

        {onglet === 'sejours' && accesRole.includes('sejours') && (
          <Sejours
            sejours={sejours}
            chambresGenerees={chambresGenerees}
            onAjouter={ajouterSejour}
            onTerminer={terminerSejour}
            onProlonger={prolongerSejour}
            onActiverReservation={activerReservation}
            ouvrirFormulaire={ouvrirFormulaire}
            onFormulaireOuvert={() => setOuvrirFormulaire(false)}
          />
        )}

        {onglet === 'caisse' && accesRole.includes('caisse') && (
          <Caisse
            sejours={sejoursEnCours}
            entreesDiverses={entreesDiverses}
            sortiesDiverses={sortiesDiverses}
            onAjouterEntree={e => setEntreesDiverses(prev => [e, ...prev])}
            onAjouterSortie={s => setSortiesDiverses(prev => [s, ...prev])}
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
