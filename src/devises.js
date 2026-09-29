// ─── Liste des devises ISO 4217 ───────────────────────────────────────────────
// Format : { code, symbole, nom }
export const DEVISES = [
  { code:'XOF', symbole:'FCFA', nom:'Franc CFA (Afrique de l\'Ouest)' },
  { code:'XAF', symbole:'FCFA', nom:'Franc CFA (Afrique Centrale)' },
  { code:'EUR', symbole:'€',    nom:'Euro' },
  { code:'USD', symbole:'$',    nom:'Dollar américain' },
  { code:'GBP', symbole:'£',    nom:'Livre sterling' },
  { code:'MAD', symbole:'DH',   nom:'Dirham marocain' },
  { code:'DZD', symbole:'DA',   nom:'Dinar algérien' },
  { code:'TND', symbole:'DT',   nom:'Dinar tunisien' },
  { code:'EGP', symbole:'E£',   nom:'Livre égyptienne' },
  { code:'NGN', symbole:'₦',    nom:'Naira nigérian' },
  { code:'GHS', symbole:'GH₵',  nom:'Cedi ghanéen' },
  { code:'KES', symbole:'KSh',  nom:'Shilling kényan' },
  { code:'ZAR', symbole:'R',    nom:'Rand sud-africain' },
  { code:'TZS', symbole:'TSh',  nom:'Shilling tanzanien' },
  { code:'UGX', symbole:'USh',  nom:'Shilling ougandais' },
  { code:'RWF', symbole:'FRw',  nom:'Franc rwandais' },
  { code:'ETB', symbole:'Br',   nom:'Birr éthiopien' },
  { code:'GNF', symbole:'FG',   nom:'Franc guinéen' },
  { code:'CDF', symbole:'FC',   nom:'Franc congolais' },
  { code:'MGA', symbole:'Ar',   nom:'Ariary malgache' },
  { code:'MUR', symbole:'₨',    nom:'Roupie mauricienne' },
  { code:'SCR', symbole:'₨',    nom:'Roupie seychelloise' },
  { code:'CVE', symbole:'$',    nom:'Escudo cap-verdien' },
  { code:'GMD', symbole:'D',    nom:'Dalasi gambien' },
  { code:'LRD', symbole:'L$',   nom:'Dollar libérien' },
  { code:'SLL', symbole:'Le',   nom:'Leone sierra-léonais' },
  { code:'MRU', symbole:'UM',   nom:'Ouguiya mauritanien' },
  { code:'BIF', symbole:'FBu',  nom:'Franc burundais' },
  { code:'DJF', symbole:'Fdj',  nom:'Franc djiboutien' },
  { code:'KMF', symbole:'CF',   nom:'Franc comorien' },
  { code:'MZN', symbole:'MT',   nom:'Metical mozambicain' },
  { code:'AOA', symbole:'Kz',   nom:'Kwanza angolais' },
  { code:'ZMW', symbole:'ZK',   nom:'Kwacha zambien' },
  { code:'BWP', symbole:'P',    nom:'Pula botswanais' },
  { code:'NAD', symbole:'N$',   nom:'Dollar namibien' },
  { code:'LSL', symbole:'L',    nom:'Loti lesothan' },
  { code:'SZL', symbole:'E',    nom:'Lilangeni swazi' },
  { code:'MWK', symbole:'MK',   nom:'Kwacha malawien' },
  { code:'ZWL', symbole:'Z$',   nom:'Dollar zimbabwéen' },
  { code:'SDG', symbole:'ج.س',  nom:'Livre soudanaise' },
  { code:'SSP', symbole:'SSP',  nom:'Livre sud-soudanaise' },
  { code:'SOS', symbole:'Sh',   nom:'Shilling somalien' },
  { code:'ERN', symbole:'Nfk',  nom:'Nakfa érythréen' },
  { code:'LYD', symbole:'LD',   nom:'Dinar libyen' },
  { code:'STN', symbole:'Db',   nom:'Dobra santoméen' },
  { code:'CAD', symbole:'CA$',  nom:'Dollar canadien' },
  { code:'CHF', symbole:'CHF',  nom:'Franc suisse' },
  { code:'JPY', symbole:'¥',    nom:'Yen japonais' },
  { code:'CNY', symbole:'¥',    nom:'Yuan chinois' },
  { code:'INR', symbole:'₹',    nom:'Roupie indienne' },
  { code:'AUD', symbole:'A$',   nom:'Dollar australien' },
  { code:'NZD', symbole:'NZ$',  nom:'Dollar néo-zélandais' },
  { code:'BRL', symbole:'R$',   nom:'Réal brésilien' },
  { code:'MXN', symbole:'MX$',  nom:'Peso mexicain' },
  { code:'ARS', symbole:'AR$',  nom:'Peso argentin' },
  { code:'CLP', symbole:'CL$',  nom:'Peso chilien' },
  { code:'COP', symbole:'CO$',  nom:'Peso colombien' },
  { code:'PEN', symbole:'S/',   nom:'Sol péruvien' },
  { code:'RUB', symbole:'₽',    nom:'Rouble russe' },
  { code:'TRY', symbole:'₺',    nom:'Livre turque' },
  { code:'AED', symbole:'AED',  nom:'Dirham des Émirats' },
  { code:'SAR', symbole:'SAR',  nom:'Riyal saoudien' },
  { code:'QAR', symbole:'QAR',  nom:'Riyal qatari' },
  { code:'KWD', symbole:'KD',   nom:'Dinar koweïtien' },
  { code:'ILS', symbole:'₪',    nom:'Shekel israélien' },
  { code:'SGD', symbole:'S$',   nom:'Dollar de Singapour' },
  { code:'HKD', symbole:'HK$',  nom:'Dollar de Hong Kong' },
  { code:'KRW', symbole:'₩',    nom:'Won sud-coréen' },
  { code:'THB', symbole:'฿',    nom:'Baht thaïlandais' },
  { code:'MYR', symbole:'RM',   nom:'Ringgit malaisien' },
  { code:'IDR', symbole:'Rp',   nom:'Roupie indonésienne' },
  { code:'PHP', symbole:'₱',    nom:'Peso philippin' },
  { code:'VND', symbole:'₫',    nom:'Dong vietnamien' },
  { code:'PKR', symbole:'₨',    nom:'Roupie pakistanaise' },
  { code:'BDT', symbole:'৳',    nom:'Taka bangladais' },
  { code:'LKR', symbole:'Rs',   nom:'Roupie sri-lankaise' },
  { code:'SEK', symbole:'kr',   nom:'Couronne suédoise' },
  { code:'NOK', symbole:'kr',   nom:'Couronne norvégienne' },
  { code:'DKK', symbole:'kr',   nom:'Couronne danoise' },
  { code:'PLN', symbole:'zł',   nom:'Zloty polonais' },
  { code:'CZK', symbole:'Kč',   nom:'Couronne tchèque' },
  { code:'HUF', symbole:'Ft',   nom:'Forint hongrois' },
  { code:'RON', symbole:'lei',  nom:'Leu roumain' },
  { code:'UAH', symbole:'₴',    nom:'Hryvnia ukrainienne' },
]

