/*! homs-printer.js v1 — Homslo/Vision
 *  Impression DIRECTE en Bluetooth (BLE) depuis une page web, sans application intermédiaire.
 *  Imprimante testée : « Mini Pocket Printer S1 » (Bluetooth « PPS1_xxxx_BLE », papier 57 mm, 384 points).
 *  La suite d'ordres vient de notes publiques sur la famille d'imprimantes Luck Jingle.
 *  Aucune dépendance. Fonctionne dans Chrome (Android ou ordinateur), en HTTPS uniquement.
 *
 *  UTILISATION RAPIDE (à appeler dans un « clic », jamais au chargement de la page) :
 *    HomsPrinter.printTicket({
 *      title:'Ma Boutique', subtitle:'Douala',
 *      lines:[ {left:'Fanta x2', right:'1 000 FCFA'}, {left:'Castel x1', right:'700 FCFA'} ],
 *      total:{label:'TOTAL', value:'1 700 FCFA'},
 *      footer:'Merci pour votre achat !'
 *    }, { onStatus:function(s){ console.log(s); } });
 *
 *  Pour imprimer un dessin que TU as fait (canvas HTML) :  HomsPrinter.printCanvas(canvas)
 *  Les erreurs ont un champ .code : CANCELLED, CONNECT, RECONNECT, LOST, UNSUPPORTED, BUSY, RENDER
 */
