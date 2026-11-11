// api/essai-demarrer.js
// Crée l'abonnement d'essai de l'hôtel connecté, côté serveur, une seule fois.
// Durée lue dans HOMSLO CONTROL (10 jours si CONTROL ne répond pas).
// Appelée à l'inscription, et à la connexion si un compte n'a pas encore d'abonnement.

import { getDb, utilisateurDepuisRequete } from './_firebase.js'
import { lireDureeEssai, construireEssai } from './_plans.js'

export async function traiter(req, res, deps) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erreur: 'Méthode non autorisée' })

  const user = await deps.utilisateur(req)
  if (!user) return res.status(401).json({ ok: false, erreur: 'Connexion requise' })

  const ref = deps.db.collection('hotels').doc(user.uid).collection('infos').doc('abonnement')
  const existant = await ref.get()
  if (existant.exists) return res.status(200).json({ ok: true, cree: false })

  const jours = await deps.dureeEssai()
  const essai = construireEssai(jours, new Date())
  try {
    await ref.create(essai) // échoue si le document existe déjà (deux appels en même temps)
  } catch (e) {
    if (e && (e.code === 6 || e.code === 'already-exists')) return res.status(200).json({ ok: true, cree: false })
    throw e
  }
  return res.status(200).json({ ok: true, cree: true, dateFinEssai: essai.dateFinEssai })
}

export default async function handler(req, res) {
  try {
    return await traiter(req, res, {
      utilisateur: utilisateurDepuisRequete,
      db: getDb(),
      dureeEssai: () => lireDureeEssai(),
    })
  } catch (e) {
    console.error('essai-demarrer', e && e.message)
    return res.status(500).json({ ok: false, erreur: 'Erreur serveur' })
  }
}
