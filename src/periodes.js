// Périodes des rapports : jour, semaine (lundi à dimanche), mois

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const pad = (n) => String(n).padStart(2, '0')
const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const numero = (n) => (n === 1 ? '1er' : String(n))
const jourDe = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const ajouterJours = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export function periodeDe(type, dateRef = new Date()) {
  const ref = jourDe(dateRef)
  let debut, fin, libelle
  if (type === 'jour') {
    debut = ref
    fin = ajouterJours(ref, 1)
    libelle = `${majuscule(JOURS[ref.getDay()])} ${numero(ref.getDate())} ${MOIS[ref.getMonth()]} ${ref.getFullYear()}`
  } else if (type === 'semaine') {
    const decalage = (ref.getDay() + 6) % 7 // lundi = 0
    debut = ajouterJours(ref, -decalage)
    fin = ajouterJours(debut, 7)
    const dernier = ajouterJours(debut, 6)
    const moisDebut = debut.getMonth() !== dernier.getMonth() ? ` ${MOIS[debut.getMonth()]}` : ''
    const anneeDebut = debut.getFullYear() !== dernier.getFullYear() ? ` ${debut.getFullYear()}` : ''
    libelle = `Semaine du ${numero(debut.getDate())}${moisDebut}${anneeDebut} au ${numero(dernier.getDate())} ${MOIS[dernier.getMonth()]} ${dernier.getFullYear()}`
  } else {
    debut = new Date(ref.getFullYear(), ref.getMonth(), 1)
    fin = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
    libelle = `${majuscule(MOIS[ref.getMonth()])} ${ref.getFullYear()}`
  }
  const jours = []
  for (let d = debut; d < fin; d = ajouterJours(d, 1)) jours.push(d)
  return { type, debut, fin, libelle, jours, dateRef: ref }
}

// sens = -1 (précédente) ou +1 (suivante)
export function decalerPeriode(type, dateRef, sens) {
  const ref = jourDe(dateRef)
  if (type === 'jour') return ajouterJours(ref, sens)
  if (type === 'semaine') return ajouterJours(ref, 7 * sens)
  return new Date(ref.getFullYear(), ref.getMonth() + sens, 1)
}

// 'AAAA-MM-JJ' : nom des documents d'archive
export const cleJour = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// 'JJ/MM/AAAA' ou 'JJ/MM/AAAA HH:MM' → Date (ou null)
export function parseDateFR(texte) {
  const m = /(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(texte || '')
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0))
}

export function dansPeriode(texte, periode) {
  const d = parseDateFR(texte)
  return !!d && d >= periode.debut && d < periode.fin
}

export const formaterDateFR = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
