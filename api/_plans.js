// api/_plans.js
// Offres et prix : lus dans HOMSLO CONTROL (onglet Offres). Prix de secours seulement si CONTROL ne répond pas.
// Le serveur ne fait JAMAIS confiance à un montant envoyé par l'application.

const URL_CONTROL = 'https://qqfbltdllbpsfhubzpzr.supabase.co'
const CLE_PUBLIQUE = 'sb_publishable_WGJgkHN7V9B0D-Cnq_r_CQ_bI_Fpi6g' // clé publique, faite pour être visible
export const PRODUIT = 'homs-hotel'
export const DUREE_ESSAI_DEFAUT = 10

// ── Prix et limites de secours (annuel = 10 mois) ────────────────────────────
// Utilisés seulement si HOMSLO CONTROL ne répond pas. null = illimité.
export const PLANS_SECOURS = [
  { code: 'basique',        name: 'Basique', price: 5000,   currency: 'XAF', period: 'month', max_units: 10,   max_users: 2 },
  { code: 'pro',            name: 'Pro',     price: 15000,  currency: 'XAF', period: 'month', max_units: 30,   max_users: 5 },
  { code: 'premium',        name: 'Premium', price: 25000,  currency: 'XAF', period: 'month', max_units: null, max_users: null },
  { code: 'basique-annuel', name: 'Basique', price: 50000,  currency: 'XAF', period: 'year',  max_units: 10,   max_users: 2 },
  { code: 'pro-annuel',     name: 'Pro',     price: 150000, currency: 'XAF', period: 'year',  max_units: 30,   max_users: 5 },
  { code: 'premium-annuel', name: 'Premium', price: 250000, currency: 'XAF', period: 'year',  max_units: null, max_users: null },
]

// Les limites d'une offre viennent de CONTROL (max_units = chambres, max_users = utilisateurs).
// « Illimité » (null) s'enregistre 999 dans l'abonnement, comme avant.
export const ILLIMITE = 999
export const limiteOuIllimite = (v) => (v === null || v === undefined ? ILLIMITE : v)

// ── Validation d'une offre (contrat HOMSLO CONTROL) ──────────────────────────
const limiteValide = (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 100000)

export function offreValide(p) {
  return !!p && typeof p.code === 'string' && typeof p.name === 'string'
    && Number.isInteger(p.price) && p.price >= 0
    && /^[A-Z]{3}$/.test(p.currency)
    && (p.period === 'month' || p.period === 'year')
    && limiteValide(p.max_units) && limiteValide(p.max_users)
}

// ── Appel à HOMSLO CONTROL (3 s maximum, jamais d'erreur levée) ──────────────
async function appelerControl(fn, corps, fetchFn) {
  const ctrl = new AbortController()
  const minuteur = setTimeout(() => ctrl.abort(), 3000)
  try {
    const r = await fetchFn(`${URL_CONTROL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { apikey: CLE_PUBLIQUE, Authorization: `Bearer ${CLE_PUBLIQUE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    })
    if (!r.ok) return null
    const j = await r.json()
    return Array.isArray(j) ? j[0] : j
  } catch (e) {
    return null
  } finally {
    clearTimeout(minuteur)
  }
}

// Liste des offres actives, ou null (panne, liste vide, champ invalide)
export async function lireOffresControl(fetchFn = fetch) {
  const j = await appelerControl('saas_public_plans', { p_product: PRODUIT }, fetchFn)
  const liste = j && Array.isArray(j.plans) ? j.plans.filter(offreValide) : []
  return liste.length ? liste : null
}

// Retrouve une offre par son code.
// - CONTROL répond avec une liste : seule une offre de cette liste est valable (une offre retirée est refusée)
// - CONTROL ne répond pas : prix de secours
export async function trouverOffre(code, fetchFn = fetch) {
  const liste = await lireOffresControl(fetchFn)
  if (liste) {
    const o = liste.find(p => p.code === code)
    return o ? { offre: o, source: 'control' } : null
  }
  const s = PLANS_SECOURS.find(p => p.code === code)
  return s ? { offre: s, source: 'secours' } : null
}

// Durée de l'essai réglée dans CONTROL (1 à 90 jours), sinon 10 jours
export async function lireDureeEssai(fetchFn = fetch) {
  const d = await appelerControl('saas_public_info', { p_product: PRODUIT }, fetchFn)
  const n = d ? Number(d.trial_days) : NaN
  return Number.isInteger(n) && n >= 1 && n <= 90 ? n : DUREE_ESSAI_DEFAUT
}

// ── Dates ────────────────────────────────────────────────────────────────────
// Ajoute un mois ou un an sans déborder (31 janvier + 1 mois = 28 ou 29 février)
export function ajouterPeriode(date, periode) {
  const d = new Date(date.getTime())
  const jour = d.getUTCDate()
  d.setUTCDate(1)
  if (periode === 'year') d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  const dernier = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(jour, dernier))
  return d
}

// ── Documents d'abonnement écrits par le serveur ─────────────────────────────
export function construireEssai(jours, maintenant = new Date()) {
  const fin = new Date(maintenant.getTime() + jours * 86400000)
  return {
    plan: 'essai',
    statut: 'actif',
    dateDebut: maintenant.toISOString(),
    dateFinEssai: fin.toISOString(),
    dateProchaineFacture: null,
    dateFinGrace: null,
    maxChambres: 999,
    maxUtilisateurs: 999,
    paiements: [],
    createdAt: maintenant.toISOString(),
    updatedAt: maintenant.toISOString(),
  }
}

// ancien : abonnement actuel (ou null) ; paiement : document de la collection « paiements »
// Un renouvellement de la même offre prolonge à partir de l'échéance, pas de la date du paiement.
export function construireAbonnement(ancien, paiement, maintenant = new Date()) {
  let base = maintenant
  if (ancien && ancien.statut === 'actif' && ancien.plan !== 'essai' && ancien.planCode === paiement.planCode) {
    const fin = new Date(ancien.dateProchaineFacture)
    if (!isNaN(fin.getTime()) && fin > maintenant) base = fin
  }
  return {
    plan: paiement.planCode,
    planCode: paiement.planCode,
    planNom: paiement.planNom,
    statut: 'actif',
    facturation: paiement.periode === 'year' ? 'annuel' : 'mensuel',
    periode: paiement.periode,
    prix: paiement.prix,
    devise: paiement.devise,
    dateDebut: maintenant.toISOString(),
    dateProchaineFacture: ajouterPeriode(base, paiement.periode).toISOString(),
    dateFinGrace: null,
    // limites copiées au moment du paiement (une correction faite plus tard dans CONTROL ne touche pas les abonnements en cours)
    maxChambres: limiteOuIllimite(paiement.maxUnits),
    maxUtilisateurs: limiteOuIllimite(paiement.maxUsers),
    dernierPaiement: {
      paiementId: paiement.paiementId,
      montant: paiement.prix,
      operateur: paiement.operateur,
      agregateur: paiement.agregateur,
      date: maintenant.toISOString(),
    },
    updatedAt: maintenant.toISOString(),
  }
}
