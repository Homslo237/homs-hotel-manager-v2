import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// ── Opérateurs organisés par pays ────────────────────────────────────────────
const PAYS = [
  {
    nom: 'Cameroun', emoji: '🇨🇲',
    operateurs: [
      { id:'MTN_MOMO_CMR', nom:'MTN Mobile Money', emoji:'🟡', agregateur:'pawapay' },
      { id:'ORANGE_CMR',   nom:'Orange Money',     emoji:'🟠', agregateur:'pawapay' },
    ]
  },
  {
    nom: "Côte d'Ivoire", emoji: '🇨🇮',
    operateurs: [
      { id:'MTN_CI',   nom:'MTN Mobile Money', emoji:'🟡', agregateur:'cinetpay' },
      { id:'ORANGE_CI',nom:'Orange Money',     emoji:'🟠', agregateur:'cinetpay' },
      { id:'WAVE_CI',  nom:'Wave',             emoji:'🔵', agregateur:'cinetpay' },
      { id:'MOOV_CI',  nom:'Moov Money',       emoji:'🔴', agregateur:'cinetpay' },
    ]
  },
  {
    nom: 'Sénégal', emoji: '🇸🇳',
    operateurs: [
      { id:'WAVE_SEN',  nom:'Wave',         emoji:'🔵', agregateur:'pawapay' },
      { id:'ORANGE_SEN',nom:'Orange Money', emoji:'🟠', agregateur:'pawapay' },
    ]
  },
  {
    nom: 'Burkina Faso', emoji: '🇧🇫',
    operateurs: [
      { id:'MTN_BF',   nom:'MTN Mobile Money', emoji:'🟡', agregateur:'cinetpay' },
      { id:'ORANGE_BF',nom:'Orange Money',     emoji:'🟠', agregateur:'cinetpay' },
    ]
  },
  {
    nom: 'Mali', emoji: '🇲🇱',
    operateurs: [
      { id:'ORANGE_ML',nom:'Orange Money', emoji:'🟠', agregateur:'cinetpay' },
      { id:'MOOV_ML',  nom:'Moov Money',  emoji:'🔴', agregateur:'cinetpay' },
    ]
  },
  {
    nom: 'Ghana', emoji: '🇬🇭',
    operateurs: [
      { id:'MTN_MOMO_GHA',nom:'MTN Mobile Money', emoji:'🟡', agregateur:'pawapay' },
    ]
  },
  {
    nom: 'RD Congo', emoji: '🇨🇩',
    operateurs: [
      { id:'AIRTEL_RDC',nom:'Airtel Money', emoji:'🔴', agregateur:'pawapay' },
    ]
  },
]

const PLANS_INFO = {
  basique:  { nom:'Basique',  couleur:'#2ECC71' },
  pro:      { nom:'Pro',      couleur:'#1B3A6B' },
  premium:  { nom:'Premium',  couleur:'#C9A84C' },
}

