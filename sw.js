// ─── HOMS Hotel Manager — Service Worker PWA ─────────────────────────────────
// Changer ce nom force le nettoyage des anciens fichiers en mémoire.
const CACHE_NAME = 'homs-v2.0'

// Fichiers mis en cache pour fonctionner hors ligne
const FICHIERS_CACHE = [
  '/',
  '/index.html',
  '/logo-homs.png',
  '/logo-homslovision.png',
  '/logo-homslovision-blanc.png',
  '/manifest.json',
]

// ─── Installation : mise en cache des fichiers essentiels ─────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Un fichier absent n'empêche pas l'installation des autres
      Promise.allSettled(FICHIERS_CACHE.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

// ─── Activation : suppression des anciens caches ──────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((cle) => cle !== CACHE_NAME).map((cle) => caches.delete(cle)))
    )
  )
  self.clients.claim()
})

// ─── Interception des requêtes ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const requete = event.request
  if (requete.method !== 'GET') return

  const url = new URL(requete.url)

  // Services externes : jamais interceptés
  if (url.hostname.includes('googleapis.com')) return
  if (url.hostname.includes('firebaseio.com')) return
  if (url.hostname.includes('anthropic.com')) return

  // Routes /api/ (paiement, abonnement, heartbeat…) : toujours le réseau, jamais le cache
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return

  // Pages : réseau d'abord, pour toujours obtenir la dernière version déployée.
  // Hors ligne, on retombe sur la dernière version gardée en mémoire.
  if (requete.mode === 'navigate') {
    event.respondWith(
      fetch(requete)
        .then((reponse) => {
          if (reponse && reponse.status === 200) {
            const copie = reponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copie))
          }
          return reponse
        })
        .catch(() => caches.match('/index.html').then((enCache) => enCache || caches.match('/')))
    )
    return
  }

  // Autres fichiers (scripts à empreinte, images…) : cache d'abord, mise à jour en arrière-plan
  event.respondWith(
    caches.match(requete).then((enCache) => {
      const reseau = fetch(requete).then((reponse) => {
        if (reponse && reponse.status === 200) {
          const copie = reponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(requete, copie))
        }
        return reponse
      })
      if (enCache) {
        reseau.catch(() => {}) // pas grave si hors ligne
        return enCache
      }
      return reseau
    })
  )
})

// ─── Message de mise à jour ───────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
