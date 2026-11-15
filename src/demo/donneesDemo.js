// src/demo/donneesDemo.js
// Données FICTIVES pour le mode démo. Tout est calculé par rapport à « maintenant » :
// la démo paraît toujours vivante (séjours en cours, arrivées à venir, caisse du jour, 6 mois d'historique).
// Aucun nom, numéro ni adresse ne correspond à une vraie personne ou à un vrai établissement.

export const HOTEL_DEMO = 'demo'

export const NOMS_DEMO = {
  directeur:      'M. Mbarga (Patron)',
  receptionniste: 'Aïcha (Réception)',
  caissier:       'Paul (Caisse)',
}

const HOTELS = {
  petit: {
    nom: 'Résidence Horizon (démo)',
    adresse: 'Akwa, Douala',
    categories: [
      { nom: 'Standard', debut: 100, nombre: 6, tarifNuit: 12000, tarifHeure: 3000 },
      { nom: 'Confort',  debut: 200, nombre: 4, tarifNuit: 18000, tarifHeure: 4000 },
      { nom: 'Suite',    debut: 300, nombre: 2, tarifNuit: 30000, tarifHeure: 7000 },
    ],
    occupation: 0.5, occupationMoyenne: 0.58,
    reservations: 1, termines: 3, noShows: 1, entrees: 2, sorties: 2,
    entreeMax: 15000, sortieMax: 25000,
    charges: { salaires: 360000, electricite: 120000, eau: 30000 },
  },
  grand: {
    nom: 'Hôtel Horizon Douala (démo)',
    adresse: 'Bonanjo, Douala',
    categories: [
      { nom: 'Standard', debut: 100, nombre: 20, tarifNuit: 12000, tarifHeure: 3000 },
      { nom: 'Confort',  debut: 200, nombre: 15, tarifNuit: 18000, tarifHeure: 4000 },
      { nom: 'Premium',  debut: 300, nombre: 10, tarifNuit: 25000, tarifHeure: 6000 },
      { nom: 'Suite',    debut: 400, nombre: 5,  tarifNuit: 40000, tarifHeure: 9000 },
    ],
    occupation: 0.56, occupationMoyenne: 0.62,
    reservations: 3, termines: 8, noShows: 2, entrees: 4, sorties: 4,
    entreeMax: 60000, sortieMax: 90000,
    charges: { salaires: 1800000, electricite: 700000, eau: 150000 },
  },
}

const PRENOMS = ['Jean-Pierre', 'Aïssatou', 'Marie-Claire', 'Emmanuel', 'Fatima', 'Patrick', 'Brenda', 'Samuel', 'Grace', 'Hervé', 'Nadège', 'Ibrahim', 'Chantal', 'Boris', 'Estelle', 'Christian', 'Sandrine', 'Moussa', 'Joëlle', 'Arnaud', 'Pauline', 'Rodrigue', 'Alice', 'Yannick']
const NOMS = ['Fotso', 'Bello', 'Ngo Nyobe', 'Tchoumi', 'Oumarou', 'Essomba', 'Nkeng', 'Ndongo', 'Fomba', 'Kamga', 'Mbella', 'Mohamadou', 'Ewane', 'Tagne', 'Mvondo', 'Njoya', 'Atangana', 'Biya Ndzana', 'Kouam', 'Tchamba', 'Manga', 'Ateba']
const MODES = [['Espèces', 55], ['Orange Money', 25], ['MTN Mobile Money', 15], ['Carte bancaire', 5]]
const LIBELLES_ENTREES = ['Boissons', 'Petit-déjeuner', 'Location de salle', 'Buanderie']
const LIBELLES_SORTIES = ["Achat produits d'entretien", 'Carburant groupe électrogène', 'Réparation plomberie', 'Achat boissons', 'Transport']