export default function EcranPaiement({ utilisateur, hotelId, plan, montant, facturation, onSucces, onRetour }) {
  const [paysChoisi,   setPaysChoisi]   = useState(null)
  const [operateur,    setOperateur]    = useState(null)
  const [telephone,    setTelephone]    = useState('')
  const [etape,        setEtape]        = useState('formulaire')
  const [paiementId,   setPaiementId]   = useState(null)
  const [agregateur,   setAgregateur]   = useState(null)
  const [statutPay,    setStatutPay]    = useState(null)
  const [erreur,       setErreur]       = useState('')
  const [compteur,     setCompteur]     = useState(0)

  const planInfo = PLANS_INFO[plan] || PLANS_INFO.basique
  const paysActuel = PAYS.find(p => p.nom === paysChoisi)

  // ── Vérification périodique ───────────────────────────────────────────────
  useEffect(() => {
    if (etape !== 'attente' || !paiementId || !agregateur) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/paiement-verifier?paiementId=${paiementId}&agregateur=${agregateur}`)
        const data = await res.json()
        setStatutPay(data.statut)
        setCompteur(c => c + 1)
        if (data.statut === 'COMPLETED') {
          clearInterval(interval)
          await activerAbonnement()
          setEtape('succes')
        } else if (data.statut === 'FAILED') {
          clearInterval(interval)
          setErreur('Le paiement a échoué. Veuillez réessayer.')
          setEtape('erreur')
        }
      } catch {}
    }, 5000)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setErreur('Délai dépassé. Vérifiez votre téléphone et réessayez.')
      setEtape('erreur')
    }, 5 * 60 * 1000)

    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [etape, paiementId, agregateur])

  // ── Activer l'abonnement Firestore ────────────────────────────────────────
  const activerAbonnement = async () => {
    const maintenant = new Date()
    const prochaine  = new Date(maintenant)
    facturation === 'mensuel'
      ? prochaine.setMonth(prochaine.getMonth() + 1)
      : prochaine.setFullYear(prochaine.getFullYear() + 1)

    const limites = {
      basique:  { maxChambres:10,  maxUtilisateurs:2   },
      pro:      { maxChambres:30,  maxUtilisateurs:5   },
      premium:  { maxChambres:999, maxUtilisateurs:999 },
    }

    await setDoc(doc(db, 'hotels', hotelId, 'infos', 'abonnement'), {
      plan, statut:'actif', facturation,
      dateDebut: maintenant.toISOString(),
      dateProchaineFacture: prochaine.toISOString(),
      dateFinGrace: null,
      maxChambres:    limites[plan]?.maxChambres    || 10,
      maxUtilisateurs:limites[plan]?.maxUtilisateurs || 2,
      dernierPaiement: {
        paiementId, montant, operateur: operateur?.id,
        agregateur, pays: paysChoisi,
        date: maintenant.toISOString(),
      },
      updatedAt: maintenant.toISOString(),
    })
  }

  // ── Initier le paiement ───────────────────────────────────────────────────
  const handlePayer = async () => {
    if (!paysChoisi)          { setErreur('Choisissez votre pays.');             return }
    if (!operateur)           { setErreur('Choisissez votre opérateur.');        return }
    if (!telephone.trim())    { setErreur('Entrez votre numéro de téléphone.');  return }
    if (telephone.replace(/\s/g,'').length < 8) { setErreur('Numéro invalide.'); return }

    setErreur('')
    setEtape('attente')
    setStatutPay('SUBMITTED')
    setAgregateur(operateur.agregateur)

    try {
      const res = await fetch('/api/paiement-initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant,
          telephone: telephone.replace(/\s/g,''),
          operateur: operateur.id,
          hotelId, plan, facturation,
        }),
      })
      const data = await res.json()
      if (data.succes) {
        setPaiementId(data.paiementId)
        setAgregateur(data.agregateur)
      } else {
        setErreur(data.erreur || 'Erreur paiement.')
        setEtape('erreur')
      }
    } catch {
      setErreur('Erreur réseau. Vérifiez votre connexion.')
      setEtape('erreur')
    }
  }

  const inputStyle = {
    width:'100%', padding:'14px 16px',
    background:'rgba(255,255,255,0.08)',
    border:'1.5px solid rgba(255,255,255,0.15)',
    borderRadius:'12px', color:'white', fontSize:'15px',
    outline:'none', boxSizing:'border-box',
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', overflowY:'auto', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ padding:'32px 20px 20px', textAlign:'center' }}>
        <div style={{ fontSize:'36px', marginBottom:'10px' }}>💳</div>
        <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'20px', marginBottom:'8px' }}>Paiement Mobile Money</div>
        <div style={{ background:`${planInfo.couleur}22`, border:`1px solid ${planInfo.couleur}55`, borderRadius:'20px', padding:'6px 20px', display:'inline-block' }}>
          <span style={{ color:planInfo.couleur, fontWeight:'700', fontSize:'13px' }}>
            Plan {planInfo.nom} — {montant.toLocaleString('fr-FR')} FCFA/{facturation === 'mensuel' ? 'mois' : 'an'}
          </span>
        </div>
      </div>

      <div style={{ padding:'0 20px', maxWidth:'440px', margin:'0 auto' }}>

        {/* ── Formulaire ── */}
        {etape === 'formulaire' && (
          <>
            {/* Étape 1 — Choisir le pays */}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'10px', letterSpacing:'1px' }}>
                1️⃣ VOTRE PAYS
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {PAYS.map(p => (
                  <button key={p.nom} onClick={() => { setPaysChoisi(p.nom); setOperateur(null) }} style={{
                    display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px',
                    borderRadius:'12px', border:`1.5px solid ${paysChoisi === p.nom ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`,
                    background: paysChoisi === p.nom ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
                    cursor:'pointer', transition:'all 0.2s',
                  }}>
                    <span style={{ fontSize:'20px' }}>{p.emoji}</span>
                    <span style={{ color:'white', fontWeight:'700', fontSize:'14px', flex:1, textAlign:'left' }}>{p.nom}</span>
                    <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'11px' }}>{p.operateurs.length} opérateur{p.operateurs.length > 1 ? 's' : ''}</span>
                    {paysChoisi === p.nom && <span style={{ color:'#C9A84C' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Étape 2 — Choisir l'opérateur */}
            {paysActuel && (
              <div style={{ marginBottom:'20px' }}>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'10px', letterSpacing:'1px' }}>
                  2️⃣ VOTRE OPÉRATEUR
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {paysActuel.operateurs.map(op => (
                    <button key={op.id} onClick={() => setOperateur(op)} style={{
                      display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px',
                      borderRadius:'12px', border:`1.5px solid ${operateur?.id === op.id ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`,
                      background: operateur?.id === op.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
                      cursor:'pointer', transition:'all 0.2s',
                    }}>
                      <span style={{ fontSize:'22px' }}>{op.emoji}</span>
                      <div style={{ flex:1, textAlign:'left' }}>
                        <div style={{ color:'white', fontWeight:'700', fontSize:'14px' }}>{op.nom}</div>
                        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', marginTop:'2px' }}>
                          via {op.agregateur === 'pawapay' ? 'PawaPay' : 'CinetPay'}
                        </div>
                      </div>
                      {operateur?.id === op.id && <span style={{ color:'#C9A84C' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 3 — Numéro de téléphone */}
            {operateur && (
              <div style={{ marginBottom:'20px' }}>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
                  3️⃣ NUMÉRO DE TÉLÉPHONE
                </div>
                <input type="tel" value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="Ex. 6 XX XX XX XX"
                  style={inputStyle}
                  onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
                  onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
                />
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', marginTop:'6px' }}>
                  Le numéro associé à votre compte {operateur.nom}
                </div>
              </div>
            )}

            {/* Récapitulatif */}
            {operateur && telephone && (
              <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'14px', padding:'16px', marginBottom:'20px', border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:'700', letterSpacing:'1px', marginBottom:'10px' }}>RÉCAPITULATIF</div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
                  <span>Plan</span><span style={{ color:'white', fontWeight:'700' }}>Plan {planInfo.nom}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
                  <span>Opérateur</span><span style={{ color:'white', fontWeight:'700' }}>{operateur.nom}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
                  <span>Numéro</span><span style={{ color:'white', fontWeight:'700' }}>{telephone}</span>
                </div>
                <div style={{ height:'1px', background:'rgba(255,255,255,0.1)', margin:'10px 0' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'16px' }}>
                  <span style={{ color:'rgba(255,255,255,0.7)' }}>Total</span>
                  <span style={{ color:'#C9A84C', fontWeight:'900' }}>{montant.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            )}

            {erreur && <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'12px', textAlign:'center' }}>⚠️ {erreur}</div>}

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={onRetour} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.2)', background:'transparent', color:'rgba(255,255,255,0.6)', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
                ← Retour
              </button>
              <button onClick={handlePayer} disabled={!paysChoisi || !operateur || !telephone} style={{
                flex:2, padding:'14px', borderRadius:'12px', border:'none',
                cursor: (!paysChoisi || !operateur || !telephone) ? 'not-allowed' : 'pointer',
                background: (!paysChoisi || !operateur || !telephone)
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(90deg, #C9A84C, #F5D98A, #C9A84C)',
                color: (!paysChoisi || !operateur || !telephone) ? 'rgba(255,255,255,0.3)' : '#1B3A6B',
                fontWeight:'900', fontSize:'15px',
                boxShadow: (!paysChoisi || !operateur || !telephone) ? 'none' : '0 4px 20px rgba(201,168,76,0.4)',
              }}>
                💳 Payer {montant.toLocaleString('fr-FR')} FCFA
              </button>
            </div>
          </>
        )}

        {/* ── Attente ── */}
        {etape === 'attente' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:'60px', marginBottom:'20px' }}>📱</div>
            <div style={{ color:'white', fontWeight:'800', fontSize:'18px', marginBottom:'12px' }}>
              Confirmez sur votre téléphone
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:'1.6', marginBottom:'24px' }}>
              Une notification a été envoyée au<br/>
              <strong style={{ color:'#C9A84C' }}>{telephone}</strong><br/>
              Ouvrez votre application {operateur?.nom} et confirmez.
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                <div style={{ width:'20px', height:'20px', border:'3px solid rgba(255,255,255,0.2)', borderTopColor:'#C9A84C', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ color:'#C9A84C', fontWeight:'700', fontSize:'14px' }}>
                  ⏳ En attente de confirmation...
                </span>
              </div>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'11px', marginTop:'10px' }}>
                Vérification automatique · {compteur} essai{compteur > 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'10px', padding:'12px', fontSize:'12px', color:'rgba(201,168,76,0.8)' }}>
              ⏱️ Ne fermez pas cette page. Délai maximum : 5 minutes.
            </div>
          </div>
        )}

        {/* ── Succès ── */}
        {etape === 'succes' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:'72px', marginBottom:'20px' }}>🎉</div>
            <div style={{ color:'#2ECC71', fontWeight:'900', fontSize:'22px', marginBottom:'12px' }}>Paiement réussi !</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px', lineHeight:'1.6', marginBottom:'28px' }}>
              Votre abonnement <strong style={{ color:'#C9A84C' }}>Plan {planInfo.nom}</strong> est actif.<br/>
              Bienvenue dans HOMS-HÔTEL MANAGER !
            </div>
            <button onClick={onSucces} style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none', cursor:'pointer', background:'#2ECC71', color:'white', fontWeight:'900', fontSize:'16px', boxShadow:'0 4px 20px rgba(46,204,113,0.4)' }}>
              ✅ Accéder à mon hôtel
            </button>
          </div>
        )}

        {/* ── Erreur ── */}
        {etape === 'erreur' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:'60px', marginBottom:'20px' }}>❌</div>
            <div style={{ color:'#E74C3C', fontWeight:'800', fontSize:'18px', marginBottom:'12px' }}>Paiement échoué</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:'1.6', marginBottom:'24px' }}>{erreur}</div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={onRetour} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.2)', background:'transparent', color:'rgba(255,255,255,0.6)', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>← Retour</button>
              <button onClick={() => { setEtape('formulaire'); setErreur(''); setStatutPay(null) }} style={{ flex:2, padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#C9A84C', color:'#1B3A6B', fontWeight:'800', fontSize:'14px' }}>🔄 Réessayer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
