import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

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

const PARTICULES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  delay: Math.random() * 4,
  dur: Math.random() * 3 + 3,
  type: i % 3,
}))

const ROLES = [
  { id:'directeur',      label:'Directeur',      emoji:'👔', couleur:'#C9A84C' },
  { id:'receptionniste', label:'Réceptionniste',  emoji:'🛎️', couleur:'#2ECC71' },
  { id:'caissier',       label:'Caissier',        emoji:'💰', couleur:'#E8634A' },
]

function lireUtilisateurs() {
  try {
    const s = localStorage.getItem('homs_utilisateurs')
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

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

// ─── Écran d'inscription ──────────────────────────────────────────────────────
function EcranInscription({ onRetour, onInscriptionReussie }) {
  const [form, setForm] = useState({ nomHotel:'', nomDirecteur:'', email:'', motDePasse:'', confirmer:'' })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const champStyle = {
    width:'100%', padding:'14px 16px',
    background:'rgba(255,255,255,0.08)',
    border:'1.5px solid rgba(255,255,255,0.15)',
    borderRadius:'12px', color:'white', fontSize:'15px',
    outline:'none', boxSizing:'border-box', transition:'border 0.2s',
  }

  const handleInscrire = async () => {
    if (!form.nomHotel.trim())      { setErreur("Entrez le nom de votre hôtel."); return }
    if (!form.nomDirecteur.trim())  { setErreur("Entrez votre nom."); return }
    if (!form.email.trim())         { setErreur("Entrez votre email."); return }
    if (form.motDePasse.length < 6) { setErreur("Mot de passe : minimum 6 caractères."); return }
    if (form.motDePasse !== form.confirmer) { setErreur("Les mots de passe ne correspondent pas."); return }

    setErreur('')
    setLoading(true)

    try {
      // 1. Créer le compte Firebase Auth
      const resultat = await createUserWithEmailAndPassword(auth, form.email.trim(), form.motDePasse)
      const uid = resultat.user.uid

      // 2. Créer le profil de l'hôtel dans Firestore
      await setDoc(doc(db, 'hotels', uid, 'infos', 'identite'), {
        nom: form.nomHotel.trim(),
        nomDirecteur: form.nomDirecteur.trim(),
        email: form.email.trim(),
        dateCreation: new Date().toISOString(),
        slogan: '', adresse: '', telephone1: '', telephone2: '',
        rccm: '', contribuable: '', mentionLegale: '', logoUrl: null,
      })

      setLoading(false)
      onInscriptionReussie({
        nom: form.nomDirecteur.trim(),
        role: 'directeur',
        email: form.email.trim(),
        uid,
        nomHotel: form.nomHotel.trim(),
        derniereConnexion: new Date().toLocaleDateString('fr-FR'),
      })

    } catch (err) {
      setLoading(false)
      if (err.code === 'auth/email-already-in-use') {
        setErreur('Cet email est déjà utilisé. Connectez-vous à la place.')
      } else if (err.code === 'auth/invalid-email') {
        setErreur('Adresse email invalide.')
      } else {
        setErreur('Erreur lors de la création du compte. Réessayez.')
      }
    }
  }

  return (
    <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' }}>
        <button onClick={onRetour} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>
          ‹ Retour
        </button>
        <span style={{ color:'#C9A84C', fontWeight:'800', fontSize:'17px' }}>Créer un compte</span>
      </div>

      <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'12px', padding:'12px 14px', marginBottom:'20px', fontSize:'12px', color:'rgba(201,168,76,0.9)' }}>
        🏨 Bienvenue ! Créez votre compte directeur pour commencer à gérer votre hôtel.
      </div>

      {/* Nom de l'hôtel */}
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
          NOM DE L'HÔTEL *
        </label>
        <input value={form.nomHotel}
          onChange={e => setForm({...form, nomHotel:e.target.value})}
          placeholder="Ex. Hôtel Palace Dakar"
          style={champStyle}
          onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
          onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
        />
      </div>

      {/* Nom du directeur */}
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
          VOTRE NOM *
        </label>
        <input value={form.nomDirecteur}
          onChange={e => setForm({...form, nomDirecteur:e.target.value})}
          placeholder="Ex. Jean Dupont"
          style={champStyle}
          onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
          onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
          EMAIL *
        </label>
        <input type="email" value={form.email}
          onChange={e => setForm({...form, email:e.target.value})}
          placeholder="directeur@monhotel.com"
          style={champStyle}
          onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
          onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
        />
      </div>

      {/* Mot de passe */}
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
          MOT DE PASSE * (min. 6 caractères)
        </label>
        <input type="password" value={form.motDePasse}
          onChange={e => setForm({...form, motDePasse:e.target.value})}
          placeholder="••••••••"
          style={champStyle}
          onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
          onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
        />
      </div>

      {/* Confirmer mot de passe */}
      <div style={{ marginBottom:'20px' }}>
        <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
          CONFIRMER LE MOT DE PASSE *
        </label>
        <input type="password" value={form.confirmer}
          onChange={e => setForm({...form, confirmer:e.target.value})}
          onKeyDown={e => e.key==='Enter' && handleInscrire()}
          placeholder="••••••••"
          style={champStyle}
          onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
          onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
        />
      </div>

      {erreur && (
        <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'12px', textAlign:'center' }}>
          ⚠️ {erreur}
        </div>
      )}

      <button className="btn-shimmer" onClick={handleInscrire} disabled={loading} style={{
        width:'100%', padding:'16px', borderRadius:'14px', border:'none',
        cursor:loading?'not-allowed':'pointer',
        color:'#1B3A6B', fontWeight:'900', fontSize:'16px',
        opacity:loading?0.8:1,
        boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
      }}>
        {loading ? (
          <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
            <span style={{ display:'inline-block', width:'16px', height:'16px', border:'2.5px solid #1B3A6B', borderTopColor:'transparent', borderRadius:'50%', animation:'rotateSlow 0.8s linear infinite' }}/>
            Création en cours...
          </span>
        ) : '🏨 Créer mon compte'}
      </button>

      <p style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'11px', marginTop:'16px', lineHeight:'1.5' }}>
        En créant un compte, vous acceptez les conditions d'utilisation de HOMS-HÔTEL MANAGER par Homslovision.
      </p>
    </div>
  )
}

