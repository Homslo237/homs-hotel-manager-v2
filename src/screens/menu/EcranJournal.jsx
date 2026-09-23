
import { useState } from 'react'
import { X, LogIn, LogOut, Bed, RefreshCw, DollarSign, User } from 'lucide-react'

const TYPE_INFO = {
  connexion:       { label:'Connexion',        icone:LogIn,     couleur:'#2ECC71' },
  deconnexion:     { label:'Déconnexion',      icone:LogOut,    couleur:'#999'    },
  sejour_cree:     { label:'Séjour créé',      icone:Bed,       couleur:'#1B3A6B' },
  sejour_termine:  { label:'Séjour terminé',   icone:Bed,       couleur:'#E8634A' },
  sejour_prolonge: { label:'Séjour prolongé',  icone:RefreshCw, couleur:'#C9A84C' },
  cloture_caisse:  { label:'Clôture de caisse',icone:DollarSign,couleur:'#8B5CF6' },
}

const ROLES_LABELS = {
  directeur:      { label:'Directeur',      couleur:'#C9A84C', emoji:'👔' },
  receptionniste: { label:'Réceptionniste', couleur:'#2ECC71', emoji:'🛎️' },
  caissier:       { label:'Caissier',       couleur:'#E8634A', emoji:'💰' },
}

export default function EcranJournal({ onClose, journal = [], utilisateur }) {
  const [filtre, setFiltre] = useState('tous')

  const estDirecteur = utilisateur?.role === 'directeur'

  // Réceptionniste ne voit pas les connexions/déconnexions (les siennes ou celles des autres)
  const journalVisible = estDirecteur
    ? journal
    : journal.filter(j => j.type !== 'connexion' && j.type !== 'deconnexion')

  const journalFiltre = journalVisible.filter(j => filtre === 'tous' || j.type === filtre)

  const typesDisponibles = estDirecteur
    ? Object.keys(TYPE_INFO)
    : Object.keys(TYPE_INFO).filter(t => t !== 'connexion' && t !== 'deconnexion')

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'#F5F7FA', overflowY:'auto', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1B3A6B, #2C5282)', padding:'24px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:'#C9A84C', fontSize:'20px', fontWeight:'800' }}>Journal des opérations</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'4px' }}>
              {journalVisible.length} événement{journalVisible.length>1?'s':''} enregistré{journalVisible.length>1?'s':''}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer' }}>
            <X size={20} color="white"/>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'12px' }}>
          <button onClick={()=>setFiltre('tous')} style={{
            padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap',
            border:'none', cursor:'pointer',
            background:filtre==='tous'?'#1B3A6B':'#F0F0F0', color:filtre==='tous'?'white':'#666',
          }}>Tous</button>
          {typesDisponibles.map(t => {
            const info = TYPE_INFO[t]
            return (
              <button key={t} onClick={()=>setFiltre(t)} style={{
                padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap',
                border:'none', cursor:'pointer',
                background:filtre===t?info.couleur:'#F0F0F0', color:filtre===t?'white':'#666',
              }}>{info.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ padding:'0 20px' }}>
        {journalFiltre.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#999' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📓</div>
            <p style={{ fontWeight:'700', fontSize:'15px', color:'#1B3A6B' }}>Aucune activité</p>
            <p style={{ fontSize:'12px', marginTop:'4px' }}>Les actions apparaîtront ici au fur et à mesure.</p>
          </div>
        )}

        {journalFiltre.map(entree => {
          const info = TYPE_INFO[entree.type] || { label:entree.type, icone:User, couleur:'#999' }
          const Icone = info.icone
          const roleInfo = ROLES_LABELS[entree.role] || {}
          return (
            <div key={entree.id} style={{
              background:'white', borderRadius:'12px', padding:'14px 16px', marginBottom:'8px',
              boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:`4px solid ${info.couleur}`,
              display:'flex', gap:'12px', alignItems:'flex-start'
            }}>
              <div style={{
                width:'36px', height:'36px', borderRadius:'10px', background:info.couleur+'15',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
              }}>
                <Icone size={18} color={info.couleur}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                  <span style={{ fontWeight:'700', fontSize:'13px', color:'#1B3A6B' }}>{info.label}</span>
                  <span style={{ fontSize:'11px', color:'#999' }}>{entree.date}</span>
                </div>
                <div style={{ fontSize:'13px', color:'#555', marginBottom:'6px' }}>{entree.details}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontSize:'11px', color:'#888' }}>{roleInfo.emoji} {entree.utilisateur}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
