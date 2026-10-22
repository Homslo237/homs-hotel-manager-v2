// api/homslo-heartbeat-start.js
// Signal de vie vers HOMSLO CONTROL
// URL : https://homs-hotel-manager-v2.vercel.app/api/homslo-heartbeat-start

const VERSION_SAAS = '1.0.0'
const DELAI_MAX_MS = 5 * 1000

export default async function handler(req, res) {

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
    return res.status(200).json({ statut: 'desactive', manquantes })
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
      body: JSON.stringify({
        p_key:     badge,
        p_version: VERSION_SAAS,
      }),
      signal: controleur.signal,
    })

    const corps = await reponse.json()

    if (corps === true) {
      console.log(`[HOMSLO] Signal envoyé — version ${VERSION_SAAS}`)
      return res.status(200).json({ statut: 'ok', version: VERSION_SAAS })
    } else if (corps === false) {
      console.warn('[HOMSLO] Avertissement : badge refusé par HOMSLO CONTROL.')
      return res.status(200).json({ statut: 'badge_refuse' })
    } else {
      console.warn(`[HOMSLO] Réponse inattendue : ${JSON.stringify(corps)}`)
      return res.status(200).json({ statut: 'reponse_inattendue', corps })
    }

  } catch (erreur) {
    if (erreur.name === 'AbortError') {
      console.warn('[HOMSLO] Signal non envoyé — délai de 5s dépassé.')
      return res.status(200).json({ statut: 'timeout' })
    }
    console.warn(`[HOMSLO] Erreur réseau : ${erreur.message}`)
    return res.status(200).json({ statut: 'erreur_reseau', message: erreur.message })

  } finally {
    clearTimeout(minuterie)
  }
}