// ─── Écran mot de passe oublié (Firebase) ────────────────────────────────────
function EcranMotDePasseOublie({ onRetour }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const champStyle = {
    width:'100%', padding:'14px 16px',
    background:'rgba(255,255,255,0.08)',
    border:'1.5px solid rgba(255,255,255,0.15)',
    borderRadius:'12px', color:'white', fontSize:'15px',
    outline:'none', boxSizing:'border-box',
  }

  const handleReset = async () => {
    if (!email.trim()) { setErreur('Entrez votre adresse email.'); return }
    setLoading(true)
    setErreur('')
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setSucces(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setErreur('Aucun compte trouvé avec cet email.')
      } else {
        setErreur('Erreur. Vérifiez votre email et réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' }}>
        <button onClick={onRetour} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>
          ‹ Retour
        </button>
        <span style={{ color:'#C9A84C', fontWeight:'800', fontSize:'17px' }}>Mot de passe oublié</span>
      </div>

      {succes ? (
        <div style={{ background:'rgba(46,204,113,0.15)', border:'1px solid #2ECC71', borderRadius:'14px', padding:'24px 20px', textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>📧</div>
          <div style={{ color:'#2ECC71', fontWeight:'800', fontSize:'16px', marginBottom:'8px' }}>Email envoyé !</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:'1.5' }}>
            Vérifiez votre boîte email et suivez le lien pour réinitialiser votre mot de passe.
          </div>
          <button onClick={onRetour} style={{ marginTop:'20px', padding:'12px 24px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#2ECC71', color:'white', fontWeight:'800', fontSize:'14px' }}>
            Retour à la connexion
          </button>
        </div>
      ) : (
        <>
          <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'12px', padding:'12px 14px', marginBottom:'20px', fontSize:'12px', color:'rgba(201,168,76,0.9)' }}>
            💡 Entrez l'email de votre compte directeur. Vous recevrez un lien pour créer un nouveau mot de passe.
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>
              VOTRE EMAIL
            </label>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleReset()}
              placeholder="directeur@monhotel.com"
              style={champStyle}
              onFocus={e => e.target.style.border='1.5px solid #C9A84C'}
              onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
            />
          </div>

          {erreur && <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'12px', textAlign:'center' }}>⚠️ {erreur}</div>}

          <button className="btn-shimmer" onClick={handleReset} disabled={loading} style={{
            width:'100%', padding:'16px', borderRadius:'14px', border:'none',
            cursor:loading?'not-allowed':'pointer',
            color:'#1B3A6B', fontWeight:'900', fontSize:'16px',
            opacity:loading?0.8:1,
            boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
          }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                <span style={{ display:'inline-block', width:'16px', height:'16px', border:'2.5px solid #1B3A6B', borderTopColor:'transparent', borderRadius:'50%', animation:'rotateSlow 0.8s linear infinite' }}/>
                Envoi en cours...
              </span>
            ) : '📧 Envoyer le lien de réinitialisation'}
          </button>
        </>
      )}
    </div>
  )
}

