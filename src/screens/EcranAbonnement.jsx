import { useState } from 'react'

const PLANS_DATA = [
  {
    id: 'basique',
    nom: 'Basique',
    prix: 5000,
    couleur: '#2ECC71',
    emoji: '🏨',
    chambres: '10 chambres max',
    utilisateurs: '2 utilisateurs',
    features: ['Dashboard', 'Chambres', 'Séjours', 'Caisse', 'Journal'],
  },
  {
    id: 'pro',
    nom: 'Pro',
    prix: 15000,
    couleur: '#1B3A6B',
    emoji: '🏢',
    chambres: '30 chambres max',
    utilisateurs: '5 utilisateurs',
    features: ['Tout Basique', 'Statistiques avancées', 'Rapports PDF', 'Maintenance'],
    recommande: true,
  },
  {
    id: 'premium',
    nom: 'Premium',
    prix: 25000,
    couleur: '#C9A84C',
    emoji: '👑',
    chambres: 'Chambres illimitées',
    utilisateurs: 'Utilisateurs illimités',
    features: ['Tout Pro', 'Multi-appareils', 'Support prioritaire', 'Modules futurs', 'Options personnalisées'],
  },
]

export default function EcranAbonnement({ utilisateur, onPaiementReussi }) {
  const [planChoisi, setPlanChoisi] = useState(null)
  const [facturation, setFacturation] = useState('mensuel')

  const prixAnnuel = (prix) => Math.round(prix * 10) // 2 mois offerts

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', overflowY:'auto', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ padding:'40px 20px 24px', textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔓</div>
        <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'22px', marginBottom:'8px' }}>
          Choisissez votre plan
        </div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:'1.5' }}>
          Votre essai gratuit est terminé.<br/>Continuez à gérer votre hôtel avec HOMS.
        </div>
      </div>

      {/* Toggle mensuel / annuel */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px', padding:'0 20px' }}>
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:'12px', padding:'4px', display:'flex', gap:'4px' }}>
          {['mensuel', 'annuel'].map(f => (
            <button key={f} onClick={() => setFacturation(f)} style={{
              padding:'8px 20px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700',
              background: facturation === f ? '#C9A84C' : 'transparent',
              color: facturation === f ? '#1B3A6B' : 'rgba(255,255,255,0.6)',
              transition:'all 0.2s',
            }}>
              {f === 'mensuel' ? 'Mensuel' : 'Annuel (-17%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:'16px', maxWidth:'440px', margin:'0 auto' }}>
        {PLANS_DATA.map(plan => (
          <div key={plan.id} onClick={() => setPlanChoisi(plan.id)} style={{
            background: planChoisi === plan.id ? `${plan.couleur}22` : 'rgba(255,255,255,0.06)',
            border: `2px solid ${planChoisi === plan.id ? plan.couleur : plan.recommande ? plan.couleur+'55' : 'rgba(255,255,255,0.12)'}`,
            borderRadius:'20px', padding:'20px', cursor:'pointer', transition:'all 0.2s', position:'relative',
          }}>
            {plan.recommande && (
              <div style={{ position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', background:plan.couleur, color:'white', fontSize:'11px', fontWeight:'800', padding:'4px 14px', borderRadius:'20px', letterSpacing:'1px' }}>
                ⭐ RECOMMANDÉ
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
              <div>
                <div style={{ color:'white', fontWeight:'800', fontSize:'18px' }}>{plan.emoji} {plan.nom}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', marginTop:'4px' }}>{plan.chambres} · {plan.utilisateurs}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:plan.couleur, fontWeight:'900', fontSize:'20px' }}>
                  {facturation === 'mensuel'
                    ? `${plan.prix.toLocaleString('fr-FR')} FCFA`
                    : `${prixAnnuel(plan.prix).toLocaleString('fr-FR')} FCFA`}
                </div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>
                  {facturation === 'mensuel' ? '/mois' : '/an'}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'rgba(255,255,255,0.7)' }}>
                  <span style={{ color:plan.couleur, fontSize:'14px' }}>✓</span> {f}
                </div>
              ))}
            </div>
            {planChoisi === plan.id && (
              <div style={{ marginTop:'12px', background:plan.couleur, borderRadius:'8px', padding:'8px', textAlign:'center', fontSize:'12px', fontWeight:'800', color:'#1B3A6B' }}>
                ✅ Plan sélectionné
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton payer */}
      {planChoisi && (
        <div style={{ padding:'24px 20px 0', maxWidth:'440px', margin:'0 auto' }}>
          <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'12px', padding:'12px 14px', marginBottom:'16px', fontSize:'12px', color:'rgba(201,168,76,0.9)', textAlign:'center' }}>
            💳 Le paiement Mobile Money et carte bancaire sera disponible très bientôt.<br/>
            <strong>Contactez Homslovision pour activer votre abonnement.</strong>
          </div>
          <a href="https://wa.me/237600000000?text=Je souhaite activer le plan HOMS" target="_blank" rel="noreferrer" style={{
            display:'block', width:'100%', padding:'16px', borderRadius:'14px', border:'none',
            background:'linear-gradient(90deg, #C9A84C 0%, #F5D98A 40%, #C9A84C 60%, #A07830 100%)',
            backgroundSize:'200% auto', color:'#1B3A6B', fontWeight:'900', fontSize:'16px',
            textAlign:'center', textDecoration:'none', boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
          }}>
            📱 Contacter Homslovision pour payer
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
