// Liaison de HOMS-Hôtel Manager avec HOMSLO CONTROL (contrat version 2).
// Aucun secret ici : seule la clé PUBLIQUE de HOMSLO CONTROL, faite pour figurer dans le code.
// Tout appel est « envoie et oublie » : une panne ne bloque jamais l'inscription ni l'application.

const URL_CONTROL = 'https://qqfbltdllbpsfhubzpzr.supabase.co'
const CLE_PUBLIQUE = 'sb_publishable_WGJgkHN7V9B0D-Cnq_r_CQ_bI_Fpi6g'
const PRODUIT = 'homs-hotel'
export const DUREE_ESSAI_DEFAUT = 10 // durée de secours si HOMSLO CONTROL ne répond pas
const CODE = /^[A-Z0-9]{8}$/
const MAX_ESSAIS = 5

async function appeler(fn, corps, delaiMs) {
  const controle = typeof AbortController !== 'undefined' ? new AbortController() : null
  const minuteur = controle ? setTimeout(() => controle.abort(), delaiMs) : null
  try {
    const r = await fetch(`${URL_CONTROL}/rest/v1/rpc/${fn}`, {
      method: 'POST', credentials: 'omit', cache: 'no-store', keepalive: true,
      signal: controle ? controle.signal : undefined,
      headers: { apikey: CLE_PUBLIQUE, Authorization: `Bearer ${CLE_PUBLIQUE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    })
    let data = null
    try { data = await r.json() } catch (e) {}
    return { ok: r.ok, status: r.status, data }
  } catch (e) {
    return { ok: false, status: 0, data: null }
  } finally {
    if (minuteur) clearTimeout(minuteur)
  }
}

// ─── Code du partenaire : gardé 30 jours, sans cookie ────────────────────────
export function rememberRef() {
  let ref = ''
  try { ref = String(new URLSearchParams(location.search).get('ref') || '').toUpperCase() } catch (e) {}
  if (CODE.test(ref)) {
    try { sessionStorage.setItem('homs_ref', ref) } catch (e) {}
    try { localStorage.setItem('homs_ref2', JSON.stringify({ c: ref, e: Date.now() + 30 * 864e5 })) } catch (e) {}
  }
}

export function currentRef() {
  try { const r = String(sessionStorage.getItem('homs_ref') || ''); if (CODE.test(r)) return r } catch (e) {}
  try {
    const s = JSON.parse(localStorage.getItem('homs_ref2') || 'null')
    if (s && CODE.test(String(s.c || '')) && Number(s.e) > Date.now()) return s.c
    if (s) localStorage.removeItem('homs_ref2')
  } catch (e) {}
  return null
}

// ─── File d'attente : les appels qui échouent par réseau repartent à l'ouverture suivante ───
const CLE_FILE = 'homs_control_file'
const tenteesCetteSession = new Set()
let enCours = false

function lireFile() {
  try { const f = JSON.parse(localStorage.getItem(CLE_FILE) || '[]'); return Array.isArray(f) ? f : [] } catch (e) { return [] }
}
function ecrireFile(f) {
  try { localStorage.setItem(CLE_FILE, JSON.stringify(f.slice(-50))) } catch (e) {}
}

export async function traiterFile() {
  if (enCours) return
  enCours = true
  try {
    while (lireFile().length) {
      const item = lireFile()[0]
      const r = await appeler(item.fn, item.body, 8000)
      if (r.ok || r.status === 400) {
        // accepté, ou refus définitif : on ne réessaie jamais un 400
        ecrireFile(lireFile().slice(1))
      } else {
        // panne : on garde l'appel, une tentative de plus par ouverture de l'application
        const file = lireFile()
        if (file.length && !tenteesCetteSession.has(item.id)) {
          tenteesCetteSession.add(item.id)
          file[0].essais = (file[0].essais || 0) + 1
          if (file[0].essais >= MAX_ESSAIS) file.shift()
          ecrireFile(file)
        }
        break // l'ordre est respecté : le signal ne part jamais avant l'inscription
      }
    }
  } finally {
    enCours = false
  }
}

function enfiler(fn, body) {
  const file = lireFile()
  file.push({ id: `${Date.now()}-${Math.random()}`, fn, body, essais: 0 })
  ecrireFile(file)
  traiterFile()
}

// ─── Inscription et signaux ──────────────────────────────────────────────────
export function reportSignup({ company, name, email, phone, country, externalId }) {
  enfiler('submit_saas_signup', {
    p_code: currentRef(),
    p_company: String(company || '').trim().slice(0, 120),
    p_name: String(name || '').trim().slice(0, 120),
    p_email: String(email || '').trim().slice(0, 200),
    p_phone: phone || null,
    p_product: PRODUIT,
    p_country: country || null,
    p_external_id: externalId,
  })
}

// kind : trial_started | trial_ended | subscribed | payment_made | cancelled | reactivated
export function reportEvent(kind, externalId) {
  enfiler('report_saas_event', { p_product: PRODUIT, p_external_id: externalId, p_kind: kind })
}

// La fin d'essai n'est signalée qu'une seule fois par hôtel
export function signalerFinEssai(hotelId) {
  if (!hotelId) return
  const cle = `homs_${hotelId}_fin_essai_signalee`
  try {
    if (localStorage.getItem(cle)) return
    localStorage.setItem(cle, '1')
  } catch (e) { return }
  reportEvent('trial_ended', hotelId)
}

// ─── Durée d'essai réglée dans HOMSLO CONTROL ────────────────────────────────
const CLE_ESSAI = 'homs_essai_jours'
let dureeMemoire = null
const dureeValide = (n) => Number.isInteger(n) && n >= 1 && n <= 90

// Réponse immédiate : dernière valeur lue, sinon la durée de secours
export function dureeEssaiActuelle() {
  if (dureeValide(dureeMemoire)) return dureeMemoire
  try { const n = Number(localStorage.getItem(CLE_ESSAI)); if (dureeValide(n)) return n } catch (e) {}
  return DUREE_ESSAI_DEFAUT
}

// Interroge HOMSLO CONTROL (3 secondes maximum) ; en cas d'échec ou de réponse invalide, valeur précédente ou de secours
export async function chargerDureeEssai() {
  const r = await appeler('saas_public_info', { p_product: PRODUIT }, 3000)
  const d = Array.isArray(r.data) ? r.data[0] : r.data
  const jours = d ? Number(d.trial_days) : NaN
  if (r.ok && d && d.product === PRODUIT && dureeValide(jours)) {
    dureeMemoire = jours
    try { localStorage.setItem(CLE_ESSAI, String(jours)) } catch (e) {}
  }
  return dureeEssaiActuelle()
}

// Au démarrage de l'application : mémoriser le code du partenaire et renvoyer ce qui attend
if (typeof window !== 'undefined') {
  rememberRef()
  traiterFile()
}
