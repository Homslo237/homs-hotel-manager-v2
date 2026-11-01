import { parseDateFR, dansPeriode, formaterDateFR } from './periodes'

// Rapports PDF A4 : historique des séjours et historique des actions

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR')
const e = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const tiret = (t) => (t === undefined || t === null || t === '' ? '—' : e(t))

const STATUTS = { en_cours: 'En cours', a_venir: 'Réservé', termine: 'Terminé', no_show: 'No-show' }
const TYPES_JOURNAL = {
  connexion: 'Connexion', deconnexion: 'Déconnexion',
  sejour_cree: 'Séjour créé', sejour_termine: 'Séjour terminé',
  sejour_prolonge: 'Séjour prolongé', cloture_caisse: 'Clôture de caisse',
}

// ─── Fusion des sources ──────────────────────────────────────────────────────
// Séjours : fiches archivées + séjours en cours dans l'application (les plus récents l'emportent),
// complétés par l'ancien historique pour les jours sans fiche détaillée.
export function fusionnerSejours({ archive = [], vivants = [], historique = [], periode }) {
  const parId = new Map()
  const ajouter = (s) => { if (s && s.id != null) parId.set(String(s.id), s) }
  archive.forEach(ajouter)
  vivants.forEach(ajouter)
  const fiches = [...parId.values()].filter(s => dansPeriode(s.dateArrivee, periode))
  const joursCouverts = new Set(fiches.map(s => s.dateArrivee))
  const anciens = historique
    .filter(l => l && l.type === 'sejour' && !l.suite && dansPeriode(l.date, periode) && !joursCouverts.has(l.date))
    .map((l, i) => ({
      id: `ancien-${i}`, client: l.client, chambre: l.chambre, modePaiement: l.mode,
      montantNum: l.montant, dateArrivee: l.date, statut: l.noShow ? 'no_show' : 'termine', ancien: true,
    }))
  const heure = (s) => parseDateFR(`${s.dateArrivee} ${s.heureArrivee || '00:00'}`) || new Date(0)
  return [...fiches, ...anciens].sort((a, b) => heure(a) - heure(b))
}

// Journal : archive + journal récent de l'application, sans doublon
export function fusionnerJournal({ archive = [], recent = [], periode }) {
  const parId = new Map()
  const ajouter = (x) => { if (x) parId.set(x.id != null ? String(x.id) : `${x.date}|${x.type}|${x.details}`, x) }
  archive.forEach(ajouter)
  recent.forEach(ajouter)
  return [...parId.values()]
    .filter(x => dansPeriode(x.date, periode))
    .sort((a, b) => (parseDateFR(a.date) || 0) - (parseDateFR(b.date) || 0))
}

