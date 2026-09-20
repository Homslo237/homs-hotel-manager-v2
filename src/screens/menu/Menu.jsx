import { useState } from 'react'
import {
  User, Hotel, Users, Wrench, BarChart2, BookOpen,
  Info, LogOut, ChevronRight, X, Settings,
  AlertTriangle, Plus, Trash2, Save, Lock
} from 'lucide-react'

import EcranStatistiques from './EcranStatistiques'
import EcranIdentite     from './EcranIdentite'
import EcranUtilisateurs from './EcranUtilisateurs'
import EcranProfil       from './EcranProfil'

const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

const identiteDefaut = { nom:'', slogan:'', adresse:'', telephone1:'', telephone2:'', email:'', rccm:'', contribuable:'', mentionLegale:'', logoUrl:null }

const ROLES_LABELS = {
  directeur:      { label:'Directeur',      couleur:'#C9A84C', emoji:'👔' },
  receptionniste: { label:'Réceptionniste', couleur:'#2ECC71', emoji:'🛎️' },
  caissier:       { label:'Caissier',       couleur:'#E8634A', emoji:'💰' },
}

const paramsDefaut = {
  nomHotel: 'HOMS-HÔTEL', toleranceMinutes: 20,
  vacations: [
    { id:1, nom:'Matin',       debut:'06:00', fin:'14:00' },
    { id:2, nom:'Après-midi',  debut:'14:00', fin:'22:00' },
    { id:3, nom:'Nuit',        debut:'22:00', fin:'06:00' },
  ],
  categories: [
    { id:1, nom:'Standard', debut:100, nombre:20, tarifNuit:25000, tarifHeure:2500 },
    { id:2, nom:'Confort',  debut:200, nombre:20, tarifNuit:35000, tarifHeure:3500 },
    { id:3, nom:'Suite',    debut:300, nombre:10, tarifNuit:65000, tarifHeure:6500 },
  ]
}

function lireProfil(userId) {
  try { const s=localStorage.getItem(`homs_profil_${userId}`); return s?JSON.parse(s):null } catch { return null }
}

