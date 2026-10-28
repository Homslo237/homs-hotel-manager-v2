import { db } from './firebase'
import { doc, getDoc, runTransaction } from 'firebase/firestore'

// Archives détaillées, un document par jour (jamais de document trop gros) :
//   hotels/{id}/journalArchive/AAAA-MM-JJ  → { items: [ entrées du journal ] }
//   hotels/{id}/sejoursArchive/AAAA-MM-JJ  → { items: [ fiches de séjour complètes ] }
// Elles alimentent les rapports PDF (historique des actions, historique des séjours).

const ARCHIVES = {
  journal: { collection: 'journalArchive', champDate: 'date' },
  sejours: { collection: 'sejoursArchive', champDate: 'dateArrivee' },
}

const valide = (hotelId) => !!hotelId && hotelId !== 'admin_local'
const pad = (n) => String(n).padStart(2, '0')

// 'JJ/MM/AAAA …' → 'AAAA-MM-JJ' (aujourd'hui si la date est illisible)
export function cleJourDepuis(texte) {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(texte || '')
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  const n = new Date()
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`
}

// ─── File d'attente locale : rien ne se perd si le réseau coupe ─────────────
const cleAttente = (hotelId, nom) => `homs_${hotelId}_archive_${nom}_attente`
function lireAttente(hotelId, nom) {
  try { return JSON.parse(localStorage.getItem(cleAttente(hotelId, nom)) || '[]') } catch (e) { return [] }
}
function ecrireAttente(hotelId, nom, items) {
  try { localStorage.setItem(cleAttente(hotelId, nom), JSON.stringify(items)) } catch (e) {}
}

async function ecrireItems(hotelId, nom, items) {
  const { collection, champDate } = ARCHIVES[nom]
  const parJour = {}
  items.forEach(it => {
    const cle = cleJourDepuis(it[champDate])
    ;(parJour[cle] = parJour[cle] || []).push(it)
  })
  for (const [cle, nouveaux] of Object.entries(parJour)) {
    const ref = doc(db, 'hotels', hotelId, collection, cle)
    await runTransaction(db, async (t) => {
      const snap = await t.get(ref)
      const existants = snap.exists() ? (snap.data().items || []) : []
      // Mise à jour par identifiant : un séjour archivé deux fois n'est jamais dupliqué
      const parId = new Map(existants.map((x, i) => [x.id != null ? String(x.id) : `sans-id-${i}`, x]))
      nouveaux.forEach(x => parId.set(x.id != null ? String(x.id) : `sans-id-${parId.size}`, x))
      t.set(ref, { items: Array.from(parId.values()), updatedAt: new Date().toISOString() })
    })
  }
}

// Les envois passent l'un après l'autre
let file = Promise.resolve()

async function viderNom(hotelId, nom) {
  const aEnvoyer = lireAttente(hotelId, nom)
  if (!aEnvoyer.length) return
  try {
    await ecrireItems(hotelId, nom, aEnvoyer)
    ecrireAttente(hotelId, nom, lireAttente(hotelId, nom).slice(aEnvoyer.length))
  } catch (e) {
    // hors-ligne ou erreur : les éléments restent en attente et repartiront plus tard
  }
}

export function viderAttentes(hotelId) {
  if (!valide(hotelId)) return Promise.resolve()
  file = file.then(() => viderNom(hotelId, 'journal')).then(() => viderNom(hotelId, 'sejours'))
  return file
}

function archiver(hotelId, nom, items) {
  if (!valide(hotelId) || !items || !items.length) return Promise.resolve()
  const propres = JSON.parse(JSON.stringify(items)) // retire les valeurs « undefined »
  ecrireAttente(hotelId, nom, [...lireAttente(hotelId, nom), ...propres])
  return viderAttentes(hotelId)
}

export const archiverJournal = (hotelId, entrees) => archiver(hotelId, 'journal', entrees)
export const archiverSejours = (hotelId, sejours) => archiver(hotelId, 'sejours', sejours)

// Une seule fois par téléphone : archive le journal déjà présent (limité à 500 entrées)
export function migrerJournalExistant(hotelId, entrees) {
  if (!valide(hotelId) || !entrees || !entrees.length) return
  const drapeau = `homs_${hotelId}_journal_archive_migre`
  try {
    if (localStorage.getItem(drapeau)) return
    localStorage.setItem(drapeau, '1')
  } catch (e) { return }
  archiverJournal(hotelId, entrees)
}

// Lecture pour les rapports : jours = ['AAAA-MM-JJ', ...]
export async function chargerArchive(hotelId, nom, jours) {
  if (!valide(hotelId)) return []
  const { collection } = ARCHIVES[nom]
  const lots = await Promise.all(jours.map(async (cle) => {
    try {
      const snap = await getDoc(doc(db, 'hotels', hotelId, collection, cle))
      return snap.exists() ? (snap.data().items || []) : []
    } catch (e) { return [] }
  }))
  return [...lots.flat(), ...lireAttente(hotelId, nom)]
}
