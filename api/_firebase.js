// api/_firebase.js
// Accès Firebase côté SERVEUR (firebase-admin). Les règles Firestore ne s'appliquent pas ici :
// c'est ce qui permet au serveur, et à lui seul, d'écrire l'abonnement.
// Variable Vercel requise : FIREBASE_SERVICE_ACCOUNT (contenu complet du fichier JSON de la clé).

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function application() {
  if (getApps().length) return getApps()[0]
  const brut = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!brut) throw new Error('Variable FIREBASE_SERVICE_ACCOUNT absente')
  const cle = JSON.parse(brut)
  if (cle.private_key) cle.private_key = cle.private_key.replace(/\\n/g, '\n')
  return initializeApp({ credential: cert(cle) })
}

export function getDb() {
  return getFirestore(application())
}

// Lit « Authorization: Bearer <jeton Firebase> » et renvoie { uid, email } ou null
export async function utilisateurDepuisRequete(req) {
  const entete = (req.headers && (req.headers.authorization || req.headers.Authorization)) || ''
  const m = /^Bearer (.+)$/.exec(entete)
  if (!m) return null
  try {
    const d = await getAuth(application()).verifyIdToken(m[1])
    return { uid: d.uid, email: d.email || '' }
  } catch (e) {
    return null
  }
}