function BanniereAccesReserve() {
  return (
    <div style={{ background:'#FFF8E1', border:'1px solid #C9A84C', borderRadius:'14px', padding:'20px', marginBottom:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center' }}>
      <Lock size={32} color="#C9A84C"/>
      <div style={{ fontWeight:'800', fontSize:'15px', color:'#1B3A6B' }}>Accès réservé au Directeur</div>
      <div style={{ fontSize:'13px', color:'#888' }}>Ces options sont disponibles uniquement pour le compte Directeur.</div>
    </div>
  )
}

function EcranDirecteur({ onClose }) {
  const [params, setParams] = useState(paramsDefaut)
  const [sauvegarde, setSauvegarde] = useState(false)
  const handleSauvegarder = () => { setSauvegarde(true); setTimeout(()=>setSauvegarde(false),2000) }
  const ajouterVacation = () => setParams({...params,vacations:[...params.vacations,{id:Date.now(),nom:'Nouvelle vacation',debut:'00:00',fin:'08:00'}]})
  const supprimerVacation = (id) => setParams({...params,vacations:params.vacations.filter(v=>v.id!==id)})
  const modifierVacation = (id,champ,valeur) => setParams({...params,vacations:params.vacations.map(v=>v.id===id?{...v,[champ]:valeur}:v)})

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Paramètres Directeur</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>Configuration de l'établissement</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🏨 ÉTABLISSEMENT</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom:'14px' }}>
              <label style={labelStyle}>Nom de l'hôtel</label>
              <input value={params.nomHotel} onChange={e=>setParams({...params,nomHotel:e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Nombre total de chambres</label>
              <input value={params.totalChambres} type="number" onChange={e=>setParams({...params,totalChambres:Number(e.target.value)})} style={inputStyle}/>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>⏱️ TOLÉRANCE DÉPASSEMENT</div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <label style={labelStyle}>Durée de grâce après l'heure de départ prévue</label>
            <p style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>En dessous → pas de supplément. Au-dessus → supplément calculé.</p>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <input value={params.toleranceMinutes} type="number" min="0" max="120" onChange={e=>setParams({...params,toleranceMinutes:Number(e.target.value)})} style={{ ...inputStyle, width:'100px', fontSize:'22px', fontWeight:'800', textAlign:'center' }}/>
              <span style={{ fontSize:'16px', fontWeight:'700', color:'#1B3A6B' }}>minutes</span>
            </div>
            <div style={{ marginTop:'10px', background:'#FFF8E1', borderRadius:'8px', padding:'10px 12px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
              <AlertTriangle size={14} color="#C9A84C" style={{ marginTop:'1px', flexShrink:0 }}/>
              <span style={{ fontSize:'12px', color:'#666' }}>Actuellement : <strong>{params.toleranceMinutes} minutes</strong> de grâce.</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🔄 VACATIONS</div>
          {params.vacations.map((v,i)=>(
            <div key={v.id} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #1B3A6B' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>Vacation {i+1}</span>
                {params.vacations.length>1&&<button onClick={()=>supprimerVacation(v.id)} style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer' }}><Trash2 size={14} color="#E74C3C"/></button>}
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={labelStyle}>Nom</label>
                <input value={v.nom} onChange={e=>modifierVacation(v.id,'nom',e.target.value)} style={inputStyle}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={labelStyle}>Début</label><input type="time" value={v.debut} onChange={e=>modifierVacation(v.id,'debut',e.target.value)} style={inputStyle}/></div>
                <div><label style={labelStyle}>Fin</label><input type="time" value={v.fin} onChange={e=>modifierVacation(v.id,'fin',e.target.value)} style={inputStyle}/></div>
              </div>
            </div>
          ))}
          <button onClick={ajouterVacation} style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #1B3A6B', background:'transparent', color:'#1B3A6B', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter une vacation
          </button>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>🛏️ CHAMBRES</div>
          {params.categories.map((cat,i)=>(
            <div key={cat.id} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #C9A84C' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>Catégorie {i+1}</span>
                {params.categories.length>1&&<button onClick={()=>setParams({...params,categories:params.categories.filter(c=>c.id!==cat.id)})} style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer' }}><Trash2 size={14} color="#E74C3C"/></button>}
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={labelStyle}>Nom</label>
                <input value={cat.nom} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,nom:e.target.value}:c)})} style={inputStyle}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                <div><label style={labelStyle}>N° début</label><input type="number" value={cat.debut} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,debut:Number(e.target.value)}:c)})} style={inputStyle}/></div>
                <div><label style={labelStyle}>Nb chambres</label><input type="number" value={cat.nombre} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,nombre:Number(e.target.value)}:c)})} style={inputStyle}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={labelStyle}>Tarif / nuit</label><input type="number" value={cat.tarifNuit} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,tarifNuit:Number(e.target.value)}:c)})} style={inputStyle}/></div>
                <div><label style={labelStyle}>Tarif / heure</label><input type="number" value={cat.tarifHeure} onChange={e=>setParams({...params,categories:params.categories.map(c=>c.id===cat.id?{...c,tarifHeure:Number(e.target.value)}:c)})} style={inputStyle}/></div>
              </div>
              <div style={{ marginTop:'8px', background:'#F0F4FF', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#1B3A6B', fontWeight:'600' }}>
                📊 {cat.nombre} chambres · du {cat.debut+1} au {cat.debut+cat.nombre}
              </div>
            </div>
          ))}
          <button onClick={()=>setParams({...params,categories:[...params.categories,{id:Date.now(),nom:'Nouvelle catégorie',debut:400,nombre:5,tarifNuit:50000,tarifHeure:5000}]})} style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #C9A84C', background:'transparent', color:'#C9A84C', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter une catégorie
          </button>
          <div style={{ marginTop:'10px', background:'#EEF2FF', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#1B3A6B', fontWeight:'700' }}>
            🏨 Total : {params.categories.reduce((s,c)=>s+c.nombre,0)} chambres configurées
          </div>
        </div>
        <button onClick={handleSauvegarder} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer', background:sauvegarde?'#2ECC71':'#1B3A6B', color:'white', fontWeight:'800', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.3s' }}>
          <Save size={18}/>{sauvegarde?'✅ Paramètres sauvegardés !':'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}

const menuItemsDirecteur = [
  {
    section: 'Directeur / Gérant',
    items: [
      { icone:Settings,  label:'Paramètres directeur',        sous:'Vacations, tolérance, établissement',    couleur:'#C9A84C', action:'directeur' },
      { icone:()=><span style={{fontSize:'18px'}}>🏨</span>, label:"Identité de l'établissement", sous:'Logo, en-tête, contacts, infos légales', couleur:'#2C5282', action:'identite' },
      { icone:Users,     label:'Utilisateurs & rôles',        sous:'Gérer le personnel et les accès',        couleur:'#1B3A6B', action:'utilisateurs' },
      { icone:BarChart2, label:'Rapports & statistiques',     sous:'KPI, graphiques, top clients',           couleur:'#2ECC71', action:'statistiques' },
    ]
  },
  {
    section: 'Mon compte',
    items: [
      { icone:User,  label:'Mon profil',        sous:'Photo, nom, téléphone, mot de passe', couleur:'#1B3A6B', action:'profil' },
      { icone:Hotel, label:'Mon établissement', sous:'Nom, adresse, contacts',              couleur:'#2C5282', action:null },
    ]
  },
  {
    section: 'Opérations',
    items: [
      { icone:Wrench,   label:'Maintenance',            sous:'Signalements et réparations', couleur:'#E74C3C', action:null },
      { icone:BookOpen, label:'Journal des opérations', sous:'Historique des activités',    couleur:'#1B3A6B', action:null },
    ]
  },
  {
    section: 'À propos',
    items: [
      { icone:Info, label:'À propos de HOMS', sous:'Version 1.0 — Homslovision', couleur:'#E8634A', action:null },
    ]
  },
]

export default function Menu({ onDeconnexion, onReinitialiser, historique=[], utilisateur }) {
  const [ecranActif, setEcranActif] = useState(null)
  const [identite, setIdentite] = useState(() => {
    try { const s=localStorage.getItem('homs_identite'); return s?JSON.parse(s):identiteDefaut } catch { return identiteDefaut }
  })

  const userId = utilisateur?.nom || 'directeur'
  const [profilUtilisateur, setProfilUtilisateur] = useState(()=>lireProfil(userId))

  const estDirecteur = utilisateur?.role === 'directeur'
  const roleInfo = ROLES_LABELS[utilisateur?.role] || ROLES_LABELS.receptionniste
  const nomAffiche = profilUtilisateur?.nom || utilisateur?.nom || 'Utilisateur'
  const photoAffichee = profilUtilisateur?.photoUrl || null
  const premiereLettre = nomAffiche ? nomAffiche.charAt(0).toUpperCase() : 'H'

  return (
    <>
      <div style={{ background:'#F5F7FA', minHeight:'100vh', paddingBottom:'80px' }}>
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'32px 20px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          {photoAffichee ? (
            <img src={photoAffichee} alt="Photo" style={{ width:'72px', height:'72px', borderRadius:'36px', objectFit:'cover', marginBottom:'12px', border:'3px solid #C9A84C' }}/>
          ) : identite.logoUrl && estDirecteur ? (
            <img src={identite.logoUrl} alt="Logo" style={{ width:'72px', height:'72px', borderRadius:'36px', objectFit:'cover', marginBottom:'12px', border:'3px solid #C9A84C' }}/>
          ) : (
            <div style={{ width:'72px', height:'72px', borderRadius:'36px', background:roleInfo.couleur, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', fontSize:'28px', fontWeight:'700', color:'white' }}>
              {premiereLettre}
            </div>
          )}
          <div style={{ color:'white', fontWeight:'700', fontSize:'18px' }}>{nomAffiche}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', marginTop:'4px' }}>
            {estDirecteur?(identite.nom||'HOMS-HÔTEL'):roleInfo.label}
          </div>
          {identite.adresse&&estDirecteur&&<div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', marginTop:'4px' }}>📍 {identite.adresse}</div>}
          <div style={{ marginTop:'12px', background:`${roleInfo.couleur}33`, border:`1px solid ${roleInfo.couleur}`, borderRadius:'20px', padding:'4px 16px', fontSize:'12px', color:roleInfo.couleur }}>
            {roleInfo.emoji} {roleInfo.label}
          </div>
        </div>

        <div style={{ padding:'16px 20px' }}>
          {estDirecteur && menuItemsDirecteur.map((section,si) => (
            <div key={si} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'4px' }}>
                {section.section}
              </div>
              <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                {section.items.map((item,ii) => {
                  const Icone = item.icone
                  return (
                    <div key={ii} onClick={()=>item.action&&setEcranActif(item.action)}
                      style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px', borderBottom:ii<section.items.length-1?'1px solid #F0F0F0':'none', cursor:item.action?'pointer':'default', background:item.action?'white':'#FAFAFA' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:item.couleur+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icone size={20} color={item.couleur}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:'600', fontSize:'14px', color:item.action?'#1F2937':'#AAA' }}>{item.label}</div>
                        <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
                          {item.action?item.sous:item.sous+' — bientôt disponible'}
                        </div>
                      </div>
                      <ChevronRight size={16} color={item.action?'#D1D5DB':'#E0E0E0'}/>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {!estDirecteur && (
            <>
              <BanniereAccesReserve/>
              <div style={{ marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'4px' }}>Mon compte</div>
                <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div onClick={()=>setEcranActif('profil')} style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px', cursor:'pointer', borderBottom:'1px solid #F0F0F0' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#1B3A6B15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <User size={20} color="#1B3A6B"/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:'600', fontSize:'14px', color:'#1F2937' }}>Mon profil</div>
                      <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Photo, nom, téléphone, mot de passe</div>
                    </div>
                    <ChevronRight size={16} color="#D1D5DB"/>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#E8634A15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Info size={20} color="#E8634A"/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:'600', fontSize:'14px', color:'#1F2937' }}>À propos de HOMS</div>
                      <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Version 1.0 — Homslovision</div>
                    </div>
                    <ChevronRight size={16} color="#D1D5DB"/>
                  </div>
                </div>
              </div>
            </>
          )}

          {estDirecteur && (
            <div onClick={()=>{ if(window.confirm('Effacer toutes les donnees de test ?')){ if(onReinitialiser) onReinitialiser() } }}
              style={{ background:'#FFFBEB', border:'1px dashed #C9A84C', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Trash2 size={20} color="#C9A84C"/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:'600', fontSize:'14px', color:'#C9A84C' }}>Reinitialiser les donnees</div>
                <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Outil de test - efface sejours et caisse</div>
              </div>
              <ChevronRight size={16} color="#D1D5DB"/>
            </div>
          )}

          <div onClick={onDeconnexion} style={{ background:'white', borderRadius:'16px', padding:'14px 16px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogOut size={20} color="#E74C3C"/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'600', fontSize:'14px', color:'#E74C3C' }}>Se déconnecter</div>
              <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Retour à l'écran de connexion</div>
            </div>
            <ChevronRight size={16} color="#D1D5DB"/>
          </div>

          <div style={{ textAlign:'center', paddingTop:'8px' }}>
            <img src="/logo-homslovision-blanc.png" alt="Homslovision" style={{ height:'32px', opacity:0.7 }} onError={e=>e.target.style.display='none'}/>
          </div>
        </div>
      </div>

      {ecranActif==='directeur'    && <EcranDirecteur      onClose={()=>setEcranActif(null)}/>}
      {ecranActif==='identite'     && <EcranIdentite       onClose={()=>setEcranActif(null)} onIdentiteChange={setIdentite}/>}
      {ecranActif==='utilisateurs' && <EcranUtilisateurs   onClose={()=>setEcranActif(null)}/>}
      {ecranActif==='statistiques' && <EcranStatistiques   onClose={()=>setEcranActif(null)} historique={historique}/>}
      {ecranActif==='profil'       && <EcranProfil         onClose={()=>setEcranActif(null)} utilisateur={utilisateur} onProfilChange={setProfilUtilisateur}/>}
    </>
  )
}
