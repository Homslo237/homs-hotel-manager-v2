import { useState } from 'react'
import { X, Save, Eye, EyeOff, Camera } from 'lucide-react'

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

const ROLES_LABELS = {
  directeur:      { label:'Directeur',      couleur:'#C9A84C', emoji:'👔' },
  receptionniste: { label:'Réceptionniste', couleur:'#2ECC71', emoji:'🛎️' },
  caissier:       { label:'Caissier',       couleur:'#E8634A', emoji:'💰' },
}

function lireUtilisateurs() {
  try { const s=localStorage.getItem('homs_utilisateurs'); return s?JSON.parse(s):[] } catch { return [] }
}
function sauvegarderUtilisateurs(liste) {
  try { localStorage.setItem('homs_utilisateurs', JSON.stringify(liste)) } catch {}
}
function lireProfil(userId) {
  try { const s=localStorage.getItem(`homs_profil_${userId}`); return s?JSON.parse(s):null } catch { return null }
}
function sauvegarderProfil(userId, profil) {
  try { localStorage.setItem(`homs_profil_${userId}`, JSON.stringify(profil)) } catch {}
}

export default function EcranProfil({ onClose, utilisateur, onProfilChange }) {
  const userId = utilisateur?.nom || 'directeur'
  const profilSauvegarde = lireProfil(userId)
  const [profil, setProfil] = useState({
    nom: utilisateur?.nom || '',
    telephone: profilSauvegarde?.telephone || '',
    photoUrl: profilSauvegarde?.photoUrl || null,
  })
  const [ancienMdp, setAncienMdp] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmerMdp, setConfirmerMdp] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreurMdp, setErreurMdp] = useState('')
  const [successMdp, setSuccessMdp] = useState(false)

  const roleInfo = ROLES_LABELS[utilisateur?.role] || ROLES_LABELS.receptionniste

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size>2*1024*1024) { alert('Maximum 2 Mo.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setProfil(prev=>({...prev,photoUrl:ev.target.result}))
    reader.readAsDataURL(file)
  }

  const handleSauvegarder = () => {
    sauvegarderProfil(userId, profil)
    if (utilisateur?.role !== 'directeur') {
      sauvegarderUtilisateurs(lireUtilisateurs().map(u=>u.nom===utilisateur?.nom?{...u,nom:profil.nom}:u))
    }
    setSauvegarde(true)
    setTimeout(()=>setSauvegarde(false),2000)
    if (onProfilChange) onProfilChange(profil)
  }

  const handleChangerMdp = () => {
    setErreurMdp('')
    if (!ancienMdp||!nouveauMdp||!confirmerMdp) { setErreurMdp('Remplissez tous les champs.'); return }
    if (nouveauMdp!==confirmerMdp) { setErreurMdp('Les mots de passe ne correspondent pas.'); return }
    if (nouveauMdp.length<4) { setErreurMdp('Minimum 4 caractères.'); return }
    if (utilisateur?.role==='directeur') {
      if (ancienMdp!=='admin1234') { setErreurMdp('Ancien mot de passe incorrect.'); return }
    } else {
      const u = lireUtilisateurs().find(u=>u.nom===utilisateur?.nom)
      if (!u||u.motDePasse!==ancienMdp) { setErreurMdp('Ancien mot de passe incorrect.'); return }
      sauvegarderUtilisateurs(lireUtilisateurs().map(u2=>u2.nom===utilisateur?.nom?{...u2,motDePasse:nouveauMdp}:u2))
    }
    setSuccessMdp(true)
    setTimeout(()=>setSuccessMdp(false),2000)
    setAncienMdp(''); setNouveauMdp(''); setConfirmerMdp('')
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Mon profil</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Informations personnelles</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ marginBottom:'20px', textAlign:'center' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            {profil.photoUrl ? (
              <img src={profil.photoUrl} alt="Photo" style={{ width:'90px', height:'90px', borderRadius:'45px', objectFit:'cover', border:'3px solid #C9A84C' }}/>
            ) : (
              <div style={{ width:'90px', height:'90px', borderRadius:'45px', background:'linear-gradient(135deg, #1B3A6B, #2C5282)', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #C9A84C' }}>
                <span style={{ fontSize:'32px', fontWeight:'800', color:'white' }}>{profil.nom?profil.nom.charAt(0).toUpperCase():roleInfo.emoji}</span>
              </div>
            )}
            <label style={{ position:'absolute', bottom:0, right:0, background:'#C9A84C', borderRadius:'50%', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid white' }}>
              <Camera size={14} color="white"/>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
            </label>
          </div>
          <div style={{ marginTop:'10px', fontWeight:'700', fontSize:'16px', color:'#1B3A6B' }}>{profil.nom}</div>
          <div style={{ fontSize:'12px', color:roleInfo.couleur, fontWeight:'600' }}>{roleInfo.emoji} {roleInfo.label}</div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>👤 INFORMATIONS</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input value={profil.nom} onChange={e=>setProfil({...profil,nom:e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input type="tel" value={profil.telephone} onChange={e=>setProfil({...profil,telephone:e.target.value})} placeholder="+237 6XX XXX XX" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Rôle</label>
              <div style={{ padding:'11px 14px', background:'#F5F5F5', borderRadius:'10px', fontSize:'14px', color:'#888', border:'2px solid #E0E0E0' }}>
                {roleInfo.emoji} {roleInfo.label} — non modifiable
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSauvegarder} style={{
          width:'100%', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:sauvegarde?'#2ECC71':'#1B3A6B', color:'white', fontWeight:'800', fontSize:'14px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.3s', marginBottom:'24px'
        }}>
          <Save size={16}/>{sauvegarde?'✅ Profil mis à jour !':'Enregistrer les informations'}
        </button>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🔑 MOT DE PASSE</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label style={labelStyle}>Ancien mot de passe</label>
              <div style={{ position:'relative' }}>
                <input type={voirMdp?'text':'password'} value={ancienMdp} onChange={e=>setAncienMdp(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight:'44px' }}/>
                <button onClick={()=>setVoirMdp(!voirMdp)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' }}>
                  {voirMdp?<EyeOff size={16} color="#999"/>:<Eye size={16} color="#999"/>}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input type={voirMdp?'text':'password'} value={nouveauMdp} onChange={e=>setNouveauMdp(e.target.value)} placeholder="Minimum 4 caractères" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Confirmer</label>
              <input type={voirMdp?'text':'password'} value={confirmerMdp} onChange={e=>setConfirmerMdp(e.target.value)} placeholder="Répétez le mot de passe" style={inputStyle}/>
            </div>
            {erreurMdp && <div style={{ background:'#FFF0F0', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#E74C3C', fontWeight:'600' }}>⚠️ {erreurMdp}</div>}
            {successMdp && <div style={{ background:'#E8F5E9', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#2ECC71', fontWeight:'600' }}>✅ Mot de passe mis à jour !</div>}
            <button onClick={handleChangerMdp} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#1B3A6B', color:'white', fontWeight:'700', fontSize:'14px' }}>
              🔑 Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
