/* luma.js -- a picture, cut down to cells for a shadowgram.
   ONE ladder, for every place it is needed: QuickJS at the
   console, and a page that is handed pixels from a canvas.
   user1, 5 x 2026: "I recommend that you and this client use
   the precise same qjs bits and bobs."

     var cells = LUMA.cells(pic, { cols, rows, mode, coarse,
                                   fine, crop: [l, t, r, b] });
     pic: { w, h, data }   data 4 to a pixel, r g b a
     ->  { w, h, cells: [...] }   row by row

   A cell is about twice as tall as wide, so cols by rows
   shows a shape of cols : 2 x rows.

   mode 'plain'   "f80": one 4-4-4 colour, a solid block
   mode 'quad'    [bits, "f80"]: a quadrant glyph where some
                  quarters are as dark as a dark page; bits
                  8 4 2 1 = upper-left, upper-right, lower-
                  left, lower-right. null: wholly dark
   mode 'shade'   ["s", level, "f80"]: brightness in a shade
                  block, level 1 to 4
   mode 'luma'    ["g", glyph, colour]: user1's whole scheme.
                  "Let the char carry the luma, and the dot the
                  mapped chroma." The glyph is a rung of one
                  ladder: blank, Braille from one dot to seven
                  (the lit dots are the cell's brightest
                  eighths), the three shades, the full block.
                  The colour is the cell's with its brightness
                  taken out. fine: the bright end is filled in
                  with eighth-blocks laid toward the light.
                  coarse: the colour in 2-2-2, one period.
                  safe: only the glyphs every monospace face
                  has at one cell's width, the old DOS set:
                  the three shades and the full block. No
                  Braille, no eighths. See the note below.
   mode 'halves'  ["2", "f80", "08f"]: two true pixels a cell.
                  The upper half block in the first colour,
                  on a back of the second (SKYPAL's BACK).
                  cols by rows of cells is cols by 2 x rows of
                  square pixels. It needs a reader that reads
                  the sky; a classic reader shows the top half
                  of every pixel pair and the page below.
   All but plain and halves assume a dark page.

   THE SAFE GRADE. Measured 5 x 2026 in Consolas: a shade or a
   full block is one cell wide; a Braille pattern is a third
   wider, an eighth-block nearly twice, and even the Braille
   blank is a fifth too wide. They come from another face, and
   rows that mix them do not end together. Iosevka has them all
   at one width; many faces do not. So `safe` keeps to what
   every face has, and its pictures should be written with a
   no-break space for a blank, not Braille's.

   This was photo.py. The sums are the same, to the rounding.
   quiet + plur. */
