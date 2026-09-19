import { useState, useEffect, useRef } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
import Caisse from './screens/Caisse'
import Menu from './screens/menu/Menu'
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

export const CONFIG_CHAMBRES = {
  categories: [
    { nom:'Standard', debut:100, nombre:20, tarifNuit:25000, tarifHeure:2500 },
    { nom:'Confort',  debut:200, nombre:20, tarifNuit:35000, tarifHeure:3500 },
    { nom:'Suite',    debut:300, nombre:10, tarifNuit:65000, tarifHeure:6500 },
  ]
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

const SEJOURS_DEMO = [
  { id:1, client:'M. Kouassi Ama',   telephone:'+225 07 11 22 33', chambre:'205', categorie:'Confort',  dateArrivee:'18/08/2026', heureArrivee:'14:00', dateDepart:'28/08/2026', heureDepart:'12:00', duree:'3 nuits',  type:'nuit',  statut:'en_cours', montant:'105 000', montantNum:105000, modePaiement:'Orange Money' },
  { id:2, client:'Mme Diallo Fatou', telephone:'+225 05 44 55 66', chambre:'101', categorie:'Standard', dateArrivee:'17/08/2026', heureArrivee:'10:00', dateDepart:'28/08/2026', heureDepart:'12:00', duree:'2 nuits',  type:'nuit',  statut:'en_cours', montant:'50 000',  montantNum:50000,  modePaiement:'Especes' },
  { id:3, client:'M. Bamba Seydou',  telephone:'+225 01 77 88 99', chambre:'302', categorie:'Suite',    dateArrivee:'25/08/2026', heureArrivee:'09:30', dateDepart:'25/08/2026', heureDepart:'22:30', duree:'3 heures', type:'heure', statut:'en_cours', montant:'19 500',  montantNum:19500,  modePaiement:'MTN Mobile Money' },
]

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
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <button onClick={() => onLiberer(s.id)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#E74C3C', color:'white', fontWeight:'800', fontSize:'14px' }}>
              🔓 Libérer la chambre (No-Show)
            </button>
            <button onClick={() => onPatienter(s.id)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'2px solid #1B3A6B', cursor:'pointer', background:'white', color:'#1B3A6B', fontWeight:'800', fontSize:'14px' }}>
              ⏳ Patienter encore
            </button>
          </div>
          {sejours.length > 1 && (
            <div style={{ marginTop:'12px', textAlign:'center', fontSize:'12px', color:'#999' }}>
              + {sejours.length - 1} autre{sejours.length > 2 ? 's' : ''} no-show en attente
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [ecran,            setEcran]            = useState('splash')
  const [onglet,           setOnglet]           = useState('dashboard')
  const [utilisateur,      setUtilisateur]      = useState(null)
  const [cle,              setCle]              = useState(0)
  const [ouvrirFormulaire, setOuvrirFormulaire] = useState(false)
  const [chargé,           setChargé]           = useState(false)

  const [sejours,         setSejours]         = useState([])
  const [entreesDiverses, setEntreesDiverses] = useState([])
  const [sortiesDiverses, setSortiesDiverses] = useState([])
  const [historique,      setHistorique]      = useState([])
  const [alertesSonnees,  setAlertesSonnees]  = useState({})
  const [noShowASignaler, setNoShowASignaler] = useState([])
  const [noShowIgnores,   setNoShowIgnores]   = useState({})

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
      setHistorique(sauvegarde.historique || [])
    } else {
      setSejours(SEJOURS_DEMO)
    }
    setChargé(true)
    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => {
    if (sejours.length > 0 || entreesDiverses.length > 0 || sortiesDiverses.length > 0 || historique.length > 0) {
      sauvegarder({ sejours, entreesDiverses, sortiesDiverses, historique })
    }
  }, [sejours, entreesDiverses, sortiesDiverses, historique])

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
        if (diffMin <= -180) idsALiberer.push(s.id)
      })
      if (idsALiberer.length > 0) {
        setSejours(prev => prev.map(s =>
          idsALiberer.includes(s.id) ? { ...s, statut:'termine', depassementNonRegle:true } : s
        ))
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

  const chambresGenerees = genererChambres(sejours)
  const chambresStats = {
    total:       chambresGenerees.length,
    occupees:    chambresGenerees.filter(c => c.statut === 'occupee').length,
    disponibles: chambresGenerees.filter(c => c.statut === 'libre').length,
    nettoyer:    chambresGenerees.filter(c => c.statut === 'nettoyage').length,
    problemes:   chambresGenerees.filter(c => c.statut === 'probleme').length,
    aVenir:      chambresGenerees.filter(c => c.statut === 'a_venir').length,
  }

  const sejoursEncaisses = sejours.filter(s =>
    s.statut === 'en_cours' || s.statut === 'a_venir' ||
    s.statut === 'termine'  || s.statut === 'no_show'
  )

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
    const heureReelle = statut === 'en_cours'
      ? new Date().toTimeString().slice(0, 5)
      : nouveau.heureArrivee
    const ns = {
      ...nouveau, id:Date.now(), heureArrivee:heureReelle,
      montantNum: parseInt((nouveau.montant || '0').replace(/\s/g, ''), 10) || 0,
      statut,
    }
    setSejours(prev => [ns, ...prev])
    return true
  }

  const terminerSejour = (id) => {
    setSejours(prev => prev.map(s => s.id === id ? { ...s, statut:'termine' } : s))
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
      return { ...s, statut:'en_cours', heureArrivee:new Date().toTimeString().slice(0,5) }
    }))
    setNoShowIgnores(prev => { const u={...prev}; delete u[id]; return u })
    setNoShowASignaler(prev => prev.filter(s => s.id !== id))
  }

  const prolongerSejour = (id, ajout, supplement) => {
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

  const cloturerCaisse = () => {
    const maintenant = new Date()
    const horodatage = `${String(maintenant.getDate()).padStart(2,'0')}/${String(maintenant.getMonth()+1).padStart(2,'0')}/${maintenant.getFullYear()} ${String(maintenant.getHours()).padStart(2,'0')}:${String(maintenant.getMinutes()).padStart(2,'0')}`
    const entreesSejours = sejours
      .filter(s => s.statut==='en_cours'||s.statut==='a_venir'||s.statut==='termine'||s.statut==='no_show')
      .map(s => ({ type:'sejour', client:s.client, chambre:s.chambre, montant:s.montantNum||0, mode:s.modePaiement, date:s.dateArrivee, cloture:horodatage, noShow:s.statut==='no_show' }))
    const entreesArchivees = entreesDiverses.map(e => ({ type:'entree', libelle:e.libelle, montant:e.montant||0, mode:e.mode, date:e.heure, cloture:horodatage }))
    const sortiesArchivees = sortiesDiverses.map(s => ({ type:'sortie', libelle:s.libelle, montant:s.montant||0, mode:s.mode, date:s.heure, cloture:horodatage }))
    setHistorique(prev => [...prev, ...entreesSejours, ...entreesArchivees, ...sortiesArchivees])
    setSejours(prev => prev.filter(s => s.statut !== 'termine' && s.statut !== 'no_show'))
    setEntreesDiverses([])
    setSortiesDiverses([])
    setNoShowASignaler([])
  }

  const handleReinitialiser = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
    setSejours(SEJOURS_DEMO)
    setEntreesDiverses([])
    setSortiesDiverses([])
    setAlertesSonnees({})
    setNoShowASignaler([])
    setNoShowIgnores({})
  }

  if (ecran === 'splash')    return <Splash onFin={() => setEcran('connexion')}/>
  if (ecran === 'connexion') return <Connexion onConnexion={handleConnexion}/>

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

        {onglet === 'chambres' && accesRole.includes('chambres') && chargé && (
          <Chambres
            key="loaded"
            chambres={chambresGenerees}
            chambresStats={chambresStats}
            utilisateur={utilisateur}
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
            sejours={sejoursEncaisses}
            entreesDiverses={entreesDiverses}
            sortiesDiverses={sortiesDiverses}
            onAjouterEntree={e => setEntreesDiverses(prev => [e, ...prev])}
            onAjouterSortie={s => setSortiesDiverses(prev => [s, ...prev])}
            caisse={caisse}
            onCloturerCaisse={cloturerCaisse}
            chambres={chambresGenerees}
          />
        )}

        {onglet === 'menu' && (
          <Menu
            utilisateur={utilisateur}
            onDeconnexion={handleDeconnexion}
            onReinitialiser={handleReinitialiser}
            historique={historique}
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

      {noShowASignaler.length > 0 && ecran === 'app' && (
        <AlerteNoShow
          sejours={noShowASignaler}
          onLiberer={confirmerNoShow}
          onPatienter={ignorerNoShow}
        />
      )}
    </div>
  )
}
