import { useState, useEffect } from 'react'

// ─── Styles d'animation injectés dans le <head> ───────────────────────────────
const styleAnim = `
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%,100% { transform: scale(1);    filter: drop-shadow(0 0 8px rgba(201,168,76,0.4)); }
    50%      { transform: scale(1.07); filter: drop-shadow(0 0 22px rgba(201,168,76,0.9)); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px);   opacity: 0.6; }
    50%      { transform: translateY(-18px); opacity: 1;   }
  }
  @keyframes twinkle {
    0%,100% { opacity: 0.2; transform: scale(0.8); }
    50%      { opacity: 1;   transform: scale(1.3); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bounce {
    0%,100% { transform: translateY(0); }
    40%      { transform: translateY(-6px); }
    60%      { transform: translateY(-3px); }
  }
  @keyframes glowBorder {
    0%,100% { box-shadow: 0 0 0px rgba(201,168,76,0); }
    50%      { box-shadow: 0 0 16px rgba(201,168,76,0.6); }
  }
  @keyframes cardHover {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-4px); }
  }
  .btn-shimmer {
    background: linear-gradient(90deg, #C9A84C 0%, #F5D98A 40%, #C9A84C 60%, #A07830 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
  }
  .logo-pulse { animation: pulse 2.8s ease-in-out infinite; }
  .fade-down  { animation: fadeDown 0.7s ease both; }
  .fade-up    { animation: fadeUp  0.6s ease both; }
  .fade-left  { animation: fadeLeft 0.7s ease both; }
`

// ─── Particules flottantes ────────────────────────────────────────────────────
const PARTICULES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  delay: Math.random() * 4,
  dur: Math.random() * 3 + 3,
  type: i % 3, // 0=étoile 1=losange 2=cercle
}))

// ─── Rôles ────────────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'directeur',     label: 'Directeur',       emoji: '👔', couleur: '#C9A84C' },
  { id: 'receptionniste',label: 'Réceptionniste',   emoji: '🛎️', couleur: '#2ECC71' },
  { id: 'caissier',      label: 'Caissier',         emoji: '💰', couleur: '#E8634A' },
]

