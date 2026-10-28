import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Identité de l'établissement (logo, nom, contacts, infos légales).
// Source unique pour les reçus, la clôture de caisse et la passation.
// Stockage : localStorage (clé propre à l'hôtel) + Firestore hotels/{id}/infos/identite

export const IDENTITE_DEFAUT = {
  nom: '', slogan: '', adresse: '',
  telephone1: '', telephone2: '', email: '',
  rccm: '', contribuable: '', mentionLegale: '',
  logoUrl: null,
}

let hotelCourant = null

export function definirHotelCourant(hotelId) {
  hotelCourant = hotelId && hotelId !== 'admin_local' ? hotelId : null
}

const cleLocale = (hotelId) => `homs_${hotelId}_identite`

// Lit l'identité de l'hôtel connecté (jamais celle d'un autre hôtel)
export function lireIdentite(hotelId = hotelCourant) {
  if (!hotelId) return { ...IDENTITE_DEFAUT }
  try {
    const s = localStorage.getItem(cleLocale(hotelId))
    return s ? { ...IDENTITE_DEFAUT, ...JSON.parse(s) } : { ...IDENTITE_DEFAUT }
  } catch (e) { return { ...IDENTITE_DEFAUT } }
}

export function enregistrerLocal(hotelId, identite) {
  if (!hotelId) return false
  try { localStorage.setItem(cleLocale(hotelId), JSON.stringify(identite)); return true } catch (e) { return false }
}

// Enregistre sur le téléphone puis sur Firestore. Retourne { local, distant }.
export async function sauvegarderIdentite(hotelId, identite) {
  const local = enregistrerLocal(hotelId, identite)
  let distant = false
  try {
    await setDoc(doc(db, 'hotels', hotelId, 'infos', 'identite'), identite)
    distant = true
  } catch (e) {}
  return { local, distant }
}

// À la connexion : récupère l'identité enregistrée sur Firestore (autres appareils de l'hôtel)
export async function chargerIdentite(hotelId) {
  if (!hotelId || hotelId === 'admin_local') return
  try {
    const snap = await getDoc(doc(db, 'hotels', hotelId, 'infos', 'identite'))
    if (snap.exists()) enregistrerLocal(hotelId, { ...IDENTITE_DEFAUT, ...snap.data() })
  } catch (e) {}
}

// Nom à afficher sur les documents : jamais la marque HOMS
export function nomEtablissement(identite) {
  return ((identite && identite.nom) || '').trim() || 'Mon établissement'
}

// Réduit le logo (480 px max) pour tenir largement sous la limite de 1 Mo de Firestore
export function compresserLogo(file, largeurMax = 480) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('lecture'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('image'))
      img.onload = () => {
        const ratio = Math.min(1, largeurMax / img.width)
        const w = Math.max(1, Math.round(img.width * ratio))
        const h = Math.max(1, Math.round(img.height * ratio))
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d')
        const dessiner = (fondBlanc) => {
          ctx.clearRect(0, 0, w, h)
          if (fondBlanc) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) }
          ctx.drawImage(img, 0, 0, w, h)
        }
        let url = null
        if (file.type === 'image/png') { dessiner(false); url = c.toDataURL('image/png') }
        if (!url || url.length > 250000) { dessiner(true); url = c.toDataURL('image/jpeg', 0.82) }
        resolve(url)
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
