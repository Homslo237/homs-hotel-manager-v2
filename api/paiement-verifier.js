// api/paiement-verifier.js

const PAWAPAY_URL   = 'https://api.sandbox.pawapay.cloud'
const CINETPAY_URL  = 'https://api-checkout.cinetpay.com/v2'
const PAWAPAY_KEY   = process.env.PAWAPAY_API_KEY
const CINETPAY_KEY  = process.env.CINETPAY_API_KEY
const CINETPAY_SITE = process.env.CINETPAY_SITE_ID

// ── Normaliser les statuts vers un format commun ─────────────────────────────
// HOMS utilise : SUBMITTED | COMPLETED | FAILED
function normaliserStatutPawaPay(statut) {
  if (statut === 'COMPLETED') return 'COMPLETED'
  if (statut === 'FAILED' || statut === 'DUPLICATE') return 'FAILED'
  return 'SUBMITTED'
}

function normaliserStatutCinetPay(code) {
  if (code === '00') return 'COMPLETED'
  if (['600','620','625','626','627','628','629'].includes(String(code))) return 'FAILED'
  return 'SUBMITTED'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' })
  }

  const { paiementId, agregateur } = req.query

  if (!paiementId || !agregateur) {
    return res.status(400).json({ erreur: 'Paramètres manquants' })
  }

  try {
    if (agregateur === 'pawapay') {
      const res2 = await fetch(`${PAWAPAY_URL}/deposits/${paiementId}`, {
        headers: { 'Authorization': `Bearer ${PAWAPAY_KEY}` },
      })
      const data = await res2.json()
      const statut = normaliserStatutPawaPay(data[0]?.status)
      return res.status(200).json({ succes: true, statut, data: data[0] || {} })

    } else if (agregateur === 'cinetpay') {
      const res2 = await fetch(`${CINETPAY_URL}/payment/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: CINETPAY_KEY,
          site_id: CINETPAY_SITE,
          transaction_id: paiementId,
        }),
      })
      const data = await res2.json()
      const statut = normaliserStatutCinetPay(data.data?.status)
      return res.status(200).json({ succes: true, statut, data: data.data || {} })
    }

    return res.status(400).json({ erreur: 'Agrégateur inconnu' })

  } catch (err) {
    return res.status(500).json({ succes: false, erreur: 'Erreur serveur' })
  }
}
