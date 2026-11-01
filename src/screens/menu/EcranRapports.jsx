import { useState } from 'react'
import { X, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { lireIdentite, nomEtablissement } from '../../identite'
import { chargerArchive } from '../../archives'
import { periodeDe, decalerPeriode, cleJour } from '../../periodes'
import { fusionnerSejours, fusionnerJournal, htmlRapportSejours, htmlRapportJournal, ecrireEtImprimer } from '../../rapportsPdf'

const RAPPORTS = [
  { id:'sejours', icone:'🏨', titre:'Historique des séjours', detail:'Clients, contacts, heures d\'arrivée et de départ, paiement, qui a saisi' },
  { id:'journal', icone:'📋', titre:'Historique des actions', detail:'Connexions, séjours, prolongations, clôtures de caisse' },
]
const PERIODES = [{ id:'jour', label:'Jour' }, { id:'semaine', label:'Semaine' }, { id:'mois', label:'Mois' }]

const versISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Rapports PDF A4 : réservés au directeur
export default function EcranRapports({ onClose, hotelId, utilisateur, sejours = [], journal = [], historique = [], devise = 'FCFA' }) {
  const [rapport, setRapport] = useState('sejours')
  const [typePeriode, setTypePeriode] = useState('jour')
  const [dateRef, setDateRef] = useState(() => new Date())
  const [chargement, setChargement] = useState(false)

  const periode = periodeDe(typePeriode, dateRef)
  const aujourdhui = new Date()
  const suivanteImpossible = periodeDe(typePeriode, decalerPeriode(typePeriode, dateRef, 1)).debut > aujourdhui

  const entete = (
    <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Rapports PDF</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Impression A4 par jour, semaine ou mois</p>
        </div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
          <X size={20} color="white"/>
        </button>
      </div>
    </div>
  )

  if (utilisateur?.role !== 'directeur') {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto' }}>
        {entete}
        <div style={{ padding:'40px 24px', textAlign:'center', color:'#666' }}>
          <div style={{ fontSize:'36px', marginBottom:'10px' }}>🔒</div>
          <p style={{ fontWeight:'700', color:'#1B3A6B' }}>Réservé au directeur</p>
          <p style={{ fontSize:'13px', marginTop:'6px' }}>Connectez-vous avec le profil Directeur pour éditer les rapports.</p>
        </div>
      </div>
    )
  }

  const generer = async () => {
    // La fenêtre doit s'ouvrir tout de suite (geste de l'utilisateur), avant le chargement des données
    const fenetre = window.open('', '_blank')
    if (!fenetre) { alert('Autorisez les fenêtres pop-up pour ce site, puis réessayez.'); return }
    fenetre.document.write('<p style="font-family:Arial;padding:24px">Préparation du rapport…</p>')
    setChargement(true)
    try {
      const identite = lireIdentite()
      const nomHotel = nomEtablissement(identite)
      const jours = periode.jours.map(cleJour)
      let html
      if (rapport === 'sejours') {
        const archive = await chargerArchive(hotelId, 'sejours', jours)
        const lignes = fusionnerSejours({ archive, vivants: sejours, historique, periode })
        html = htmlRapportSejours({ identite, nomHotel, periode, lignes, devise, par: utilisateur?.nom })
      } else {
        const archive = await chargerArchive(hotelId, 'journal', jours)
        const lignes = fusionnerJournal({ archive, recent: journal, periode })
        html = htmlRapportJournal({ identite, nomHotel, periode, lignes, par: utilisateur?.nom })
      }
      ecrireEtImprimer(fenetre, html)
    } catch (err) {
      try { fenetre.close() } catch (e) {}
      alert('Impossible de préparer le rapport. Vérifiez la connexion puis réessayez.')
    } finally {
      setChargement(false)
    }
  }

  const bouton = (actif) => ({
    flex:1, padding:'11px 4px', fontWeight:'700', fontSize:'13px', border:'none', cursor:'pointer',
    background: actif ? '#1B3A6B' : 'white', color: actif ? 'white' : '#666',
  })

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      {entete}
      <div style={{ padding:'16px 20px' }}>

        <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Rapport</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
          {RAPPORTS.map(r => (
            <button key={r.id} onClick={() => setRapport(r.id)} style={{
              display:'flex', gap:'12px', alignItems:'center', textAlign:'left', padding:'14px', borderRadius:'14px', cursor:'pointer',
              border: rapport === r.id ? '2px solid #1B3A6B' : '2px solid #E0E0E0',
              background: rapport === r.id ? '#F0F4FF' : 'white',
            }}>
              <span style={{ fontSize:'26px' }}>{r.icone}</span>
              <span>
                <span style={{ display:'block', fontWeight:'800', color:'#1B3A6B', fontSize:'14px' }}>{r.titre}</span>
                <span style={{ display:'block', fontSize:'12px', color:'#888', marginTop:'2px' }}>{r.detail}</span>
              </span>
            </button>
          ))}
        </div>

        <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Période</div>
        <div style={{ display:'flex', borderRadius:'12px', overflow:'hidden', border:'2px solid #E0E0E0', marginBottom:'12px' }}>
          {PERIODES.map(p => (
            <button key={p.id} onClick={() => setTypePeriode(p.id)} style={bouton(typePeriode === p.id)}>{p.label}</button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
          <button onClick={() => setDateRef(decalerPeriode(typePeriode, dateRef, -1))} aria-label="Période précédente"
            style={{ width:'44px', height:'44px', borderRadius:'12px', border:'2px solid #E0E0E0', background:'white', cursor:'pointer', display:'grid', placeItems:'center' }}>
            <ChevronLeft size={20} color="#1B3A6B"/>
          </button>
          <div style={{ flex:1, textAlign:'center', fontWeight:'800', color:'#1B3A6B', fontSize:'14px', lineHeight:'1.3' }}>{periode.libelle}</div>
          <button onClick={() => setDateRef(decalerPeriode(typePeriode, dateRef, 1))} disabled={suivanteImpossible} aria-label="Période suivante"
            style={{ width:'44px', height:'44px', borderRadius:'12px', border:'2px solid #E0E0E0', background:'white', cursor: suivanteImpossible ? 'not-allowed' : 'pointer', opacity: suivanteImpossible ? 0.35 : 1, display:'grid', placeItems:'center' }}>
            <ChevronRight size={20} color="#1B3A6B"/>
          </button>
        </div>

        <label style={{ display:'block', fontSize:'12px', color:'#888', fontWeight:'600', marginBottom:'6px' }}>Choisir une date</label>
        <input type="date" value={versISO(dateRef)} max={versISO(aujourdhui)}
          onChange={e => { if (e.target.value) { const [a, m, j] = e.target.value.split('-').map(Number); setDateRef(new Date(a, m - 1, j)) } }}
          style={{ width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'22px' }}/>

        <button onClick={generer} disabled={chargement} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px', opacity: chargement ? 0.7 : 1,
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        }}>
          <FileText size={18}/> {chargement ? 'Préparation…' : 'Générer le PDF A4'}
        </button>
        <p style={{ fontSize:'12px', color:'#999', marginTop:'12px', lineHeight:'1.5' }}>
          Une page s'ouvre : dans la fenêtre d'impression, choisissez « Enregistrer au format PDF » ou votre imprimante.
        </p>
      </div>
    </div>
  )
}