(function (root) {
  'use strict';

  var SERVICE = 0xff00;     // service de l'imprimante
  var CHAR_WRITE = 0xff02;  // canal où l'on écrit
  var WIDTH = 384;          // largeur d'impression en points (papier 57 mm)

  // Réglages modifiables : HomsPrinter.config.namePrefix = 'AUTRE', etc.
  var config = {
    namePrefix: 'PPS1',   // début du nom Bluetooth de l'imprimante
    chunk: 200,           // octets par paquet (200 testé sur la S1)
    delay: 50,            // pause entre deux paquets, en millisecondes
    density: 1,           // noirceur : 0 clair, 1 normal, 2 foncé
    feed: 80,             // papier qui avance à la fin (en points : 80 ≈ 10 mm)
    threshold: 165        // seuil noir/blanc (0-255) : plus haut = plus noir
  };
  var state = { dev: null, ch: null, busy: false };

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function fail(code, msg, orig) { var e = new Error(msg || code); e.code = code; e.original = orig; return e; }
  function say(o, phase, info) { if (o && typeof o.onStatus === 'function') { try { o.onStatus(phase, info); } catch (e) {} } }

  function supported() { return !!(root.navigator && root.navigator.bluetooth); }
  function isConnected() { return !!(state.ch && state.dev && state.dev.gatt && state.dev.gatt.connected); }
  function forget() { try { if (state.dev && state.dev.gatt.connected) state.dev.gatt.disconnect(); } catch (e) {} state.dev = null; state.ch = null; }

  // ---------- connexion ----------
  async function openChannel(dev) {
    var last = null;
    for (var i = 0; i < 2; i++) {            // 2 essais : le 1er échoue parfois en Bluetooth
      try {
        var server = await dev.gatt.connect();
        var svc = await server.getPrimaryService(SERVICE);
        return await svc.getCharacteristic(CHAR_WRITE);
      } catch (e) { last = e; try { dev.gatt.disconnect(); } catch (x) {} await sleep(600); }
    }
    throw last;
  }

  // Doit être appelée DIRECTEMENT par un clic la 1re fois (Chrome ouvre une fenêtre de choix).
  async function connect(o) {
    if (!supported()) throw fail('UNSUPPORTED', 'Bluetooth web indisponible (utilise Chrome, en HTTPS).');
    if (isConnected()) return state.ch;
    state.ch = null;
    if (state.dev) {                         // déjà choisie plus tôt : reconnexion sans fenêtre de choix
      try { state.ch = await openChannel(state.dev); return state.ch; }
      catch (e) { state.dev = null; throw fail('RECONNECT', 'Reconnexion impossible : recommence pour choisir l\'imprimante.', e); }
    }
    var dev;
    try {
      say(o, 'connecting');
      dev = await root.navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: config.namePrefix }], optionalServices: [SERVICE]
      });
    } catch (e) {
      throw fail(e && e.name === 'NotFoundError' ? 'CANCELLED' : 'CONNECT', 'Aucune imprimante choisie.', e);
    }
    dev.addEventListener('gattserverdisconnected', function () { state.ch = null; });
    state.dev = dev;
    try { state.ch = await openChannel(dev); return state.ch; }
    catch (e) { throw fail('CONNECT', 'Connexion impossible (imprimante éteinte ? application du fabricant ouverte ?).', e); }
  }

  // ---------- image -> points noirs/blancs ----------
  function canvasToRaster(src, threshold) {
    var H = Math.max(1, Math.round(src.height * WIDTH / src.width));
    var c = document.createElement('canvas'); c.width = WIDTH; c.height = H;
    var g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, WIDTH, H);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, WIDTH, H);
    var px = g.getImageData(0, 0, WIDTH, H).data, bpr = WIDTH / 8, data = new Uint8Array(bpr * H);
    for (var y = 0; y < H; y++) for (var x = 0; x < WIDTH; x++) {
      var k = (y * WIDTH + x) * 4;
      if (0.299 * px[k] + 0.587 * px[k + 1] + 0.114 * px[k + 2] < threshold) data[y * bpr + (x >> 3)] |= (0x80 >> (x & 7));
    }
    var head = new Uint8Array([0x1d, 0x76, 0x30, 0x00, bpr & 255, bpr >> 8, H & 255, H >> 8]);
    var out = new Uint8Array(head.length + data.length); out.set(head, 0); out.set(data, head.length);
    return { bytes: out, rows: H };
  }

  // ---------- envoi ----------
  async function sendAll(ch, raster, o) {
    var chunk = Math.max(20, Math.min(512, config.chunk | 0)), delay = Math.max(0, config.delay | 0);
    async function w(bytes, pause, progress) {
      for (var i = 0; i < bytes.length; i += chunk) {
        var part = bytes.slice(i, i + chunk);
        if (ch.writeValueWithoutResponse) await ch.writeValueWithoutResponse(part); else await ch.writeValue(part);
        if (progress) say(o, 'sending', Math.min(100, Math.round((i + part.length) * 100 / bytes.length)));
        await sleep(delay);
      }
      if (pause) await sleep(pause);
    }
    await w(new Uint8Array([0x10, 0xFF, 0xF1, 0x03]), 80);                              // 1. activer
    await w(new Uint8Array(12), 80);                                                     // 2. réveil
    await w(new Uint8Array([0x10, 0xFF, 0x10, 0x00, config.density & 3]), 80);           // 3. noirceur
    await w(raster.bytes, 150, true);                                                    // 4. l'image
    await w(new Uint8Array([0x1B, 0x4A, Math.max(0, Math.min(255, config.feed | 0))]), 80); // 5. avancer le papier
    await w(new Uint8Array([0x10, 0xFF, 0xF1, 0x45]), 0);                                // 6. fin du travail
  }

  // Imprime un <canvas> (n'importe quelle taille : il est mis à 384 points de large).
  async function printCanvas(canvas, o) {
    if (state.busy) throw fail('BUSY', 'Une impression est déjà en cours.');
    state.busy = true;
    var phase = 'connect';
    try {
      var ch = await connect(o);                                 // 1re étape : garde le « clic » de l'utilisateur
      phase = 'render'; say(o, 'preparing');
      var raster = canvasToRaster(canvas, config.threshold);
      phase = 'send';
      await sendAll(ch, raster, o);
      say(o, 'done');
      return { rows: raster.rows };
    } catch (e) {
      if (e && e.code) throw e;
      if (phase === 'send') { state.ch = null; throw fail('LOST', 'L\'imprimante s\'est déconnectée.', e); }
      throw fail(phase === 'render' ? 'RENDER' : 'CONNECT', String(e && e.message || e), e);
    } finally { state.busy = false; }
  }

  // ---------- petit générateur de ticket (texte -> canvas) ----------
  function wrap(ctx, text, maxW) {
    var out = [], words = String(text).split(/\s+/), line = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i], test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width <= maxW) { line = test; continue; }
      if (line) out.push(line);
      while (ctx.measureText(w).width > maxW) { var k = w.length; while (k > 1 && ctx.measureText(w.slice(0, k)).width > maxW) k--; out.push(w.slice(0, k)); w = w.slice(k); }
      line = w;
    }
    if (line) out.push(line);
    return out.length ? out : [''];
  }
  // spec : { title, subtitle, lines:[string | {left,right,bold}], total:{label,value}, footer }
  function ticketCanvas(spec) {
    var S = 2, W = 384, M = 12, CW = W - 2 * M, F = 'Arial, Helvetica, sans-serif';
    function layout(ctx, draw) {
      var y = 10;
      function line(txt, font, lh, align) {
        ctx.font = font; var ls = wrap(ctx, txt, CW);
        for (var i = 0; i < ls.length; i++) { if (draw) { ctx.textAlign = align; ctx.fillText(ls[i], align === 'center' ? W / 2 : align === 'right' ? M + CW : M, y); } y += lh; }
      }
      function dash() { y += 3; if (draw) { ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(W - M, y); ctx.stroke(); ctx.setLineDash([]); } y += 9; }
      function pair(l, r, font, lh) {
        ctx.font = font; var lw = ctx.measureText(l).width, rw = ctx.measureText(r).width;
        if (lw + rw + 8 <= CW) { if (draw) { ctx.textAlign = 'left'; ctx.fillText(l, M, y); ctx.textAlign = 'right'; ctx.fillText(r, M + CW, y); } y += lh; }
        else { line(l, font, lh, 'left'); line(r, font, lh, 'right'); }
      }
      if (spec.title) line(spec.title, 'bold 24px ' + F, 29, 'center');
      if (spec.subtitle) line(spec.subtitle, '14px ' + F, 18, 'center');
      if (spec.title || spec.subtitle) dash();
      var L = spec.lines || [];
      for (var i = 0; i < L.length; i++) {
        var it = L[i];
        if (typeof it === 'string') line(it, '16px ' + F, 21, 'left');
        else if (it.right !== undefined) pair(String(it.left || ''), String(it.right), (it.bold ? 'bold ' : '') + '16px ' + F, 23);
        else line(String(it.left || ''), (it.bold ? 'bold ' : '') + '16px ' + F, 21, 'left');
      }
      if (spec.total) { dash(); pair(String(spec.total.label), String(spec.total.value), 'bold 24px ' + F, 30); }
      if (spec.footer) { dash(); line(spec.footer, '15px ' + F, 20, 'center'); }
      return y + 26;
    }
    var mc = document.createElement('canvas').getContext('2d'); mc.textBaseline = 'top';
    var H = Math.ceil(layout(mc, false));
    var cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    var g = cv.getContext('2d'); g.scale(S, S); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#000'; g.strokeStyle = '#000'; g.textBaseline = 'top'; layout(g, true);
    return cv;
  }
  async function printTicket(spec, o) {
    var cv;
    try { cv = ticketCanvas(spec); } catch (e) { throw fail('RENDER', 'Impossible de dessiner le ticket.', e); }
    return printCanvas(cv, o);
  }

  root.HomsPrinter = {
    config: config, supported: supported, isConnected: isConnected, connect: connect,
    printCanvas: printCanvas, printTicket: printTicket, ticketCanvas: ticketCanvas, forget: forget
  };
})(typeof window !== 'undefined' ? window : this);
