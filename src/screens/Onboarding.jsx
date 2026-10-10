import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { DEVISES, trouverDevise, detecterDevise } from '../devises'

const styleAnim = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .btn-shimmer {
    background: linear-gradient(90deg, #C9A84C 0%, #F5D98A 40%, #C9A84C 60%, #A07830 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
  }
`

const ETAPES = [
  { num:1, titre:'Bienvenue 🎉',         sous:'Configurons votre hôtel en 3 minutes' },
  { num:2, titre:'Votre établissement 🏨', sous:'Informations de base'               },
  { num:3, titre:'Vos chambres 🛏️',       sous:'Catégories et tarifs'               },
  { num:4, titre:'Votre devise 💱',        sous:'Monnaie locale'                     },
]

const inputStyle = {
  width:'100%', padding:'13px 16px',
  border:'2px solid #E0E0E0', borderRadius:'12px',
  fontSize:'14px', outline:'none', boxSizing:'border-box',
  fontFamily:'inherit',
}

const labelStyle = {
  display:'block', fontSize:'13px', fontWeight:'700',
  color:'#1B3A6B', marginBottom:'6px',
}

export default function Onboarding({ utilisateur, hotelId, onTerminer }) {
  const [etape, setEtape] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  // Étape 2 — Infos hôtel
  const [nomHotel,   setNomHotel]   = useState(utilisateur?.nomHotel || '')
  const [adresse,    setAdresse]    = useState('')
  const [telephone,  setTelephone]  = useState('')

  // Étape 3 — Chambres
  const [categories, setCategories] = useState([
    { id:1, nom:'Standard', nombre:10, tarifNuit:25000, tarifHeure:2500 },
  ])

  // Étape 4 — Devise
  const [codeDevise, setCodeDevise] = useState(detecterDevise() || 'XOF')

  const ajouterCategorie = () => {
    setCategories([...categories, {
      id: Date.now(),
      nom: 'Nouvelle catégorie',
      nombre: 5,
      tarifNuit: 30000,
      tarifHeure: 3000,
    }])
  }

  const modifierCategorie = (id, champ, valeur) => {
    setCategories(categories.map(c => c.id === id ? { ...c, [champ]: valeur } : c))
  }

  const supprimerCategorie = (id) => {
    if (categories.length === 1) return
    setCategories(categories.filter(c => c.id !== id))
  }

  // Calculer les numéros de chambre automatiquement
  const categoriesAvecNumeros = categories.map((cat, i) => {
    const debut = (i + 1) * 100
    return { ...cat, debut }
  })

  const totalChambres = categories.reduce((s, c) => s + (Number(c.nombre) || 0), 0)

  const handleTerminer = async () => {
    setLoading(true)
    setErreur('')

    try {
      const uid = auth.currentUser?.uid || hotelId
      if (!uid) throw new Error('Pas de compte connecté')

      // Sauvegarder l'identité
      await setDoc(doc(db, 'hotels', uid, 'infos', 'identite'), {
        nom: nomHotel,
        adresse,
        telephone1: telephone,
        slogan: '', telephone2: '', email: '',
        rccm: '', contribuable: '', mentionLegale: '',
        logoUrl: null,
        dateCreation: new Date().toISOString(),
      })

      // Sauvegarder les paramètres (chambres, devise)
      const params = {
        nomHotel,
        toleranceMinutes: 20,
        vacations: [
          { id:1, nom:'Matin',      debut:'06:00', fin:'14:00' },
          { id:2, nom:'Après-midi', debut:'14:00', fin:'22:00' },
          { id:3, nom:'Nuit',       debut:'22:00', fin:'06:00' },
        ],
        categories: categoriesAvecNumeros,
        updatedAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'hotels', uid, 'data', 'params'), params)

      // Sauvegarder la devise en localStorage
      localStorage.setItem(`homs_${uid}_devise`, codeDevise)

      // Sauvegarder les params en localStorage
      localStorage.setItem(`homs_${uid}_params`, JSON.stringify(params))

      setLoading(false)
      onTerminer({ params, codeDevise })

    } catch (err) {
      setLoading(false)
      setErreur('Erreur lors de la sauvegarde. Réessayez.')
    }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(160deg, #F8FAFF 0%, #EEF2FF 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'0 20px 40px',
    }}>
      <style>{styleAnim}</style>

      {/* Header */}
      <div style={{ width:'100%', maxWidth:'440px', paddingTop:'48px', paddingBottom:'32px', textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏨</div>
        <div style={{ fontSize:'22px', fontWeight:'900', color:'#1B3A6B', letterSpacing:'2px' }}>HOMS-HÔTEL MANAGER</div>
        <div style={{ fontSize:'13px', color:'#888', marginTop:'6px' }}>Configuration initiale</div>
      </div>

      {/* Barre de progression */}
      <div style={{ width:'100%', maxWidth:'440px', marginBottom:'32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
          {ETAPES.map(e => (
            <div key={e.num} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%',
                background: e.num < etape ? '#2ECC71' : e.num === etape ? '#1B3A6B' : '#E0E0E0',
                color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'13px', fontWeight:'800', transition:'all 0.3s',
              }}>
                {e.num < etape ? '✓' : e.num}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height:'4px', background:'#E0E0E0', borderRadius:'2px', position:'relative' }}>
          <div style={{
            height:'100%', borderRadius:'2px',
            background:'linear-gradient(90deg, #1B3A6B, #C9A84C)',
            width:`${((etape - 1) / (ETAPES.length - 1)) * 100}%`,
            transition:'width 0.4s ease',
          }}/>
        </div>
        <div style={{ textAlign:'center', marginTop:'12px' }}>
          <div style={{ fontWeight:'800', fontSize:'18px', color:'#1B3A6B' }}>{ETAPES[etape-1].titre}</div>
          <div style={{ fontSize:'13px', color:'#888', marginTop:'4px' }}>{ETAPES[etape-1].sous}</div>
        </div>
      </div>

      {/* Contenu de chaque étape */}
      <div className="fade-up" key={etape} style={{ width:'100%', maxWidth:'440px' }}>

        {/* ── Étape 1 : Bienvenue ── */}
        {etape === 1 && (
          <div style={{ background:'white', borderRadius:'20px', padding:'28px 24px', boxShadow:'0 4px 20px rgba(27,58,107,0.08)' }}>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'56px', marginBottom:'16px' }}>👋</div>
              <div style={{ fontSize:'20px', fontWeight:'800', color:'#1B3A6B', marginBottom:'8px' }}>
                Bonjour {utilisateur?.nom || 'Directeur'} !
              </div>
              <div style={{ fontSize:'14px', color:'#666', lineHeight:'1.6' }}>
                Votre compte a été créé avec succès. Prenons 3 minutes pour configurer votre hôtel afin que tout soit prêt à l'usage.
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px' }}>
              {[
                { emoji:'🏨', titre:'Votre établissement', desc:'Nom, adresse, téléphone' },
                { emoji:'🛏️', titre:'Vos chambres',        desc:'Catégories et tarifs' },
                { emoji:'💱', titre:'Votre devise',         desc:'Monnaie locale' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 16px', background:'#F8FAFF', borderRadius:'12px', border:'1px solid #E8EDFF' }}>
                  <div style={{ fontSize:'24px' }}>{item.emoji}</div>
                  <div>
                    <div style={{ fontWeight:'700', fontSize:'14px', color:'#1B3A6B' }}>{item.titre}</div>
                    <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-shimmer" onClick={() => setEtape(2)} style={{
              width:'100%', padding:'16px', borderRadius:'14px', border:'none',
              cursor:'pointer', color:'#1B3A6B', fontWeight:'900', fontSize:'16px',
              boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
            }}>
              Commencer la configuration →
            </button>
          </div>
        )}

        {/* ── Étape 2 : Établissement ── */}
        {etape === 2 && (
          <div style={{ background:'white', borderRadius:'20px', padding:'28px 24px', boxShadow:'0 4px 20px rgba(27,58,107,0.08)' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'24px' }}>
              <div>
                <label style={labelStyle}>Nom de l'hôtel *</label>
                <input value={nomHotel} onChange={e=>setNomHotel(e.target.value)}
                  placeholder="Ex. Hôtel Palace Dakar"
                  style={inputStyle}
                  onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                  onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                />
              </div>
              <div>
                <label style={labelStyle}>Adresse</label>
                <input value={adresse} onChange={e=>setAdresse(e.target.value)}
                  placeholder="Ex. Avenue de l'Indépendance, Dakar"
                  style={inputStyle}
                  onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                  onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input value={telephone} onChange={e=>setTelephone(e.target.value)}
                  placeholder="Ex. +221 77 000 00 00"
                  type="tel"
                  style={inputStyle}
                  onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                  onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                />
              </div>
            </div>

            {erreur && <div style={{ color:'#E74C3C', fontSize:'13px', marginBottom:'12px', textAlign:'center' }}>⚠️ {erreur}</div>}

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setEtape(1)} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #E0E0E0', background:'white', color:'#666', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
                ← Retour
              </button>
              <button onClick={() => {
                if (!nomHotel.trim()) { setErreur('Le nom de l\'hôtel est obligatoire.'); return }
                setErreur(''); setEtape(3)
              }} style={{ flex:2, padding:'14px', borderRadius:'12px', border:'none', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'14px', cursor:'pointer' }}>
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Chambres ── */}
        {etape === 3 && (
          <div style={{ background:'white', borderRadius:'20px', padding:'28px 24px', boxShadow:'0 4px 20px rgba(27,58,107,0.08)' }}>
            <div style={{ background:'#F0F4FF', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', fontSize:'12px', color:'#1B3A6B', fontWeight:'600' }}>
              🏨 Total : <strong>{totalChambres} chambres</strong> configurées
            </div>

            {categories.map((cat, i) => (
              <div key={cat.id} style={{ background:'#F8FAFF', borderRadius:'14px', padding:'16px', marginBottom:'12px', border:'1px solid #E8EDFF' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <div style={{ fontWeight:'800', fontSize:'14px', color:'#1B3A6B' }}>Catégorie {i+1}</div>
                  {categories.length > 1 && (
                    <button onClick={() => supprimerCategorie(cat.id)} style={{ background:'#FFF0F0', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#E74C3C', fontSize:'12px', fontWeight:'700' }}>
                      Supprimer
                    </button>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <div>
                    <label style={labelStyle}>Nom de la catégorie</label>
                    <input value={cat.nom} onChange={e=>modifierCategorie(cat.id,'nom',e.target.value)}
                      placeholder="Ex. Standard, Confort, Suite..."
                      style={inputStyle}
                      onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                      onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nombre de chambres</label>
                    <input type="number" value={cat.nombre} min="1"
                      onChange={e=>modifierCategorie(cat.id,'nombre',Number(e.target.value))}
                      style={inputStyle}
                      onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                      onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                    />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div>
                      <label style={labelStyle}>Tarif / nuit</label>
                      <input type="number" value={cat.tarifNuit}
                        onChange={e=>modifierCategorie(cat.id,'tarifNuit',Number(e.target.value))}
                        style={inputStyle}
                        onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                        onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Tarif / heure</label>
                      <input type="number" value={cat.tarifHeure}
                        onChange={e=>modifierCategorie(cat.id,'tarifHeure',Number(e.target.value))}
                        style={inputStyle}
                        onFocus={e=>e.target.style.border='2px solid #1B3A6B'}
                        onBlur={e=>e.target.style.border='2px solid #E0E0E0'}
                      />
                    </div>
                  </div>
                  <div style={{ background:'#EEF2FF', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#1B3A6B', fontWeight:'600' }}>
                    📊 Numéros : {(i+1)*100 + 1} → {(i+1)*100 + cat.nombre}
                  </div>
                </div>
              </div>
            ))}

            <button onClick={ajouterCategorie} style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px dashed #C9A84C', background:'transparent', color:'#C9A84C', fontWeight:'700', fontSize:'14px', cursor:'pointer', marginBottom:'16px' }}>
              + Ajouter une catégorie
            </button>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setEtape(2)} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #E0E0E0', background:'white', color:'#666', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
                ← Retour
              </button>
              <button onClick={() => setEtape(4)} style={{ flex:2, padding:'14px', borderRadius:'12px', border:'none', background:'#1B3A6B', color:'white', fontWeight:'800', fontSize:'14px', cursor:'pointer' }}>
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 4 : Devise ── */}
        {etape === 4 && (
          <div style={{ background:'white', borderRadius:'20px', padding:'28px 24px', boxShadow:'0 4px 20px rgba(27,58,107,0.08)' }}>
            <div style={{ marginBottom:'20px' }}>
              <label style={labelStyle}>Devise de votre établissement</label>
              <p style={{ fontSize:'13px', color:'#888', marginBottom:'12px', lineHeight:'1.5' }}>
                Choisissez la monnaie utilisée dans votre hôtel. Elle sera affichée sur tous les reçus et rapports.
              </p>
              <select value={codeDevise} onChange={e=>setCodeDevise(e.target.value)}
                style={{ ...inputStyle, background:'white' }}>
                {DEVISES.map(d => <option key={d.code} value={d.code}>{d.nom} ({d.code}) — {d.symbole}</option>)}
              </select>
              <div style={{ marginTop:'12px', background:'#F0F4FF', borderRadius:'10px', padding:'12px 14px', fontSize:'13px', color:'#1B3A6B', fontWeight:'700' }}>
                💱 Sélectionné : <strong>{trouverDevise(codeDevise).nom}</strong> — {trouverDevise(codeDevise).symbole}
              </div>
            </div>

            {/* Résumé final */}
            <div style={{ background:'#F8FAFF', borderRadius:'14px', padding:'16px', marginBottom:'20px', border:'1px solid #E8EDFF' }}>
              <div style={{ fontWeight:'800', fontSize:'14px', color:'#1B3A6B', marginBottom:'12px' }}>📋 Résumé de votre configuration</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', fontSize:'13px', color:'#555' }}>
                <div>🏨 <strong>{nomHotel}</strong></div>
                {adresse && <div>📍 {adresse}</div>}
                {telephone && <div>📞 {telephone}</div>}
                <div>🛏️ {totalChambres} chambres · {categories.length} catégorie{categories.length > 1 ? 's' : ''}</div>
                <div>💱 {trouverDevise(codeDevise).nom} ({trouverDevise(codeDevise).symbole})</div>
              </div>
            </div>

            {erreur && <div style={{ color:'#E74C3C', fontSize:'13px', marginBottom:'12px', textAlign:'center' }}>⚠️ {erreur}</div>}

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setEtape(3)} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #E0E0E0', background:'white', color:'#666', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
                ← Retour
              </button>
              <button className="btn-shimmer" onClick={handleTerminer} disabled={loading} style={{
                flex:2, padding:'14px', borderRadius:'12px', border:'none',
                cursor:loading?'not-allowed':'pointer',
                color:'#1B3A6B', fontWeight:'900', fontSize:'14px',
                opacity:loading?0.8:1,
                boxShadow:'0 4px 20px rgba(201,168,76,0.4)',
              }}>
                {loading ? 'Enregistrement...' : '✅ Lancer mon hôtel !'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
