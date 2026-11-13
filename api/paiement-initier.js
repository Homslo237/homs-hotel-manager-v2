// api/paiement-initier.js
// L'application envoie seulement : code de l'offre, opérateur, téléphone (+ jeton Firebase).
// Le montant, l'hôtel et la période sont décidés ICI, jamais par l'application.

import { randomUUID } from 'node:crypto'
import { getDb, utilisateurDepuisRequete } from './_firebase.js'
import { trouverOffre } from './_plans.js'

const PAWAPAY_URL  = process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.cloud'
const CINETPAY_URL = 'https://api-checkout.cinetpay.com/v2'
const APP_URL      = process.env.APP_URL || 'https://homs-hotel-manager-v2.vercel.app'

// Opérateur → agrégateur, devise de l'opérateur, indicatif du pays
// (Ghana et RD Congo retirés : leurs devises ne sont pas des francs CFA)
export const OPERATEURS = {
  MTN_MOMO_CMR: { agregateur: 'pawapay',  devise: 'XAF', indicatif: '237' },
  ORANGE_CMR:   { agregateur: 'pawapay',  devise: 'XAF', indicatif: '237' },
  MTN_MOMO_CIV: { agregateur: 'pawapay',  devise: 'XOF', indicatif: '225' },
  ORANGE_CIV:   { agregateur: 'pawapay',  devise: 'XOF', indicatif: '225' },
  WAVE_SEN:     { agregateur: 'pawapay',  devise: 'XOF', indicatif: '221' },
  ORANGE_SEN:   { agregateur: 'pawapay',  devise: 'XOF', indicatif: '221' },
  MTN_CI:       { agregateur: 'cinetpay', devise: 'XOF', indicatif: '225' },
  ORANGE_CI:    { agregateur: 'cinetpay', devise: 'XOF', indicatif: '225' },
  WAVE_CI:      { agregateur: 'cinetpay', devise: 'XOF', indicatif: '225' },
  MOOV_CI:      { agregateur: 'cinetpay', devise: 'XOF', indicatif: '225' },
  MTN_BF:       { agregateur: 'cinetpay', devise: 'XOF', indicatif: '226' },
  ORANGE_BF:    { agregateur: 'cinetpay', devise: 'XOF', indicatif: '226' },
  ORANGE_ML:    { agregateur: 'cinetpay', devise: 'XOF', indicatif: '223' },
  MOOV_ML:      { agregateur: 'cinetpay', devise: 'XOF', indicatif: '223' },
}

// Numéro au format international sans « + » (ex. 6 70 12 34 56 → 237670123456)
export function normaliserTelephone(operateur, saisie) {
  const op = OPERATEURS[operateur]
  if (!op) return null
  const chiffres = String(saisie || '').replace(/\D/g, '').replace(/^00/, '')
  if (chiffres.length < 8 || chiffres.length > 15) return null
  if (chiffres.startsWith(op.indicatif) && chiffres.length >= op.indicatif.length + 8) return chiffres
  return op.indicatif + chiffres // le 0 initial des numéros ivoiriens (10 chiffres) fait partie du numéro
}

async function initierPawaPay(deps, p) {
  const r = await deps.fetch(`${PAWAPAY_URL}/deposits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${deps.env.pawapayKey}` },
    body: JSON.stringify({
      depositId: p.paiementId,
      amount: String(p.prix),
      currency: p.devisePaiement,
      correspondent: p.operateur,
      payer: { type: 'MSISDN', address: { value: p.msisdn } },
      customerTimestamp: new Date().toISOString(),
      statementDescription: 'HOMS Abonnement',
    }),
  })
  const data = await r.json().catch(() => ({}))
  const refuse = data.status === 'REJECTED' || data.status === 'DUPLICATE_IGNORED'
  const ok = r.ok && !refuse
  if (!ok) console.error('paiement-initier pawapay', r.status, JSON.stringify(data).slice(0, 500))
  const code = data.rejectionReason?.rejectionCode
  return {
    ok,
    erreur: data.rejectionReason?.rejectionMessage || data.errorMessage || data.message
      || `Paiement refusé par l'opérateur (code ${r.status}${code ? ' ' + code : ''})`,
    lien: null,
  }
}

