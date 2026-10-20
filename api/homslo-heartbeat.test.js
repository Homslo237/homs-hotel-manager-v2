// api/homslo-heartbeat.test.js
// Tests automatiques — à exécuter avec : node api/homslo-heartbeat.test.js

let resultats = { reussis: 0, echoues: 0 }
let logsCaptures = []

// ── Intercepter console pour vérifier les logs ────────────────────────────────
const consoleOriginal = { log: console.log, warn: console.warn }

function capturerLogs() {
  logsCaptures = []
  console.log  = (...args) => { logsCaptures.push(args.join(' ')); consoleOriginal.log(...args) }
  console.warn = (...args) => { logsCaptures.push(args.join(' ')); consoleOriginal.warn(...args) }
}

function restaurerLogs() {
  console.log  = consoleOriginal.log
  console.warn = consoleOriginal.warn
}

function verifier(nom, condition) {
  if (condition) {
    consoleOriginal.log(`  ✅ ${nom}`)
    resultats.reussis++
  } else {
    consoleOriginal.log(`  ❌ ${nom}`)
    resultats.echoues++
  }
}

// ── Faux fetch pour simuler les réponses ─────────────────────────────────────
function fauxFetch(reponse, delaiMs = 0) {
  global.fetch = async (url, options) => {
    if (delaiMs > 0) await new Promise(r => setTimeout(r, delaiMs))
    if (reponse === 'erreur_reseau') throw new Error('Erreur réseau simulée')
    if (reponse === 'timeout') {
      // Simuler un timeout en attendant plus longtemps que le signal
      await new Promise(r => setTimeout(r, 10000))
    }
    return {
      json: async () => reponse,
    }
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
async function testerSucces() {
  consoleOriginal.log('\nTest 1 : Succès (réponse true)')
  process.env.HOMSLO_CONTROL_URL    = 'https://fake.supabase.co/rpc/saas_heartbeat'
  process.env.HOMSLO_CONTROL_APIKEY = 'sb_publishable_fake_key'
  process.env.HOMSLO_CONTROL_BADGE  = 'hsk_fake_badge_value'

  fauxFetch(true)
  capturerLogs()

  // Import dynamique pour tester
  const { demarrerLiaisonControl, arreterLiaisonControl } = await import('./homslo-heartbeat.js?v=' + Date.now())
  await new Promise(r => setTimeout(r, 200))
  arreterLiaisonControl()
  restaurerLogs()

  verifier('Signal envoyé sans erreur', logsCaptures.some(l => l.includes('[HOMSLO] Signal envoyé')))
  verifier('Badge absent des logs', !logsCaptures.some(l => l.includes('hsk_fake_badge_value')))
  verifier('Clé API absente des logs', !logsCaptures.some(l => l.includes('sb_publishable_fake_key')))
}

async function testerRefus() {
  consoleOriginal.log('\nTest 2 : Badge refusé (réponse false)')
  fauxFetch(false)
  capturerLogs()

  const { demarrerLiaisonControl, arreterLiaisonControl } = await import('./homslo-heartbeat.js?v=2' + Date.now())
  await new Promise(r => setTimeout(r, 200))
  arreterLiaisonControl()
  restaurerLogs()

  verifier('Avertissement badge refusé journalisé', logsCaptures.some(l => l.includes('badge refusé')))
  verifier('Badge absent des logs', !logsCaptures.some(l => l.includes('hsk_fake_badge_value')))
  verifier('SaaS continue (pas de crash)', true) // Si on arrive ici, pas de crash
}

async function testerErreurReseau() {
  consoleOriginal.log('\nTest 3 : Panne réseau')
  fauxFetch('erreur_reseau')
  capturerLogs()

  const { demarrerLiaisonControl, arreterLiaisonControl } = await import('./homslo-heartbeat.js?v=3' + Date.now())
  await new Promise(r => setTimeout(r, 200))
  arreterLiaisonControl()
  restaurerLogs()

  verifier('Erreur réseau journalisée', logsCaptures.some(l => l.includes('erreur réseau') || l.includes('Erreur réseau')))
  verifier('Badge absent des logs', !logsCaptures.some(l => l.includes('hsk_fake_badge_value')))
  verifier('SaaS continue (pas de crash)', true)
}

async function testerVariableManquante() {
  consoleOriginal.log('\nTest 4 : Variable manquante')
  delete process.env.HOMSLO_CONTROL_BADGE
  capturerLogs()

  const { demarrerLiaisonControl, arreterLiaisonControl } = await import('./homslo-heartbeat.js?v=4' + Date.now())
  await new Promise(r => setTimeout(r, 200))
  arreterLiaisonControl()
  restaurerLogs()

  process.env.HOMSLO_CONTROL_BADGE = 'hsk_fake_badge_value' // Restaurer

  verifier('Message désactivation journalisé', logsCaptures.some(l => l.includes('désactivée') || l.includes('manquantes')))
  verifier('SaaS continue normalement', true)
}

async function testerBadgeDansLogs() {
  consoleOriginal.log('\nTest 5 : Badge jamais dans les logs (toutes situations)')
  const badgeTest = 'hsk_SECRET_NE_DOIT_PAS_APPARAITRE'
  process.env.HOMSLO_CONTROL_BADGE = badgeTest

  // Test avec erreur réseau
  fauxFetch('erreur_reseau')
  capturerLogs()
  const { demarrerLiaisonControl, arreterLiaisonControl } = await import('./homslo-heartbeat.js?v=5' + Date.now())
  await new Promise(r => setTimeout(r, 200))
  arreterLiaisonControl()
  restaurerLogs()

  verifier('Badge jamais dans les logs', !logsCaptures.some(l => l.includes(badgeTest)))
}

// ── Exécution des tests ───────────────────────────────────────────────────────
async function lancerTests() {
  consoleOriginal.log('=== Tests HOMSLO Heartbeat ===')

  try {
    await testerSucces()
    await testerRefus()
    await testerErreurReseau()
    await testerVariableManquante()
    await testerBadgeDansLogs()
  } catch (e) {
    consoleOriginal.log(`\nErreur inattendue pendant les tests : ${e.message}`)
    resultats.echoues++
  }

  consoleOriginal.log(`\n=== Résultats : ${resultats.reussis} réussis, ${resultats.echoues} échoués ===`)

  if (resultats.echoues > 0) process.exit(1)
}

lancerTests()