// ─── Page A4 commune ─────────────────────────────────────────────────────────
function pageA4({ identite, nomHotel, titre, periode, corps, paysage, par }) {
  const contacts = [identite.telephone1, identite.telephone2].filter(Boolean).join(' / ')
  const legal = [identite.rccm && `RCCM : ${identite.rccm}`, identite.contribuable && `NIF : ${identite.contribuable}`].filter(Boolean).join(' · ')
  const maintenant = new Date()
  const imprime = `${maintenant.toLocaleDateString('fr-FR')} à ${maintenant.toTimeString().slice(0, 5)}`
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${e(titre)} — ${e(periode.libelle)}</title>
<style>
@page{size:A4 ${paysage ? 'landscape' : 'portrait'};margin:10mm 10mm 14mm}
*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;font-size:9pt}
body{color:#111}
h1{font-size:13pt;font-weight:900;color:#1B3A6B}
.entete{display:flex;justify-content:space-between;align-items:center;border:2px solid #1B3A6B;border-radius:6px;padding:8px 12px;margin-bottom:8px}
.identite{display:flex;gap:10px;align-items:center}
.gris{font-size:8pt;color:#666}
.titre{font-weight:800;font-size:11pt;color:#1B3A6B}
.periode{background:#F0F4FF;border-left:4px solid #C9A84C;padding:5px 10px;margin-bottom:8px;font-weight:700}
.kpis{display:flex;gap:6px;margin-bottom:8px}
.kpi{flex:1;border:1.5px solid #CBD5E0;border-radius:5px;padding:5px 8px}
.kpi b{display:block;font-size:12pt;color:#1B3A6B}
table{width:100%;border-collapse:collapse}
thead{display:table-header-group}
tr{page-break-inside:avoid}
th{background:#1B3A6B;color:#fff;text-align:left;padding:4px 5px;font-size:8pt}
td{padding:3px 5px;border-bottom:1px solid #D9DDE6;font-size:8pt;vertical-align:top}
.droite{text-align:right}
.total td{font-weight:800;background:#F0F4FF;border-top:2px solid #1B3A6B}
.sous-titre{font-size:10pt;font-weight:800;color:#1B3A6B;margin:10px 0 4px;border-left:3px solid #C9A84C;padding-left:6px}
.pied{margin-top:10px;text-align:center;font-size:8pt;color:#666;border-top:1px solid #CBD5E0;padding-top:4px}
.ancien{color:#888;font-style:italic}
</style></head><body>
<div class="entete">
  <div class="identite">
    ${identite.logoUrl ? `<img src="${identite.logoUrl}" alt="" style="max-height:52px;max-width:90px">` : ''}
    <div>
      <h1>${e(nomHotel)}</h1>
      ${identite.adresse ? `<div class="gris">${e(identite.adresse)}</div>` : ''}
      ${contacts || identite.email ? `<div class="gris">${contacts ? 'Tél : ' + e(contacts) : ''}${contacts && identite.email ? ' · ' : ''}${e(identite.email || '')}</div>` : ''}
      ${legal ? `<div class="gris">${e(legal)}</div>` : ''}
    </div>
  </div>
  <div style="text-align:right"><div class="titre">${e(titre)}</div><div class="gris">Édité le ${e(imprime)}</div></div>
</div>
<div class="periode">${e(periode.libelle)}</div>
${corps}
<div class="pied">Rapport édité par ${e(par || 'le directeur')} · ${e(nomHotel)} · Propulsé par HOMS-HÔTEL MANAGER</div>
</body></html>`
}

// ─── Rapport : historique des séjours (A4 paysage) ───────────────────────────
export function htmlRapportSejours({ identite, nomHotel, periode, lignes, devise = 'FCFA', par }) {
  const total = lignes.reduce((s, x) => s + (Number(x.montantNum) || 0), 0)
  const nuits = lignes.filter(x => x.type === 'nuit').length
  const heures = lignes.filter(x => x.type === 'heure').length
  const noShows = lignes.filter(x => x.statut === 'no_show').length
  const parMode = {}
  lignes.forEach(x => { const m = x.modePaiement || 'Non précisé'; parMode[m] = (parMode[m] || 0) + (Number(x.montantNum) || 0) })

  const rangees = lignes.length === 0
    ? `<tr><td colspan="10" style="text-align:center;color:#999;padding:14px">Aucun séjour sur cette période</td></tr>`
    : lignes.map(x => {
        const arrivee = x.ancien ? x.dateArrivee : `${x.dateArrivee || ''} ${x.heureArrivee || ''}`
        const depart = x.ancien ? '' : `${x.dateDepart || x.dateArrivee || ''} ${x.heureDepart || ''}`
        return `<tr class="${x.ancien ? 'ancien' : ''}">
<td><b>${tiret(x.client)}</b><br>${tiret(x.telephone)}</td>
<td>${tiret(x.chambre)}${x.categorie ? `<br>${e(x.categorie)}` : ''}</td>
<td>${x.type === 'heure' ? 'À l\'heure' : x.type === 'nuit' ? 'À la nuit' : '—'}</td>
<td>${x.ancien ? e(arrivee) : tiret(arrivee.trim())}</td>
<td>${x.ancien ? '—' : tiret(depart.trim())}</td>
<td>${tiret(x.duree)}</td>
<td>${tiret(x.modePaiement)}</td>
<td class="droite"><b>${fmt(x.montantNum)}</b></td>
<td>${e(STATUTS[x.statut] || x.statut || '—')}</td>
<td>${tiret(x.creePar)}</td></tr>`
      }).join('')

  const modes = Object.entries(parMode).map(([m, v]) => `<tr><td>${e(m)}</td><td class="droite">${fmt(v)} ${e(devise)}</td></tr>`).join('')
  const corps = `
<div class="kpis">
  <div class="kpi"><b>${lignes.length}</b>Séjours</div>
  <div class="kpi"><b>${fmt(total)} ${e(devise)}</b>Montant des séjours</div>
  <div class="kpi"><b>${nuits}</b>À la nuit</div>
  <div class="kpi"><b>${heures}</b>À l'heure</div>
  <div class="kpi"><b>${noShows}</b>No-show</div>
</div>
<table><thead><tr><th>Client / contact</th><th>Chambre</th><th>Type</th><th>Arrivée</th><th>Départ</th><th>Durée</th><th>Paiement</th><th class="droite">Montant (${e(devise)})</th><th>Statut</th><th>Saisi par</th></tr></thead>
<tbody>${rangees}</tbody>
<tfoot><tr class="total"><td colspan="7">TOTAL</td><td class="droite">${fmt(total)}</td><td colspan="2"></td></tr></tfoot></table>
<div class="sous-titre">Par mode de paiement</div>
<table style="width:50%"><tbody>${modes || '<tr><td>—</td><td></td></tr>'}</tbody></table>
${lignes.some(x => x.ancien) ? '<p class="gris" style="margin-top:6px">Les lignes en gris proviennent de l\'ancien historique : heures, durée, contact et auteur ne sont pas disponibles.</p>' : ''}`
  return pageA4({ identite, nomHotel, titre: 'HISTORIQUE DES SÉJOURS', periode, corps, paysage: true, par })
}

// ─── Rapport : historique des actions (A4 portrait) ──────────────────────────
export function htmlRapportJournal({ identite, nomHotel, periode, lignes, par }) {
  const parType = {}
  lignes.forEach(x => { const t = TYPES_JOURNAL[x.type] || x.type || 'Autre'; parType[t] = (parType[t] || 0) + 1 })
  const resume = Object.entries(parType).map(([t, n]) => `<tr><td>${e(t)}</td><td class="droite">${n}</td></tr>`).join('')
  const rangees = lignes.length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#999;padding:14px">Aucune action enregistrée sur cette période</td></tr>`
    : lignes.map(x => `<tr><td style="white-space:nowrap">${tiret(x.date)}</td><td>${e(TYPES_JOURNAL[x.type] || x.type || 'Autre')}</td><td>${tiret(x.utilisateur)}${x.role ? `<br><span class="gris">${e(x.role)}</span>` : ''}</td><td>${tiret(x.details)}</td></tr>`).join('')
  const corps = `
<div class="kpis"><div class="kpi"><b>${lignes.length}</b>Actions enregistrées</div></div>
<div class="sous-titre">Résumé</div>
<table style="width:55%"><tbody>${resume || '<tr><td>—</td><td></td></tr>'}</tbody></table>
<div class="sous-titre">Détail chronologique</div>
<table><thead><tr><th>Date et heure</th><th>Action</th><th>Utilisateur</th><th>Détail</th></tr></thead><tbody>${rangees}</tbody></table>`
  return pageA4({ identite, nomHotel, titre: 'HISTORIQUE DES ACTIONS', periode, corps, paysage: false, par })
}

// Écrit le rapport dans la fenêtre déjà ouverte puis lance l'impression
export function ecrireEtImprimer(fenetre, html) {
  fenetre.document.open()
  fenetre.document.write(html)
  fenetre.document.close()
  fenetre.focus()
  setTimeout(() => fenetre.print(), 300)
}

// ─── Statistiques (mêmes règles que l'écran Statistiques) ────────────────────
// Les entrées et sorties diverses n'ont qu'une heure dans « date » : leur jour est celui de la clôture.
export const dateDeLigne = (h) => (parseDateFR(h.date) ? h.date : h.cloture)

export function calculerStats({ historique = [], periode, nbChambres = 0, aujourdhui = new Date() }) {
  const lignes = historique.filter(h => h && dansPeriode(dateDeLigne(h), periode))
  const somme = (liste) => liste.reduce((s, h) => s + (h.montant || 0), 0)
  const estRecette = (h) => h.type === 'sejour' || h.type === 'entree'
  const recettes = lignes.filter(estRecette)
  const sejoursOk = lignes.filter(h => h.type === 'sejour' && !h.noShow)

  const totalEntrees = somme(recettes)
  const totalSorties = somme(lignes.filter(h => h.type === 'sortie'))
  const totalSejours = somme(sejoursOk)
  const totalNoShow = somme(lignes.filter(h => h.noShow))
  // Un supplément (ligne « suite ») compte dans les montants mais pas comme un nouveau séjour
  const nbSejours = sejoursOk.filter(h => !h.suite).length

  const parMode = ['Espèces', 'Orange Money', 'MTN Mobile Money', 'Carte bancaire']
    .map(mode => ({ mode, montant: somme(recettes.filter(h => h.mode === mode)) }))

  const demain = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() + 1)
  const fin = periode.fin < demain ? periode.fin : demain
  const nbJours = Math.max(1, Math.round((fin - periode.debut) / 86400000))
  const revPAR = nbChambres > 0 ? Math.round(totalSejours / (nbChambres * nbJours)) : null

  const parJourMap = {}
  lignes.forEach(h => {
    const d = parseDateFR(dateDeLigne(h))
    if (!d) return
    const cle = formaterDateFR(d)
    parJourMap[cle] = parJourMap[cle] || { entrees: 0, sorties: 0 }
    if (estRecette(h)) parJourMap[cle].entrees += h.montant || 0
    if (h.type === 'sortie') parJourMap[cle].sorties += h.montant || 0
  })
  const parJour = periode.jours.map(d => {
    const cle = formaterDateFR(d)
    const v = parJourMap[cle] || { entrees: 0, sorties: 0 }
    return { date: cle, entrees: v.entrees, sorties: v.sorties }
  })

  const clients = {}
  sejoursOk.forEach(h => {
    if (!h.client) return
    clients[h.client] = clients[h.client] || { nom: h.client, total: 0, sejours: 0 }
    clients[h.client].total += h.montant || 0
    if (!h.suite) clients[h.client].sejours += 1
  })
  const topClients = Object.values(clients).sort((a, b) => b.total - a.total).slice(0, 5)

  return {
    nbLignes: lignes.length, totalEntrees, totalSorties, soldeNet: totalEntrees - totalSorties,
    totalSejours, totalNoShow, nbSejours, panierMoyen: Math.round(totalSejours / Math.max(nbSejours, 1)),
    parMode, revPAR, nbJours, parJour, topClients,
  }
}

export function htmlRapportStatistiques({ identite, nomHotel, periode, stats, devise = 'FCFA', par }) {
  const d = e(devise)
  const kpi = (valeur, libelle) => `<div class="kpi"><b>${valeur}</b>${libelle}</div>`
  const totalMode = stats.parMode.reduce((s, m) => s + m.montant, 0) || 1
  const modes = stats.parMode.map(m => `<tr><td>${e(m.mode)}</td><td class="droite">${fmt(m.montant)} ${d}</td><td class="droite">${Math.round(m.montant / totalMode * 100)} %</td></tr>`).join('')
  const maxJour = Math.max(...stats.parJour.map(j => Math.max(j.entrees, j.sorties)), 1)
  const barres = stats.parJour.length > 1 ? (() => {
    const L = 520, H = 110, n = stats.parJour.length, w = L / n
    return `<svg viewBox="0 0 ${L} ${H + 14}" width="100%" style="margin:6px 0">${stats.parJour.map((j, i) => {
      const hr = Math.round(j.entrees / maxJour * H), hs = Math.round(j.sorties / maxJour * H)
      const bw = Math.max(2, w * 0.38)
      return `<rect x="${i * w + w * 0.08}" y="${H - hr}" width="${bw}" height="${hr}" fill="#1B3A6B"/><rect x="${i * w + w * 0.08 + bw}" y="${H - hs}" width="${bw}" height="${hs}" fill="#E74C3C"/>`
    }).join('')}<line x1="0" y1="${H}" x2="${L}" y2="${H}" stroke="#999"/><text x="0" y="${H + 12}" font-size="8" fill="#666">${e(stats.parJour[0].date.slice(0, 5))}</text><text x="${L}" y="${H + 12}" font-size="8" fill="#666" text-anchor="end">${e(stats.parJour[n - 1].date.slice(0, 5))}</text></svg>
<div class="gris">■ <span style="color:#1B3A6B">Recettes</span> &nbsp; ■ <span style="color:#E74C3C">Dépenses</span></div>`
  })() : ''
  const jours = stats.parJour.map(j => `<tr><td>${e(j.date)}</td><td class="droite">${fmt(j.entrees)}</td><td class="droite">${fmt(j.sorties)}</td><td class="droite">${fmt(j.entrees - j.sorties)}</td></tr>`).join('')
  const clients = stats.topClients.length === 0
    ? '<tr><td colspan="3" style="text-align:center;color:#999">Aucun client sur cette période</td></tr>'
    : stats.topClients.map((c, i) => `<tr><td>${i + 1}. ${e(c.nom)}</td><td class="droite">${c.sejours}</td><td class="droite">${fmt(c.total)} ${d}</td></tr>`).join('')
  const corps = `
<div class="kpis">${kpi(fmt(stats.totalEntrees) + ' ' + d, 'Total encaissé')}${kpi(fmt(stats.totalSorties) + ' ' + d, 'Total dépensé')}${kpi(fmt(stats.soldeNet) + ' ' + d, 'Solde net')}</div>
<div class="kpis">${kpi(fmt(stats.totalSejours) + ' ' + d, 'Recettes des séjours')}${kpi(stats.nbSejours, 'Séjours')}${kpi(fmt(stats.panierMoyen) + ' ' + d, 'Panier moyen')}${kpi(stats.revPAR === null ? '—' : fmt(stats.revPAR) + ' ' + d, 'RevPAR (par chambre et par jour)')}${kpi(fmt(stats.totalNoShow) + ' ' + d, 'No-show conservés')}</div>
${barres ? `<div class="sous-titre">Évolution des recettes et des dépenses</div>${barres}` : ''}
<div class="sous-titre">Par mode de paiement</div>
<table style="width:70%"><thead><tr><th>Mode</th><th class="droite">Montant</th><th class="droite">Part</th></tr></thead><tbody>${modes}</tbody></table>
<div class="sous-titre">Détail par jour</div>
<table><thead><tr><th>Jour</th><th class="droite">Recettes (${d})</th><th class="droite">Dépenses (${d})</th><th class="droite">Solde (${d})</th></tr></thead><tbody>${jours}</tbody>
<tfoot><tr class="total"><td>TOTAL</td><td class="droite">${fmt(stats.totalEntrees)}</td><td class="droite">${fmt(stats.totalSorties)}</td><td class="droite">${fmt(stats.soldeNet)}</td></tr></tfoot></table>
<div class="sous-titre">Meilleurs clients</div>
<table><thead><tr><th>Client</th><th class="droite">Séjours</th><th class="droite">Montant</th></tr></thead><tbody>${clients}</tbody></table>
<p class="gris" style="margin-top:8px">Chiffres issus des clôtures de caisse : les opérations du jour non encore clôturées n'y figurent pas.</p>`
  return pageA4({ identite, nomHotel, titre: 'STATISTIQUES', periode, corps, paysage: false, par })
}
