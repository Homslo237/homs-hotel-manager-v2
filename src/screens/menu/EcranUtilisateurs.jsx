import { useState } from 'react'
import { X, Plus, Trash2, Eye, EyeOff, UserCheck, UserX, Clock } from 'lucide-react'

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

const ROLES_LABELS = {
  directeur:      { label:'Directeur',      couleur:'#C9A84C', emoji:'👔' },
  receptionniste: { label:'Réceptionniste', couleur:'#2ECC71', emoji:'🛎️' },
  caissier:       { label:'Caissier',       couleur:'#E8634A', emoji:'💰' },
}

const QUESTIONS_SECRETES = [
  'Quel est le nom de votre animal de compagnie ?',
  'Quel est le prénom de votre mère ?',
  'Dans quelle ville êtes-vous né(e) ?',
  'Quel est votre plat préféré ?',
  'Quel est le nom de votre école primaire ?',
]

function lireUtilisateurs() {
  try { const s=localStorage.getItem('homs_utilisateurs'); return s?JSON.parse(s):[] } catch { return [] }
}
function sauvegarderUtilisateurs(liste) {
  try { localStorage.setItem('homs_utilisateurs', JSON.stringify(liste)) } catch {}
}

export default function EcranUtilisateurs({ onClose }) {
  const [utilisateurs, setUtilisateurs] = useState(()=>lireUtilisateurs())
  const [showForm, setShowForm] = useState(false)
  const [showMdp, setShowMdp] = useState({})
  const [form, setForm] = useState({ nom:'', role:'receptionniste', motDePasse:'', questionSecrete:QUESTIONS_SECRETES[0], reponseSecrete:'' })
  const [sauvegarde, setSauvegarde] = useState(false)

  const sauver = (liste) => { setUtilisateurs(liste); sauvegarderUtilisateurs(liste) }

  const handleAjouter = () => {
    if (!form.nom.trim()||!form.motDePasse.trim()||!form.reponseSecrete.trim()) { alert('Remplissez tous les champs.'); return }
    if (form.motDePasse.length<4) { alert('Minimum 4 caractères.'); return }
    sauver([...utilisateurs, {
      id:Date.now(), nom:form.nom.trim(), role:form.role,
      motDePasse:form.motDePasse, questionSecrete:form.questionSecrete,
      reponseSecrete:form.reponseSecrete.trim(), actif:true,
      derniereConnexion:null, dateCreation:new Date().toLocaleDateString('fr-FR')
    }])
    setForm({ nom:'', role:'receptionniste', motDePasse:'', questionSecrete:QUESTIONS_SECRETES[0], reponseSecrete:'' })
    setShowForm(false); setSauvegarde(true); setTimeout(()=>setSauvegarde(false),2000)
  }

  const toggleActif = (id) => sauver(utilisateurs.map(u=>u.id===id?{...u,actif:!u.actif}:u))
  const supprimer = (id) => { if(!window.confirm('Supprimer ?')) return; sauver(utilisateurs.filter(u=>u.id!==id)) }
  const roleInfo = (role) => ROLES_LABELS[role]||{ label:role, couleur:'#999', emoji:'👤' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Utilisateurs & Rôles</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>{utilisateurs.length} compte{utilisateurs.length>1?'s':''}</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ background:'#FFFBF0', border:'1px solid #C9A84C', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <span style={{ fontSize:'20px' }}>👔</span>
            <span style={{ fontWeight:'800', fontSize:'14px', color:'#1B3A6B' }}>Directeur</span>
            <span style={{ background:'#C9A84C', color:'white', fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px' }}>Par défaut</span>
          </div>
          <div style={{ fontSize:'12px', color:'#888' }}>Mot de passe : <strong>admin1234</strong> · Toujours actif</div>
          <div style={{ fontSize:'11px', color:'#C9A84C', marginTop:'4px', fontWeight:'600' }}>⚠️ À changer avant la mise en production</div>
        </div>

        {utilisateurs.length===0&&!showForm&&(
          <div style={{ textAlign:'center', padding:'30px 20px', color:'#999' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>👥</div>
            <p style={{ fontSize:'13px' }}>Aucun compte créé</p>
          </div>
        )}

        {utilisateurs.map(u=>{
          const ri=roleInfo(u.role)
          return (
            <div key={u.id} style={{ background:u.actif?'white':'#F9F9F9', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:`4px solid ${u.actif?ri.couleur:'#CCC'}`, opacity:u.actif?1:0.7 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'20px' }}>{ri.emoji}</span>
                  <div>
                    <div style={{ fontWeight:'800', fontSize:'14px', color:'#1B3A6B' }}>{u.nom}</div>
                    <span style={{ background:ri.couleur+'22', color:ri.couleur, fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'8px' }}>{ri.label}</span>
                  </div>
                </div>
                <span style={{ background:u.actif?'#E8F5E9':'#FFEBEE', color:u.actif?'#2ECC71':'#E74C3C', fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px' }}>
                  {u.actif?'✅ Actif':'🔴 Désactivé'}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <span style={{ fontSize:'12px', color:'#666' }}>🔑 {showMdp[u.id]?u.motDePasse:'••••••••'}</span>
                <button onClick={()=>setShowMdp(p=>({...p,[u.id]:!p[u.id]}))} style={{ background:'none', border:'none', cursor:'pointer', padding:'2px' }}>
                  {showMdp[u.id]?<EyeOff size={14} color="#999"/>:<Eye size={14} color="#999"/>}
                </button>
              </div>
              <div style={{ fontSize:'11px', color:'#999', marginBottom:'10px', display:'flex', alignItems:'center', gap:'4px' }}>
                <Clock size={11}/>{u.derniereConnexion?`Dernière connexion : ${u.derniereConnexion}`:'Jamais connecté'}
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>toggleActif(u.id)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'12px', background:u.actif?'#FFF0F0':'#E8F5E9', color:u.actif?'#E74C3C':'#2ECC71', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                  {u.actif?<><UserX size={13}/>Désactiver</>:<><UserCheck size={13}/>Activer</>}
                </button>
                <button onClick={()=>supprimer(u.id)} style={{ padding:'8px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#FFF0F0', color:'#E74C3C', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          )
        })}

        {showForm && (
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', border:'2px solid #1B3A6B' }}>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'#1B3A6B', marginBottom:'14px' }}>➕ Nouveau compte</div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Nom complet <span style={{color:'red'}}>*</span></label>
              <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Ex. Jean Dupont" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Rôle <span style={{color:'red'}}>*</span></label>
              <div style={{ display:'flex', gap:'8px' }}>
                {['receptionniste','caissier'].map(r=>{ const ri=roleInfo(r); return (
                  <button key={r} onClick={()=>setForm({...form,role:r})} style={{ flex:1, padding:'10px 6px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', cursor:'pointer', background:form.role===r?ri.couleur:'#F0F0F0', color:form.role===r?'white':'#555', border:form.role===r?`2px solid ${ri.couleur}`:'2px solid transparent' }}>
                    {ri.emoji} {ri.label}
                  </button>
                )})}
              </div>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Mot de passe <span style={{color:'red'}}>*</span></label>
              <input type="password" value={form.motDePasse} onChange={e=>setForm({...form,motDePasse:e.target.value})} placeholder="Minimum 4 caractères" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={labelStyle}>Question secrète <span style={{color:'red'}}>*</span></label>
              <select value={form.questionSecrete} onChange={e=>setForm({...form,questionSecrete:e.target.value})} style={{ ...inputStyle, background:'white' }}>
                {QUESTIONS_SECRETES.map(q=><option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Réponse secrète <span style={{color:'red'}}>*</span></label>
              <input value={form.reponseSecrete} onChange={e=>setForm({...form,reponseSecrete:e.target.value})} placeholder="Réponse à la question secrète" style={inputStyle}/>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', background:'#F0F0F0', fontWeight:'700', color:'#666', border:'none', cursor:'pointer' }}>Annuler</button>
              <button onClick={handleAjouter} style={{ flex:2, padding:'12px', borderRadius:'10px', background:'#1B3A6B', fontWeight:'700', color:'white', border:'none', cursor:'pointer' }}>✅ Créer le compte</button>
            </div>
          </div>
        )}

        {!showForm && (
          <button onClick={()=>setShowForm(true)} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'2px dashed #1B3A6B', background:'transparent', color:'#1B3A6B', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter un agent
          </button>
        )}

        {sauvegarde && (
          <div style={{ marginTop:'12px', background:'#E8F5E9', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#2ECC71', fontWeight:'700', textAlign:'center' }}>
            ✅ Compte créé avec succès !
          </div>
        )}
      </div>
    </div>
  )
}