export default function Connexion({ onConnexion }) {
  const [mode, setMode] = useState('connexion') // 'connexion' | 'inscription' | 'reset'
  const [role, setRole]   = useState(null)
  const [mdp, setMdp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur]   = useState('')
  const [etape, setEtape] = useState(1)

  const [showOublie, setShowOublie]   = useState(false)
  const [nomOublie, setNomOublie]     = useState('')
  const [reponse, setReponse]         = useState('')
  const [nouveauMdp, setNouveauMdp]   = useState('')
  const [userTrouve, setUserTrouve]   = useState(null)
  const [mdpReset, setMdpReset]       = useState(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styleAnim
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  const handleChoisirRole = (r) => {
    setRole(r)
    setMdp('')
    setErreur('')
    setTimeout(() => setEtape(2), 300)
  }

  const handleConnexion = async () => {
    if (!mdp) { setErreur('Veuillez entrer votre mot de passe.'); return }
    setErreur('')
    setLoading(true)

    const now = new Date()
    const horodatage = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    if (role.id === 'directeur') {
      try {
        const resultat = await signInWithEmailAndPassword(auth, role.email || '', mdp)
        setLoading(false)
        onConnexion({ nom:'Directeur', role:'directeur', email:resultat.user.email, uid:resultat.user.uid, derniereConnexion:horodatage })
        return
      } catch {
        // Fallback : chercher par email dans Firebase avec l'email saisi
        // Si l'email est vide c'est l'ancien compte admin
        if (!role.email) {
          try {
            const resultat = await signInWithEmailAndPassword(auth, 'admin@homs.com', mdp)
            setLoading(false)
            onConnexion({ nom:'Directeur', role:'directeur', email:'admin@homs.com', uid:resultat.user.uid, derniereConnexion:horodatage })
            return
          } catch {
            if (mdp === 'admin1234') {
              setLoading(false)
              onConnexion({ nom:'Directeur', role:'directeur', email:'admin@homs.com', uid:'admin_local', derniereConnexion:horodatage })
              return
            }
          }
        }
        setLoading(false)
        setErreur('Email ou mot de passe incorrect.')
        return
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    const utilisateurs = lireUtilisateurs()
    const user = utilisateurs.find(u => u.role === role.id && u.motDePasse === mdp && u.actif !== false)
    if (user) {
      const maj = utilisateurs.map(u2 => u2.id === user.id ? { ...u2, derniereConnexion: horodatage } : u2)
      localStorage.setItem('homs_utilisateurs', JSON.stringify(maj))
      onConnexion({ nom:user.nom, role:user.role, email:user.email||'', uid:null, derniereConnexion:horodatage })
    } else {
      setErreur('Mot de passe incorrect ou compte désactivé.')
    }
  }

  const handleChercherUser = () => {
    const utilisateurs = lireUtilisateurs()
    const u = utilisateurs.find(u => u.nom.toLowerCase() === nomOublie.trim().toLowerCase() && u.role === role.id)
    if (!u) { setErreur('Aucun compte trouvé avec ce nom pour ce rôle.'); return }
    setUserTrouve(u); setErreur('')
  }

  const handleVerifierReponse = () => {
    if (!userTrouve) return
    if (reponse.trim().toLowerCase() === userTrouve.reponseSecrete?.toLowerCase()) { setErreur(''); setMdpReset(true) }
    else setErreur('Réponse incorrecte.')
  }

  const handleNouveauMdp = () => {
    if (nouveauMdp.length < 4) { setErreur('Minimum 4 caractères.'); return }
    const utilisateurs = lireUtilisateurs()
    const maj = utilisateurs.map(u => u.id === userTrouve.id ? { ...u, motDePasse: nouveauMdp } : u)
    localStorage.setItem('homs_utilisateurs', JSON.stringify(maj))
    setShowOublie(false); setNomOublie(''); setReponse(''); setNouveauMdp(''); setUserTrouve(null); setMdpReset(false); setErreur('')
    alert('✅ Mot de passe mis à jour ! Vous pouvez vous connecter.')
  }

  const champStyle = (couleur) => ({
    width:'100%', padding:'14px 16px',
    background:'rgba(255,255,255,0.08)',
    border:'1.5px solid rgba(255,255,255,0.15)',
    borderRadius:'12px', color:'white', fontSize:'15px',
    outline:'none', boxSizing:'border-box', transition:'border 0.2s',
  })

  // ── Écran inscription ──
  if (mode === 'inscription') {
    return (
      <div style={{ minHeight:'100vh', width:'100%', background:'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', overflowX:'hidden', position:'relative', paddingBottom:'40px' }}>
        {PARTICULES.map(p => (
          <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:`${p.size}px`, height:`${p.size}px`, borderRadius:p.type===2?'50%':p.type===0?'2px':'0', background:p.type===1?'transparent':'#C9A84C', border:p.type===1?'1.5px solid #C9A84C':'none', transform:p.type===1?'rotate(45deg)':'none', animation:`${p.type===0?'twinkle':'float'} ${p.dur}s ease-in-out ${p.delay}s infinite`, pointerEvents:'none', zIndex:0, opacity:0.6 }}/>
        ))}
        <div style={{ zIndex:1, textAlign:'center', paddingTop:'52px', paddingBottom:'24px' }}>
          <div className="logo-pulse" style={{ display:'inline-block', marginBottom:'16px' }}>
            <img src="/logo-homs.png" alt="HOMS" style={{ height:'72px', filter:'drop-shadow(0 0 16px rgba(201,168,76,0.7))' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
            <div style={{ display:'none', width:'72px', height:'72px', borderRadius:'18px', background:'linear-gradient(135deg, #C9A84C, #F5D98A)', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'900', color:'#1B3A6B' }}>H</div>
          </div>
          <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'20px', letterSpacing:'3px' }}>HOMS-HÔTEL MANAGER</div>
        </div>
        <EcranInscription
          onRetour={() => setMode('connexion')}
          onInscriptionReussie={onConnexion}
        />
        <Footer/>
      </div>
    )
  }

  // ── Écran reset mot de passe directeur ──
  if (mode === 'reset') {
    return (
      <div style={{ minHeight:'100vh', width:'100%', background:'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', overflowX:'hidden', position:'relative', paddingBottom:'40px' }}>
        {PARTICULES.map(p => (
          <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:`${p.size}px`, height:`${p.size}px`, borderRadius:p.type===2?'50%':p.type===0?'2px':'0', background:p.type===1?'transparent':'#C9A84C', border:p.type===1?'1.5px solid #C9A84C':'none', transform:p.type===1?'rotate(45deg)':'none', animation:`${p.type===0?'twinkle':'float'} ${p.dur}s ease-in-out ${p.delay}s infinite`, pointerEvents:'none', zIndex:0, opacity:0.6 }}/>
        ))}
        <div style={{ zIndex:1, textAlign:'center', paddingTop:'52px', paddingBottom:'24px' }}>
          <div className="logo-pulse" style={{ display:'inline-block', marginBottom:'16px' }}>
            <img src="/logo-homs.png" alt="HOMS" style={{ height:'72px', filter:'drop-shadow(0 0 16px rgba(201,168,76,0.7))' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
            <div style={{ display:'none', width:'72px', height:'72px', borderRadius:'18px', background:'linear-gradient(135deg, #C9A84C, #F5D98A)', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'900', color:'#1B3A6B' }}>H</div>
          </div>
          <div style={{ color:'#C9A84C', fontWeight:'900', fontSize:'20px', letterSpacing:'3px' }}>HOMS-HÔTEL MANAGER</div>
        </div>
        <EcranMotDePasseOublie onRetour={() => setMode('connexion')}/>
        <Footer/>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', overflowX:'hidden', position:'relative', paddingBottom:'40px' }}>

      {PARTICULES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:`${p.size}px`, height:`${p.size}px`, borderRadius:p.type===2?'50%':p.type===0?'2px':'0', background:p.type===1?'transparent':'#C9A84C', border:p.type===1?'1.5px solid #C9A84C':'none', transform:p.type===1?'rotate(45deg)':'none', animation:`${p.type===0?'twinkle':'float'} ${p.dur}s ease-in-out ${p.delay}s infinite`, pointerEvents:'none', zIndex:0, opacity:0.6 }}/>
      ))}

      <div style={{ zIndex:1, textAlign:'center', paddingTop:'52px', paddingBottom:'8px' }}>
        <div className="fade-down" style={{ animationDelay:'0.1s' }}>
          <div className="logo-pulse" style={{ display:'inline-block', marginBottom:'16px' }}>
            <img src="/logo-homs.png" alt="HOMS" style={{ height:'88px', filter:'drop-shadow(0 0 16px rgba(201,168,76,0.7))' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
            <div style={{ display:'none', width:'88px', height:'88px', borderRadius:'22px', background:'linear-gradient(135deg, #C9A84C, #F5D98A)', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:'900', color:'#1B3A6B', boxShadow:'0 0 30px rgba(201,168,76,0.5)' }}>H</div>
          </div>
        </div>
        <div className="fade-down" style={{ animationDelay:'0.3s', minHeight:'36px' }}>
          <Typewriter text="HOMS-HÔTEL MANAGER" delay={600} style={{ fontSize:'26px', fontWeight:'900', color:'#C9A84C', letterSpacing:'4px' }}/>
        </div>
        <div className="fade-left" style={{ animationDelay:'0.5s', marginTop:'6px', minHeight:'20px' }}>
          <Typewriter text="UNE VISION D'ENSEMBLE" delay={1400} style={{ fontSize:'11px', color:'rgba(201,168,76,0.7)', letterSpacing:'3px', fontWeight:'600' }}/>
        </div>
        <div className="fade-up" style={{ animationDelay:'0.6s', marginTop:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <div style={{ height:'1px', width:'50px', background:'linear-gradient(90deg, transparent, #C9A84C)' }}/>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#C9A84C', animation:'bounce 1.5s ease infinite' }}/>
          <div style={{ height:'1px', width:'50px', background:'linear-gradient(90deg, #C9A84C, transparent)' }}/>
        </div>
      </div>

      {etape === 1 && (
        <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'28px', animationDelay:'0.8s' }}>
          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.6)', fontSize:'13px', marginBottom:'20px', letterSpacing:'1px' }}>
            Sélectionnez votre profil
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {ROLES.map((r, i) => (
              <button key={r.id} onClick={() => handleChoisirRole(r)} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'18px 20px', borderRadius:'16px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.12)', cursor:'pointer', width:'100%', textAlign:'left', animation:`fadeUp 0.5s ease ${0.9+i*0.15}s both`, transition:'all 0.25s ease', backdropFilter:'blur(8px)' }}
                onMouseEnter={e => { e.currentTarget.style.background=`${r.couleur}22`; e.currentTarget.style.border=`1.5px solid ${r.couleur}`; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${r.couleur}33` }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.border='1.5px solid rgba(255,255,255,0.12)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:`${r.couleur}22`, border:`1.5px solid ${r.couleur}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0, animation:`cardHover 3s ease ${i*0.5}s infinite` }}>{r.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'white', fontWeight:'800', fontSize:'16px' }}>{r.label}</div>
                  <div style={{ color:`${r.couleur}99`, fontSize:'12px', marginTop:'2px' }}>
                    {r.id==='directeur' ? 'Accès complet · Paramètres · Rapports' : r.id==='receptionniste' ? 'Séjours · Chambres · Caisse' : 'Encaissements · Caisse du jour'}
                  </div>
                </div>
                <div style={{ color:r.couleur, fontSize:'20px' }}>›</div>
              </button>
            ))}
          </div>

          {/* Bouton Créer un compte */}
          <div style={{ marginTop:'28px', textAlign:'center' }}>
            <div style={{ height:'1px', background:'rgba(255,255,255,0.1)', marginBottom:'20px' }}/>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', marginBottom:'12px' }}>
              Vous n'avez pas encore de compte ?
            </p>
            <button onClick={() => setMode('inscription')} style={{
              width:'100%', padding:'14px', borderRadius:'14px',
              border:'1.5px solid rgba(201,168,76,0.5)',
              background:'rgba(201,168,76,0.08)',
              color:'#C9A84C', fontWeight:'800', fontSize:'14px',
              cursor:'pointer', letterSpacing:'1px',
            }}>
              🏨 Créer un compte hôtel
            </button>
          </div>
        </div>
      )}

      {etape === 2 && role && !showOublie && (
        <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'24px' }}>
            <button onClick={() => setEtape(1)} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>‹ Retour</button>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:`${role.couleur}22`, border:`1px solid ${role.couleur}55`, borderRadius:'20px', padding:'6px 16px' }}>
              <span style={{ fontSize:'18px' }}>{role.emoji}</span>
              <span style={{ color:role.couleur, fontWeight:'700', fontSize:'13px' }}>{role.label}</span>
            </div>
          </div>

          {role.id === 'directeur' && (
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>EMAIL</label>
              <input type="email" value={role.email||''} onChange={e => setRole({...role, email:e.target.value})}
                placeholder="votre@email.com"
                style={champStyle(role.couleur)}
                onFocus={e => e.target.style.border=`1.5px solid ${role.couleur}`}
                onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
              />
            </div>
          )}

          <div style={{ marginBottom:'14px', animation:'fadeUp 0.4s ease 0.1s both' }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>MOT DE PASSE</label>
            <input type="password" value={mdp} onChange={e => setMdp(e.target.value)} onKeyDown={e => e.key==='Enter' && handleConnexion()} placeholder="••••••••"
              style={champStyle(role.couleur)}
              onFocus={e => e.target.style.border=`1.5px solid ${role.couleur}`}
              onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}
            />
          </div>

          {erreur && <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'10px', textAlign:'center' }}>⚠️ {erreur}</div>}

          <button className="btn-shimmer" onClick={handleConnexion} disabled={loading} style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none', cursor:loading?'not-allowed':'pointer', color:'#1B3A6B', fontWeight:'900', fontSize:'16px', marginTop:'8px', letterSpacing:'1px', opacity:loading?0.8:1, boxShadow:'0 4px 20px rgba(201,168,76,0.4)' }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                <span style={{ display:'inline-block', width:'16px', height:'16px', border:'2.5px solid #1B3A6B', borderTopColor:'transparent', borderRadius:'50%', animation:'rotateSlow 0.8s linear infinite' }}/>
                Connexion en cours...
              </span>
            ) : `Se connecter · ${role.label}`}
          </button>

          {role.id === 'directeur' && (
            <p onClick={() => setMode('reset')} style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'12px', marginTop:'16px', cursor:'pointer', textDecoration:'underline' }}>
              Mot de passe oublié ?
            </p>
          )}

          {role.id !== 'directeur' && (
            <p onClick={() => { setShowOublie(true); setErreur('') }} style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'12px', marginTop:'16px', cursor:'pointer', textDecoration:'underline' }}>
              Mot de passe oublié ?
            </p>
          )}
        </div>
      )}

      {etape === 2 && role && showOublie && (
        <div className="fade-up" style={{ zIndex:1, width:'100%', maxWidth:'400px', padding:'0 20px', marginTop:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
            <button onClick={() => { setShowOublie(false); setErreur(''); setUserTrouve(null); setMdpReset(false) }} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>‹ Retour</button>
            <span style={{ color:'#C9A84C', fontWeight:'700', fontSize:'15px' }}>Mot de passe oublié</span>
          </div>
          {!userTrouve && (
            <>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>VOTRE NOM (tel qu'enregistré)</label>
                <input value={nomOublie} onChange={e => setNomOublie(e.target.value)} placeholder="Ex. Jean Dupont" style={champStyle(role.couleur)} onFocus={e => e.target.style.border=`1.5px solid ${role.couleur}`} onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}/>
              </div>
              {erreur && <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'10px', textAlign:'center' }}>⚠️ {erreur}</div>}
              <button onClick={handleChercherUser} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:role.couleur, color:'#1B3A6B', fontWeight:'800', fontSize:'14px' }}>Rechercher mon compte</button>
            </>
          )}
          {userTrouve && !mdpReset && (
            <>
              <div style={{ background:'rgba(46,204,113,0.1)', border:'1px solid rgba(46,204,113,0.3)', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', fontSize:'12px', color:'#2ECC71' }}>✅ Compte trouvé : <strong>{userTrouve.nom}</strong></div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>QUESTION SECRÈTE : {userTrouve.questionSecrete || 'Quel est le nom de votre animal ?'}</label>
                <input value={reponse} onChange={e => setReponse(e.target.value)} placeholder="Votre réponse..." style={champStyle(role.couleur)} onFocus={e => e.target.style.border=`1.5px solid ${role.couleur}`} onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}/>
              </div>
              {erreur && <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'10px', textAlign:'center' }}>⚠️ {erreur}</div>}
              <button onClick={handleVerifierReponse} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:role.couleur, color:'#1B3A6B', fontWeight:'800', fontSize:'14px' }}>Vérifier</button>
            </>
          )}
          {userTrouve && mdpReset && (
            <>
              <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', fontSize:'12px', color:'#C9A84C' }}>✅ Réponse correcte ! Choisissez un nouveau mot de passe.</div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', letterSpacing:'1px' }}>NOUVEAU MOT DE PASSE</label>
                <input type="password" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)} placeholder="Minimum 4 caractères" style={champStyle(role.couleur)} onFocus={e => e.target.style.border=`1.5px solid ${role.couleur}`} onBlur={e => e.target.style.border='1.5px solid rgba(255,255,255,0.15)'}/>
              </div>
              {erreur && <div style={{ color:'#FF6B6B', fontSize:'12px', marginBottom:'10px', textAlign:'center' }}>⚠️ {erreur}</div>}
              <button onClick={handleNouveauMdp} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'#2ECC71', color:'white', fontWeight:'800', fontSize:'14px' }}>✅ Enregistrer le nouveau mot de passe</button>
            </>
          )}
        </div>
      )}

      <Footer/>
    </div>
  )
}

function Footer() {
  return (
    <div style={{ zIndex:1, width:'100%', paddingTop:'32px', paddingBottom:'20px', textAlign:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'11px', letterSpacing:'1px', marginBottom:'10px' }}>Propulsé par</p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
        <div style={{ animation:'rotateSlow 8s linear infinite', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src="/logo-homslovision-blanc.png" alt="Homslovision" style={{ height:'28px', opacity:0.6 }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
          <div style={{ display:'none', width:'28px', height:'28px', borderRadius:'8px', background:'linear-gradient(135deg, #C9A84C, #F5D98A)', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'900', color:'#1B3A6B' }}>HV</div>
        </div>
        <span style={{ color:'rgba(201,168,76,0.6)', fontSize:'13px', fontWeight:'700', letterSpacing:'2px' }}>HOMSLOVISION</span>
      </div>
      <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'10px', marginTop:'6px', letterSpacing:'1px' }}>Le futur maintenant · v1.0</p>
    </div>
  )
}
