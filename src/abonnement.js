import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

// ── Lire l'abonnement depuis Firestore ───────────────────────────────────────
export async function lireAbonnement(uid) {
  if (!uid || uid === 'admin_local') return null
  try {
    const snap = await getDoc(doc(db, 'hotels', uid, 'infos', 'abonnement'))
    return snap.exists() ? snap.data() : null
  } catch { return null }
}

// ── Vérifier le statut de l'abonnement ──────────────────────────────────────
export function verifierStatutAbonnement(abonnement) {
  if (!abonnement) return { statut: 'inconnu', message: '', bloque: false }

  const maintenant = new Date()

  // ── Essai ──
  if (abonnement.plan === 'essai') {
    const finEssai = new Date(abonnement.dateFinEssai)
    const joursRestants = Math.ceil((finEssai - maintenant) / (1000 * 60 * 60 * 24))

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
    } else {
      return {
        statut: 'essai_expire',
        message: "Votre essai gratuit a expiré.",
        bloque: true,
      }
    }
  }

  // ── Abonnement payant actif ──
  if (abonnement.statut === 'actif') {
    return { statut: 'actif', message: '', bloque: false }
  }

  // ── Période de grâce ──
  if (abonnement.statut === 'grace') {
    const finGrace = new Date(abonnement.dateFinGrace)
    const joursRestants = Math.ceil((finGrace - maintenant) / (1000 * 60 * 60 * 24))

    if (maintenant < finGrace) {
      return {
        statut: 'grace',
        joursRestants,
        message: `🔴 Paiement en retard — ${joursRestants} jour${joursRestants > 1 ? 's' : ''} avant suspension`,
        bloque: false,
        alerte: true,
      }
    } else {
      return {
        statut: 'suspendu',
        message: "Compte suspendu pour défaut de paiement.",
        bloque: true,
      }
    }
  }

  // ── Suspendu ──
  if (abonnement.statut === 'suspendu') {
    return {
      statut: 'suspendu',
      message: "Compte suspendu. Contactez Homslovision.",
      bloque: true,
    }
  }

  return { statut: 'inconnu', message: '', bloque: false }
}

// ── Noms lisibles des plans ──────────────────────────────────────────────────
export const PLANS = {
  essai:    { nom: 'Essai gratuit', couleur: '#C9A84C' },
  basique:  { nom: 'Plan Basique',  couleur: '#2ECC71' },
  pro:      { nom: 'Plan Pro',      couleur: '#1B3A6B' },
  premium:  { nom: 'Plan Premium',  couleur: '#C9A84C' },
}
