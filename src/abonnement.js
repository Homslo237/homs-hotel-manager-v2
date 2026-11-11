import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from './firebase'

export const GRACE_JOURS = 3

// ── Appel d'une route /api/ avec le jeton de l'hôtel connecté ────────────────
export async function appelerServeur(chemin, { methode = 'GET', corps } = {}) {
  const utilisateur = auth.currentUser
  if (!utilisateur) throw new Error('non_connecte')
  const jeton = await utilisateur.getIdToken()
  const r = await fetch(chemin, {
    method: methode,
    headers: { Authorization: `Bearer ${jeton}`, ...(corps ? { 'Content-Type': 'application/json' } : {}) },
    body: corps ? JSON.stringify(corps) : undefined,
  })
  let data = null
  try { data = await r.json() } catch (e) {}
  return { ok: r.ok, status: r.status, data }
}

// ── Lire l'abonnement depuis Firestore ───────────────────────────────────────
// Compte sans abonnement : le serveur crée l'essai (l'application n'écrit plus jamais l'abonnement).
export async function lireAbonnement(uid) {
  if (!uid || uid === 'admin_local') return null
  try {
    const ref = doc(db, 'hotels', uid, 'infos', 'abonnement')
    let snap = await getDoc(ref)
    if (!snap.exists()) {
      const r = await appelerServeur('/api/essai-demarrer', { methode: 'POST' })
      if (!r.ok) return null
      snap = await getDoc(ref)
    }
    return snap.exists() ? snap.data() : null
  } catch (e) { return null }
}

// ── Vérifier le statut de l'abonnement ──────────────────────────────────────
const JOUR = 1000 * 60 * 60 * 24

export function verifierStatutAbonnement(abonnement) {
  // Pas d'information (hors ligne, lecture impossible) : on ne bloque pas
  if (!abonnement) return { statut: 'inconnu', message: '', bloque: false }

  const maintenant = new Date()

  // ── Essai ──
  if (abonnement.plan === 'essai') {
    const finEssai = new Date(abonnement.dateFinEssai)
    const joursRestants = Math.ceil((finEssai - maintenant) / JOUR)

    if (maintenant < finEssai) {
      return {
        statut: 'essai_actif',
        joursRestants,
        message: joursRestants <= 3
          ? `⚠️ Essai gratuit : ${joursRestants} jour${joursRestants > 1 ? 's' : ''} restant${joursRestants > 1 ? 's' : ''}`
          : `🎁 Essai gratuit : ${joursRestants} jours restants`,
        bloque: false,
        alerte: joursRestants <= 3,
      }
    }
    return { statut: 'essai_expire', message: 'Votre essai gratuit a expiré.', bloque: true }
  }

  // ── Abonnement payant : valable jusqu'à l'échéance, puis période de grâce ──
  if (abonnement.statut === 'actif') {
    const echeance = new Date(abonnement.dateProchaineFacture)
    if (isNaN(echeance.getTime())) {
      return { statut: 'suspendu', message: 'Abonnement invalide. Contactez Homslovision.', bloque: true }
    }
    if (maintenant < echeance) {
      const joursRestants = Math.ceil((echeance - maintenant) / JOUR)
      if (joursRestants <= 5) {
        return {
          statut: 'actif', joursRestants,
          message: `⏳ Abonnement : ${joursRestants} jour${joursRestants > 1 ? 's' : ''} avant renouvellement`,
          bloque: false, alerte: true,
        }
      }
      return { statut: 'actif', joursRestants, message: '', bloque: false }
    }
    const finGrace = new Date(echeance.getTime() + GRACE_JOURS * JOUR)
    if (maintenant < finGrace) {
      const joursRestants = Math.ceil((finGrace - maintenant) / JOUR)
      return {
        statut: 'grace', joursRestants,
        message: `🔴 Abonnement échu — ${joursRestants} jour${joursRestants > 1 ? 's' : ''} avant suspension`,
        bloque: false, alerte: true,
      }
    }
    return { statut: 'suspendu', message: 'Abonnement échu. Renouvelez pour continuer.', bloque: true }
  }

  // ── Période de grâce posée par le serveur ──
  if (abonnement.statut === 'grace') {
    const finGrace = new Date(abonnement.dateFinGrace)
    const joursRestants = Math.ceil((finGrace - maintenant) / JOUR)
    if (maintenant < finGrace) {
      return {
        statut: 'grace', joursRestants,
        message: `🔴 Paiement en retard — ${joursRestants} jour${joursRestants > 1 ? 's' : ''} avant suspension`,
        bloque: false, alerte: true,
      }
    }
    return { statut: 'suspendu', message: 'Compte suspendu pour défaut de paiement.', bloque: true }
  }

  // ── Suspendu ──
  if (abonnement.statut === 'suspendu') {
    return { statut: 'suspendu', message: 'Compte suspendu. Contactez Homslovision.', bloque: true }
  }

  // Document présent mais non reconnu : on bloque plutôt que d'ouvrir l'accès
  return { statut: 'inconnu', message: 'Abonnement non reconnu. Contactez Homslovision.', bloque: true }
}

