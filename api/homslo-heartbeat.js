// api/homslo-heartbeat.js
// Module liaison HOMSLO CONTROL — signal de vie uniquement
// Isolé : tout retirer = supprimer ce fichier + l'appel dans api/homslo-heartbeat-start.js

const VERSION_SAAS = '1.0.0'
const INTERVALLE_MS = 5 * 60 * 1000      // 5 minutes
const DELAI_MAX_MS  = 5 * 1000            // 5 secondes timeout
const ANTI_SPAM_MS  = 30 * 1000           // minimum 30s entre envois

let dernierEnvoi    = 0
let intervalleActif = null

// ── Vérification des variables d'environnement ───────────────────────────────
function verifierConfig() {
  const url   = process.env.HOMSLO_CONTROL_URL
  const api   = process.env.HOMSLO_CONTROL_APIKEY
  const badge = process.env.HOMSLO_CONTROL_BADGE

  if (!url || !api || !badge) {
    const manquantes = [
      !url   && 'HOMSLO_CONTROL_URL',
      !api   && 'HOMSLO_CONTROL_APIKEY',
      !badge && 'HOMSLO_CONTROL_BADGE',
    ].filter(Boolean).join(', ')
    console.log(`[HOMSLO] Liaison désactivée — variables manquantes : ${manquantes}`)
    return null
  }
  return { url, api, badge }
}

// ── Envoi du signal ───────────────────────────────────────────────────────────
async function envoyerSignal(config) {
  const maintenant = Date.now()

  // Anti-spam : pas plus d'un envoi toutes les 30 secondes
  if (maintenant - dernierEnvoi < ANTI_SPAM_MS) return

  dernierEnvoi = maintenant

  // Contrôleur pour le timeout de 5 secondes
  const controleur = new AbortController()
  const minuterie   = setTimeout(() => controleur.abort(), DELAI_MAX_MS)

  try {
    const reponse = await fetch(config.url, {
      method:  'POST',
      headers: {
        'apikey':       config.api,
        'Content-Type': 'application/json',
      },
      body:   JSON.stringify({
        p_key:     config.badge,
        p_version: VERSION_SAAS,
      }),
      signal: controleur.signal,
    })

    const corps = await reponse.json()

    if (corps === true) {
      console.log(`[HOMSLO] Signal envoyé — version ${VERSION_SAAS}`)
    } else if (corps === false) {
      // Badge refusé — journaliser SANS le badge
      console.warn('[HOMSLO] Avertissement : badge refusé par HOMSLO CONTROL. Vérifiez HOMSLO_CONTROL_BADGE.')
    } else {
      console.warn(`[HOMSLO] Réponse inattendue de HOMSLO CONTROL : ${JSON.stringify(corps)}`)
    }

  } catch (erreur) {
    if (erreur.name === 'AbortError') {
      console.warn('[HOMSLO] Signal non envoyé — délai de 5s dépassé.')
    } else {
      // Journaliser SANS le badge ni les clés
      console.warn(`[HOMSLO] Signal non envoyé — erreur réseau : ${erreur.message}`)
    }
    // Ne jamais faire planter le SaaS
  } finally {
    clearTimeout(minuterie)
  }
}

// ── Démarrage de la liaison ───────────────────────────────────────────────────
export function demarrerLiaisonControl() {
  const config = verifierConfig()
  if (!config) return // Variables manquantes → désactivé proprement

  // Envoi au démarrage avec un petit décalage aléatoire (1 à 10 secondes)
  const decalage = Math.floor(Math.random() * 9000) + 1000
  setTimeout(() => envoyerSignal(config), decalage)

  // Envois périodiques toutes les 5 minutes + décalage aléatoire
  if (intervalleActif) clearInterval(intervalleActif)
  intervalleActif = setInterval(() => {
    const jitter = Math.floor(Math.random() * 15000) // 0 à 15 secondes
    setTimeout(() => envoyerSignal(config), jitter)
  }, INTERVALLE_MS)

  console.log(`[HOMSLO] Liaison CONTROL activée — version ${VERSION_SAAS}`)
}

// ── Arrêt propre (utile pour les tests) ──────────────────────────────────────
export function arreterLiaisonControl() {
  if (intervalleActif) {
    clearInterval(intervalleActif)
    intervalleActif = null
  }
}
