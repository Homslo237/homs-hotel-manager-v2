import { db } from './firebase'
import { doc, getDoc, runTransaction } from 'firebase/firestore'

// Historique rangé par mois : hotels/{hotelId}/historique/AAAA-MM  →  { lignes: [...] }
// Un document par mois évite la limite de 1 Mo du document « caisse ».

const NB_MOIS_CHARGES = 24

const refMois = (hotelId, cle) => doc(db, 'hotels', hotelId, 'historique', cle)
const refCaisse = (hotelId) => doc(db, 'hotels', hotelId, 'data', 'caisse')
const hotelValide = (hotelId) => !!hotelId && hotelId !== 'admin_local'

// 'JJ/MM/AAAA HH:MM' → 'AAAA-MM' (mois courant si la date est illisible)
export function cleMoisDepuis(texte) {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(texte || '')
  if (m) return `${m[3]}-${m[2]}`
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

function grouperParMois(lignes) {
  const parMois = {}
  lignes.forEach(l => {
    const cle = cleMoisDepuis(l.cloture || l.date)
    ;(parMois[cle] = parMois[cle] || []).push(l)
  })
  return parMois
}

// ─── File d'attente locale : rien ne se perd si le réseau coupe ─────────────
const cleAttente = (hotelId) => `homs_${hotelId}_historique_attente`
function lireAttente(hotelId) {
  try { return JSON.parse(localStorage.getItem(cleAttente(hotelId)) || '[]') } catch (e) { return [] }
}
function ecrireAttente(hotelId, lignes) {
  try { localStorage.setItem(cleAttente(hotelId), JSON.stringify(lignes)) } catch (e) {}
}

async function ecrireLignes(hotelId, lignes) {
  const parMois = grouperParMois(lignes)
  for (const [cle, nouvelles] of Object.entries(parMois)) {
    await runTransaction(db, async (t) => {
      const snap = await t.get(refMois(hotelId, cle))
      const anciennes = snap.exists() ? (snap.data().lignes || []) : []
      t.set(refMois(hotelId, cle), { lignes: [...anciennes, ...nouvelles], updatedAt: new Date().toISOString() })
    })
  }
}

// Les envois sont mis en file pour ne jamais s'exécuter en même temps
let file = Promise.resolve()

async function viderAttenteInterne(hotelId) {
  const aEnvoyer = lireAttente(hotelId)
  if (!aEnvoyer.length) return
  try {
    await ecrireLignes(hotelId, aEnvoyer)
    ecrireAttente(hotelId, lireAttente(hotelId).slice(aEnvoyer.length))
  } catch (e) {
    // hors-ligne ou erreur : les lignes restent en attente et repartiront plus tard
  }
}

export function viderAttente(hotelId) {
  if (!hotelValide(hotelId)) return Promise.resolve()
  file = file.then(() => viderAttenteInterne(hotelId))
  return file
}

// Ajoute des lignes à l'historique (clôture de caisse)
export function ajouterHistorique(hotelId, lignes) {
  if (!hotelValide(hotelId) || !lignes.length) return Promise.resolve()
  const propres = JSON.parse(JSON.stringify(lignes)) // retire les valeurs « undefined »
  ecrireAttente(hotelId, [...lireAttente(hotelId), ...propres])
  return viderAttente(hotelId)
}

// Lit les derniers mois, du plus ancien au plus récent, + les lignes encore en attente
export async function chargerHistorique(hotelId, nbMois = NB_MOIS_CHARGES) {
  if (!hotelValide(hotelId)) return []
  const cles = []
  const n = new Date()
  for (let i = nbMois - 1; i >= 0; i--) {
    const d = new Date(n.getFullYear(), n.getMonth() - i, 1)
    cles.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const mois = await Promise.all(cles.map(async (cle) => {
    try {
      const snap = await getDoc(refMois(hotelId, cle))
      return snap.exists() ? (snap.data().lignes || []) : []
    } catch (e) { return [] }
  }))
  return [...mois.flat(), ...lireAttente(hotelId)]
}

// Migration unique : déplace l'ancien tableau « historique » du document caisse vers les mois
export async function migrerHistorique(hotelId) {
  if (!hotelValide(hotelId)) return
  try {
    await runTransaction(db, async (t) => {
      const snap = await t.get(refCaisse(hotelId))
      const vieux = snap.exists() ? (snap.data().historique || []) : []
      if (!vieux.length) return
      const parMois = grouperParMois(vieux)
      const cles = Object.keys(parMois)
      const snaps = await Promise.all(cles.map(cle => t.get(refMois(hotelId, cle))))
      cles.forEach((cle, i) => {
        const existantes = snaps[i].exists() ? (snaps[i].data().lignes || []) : []
        t.set(refMois(hotelId, cle), { lignes: [...existantes, ...parMois[cle]], updatedAt: new Date().toISOString() })
      })
      t.update(refCaisse(hotelId), { historique: [] })
    })
  } catch (e) {
    // sera retenté à la prochaine connexion ; l'ancien historique reste intact
  }
}
