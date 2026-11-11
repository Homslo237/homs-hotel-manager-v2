import { useState, useEffect } from 'react'
import EcranPaiement from './EcranPaiement'
import { lireOffres, OFFRES_SECOURS, formatPrix, texteChambres, texteUtilisateurs } from '../abonnement'

// Couleurs et pictogrammes attribués selon la position de l'offre (de la moins chère à la plus chère)
const COULEURS = ['#2ECC71', '#4A7BD0', '#C9A84C']
const EMOJIS = ['🏨', '🏢', '👑']

const WHATSAPP = 'https://wa.me/237696278903?text=' + encodeURIComponent('Je souhaite activer un plan HOMS')

export default function EcranAbonnement({ utilisateur, onPaiementReussi }) {
  const [offres, setOffres] = useState(OFFRES_SECOURS)
  const [periode, setPeriode] = useState('month')
  const [codeChoisi, setCodeChoisi] = useState(null)
  const [etape, setEtape] = useState('choix')

  // Prix lus dans HOMSLO CONTROL ; en cas de panne, les prix de secours restent affichés
  useEffect(() => {
    let actif = true
    lireOffres().then(liste => { if (actif && liste) setOffres(liste) })
    return () => { actif = false }
  }, [])

  const periodes = [...new Set(offres.map(o => o.period))]
  const periodeActive = periodes.includes(periode) ? periode : periodes[0]
  const liste = offres.filter(o => o.period === periodeActive)
  const offreChoisie = liste.find(o => o.code === codeChoisi) || null

  if (etape === 'paiement' && offreChoisie) {
    return (
      <EcranPaiement
        utilisateur={utilisateur}
        offre={offreChoisie}
        onSucces={() => onPaiementReussi && onPaiementReussi()}
        onRetour={() => setEtape('choix')}
      />
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', overflowY:'auto', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ padding:'40px 20px 24px', textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔓</div>
        <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'22px', marginBottom:'8px' }}>
          Choisissez votre plan
        </div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:'1.5' }}>
          Continuez à gérer votre hôtel avec HOMS.
        </div>
      </div>

      {/* Toggle mensuel / annuel (seulement si les deux existent) */}
      {periodes.length > 1 && (
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px', padding:'0 20px' }}>
          <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:'12px', padding:'4px', display:'flex', gap:'4px' }}>
            {['month', 'year'].filter(p => periodes.includes(p)).map(p => (
              <button key={p} onClick={() => setPeriode(p)} style={{
                padding:'8px 20px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700',
                background: periodeActive === p ? '#C9A84C' : 'transparent',
                color: periodeActive === p ? '#1B3A6B' : 'rgba(255,255,255,0.6)',
                transition:'all 0.2s',
              }}>
                {p === 'month' ? 'Mensuel' : 'Annuel'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offres */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:'16px', maxWidth:'440px', margin:'0 auto' }}>
        {liste.map((offre, i) => {
          const d = { couleur: COULEURS[i % COULEURS.length], emoji: EMOJIS[i % EMOJIS.length] }
          const choisi = codeChoisi === offre.code
          return (
            <div key={offre.code} onClick={() => setCodeChoisi(offre.code)} style={{
              background: choisi ? `${d.couleur}22` : 'rgba(255,255,255,0.06)',
              border: `2px solid ${choisi ? d.couleur : 'rgba(255,255,255,0.12)'}`,
              borderRadius:'20px', padding:'20px', cursor:'pointer', transition:'all 0.2s', position:'relative',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <div>
                  <div style={{ color:'white', fontWeight:'800', fontSize:'18px' }}>{d.emoji} {offre.name}</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', marginTop:'4px' }}>{texteChambres(offre.max_units)} · {texteUtilisateurs(offre.max_users)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:d.couleur, fontWeight:'900', fontSize:'20px' }}>{formatPrix(offre.price, offre.currency)}</div>
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>{offre.period === 'month' ? '/mois' : '/an'}</div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {(offre.features || []).map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'rgba(255,255,255,0.7)' }}>
                    <span style={{ color:d.couleur, fontSize:'14px' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              {choisi && (
                <div style={{ marginTop:'12px', background:d.couleur, borderRadius:'8px', padding:'8px', textAlign:'center', fontSize:'12px', fontWeight:'800', color:'#1B3A6B' }}>
                  ✅ Plan sélectionné
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bouton payer */}
      {offreChoisie && (
        <div style={{ padding:'24px 20px 0', maxWidth:'440px', margin:'0 auto' }}>
          <button onClick={() => setEtape('paiement')} style={{
            display:'block', width:'100%', padding:'16px', borderRadius:'14px', border:'none', cursor:'pointer',
            background:'linear-gradient(90deg, #C9A84C 0%, #F5D98A 40%, #C9A84C 60%, #A07830 100%)',
            color:'#1B3A6B', fontWeight:'900', fontSize:'16px', textAlign:'center',
            boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
          }}>
            💳 Payer {formatPrix(offreChoisie.price, offreChoisie.currency)} par Mobile Money
          </button>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" style={{
            display:'block', marginTop:'14px', textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:'12px', textDecoration:'underline',
          }}>
            Besoin d'aide ? Contacter Homslovision sur WhatsApp
          </a>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign:'center', paddingTop:'32px', color:'rgba(255,255,255,0.2)', fontSize:'10px', letterSpacing:'1px' }}>
        HOMS-HÔTEL MANAGER · Homslovision
      </div>
    </div>
  )
}