// ─── Correspondance pays → devise (codes région ISO 3166 → code devise) ──────
const PAYS_VERS_DEVISE = {
  // Zone franc CFA — Afrique de l'Ouest (XOF)
  BJ:'XOF', BF:'XOF', CI:'XOF', GW:'XOF', ML:'XOF', NE:'XOF', SN:'XOF', TG:'XOF',
  // Zone franc CFA — Afrique Centrale (XAF)
  CM:'XAF', CF:'XAF', TD:'XAF', CG:'XAF', GQ:'XAF', GA:'XAF',
  // Autres pays africains
  MA:'MAD', DZ:'DZD', TN:'TND', EG:'EGP', NG:'NGN', GH:'GHS', KE:'KES', ZA:'ZAR',
  TZ:'TZS', UG:'UGX', RW:'RWF', ET:'ETB', GN:'GNF', CD:'CDF', MG:'MGA', MU:'MUR',
  SC:'SCR', CV:'CVE', GM:'GMD', LR:'LRD', SL:'SLL', MR:'MRU', BI:'BIF', DJ:'DJF',
  KM:'KMF', MZ:'MZN', AO:'AOA', ZM:'ZMW', BW:'BWP', NA:'NAD', LS:'LSL', SZ:'SZL',
  MW:'MWK', ZW:'ZWL', SD:'SDG', SS:'SSP', SO:'SOS', ER:'ERN', LY:'LYD', ST:'STN',
  // Europe
  FR:'EUR', DE:'EUR', ES:'EUR', IT:'EUR', PT:'EUR', BE:'EUR', NL:'EUR', AT:'EUR',
  IE:'EUR', FI:'EUR', GR:'EUR', LU:'EUR', SK:'EUR', SI:'EUR', EE:'EUR', LV:'EUR', LT:'EUR',
  GB:'GBP', CH:'CHF', SE:'SEK', NO:'NOK', DK:'DKK', PL:'PLN', CZ:'CZK', HU:'HUF',
  RO:'RON', UA:'UAH', RU:'RUB', TR:'TRY',
  // Amériques
  US:'USD', CA:'CAD', MX:'MXN', BR:'BRL', AR:'ARS', CL:'CLP', CO:'COP', PE:'PEN',
  // Asie / Moyen-Orient / Océanie
  JP:'JPY', CN:'CNY', IN:'INR', AU:'AUD', NZ:'NZD', SG:'SGD', HK:'HKD', KR:'KRW',
  TH:'THB', MY:'MYR', ID:'IDR', PH:'PHP', VN:'VND', PK:'PKR', BD:'BDT', LK:'LKR',
  AE:'AED', SA:'SAR', QA:'QAR', KW:'KWD', IL:'ILS',
}

// ─── Détection automatique via la langue/région du téléphone ─────────────────
// Renvoie un code devise (ex: 'XOF') ou null si non détectable
export function detecterDevise() {
  try {
    const locale = navigator.language || (navigator.languages && navigator.languages[0]) || ''
    // Format attendu : 'fr-CM', 'en-US', 'fr-FR'...
    const parties = locale.split('-')
    const region = parties.length > 1 ? parties[parties.length - 1].toUpperCase() : null
    if (region && PAYS_VERS_DEVISE[region]) return PAYS_VERS_DEVISE[region]
  } catch (e) {}
  return null
}

// ─── Trouver une devise par son code ─────────────────────────────────────────
export function trouverDevise(code) {
  return DEVISES.find(d => d.code === code) || DEVISES[0]
}

// ─── Lecture / sauvegarde de la devise choisie (globale à l'hôtel) ───────────
const CLE_DEVISE = 'homs_devise'

export function lireDevise() {
  try {
    const code = localStorage.getItem(CLE_DEVISE)
    return code || null
  } catch { return null }
}

export function sauvegarderDevise(code) {
  try { localStorage.setItem(CLE_DEVISE, code) } catch {}
}