// ── Outils ───────────────────────────────────────────────────────────────────
function graine(n) {
  return function () {
    n |= 0; n = (n + 0x6D2B79F5) | 0
    let t = Math.imul(n ^ (n >>> 15), 1 | n)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const p2 = (n) => String(n).padStart(2, '0')
const dateFR = (d) => `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`
const heureFR = (min) => `${p2(Math.floor(min / 60))}:${p2(min % 60)}`
const jourPlus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const entier = (rng, a, b) => a + Math.floor(rng() * (b - a + 1))
const choisir = (rng, tab) => tab[Math.floor(rng() * tab.length)]
const melanger = (rng, tab) => {
  const t = tab.slice()
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [t[i], t[j]] = [t[j], t[i]] }
  return t
}
const pondere = (rng, paires) => {
  const total = paires.reduce((s, p) => s + p[1], 0)
  let r = rng() * total
  for (const [v, w] of paires) { r -= w; if (r < 0) return v }
  return paires[0][0]
}
const arrondi5 = (m) => Math.round(m / 5) * 5

// ── Génération ───────────────────────────────────────────────────────────────
export function construireDemo(taille = 'petit', maintenant = new Date()) {
  const cfg = HOTELS[taille] || HOTELS.petit
  const rng = graine(taille === 'grand' ? 20261114 : 11142026)
  const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate())
  const minNow = maintenant.getHours() * 60 + maintenant.getMinutes()

  const chambres = cfg.categories.flatMap(c => Array.from({ length: c.nombre }, (_, i) => ({
    num: String(c.debut + i + 1), cat: c.nom, tarifNuit: c.tarifNuit, tarifHeure: c.tarifHeure,
  })))
  const receptionnistes = [NOMS_DEMO.receptionniste, 'Brice (Réception)']
  const nomClient = () => `${choisir(rng, PRENOMS)} ${choisir(rng, NOMS)}`
  const telephone = () => `+237 6 00 00 ${p2(entier(rng, 0, 99))} ${p2(entier(rng, 0, 99))}`
  const mode = () => pondere(rng, MODES)

  let compteurId = 100000
  const socle = (ch, statut) => ({
    id: ++compteurId, client: nomClient(), telephone: telephone(),
    chambre: ch.num, categorie: ch.cat, statut, modePaiement: mode(),
    creePar: choisir(rng, receptionnistes), creeParRole: 'receptionniste', montantCloture: 0,
  })
  const sejourNuit = (ch, { arrivee, nuits, heureArr, statut, mode: m }) => {
    const montantNum = ch.tarifNuit * nuits
    return {
      ...socle(ch, statut), ...(m ? { modePaiement: m } : {}),
      type: 'nuit', dateArrivee: dateFR(arrivee), heureArrivee: heureFR(heureArr),
      dateDepart: dateFR(jourPlus(arrivee, nuits)), heureDepart: '12:00',
      duree: `${nuits} nuit${nuits > 1 ? 's' : ''}`,
      montant: montantNum.toLocaleString('fr-FR'), montantNum, tarifUnitaire: ch.tarifNuit,
    }
  }
  const sejourHeure = (ch, { heureArr, heureDep, heures, statut }) => {
    const montantNum = ch.tarifHeure * heures
    return {
      ...socle(ch, statut),
      type: 'heure', dateArrivee: dateFR(aujourdhui), heureArrivee: heureFR(heureArr),
      dateDepart: dateFR(aujourdhui), heureDepart: heureFR(heureDep),
      duree: `${heures} heure${heures > 1 ? 's' : ''}`,
      montant: montantNum.toLocaleString('fr-FR'), montantNum, tarifUnitaire: ch.tarifHeure,
    }
  }

  const libres = melanger(rng, chambres)
  const nbOcc = Math.min(chambres.length, Math.round(chambres.length * cfg.occupation))
  const occupees = libres.splice(0, nbOcc)
  const nbHeure = Math.max(1, Math.round(nbOcc * 0.25))
  const sejours = []
  let prolongationFaite = false

  occupees.forEach((ch, i) => {
    if (i < nbHeure) {
      const heures = choisir(rng, [2, 2, 3, 1])
      let arr, dep
      if (i === 0 && minNow - 35 - heures * 60 >= 0) {            // histoire : un séjour à l'heure en dépassement
        dep = minNow - 35; arr = dep - heures * 60
      } else {
        const a = entier(rng, 15, Math.max(16, heures * 60 - 20))
        arr = Math.max(0, minNow - a); dep = arr + heures * 60
        if (dep <= minNow + 5) dep = Math.min(1439, minNow + 30)
      }
      if (dep > minNow - 20 || i === 0) { sejours.push(sejourHeure(ch, { heureArr: arr, heureDep: dep, heures, statut: 'en_cours' })); return }
    }
    if (!prolongationFaite) {                                      // histoire : une prolongation
      prolongationFaite = true
      const s = sejourNuit(ch, { arrivee: jourPlus(aujourdhui, -1), nuits: 2, heureArr: entier(rng, 780, 1200), statut: 'en_cours' })
      s.historiqueProlongations = [{ avant: dateFR(aujourdhui), apres: dateFR(jourPlus(aujourdhui, 1)), montant: ch.tarifNuit, unite: 'nuit' }]
      sejours.push(s); return
    }
    const nuits = pondere(rng, [[1, 5], [2, 3], [3, 1]])
    const d = entier(rng, 0, nuits - 1)
    const heureArr = d === 0 ? Math.max(0, Math.min(minNow - 5, entier(rng, 360, Math.max(361, minNow - 10)))) : entier(rng, 720, 1350)
    sejours.push(sejourNuit(ch, { arrivee: jourPlus(aujourdhui, -d), nuits, heureArr, statut: 'en_cours' }))
  })

  // Arrivées à venir
  for (let k = 0; k < cfg.reservations && libres.length; k++) {
    const ch = libres.shift()
    const debut = arrondi5(minNow + entier(rng, 130, 400))
    const aujourd = debut <= 1380
    sejours.push(sejourNuit(ch, {
      arrivee: aujourd ? aujourdhui : jourPlus(aujourdhui, 1), nuits: entier(rng, 1, 2),
      heureArr: aujourd ? debut : 840, statut: 'a_venir', mode: 'Orange Money',
    }))
  }
  // Sorties déjà faites aujourd'hui
  for (let k = 0; k < cfg.termines && libres.length; k++) {
    const ch = libres.shift()
    if (k % 3 === 2 && minNow >= 60) {
      const dep = Math.max(30, minNow - 20), arr = Math.max(0, dep - 120)
      sejours.push(sejourHeure(ch, { heureArr: arr, heureDep: dep, heures: 2, statut: 'termine' }))
    } else {
      sejours.push(sejourNuit(ch, { arrivee: jourPlus(aujourdhui, -1), nuits: 1, heureArr: entier(rng, 780, 1230), statut: 'termine' }))
    }
  }
  // No-show déjà confirmés
  if (minNow >= 130) {
    for (let k = 0; k < cfg.noShows && libres.length; k++) {
      const ch = libres.shift()
      sejours.push(sejourNuit(ch, { arrivee: aujourdhui, nuits: 1, heureArr: Math.max(0, minNow - entier(rng, 75, 200)), statut: 'no_show', mode: 'Orange Money' }))
    }
  }

  // Caisse du jour
  const maxHeure = (m) => heureFR(Math.max(0, minNow - m))
  const entreesDiverses = Array.from({ length: cfg.entrees }, (_, i) => ({
    id: 200000 + i, sens: 'entree', libelle: choisir(rng, LIBELLES_ENTREES), emetteurNom: '', emetteurContact: '',
    montant: arrondi5(entier(rng, 3000, cfg.entreeMax)), mode: mode(), heure: maxHeure(entier(rng, 5, 240)), par: choisir(rng, receptionnistes),
  }))
  const sortiesDiverses = Array.from({ length: cfg.sorties }, (_, i) => ({
    id: 300000 + i, sens: 'sortie', libelle: choisir(rng, LIBELLES_SORTIES), beneficiaireNom: '', beneficiaireContact: '',
    montant: arrondi5(entier(rng, 2000, cfg.sortieMax)), mode: 'Espèces', heure: maxHeure(entier(rng, 5, 240)), par: choisir(rng, receptionnistes),
  }))

  // Historique des 6 derniers mois (une ligne par séjour, entrée ou sortie clôturé)
  const historique = []
  for (let off = 180; off >= 1; off--) {
    const jour = jourPlus(aujourdhui, -off)
    const dow = jour.getDay(), mois = jour.getMonth()
    let occ = cfg.occupationMoyenne * (dow === 5 || dow === 6 ? 1.15 : dow === 0 ? 0.9 : 1)
    if (mois === 11 || mois === 0) occ *= 1.15
    if (mois === 7) occ *= 0.9
    occ = Math.min(0.95, Math.max(0.25, occ * (0.85 + rng() * 0.3)))
    const cloture = `${dateFR(jour)} ${heureFR(entier(rng, 1290, 1400))}`
    // arrivées du jour : un séjour de plusieurs nuits occupe sa chambre plusieurs jours (1,2 nuit en moyenne par séjour)
    melanger(rng, chambres).slice(0, Math.round(chambres.length * occ / 1.2)).forEach(ch => {
      const parHeure = rng() < 0.25
      const nuits = parHeure ? 1 : pondere(rng, [[1, 5], [2, 3], [3, 1]])
      historique.push({
        type: 'sejour', client: nomClient(), chambre: ch.num,
        montant: parHeure ? ch.tarifHeure * choisir(rng, [2, 2, 3]) : ch.tarifNuit * nuits,
        mode: mode(), date: dateFR(jourPlus(jour, -(nuits - 1))), cloture,
        noShow: rng() < 0.012, par: choisir(rng, receptionnistes), suite: false,
      })
    })
    const nbE = entier(rng, 0, 2), nbS = entier(rng, 0, 2)
    for (let k = 0; k < nbE; k++) historique.push({ type: 'entree', libelle: choisir(rng, LIBELLES_ENTREES), montant: arrondi5(entier(rng, 3000, cfg.entreeMax)), mode: mode(), date: heureFR(entier(rng, 420, 1260)), cloture, par: choisir(rng, receptionnistes) })
    for (let k = 0; k < nbS; k++) historique.push({ type: 'sortie', libelle: choisir(rng, LIBELLES_SORTIES), montant: arrondi5(entier(rng, 2000, cfg.sortieMax)), mode: 'Espèces', date: heureFR(entier(rng, 420, 1260)), cloture, par: choisir(rng, receptionnistes) })
    const dm = jour.getDate()
    const charge = (libelle, montant) => historique.push({ type: 'sortie', libelle, montant, mode: 'Espèces', date: '10:00', cloture, par: NOMS_DEMO.directeur })
    if (dm === 28) charge('Salaires du personnel', cfg.charges.salaires)
    if (dm === 5)  charge('Facture électricité', cfg.charges.electricite)
    if (dm === 10) charge('Facture eau', cfg.charges.eau)
  }

  // Journal des dernières actions
  const evenements = []
  const horodatage = (d, min) => ({ ts: new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(min / 60), min % 60), date: `${dateFR(d)} ${heureFR(min)}` })
  evenements.push({ ...horodatage(aujourdhui, Math.min(360, minNow)), type: 'connexion', utilisateur: NOMS_DEMO.receptionniste, role: 'receptionniste', details: `${NOMS_DEMO.receptionniste} s'est connecté` })
  sejours.filter(s => s.dateArrivee === dateFR(aujourdhui) && (s.statut === 'en_cours' || s.statut === 'termine')).forEach(s => {
    const [h, m] = s.heureArrivee.split(':').map(Number)
    evenements.push({ ...horodatage(aujourdhui, h * 60 + m), type: 'sejour_cree', utilisateur: s.creePar, role: 'receptionniste', details: `Séjour créé : ${s.client} · Ch. ${s.chambre} · ${s.montant} FCFA` })
  })
  sejours.filter(s => s.statut === 'termine').forEach(s => {
    evenements.push({ ...horodatage(aujourdhui, Math.max(0, minNow - 15)), type: 'sejour_termine', utilisateur: s.creePar, role: 'receptionniste', details: `Séjour terminé : ${s.client} · Ch. ${s.chambre}` })
  })
  sejours.filter(s => s.historiqueProlongations).forEach(s => {
    evenements.push({ ...horodatage(aujourdhui, Math.max(0, minNow - 40)), type: 'sejour_prolonge', utilisateur: NOMS_DEMO.receptionniste, role: 'receptionniste', details: `Séjour prolongé : ${s.client} · Ch. ${s.chambre} · +${s.historiqueProlongations[0].montant.toLocaleString('fr-FR')} FCFA` })
  })
  const hier = jourPlus(aujourdhui, -1), clotureHier = dateFR(hier)
  const soldeHier = historique.filter(l => l.cloture.startsWith(clotureHier)).reduce((s, l) => s + (l.type === 'sortie' ? -l.montant : l.montant), 0)
  evenements.push({ ...horodatage(hier, 1335), type: 'cloture_caisse', utilisateur: NOMS_DEMO.directeur, role: 'directeur', details: `Clôture de caisse · Solde net : ${soldeHier.toLocaleString('fr-FR')} FCFA` })
  evenements.push({ ...horodatage(hier, 1330), type: 'connexion', utilisateur: NOMS_DEMO.directeur, role: 'directeur', details: `${NOMS_DEMO.directeur} s'est connecté` })
  const journal = evenements.sort((a, b) => b.ts - a.ts).map((e, i) => ({ type: e.type, utilisateur: e.utilisateur, role: e.role, details: e.details, date: e.date, id: 400000 + (evenements.length - i) }))

  // Pas de sonnerie ni d'alerte au démarrage de la démo
  const alertesSonnees = {}
  sejours.forEach(s => { alertesSonnees[`rappel_${s.id}`] = true; alertesSonnees[`alerte_${s.id}`] = true; alertesSonnees[`urgent_${s.id}`] = true })

  const identite = {
    nom: cfg.nom, slogan: 'Votre confort, notre fierté', adresse: cfg.adresse,
    telephone1: '+237 6 00 00 00 01', telephone2: '', email: 'contact@horizon-demo.example',
    rccm: 'RC/DLA/0000/B/000', contribuable: 'M000000000000A',
    mentionLegale: 'Hôtel fictif - données de démonstration', logoUrl: null,
  }

  return { identite, categories: cfg.categories, sejours, entreesDiverses, sortiesDiverses, historique, journal, alertesSonnees }
}