// ─── Machine à écrire ─────────────────────────────────────────────────────────
function Typewriter({ text, delay = 0, style }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t0)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [started, text])

  return <span style={style}>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0, color:'#C9A84C' }}>|</span></span>
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Connexion({ onConnexion }) {
  const [role, setRole]       = useState(null)
  const [email, setEmail]     = useState('')
  const [mdp, setMdp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur]   = useState('')
  const [etape, setEtape]     = useState(1) // 1=choix rôle, 2=formulaire

  // Injection des styles d'animation
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleAnim
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  const handleChoisirRole = (r) => {
    setRole(r)
    setTimeout(() => setEtape(2), 300)
  }

  const handleConnexion = () => {
    if (!email || !mdp) { setErreur('Veuillez remplir tous les champs.'); return }
    setErreur('')
    setLoading(true)
    // Simulation connexion (Phase 2 : Firebase Auth)
    setTimeout(() => {
      setLoading(false)
      if (onConnexion) onConnexion({ email, role: role.id })
    }, 1800)
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', overflowX: 'hidden',
      position: 'relative', paddingBottom: '40px'
    }}>

      {/* ── Particules flottantes ── */}
      {PARTICULES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: p.type === 2 ? '50%' : p.type === 0 ? '2px' : '0',
          background: p.type === 1 ? 'transparent' : '#C9A84C',
          border: p.type === 1 ? '1.5px solid #C9A84C' : 'none',
          transform: p.type === 1 ? 'rotate(45deg)' : 'none',
          animation: `${p.type === 0 ? 'twinkle' : 'float'} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          pointerEvents: 'none', zIndex: 0,
          opacity: 0.6,
        }}/>
      ))}

      {/* ── Logo + titre ── */}
      <div style={{ zIndex:1, textAlign:'center', paddingTop:'52px', paddingBottom:'8px' }}>

        {/* Logo pulsant */}
        <div className="fade-down" style={{ animationDelay:'0.1s' }}>
          <div className="logo-pulse" style={{ display:'inline-block', marginBottom:'16px' }}>
            <img
              src="/logo-homs.png"
              alt="HOMS"
              style={{ height:'88px', filter:'drop-shadow(0 0 16px rgba(201,168,76,0.7))' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            {/* Fallback si logo absent */}
            <div style={{
              display:'none', width:'88px', height:'88px', borderRadius:'22px',
              background:'linear-gradient(135deg, #C9A84C, #F5D98A)',
              alignItems:'center', justifyContent:'center',
              fontSize:'32px', fontWeight:'900', color:'#1B3A6B',
              boxShadow:'0 0 30px rgba(201,168,76,0.5)'
            }}>H</div>
          </div>
        </div>

        {/* Nom hôtel — machine à écrire */}
        <div className="fade-down" style={{ animationDelay:'0.3s', minHeight:'36px' }}>
          <Typewriter
            text="HOMS-HÔTEL MANAGER"
            delay={600}
            style={{ fontSize:'26px', fontWeight:'900', color:'#C9A84C', letterSpacing:'4px' }}
          />
        </div>

        {/* Slogan glisse gauche */}
        <div className="fade-left" style={{ animationDelay:'0.5s', marginTop:'6px', minHeight:'20px' }}>
          <Typewriter
            text="UNE VISION D'ENSEMBLE"
            delay={1400}
            style={{ fontSize:'11px', color:'rgba(201,168,76,0.7)', letterSpacing:'3px', fontWeight:'600' }}
          />
        </div>

        {/* Ligne décorative */}
        <div className="fade-up" style={{ animationDelay:'0.6s', marginTop:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <div style={{ height:'1px', width:'50px', background:'linear-gradient(90deg, transparent, #C9A84C)' }}/>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#C9A84C', animation:'bounce 1.5s ease infinite' }}/>
          <div style={{ height:'1px', width:'50px', background:'linear-gradient(90deg, #C9A84C, transparent)' }}/>
        </div>
      </div>

      {/* ── ÉTAPE 1 : Choix du rôle ── */}
      {etape === 1 && (
        <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'28px', animationDelay:'0.8s' }}>
          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.6)', fontSize:'13px', marginBottom:'20px', letterSpacing:'1px' }}>
            Sélectionnez votre profil
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {ROLES.map((r, i) => (
              <button
                key={r.id}
                onClick={() => handleChoisirRole(r)}
                style={{
                  display:'flex', alignItems:'center', gap:'16px',
                  padding:'18px 20px', borderRadius:'16px',
                  background:'rgba(255,255,255,0.06)',
                  border:`1.5px solid rgba(255,255,255,0.12)`,
                  cursor:'pointer', width:'100%', textAlign:'left',
                  animation:`fadeUp 0.5s ease ${0.9 + i*0.15}s both`,
                  transition:'all 0.25s ease',
                  backdropFilter:'blur(8px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${r.couleur}22`
                  e.currentTarget.style.border = `1.5px solid ${r.couleur}`
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${r.couleur}33`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.12)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width:'52px', height:'52px', borderRadius:'14px',
                  background:`${r.couleur}22`, border:`1.5px solid ${r.couleur}55`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'26px', flexShrink:0,
                  animation:`cardHover 3s ease ${i*0.5}s infinite`,
                }}>
                  {r.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'white', fontWeight:'800', fontSize:'16px' }}>{r.label}</div>
                  <div style={{ color:`${r.couleur}99`, fontSize:'12px', marginTop:'2px' }}>
                    {r.id==='directeur' ? 'Accès complet · Paramètres · Rapports'
                      : r.id==='receptionniste' ? 'Séjours · Chambres · Caisse'
                      : 'Encaissements · Caisse du jour'}
                  </div>
                </div>
                <div style={{ color:`${r.couleur}`, fontSize:'20px' }}>›</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Formulaire de connexion ── */}
      {etape === 2 && role && (
        <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'20px' }}>

          {/* Badge rôle choisi */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'24px' }}>
            <button onClick={() => setEtape(1)} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>
              ‹ Retour
            </button>
            <div style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:`${role.couleur}22`, border:`1px solid ${role.couleur}55`,
              borderRadius:'20px', padding:'6px 16px',
            }}>
              <span style={{ fontSize:'18px' }}>{role.emoji}</span>
              <span style={{ color:role.couleur, fontWeight:'700', fontSize:'13px' }}>{role.label}</span>
            </div>
          </div>

          {/* Champs */}
          <div style={{ marginBottom:'14px', animation:'fadeUp 0.4s ease 0.1s both' }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
              ADRESSE EMAIL
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemple@hotel.com"
              style={{
                width:'100%', padding:'14px 16px',
                background:'rgba(255,255,255,0.08)',
                border:'1.5px solid rgba(255,255,255,0.15)',
                borderRadius:'12px', color:'white', fontSize:'15px',
                outline:'none', boxSizing:'border-box',
                transition:'border 0.2s',
              }}
              onFocus={e => { e.target.style.border = `1.5px solid ${role.couleur}` }}
              onBlur={e => { e.target.style.border = '1.5px solid rgba(255,255,255,0.15)' }}
            />
          </div>

          <div style={{ marginBottom:'10px', animation:'fadeUp 0.4s ease 0.2s both' }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
              MOT DE PASSE
            </label>
            <input
              type="password" value={mdp}
              onChange={e => setMdp(e.target.value)}
              placeholder="••••••••"
              style={{
                width:'100%', padding:'14px 16px',
                background:'rgba(255,255,255,0.08)',
                border:'1.5px solid rgba(255,255,255,0.15)',
                borderRadius:'12px', color:'white', fontSize:'15px',
                outline:'none', boxSizing:'border-box',
                transition:'border 0.2s',
              }}
              onFocus={e => { e.target.style.border = `1.5px solid ${role.couleur}` }}
              onBlur={e => { e.target.style.border = '1.5px solid rgba(255,255,255,0.15)' }}
            />
          </div>

          {erreur && (
            <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'10px', textAlign:'center', animation:'fadeUp 0.3s ease both' }}>
              ⚠️ {erreur}
            </div>
          )}

          {/* Bouton connexion avec shimmer */}
          <button
            className="btn-shimmer"
            onClick={handleConnexion}
            disabled={loading}
            style={{
              width:'100%', padding:'16px', borderRadius:'14px', border:'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              color:'#1B3A6B', fontWeight:'900', fontSize:'16px',
              marginTop:'8px', letterSpacing:'1px',
              animation:'fadeUp 0.4s ease 0.3s both, glowBorder 2s ease infinite',
              opacity: loading ? 0.8 : 1,
              boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
            }}
          >
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                <span style={{ display:'inline-block', width:'16px', height:'16px', border:'2.5px solid #1B3A6B', borderTopColor:'transparent', borderRadius:'50%', animation:'rotateSlow 0.8s linear infinite' }}/>
                Connexion en cours...
              </span>
            ) : `Se connecter · ${role.label}`}
          </button>

          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:'11px', marginTop:'16px' }}>
            Mot de passe oublié ? Contactez votre administrateur
          </p>
        </div>
      )}

      {/* ── Footer Homslovision ── */}
      <div style={{ zIndex:1, width:'100%', paddingTop:'32px', paddingBottom:'20px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'11px', letterSpacing:'1px', marginBottom:'10px' }}>
          Propulsé par
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
          <div style={{ animation:'rotateSlow 8s linear infinite', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img
              src="/logo-homslovision-blanc.png"
              alt="Homslovision"
              style={{ height:'28px', opacity:0.6 }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            {/* Fallback logo tournant */}
            <div style={{
              display:'none', width:'28px', height:'28px', borderRadius:'8px',
              background:'linear-gradient(135deg, #C9A84C, #F5D98A)',
              alignItems:'center', justifyContent:'center',
              fontSize:'13px', fontWeight:'900', color:'#1B3A6B'
            }}>HV</div>
          </div>
          <span style={{ color:'rgba(201,168,76,0.6)', fontSize:'13px', fontWeight:'700', letterSpacing:'2px' }}>
            HOMSLOVISION
          </span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'10px', marginTop:'6px', letterSpacing:'1px' }}>
          Le futur maintenant · v1.0
        </p>
      </div>

    </div>
  )
}
