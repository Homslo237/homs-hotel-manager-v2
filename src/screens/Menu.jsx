import { useState } from 'react'
import {
  User, Hotel, Users, Wrench, BarChart2, BookOpen,
  Info, LogOut, ChevronRight, X, Settings, Clock,
  AlertTriangle, Plus, Trash2, Save
} from 'lucide-react'

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = { display:'block', fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'6px' }
const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E0E0E0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }

// ─── Paramètres par défaut du Directeur ──────────────────────────────────────
const paramsDefaut = {
  nomHotel: 'HOMS-HÔTEL',
  toleranceMinutes: 20,
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

// ─── Sous-écran : Paramètres Directeur ───────────────────────────────────────
function EcranDirecteur({ onClose }) {
  const [params, setParams] = useState(paramsDefaut)
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleSauvegarder = () => {
    // En Phase 2 : sauvegarder dans Firebase
    setSauvegarde(true)
    setTimeout(() => setSauvegarde(false), 2000)
  }

  const ajouterVacation = () => {
    const newId = Date.now()
    setParams({
      ...params,
      vacations: [...params.vacations, { id:newId, nom:'Nouvelle vacation', debut:'00:00', fin:'08:00' }]
    })
  }

  const supprimerVacation = (id) => {
    setParams({ ...params, vacations: params.vacations.filter(v => v.id !== id) })
  }

  const modifierVacation = (id, champ, valeur) => {
    setParams({
      ...params,
      vacations: params.vacations.map(v => v.id === id ? { ...v, [champ]: valeur } : v)
    })
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'white', overflowY:'auto', paddingBottom:'40px' }}>
      {/* Header */}
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

        {/* ── Section : Établissement ── */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>
            🏨 ÉTABLISSEMENT
          </div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom:'14px' }}>
              <label style={labelStyle}>Nom de l'hôtel</label>
              <input value={params.nomHotel}
                onChange={e => setParams({...params, nomHotel:e.target.value})}
                style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Nombre total de chambres</label>
              <input value={params.totalChambres} type="number"
                onChange={e => setParams({...params, totalChambres:Number(e.target.value)})}
                style={inputStyle}/>
            </div>
          </div>
        </div>

        {/* ── Section : Tolérance dépassement ── */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>
            ⏱️ TOLÉRANCE DÉPASSEMENT
          </div>
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <label style={labelStyle}>
              Durée de grâce après l'heure de départ prévue
            </label>
            <p style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>
              En dessous de ce seuil → pas de supplément. Au-dessus → supplément calculé automatiquement sur le reçu de sortie.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <input value={params.toleranceMinutes} type="number" min="0" max="120"
                onChange={e => setParams({...params, toleranceMinutes:Number(e.target.value)})}
                style={{ ...inputStyle, width:'100px', fontSize:'22px', fontWeight:'800', textAlign:'center' }}/>
              <span style={{ fontSize:'16px', fontWeight:'700', color:'#1B3A6B' }}>minutes</span>
            </div>
            <div style={{ marginTop:'10px', background:'#FFF8E1', borderRadius:'8px', padding:'10px 12px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
              <AlertTriangle size={14} color="#C9A84C" style={{ marginTop:'1px', flexShrink:0 }}/>
              <span style={{ fontSize:'12px', color:'#666' }}>
                Actuellement : <strong>{params.toleranceMinutes} minutes</strong> de grâce accordées à chaque client avant facturation du dépassement.
              </span>
            </div>
          </div>
        </div>

        {/* ── Section : Vacations ── */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>
            🔄 VACATIONS (ÉQUIPES)
          </div>
          <p style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>
            Définissez les tranches horaires de vos équipes. Elles apparaîtront dans la passation de service.
          </p>

          {params.vacations.map((v, i) => (
            <div key={v.id} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #1B3A6B' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>Vacation {i+1}</span>
                {params.vacations.length > 1 && (
                  <button onClick={() => supprimerVacation(v.id)}
                    style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer' }}>
                    <Trash2 size={14} color="#E74C3C"/>
                  </button>
                )}
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={labelStyle}>Nom de la vacation</label>
                <input value={v.nom}
                  onChange={e => modifierVacation(v.id, 'nom', e.target.value)}
                  placeholder="Ex. Matin, Soir, Équipe A..."
                  style={inputStyle}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={labelStyle}>Heure de début</label>
                  <input type="time" value={v.debut}
                    onChange={e => modifierVacation(v.id, 'debut', e.target.value)}
                    style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Heure de fin</label>
                  <input type="time" value={v.fin}
                    onChange={e => modifierVacation(v.id, 'fin', e.target.value)}
                    style={inputStyle}/>
                </div>
              </div>
            </div>
          ))}

          <button onClick={ajouterVacation} style={{
            width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #1B3A6B',
            background:'transparent', color:'#1B3A6B', fontWeight:'700', fontSize:'14px',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
          }}>
            <Plus size={16}/> Ajouter une vacation
          </button>
        </div>

        {/* ── Section : Configuration des chambres ── */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>
            🛏️ CONFIGURATION DES CHAMBRES
          </div>
          <p style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>
            Définissez vos catégories de chambres, leur numérotation et leurs tarifs.
          </p>
          {params.categories.map((cat, i) => (
            <div key={cat.id} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid #C9A84C' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>Catégorie {i+1}</span>
                {params.categories.length > 1 && (
                  <button onClick={() => setParams({...params, categories: params.categories.filter(c=>c.id!==cat.id)})}
                    style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer' }}>
                    <Trash2 size={14} color="#E74C3C"/>
                  </button>
                )}
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={labelStyle}>Nom de la catégorie</label>
                <input value={cat.nom}
                  onChange={e => setParams({...params, categories: params.categories.map(c=>c.id===cat.id?{...c,nom:e.target.value}:c)})}
                  placeholder="Ex. Standard, Confort, Suite..." style={inputStyle}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                <div>
                  <label style={labelStyle}>N° de début</label>
                  <input type="number" value={cat.debut}
                    onChange={e => setParams({...params, categories: params.categories.map(c=>c.id===cat.id?{...c,debut:Number(e.target.value)}:c)})}
                    style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Nb de chambres</label>
                  <input type="number" value={cat.nombre}
                    onChange={e => setParams({...params, categories: params.categories.map(c=>c.id===cat.id?{...c,nombre:Number(e.target.value)}:c)})}
                    style={inputStyle}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={labelStyle}>Tarif / nuit (FCFA)</label>
                  <input type="number" value={cat.tarifNuit}
                    onChange={e => setParams({...params, categories: params.categories.map(c=>c.id===cat.id?{...c,tarifNuit:Number(e.target.value)}:c)})}
                    style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Tarif / heure (FCFA)</label>
                  <input type="number" value={cat.tarifHeure}
                    onChange={e => setParams({...params, categories: params.categories.map(c=>c.id===cat.id?{...c,tarifHeure:Number(e.target.value)}:c)})}
                    style={inputStyle}/>
                </div>
              </div>
              <div style={{ marginTop:'8px', background:'#F0F4FF', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#1B3A6B', fontWeight:'600' }}>
                📊 {cat.nombre} chambres · du {cat.debut+1} au {cat.debut+cat.nombre}
              </div>
            </div>
          ))}
          <button onClick={() => setParams({...params, categories:[...params.categories, {id:Date.now(), nom:'Nouvelle catégorie', debut:400, nombre:5, tarifNuit:50000, tarifHeure:5000}]})}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #C9A84C', background:'transparent', color:'#C9A84C', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Plus size={16}/> Ajouter une catégorie
          </button>
          <div style={{ marginTop:'10px', background:'#EEF2FF', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#1B3A6B', fontWeight:'700' }}>
            🏨 Total : {params.categories.reduce((s,c)=>s+c.nombre,0)} chambres configurées
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <button onClick={handleSauvegarder} style={{
          width:'100%', padding:'16px', borderRadius:'12px', border:'none', cursor:'pointer',
          background: sauvegarde ? '#2ECC71' : '#1B3A6B',
          color:'white', fontWeight:'800', fontSize:'15px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          transition:'background 0.3s'
        }}>
          <Save size={18}/>
          {sauvegarde ? '✅ Paramètres sauvegardés !' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}

// ─── Menu principal ───────────────────────────────────────────────────────────
const menuItems = [
  {
    section: 'Directeur / Gérant',
    items: [
      { icone: Settings, label: 'Paramètres directeur', sous: 'Vacations, tolérance, établissement', couleur: '#C9A84C', action: 'directeur' },
      { icone: Users,    label: 'Utilisateurs & rôles',  sous: 'Gérer le personnel et les accès',    couleur: '#1B3A6B', action: null },
      { icone: BarChart2,label: 'Rapports & statistiques',sous: 'Chiffres d\'affaires, exports',     couleur: '#2ECC71', action: null },
    ]
  },
  {
    section: 'Mon compte',
    items: [
      { icone: User,  label: 'Mon profil',        sous: 'Informations personnelles',     couleur: '#1B3A6B', action: null },
      { icone: Hotel, label: 'Mon établissement', sous: 'Nom, adresse, contacts',        couleur: '#2C5282', action: null },
    ]
  },
  {
    section: 'Opérations',
    items: [
      { icone: Wrench,   label: 'Maintenance',           sous: 'Signalements et réparations',  couleur: '#E74C3C', action: null },
      { icone: BookOpen, label: 'Journal des opérations', sous: 'Historique des activités',     couleur: '#1B3A6B', action: null },
    ]
  },
  {
    section: 'À propos',
    items: [
      { icone: Info, label: 'À propos de HOMS', sous: 'Version 1.0 — Homslovision', couleur: '#E8634A', action: null },
    ]
  },
]

export default function Menu({ onDeconnexion, onReinitialiser }) {
  const [ecranActif, setEcranActif] = useState(null)

  return (
    <>
      <div style={{ background:'#F5F7FA', minHeight:'100vh', paddingBottom:'80px' }}>

        {/* Profil header */}
        <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'32px 20px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'36px', background:'#C9A84C', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', fontSize:'28px', fontWeight:'700', color:'white' }}>
            A
          </div>
          <div style={{ color:'white', fontWeight:'700', fontSize:'18px' }}>Administrateur</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', marginTop:'4px' }}>Hôtel HOMS · Gérant</div>
          <div style={{ marginTop:'12px', background:'rgba(201,168,76,0.2)', border:'1px solid #C9A84C', borderRadius:'20px', padding:'4px 16px', fontSize:'12px', color:'#C9A84C' }}>
            ✓ Accès administrateur
          </div>
        </div>

        <div style={{ padding:'16px 20px' }}>

          {menuItems.map((section, si) => (
            <div key={si} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'4px' }}>
                {section.section}
              </div>
              <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                {section.items.map((item, ii) => {
                  const Icone = item.icone
                  return (
                    <div key={ii}
                      onClick={() => item.action && setEcranActif(item.action)}
                      style={{
                        display:'flex', alignItems:'center', padding:'14px 16px', gap:'14px',
                        borderBottom: ii < section.items.length-1 ? '1px solid #F0F0F0' : 'none',
                        cursor: item.action ? 'pointer' : 'default',
                        background: item.action ? 'white' : '#FAFAFA',
                      }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:item.couleur+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icone size={20} color={item.couleur}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:'600', fontSize:'14px', color: item.action ? '#1F2937' : '#AAA' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
                          {item.action ? item.sous : item.sous + ' — bientôt disponible'}
                        </div>
                      </div>
                      <ChevronRight size={16} color={item.action ? '#D1D5DB' : '#E0E0E0'}/>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Reinitialiser les donnees - outil de test, a retirer avant commercialisation */}
          <div
            onClick={() => {
              if (window.confirm('Effacer toutes les donnees de test (sejours, caisse) et repartir sur les donnees de demonstration ? Cette action est irreversible.')) {
                if (onReinitialiser) onReinitialiser()
              }
            }}
            style={{ background:'#FFFBEB', border:'1px dashed #C9A84C', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer' }}
          >
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Trash2 size={20} color="#C9A84C"/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'600', fontSize:'14px', color:'#C9A84C' }}>Reinitialiser les donnees</div>
              <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Outil de test - efface sejours et caisse</div>
            </div>
            <ChevronRight size={16} color="#D1D5DB"/>
          </div>

          {/* Déconnexion */}
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

          {/* Logo bas */}
          <div style={{ textAlign:'center', paddingTop:'8px' }}>
            <img src="/logo-homslovision-blanc.png" alt="Homslovision"
              style={{ height:'32px', opacity:0.7 }}
              onError={e=>e.target.style.display='none'}/>
          </div>
        </div>
      </div>

      {/* Écran Directeur */}
      {ecranActif === 'directeur' && (
        <EcranDirecteur onClose={() => setEcranActif(null)}/>
      )}
    </>
  )
}
// Note : La section "Configuration des chambres" est déjà dans EcranDirecteur ci-dessus.
// Les paramètres suivants ont été ajoutés dans paramsDefaut :
// totalChambres: 50
// categories: Standard (20, 101-120), Confort (20, 201-220), Suite (10, 301-310)