// ── Noms lisibles des plans ──────────────────────────────────────────────────
// Un abonnement payant porte le code de son offre (ex. « hotel-pro ») : un code inconnu reçoit un libellé neutre.
const PLANS_CONNUS = {
  essai:    { nom: 'Essai gratuit', couleur: '#C9A84C' },
  basique:  { nom: 'Plan Basique',  couleur: '#2ECC71' },
  pro:      { nom: 'Plan Pro',      couleur: '#1B3A6B' },
  premium:  { nom: 'Plan Premium',  couleur: '#C9A84C' },
}
export const PLANS = new Proxy(PLANS_CONNUS, {
  get: (cible, cle) => (cle in cible || typeof cle !== 'string') ? cible[cle] : { nom: `Plan ${cle}`, couleur: '#C9A84C' },
})

// ── Offres : lues dans HOMSLO CONTROL, prix et limites de secours sinon ──────
const URL_CONTROL = 'https://qqfbltdllbpsfhubzpzr.supabase.co'
const CLE_PUBLIQUE = 'sb_publishable_WGJgkHN7V9B0D-Cnq_r_CQ_bI_Fpi6g' // clé publique, faite pour être visible
const PRODUIT = 'homs-hotel'

// Mêmes offres que le serveur (api/_plans.js). Affichage seulement : le serveur recalcule toujours prix et limites.
// max_units = chambres, max_users = utilisateurs, null = illimité. « features » existe seulement pour ces offres de secours.
export const OFFRES_SECOURS = [
  { code: 'basique',        name: 'Basique', price: 5000,   currency: 'XAF', period: 'month', max_units: 10,   max_users: 2,
    features: ['Dashboard', 'Chambres', 'Séjours', 'Caisse', 'Journal'] },
  { code: 'pro',            name: 'Pro',     price: 15000,  currency: 'XAF', period: 'month', max_units: 30,   max_users: 5,
    features: ['Tout Basique', 'Statistiques avancées', 'Rapports PDF', 'Maintenance'] },
  { code: 'premium',        name: 'Premium', price: 25000,  currency: 'XAF', period: 'month', max_units: null, max_users: null,
    features: ['Tout Pro', 'Multi-appareils', 'Support prioritaire', 'Modules futurs', 'Options personnalisées'] },
  { code: 'basique-annuel', name: 'Basique', price: 50000,  currency: 'XAF', period: 'year',  max_units: 10,   max_users: 2,
    features: ['Dashboard', 'Chambres', 'Séjours', 'Caisse', 'Journal'] },
  { code: 'pro-annuel',     name: 'Pro',     price: 150000, currency: 'XAF', period: 'year',  max_units: 30,   max_users: 5,
    features: ['Tout Basique', 'Statistiques avancées', 'Rapports PDF', 'Maintenance'] },
  { code: 'premium-annuel', name: 'Premium', price: 250000, currency: 'XAF', period: 'year',  max_units: null, max_users: null,
    features: ['Tout Pro', 'Multi-appareils', 'Support prioritaire', 'Modules futurs', 'Options personnalisées'] },
]

export const formatPrix = (prix, devise) =>
  `${Number(prix).toLocaleString('fr-FR')} ${devise === 'XAF' || devise === 'XOF' ? 'FCFA' : devise}`

export const texteChambres = (n) => (n === null || n === undefined ? 'Chambres illimitées' : `${n} chambre${n > 1 ? 's' : ''} max`)
export const texteUtilisateurs = (n) => (n === null || n === undefined ? 'Utilisateurs illimités' : `${n} utilisateur${n > 1 ? 's' : ''}`)

const limiteValide = (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 100000)

const offreValide = (p) => !!p && typeof p.code === 'string' && typeof p.name === 'string'
  && Number.isInteger(p.price) && p.price >= 0 && /^[A-Z]{3}$/.test(p.currency)
  && (p.period === 'month' || p.period === 'year')
  && limiteValide(p.max_units) && limiteValide(p.max_users)

let cacheOffres = { t: 0, liste: null }

// Liste des offres actives, ou null (alors l'écran garde les prix de secours). Cache de 5 minutes.
export async function lireOffres() {
  if (cacheOffres.liste && Date.now() - cacheOffres.t < 5 * 60 * 1000) return cacheOffres.liste
  const controle = typeof AbortController !== 'undefined' ? new AbortController() : null
  const minuteur = controle ? setTimeout(() => controle.abort(), 4000) : null
  try {
    const r = await fetch(`${URL_CONTROL}/rest/v1/rpc/saas_public_plans`, {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      signal: controle ? controle.signal : undefined,
      headers: { apikey: CLE_PUBLIQUE, Authorization: `Bearer ${CLE_PUBLIQUE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_product: PRODUIT }),
    })
    const j = r.ok ? await r.json() : null
    const d = Array.isArray(j) ? j[0] : j
    const liste = d && Array.isArray(d.plans) ? d.plans.filter(offreValide) : []
    if (!liste.length) return null
    cacheOffres = { t: Date.now(), liste }
    return liste
  } catch (e) {
    return null
  } finally {
    if (minuteur) clearTimeout(minuteur)
  }
}