async function initierCinetPay(deps, p) {
  const r = await deps.fetch(`${CINETPAY_URL}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: deps.env.cinetpayKey,
      site_id: deps.env.cinetpaySite,
      transaction_id: p.paiementId,
      amount: p.prix,
      currency: 'XOF',
      description: 'HOMS Abonnement',
      notify_url: `${APP_URL}/api/paiement-verifier`,
      return_url: APP_URL,
      channels: 'MOBILE_MONEY',
      lang: 'fr',
      metadata: JSON.stringify({ operateur: p.operateur }),
    }),
  })
  const data = await r.json().catch(() => ({}))
  const ok = r.ok && String(data.code) === '201'
  if (!ok) console.error('paiement-initier cinetpay', r.status, JSON.stringify(data).slice(0, 500))
  return {
    ok,
    erreur: data.message || `Erreur de paiement (code ${r.status})`,
    lien: data.data?.payment_url || null,
  }
}

export async function traiter(req, res, deps) {
  if (req.method !== 'POST') return res.status(405).json({ succes: false, erreur: 'Méthode non autorisée' })

  const user = await deps.utilisateur(req)
  if (!user) return res.status(401).json({ succes: false, erreur: 'Connexion requise' })

  const { planCode, operateur, telephone } = req.body || {}
  const op = OPERATEURS[operateur]
  if (!planCode || !op) return res.status(400).json({ succes: false, erreur: 'Offre ou opérateur invalide' })
  const msisdn = normaliserTelephone(operateur, telephone)
  if (!msisdn) return res.status(400).json({ succes: false, erreur: 'Numéro de téléphone invalide' })

  // Le prix vient de HOMSLO CONTROL (ou des prix de secours), jamais de l'application
  const trouve = await deps.trouverOffre(String(planCode))
  if (!trouve) return res.status(400).json({ succes: false, erreur: 'Cette offre n\'existe plus. Rechargez la page.' })
  const { offre, source } = trouve
  if (offre.code === 'essai' || !['XAF', 'XOF'].includes(offre.currency) || !(offre.price > 0)) {
    return res.status(400).json({ succes: false, erreur: 'Offre non payable par Mobile Money' })
  }

  const paiementId = op.agregateur === 'pawapay' ? randomUUID() : randomUUID().replace(/-/g, '')
  const ref = deps.db.collection('paiements').doc(paiementId)
  await ref.set({
    paiementId, hotelId: user.uid, email: user.email,
    planCode: offre.code, planNom: offre.name, prix: offre.price, devise: offre.currency, periode: offre.period,
    maxUnits: offre.max_units ?? null, maxUsers: offre.max_users ?? null, // limites figées au moment du paiement
    sourcePrix: source, agregateur: op.agregateur, operateur,
    telephone: '***' + msisdn.slice(-4),
    statut: 'EN_ATTENTE', creeLe: new Date().toISOString(),
  })

  const params = { paiementId, prix: offre.price, operateur, msisdn, devisePaiement: op.devise }
  const r = op.agregateur === 'pawapay' ? await initierPawaPay(deps, params) : await initierCinetPay(deps, params)

  if (!r.ok) {
    await ref.update({ statut: 'ECHEC_INITIATION' })
    return res.status(400).json({ succes: false, erreur: r.erreur })
  }
  return res.status(200).json({ succes: true, paiementId, statut: 'SUBMITTED', lien: r.lien })
}

export default async function handler(req, res) {
  try {
    return await traiter(req, res, {
      utilisateur: utilisateurDepuisRequete,
      db: getDb(),
      trouverOffre: (code) => trouverOffre(code),
      fetch: (...a) => fetch(...a),
      env: {
        pawapayKey: process.env.PAWAPAY_API_KEY,
        cinetpayKey: process.env.CINETPAY_API_KEY,
        cinetpaySite: process.env.CINETPAY_SITE_ID,
      },
    })
  } catch (e) {
    console.error('paiement-initier', e && e.message)
    return res.status(500).json({ succes: false, erreur: 'Erreur serveur' })
  }
}
