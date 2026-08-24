import { useState, useEffect } from 'react'
import Splash from './screens/Splash'
import Connexion from './screens/Connexion'
import Dashboard from './screens/Dashboard'
import Chambres from './screens/Chambres'
import Sejours from './screens/Sejours'
import Caisse from './screens/Caisse'
import Menu from './screens/Menu'
import NavBar from './components/NavBar'

// ─── Styles de transition ─────────────────────────────────────────────────────
const styleTransition = `
  @keyframes screenIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .screen-in { animation: screenIn 0.25s ease both; }
`

// ─── Accès autorisés par rôle ─────────────────────────────────────────────────
const ACCES = {
  directeur:      ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  receptionniste: ['dashboard', 'chambres', 'sejours', 'caisse', 'menu'],
  caissier:       ['dashboard', 'caisse', 'menu'],
}

// ─── Données initiales partagées ─────────────────────────────────────────────
const SEJOURS_INITIAUX = [
  { id:1, client:'M. Kouassi Ama',   telephone:'+225 07 11 22 33', chambre:'205', categorie:'Confort',  dateArrivee:'18/08/2026', heureArrivee:'14:00', dateDepart:'21/08/2026', heureDepart:'12:00', duree:'3 nuits', type:'nuit',  statut:'en_cours', montant:'105 000', montantNum:105000, modePaiement:'Orange Money' },
  { id:2, client:'Mme Diallo Fatou', telephone:'+225 05 44 55 66', chambre:'101', categorie:'Standard', dateArrivee:'17/08/2026', heureArrivee:'10:00', dateDepart:'19/08/2026', heureDepart:'12:00', duree:'2 nuits', type:'nuit',  statut:'en_cours', montant:'50 000',  montantNum:50000,  modePaiement:'Espèces' },
  { id:3, client:'M. Bamba Seydou',  telephone:'+225 01 77 88 99', chambre:'302', categorie:'Suite',    dateArrivee:'21/08/2026', heureArrivee:'09:30', dateDepart:'21/08/2026', heureDepart:'12:30', duree:'3 heures', type:'heure', statut:'en_cours', montant:'19 500',  montantNum:19500,  modePaiement:'MTN Mobile Money' },
]

const CHAMBRES_STATS_INITIALES = {
  total: 50, disponibles: 37, occupees: 8, nettoyer: 3, problemes: 2
}

export default function App() {
  const [ecran,            setEcran]            = useState('splash')
  const [onglet,           setOnglet]           = useState('dashboard')
  const [utilisateur,      setUtilisateur]      = useState(null)
  const [cle,              setCle]              = useState(0)
  const [ouvrirFormulaire, setOuvrirFormulaire] = useState(false)

  // ─── ÉTAT GLOBAL PARTAGÉ ─────────────────────────────────────────────────────
  const [sejours,       setSejours]       = useState(SEJOURS_INITIAUX)
  const [entreesDiverses, setEntreesDiverses] = useState([])
  const [sortiesDiverses, setSortiesDiverses] = useState([])
  const [chambresStats, setChambresStats] = useState(CHAMBRES_STATS_INITIALES)

  // ─── Calculs automatiques partagés ───────────────────────────────────────────
  const totalSejours   = sejours.filter(s=>s.statut==='en_cours').reduce((sum,s)=>sum+s.montantNum,0)
  const totalNuits     = sejours.filter(s=>s.statut==='en_cours'&&s.type==='nuit').reduce((sum,s)=>sum+s.montantNum,0)
  const totalHeures    = sejours.filter(s=>s.statut==='en_cours'&&s.type==='heure').reduce((sum,s)=>sum+s.montantNum,0)
  const totalEntrees   = entreesDiverses.reduce((sum,e)=>sum+e.montant,0)
  const totalSorties   = sortiesDiverses.reduce((sum,s)=>sum+s.montant,0)
  const soldeNet       = totalSejours + totalEntrees - totalSorties
  const tauxOccupation = Math.round((chambresStats.occupees / chambresStats.total) * 100)

  // ─── Données caisse agrégées ──────────────────────────────────────────────────
  const caisse = { totalSejours, totalNuits, totalHeures, totalEntrees, totalSorties, soldeNet }

  // Injection styles
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleTransition
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  // ─── Actions globales ─────────────────────────────────────────────────────────
  const ajouterSejour = (nouveau) => {
    const ns = {
      ...nouveau,
      id: Date.now(),
      montantNum: parseInt((nouveau.montant||'0').replace(/\s/g,''), 10) || 0,
      statut: 'en_cours',
    }
    setSejours(prev => [ns, ...prev])
    // Mettre à jour chambres stats
    setChambresStats(prev => ({
      ...prev,
      occupees:    prev.occupees + 1,
      disponibles: prev.disponibles - 1,
    }))
  }

  const terminerSejour = (id) => {
    setSejours(prev => prev.map(s => s.id===id ? {...s, statut:'termine'} : s))
    setChambresStats(prev => ({
      ...prev,
      occupees:    Math.max(0, prev.occupees - 1),
      disponibles: prev.disponibles + 1,
    }))
  }

  const prolongerSejour = (id, supplement) => {
    setSejours(prev => prev.map(s => {
      if (s.id !== id) return s
      const nouveauMontant = s.montantNum + supplement
      return { ...s, montantNum: nouveauMontant, montant: nouveauMontant.toLocaleString('fr-FR') }
    }))
  }

  // ─── Navigation ───────────────────────────────────────────────────────────────
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

  // ─── Écrans ───────────────────────────────────────────────────────────────────
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
            chambresStats={chambresStats}
            onMajStats={setChambresStats}
          />
        )}

        {onglet === 'sejours' && accesRole.includes('sejours') && (
          <Sejours
            sejours={sejours}
            onAjouter={ajouterSejour}
            onTerminer={terminerSejour}
            onProlonger={prolongerSejour}
            ouvrirFormulaire={ouvrirFormulaire}
            onFormulaireOuvert={() => setOuvrirFormulaire(false)}
          />
        )}

        {onglet === 'caisse' && accesRole.includes('caisse') && (
          <Caisse
            sejours={sejours.filter(s=>s.statut==='en_cours')}
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
