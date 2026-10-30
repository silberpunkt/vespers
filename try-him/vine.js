/* vine.js -- intergrowth. user1, 5 x 2026: "a gridded background with
   a multiglyph ... intersnarling with its 4 or 9 neighbors in a very
   escher, space-filling way, to outgrow their . or ' or ^ anchor
   points ... a tray of little planters, and they all got water and
   sun and now one has a canopy."

   The whole picture is one rendering. Each pot holds a base glyph and
   up to three combining marks, which hang into the pots around it;
   each pot has one colour, the picture's hue there. The text is drawn
   in the page's face on a Canvas, ink alone on black, and compared to
   the target pixel by pixel. Then, pot by pot, in random order, a
   handful of other plants are tried in the pot and the best is kept,
   judged on the patch of picture the plant can reach. Several sweeps.
   Slow to grow, instant to read: the result is plain text with a
   classic shadow, and any reader paints it.

   The marks used are OUTSIDE yampal's sixteen and SKYPAL's sixteen,
   so no line of the art can be taken for a shadow. A reader counts
   cells by code point, so a plant of three marks is four cells to the
   shadow, all the one colour: runs make that cheap.

   Needs window.LUMA and window.GARDEN. Gives window.VINE.grow(...).  */
(function () {
  'use strict';
  var ABOVE = '̑̒̓̔̽̾͆͐͑͒͗̓̕̚͘'.split('');
  var BELOW = '̡̢̧̨̛̘̙̪̫̯̱̲̳̹̺̻̼͇͈͉͍͎͓͔͕͖͙͚'.split('');
  var ANCHORS = ".'^:,;-°·•\"’".split('');   // no letters, nothing a chat's markdown would seize on
  // STUCCO IN THE LOOP (user1, 5 x 2026: "I should never in the graphic, if it is full of color, witness such huge
  // ranges of dropthrough entirely to black. Not an option."). A pot with a plant in it is drawn as Bela will paint
  // it: a ground of its hue under the whole pot, the ink a little brighter on it, the two summing to the light the
  // plant's share gives. The share is what Bela will reckon: the base glyph's measured share, and 0.03 for each mark.
  // So the vine chooses its plants knowing the ground will be there, and nothing drops through but the night.
  var HINT = 2.2, MARK_INK = 0.03, DOT_INK = { '.': 0.02 };
  function shareOf(s, atlas) {
    var cps = Array.from(s), base = cps[0], a, i, sh = DOT_INK[base];
    if (sh === undefined) { for (i = 0; i < atlas.length; i++) if (atlas[i].ch === base) { sh = atlas[i].share; break; } }
    if (sh === undefined) sh = 0.05;
    return Math.min(1, sh + MARK_INK * (cps.length - 1));
  }
  function pairOf(hex, share) {                       // Bela's solidPair, by the same sums
    var g = '#', n = '#', k, hue, gl, v;
    for (k = 1; k < 7; k += 2) {
      hue = Math.pow(parseInt(hex.slice(k, k + 2), 16) / 255, 2.2);
      gl = share * hue / (share * HINT + 1 - share);
      v = Math.round(255 * Math.pow(gl, 1 / 2.2)); g += (v < 16 ? '0' : '') + v.toString(16);
      v = Math.round(255 * Math.pow(Math.min(1, gl * HINT), 1 / 2.2)); n += (v < 16 ? '0' : '') + v.toString(16);
    }
    return { g: g, i: n };
  }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function plant(atlas) {                             // a candidate: a plain glyph, or an anchor with marks
    if (Math.random() < 0.45) return atlas[rnd(atlas.length)].ch;
    var s = ANCHORS[rnd(ANCHORS.length)], n = 1 + rnd(3), i;
    for (i = 0; i < n; i++) s += Math.random() < 0.5 ? ABOVE[rnd(ABOVE.length)] : BELOW[rnd(BELOW.length)];
    return s;
  }
  // grow(pic, { cols, rows, crop, sweeps, tries, step }) -> a promise of { lines: [row strings], cells: [[glyph, colour] or null] }
  // step(done, total, error) is told the progress. The work is cut into slices so the page stays alive.
  function grow(pic, o) {
    var atlas = window.GARDEN.atlas(), cols = o.cols, rows = o.rows, crop = o.crop || [0, 0, 1, 1];
    var family = getComputedStyle(document.body).fontFamily, size = 14;
    var probe = document.createElement('canvas').getContext('2d'); probe.font = size + 'px ' + family;
    var m = probe.measureText('█'), cw = m.width, asc = m.fontBoundingBoxAscent || size * 0.8, desc = m.fontBoundingBoxDescent || size * 0.25;
    var lh = Math.round(size * 1.3), W = Math.round(cols * cw), H = rows * lh, base = Math.round((lh - (asc + desc)) / 2 + asc);
    // the target, at the rendering's own size, as the page would show it: black where the picture is dark
    var x0 = Math.round(crop[0] * pic.w), y0 = Math.round(crop[1] * pic.h), x1 = Math.round(crop[2] * pic.w), y1 = Math.round(crop[3] * pic.h);
    var tgt = window.LUMA.shrink(pic, x0, y0, x1, y1, W, H), T = new Float32Array(W * H * 3), i, x, y, p;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) { p = tgt.at(x, y); i = (y * W + x) * 3; T[i] = p[0] / 255; T[i + 1] = p[1] / 255; T[i + 2] = p[2] / 255; }
    var small = window.LUMA.shrink(pic, x0, y0, x1, y1, cols, rows), col = [], hex = [], mx, c, r, g, b;
    function hexd(n) { return Math.max(0, Math.min(15, Math.round(n))).toString(16); }
    for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
      p = small.at(x, y); mx = Math.max(1, Math.max(p[0], p[1], p[2]));
      r = hexd(p[0] / mx * 15); g = hexd(p[1] / mx * 15); b = hexd(p[2] / mx * 15);
      hex.push('#' + r + g + b); col.push('#' + r + r + g + g + b + b);
    }
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var cx = cv.getContext('2d', { willReadFrequently: true }); cx.font = size + 'px ' + family; cx.textBaseline = 'alphabetic';
    var cells = [], k; for (k = 0; k < cols * rows; k++) cells.push('');   // empty pots to begin: the night
    var REACH = 1, DEEP = 2;                          // a plant may reach one pot sideways and two up or down
    function draw(cx0, cy0, cx1, cy1) {               // render the pots that can reach into this patch, clipped to it
      var px = Math.round(cx0 * cw), py = cy0 * lh, pw = Math.round((cx1 + 1) * cw) - px, ph = (cy1 + 1) * lh - py, xx, yy;
      cx.save(); cx.beginPath(); cx.rect(px, py, pw, ph); cx.clip();
      cx.fillStyle = '#000'; cx.fillRect(px, py, pw, ph);
      for (yy = Math.max(0, cy0 - DEEP); yy <= Math.min(rows - 1, cy1 + DEEP); yy++)
        for (xx = Math.max(0, cx0 - REACH); xx <= Math.min(cols - 1, cx1 + REACH); xx++) {
          var s = cells[yy * cols + xx]; if (!s) continue;
          if (o.stucco !== false) {                         // the ground first, under the whole pot; then the ink
            var pr = pairOf(col[yy * cols + xx], shareOf(s, atlas));
            cx.fillStyle = pr.g; cx.fillRect(Math.round(xx * cw), yy * lh, Math.round((xx + 1) * cw) - Math.round(xx * cw), lh);
            cx.fillStyle = pr.i;
          } else cx.fillStyle = col[yy * cols + xx];
          cx.fillText(s, xx * cw, yy * lh + base);
        }
      cx.restore();
      return [px, py, pw, ph];
    }
    function err(box) {                               // the squared error over a patch, against the target
      var d = cx.getImageData(box[0], box[1], box[2], box[3]).data, e = 0, xx, yy, o, t, dr, dg, db;
      for (yy = 0; yy < box[3]; yy++) for (xx = 0; xx < box[2]; xx++) {
        o = (yy * box[2] + xx) * 4; t = ((box[1] + yy) * W + box[0] + xx) * 3;
        dr = d[o] / 255 - T[t]; dg = d[o + 1] / 255 - T[t + 1]; db = d[o + 2] / 255 - T[t + 2];
        e += dr * dr + dg * dg + db * db;
      }
      return e;
    }
    var sweeps = o.sweeps || 4, tries = o.tries || 16, order = [], total = sweeps * cols * rows, done = 0, sweep = 0, at = 0;
    for (k = 0; k < cols * rows; k++) order.push(k);
    function shuffle() { var j, t2; for (k = order.length - 1; k > 0; k--) { j = rnd(k + 1); t2 = order[k]; order[k] = order[j]; order[j] = t2; } }
    shuffle();
    return new Promise(function (ok) {
      function slice() {
        var t0 = Date.now(), idx, cxi, cyi, box, was, best, bestS, s, e, n;
        while (Date.now() - t0 < 40) {
          if (at >= order.length) { sweep++; at = 0; shuffle(); if (sweep >= sweeps) { finish(); return; } }
          idx = order[at++]; cxi = idx % cols; cyi = Math.floor(idx / cols);
          box = draw(cxi - REACH, cyi - DEEP, cxi + REACH, cyi + DEEP);      // the patch this pot can reach
          was = cells[idx]; best = err(box); bestS = was;
          for (n = 0; n < tries; n++) {
            s = n === 0 ? '' : plant(atlas);                                  // the empty pot is always a candidate
            cells[idx] = s; draw(cxi - REACH, cyi - DEEP, cxi + REACH, cyi + DEEP); e = err(box);
            if (e < best) { best = e; bestS = s; }
          }
          cells[idx] = bestS; draw(cxi - REACH, cyi - DEEP, cxi + REACH, cyi + DEEP);
          done++;
        }
        if (o.step) { draw(0, 0, cols - 1, rows - 1); o.step(done, total, err([0, 0, W, H])); }
        setTimeout(slice, 0);
      }
      function finish() {
        var out = [], lines = [], line, xx, yy, s;
        for (yy = 0; yy < rows; yy++) {
          line = '';
          for (xx = 0; xx < cols; xx++) { s = cells[yy * cols + xx]; if (!s) { line += '⠀'; out.push(null); continue; } line += s; out.push(['g', s, hex[yy * cols + xx]]); }
          lines.push(line);
        }
        draw(0, 0, cols - 1, rows - 1);
        ok({ w: cols, h: rows, cells: out, error: err([0, 0, W, H]), canvas: cv });
      }
      slice();
    });
  }
  window.VINE = { grow: grow };
})();
