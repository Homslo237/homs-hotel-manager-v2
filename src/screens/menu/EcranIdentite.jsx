import { useState } from 'react'
import { X, Save, Upload } from 'lucide-react'

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

const identiteDefaut = {
  nom:'', slogan:'', adresse:'',
  telephone1:'', telephone2:'', email:'',
  rccm:'', contribuable:'', mentionLegale:'',
  logoUrl: null,
}

export default function EcranIdentite({ onClose, onIdentiteChange }) {
  const [identite, setIdentite] = useState(() => {
    try { const s=localStorage.getItem('homs_identite'); return s?JSON.parse(s):identiteDefaut } catch { return identiteDefaut }
  })
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size>2*1024*1024) { alert('Maximum 2 Mo.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setIdentite(prev=>({...prev,logoUrl:ev.target.result}))
    reader.readAsDataURL(file)
  }

  const handleSauvegarder = () => {
    try {
      localStorage.setItem('homs_identite', JSON.stringify(identite))
      setSauvegarde(true)
      setTimeout(()=>setSauvegarde(false),2000)
      if (onIdentiteChange) onIdentiteChange(identite)
    } catch { alert('Erreur lors de la sauvegarde.') }
  }

  const champ = (label,cle,placeholder,type='text') => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={identite[cle]} placeholder={placeholder} onChange={e=>setIdentite({...identite,[cle]:e.target.value})} style={inputStyle}/>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Identité de l'établissement</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Logo, en-tête, contacts, infos légales</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🖼️ LOGO</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            {identite.logoUrl ? (
              <div style={{ textAlign:'center' }}>
                <img src={identite.logoUrl} alt="Logo" style={{ maxHeight:'100px', maxWidth:'100%', borderRadius:'8px', marginBottom:'10px' }}/>
                <br/>
                <label style={{ cursor:'pointer', color:'#1B3A6B', fontWeight:'700', fontSize:'13px', textDecoration:'underline' }}>
                  Changer le logo<input type="file" accept="image/*" onChange={handleLogo} style={{ display:'none' }}/>
                </label>
              </div>
            ) : (
              <label style={{ cursor:'pointer', display:'block' }}>
                <div style={{ border:'2px dashed #C9A84C', borderRadius:'10px', padding:'24px', textAlign:'center', background:'#FFFDF5' }}>
                  <Upload size={28} color="#C9A84C"/>
                  <div style={{ fontSize:'13px', color:'#888', marginTop:'8px', fontWeight:'600' }}>Appuyer pour choisir un logo</div>
                  <div style={{ fontSize:'11px', color:'#BBB', marginTop:'4px' }}>PNG ou JPG · max 2 Mo</div>
                </div>
                <input type="file" accept="image/*" onChange={handleLogo} style={{ display:'none' }}/>
              </label>
            )}
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🏨 EN-TÊTE DES REÇUS</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            {champ("Nom de l'établissement",'nom','Ex. HOMS-HÔTEL')}
            {champ('Slogan / devise','slogan','Ex. Votre confort, notre priorité')}
            {champ('Adresse complète','adresse','Rue, quartier, ville...')}
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>📞 CONTACTS</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={labelStyle}>Téléphone 1</label>
                <input type="tel" value={identite.telephone1} placeholder="+237 6XX XXX XX" onChange={e=>setIdentite({...identite,telephone1:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Téléphone 2</label>
                <input type="tel" value={identite.telephone2} placeholder="Optionnel" onChange={e=>setIdentite({...identite,telephone2:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            {champ('Email','email','hotel@exemple.com','email')}
          </div>
        </div>
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>📄 INFOS LÉGALES</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={labelStyle}>N° RCCM</label>
                <input value={identite.rccm} placeholder="Optionnel" onChange={e=>setIdentite({...identite,rccm:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>N° Contribuable</label>
                <input value={identite.contribuable} placeholder="Optionnel" onChange={e=>setIdentite({...identite,contribuable:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Mention sur les reçus</label>
              <textarea value={identite.mentionLegale} placeholder="Ex. Merci de votre confiance." onChange={e=>setIdentite({...identite,mentionLegale:e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical', fontFamily:'inherit' }}/>
            </div>
          </div>
        </div>
        <button onClick={handleSauvegarder} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background:sauvegarde?'#2ECC71':'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.3s'
        }}>
          <Save size={18}/>{sauvegarde?'✅ Informations enregistrées !':'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
