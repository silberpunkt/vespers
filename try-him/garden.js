/* garden.js -- the figurative grade. user1, 5 x 2026: a cell is a
   pot, and the character in it may be chosen for its SHAPE, not only
   for how much light it gives: "the ability to tell more figurative
   truth in that charcell than any single character ever could."

   THE ATLAS. Every candidate character is drawn once, in the page's
   own face, on a Canvas, and its ink is measured in a grid of 4 by 8
   sub-cells. That is the atlas: what each character looks like, here.
   It is honest for this face only; in another face the shapes hold
   (a caret is a caret) and the weights drift.

   THE CHOICE. A cell of the picture is measured the same way, 4 by 8,
   each sub-cell's light relative to the cell's hue at full. The
   character whose ink lies nearest that map is the one. Colour is
   the cell's hue, said in the shadow as ever. No stacks of marks yet:
   a reader counts cells by code point, and a mark would count as one.

   Needs window.LUMA. Gives window.GARDEN = { atlas, cells }.  */
(function () {
  'use strict';
  var GX = 4, GY = 8, S = 4;                       // sub-cells across and down; the drawing scale
  var ATLAS = null, FACE = null;
  function vocabulary() {
    var v = [], c;
    for (c = 0x2580; c <= 0x259F; c++) v.push(String.fromCharCode(c));    // the blocks
    for (c = 0x2801; c <= 0x28FF; c++) v.push(String.fromCharCode(c));    // Braille
    for (c = 0x2500; c <= 0x257F; c++) v.push(String.fromCharCode(c));    // box drawing
    for (c = 0x25A0; c <= 0x25FF; c++) v.push(String.fromCharCode(c));    // geometric shapes
    // marks of punctuation: no letters, no digits, nothing a chat's markdown would seize on, and not the period
    '\'",:;^-=+!?/()%&@$' .split('').forEach(function (ch) { v.push(ch); });
    '·•°¨´¯¸¡¿¦§¶†‡…‹›‘’“”′″‵‶«»×÷±'.split('').forEach(function (ch) { v.push(ch); });
    return v;
  }
  function measure() {                            // -> the atlas, made once
    if (ATLAS) return ATLAS;
    var family = getComputedStyle(document.body).fontFamily, size = 14;
    var cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    cx.font = size + 'px ' + family;
    var m = cx.measureText('█'), cw = m.width, asc = m.fontBoundingBoxAscent || size * 0.8, desc = m.fontBoundingBoxDescent || size * 0.25, chh = asc + desc;
    var W = Math.ceil(cw * S), H = Math.ceil(chh * S), out = [], v = vocabulary(), i, ch, d, x, y, k, gx, gy, sum, n;
    cv.width = W; cv.height = H;
    cx.scale(S, S); cx.font = size + 'px ' + family; cx.textBaseline = 'alphabetic';
    for (i = 0; i < v.length; i++) {
      ch = v[i];
      var w = cx.measureText(ch).width;
      if (Math.abs(w - cw) > cw * 0.08) continue;   // not one cell wide in this face: left out
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, cw + 1, chh + 1);
      cx.fillStyle = '#000'; cx.fillText(ch, 0, asc);
      d = cx.getImageData(0, 0, W, H).data;
      var cov = [], tot = 0;
      for (k = 0; k < GX * GY; k++) cov.push(0);
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        gx = Math.min(GX - 1, Math.floor(x * GX / W)); gy = Math.min(GY - 1, Math.floor(y * GY / H));
        cov[gy * GX + gx] += 1 - d[(y * W + x) * 4] / 255;
      }
      n = (W * H) / (GX * GY);
      for (k = 0; k < cov.length; k++) { cov[k] /= n; tot += cov[k]; }
      out.push({ ch: ch, cov: cov, share: tot / (GX * GY) });
    }
    FACE = family;
    ATLAS = out;
    return out;
  }
  // a picture -> cells, as luma.js gives them: null, or ['g', glyph, colour]
  function cells(pic, o) {
    var A = measure(), cols = o.cols, rows = o.rows, crop = o.crop || [0, 0, 1, 1];
    var x0 = Math.round(crop[0] * pic.w), y0 = Math.round(crop[1] * pic.h), x1 = Math.round(crop[2] * pic.w), y1 = Math.round(crop[3] * pic.h);
    var small = window.LUMA.shrink(pic, x0, y0, x1, y1, cols, rows), fine = window.LUMA.shrink(pic, x0, y0, x1, y1, cols * GX, rows * GY);
    var out = [], x, y, k, p, mx, t, gx, gy, q, best, bi, i, e, c, d;
    function hexd(n) { return Math.max(0, Math.min(15, Math.round(n))).toString(16); }
    for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
      t = []; var peak = 0;
      for (gy = 0; gy < GY; gy++) for (gx = 0; gx < GX; gx++) {
        q = fine.at(x * GX + gx, y * GY + gy);
        var top = Math.max(q[0], q[1], q[2]) / 255, want = Math.pow(top, 2.2);
        t.push(want); if (want > peak) peak = want;
      }
      if (peak < 0.012) { out.push(null); continue; }
      best = 1e9; bi = -1;
      for (i = 0; i < A.length; i++) {
        c = A[i].cov; e = 0;
        for (k = 0; k < t.length; k++) { d = c[k] - t[k]; e += d * d; }
        if (e < best) { best = e; bi = i; }
      }
      p = small.at(x, y); mx = Math.max(1, Math.max(p[0], p[1], p[2]));
      out.push(['g', A[bi].ch, '#' + hexd(p[0] / mx * 15) + hexd(p[1] / mx * 15) + hexd(p[2] / mx * 15)]);
    }
    return { w: cols, h: rows, cells: out };
  }
  window.GARDEN = { atlas: measure, cells: cells, face: function () { return FACE; } };
})();