(function (root, make) {
  var api = make();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LUMA = api;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  function even(x) {                    // round half to even, as Python does
    var f = Math.floor(x), d = x - f;
    if (d > 0.5) return f + 1;
    if (d < 0.5) return f;
    return f % 2 === 0 ? f : f + 1;
  }
  function hexd(v) { return even(v).toString(16); }
  function hex3(p) { return hexd(p[0] / 17) + hexd(p[1] / 17) + hexd(p[2] / 17); }
  function lum(p) { return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]; }

  // an area average, exact at the edges: each new pixel is the mean of
  // the old ones under it, part-pixels counted by their part
  function shrink(pic, x0, y0, x1, y1, W, H) {
    var sw = x1 - x0, sh = y1 - y0, d = pic.data, pw = pic.w;
    var mid = new Float64Array(W * sh * 3), out = new Uint8Array(W * H * 3);
    var x, y, k, a, b, i, wgt, sum0, sum1, sum2, tot, lo, hi, o;
    for (x = 0; x < W; x++) {           // across
      a = x * sw / W; b = (x + 1) * sw / W;
      lo = Math.floor(a); hi = Math.min(sw, Math.ceil(b));
      for (y = 0; y < sh; y++) {
        sum0 = sum1 = sum2 = tot = 0;
        for (i = lo; i < hi; i++) {
          wgt = Math.min(b, i + 1) - Math.max(a, i);
          o = ((y0 + y) * pw + x0 + i) * 4;
          sum0 += d[o] * wgt; sum1 += d[o + 1] * wgt; sum2 += d[o + 2] * wgt;
          tot += wgt;
        }
        o = (y * W + x) * 3;
        mid[o] = sum0 / tot; mid[o + 1] = sum1 / tot; mid[o + 2] = sum2 / tot;
      }
    }
    for (y = 0; y < H; y++) {           // then down
      a = y * sh / H; b = (y + 1) * sh / H;
      lo = Math.floor(a); hi = Math.min(sh, Math.ceil(b));
      for (x = 0; x < W; x++) {
        sum0 = sum1 = sum2 = tot = 0;
        for (i = lo; i < hi; i++) {
          wgt = Math.min(b, i + 1) - Math.max(a, i);
          o = (i * W + x) * 3;
          sum0 += mid[o] * wgt; sum1 += mid[o + 1] * wgt; sum2 += mid[o + 2] * wgt;
          tot += wgt;
        }
        o = (y * W + x) * 3;
        out[o] = Math.round(sum0 / tot); out[o + 1] = Math.round(sum1 / tot);
        out[o + 2] = Math.round(sum2 / tot);
      }
    }
    return { w: W, h: H, at: function (px, py) {
      var q = (py * W + px) * 3; return [out[q], out[q + 1], out[q + 2]]; } };
  }

  // how much of a cell each rung inks, as light: a Braille dot is taken
  // as 3 parts in 100; the shades as their names say
  var RUNGS = [[0.03, 1], [0.06, 2], [0.09, 3], [0.12, 4], [0.15, 5],
    [0.18, 6], [0.21, 7], [0.25, 'q'], [0.5, 'h'], [0.75, 't'], [1.0, 'f']];
  var SHADES = { q: '░', h: '▒', t: '▓', f: '█' };
  var DOT = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  var G = 1 / 2.2;

  function cells(pic, o) {
    var cols = o.cols, rows = o.rows, mode = o.mode || 'plain';
    var c = o.crop || [0, 0, 1, 1];
    var x0 = Math.floor(c[0] * pic.w), y0 = Math.floor(c[1] * pic.h);
    var x1 = Math.floor(c[2] * pic.w), y1 = Math.floor(c[3] * pic.h);
    var small = shrink(pic, x0, y0, x1, y1, cols, rows), out = [];
    var x, y, p, top, i, k, fine, q, ls, lit, dark, bits, mean;
    if (mode === 'plain') {
      for (y = 0; y < rows; y++) for (x = 0; x < cols; x++)
        out.push(hex3(small.at(x, y)));
    } else if (mode === 'halves') {
      fine = shrink(pic, x0, y0, x1, y1, cols, rows * 2);
      for (y = 0; y < rows; y++) for (x = 0; x < cols; x++)
        out.push(['2', hex3(fine.at(x, y * 2)), hex3(fine.at(x, y * 2 + 1))]);
    } else if (mode === 'shade') {
      for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
        p = small.at(x, y); top = Math.max(p[0], p[1], p[2]) / 255;
        if (top < 0.07) { out.push(null); continue; }
        var level = top <= 0.25 ? 1 : top <= 0.5 ? 2 : top <= 0.75 ? 3 : 4;
        out.push(['s', level, hex3(p.map(function (v) {
          return Math.min(255, v * 4 / level); }))]);
      }
    } else if (mode === 'quad') {
      var DARK = 30, EDGE = 26;
      fine = shrink(pic, x0, y0, x1, y1, cols * 2, rows * 2);
      for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
        q = [fine.at(x * 2, y * 2), fine.at(x * 2 + 1, y * 2),
             fine.at(x * 2, y * 2 + 1), fine.at(x * 2 + 1, y * 2 + 1)];
        ls = q.map(lum); lit = []; dark = [];
        for (i = 0; i < 4; i++) (ls[i] >= DARK ? lit : dark).push(i);
        if (!lit.length) { out.push(null); continue; }
        if (lit.length < 4 &&
            Math.min.apply(null, lit.map(function (j) { return ls[j]; })) -
            Math.max.apply(null, dark.map(function (j) { return ls[j]; })) < EDGE)
          lit = [0, 1, 2, 3];
        bits = 0; lit.forEach(function (j) { bits += [8, 4, 2, 1][j]; });
        mean = [0, 1, 2].map(function (ch) {
          var s = 0; lit.forEach(function (j) { s += q[j][ch]; });
          return s / lit.length; });
        out.push([bits, hex3(mean)]);
      }
    } else if (mode === 'luma') {
      fine = shrink(pic, x0, y0, x1, y1, cols * 2, rows * 4);
      for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
        p = small.at(x, y); top = Math.max(p[0], p[1], p[2]) / 255;
        var want = Math.pow(top, 2.2), glyph;
        if (want < 0.012) { out.push(null); continue; }
        var rung = null, best = 9, dd;
        for (i = 0; i < RUNGS.length; i++) {       // the nearest, as the eye judges
          dd = Math.abs(Math.pow(RUNGS[i][0], G) - top);
          if (dd < best) { best = dd; rung = RUNGS[i][1]; }
        }
        if (o.safe) {                                // the DOS set only: the nearest shade
          var sf = [['q', 0.25], ['h', 0.5], ['t', 0.75], ['f', 1.0]], pk = 'q';
          best = 9;
          sf.forEach(function (r) {
            var d3 = Math.abs(Math.pow(r[1], G) - top);
            if (d3 < best) { best = d3; pk = r[0]; }
          });
          glyph = SHADES[pk];
        } else if (o.fine && want > 0.21) {
          var e = 2; best = 9;
          for (k = 2; k <= 8; k++) {
            dd = Math.abs(Math.pow(k / 8, G) - top);
            if (dd < best) { best = dd; e = k; }
          }
          var q4 = [], dy, dx;
          for (dy = 0; dy < 4; dy++) for (dx = 0; dx < 2; dx++)
            q4.push(lum(fine.at(x * 2 + dx, y * 4 + dy)));
          var up = q4[0] + q4[1] + q4[2] + q4[3], down = q4[4] + q4[5] + q4[6] + q4[7];
          var left = q4[0] + q4[2] + q4[4] + q4[6], right = q4[1] + q4[3] + q4[5] + q4[7];
          var tilt = Math.max(Math.abs(up - down), Math.abs(left - right)) /
            (up + down + 1);
          if (e === 8) glyph = '█';
          else if (tilt > 0.10 && down - up >= Math.abs(left - right))
            glyph = String.fromCharCode(0x2580 + e);         // rising from the foot
          else if (tilt > 0.10 && left - right >= Math.abs(up - down))
            glyph = String.fromCharCode(0x2590 - e);         // growing from the left
          else if (tilt > 0.10 && e === 4 && up > down) glyph = '▀';
          else if (tilt > 0.10 && e === 4) glyph = '▐';
          else {
            var sh = [['q', 0.25], ['h', 0.5], ['t', 0.75], ['f', 1.0]], pick = 'q';
            best = 9;
            sh.forEach(function (r) {
              var d2 = Math.abs(Math.pow(r[1], G) - top);
              if (d2 < best) { best = d2; pick = r[0]; }
            });
            glyph = SHADES[pick];
          }
        } else if (typeof rung === 'number') {
          var subs = [];
          for (dy = 0; dy < 4; dy++) for (dx = 0; dx < 2; dx++)
            subs.push([lum(fine.at(x * 2 + dx, y * 4 + dy)), dy, dx]);
          subs.sort(function (a, b) {                        // brightest first
            return b[0] - a[0] || b[1] - a[1] || b[2] - a[2]; });
          bits = 0;
          for (i = 0; i < rung; i++) bits += DOT[subs[i][1]][subs[i][2]];
          glyph = String.fromCharCode(0x2800 + bits);
        } else glyph = SHADES[rung];
        var mx = Math.max(1, Math.max(p[0], p[1], p[2]));
        var n = [p[0] / mx, p[1] / mx, p[2] / mx];           // brightness out
        var col = o.coarse ?
          'q' + even(n[0] * 3) + even(n[1] * 3) + even(n[2] * 3) :
          '#' + hexd(n[0] * 15) + hexd(n[1] * 15) + hexd(n[2] * 15);
        out.push(['g', glyph, col]);
      }
    } else throw new Error('no such mode: ' + mode);
    return { w: cols, h: rows, cells: out };
  }
  return { cells: cells, shrink: shrink };
});
