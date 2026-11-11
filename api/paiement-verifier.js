// api/paiement-verifier.js
// Interroge l'agrégateur, contrôle le montant, puis ACTIVE l'abonnement côté serveur (une seule fois).
// L'application ne peut plus écrire son abonnement : elle ne fait qu'attendre la réponse d'ici.

import { getDb, utilisateurDepuisRequete } from './_firebase.js'
import { construireAbonnement } from './_plans.js'

const PAWAPAY_URL  = process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.cloud'
const CINETPAY_URL = 'https://api-checkout.cinetpay.com/v2'
const CODES_ECHEC_CINETPAY = ['600', '620', '625', '626', '627', '628', '629']

// Retourne { statut: 'COMPLETED' | 'FAILED' | 'SUBMITTED', montant }
async function interroger(p, deps) {
  if (p.agregateur === 'pawapay') {
    const r = await deps.fetch(`${PAWAPAY_URL}/deposits/${p.paiementId}`, {
      headers: { Authorization: `Bearer ${deps.env.pawapayKey}` },
    })
    const j = await r.json().catch(() => null)
    const d = Array.isArray(j) ? j[0] : j
    const s = d && d.status
    if (s === 'COMPLETED') return { statut: 'COMPLETED', montant: Number(d.depositedAmount ?? d.requestedAmount) }
    if (s === 'FAILED' || s === 'REJECTED') return { statut: 'FAILED' }
    return { statut: 'SUBMITTED' }
  }
  const r = await deps.fetch(`${CINETPAY_URL}/payment/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: deps.env.cinetpayKey, site_id: deps.env.cinetpaySite, transaction_id: p.paiementId }),
  })
  const j = await r.json().catch(() => null)
  const st = j && j.data && j.data.status
  if (j && String(j.code) === '00' && st === 'ACCEPTED') return { statut: 'COMPLETED', montant: Number(j.data.amount) }
  if (st === 'REFUSED' || (j && CODES_ECHEC_CINETPAY.includes(String(j.code)))) return { statut: 'FAILED' }
  return { statut: 'SUBMITTED' }
}

export async function traiter(req, res, deps) {
  if (req.method !== 'GET') return res.status(405).json({ succes: false, erreur: 'Méthode non autorisée' })

  const user = await deps.utilisateur(req)
  if (!user) return res.status(401).json({ succes: false, erreur: 'Connexion requise' })

  const paiementId = String((req.query && req.query.paiementId) || '')
  if (!/^[A-Za-z0-9-]{20,64}$/.test(paiementId)) return res.status(400).json({ succes: false, erreur: 'Paramètre invalide' })

  const ref = deps.db.collection('paiements').doc(paiementId)
  const snap = await ref.get()
  // même réponse si le paiement n'existe pas ou appartient à un autre hôtel
  if (!snap.exists || snap.data().hotelId !== user.uid) {
    return res.status(404).json({ succes: false, erreur: 'Paiement introuvable' })
  }
  const p = snap.data()

  if (p.statut === 'ACTIVE') return res.status(200).json({ succes: true, statut: 'COMPLETED' })
  if (p.statut === 'ANOMALIE') {
    return res.status(200).json({ succes: true, statut: 'FAILED', erreur: 'Montant inattendu. Contactez Homslovision avec votre référence ' + paiementId.slice(0, 8) })
  }
  if (p.statut === 'ECHEC' || p.statut === 'ECHEC_INITIATION') {
    return res.status(200).json({ succes: true, statut: 'FAILED' })
  }

  const r = await interroger(p, deps)

  if (r.statut === 'FAILED') {
    await ref.update({ statut: 'ECHEC' })
    return res.status(200).json({ succes: true, statut: 'FAILED' })
  }
  if (r.statut !== 'COMPLETED') return res.status(200).json({ succes: true, statut: 'SUBMITTED' })

  // Contrôle du montant réellement payé
  if (r.montant !== p.prix) {
    await ref.update({ statut: 'ANOMALIE', montantRecu: r.montant ?? null })
    return res.status(200).json({ succes: true, statut: 'FAILED', erreur: 'Montant inattendu. Contactez Homslovision avec votre référence ' + paiementId.slice(0, 8) })
  }

  // Activation : une seule fois, même si l'écran vérifie plusieurs fois en même temps
  const aboRef = deps.db.collection('hotels').doc(p.hotelId).collection('infos').doc('abonnement')
  await deps.db.runTransaction(async (tx) => {
    const s = await tx.get(ref)
    if (s.data().statut === 'ACTIVE') return
    const a = await tx.get(aboRef)
    const maintenant = new Date()
    tx.set(aboRef, construireAbonnement(a.exists ? a.data() : null, p, maintenant))
    tx.update(ref, { statut: 'ACTIVE', activeLe: maintenant.toISOString() })
  })
  return res.status(200).json({ succes: true, statut: 'COMPLETED' })
}

export default async function handler(req, res) {
  try {
    return await traiter(req, res, {
      utilisateur: utilisateurDepuisRequete,
      db: getDb(),
      fetch: (...a) => fetch(...a),
      env: {
        pawapayKey: process.env.PAWAPAY_API_KEY,
        cinetpayKey: process.env.CINETPAY_API_KEY,
        cinetpaySite: process.env.CINETPAY_SITE_ID,
      },
    })
  } catch (e) {
    console.error('paiement-verifier', e && e.message)
    return res.status(500).json({ succes: false, erreur: 'Erreur serveur' })
  }
}
