// src/imprimanteThermique.js
// Impression directe sur l'imprimante thermique Bluetooth de poche (Mini Pocket Printer S1, papier 57 mm).
// La bibliothèque homs-printer.js (dossier public/) est chargée seulement quand elle sert.
// Fonctionne dans Chrome (Android ou ordinateur), en HTTPS. Absent de Safari/iPhone : le bouton reste alors caché.

// ── Disponibilité ────────────────────────────────────────────────────────────
export function imprimanteDisponible() {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth
}

// ── Chargement de la bibliothèque (une seule fois) ───────────────────────────
let promesse = null
export function chargerImprimante() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Indisponible ici'))
  if (window.HomsPrinter) return Promise.resolve(window.HomsPrinter)
  if (!promesse) {
    promesse = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = '/homs-printer.js'
      s.async = true
      s.onload = () => (window.HomsPrinter ? resolve(window.HomsPrinter) : (promesse = null, reject(new Error('Bibliothèque d\'impression invalide'))))
      s.onerror = () => { promesse = null; reject(new Error('Bibliothèque d\'impression introuvable')) }
      document.head.appendChild(s)
    })
  }
  return promesse
}

// ── Messages affichés à l'écran ──────────────────────────────────────────────
const TEXTES = {
  connecting: 'Connexion à l\'imprimante…',
  preparing: 'Préparation du ticket…',
  done: '✅ Ticket envoyé',
  CANCELLED: 'Aucune imprimante choisie.',
  CONNECT: '⚠️ Connexion impossible. Imprimante allumée ? Application du fabricant fermée ?',
  RECONNECT: 'Reconnexion impossible : touchez encore une fois.',
  LOST: '⚠️ L\'imprimante s\'est déconnectée. Réessayez.',
  UNSUPPORTED: '⚠️ Utilisez Chrome (Bluetooth web indisponible ici).',
  BUSY: 'Impression déjà en cours…',
  RENDER: '⚠️ Impossible de dessiner le ticket.',
}
export const texteStatut = (phase, info) => (phase === 'sending' ? `Envoi… ${info} %` : (TEXTES[phase] || ''))
export const texteErreur = (e) => TEXTES[e && e.code] || `⚠️ ${(e && e.message) || 'Impression impossible'}`

// ── Impression ───────────────────────────────────────────────────────────────
// À appeler directement depuis un clic (Chrome l'exige la 1re fois pour choisir l'imprimante).
export async function imprimerTicket(spec, onStatut) {
  const P = await chargerImprimante()
  return P.printTicket(spec, { onStatus: onStatut })
}

// L'utilisateur veut choisir une autre imprimante
export async function oublierImprimante() {
  try { (await chargerImprimante()).forget() } catch (e) {}
}

// ── Mise en forme du texte ───────────────────────────────────────────────────
// Espaces insécables, retours à la ligne et émojis : ils s'impriment mal (cases noires), on les retire.
const EMOJIS = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu
export const nettoyer = (t) => String(t === null || t === undefined ? '' : t)
  .replace(/[\u202f\u00a0]/g, ' ').replace(EMOJIS, '').replace(/\s+/g, ' ').trim()

export function formaterMontant(n, devise = 'FCFA') {
  const v = Number(n)
  if (!isFinite(v)) return nettoyer(devise ? `0 ${devise}` : '0')
  return nettoyer(`${v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${devise || ''}`)
}

export function formaterDateHeure(d) {
  const x = d instanceof Date ? d : new Date(d)
  if (isNaN(x.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(x.getDate())}/${p(x.getMonth() + 1)}/${x.getFullYear()} ${p(x.getHours())}:${p(x.getMinutes())}`
}

// ── Ticket aux couleurs de l'hôtel ───────────────────────────────────────────
// identite : le document d'identité de l'hôtel (nom, adresse, telephone1, telephone2, rccm, contribuable, mentionLegale)
// titre    : ex. « REÇU D'ENTRÉE »
// infos    : [{ left:'Chambre', right:'12' }, …]        lignes d'information
// lignes   : [{ left:'Nuitée x1', right:'10 000 FCFA' }]  lignes de détail
// total    : { label:'TOTAL', value:'10 000 FCFA' }
// pied     : phrase de fin (ex. « Merci de votre visite ! »)
export function construireTicketHotel({ identite, titre, infos = [], lignes = [], total, pied } = {}) {
  const id = identite || {}
  const contact = [id.adresse, id.telephone1, id.telephone2].map(nettoyer).filter(Boolean).join(' · ')
  const legal = [id.rccm && `RCCM ${nettoyer(id.rccm)}`, id.contribuable && `Contribuable ${nettoyer(id.contribuable)}`, id.mentionLegale]
    .map(nettoyer).filter(Boolean).join(' · ')

  const corps = []
  if (titre) corps.push({ left: nettoyer(titre), bold: true }, { left: '' })
  const mettre = (it) => {
    if (it === null || it === undefined || typeof it !== 'object') return { left: nettoyer(it), bold: false }
    if (it.right !== undefined) return { left: nettoyer(it.left), right: nettoyer(it.right), bold: it.bold === true }
    return { left: nettoyer(it.left), bold: it.bold === true }
  }
  infos.forEach(it => corps.push(mettre(it)))
  if (infos.length && lignes.length) corps.push({ left: '' })
  lignes.forEach(it => corps.push(mettre(it)))

  const spec = {
    title: nettoyer(id.nom) || 'HOMS-HÔTEL MANAGER',
    subtitle: contact,
    lines: corps,
    footer: [nettoyer(pied), legal].filter(Boolean).join(' · '),
  }
  if (total) spec.total = { label: nettoyer(total.label), value: nettoyer(total.value) }
  return spec
}
