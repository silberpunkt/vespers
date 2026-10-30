/* import.js -- Beladrome's inputbox. user1, 5 x 2026:
     "I would love to have a file inputbox:
      Size: [-] 5 [+] lines [// Dragover Here //] [Input image...]"

   An image comes in by drop or by the file button. It is cut
   to cells by luma.js (the same ladder the console uses), its
   shadow is written by yampal.js, packed if the browser can
   deflate, and it is set into the page as a message. Bela is
   then asked to chirp. The text of the message is the whole
   picture: select it and copy it, and it can be pasted into a
   chat.

   Nothing leaves the machine: the image is read in the page.
   Needs window.LUMA and window.YAMPAL, loaded before this. */
(function () {
  'use strict';
  var BL = '⠀', NL = String.fromCharCode(10);
  var rowsEl = document.getElementById('imp-rows'), say = document.getElementById('imp-say');
  var drop = document.getElementById('imp-drop'), file = document.getElementById('imp-file');
  var rowsN = 5, last = null, lastName = '', packOn = true, grade = 'ladder', vineSweeps = 4, vineTries = 16;   // ladder: luma.js's rungs; garden: garden.js's atlas, by shape
  try { var kept = +localStorage.getItem('beladrome rows'); if (kept >= 1 && kept <= 15) rowsN = kept; } catch (e) {}

  function tell(s) { say.textContent = s; }
  function title(name) {                  // a file's name -> a headline in capitals
    var base = String(name || 'picture'), dot = base.lastIndexOf('.'), out = '', i, c, letters = 0;
    if (dot > 0) base = base.slice(0, dot);
    base = base.toUpperCase();
    for (i = 0; i < base.length && out.length < 40; i++) {
      c = base.charAt(i);
      if ((c >= 'A' && c <= 'Z')) { out += c; letters++; }
      else if (c >= '0' && c <= '9') out += c;
      else if (out && out.charAt(out.length - 1) !== ' ') out += ' ';
    }
    if (i < base.length && out.lastIndexOf(' ') > 8) out = out.slice(0, out.lastIndexOf(' '));   // cut short: end on a whole word
    while (out.charAt(out.length - 1) === ' ') out = out.slice(0, -1);
    return letters ? out : 'PICTURE';
  }
  function item(col) {                    // luma.js's colour -> a yampal item
    if (col.charAt(0) === 'q') return { c222: [+col.charAt(1), +col.charAt(2), +col.charAt(3)] };
    return { c444: [parseInt(col.charAt(1), 16), parseInt(col.charAt(2), 16), parseInt(col.charAt(3), 16)] };
  }
  // cells -> { lines, shadow (classic), cells }
  function compose(r, name) {
    var lines = [title(name).split(' ').join(BL)], items = [{ mode: 'positional' }, { pal: 11 }];
    var x, y, k, line, prev = null, run = 0, cells = 0;
    function flush() { while (run > 0) { var t = Math.min(8, run); items.push({ run: t }); run -= t; } }
    for (y = 0; y < r.h; y++) {
      line = '';
      for (x = 0; x < r.w; x++) {
        k = r.cells[y * r.w + x];
        if (!k) { line += BL; continue; }
        var n = Array.from(k[1]).length;      // a plant of marks is as many cells as it has code points, all one colour
        line += k[1]; cells += n;
        if (k[2] === prev) run += n;
        else { flush(); items.push(item(k[2])); prev = k[2]; run += n - 1; }
      }
      while (line.length > 1 && line.charAt(line.length - 1) === BL) line = line.slice(0, -1);
      lines.push(line || BL);
    }
    flush();
    return { lines: lines, shadow: window.YAMPAL.encode(items), cells: cells };
  }
  function statements(shadow) {
    var sl = window.YAMPAL.slots(shadow), out = [], i, d;
    for (i = 0; i < sl.length; i++) { d = sl[i]; if (d.length) out.push(d.length === 1 ? d[0] : d[0] * 16 + d[1]); }
    return out;
  }
  function shape(bytes, marks, wide) {    // as section 12 of the article, and packed.js
    var nib = [], per = [], lines = [], i, DIG = window.YAMPAL.DIG;
    bytes.forEach(function (b) { nib.push(b >> 4, b & 15); });
    for (i = 0; i < nib.length; i += marks) per.push(nib.slice(i, i + marks));
    if (per.length > 1 && per[per.length - 1].length <= 2) per[per.length - 2] = per[per.length - 2].concat(per.pop());
    for (i = 0; i < per.length; i += wide) lines.push(per.slice(i, i + wide));
    if (lines.length > 1 && lines[lines.length - 1].length < 2) lines[lines.length - 1].unshift(lines[lines.length - 2].pop());
    return lines.map(function (l) {
      return BL + BL + l.map(function (p) {
        return '.' + p.map(function (v) { return String.fromCharCode(DIG[v]); }).join('');
      }).join('');
    });
  }
  function classicLines(shadow) {         // a classic shadow, broken before a period at 76
    var per = shadow.split('.').slice(1).map(function (p) { return '.' + p; }), out = [], i;
    for (i = 0; i < per.length; i += 76) out.push(BL + BL + per.slice(i, i + 76).join(''));
    return out;
  }
  function deflate(bytes) {               // -> a promise of bytes, or of null where the browser cannot
    if (typeof CompressionStream === 'undefined') return Promise.resolve(null);
    try {
      var cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter();
      w.write(new Uint8Array(bytes)); w.close();
      return new Response(cs.readable).arrayBuffer().then(function (b) { return Array.from(new Uint8Array(b)); },
        function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  function show(lines, note) {
    var old = document.getElementById('imported'), feed = document.querySelector('[role="feed"]');
    if (old) old.remove();
    var div = document.createElement('div'), p = document.createElement('p');
    div.className = 'msg'; div.id = 'imported';
    // A LANDING: one blank line after the shadow, inside the message. A sweep that ends exactly on the shadow's
    // last line is hard to make; user1 had to take the next picture's headline too and delete it. The blank line
    // gives the hand somewhere to stop, and pastes as nothing.
    lines = lines.concat([BL]);
    lines.forEach(function (l, i) { if (i) p.appendChild(document.createElement('br')); p.appendChild(document.createTextNode(l)); });
    div.appendChild(p);
    feed.insertBefore(div, feed.firstChild);
    tell(note);
    try { window.__belaPaint(true); } catch (e) { tell(note + ' · Bela would not chirp: ' + e); }
  }
  // a picture as { w, h, data } -> set into the page. -> a promise of what was written
  function fromPic(pic, name) {
    // THE LINES ASKED FOR ARE ALL SPENT ON THE PICTURE. A picture on a dark field came out with rows of nothing
    // above and below it (user1's taijitu, 5 x 2026: three of fifteen lines were empty). So it is cut once to find
    // where the dark margins are, and cut again from inside them.
    function cut(box) {                   // box: left, top, right, bottom, as shares of the picture
      var bw = pic.w * (box[2] - box[0]), bh = pic.h * (box[3] - box[1]);
      var c = Math.round(rowsN * 2 * bw / bh), bx = box.slice(), wide = false;
      if (c > 78) { var keep = 78 / c, mid = (box[0] + box[2]) / 2, half = (box[2] - box[0]) * keep / 2;   // too wide: the middle of it
        bx[0] = mid - half; bx[2] = mid + half; c = 78; wide = true; }
      if (c < 2) c = 2;
      var out = grade === 'garden' && window.GARDEN ? window.GARDEN.cells(pic, { cols: c, rows: rowsN, crop: bx })
        : window.LUMA.cells(pic, { cols: c, rows: rowsN, mode: 'luma', fine: true, crop: bx });
      out.box = bx; out.wide = wide; return out;
    }
    var r = cut([0, 0, 1, 1]), x, y, l, t, rt, bt, trimmed = false, pass;
    for (pass = 0; pass < 3; pass++) {                // a margin thinner than a cell shows only on the next cut
      l = r.w; t = r.h; rt = -1; bt = -1;
      for (y = 0; y < r.h; y++) for (x = 0; x < r.w; x++) if (r.cells[y * r.w + x]) {
        if (x < l) l = x; if (x > rt) rt = x; if (y < t) t = y; if (y > bt) bt = y; }
      if (rt < 0 || (l === 0 && t === 0 && rt === r.w - 1 && bt === r.h - 1)) break;
      var bw0 = r.box[2] - r.box[0], bh0 = r.box[3] - r.box[1];
      r = cut([r.box[0] + bw0 * l / r.w, r.box[1] + bh0 * t / r.h, r.box[0] + bw0 * (rt + 1) / r.w, r.box[1] + bh0 * (bt + 1) / r.h]);
      trimmed = true;
    }
    var cols = r.w, crop = r.wide;
    // THE VINE grows from the same pots the ladder found, but takes its time, so the rest waits on it
    var grown = grade === 'vine' && window.VINE ? window.VINE.grow(pic, { cols: r.w, rows: rowsN, crop: r.box, sweeps: vineSweeps, tries: vineTries,
      step: function (d, t, e) { tell('growing ' + Math.round(100 * d / t) + '% · error ' + Math.round(e)); } }) : Promise.resolve(r);
    return grown.then(function (r) {
    if (r.canvas) { var old = document.getElementById('imp-canvas'); if (old) old.remove(); r.canvas.id = 'imp-canvas'; r.canvas.title = 'as the vine saw itself while growing'; r.canvas.style.cssText = 'display:block;margin:4px 14px;border:1px solid #333'; say.parentNode.appendChild(r.canvas); }
    var c = compose(r, name), st = statements(c.shadow), classic = c.shadow.split('.').length - 1;
    var head = cols + ' by ' + rowsN + ' · ' + c.cells + ' cells · classic ' + classic + ' periods';
    if (!packOn) { show(c.lines.concat(classicLines(c.shadow)), head); return Promise.resolve({ lines: c.lines, classic: classic, packed: 0 }); }
    return deflate(st).then(function (z) {
      var packed = z ? shape([0x11].concat(z), 6, 76) : null, n = packed ? packed.join('').split('.').length - 1 : 0;
      if (packed && n < classic) show(c.lines.concat(packed), head + ' · packed ' + n + (crop ? ' · the middle of a wide picture' : '') + (trimmed ? ' · dark margins trimmed' : ''));
      else show(c.lines.concat(classicLines(c.shadow)), head + (z ? ' · packing would not shorten it' : ' · this browser cannot deflate: classic'));
      return { lines: c.lines, classic: classic, packed: n };
    });
    });
  }
  function make() {
    if (!last) return;
    var w = last.naturalWidth, h = last.naturalHeight, s = Math.min(1, 1200 / Math.max(w, h));
    var cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(h * s));
    var cx = cv.getContext('2d'); cx.drawImage(last, 0, 0, cv.width, cv.height);
    var d;
    try { d = cx.getImageData(0, 0, cv.width, cv.height); }
    catch (e) { tell('the browser would not hand over the pixels: ' + e); return; }
    fromPic({ w: cv.width, h: cv.height, data: d.data }, lastName);
  }
  function take(f) {
    if (!f) return;
    if (!f.type || f.type.indexOf('image/') !== 0) { tell('not an image: ' + f.name); return; }
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function () { last = img; lastName = f.name; URL.revokeObjectURL(url); make(); };
    img.onerror = function () { URL.revokeObjectURL(url); tell('could not open ' + f.name); };
    img.src = url;
  }
  function setRows(n) {
    rowsN = Math.max(1, Math.min(15, n)); rowsEl.textContent = rowsN;
    try { localStorage.setItem('beladrome rows', String(rowsN)); } catch (e) {}
    make();
  }
  rowsEl.textContent = rowsN;
  document.getElementById('imp-less').onclick = function (e) { e.preventDefault(); setRows(rowsN - 1); };
  document.getElementById('imp-more').onclick = function (e) { e.preventDefault(); setRows(rowsN + 1); };
  document.getElementById('imp-pick').onclick = function (e) { e.preventDefault(); file.click(); };
  document.getElementById('imp-way').onclick = function (e) {
    e.preventDefault(); packOn = !packOn; this.textContent = packOn ? 'packed' : 'classic'; make(); };
  document.getElementById('imp-grade').onclick = function (e) {
    e.preventDefault(); grade = grade === 'ladder' ? 'garden' : grade === 'garden' ? 'vine' : 'ladder'; this.textContent = grade; make(); };
  file.onchange = function () { take(file.files[0]); file.value = ''; };
  // a drop anywhere on the page is taken; the box only says where to aim
  addEventListener('dragover', function (e) { e.preventDefault(); drop.className = 'over'; });
  addEventListener('dragleave', function () { drop.className = ''; });
  addEventListener('drop', function (e) {
    e.preventDefault(); drop.className = '';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) take(e.dataTransfer.files[0]);
  });
  // COPY. A packed shadow is cleared away once its picture is painted, so there is nothing to see where it
  // stands, and a selection drawn by hand stops short of it (user1's taijitu, 5 x 2026, arrived with one line of
  // its shadow and stayed plain). This takes the whole message, to the last mark, and shows what it took.
  document.getElementById('imp-copy').onclick = function (e) {
    e.preventDefault();
    var p = document.querySelector('#imported p');
    if (!p) { tell('nothing imported yet'); return; }
    var text = '', c, r = document.createRange(), sel = window.getSelection();
    for (c = p.firstChild; c; c = c.nextSibling) text += c.nodeName === 'BR' ? String.fromCharCode(10) : c.nodeValue;
    r.selectNodeContents(p); sel.removeAllRanges(); sel.addRange(r);     // seen to be taken, and Ctrl+C works if the next line cannot
    var lines = text.split(String.fromCharCode(10)).length;
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(text).then(function () { tell('copied: ' + lines + ' lines, ' + text.length + ' characters'); },
        function () { tell('selected, ' + lines + ' lines: press Ctrl+C'); });
    else tell('selected, ' + lines + ' lines: press Ctrl+C');
  };
  window.__dromeImport = function (pic, name, rows, how) { if (rows) { rowsN = rows; rowsEl.textContent = rowsN; } if (how) { grade = how; document.getElementById('imp-grade').textContent = grade; } return fromPic(pic, name); };
  // a picture by its address, for the hands: a file beside the page, loaded and handed to the inputbox
  window.__dromeVine = function (sweeps, tries) { vineSweeps = sweeps; vineTries = tries; };
  window.__dromeOpen = function (src, rows, how) {
    return new Promise(function (ok, no) {
      var img = new Image();
      img.onload = function () { last = img; lastName = src.split('/').pop(); if (rows) { rowsN = rows; rowsEl.textContent = rowsN; } if (how) { grade = how; document.getElementById('imp-grade').textContent = grade; }
        try { make(); ok('opened ' + lastName + ' ' + img.naturalWidth + ' by ' + img.naturalHeight); } catch (e) { no(String(e)); } };
      img.onerror = function () { no('could not open ' + src); };
      img.src = src;
    });
  };
})();
