// api/homslo-heartbeat-start.js
// Point d'entrée Vercel pour déclencher le heartbeat
// Appelé automatiquement par un cron Vercel (voir vercel.json)

import { demarrerLiaisonControl } from './homslo-heartbeat.js'

// Lancer le signal immédiatement à chaque appel du cron
const VERSION_SAAS = '1.0.0'
const DELAI_MAX_MS = 5 * 1000

export default async function handler(req, res) {
  // Sécurité : uniquement les appels internes Vercel Cron
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ erreur: 'Non autorisé' })
  }

  const url   = process.env.HOMSLO_CONTROL_URL
  const api   = process.env.HOMSLO_CONTROL_APIKEY
  const badge = process.env.HOMSLO_CONTROL_BADGE

  if (!url || !api || !badge) {
    console.log('[HOMSLO] Liaison désactivée — variables manquantes')
    return res.status(200).json({ statut: 'desactive' })
  }

  const controleur = new AbortController()
  const minuterie   = setTimeout(() => controleur.abort(), DELAI_MAX_MS)

  try {
    const reponse = await fetch(url, {
      method:  'POST',
      headers: {
        'apikey':       api,
        'Content-Type': 'application/json',
      },
      body:   JSON.stringify({
        p_key:     badge,
        p_version: VERSION_SAAS,
      }),
      signal: controleur.signal,
    })

    const corps = await reponse.json()

    if (corps === true) {
      console.log(`[HOMSLO] Signal envoyé — version ${VERSION_SAAS}`)
      return res.status(200).json({ statut: 'ok' })
    } else if (corps === false) {
      console.warn('[HOMSLO] Avertissement : badge refusé par HOMSLO CONTROL.')
      return res.status(200).json({ statut: 'badge_refuse' })
    } else {
      console.warn(`[HOMSLO] Réponse inattendue : ${JSON.stringify(corps)}`)
      return res.status(200).json({ statut: 'reponse_inattendue' })
    }

  } catch (erreur) {
    if (erreur.name === 'AbortError') {
      console.warn('[HOMSLO] Signal non envoyé — délai de 5s dépassé.')
      return res.status(200).json({ statut: 'timeout' })
    }
    console.warn(`[HOMSLO] Erreur réseau : ${erreur.message}`)
    return res.status(200).json({ statut: 'erreur_reseau' })
  } finally {
    clearTimeout(minuterie)
  }
}
