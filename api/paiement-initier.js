// api/paiement-initier.js

const PAWAPAY_URL   = 'https://api.sandbox.pawapay.cloud'
const CINETPAY_URL  = 'https://api-checkout.cinetpay.com/v2'

const PAWAPAY_KEY   = process.env.PAWAPAY_API_KEY
const CINETPAY_KEY  = process.env.CINETPAY_API_KEY
const CINETPAY_SITE = process.env.CINETPAY_SITE_ID

// ── Mapping opérateur → agrégateur ──────────────────────────────────────────
const ROUTAGE = {
  // PawaPay
  MTN_MOMO_CMR:   'pawapay',
  ORANGE_CMR:     'pawapay',
  MTN_MOMO_CIV:   'pawapay',
  ORANGE_CIV:     'pawapay',
  WAVE_SEN:       'pawapay',
  ORANGE_SEN:     'pawapay',
  MTN_MOMO_GHA:   'pawapay',
  AIRTEL_RDC:     'pawapay',
  // CinetPay
  MTN_CI:         'cinetpay',
  ORANGE_CI:      'cinetpay',
  WAVE_CI:        'cinetpay',
  MOOV_CI:        'cinetpay',
  MTN_BF:         'cinetpay',
  ORANGE_BF:      'cinetpay',
  ORANGE_ML:      'cinetpay',
  MOOV_ML:        'cinetpay',
}

// ── PawaPay ──────────────────────────────────────────────────────────────────
async function initierPawaPay(paiementId, montant, telephone, operateur, plan) {
  const res = await fetch(`${PAWAPAY_URL}/deposits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAWAPAY_KEY}`,
    },
    body: JSON.stringify({
      depositId: paiementId,
      amount: String(montant),
      currency: 'XAF',
      correspondent: operateur,
      payer: { type:'MSISDN', address:{ value: telephone } },
      customerTimestamp: new Date().toISOString(),
      statementDescription: `HOMS Plan ${plan}`,
    }),
  })
  const data = await res.json()
  return { ok: res.ok, data, agregateur: 'pawapay' }
}

// ── CinetPay ─────────────────────────────────────────────────────────────────
async function initierCinetPay(paiementId, montant, telephone, operateur, plan) {
  const res = await fetch(`${CINETPAY_URL}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: CINETPAY_KEY,
      site_id: CINETPAY_SITE,
      transaction_id: paiementId,
      amount: montant,
      currency: 'XOF',
      description: `HOMS Plan ${plan}`,
      notify_url: `${process.env.VERCEL_URL}/api/paiement-webhook`,
      channels: 'MOBILE_MONEY',
      metadata: JSON.stringify({ operateur, telephone }),
    }),
  })
  const data = await res.json()
  return { ok: res.ok && data.code === '201', data, agregateur: 'cinetpay' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' })
  }

  const { montant, telephone, operateur, hotelId, plan, facturation } = req.body

  if (!montant || !telephone || !operateur || !hotelId || !plan) {
    return res.status(400).json({ erreur: 'Données manquantes' })
  }

  const paiementId  = `HOMS-${hotelId.slice(0,8)}-${Date.now()}`
  const agregateur  = ROUTAGE[operateur]

  if (!agregateur) {
    return res.status(400).json({ erreur: `Opérateur non supporté : ${operateur}` })
  }

  try {
    let resultat

    if (agregateur === 'pawapay') {
      resultat = await initierPawaPay(paiementId, montant, telephone, operateur, plan)
    } else {
      resultat = await initierCinetPay(paiementId, montant, telephone, operateur, plan)
    }

    if (resultat.ok) {
      return res.status(200).json({
        succes: true,
        paiementId,
        agregateur,
        statut: 'SUBMITTED',
        data: resultat.data,
      })
    } else {
      return res.status(400).json({
        succes: false,
        erreur: resultat.data?.message || 'Erreur paiement',
        agregateur,
      })
    }
  } catch (err) {
    return res.status(500).json({ succes: false, erreur: 'Erreur serveur' })
  }
}
