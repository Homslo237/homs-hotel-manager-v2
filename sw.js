// ─── HOMS Hotel Manager — Service Worker PWA ─────────────────────────────────
const CACHE_NAME = 'homs-v1.0'

// Fichiers à mettre en cache pour fonctionner hors ligne
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
  console.log('[HOMS SW] Installation...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[HOMS SW] Mise en cache des fichiers essentiels')
      return cache.addAll(FICHIERS_CACHE).catch(err => {
        console.log('[HOMS SW] Erreur cache (normal si fichiers absents) :', err)
      })
    })
  )
  self.skipWaiting()
})

// ─── Activation : nettoyage des anciens caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[HOMS SW] Activation...')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[HOMS SW] Suppression ancien cache :', key)
            return caches.delete(key)
          })
      )
    )
  )
  self.clients.claim()
})

// ─── Interception des requêtes : Cache d'abord, réseau ensuite ────────────────
self.addEventListener('fetch', (event) => {
  // On ignore les requêtes non-GET et les APIs externes
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('googleapis.com')) return
  if (event.request.url.includes('firebaseio.com')) return
  if (event.request.url.includes('anthropic.com')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Retourner le cache ET mettre à jour en arrière-plan
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone())
              })
            }
          })
          .catch(() => {}) // Pas grave si hors ligne
        return cached
      }

      // Pas en cache → réseau
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response
          // Mettre en cache la nouvelle ressource
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // Hors ligne et pas en cache → page de secours
          if (event.request.destination === 'document') {
            return caches.match('/index.html')
          }
        })
    })
  )
})

// ─── Message de mise à jour ───────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

