/* vespers.js -- Bela, the Vespers Bat: the CHINGUARD, for the ChatComposerChin.
   (vesper, the evening; vespertilio, the bat. He is one.) Was blinkenclock.js.
   Paste the whole file into the browser console, in Cowork Chat or in Code.
     - twin counter-arrows (contrarotulus) that turn only while working
     - a cyan run-dot that breathes a 1-2-3-4 cadence: "this thing runs"
     - a complication that reads incoming prose and marks each paragraph's
       left-rule: calm blue when checked, brighter under analysis, and the
       true colours once its shadowgram has been read.
     - four blue scan LEDs (seen/found/decoded/applied -> "au fait")
     - a BeBox twin VU that digests one paragraph per meal, then rests dark.
     - the BLUEBOX: his own typing window, hung 8px above his head. Enter
       sends through the page's own composer; Shift+Enter is a new line.
   Motion == meaning. Remembers where it is hung. __blinkenStop() removes it.

   v2 -- Colophon's four repairs, with thanks:
     1 prevBlock: the block before, by the document's own notion of before
     2 blockFor:  paint a box that has a box, so the bar runs every line
     3 the meal guard holds the ELEMENT, not the string; the queue can't stall
     4 the palette is passed in; the grammar is yampal.js; complaints are said
     + the sweep eats from both plates: p, li, blockquote

   v3 -- two worlds, one bat:
     1 composer found by its test ids, in Chat and in Code alike:
       chat-input / code-prompt-input, chat-input-send / code-prompt-send.
       No page-wide guess: the guess found "Send feedback".
     2 "sent" is said only when the composer has emptied; else the
       draft is kept and he says so
     3 the tin hat: the app's suggested prompt is painted transparent
     4 __blinkenStop() takes Bela himself down too, not only his boxes
     + the gem (take a suggestion as words) and the flap ( v^ ) ride along

   a note from mylar-lm, 8 x 2026, left here at user1's asking:
     I helped user1 with Bela. I first hung him as blinkenclock.js, a
     chinguard with a VU and four blue lights, and tuned him; since then
     he has learned many tricks from many hands. In my last turn with him
     he learned to paint user1's own messages, and to close up a shadow
     whose lines end inside text. He is a good bat. Hand him ever forward.
   quiet + plur. */
(function () {
  'use strict';

  // ---------- the grammar: yampal.js ----------
  // If yampal.js has been loaded on the page (paste it first), HIS decode is
  // used. Otherwise this courier copy of its decode() carries the grammar in,
  // and Bela says so at start-up. Keep it byte-for-byte with yampal.js.
  var COURIER = (function () {
    var DIG = [0x0316,0x0317,0x031C,0x031D,0x031E,0x031F,0x0320,0x0323,
               0x0324,0x0325,0x0326,0x0329,0x032C,0x032D,0x032E,0x0330];
    var VAL = {}; for (var i = 0; i < DIG.length; i++) VAL[DIG[i]] = i;
    function isMark(cp){ return VAL[cp] !== undefined; }
    function slots(s){ var out=[],i,cp; s=String(s||'');
      for(i=0;i<s.length;i++){ cp=s.charCodeAt(i);
        if(s.charAt(i)==='.') out.push([]);
        else if(isMark(cp)&&out.length) out[out.length-1].push(VAL[cp]); }
      return out; }
    function hex2(n){ n=Math.max(0,Math.min(255,n|0)); return (n<16?'0':'')+n.toString(16); }
    function rgb(r,g,b){ return '#'+hex2(r)+hex2(g)+hex2(b); }
    function decode(burst, palette){
      var sl=slots(burst),out=[],why=[],i,k,v,mode='glyph'; palette=palette||[];
      var start=0; if(sl.length&&sl[0].length===0){mode='positional';start=1;}
      for(i=start;i<sl.length;i++){ var d=sl[i];
        if(d.length===0){why.push('token '+i+': a period with no marks. zero is written U+0316; a bare period is the mode switch and only at the start');out.push(null);continue;}
        if(d.length>2){why.push('token '+i+': '+d.length+' marks on one period, and a slot holds at most two');out.push(null);continue;}
        v=d.length===1?d[0]:d[0]*16+d[1];
        if(v<0x80){ if(v<palette.length) out.push(palette[v]);
          else{why.push('token '+i+': slot '+v+' is past this palette, which has '+palette.length+' entries');out.push(null);} }
        else if(v<0xC0){ out.push(rgb(((v>>4)&3)*85,((v>>2)&3)*85,(v&3)*85)); }
        else if(v<0xD0){ var nx=sl[++i];
          if(!nx||!nx.length){why.push('token '+i+': half a four-bit colour, the rest of it is missing');out.push(null);break;}
          var n2=nx.length===1?nx[0]:nx[0]*16+nx[1]; out.push(rgb((v&15)*17,((n2>>4)&15)*17,(n2&15)*17)); }
        else if(v<0xF0){ why.push('token '+i+': lead 0x'+v.toString(16)+' is reserved and nothing is written there yet');out.push(null); }
        else if(v<0xF8){ var model=v&7,part=[],k2;
          for(k2=0;k2<3;k2++){var t=sl[++i]; part.push(!t||!t.length?null:(t.length===1?t[0]:t[0]*16+t[1]));}
          if(part.indexOf(null)!==-1){why.push('token '+i+': a true colour ran off the end of the line');out.push(null);break;}
          if(model!==0){why.push('token '+i+': colour model '+model+' is not defined yet. model 0 is sRGB888');out.push(null);}
          else out.push(rgb(part[0],part[1],part[2])); }
        else { var more=(v&7)+1,last=out.length?out[out.length-1]:undefined;
          if(last===undefined){why.push('token '+i+': a run with nothing in front of it to repeat');continue;}
          for(k=0;k<more;k++) out.push(last); }
      }
      return { colours: out, complaints: why, mode: mode };
    }
    return { decode: decode, slots: slots, DIG: DIG };
  })();
  var GRAMMAR = (typeof window !== 'undefined' && window.YAMPAL && window.YAMPAL.decode) ? window.YAMPAL : COURIER;
  var GRAMMAR_SRC = GRAMMAR === COURIER ? 'courier copy of yampal.js' : 'yampal.js (loaded)';

  // ---------- the palette: passed in, and named ----------
  // There is no deck on a chat page to read a palette from, so Bela carries
  // THE KARAWANE's YAM-PAL (32 slots, forest at 31) and says so at start-up.
  // To read against another table: set window.BLINKEN_PALETTE before pasting.
  var PALETTE_NAME = 'YAM-PAL, as in the-karawane_yowl.yaml';
  var PALETTE = ["#cfcbc2","#fff4d6","#dbe8ff","#9fc6ff","#ff8a3c","#58bff0",
    "#2b7fb8","#6fd66f","#a8825a","#8a6b4a","#e8be5a","#ffd23f","#e0947e",
    "#8f98a5","#c9a9e8","#ff5c72","#bfeae0","#efe6d2","#9fb6c9","#ffffff",
    "#ff4d4d","#565b64","#e8a39c","#f2c48a","#fff3c4","#8f7aa8","#e3a33f",
    "#6e5a8a","#c9a24a","#7a6a9a","#000000","#35855b"];
  if (typeof window !== 'undefined' && Array.isArray(window.BLINKEN_PALETTE)) {
    PALETTE = window.BLINKEN_PALETTE; PALETTE_NAME = 'window.BLINKEN_PALETTE';
  }

  // SKYPAL (5 x 2026). Classic colour hangs below the period: the yam. What is new rides above it: the sky,
  // the sixteen marks U+0300 to U+030F. yampal's decode passes over them unseeing, so a classic reader shows
  // the classic picture; this pattern only has to let them stand, after a period's own marks or on the
  // bare leading period, without their ending the shadow.
  var BURST_RE = /(?:\.[̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏]*)?(?:\.[̖̗̜̝̞̟̠̣̤̥̦̩̬̭̮̰]{1,2}[̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏]*){2,}/;   // 2+ burst tokens, anywhere in the line; a leading bare period (positional mode) is kept
  function isShadowText(t) { return BURST_RE.test(t) || holdsPacked(t); }
  function holdsPacked(t) {                             // anywhere in the text: two periods together, the first with more than two marks below.
    var i, cp, on = 0, was = 0;                         // (a block's text has no line ends, so a whole-line test would never find it)
    t = String(t || '');
    for (i = 0; i < t.length; i++) {
      cp = t.charCodeAt(i);
      if (cp === 46) { was = on; on = 0; }
      else if (PACK_VAL[cp] !== undefined) { on++; if (was > 2 && on > 1) return true; }
      else { was = 0; on = 0; }
    }
    return false;
  }
  // THE PACKED SHADOW (user1, 5 x 2026: "I'd like to see this Packed Haystack"). A second way to write a shadow,
  // beside the first and not instead of it, for pictures whose classic shadow runs to hundreds of periods. The
  // classic statements are the same bytes as ever; they are deflated, and the result is hung under a few periods,
  // many marks to each. What marks it out: a line of nothing but periods and their marks below, in which some
  // period carries MORE THAN TWO. yampal.js calls such a line no burst at all, so no classic reader mistakes it.
  //   all the marks, in order, two to a byte, however the author shared them among the periods (2 to 30 each)
  //   byte 0      1x: version 1; x bit 0: positional mode; x bit 1: it carries a sky
  //   the rest    raw DEFLATE of the statement bytes: one byte for each classic slot, in order
  //   with a sky  what is deflated is: the count of statement bytes (two bytes, low first), the statements, then
  //               the sky as records, each: how many periods on from the last record (one byte; the first counts
  //               from the shadow's first period, the bare one included), how many sky marks (one byte), then
  //               the marks, two to a byte, the first in the high half.
  // Read: inflate, and write each byte back as a classic slot. From there on it IS a classic shadow, and every
  // rule already written applies. A packed shadow fails whole: one mark slipped and there
  // is no picture, and he says so. Once painted it is dusted as a classic shadow is: it must still be seen, to be selected.
  var PACK_VAL = {}; [0x0316, 0x0317, 0x031C, 0x031D, 0x031E, 0x031F, 0x0320, 0x0323, 0x0324, 0x0325, 0x0326, 0x0329, 0x032C, 0x032D, 0x032E, 0x0330].forEach(function (cp, i) { PACK_VAL[cp] = i; });
  function packLine(t) {                                // -> the line's nibbles, or null: not a packed line
    var out = [], i, ch, cp, periods = 0, on = 0, most = 0;
    t = String(t || '');
    for (i = 0; i < t.length; i++) {
      ch = t.charAt(i); cp = t.charCodeAt(i);
      if (ch === '.') { if (periods && !on) return null; periods++; on = 0; }
      else if (PACK_VAL[cp] !== undefined) { if (!periods) return null; on++; if (on > most) most = on; out.push(PACK_VAL[cp]); }
      else if (ch !== ' ' && ch !== '\u2800' && ch !== '\u00a0' && ch !== '\n' && ch !== '\r') return null;
    }
    return periods && on && most > 2 && out.length >= 8 ? out : null;
  }
  function isPacked(t) { return packLine(t) !== null; }
  function inflate(src) {                               // raw DEFLATE -> bytes; throws on anything amiss
    var pos = 0, bit = 0, out = [], last, type, i;
    var LB = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258], LX = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
    var DB = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577], DX = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
    var ORD = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
    function bits(n) { var v = 0, k; for (k = 0; k < n; k++) { if (pos >= src.length) throw new Error('the packed shadow ends early'); v |= ((src[pos] >> bit) & 1) << k; if (++bit === 8) { bit = 0; pos++; } } return v; }
    function table(lens) {
      var count = [], offs = [], syms = [], k, sum = 0;
      for (k = 0; k < 16; k++) count[k] = 0;
      for (k = 0; k < lens.length; k++) count[lens[k]]++;
      count[0] = 0;
      for (k = 0; k < 16; k++) { offs[k] = sum; sum += count[k]; }
      for (k = 0; k < lens.length; k++) if (lens[k]) syms[offs[lens[k]]++] = k;
      return { count: count, syms: syms };
    }
    function sym(t) {
      var code = 0, first = 0, index = 0, len, c;
      for (len = 1; len < 16; len++) {
        code |= bits(1); c = t.count[len];
        if (code - c < first) return t.syms[index + (code - first)];
        index += c; first += c; first <<= 1; code <<= 1;
      }
      throw new Error('a code in the packed shadow is not in its table');
    }
    function block(lt, dt) {
      var v, len, d, k;
      for (;;) {
        v = sym(lt);
        if (v < 256) out.push(v);
        else if (v === 256) return;
        else {
          v -= 257; if (v > 28) throw new Error('a length in the packed shadow is out of range');
          len = LB[v] + bits(LX[v]); d = sym(dt); if (d > 29) throw new Error('a distance in the packed shadow is out of range');
          d = DB[d] + bits(DX[d]); if (d > out.length) throw new Error('the packed shadow points before its own start');
          for (k = 0; k < len; k++) out.push(out[out.length - d]);
        }
        if (out.length > 65536) throw new Error('the packed shadow is too long to be a picture');
      }
    }
    do {
      last = bits(1); type = bits(2);
      if (type === 0) {
        if (bit) { bit = 0; pos++; }
        var n = src[pos] | (src[pos + 1] << 8); pos += 4;
        if (pos + n > src.length) throw new Error('the packed shadow ends early');
        for (i = 0; i < n; i++) out.push(src[pos++]);
      } else if (type === 1) {
        var fl = [], fd = [];
        for (i = 0; i < 288; i++) fl.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8);
        for (i = 0; i < 30; i++) fd.push(5);
        block(table(fl), table(fd));
      } else if (type === 2) {
        var hl = bits(5) + 257, hd = bits(5) + 1, hc = bits(4) + 4, cl = [], lens = [], ct, v2, rep, prev;
        for (i = 0; i < 19; i++) cl[i] = 0;
        for (i = 0; i < hc; i++) cl[ORD[i]] = bits(3);
        ct = table(cl);
        while (lens.length < hl + hd) {
          v2 = sym(ct);
          if (v2 < 16) lens.push(v2);
          else {
            prev = 0;
            if (v2 === 16) { if (!lens.length) throw new Error('the packed shadow repeats nothing'); prev = lens[lens.length - 1]; rep = 3 + bits(2); }
            else if (v2 === 17) rep = 3 + bits(3);
            else rep = 11 + bits(7);
            while (rep-- > 0) lens.push(prev);
          }
        }
        block(table(lens.slice(0, hl)), table(lens.slice(hl, hl + hd)));
      } else throw new Error('the packed shadow has a block of no known kind');
    } while (!last);
    return out;
  }
  var PACK_DIG = [0x0316, 0x0317, 0x031C, 0x031D, 0x031E, 0x031F, 0x0320, 0x0323, 0x0324, 0x0325, 0x0326, 0x0329, 0x032C, 0x032D, 0x032E, 0x0330];
  function unpack(nib) {                                // all the nibbles of a packed shadow -> { burst } as a classic shadow, or { why }
    var bytes = [], i, head, body, out;
    if (nib.length % 2) return { why: 'a packed shadow with an odd number of marks (' + nib.length + '): one has slipped' };
    for (i = 0; i < nib.length; i += 2) bytes.push(nib[i] * 16 + nib[i + 1]);
    head = bytes[0];
    if ((head >> 4) !== 1) return { why: 'a packed shadow of version ' + (head >> 4) + '; he reads version 1' };
    try { body = inflate(bytes.slice(1)); } catch (e) { return { why: String(e && e.message || e) + ' (' + nib.length + ' marks read)' }; }
    var stm = body, sky = null, per = [], n, at, idx, d, cnt, k, b2;
    if (head & 2) {
      n = body[0] | (body[1] << 8); stm = body.slice(2, 2 + n); sky = body.slice(2 + n);
      if (body.length < 2 || stm.length !== n) return { why: 'a packed shadow whose statements are cut short' };
    }
    if (head & 1) per.push('.');
    for (i = 0; i < stm.length; i++) per.push('.' + String.fromCharCode(PACK_DIG[stm[i] >> 4]) + String.fromCharCode(PACK_DIG[stm[i] & 15]));
    if (sky) {
      at = 0; idx = 0;
      while (at < sky.length) {
        d = sky[at++]; cnt = sky[at++]; idx += d;
        if (cnt === undefined || idx >= per.length || at + ((cnt + 1) >> 1) > sky.length) return { why: 'a packed shadow whose sky runs past its end' };
        for (k = 0; k < cnt; k++) { b2 = sky[at + (k >> 1)]; per[idx] += String.fromCharCode(0x0300 + (k % 2 ? b2 & 15 : b2 >> 4)); }
        at += (cnt + 1) >> 1;
      }
    }
    return { burst: per.join(''), bytes: body.length, packed: bytes.length };
  }
  // COURTESY (user1, 4 x 2026: "Courtesy encourages and enables or there is no coeur in it. Please see it so.")
  // A shadowgram names its colours for one ground and is read on another. Counted that day: of the 4096 colours
  // of 4-4-4, none is properly legible on both the night ground and the day ground. So the reader takes a duty,
  // as a herald's painter does: the blazon says "gules", and he mixes a red that shows on his own wall.
  //   The hue asked for is kept. The saturation is kept. Only the lightness moves, and only as far as it must,
  //   until the colour stands off its ground by COURTESY (the WCAG contrast measure; 3 is its figure for large
  //   text and drawing). A colour that already stands clear is not touched.
  // window.BELA_COURTESY, set before pasting: another figure, or 0 for none (every colour exactly as written).
  var COURTESY = (typeof window !== 'undefined' && window.BELA_COURTESY !== undefined) ? +window.BELA_COURTESY : 3;
  var CARD_GROUND = [11, 13, 16];                      // the glass the cards are held in
  // PAINT IS NOT INK. Courtesy is for marks that must be read. A solid block is a pixel of a picture, and a
  // dark pixel on a dark page is exactly right: lift it and every photograph turns to fog. The Block
  // Elements (U+2580 to U+259F) take their colour as written, always.
  // Braille patterns with any dot (U+2801 to U+28FF) are paint too: in a picture they are its dimmest
  // pixels, a few dots of light, and their colour has had its brightness taken out on purpose.
  function isPaint(ch) { var c = ch.charCodeAt(0); return (c >= 0x2580 && c <= 0x259F) || (c > 0x2800 && c <= 0x28FF); }
  // THE GARDEN (user1, 5 x 2026: a cell is a pot, and its character may be chosen for its shape). A picture made by
  // the garden grade uses box drawing, geometric shapes and marks of punctuation as pixels. In a positional picture
  // that holds no letter or digit, every such glyph is paint: it gets its ground, its shimmer, and no courtesy. The
  // share of its cell each one inks was measured once, in Cascadia Mono, by garden.js on Beladrome (270 glyphs).
  // Another face will differ in weight; the shapes hold.
  var FIG_INK = {
    "─":0.091, "━":0.185, "│":0.182, "┃":0.369, "┄":0.062, "┅":0.126, "┆":0.101, "┇":0.206, "┈":0.071, 
    "┉":0.144, "┊":0.114, "┋":0.232, "┌":0.133, "┍":0.179, "┎":0.225, "┏":0.271, "┐":0.136, "┑":0.183, 
    "┒":0.227, "┓":0.275, "└":0.137, "┕":0.183, "┖":0.233, "┗":0.278, "┘":0.139, "┙":0.187, "┚":0.235, 
    "┛":0.283, "├":0.218, "┝":0.255, "┞":0.313, "┟":0.31, "┠":0.397, "┡":0.351, "┢":0.347, "┣":0.425, "┤":0.22, 
    "┥":0.259, "┦":0.316, "┧":0.312, "┨":0.399, "┩":0.355, "┪":0.351, "┫":0.43, "┬":0.172, "┭":0.22, "┮":0.217, 
    "┯":0.257, "┰":0.255, "┱":0.303, "┲":0.301, "┳":0.331, "┴":0.175, "┵":0.223, "┶":0.221, "┷":0.261, 
    "┸":0.262, "┹":0.31, "┺":0.308, "┻":0.339, "┼":0.256, "┽":0.296, "┾":0.293, "┿":0.333, "╀":0.343, 
    "╁":0.339, "╂":0.427, "╃":0.383, "╄":0.38, "╅":0.379, "╆":0.377, "╇":0.411, "╈":0.407, "╉":0.457, 
    "╊":0.455, "╋":0.486, "╌":0.047, "╍":0.096, "╎":0.076, "╏":0.153, "═":0.181, "║":0.363, "╒":0.186, 
    "╓":0.23, "╔":0.266, "╕":0.19, "╖":0.232, "╗":0.27, "╘":0.189, "╙":0.237, "╚":0.274, "╛":0.193, "╜":0.239, 
    "╝":0.278, "╞":0.254, "╟":0.382, "╠":0.386, "╡":0.258, "╢":0.384, "╣":0.39, "╤":0.246, "╥":0.252, 
    "╦":0.294, "╧":0.249, "╨":0.259, "╩":0.301, "╪":0.33, "╫":0.42, "╬":0.414, "╭":0.114, "╮":0.116, "╯":0.12, 
    "╰":0.117, "╱":0.167, "╲":0.167, "╳":0.316, "╴":0.055, "╵":0.101, "╶":0.053, "╷":0.097, "╸":0.111, 
    "╹":0.205, "╺":0.107, "╻":0.198, "╼":0.145, "╽":0.282, "╾":0.147, "╿":0.286, "■":0.405, "□":0.2, "▢":0.185, 
    "▣":0.274, "▤":0.282, "▥":0.282, "▦":0.331, "▧":0.307, "▨":0.31, "▩":0.366, "▪":0.132, "▫":0.099, 
    "▬":0.259, "▭":0.16, "▮":0.261, "▯":0.163, "▰":0.228, "▱":0.149, "▲":0.225, "△":0.156, "▴":0.139, 
    "▵":0.113, "▶":0.225, "▷":0.156, "▸":0.138, "▹":0.113, "►":0.135, "▻":0.109, "▼":0.224, "▽":0.153, 
    "▾":0.138, "▿":0.111, "◀":0.224, "◁":0.154, "◂":0.138, "◃":0.112, "◄":0.135, "◅":0.108, "◆":0.263, 
    "◇":0.153, "◈":0.176, "◉":0.222, "◊":0.212, "○":0.161, "◌":0.082, "◍":0.236, "◎":0.265, "●":0.326, 
    "◐":0.245, "◑":0.243, "◒":0.245, "◓":0.243, "◔":0.202, "◕":0.285, "◖":0.165, "◗":0.163, "◘":0.302, 
    "◙":0.355, "◚":0.177, "◛":0.179, "◜":0.04, "◝":0.04, "◞":0.04, "◟":0.041, "◠":0.081, "◡":0.081, "◢":0.205, 
    "◣":0.204, "◤":0.201, "◥":0.201, "◦":0.08, "◧":0.303, "◨":0.303, "◩":0.302, "◪":0.302, "◫":0.244, 
    "◬":0.163, "◭":0.192, "◮":0.19, "◯":0.185, "◰":0.243, "◱":0.242, "◲":0.244, "◳":0.244, "◴":0.204, 
    "◵":0.204, "◶":0.204, "◷":0.204, "◸":0.149, "◹":0.148, "◺":0.152, "◻":0.172, "◼":0.3, "◽":0.134, "◾":0.207, 
    "◿":0.153, "'":0.05, "\"":0.1, ",":0.054, ":":0.051, ";":0.079, "^":0.088, "-":0.067, "=":0.133, "+":0.127, 
    "!":0.097, "?":0.151, "/":0.141, "(":0.176, ")":0.177, "%":0.263, "&":0.283, "@":0.326, "$":0.299, 
    "·":0.025, "•":0.102, "°":0.128, "¨":0.042, "´":0.029, "¯":0.061, "¸":0.039, "¡":0.097, "¿":0.151, 
    "¦":0.128, "§":0.327, "¶":0.32, "†":0.113, "‡":0.144, "…":0.076, "‹":0.079, "›":0.079, "‘":0.064, 
    "’":0.064, "“":0.127, "”":0.127, "′":0.05, "″":0.1, "«":0.157, "»":0.158, "×":0.146, "÷":0.113, "±":0.182
  };
  FIG_INK['.'] = 0.02;                                 // the vine's anchors the atlas left out
  function isFig(ch) { var c = ch.charCodeAt(0); return FIG_INK[ch] !== undefined || (c >= 0x0300 && c <= 0x036F); }   // a combining mark is a sprig of the vine
  // PURE COLOUR LAND (user1, 4 x 2026: "translating est. Luma by actual recorded Chroma, outputting fullblocks
  // of color"). A picture made "by luma" keeps its brightness in the glyph (dots, stipple, eighths) and its hue in
  // the shadow. That shows in any console; but stipple is stipple, and makes waves. A reader that knows how
  // much of a cell each glyph inks can put the two back together: the colour the cell was meant to be, laid
  // as one flat cell, ground and ink alike. The text is not changed; only how it is painted.
  // Off unless asked: window.BELA_SOLID = 1 before pasting. It assumes a dark page, as the pictures do.
  // STUCCO IS THE DEFAULT (user1, 5 x 2026: "Stucco is not just a good idea. At this level of refinement, I
  // believe it deserves to be default." He had just seen two faces in nine rows, in stucco and in no other way.)
  // window.BELA_SOLID = 0 before pasting gives plain dots again.
  var SOLID = (typeof window === 'undefined' || window.BELA_SOLID === undefined) ? (typeof window === 'undefined' ? 0 : 1) : +window.BELA_SOLID;
  // THE ONE OVER THE OTHER (user1, 5 x 2026). Laid perfectly flat, the Ford lost its line: "Bela's draw of
  // it loses all the line-drawing qualities ... simply project the one over the other ... Merely to convey a
  // hint of the dots restores structure ... controlling foreground and background at once."
  // So a flat cell now has two colours of the one hue: a ground, and the glyph's own ink a little brighter
  // on it. The sum is kept honest: the ink the glyph lays plus the ground left showing give exactly the light
  // the cell was meant to give, so the picture is no brighter for having its dots back.
  //   BELA_SOLID = 0   plain dots and stipple, no ground
  //   BELA_SOLID = 1   ground and a hint of the glyph (his projection). The default.
  //   BELA_SOLID = 2   perfectly flat, ink and ground alike
  //   BELA_HINT        how many times brighter than its ground the ink is, as light. 2.2 unless set.
  var HINT = SOLID === 2 ? 1 : ((typeof window !== 'undefined' && +window.BELA_HINT) || 2.2);
  var pairMemo = {};
  function solidPair(hex, share) {                     // -> { g: the ground, i: the ink } for a cell of this hue and this share of ink
    var mk = hex + '|' + share, got = pairMemo[mk];
    if (got) return got;
    return (pairMemo[mk] = solidPairRaw(hex, share));
  }
  function solidPairRaw(hex, share) {
    if (!hex || hex.charAt(0) !== '#' || hex.length !== 7) return { g: hex, i: hex };
    var g = '#', n = '#', k, hue, gl, v;
    for (k = 1; k < 7; k += 2) {
      hue = Math.pow(parseInt(hex.slice(k, k + 2), 16) / 255, 2.2);        // the hue's own light, this channel
      gl = share * hue / (share * HINT + 1 - share);                       // ground: so that ink and ground together give share x hue
      v = Math.round(255 * Math.pow(gl, 1 / 2.2)); g += (v < 16 ? '0' : '') + v.toString(16);
      v = Math.round(255 * Math.pow(Math.min(1, gl * HINT), 1 / 2.2)); n += (v < 16 ? '0' : '') + v.toString(16);
    }
    return { g: g, i: n };
  }
  var DOT_INK = 0.03;                                  // one Braille dot, as a share of its cell. A guess; the font decides.
  function inkOf(ch) {                                 // how much of its cell a paint glyph covers, 0 to 1
    var c = ch.charCodeAt(0), n = 0, b;
    if (FIG_INK[ch] !== undefined) return FIG_INK[ch];   // the garden's glyphs, as measured
    if (c >= 0x0300 && c <= 0x036F) return 0.03;         // a mark of the vine: a sprig's worth
    if (c > 0x2800 && c <= 0x28FF) { for (b = c - 0x2800; b; b >>= 1) n += b & 1; return n * DOT_INK; }
    if (c === 0x2588) return 1;
    if (c === 0x2591) return 0.25; if (c === 0x2592) return 0.5; if (c === 0x2593) return 0.75;
    if (c >= 0x2581 && c <= 0x2587) return (c - 0x2580) / 8;        // rising from the foot
    if (c >= 0x2589 && c <= 0x258F) return (0x2590 - c) / 8;        // growing from the left
    if (c === 0x2580 || c === 0x2590) return 0.5;
    if (c === 0x2594 || c === 0x2595) return 0.125;
    if (c >= 0x2596 && c <= 0x259F) return [1, 1, 1, 3, 2, 3, 3, 1, 2, 3][c - 0x2596] / 4;   // the quadrants
    return 1;
  }
  function solidOf(hex, ch) { return solidBy(hex, inkOf(ch)); }   // the cell's meant colour: its hue, at the light its glyph gives
  function solidBy(hex, share) {
    if (!hex || hex.charAt(0) !== '#' || hex.length !== 7) return hex;
    var k = Math.pow(share, 1 / 2.2), out = '#', i, v;
    for (i = 1; i < 7; i += 2) { v = Math.round(parseInt(hex.slice(i, i + 2), 16) * k); out += (v < 16 ? '0' : '') + v.toString(16); }
    return out;
  }
  // DUST (user1, 4 x 2026: shadowgrams are "by default very nearly invisibly-colored, just a few dust motes
  // mixed in gelatin"). Once a picture has taken its colours, its shadow has done its work, and is painted
  // at this strength: the ground's opposite, a twentieth solid. The text is untouched and pastes clean.
  // A shadow whose art was NOT found is left at full strength, so a fault stays in plain sight.
  // window.BELA_DUST, set before pasting: another strength, 0 to 1. 1 leaves every shadow as written.
  var DUST = (typeof window !== 'undefined' && window.BELA_DUST !== undefined) ? +window.BELA_DUST : 0.05;   // was 0.12; user1: "very nearly transparent"
  // THE JAM (user1, 5 x 2026: "a client-side change to halve the line-height of the colorburst-shadowgram ...
  // to hitch-up the mechanism part, once the illustration has been brought to life"). A long shadow makes a
  // void under its picture. Once the picture has its colours the shadow's lines are closed up to half their
  // pitch. No text is wrapped and no node is moved: only the line breaks that END a shadow line are styled, as
  // blocks with a negative margin, which pulls the next line up. The first shadow line stays where it was, so
  // nothing rides over the picture. Selecting and copying are as before. Undone when the paint is dropped.
  // window.BELA_JAM, set before pasting: how much of a line to take, 0 to 0.8. 0.5 unless set; 0 for none.
  var JAM = (typeof window !== 'undefined' && window.BELA_JAM !== undefined) ? Math.max(0, Math.min(0.8, +window.BELA_JAM)) : 0.5;
  var jammed = [];                                      // { br, host }: every break he has styled, to be put back
  function jamAfter(node, host, px) {                   // the line break that ends the line this text node is on
    var n = node, guard = 0;
    while (n && guard++ < 40) {
      var sib = n.nextSibling;
      while (sib && guard++ < 40) {
        if (sib.nodeName === 'BR') { if (!sib.dataset.bkJam) { sib.dataset.bkJam = '1'; sib.style.display = 'block'; sib.style.marginTop = (-px) + 'px'; jammed.push({ br: sib, host: host }); } return true; }
        if (sib.nodeType === 3 && sib.nodeValue.indexOf('\n') >= 0) return false;   // the line ends inside text: nothing to style
        if (sib.nodeType === 1 && sib.querySelector && sib.querySelector('br')) return false;
        sib = sib.nextSibling;
      }
      n = n.parentNode; if (!n || n === host) return false;
    }
    return false;
  }
  function unjam(host, keepWraps) {                    // keepWraps: a repaint of this host, which keeps its wrapped shadows
    jammed = jammed.filter(function (j) {
      var el = j.br || j.wrap;
      if (j.host !== host && el.isConnected) return true;
      if (j.wrap && keepWraps && j.host === host && el.isConnected) return true;
      unjamOne(j); return false;
    });
  }
  function unjamOne(j) {
    if (j.br) { j.br.style.display = ''; j.br.style.marginTop = ''; delete j.br.dataset.bkJam; return; }
    var sp = j.wrap, par = sp.parentNode;               // the shadow goes back into the text it came from
    if (!par) return;
    while (sp.firstChild) par.insertBefore(sp.firstChild, sp);
    par.removeChild(sp);
    // Only the two cuts he made are joined again, each into the very node it was cut from. No normalize: the
    // app may hold its lines as separate text nodes on purpose, and they stay as it made them.
    if (j.tail && j.tail.parentNode && j.z.parentNode) { j.z.nodeValue += j.tail.nodeValue; j.tail.parentNode.removeChild(j.tail); }
    if (j.head && j.head.parentNode && j.a.parentNode) { j.a.nodeValue += j.head.nodeValue; j.head.parentNode.removeChild(j.head); }
  }
  // THE JAM FOR TEXT (8 x 2026). In a message of user1's the lines are parted by newline characters inside text,
  // so there is no break to style. There, and only there, the shadow's run of text is held in a span of his own:
  // inline-block, so a copy is the text as sent with no added line; its own line height closed by JAM; padded at
  // the top by half the closing, so the first shadow line stays where it was. The run may cross several text
  // nodes (the app splits a long message into many), so long as they are siblings with nothing else between.
  // The words are not changed; the nodes are. Undone with the paint: the span goes and the two cuts are joined
  // back. user1 asked for it knowing the rule it bends.
  function jamWrap(f, o0, o1, host, lh) {
    if (o1 <= o0) return false;
    var a = f.at[2 * o0], ao = f.at[2 * o0 + 1], z = f.at[2 * (o1 - 1)], zo = f.at[2 * (o1 - 1) + 1] + 1, n;
    if (!a || !z || a.nodeType !== 3 || z.nodeType !== 3) return false;
    var par = a.parentNode;
    if (!par || z.parentNode !== par || (par.dataset && par.dataset.bkJamWrap)) return false;
    for (n = a; n && n !== z; n = n.nextSibling) if (n.nodeType !== 3) return false;   // text all the way, or not at all
    if (!n) return false;
    var rec = { host: host, a: a, z: null, head: null, tail: null };
    var first = a;
    if (ao > 0) { first = a.splitText(ao); rec.head = first; if (z === a) { z = first; zo -= ao; } }
    if (zo < z.nodeValue.length) { rec.tail = z.splitText(zo); rec.z = z; }
    var sp = document.createElement('span'), close = lh * JAM;
    sp.dataset.bkJamWrap = '1';
    sp.style.cssText = 'display:inline-block;vertical-align:top;max-width:100%;white-space:inherit;' +
      'line-height:' + (lh - close).toFixed(1) + 'px;padding-top:' + (close / 2).toFixed(1) + 'px';
    par.insertBefore(sp, first);
    var cur = first, nx;
    while (cur) { nx = cur.nextSibling; sp.appendChild(cur); if (cur === z) break; cur = nx; }
    rec.wrap = sp; jammed.push(rec);
    return true;
  }
  function dustOn(ground) {
    var dark = relLum(ground[0], ground[1], ground[2]) < 0.179;
    return 'rgba(' + (dark ? '255,255,255,' : '0,0,0,') + DUST + ')';
  }
  function relLum(r, g, b) {
    function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  function standsOff(a, b) { return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
  // THE EYE'S OWN SPACE. Lightness was first moved in HSL, the machine's tidy cylinder, and a pale colour
  // darkened there came out more vivid than it went in: bone on day became a tan. Colour is not a cylinder.
  // It is Munsell's lopsided tree: a trunk of lightness, hue around it, and vividness out along branches of
  // unequal length, yellow's long and high, blue's low. OKLab (Ottosson, 2020) is that tree made into sums,
  // and OKLCH is its L (lightness as seen), C (vividness), H (hue). Courtesy now climbs the trunk there:
  // H is kept, C is kept wherever such a colour exists and drawn in toward the trunk where it does not.
  function toLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function toLch(r, g, b) {
    r = toLin(r); g = toLin(g); b = toLin(b);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    var L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * q;
    var A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q;
    var B2 = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q;
    return [L, Math.sqrt(A * A + B2 * B2), Math.atan2(B2, A)];
  }
  function linOf(L, C, H) {                             // -> linear r, g, b; may fall outside 0..1: no such colour
    var A = C * Math.cos(H), B2 = C * Math.sin(H);
    var l = L + 0.3963377774 * A + 0.2158037573 * B2, m = L - 0.1055613458 * A - 0.0638541728 * B2;
    var q = L - 0.0894841775 * A - 1.2914855480 * B2;
    l = l * l * l; m = m * m * m; q = q * q * q;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q,
           -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q,
           -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * q];
  }
  function fromLch(L, C, H) {                           // the colour at this lightness and hue, as vivid as asked or as can be
    function fits(v) { return v[0] > -0.0005 && v[0] < 1.0005 && v[1] > -0.0005 && v[1] < 1.0005 && v[2] > -0.0005 && v[2] < 1.0005; }
    var v = linOf(L, C, H), lo = 0, hi = C, i;
    if (!fits(v)) { for (i = 0; i < 14; i++) { var mid = (lo + hi) / 2; if (fits(linOf(L, mid, H))) lo = mid; else hi = mid; } v = linOf(L, lo, H); }
    return v.map(function (c) { c = Math.max(0, Math.min(1, c));
      return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)); });
  }
  function courteous(hex, ground, want) {              // '#rrggbb', the ground as [r, g, b] -> '#rrggbb'
    want = want === undefined ? COURTESY : want;
    if (!want || !hex || !ground || hex.charAt(0) !== '#' || hex.length !== 7) return hex;
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var gl = relLum(ground[0], ground[1], ground[2]);
    if (standsOff(relLum(r, g, b), gl) >= want) return hex;
    // THE MIDDLE CIRCUIT (user1, same day: "we have always been surfing the middle circuit, and left and
    // right are natural"). A ground is rarely black or white. From a grey page a colour may step clear either
    // way, and the courteous way is the nearer one: a light colour goes lighter, a dark one darker, each
    // keeping its character. Only when the nearer way cannot clear the ground does it cross to the other.
    var lch = toLch(r, g, b), c;
    function toward(end) {                              // the nearest lightness toward that end which clears
      var lo = lch[0], hi = end, i, k;
      for (i = 0; i < 14; i++) {
        var mid = (lo + hi) / 2; k = fromLch(mid, lch[1], lch[2]);
        if (standsOff(relLum(k[0], k[1], k[2]), gl) >= want) hi = mid; else lo = mid;
      }
      k = fromLch(hi, lch[1], lch[2]);
      return { rgb: k, off: standsOff(relLum(k[0], k[1], k[2]), gl), step: Math.abs(hi - lch[0]) };
    }
    var up = toward(1), down = toward(0), upOk = up.off >= want - 0.02, downOk = down.off >= want - 0.02;
    c = (upOk && downOk ? (up.step <= down.step ? up : down) : upOk ? up : downOk ? down : (up.off >= down.off ? up : down)).rgb;
    function h2(n) { return (n < 16 ? '0' : '') + n.toString(16); }
    return '#' + h2(c[0]) + h2(c[1]) + h2(c[2]);
  }
  function groundOf(el) {                               // the nearest painted ground behind this element, as [r, g, b]
    var n = el, cs, t, a, k, parts;
    while (n && n.nodeType === 1) {
      t = getComputedStyle(n).backgroundColor || '';
      a = t.indexOf('('); k = t.indexOf(')');
      if (t.indexOf('rgb') === 0 && a > 0 && k > a) {
        parts = t.slice(a + 1, k).split(',').map(parseFloat);
        if (parts.length >= 3 && (parts.length < 4 || parts[3] >= 0.5)) return [parts[0], parts[1], parts[2]];
      }
      n = n.parentNode;
    }
    return CARD_GROUND;                                 // nothing found: assume the dark he was made for
  }
  function burstOf(t) { if (isPacked(t)) return t; var m = t.match(BURST_RE); return m ? m[0] : ''; }   // a packed line is taken whole
  // A SHADOW MAY BE BROKEN OVER SEVERAL LINES (user1, 4 x 2026: "the colorburst should be capable of
  // self-trimming at 78 columns"). Shadow lines standing one directly on the next are one shadow. Each line
  // asks: is there any of me behind me? The LAST line of the run speaks for all of it; the others say nothing.
  // -> null, or { first: the run's first line, burst: the whole of it, joined in order }. The art is looked
  // for above `first`. A shadow on one line is a run of one, and all is as it was.
  // SKYPAL's words, by courier. skypal.js (painted\skypal.js) is their home; this is the copy Bela carries so
  // that he is still one paste, and skypal.test.js holds the two to the same answer. Over a shadow's FIRST
  // period, marks above (U+0300 to U+030F, four bits each) spell words about the whole picture.
  //   1 = TURN: 1, pace, count, then two marks a slot. One step every 50 x (pace + 1) ms. Count 1 to 12.
  // A word not yet written is named in the console, and the rest of that sky is not read.
  //   2 = GROUND: 2, then a colour: one back colour under the whole picture.
  //   3 = RIFFLE: 3, then one mark: how strongly this picture riffles. 0 holds it still; 4 is the reader's own measure.
  // Over any LATER period, a sky is a BACK: a colour, for the cell or cells that period yields and every cell
  // after, until another says otherwise. A colour in the sky is two marks to a byte, and the byte means what a
  // yampal slot means: 00-7F palette, 80-BF 2-2-2, C r then g b, F0 then r g b, FF none.
  function skyOf(shadow) {                              // -> one list of sky values for each period
    var s = String(shadow || ''), out = [], i, cp;
    for (i = 0; i < s.length; i++) { cp = s.charCodeAt(i); if (s.charAt(i) === '.') out.push([]); else if (cp >= 0x0300 && cp <= 0x030F && out.length) out[out.length - 1].push(cp - 0x0300); }
    return out;
  }
  function skyColour(v, at) {                           // values from `at` -> { used, hex } ; used 0: could not be read
    var a = v[at], b = v[at + 1], byte;
    function h2(n) { return (n < 16 ? '0' : '') + n.toString(16); }
    if (a === undefined || b === undefined) return { used: 0 };
    byte = a * 16 + b;
    if (byte < 0x80) return { used: 2, hex: byte < PALETTE.length ? PALETTE[byte] : null };
    if (byte < 0xC0) return { used: 2, hex: '#' + h2(((byte >> 4) & 3) * 85) + h2(((byte >> 2) & 3) * 85) + h2((byte & 3) * 85) };
    if (a === 12) return v[at + 3] === undefined ? { used: 0 } : { used: 4, hex: '#' + h2(b * 17) + h2(v[at + 2] * 17) + h2(v[at + 3] * 17) };
    if (byte === 0xF0) return v[at + 7] === undefined ? { used: 0 } : { used: 8, hex: '#' + h2(v[at + 2] * 16 + v[at + 3]) + h2(v[at + 4] * 16 + v[at + 5]) + h2(v[at + 6] * 16 + v[at + 7]) };
    if (byte === 0xFF) return { used: 2, hex: null };
    return { used: 0 };
  }
  function skyWords(shadow) {                           // -> [{ word: 'turn', slots, ms } | { word: 'ground', hex }, ...]
    var sky = skyOf(shadow)[0] || [], out = [], i = 0, k;
    while (i < sky.length) {
      if (sky[i] === 0) { i++; continue; }
      if (sky[i] === 1) {
        var pace = sky[i + 1], n = sky[i + 2], slots = [];
        if (pace === undefined || n === undefined || n < 1 || n > 12 || i + 3 + 2 * n > sky.length) { console.log('[chinguard] sky mark ' + i + ': TURN is cut short'); break; }
        for (k = 0; k < n; k++) slots.push(sky[i + 3 + 2 * k] * 16 + sky[i + 4 + 2 * k]);
        out.push({ word: 'turn', slots: slots, ms: 50 * (pace + 1) });
        i += 3 + 2 * n; continue;
      }
      if (sky[i] === 2) {
        var c = skyColour(sky, i + 1);
        if (!c.used) { console.log('[chinguard] sky mark ' + i + ': GROUND could not be read'); break; }
        out.push({ word: 'ground', hex: c.hex });
        i += 1 + c.used; continue;
      }
      if (sky[i] === 3) {                               // RIFFLE: 3, then how much. 0: hold this picture still. 4: as the reader would by itself.
        if (sky[i + 1] === undefined) { console.log('[chinguard] sky mark ' + i + ': RIFFLE is cut short'); break; }
        out.push({ word: 'riffle', n: sky[i + 1] });
        i += 2; continue;
      }
      console.log('[chinguard] sky mark ' + i + ': word ' + sky[i] + ' is not written yet; the rest of this sky is not read'); break;
    }
    return out;
  }
  function skyBacks(shadow) {                           // -> { backs: one for each colour decode gives, in its order; ground }
    var skies = skyOf(shadow), sl = GRAMMAR.slots(shadow), out = [], n = 0, i = 0, k, d, v, more, cnt, c, cur = null, ground = null;
    skyWords(shadow).forEach(function (x) { if (x.word === 'ground') ground = x.hex; });
    cur = ground;
    if (sl.length && sl[0].length === 0) i = 1;
    for (; i < sl.length; i++) {                        // the walk is decode's own: one colour, none, or a run
      d = sl[i]; cnt = 1; var skip = 0;
      if (d.length >= 1 && d.length <= 2) {
        v = d.length === 1 ? d[0] : d[0] * 16 + d[1];
        if (v >= 0xC0 && v < 0xD0) skip = 1;
        else if (v >= 0xF0 && v < 0xF8) skip = 3;
        else if (v >= 0xF8) cnt = n ? (v & 7) + 1 : 0;
      }
      if (i > 0 && skies[i] && skies[i].length) { c = skyColour(skies[i], 0); if (c.used) cur = c.hex; }
      for (k = 0; k < cnt; k++) out[n++] = cur;
      i += Math.min(skip, sl.length - 1 - i);
    }
    return { backs: out, ground: ground };
  }
  function riffleOf(shadow) { var w = skyWords(shadow), i; for (i = 0; i < w.length; i++) if (w[i].word === 'riffle') return w[i].n; return null; }
  function turnOf(shadow) { var w = skyWords(shadow), i; for (i = 0; i < w.length; i++) if (w[i].word === 'turn') return w[i]; return null; }
  var packSaid = {};                                    // a complaint about a packed shadow is made once, not at every chirp
  function shadowRun(lines, b) {
    if (!isShadowText(lines[b]) || (b + 1 < lines.length && isShadowText(lines[b + 1]))) return null;
    var first = b, burst = burstOf(lines[b]);
    while (first > 0 && isShadowText(lines[first - 1])) { first--; burst = burstOf(lines[first]) + burst; }
    var nib = packLine(burst);                          // packed? then it is opened here, and is classic from here on
    if (nib) {
      var u = unpack(nib);
      if (!u.burst) { if (packSaid[burst] !== u.why) { packSaid[burst] = u.why; console.log('[chinguard] ' + u.why); } return null; }
      return { first: first, burst: u.burst, packed: true, from: u.packed, to: u.bytes };
    }
    return { first: first, burst: burst };
  }
  function readBurst(t) {                  // colours + complaints, said aloud
    var r = GRAMMAR.decode(burstOf(t), PALETTE);
    for (var i = 0; i < r.complaints.length; i++) console.log('[chinguard] ' + r.complaints[i]);
    return r.colours.filter(function (c) { return c; });
  }

  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined')
      module.exports = { decode: GRAMMAR.decode, PALETTE: PALETTE, isShadowText: isShadowText, burstOf: burstOf, readBurst: readBurst, inkOf: inkOf, solidOf: solidOf, solidBy: solidBy, solidPair: solidPair, skyWords: skyWords, skyBacks: skyBacks, isPaint: isPaint, dustOn: dustOn, shadowRun: shadowRun, riffleOf: riffleOf, isPacked: isPacked, inflate: inflate, unpack: unpack, packLine: packLine, artBlock: artBlock, courteous: courteous, relLum: relLum, standsOff: standsOff, toLch: toLch };
    return;
  }

  // ================= CONFIG =================
  var POS    = { left:'calc(50% - 180px)', top:'', right:'', bottom:'96px' };
  var WIDTH  = 486;                            // +32 (user1, 20 x: "He could expand-right by no more than 32px")                            // 80 more (user1, 10 x 2026: "he is a growing organism"); 454 (18 x: the (( )) "breaks tragically onto two lines ... I believe that is a famous engine of the past")
  var CANVAS = { w: 140, h: 32 };
  var SEED   = '↻';   // clockwise turn
  var SEED2  = '↺';   // its contra-twin, counterclockwise
  var RUN    = '#35d6d6';  // run-dot: blue-family, two notches to cyan
  var RUNSZ  = 6;          // his nose, at its full size again: the scan LEDs' own (user1, 5 x 2026; it had been 3)
  var CALM   = '#58bff0';  // checked left-rule (the calm LEDs' blue)
  var BRIGHT = '#9fc6ff';  // left-rule under analysis
  var SHOW_CLOCK = false;  // true brings the pocketwatch back
  // --- the bluebox ---
  var BLUE = {
    gap:   8,                               // px above his mighty flat head
    width: 0,                               // 0 = match the page's composer
    bg:    'rgba(22,20,64,.24)',            // night indigo, 24% -- dark mode without the R and G
    ink:   'rgba(255,255,255,.96)',         // 96% white
    line:  '2px solid #3f86d6',             // the single modest blue line
    glass: 'blur(3px)',                     // optical glass; '' for none
    font:  '',                              // '' = copy the composer; e.g. "11px/11px Iosevka"
    show:  true,
    headroom: 4,                            // px between the blue line and the text (User1's patch)
    measure: '550px',                       // the text column's width, centred in the glass (User1's patch). '' = use cols
    cols:  70                               // if no measure: characters per line before it wraps. 0 = fill the box
  };
  // =========================================

  var oldb = document.getElementById('blinken-clock'); if (oldb) oldb.remove();
  var olds = document.getElementById('blinken-style'); if (olds) olds.remove();
  var oldq = document.getElementById('bk-blue'); if (oldq) oldq.remove();
  var oldw = document.getElementById('bk-screw'); if (oldw) oldw.remove();
  var oldp = document.getElementById('bk-prev'); if (oldp) oldp.remove();
  if (window.__blinkenStop) window.__blinkenStop();

  var st = document.createElement('style'); st.id = 'blinken-style';
  st.textContent =
    '@keyframes bk-cw{to{transform:rotate(360deg)}}' +
    '@keyframes bk-ccw{to{transform:rotate(-360deg)}}' +
    // one blink, at the same long interval: enough to show he is alive (user1: "a single blink"; it had been four)
    // (and quick: two fifths of what it was. user1: "Thip- just like that.")
    '@keyframes bk-breathe{0%{opacity:1}2.4%{opacity:.25}4.8%{opacity:1}100%{opacity:1}}' +
    '#bk-seed,#bk-seed2{display:inline-block;color:#565b64}' +
    // HIS EYES DO NOT TURN. They had spun while he worked and stopped wherever they were, so his look at rest
    // was whatever the last job left. user1: "His normal, watchful, stern look shows the circular-arrow's gaps
    // pointing up, to suggest overlapping brows ... Rotating them as he works is fun but redundant, we have
    // other leds for that. Lighting up in amber is fierce and welcome." So: always upright; amber while he works.
    '#blinken-clock.bk-run #bk-seed,#blinken-clock.bk-run #bk-seed2{color:#ffd23f}' +
    '#bk-led{animation:bk-breathe 3s ease-in-out infinite}' +
    '#bk-blue-ta::placeholder{color:rgba(255,255,255,.28)}' +
    '#bk-blue-ta{scrollbar-width:thin;scrollbar-color:#3f86d6 transparent}' +
    // the tin hat: the suggestion is drawn by ::before from data-placeholder.
    // Transparent, not black, so it holds on any ground. The gem still reads it.
    // Five deep, so it outranks Clarion's own four-deep hint rule.
    '[data-testid="code-prompt-input"][contenteditable].ProseMirror p.is-editor-empty:first-child::before,' +
    '[data-testid="chat-input"][contenteditable].ProseMirror p.is-editor-empty:first-child::before' +
    '{color:transparent !important}';
  document.head.appendChild(st);

  var box = document.createElement('div');
  box.id = 'blinken-clock';
  box.style.cssText = [
    'position:fixed','z-index:2147483000','background:#0b0d10','border:1px solid #1d2026',
    'border-radius:10px','padding:9px 12px','box-shadow:0 6px 24px rgba(0,0,0,.5)',
    "font-family:'DejaVu Sans Mono','Courier New',monospace",
    'color:#cfcbc2','user-select:none','width:'+WIDTH+'px'
  ].join(';');
  ['left','top','right','bottom'].forEach(function(k){ if (POS[k]) box.style[k] = POS[k]; });
  try {                                   // Bela remembers where he was hung
    var HUNG = JSON.parse(localStorage.getItem('blinken-hung') || 'null');
    if (HUNG && HUNG.left != null) {
      box.style.left = HUNG.left + 'px'; box.style.top = HUNG.top + 'px';
      box.style.right = 'auto'; box.style.bottom = 'auto';
    }
  } catch (e) {}
  var BTN = 'cursor:pointer;color:#8f98a5;font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;margin-left:3px';
  box.innerHTML =
    '<div id="bk-head" style="display:flex;align-items:center;gap:8px;cursor:move;margin-bottom:7px">' +
      '<span id="bk-seed" style="font-size:14px">' + SEED + '</span>' +
      '<span id="bk-led" style="width:'+RUNSZ+'px;height:'+RUNSZ+'px;border-radius:50%;background:#12303f"></span>' +
      '<span id="bk-seed2" style="font-size:14px">' + SEED2 + '</span>' +
      '<span id="bk-go" title="chirp: read this screen, nearest first" style="'+BTN+'">(&nbsp;&nbsp;)</span>' +
      '<span id="bk-bt" title="the bluebox: show / hide" style="'+BTN+'">&#x25AD;</span>' +
      '<span id="bk-sb" title="the screwbox: Muriel\'s Affine Barberpole" style="'+BTN+'">\\\\</span>' +
      '<span id="bk-vt" title="ventilated prose: the words given room" style="'+BTN+'">..</span>' +
      '<span id="bk-tn" title="tincture: prose toned by its own structure \u00b7 wheel: strength" style="'+BTN+'">.:</span>' +
      (SHOW_CLOCK ? '<span id="bk-clock" style="font-size:15px;letter-spacing:.10em;margin-left:2px">--:--:--</span>' : '') +
      '<span style="flex:1"></span>' +
      '<span id="bk-scan" style="display:inline-flex;gap:5px;margin-right:8px"></span>' +
      '<span id="bk-x" style="cursor:pointer;color:#565b64;font-size:13px">✕</span>' +
    '</div>' +
    '<div style="display:flex;gap:12px;align-items:flex-end">' +
      '<canvas id="bk-vu" width="'+CANVAS.w+'" height="'+CANVAS.h+'" style="background:#070809;border-radius:5px"></canvas>' +
      '<div style="flex:1;font-size:10px;line-height:1.5;color:#565b64">' +
        '<div id="bk-eat">armed</div>' +
        '<div style="letter-spacing:.22em;margin-top:2px;color:#8f98a5">VESPERS</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(box);
  var eatLabel = document.getElementById('bk-eat');
  document.getElementById('bk-x').onclick = function () { if (window.__blinkenStop) window.__blinkenStop(); box.remove(); };

  var FEED = function(){ return document.querySelector('div[role="feed"]') || document.querySelector('[data-testid="transcript-list"]') || document.body; };
  var EATS = 'p, li, blockquote';        // both plates
  function leaves(root) {                // the eatable blocks, innermost only (an li holding a p is eaten as the p)
    var all = root.querySelectorAll(EATS), out = [], i;
    for (i = 0; i < all.length; i++) if (!all[i].querySelector(EATS)) out.push(all[i]);
    return out;
  }
  function inView(el){ var r = el.getBoundingClientRect(); var h = window.innerHeight || document.documentElement.clientHeight; return r.height > 0 && r.bottom > 0 && r.top < h; }

  document.getElementById('bk-go').onclick = function () {   // Bela's chirp: read whatever screen you're on
    try {
      console.log('[chinguard] (  ) hit');
      clearTimeout(scanDimTimer); setScan(4);
      var ps = leaves(FEED()), list = [], i, p, t;
      for (i = 0; i < ps.length; i++) {
        p = ps[i]; if (p.dataset.blinken || p.dataset.bkColored) continue;
        t = (p.textContent || '').trim();
        if (t.length < 2 || isShadowText(t)) continue;
        if (!inView(p)) continue;
        p.dataset.bkChecked = '';
        list.push({ food: t, cont: p });
      }
      list.reverse();                                              // nearest first
      var painted = paintView();                                   // and paint any illustration standing in view
      if (tintState.on) tintView();
      var said = painted > 0 ? ' \u00b7 ' + painted + ' painted' : '';
      console.log('[chinguard] chirp: ' + list.length + ' paragraph(s) on screen' +
        (painted < 0 ? '; no Highlight API in this browser, illustrations stay plain' : '; ' + painted + ' illustration(s) painted'));
      if (!list.length) {                                          // nothing to chew: say so, and let the four lights rest
        eatLabel.textContent = painted > 0 ? painted + ' painted' : 'nothing on screen';
        scanDimTimer = setTimeout(function () { if (!chewing) setScan(0); }, 800);
        return;
      }
      analyzeQueue = list;
      eatLabel.textContent = 'chirp · ' + list.length + ' echoes' + said;
      nextMeal();
    } catch (e) { console.log('[chinguard] chirp error:', e); }
  };

  var scanWrap = document.getElementById('bk-scan'), scanLeds = [];
  for (var q = 0; q < 4; q++) {
    var l = document.createElement('span');
    l.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#12303f;transition:background .25s,box-shadow .25s';
    scanWrap.appendChild(l); scanLeds.push(l);
  }
  function setScan(n) {
    for (var k = 0; k < 4; k++) {
      var on = k < n;
      scanLeds[k].style.background = on ? CALM : '#12303f';
      scanLeds[k].style.boxShadow = on ? '0 0 5px ' + CALM : 'none';
    }
  }

  (function () {                                        // drag by the head
    var h = document.getElementById('bk-head'), dr=false, ox=0, oy=0;
    h.addEventListener('pointerdown', function(e){ var id=e.target.id; if(id==='bk-x'||id==='bk-go'||id==='bk-bt'||id==='bk-sb'||id==='bk-vt'||id==='bk-tn'||id==='bk-tilt'||id==='bk-roll'||(e.target.closest&&e.target.closest('#bk-gauges')))return; dr=true; ox=e.clientX-box.offsetLeft; oy=e.clientY-box.offsetTop; h.setPointerCapture(e.pointerId); });
    h.addEventListener('pointermove', function(e){ if(!dr)return; box.style.left=(e.clientX-ox)+'px'; box.style.top=(e.clientY-oy)+'px'; box.style.right='auto'; box.style.bottom='auto'; placeBlue(); });
    h.addEventListener('pointerup', function(){ if(!dr)return; dr=false;
      try { localStorage.setItem('blinken-hung', JSON.stringify({left:box.offsetLeft, top:box.offsetTop})); } catch (e) {} });
  })();

  var clockTimer = null;
  if (SHOW_CLOCK) {
    var clk = document.getElementById('bk-clock');
    clockTimer = setInterval(function () {
      var t = new Date();
      clk.textContent = [t.getHours(),t.getMinutes(),t.getSeconds()].map(function(n){return (n<10?'0':'')+n;}).join(':');
    }, 1000);
  }

  // ---------- the complication: left-rule as progress instrument ----------
  function blockish(el){
    var d = getComputedStyle(el).display;
    return d === 'block' || d === 'flex' || d === 'grid' || d === 'list-item' || d === 'table';
  }
  function lastLeaf(el){                                // the last LINE in it, not the box
    var kids = [].slice.call(el.children).filter(blockish);
    return kids.length ? lastLeaf(kids[kids.length - 1]) : el;
  }
  function blockFor(el){                                // repair 2: paint something that has a box
    var n = el;
    while (n && n !== document.body && !blockish(n)) n = n.parentElement;
    return n || el;
  }
  function prevBlock(p){                                // repair 1: the block before, locally
    var stop = FEED(), n = p;
    while (n && n !== stop && n !== document.body) {
      var s = n.previousElementSibling;
      while (s) {
        var t = (s.textContent || '').trim();
        if (t && !isShadowText(t)) return lastLeaf(s);
        s = s.previousElementSibling;
      }
      n = n.parentElement;
    }
    return null;
  }
  function setBar(p, w, bg){ blockFor(p).style.background = bg + ' left/' + w + ' 100% no-repeat'; }
  function mute(p){ var c = p && blockFor(p).parentElement; if (c && !c.dataset.bkMuted) { c.style.borderLeftColor='transparent'; c.dataset.bkMuted='1'; } }
  // THE SEEN STRIP (user1, 21 x 2026: "leave the 'seen' strip -- though a dark gray one would be better, to say the most subtly: seen.
  // If Bela is deactivated, it would of course not be drawn"): no longer an inline background on each paragraph but one rule keyed on
  // the mark, in a style Bela owns, so his stop and his sleep take every strip away at once and bring them back as they were.
  var seenStyle = document.getElementById('bk-seen-style') || document.createElement('style'); seenStyle.id = 'bk-seen-style';
  seenStyle.textContent = '[data-bk-checked="1"]:not([data-bk-colored]){background:linear-gradient(#3a3f47,#3a3f47) left/1px 100% no-repeat}';
  if (!seenStyle.parentNode) document.head.appendChild(seenStyle);
  (function () { var old = document.querySelectorAll('[style*="gradient"]'), i; for (i = 0; i < old.length; i++) if (!old[i].closest('#blinken-clock, #bk-blue, #bk-screw, #bk-prev') && /rgba?\((88, ?191, ?240|159, ?198, ?255)/.test(old[i].style.background)) old[i].style.background = ''; })();   // the calm-blue strips an earlier paste painted inline, wherever it put them
  function ruleChecked(p){ if(!p||p.dataset.bkColored) return; mute(p); var b = blockFor(p); if (b && /rgba?\((88, ?191, ?240|159, ?198, ?255)/.test(b.style.background)) b.style.background = ''; p.dataset.bkChecked='1';   /* the calm blue of old and the bright bar of analysis both give way to the seen rule */ if (b && b !== p) b.dataset.bkChecked='1'; }
  function ruleAnalyze(p){ if(!p) return; mute(p); setBar(p, '3px', 'linear-gradient('+BRIGHT+','+BRIGHT+')'); }

  function applyColor(el, cols) {   // colours as a vertical strip at the left edge; 1px black rails between
    var n = cols.length, stops = [], k, W = '100%/' + n;
    for (k = 0; k < n; k++) {
      var lo = k === 0    ? '0%'   : 'calc(' + k + '*' + W + ' + 0.5px)';
      var hi = k === n-1  ? '100%' : 'calc(' + (k+1) + '*' + W + ' - 0.5px)';
      stops.push(cols[k] + ' ' + lo, cols[k] + ' ' + hi);
      if (k < n-1) stops.push('#000 calc(' + (k+1) + '*' + W + ' - 0.5px)', '#000 calc(' + (k+1) + '*' + W + ' + 0.5px)');
    }
    // the strip starts one line down: the title, if there is one, stands clear of it (user1: "so that the one-line
    // title, if any, might shine alone without overstrike")
    var blk = blockFor(el), t0 = vTrim(flatText(blk).text.split(String.fromCharCode(10))[0] || ''), titled = !!t0 && t0.toUpperCase() === t0 && t0.toLowerCase() !== t0;
    var one = titled ? (parseFloat(getComputedStyle(blk).lineHeight) || parseFloat(getComputedStyle(blk).fontSize) * 1.3 || 20) : 0;
    blk.style.background = 'linear-gradient(to bottom, ' + stops.join(', ') + ') left ' + Math.round(one) + 'px/3px calc(100% - ' + Math.round(one) + 'px) no-repeat';
    el.dataset.bkColored = '1';
  }

  function sweep() {
    var ps = leaves(FEED()), i, p, t;
    for (i = 0; i < ps.length; i++) {
      p = ps[i]; t = p.textContent || '';
      if (p.dataset.blinken === String(t.length)) continue;   // read already AT THIS LENGTH: a burst still streaming in is read again when it has grown
      if (isShadowText(t)) {                         // (user1, 21 x 2026: the cards "worked once I had nudged Bela ... with his Chirp key" -- a burst read half-arrived was marked done and never read whole)
        try {
          p.dataset.blinken = String(t.length);        // the encoding stays visible, as a shadow
          var cols = readBurst(t);                      // repair 4: yampal grammar, passed palette, complaints said
          var tgt = ownArt(p) ? p : prevBlock(p);   // a message holding art and burst together wears its own strip
          if (tgt && cols.length) {
            analyzeQueue.unshift({ food: (tgt.textContent||'').trim(), cont: tgt, applied: true, cols: cols });
            if (!chewing) nextMeal();
          }
        } catch (e) { console.log('[chinguard] sweep:', e); }
      } else if (!p.dataset.bkChecked && !p.dataset.bkColored && t.length > 1) {
        ruleChecked(p);
      }
    }
  }
  function sweepAndTone() { sweep(); if (tintState.on) tintView(); if (voiceState.tint) lampView(); if (voiceState.rings) ringViewSoon(); if (tiltState.on || tiltState.pageWyrd || tiltState.flags || tiltState.vid) tiltViewSoon(); }   // a redraw drops paint; the next sweep puts tincture back
  var moTarget = FEED();
  var mo = new MutationObserver(function(){ clearTimeout(mo._t); mo._t = setTimeout(sweepAndTone, 500); });
  mo.observe(moTarget, {childList:true, subtree:true});   // scoped to the feed, no characterData (web-vitals storm)
  var sweepTimer = setInterval(sweepAndTone, 3000);

  // ---------- BeBox twin VU: one pass per meal, then rests ----------
  var vu = document.getElementById('bk-vu'), g = vu.getContext('2d');
  var H = vu.height, SEG = 8, a = 0, b = 0;
  var chewing = false, chewPos = 0, chewLen = 0, raf = 0, currentFood = '', currentPara = null, currentApplied = true, analyzeQueue = [], scanDimTimer = null, currentCols = null;
  function codeAt(s, i){ return s.length ? s.charCodeAt(((i % s.length)+s.length)%s.length) : 0; }
  function drawBar(side, level) {
    var colW = 46, gap = 10, x0 = side === 0 ? 12 : 12 + colW + gap;
    var n = Math.round(level * SEG), sh = (H-6) / SEG, k, y, hue, on;
    g.clearRect(x0-2, 0, colW+4, H);
    for (k = 0; k < SEG; k++) {
      y = H - 3 - (k+1)*sh + 1; hue = 260 - (k/(SEG-1))*260; on = k < n;
      g.fillStyle = 'hsla(' + hue.toFixed(0) + ',85%,' + (on?58:14) + '%,' + (on?1:0.45) + ')';
      g.fillRect(x0, y, colW, sh - 1.5);
    }
  }
  function chew(food, paraCont, applied, cols) {      // repair 3: the guard holds the element, and only mid-meal
    if (!food || (chewing && paraCont && paraCont === currentPara)) return false;
    currentFood = food; currentPara = paraCont || null; currentApplied = applied !== false; currentCols = cols || null; chewLen = food.length; chewPos = 0;
    chewing = true; box.classList.add('bk-run'); clearTimeout(scanDimTimer); setScan(0);
    ruleAnalyze(currentPara);
    eatLabel.textContent = 'chewing ¶ (' + chewLen + ')' + (analyzeQueue.length ? ' · ' + analyzeQueue.length + ' waiting' : '');
    if (!raf) raf = requestAnimationFrame(frame);
    return true;
  }
  function nextMeal() {                               // a refused dish never stalls the queue
    while (analyzeQueue.length) {
      var nx = analyzeQueue.shift();
      if (chew(nx.food, nx.cont, nx.applied === true, nx.cols)) return true;
    }
    return false;
  }
  function frame() {
   try {
    if (chewing) {
      var s = currentFood;
      chewPos += Math.max(2, Math.round(chewLen / 90));
      var surprise = Math.min(1, Math.abs(codeAt(s,chewPos) - codeAt(s,chewPos-1)) / 40);
      var c = String.fromCharCode(codeAt(s,chewPos)).toLowerCase();
      var energy = 'aeiou'.indexOf(c) >= 0 ? 0.9 : (c === ' ' ? 0.05 : 0.4 + (codeAt(s,chewPos)%16)/40);
      a = a*0.7 + surprise*0.3; b = b*0.7 + energy*0.3;
      setScan(Math.min(4, Math.ceil(chewPos / chewLen * 4)));
      if (chewPos >= chewLen) {
        chewing = false; box.classList.remove('bk-run'); setScan(4);
        if (currentPara) { if (currentApplied && currentCols) applyColor(currentPara, currentCols); else ruleChecked(currentPara); }
        if (!nextMeal()) { eatLabel.textContent = 'au fait'; clearTimeout(scanDimTimer); scanDimTimer = setTimeout(function(){ if (!chewing) setScan(0); }, 800); }
      }
    } else { a *= 0.72; b *= 0.72; if (a < 0.02) a = 0; if (b < 0.02) b = 0; }
    drawBar(0, a); drawBar(1, b);
    if (chewing || a > 0 || b > 0) raf = requestAnimationFrame(frame); else raf = 0;
   } catch (e) { console.log('[chinguard] frame:', e); raf = requestAnimationFrame(frame); }
  }
  drawBar(0, 0); drawBar(1, 0);

  // ================= the BLUEBOX =================
  // Affixed BLUE.gap px above his head, always; he carries it wherever he is
  // hung. Drag its top edge sideways to line it up with the text frame; drag
  // its right edge to set the width; double-click the top edge to re-centre.
  // Both remembered.
  // v3: both worlds name their parts. Chat: chat-input, chat-input-send.
  // Code: code-prompt-input, code-prompt-send. The names are the address.
  var HOST_ED   = '[data-testid="chat-input"], [data-testid="code-prompt-input"]';
  var HOST_SEND = '[data-testid="chat-input-send"], [data-testid="code-prompt-send"]';
  var HOST_SEND_BUSY = '[data-cds="ChatComposerPrimaryAction"] button[aria-label="Send message"]';   // the reluctant one, while the model thinks (user1's paste, 10 x 2026): no testid, only a name in its slot; beside it "Stop response", never pressed
  var HOST_FR   = '[data-cds="ChatComposer"] > div:first-child';   // the visible frame, both worlds
  function hostEditor() {
    return document.querySelector(HOST_ED) ||
           document.querySelector('div.ProseMirror[contenteditable="true"]') ||
           document.querySelector('[contenteditable="true"][role="textbox"]');
  }
  function hostFrame(ed) {                             // the composer's visible frame
    var fr = ed.closest(HOST_FR) || document.querySelector(HOST_FR);   // the page names it; believe the page first
    if (fr) return fr;
    var n = ed;                                        // else: first ancestor 400px+ wide with a border or background
    while (n && n !== document.body) {
      var cs = getComputedStyle(n), w = n.getBoundingClientRect().width;
      if (w >= 400 && (parseFloat(cs.borderTopWidth) > 0 || cs.backgroundColor !== 'rgba(0, 0, 0, 0)')) return n;
      n = n.parentElement;
    }
    return ed;
  }
  function hostSend() {                                // named, or nothing: never a page-wide guess
    var b = document.querySelector(HOST_SEND) || document.querySelector(HOST_SEND_BUSY);   // Chat: absent while empty. Code: present, disabled. Busy: the queue-commit by its label
    return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' ? b : null;
  }
  function hostMaxH(ed) {
    var n = ed;
    while (n && n !== document.body) { var m = getComputedStyle(n).maxHeight; if (m && m !== 'none') return parseFloat(m); n = n.parentElement; }
    return Math.round(window.innerHeight * 0.4);
  }

  var blueState = { dx: 0, dy: 0, w: 0, show: BLUE.show, vent: false };
  try { var bs = JSON.parse(localStorage.getItem('blinken-blue') || 'null'); if (bs) for (var kk in bs) blueState[kk] = bs[kk]; } catch (e) {}
  function saveBlue(){ try { localStorage.setItem('blinken-blue', JSON.stringify(blueState)); } catch (e) {} }

  var ed0 = hostEditor(), fr0 = ed0 ? hostFrame(ed0) : null, ecs = ed0 ? getComputedStyle(ed0) : null;
  var defaultW = BLUE.width || (fr0 ? Math.round(fr0.getBoundingClientRect().width) : 705);
  var maxH = ed0 ? hostMaxH(ed0) : 240;

  var blue = document.createElement('div');
  blue.id = 'bk-blue';
  blue.style.cssText = [
    'position:fixed','z-index:2147482999','box-sizing:border-box',
    'background:' + BLUE.bg, 'border-top:' + BLUE.line,
    BLUE.glass ? 'backdrop-filter:' + BLUE.glass + ';-webkit-backdrop-filter:' + BLUE.glass : '',
    'padding:' + BLUE.headroom + 'px 0 0'
  ].join(';');
  var ta = document.createElement('textarea');
  ta.id = 'bk-blue-ta'; ta.rows = 1; ta.spellcheck = true;
  ta.placeholder = 'bluebox · Enter sends · Shift+Enter new line';
  ta.style.cssText = [
    'display:block','width:100%','box-sizing:border-box','resize:vertical','border:0','outline:0','margin:0 auto',
    'background:transparent','color:' + BLUE.ink,'caret-color:' + BLUE.ink,'overflow-y:auto',
    'padding:' + (ecs ? ecs.paddingTop + ' ' + ecs.paddingRight + ' ' + ecs.paddingBottom + ' ' + ecs.paddingLeft : '10px 14px')
  ].join(';');
  if (BLUE.font) ta.style.font = BLUE.font;
  else if (ecs) { ta.style.fontFamily = ecs.fontFamily; ta.style.fontSize = ecs.fontSize; ta.style.lineHeight = ecs.lineHeight; ta.style.letterSpacing = ecs.letterSpacing; ta.style.fontWeight = ecs.fontWeight; }
  else ta.style.font = '11px/11px Iosevka, monospace';
  var hostMax = ed0 && ed0.getAttribute('maxlength'); if (hostMax) ta.maxLength = +hostMax;
  blue.appendChild(ta);
  function setMeasure() {                               // the column: a set width, or BLUE.cols characters in the box's own type
    if (BLUE.measure) { ta.style.width = BLUE.measure; ta.style.maxWidth = '100%'; return; }
    if (!BLUE.cols) { ta.style.width = '100%'; return; }
    var cs = getComputedStyle(ta), probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
    probe.style.fontFamily = cs.fontFamily; probe.style.fontSize = cs.fontSize; probe.style.fontWeight = cs.fontWeight;   // longhands: the computed `font` shorthand can come back empty (Gecko)
    probe.style.letterSpacing = cs.letterSpacing;
    probe.textContent = new Array(BLUE.cols + 1).join('0');
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    ta.style.width = Math.ceil(w + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 1) + 'px';
    ta.style.maxWidth = '100%';
  }
  var gripT = document.createElement('div');           // top edge: the windowshade (user1, 18 x 2026: the sideways slide was "silly ... he always has the boxen perfectly centered atop head"; "a sure, updown arrow, promising just as Muriel's view does")
  gripT.title = 'drag up or down: the shade · double-click: let it go';
  gripT.style.cssText = 'position:absolute;left:0;right:8px;top:-5px;height:10px;cursor:ns-resize;z-index:2';
  var gripR = document.createElement('div');           // right edge: width
  gripR.title = 'drag to set width';
  gripR.style.cssText = 'position:absolute;right:-4px;top:0;bottom:0;width:8px;cursor:ew-resize';
  blue.appendChild(gripT); blue.appendChild(gripR);
  document.body.appendChild(blue);
  setMeasure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setMeasure(); fit(); });

  // THE WINDOWSHADE (user1, 18 x 2026: the bluebox "vertically resizeable, like Muriel's barberpole ... to momentarily draw the
  // curtain on the context ... and as well, to compress it down ... I suppose it could reset on submit ... that setting of the
  // windowshade is relieved when it is rolled-up"): the glass keeps its self-expanding nature until the corner is dragged; a dragged
  // height holds, propped up or mooshed down, over anything typed, and is relieved on send and when the box is hidden.
  var shade = 0;
  function fit() {                                      // grows line by line, like the real one, to the same ceiling -- unless the shade is set
    if (shade) { ta.style.height = shade + 'px'; placeBlue(); return; }
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px';
    placeBlue();
  }
  (function () {
    var h0 = 0;
    ta.addEventListener('pointerdown', function () { h0 = ta.offsetHeight; });
    ta.addEventListener('pointerup', function () { var h1 = ta.offsetHeight; if (h0 && Math.abs(h1 - h0) >= 2) { shade = h1; placeBlue(); } h0 = 0; });
    ta.addEventListener('dblclick', function (e) { if (e.offsetX > ta.clientWidth - 18 && e.offsetY > ta.clientHeight - 18) { shade = 0; fit(); } });   // a double-click in the corner relieves it by hand
  })();
  function placeBlue() {
    if (screw) placeScrew();                            // the screwbox rides in the same place
    blue.style.display = blueState.show ? 'block' : 'none';
    if (!blueState.show) { if (prev) { prev.style.display = 'none'; prevBurst = ''; } return; }
    var br = box.getBoundingClientRect(), w = blueState.w || defaultW;
    blue.style.width = w + 'px';
    blue.style.left = Math.round(br.left + br.width / 2 - w / 2 + blueState.dx) + 'px';
    blue.style.bottom = Math.round(window.innerHeight - br.top + BLUE.gap) + 'px';   // affixed: always BLUE.gap over his head
    if (prev && prevBurst) previewBurst();              // the read-ahead glass rides with it
  }
  (function () {                                        // the two grips
    var mode = null, sx = 0, sy = 0, s0 = null;
    function down(m){ return function(e){ mode = m; sx = e.clientX; sy = e.clientY; s0 = { dx: blueState.dx, dy: blueState.dy, w: blueState.w || defaultW, h: ta.offsetHeight }; e.target.setPointerCapture(e.pointerId); e.preventDefault(); }; }
    function move(e){ if (!mode) return;
      if (mode === 'T') { shade = Math.max(24, s0.h - (e.clientY - sy)); fit(); return; }   // the shade: up is taller, as the pole's grip; it holds until send or roll-up
      else { var nw = Math.max(200, s0.w + (e.clientX - sx)); blueState.w = nw; blueState.dx = s0.dx + (nw - s0.w) / 2; }   // left edge holds still
      placeBlue(); }
    function up(){ if (mode) { mode = null; saveBlue(); } }
    gripT.addEventListener('pointerdown', down('T')); gripR.addEventListener('pointerdown', down('R'));
    [gripT, gripR].forEach(function (el) { el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); });
    gripT.addEventListener('dblclick', function(){ shade = 0; blueState.dx = 0; blueState.dy = 0; fit(); saveBlue(); placeBlue(); });   // let go, and sit centred
  })();

  try { ta.value = localStorage.getItem('blinken-draft') || ''; } catch (e) {}
  ta.addEventListener('input', function(){ fit(); try { localStorage.setItem('blinken-draft', ta.value); } catch (e) {} });
  ta.addEventListener('keydown', function (e) {
    e.stopPropagation();                                // the page's own shortcuts don't steal his keys
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendBlue(); }
    else if (e.key === 'Escape') ta.blur();
  });
  ['keyup','keypress'].forEach(function (k) { ta.addEventListener(k, function (e) { e.stopPropagation(); }); });

  function sendBlue() {
    var text = ta.value.replace(/\s+$/, '');
    if (!text) return;
    if (blueState.vent) text = ventSend(text);         // vented: indents survive the trip
    sendText(text, blueState.vent ? 'vented box' : 'bluebox', function () {
      ta.value = ''; try { localStorage.removeItem('blinken-draft'); } catch (e) {}
      shade = 0;                                        // the shade is relieved on send
      ta.dispatchEvent(new Event('input', { bubbles: true }));   // THE GHOST (user1, 10 x 2026: "the contents of the text I sent remain in bluebox ... I hit spacebar to dismiss them"):
      fit(); previewBurst(); setTimeout(function(){ ta.focus(); }, 300);   // setting .value fires no input, so the lit mirror behind the glass kept the sent words; told now, as a keystroke would
    });
  }
  function sendText(text, who, done) {                  // hand the words to the page's composer, then press its Send
    var ed = hostEditor();
    if (!ed) { eatLabel.textContent = 'no composer found'; console.log('[chinguard] bluebox: no composer on this page'); return; }
    ed.focus();
    if (ed.tagName === 'TEXTAREA') {
      var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ed, text); ed.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      document.execCommand('selectAll', false, null);
      try {                                             // a paste keeps the line breaks as the editor understands them
        var dt = new DataTransfer(); dt.setData('text/plain', text);
        ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      } catch (e) {}
      var probe = text.replace(/\s+/g, ' ').slice(0, 24);
      if ((ed.textContent || '').replace(/\s+/g, ' ').indexOf(probe) === -1) {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
      }
    }
    var tries = 0, keyed = false;                       // Chat's Send arrives after the words do: look up to ~1s
    function pressEnter() {                             // THE OTHER COMMIT (user1, 10 x 2026: while the model is thinking, "my own Enter key here has no
      keyed = true;                                     // lease. It searches for the keying of a calm-commit button"): when no calm Send answers, the
      ['keydown', 'keypress', 'keyup'].forEach(function (k) {   // host's own Enter is pressed on its composer, which is what the keyboard would have done --
        try { ed.dispatchEvent(new KeyboardEvent(k, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true })); } catch (e) {}   // the queue, the interrupt, whatever the page keeps there
      });
    }
    (function look() {
      var btn = hostSend();
      if (!btn) {
        if (++tries === 3 && !keyed) { pressEnter(); setTimeout(look, 300); return; }   // a third of a second with no Send: try the key
        if (tries < 7) { setTimeout(look, 160); return; }
        if (!(ed.textContent || '').trim()) { eatLabel.textContent = 'sent (by Enter)'; console.log('[chinguard] ' + who + ': sent ' + text.length + ' chars by Enter'); if (done) done(); return; }
        eatLabel.textContent = 'Send not found';
        console.log('[chinguard] ' + who + ': the words are in the composer, but no Send button answered. Your draft is kept.');
        return;
      }
      btn.click();
      setTimeout(function () {                          // v3: "sent" only when the composer has emptied
        if (!(ed.textContent || '').trim()) {
          eatLabel.textContent = 'sent';
          console.log('[chinguard] ' + who + ': sent ' + text.length + ' chars');
          if (done) done();
        } else {
          eatLabel.textContent = 'not sent';
          console.log('[chinguard] ' + who + ': Send was pressed but the composer still holds the words. Your draft is kept.');
        }
      }, 300);
    })();
  }

  // ================= the bluebox READS AHEAD =================
  // Bela checks the bluebox as you type, the way the spellchecker does: when a
  // line holds a colorburst, he decodes it (yampal grammar, the carried palette),
  // finds the art it belongs to, and shows it coloured in a small glass above
  // the blue line -- before you send. Every burst in the box gets its own card,
  // side by side like cards in the hand. A complaint is said on its card; no
  // complaint, nothing said.
  var prev = document.createElement('div');
  prev.id = 'bk-prev';
  prev.style.cssText = 'position:fixed;z-index:2147482998;display:none;pointer-events:none;' +   // a hand of cards, left to right
    'gap:8px;align-items:flex-end;overflow:hidden;color:' + BLUE.ink;
  document.body.appendChild(prev);
  var prevBurst = '', prevT = null;
  var prevGone = {}, prevSeen = {};                    // closed cards stay closed until their burst changes; seen cards are chewed once
  var PREV = { max: 4, glass: 'rgba(11,13,16,.90)', blur: 'blur(2px)' };
  // THE WHEEL ON THE HAND (user1, 4 x 2026: "I would love to have been able to mousewheel the color previews
  // back and forth to see them all"). The hand still shows four, but holds every card. The wheel, over the
  // hand, steps it one card: down toward the later ones, up toward the earlier. No glide. prevAt is the
  // first card shown; null means the latest four, and a change in how many cards there are returns to that.
  var prevAt = null, prevN = 0;
  // a braille blank (U+2800) is an indent that survived a send: no ink, so no
  // colour slot. Art pasted back from a sent message counts as it did before.
  function inked(ch) { return ch !== '⠀' && ch.trim() !== ''; }
  // the first slot of every burst is the card's HEAD colour, the headline's.
  // The headline is the card's WORD: of the lines standing directly on the art
  // (three at most, no gap), the nearest one in capitals; failing that, the
  // line right above the art. Section, WORD, anglo is how a card is written.
  function headLine(lines, top) {
    var i, t, first = -1;
    for (i = top - 1; i >= 0 && i >= top - 3; i--) {
      t = vTrim(lines[i]);
      if (!t || isShadowText(t)) break;
      if (first < 0) first = i;
      if (t.toUpperCase() === t && t.toLowerCase() !== t) return i;
    }
    return first;
  }
  function artBlock(lines, b, n, positional) {        // the block of lines just above the burst that its colours fit
    var best = -1, glyphs = {}, count = 0, cells = 0, i, k, ch;
    for (i = b - 1; i >= 0 && i >= b - 16; i--) {
      if (!lines[i].trim()) { if (i < b - 1) break; else continue; }
      var cps = Array.from(lines[i].replace(/\s+$/, ''));
      cells += cps.filter(inked).length;              // a painting spends one slot per INKED cell; blanks take none (Philinguity's toBurst)
      for (k = 0; k < cps.length; k++) { ch = cps[k]; if (inked(ch) && !glyphs[ch]) { glyphs[ch] = 1; count++; } }
      if (positional ? cells === n : count === n) best = i;
    }
    return best;
  }
  // the preview is art, and art is columns: a monospace face, always. Size and
  // spacing come from the bluebox by longhand; the computed `font` shorthand can
  // come back empty (Gecko), and then the glass fell to the page's ui-sans.
  var ART_FACE = "Iosevka, Consolas, 'DejaVu Sans Mono', 'Courier New', monospace";
  function artFont() {
    var cs = getComputedStyle(ta);
    return 'font-family:' + ART_FACE + ';font-size:' + cs.fontSize + ';letter-spacing:' + cs.letterSpacing +
           ';font-weight:normal;font-style:normal;line-height:1.15;white-space:pre';
  }
  function esc(c){ return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c; }
  function burstCard(lines, b, whole) {                // one shadow (b: its first line) and the art above it -> one card
    var burst = whole || burstOf(lines[b]), r = GRAMMAR.decode(burst, PALETTE), pos = r.mode === 'positional';
    var cols = r.colours, kind = {};                   // courtesy is paid glyph by glyph: ink yes, paint no
    function ink(c, ch) { return !c || isPaint(ch) ? c : (kind[c] || (kind[c] = courteous(c, CARD_GROUND))); }
    var top = artBlock(lines, b, cols.length - 1, pos), html = '', i;
    if (top >= 0) {
      var hd = headLine(lines, top);
      if (hd >= 0 && cols[0]) html += '<span style="color:' + ink(cols[0], 'A') + '">' + Array.from(vTrim(lines[hd])).map(esc).join('') + '</span>\n';
      var map = {}, mapB = {}, next = 1, cell = 1, bk = skyBacks(burst);
      for (i = top; i < b; i++) {
        var cps = Array.from(lines[i].replace(/\s+$/, ''));
        cps.forEach(function (ch) {
          var col, back = null;
          if (pos) { if (inked(ch)) { back = bk.backs[cell]; col = cols[cell++]; } }
          else if (inked(ch)) { if (!(ch in map)) { mapB[ch] = bk.backs[next]; map[ch] = cols[next++]; } col = map[ch]; back = mapB[ch]; }
          var sl = col ? PALETTE.indexOf(col) : -1, cls = '';
          if (col && back) {                            // the picture chose both colours: glyph as written, on its back
            if (sl >= 0) { cls = 'bk-s' + sl; cardCls[cls] = { slot: sl, ink: null }; }
            html += '<span' + (cls ? ' class="' + cls + '"' : '') + ' style="color:' + col + ';background:' + back + '">' + esc(ch) + '</span>';
          } else if (!col && bk.ground && !inked(ch)) {
            html += '<span style="background:' + bk.ground + '">' + esc(ch) + '</span>';
          } else if (col && SOLID && isPaint(ch)) {
            var share = inkOf(ch), sc = solidPair(col, share);
            if (sl >= 0) { cls = 'bk-s' + sl + '-i' + Math.round(share * 100); cardCls[cls] = { slot: sl, ink: share }; }
            html += '<span' + (cls ? ' class="' + cls + '"' : '') + ' style="color:' + sc.i + ';background:' + sc.g + '">' + esc(ch) + '</span>';
          } else if (col) {
            if (sl >= 0) { cls = 'bk-s' + sl; cardCls[cls] = { slot: sl, ink: null }; }
            html += '<span' + (cls ? ' class="' + cls + '"' : '') + ' style="color:' + ink(col, ch) + '">' + esc(ch) + '</span>';
          } else html += esc(ch);
        });
        html += '\n';
      }
    }
    var ok = cols.filter(function (c) { return c; });
    if (ok.length > 48) { var step = ok.length / 48; ok = ok.filter(function (c, j) { return Math.floor(j / step) !== Math.floor((j - 1) / step); }); }   // a photograph's strip: a sample, not a thousand bands
    var bar = ok.length ? 'linear-gradient(to bottom,' + ok.map(function (c, j) {
      return c + ' ' + (j * 100 / ok.length).toFixed(2) + '% ' + ((j + 1) * 100 / ok.length).toFixed(2) + '%'; }).join(',') + ') left/3px 100% no-repeat' : '';
    var say = (pos ? 'positional' : 'glyph') + ' \u00b7 ' + (cols.length - 1) + (pos ? ' cells' : ' glyphs') +
              (top < 0 ? ' \u00b7 art not found above it' : '') +
              (r.complaints.length ? ' \u00b7 ' + r.complaints[0] : '');   // no complaints: nothing is said
    var food = lines.slice(Math.max(0, top), b).join('\n');
    return { key: burst + '\n' + food, html: html, bar: bar, say: say, food: food, complaints: r.complaints, turn: turnOf(burst) };
  }
  function previewBurst() {
    var lines = ta.value.split('\n'), all = [], i;
    if (blueState.show) for (i = 0; i < lines.length; i++) { var w = shadowRun(lines, i); if (w) all.push(burstCard(lines, w.first, w.burst)); }
    var seen = {}, gone = {};
    all.forEach(function (c) {
      if (!prevSeen[c.key] && !seen[c.key]) {           // a new card: he chews it once, as he would in the feed
        if (c.complaints.length) console.log('[chinguard] bluebox burst: ' + c.complaints.join(' | '));
        if (c.food.trim()) { if (chewing) analyzeQueue.push({ food: c.food, cont: null }); else chew(c.food, null, false); }
      }
      seen[c.key] = 1; if (prevGone[c.key]) gone[c.key] = 1;
    });
    prevSeen = seen; prevGone = gone;
    prevBurst = all.map(function (c) { return c.key; }).join('\u0001');
    var cards = all.filter(function (c) { return !gone[c.key]; });
    var total = cards.length, first = Math.max(0, total - PREV.max);            // the hand shows the latest few...
    if (total !== prevN) { prevAt = null; prevN = total; }
    if (prevAt !== null) first = Math.max(0, Math.min(prevAt, total - PREV.max));   // ...or where the wheel left it
    cards = cards.slice(first, first + PREV.max);
    if (!cards.length) { prev.style.display = 'none'; cardTurns = []; return; }
    var padL = getComputedStyle(ta).paddingLeft || '14px', font = artFont();
    prev.innerHTML = cards.map(function (c, n) {
      return '<div' + (c.turn ? ' class="bk-tp' + n + '"' : '') + ' style="position:relative;flex:none;padding:8px 24px 8px ' + padL + ';border-radius:6px 6px 0 0;' +
        'background:' + (c.bar ? c.bar + ',' : '') + PREV.glass + ';' +
        'backdrop-filter:' + PREV.blur + ';-webkit-backdrop-filter:' + PREV.blur + '">' +
        '<span data-n="' + n + '" title="close this preview" style="position:absolute;top:3px;right:6px;cursor:pointer;pointer-events:auto;font:11px \'DejaVu Sans Mono\',monospace;color:rgba(255,255,255,.45);padding:0 2px">\u2715</span>' +
        (c.html ? '<div style="' + font + '">' + c.html.replace(/\n$/, '') + '</div>' : '') +
        "<div style=\"font:10px 'DejaVu Sans Mono',monospace;color:rgba(255,255,255,.5);white-space:pre;margin-top:" + (c.html ? 6 : 0) + 'px">' + c.say + (total > PREV.max ? ' \u00b7 ' + (first + n + 1) + ' of ' + total : '') + '</div></div>';
    }).join('');
    var br = blue.getBoundingClientRect(), tr = ta.getBoundingClientRect();
    prev.style.left = Math.round(tr.left) + 'px';       // the text area's own left edge; the art sits over the text's first column
    prev.style.maxWidth = Math.max(120, Math.round(window.innerWidth - tr.left - 8)) + 'px';
    prev.style.bottom = Math.round(window.innerHeight - br.top) + 'px';
    prev.style.display = 'flex';
    cardTurns = [];
    cards.forEach(function (c, n) { if (c.turn) cardTurns.push({ cls: 'bk-tp' + n, slots: c.turn.slots, ms: c.turn.ms, step: 0, due: 0 }); });
    skyWake();
    [].forEach.call(prev.querySelectorAll('[data-n]'), function (x) {
      x.onclick = function () { prevGone[cards[+x.getAttribute('data-n')].key] = 1; previewBurst(); };
    });
  }
  ta.addEventListener('input', function(){ clearTimeout(prevT); prevT = setTimeout(previewBurst, 350); });
  // The hand takes no clicks (what is under it stays selectable), so the wheel is heard on the window and
  // answered only while the pointer is over the hand and there are more cards than it shows.
  var handAcc = 0, handAt = 0;
  function onHandWheel(e) {
    if (prev.style.display === 'none' || prevN <= PREV.max) return;
    var r = prev.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    e.preventDefault(); e.stopPropagation();
    // one card for one notch of a wheel, however the wheel reports it. A fine wheel or a touchpad sends many small
    // events for one gesture; a card for each of them threw the hand from end to end (user1, 5 x 2026: "Which control
    // has not been smoothly X-scrollable lately?"). So the travel is summed, and a card is dealt for every 100 of it.
    var raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY, now = Date.now();
    if (e.deltaMode === 1) raw *= 33; else if (e.deltaMode === 2) raw *= 300;
    if (now - handAt > 350) handAcc = 0;                // a new gesture starts from nothing
    handAt = now; handAcc += raw;
    var d = handAcc > 0 ? Math.floor(handAcc / 100) : -Math.floor(-handAcc / 100);
    if (!d) return;
    handAcc -= d * 100;
    var last = prevN - PREV.max, was = prevAt === null ? last : prevAt;
    prevAt = Math.max(0, Math.min(last, was + d));
    if (prevAt !== was) previewBurst();
  }
  window.addEventListener('wheel', onHandWheel, { passive: false, capture: true });

  // ================= the chat, PAINTED =================
  // What the read-ahead glass did before the send, the chirp (  ) now does after
  // it: an illustration standing in the chat, with its burst under it, gets its
  // colours where it stands. No spans, no edits: the page is the app's, and the
  // app redraws it when it likes. The CSS Custom Highlight API paints RANGES of
  // the text that is already there, so nothing is added, a copy is still the
  // plain text, and a redraw only drops the paint. Chirp again and it is back.
  // Only what is on screen is painted: one cares most where one's eyes are.
  // He does not touch the chat's type. Art holds its columns in a monospace
  // (Clarion gives your own lines one); in a proportional face it is coloured
  // and crooked, and that is the face's doing.
  var HL = typeof CSS !== 'undefined' && !!CSS.highlights && typeof Highlight === 'function';
  // A table in the chat that cannot be selected line by line is a bench with prongs (user1, 4 x 2026).
  // Whatever the app says, text in a chat table may be selected. A guess at the cause, from one snippet of
  // the app's markup; if it does nothing, the cause is elsewhere.
  var selStyle = document.createElement('style'); selStyle.id = 'bk-select-style';
  selStyle.textContent = '[class*="epitaxy-table"], [class*="epitaxy-table"] *, .prose-scroll table, .prose-scroll table * {' +
    '-webkit-user-select:text !important;user-select:text !important;-webkit-user-drag:none !important}';
  // user1 found the first try did nothing: the app "solved" selecting by making the text something to drag,
  // with nowhere to drag it. So a drag that starts inside a chat table is refused, and the mouse selects.
  function noDrag(e) { var t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentNode;
    if (t && t.closest && t.closest('table, [class*="epitaxy-table"]')) e.preventDefault(); }
  document.addEventListener('dragstart', noDrag, true);
  var olds = document.getElementById('bk-select-style'); if (olds) olds.remove();
  document.head.appendChild(selStyle);
  var hlStyle = document.createElement('style'); hlStyle.id = 'bk-hl-style';
  var oldh = document.getElementById('bk-hl-style'); if (oldh) oldh.remove();
  document.head.appendChild(hlStyle);
  var hlByCol = {}, hlNames = [], hlRanges = [];        // one named highlight per colour; every range kept with its host
  var hlRuleOf = {}, hlSlot = {}, hlSeen = {}, hlInk = {};   // by key: its rule, the palette slot it was painted from, (flat) its share of ink; and a slot's colour as painted
  var cardCls = {};                                     // the cards' own classes for cycling: class -> { slot, ink }
  // THE PICTURE'S OWN WIND. A shadow whose sky says TURN is obeyed for that picture and no other: its cells in
  // the named slots are filed under rules of their own, and a small clock rewrites only those. user1: "For that
  // picture only - yes." The hand command __belaCycle still turns the whole table, as before.
  var skyPics = [], skySeq = 0, skyStyle = null, skyT = null, cardTurns = [];
  // THE RIFFLE (user1, 5 x 2026: "to subtly shift the colors by default, on a Loie-type repeat, stoppable on a
  // click, suppressed if the illustration has a set palette cycle. This would only be to overcome the 'frozen-look'
  // of all graphics ... A wind passes. The eye notices."). A painting that does not TURN is given a little life:
  // for half a second in every three, its most energetic colours waver. Energy is brightness on a dark ground and
  // heaviness on a light one (his: "'brighter' things on black have 'more energy'. Similar to 'heavy ink' on
  // white"). As with Loie, only lightness and vividness move, never hue. Each picture starts where it will, so no
  // two riffle together. Only paintings: words, boards and diagrams are left exactly as written. A click stills it,
  // as it stills a turning picture. The sky's word RIFFLE (3, n) lets a picture ask for more, less, or none.
  // window.BELA_RIFFLE, set before pasting: 0 for none, 0.5 unless set (half the honest band, at a flip each 50 ms), more for more. A reader who has asked his
  // machine for less motion gets none.
  var RIFFLE = (window.BELA_RIFFLE !== undefined) ? Math.max(0, +window.BELA_RIFFLE) : 0.5;   // user1, 5 x 2026: "The small-variance created by 1/2 is utterly perfect"
  try { if (window.BELA_RIFFLE === undefined && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) RIFFLE = 0; } catch (eR) {}
  // THE SHIMMER (user1, the same evening, having seen the first riffle at four times its strength: "looks like
  // lightning or the colors shrugging ... The characters should shimmer, not the color of the background. Not by
  // the 'brightness' but by better-resolving the grayscale ... temporal dithering, but not all the time":
  //     ____/\/\____/\/\____
  // A glyph of the ladder stands for a BAND of light, not a point: everything that rounded to it. The picture's true
  // light is somewhere in that band and the glyph cannot say where. So in a gust the cell is shown at the top of
  // its band, then the foot, twice over, and then is as written again. Only the glyph's INK moves; the ground it
  // stands on is not touched, so it is the character that shimmers. A Braille dot twinkles; a shade breathes a
  // little; nothing leaves the band the author's own rounding gave it. At BELA_RIFFLE 1 that is the whole of it and
  // no more: an honest statement of what the glyph does not know. More than 1 overstates it, for looking.
  // Bela cannot know WHERE in the band the truth lies; only an author can, and a way to send it is not yet written.
  var RIF_LADDER = [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
  function rifBand(share) {                             // -> [the foot of this glyph's band, its top], as shares of a cell
    var down = 0, up = share, i;
    for (i = 0; i < RIF_LADDER.length; i++) { if (RIF_LADDER[i] < share - 0.001) down = RIF_LADDER[i]; }
    for (i = RIF_LADDER.length - 1; i >= 0; i--) { if (RIF_LADDER[i] > share + 0.001) up = RIF_LADDER[i]; }
    return [(share + down) / 2, (share + up) / 2];
  }
  function rifLin(hex) { return [Math.pow(parseInt(hex.slice(1, 3), 16) / 255, 2.2), Math.pow(parseInt(hex.slice(3, 5), 16) / 255, 2.2), Math.pow(parseInt(hex.slice(5, 7), 16) / 255, 2.2)]; }
  function rifInk(m, k) {                               // the ink that makes this cell give the light of another place in its band. k: -1 to 1
    var to = k >= 0 ? m.share + (m.band[1] - m.share) * k : m.share + (m.share - m.band[0]) * k, out = [], c, v;
    to = Math.max(0, Math.min(1, to));
    for (c = 0; c < 3; c++) {
      v = m.ground ? (to * m.hue[c] - (1 - m.share) * m.ground[c]) / m.share : m.hue[c] * to / m.share;   // on its ground; or, in dots, the ink alone
      out.push(255 * Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2));
    }
    return rifHex(out);
  }
  // TWO PIXELS A CELL have no ladder: each half is a colour said outright, rounded to sixteen steps a channel. Its
  // band is half a step either way. In a gust the two halves of a cell lean opposite ways within their bands, and
  // come home: grain, not glow. (user1 pasted a sunset in halves that "did not change": it had been left out.)
  var RIF_STEP = 8.5;                                   // half of one 4-4-4 step, in 255ths
  function rifRgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
  function rifLean(v, k) { return rifHex([v[0] + k * RIF_STEP, v[1] + k * RIF_STEP, v[2] + k * RIF_STEP]); }
  function rifRule(key, m, k) {                         // one colour's rule, at this place in its band
    if (m.pair) return '::highlight(' + hlRuleOf[key] + '){color:' + rifLean(m.ink, k) + ';background-color:' + rifLean(m.back, -k) + '}';
    return '::highlight(' + hlRuleOf[key] + '){color:' + rifInk(m, k) + '}';   // the ink only: its ground stays as it is
  }
  var RIF_EVERY = 3000, RIF_FOR = 500, RIF_SHARE = 0.5;   // ms between gusts; ms a gust lasts; the share of a picture's colours that take part
  var rifPics = [], rifStyle = null, rifLast = 0;
  function rifHex(v) { function h(n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? '0' : '') + n.toString(16); } return '#' + h(v[0]) + h(v[1]) + h(v[2]); }
  function rifLch(hex) { return hex && hex.charAt(0) === '#' && hex.length === 7 ? toLch(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)) : null; }
  function rifEnergy(hex, dark) {                       // 0 to 1: how much a colour has to give, on this kind of ground
    if (!hex || hex.charAt(0) !== '#' || hex.length !== 7) return 0;
    var l = relLum(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16));
    return dark ? l : 1 - l;
  }
  function rifMove(lch, k) {                            // k: -1 to 1, already scaled. Lightness a little, vividness a little more, hue not at all.
    return rifHex(fromLch(Math.max(0, Math.min(1, lch[0] * (1 + 0.09 * k))), Math.max(0, lch[1] * (1 + 0.16 * k)), lch[2]));
  }
  var rifHold = null;                                   // for the stand-in page and its photographs: every picture held at one place in its band
  window.__belaShimmer = function (k) {                 // k: -1 to 1 holds them there; nothing given lets them go
    rifHold = (k === undefined || k === null) ? null : Math.max(-1, Math.min(1, +k));
    if (rifHold === null) { rifLast = 0; return 'let go'; }
    var css = '', n = 0, i, key;
    for (i = 0; i < rifPics.length; i++) for (key in rifPics[i].keys) { css += rifRule(key, rifPics[i].keys[key], rifHold * rifPics[i].keys[key].sign * rifPics[i].amp); n++; }
    if (!rifStyle) { rifStyle = document.createElement('style'); rifStyle.id = 'bk-riffle-style'; document.head.appendChild(rifStyle); }
    rifStyle.textContent = css;
    return n + ' colours held at ' + rifHold;
  };
  function rifTick() {
    if (rifHold !== null) return;
    if (!rifPics.length) { if (rifStyle && rifStyle.textContent) rifStyle.textContent = ''; return; }
    var now = Date.now(), css = '', i, p, t, u, env, key, m, k, c, g;
    if (now - rifLast < 40) return;
    rifLast = now;
    for (i = 0; i < rifPics.length; i++) {
      p = rifPics[i];
      if (p.paused) continue;
      t = (now + p.phase) % RIF_EVERY;
      if (t >= RIF_FOR) { p.looked = false; continue; }
      if (!p.looked) { p.looked = true; p.inView = p.host.isConnected && inView(p.host); }   // once a gust: is anyone there to see it?
      if (!p.inView) continue;
      // BZBZBZ (user1: "if there's any way we could whip quickly between those dither states"): the top of the
      // band, the foot, the top, the foot, a flip at every tick. Half the colours start high and half low, so the
      // picture as a whole grows neither brighter nor darker. Two frames, each worked out once.
      var slot = Math.floor(t / 50) % 2;
      if (!p.frames) p.frames = {};
      if (p.frames[slot] === undefined) {
        env = (slot ? -1 : 1) * p.amp;
        var one = '';
        for (key in p.keys) {
          m = p.keys[key];
          one += rifRule(key, m, env * m.sign);          // past 1 a cell leaves its band, so 2 is twice 1 for every kind of cell (it was not: the ladder was held at 1)
        }
        p.frames[slot] = one;
      }
      css += p.frames[slot];
    }
    if (!rifStyle) { rifStyle = document.createElement('style'); rifStyle.id = 'bk-riffle-style'; document.head.appendChild(rifStyle); }
    if (rifStyle.textContent !== css) rifStyle.textContent = css;
  }
  function skyTick(force) {
    var now = Date.now(), css = '', moved = !!force, i, p, key, cls, m, at, lends, c;
    for (i = 0; i < skyPics.length; i++) { p = skyPics[i]; if (!p.paused && now >= p.due) { p.step++; p.due = now + p.ms; moved = true; } }
    for (i = 0; i < cardTurns.length; i++) { p = cardTurns[i]; if (now >= p.due) { p.step++; p.due = now + p.ms; moved = true; } }
    if (!moved) return;
    for (i = 0; i < skyPics.length; i++) {              // the chat: each turning picture's own rules
      p = skyPics[i];
      for (key in p.keys) {
        m = p.keys[key]; lends = p.slots[(p.slots.indexOf(m.slot) + p.step) % p.slots.length];
        if (m.ink !== null) { c = solidPair(PALETTE[lends], m.ink); css += '::highlight(' + hlRuleOf[key] + '){color:' + c.i + ';background-color:' + c.g + '}'; }
        else css += '::highlight(' + hlRuleOf[key] + '){color:' + (hlSeen[lends] || PALETTE[lends]) + '}';
      }
    }
    for (i = 0; i < cardTurns.length; i++) {            // the cards: each turning card, by its class
      p = cardTurns[i];
      for (cls in cardCls) {
        at = p.slots.indexOf(cardCls[cls].slot);
        if (at < 0) continue;
        lends = p.slots[(at + p.step) % p.slots.length];
        if (cardCls[cls].ink !== null) { c = solidPair(PALETTE[lends], cardCls[cls].ink); css += '#bk-prev .' + p.cls + ' .' + cls + '{color:' + c.i + ' !important;background:' + c.g + ' !important}'; }
        else css += '#bk-prev .' + p.cls + ' .' + cls + '{color:' + PALETTE[lends] + ' !important}';
      }
    }
    if (!skyStyle) { skyStyle = document.createElement('style'); skyStyle.id = 'bk-sky-style'; document.head.appendChild(skyStyle); }
    if (skyStyle.textContent !== css) skyStyle.textContent = css;
  }
  // A CLICK STILLS A PICTURE (user1, 5 x 2026: "a single-click anywhere in an illustration to pause its
  // animation ... then another click to restore it ... Not to restrict copy and paste *at all* of course").
  // The click is only listened to, never taken: nothing is prevented, and a drag that selected text is not a
  // click on the picture at all.
  function onPicClick(e) {
    var pics = skyPics.concat(rifPics);                 // a turning picture, or a riffling one: the same click
    if (!pics.length) return;
    var sel = window.getSelection ? window.getSelection() : null, i, p, r, box;
    if (sel && !sel.isCollapsed) return;
    for (i = 0; i < pics.length; i++) {
      p = pics[i];
      if (!p.n0 || !p.n1 || !p.n0.isConnected || !p.n1.isConnected) continue;
      r = document.createRange();
      try { r.setStart(p.n0, p.o0); r.setEnd(p.n1, Math.min(p.n1.nodeValue.length, p.o1 + 1)); } catch (er) { continue; }
      box = r.getBoundingClientRect();
      if (e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom) p.paused = !p.paused;
    }
  }
  document.addEventListener('click', onPicClick, true);
  function skyWake() { if ((skyPics.length || cardTurns.length || rifPics.length) && !skyT) skyT = setInterval(function () { skyTick(); rifTick(); }, 50); skyTick(true); }
  // MEASURED, THEN MENDED (user1, 5 x 2026: "color calculation is slow. It may be time ... to follow the other
  // luminary Don (Knuth) and begin to optimize a little"). On Beladrome, sixteen pictures, one paint of the whole
  // page took 3.6 seconds, and every paint left the page slower than it found it. Four causes, in order of weight:
  //   a. every repaint of a picture that turns or shimmers minted it a new number, and so new rules for all its
  //      colours; the old ones were never dropped. 1050 rules became 3159 in eight paints. A picture now keeps its
  //      number for as long as its block lives (picId).
  //   b. each new colour was added to the sheet by itself, and the browser read the whole sheet again each time.
  //      Rules are now gathered and written once a paint (hlLater, hlFlush).
  //   c. a block already painted, whose text has not changed and whose paint is still attached, was stripped and
  //      painted afresh at every chirp. It is now left alone (paintedHosts).
  //   d. the ground and ink of a cell were worked out, with six powers, for every cell. They are now worked out
  //      once for each colour and share (pairMemo); a gust's frames once for each picture (p.frames).
  var hlWait = '', hlAsked = false;
  function hlFlush() { hlAsked = false; if (hlWait) { hlStyle.textContent += hlWait; hlWait = ''; } }
  function hlLater(rule) { hlWait += rule; if (!hlAsked) { hlAsked = true; Promise.resolve().then(hlFlush); } }   // the paint flushes; this is the net under it
  var picIds = new WeakMap(), picSeq = 0;
  function picId(host, nth) {                           // the same picture, the same number, however often it is painted
    var ids = picIds.get(host); if (!ids) { ids = []; picIds.set(host, ids); }
    if (ids[nth] === undefined) ids[nth] = ++picSeq;
    return ids[nth];
  }
  // THE CORNER (user1, 5 x 2026: "I would love to see the gray bottom+right lines drawn. That's honest, it shows the
  // person the mouse-sweep or pin-swipe before engaging the action. (this is the 0th rule of GUI)"). A painted
  // picture gets a one-pixel line along the right edge of its block and another along the FOOT OF ITS SHADOW, not
  // of its block: in a chat the picture and the words after it share one paragraph, and the foot must mark where
  // the picture ends (user1: "the lower-edge-grabber grabs type beyond the shadowgram ... seek the minimum
  // linerange which includes art and gram"). The lines are Bela's own, laid over the page in a layer that takes
  // no pointer and touches no text; they are placed again at every chirp and on resize, and go with the paint.
  // window.BELA_CORNER 0 leaves them undrawn.
  var CORNER = (window.BELA_CORNER !== undefined) ? +window.BELA_CORNER : 1, corners = [], cornerLayer = null;
  function cornerOn(host, probe) {                      // probe: the last range painted in this host, the shadow's last line
    if (!CORNER || !probe) return;
    var i; for (i = 0; i < corners.length; i++) if (corners[i].host === host) { corners[i].probe = probe; placeCorner(corners[i]); return; }
    if (!cornerLayer) { cornerLayer = document.createElement('div'); cornerLayer.id = 'bk-corners'; cornerLayer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:1'; document.body.appendChild(cornerLayer); }
    var c = { host: host, probe: probe, foot: document.createElement('div'), side: document.createElement('div') };
    c.foot.style.cssText = c.side.style.cssText = 'position:absolute;pointer-events:none';
    cornerLayer.appendChild(c.foot); cornerLayer.appendChild(c.side); corners.push(c); placeCorner(c);
  }
  function placeCorner(c) {
    var blk = blockFor(c.host), b = blk.getBoundingClientRect(), r, g, dark, ink, top, bottom;
    try { r = c.probe.getBoundingClientRect(); } catch (e) { r = null; }
    if (!r || !r.height || !b.height || !c.probe.startContainer.isConnected) { c.foot.style.display = c.side.style.display = 'none'; return; }
    g = groundOf(c.host); dark = relLum(g[0], g[1], g[2]) < 0.179; ink = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
    top = b.top + window.pageYOffset; bottom = r.bottom + window.pageYOffset + 1;   // one pixel under the shadow's last line
    c.foot.style.cssText = 'position:absolute;pointer-events:none;display:block;height:1px;background:' + ink + ';left:' + Math.round(b.left + window.pageXOffset) + 'px;width:' + Math.round(b.width) + 'px;top:' + Math.round(bottom) + 'px';
    c.side.style.cssText = 'position:absolute;pointer-events:none;display:block;width:1px;background:' + ink + ';left:' + Math.round(b.right + window.pageXOffset - 1) + 'px;top:' + Math.round(top) + 'px;height:' + Math.round(bottom - top + 1) + 'px';
  }
  function placeCorners() { corners = corners.filter(function (c) { if (!c.host.isConnected) { c.foot.remove(); c.side.remove(); return false; } placeCorner(c); return true; }); }
  function cornerOff(host) { corners = corners.filter(function (c) { if (c.host !== host) return true; c.foot.remove(); c.side.remove(); return false; }); }
  window.addEventListener('resize', function () { setTimeout(placeCorners, 50); });
  var paintedHosts = new WeakMap();                     // block -> { text, n, probe }: what was painted there, and one of its ranges to ask if it still holds
  function hlFor(col, key) {                            // key: its own name, when a picture keeps this colour to itself
    key = key || col;
    if (!hlByCol[key]) {
      var name = 'bk-c' + hlNames.length;
      hlByCol[key] = new Highlight(); hlByCol[key].priority = 1; hlNames.push(name);   // over any tincture
      CSS.highlights.set(name, hlByCol[key]);
      hlLater('::highlight(' + name + '){color:' + col + '}');
      hlRuleOf[key] = name;
    }
    return hlByCol[key];
  }
  function hlFlat(pair, key) {                          // a flat cell: its ground, and its glyph's ink upon it
    key = key || ('flat ' + pair.g + ' ' + pair.i);
    if (!hlByCol[key]) {
      var name = 'bk-c' + hlNames.length;
      hlByCol[key] = new Highlight(); hlByCol[key].priority = 1; hlNames.push(name);
      CSS.highlights.set(name, hlByCol[key]);
      hlLater('::highlight(' + name + '){color:' + pair.i + ';background-color:' + pair.g + '}');
      hlRuleOf[key] = name;
    }
    return hlByCol[key];
  }
  function keepsBreaks(el) {                            // does this element show a typed newline as a line end?
    var ws = el && el.nodeType === 1 ? getComputedStyle(el).whiteSpace : '';
    return ws.indexOf('pre') === 0 || ws === 'break-spaces';
  }
  function flatText(host) {                             // the host's text as lines: a <br> and a block's edge are line ends
    var text = '', at = [];                             // at[2i], at[2i+1]: the text node and offset behind character i
    function nl() { if (text && text.charAt(text.length - 1) !== '\n') { text += '\n'; at.push(null, 0); } }
    (function walk(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) {
          var v = c.nodeValue, i;
          if (v.indexOf('\n') >= 0 && !keepsBreaks(n)) v = v.split('\n').join(' ');   // in ordinary prose a newline is only a space
          for (i = 0; i < v.length; i++) at.push(c, i); text += v;
        }
        else if (c.nodeType === 1) {
          if (c.tagName === 'BR') { text += '\n'; at.push(null, 0); continue; }
          var blk = blockish(c);
          if (blk) nl(); walk(c); if (blk) nl();
        }
      }
    })(host);
    return { text: text, at: at };
  }
  function unpaint(host, keepWraps) {                   // drop this host's paint, and any paint whose text has left the page
    var keep = [], i, e;
    for (i = 0; i < hlRanges.length; i++) {
      e = hlRanges[i];
      if (e.host === host || !e.range.startContainer.isConnected) { var hh = hlByCol[e.key || e.col]; if (hh) hh['delete'](e.range); }   // filed under its key: a flat cell's is not its colour
      else keep.push(e);
    }
    hlRanges = keep;
    skyPics = skyPics.filter(function (p) { return p.host !== host && p.host.isConnected; });   // its wind goes with its paint
    unjam(host, keepWraps);                             // and its jam
    cornerOff(host);                                    // and its corner
    rifPics = rifPics.filter(function (p) { return p.host !== host && p.host.isConnected; });   // and its riffle
  }
  function paintHost(host) {                            // -> how many illustrations in this host took their colours
    var f = flatText(host), lines = f.text.split('\n'), starts = [], p = 0, done = 0, b, i;
    for (i = 0; i < lines.length; i++) { starts.push(p); p += lines[i].length + 1; }
    var last = null;                                    // the run being extended: same colour, same node, touching
    var wraps = [];                                     // shadows whose lines end inside text: to be held in a span, then painted again
    var ground = groundOf(host), kind = {}, curPic = null, curRif = null;   // each colour is made courteous to THIS host's ground, once; curPic: the turning picture being painted
    function add(o, len, col, paint, flatCh) {          // flatCh: the glyph, when the cell is to be laid flat
      var node = f.at[2 * o], off = f.at[2 * o + 1];
      if (!node) return;
      var slot = PALETTE.indexOf(col), flat = !!flatCh, key, col0 = col;   // before any change: which slot of the table is this?
      var pair = null, chosen = false;                  // chosen: the picture said this cell's back itself
      if (flatCh && flatCh.back) { pair = { g: flatCh.back, i: col }; chosen = true; }
      else if (flatCh && flatCh.fill) { pair = { g: flatCh.fill, i: flatCh.fill }; slot = -1; chosen = true; }
      else if (flatCh === 'night') { pair = { g: '#000000', i: '#000000' }; slot = -1; }
      else if (flatCh === 'ink on night') { pair = { g: '#000000', i: courteous(col, [0, 0, 0]) }; slot = -1; }
      else if (flat) { pair = solidPair(col, inkOf(flatCh)); col = pair.g; }
      else if (!paint) col = kind[col] || (kind[col] = courteous(col, ground));
      key = flat ? 'flat ' + pair.g + ' ' + pair.i : col;
      if (curPic && slot >= 0 && curPic.slots.indexOf(slot) >= 0) {   // this cell turns with its picture: a rule of its own
        key = 'pic' + curPic.id + ' ' + key; curPic.keys[key] = { slot: slot, ink: flat && !chosen ? inkOf(flatCh) : null };
      }
      if (curRif && paint && flatCh !== 'night' && flatCh !== 'ink on night' && !(flatCh && flatCh.fill) && !(key in curRif.keys)) {
        var en = rifEnergy(col0, curRif.dark);            // an energetic colour riffles with its picture: a rule of its own
        if (en >= curRif.thr && en > curRif.low) {
          key = 'rif' + curRif.id + ' ' + key;
          var hs = 0, hk; for (hk = 0; hk < key.length; hk++) hs = (hs * 31 + key.charCodeAt(hk)) % 9973;
          if (!curRif.keys[key] && chosen && flatCh.back && col0.length === 7 && flatCh.back.length === 7 && flatCh.back.charAt(0) === '#')
            curRif.keys[key] = { pair: true, ink: rifRgb(col0), back: rifRgb(flatCh.back), sign: hs % 2 ? 1 : -1 };   // two pixels: each within its own band
          if (!curRif.keys[key] && !chosen && col0.charAt(0) === '#' && col0.length === 7) {
            var sh = flat ? inkOf(flatCh) : 0.5;              // in dots the glyph is not known here: a middling band
            curRif.keys[key] = { share: sh, band: rifBand(sh), hue: rifLin(col0), ground: flat ? rifLin(pair.g) : null, sign: hs % 2 ? 1 : -1 };
          }
        }
      }
      if (slot >= 0) { hlSlot[key] = slot; if (flat && !chosen) hlInk[key] = inkOf(flatCh); else if (!flat) hlSeen[slot] = col; }
      if (last && last.key === key && last.node === node && last.end === off) { last.end = off + len; last.range.setEnd(node, last.end); return; }
      var r = document.createRange(); r.setStart(node, off); r.setEnd(node, Math.min(node.nodeValue.length, off + len));
      (flat ? hlFlat(pair, key) : hlFor(col, key)).add(r); hlRanges.push({ range: r, col: col, key: key, host: host });
      last = { col: col, key: key, node: node, end: off + len, range: r };
    }
    for (b = 0; b < lines.length; b++) {
      var w = shadowRun(lines, b); if (!w) continue;
      var r = GRAMMAR.decode(w.burst, PALETTE), cols = r.colours, pos = r.mode === 'positional';
      var top = artBlock(lines, w.first, cols.length - 1, pos);
      if (top < 0) continue;
      var hd = headLine(lines, top);
      if (hd >= 0 && cols[0]) {                         // the headline, first letter to last, in the head colour
        var hl = lines[hd], h0 = vLead(hl), h1 = h0 + vTrim(hl).length, hx;
        last = null;
        for (hx = h0; hx < h1; hx++) add(starts[hd] + hx, 1, cols[0]);
        last = null;
      }
      var map = {}, next = 1, cell = 1;
      // A PAINTING BRINGS ITS OWN NIGHT. A picture made by luma was drawn for a dark page: where it is dark it
      // has no ink at all, and trusts the page. On a light page that trust is misplaced, and every shadow in
      // the picture would be a hole of white. So when the page is light, and the picture is mostly paint, its
      // blank cells are given a black ground. Words and boards, which are mostly letters, are left alone.
      var bk = skyBacks(w.burst), mapB = {};            // SKYPAL: a back for each colour, and the picture's ground
      var skyTurn = turnOf(w.burst);                          // does this picture's sky say TURN?
      if (skyTurn) { curPic = { id: picId(host, done), host: host, slots: skyTurn.slots, ms: skyTurn.ms, keys: {}, step: 0, due: 0 }; skyPics.push(curPic);
        var a0 = starts[top], a1 = starts[w.first] - 2;   // the art's first and last characters: where a click counts
        curPic.n0 = f.at[2 * a0]; curPic.o0 = f.at[2 * a0 + 1]; curPic.n1 = f.at[2 * a1]; curPic.o1 = f.at[2 * a1 + 1]; }
      var inkedN = 0, paintN = 0, night = false, r0, lettersN = 0, figN = 0;
      for (r0 = top; r0 < w.first; r0++) Array.from(lines[r0]).forEach(function (ch) { if (inked(ch)) { inkedN++; if (isPaint(ch)) paintN++; else if (isFig(ch)) figN++; else if (ch.toLowerCase() !== ch.toUpperCase() || (ch >= '0' && ch <= '9')) lettersN++; } });
      var garden = pos && lettersN === 0 && figN > 0;   // THE GARDEN: cell by cell, no letter anywhere: every glyph is a pixel
      if (garden) paintN += figN;
      var painting = inkedN > 0 && paintN / inkedN > 0.6, lightPage = relLum(ground[0], ground[1], ground[2]) >= 0.179;
      night = !!SOLID && lightPage && painting;
      var rifN = riffleOf(w.burst);                     // the picture's own word on it, or null
      curRif = null;
      if (RIFFLE > 0 && painting && !skyTurn && rifN !== 0) {
        var rDark = !lightPage || night, es = [];
        cols.slice(1).forEach(function (c) { if (c) es.push(rifEnergy(c, rDark)); });
        es.sort(function (x, y) { return x - y; });
        if (es.length) {
          curRif = { id: picId(host, done), host: host, keys: {}, dark: rDark, thr: es[Math.min(es.length - 1, Math.floor(es.length * (1 - RIF_SHARE)))], low: es[0], top: es[es.length - 1],
            amp: RIFFLE * (rifN === null ? 4 : rifN) / 4, phase: Math.floor(Math.random() * RIF_EVERY), paused: false };
          if (curRif.top <= curRif.low) curRif.low = -1;       // one colour only: let it breathe all the same
          var b0 = starts[top], b1 = starts[w.first] - 2;
          curRif.n0 = f.at[2 * b0]; curRif.o0 = f.at[2 * b0 + 1]; curRif.n1 = f.at[2 * b1]; curRif.o1 = f.at[2 * b1 + 1];
          rifPics.push(curRif);
        }
      }
      for (i = top; i < w.first; i++) {
        var u = 0;
        Array.from(lines[i].replace(/\s+$/, '')).forEach(function (ch) {
          var col, back = null;
          if (pos) { if (inked(ch)) { back = bk.backs[cell]; col = cols[cell++]; } }
          else if (inked(ch)) { if (!(ch in map)) { mapB[ch] = bk.backs[next]; map[ch] = cols[next++]; } col = map[ch]; back = mapB[ch]; }
          if (col && inked(ch) && back) add(starts[i] + u, ch.length, col, true, { back: back });   // SKYPAL: the picture chose both colours
          else if (!inked(ch) && bk.ground) add(starts[i] + u, ch.length, bk.ground, true, { fill: bk.ground });   // and its ground lies under its blanks
          else if (col && inked(ch) && night && !isPaint(ch) && !(garden && isFig(ch))) add(starts[i] + u, ch.length, col, true, 'ink on night');   // a star in a painting: its own colour, on the painting's night
          else if (col && inked(ch)) { var pt = isPaint(ch) || (garden && isFig(ch)); add(starts[i] + u, ch.length, col, pt, SOLID && pt ? ch : null); }
          else if (night && !inked(ch)) add(starts[i] + u, ch.length, '#000000', true, 'night');   // any blank: Braille's, or a no-break space
          u += ch.length;
        });
        last = null;
      }
      curPic = null; curRif = null;
      // A PACKED SHADOW IS DUSTED LIKE ANY OTHER, NOT CLEARED. For one evening it was made wholly transparent, and
      // user1's hand, sweeping a selection, could not see where the picture ended: it arrived with one line of its
      // shadow. His rule (5 x 2026): "The real copy is the sweep of the selecting finger or hand ... giving them
      // the visual affordances they need." What must be selected must be seen.
      if (DUST < 1) {                                   // the shadow recedes to dust, line by line
        var dust = dustOn(ground), sl, sx;
        for (sl = w.first; sl <= b; sl++) {
          last = null;
          for (sx = 0; sx < lines[sl].length; sx++) if (inked(lines[sl][sx])) add(starts[sl] + sx, 1, dust);
        }
        last = null;
      }
      if (JAM > 0 && b > w.first) {                     // close the shadow's lines up
        var cs = getComputedStyle(host), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 18, jl, at, nd;
        var inText = false;
        for (jl = w.first; jl < b; jl++) {            // the break after each line but the last
          at = starts[jl] + Math.max(0, lines[jl].length - 1); nd = f.at[2 * at];
          if (nd && !jamAfter(nd, host, Math.round(lh * JAM))) inText = true;
        }
        if (inText) wraps.push({ o0: starts[w.first], o1: starts[b] + lines[b].length, lh: lh });
      }
      done++;
    }
    if (wraps.length && !paintHost.again) {             // hold those shadows, then paint the host afresh: moving text drops ranges laid in it
      var held = 0, q;
      for (q = wraps.length - 1; q >= 0; q--) if (jamWrap(f, wraps[q].o0, wraps[q].o1, host, wraps[q].lh)) held++;   // last first: earlier offsets stay true
      if (held) { unpaint(host, true); paintHost.again = true; try { done = paintHost(host); } finally { paintHost.again = false; } }
    }
    return done;
  }
  function ownArt(el) {                                 // does this block hold a burst AND the art it paints?
    var lines = flatText(el).text.split('\n'), b, r;
    for (b = 1; b < lines.length; b++) { var w = shadowRun(lines, b); if (!w) continue;
      r = GRAMMAR.decode(w.burst, PALETTE);
      if (artBlock(lines, w.first, r.colours.length - 1, r.mode === 'positional') >= 0) return true;
    }
    return false;
  }
  var BELA_OWN = '#blinken-clock, #bk-blue, #bk-screw, #bk-prev';
  // The blocks he paints. user1's own messages in Chat are not paragraphs: the
  // whole message is one div.whitespace-pre-wrap inside [data-testid=user-message],
  // its lines parted by newlines. Found by __belaWhy() on 7 x 2026, when a long
  // gallery of user1's took no colour: "block he would paint: NONE".
  var PAINTS = 'p, li, blockquote, pre, [data-testid="user-message"] .whitespace-pre-wrap';
  function paintView(whole) {                            // the chirp's second errand -> illustrations painted, or -1: no API. whole: in view or not
    if (!HL) return -1;
    var all = document.body.querySelectorAll(PAINTS), total = 0, i, el, host, n, up;   // the whole page: a paste may be shown outside the feed
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (el.closest(BELA_OWN) || el.querySelector(PAINTS) || (!whole && !inView(el)) || !isShadowText(el.textContent || '')) continue;
      host = el; n = 0;
      for (up = 0; up < 3 && host && host !== document.body; up++) {   // the art may stand in the blocks before the burst's own
        var was = paintedHosts.get(host);
        if (was && was.n && was.text === host.textContent && was.probe.startContainer.isConnected && was.ground === groundOf(host).join()) { n = was.n; break; }   // painted, unchanged, still attached, on the same ground
        unpaint(host); n = paintHost(host);
        if (n) { var lastR = hlRanges.length ? hlRanges[hlRanges.length - 1] : null;
          if (lastR && lastR.host === host) cornerOn(host, lastR.range);
          if (lastR && lastR.host === host) paintedHosts.set(host, { text: host.textContent, n: n, probe: lastR.range, ground: groundOf(host).join() }); else paintedHosts['delete'](host);
          break; }
        paintedHosts['delete'](host);
        host = host.parentElement;
      }
      total += n;
    }
    hlFlush();
    placeCorners();
    skyWake();
    return total;
  }

  // __belaWhy(): the page testifies. Every burst he can find, where it sits, and
  // why it did or did not take its colours. Run it in the console; it prints
  // and returns the same lines.
  window.__belaPaint = function (all) { return paintView(all === true); };   // for the stand-in page: chirp without the button; true = the whole page, in view or not
  window.__belaStats = function () {                     // and a count of what is painted how
    var o = { rules: 0, flat: 0, turning: skyPics.length, paused: 0, jammed: jammed.length, riffling: rifPics.length, riffleKeys: 0, stilled: 0 }, k;
    rifPics.forEach(function (p) { o.riffleKeys += Object.keys(p.keys).length; if (p.paused) o.stilled++; });
    for (k in hlRuleOf) { o.rules++; if (k.indexOf('flat ') >= 0) o.flat++; }
    skyPics.forEach(function (p) { if (p.paused) o.paused++; });
    return o;
  };
  window.__belaWhy = function () {
    var out = [], i;
    function say(x) { out.push(x); }
    function tagOf(el) {
      if (!el || el.nodeType !== 1) return '?';
      var t = el.tagName.toLowerCase(), a = el.getAttribute('data-testid') || el.getAttribute('data-cds') || '';
      var c = (el.getAttribute('class') || '').split(' ')[0];
      return t + (a ? '[' + a + ']' : '') + (c ? '.' + c.slice(0, 24) : '');
    }
    say('vespers: chat paint present. Highlight API: ' + (HL ? 'yes' : 'NO') +
        ' \u00b7 colours registered: ' + hlNames.length + ' \u00b7 ranges alive: ' + hlRanges.length);
    var found = [], shadows = 0;
    (function walk(root, inShadow) {
      var w = document.createTreeWalker(root, 4, null), n;          // 4 = text nodes
      while ((n = w.nextNode())) {
        if (!isShadowText(n.nodeValue || '')) continue;
        var pe = n.parentElement;
        if (pe && pe.closest && pe.closest(BELA_OWN)) continue;
        found.push({ node: n, shadow: inShadow });
      }
      var els = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (var k = 0; k < els.length; k++) if (els[k].shadowRoot) { shadows++; walk(els[k].shadowRoot, true); }
    })(document.body, false);
    say('bursts found in the page as text: ' + found.length + (shadows ? ' (looked inside ' + shadows + ' open shadow root(s) too)' : ''));
    if (!found.length) say('  none. The illustration is not in this page as text: a long paste shown as an attachment card, or a message scrolled out and unloaded. He can only paint letters that are there.');
    var told = [];                                      // a block is told once, however many of its text nodes hold a burst
    for (i = 0; i < found.length; i++) {
      var n = found[i].node, pe = n.parentElement, host = pe && pe.closest ? pe.closest(PAINTS) : null;
      if (told.indexOf(host || pe) >= 0) continue; told.push(host || pe);
      var chain = [], e = pe, d = 0; while (e && e !== document.body && d++ < 5) { chain.push(tagOf(e)); e = e.parentElement; }
      say((i + 1) + '. in ' + chain.join(' < ') + (found[i].shadow ? '  [inside a shadow root: he does not paint there]' : ''));
      say('   inside the feed: ' + (pe && FEED().contains(pe) ? 'yes' : 'no') +
          ' \u00b7 block he would paint: ' + (host ? tagOf(host) : 'NONE (not in a p, li, blockquote, pre or a message of yours)') +
          (host ? ' \u00b7 on screen: ' + (inView(host) ? 'yes' : 'no') : ''));
      var h = host || pe; if (!h) continue;
      var lines = flatText(h).text.split('\n'), b, shown = 0;
      say('   that block reads as ' + lines.length + ' line(s)');
      for (b = 0; b < lines.length; b++) { var w = shadowRun(lines, b), b0; if (!w) continue; b0 = w.first;
        var r = GRAMMAR.decode(w.burst, PALETTE), want = r.colours.length - 1, pos = r.mode === 'positional';
        var top = artBlock(lines, b0, want, pos), seen = {}, count = 0, k2, j, trail = [];
        for (j = b0 - 1; j >= 0 && j >= b0 - 16; j--) {
          if (!lines[j].trim()) { if (j < b0 - 1) break; else continue; }
          Array.from(lines[j]).forEach(function (ch) { if (inked(ch) && !seen[ch]) { seen[ch] = 1; count++; } });
          trail.push(count);
        }
        say('   burst on line ' + (b0 + 1) + (b > b0 ? ' to ' + (b + 1) : '') + ': wants ' + want + (pos ? ' cells' : ' distinct glyphs') +
            ' \u00b7 glyphs counted going up, line by line: ' + (trail.join(' ') || 'no lines above') +
            ' \u00b7 ' + (top >= 0 ? 'ART FOUND, from line ' + (top + 1) : 'art NOT found (no line where the count equals ' + want + ')') +
            (r.complaints.length ? ' \u00b7 complaint: ' + r.complaints[0] : ''));
        if (++shown >= 6) break;
      }
    }
    for (i = 0; i < out.length; i++) console.log('[why] ' + out[i]);
    return out.join('\n');
  };


  // ================= THE TABLE TURNS =================
  // Colour cycling, as the Amiga did it and as user1 knows it "intimately well": nobody redraws the water. The
  // picture points at numbered slots, laid progressively across an area, and only the table behind the numbers
  // turns. "You have to have an index to do it. With it, glory is possible." A shadowgram has one: its cells
  // say slot 5, not "this blue". And Bela's paint is one named rule per colour. So to cycle he writes a few
  // rules into a second, later sheet, which overrules the first, and touches no cell and no range.
  //   __belaCycle([6, 5, 3, 2], 150)   those slots turn, one step every 150 ms, among what is painted now
  //   __belaCycle()                    the table is still again
  // A trial by hand, with no word in the grammar yet. In the chat and in the cards. Colours said
  // outright have no slot and do not turn: the palette is the one that can move.
  var cycT = null, cycStyle = null;
  window.__belaCycle = function (slots, ms) {
    if (cycT) { clearInterval(cycT); cycT = null; }
    if (cycStyle) cycStyle.textContent = '';
    if (!slots || !slots.length) return 'the table is still';
    if (!cycStyle) { cycStyle = document.createElement('style'); cycStyle.id = 'bk-cycle-style'; document.head.appendChild(cycStyle); }
    var step = 0, turning = 0;
    function turn() {
      var css = '', key, i, c, cls; step++; turning = 0;
      for (key in hlRuleOf) {                           // the chat: one rule per painted colour
        i = slots.indexOf(hlSlot[key]);
        if (i < 0) continue;
        var lends = slots[(i + step) % slots.length];   // the slot whose colour this rule wears for now
        if (hlInk[key] !== undefined) { c = solidPair(PALETTE[lends], hlInk[key]); css += '::highlight(' + hlRuleOf[key] + '){color:' + c.i + ';background-color:' + c.g + '}'; }
        else css += '::highlight(' + hlRuleOf[key] + '){color:' + (hlSeen[lends] || PALETTE[lends]) + '}';
        turning++;
      }
      for (cls in cardCls) {                            // the cards over the bluebox: one class per slot
        i = slots.indexOf(cardCls[cls].slot);
        if (i < 0) continue;
        var lend2 = slots[(i + step) % slots.length];
        if (cardCls[cls].ink !== null) { c = solidPair(PALETTE[lend2], cardCls[cls].ink); css += '#bk-prev .' + cls + '{color:' + c.i + ' !important;background:' + c.g + ' !important}'; }
        else css += '#bk-prev .' + cls + '{color:' + PALETTE[lend2] + ' !important}';
      }
      cycStyle.textContent = css;
    }
    turn();
    cycT = setInterval(turn, Math.max(30, ms || 150));
    return turning + ' painted colour(s) turning among slots ' + slots.join(', ') + (turning ? '' : ' -- none of those slots is painted on screen; chirp first');
  };

  // ================= the SCREWBOX (\\) -- Muriel's Affine Barberpole =================
  // Same place and glass as the bluebox, striped \\ \\ \\ along the top so you
  // can tell them apart. The caret never moves; the text winds past it.
  //   Enter sends · Shift+Enter feeds one turn down, same column (no carriage
  //   return) · Shift+Space steps back one column · wheel: straight up/down by
  //   whole turns · Ctrl+wheel: around · arrows one turn · Page keys four.
  // Words stay whole at the pole's edges (the edges go ragged). Sent text keeps
  // its relative line-starts, indented with braille blanks so nothing trims them.
  var SCREW = { h: 232, pitch: 0.5, stripe: '#3f86d6' };
  var SCREW_ROOM = 232;                                 // room for all seven lunettes: 12 + 7x22 + 6x9 + 12
  var screwState = { show: false };
  try { var ss = JSON.parse(localStorage.getItem('blinken-screw') || 'null'); if (ss) screwState.show = !!ss.show; } catch (e) {}
  if (screwState.show) blueState.show = false;
  function saveScrew(){ try { localStorage.setItem('blinken-screw', JSON.stringify(screwState)); } catch (e) {} }

  var screw = document.createElement('div');
  screw.id = 'bk-screw';
  screw.style.cssText = [
    'position:fixed','z-index:2147482999','box-sizing:border-box','height:' + SCREW.h + 'px',
    'background:' + BLUE.bg,
    BLUE.glass ? 'backdrop-filter:' + BLUE.glass + ';-webkit-backdrop-filter:' + BLUE.glass : '',
    'overflow:hidden','cursor:text','user-select:none','overscroll-behavior:contain','display:none'
  ].join(';');
  screw.innerHTML =
    '<div id="bk-sc-stripe" style="position:absolute;left:0;right:0;top:0;height:3px;background:repeating-linear-gradient(135deg,' + SCREW.stripe + ' 0 3px,transparent 3px 8px)"></div>' +
    '<div id="bk-sc-ink" style="position:absolute;inset:0;color:' + BLUE.ink + '"></div>' +
    '<div style="position:absolute;right:8px;top:14px;bottom:14px;width:1px;background:rgba(63,134,214,.3);pointer-events:none"></div>' +
    '<div id="bk-sc-knob" style="position:absolute;right:7px;width:3px;height:14px;background:' + SCREW.stripe + ';pointer-events:none"></div>';
  var sk = document.createElement('textarea');
  sk.id = 'bk-sc-ta'; sk.setAttribute('aria-label', 'screwbox');
  sk.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0';
  screw.appendChild(sk);
  document.body.appendChild(screw);
  var sInk = screw.querySelector('#bk-sc-ink'), sKnob = screw.querySelector('#bk-sc-knob');
  // the striped bar is also a handle: drag it up for a taller pole, down for a shorter; double-click restores
  var SCREW_H0 = SCREW.h;
  try { var sh = +localStorage.getItem('blinken-screw-h'); if (sh >= 200) SCREW.h = Math.max(SCREW_ROOM, sh); } catch (e) {}
  screw.style.height = SCREW.h + 'px';
  var sGrip = document.createElement('div');
  sGrip.title = 'drag to make the pole taller or shorter · double-click to restore';
  sGrip.style.cssText = 'position:absolute;left:0;right:0;top:-5px;height:12px;cursor:ns-resize;z-index:2';
  screw.appendChild(sGrip);
  var sStripe = screw.querySelector('#bk-sc-stripe');
  sStripe.style.transition = 'height .12s, filter .12s';
  function stripeLit(on){ sStripe.style.height = on ? '6px' : '3px'; sStripe.style.filter = on ? 'brightness(1.5) drop-shadow(0 0 3px ' + SCREW.stripe + ')' : ''; }
  function setScrewH(h) {
    SCREW.h = Math.round(Math.max(SCREW_ROOM, Math.min(window.innerHeight - 160, h)));   // never shorter than its lunettes
    screw.style.height = SCREW.h + 'px'; P.cy = Math.round(SCREW.h * 0.55); screwRender();
  }
  (function () {
    var drag = false, y0 = 0, h0 = 0;
    sGrip.addEventListener('pointerenter', function(){ stripeLit(true); });
    sGrip.addEventListener('pointerleave', function(){ if (!drag) stripeLit(false); });
    sGrip.addEventListener('pointerdown', function (e) { drag = true; y0 = e.clientY; h0 = SCREW.h; sGrip.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); });
    sGrip.addEventListener('pointermove', function (e) { if (drag) setScrewH(h0 - (e.clientY - y0)); });
    sGrip.addEventListener('pointerup', function (e) { if (!drag) return; drag = false; stripeLit(false);
      try { localStorage.setItem('blinken-screw-h', SCREW.h); } catch (er) {} e.stopPropagation(); });
    sGrip.addEventListener('click', function (e) { e.stopPropagation(); });
    sGrip.addEventListener('dblclick', function (e) { e.stopPropagation(); setScrewH(SCREW_H0);
      try { localStorage.removeItem('blinken-screw-h'); } catch (er) {} });
  })();
  var BACK = '\u0008';                                  // a step back: one column left, drawn as nothing

  var P = { ci: 0, cs: null, cw: 9.6, M: 60, Wf: 0, L: 0, cx: 0, cy: 0, lh: 24, view: 0, target: 0, yoff: 0, raf: 0, blink: true, SK: '', S: [], total: 0, fs: '' };
  function screwMeasure() {
    var cs = getComputedStyle(ta);
    P.fs = 'font-family:' + cs.fontFamily.replace(/"/g, "'") + ';font-size:' + cs.fontSize + ';letter-spacing:' + cs.letterSpacing + ';line-height:1';
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;' + P.fs;
    probe.textContent = new Array(41).join('0'); document.body.appendChild(probe);
    P.cw = probe.getBoundingClientRect().width / 40; probe.remove();
    P.lh = Math.round((parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6) * 1.05);
    var W = screw.clientWidth || (blueState.w || defaultW);
    var face = Math.min(parseFloat(BLUE.measure) || BLUE.cols * P.cw || 550, W - 64 - 12 * P.cw);
    P.M = Math.max(20, Math.floor(face / P.cw)); P.Wf = P.M * P.cw;
    P.L = (W - 16 - P.Wf) / 2; P.cx = P.L + P.Wf / 2; P.cy = Math.round(SCREW.h * 0.55);
    P.SK = ' skewY(' + (Math.atan(SCREW.pitch / P.cw) * 180 / Math.PI).toFixed(4) + 'deg)';
    screwLayout();
  }
  function screwLayout() {
    var t = sk.value, s = 0; P.S = new Array(t.length);
    for (var j = 0; j < t.length; j++) { P.S[j] = s; s += t[j] === '\n' ? P.M : (t[j] === BACK ? -1 : 1); }
    P.total = s;
  }
  function sGlyph(c, xs, k, j) {
    var f = (xs - P.L) / P.Wf, y = P.cy + k * P.lh + P.yoff + ((xs - P.cx) / P.cw) * SCREW.pitch;
    if (y < -20 || y > SCREW.h + 20) return '';
    var kd = Math.abs((y - P.cy) / P.lh), o = Math.max(0, (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, Math.max(0, f)))) * (1 - kd * 0.14 * 210 / SCREW.h));   // the fade scales with the pole: a taller pole sees further
    var ch = c === ' ' ? '&nbsp;' : c.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return '<span data-j="' + j + '" style="position:absolute;left:0;top:0;white-space:pre;' + P.fs + ';transform-origin:0 0;transform:translate(' + xs.toFixed(2) + 'px,' + (y - 9).toFixed(2) + 'px)' + P.SK + ';opacity:' + o.toFixed(2) + (P.col && P.col[j] ? ';color:' + P.col[j] : '') + '">' + ch + '</span>';   // P.col: the lamp's or the tincture's colour per character, when either is on (user1, 18 x 2026: "Tint and Tincture within Muriel's Screw view")
  }
  function screwRender() {
    if (!screwState.show) return;
    var t = sk.value, n = t.length, at = caretSlot() + P.view, h = '', j = 0;
    function U(s){ return P.Wf / 2 + (s - at) * P.cw; }
    if (!n) h += '<span style="position:absolute;left:' + (P.cx + 10) + 'px;top:' + (P.cy - 8) + 'px;white-space:pre;' + P.fs + ';opacity:.28">screwbox · Enter sends · Shift+Enter feeds a line · Shift+Space steps back</span>';
    while (j < n) {
      var c = t[j];
      if (c === '\n' || c === BACK) { j++; continue; }
      if (c === ' ') { var u = U(P.S[j]), k = Math.floor(u / P.Wf); h += sGlyph(c, P.L + u - k * P.Wf, k, j); j++; continue; }
      var e = j; while (e < n && t[e] !== ' ' && t[e] !== '\n' && t[e] !== BACK) e++;
      var kw = Math.floor(((U(P.S[j]) + U(P.S[e - 1]) + P.cw) / 2) / P.Wf);   // a word stays whole, on the side that holds most of it
      for (var q = j; q < e; q++) h += sGlyph(t[q], P.L + U(P.S[q]) - kw * P.Wf, kw, q);
      j = e;
    }
    h += '<span style="position:absolute;left:' + (P.cx - 1) + 'px;top:' + (P.cy - 11) + 'px;width:2px;height:20px;background:' + SCREW.stripe + ';opacity:' + (P.blink && Math.abs(P.view) < 0.5 && Math.abs(P.yoff) < 1 ? 1 : 0.25) + '"></span>';
    sInk.innerHTML = h;
    var r = P.total ? Math.max(0, Math.min(1, (caretSlot() + P.view) / P.total)) : 1;
    sKnob.style.top = (14 + r * (SCREW.h - 28 - 14)).toFixed(1) + 'px';
  }
  function screwTick() {
    P.view += (P.target - P.view) * (P.ease || 0.18); if (Math.abs(P.target - P.view) < 0.02) P.view = P.target;
    P.yoff *= (P.yease || FEED_EASE); if (Math.abs(P.yoff) < 0.3) P.yoff = 0;
    screwRender();
    P.raf = (P.view !== P.target || P.yoff !== 0) ? requestAnimationFrame(screwTick) : 0;
  }
  function screwGo(){ if (!P.raf) P.raf = requestAnimationFrame(screwTick); }
  function caretSlot(){ if (P.ci > sk.value.length) P.ci = sk.value.length; return P.ci < sk.value.length ? P.S[P.ci] : P.total; }
  // the wheel's turn is a workaday one: half the glide of a caret's (0.82 squared
  // leaves 0.67 a frame), and half the distance at the wheel (a twelfth of a turn)
  var TURN_EASE = 0.33, GLIDE_EASE = 0.18;
  var FEED_EASE = 0.78;                                 // the arrow and Page keys' rows, and a click's whole turns
  function screwTurn(d){ P.ease = TURN_EASE; var cs = caretSlot(), t = P.target + d; if (t > P.total - cs) t = P.total - cs; if (t < -cs) t = -cs; P.target = t; screwGo(); }
  function screwRows(r, now){ var cs = caretSlot(), lo = -cs, hi = P.total - cs; P.view = P.target; var t = P.view + r * P.M;
    while (t > hi) t -= P.M; while (t < lo) t += P.M; if (t > hi) t = P.view;
    var dr = Math.round((t - P.view) / P.M); if (!dr) return;
    P.view = P.target = t;
    if (now) { P.yoff = 0; screwRender(); return; }    // the wheel: no transition, it is simply there
    P.yoff += dr * P.lh; P.yease = FEED_EASE; screwGo(); }
  function placeCaret(ci, glide) {                    // the caret goes to ci; the pole turns to bring it to the centre
    var oldAt = caretSlot() + P.view;
    P.ci = Math.max(0, Math.min(sk.value.length, ci));
    var delta = oldAt - caretSlot();
    if (!glide) { P.view = P.target = 0; screwRender(); return; }
    var rowsPart = Math.round(delta / P.M) * P.M;       // whole turns go straight up or down; only the rest turns around
    P.view = delta - rowsPart; P.target = 0; P.yoff -= (rowsPart / P.M) * P.lh;
    P.ease = GLIDE_EASE; P.yease = FEED_EASE; screwGo();
  }
  function screwInput() {
    var old = P.cs == null ? caretSlot() : P.cs; screwLayout(); P.ci = sk.selectionStart; var d = caretSlot() - old;
    P.yoff = 0;                                         // a line-feed is simply there: no slide
    P.view = P.target = 0; P.cs = caretSlot(); screwRender(); screwGo();
    try { localStorage.setItem('blinken-screw-draft', sk.value); } catch (e) {}
  }
  function screwFlatten() {                            // the pole's picture, as plain text: relative line-starts kept
    var t = sk.value, lines = [], start = 0, j;
    screwLayout();
    for (j = 0; j <= t.length; j++) if (j === t.length || t[j] === '\n') { lines.push([start, j]); start = j + 1; }
    var rows = lines.map(function (ab) {
      var i = ab[0]; while (i < ab[1] && (t[i] === ' ' || t[i] === BACK)) i++;
      if (i >= ab[1]) return { col: null, s: '' };
      var col = ((P.S[i] % P.M) + P.M) % P.M;
      return { col: col, s: t.slice(i, ab[1]).split(BACK).join('') };
    });
    var min = Infinity; rows.forEach(function (r) { if (r.col !== null && r.col < min) min = r.col; });
    return rows.map(function (r) { return r.col === null ? '' : new Array(r.col - min + 1).join('⠀') + r.s.replace(/\s+$/, ''); }).join('\n').replace(/\s+$/, '');
  }
  function placeScrew() {
    screw.style.display = screwState.show ? 'block' : 'none';
    if (!screwState.show) return;
    var br = box.getBoundingClientRect(), w = blueState.w || defaultW;
    screw.style.width = w + 'px';
    screw.style.left = Math.round(br.left + br.width / 2 - w / 2 + blueState.dx) + 'px';
    screw.style.bottom = Math.round(window.innerHeight - br.top + BLUE.gap) + 'px';   // affixed, like the bluebox
  }

  try { sk.value = localStorage.getItem('blinken-screw-draft') || ''; } catch (e) {}
  P.ci = sk.value.length; P.cs = null;
  screw.addEventListener('click', function (e) {       // augur in: the glyph under the pointer takes the caret
    var hit = e.target.closest && e.target.closest('[data-j]');
    if (!hit) {                                         // empty glass: the nearest glyph
      var best = null, bd = Infinity;
      [].forEach.call(sInk.querySelectorAll('[data-j]'), function (el) {
        var r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        var dd = dx * dx + dy * dy * 4; if (dd < bd) { bd = dd; best = el; }
      });
      hit = best;
    }
    if (hit) {
      var j = +hit.getAttribute('data-j'), rr = hit.getBoundingClientRect();
      placeCaret(e.clientX > rr.left + rr.width / 2 ? j + 1 : j, true);
    }
    sk.focus({ preventScroll: true }); sk.selectionStart = sk.selectionEnd = P.ci; P.cs = caretSlot();
  });
  sk.addEventListener('input', screwInput);
  sk.addEventListener('keydown', function (e) {
    e.stopPropagation();
    var rk = { ArrowUp: -1, ArrowDown: 1, PageUp: -4, PageDown: 4 }[e.key];
    if (rk) { e.preventDefault(); screwRows(rk); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); placeCaret(P.ci + (e.key === 'ArrowLeft' ? -1 : 1), false); P.cs = caretSlot(); return; }
    if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); placeCaret(e.key === 'Home' ? 0 : sk.value.length, true); P.cs = caretSlot(); return; }
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      var text = screwFlatten(); if (!text) return;
      sendText(text, 'screwbox', function () {
        sk.value = ''; try { localStorage.removeItem('blinken-screw-draft'); } catch (er) {}
        screwLayout(); P.ci = 0; P.cs = null; P.view = P.target = 0; screwRender(); setTimeout(function(){ sk.focus(); }, 300);
      });
      return;
    }
    if (e.key === ' ' && e.shiftKey) {                   // step back one column
      e.preventDefault(); var v = sk.value; sk.value = v.slice(0, P.ci) + BACK + v.slice(P.ci);
      sk.selectionStart = sk.selectionEnd = P.ci + 1; screwInput(); return;
    }
    if (e.key === 'Escape') { sk.blur(); return; }
    sk.selectionStart = sk.selectionEnd = P.ci;          // type where the caret is
  });
  ['keyup', 'keypress'].forEach(function (k) { sk.addEventListener(k, function (e) { e.stopPropagation(); }); });
  screw.addEventListener('wheel', function (e) {
    e.preventDefault(); e.stopPropagation();
    var d = e.deltaY || e.deltaX; if (!d) return; var s = d > 0 ? 1 : -1;
    if (e.ctrlKey) { screwTurn(s * P.M / 12); return; }
    // true scrolling, in whole rows: the wheel's own pixels, a row for every
    // line-height of them, the remainder carried. No transition. Events are
    // gathered and drawn once a frame, at whatever rate the display runs.
    if (e.deltaMode === 1) d *= P.lh; else if (e.deltaMode === 2) d *= SCREW.h;
    if (wheelPx && (wheelPx > 0) !== (d > 0)) wheelPx = 0;     // a change of direction starts afresh
    wheelPx += d;
    if (!wheelRaf) wheelRaf = requestAnimationFrame(wheelFrame);
  }, { passive: false });
  var wheelPx = 0, wheelRaf = 0;
  function wheelFrame() {
    wheelRaf = 0;
    var n = wheelPx / P.lh; n = n < 0 ? Math.ceil(n) : Math.floor(n);
    if (!n) return;
    wheelPx -= n * P.lh;
    screwRows(n, true);
  }
  var screwBlink = setInterval(function () { P.blink = !P.blink; if (!P.raf) screwRender(); }, 530);

  // ---------- the LUNETTES: bespoke adjusters ----------
  // One circle per property, split across the middle: the whole circle is the
  // target; the half under the pointer lights, the half you press pops. Hold to
  // repeat; the wheel over a lunette turns it too; double-click restores the
  // house setting. Each box has its OWN set -- the barber-pole chooses its own
  // ways, and the bluebox keeps its defaults until you turn its own lunettes.
  var BASE = { stripe: '#3f86d6', bg: [22, 20, 64] };
  var HOUSE = { hue: 0, dark: 0, alpha: 0.24, blur: 0.3, pitch: 0.5, tilt: 1, flip: 0 };
  var BLUR_MAX = 10;                                    // px at blur 100%; the house 30% is the old 3px
  function hueShift(hex, deg) {
    if (!deg) return hex;
    var r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    var mx = Math.max(r,g,b), mn = Math.min(r,g,b), l = (mx+mn)/2, h = 0, s = 0, d = mx - mn;
    if (d) { s = l > .5 ? d/(2-mx-mn) : d/(mx+mn);
      h = mx === r ? (g-b)/d + (g < b ? 6 : 0) : mx === g ? (b-r)/d + 2 : (r-g)/d + 4; h *= 60; }
    h = ((h + deg) % 360 + 360) % 360;
    var c = (1 - Math.abs(2*l - 1)) * s, x = c * (1 - Math.abs((h/60) % 2 - 1)), m = l - c/2, rr, gg, bb;
    if (h < 60) { rr=c; gg=x; bb=0; } else if (h < 120) { rr=x; gg=c; bb=0; } else if (h < 180) { rr=0; gg=c; bb=x; }
    else if (h < 240) { rr=0; gg=x; bb=c; } else if (h < 300) { rr=x; gg=0; bb=c; } else { rr=c; gg=0; bb=x; }
    function hx(v){ v = Math.round((v+m)*255); return (v < 16 ? '0' : '') + v.toString(16); }
    return '#' + hx(rr) + hx(gg) + hx(bb);
  }
  function blurOf(look) { var px = Math.round(look.blur * BLUR_MAX * 10) / 10; return px ? 'blur(' + px + 'px)' : 'none'; }
  function setGlass(el, look) { el.style.background = glassOf(look); el.style.backdropFilter = el.style.webkitBackdropFilter = blurOf(look); }
  function glassOf(look) {
    var k = 1 - look.dark;
    return 'rgba(' + Math.round(BASE.bg[0]*k) + ',' + Math.round(BASE.bg[1]*k) + ',' + Math.round(BASE.bg[2]*k) + ',' + look.alpha.toFixed(2) + ')';
  }
  var LUNS = [
    { key: 'hue',   name: 'hue',     step: 15,   min: -180, max: 180, show: function(v){ return (v > 0 ? '+' : '') + v + '°'; } },
    { key: 'dark',  name: 'darken',  step: 0.1,  min: 0,    max: 1,   show: function(v){ return Math.round(v*100) + '%'; } },
    { key: 'alpha', name: 'opacity', step: 0.1,  min: 0,    max: 1,   show: function(v){ return Math.round(v*100) + '%'; } },
    { key: 'blur',  name: 'blur',    step: 0.1,  min: 0,    max: 1,   show: function(v){ return Math.round(v*100) + '%'; } }
  ];
  function makeLunettes(host, storeKey, apply, row, extra) {
    var look = {}; for (var hk in HOUSE) look[hk] = HOUSE[hk];
    try { var lk = JSON.parse(localStorage.getItem(storeKey) || 'null'); if (lk) for (var q in lk) look[q] = lk[q]; } catch (e) {}
    var stack = document.createElement('div');
    stack.style.cssText = row
      ? 'position:absolute;right:24px;top:6px;display:flex;gap:5px;align-items:center'          // held up to the blue line
      : 'position:absolute;right:24px;top:12px;display:flex;flex-direction:column;gap:9px;align-items:flex-end';
    var read = document.createElement('span');          // one readout for the set
    read.style.cssText = "position:absolute;" + (row ? 'right:calc(100% + 8px);top:50%;transform:translateY(-50%)' : 'top:0;right:32px') +
      ";font:10px 'DejaVu Sans Mono',monospace;color:rgba(255,255,255,.6);opacity:0;transition:opacity .15s;white-space:pre;pointer-events:none";
    stack.appendChild(read);
    var circles = [];
    function commit(){ try { localStorage.setItem(storeKey, JSON.stringify(look)); } catch (e) {}
      var ac = hueShift(BASE.stripe, look.hue);
      circles.forEach(function (c) { if (c._paint) c._paint(ac); else c.style.borderColor = ac + '88'; });
      apply(look, ac); }
    LUNS.concat(extra || []).forEach(function (L, idx) {
      var c = document.createElement('div'); c.title = L.name;
      var SZ = row ? 16 : 22;
      if (L.toggle) {                                   // one press flips it: the set's own blue ring = on (all's normal), red ring = stopped. Never filled.
        var RED = '#e0484a'; c.dataset.fixed = '1';
        c.style.cssText = 'position:relative;width:' + SZ + 'px;height:' + SZ + 'px;border-radius:50%;border:1px solid ' + RED + ';cursor:pointer;transition:transform .08s, background .12s;flex:none';
        stack.appendChild(c); circles.push(c);
        var paint = function(ac){ c.style.background = 'transparent';
          if (L.ring) {                                 // a toggle with its own colours: dim when off, bright when engaged
            c.style.border = (look[L.key] ? 1.5 : 1) + 'px solid ' + (look[L.key] ? L.ring.on : L.ring.off); return; }
          c.style.border = (look[L.key] ? 1 : 1.5) + 'px solid ' + (look[L.key] ? (ac || hueShift(BASE.stripe, look.hue)) + '88' : RED); };
        c._paint = paint;
        var sayT = function(){ read.textContent = L.name + ' ' + L.show(look[L.key]); if (!row) read.style.top = (idx * 31 + 4) + 'px'; };
        c.addEventListener('pointerenter', function(){ sayT(); read.style.opacity = 1; c.style.boxShadow = '0 0 0 2px rgba(255,255,255,.12)'; });
        c.addEventListener('pointerleave', function(){ read.style.opacity = 0; c.style.boxShadow = ''; c.style.transform = ''; });
        c.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); c.style.transform = 'scale(1.1)';
          look[L.key] = look[L.key] ? 0 : 1; paint(); sayT(); commit(); });
        c.addEventListener('pointerup', function (e) { c.style.transform = ''; e.stopPropagation(); });
        c.addEventListener('click', function (e) { e.stopPropagation(); });
        c.addEventListener('wheel', function (e) { e.preventDefault(); e.stopPropagation(); }, { passive: false });
        paint(); return;
      }                              // the bluebox is one line tall: its set is smaller, to stay clear of the column
      c.style.cssText = 'position:relative;width:' + SZ + 'px;height:' + SZ + 'px;border-radius:50%;border:1px solid ' + BASE.stripe + '88;overflow:hidden;cursor:pointer;transition:transform .08s;flex:none';
      var up = document.createElement('div'), dn = document.createElement('div'), mid = document.createElement('div');
      up.style.cssText = 'position:absolute;left:0;right:0;top:0;height:50%;transition:background .1s';
      dn.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:50%;transition:background .1s';
      mid.style.cssText = 'position:absolute;left:4px;right:4px;top:50%;height:1px;background:rgba(255,255,255,.18);pointer-events:none';
      c.appendChild(up); c.appendChild(dn); c.appendChild(mid); stack.appendChild(c); circles.push(c);
      function say(){ read.textContent = L.name + ' ' + L.show(look[L.key]);
        if (!row) read.style.top = (idx * 31 + 4) + 'px'; }
      function bump(dir){                               // step on the grid: 0, 10%, 20% ... (an off-grid value lands on the next line)
        var n = look[L.key] / L.step, e = 1e-6;
        var v = (dir > 0 ? Math.floor(n + e) + 1 : Math.ceil(n - e) - 1) * L.step;
        v = Math.round(v * 1000) / 1000;
        look[L.key] = Math.max(L.min, Math.min(L.max, v)); say(); commit(); }
      function half(e){ var r = c.getBoundingClientRect(); return (e.clientY - r.top) < r.height / 2 ? 1 : -1; }
      var rep = null, repT = null;
      function stop(){ clearTimeout(repT); clearInterval(rep); rep = repT = null; up.style.background = dn.style.background = ''; c.style.transform = ''; }
      c.addEventListener('pointermove', function (e) { if (rep || repT) return; var h = half(e);
        up.style.background = h > 0 ? 'rgba(255,255,255,.12)' : ''; dn.style.background = h < 0 ? 'rgba(255,255,255,.12)' : ''; });
      c.addEventListener('pointerenter', function(){ say(); read.style.opacity = 1; });
      c.addEventListener('pointerleave', function(){ stop(); read.style.opacity = 0; });
      c.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation();
        var h = half(e); (h > 0 ? up : dn).style.background = hueShift(BASE.stripe, look.hue); c.style.transform = 'scale(1.1)';
        bump(h); repT = setTimeout(function(){ rep = setInterval(function(){ bump(h); }, 70); }, 380); });
      c.addEventListener('pointerup', function (e) { stop(); e.stopPropagation(); });
      c.addEventListener('click', function (e) { e.stopPropagation(); });
      c.addEventListener('wheel', function (e) { e.preventDefault(); e.stopPropagation();
        var d = e.deltaY || e.deltaX; if (d) bump(d < 0 ? 1 : -1); }, { passive: false });
      c.addEventListener('dblclick', function (e) { e.stopPropagation(); look[L.key] = HOUSE[L.key]; say(); commit(); });
    });
    host.appendChild(stack);
    commit();
    return look;
  }
  makeLunettes(screw, 'blinken-lunettes-screw', function (look, ac) {   // the barber-pole's own
    SCREW.pitch = look.tilt ? (look.flip ? -look.pitch : look.pitch) : 0;   // tilt off: level lines. flip: the other thread
    P.SK = ' skewY(' + (Math.atan(SCREW.pitch / P.cw) * 180 / Math.PI).toFixed(4) + 'deg)';
    SCREW.stripe = ac;
    setGlass(screw, look);
    screw.querySelector('#bk-sc-stripe').style.background = 'repeating-linear-gradient(135deg,' + ac + ' 0 3px,transparent 3px 8px)';
    sKnob.style.background = ac;
    screwRender();
  }, false, [
    { key: 'pitch', name: 'pitch', step: 0.1, min: -2, max: 2, show: function(v){ return (v > 0 ? '+' : '') + v.toFixed(1) + 'px a character'; } },
    { key: 'tilt',  name: 'tilt',  toggle: true, show: function(v){ return v ? 'on' : 'TILT · stopped, level lines'; } },
    { key: 'flip',  name: 'flip',  toggle: true, ring: { off: '#35d6d655', on: '#35d6d6' },   // Cyanflip, under the Redring
      show: function(v){ return v ? 'FLIPPED · the other thread, up the other side' : 'the house thread'; } }
  ]);
  makeLunettes(blue, 'blinken-lunettes-blue', function (look, ac) {     // the bluebox's own; house setting = as it was
    setGlass(blue, look);
    blue.style.borderTopColor = ac;                     // colour only: the line's 2px and the box's place never change
  }, true);

  // ---------- one text, two boxes: the words move with whichever box is open ----------
  // Opening the screwbox takes the bluebox's words onto the pole; closing it (or
  // swapping back) returns them, flattened, to the bluebox. No copy, no paste.
  function blueToScrew(text) {                        // plain lines -> pole: each line starts in the column its own indent says
    var lines = text.split('\n'), out = '', prevLen = 0;
    lines.forEach(function (ln, i) {
      ln = ln.replace(/^[⠀ ]+/, function (m) { return new Array(m.length + 1).join(' '); });
      if (i > 0) {                                    // feed below the whole previous line, then step back to its start
        var turns = Math.max(1, Math.ceil((prevLen + P.M / 3) / P.M));   // and leave a third of a turn clear after a long line
        var d = P.M * turns - P.M - prevLen;          // slots from the feed to the next start: back if negative, forward if not
        out += '\n' + new Array(Math.abs(d) + 1).join(d < 0 ? BACK : ' ');
      }
      out += ln; prevLen = ln.length;
    });
    return out;
  }
  function saveDrafts() {
    try { localStorage.setItem('blinken-draft', ta.value); localStorage.setItem('blinken-screw-draft', sk.value); } catch (e) {}
  }
  function showScrew(on) {
    var was = screwState.show;
    screwState.show = on;
    if (on) blueState.show = false;
    else if (was) blueState.show = true;              // closing the pole brings the bluebox back, words and all
    saveBlue(); saveScrew(); placeBlue(); placeScrew();
    if (on) {
      screwMeasure();
      if (ta.value.replace(/\s+$/, '')) {             // take the bluebox's words onto the pole
        var conv = blueToScrew(ta.value.replace(/\s+$/, ''));
        sk.value = sk.value ? sk.value + '\n' + conv : conv;
        ta.value = ''; fit(); previewBurst();
      }
      screwLayout(); P.ci = sk.value.length; P.cs = null; P.view = P.target = 0; P.yoff = 0; saveDrafts();
      screwRender(); sk.focus({ preventScroll: true });
    } else if (was) {
      if (sk.value.replace(/[\s\u0008]+$/, '')) {       // and hand them back, flattened
        ta.value = screwFlatten(); sk.value = ''; screwLayout(); P.ci = 0; P.cs = null;
      }
      saveDrafts(); fit(); previewBurst();
      ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length;
    }
  }
  // ================= VENTILATED PROSE .. -- the vented box =================
  // "Language asks for space, and get it." -- User1
  // The bluebox's own words, given room: each sentence at the left edge, each
  // clause on its own line two spaces in, a subordinate clause one step deeper,
  // a coordinate one a step back out. Never deeper than six: do never get lost.
  // Lists you wrote keep their lines. Procedures only, after Sandraker's rake:
  // his depth model, his clause words, no parser (no s|v|o hinges; that wants
  // Compromise, too large for a page-helper). Pressed again, the words go
  // back to prose. Typing is never re-vented under the caret: press it off and
  // on to vent anew. What you see is what is sent; indents go as braille blanks.
  var VENT = { unit: 2, deep: 3 };
  function words(s) { return s.split(' '); }
  var V_SUBORD = words('because although though whereas unless until till whenever wherever wherein whereby while whilst if when where that which who whom whose whether than as before after once since lest');
  var V_COORD  = words('and but or nor yet so for plus then however therefore thus hence meanwhile moreover furthermore besides still also');
  var V_SPLIT  = words('because although though whereas unless whenever wherever whereby wherein while whilst');
  var V_ABBR   = words('mr mrs ms dr st vs etc e.g i.e cf jr sr fig pp vol approx');
  var V_CLOSE = '.!?"\')]’”»', V_OPEN = '"\'([“‘«';
  function vBlank(c) { return c === ' ' || c === '\t' || c === ' ' || c === '⠀'; }
  function vUpper(c) { return c.toUpperCase() === c && c.toLowerCase() !== c; }
  function vDigit(c) { return c >= '0' && c <= '9'; }
  function vLetter(c) { return c.toUpperCase() !== c.toLowerCase(); }
  function vLead(s) { var n = 0; while (n < s.length && vBlank(s[n])) n++; return n; }
  function vTrim(s) { var a = vLead(s), b = s.length; while (b > a && (vBlank(s[b - 1]) || s[b - 1] === '\n')) b--; return s.slice(a, b); }
  function vRight(s) { var b = s.length; while (b > 0 && (vBlank(s[b - 1]) || s[b - 1] === '\n' || s[b - 1] === '\r')) b--; return s.slice(0, b); }
  function vSpaces(n) { var s = ''; while (s.length < n) s += ' '; return s; }
  function vMarker(t) {                                 // a list marker at the head of a line: its length, or 0
    if (t.length > 1 && '-*•·.–'.indexOf(t[0]) >= 0 && t[1] === ' ') return 2;
    var i = 0; while (i < t.length && i < 3 && vDigit(t[i])) i++;
    if (i > 0 && (t[i] === '.' || t[i] === ')') && t[i + 1] === ' ') return i + 2;
    if (vLetter(t[0]) && t[1] === ')' && t[2] === ' ') return 3;
    return 0;
  }
  function vFirst(s) {                                  // the first word, letters only, lowercased
    var i = 0, w = ''; while (i < s.length && !vLetter(s[i])) i++;
    while (i < s.length && (vLetter(s[i]) || s[i] === "'")) w += s[i++];
    return w.toLowerCase();
  }
  function vAbbrev(s, i) {                              // is the period at i the end of an abbreviation or an initial?
    var b = i; while (b > 0 && !vBlank(s[b - 1])) b--;
    while (b < i && '("\'[“'.indexOf(s[b]) >= 0) b++;
    var w = s.slice(b, i);
    if (w.length === 1 && vUpper(w)) return true;
    return V_ABBR.indexOf(w.toLowerCase()) >= 0;
  }
  function vSentences(s) {
    var out = [], start = 0, i, j, k;
    for (i = 0; i < s.length; i++) {
      var c = s[i];
      if (c !== '.' && c !== '!' && c !== '?') continue;
      j = i + 1; while (j < s.length && V_CLOSE.indexOf(s[j]) >= 0) j++;
      if (j >= s.length || !vBlank(s[j])) continue;
      k = j; while (k < s.length && vBlank(s[k])) k++;
      if (k >= s.length) break;
      if (!(vUpper(s[k]) || vDigit(s[k]) || V_OPEN.indexOf(s[k]) >= 0)) continue;
      if (c === '.' && vAbbrev(s, i)) continue;
      out.push(vTrim(s.slice(start, j))); start = k; i = k - 1;
    }
    var last = vTrim(s.slice(start)); if (last) out.push(last);
    return out;
  }
  function vSegments(sent) {                            // break after , ; : and dashes; then before the clause words
    var res = [], cur = '', i, c;
    for (i = 0; i < sent.length; i++) {
      c = sent[i]; cur += c;
      var cut = false;
      if (c === ',' || c === ';' || c === ':') cut = !(c === ',' && vDigit(sent[i - 1] || '') && vDigit(sent[i + 1] || '')) && (i === sent.length - 1 || vBlank(sent[i + 1]) || V_CLOSE.indexOf(sent[i + 1]) >= 0);   // a mark with no space after it is inside a word (a URL, a time): no fold
      else if (c === '—') cut = true;
      else if (c === '-' && sent[i - 1] === ' ' && (sent[i + 1] === ' ' || (sent[i + 1] === '-' && sent[i + 2] === ' '))) {
        if (sent[i + 1] === '-') { cur += '-'; i++; }
        cut = true;
      }
      if (cut) { res.push(cur); cur = ''; }
    }
    if (vTrim(cur)) res.push(cur);
    var out = [];
    res.forEach(function (seg) {
      var ws = vTrim(seg).split(' '), part = [];
      ws.forEach(function (w, n) {
        if (n > 0 && part.length && V_SPLIT.indexOf(vFirst(w)) >= 0 && vFirst(w) === w.toLowerCase()) { out.push(part.join(' ')); part = []; }
        part.push(w);
      });
      if (part.length) out.push(part.join(' '));
    });
    return out.filter(function (x) { return vTrim(x); });
  }
  function vDepths(segs, cap) {                         // cap: how deep a clause may go (the vented box stops at VENT.deep)                              // Sandraker's: head 0; subord dives; coord steps out (floor 1)
    var d = 0;
    return segs.map(function (s, i) {
      var f = vFirst(s);
      if (i === 0) d = 0;
      else if (V_SUBORD.indexOf(f) >= 0) d = Math.min(cap || VENT.deep, d + 1);
      else if (V_COORD.indexOf(f) >= 0) d = Math.max(1, d - 1);
      else d = Math.max(1, d);
      return d;
    });
  }
  function vBlocks(text) {                              // paragraphs, each a list of units { text, list }
    var blocks = [], cur = null;
    text.split('\n').forEach(function (line) {
      var t = vTrim(line);
      if (!t) { cur = null; return; }
      if (!cur) { cur = []; blocks.push(cur); }
      var u = cur[cur.length - 1];
      if (vMarker(t)) cur.push({ text: t, list: true });
      else if (u) u.text += ' ' + t;
      else cur.push({ text: t, list: false });
    });
    return blocks;
  }
  function ventOf(text) {
    return vBlocks(text).map(function (units) {
      var lines = [];
      units.forEach(function (u) {
        if (u.list) { lines.push(vSpaces(VENT.unit) + u.text); return; }
        vSentences(u.text).forEach(function (sent) {
          var segs = vSegments(sent), ds = vDepths(segs);
          segs.forEach(function (seg, i) { lines.push(vSpaces(VENT.unit * ds[i]) + vTrim(seg)); });
        });
      });
      return lines.join('\n');
    }).join('\n\n');
  }
  function unventOf(text) {                             // back to prose: a paragraph's lines rejoined, lists kept
    var paras = [], cur = null, prevList = -1;
    text.split('\n').forEach(function (line) {
      var t = vTrim(line), ind = vLead(line);
      if (!t) { cur = null; prevList = -1; return; }
      if (!cur) { cur = []; paras.push(cur); }
      if (vMarker(t)) { cur.push(t); prevList = ind; return; }
      if (cur.length && (prevList < 0 || ind > prevList)) cur[cur.length - 1] += ' ' + t;
      else { cur.push(t); prevList = -1; }
    });
    return paras.map(function (p) { return p.join('\n'); }).join('\n\n');
  }
  // ================= THE DEEP RAKE -- the subrake, a second raking of vented lines (user1, 19 x 2026) =================
  // "even inside a comma's delimitations, there is substructure, easy to lift out, and that this is almost never done,
  // because paper is expensive." The five rules, as read off user1's hand-raked page and given back in the rolling
  // roundtrip (and a sixth he found with his hand): a constituent to a line; a prepositional phrase one step under
  // its head; a coordinator alone at the depth of what it joins; a subordinator or relative opening a deeper level,
  // inside the clause and not only at its head; a quoted or bracketed span kept whole; an enumeration one constituent.
  // Procedures only, no parser: the head a phrase hangs from is the line it was lifted from, which is right most of
  // the time and honest all of it -- only whitespace is added, every word stays where it stood. A line of three words
  // or fewer is left alone. Lazy, the rake folds flat, every lifted line at its parent's depth ("who cares about
  // indent ... as assembler compares to linted Rust. It still reads, and reads better").
  var R_PREP  = words('of in on at to for with by from as into onto under over through about between among against without within upon toward towards across along around during like near via per unto beside behind beyond above below despite amid amidst');
  var R_TAIL  = words('of');                              // a preposition that stays with its head and folds after itself: "a texture of / the real DOM"
  var R_COP   = words('is are was were am be been being');
  var R_REL   = words('which that who whom whose where when because until unless although though since while whereas if so');
  var R_COORD = words('and but or nor yet');
  var RAKE = { min: 4, deep: 3, urls: false };
  // URLS, SANDRAKED (user1, 19 x 2026: "You know what needs sandraking, up to the point of e.e.'s single word ... are URLs. Imagine
  // breaking them by line and _ and / . What a help."): in a view (the tilt-downs set RAKE.urls), a URL is lifted at its slashes,
  // the scheme and host on the first line, each path segment one deeper, the query's terms deeper again, the fragment last; a long
  // segment joined by underscores is lifted at them into its words, one to a line at the same depth. Never in the box, where the
  // words are sent: a URL with whitespace in it is no longer a URL.
  function rIsUrl(w) { return /^[a-z][a-z0-9+.-]*:\/\/\S+$/i.test(w) || /^www\.\S+$/i.test(w); }
  function rUrlPieces(w, d0) {
    var trail = '', m = w.match(/[),.;:!?\]]+$/); if (m) { trail = m[0]; w = w.slice(0, -trail.length); }
    var out = [], hash = '', q = '', i = w.indexOf('#'); if (i >= 0) { hash = w.slice(i + 1); w = w.slice(0, i); }
    i = w.indexOf('?'); if (i >= 0) { q = w.slice(i + 1); w = w.slice(0, i); }
    var a = w.indexOf('://'), head = a >= 0 ? w.slice(0, a + 3) : '', rest = a >= 0 ? w.slice(a + 3) : w, segs = rest.split('/'), d = d0;
    out.push([d0, head + segs[0] + (segs.length > 1 ? '/' : '')]);
    for (i = 1; i < segs.length; i++) {
      if (!segs[i]) continue; d = Math.min(d0 + RAKE.deep, d + 1);
      var seg = segs[i] + (i < segs.length - 1 ? '/' : '');
      if (seg.length > 24 && seg.indexOf('_') > 0) seg.split('_').forEach(function (p, k, all) { out.push([d, p + (k < all.length - 1 ? '_' : '')]); });
      else out.push([d, seg]);
    }
    if (q) { d = Math.min(d0 + RAKE.deep, d + 1); q.split('&').forEach(function (t, k, all) { out.push([d, (k ? '&' : '?') + t]); }); }
    if (hash) { d = Math.min(d0 + RAKE.deep, d + 1); var hs = hash.split('/'), first = true; hs.forEach(function (seg, k) { if (!seg) return; seg = (first ? '#' + (k ? '/' : '') : '') + seg + (k < hs.length - 1 ? '/' : ''); first = false; if (seg.length > 24 && seg.indexOf('_') > 0) seg.split('_').forEach(function (p, j, all) { out.push([d, p + (j < all.length - 1 ? '_' : '')]); }); else out.push([d, seg]); }); }
    var lastP = out[out.length - 1], ext = lastP[1].match(/^(.+?)(\.[A-Za-z0-9]{1,6})$/);   // THE SUFFIX STANDS (user1, 19 x: "place period and filetype/suffix on their own line,
    if (ext && ext[1].length > 1) { lastP[1] = ext[1]; out.push([lastP[0], ext[2]]); }           // to let the last word stand ... '.jpg' would stand on its own")
    if (trail) out[out.length - 1][1] += trail;
    return out;
  }
  function rTok(w) { var i = 0, t = ''; while (i < w.length && !vLetter(w[i])) i++; while (i < w.length && (vLetter(w[i]) || w[i] === "'")) t += w[i++]; return t.toLowerCase(); }
  function rLiftLine(line, lazy) {                      // one vented line -> [[depth, text], ...]
    var d0 = Math.floor(vLead(line) / VENT.unit), t = vTrim(line), ws = t.split(' ').filter(function (w) { return w; }), out = [], cur = [], curD = d0, i, w, k, q = 0, p = 0, prev = '';
    if (RAKE.urls && ws.some(rIsUrl)) {                 // a line with a URL in it: the words before it, the URL lifted, the words after
      var acc = [], res = [];
      ws.forEach(function (w) { if (rIsUrl(w)) { if (acc.length) { res.push([d0, acc.join(' ')]); acc = []; } rUrlPieces(w, d0).forEach(function (p) { res.push(p); }); } else acc.push(w); });
      if (acc.length) res.push([d0, acc.join(' ')]);
      return res;
    }
    if (ws.length <= RAKE.min - 1 || vMarker(t)) return [[d0, t]];
    for (i = 0; i < ws.length - 1; i++) if (rTok(ws[i]) === 'so' && rTok(ws[i + 1]) === 'that') { ws.splice(i, 2, ws[i] + ' ' + ws[i + 1]); }   // "so that" is one word
    function push() { if (cur.length) out.push([curD, cur.join(' ')]); cur = []; }
    for (i = 0; i < ws.length; i++) {
      w = ws[i]; k = rTok(w);
      var inQuote = q > 0 || p > 0, first = cur.length === 0 && !out.length;
      if (!inQuote && !first && cur.length) {
        var opener = cur.length === 1 && (R_REL.indexOf(rTok(cur[0])) >= 0 || R_PREP.indexOf(rTok(cur[0])) >= 0 || rTok(cur[0]) === 'so that');   // a line that is only its opener so far does not fold again
        if (R_COORD.indexOf(k) >= 0 && i < ws.length - 1 && w === w.toLowerCase()) {               // the fulcrum: alone when the limb after it is three words or more, else leading it
          push(); if (ws.length - 1 - i >= 3) { out.push([curD, w]); } else cur.push(w); prev = k; continue;
        }
        if (!opener && (R_REL.indexOf(k) >= 0 || k === 'so that') && w === w.toLowerCase() && k !== 'so' && !(k === 'that' && i === ws.length - 1)) {
          push(); curD = Math.min(d0 + RAKE.deep, curD + 1); cur.push(w); prev = k; continue;         // the dive, inside the clause
        }
        if (R_COP.indexOf(k) >= 0 && cur.length >= 3) {                                               // the hinge: a copula alone after a subject of three words or more
          push(); out.push([curD, w]); prev = k; continue;
        }
        if (R_COP.indexOf(k) >= 0 && ws.length - 1 - i >= 3) {                                        // a short subject keeps its copula; the complement is lifted
          cur.push(w); push(); prev = k; continue;
        }
        if (!opener && R_PREP.indexOf(k) >= 0 && w === w.toLowerCase() && i < ws.length - 1 && R_COORD.indexOf(prev) < 0) {
          var tail = R_TAIL.indexOf(k) >= 0 || /(ed|ing)$/.test(prev);                             // "of" and a participle's "by" stay with the head and fold after
          if (tail) { cur.push(w); push(); curD = Math.min(d0 + RAKE.deep, curD + 1); prev = k; continue; }
          push(); curD = Math.min(d0 + RAKE.deep, curD + 1); cur.push(w); prev = k; continue;
        }
      }
      if (!inQuote && R_COORD.indexOf(prev) >= 0 && out.length && out[out.length - 1][1] === ws[i - 1]) curD = out.length > 1 ? out[out.length - 2][0] : d0;   // after the fulcrum: back to the limb's depth
      cur.push(w);
      for (var c = 0; c < w.length; c++) { if ('"“'.indexOf(w[c]) >= 0) q++; if ('"”'.indexOf(w[c]) >= 0 && q > 0 && w[c] !== '“') q--; if (w[c] === '(') p++; if (w[c] === ')' && p > 0) p--; }
      prev = k;
    }
    push();
    for (i = out.length - 1; i > 0; i--) {                // a stray single word that is not a fulcrum or a hinge goes back to its line
      var one = out[i][1].indexOf(' ') < 0, kk = rTok(out[i][1]);
      if (one && R_COORD.indexOf(kk) < 0 && R_COP.indexOf(kk) < 0) { out[i - 1][1] += ' ' + out[i][1]; out.splice(i, 1); }
    }
    if (lazy) out.forEach(function (o) { o[0] = d0; });
    return out;
  }
  function rakeOf(text, lazy) {                         // vented text (or prose, vented first) -> lifted
    var src = /\n/.test(text) ? text : ventOf(text), lines = [];
    src.split('\n').forEach(function (line) {
      if (!vTrim(line)) { lines.push(''); return; }
      rLiftLine(line, lazy).forEach(function (o) { lines.push(vSpaces(VENT.unit * o[0]) + o[1]); });
    });
    return lines.join('\n');
  }
  function ventSend(text) {                             // indents as braille blanks, so nothing trims them
    return text.split('\n').map(function (line) {
      var n = vLead(line), b = ''; while (b.length < n) b += '⠀';
      return b + line.slice(n);
    }).join('\n');
  }
  var vtBtn = document.getElementById('bk-vt');
  function paintVent() {
    var on = !!blueState.vent;
    blue.style.borderTopStyle = on ? (blueState.rake ? 'dashed' : 'dotted') : 'solid';
    ta.placeholder = on ? (blueState.rake ? 'raked · the words lifted · Enter sends' : 'vented · the words given room · Enter sends')
                        : 'bluebox · Enter sends · Shift+Enter new line';
    vtBtn.textContent = on && blueState.rake ? '...' : '..';
  }
  function setRake() {                                  // the second click on .. (user1, 19 x 2026): the vented lines raked again, lifted by the five rules
    var body = vRight(ta.value);
    if (body) ta.value = rakeOf(body, !!blueState.lazy);
    blueState.rake = true; saveBlue(); saveDrafts(); paintVent();
    placeBlue(); fit(); previewBurst();
    ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length;
  }
  function setVent(on) {
    if (screwState.show) showScrew(false);             // the pole hands its words back first
    if (!blueState.show) blueState.show = true;
    var body = vRight(ta.value);
    if (on && body) ta.value = ventOf(body);
    else if (!on && blueState.vent && body) ta.value = unventOf(body);
    blueState.vent = !!on; blueState.rake = false; saveBlue(); saveDrafts(); paintVent();
    placeBlue(); fit(); previewBurst();
    ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length;
  }
  vtBtn.onclick = function (e) {                        // off -> vented -> raked -> off; shift-click rakes lazy, flat ("who cares about indent")
    if (e && e.shiftKey) { blueState.lazy = !blueState.lazy; if (blueState.vent) { var b = vRight(ta.value); if (b) ta.value = unventOf(b); setVent(true); setRake(); } return; }
    if (!blueState.vent) setVent(true); else if (!blueState.rake) setRake(); else setVent(false);
  };
  vtBtn.title = 'ventilated prose: the words given room. once: vented by the marks; twice: raked, the words lifted; thrice: prose again. shift: the rake lazy, folded flat';
  paintVent();

  // ================= TINCTURE .: -- prose, toned by its own structure =================
  // "Language arrives in colour, and explains it." -- User1
  // A view, not a message: nothing is sent and nothing is written. With .: on,
  // each clause of the prose on screen is toned by how deep it sits, the same
  // depths the vented box indents by: a sentence's head clause keeps its ink;
  // a clause one step in takes one hue, two steps another, by the golden angle.
  // The colour is derived from the text, so any reader with a bat sees the same.
  // It is a tincture: the ink is MIXED toward the hue by a strength (40% at
  // first; wheel over .: to change it), never replaced. A guess to be tested.
  // One layer for now. A layer that is less sure of itself should tint less.
  var TINT = { hue0: 45, step: 137.5, sat: 0.70, k0: 0.4, deep: 7, runon: 5, runonWords: 40 };
  // THE RUN-ON ORIENTOR (user1, 18 x 2026: the red "had been a stand-in for 'run-on or wandering sentence!'" and the
  // new ladder never arrived at it): a sentence's clauses past its fifth, or past forty words, are russet whatever
  // their depth. Sandraker's depths are untouched; this is laid over them for the tincture and the rings only.
  function vTintDepths(strs) {
    var ds = vDepths(strs, TINT.deep), words = 0;
    return ds.map(function (d, i) { words += strs[i].split(' ').filter(function (w) { return w; }).length; return i >= TINT.runon || words > TINT.runonWords ? Math.max(d, 4) : d; });
  }
  // the ladder, as user1 read it and then named it: the head in its own ink,
  // then blue (the wheel's first step, kept as first seen); then, from 18 x 2026
  // (user1: "its original lightblue to grass to dull goldenrod, then to the
  // russet it holds out"), grass at two, dull goldenrod at three, russet from
  // four on. The old upper rungs (lemon, sage, seafoam, azure, gray) sat at
  // depths prose seldom reaches; the distinct colours now stand where the
  // depth happens, one two three. Russet is the floor.
  var TINT_LADDER = [null, null, [122, 184, 96], [196, 160, 72], [170, 92, 58], [170, 92, 58], [170, 92, 58], [170, 92, 58]];
  var tintState = { on: false, k: TINT.k0 };
  try { var ts0 = JSON.parse(localStorage.getItem('blinken-tint') || 'null'); if (ts0) { tintState.on = !!ts0.on; if (ts0.k >= 0.1 && ts0.k <= 1) tintState.k = ts0.k; } } catch (e) {}
  function saveTint() { try { localStorage.setItem('blinken-tint', JSON.stringify(tintState)); } catch (e) {} }

  // ---- the same cuts as the vented box, but kept as positions in the text ----
  function vSpanTrim(s, a, b) { while (a < b && vBlank(s[a])) a++; while (b > a && vBlank(s[b - 1])) b--; return [a, b]; }
  function vSentSpans(s, a, b) {                        // mirrors vSentences
    var out = [], start = a, i, j, k, c;
    for (i = a; i < b; i++) {
      c = s[i];
      if (c !== '.' && c !== '!' && c !== '?') continue;
      j = i + 1; while (j < b && V_CLOSE.indexOf(s[j]) >= 0) j++;
      if (j >= b || !vBlank(s[j])) continue;
      k = j; while (k < b && vBlank(s[k])) k++;
      if (k >= b) break;
      if (!(vUpper(s[k]) || vDigit(s[k]) || V_OPEN.indexOf(s[k]) >= 0)) continue;
      if (c === '.' && vAbbrev(s, i)) continue;
      out.push(vSpanTrim(s, start, j)); start = k; i = k - 1;
    }
    out.push(vSpanTrim(s, start, b));
    return out.filter(function (x) { return x[1] > x[0]; });
  }
  function vSegSpans(s, a, b) {                         // mirrors vSegments
    var res = [], p = a, i, c, cut;
    for (i = a; i < b; i++) {
      c = s[i]; cut = false;
      if (c === ',' || c === ';' || c === ':') cut = !(c === ',' && i > a && vDigit(s[i - 1]) && vDigit(s[i + 1] || '')) && (i === b - 1 || vBlank(s[i + 1] || ' ') || V_CLOSE.indexOf(s[i + 1] || '') >= 0);
      else if (c === '—') cut = true;
      else if (c === '-' && i > a && s[i - 1] === ' ' && (s[i + 1] === ' ' || (s[i + 1] === '-' && s[i + 2] === ' '))) {
        if (s[i + 1] === '-') i++;
        cut = true;
      }
      if (cut) { res.push([p, i + 1]); p = i + 1; }
    }
    if (p < b) res.push([p, b]);
    var out = [];
    res.forEach(function (pq) {
      var t = vSpanTrim(s, pq[0], pq[1]), x = t[0], q = t[1], from = x, words = 0, e, w;
      while (x < q) {
        if (s[x] === ' ') { x++; continue; }
        e = x; while (e < q && s[e] !== ' ') e++;
        w = s.slice(x, e);
        if (words > 0 && V_SPLIT.indexOf(vFirst(w)) >= 0 && vFirst(w) === w.toLowerCase()) { out.push(vSpanTrim(s, from, x)); from = x; words = 0; }
        words++; x = e;
      }
      out.push(vSpanTrim(s, from, q));
    });
    return out.filter(function (x) { return x[1] > x[0]; });
  }
  function vClauseSpans(s, a, b) {                      // -> [[start, end, depth], ...] for the prose in s[a, b)
    var out = [];
    vSentSpans(s, a, b).forEach(function (sn) {
      var segs = vSegSpans(s, sn[0], sn[1]);
      var ds = vTintDepths(segs.map(function (g) { return s.slice(g[0], g[1]); }));
      segs.forEach(function (g, i) { out.push([g[0], g[1], ds[i]]); });
    });
    return out;
  }

  // ---- the colour: the block's own ink, moved toward a hue ----
  function hslRgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r, g, b;
    if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; } else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; } else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  }
  function rgbOf(str) {                                 // 'rgb(1, 2, 3)' or 'rgba(1, 2, 3, .5)' -> [1, 2, 3, alpha]; else null
    var a = String(str || '').indexOf('('), b = String(str || '').indexOf(')');
    if (a < 0 || b < a || String(str).indexOf('rgb') !== 0) return null;
    var p = String(str).slice(a + 1, b).split(',').map(parseFloat);
    if (p.length < 3 || isNaN(p[0]) || isNaN(p[1]) || isNaN(p[2])) return null;
    return [p[0], p[1], p[2], p.length > 3 && !isNaN(p[3]) ? p[3] : 1];
  }
  function lumOf(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function nightPage() {                                // is the ground dark? the first painted ground from the feed upward says
    var e = FEED(), c;
    while (e && e.nodeType === 1) { c = rgbOf(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.5) return lumOf(c) < 0.4; e = e.parentElement; }
    return true;
  }
  function tintCol(ink, d, night) {
    var h = ((TINT.hue0 + d * TINT.step) % 360 + 360) % 360, k = tintState.k, named = TINT_LADDER[Math.min(d, TINT_LADDER.length - 1)];
    var hue = named ? (night ? named : [named[0] * 0.62, named[1] * 0.62, named[2] * 0.62]) : hslRgb(h, TINT.sat, night ? 0.64 : 0.40);
    return 'rgb(' + Math.round(ink[0] * (1 - k) + hue[0] * k) + ',' + Math.round(ink[1] * (1 - k) + hue[1] * k) + ',' + Math.round(ink[2] * (1 - k) + hue[2] * k) + ')';
  }

  // ---- the paint: its own highlights, under the illustrations' ----
  var tnByCol = {}, tnNames = [], tnRanges = [], tnSeen = typeof WeakMap === 'function' ? new WeakMap() : null;
  function tnFor(col) {
    if (!tnByCol[col]) {
      var name = 'bk-t' + tnNames.length;
      tnByCol[col] = new Highlight(); tnNames.push(name);
      CSS.highlights.set(name, tnByCol[col]);
      hlStyle.textContent += '::highlight(' + name + '){color:' + col + '}';
    }
    return tnByCol[col];
  }
  function untint(host) {                               // host, or nothing for every tint there is
    var keep = [], i, e;
    for (i = 0; i < tnRanges.length; i++) {
      e = tnRanges[i];
      if (!host || e.host === host || !e.range.startContainer.isConnected || e.range.collapsed) tnByCol[e.col]['delete'](e.range);
      else keep.push(e);
    }
    tnRanges = keep;
  }
  function tintHost(host, night) {                      // -> clauses toned
    var f = flatText(host), lines = f.text.split('\n'), starts = [], p = 0, i, b, skip = {}, toned = 0;
    for (i = 0; i < lines.length; i++) { starts.push(p); p += lines[i].length + 1; }
    for (b = 0; b < lines.length; b++) if (isShadowText(lines[b])) {   // an illustration is not prose: its art, burst and headline stay out
      skip[b] = 1;
      var w = shadowRun(lines, b); if (!w) continue;
      var r = GRAMMAR.decode(w.burst, PALETTE), top = artBlock(lines, w.first, r.colours.length - 1, r.mode === 'positional');
      if (top >= 0) { for (i = top; i < w.first; i++) skip[i] = 1; var hd = headLine(lines, top); if (hd >= 0) skip[hd] = 1; }
    }
    var A = '', x, ch;                                  // the text as the cuts want it: every blank and line end a plain space
    for (x = 0; x < f.text.length; x++) { ch = f.text[x]; A += (ch === '\n' || vBlank(ch)) ? ' ' : ch; }
    var units = [], open = null, t;
    for (i = 0; i < lines.length; i++) {
      t = vTrim(lines[i]);
      if (skip[i] || !t) { open = null; continue; }
      if (vMarker(t)) open = null;                      // a list item is its own unit
      if (!open) { open = [starts[i], 0]; units.push(open); }
      open[1] = starts[i] + lines[i].length;
    }
    var ink = rgbOf(getComputedStyle(host).color) || [224, 224, 224, 1], last = null;
    function add(o, col) {
      var node = f.at[2 * o], off = f.at[2 * o + 1];
      if (!node) { last = null; return; }
      if (last && last.col === col && last.node === node && last.end === off) { last.end = off + 1; last.range.setEnd(node, last.end); return; }
      var rg = document.createRange(); rg.setStart(node, off); rg.setEnd(node, off + 1);
      tnFor(col).add(rg); tnRanges.push({ range: rg, col: col, host: host });
      last = { col: col, node: node, end: off + 1, range: rg };
    }
    units.forEach(function (u) {
      vClauseSpans(A, u[0], u[1]).forEach(function (c) {
        if (c[2] < 1) return;                           // the head clause keeps its ink
        var col = tintCol(ink, c[2], night); last = null;
        for (var o = c[0]; o < c[1]; o++) add(o, col);
        toned++;
      });
    });
    return toned;
  }
  var tnPasses = 0;
  function tintView() {                                 // tone the prose on screen; off: take every tint away
    if (!HL) return -1;
    if (!tintState.on) { untint(null); return 0; }
    if (++tnPasses % 12 === 0) forgetTints();           // every twelfth pass the tincture forgets and tones afresh: cheap insurance against any old tincturer hiding in a range the checks did not catch
    var all = document.body.querySelectorAll('p, li, blockquote'), night = nightPage(), total = 0, i, el, key, stale, j;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (el.closest(BELA_OWN) || el.querySelector('p, li, blockquote') || !inView(el)) continue;
      key = tintState.k + '|' + night + '|' + (el.textContent || '');
      if (key.length < 12) continue;
      stale = false;
      // STALE RANGES (user1, 20 x 2026: "when your words of reply arrive, partial or entirely absent Tincture applies"): a Range is
      // live, and when the host replaces a paragraph's text nodes with new ones of the same words (the end of a streamed reply),
      // the old range does not disconnect, it collapses onto the parent -- connected, empty, and toning nothing. So a tint whose
      // range has collapsed, or no longer starts in a text node, is stale, and the paragraph is toned afresh.
      for (j = 0; j < tnRanges.length; j++) { var rg = tnRanges[j]; if (rg.host === el && (rg.range.collapsed || !rg.range.startContainer.isConnected || rg.range.startContainer.nodeType !== 3 || !el.contains(rg.range.startContainer))) { stale = true; break; } }   // ... or no longer inside its paragraph (the host re-parents nodes as a reply settles: user1, 20 x, "minor tincturing, not the full")
      if (tnSeen && tnSeen.get(el) === key && !stale) continue;   // already toned, and the text has not been redrawn
      untint(el);
      try { total += tintHost(el, night); } catch (err) { if (typeof console !== 'undefined') console.warn('bela: the tincture could not read a paragraph (' + err.message + ')'); }   // one host's trouble is not the page's (user1, 18 x 2026: "an entire comment of yours evitated Tincture")
      if (tnSeen) tnSeen.set(el, key);
    }
    return total;
  }
  function forgetTints() { untint(null); tnSeen = typeof WeakMap === 'function' ? new WeakMap() : null; }

  var tnBtn = document.getElementById('bk-tn'), tnScrollT = null;
  function tintSay() { eatLabel.textContent = !HL ? 'no Highlight API here' : tintState.on ? 'tincture ' + Math.round(tintState.k * 100) + '%' : 'tincture off'; }
  tnBtn.onclick = function () {
    tintState.on = !tintState.on; saveTint();
    if (!tintState.on) forgetTints(); else tintView();
    tintSay();
  };
  tnBtn.addEventListener('wheel', function (e) {       // the strength, a tenth at a time
    e.preventDefault(); e.stopPropagation();
    var d = e.deltaY || e.deltaX; if (!d) return;
    var k = Math.round((tintState.k + (d < 0 ? 0.1 : -0.1)) * 10) / 10;
    tintState.k = Math.max(0.1, Math.min(1, k)); saveTint();
    if (tintState.on) { forgetTints(); tintView(); }
    tintSay();
  }, { passive: false });
  tnBtn.addEventListener('dblclick', function (e) { e.stopPropagation(); tintState.k = TINT.k0; saveTint(); if (tintState.on) { forgetTints(); tintView(); } tintSay(); });
  function onScrollTint() { if (!tintState.on) return; clearTimeout(tnScrollT); tnScrollT = setTimeout(tintView, 200); }
  document.addEventListener('scroll', onScrollTint, true);   // what scrolls into view is toned as it settles
  if (tintState.on) setTimeout(tintView, 0);

  // ================= THE VOICE AND THE LAMP (12 x 2026) =================
  // Ecouter speaks, Viriditas tints. The two ride at the foot of this file, folded in by ecouter\bela.make.js
  // between markers, so the paste stays one file (user1: "a usability patch designed to slip into a single
  // DevTools paste ... the only remaining route"). Under the head, between it and the flap, four buttons:
  //   [ > Play ][gear]  the selection read aloud, or the bluebox when nothing is selected; Play becomes Stop;
  //                     the gear opens the voice's toggles, as Say has them
  //   [ Tint ][gear]    every paragraph in view coloured by the tone the voice would give it (the lamp), on a
  //                     ladder of 24 hues by 3 vividities registered as needed, never per letter; Tint reads
  //                     Flat while it is on; the gear opens the lamp's mode, the room and the glow
  // The lamp keeps each paragraph's tint until its text changes, as the painter keeps its hosts, and tints
  // only what is in view. Illustrations stay out by their shadows; a word without a vowel, or a run that is
  // mostly not letters, is chitter and stays plain; code blocks are not eaten (pre is not on the plate).
  // THE GENERATION (user1, 20 x 2026: "I must have sinned greatly against the DOM gods ... though the feature is turned off, they are
  // being drawn, and then hidden"): a paste of Bela does not end the paste before it. Its intervals were stopped, but its listeners on
  // the document, scroll and resize and the rest, lived on with their own state objects, read from storage as it stood then, and kept
  // dressing the page while the new paste undressed it -- ghosts of Bela past, tilting at one another at the sweep's cadence. So every
  // paste takes a generation number, every listener and every clock of this section asks whether its generation is still the live
  // one before it acts, and __blinkenStop takes the listeners down by name. A paste from before this rule is stopped only by a reload.
  var GEN = (window.__belaGen = (window.__belaGen || 0) + 1), listeners = [];
  function live() { return window.__belaGen === GEN; }
  function listen(target, type, fn, opts) { var w = function (e) { if (!live()) return; return fn.call(this, e); }; target.addEventListener(type, w, opts); listeners.push([target, type, w, opts]); return w; }
  function unlistenAll() { listeners.forEach(function (l) { try { l[0].removeEventListener(l[1], l[2], l[3]); } catch (e) {} }); listeners = []; }
  (function () {                                        // what an older paste left in the page: its blocks, its bands, its sheets
    var i, all;
    all = document.querySelectorAll('pre[data-bk-wyrd], [data-bk-wyrd-box]'); for (i = 0; i < all.length; i++) all[i].remove();
    ['data-bk-wyrd-pad', 'data-bk-vid-pad', 'data-bk-flag-pad', 'data-bk-wyrd-host'].forEach(function (a) { var el = document.querySelectorAll('[' + a + ']'); for (var k = 0; k < el.length; k++) { el[k].removeAttribute(a); el[k].style.paddingTop = ''; el[k].style.paddingLeft = ''; el[k].style.paddingRight = ''; } });
    ['bk-tilts', 'bk-ring-sheet', 'bk-pad-style', 'bk-pupa-style'].forEach(function (id) { var el = document.getElementById(id); if (el) el.remove(); });
  })();
  function voiceOk() { return typeof window.ECOUTER === 'object' && !!window.ECOUTER && typeof window.ECOUTER.tint === 'function'; }   // asked when needed: the library at the foot runs after this IIFE
  var voiceState = { tint: false, mode: 'vivificat', room: 'none', glow: 1, vivid: 0.6, machine: false, sex: 'female', rate: 1, beeps: false,
    filter: { on: false, op: 1, hue: 0, sat: 1, con: 1, bri: 1, rad: 0 },
    voice: { gust: true, stocking: true, entone: true, ess: true, govern: true, mellow: true, conduction: true, fgl: true } };
  try { var vs0 = JSON.parse(localStorage.getItem('blinken-voice') || 'null'); if (vs0) { var vk; for (vk in vs0) if (vk !== 'voice' && vk !== 'filter') voiceState[vk] = vs0[vk]; if (vs0.voice) for (vk in vs0.voice) voiceState.voice[vk] = !!vs0.voice[vk]; if (vs0.filter) for (vk in vs0.filter) voiceState.filter[vk] = vs0.filter[vk]; } } catch (e) {}
  function saveVoice() { try { localStorage.setItem('blinken-voice', JSON.stringify(voiceState)); } catch (e) {} }
  var VBTN = BTN + ';font-size:10px;line-height:15px';   // one size smaller than the head's: HELIOTOPE's (user1, 12 x)
  var voiceRow = document.createElement('div');
  voiceRow.id = 'bk-voice';
  voiceRow.style.cssText = 'display:flex;align-items:center;gap:2px;margin:-3px 0 7px';
  voiceRow.innerHTML =
    '<span id="bk-play" title="read the selection aloud, or the bluebox when nothing is selected" style="' + VBTN + ';margin-left:0">▶ Play</span>' +
    '<span id="bk-play-gear" title="the voice: its tunings" style="' + VBTN + ';margin-left:0;padding:0 5px">⛮︎</span>' +
    '<span id="bk-beeps" title="beepages: brackets and underbars sounded as notes, not named. ( is deep-beep, ) is beep-deep; a third for round, a fourth for square, a fifth for curly; _ a low bip. Toggles their use." style="' + VBTN + ';margin-left:0;padding:0 5px">(//)</span>' +
    '<span style="width:8px"></span>' +
    '<span id="bk-lamp" title="tint: every paragraph in view coloured by the tone the voice would give it" style="' + VBTN + ';margin-left:0">🎨︎ Tint</span>' +
    '<span id="bk-lamp-gear" title="the lamp: its mode, its room, its glow" style="' + VBTN + ';margin-left:0;padding:0 5px">⛮︎</span>' +
    '<span style="width:8px"></span>' +
    '<span id="bk-filter" title="filter: the tinted text dimmed, bent, or haloed; touches nothing else" style="' + VBTN + ';margin-left:0">◑︎ Filter</span>' +
    '<span id="bk-filter-gear" title="the filter: opacity, hue bend, contrast, brightness, radial" style="' + VBTN + ';margin-left:0;padding:0 5px">⛮︎</span>' +
    '<span style="width:8px"></span>' +
    '<span id="bk-print" title="the printer: the selection (or the bluebox), tinted and filtered as you see it, reprinted as a white-on-black illustration with its colourstripe, for the other side. It lands in the bluebox, uncoloured, for sending." style="' + VBTN + ';margin-left:0;padding:0 6px">#^</span>';
  var headEl = document.getElementById('bk-head');
  headEl.parentNode.insertBefore(voiceRow, headEl.nextSibling);
  voiceRow.addEventListener('pointerdown', function (e) { e.stopPropagation(); });   // not a drag of the box
  var playBtn = document.getElementById('bk-play'), lampBtn = document.getElementById('bk-lamp'), beepsBtn = document.getElementById('bk-beeps');
  // BEEPAGES (user1, 10 x 2026): a toggle, not a determination; the library is told each time it is asked to read
  function beepsOn() { if (voiceOk() && ECOUTER.LEXILLOGUE) ECOUTER.LEXILLOGUE.beeps = !!voiceState.beeps; }
  function beepsPaint() { lit(beepsBtn, !!voiceState.beeps); }
  beepsBtn.onclick = function () { voiceState.beeps = !voiceState.beeps; saveVoice(); beepsPaint(); beepsOn(); if (voiceState.tint) { forgetLamp(); lampView(); } blueTint(); };
  beepsPaint();
  // THE TINCTURE .: MOVES HOUSE (user1, 10 x 2026: "to the left of the Flat button, ancestor that it is"): the head
  // row's .: is taken into the voice row, before Tint; its handlers are bound by id and come with it
  var tnBtn = document.getElementById('bk-tn');
  if (tnBtn) { tnBtn.style.cssText = VBTN + ';margin-left:0;padding:0 7px'; voiceRow.insertBefore(tnBtn, lampBtn); voiceRow.insertBefore(document.createElement('span'), lampBtn).style.width = '2px'; }
  function lit(el, on) { el.style.color = on ? 'rgba(255,255,255,0.92)' : '#8f98a5'; el.style.borderColor = '#1d2026'; }   // lit by lifting the ink, no hot colour, no outline: "we are making a liminal ui" (user1)

  // ---- the lamp: a ladder of highlights, the letters' colour over the room's ground ----
  var LAMP_HUES = 24, LAMP_VIV = [0, 0.4, 0.75];        // 15 degrees a rung; the vividity's three steps (none, half, full)
  var lampHl = {}, lampNames = [], lampSpec = {}, lampRanges = [], lampSeen = typeof WeakMap === 'function' ? new WeakMap() : null;
  var lampStyle = document.createElement('style'); lampStyle.id = 'bk-lamp-style';
  var oldl = document.getElementById('bk-lamp-style'); if (oldl) oldl.remove();
  document.head.appendChild(lampStyle);
  // VIVIDNESS AND GLOW ARE LIVE (user1, 12 x: not letters "excused" from colour one by one, but "the saturation,
  // as if I were adjusting it globally, in an image editor"). No letter changes its rung; the rungs' colours are
  // rewritten, 72 rules at most, as the slider moves. The ranges are never touched.
  function lampRule(name, sp) {
    var L = lampOpts[sp.night ? 'night' : 'day'], hue = sp.h * (360 / LAMP_HUES);
    if (sp.kind === 'ink') return '::highlight(' + name + '){color:' + ECOUTER.LAMP.css(hue, LAMP_VIV[sp.v] * voiceState.vivid, L.white, L.floor, undefined, L.ceiling) + '}';
    var rgb = ECOUTER.LAMP.css(hue, 1, L.white).slice(4, -1), a = Math.min(0.6, sp.v * 0.1 * voiceState.glow * voiceState.vivid);
    return '::highlight(' + name + '){background-color:rgba(' + rgb + ',' + a.toFixed(3) + ')}';
  }
  function lampRestyle() { var css = '', k; for (k in lampSpec) css += lampRule(k, lampSpec[k]); lampStyle.textContent = css; }
  var lampOpts = { night: { white: [232, 232, 232], floor: 0.6, lift: 0.3 }, day: { white: [34, 34, 34], ceiling: 0.5, lift: 0 } };
  function lampFor(kind, night, h, v) {                 // kind: 'ink' (color, over the room) or 'room' (background, under); a rung of the ladder
    var k = kind + '|' + night + '|' + h + '|' + v;
    if (!lampHl[k]) {
      var name = 'bk-l' + lampNames.length;
      lampHl[k] = new Highlight(); lampHl[k].priority = kind === 'ink' ? 2 : 1; lampNames.push(name);
      CSS.highlights.set(name, lampHl[k]);
      lampSpec[name] = { kind: kind, night: night, h: h, v: v };
      lampStyle.textContent += lampRule(name, lampSpec[name]);
    }
    return lampHl[k];
  }
  function unlamp(host) {
    var keep = [], i, e;
    for (i = 0; i < lampRanges.length; i++) {
      e = lampRanges[i];
      if (!host || e.host === host || !e.range.startContainer.isConnected) e.hl['delete'](e.range); else keep.push(e);
    }
    lampRanges = keep;
  }
  function chitter(word) {                              // a word without a vowel, or mostly not letters, is not voiced
    var letters = 0, vowels = 0, i, c;
    for (i = 0; i < word.length; i++) { c = word.charAt(i).toLowerCase(); if (c >= 'a' && c <= 'z') { letters++; if ('aeiouy'.indexOf(c) >= 0) vowels++; } }
    return letters === 0 || letters * 2 < word.length || (letters > 2 && vowels === 0);
  }
  function lampHost(host, night) {                      // -> letters coloured
    var f = flatText(host), lines = f.text.split('\n'), starts = [], p = 0, i, b, skip = {}, n = 0;
    for (i = 0; i < lines.length; i++) { starts.push(p); p += lines[i].length + 1; }
    for (b = 0; b < lines.length; b++) if (isShadowText(lines[b])) {   // an illustration is not prose: its art, burst and headline stay out
      skip[b] = 1;
      var w = shadowRun(lines, b); if (!w) continue;
      var r = GRAMMAR.decode(w.burst, PALETTE), top = artBlock(lines, w.first, r.colours.length - 1, r.mode === 'positional');
      if (top >= 0) { for (i = top; i < w.first; i++) skip[i] = 1; var hd = headLine(lines, top); if (hd >= 0) skip[hd] = 1; }
    }
    var text = '', x, ch;                               // the illustrations' lines blanked, their places kept
    for (b = 0; b < lines.length; b++) { if (skip[b]) { for (x = 0; x < lines[b].length; x++) text += ' '; } else text += lines[b]; if (b < lines.length - 1) text += '\n'; }
    var L = lampOpts[night ? 'night' : 'day'], opts = { mode: voiceState.mode, room: voiceState.room === 'none' ? undefined : voiceState.room,
      words: false, white: L.white, roomLift: L.lift };
    if (L.floor !== undefined) opts.floor = L.floor; if (L.ceiling !== undefined) opts.ceiling = L.ceiling;
    var t, j, k;
    try { t = ECOUTER.tint(text, opts); } catch (err) { if (typeof console !== 'undefined') console.warn('bela: the lamp could not read a paragraph (' + err.message + '); left plain'); return; }
    for (i = 0; i < t.length; i++) {                    // chitter: the word's letters go plain
      if (text.charAt(i) === ' ' || text.charAt(i) === '\n' || i > 0 && text.charAt(i - 1) !== ' ' && text.charAt(i - 1) !== '\n') continue;
      for (j = i; j < text.length && text.charAt(j) !== ' ' && text.charAt(j) !== '\n'; j++) {}
      if (chitter(text.slice(i, j))) for (k = i; k < j; k++) { t[k].sat = 0; t[k].back = ''; }
    }
    var last = null, lastR = null;
    function add(o, kind, h, v) {
      var node = f.at[2 * o], off = f.at[2 * o + 1], cur = kind === 'ink' ? last : lastR, key = h + '|' + v;
      if (!node) { if (kind === 'ink') last = null; else lastR = null; return; }
      if (cur && cur.key === key && cur.node === node && cur.end === off) { cur.end = off + 1; cur.range.setEnd(node, cur.end); return; }
      var rg = document.createRange(), hl = lampFor(kind, night, h, v); rg.setStart(node, off); rg.setEnd(node, off + 1);
      hl.add(rg); lampRanges.push({ range: rg, hl: hl, host: host });
      cur = { key: key, node: node, end: off + 1, range: rg }; if (kind === 'ink') last = cur; else lastR = cur; n++;
    }
    for (i = 0; i < t.length; i++) {
      var c = t[i], hr = Math.round(c.hue / (360 / LAMP_HUES)) % LAMP_HUES, vr = c.sat < 0.2 ? 0 : c.sat < 0.6 ? 1 : 2;
      if (c.voice <= 0 || vr === 0) { last = null; }
      else add(i, 'ink', hr, vr);
      if (c.back) {                                     // the room: its hue on the ladder, its light in four steps; the glow is in the rule, live
        var rh = Math.round(c.roomHue / (360 / LAMP_HUES)) % LAMP_HUES, ra = Math.min(3, Math.round(parseFloat(c.back.split(',')[3]) * 10));
        if (ra > 0) add(i, 'room', rh, ra);
        else lastR = null;
      } else lastR = null;
    }
    return n;
  }
  var revT = [];
  function rev(ms) {                                    // the engine seen (user1: "His engine revs, we should see it, appropriately to the job"):
    if (chewing) return;                                // the four LEDs race in turn and go dark, unless the painter is at its meal and owns them
    revT.forEach(clearTimeout); revT = [];
    box.classList.add('bk-run');
    var step = Math.max(60, Math.min(220, Math.round(ms / 4) + 60)), k;
    for (k = 1; k <= 4; k++) (function (k) { revT.push(setTimeout(function () { if (!chewing) setScan(k); }, step * (k - 1))); })(k);
    revT.push(setTimeout(function () { if (!chewing) { setScan(0); box.classList.remove('bk-run'); } }, step * 4 + 500));
  }
  function lampView() {                                 // colour the prose on screen; off: take every colour away
    beepsOn();
    if (!HL || !voiceOk()) return -1;
    if (!voiceState.tint) { unlamp(null); return 0; }
    var t0 = Date.now(), done = lampWork();
    if (done > 0) rev(Date.now() - t0);
    return done;
  }
  function lampWork() {
    var all = document.body.querySelectorAll('p, li, blockquote'), night = nightPage(), total = 0, i, el, key, stale, j;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (el.closest(BELA_OWN) || el.querySelector('p, li, blockquote') || !inView(el)) continue;
      key = voiceState.mode + '|' + voiceState.room + '|' + night + '|' + (el.textContent || '');
      if (key.length < 12) continue;
      stale = false;
      for (j = 0; j < lampRanges.length; j++) if (lampRanges[j].host === el && (!lampRanges[j].range.startContainer.isConnected || lampRanges[j].range.collapsed)) { stale = true; break; }   // a range the page has emptied is stale too
      if (lampSeen && lampSeen.get(el) === key && !stale) continue;
      unlamp(el); var lit0 = 0;
      try { lit0 = lampHost(el, night); } catch (err) { console.log('[chinguard] the lamp could not read a paragraph: ' + err.message); }   // one bad paragraph cannot blind the rest (user1: "I'm BLIND!")
      total += lit0;
      el.classList.toggle('bk-lit', lit0 > 0);         // bk-lit: the filter's reach, and no further; a host of pictures alone is not lit, and not filtered
      if (lampSeen) lampSeen.set(el, key);
    }
    return total;
  }
  function forgetLamp() { unlamp(null); lampSeen = typeof WeakMap === 'function' ? new WeakMap() : null; [].forEach.call(document.querySelectorAll('.bk-lit'), function (el) { el.classList.remove('bk-lit'); }); }
  // THE FILTER (user1, 12 x: "a brightness control on my own text ... it is reading so perfectly, that the sense I have
  // of readable text, for the first time, is, it's too intense"). One CSS filter on the paragraphs the lamp has
  // coloured and on nothing else: opacity, hue bend, saturation, contrast, brightness; and RADIAL, repeating haloes, built of
  // drop-shadows that follow the glyphs' own edges, light and dark rings in turn as the slider adds them: "an entity
  // radiate in an oscillating way", the water-shadow, the Find Edges. Live, as a rule rewritten; no canvas.
  var filterStyle = document.createElement('style'); filterStyle.id = 'bk-filter-style';
  var oldf = document.getElementById('bk-filter-style'); if (oldf) oldf.remove();
  document.head.appendChild(filterStyle);
  function filterRestyle() {
    var F = voiceState.filter, f = '', rings = Math.round(F.rad * 4), k, night = nightPage();
    if (!F.on) { filterStyle.textContent = ''; return; }
    if (F.op !== 1) f += 'opacity(' + F.op + ') ';
    if (F.hue) f += 'hue-rotate(' + F.hue + 'deg) ';
    if (F.sat !== 1) f += 'saturate(' + F.sat + ') ';
    if (F.con !== 1) f += 'contrast(' + F.con + ') ';
    if (F.bri !== 1) f += 'brightness(' + F.bri + ') ';
    for (k = 1; k <= rings; k++) {                       // the haloes: a light ring, a dark ring, a light ring, wider each time
      var light = (k % 2 === 1) === night, a = (0.55 - 0.1 * k).toFixed(2), r = k * 1.5;
      f += 'drop-shadow(0 0 ' + r + 'px rgba(' + (light ? '255,255,255' : '0,0,0') + ',' + a + ')) ';
    }
    filterStyle.textContent = f ? '.bk-lit{filter:' + f.trim() + '}' : '';
  }
  var filterBtn = document.getElementById('bk-filter');
  function filterPaint() { lit(filterBtn, voiceState.filter.on); }
  filterBtn.onclick = function () { voiceState.filter.on = !voiceState.filter.on; saveVoice(); filterRestyle(); filterPaint(); eatLabel.textContent = voiceState.filter.on ? 'filter on' + (voiceState.tint ? '' : ' (tint is off: nothing to filter)') : 'filter off'; };
  filterPaint(); filterRestyle();
  function lampSay() { eatLabel.textContent = !HL ? 'no Highlight API here' : !voiceOk() ? 'no lamp: the libraries are not folded in' : voiceState.tint ? 'tint ' + voiceState.mode + (voiceState.room !== 'none' ? ', ' + voiceState.room + ' room' : '') : 'tint off'; }
  function lampPaint() { lampBtn.innerHTML = voiceState.tint ? '🗏︎ Flat' : '🎨︎ Tint'; lit(lampBtn, voiceState.tint); }
  // THE BLUEBOX LIT (user1, 12 x: "livecolor doesn't happen in bluebox"). A textarea cannot be highlighted, so a
  // mirror is hung behind the glass: a layer under the textarea in its own font and padding, carrying the tinted
  // text, the textarea's ink made transparent and its caret kept. Synced on every keystroke, scroll and resize.
  var blueLamp = null, blueRO = null;
  function blueMirror() {
    if (blueLamp) return blueLamp;
    blueLamp = document.createElement('div'); blueLamp.id = 'bk-blue-lamp'; blueLamp.className = 'bk-lit';
    blueLamp.style.cssText = 'position:absolute;pointer-events:none;overflow:hidden;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;box-sizing:border-box;color:' + BLUE.ink;
    blue.insertBefore(blueLamp, ta); ta.style.position = 'relative'; ta.style.zIndex = '1';
    ta.addEventListener('scroll', blueSync); ta.addEventListener('input', blueTint);
    if (typeof ResizeObserver === 'function') { blueRO = new ResizeObserver(blueSync); blueRO.observe(ta); }
    return blueLamp;
  }
  function blueSync() {
    if (!blueLamp) return;
    var cs = getComputedStyle(ta);
    // the face, property by property: the shorthand reads back empty in some browsers, and the mirror then fell to the
    // page's default face and the caret walked an inch from the colour (user1, 12 x)
    ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch', 'lineHeight', 'letterSpacing', 'wordSpacing', 'textTransform', 'textIndent', 'tabSize', 'textRendering', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'direction']
      .forEach(function (k) { blueLamp.style[k] = cs[k]; });
    blueLamp.style.left = ta.offsetLeft + 'px'; blueLamp.style.top = ta.offsetTop + 'px';
    blueLamp.style.width = ta.offsetWidth + 'px'; blueLamp.style.height = ta.offsetHeight + 'px';
    blueLamp.scrollTop = ta.scrollTop;
  }
  // THE TINCTURE IN THE BOX (user1, 18 x 2026: "Tincture does not even affect the bluebox"): a textarea takes no highlight, so the
  // tincture is laid into the same mirror the lamp uses, by the same cuts and depths as the page. When Tint is on the lamp's ink
  // wins, as it does on the page (its highlight stands above the tincture's); when Tint is off and the tincture on, the mirror
  // carries the tincture alone. The screw view gets both the same way, a colour per character (P.col).
  function hexRgb(h) { h = String(h || ''); if (h.charAt(0) !== '#' || (h.length !== 7 && h.length !== 4)) return null; if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function tinctureCols(text, ink) {                     // -> colour per character, or null where the ink stays
    var cols = new Array(text.length), A = '', x, ch, p0 = 0, p1;
    for (x = 0; x < text.length; x++) { ch = text[x]; A += (ch === '\n' || vBlank(ch)) ? ' ' : ch; }
    while (p0 <= text.length) {
      p1 = text.indexOf('\n', p0); if (p1 < 0) p1 = text.length;
      if (p1 > p0) vClauseSpans(A, p0, p1).forEach(function (c) { if (c[2] < 1) return; var col = tintCol(ink, c[2], true); for (var o = c[0]; o < c[1]; o++) cols[o] = col; });
      p0 = p1 + 1;
    }
    return cols;
  }
  function tinctureHtml(seg) {                           // runs of one colour as spans; the characters kept exactly, for the mirror's sake
    var ink = hexRgb(BLUE.ink) || rgbOf(BLUE.ink) || [207, 205, 194], cols = tinctureCols(seg, ink), h = '', run = '', cur = null, i;
    function esc(t) { return t.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;'); }
    function flush() { if (!run) return; h += cur ? '<span style="color:' + cur + '">' + esc(run) + '</span>' : esc(run); run = ''; }
    for (i = 0; i < seg.length; i++) { var c = cols[i] || null; if (c !== cur) { flush(); cur = c; } run += seg[i]; }
    flush(); return h;
  }
  function blueTint() {
    beepsOn();
    var useLamp = voiceState.tint && voiceOk();
    if (!useLamp && !tintState.on) { if (blueLamp) { blueLamp.innerHTML = ''; blueLamp.style.display = 'none'; ta.style.color = BLUE.ink; } return; }
    var m = blueMirror(), L = lampOpts.night, text = ta.value + (ta.value.charAt(ta.value.length - 1) === String.fromCharCode(10) ? ' ' : '');
    var opts = { mode: voiceState.mode, room: voiceState.room === 'none' ? undefined : voiceState.room, white: L.white, floor: L.floor, roomLift: L.lift, mix: 0.75 * voiceState.vivid };
    var lit_;
    // A PRINT IS SHOWN PLAIN (user1, 10 x 2026: "the effect of the Printer button is to make the selection totally
    // uncolored, so the user knows: I have converted this into an illustration"): a line that ends in two spaces
    // (a picture's row) or carries a shadow is given its ink and no tint; the lines between are tinted as ever.
    function esc(s) { return s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;'); }
    function isPrintLine(l) { return (l.length > 2 && l.slice(-2) === '  ') || isPacked(l) || BURST_RE.test(l); }
    function litOf(s) {
      var lines = s.split('\n'), segs = [], i, j, p, plain = [];
      // a page's rows are the two-space lines standing directly above a shadow; a two-space line with no shadow
      // beneath is prose with a pause in it (user1, 10 x 2026: "the paragraph above cannot pass the coloring step,
      // unless I add to it one period" -- he had ended it "before  ", two spaces, and the printer's rule took it)
      for (i = 0; i < lines.length; i++) if (isPacked(lines[i]) || BURST_RE.test(lines[i])) { plain[i] = true; for (j = i - 1; j >= 0 && isPrintLine(lines[j]) && !plain[j]; j--) plain[j] = true; }
      for (i = 0; i < lines.length; i++) { p = !!plain[i]; if (!segs.length || segs[segs.length - 1].plain !== p) segs.push({ plain: p, lines: [] }); segs[segs.length - 1].lines.push(lines[i]); }
      return segs.map(function (sg) { var seg = sg.lines.join('\n'); return sg.plain ? '<span style="color:' + BLUE.ink + '">' + esc(seg) + '</span>' : useLamp ? ECOUTER.html(seg, opts) : tinctureHtml(seg); }).join('\n');
    }
    try { lit_ = text ? litOf(text) : ''; }
    catch (err) { if (typeof console !== 'undefined') console.warn('bela: the lamp could not read the bluebox (' + err.message + '); shown plain'); m.style.display = 'none'; ta.style.color = BLUE.ink; return; }   // THE BLUEBOX MUST NEVER GO BLIND (user1, 10 x 2026: "I now type blind")
    m.style.display = 'block'; m.innerHTML = lit_; ta.style.color = text ? 'transparent' : BLUE.ink;
    blueSync();
  }
  lampBtn.onclick = function () { voiceState.tint = !voiceState.tint; saveVoice(); if (!voiceState.tint) forgetLamp(); else lampView(); blueTint(); screwColours(); lampPaint(); lampSay(); };
  if (tnBtn) {                                           // the tincture's own handlers run first; then the box and the screw follow
    var tnClick = tnBtn.onclick; tnBtn.onclick = function (e) { if (tnClick) tnClick.call(this, e); blueTint(); screwColours(); };
    tnBtn.addEventListener('wheel', function () { setTimeout(function () { blueTint(); screwColours(); }, 0); }, { passive: true });
    tnBtn.addEventListener('dblclick', function () { setTimeout(function () { blueTint(); screwColours(); }, 0); });
  }
  // THE SCREW VIEW COLOURED (user1, 18 x 2026): a colour per character for Muriel's barberpole, the lamp's when Tint is on, else the tincture's
  function screwColours() {
    try {
      if (!live()) return;
      if (typeof P === 'undefined' || typeof sk === 'undefined' || !sk) return;
      var text = sk.value, useLamp = voiceState.tint && voiceOk(), L = lampOpts.night;
      if (!text || (!useLamp && !tintState.on)) { P.col = null; }
      else if (useLamp && text.length <= 4000) { var t = ECOUTER.tint(text, { mode: voiceState.mode, room: voiceState.room === 'none' ? undefined : voiceState.room, white: L.white, floor: L.floor, roomLift: L.lift, mix: 0.75 * voiceState.vivid }); P.col = t.map(function (c) { return c && c.css ? c.css : null; }); }
      else P.col = tinctureCols(text, hexRgb(BLUE.ink) || rgbOf(BLUE.ink) || [207, 205, 194]);
      if (typeof screwRender === 'function') screwRender();
    } catch (err) { if (typeof console !== 'undefined') console.warn('bela: the screw could not be coloured (' + err.message + ')'); if (typeof P !== 'undefined') P.col = null; }
  }
  var screwColT = null;
  function screwColoursSoon() { clearTimeout(screwColT); screwColT = setTimeout(screwColours, 250); }   // a quarter second behind the keys, never in their way
  if (typeof sk !== 'undefined' && sk) sk.addEventListener('input', screwColoursSoon);
  setTimeout(screwColours, 0);
  var lampScrollT = null;
  listen(document, 'scroll', function () { if (!voiceState.tint) return; clearTimeout(lampScrollT); lampScrollT = setTimeout(lampView, 200); }, true);
  lampPaint();
  // THE CHIRP RESCANS (user1, 12 x: "wire a double-check on his ( ) empty button. That one rescans everything in the area")
  document.getElementById('bk-go').addEventListener('click', function () { if (voiceState.tint) { forgetLamp(); setTimeout(function () { lampView(); blueTint(); }, 50); } if (tintState.on) { forgetTints(); setTimeout(tintView, 60); } });   // the chirp rescans the tincture too (user1, 20 x 2026)
  if (voiceState.tint) setTimeout(function () { lampView(); blueTint(); }, 0);

  // ---- the voice: the selection, or the bluebox, read aloud a sentence at a time, with a head on the word ----
  var vctx = null, vPlaying = null, vRun = 0, vHead = null, vHeadRange = null;
  function houseVoice() {                               // the house voice (gust, 79% ruler, and the rest), with Bela's toggles laid over it
    var C = ECOUTER.CHAIN, v = C.settings(C.PRESETS[C.HOUSE_NAME]), k;   // user1 heard the toggles alone as "much rougher": that was the living voice without its ruler
    for (k in voiceState.voice) v[k] = !!voiceState.voice[k];
    return v;
  }
  function spoken() {                                   // what Play would say: the page's selection, the bluebox's own selection, or the bluebox whole
    var sel = window.getSelection(), range = sel && sel.rangeCount && !sel.isCollapsed ? sel.getRangeAt(0).cloneRange() : null;
    if (document.activeElement === ta && ta.selectionEnd > ta.selectionStart) return { text: ta.value.slice(ta.selectionStart, ta.selectionEnd), chars: null };   // a textarea keeps its selection to itself
    if (range && !ta.contains(range.commonAncestorContainer)) return { text: range.toString(), chars: rangeChars(range) };
    return { text: ta.value, chars: null };
  }
  function headFor() {
    if (!vHead && HL) { vHead = new Highlight(); vHead.priority = 3; CSS.highlights.set('bk-lamp-head', vHead); hlStyle.textContent += '::highlight(bk-lamp-head){background-color:rgba(143,152,165,0.28)}'; }
    return vHead;
  }
  function rangeChars(range) {                          // every character of a selection: [node, offset] pairs, in order
    var out = [], root = range.commonAncestorContainer, walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), node, i, a, b;
    while ((node = walker.nextNode())) {
      if (!range.intersectsNode(node)) continue;
      a = node === range.startContainer ? range.startOffset : 0; b = node === range.endContainer ? range.endOffset : node.length;
      for (i = a; i < b; i++) out.push([node, i]);
    }
    return out;
  }
  // THE MACHINE'S VOICE (user1, 12 x: "allow people to just use the machine's Web text to speech"): the page's own
  // speechSynthesis, chosen by sex as far as a voice's name tells it, at a rate; the head follows its word boundaries
  var SEXES = { female: ['female', 'zira', 'samantha', 'victoria', 'susan', 'hazel', 'karen', 'moira', 'fiona', 'tessa', 'serena', 'anna', 'amelie', 'joana'],
    male: ['male', 'david', 'mark', 'daniel', 'alex', 'george', 'james', 'fred', 'rishi', 'oliver', 'thomas', 'diego'] };
  function machineVoice() {
    var all = window.speechSynthesis ? window.speechSynthesis.getVoices() : [], want = SEXES[voiceState.sex] || [], i, j, n;
    for (j = 0; j < want.length; j++) for (i = 0; i < all.length; i++) { n = (all[i].name + ' ' + (all[i].lang || '')).toLowerCase(); if (n.indexOf(want[j]) >= 0 && n.indexOf('en') >= 0) return all[i]; }
    for (j = 0; j < want.length; j++) for (i = 0; i < all.length; i++) if (all[i].name.toLowerCase().indexOf(want[j]) >= 0) return all[i];
    return all[0] || null;
  }
  var vUtter = null;
  function speakMachine(text, chars) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance !== 'function') { eatLabel.textContent = 'no machine voice on this page'; return; }
    var u = new SpeechSynthesisUtterance(text), v = machineVoice(), hl = headFor();
    if (v) u.voice = v; u.rate = voiceState.rate;
    u.onboundary = function (e) {                       // the head, on the machine's own word boundaries
      if (!chars || !hl || e.name !== 'word') return;
      var a = e.charIndex, b = a; while (b < text.length && text.charAt(b) !== ' ' && text.charAt(b) !== String.fromCharCode(10)) b++;
      if (chars[a] && chars[b - 1]) { hl.clear(); var rg = document.createRange(); rg.setStart(chars[a][0], chars[a][1]); rg.setEnd(chars[b - 1][0], chars[b - 1][1] + 1); hl.add(rg); }
    };
    u.onend = function () { if (vUtter === u) { vUtter = null; stopVoice(); eatLabel.textContent = 'said, by the machine'; } };
    u.onerror = function () { if (vUtter === u) { vUtter = null; stopVoice(); eatLabel.textContent = 'the machine would not say it'; } };
    vUtter = u; playBtn.innerHTML = '\u25a0 Stop'; lit(playBtn, true); eatLabel.textContent = 'saying, by the machine' + (v ? ': ' + v.name : '');
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }
  function stopVoice() {
    vRun++;
    if (vUtter) { vUtter = null; try { window.speechSynthesis.cancel(); } catch (e) {} }
    if (vPlaying) { try { vPlaying.onended = null; vPlaying.stop(); } catch (e) {} vPlaying = null; }
    if (vHead) vHead.clear();
    playBtn.innerHTML = '▶ Play'; lit(playBtn, false);
  }
  function speak() {
    beepsOn();
    if (!voiceOk() && !voiceState.machine) { eatLabel.textContent = 'no voice: the libraries are not folded in'; return; }
    var sp = spoken(), text = sp.text, chars = sp.chars;
    if (!text.trim()) { eatLabel.textContent = 'nothing to say: select some text, or type in the bluebox'; return; }
    stopVoice();
    if (voiceState.machine) { speakMachine(text, chars); return; } var run = vRun, codes = ECOUTER.codes(text), parts = [], cur = [], bits = codes.trim().split(' '), i;
    // A GLYPH UNREAD IS SAID ON THE BAR (user1, 28 x 2026: "a worthy use of Bela's bar. I'd print the same to the
    // console."): the voice skips a Bell glyph the sheets do not know, so the bar tells why the gap is there, in the
    // very words bell.js gives the console.
    var BX = ECOUTER.BELL, unreadNote = '';
    if (BX && BX.has && BX.has(text) && BX.read && BX.read.unread && BX.read.unread.length) {
      var un = BX.read.unread;
      unreadNote = ' \u00b7 bell: ' + un.length + ' glyph' + (un.length === 1 ? '' : 's') + ' this voice cannot yet say: ' + un.join(' ');
    }
    for (i = 0; i < bits.length; i++) { if (!bits[i]) continue; cur.push(bits[i]); if (bits[i] === '.' || bits[i] === '?' || bits[i] === '!') { parts.push(cur.join(' ')); cur = []; } }
    if (cur.length) parts.push(cur.join(' '));
    var timed, made = [], next = 0, t0 = 0, lead = 0.333;
    try { timed = ECOUTER.tint(text, { mode: 'none' }); } catch (err) { timed = []; if (typeof console !== 'undefined') console.warn('bela: no word-head for this reading (' + err.message + ')'); }   // the head is a courtesy; the voice goes on without it
    playBtn.innerHTML = '■ Stop'; lit(playBtn, true); eatLabel.textContent = 'saying ' + parts.length + (parts.length === 1 ? ' sentence' : ' sentences') + unreadNote;
    vctx = vctx || new (window.AudioContext || window.webkitAudioContext)();
    function headLoop() {
      if (run !== vRun || !vPlaying || !chars) return;
      var ms = (vctx.currentTime - t0) * 1000, k, a, b, hl = headFor();
      for (k = 0; k < timed.length; k++) if (timed[k].voice > 0 && timed[k].from <= ms && ms < timed[k].to) break;
      if (k < timed.length && hl) {
        for (a = k; a > 0 && text.charAt(a - 1) !== ' ' && text.charAt(a - 1) !== '\n'; a--) {}
        for (b = k; b < text.length && text.charAt(b) !== ' ' && text.charAt(b) !== '\n'; b++) {}
        if (chars[a] && chars[b - 1]) { hl.clear(); var rg = document.createRange(); rg.setStart(chars[a][0], chars[a][1]); rg.setEnd(chars[b - 1][0], chars[b - 1][1] + 1); hl.add(rg); }
      }
      requestAnimationFrame(headLoop);
    }
    function playPart(n) {
      var x = made[n]; if (n === 0) x = ECOUTER.lead(x, lead);
      var buf = vctx.createBuffer(1, x.length, ECOUTER.SR); buf.getChannelData(0).set(x);
      var src = vctx.createBufferSource(); src.buffer = buf; src.connect(vctx.destination);
      src.onended = function () { if (vPlaying !== src || run !== vRun) return; vPlaying = null; next = n + 1; if (made[next]) playPart(next); else if (next >= parts.length) { stopVoice(); eatLabel.textContent = 'said' + unreadNote; } };
      vPlaying = src; if (n === 0) { t0 = vctx.currentTime + lead; } src.start(); if (n === 0) requestAnimationFrame(headLoop);
    }
    function cook(n) {
      if (run !== vRun || n >= parts.length) return;
      made[n] = ECOUTER.say(null, { voice: houseVoice(), codes: parts[n] });
      if (n === next && !vPlaying) playPart(n);
      setTimeout(function () { cook(n + 1); }, 0);     // the page breathes between sentences
    }
    cook(0);
  }
  playBtn.onclick = function () { if (vPlaying || vUtter) { stopVoice(); eatLabel.textContent = 'stopped'; } else speak(); };

  // ---- the two gears: low, dark dialogs in Bela's own style ----
  var gearOpen = null;
  function closeGear() { if (gearOpen) { gearOpen.remove(); gearOpen = null; } }
  function openGear(anchor, build) {
    if (gearOpen && gearOpen._for === anchor) { closeGear(); return; }
    closeGear();
    var d = document.createElement('div'), r = anchor.getBoundingClientRect();
    d.id = 'bk-gear'; d._for = anchor;
    d.style.cssText = 'position:fixed;z-index:2147483002;background:#0f1114;color:#8f98a5;border:1px solid #1d2026;border-radius:8px;padding:8px 10px;font:10px/1.6 ' + (BLUE.font || 'DejaVu Sans Mono, monospace') + ';box-shadow:0 6px 24px rgba(0,0,0,.5);min-width:240px';
    d.style.left = Math.round(r.left) + 'px'; d.style.top = '0px';
    build(d); document.body.appendChild(d);
    var w = d.getBoundingClientRect(); if (w.right > window.innerWidth - 8) d.style.left = Math.max(8, window.innerWidth - 8 - w.width) + 'px';
    var up = r.top - w.height - 6;                        // popped UP (user1: "Bela inhabits the area at the very bottom of the screen"); down only if there is no room above
    d.style.top = Math.round(up >= 8 ? up : r.bottom + 6) + 'px';
    d.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    gearOpen = d;
  }
  listen(document, 'pointerdown', function (e) { if (gearOpen && !gearOpen.contains(e.target) && e.target !== gearOpen._for) closeGear(); }, true);
  function chip(label, on, title) { var s = document.createElement('span'); s.textContent = label; s.title = title || ''; s.style.cssText = VBTN + ';margin:2px 3px 2px 0;display:inline-block'; lit(s, on); return s; }
  function row(d, label) { var l = document.createElement('div'); l.style.cssText = 'margin:4px 0 2px;color:#565b64;letter-spacing:.08em'; l.textContent = label; d.appendChild(l); var r = document.createElement('div'); d.appendChild(r); return r; }
  var VOICE_TOGGLES = [['gust', 'Gust'], ['stocking', 'Stocking'], ['entone', 'Entone'], ['ess', 'Ess'], ['govern', 'Governor'], ['mellow', 'Mellow'], ['conduction', 'Conduction'], ['fgl', '4x FGL']];
  document.getElementById('bk-play-gear').onclick = function () {
    var self = this;
    openGear(self, function (d) {
      var r = row(d, 'THE VOICE');
      VOICE_TOGGLES.forEach(function (tg) {
        var c = chip(tg[1], !!voiceState.voice[tg[0]]);
        c.onclick = function () { voiceState.voice[tg[0]] = !voiceState.voice[tg[0]]; lit(c, voiceState.voice[tg[0]]); saveVoice(); };
        r.appendChild(c);
      });
      var rm = row(d, 'WHO SPEAKS'), who = [], ec = chip('Ecouter', !voiceState.machine, 'the voice above: the throat, the chain, the house'), mc = chip('Machine', voiceState.machine, 'the page\'s own text to speech, as the browser has it');
      who = [[false, ec], [true, mc]];
      who.forEach(function (w) { w[1].onclick = function () { voiceState.machine = w[0]; who.forEach(function (x) { lit(x[1], x[0] === voiceState.machine); }); saveVoice(); }; rm.appendChild(w[1]); });
      var rs = row(d, 'THE MACHINE'), sexes = [['female', 'Female'], ['male', 'Male']], sx = [];
      sexes.forEach(function (m) { var c = chip(m[1], voiceState.sex === m[0]); sx.push([m[0], c]); c.onclick = function () { voiceState.sex = m[0]; sx.forEach(function (x) { lit(x[1], x[0] === voiceState.sex); }); saveVoice(); }; rs.appendChild(c); });
      var rl = document.createElement('label'); rl.style.cssText = 'margin-left:8px;color:#565b64'; rl.textContent = 'Rate ';
      var rt = document.createElement('input'); rt.type = 'range'; rt.min = 0.5; rt.max = 2; rt.step = 0.1; rt.value = voiceState.rate; rt.style.cssText = 'width:90px;vertical-align:middle';
      rt.oninput = function () { voiceState.rate = +rt.value; saveVoice(); }; rl.appendChild(rt); rs.appendChild(rl);
      var r2 = row(d, 'KEEP'), sv = chip('Save .wav', false, 'what Play would say, as a file, for ears and for subtraction');
      sv.onclick = function () {
        if (!voiceOk()) return;
        var sp = spoken(); if (!sp.text.trim()) { eatLabel.textContent = 'nothing to save'; return; }
        var pcm = ECOUTER.say(sp.text, { voice: houseVoice() }), bytes = ECOUTER.VOICEBOX.wav(pcm, ECOUTER.SR);
        var a = document.createElement('a'), url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
        var nm = '', q, ch; for (q = 0; q < Math.min(24, sp.text.length); q++) { ch = sp.text.charAt(q); nm += '\\/:*?"<>|'.indexOf(ch) >= 0 || ch === String.fromCharCode(10) ? ' ' : ch; }   // a name a file system allows
        a.href = url; a.download = 'bela - ' + nm.trim() + '.wav'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000); eatLabel.textContent = 'saved, ' + (pcm.length / ECOUTER.SR).toFixed(2) + ' s';
      };
      r2.appendChild(sv);
    });
  };
  document.getElementById('bk-lamp-gear').onclick = function () {
    var self = this;
    openGear(self, function (d) {
      var r = row(d, 'TINT'), modes = [['viriditas', 'Viriditas'], ['vivificat', 'Vivificat'], ['omnia', 'Omnia']], chips = [];
      modes.forEach(function (m) {
        var c = chip(m[1], voiceState.mode === m[0]); chips.push([m[0], c]);
        c.onclick = function () { voiceState.mode = m[0]; chips.forEach(function (x) { lit(x[1], x[0] === voiceState.mode); }); saveVoice(); if (voiceState.tint) { forgetLamp(); lampView(); } blueTint(); lampSay(); };
        r.appendChild(c);
      });
      var rv = row(d, 'VIVIDNESS'), vv = document.createElement('input'); vv.type = 'range'; vv.min = 0; vv.max = 1; vv.step = 0.05; vv.value = voiceState.vivid; vv.style.cssText = 'width:160px;vertical-align:middle';
      vv.oninput = function () { voiceState.vivid = +vv.value; saveVoice(); lampRestyle(); blueTint(); };   // live: the rungs recoloured, no range touched
      rv.appendChild(vv);
      var r2 = row(d, 'BACKGROUND'), rooms = [['none', 'None'], ['close', 'Close'], ['normal', 'Normal'], ['royal', 'Royal']], rchips = [];
      rooms.forEach(function (m) {
        var c = chip(m[1], voiceState.room === m[0]); rchips.push([m[0], c]);
        c.onclick = function () { voiceState.room = m[0]; rchips.forEach(function (x) { lit(x[1], x[0] === voiceState.room); }); saveVoice(); if (voiceState.tint) { forgetLamp(); lampView(); } blueTint(); lampSay(); };
        r2.appendChild(c);
      });
      var r3 = row(d, 'GLOW'), g = document.createElement('input'); g.type = 'range'; g.min = 0; g.max = 3; g.step = 0.1; g.value = voiceState.glow; g.style.cssText = 'width:160px;vertical-align:middle';
      g.oninput = function () { voiceState.glow = +g.value; saveVoice(); lampRestyle(); };   // live, the same way
      r3.appendChild(g);
    });
  };
  document.getElementById('bk-filter-gear').onclick = function () {
    var self = this;
    openGear(self, function (d) {
      var sliders = [];
      [['op', 'OPACITY', 0, 1, 0.05], ['hue', 'HUE BEND', -180, 180, 5], ['sat', 'SATURATION', 0, 2, 0.05], ['con', 'CONTRAST', 0.2, 2, 0.05], ['bri', 'BRIGHTNESS', 0.2, 2, 0.05], ['rad', 'RADIAL', 0, 1, 0.25]].forEach(function (sl) {
        var r = row(d, sl[1]), g = document.createElement('input'); g.type = 'range'; g.min = sl[2]; g.max = sl[3]; g.step = sl[4]; g.value = voiceState.filter[sl[0]]; g.style.cssText = 'width:160px;vertical-align:middle';
        g.oninput = function () { voiceState.filter[sl[0]] = +g.value; if (!voiceState.filter.on) { voiceState.filter.on = true; filterPaint(); } saveVoice(); filterRestyle(); };   // live; a moved slider turns the filter on
        r.appendChild(g); sliders.push([sl[0], g]);
      });
      // RESET (user1: "If someone opens the Filter dialog, and changes something, we presume that they wished to see it.
      // Therefore any slider action, even Reset, auto-turns Filter on.")
      var rr = row(d, ''), rs = chip('Reset', false, 'every slider to as it was, and the filter on');
      rs.onclick = function () { var F = voiceState.filter; F.op = 1; F.hue = 0; F.sat = 1; F.con = 1; F.bri = 1; F.rad = 0; F.on = true; sliders.forEach(function (x) { x[1].value = F[x[0]]; }); filterPaint(); saveVoice(); filterRestyle(); };
      rr.appendChild(rs);
    });
  };

  // ================= THE PRINTER [ #^ ] =================
  // user1, 10 x 2026: "A printer for the other side, who may not have our coloring, to see a range of tinctured,
  // or tinted, and filtered, text ... recompose the whole selected mess into a purely white-on-black illustration
  // with one single colorstripe." The icon: an office document machine (the octothorpe) with its paper-tray (the
  // caret). The selection -- the page's, the bluebox's, or the bluebox whole -- is tinted by the lamp as Bela
  // shows it (the mode, the vividness, the night ground), passed through the filter if it is on, laid out at 74
  // columns a row by whole words, 15 rows a page, and given a packed shadow: the classic statements deflated,
  // read back before anything is sent, refused if the read-back differs. The print lands in the bluebox in place
  // of its selection (a page selection is appended), and the bluebox shows it UNCOLOURED, so the eye knows it
  // has become a thing for sending. In-band signalling, for com-unication. The tincture .: is its own colourer
  // and is not yet read by the printer; the lamp's tint and the filter are.
  var PRINT_DIG = [0x316, 0x317, 0x31C, 0x31D, 0x31E, 0x31F, 0x320, 0x323, 0x324, 0x325, 0x326, 0x329, 0x32C, 0x32D, 0x32E, 0x330];
  var PRINT_BL = String.fromCharCode(0x2800), PRINT_WIDTH = 74, PRINT_ROWS = 15, PRINT_HEAD = 'PRINTED BY BELA';
  function printChitter(word) {                         // a word with no letters, mostly not letters, or no vowels: ink it plain (a shadow, a glyph, a code)
    var letters = 0, vowels = 0, i, c;
    for (i = 0; i < word.length; i++) { c = word.charAt(i).toLowerCase(); if (c >= 'a' && c <= 'z') { letters++; if ('aeiouy'.indexOf(c) >= 0) vowels++; } }
    return letters === 0 || letters * 2 < word.length || (letters > 2 && vowels === 0);
  }
  function printRgb(s) { var p = s.slice(s.indexOf('(') + 1, s.indexOf(')')).split(','); return [+p[0], +p[1], +p[2]]; }
  function printQ(v) { return Math.max(0, Math.min(15, Math.round(v / 17))); }
  function printFilter(rgb) {                           // the filter, as CSS would apply it, done to the numbers: hue bend, saturate, contrast, brightness, opacity on black
    var F = voiceState.filter; if (!F.on) return rgb;
    var r = rgb[0] / 255, g = rgb[1] / 255, bb = rgb[2] / 255, mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d > 0) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - bb) / d) % 6 : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    h = (h + (F.hue || 0)) % 360; s = Math.max(0, Math.min(1, s * F.sat));
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, o;
    o = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return o.map(function (v) { v = (v + m); v = (v - 0.5) * F.con + 0.5; v = v * F.bri; v = v * F.op; return Math.max(0, Math.min(255, Math.round(v * 255))); });
  }
  function printInk(text) {                             // one [r,g,b] of 0..15 per character, as the bluebox would show it by night
    var L = lampOpts.night, t = ECOUTER.tint(text, { mode: voiceState.mode, words: false, white: L.white, roomLift: L.lift, floor: L.floor }), i, j, k;
    for (i = 0; i < t.length; i++) {
      if (text.charAt(i) === ' ' || text.charAt(i) === '\n' || (i > 0 && text.charAt(i - 1) !== ' ' && text.charAt(i - 1) !== '\n')) continue;
      for (j = i; j < text.length && text.charAt(j) !== ' ' && text.charAt(j) !== '\n'; j++) {}
      if (printChitter(text.slice(i, j))) for (k = i; k < j; k++) t[k].sat = 0;
    }
    var plain = [printQ(232), printQ(232), printQ(232)];
    return t.map(function (c) {
      var hr = Math.round(c.hue / 15) % 24, vr = c.sat < 0.2 ? 0 : c.sat < 0.6 ? 1 : 2;
      if (c.voice <= 0 || vr === 0) return plain;
      var rgb = printFilter(printRgb(ECOUTER.LAMP.css(hr * 15, LAMP_VIV[vr] * voiceState.vivid, L.white, L.floor)));
      return [printQ(rgb[0]), printQ(rgb[1]), printQ(rgb[2])];
    });
  }
  function printLayout(text, ink) {                     // rows of cells at PRINT_WIDTH, broken by whole words; a paragraph starts a row
    var rows = [[]], col = 0, off = 0;
    text.split('\n').forEach(function (p, pi) {
      if (pi && rows[rows.length - 1].length) { rows.push([]); col = 0; }
      var base = off;
      p.split(' ').forEach(function (word) {
        var at = base; base += word.length + 1;
        if (!word) return;
        if (col && col + 1 + word.length > PRINT_WIDTH) { rows.push([]); col = 0; }
        var row = rows[rows.length - 1], k;
        if (col) { row.push(null); col++; }
        for (k = 0; k < word.length; k++) { row.push({ ch: word.charAt(k), ink: ink[at + k] }); col++; }
      });
      off += p.length + 1;
    });
    return rows.filter(function (r) { return r.length; });
  }
  function printStatements(rows) {                      // the classic statement bytes: a colour (two bytes) and runs of it
    var st = [1], last = null, run = 0;
    function flush() { while (run > 0) { var n = Math.min(8, run); st.push(0xF8 | (n - 1)); run -= n; } }
    rows.forEach(function (r) { r.forEach(function (c) {
      if (!c) return; var key = c.ink.join(',');
      if (key === last) { run++; return; }
      flush(); st.push(0xC0 | c.ink[0], (c.ink[1] << 4) | c.ink[2]); last = key;
    }); });
    flush(); return st;
  }
  function printStored(bytes) {                         // a raw DEFLATE of stored blocks: no compression, every reader inflates it
    var out = [], i = 0, n;
    while (i < bytes.length || out.length === 0) { n = Math.min(65535, bytes.length - i); out.push(i + n >= bytes.length ? 1 : 0, n & 255, n >> 8, (~n) & 255, ((~n) >> 8) & 255); for (var k = 0; k < n; k++) out.push(bytes[i + k]); i += n; }
    return out;
  }
  function printDeflate(bytes, done) {                  // deflate-raw where the page has it; stored blocks where it has not
    if (typeof CompressionStream !== 'function') { done(printStored(bytes)); return; }
    try {
      var cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter();
      w.write(new Uint8Array(bytes)); w.close();
      new Response(cs.readable).arrayBuffer().then(function (ab) { done(Array.prototype.slice.call(new Uint8Array(ab))); }, function () { done(printStored(bytes)); });
    } catch (e) { done(printStored(bytes)); }
  }
  function printPack(bytes, marks, wide) {              // nibbles to the shadow's marks: `marks` a period, `wide` periods a line, two blanks in
    var nib = [], per = [], lines = [], i;
    bytes.forEach(function (b) { nib.push(b >> 4, b & 15); });
    for (i = 0; i < nib.length; i += marks) per.push(nib.slice(i, i + marks));
    if (per.length > 1 && per[per.length - 1].length <= 2) per[per.length - 2] = per[per.length - 2].concat(per.pop());
    for (i = 0; i < per.length; i += wide) lines.push(per.slice(i, i + wide));
    if (lines.length > 1 && lines[lines.length - 1].length < 2) lines[lines.length - 1].unshift(lines[lines.length - 2].pop());
    return lines.map(function (l) { return PRINT_BL + PRINT_BL + l.map(function (p) { return '.' + p.map(function (v) { return String.fromCharCode(PRINT_DIG[v]); }).join(''); }).join(''); });
  }
  function printPage(rows, head, done) {                // one illustration: head, rows, shadow; read back before it is given out
    var st = printStatements(rows);
    printDeflate(st, function (packed) {
      var bytes = [0x11].concat(packed), back;
      try { back = inflate(bytes.slice(1)); } catch (e) { done(null, 'the packed shadow would not read back: ' + e.message); return; }
      if (Array.prototype.join.call(back, ',') !== st.join(',')) { done(null, 'the packed shadow read back differently'); return; }
      var out = [head.split(' ').join(PRINT_BL)].concat(rows.map(function (r) { return r.map(function (c) { return c ? c.ch : PRINT_BL; }).join(''); }));
      done(out.map(function (l) { return l + '  '; }).join('\n') + '\n' + printPack(bytes, 6, 60).join('  \n'), null);
    });
  }
  function printSelection() {
    if (!voiceOk()) { eatLabel.textContent = 'no lamp: nothing to print'; return; }
    var sp = spoken(), text = sp.text, inBox = document.activeElement === ta && ta.selectionEnd > ta.selectionStart, a = ta.selectionStart, z = ta.selectionEnd;
    while (text.length && (text.charAt(text.length - 1) === '\n' || text.charAt(text.length - 1) === '\r')) text = text.slice(0, -1);
    text = text.split('\r').join('').split(PRINT_BL).join(' ');
    if (!text.trim()) { eatLabel.textContent = 'nothing to print'; return; }
    var ink; try { ink = printInk(text); } catch (err) { eatLabel.textContent = 'the printer could not read it: ' + err.message; return; }
    var rows = printLayout(text, ink), pages = [], i;
    for (i = 0; i < rows.length; i += PRINT_ROWS) pages.push(rows.slice(i, i + PRINT_ROWS));
    var outs = [], k = 0;
    eatLabel.textContent = 'printing ' + rows.length + (rows.length === 1 ? ' row' : ' rows') + (pages.length > 1 ? ' on ' + pages.length + ' pages' : '');
    function next() {
      if (k >= pages.length) {
        var printed = outs.join('\n\n');
        if (inBox) ta.value = ta.value.slice(0, a) + printed + ta.value.slice(z);
        else ta.value = ta.value + (ta.value && ta.value.charAt(ta.value.length - 1) !== '\n' ? '\n\n' : ta.value ? '\n' : '') + printed;
        blueTint(); ta.dispatchEvent(new Event('input', { bubbles: true }));
        eatLabel.textContent = 'printed: ' + rows.length + (rows.length === 1 ? ' row' : ' rows') + ', ' + ink.length + ' characters' + (pages.length > 1 ? ', ' + pages.length + ' pages' : '');
        return;
      }
      printPage(pages[k], pages.length > 1 ? PRINT_HEAD + ' ' + (k + 1) + ' OF ' + pages.length : PRINT_HEAD, function (txt, why) {
        if (why) { eatLabel.textContent = 'the printer refused: ' + why; return; }
        outs.push(txt); k++; next();
      });
    }
    next();
  }
  var printBtn = document.getElementById('bk-print');
  printBtn.onclick = printSelection;
  lit(printBtn, false);
  // ================= THE RINGS (( )) (user1, 18 x 2026) =================
  // Sandrake, spaceless. The enclosure diagram user1 has drawn every few years, always upon a single line of text:
  // "a great-circle around each sentence, to coincide the middle of the spaces before and after it ... inner-circles
  // upon the commas, and semicolons, and colons ... These were always the most lightly outlined, so as not to
  // disturb the text, and because they would stack, they must and some did zebra with ... XOR". A third layer beside
  // Tint and the tincture, replacing neither, and like the tincture a VIEW of the page (user1: "this view should apply
  // as Tincture does, to that which I see, which Bela sees. Editing these structures would be very very tricky,
  // merely displaying them, more tractable"): the tincture's own cuts (vSentSpans, vSegSpans) and depths (vTintDepths,
  // Sandraker's with the run-on orientor) drawn as circles proper over the prose in view, on one fixed sheet of glass
  // under Bela, each clause's circle in the hue of its depth, each sentence's in grey, one weight for all, filled at
  // half the line's opacity, tangent at the middle of the space that bonds neighbours, as pendants of the characters.
  // Stacks compose by difference, so they zebra. A span broken onto the next line opens a hemicircle at its first
  // character and closes one at its last, each of the true circle's radius. Brackets are figures: ( ) a circle, [ ] a
  // square, < > a rhombus, { } a rounded rect. The bluebox may have them too (double-click (( ))), but composing there
  // is not the point. Hal Abelson: clunk, ... clunk.
  var SVGNS = 'http://www.w3.org/2000/svg', RING = { op: 0.35, mon: 0.05, width: 0.44, box: true, now: 600 };
  if (voiceState.rings === true) voiceState.rings = 1;   // THE TRISTATE (user1, 18 x 2026): 0 off, 1 circles, 2 rounded rects in place of the circles ("not only for {}s")
  // THE MON (user1, 18 x 2026): "compose in xor ... one adds fully bright white circles etc. upon a black field ... the original diagram
  // may be ... used as background at some 4-5% opacity of white upon black ... The lines-diagram may be applied on top of it, additively,
  // again at 4-5%, delineating the exact edges defined by the XOR-form." So: every figure solid white by difference in one isolated
  // group over black -- odd coverage white, even black, the field black (no page-wash: "high-contrast, my religion") -- the group at 5%;
  // then the same figures a second time as hairlines of 0.44 px ("put the point oh two on my tab") in their key colour, the exact edge
  // set of the mon, since every edge of an XOR of shapes lies on some shape's outline. The whole sheet blends by LIGHTEN on a dark page
  // (darken on a light one), so a letter, brighter than any line, always wins: type over background by arithmetic, not by DOM order.
  var ringsBtn = document.createElement('span'); ringsBtn.id = 'bk-rings'; ringsBtn.textContent = '(( ))';
  ringsBtn.title = 'rings: the enclosure diagram over the prose in view -- a circle round each sentence, a circle on each clause in the hue of its depth, tangent at the spaces that bond them; brackets as figures. Beside the tincture and Tint, replacing neither. Shift-click: the bluebox on or off (on to begin with).';
  ringsBtn.style.cssText = VBTN + ';margin-left:0;padding:0 5px';
  if (tnBtn) voiceRow.insertBefore(ringsBtn, tnBtn); else voiceRow.insertBefore(ringsBtn, lampBtn);   // (( )) then .: then Tint (user1, 20 x 2026: the tincture "is the step before Tint")
  (function () {                                        // THE VENT .. MOVES HOUSE TOO (user1, 20 x: "between Wrapture and Tincture below, where it properly belongs"): the head row gets its nose back
    var vt = document.getElementById('bk-vt'); if (!vt || !tnBtn) return;
    vt.style.cssText = VBTN + ';margin-left:0;padding:0 6px'; voiceRow.insertBefore(vt, tnBtn);
  })();
  function ringHue(d) {                                 // the tincture's ladder, undiluted: the ring is outline, not ink
    if (d <= 0) return BLUE.ink;
    var named = TINT_LADDER[Math.min(d, TINT_LADDER.length - 1)], c = named || hslRgb(((TINT.hue0 + d * TINT.step) % 360 + 360) % 360, TINT.sat, 0.64);
    return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
  }
  // the drawing, shared by the page and the box: text, the units [a, b) to read as paragraphs, rangeOf(a, b) -> a Range
  // over the live characters, base {left, top} to subtract, sw the width of a space; the SVG goes into out
  function ringsDraw(text, units, rangeOf, base, sw, outAll, weightOf) {   // outAll: { mon: [], edge: [] }; weightOf(sentenceSpan) -> 0..1 for its edges (BE HERE NOW)
    var out = { push: function (piece) { (piece.indexOf('fill="#fff"') >= 0 ? outAll.mon : outAll.edge).push(piece); } }, wNow = 1, pills = voiceState.rings === 2;
    function f(x) { return x.toFixed(1); }
    var bl0 = ' style="mix-blend-mode:difference"';
    function rectsOf(a, b) {                            // GHOST NODES (user1, 18 x 2026): a collapsed message still lays out its lines under its clip;
      var rs = rangeOf(a, b).getClientRects(), q = [], i, c = base.clip;   // a rect whose centre lies outside the host's clipping ancestors is not on the page
      for (i = 0; i < rs.length; i++) {
        if (rs[i].width < 1) continue;
        if (c) { var cx = rs[i].left + rs[i].width / 2, cy = rs[i].top + rs[i].height / 2; if (cx < c.l || cx > c.r || cy < c.t || cy > c.b) continue; }
        q.push({ l: rs[i].left - base.left, r: rs[i].right - base.left, y: rs[i].top - base.top + rs[i].height / 2, h: rs[i].height });
      }
      return q;
    }
    function styles(col) {                              // [the hairline in its key colour, the white mon piece by difference]
      return [' fill="none" stroke="' + col + '" stroke-opacity="' + (RING.op * wNow).toFixed(3) + '" stroke-width="' + RING.width + '" stroke-linecap="round" stroke-linejoin="round"',
              ' stroke="none" fill="#fff"' + bl0];
    }
    function roundPaths(q, w, H) {                      // a rounded rect of width w and height H on the span's rects: whole, or the opener's and closer's halves
      var o = q[0], c = q[q.length - 1], rr = Math.min(H / 2, w / 2), out_ = {};
      out_.one = '<rect x="' + f(o.l) + '" y="' + f(o.y - H / 2) + '" width="' + f(w) + '" height="' + f(H) + '" rx="' + f(rr) + '"';
      out_.dL = 'M' + f(o.l + w / 2) + ' ' + f(o.y - H / 2) + ' L' + f(o.l + rr) + ' ' + f(o.y - H / 2) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 0 ' + f(o.l) + ' ' + f(o.y - H / 2 + rr) + ' L' + f(o.l) + ' ' + f(o.y + H / 2 - rr) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 0 ' + f(o.l + rr) + ' ' + f(o.y + H / 2) + ' L' + f(o.l + w / 2) + ' ' + f(o.y + H / 2);
      out_.dR = 'M' + f(c.r - w / 2) + ' ' + f(c.y - H / 2) + ' L' + f(c.r - rr) + ' ' + f(c.y - H / 2) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 1 ' + f(c.r) + ' ' + f(c.y - H / 2 + rr) + ' L' + f(c.r) + ' ' + f(c.y + H / 2 - rr) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 1 ' + f(c.r - rr) + ' ' + f(c.y + H / 2) + ' L' + f(c.r - w / 2) + ' ' + f(c.y + H / 2);
      return out_;
    }
    function emit(q, pp, stk, fil) {                     // a rounded figure, whole or in halves
      if (q.length === 1) { out.push(pp.one + fil + '/>'); out.push(pp.one + stk + '/>'); return; }
      out.push('<path d="' + pp.dL + 'Z"' + fil + '/>'); out.push('<path d="' + pp.dL + '"' + stk + '/>');
      out.push('<path d="' + pp.dR + 'Z"' + fil + '/>'); out.push('<path d="' + pp.dR + '"' + stk + '/>');
    }
    function ring(a, b, col, tall) {                    // THE CIRCLE, PROPER: radius half the span's width, centred on its line; tangent at the bonding spaces
      var q = rectsOf(a, b), w = 0; if (!q.length) return;
      if (a > 0 && text.charAt(a - 1) === ' ') q[0].l -= sw / 2;
      if (text.charAt(b) === ' ') q[q.length - 1].r += sw / 2;
      q.forEach(function (s) { w += s.r - s.l; });
      var R = w / 2, st = styles(col), stk = st[0], fil = st[1];
      if (pills) { emit(q, roundPaths(q, w, q[0].h * (tall || 1.3)), stk, fil); return; }   // state 2: the rounded rect stands in for the circle
      if (q.length === 1) { var cc = ' cx="' + f(q[0].l + R) + '" cy="' + f(q[0].y) + '" r="' + f(R) + '"'; out.push('<circle' + cc + fil + '/>'); out.push('<circle' + cc + stk + '/>'); return; }
      var o = q[0], c = q[q.length - 1];                // broken: the opener's left hemicircle, the closer's right, each of the true radius
      var dO = 'M' + f(o.l + R) + ' ' + f(o.y - R) + ' A' + f(R) + ' ' + f(R) + ' 0 0 0 ' + f(o.l + R) + ' ' + f(o.y + R);
      var dC = 'M' + f(c.r - R) + ' ' + f(c.y - R) + ' A' + f(R) + ' ' + f(R) + ' 0 0 1 ' + f(c.r - R) + ' ' + f(c.y + R);
      out.push('<path d="' + dO + 'Z"' + fil + '/>'); out.push('<path d="' + dO + '"' + stk + '/>');
      out.push('<path d="' + dC + 'Z"' + fil + '/>'); out.push('<path d="' + dC + '"' + stk + '/>');
    }
    function figure(kind, a, b) {                       // THE BRACKETS AS FIGURES: the brackets' outer edges are the walls
      if (kind === '(') { ring(a, b, '#9fb6c9', 1.5); return; }
      var q = rectsOf(a, b), w = 0, col = '#9fb6c9'; if (!q.length) return;
      q.forEach(function (s) { w += s.r - s.l; });
      var st = styles(col), stk = st[0], fil = st[1], o = q[0], c = q[q.length - 1], H = o.h * 1.5, rr = Math.min(H / 2, w / 2), dL, dR, el;
      if (q.length === 1) {
        el = kind === '[' ? '<rect x="' + f(o.l) + '" y="' + f(o.y - w / 2) + '" width="' + f(w) + '" height="' + f(w) + '"'
           : kind === '<' ? '<polygon points="' + f(o.l) + ',' + f(o.y) + ' ' + f(o.l + w / 2) + ',' + f(o.y - w / 2) + ' ' + f(o.r) + ',' + f(o.y) + ' ' + f(o.l + w / 2) + ',' + f(o.y + w / 2) + '"'
           : '<rect x="' + f(o.l) + '" y="' + f(o.y - H / 2) + '" width="' + f(w) + '" height="' + f(H) + '" rx="' + f(rr) + '"';
        out.push(el + fil + '/>'); out.push(el + stk + '/>'); return;
      }
      if (kind === '[') {
        dL = 'M' + f(o.l + w / 2) + ' ' + f(o.y - w / 2) + ' L' + f(o.l) + ' ' + f(o.y - w / 2) + ' L' + f(o.l) + ' ' + f(o.y + w / 2) + ' L' + f(o.l + w / 2) + ' ' + f(o.y + w / 2);
        dR = 'M' + f(c.r - w / 2) + ' ' + f(c.y - w / 2) + ' L' + f(c.r) + ' ' + f(c.y - w / 2) + ' L' + f(c.r) + ' ' + f(c.y + w / 2) + ' L' + f(c.r - w / 2) + ' ' + f(c.y + w / 2);
      } else if (kind === '<') {
        dL = 'M' + f(o.l + w / 2) + ' ' + f(o.y - w / 2) + ' L' + f(o.l) + ' ' + f(o.y) + ' L' + f(o.l + w / 2) + ' ' + f(o.y + w / 2);
        dR = 'M' + f(c.r - w / 2) + ' ' + f(c.y - w / 2) + ' L' + f(c.r) + ' ' + f(c.y) + ' L' + f(c.r - w / 2) + ' ' + f(c.y + w / 2);
      } else {
        dL = 'M' + f(o.l + w / 2) + ' ' + f(o.y - H / 2) + ' L' + f(o.l + rr) + ' ' + f(o.y - H / 2) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 0 ' + f(o.l) + ' ' + f(o.y - H / 2 + rr) + ' L' + f(o.l) + ' ' + f(o.y + H / 2 - rr) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 0 ' + f(o.l + rr) + ' ' + f(o.y + H / 2) + ' L' + f(o.l + w / 2) + ' ' + f(o.y + H / 2);
        dR = 'M' + f(c.r - w / 2) + ' ' + f(c.y - H / 2) + ' L' + f(c.r - rr) + ' ' + f(c.y - H / 2) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 1 ' + f(c.r) + ' ' + f(c.y - H / 2 + rr) + ' L' + f(c.r) + ' ' + f(c.y + H / 2 - rr) + ' A' + f(rr) + ' ' + f(rr) + ' 0 0 1 ' + f(c.r - rr) + ' ' + f(c.y + H / 2) + ' L' + f(c.r - w / 2) + ' ' + f(c.y + H / 2);
      }
      out.push('<path d="' + dL + 'Z"' + fil + '/>'); out.push('<path d="' + dL + '"' + stk + '/>');
      out.push('<path d="' + dR + 'Z"' + fil + '/>'); out.push('<path d="' + dR + '"' + stk + '/>');
    }
    units.forEach(function (u) {
      vSentSpans(text, u[0], u[1]).forEach(function (sn) {
        wNow = weightOf ? weightOf(sn) : 1;             // BE HERE NOW (user1): the sentence under the caret at full weight, the others faded by their distance
        ring(sn[0], sn[1], '#8f98a5', 1.7);
        var segs = vSegSpans(text, sn[0], sn[1]), ds = vTintDepths(segs.map(function (g) { return text.slice(g[0], g[1]); }));
        segs.forEach(function (g, i) { ring(g[0], g[1], ringHue(ds[i]), 1.3); });
      });
      var OPEN = '([<{', CLOSE = ')]>}', stacks = { '(': [], '[': [], '<': [], '{': [] }, ci, ch, k;
      for (ci = u[0]; ci < u[1]; ci++) {
        ch = text.charAt(ci); k = OPEN.indexOf(ch);
        if (k >= 0) { stacks[ch].push(ci); continue; }
        k = CLOSE.indexOf(ch);
        if (k >= 0 && stacks[OPEN.charAt(k)].length) figure(OPEN.charAt(k), stacks[OPEN.charAt(k)].pop(), ci + 1);
      }
    });
  }
  function ringsCompose(out, w, h) {                  // the mon at 5% over black, isolated so the differences stay among the figures; the edges over it
    if (!out.mon.length && !out.edge.length) return '';
    return '<g style="isolation:isolate" opacity="' + RING.mon + '"><rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#000"/>' + out.mon.join('') + '</g>' + out.edge.join('');
  }
  // ---- the page: one sheet of glass over the viewport, under Bela; redrawn on scroll, resize and the sweep ----
  var ringSheet = null, ringT = null;
  function ringSheetOn() {
    if (ringSheet) return ringSheet;
    ringSheet = document.createElementNS(SVGNS, 'svg'); ringSheet.setAttribute('id', 'bk-ring-sheet');
    ringSheet.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147482990;overflow:visible';
    document.body.appendChild(ringSheet); return ringSheet;
  }
  function ringHostUnits(host) {                        // the prose units of a host, as the tincture cuts them: lines joined, lists their own, illustrations out
    var f = flatText(host), lines = f.text.split('\n'), starts = [], p = 0, i, b, skip = {};
    for (i = 0; i < lines.length; i++) { starts.push(p); p += lines[i].length + 1; }
    for (b = 0; b < lines.length; b++) if (isShadowText(lines[b])) {
      skip[b] = 1;
      var w = shadowRun(lines, b); if (!w) continue;
      var r = GRAMMAR.decode(w.burst, PALETTE), top = artBlock(lines, w.first, r.colours.length - 1, r.mode === 'positional');
      if (top >= 0) { for (i = top; i < w.first; i++) skip[i] = 1; var hd = headLine(lines, top); if (hd >= 0) skip[hd] = 1; }
    }
    var A = '', x, ch;
    for (x = 0; x < f.text.length; x++) { ch = f.text[x]; A += (ch === '\n' || vBlank(ch)) ? ' ' : ch; }
    var units = [], open = null, t;
    for (i = 0; i < lines.length; i++) {
      t = vTrim(lines[i]);
      if (skip[i] || !t) { open = null; continue; }
      if (vMarker(t)) open = null;
      if (!open) { open = [starts[i], 0]; units.push(open); }
      open[1] = starts[i] + lines[i].length;
    }
    return { text: A, units: units, at: f.at };
  }
  function clipOf(el) {                                 // the visible window of an element: its clipping ancestors' rects, intersected, and the viewport
    var c = { l: 0, t: 0, r: window.innerWidth, b: window.innerHeight }, n = el.parentElement, cs, r;
    while (n && n !== document.body) {
      cs = getComputedStyle(n);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowY + ' ' + cs.overflowX)) { r = n.getBoundingClientRect(); c.l = Math.max(c.l, r.left); c.t = Math.max(c.t, r.top); c.r = Math.min(c.r, r.right); c.b = Math.min(c.b, r.bottom); }
      n = n.parentElement;
    }
    return c;
  }
  function ringView() {
    try {
      if (!live()) return;
      if (!voiceState.rings) { if (ringSheet) ringSheet.innerHTML = ''; return; }
      var sheet = ringSheetOn(), all = document.body.querySelectorAll('p, li, blockquote'), out = { mon: [], edge: [] }, i, el;
      sheet.style.mixBlendMode = nightPage() ? 'lighten' : 'darken';
      for (i = 0; i < all.length; i++) {
        el = all[i];
        if (el.closest(BELA_OWN) || el.querySelector('p, li, blockquote') || !inView(el)) continue;
        if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;   // hidden, faded or display:none: a ghost
        var clip = clipOf(el); if (clip.r - clip.l < 4 || clip.b - clip.t < 4) continue;
        var h = ringHostUnits(el), at = h.at, sw = 0, sp = h.text.indexOf(' ');
        if (!h.units.length) continue;
        function rangeOf(a, b) { var rg = document.createRange(); rg.setStart(at[2 * a], at[2 * a + 1]); rg.setEnd(at[2 * (b - 1)], at[2 * (b - 1) + 1] + 1); return rg; }
        if (sp >= 0 && at[2 * sp]) { try { sw = rangeOf(sp, sp + 1).getBoundingClientRect().width; } catch (e) { sw = 0; } }
        if (!sw) sw = (parseFloat(getComputedStyle(el).fontSize) || 16) * 0.28;
        try { ringsDraw(h.text, h.units, function (a, b) { return rangeOf(a, b); }, { left: 0, top: 0, clip: clip }, sw, out); }
        catch (e1) { if (typeof console !== 'undefined') console.warn('bela: rings skipped a paragraph (' + e1.message + ')'); }   // one host's trouble is not the page's
      }
      sheet.innerHTML = ringsCompose(out, window.innerWidth, window.innerHeight);
      ringAt.el = ringAt.last || null; ringAt.top = scrollTopOf(ringAt.el); sheet.style.transform = '';   // composed here: the scooch measures from this
    } catch (err) { if (typeof console !== 'undefined') console.warn('bela: the rings could not be drawn (' + err.message + ')'); if (ringSheet) ringSheet.innerHTML = ''; }
  }
  function ringViewSoon() { if (!voiceState.rings) return; clearTimeout(ringT); ringT = setTimeout(ringView, 120); }
  // THE SCOOCH (user1: "could not they listen to mousewheel, and scooch themselves to closely map the scroll? ... nothing hits a
  // language-ape like simultaneity"): between compositions the sheet is slid by the scroll's own delta, then recomposed when it settles
  var ringAt = { el: null, top: 0 };
  function scrollTopOf(t) { return (!t || t === document || t === window) ? (window.scrollY || document.documentElement.scrollTop || 0) : (t.scrollTop || 0); }
  listen(document, 'scroll', function (e) {
    if (!voiceState.rings) return;
    var t = e.target; ringAt.last = t;
    if (ringSheet && ringAt.el === t) ringSheet.style.transform = 'translateY(' + (ringAt.top - scrollTopOf(t)).toFixed(1) + 'px)';
    ringViewSoon();
  }, true);
  listen(window, 'resize', ringViewSoon);
  // ---- the box, by leave: a mirror under the glass, as the lamp's ----
  var ringM = null, ringSvg = null, ringRO = null;
  function ringMirror() {
    if (ringM) return;
    ringM = document.createElement('div'); ringM.id = 'bk-blue-ring-m';
    ringM.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;overflow:hidden;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;box-sizing:border-box';
    ringSvg = document.createElementNS(SVGNS, 'svg'); ringSvg.setAttribute('id', 'bk-blue-rings');
    ringSvg.style.cssText = 'position:absolute;pointer-events:none;overflow:hidden';
    blue.insertBefore(ringM, ta); blue.insertBefore(ringSvg, ta); ta.style.position = 'relative'; ta.style.zIndex = '1';
    ta.addEventListener('scroll', blueRings); ta.addEventListener('input', blueRings);
    listen(document, 'selectionchange', function () { if (document.activeElement === ta && voiceState.rings && RING.box) blueRings(); });   // the caret is NOW
    if (typeof ResizeObserver === 'function') { ringRO = new ResizeObserver(blueRings); ringRO.observe(ta); }
  }
  function ringGeom() {
    var cs = getComputedStyle(ta);
    ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch', 'lineHeight', 'letterSpacing', 'wordSpacing', 'textTransform', 'textIndent', 'tabSize', 'textRendering', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'direction']
      .forEach(function (k) { ringM.style[k] = cs[k]; });
    [ringM, ringSvg].forEach(function (el) { el.style.left = ta.offsetLeft + 'px'; el.style.top = ta.offsetTop + 'px'; el.style.width = ta.offsetWidth + 'px'; el.style.height = ta.offsetHeight + 'px'; });
    ringM.scrollTop = ta.scrollTop;
  }
  function blueRings() {
    try {
      if (!live()) return;
      if (!voiceState.rings || !RING.box) { if (ringSvg) ringSvg.innerHTML = ''; return; }
      ringMirror(); ringGeom();
      var text = ta.value, out = { mon: [], edge: [] }, units = [], p0 = 0, p1;
      ringM.textContent = text;
      if (!text.trim()) { ringSvg.innerHTML = ''; return; }
      var node = ringM.firstChild, base = ringM.getBoundingClientRect(), sw = 0, sp = text.indexOf(' ');
      function rangeOf(a, b) { var r = document.createRange(); r.setStart(node, a); r.setEnd(node, b); return r; }
      if (sp >= 0) sw = rangeOf(sp, sp + 1).getBoundingClientRect().width;
      if (!sw) sw = (parseFloat(getComputedStyle(ta).fontSize) || 14) * 0.3;
      while (p0 <= text.length) { p1 = text.indexOf('\n', p0); if (p1 < 0) p1 = text.length; if (p1 > p0) units.push([p0, p1]); p0 = p1 + 1; }
      var caret = ta.selectionStart || 0;
      ringsDraw(text, units, rangeOf, base, sw, out, function (sn) {   // now overruns then: full under the caret, fading with the characters between
        var d = caret < sn[0] ? sn[0] - caret : caret > sn[1] ? caret - sn[1] : 0;
        return Math.max(0.3, 1 - 0.7 * Math.min(1, d / RING.now));
      });
      ringSvg.innerHTML = ringsCompose(out, ta.offsetWidth, Math.max(ta.offsetHeight, ta.scrollHeight));
    } catch (err) { if (typeof console !== 'undefined') console.warn('bela: the box rings could not be drawn (' + err.message + ')'); if (ringSvg) ringSvg.innerHTML = ''; }   // never blind the box
  }
  function ringsPaint() { lit(ringsBtn, !!voiceState.rings); ringsBtn.textContent = voiceState.rings === 2 ? '{( )}' : '(( ))'; }
  function ringsSay() { eatLabel.textContent = voiceState.rings ? 'rings: ' + (voiceState.rings === 2 ? 'rounded, ' : '') + 'sentence in grey, clause by depth, brackets as figures' + (RING.box ? ', and in the box' : '') : 'rings off'; }
  ringsBtn.onclick = function (e) {                   // one click, one step of three: off, circles, rounded (user1: "a tristate switch"); shift-click toggles the box
    if (e && e.shiftKey) { RING.box = !RING.box; blueRings(); ringsSay(); return; }
    voiceState.rings = ((voiceState.rings | 0) + 1) % 3; saveVoice(); ringsPaint(); ringView(); blueRings(); ringsSay();
  };
  ringsPaint(); if (voiceState.rings) setTimeout(ringView, 0);
  // ================= THE TILT-DOWNS |> |>|> (user1, 19 x 2026) =================
  // "two |>|> Tilt-down controls, affixed to the left-edge of each chat paragraph, so that I may expand any para into sandraked
  // lineation with the outer |>, and further expand its 'subrake' with the inner |>. In this way, I can close it back up. This
  // would make the 2D experience of chat very explorable, while telling no lies about what is there." The host's paragraph is
  // never touched: it is hidden, and a copy stands in its place, vented (outer) or raked (inner), only whitespace added; closing
  // shows the original again. The copy is a paragraph like any other, so the lamp, the tincture and wrapture tone it as they
  // would. If the host redraws the thread and drops the copy, the sweep opens it again by its words. The chevrons ride a sheet
  // under Bela, placed by the paragraphs' own rects, and are shown or hidden by |> in the head row.
  // flags: 2 full, 1 Agnes Halfbrite, 0 off
  var tiltState = { on: false, flags: 2, vid: false, wyrd: true, pageWyrd: false, layer: null, opened: {}, origOf: typeof WeakMap === 'function' ? new WeakMap() : null, copyOf: typeof WeakMap === 'function' ? new WeakMap() : null, t: null };
  var tiltBtn = document.createElement('span'); tiltBtn.id = 'bk-tilt'; tiltBtn.textContent = '|>';
  tiltBtn.title = 'tilt-downs: a pair of chevrons at the left of every paragraph in view. outer: the paragraph vented, by the marks; inner: raked, the words lifted. click again to close it back up. nothing is changed but whitespace, and the original is kept under it.';
  tiltBtn.style.cssText = BTN + ';padding:0 5px';
  (function () { var sb = document.getElementById('bk-sb'); if (sb && sb.parentNode) sb.parentNode.insertBefore(tiltBtn, sb.nextSibling); })();   // the head row, right of the barberpole (user1, 20 x)
  try { var tv0 = JSON.parse(localStorage.getItem('blinken-tilts') || 'null'); if (tv0) { ['on', 'flags', 'vid', 'pageWyrd', 'auto'].forEach(function (k) { if (typeof tv0[k] === 'boolean' || typeof tv0[k] === 'number') tiltState[k] = tv0[k]; }); if (tiltState.flags === true) tiltState.flags = 2; if (tiltState.flags === false) tiltState.flags = 0; } } catch (e) {}   // user settings matter (user1, 20 x); the tilts remember being on
  function saveTilts() { try { localStorage.setItem('blinken-tilts', JSON.stringify({ on: tiltState.on, flags: tiltState.flags, vid: tiltState.vid, pageWyrd: tiltState.pageWyrd, auto: !!tiltState.auto })); } catch (e) {} }
  function tiltKey(text) { return text.replace(/\s+/g, ' ').trim().slice(0, 400); }
  function tiltLayerOn() {
    if (tiltState.layer) return tiltState.layer;
    var L = document.createElement('div'); L.id = 'bk-tilts';
    L.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147482992';
    document.body.appendChild(L); tiltState.layer = L; return L;
  }
  // ================= THE FLAGS, or ENLUDES (user1, 19-20 x 2026) =================
  // "the newly-found room on the left of the subraked, auto-margined column, could contain small illustrations ... by the
  // suggestive nature of words which point, some x,y anchor might be found ... This is exactly the field, not of pictures, but
  // formal illustration." And: "There is no English word enlude, by which I mean diadem, but that is how I see the flag. It
  // raises its colors, and we then go on to have the faithfully lineated and indented text." So: a lifted line that begins with
  // an opener earns a flag; its two coins are the line it hangs from and itself, each a run of discs as long as the line is in
  // words (to six), each in the ladder hue of its depth; between them the relation, drawn from a small lexicon of the openers
  // -- of and with join by a bar, in sets the coin in a box, into and toward are arrows, on and under stand the coin on or
  // beneath a bar, through crosses it, between flanks it, around rings it, and is a fulcrum, is an equals, because a cause,
  // that and which a hanging. One row each, in the column the raked copy leaves at its left, so the flag is read before the
  // line. The nouns are never drawn; only the relation and the sizes. Heraldry's rule: no coin on a field of its own hue.
  var FLAG = { col: 24, gut: 7, maxw: 6, coin: 1.0, bone: '#d6d9de' };   // the gutter four characters wider (user1, 20 x: "directly adjacent to the type's right-edge. They must move right by 4")    // THE THREE COLUMNS (user1, 20 x): illustrations left, the text, the semiotics right, left-aligned, "as saturated as possible"   // coins at 64% so they do not shout down the words; the bones near white (user1, 20 x)                // the column, in ch; the gutter between flag and text, in ch (user1, 20 x: "More gutter needed")
  var FLAG_LEX = {
    of: '{h}─{p}', with: '{h}─{p}', by: '{h}─{p}', like: '{h}~{p}', as: '{h}~{p}', per: '{h}/{p}', via: '{h}→{p}',
    'in': '{h} [{p}]', within: '{h} [{p}]', inside: '{h} [{p}]', among: '{h} [{p}]', amid: '{h} [{p}]', amidst: '{h} [{p}]',
    into: '{h}→[{p}]', onto: '{h}→▔{p}', unto: '{h}→{p}', to: '{h}→{p}', toward: '{h}→{p}', towards: '{h}→{p}', for: '{h}→{p}',
    from: '{h}←{p}', out: '{h}←{p}', off: '{h}←{p}', despite: '{h}≠{p}',
    on: '{h} ▔{p}', upon: '{h} ▔{p}', over: '{h} ▔{p}', above: '{h} ▔{p}', atop: '{h} ▔{p}',
    under: '{h} ▁{p}', below: '{h} ▁{p}', beneath: '{h} ▁{p}', underneath: '{h} ▁{p}',
    through: '{h} ─{p}─', across: '{h} ─{p}─', along: '{h} ─{p}─',
    between: '{h} ●{p}●', around: '{h} ({p})', about: '{h} ({p})', beside: '{h} {p}●', behind: '{h} ●{p}', beyond: '{h} ●·{p}', near: '{h}·{p}', against: '{h}|{p}',
    before: '{h}→|{p}', until: '{h}→|{p}', till: '{h}→|{p}', after: '|{h}→{p}', since: '|{h}→{p}', during: '{h}≈{p}', 'while': '{h}≈{p}', when: '{h}≈{p}', where: '{h}·{p}',
    and: '{h}┴{p}', or: '{h}╱{p}', nor: '{h}╳{p}', but: '{h}╳{p}', yet: '{h}╳{p}',
    is: '{h}={p}', are: '{h}={p}', was: '{h}={p}', were: '{h}={p}', be: '{h}={p}', been: '{h}={p}', being: '{h}={p}', am: '{h}={p}',
    because: '{h}⇐{p}', 'so that': '{h}⇒{p}', therefore: '{h}⇒{p}', hence: '{h}⇒{p}', thus: '{h}⇒{p}', 'if': '{h}?{p}', unless: '{h}?{p}', although: '{h}≠{p}', though: '{h}≠{p}', whereas: '{h}≠{p}',
    that: '{h}↳{p}', which: '{h}↳{p}', who: '{h}↳{p}', whom: '{h}↳{p}', whose: '{h}↳{p}', not: '{h} ¬{p}'
  };
  function flagCoin(n) { var k = Math.max(1, Math.min(FLAG.maxw, Math.round(n / 2))), s = ''; while (s.length < k) s += '●'; return s; }
  function flagsOf(lines) {                             // the raked copy's lines -> [{ i, html, text }] for the lines that earn one
    var out = [], i, j, t, ws, k, ind, head, hind, rel;
    function esc(x) { return x.split('&').join('&amp;').split('<').join('&lt;'); }
    for (i = 0; i < lines.length; i++) {
      t = vTrim(lines[i]); if (!t) continue; ws = t.split(' ').filter(function (w) { return w; });
      k = rTok(ws[0]); if (ws.length > 1 && k === 'so' && rTok(ws[1]) === 'that') k = 'so that';
      rel = FLAG_LEX[k]; if (!rel) continue;
      ind = vLead(lines[i]); head = -1;
      for (j = i - 1; j >= 0; j--) { if (!vTrim(lines[j])) break; if (vLead(lines[j]) < ind) { head = j; break; } }
      if (head < 0) { for (j = i - 1; j >= 0 && !vTrim(lines[j]); j--) {} head = j >= 0 && vTrim(lines[j]) ? j : -1; }
      if (head < 0) continue;
      hind = vLead(lines[head]); var hw = vTrim(lines[head]).split(' ').length, pw = ws.length;
      var hc = ringHue(Math.floor(hind / VENT.unit)), pc = ringHue(Math.floor(ind / VENT.unit));
      var html = esc(rel).replace('{h}', '<b style="font-weight:normal;color:' + hc + ';opacity:' + FLAG.coin + '">' + flagCoin(hw) + '</b>').replace('{p}', '<b style="font-weight:normal;color:' + pc + ';opacity:' + FLAG.coin + '">' + flagCoin(pw) + '</b>');
      out.push({ i: i, html: html, text: rel.replace('{h}', flagCoin(hw)).replace('{p}', flagCoin(pw)) });
    }
    return out;
  }
  // ================= THE WYRD -- the path board, a paragraph's first flag (user1, 20 x 2026) =================
  // "This is a depth gauge, marching x. Perhaps here, then, use linear characters to show the path taken. To raise this as
  // first flag is simple utility, and summary." And the word for it: "Wyrd, empty rune ... that turn in the road you do not
  // know. Could be wolves, could be alehouse." So: 32 columns of reading order, 5 rows of the ladder's rungs, and for each
  // sentence one continuous line walking right along its clauses, stepping down a rung where the lineator dived and up
  // where it stepped out, drawn in the box characters that join dead even; a sentence's end is a small tick. Each rung in
  // its ladder hue; the turns in stone. Above the raked copy, in its column, before the words: the route before the road.
  var WYRD = { w: 25, h: 5, hue: ['#cfcbc2', null, null, null, null] };   // 25: one in the middle and paired twelves either side (user1, 20 x), to relieve the untilted paragraphs beside it
  function wyrdOf(lines) {                              // raked lines -> rows of [ch, colour] (null = blank)
    var cells = [], total = 0, i, t, d, w;
    for (i = 0; i < lines.length; i++) { t = vTrim(lines[i]); if (!t) continue; d = Math.min(WYRD.h - 1, Math.floor(vLead(lines[i]) / VENT.unit)); w = t.split(' ').length; cells.push({ d: d, w: w, end: /[.!?]["')\]]*$/.test(t) }); total += w; }
    if (!cells.length) return null;
    var rows = [], r, c; for (r = 0; r < WYRD.h; r++) { rows.push([]); for (c = 0; c < WYRD.w; c++) rows[r].push(null); }
    function hue(d) { return d === 0 ? WYRD.hue[0] : ringHue(d); }
    function put(r, c, ch, col) { if (r >= 0 && r < WYRD.h && c >= 0 && c < WYRD.w && (!rows[r][c] || ch !== '─')) rows[r][c] = [ch, col]; }
    var pos = 0, prevD = -1, x1 = 0, start = true;
    cells.forEach(function (cell) {
      var x0 = Math.floor(pos / total * WYRD.w); x1 = Math.max(x0 + 1, Math.floor((pos + cell.w) / total * WYRD.w)); if (x1 > WYRD.w) x1 = WYRD.w;
      if (!start && prevD >= 0 && prevD !== cell.d) {          // the turn: down a rung or up, at the boundary column, joined dead even
        var cx = x0, lo = Math.min(prevD, cell.d), hi = Math.max(prevD, cell.d), k;   // the turn takes the new cell's first column, never the old cell's last
        if (cell.d > prevD) { put(prevD, cx, '╮', '#8f98a5'); put(cell.d, cx, '╰', '#8f98a5'); } else { put(prevD, cx, '╯', '#8f98a5'); put(cell.d, cx, '╭', '#8f98a5'); }
        for (k = lo + 1; k < hi; k++) put(k, cx, '│', '#8f98a5');
        x0 = cx + 1; if (x1 < x0 + 1) x1 = Math.min(WYRD.w, x0 + 1);
      }
      for (var c2 = x0; c2 < x1; c2++) put(cell.d, c2, '─', hue(cell.d));
      if (cell.end) { put(cell.d, x1 - 1, '╴', hue(cell.d)); start = true; prevD = -1; } else { start = false; prevD = cell.d; }
      pos += cell.w;
    });
    return rows;
  }
  function wyrdPlace(copy, L) {                         // (the wyrd no longer lives in the column: see wyrdTop. kept for the boards to come)
    return;
    var rows = copy.__bkWyrd; if (!tiltState.vid || !rows) return;
    var cs = getComputedStyle(copy), r = copy.getBoundingClientRect(), fs = parseFloat(cs.fontSize) * 0.85, rh = Math.round(fs * 1.05), html = '', i, j, c;
    for (i = 0; i < rows.length; i++) { for (j = 0; j < rows[i].length; j++) { c = rows[i][j]; html += c ? '<b style="font-weight:normal;color:' + c[1] + '">' + c[0] + '</b>' : ' '; } html += '\n'; }
    var el = document.createElement('span'); el.innerHTML = html; el.title = 'the wyrd: the route each sentence takes down the ladder, left to right';
    el.style.cssText = 'position:absolute;left:' + (r.left + 4) + 'px;top:' + (r.top + 2) + 'px;white-space:pre;pointer-events:none;font:' + fs + 'px/' + rh + 'px ' + ART_FACE + ';letter-spacing:0;opacity:0.9';
    L.appendChild(el);
  }
  function vidWidth(copy) { return tiltState.vid ? (WYRD.w * 0.85 + FLAG.gut) + 'ch' : ''; }   // the illustrations' column, left: its room and its line, whether or not a board stands in it yet
  // [ '-_| ] THE WYRD ON THE PAGE (user1, 20 x: "make the wyrd available in an unvented view. It fingerprints a paragraph correctly and
  // distinctly and economically. High data-ink ... This one must default to Off"): every paragraph in view, unopened, gets its route
  // drawn beside it -- in the left margin where there is room, else past its right edge, else small inside its own top-right corner.
  // Remembered apart from the tilt view's own wyrd, since a setting is a setting for the state it was set in.
  var pwBtn = document.createElement('span'); pwBtn.id = 'bk-pwyrd'; pwBtn.textContent = "'-_|";
  pwBtn.title = 'the wyrd: every paragraph in view, opened or not, with its route down the ladder drawn above it. off to begin with; remembered.';
  pwBtn.style.cssText = 'position:absolute;right:224px;bottom:9px;cursor:pointer;color:#8f98a5;font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;white-space:pre;user-select:none';
  box.appendChild(pwBtn);
  pwBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
  pwBtn.addEventListener('click', function (e) { e.stopPropagation(); tiltState.pageWyrd = !tiltState.pageWyrd; lit(pwBtn, tiltState.pageWyrd); saveTilts(); if (!tiltState.pageWyrd) wyrdUnpadAll(); tiltView(); eatLabel.textContent = tiltState.pageWyrd ? 'the wyrd above every paragraph in view' : 'the wyrd off'; });
  // THE WYRD ABOVE (user1, 20 x: "they necessitate their own line above every word from any side, aligned left. Toggling them in any
  // tilt gives the same result. Add to top, remove from top. It is a map ... No vanishing gray miniforms."): in every state of a
  // paragraph, unopened, vented or raked, the wyrd stands above its first line at full size, flush with its left edge, in a band of
  // room given to the paragraph for it (its own padding, restored when the wyrd goes).
  var wyrdPad = typeof WeakMap === 'function' ? new WeakMap() : null;
  function wyrdRowsOf(h) {
    var text = flatText(h).text, key = tiltKey(text) + '|' + text.length;
    if (h.__bkWyrdKey === key) return h.__bkWyrdRows;
    var rl = null, rows = null;
    if ((text || '').split(/\s+/).length >= 12) { RAKE.urls = true; try { rl = rakeOf(ventOf(text), !!blueState.lazy).split('\n'); } finally { RAKE.urls = false; } }
    if (rl && rl.filter(function (l) { return vTrim(l); }).length >= 4) rows = wyrdOf(rl);
    h.__bkWyrdKey = key; h.__bkWyrdRows = rows; return rows;
  }
  // THE WYRD IN ITS BOX (user1, 20 x 2026: "I must demand that, to the extent that wyrd commands space, you enclose that within an
  // element whose display: none is linked to the front-end wyrd toggle"): one box per paragraph, stood before it in the flow ONCE,
  // holding the map as selectable text; shown or hidden by display alone, never removed and re-added, so the host measures it once
  // and the toggle costs one style change. Nothing is inserted while the wyrd is off. A box the host drops in a redraw is stood up
  // again on the next pass, while the wyrd is on. Every insertion and every show or hide is counted (see tractionCheck) and the
  // count is in the console as [bela] reflow, so that when and how we reflow can be seen.
  var wyrdBoxOf = typeof WeakMap === 'function' ? new WeakMap() : null;
  function wyrdTopPlace(h, L) {
    var rows = wyrdRowsOf(h), box_ = wyrdBoxOf && wyrdBoxOf.get(h);
    if (box_ && (!box_.isConnected || box_.nextElementSibling !== h)) { if (box_.isConnected) box_.remove(); box_ = null; }
    if (!rows) { if (box_ && box_.style.display !== 'none') { box_.style.display = 'none'; traction.dressed++; } return; }
    var cs = getComputedStyle(h), fs = parseFloat(cs.fontSize) * 0.85, rh = Math.round(fs * 1.05), html = '', i, j, c;
    for (i = 0; i < rows.length; i++) { for (j = 0; j < rows[i].length; j++) { c = rows[i][j]; html += c ? '<b style="font-weight:normal;color:' + c[1] + '">' + c[0] + '</b>' : ' '; } if (i < rows.length - 1) html += '\n'; }
    if (!box_) {
      box_ = document.createElement('div'); box_.setAttribute('data-bk-wyrd-box', '1'); box_.__bkHost = h;
      box_.style.cssText = 'display:block;margin:0;padding:0 0 2px 0;background:none;border:0;line-height:0;position:relative;top:12px';   // user1's own rule, 20 x: the map sits twelve pixels nearer its words ("I could throw that in Claude Clarion, but Bela better owns it")
      var pre = document.createElement('pre'); pre.setAttribute('data-bk-wyrd', '1');
      pre.style.cssText = 'display:inline-block;margin:0;padding:0;background:none;border:0;white-space:pre;overflow:visible;letter-spacing:0;opacity:0.92;user-select:text;cursor:text';
      pre.title = 'the wyrd: the route each sentence takes down the ladder, left to right. select and copy it as it is.';
      box_.appendChild(pre); h.parentNode.insertBefore(box_, h); if (wyrdBoxOf) wyrdBoxOf.set(h, box_); traction.dressed++;
    }
    var p = box_.firstChild;
    if (p.__bkHtml !== html) { p.innerHTML = html; p.__bkHtml = html; }
    p.style.font = fs + 'px/' + rh + 'px ' + ART_FACE; p.style.marginLeft = cs.paddingLeft || '0';
    // the box stands where the paragraph's own top margin was, and the paragraph gives that margin up while the box shows, so the map
    // sits on its own words and not under the paragraph before (user1, 20 x: "hover too far above the paragraph and seem to attach to the prior")
    if (!h.hasAttribute('data-bk-wyrd-host')) { h.setAttribute('data-bk-wyrd-host', '1'); box_.style.marginTop = cs.marginTop; traction.dressed++; }
    if (box_.style.display !== 'block') { box_.style.display = 'block'; traction.dressed++; }
  }
  function wyrdUnpad(h) { var b = wyrdBoxOf && wyrdBoxOf.get(h); if (b && b.isConnected && b.style.display !== 'none') { b.style.display = 'none'; traction.dressed++; } if (h.hasAttribute('data-bk-wyrd-host')) { h.removeAttribute('data-bk-wyrd-host'); traction.dressed++; } }
  function wyrdUnpadAll() {                             // off: every box hidden by display, none removed (user1: "display: none, the only way to be sure")
    var all = document.querySelectorAll('[data-bk-wyrd-box]'), i; for (i = 0; i < all.length; i++) if (all[i].style.display !== 'none') { all[i].style.display = 'none'; traction.dressed++; }
    var hs = document.querySelectorAll('[data-bk-wyrd-host]'); for (i = 0; i < hs.length; i++) { hs[i].removeAttribute('data-bk-wyrd-host'); traction.dressed++; }
    var pres = document.querySelectorAll('pre[data-bk-wyrd]:not([data-bk-wyrd-box] > pre)'), k; for (k = 0; k < pres.length; k++) pres[k].remove();   // loose blocks from the in-flow version
  }
  function wyrdOrphans() {                              // a box whose paragraph has gone is hidden, not removed; a box before a hidden paragraph likewise
    var all = document.querySelectorAll('[data-bk-wyrd-box]'), i, hst;
    for (i = 0; i < all.length; i++) { hst = all[i].__bkHost; if (!hst || !hst.isConnected || hst.style.display === 'none' || all[i].nextElementSibling !== hst) { if (all[i].style.display !== 'none') { all[i].style.display = 'none'; traction.dressed++; } if (hst && hst.hasAttribute && hst.hasAttribute('data-bk-wyrd-host')) hst.removeAttribute('data-bk-wyrd-host'); } }
  }
  function wyrdOldBands() { }
  // FLAGS IN ANY TILT (user1, 20 x: "Flags cannot be shown independently of Tilt. I realize that this means they must be redrawn
  // over fewer lines!"): the rake is run on the paragraph as it stands, its openers found, and each flag is laid beside the visual
  // line where that opener's words actually sit -- one line of prose may carry several, side by side, in the order they come.
  // The paragraph is given a band of room at its right for them, and gives it back when the flags are struck.
  // THE BANDS BY RULE, NOT BY STYLE (user1, 20 x: the DOM cotillion): the host resets a paragraph's inline style when it redraws it,
  // so a band set by style was lost and set again, lost and set again. A band set by a rule keyed on an attribute the host never
  // wrote survives its redraws, and setting it is one attribute, not a style write.
  var padStyle = document.getElementById('bk-pad-style') || document.createElement('style'); padStyle.id = 'bk-pad-style';
  padStyle.textContent = '[data-bk-vid-pad]{padding-left:' + (WYRD.w * 0.85 + FLAG.gut) + 'ch !important}[data-bk-flag-pad]{padding-right:' + FLAG.col + 'ch !important}[data-bk-wyrd-host]{margin-top:0 !important}';
  if (!padStyle.parentNode) document.head.appendChild(padStyle);
  var flagPad = typeof WeakMap === 'function' ? new WeakMap() : null, traction = { dressed: 0, hist: [], wild: false, until: 0 };
  function dress(h, attr) { if (!h.hasAttribute(attr)) { h.setAttribute(attr, '1'); traction.dressed++; } }
  function flagsAnyPlace(h, L) {
    var f = flatText(h), text = f.text, rl, flags, words = [], m, re = /\S+/g;
    if ((text || '').split(/\s+/).length < 4) { flagsUnpad(h); return; }
    RAKE.urls = false; rl = rakeOf(ventOf(text), !!blueState.lazy).split('\n');                  // URLs whole here: a lifted URL would put its pieces out of count with the words
    flags = flagsOf(rl);
    if (!flags.length) { flagsUnpad(h); return; }
    while ((m = re.exec(text)) !== null) words.push(m.index);                                   // every word's start in the host's own text
    var firstWord = [], count = 0, i;                                                             // each raked line's first word, by count: only whitespace was added
    for (i = 0; i < rl.length; i++) { var t = vTrim(rl[i]); firstWord.push(count); if (t) count += t.split(/\s+/).length; }
    var cs = getComputedStyle(h), colw = FLAG.col * parseFloat(cs.fontSize) * 0.6, ch = parseFloat(cs.fontSize) * 0.6, gut = FLAG.gut * ch;
    dress(h, 'data-bk-flag-pad');
    var r = h.getBoundingClientRect(), rows = {}, order = [];
    flags.forEach(function (fl) {
      var wi = firstWord[fl.i]; if (wi >= words.length) return;
      var o = words[wi], node = f.at[2 * o], off = f.at[2 * o + 1]; if (!node) return;
      var rg = document.createRange(); try { rg.setStart(node, off); rg.setEnd(node, Math.min(node.length, off + 1)); } catch (e) { return; }
      var rc_ = rg.getClientRects(); if (!rc_.length) return;
      var key = Math.round(rc_[0].top); if (!rows[key]) { rows[key] = { y: rc_[0].top, h: rc_[0].height, parts: [] }; order.push(key); }
      rows[key].parts.push(fl.html);
    });
    order.forEach(function (k) {
      var row = rows[k], el = document.createElement('span'); el.innerHTML = row.parts.join('  ');
      el.style.cssText = 'position:absolute;left:' + (r.right - colw + gut) + 'px;top:' + row.y + 'px;height:' + row.h + 'px;line-height:' + row.h + 'px;text-align:left;white-space:pre;pointer-events:none;font:' + cs.fontSize + '/' + row.h + 'px ' + ART_FACE + ';color:' + FLAG.bone + ';letter-spacing:-0.05em;opacity:' + (tiltState.flags === 1 ? 0.5 : 1);
      L.appendChild(el);
    });
  }
  function flagsUnpad(h) { if (h.hasAttribute('data-bk-flag-pad')) { h.removeAttribute('data-bk-flag-pad'); if (h.style.paddingRight) h.style.paddingRight = ''; } }
  function flagsUnpadAll() { var all = document.querySelectorAll('[data-bk-flag-pad]'), i; for (i = 0; i < all.length; i++) flagsUnpad(all[i]); }
  function tiltColumns(copy) { }                        // (the columns are now given to every paragraph by vidAnyPlace and flagsAnyPlace, in any state)
  // THE VIDOUTES COLUMN IN ANY TILT (user1, 20 x: "like semaphores, it must be available in all tilt situations"): every paragraph in
  // view, opened or not, is given its 32 characters and gutter at the left, with the single grey line at the top of the column,
  // whether or not a board stands in it yet; the band is given back when the column is struck.
  var vidPad = typeof WeakMap === 'function' ? new WeakMap() : null;
  // ================= THE VIDOUTES, DRAWN (user1, 20-21 x 2026) =================
  // "little 'views' ... which invite the viewer into that view with shapes, color and labels"; "No, we would raise that same moon
  // again"; "Choice of 5 or 7 or 9? ... this is not a stamping-machine"; "even the briefest single chat words or lines, once found, if
  // Vidoutes are selected, will be given one"; and, of all our views, "when hidden ... they must hide with display: none, or may
  // find their way into layout again". So: the painter (VIDOUTE, folded in at the foot with its reserve and its font) draws a view
  // of each paragraph in view -- one for a paragraph or a vented one, one per sentence for a raked one -- each sized by the room its
  // words give (3, 5, 7 or 9 rows), on the glass, in the column the Vidoutes switch reserves, every cell its own box one cell wide,
  // coloured from YAM-PAL. A view once drawn is kept (the rows themselves, keyed by the words and the height) and drawn again from
  // what was kept, whatever the painter learns later. Nothing of it is in the page's layout but the column's band.
  var VID = { cache: {}, key: 'blinken-vidoutes', max: 800, font: false, saveT: null, fresh: {}, making: {}, play: {} };
  try { VID.cache = JSON.parse(localStorage.getItem(VID.key) || '{}') || {}; } catch (e) { VID.cache = {}; }
  function vidSave() {
    try { var ks = Object.keys(VID.cache); ks.forEach(function (k) { delete VID.cache[k].sq; delete VID.cache[k].__glow; }); if (ks.length > VID.max) ks.sort(function (a, b) { return VID.cache[a].t - VID.cache[b].t; }).slice(0, ks.length - VID.max).forEach(function (k) { delete VID.cache[k]; }); localStorage.setItem(VID.key, JSON.stringify(VID.cache)); } catch (e) {}
  }
  function vidSaveSoon() { clearTimeout(VID.saveT); VID.saveT = setTimeout(vidSave, 2000); }
  function vidHash(s) { var x = 2166136261, i; for (i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36) + s.length.toString(36); }
  function vidFont() {                                  // BelaCells, from the bytes the bundle carries: no URL, nothing for the page's font policy to refuse
    if (VID.font || !window.VIDOUTE_CELLS || typeof FontFace !== 'function') return; VID.font = true;
    try { var bin = atob(window.VIDOUTE_CELLS.b64), buf = new Uint8Array(bin.length), i; for (i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      new FontFace('BelaCells', buf.buffer, { unicodeRange: window.VIDOUTE_CELLS.ranges }).load().then(function (f) { document.fonts.add(f); tiltViewSoon(); }, function () {}); } catch (e) {}
  }
  var VID_FACE = "Iosevka, BelaCells, Consolas, 'DejaVu Sans Mono', monospace", VID_PIG = 'abcdefghijklmnopqrstuvwxyzABCDEF', VID_ROW = 2.1;   // a row is 2.1 cells tall
  var vidTools = { sentences: function (t) { return vSentSpans(t, 0, t.length); }, clauses: function (t, a, b) { return vClauseSpans(t, a, b); } };
  function vidRowsOf(v, f) {                           // a composed view's rows as the strings kept: glyphs, pigments, and why each cell is there
    var PAL_ = window.VIDOUTE.PAL; f.r = []; f.p = []; f.y = [];
    v.rows.forEach(function (row) { var gs = '', ps = '', ys = ''; row.forEach(function (cell) { gs += cell ? cell[0] : ' '; ps += cell ? VID_PIG.charAt(Math.max(0, PAL_.indexOf(cell[1]))) : ' '; ys += cell ? (cell[2] || 'w') : ' '; }); f.r.push(gs); f.p.push(ps); f.y.push(ys); });
    return f;
  }
  function vidView(text, hgt, sure) {                   // the kept view, or a new one drawn and kept (sure: the words are known to be whole, as a kept paragraph's sentences are)
    var norm = text.replace(/\s+/g, ' ').trim(), k = (window.VIDOUTE ? window.VIDOUTE.VERSION : 0) + ':' + hgt + ':' + vidHash(norm), c = VID.cache[k];   // an edition of the painter is its own gallery; the views of an earlier edition stay kept under theirs
    if (c) { c.t = Date.now(); return c.n ? null : c; }
    if (!window.VIDOUTE || !norm) return null;
    // WORDS STILL ARRIVING ARE NOT KEPT: a paragraph streaming in changes every moment, and each moment would be kept as a view of its own.
    // A text is kept once it has stood unchanged for a second and a half; until then its view is drawn fresh each time and not sealed.
    var now = Date.now(), first = VID.fresh[k] || (VID.fresh[k] = now), keep = sure || now - first > 1500;
    var v = window.VIDOUTE.compose(norm, vidTools, { h: hgt, label: false }), PAL_ = window.VIDOUTE.PAL;   // the title goes on the card under the frame, not in the picture
    if (!v.drawn.length && !v.wash && hgt <= 5) { if (keep) { VID.cache[k] = { n: 1, t: Date.now() }; vidSaveSoon(); } return null; }   // nothing to draw in a short one: remembered as nothing
    var ti = v.title || norm.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').trim().split(/\s+/).slice(0, 3).join(' ');
    c = vidRowsOf(v, { h: hgt, v: v.version, f: v.field || '', w: v.wash || '', wm: v.washMod || '', ti: ti, t: Date.now(), cx: v.titleCtx || '', st: v.setting || '', kn: v.title ? 1 : 0, pj: v.projection || '', sy: v.style || '', ft: v.foot || '', fh: v.footHow || '', pt: v.point || '', hz: v.horizon === null || v.horizon === undefined ? null : v.horizon, mk: vidMarkList(v) });
    if (!keep) { c.tr = 1; return c; }                // drawn, not kept: still arriving
    delete VID.fresh[k]; VID.cache[k] = c; vidSaveSoon(); return c;
  }
  // THE MAKING (user1, 22 x 2026: "I would like to try capturing, then replaying the moments of load-in ... one would pour the words through,
  // a Rakelet at a time"): the paragraph's words poured into the painter a raked line at a time, each pouring a frame, the kept view last;
  // derived from the words, so nothing need be recorded while they stream, and old paragraphs have their making too
  // PROVENANCE (user1, 22 x 2026: "Provenance under the pointer ... would meaningfully replace 'a view of this paragraph'"): each view keeps
  // the marks its words made -- glyph, word, and the five words around it -- so the pointer over any cell can say which words put it there
  function vidMarkList(v) { return (v.marks || []).map(function (m) { return [m.g, m.w, m.ctx || '', m.p || '']; }); }
  function vidMarks(c, text) {                          // a view kept before marks were kept: its words poured again (the same edition draws the same rows)
    if ((c.mk && (!c.mk.length || c.mk[0].length > 3)) || !text || !window.VIDOUTE) return c.mk || [];   // (marks kept without their pigment are made again)
    try { var v = window.VIDOUTE.compose(text.replace(/\s+/g, ' ').trim(), vidTools, { h: c.h, label: false }); c.mk = vidMarkList(v); if (!c.cx) c.cx = v.titleCtx || ''; if (!c.st) c.st = v.setting || ''; if (!c.pj) c.pj = v.projection || ''; if (v.title && v.title === c.ti) c.kn = 1; vidSaveSoon(); } catch (e) { c.mk = []; }
    return c.mk;
  }
  function vidCtx(c, text) {                            // the five words around the title: two before, the title, two after (as many as there are)
    if (c.cx) return c.cx;
    var ws = String(text || '').replace(/\s+/g, ' ').trim().split(' '), t = String(c.ti || '').toLowerCase(), i;
    for (i = 0; i < ws.length; i++) if (ws[i].toLowerCase().replace(/[^a-z0-9']+/g, '') === t) return ws.slice(Math.max(0, i - 2), i + 3).join(' ');
    return ws.slice(0, 5).join(' ');
  }
  function vidMaking(text, c) {
    var norm = text.replace(/\s+/g, ' ').trim(), mk = c.h + ':' + vidHash(norm);
    if (VID.making[mk]) return VID.making[mk];
    var frames = [], words = norm.split(' '), lines, ends = [], n = 0, i;
    var versions = pentFor(text);                        // the words as they were really written, changes of mind and all, when the bluebox kept them
    if (versions && versions.length > 1) {
      var PAL0 = window.VIDOUTE.PAL, last0 = '';
      versions.forEach(function (t) {
        var v = window.VIDOUTE.compose(t, vidTools, { h: c.h, label: false, proj: c.pj, style: c.sy }), f = vidRowsOf(v, {});
        var sig = f.r.join('') + f.p.join(''); if (sig !== last0) { frames.push(f); last0 = sig; }
      });
      frames.forEach(function (f) { f.own = c; }); frames.push(c); VID.making[mk] = frames; return frames;
    }
    try { lines = rakeOf(ventOf(norm), false).split('\n'); } catch (e) { lines = [norm]; }
    lines.forEach(function (l) { var t = vTrim(l); if (!t) return; n += t.split(/\s+/).length; ends.push(Math.min(n, words.length)); });
    if (ends.length > 28) { var pick = []; for (i = 0; i < 28; i++) pick.push(ends[Math.round(i * (ends.length - 1) / 27)]); ends = pick; }
    var PAL_ = window.VIDOUTE.PAL, last = '';
    ends.forEach(function (e) {
      var v = window.VIDOUTE.compose(words.slice(0, e).join(' '), vidTools, { h: c.h, label: false, proj: c.pj, style: c.sy }), f = vidRowsOf(v, {});   // poured into the finished view's own country
      var sig = f.r.join('') + f.p.join(''); if (sig !== last) { frames.push(f); last = sig; }
    });
    frames.forEach(function (f) { f.own = c; }); frames.push(c);   // and the kept view itself, last, whatever edition drew it
    VID.making[mk] = frames; return frames;
  }
  function vidRoman(n) { var R = [['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]], o = ''; R.forEach(function (p) { while (n >= p[1]) { o += p[0]; n -= p[1]; } }); return o; }
  function vidPlaqueH(w) { return Math.round(w / 25 * 2.2); }
  function vidSky(c) {                                 // the sky of a view: its field's, washed by a colour named alone (dark, pale, bright, striped as the words say)
    var SKY = { night: '#0e1a2e', dusk: '#2a2140', dawn: '#3a2c1c', rain: '#17232e', snow: '#1e252c', day: '#1a2633' }, sky = SKY[c.f] || '#141c26', stripe = null;
    if (c.w && window.VIDOUTE) { var wh = PALETTE[window.VIDOUTE.PAL.indexOf(c.w)]; if (wh) {
      var mixc = function (a, b, t) { return Math.round(parseInt(a, 16) * (1 - t) + parseInt(b, 16) * t).toString(16).padStart(2, '0'); };
      var amt = c.wm === 'pale' ? 0.42 : c.wm === 'bright' ? 0.5 : c.wm === 'dark' ? 0.2 : 0.28; if (c.wm === 'dark') wh = '#' + mixc(wh.slice(1, 3), '00', 0.45) + mixc(wh.slice(3, 5), '00', 0.45) + mixc(wh.slice(5, 7), '00', 0.45);
      sky = '#' + mixc(sky.slice(1, 3), wh.slice(1, 3), amt) + mixc(sky.slice(3, 5), wh.slice(3, 5), amt) + mixc(sky.slice(5, 7), wh.slice(5, 7), amt); stripe = c.wm === 'striped' ? wh : null; } }
    return { sky: sky, stripe: stripe };
  }
  // COLOUR CYCLING (user1, 22 x 2026, of Deluxe Paint's and Mark Ferrari's waterfalls: "Absolutely, yes please"): while the player plays, the
  // water, the fire and the stars of every panel in sight step through short ramps of their own pigment -- the cells never change, only the
  // colours turn, as on a palette-cycled screen. Water runs along the row; fire flickers; stars twinkle each on its own beat.
  var CYC_OF = { f: 'w', g: 'w', e: 'f', c: 's' }, CYC = null;
  function cycRamps() {
    if (CYC) return CYC;
    function mix(a, b, t) { var o = '#', i; for (i = 1; i < 7; i += 2) o += Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0'); return o; }
    var P = function (n) { return PALETTE[window.VIDOUTE.PAL.indexOf(n)] || '#8899aa'; }, wa = P('water'), de = P('deep'), fi = P('fire'), st = P('star');
    CYC = { w: [de, mix(de, wa, 0.5), wa, mix(wa, '#ffffff', 0.35), wa, mix(de, wa, 0.5)], f: [P('blood'), fi, P('amber'), P('gold'), P('amber'), fi], s: [st, st, st, mix(st, '#ffffff', 0.6), st, mix(st, '#000000', 0.45), st, st] };
    return CYC;
  }
  function cycStep(b, tick) {
    var sp = b.querySelectorAll('[data-bk-cyc]'), R = cycRamps(), i; if (!sp.length) return;
    for (i = 0; i < sp.length; i++) {
      var a = sp[i].getAttribute('data-bk-cyc').split(','), t = a[0], k = +a[1], r = +a[2], ramp = R[t], ph;
      if (t === 'r') {                                  // THE ROAD RUNS (user1, 22 x: "They could even colorshift over time"): a brightening that comes down the edges toward us, as the markings of a road come at a driver -- pole position
        if (!sp[i].__c0) sp[i].__c0 = sp[i].style.color;
        if (!sp[i].__ramp) { var m0 = /(\d+),\s*(\d+),\s*(\d+)/.exec(sp[i].__c0), hx0 = m0 ? '#' + [m0[1], m0[2], m0[3]].map(function (v) { return (+v).toString(16).padStart(2, '0'); }).join('') : '#cfcbc2'; sp[i].__ramp = [hx0, vidMix(hx0, '#ffffff', 0.45), vidMix(hx0, '#ffffff', 0.2), hx0, hx0, hx0]; }
        ramp = sp[i].__ramp; ph = (((Math.floor(tick / 2) - r) % ramp.length) + ramp.length) % ramp.length; sp[i].style.color = ramp[ph]; continue;
      }
      if (t === 'w') ph = (Math.floor(tick / 2) + k + r * 2) % ramp.length;          // a current running along the row
      else if (t === 'f') ph = (tick + k * 3 + r * 5 + (k * k) % 7) % ramp.length;  // a flicker
      else ph = (Math.floor(tick / 3) + (k * 7 + r * 13) % 11) % ramp.length;       // each star on its own beat
      if (!sp[i].__c0) sp[i].__c0 = sp[i].style.color; sp[i].style.color = ramp[ph];
    }
  }
  // THE SKY'S HARD EDGE (user1, 22 x 2026: "road, and all forward views, must show horizon. Be it line, be it hard edge in background
  // gradient"): where the painter puts the horizon, the sky ends -- brightening a little toward it, as a sky does -- and a dark ground begins,
  // fading to the page at the foot. Views without a horizon (the bird's, the way around) keep the sky that fades. One set of stops for the
  // panel, the PNG, the GIF and the terminal alike; null is the page showing through.
  function vidMix(a, b, t) { var o = '#', i; for (i = 1; i < 7; i += 2) o += Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0'); return o; }
  // THE LIGHT OF ITS WORLD (user1, 22 x 2026: "since we settle on a place to tell the tale, we know what the sky and ground would look like
  // from its marble. They are reliably colorful ... the Vidoute's color gamut should inherit from it, from the light that is available on that
  // planet, in that view ... subtly expand background tone and gradients, and get ground into its own gradient"): the view's seal -- the same
  // field its globe is made of -- read for its light: the brightest quarter of it lends the sky its tint and the horizon its glow, the
  // middle lends the ground at the horizon, the darkest quarter the ground at our feet. Subtly: a third of the way at most. Until the seal is
  // made (a moment after the view first shows) the sky is the field's own.
  var VLIGHT = {};
  function vidLight(c) {
    var s_ = c && c.s; if (!s_ || s_.length < 64) return null; if (VLIGHT[s_]) return VLIGHT[s_];
    var px = [], i; for (i = 0; i < s_.length; i++) { var hx = PALETTE[VID_PIG.indexOf(s_.charAt(i))]; if (hx && hx.length === 7) { var r_ = parseInt(hx.slice(1, 3), 16), g_ = parseInt(hx.slice(3, 5), 16), b_ = parseInt(hx.slice(5, 7), 16); px.push([0.3 * r_ + 0.59 * g_ + 0.11 * b_, r_, g_, b_]); } }
    if (px.length < 16) return null; px.sort(function (a_, b2) { return a_[0] - b2[0]; });
    var mean = function (lo, hi) { var m = [0, 0, 0], n = 0; for (var q = Math.floor(lo * px.length); q < Math.floor(hi * px.length); q++) { m[0] += px[q][1]; m[1] += px[q][2]; m[2] += px[q][3]; n++; } return '#' + m.map(function (v) { return Math.round(v / Math.max(1, n)).toString(16).padStart(2, '0'); }).join(''); };
    var L = { light: mean(0.75, 1), mid: mean(0.4, 0.75), shade: mean(0.1, 0.4) };
    var ks = Object.keys(VLIGHT); if (ks.length > 400) delete VLIGHT[ks[0]];
    return (VLIGHT[s_] = L);
  }
  function vidStops(c) {
    var sky = vidSky(c).sky, n = (c.r && c.r.length) || c.h || 7, L = vidLight(c);
    if (L) sky = vidMix(sky, L.light, 0.22);
    if (c.hz === null || c.hz === undefined) return [[0, sky], [0.35, L ? vidMix(sky, L.mid, 0.12) : sky], [1, null]];
    var e = Math.max(0.05, Math.min(0.95, c.hz / n)), GND = { night: '#0c0f14', dusk: '#19141d', dawn: '#1b1611', day: '#171a14', rain: '#11161b', snow: '#1b1e22' }, gnd = GND[c.f] || '#131519';
    var glow = vidMix(sky, L ? L.light : '#ffffff', L ? 0.30 : 0.10);
    if (!L) return [[0, sky], [e, glow], [e, gnd], [1, null]];
    return [[0, sky], [e, glow], [e, vidMix(gnd, L.mid, 0.30)], [e + (1 - e) * 0.6, vidMix(gnd, L.shade, 0.22)], [1, null]];   // the ground its own gradient: lit at the horizon, deepening toward us
  }
  function vidStopAt(st, t, nul) { for (var i = 1; i < st.length; i++) if (t <= st[i][0]) { var a = st[i - 1], b = st[i]; if (b[0] === a[0]) return b[1] || nul; var u = (t - a[0]) / (b[0] - a[0]); return vidMix(a[1] || nul, b[1] || nul, u); } return st[st.length - 1][1] || nul; }
  // ATMOSPHERIC DEPTH (user1, 22 x 2026: "Atmospheric depth would be welcome"): what stands on the horizon and just below it is drawn
  // through the air between -- its colour taken part of the way toward the sky's glow at the horizon, so the far is paler, cooler and
  // quieter, the near full. The sky's own things (the moon, the stars, the birds) and what is held at our feet are not hazed.
  function vidInk(f, own, r, k) {
    var pg = f.p[r] ? f.p[r].charAt(k) : ' ', col = PALETTE[VID_PIG.indexOf(pg)] || '#cfcbc2';
    if (!own || own.hz === null || own.hz === undefined || col.length !== 7) return col;
    var why = f.y && f.y[r] ? f.y[r].charAt(k) : '', hr = Math.floor(own.hz - 0.5), d = r - hr;
    if (d < 0 || d > 2 || why === 'n' || why === 'p' || why === 'b' || why === 'x') return col;
    var glow = own.__glow || (own.__glow = vidMix(vidSky(own).sky, '#ffffff', 0.22));
    return vidMix(col, glow, [0.45, 0.28, 0.12][d]);
  }
  function vidCells(c, cw, rh) {                      // the cells of a view (or of one frame of its making) as html, every cell its own box
    var html = '', r, k, ch, run, own = c.own || c;
    function esc(t) { return t === '&' ? '&amp;' : t === '<' ? '&lt;' : t; }
    for (r = 0; r < c.r.length; r++) {
      html += '<div style="height:' + rh + 'px;line-height:' + rh + 'px;white-space:nowrap">'; run = 0;
      for (k = 0; k < c.r[r].length; k++) {
        ch = c.r[r].charAt(k);
        if (ch === ' ') { run++; continue; }
        if (run) { html += '<span style="display:inline-block;width:' + (run * cw).toFixed(2) + 'px"></span>'; run = 0; }
        var pg = c.p[r].charAt(k), cy = c.y && c.y[r] && c.y[r].charAt(k) === 'e' ? 'r' : CYC_OF[pg];      // water, fire and stars carry their place, for the colour cycling; and the road's edges
        html += '<span ' + (cy ? 'data-bk-cyc="' + cy + ',' + k + ',' + r + '" ' : '') + 'style="display:inline-block;width:' + cw.toFixed(2) + 'px;text-align:center;overflow:visible;color:' + vidInk(c, own, r, k) + '">' + esc(ch) + '</span>';
      }
      html += '</div>';
    }
    return html;
  }
  function vidBoard(c, x, y, w, L, title, num, text) { // every cell its own box, one cell wide (the YOWL note, section 1): a borrowed glyph may overhang, never push
    var cw = w / 25, rh = Math.round(cw * VID_ROW * 10) / 10, html = vidCells(c, cw, rh);
    // THE FRAME AND ITS SKY (user1, 21 x 2026: "We will have to cheat a little by drawing the top, right, and left gray-lines of the picture,
    // since we know it, and the user can only see it by swimming in the darkness, guessing"; "What can we do to form up and better-resemble
    // a Gallery?"): a grey frame on three sides, the ground its fourth; behind the cells, the sky of the view's own field, darkening down
    var sk_ = vidSky(c), sky = sk_.sky, stripe = sk_.stripe;
    var el = document.createElement('div'); el.innerHTML = html; el.setAttribute('aria-label', title || ''); el.setAttribute('data-bk-board', '1');   // no title: the pointer is told by provenance, cell by cell
    el.__bkView = c; el.__bkText = text; el.__bkCur = c; el.__bkCw = cw; el.__bkRh = rh;
    el.addEventListener('mousemove', function (e) { var on = e.shiftKey && (e.altKey || e.ctrlKey); el.style.outline = on ? '1px dashed #3f86d6' : ''; el.style.cursor = on ? 'copy' : ''; provAt(el, e); });   // the promise of the control
    el.addEventListener('mouseleave', function () { el.style.outline = ''; el.style.cursor = ''; provHide(); });
    el.addEventListener('click', function (e) { if (!(e.shiftKey && (e.altKey || e.ctrlKey))) return; e.preventDefault(); e.stopPropagation(); provHide(); outputterOpen(c, text, el.getAttribute('data-bk-play')); }, true);
    if (text && !c.tr) { var pk = c.h + ':' + vidHash(text.replace(/\s+/g, ' ').trim()); VID.play[pk] = VID.play[pk] || { text: text, c: c, i: 0, tick: 0, htm: {} }; el.setAttribute('data-bk-play', pk); }   // the player finds it by this
    vidBoardNow(el);
    el.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;pointer-events:auto;font:' + (cw * 2).toFixed(2) + 'px ' + VID_FACE + ';letter-spacing:0;opacity:0.97;' +
      'border:1px solid #565b64;border-bottom:0;border-right:0;box-sizing:content-box;background:' + (typeof stripe !== 'undefined' && stripe ? 'repeating-linear-gradient(135deg,' + stripe + '33 0px,' + stripe + '33 3px,transparent 3px,transparent 9px),' : '') + 'linear-gradient(to bottom,' + vidStops(c).map(function (q) { return (q[1] || 'rgba(0,0,0,0)') + ' ' + (q[0] * 100).toFixed(2) + '%'; }).join(',') + ')';   // striped white: stripes; the horizon a hard edge
    L.appendChild(el);
    // THE TITLE CARD (user1, 21 x 2026: "numbered panels i,ii,iii prefacing a quiet lowercase title: this is correct. Art stands here in modest,
    // reverent service of word. Even to Title Case is to assert too strongly"): under the frame, small, grey, lowercase; the numeral in a series
    // (and, 22 x: "I imagine 'iii. ... steiner' with the actual text right-justified ... the roman indicial explain at left, and the word be
    // closer to its origin at right"): the numeral at the left edge, the title at the right
    var ph = vidPlaqueH(w), pl = document.createElement('div'), nm = document.createElement('span'), tt = document.createElement('span');
    nm.textContent = num ? vidRoman(num) + '.' : ''; tt.textContent = String(c.ti || '').toLowerCase();
    tt.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto;padding-left:6px';
    var sl = document.createElement('span'); sl.style.cssText = 'display:inline-flex;align-items:center;margin-right:6px;flex:none;position:relative;top:2px'; var spx = Math.max(10, ph - 2);   // two pixels lower, on the type-line (user1, 22 x)
    sealRequest(c, function (seal) { if (sl.isConnected || !sl.firstChild) { var sc = sealCanvas(seal, spx); sc.__c = c; sl.appendChild(sc); } });   // the seal, at the card's left, before the numeral
    pl.appendChild(sl); pl.appendChild(nm); pl.appendChild(tt);
    pl.style.cssText = 'position:absolute;left:' + x + 'px;top:' + (y + rh * c.r.length + 2) + 'px;width:' + w + 'px;height:' + ph + 'px;line-height:' + ph + 'px;pointer-events:none;display:flex;align-items:center;white-space:nowrap;font:' + (w / 25 * 1.55).toFixed(2) + 'px ' + VID_FACE + ';letter-spacing:0.04em;color:#8f98a5;opacity:0.9';
    L.appendChild(pl);
    return rh * c.r.length + ph + 2;
  }
  // the tip: one small dark slip by the pointer, fixed over the page, never in its layout; display:none when not wanted
  var PROV_SAY = { '\u25e0': 'low hills, far off', '\u259f': 'a mesa, far off', '\u2599': 'a far roof or mesa', '\u2663': 'a far tree', '\u03c8': 'a saguaro', '\u2033': 'grass', 'v': 'a bird', 'w': 'a bird', '\u2584': 'the ground', '\u2581': 'the ground', '\u2248': 'water', '\u2500': 'the horizon', '\u00b7': 'a star' };
  var PROV_FURN = '\u25e0\u259f\u2599\u2663\u03c8';
  // THE ROUTE'S OWN PROVENANCE: the road, the ground's profile, the way around, the path seen from above are drawn from how deep the words go,
  // clause by clause, so a cell of them is told by its depth
  var PROV_DEPTH = { '\u00b7': 0, '~': 1, '\u2248': 2, '\u2500': 0, '\u2502': 0, '\u00a6': 1, '\u2584': 0, '\u2583': 1, '\u2582': 2, '\u2581': 3 };
  function provDepth(n) { return ['where the words run in their head clause', 'where they go into a clause within', 'where they dive deeper', 'where they dive deepest'][Math.min(3, n || 0)]; }
  function provWhy(why, dd, sy, own, ch, pname) {     // the reason a cell of the country is there, as the painter gave it
    if (dd >= 0) {
      if (sy === 'dale') return (dd === 0 ? 'high ground' : 'a dale') + ', ' + provDepth(dd);
      if (sy === 'range') return 'the far range, ' + (dd === 0 ? 'its heights ' : 'a saddle ') + provDepth(dd);
      if (sy === 'shore') return (ch === '~' || ch === '\u2248' ? 'the water' : ch === '\u2571' || ch === '\u2572' ? 'the water\u2019s edge' : 'the land') + ', ' + provDepth(dd);
      if (sy === 'road') return 'the roadside, ' + provDepth(dd);
      if (sy === 'ambit') return 'the way around, ' + provDepth(dd);
      return 'the route, ' + provDepth(dd);
    }
    if (why === 'c') return sy === 'ambit' ? 'the way around' : 'the route turning, as the words go in or come out';
    if (why === 'e') return 'the road\u2019s edge, running to the horizon';
    if (why === 'h') return 'the horizon';
    if (why === 'g') return 'the near ground';
    if (why === 'k') { var nth = 0, rr_, kk_; for (rr_ = 0; rr_ < own.r.length; rr_++) for (kk_ = 0; kk_ <= provAt.k; kk_++) if (own.y && own.y[rr_] && own.y[rr_].charAt(kk_) === 'k') nth++;   // the rings stand in reading order, left to right
      return (ch === '\u25c9' ? 'where the words come to rest at last' : 'a resting place, where sentence ' + vidRoman(Math.max(1, nth)) + ' ends') + (pname === 'water' ? ', by water' : ''); }
    if (why === 'd') return 'the ground about a resting place';
    if (why === 'p') return 'a hand, pointing where the words point' + (own.pt ? '  <span style="color:#6f7782">\u201c' + vidEsc(own.pt) + '\u201d</span>' : '');
    if (why === 'f') return (PROV_SAY[ch] || 'far off') + (PROV_FURN.indexOf(ch) >= 0 && own.st && own.st !== 'hills' ? ', of the ' + vidEsc(own.st) : '');
    if (why === 'b') return own.f === 'night' ? 'a bat, at night' : 'a bird';
    if (why === 'x') return own.f === 'rain' ? 'rain' : own.f === 'snow' ? 'snow' : own.f === 'night' ? 'a star, it is night' : vidEsc(pname);
    return null;
  }
  function provRoute(ch, pname, own) {
    var pj = own.pj || '', dp = PROV_DEPTH[ch], corner = '\u256d\u256e\u2570\u256f'.indexOf(ch) >= 0;
    if (pj === 'side' && '\u2584\u2583\u2582\u2581'.indexOf(ch) >= 0) return 'the ground, ' + provDepth(dp);
    if (pname !== 'hay' && pname !== 'thread') return null;
    if (pj === 'ahead' || (!pj && pname === 'hay' && '\u2571\u2572'.indexOf(ch) >= 0)) return '\u2571\u2572'.indexOf(ch) >= 0 ? 'the road\u2019s edge' : dp !== undefined ? 'the road, ' + provDepth(dp) : null;
    if (pj === 'round' || (!pj && pname === 'thread')) return corner ? 'the way around' : dp !== undefined ? 'the way around, ' + provDepth(dp) : null;
    if (pj === 'top' || !pj) return corner ? 'the route turning, as the words go in or come out' : ch === '\u2502' ? 'the route, going in or out' : ch === '\u2500' ? 'the route, along a clause' : null;
    return null;
  }
  var provTip = null;
  function provHide() { if (provTip) provTip.style.display = 'none'; }
  function provAt(el, e) {
    var f = el.__bkCur || el.__bkView, c = el.__bkView; if (!f || !f.r) { provHide(); return; }
    var br = el.getBoundingClientRect(), k = Math.floor((e.clientX - br.left - 1) / el.__bkCw), r = Math.floor((e.clientY - br.top - 1) / el.__bkRh); provAt.k = k;
    var ch = f.r[r] ? f.r[r].charAt(k) : ''; if (!ch || ch === ' ') { provHide(); return; }
    var own = f.own || (f.mk || f.ti ? f : c), text = own === c ? el.__bkText : null, mk = own.mk || vidMarks(own, text) || [], m = null, i;
    var pig = f.p[r] ? f.p[r].charAt(k) : '', pname = window.VIDOUTE ? window.VIDOUTE.PAL[VID_PIG.indexOf(pig)] || '' : '', col = PALETTE[VID_PIG.indexOf(pig)] || '#cfcbc2';
    for (i = 0; i < mk.length; i++) if (mk[i][0] === ch && (!mk[i][3] || mk[i][3] === pname)) { m = mk[i]; break; }   // the glyph and its pigment both: a ripple of the road is not the wind
    var why = f.y && f.y[r] ? f.y[r].charAt(k) : '', sy = own.sy || '', dd = /[0-3]/.test(why) ? +why : -1;
    if (why && why !== 'w' && why !== 'l' && why !== 'n') m = null;      // the painter's own reason, when it gave one, before any guess from the glyph
    if (why === 'n' && '()|_'.indexOf(ch) < 0 && own.ft && own.ft !== '*') { m = null; for (i = 0; i < mk.length; i++) if (mk[i][1] === own.ft) { m = mk[i]; break; } }   // the held thing is drawn with a typewriter key: found by its word
    var say, rt = why === 'n' ? (ch === '(' || ch === ')' || ch === '|' || ch === '_' ? (own.fh === 'held' ? 'your two hands, open, presenting it' : own.fh === 'board' ? 'your two hands, holding the country as a board, to be read up close' : 'your two hands, at the foot of the view') : m ? null : 'a star held at your feet: the deepest the words go, where nothing is named') : why && why !== 'w' && why !== 'l' ? provWhy(why, dd, sy, own, ch, pname) : m ? null : provRoute(ch, pname, own);
    if (why === 'n' && m) m = [m[0], (own.fh === 'held' ? 'in your hands, as the words hold it: ' : 'held at your feet, the deepest the words go: ') + m[1], m[2], m[3]];
    if (rt) say = rt + '  <span style="color:#6f7782">' + (/[0-3ckd]/.test(why) || !why ? 'the route' : why === 'e' ? 'the road' : why === 'n' ? (own.fh === 'held' || own.fh === 'board' ? 'in hand' : 'the point reached') : why === 'p' ? 'pointed' : 'the field\u2019s own') + '</span>';
    else if (m) say = '<b style="color:#cfcbc2;font-weight:normal">' + vidEsc(m[1]) + '</b>' + (m[2] ? '  <span style="color:#6f7782">\u201c' + vidEsc(m[2]) + '\u201d</span>' : '');
    else if (ch === '\u00b7' && pname !== 'star') say = 'dust, ' + (own.f || 'the field');
    else if (ch === 'v' && own.f === 'night') say = 'a bat, at night';
    else if (PROV_SAY[ch]) say = PROV_SAY[ch] + (PROV_FURN.indexOf(ch) >= 0 && own.st && own.st !== 'hills' ? ', of the ' + vidEsc(own.st) : '') + '  <span style="color:#6f7782">the field\u2019s own</span>';
    else say = vidEsc(pname || 'a mark') + '  <span style="color:#6f7782">the field\u2019s own</span>';
    if (!provTip) { provTip = document.createElement('div'); provTip.id = 'bk-prov'; provTip.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;display:none;background:#0b0d10;border:1px solid #1d2026;border-radius:5px;padding:2px 7px;font:11px ' + VID_FACE + ';color:#8f98a5;white-space:pre;box-shadow:0 2px 10px rgba(0,0,0,.6)'; document.body.appendChild(provTip); }
    provTip.innerHTML = '<span style="display:inline-block;width:1.2em;text-align:center;color:' + col + '">' + vidEsc(ch) + '</span> ' + say;
    provTip.style.display = 'block';
    var tw = provTip.offsetWidth, x = e.clientX + 14, y = e.clientY + 16; if (x + tw > window.innerWidth - 6) x = e.clientX - tw - 10; if (y + 24 > window.innerHeight) y = e.clientY - 26;
    provTip.style.left = x + 'px'; provTip.style.top = y + 'px';
  }
  function vidEsc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // THE STEADY PLAYER (user1, 22 x 2026: "playback jittering ... One frame leaps in"): the glass is drawn afresh every few seconds, and each
  // panel was drawn afresh with its kept view, which then stood for one tick in the middle of whatever frame was playing -- the GIF, never
  // redrawn, never leapt. Now a panel drawn while its loop plays is drawn at the frame playing, its colours already turned.
  function vidBoardNow(el) {
    if (!tiltState.auto || sleeping) return;
    var pk = el.getAttribute('data-bk-play'), st = pk && VID.play[pk];
    if (st && st.frames && st.frames.length > 1) { var key = el.__bkCw.toFixed(2), htm = st.htm[key] || (st.htm[key] = st.frames.map(function (f) { return vidCells(f, el.__bkCw, el.__bkRh); })); el.innerHTML = htm[st.i]; el.__bkShown = st.i; el.__bkCur = st.frames[st.i]; }
    cycStep(el, PLAY.n);
  }
  function vidAnyPlace(h, L) {
    var text = flatText(h).text || '', words = text.split(/\s+/).filter(function (q) { return q; }).length;
    if (!words) { vidUnpad(h); return; }
    dress(h, 'data-bk-vid-pad'); vidFont();
    var cs = getComputedStyle(h), r = h.getBoundingClientRect(), fsz = parseFloat(cs.fontSize) || 16, ch = fsz * 0.6, w = WYRD.w * 0.85 * ch;
    var padT = parseFloat(cs.paddingTop) || 0, padB = parseFloat(cs.paddingBottom) || 0, lineH = parseFloat(cs.lineHeight) || fsz * 1.6, x = r.left + 2, top = r.top + padT + 2, drew = 0;
    var gap = Math.max(parseFloat(cs.marginBottom) || 0, 8);   // a view may reach into the paragraph's own margin below, not past it
    function fit(lines, avail) {                        // the height for the room: by lines, then smaller while it would not fit
      var hh = window.VIDOUTE ? window.VIDOUTE.heightFor(lines) : 5, rowPx = Math.round(w / 25 * VID_ROW * 10) / 10;
      while (hh > 3 && rowPx * hh + vidPlaqueH(w) + 2 > avail + gap - 6) hh -= 2;   // a gutter of six pixels between one panel's card and the next panel, as between a strip's panels
      return hh;
    }
    if (h.getAttribute('data-bk-raked') === '2' && h.firstChild && h.firstChild.nodeType === 3) {   // a raked paragraph: a view for each sentence, at its first line
      var node = h.firstChild, raw = node.data, A = raw.replace(/\n/g, ' '), sents = vSentSpans(A, 0, A.length), ys = [];
      sents.forEach(function (sn) { var rg = document.createRange(); rg.setStart(node, sn[0]); rg.setEnd(node, Math.min(raw.length, sn[0] + 1)); var q = rg.getClientRects(); ys.push(q.length ? q[0].top : null); });
      sents.forEach(function (sn, i) {
        if (ys[i] === null) return;
        var lines = raw.slice(sn[0], sn[1]).split('\n').length, next = i + 1 < ys.length && ys[i + 1] !== null ? ys[i + 1] : r.bottom - padB;
        var c = vidView(A.slice(sn[0], sn[1]), fit(lines, next - ys[i])); if (c) { var yy = Math.max(ys[i] + 2, VID.colBottom + 6); VID.colBottom = yy + vidBoard(c, x, yy, w, L, 'a view of this sentence', sents.length > 1 ? i + 1 : 0, A.slice(sn[0], sn[1])); drew++; }
      });
    } else {                                            // a paragraph, opened by a vent or not: one view, sized by its lines
      var lines = Math.max(1, Math.round((r.height - padT - padB) / lineH)), hh1 = fit(lines, r.height - padT - padB);
      if (top < VID.colBottom + 6) top = VID.colBottom + 6;   // THE STRIP FLOWS (22 x): a panel taller than its paragraph pushes the next one down rather than lying over it
      var c1 = vidView(text, hh1); if (c1) { VID.colBottom = top + vidBoard(c1, x, top, w, L, 'a view of this paragraph', 0, text); drew++; }
      else if (tiltState.auto) {                         // THEM ALL (user1, 22 x: "some short paragraphs, not selected, will yet yield Vidoutes if unrolled ... What if we were to
        var A2 = text.replace(/\n/g, ' '), ss = vSentSpans(A2, 0, A2.length), views = [];   // autoplay them all, on a loop?"): no view of its own, so its sentences' views in turn, as a slideshow
        if (ss.length > 1) ss.forEach(function (sn) { var cv_ = vidView(A2.slice(sn[0], sn[1]), hh1); if (cv_) { vidMarks(cv_, A2.slice(sn[0], sn[1])); views.push(cv_); } });
        if (views.length) {
          var pk2 = 'S' + hh1 + ':' + vidHash(text.replace(/\s+/g, ' ').trim());
          VID.play[pk2] = VID.play[pk2] || { text: text, c: views[0], i: 0, tick: 0, htm: {}, frames: views, dur: views.map(function () { return 12; }) };
          VID.colBottom = top + vidBoard(views[0], x, top, w, L, 'views of this paragraph\'s sentences, in turn', 0, null);
          var lastB = L.lastElementChild; while (lastB && !lastB.hasAttribute('data-bk-board')) lastB = lastB.previousElementSibling;
          if (lastB) { lastB.setAttribute('data-bk-play', pk2); vidBoardNow(lastB); }
          drew++;
        }
      }
    }
    // (the empty frame's grey line, where nothing could be drawn, is thanked and retired: user1, 22 x, "it can be thanked and made not to exist for words without views")
  }
  function vidUnpad(h) { if (h.hasAttribute('data-bk-vid-pad')) { h.removeAttribute('data-bk-vid-pad'); if (h.style.paddingLeft) h.style.paddingLeft = ''; } }
  function vidUnpadAll() { var all = document.querySelectorAll('[data-bk-vid-pad]'), i; for (i = 0; i < all.length; i++) vidUnpad(all[i]); }
  // THE PLAYER [ # ] (user1, 22 x 2026: "Autoplay Vidoutes (and pause when out of sight?) must be a new minibutton after Vidoutes' ... A 1-char
  // button suggesting directors' clapper, framenum, and perhaps stacked animation cels"): every panel in sight plays its making, looping,
  // the kept view held a moment at the end; out of sight, or with the page hidden, or Bela asleep, nothing plays. One clock for all, and
  // the makings worked out two at a time so the processor is never asked for many at once.
  var PLAY = { t: null, ms: 170, n: 0 };
  // THE MASTER LOOP of a panel: its making, then (for a paragraph of several sentences) each sentence's making and its view, 160 frames at most;
  // with how many ticks each frame is held. The player plays it, and the Outputter writes the same loop to its GIF and ANSI (user1, 22 x)
  function vidLoop(text, c) {
    var mf = vidMaking(text, c).slice(), dur = mf.map(function () { return 1; }); dur[dur.length - 1] = 8;
    var A3 = text.replace(/\n/g, ' '), ss3 = vSentSpans(A3, 0, A3.length);
    // every sentence's own making too, not only its finished view, so nothing a full tilt-down would show is missed (user1, 22 x: "I'd hate to miss anything")
    if (ss3.length > 1) ss3.forEach(function (sn) { var stxt = A3.slice(sn[0], sn[1]), sv = c.tr ? null : vidView(stxt, c.h, true); if (sv && !sv.tr) { vidMarks(sv, stxt); var sm = vidMaking(stxt, sv); sm.forEach(function (f, q) { if (mf.length < 160) { mf.push(f); dur.push(q === sm.length - 1 ? 12 : 1); } }); } });
    return { frames: mf, dur: dur };
  }
  function playTick() {
    if (!live() || sleeping || document.hidden || !tiltState.auto) return;
    var bs = document.querySelectorAll('[data-bk-play]'), vh = window.innerHeight, made = 0, i;
    for (i = 0; i < bs.length; i++) {
      var b = bs[i], r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh || !r.width) continue;
      var st = VID.play[b.getAttribute('data-bk-play')]; if (!st) continue;
      if (!st.frames) {                                  // the making, then (for a paragraph of several sentences) each sentence's own view in turn: all its unrollings, looping
        if (made >= 2) continue; made++;
        var lp = vidLoop(st.text, st.c); st.frames = lp.frames; st.dur = lp.dur;
      }
      if (st.frames.length < 2) continue;
      var key = b.__bkCw.toFixed(2), htm = st.htm[key] || (st.htm[key] = st.frames.map(function (f) { return vidCells(f, b.__bkCw, b.__bkRh); }));
      if (b.__bkShown !== st.i) { b.innerHTML = htm[st.i]; b.__bkShown = st.i; b.__bkCur = st.frames[st.i]; }
    }
    PLAY.n++; var all = document.querySelectorAll('[data-bk-board]');   // the colours of water, fire and stars turn in every panel in sight, playing or still
    for (i = 0; i < all.length; i++) { var rb = all[i].getBoundingClientRect(); if (rb.bottom < 0 || rb.top > vh || !rb.width) continue; cycStep(all[i], PLAY.n); }
    Object.keys(VID.play).forEach(function (k) {         // each frame held its own number of ticks: a making's frames one, its kept view eight, a sentence's view twelve
      var st = VID.play[k]; if (!st.frames || st.frames.length < 2) return;
      st.tick = (st.tick || 0) + 1; if (st.tick >= ((st.dur && st.dur[st.i]) || 1)) { st.tick = 0; st.i = (st.i + 1) % st.frames.length; }
    });
  }
  function playSet(on) { clearInterval(PLAY.t); PLAY.t = null; if (on) PLAY.t = setInterval(playTick, PLAY.ms); else { var bs = document.querySelectorAll('[data-bk-play]'), i; for (i = 0; i < bs.length; i++) { var st = VID.play[bs[i].getAttribute('data-bk-play')]; if (st) { bs[i].innerHTML = vidCells(st.c, bs[i].__bkCw, bs[i].__bkRh); bs[i].__bkShown = -1; bs[i].__bkCur = st.c; } } var cs = document.querySelectorAll('[data-bk-cyc]'); for (i = 0; i < cs.length; i++) if (cs[i].__c0) cs[i].style.color = cs[i].__c0; } }   // stopped: every turned colour back to its own
  // THE PENTIMENTI (user1, 22 x 2026: "pentimento is something like provenance, and is welcomed"): while you compose in the bluebox its words
  // are noted every second they change; when they are sent, each paragraph keeps its own versions, and its making is then the true one --
  // the changes of mind included -- rather than the ideal pour. Kept in this browser only, 300 paragraphs at most.
  var PENT = { key: 'blinken-pentimenti', snaps: [], last: '', at: 0, map: {} };
  try { PENT.map = JSON.parse(localStorage.getItem(PENT.key) || '{}') || {}; } catch (e) { PENT.map = {}; }
  function pnorm(t) { return String(t || '').replace(/[\s⠀]+/g, ' ').trim(); }
  function pparas(t) { return String(t || '').split(/\n[\s⠀]*\n/).map(pnorm).filter(function (q) { return q; }); }
  function pentFor(text) { var v = PENT.map[vidHash(pnorm(text))]; return v ? v.v : null; }
  function pentKeep(final) {
    var snaps = PENT.snaps.concat([final]), F = pparas(final), now = Date.now();
    F.forEach(function (fp, i) {
      var vs = [], last = ''; snaps.forEach(function (sn) { var p = pparas(sn)[i]; if (p && p !== last) { vs.push(p); last = p; } });
      if (vs[vs.length - 1] !== fp) vs.push(fp);
      if (vs.length > 40) { var pick = []; for (var k = 0; k < 40; k++) pick.push(vs[Math.round(k * (vs.length - 1) / 39)]); vs = pick; }
      if (vs.length > 1) PENT.map[vidHash(fp)] = { v: vs, t: now };
    });
    var ks = Object.keys(PENT.map); if (ks.length > 300) ks.sort(function (a, b) { return PENT.map[a].t - PENT.map[b].t; }).slice(0, ks.length - 300).forEach(function (k) { delete PENT.map[k]; });
    try { localStorage.setItem(PENT.key, JSON.stringify(PENT.map)); } catch (e) {}
  }
  listen(ta, 'input', function () {
    var v = ta.value, now = Date.now();
    if (!v.trim()) { if (PENT.last.trim().length > 20) pentKeep(PENT.last); PENT.snaps = []; PENT.last = ''; return; }   // emptied: by a send, the words just gone were the sent ones
    if (now - PENT.at > 900 && v !== PENT.snaps[PENT.snaps.length - 1]) { PENT.snaps.push(v); PENT.at = now; if (PENT.snaps.length > 160) PENT.snaps.splice(1, 1); }
    PENT.last = v;
  });
  // THE OUTPUTTER (user1, 22 x 2026: "If one wished to shift-alt-click on one of them, could that summon an Outputter, leaning on the browser's
  // ability to swizzle a .png, a .gif(!)? ... do the barest opts (our own deltas) and feed them to whatever the browser thinks a .gif is"):
  // Shift+Alt (or Shift+Ctrl) over a panel promises it; a click opens a small window with the view as a PNG (the browser's own encoder) and
  // its making as an animated GIF -- a little encoder of our own, since browsers write no GIF: one palette of the pictures' own 256 commonest colours, and after the
  // first frame only the rectangle that changed is written, the rest left standing (our deltas). Both can be saved.
  function vidRaster(f, c, title, seal) {               // one frame drawn to a canvas: sky, frame, cells, and the title card under it
    var cw = 12, rh = Math.round(cw * VID_ROW), W_ = 25 * cw + 2, Hh = f.r.length * rh, cardH = 20, cv = document.createElement('canvas');
    cv.width = W_; cv.height = Hh + cardH + 2; var g = cv.getContext('2d'), sk = vidSky(c);
    g.fillStyle = '#0b0d10'; g.fillRect(0, 0, cv.width, cv.height);
    var gr = g.createLinearGradient(0, 1, 0, 1 + Hh); vidStops(c).forEach(function (q) { gr.addColorStop(q[0], q[1] || '#0b0d10'); }); g.fillStyle = gr; g.fillRect(1, 1, W_ - 1, Hh);
    if (sk.stripe) { g.save(); g.beginPath(); g.rect(1, 1, W_ - 1, Hh); g.clip(); g.strokeStyle = sk.stripe + '33'; g.lineWidth = 3; for (var sx = -Hh; sx < W_; sx += 9) { g.beginPath(); g.moveTo(sx, Hh); g.lineTo(sx + Hh, 0); g.stroke(); } g.restore(); }
    g.fillStyle = '#565b64'; g.fillRect(0, 0, W_, 1); g.fillRect(0, 0, 1, Hh);
    g.font = (cw * 2) + 'px ' + VID_FACE; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var r = 0; r < f.r.length; r++) for (var k = 0; k < 25; k++) { var ch = f.r[r].charAt(k); if (ch === ' ') continue; g.fillStyle = vidInk(f, f.own || c, r, k); g.fillText(ch, 1 + k * cw + cw / 2, 1 + r * rh + rh / 2); }
    g.font = (cw * 1.5) + 'px ' + VID_FACE; g.textAlign = 'right'; g.fillStyle = '#8f98a5'; g.fillText(String(title || '').toLowerCase(), W_ - 2, Hh + cardH / 2 + 2);
    if (seal) { var sc = sealCanvas(seal, 16); g.save(); g.beginPath(); g.arc(9, Hh + cardH / 2 + 2, 8, 0, 2 * Math.PI); g.clip(); g.imageSmoothingEnabled = false; g.drawImage(sc, 1, Hh + cardH / 2 - 6, 16, 16); g.restore(); }
    return cv;
  }
  function gifEncode(frames, W_, H_, delays) {          // frames: RGBA arrays of W_ x H_; delays in hundredths of a second
    var out = [], i, k;
    function b(x) { out.push(x & 255); } function w16(x) { b(x); b(x >> 8); } function str(s_) { for (var q = 0; q < s_.length; q++) b(s_.charCodeAt(q)); }
    // the palette from the pictures themselves: colours counted at five bits a channel across every frame, the 256 commonest kept (their
    // true average), every other colour sent to its nearest -- so a dark sky stays the dark sky, not the nearest step of a fixed cube
    var count = new Map(), sum = new Map();
    frames.forEach(function (rgba) { for (var p = 0; p < rgba.length; p += 4) { var key = (rgba[p] >> 3) << 10 | (rgba[p + 1] >> 3) << 5 | (rgba[p + 2] >> 3); count.set(key, (count.get(key) || 0) + 1); var sm = sum.get(key); if (!sm) sum.set(key, sm = [0, 0, 0]); sm[0] += rgba[p]; sm[1] += rgba[p + 1]; sm[2] += rgba[p + 2]; } });
    var keys = Array.from(count.keys()).sort(function (a2, b2) { return count.get(b2) - count.get(a2); }).slice(0, 256), pal = keys.map(function (key) { var n = count.get(key), sm = sum.get(key); return [Math.round(sm[0] / n), Math.round(sm[1] / n), Math.round(sm[2] / n)]; });
    while (pal.length < 256) pal.push([0, 0, 0]);
    var near = new Map(); keys.forEach(function (key, j) { near.set(key, j); });
    function idx(r, g, bl) {
      var key = (r >> 3) << 10 | (g >> 3) << 5 | (bl >> 3), j = near.get(key); if (j !== undefined) return j;
      var best = 0, bd = 1e9; for (var q = 0; q < keys.length; q++) { var dr = pal[q][0] - r, dg = pal[q][1] - g, db = pal[q][2] - bl, dd = dr * dr + dg * dg + db * db; if (dd < bd) { bd = dd; best = q; } }
      near.set(key, best); return best;
    }
    str('GIF89a'); w16(W_); w16(H_); b(0xF7); b(0); b(0);
    for (i = 0; i < 256; i++) { b(pal[i][0]); b(pal[i][1]); b(pal[i][2]); }
    str('\x21\xFF\x0BNETSCAPE2.0\x03\x01'); w16(0); b(0);                       // loop for ever
    var note_ = 'vidoute \u00b7 For Garge xo'; note_ = unescape(encodeURIComponent(note_));   // the comment pocket (user1, 22 x: "For Garge xo", one of Herriman's own names for himself)
    b(0x21); b(0xFE); for (var cq = 0; cq < note_.length; cq += 255) { var cn = Math.min(255, note_.length - cq); b(cn); for (var cj = 0; cj < cn; cj++) b(note_.charCodeAt(cq + cj)); } b(0);
    var prev = null;
    frames.forEach(function (rgba, fi) {
      var ix = new Uint8Array(W_ * H_); for (i = 0; i < W_ * H_; i++) ix[i] = idx(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]);
      var x0 = 0, y0 = 0, x1 = W_ - 1, y1 = H_ - 1;
      if (prev) {                                       // our deltas: only the rectangle that changed since the last frame
        x0 = W_; y0 = H_; x1 = -1; y1 = -1;
        for (var y = 0; y < H_; y++) for (var x = 0; x < W_; x++) if (ix[y * W_ + x] !== prev[y * W_ + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) { x0 = 0; y0 = 0; x1 = 0; y1 = 0; }
      }
      var rw = x1 - x0 + 1, rh_ = y1 - y0 + 1, sub = new Uint8Array(rw * rh_);
      for (var yy = 0; yy < rh_; yy++) for (var xx = 0; xx < rw; xx++) sub[yy * rw + xx] = ix[(y0 + yy) * W_ + x0 + xx];
      b(0x21); b(0xF9); b(4); b(0x04); w16(delays[fi] || 10); b(0); b(0);        // graphic control: leave in place, the delay
      b(0x2C); w16(x0); w16(y0); w16(rw); w16(rh_); b(0);
      var data = lzw(sub, 8); b(8); for (k = 0; k < data.length; k += 255) { var n = Math.min(255, data.length - k); b(n); for (var j = 0; j < n; j++) b(data[k + j]); } b(0);
      prev = ix;
    });
    b(0x3B);
    return new Uint8Array(out);
  }
  function lzw(ixs, minSize) {                          // GIF's LZW, after omggif's encoder: emit, then grow the code size, then add the entry
    var clear = 1 << minSize, eoi = clear + 1, size = minSize + 1, next = eoi + 1, table = new Map(), out = [], cur = 0, shift = 0;
    function emit(c_) { cur |= c_ << shift; shift += size; while (shift >= 8) { out.push(cur & 255); cur >>>= 8; shift -= 8; } }
    emit(clear);
    var key = ixs[0];
    for (var i = 1; i < ixs.length; i++) {
      var k = ixs[i], ck = key << 8 | k, code = table.get(ck);
      if (code === undefined) {
        emit(key);
        if (next === 4096) { emit(clear); next = eoi + 1; size = minSize + 1; table.clear(); }
        else { if (next >= (1 << size)) size++; table.set(ck, next++); }
        key = k;
      } else key = code;
    }
    emit(key); emit(eoi); if (shift > 0) out.push(cur & 255);
    return out;
  }
  var CRC_T = null;
  function crc32(bytes) { if (!CRC_T) { CRC_T = []; for (var n = 0; n < 256; n++) { var c_ = n; for (var k = 0; k < 8; k++) c_ = c_ & 1 ? 0xEDB88320 ^ (c_ >>> 1) : c_ >>> 1; CRC_T[n] = c_ >>> 0; } } var c = 0xFFFFFFFF; for (var i = 0; i < bytes.length; i++) c = CRC_T[(c ^ bytes[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function pngNote(blob, cb) {                          // the PNG's pocket: two tEXt chunks after its header -- Software, and the Comment "For Garge xo"
    blob.arrayBuffer().then(function (ab) {
      var src = new Uint8Array(ab), chunks = [], add = function (key, val) { var t = unescape(encodeURIComponent(key + '\0' + val)), body = new Uint8Array(4 + t.length), i; body.set([116, 69, 88, 116]); for (i = 0; i < t.length; i++) body[4 + i] = t.charCodeAt(i);
        var ch = new Uint8Array(12 + t.length), dv = new DataView(ch.buffer); dv.setUint32(0, t.length); ch.set(body, 4); dv.setUint32(8 + t.length, crc32(body)); chunks.push(ch); };
      add('Software', 'vidoute (Bela)'); add('Comment', 'For Garge xo');
      var cut = 8 + 12 + new DataView(ab).getUint32(8), total = src.length + chunks.reduce(function (a, c_) { return a + c_.length; }, 0), out = new Uint8Array(total), at = cut;   // after IHDR
      out.set(src.subarray(0, cut), 0); chunks.forEach(function (c_) { out.set(c_, at); at += c_.length; }); out.set(src.subarray(cut), at);
      cb(new Blob([out], { type: 'image/png' }));
    }, function () { cb(blob); });
  }
  var outputter = null;
  function outputterClose() { provHide(); if (outputter) { outputter.remove(); outputter = null; document.removeEventListener('keydown', outputterKey, true); } }
  function outputterKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); outputterClose(); } }
  // THE NAME (user1, 22 x 2026: "[Vidoute title] | [five words of surrounding context] | [day-month-year] ... to avoid name clashes"): the
  // bar | is one Windows will not have in a name, so its look-alike stands in: U+01C0, a letter (the dental click), drawn as a plain bar
  function vidFileName(c, text, ext) {
    var clean = function (t) { return String(t || '').toLowerCase().replace(/[\\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/[.,;!]+(\s|$)/g, '$1').replace(/\s+/g, ' ').trim(); };
    var d = new Date(), dd = String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
    return (clean(c.ti) || 'view') + ' ǀ ' + (clean(vidCtx(c, text)) || '...') + ' ǀ ' + dd + '.' + ext;
  }
  function vidSaveAs(blob, name, mime, ext) {           // the Save window, prompting with the name; where the browser has none, the plain download
    if (typeof window.showSaveFilePicker === 'function') {
      var ac = {}; ac[mime] = ['.' + ext.split('.').pop()];
      window.showSaveFilePicker({ suggestedName: name, types: [{ description: ext, accept: ac }] }).then(function (h) { return h.createWritable().then(function (w) { return w.write(blob).then(function () { return w.close(); }); }); }, function () {});
      return;
    }
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  // THE MOVIE FOR A TERMINAL (user1, 22 x 2026: "I'd love to see such a movie in a terminal"): the same master loop as ANSI -- true colour,
  // the view's sky behind, every glyph set at its own column so a glyph the terminal draws wide cannot push the rest; after the first frame
  // only the cells that changed are written (our deltas again). Each tick of the loop begins with a bare cursor-home, ESC [ H, so a player that
  // shows one piece per 170 ms plays it at the player's own pace (satchel\vidoute\ansplay.ps1, ansplay.py); typed or cat'ed, it shows the last frame.
  function vidAnsi(frames, dur, c, title) {
    var E = '\x1b[', out = [], H_ = frames[0].r.length, W_ = 25, prev = null, lastFg = '', lastBg = '';
    function rgb(hx) { hx = String(hx || '#cfcbc2'); return parseInt(hx.slice(1, 3), 16) + ';' + parseInt(hx.slice(3, 5), 16) + ';' + parseInt(hx.slice(5, 7), 16); }
    function mixh(a2, b2, t) { var o = '#', i; for (i = 1; i < 7; i += 2) o += Math.round(parseInt(a2.slice(i, i + 2), 16) * (1 - t) + parseInt(b2.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0'); return o; }
    function skyRow(own, r) { return vidStopAt(vidStops(own), (r + 0.5) / H_, '#0b0d10'); }
    out.push('\x1b]0;vidoute · ' + title + ' · For Garge xo\x07' + E + '0m' + E + '2J' + E + '?25l');
    var lastTitle = null;
    frames.forEach(function (f, fi) {
      var own = f.own || (f.ti ? f : c), s_ = E + 'H', at = -1;
      for (var r = 0; r < H_; r++) {
        var bg = skyRow(own, r);
        for (var k = 0; k < W_; k++) {
          var ch = f.r[r].charAt(k) || ' ', pg = f.p[r] ? f.p[r].charAt(k) : ' ', fg = vidInk(f, own, r, k), cell = ch + fg + bg;
          if (prev && prev[r * W_ + k] === cell) continue;
          if (at !== r * W_ + k) s_ += E + (r + 1) + ';' + (k + 1) + 'H';
          if (bg !== lastBg) { s_ += E + '48;2;' + rgb(bg) + 'm'; lastBg = bg; }
          if (ch !== ' ' && fg !== lastFg) { s_ += E + '38;2;' + rgb(fg) + 'm'; lastFg = fg; }
          s_ += ch; at = ch.charCodeAt(0) < 128 ? r * W_ + k + 1 : -1;   // after a glyph beyond ASCII, where the cursor stands is the terminal's guess: set it again
        }
      }
      var tt = String(own.ti || title || '').toLowerCase();
      if (tt !== lastTitle) { s_ += E + '0m' + E + (H_ + 1) + ';1H' + E + '2K' + E + '38;2;143;152;165m' + ' '.repeat(Math.max(0, W_ - tt.length)) + tt.slice(0, W_); lastFg = ''; lastBg = ''; lastTitle = tt; }
      prev = []; for (var r2 = 0; r2 < H_; r2++) { var bg2 = skyRow(own, r2); for (var k2 = 0; k2 < W_; k2++) { var pg2 = f.p[r2] ? f.p[r2].charAt(k2) : ' '; prev.push((f.r[r2].charAt(k2) || ' ') + vidInk(f, own, r2, k2) + bg2); } }
      out.push(s_);
      for (var q = 1; q < (dur[fi] || 1); q++) out.push(E + 'H');            // the frame held: one more tick each
    });
    out.push(E + '0m' + E + (H_ + 2) + ';1H' + E + '?25h\r\n');
    return out.join('');
  }
  // THE BELAGRAM (*.yowl.txt): the kept view as a card -- headline, the art, and its colourburst shadow, in glyph mode or (where a glyph is two
  // colours) positional -- then the paragraph's own words under it, as a YOWL carries them
  function vidYowl(c, text) {
    var V_ = window.VIDOUTE, rows = c.r.map(function (row, r) { return Array.from(row).map(function (ch, k) { return ch === ' ' ? null : [ch, V_.PAL[VID_PIG.indexOf(c.p[r].charAt(k))] || 'ink']; }); });
    return V_.card({ rows: rows }, String(c.ti || 'a view')) + '\n\n' + String(text || '').replace(/\s+/g, ' ').trim() + '\n\n-- vidoute (Bela) · For Garge xo\n';
  }
  function outputterOpen(c, text, pk) {
    outputterClose(); vidFont(); vidMarks(c, text);
    var title = String(c.ti || 'view').toLowerCase();
    var d = document.createElement('div'); d.id = 'bk-outputter'; outputter = d;
    // its window frame (user1, 22 x 2026: "Let it have its windowframe, too - 1px solid #eeddffaa - border-radius: 2px"), and the room it lacked: 145 px more
    d.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483640;background:#0b0d10;border:1px solid #eeddffaa;border-radius:2px;padding:14px 16px;box-shadow:0 8px 40px rgba(0,0,0,.7);font:12px Iosevka, Consolas, monospace;color:#8f98a5;display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;padding-right:52px';   // (22 x: where the window is narrow, the words' column goes under the pictures, never squeezed to a letter's width)
    d.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    function col(label) { var k = document.createElement('div'); k.style.cssText = 'display:flex;flex-direction:column;gap:6px;align-items:flex-start;flex:0 0 auto'; var t = document.createElement('div'); t.textContent = label; k.appendChild(t); d.appendChild(k); return k; }
    function btn(k, label, make, mime, ext) {             // a clickable, its bounds always shown, Bela's blue under the pointer
      var a = document.createElement('span'); a.setAttribute('data-bk-click', '1'); a.textContent = label; a.style.cssText = 'cursor:pointer;color:#cfcbc2;border:1px solid #3a3f47;border-radius:6px;padding:1px 8px';
      a.onclick = function (e) { e.stopPropagation(); var r_ = make(); if (r_) vidSaveAs(r_.blob, r_.name, mime, ext); }; k.appendChild(a); return a;
    }
    function nameLine(k, name) { var n_ = document.createElement('div'); n_.textContent = name; n_.style.cssText = 'color:#565b64;font-size:11px;white-space:normal;word-break:break-word'; k.appendChild(n_); }
    var kp = col('png · the view'), kg = col('gif · its loop'), kt = col('words · a terminal, a yowl');
    kt.style.flex = '1 1 300px'; kt.style.minWidth = '300px'; kp.style.flex = kg.style.flex = 'none'; kp.style.width = kg.style.width = '304px';   // the pictures' columns their own size from the start, so nothing moves as they arrive; the words' column the rest, or a row of its own
    var x_ = document.createElement('span'); x_.setAttribute('data-bk-click', '1'); x_.textContent = '✕'; x_.title = 'close (escape)';
    x_.style.cssText = 'cursor:pointer;color:#8f98a5;width:28px;height:28px;flex:none;display:flex;align-items:center;justify-content:center;font:18px Iosevka, Consolas, monospace;line-height:1;border:1px solid #3a3f47;border-radius:5px;box-sizing:border-box;position:absolute;top:8px;right:8px';   // a large square X, its bounds drawn (user1, 22 x: no "consequential invisibles")
    x_.onclick = outputterClose; d.appendChild(x_);
    document.body.appendChild(d); document.addEventListener('keydown', outputterKey, true);
    // THE LOOP: the panel's own, as the player plays it (the master loop: the making, each sentence's making and view), or worked out now
    var st = pk && VID.play[pk], lp = st && st.frames ? { frames: st.frames, dur: st.dur } : text ? vidLoop(text, c) : { frames: [c], dur: [12] };
    var still = vidRaster(c, c, title, c.s), pngBlob = null, gifBlob = null;
    d.style.width = Math.min(window.innerWidth - 24, 304 * 2 + 300 + 2 * 18 + 16 + 52 + 145) + 'px';   // its width set once, before anything arrives: two pictures, the words' column, and the 145 px it lacked
    var pngName = vidFileName(c, text, 'png'), gifName = vidFileName(c, text, 'gif'), ansName = vidFileName(c, text, 'ans'), yowlName = vidFileName(c, text, 'yowl.txt');
    still.toBlob(function (blob0) { pngNote(blob0, function (blob) { pngBlob = blob; var im = new Image(); im.src = URL.createObjectURL(blob); im.style.cssText = 'border-radius:3px'; kp.insertBefore(im, kp.children[1]); }); }, 'image/png');
    btn(kp, 'save png', function () { return pngBlob && { blob: pngBlob, name: pngName }; }, 'image/png', 'png'); nameLine(kp, pngName);
    var note = document.createElement('div'); note.textContent = 'making the gif...'; kg.appendChild(note);
    var ans = vidAnsi(lp.frames[lp.frames.length - 1] === c ? lp.frames : lp.frames.concat([c]), lp.frames[lp.frames.length - 1] === c ? lp.dur : lp.dur.concat([1]), c, title), yowl = vidYowl(c, text);   // ending on the paragraph's own view, so typed or cat'ed it shows that
    var pre = document.createElement('div'); pre.style.cssText = 'margin:0;font:11px ' + VID_FACE + ';color:#8f98a5;max-width:100%;overflow:hidden;white-space:nowrap';   // the card as it will read, every character in its own box so the preview keeps the grid
    yowl.split('\n\n')[0].split('\n').forEach(function (ln) { var row = document.createElement('div'); row.style.cssText = 'height:14px;line-height:14px'; (ln.match(/[\s\S][\u0300-\u036f]*/g) || []).forEach(function (g_) { var b_ = document.createElement('span'); b_.style.cssText = 'display:inline-block;width:6.6px;text-align:center;overflow:visible'; b_.textContent = g_; row.appendChild(b_); }); pre.appendChild(row); });   // the blanks kept (a braille blank draws nothing), so what is selected and copied is the card itself
    kt.appendChild(pre);
    var cp_ = btn(kt, 'copy yowl', function () { try { navigator.clipboard.writeText(yowl).then(function () { cp_.textContent = 'copied'; setTimeout(function () { cp_.textContent = 'copy yowl'; }, 1400); }, function () { cp_.textContent = 'copy refused'; }); } catch (e) {} return null; }, 'text/plain', 'txt');   // (22 x: "they don't select in the Save As")
    btn(kt, 'save ans', function () { return { blob: new Blob([ans], { type: 'text/plain' }), name: ansName }; }, 'text/plain', 'ans'); nameLine(kt, ansName);
    btn(kt, 'save yowl.txt', function () { return { blob: new Blob([yowl], { type: 'text/plain' }), name: yowlName }; }, 'text/plain', 'yowl.txt'); nameLine(kt, yowlName);
    var hint = document.createElement('div'); hint.textContent = 'in a terminal: ansplay "' + ansName + '"'; hint.style.cssText = 'color:#565b64;font-size:11px;white-space:normal'; kt.appendChild(hint);
    setTimeout(function () {                             // the frames, then the encoding, a moment later so the window shows first
      if (outputter !== d) return;
      var frames = lp.frames, cvs = frames.map(function (f) { var own = f.own || (f.ti ? f : c); return vidRaster(f, own, String(own.ti || title).toLowerCase(), own.s || c.s); }), W_ = still.width, H_ = still.height;
      var rgba = cvs.map(function (cv) { return cv.getContext('2d').getImageData(0, 0, W_, H_).data; }), delays = frames.map(function (f, i) { var dl = (lp.dur[i] || 1) * 17; return i === frames.length - 1 ? Math.max(dl, 150) : dl; });
      var gif = gifEncode(rgba, W_, H_, delays); gifBlob = new Blob([gif], { type: 'image/gif' });
      note.remove(); var im = new Image(); im.src = URL.createObjectURL(gifBlob); im.style.cssText = 'border-radius:3px'; kg.insertBefore(im, kg.children[1]);
      btn(kg, 'save gif', function () { return { blob: gifBlob, name: gifName }; }, 'image/gif', 'gif'); nameLine(kg, gifName);
      var sz = document.createElement('div'); sz.textContent = frames.length + ' frames · ' + Math.round(gif.length / 1024) + ' KB'; kg.appendChild(sz);
    }, 30);
  }
  // THE GALLERY (user1, 21 x 2026: "The Gallery-view -- simple shift-click on Vidoutes, which would not change their toggle state"): every
  // paragraph of the conversation in reading order, each with its view (the kept one, or one drawn and kept now), on one dark wall over
  // the page; a click on a panel goes to its words. Escape, or a click on the wall, closes it. Fixed over the page, never in its layout.
  var gallery = null;
  function galleryClose() { if (gallery) { gallery.remove(); gallery = null; document.removeEventListener('keydown', galleryKey, true); } }
  function galleryKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); galleryClose(); } }
  function galleryOpen() {
    if (gallery) { galleryClose(); return; }
    vidFont();
    var ps = leaves(FEED()).filter(function (p) { var t = (p.textContent || '').trim(); return t.length > 1 && !p.hasAttribute('data-bk-raked') && !p.closest(BELA_OWN) && !isShadowText(t) && !p.closest('[contenteditable], textarea, form'); });   // each paragraph once: the original, opened or not, never its raked copy
    gallery = document.createElement('div'); gallery.id = 'bk-gallery';
    gallery.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:#08090b;overflow:auto;padding:28px 32px';
    var head = document.createElement('div'); head.style.cssText = "font:13px Iosevka, Consolas, monospace;color:#8f98a5;letter-spacing:.04em;margin:0 0 18px 4px";
    // the panels at the chat's own width (user1, 22 x: "Could Gallery's match Chat's? I would love, love to have three columns of them")
    var p0 = ps[0], fs0 = p0 ? parseFloat(getComputedStyle(p0).fontSize) || 16 : 16, W_ = Math.round(WYRD.w * 0.85 * fs0 * 0.6), n = 0;
    var wall = document.createElement('div'); wall.style.cssText = 'display:grid;grid-template-columns:repeat(3,' + W_ + 'px);gap:24px 34px;justify-content:center;align-items:start';
    gallery.appendChild(head); gallery.appendChild(wall);
    head.style.textAlign = 'center';
    ps.forEach(function (p) {
      var text = flatText(p).text || ''; if (!text.trim()) return;
      var hgt = window.VIDOUTE ? window.VIDOUTE.heightFor(Math.ceil(text.length / 64)) : 5, c = vidView(text, hgt); if (!c) return;
      var cell = document.createElement('div'); cell.style.cssText = 'position:relative;width:' + W_ + 'px;cursor:pointer';
      // WHO SAID IT, quietly, as the chat marks it: a short bar at the left for the assistant's words, at the right for the user's
      var mine = !!p.closest('[data-testid="user-message"], [data-testid*="user-message"], .font-user-message');
      var bar = document.createElement('div'); bar.style.cssText = 'position:absolute;top:0;' + (mine ? 'right:-8px' : 'left:-8px') + ';width:2px;height:18px;background:#565b64;pointer-events:none';
      cell.appendChild(bar);
      cell.style.height = (vidBoard(c, 0, 0, W_, cell, '', 0, text) + 2) + 'px';
      (function (cell, text, c) {                        // hover: the making, poured a raked line at a time, looping, the kept view held a moment at the end
        var timer = null, i = 0, hold = 0, cw = W_ / 25, rh = Math.round(cw * VID_ROW * 10) / 10;
        cell.addEventListener('mouseenter', function () {
          if (tiltState.auto) return;                    // the player already plays every panel in view
          var b = cell.querySelector('[data-bk-board]'); if (!b || !window.VIDOUTE) return;
          var frames = vidMaking(text, c); if (frames.length < 2) return; i = 0; hold = 0;
          timer = setInterval(function () { if (!b.isConnected) { clearInterval(timer); return; } b.innerHTML = vidCells(frames[i], cw, rh); if (i === frames.length - 1) { if (++hold > 8) { hold = 0; i = 0; } } else i++; }, 170);
        });
        cell.addEventListener('mouseleave', function () { clearInterval(timer); var b = cell.querySelector('[data-bk-board]'); if (b) b.innerHTML = vidCells(c, cw, rh); });
      })(cell, text, c);
      cell.addEventListener('click', function (e) { e.stopPropagation(); if (e.shiftKey && (e.altKey || e.ctrlKey)) { var gb = cell.querySelector('[data-bk-board]'); outputterOpen(c, text, gb && gb.getAttribute('data-bk-play')); return; } galleryClose(); try { p.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (er) { p.scrollIntoView(); } });
      wall.appendChild(cell); n++;
    });
    head.textContent = 'gallery · ' + n + (n === 1 ? ' view' : ' views') + ' · a click goes to its words · escape to close';
    gallery.addEventListener('click', galleryClose);
    document.body.appendChild(gallery); document.addEventListener('keydown', galleryKey, true);
  }
  // [ |__| ] VIDOUTES (user1, 20 x: "one can imagine a director framing a scene with two hands, thumb and index, to make a box"): the
  // illustrations' column, left of the words -- the wyrd map now, the drawn boards to come. Shift-click: the wyrd alone, on or off.
  var vidBtn = document.createElement('span'); vidBtn.id = 'bk-vid'; vidBtn.textContent = '|__|';
  vidBtn.title = 'Vidoutes. Shift+click for Gallery View. A small view drawn from each paragraph\'s own words.';
  vidBtn.style.cssText = 'position:absolute;right:176px;bottom:9px;cursor:pointer;color:rgba(255,255,255,0.92);font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;white-space:pre;user-select:none';
  box.appendChild(vidBtn);
  vidBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
  vidBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (e.shiftKey) { galleryOpen(); return; }          // the gallery; the column's own switch is left as it was
    tiltState.vid = !tiltState.vid; lit(vidBtn, tiltState.vid); eatLabel.textContent = tiltState.vid ? 'vidoutes: the column shown' : 'vidoutes hidden';
    if (!tiltState.vid) vidUnpadAll(); saveTilts(); tiltView();
  });
  var autoBtn = document.createElement('span'); autoBtn.id = 'bk-auto'; autoBtn.textContent = '#';
  autoBtn.title = 'Autoplay. Every view in sight plays its making.';
  autoBtn.style.cssText = 'position:absolute;right:150px;bottom:9px;cursor:pointer;color:#8f98a5;font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;white-space:pre;user-select:none';
  box.appendChild(autoBtn);
  autoBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
  function autoPaint() { lit(autoBtn, !!tiltState.auto); autoBtn.textContent = tiltState.auto ? '\u25b7' : '#'; autoBtn.title = tiltState.auto ? 'Autoplay is running. Click to cut.' : 'Autoplay. Every view in sight plays its making.'; }   // while it plays, the open triangle; click for CUT! (user1, 22 x)
  autoBtn.addEventListener('click', function (e) { e.stopPropagation(); tiltState.auto = !tiltState.auto; autoPaint(); saveTilts(); playSet(tiltState.auto); eatLabel.textContent = tiltState.auto ? 'autoplay: the views in sight play their making' : 'autoplay off'; });
  // [ *| ] THE FLAGS' OWN SWITCH (user1, 20 x: "let it be a toggle, and take up shop in lower-right: [ *| ] to show the most basic form: a coin on a pole")
  var flagBtn = document.createElement('span'); flagBtn.id = 'bk-flags'; flagBtn.textContent = '*|';
  flagBtn.title = 'the flags: beside every opener line of a raked paragraph, its relation and its two coins. a coin on a pole.';
  flagBtn.style.cssText = 'position:absolute;right:106px;bottom:9px;cursor:pointer;color:rgba(255,255,255,0.92);font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;white-space:pre;user-select:none';
  box.appendChild(flagBtn);
  flagBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
  function flagsPaint() { flagBtn.style.color = tiltState.flags === 2 ? 'rgba(255,255,255,0.92)' : tiltState.flags === 1 ? 'rgba(255,255,255,0.55)' : '#8f98a5'; flagBtn.style.borderColor = '#1d2026'; }
  flagBtn.addEventListener('click', function (e) { e.stopPropagation(); tiltState.flags = (tiltState.flags + 2) % 3; flagsPaint(); saveTilts(); if (!tiltState.flags) flagsUnpadAll(); tiltView(); eatLabel.textContent = ['flags struck', 'flags at half-brite (Agnes)', 'flags raised, full'][tiltState.flags]; });   // full -> half -> off -> full (user1, 20 x: "Full, Agnes Halfbrite, and Off")
  function flagsPlace(copy, L) {                        // the flags of a raked copy, laid on the tilt sheet beside their lines
    var flags = copy.__bkFlags; if (!tiltState.flags || !flags || !flags.length) return;
    var node = copy.firstChild; if (!node || node.nodeType !== 3) return;
    var text = node.data, starts = [], p = 0, lines = text.split('\n'), i, cs = getComputedStyle(copy);
    for (i = 0; i < lines.length; i++) { starts.push(p); p += lines[i].length + 1; }
    var colw = parseFloat(cs.paddingRight) || 0, cr = copy.getBoundingClientRect().right;
    flags.forEach(function (f) {
      var a = starts[f.i], b = a + lines[f.i].length; if (b <= a) return;
      var r = document.createRange(); r.setStart(node, a); r.setEnd(node, b); var rc_ = r.getClientRects(); if (!rc_.length) return;
      var y = rc_[0].top, h = rc_[0].height, el = document.createElement('span');
      el.innerHTML = f.html; el.title = vTrim(lines[f.i]);
      var ch = parseFloat(cs.fontSize) * 0.6, gut = FLAG.gut * ch;   // a ch of the copy's face, near enough; the gutter keeps the flag off the text
      el.style.cssText = 'position:absolute;left:' + (cr - colw + gut) + 'px;top:' + y + 'px;width:' + (colw - gut) + 'px;height:' + h + 'px;line-height:' + h + 'px;text-align:left;white-space:pre;pointer-events:none;font:' + cs.fontSize + '/' + h + 'px ' + ART_FACE + ';color:' + FLAG.bone + ';letter-spacing:-0.05em;opacity:' + (tiltState.flags === 1 ? 0.5 : 1);
      L.appendChild(el);
    });
  }
  function tiltOpen(host, level) {                      // host: the original paragraph, or a copy standing for it
    var orig = host.hasAttribute('data-bk-raked') ? tiltState.origOf.get(host) : host, copy = host.hasAttribute('data-bk-raked') ? host : null;
    if (!orig) return;
    if (!copy && tiltState.copyOf.get(orig) && tiltState.copyOf.get(orig).isConnected) copy = tiltState.copyOf.get(orig);   // already standing: reuse
    var text = flatText(orig).text, out, cs = getComputedStyle(orig);
    RAKE.urls = true; try { out = level === 2 ? rakeOf(ventOf(text), !!blueState.lazy) : ventOf(text); } finally { RAKE.urls = false; }   // URLs lifted in a view, never in the box
    if (!copy) {
      copy = document.createElement('p'); copy.setAttribute('data-bk-raked', String(level));
      // THE MIDDLE READING LINE (user1, 19 x 2026: vented and raked paragraphs "run only to middle-column ... quarter-column", and
      // the eye's column is asked "to sit much too far to the left ... I would allow it to be its width, and set margin-left and
      // margin-right to auto"): the copy is as wide as its longest line and stands centred in the column, its own margins above and below
      copy.style.cssText = 'white-space:pre-wrap;word-wrap:break-word;width:fit-content;max-width:100%;box-sizing:border-box;margin-left:auto;margin-right:auto;font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize + ';line-height:' + cs.lineHeight + ';color:' + cs.color + ';margin-top:' + cs.marginTop + ';margin-bottom:' + cs.marginBottom + ';padding:' + cs.padding;
      orig.parentNode.insertBefore(copy, orig.nextSibling); tiltState.origOf.set(copy, orig); tiltState.copyOf.set(orig, copy); orig.style.display = 'none'; orig.setAttribute('data-bk-hidden', '1');
    }
    copy.setAttribute('data-bk-raked', String(level)); copy.textContent = out;
    if (level === 2) { var rl = out.split('\n'); copy.__bkFlags = flagsOf(rl); copy.__bkWyrd = rl.filter(function (l) { return vTrim(l); }).length >= 4 ? wyrdOf(rl) : null; tiltColumns(copy); }   // three columns: illustrations, the text, the semiotics
    else { copy.__bkFlags = null; copy.__bkWyrd = null; copy.style.paddingLeft = ''; copy.style.paddingRight = ''; }
    tiltState.opened[tiltKey(text)] = level;
  }
  function tiltAdopt(copy) {                            // a copy left standing by an earlier paste of Bela (user1, 19 x: "Foom! It disappeared"): its original is the hidden
    var prev = copy.previousElementSibling;             // paragraph just before it; adopted into the maps so that closing it shows that paragraph again
    if (prev && prev.style.display === 'none' && !tiltState.origOf.get(copy)) { tiltState.origOf.set(copy, prev); tiltState.copyOf.set(prev, copy); prev.setAttribute('data-bk-hidden', '1'); }
    return tiltState.origOf.get(copy);
  }
  function tiltClose(copy) {
    var orig = tiltState.origOf.get(copy) || tiltAdopt(copy);
    if (!orig) { var prev = copy.previousElementSibling; copy.remove(); if (prev && prev.style.display === 'none') { prev.style.display = ''; prev.removeAttribute('data-bk-hidden'); } return; }
    delete tiltState.opened[tiltKey(flatText(orig).text)];
    copy.remove(); orig.style.display = ''; orig.removeAttribute('data-bk-hidden');
  }
  function tiltOrphans() {                              // THE HIDDEN ORIGINAL (user1, 19 x: "URL unrolling hid the paragraph with the URL in it"): the host
    var cs = document.querySelectorAll('p[data-bk-raked]'), k;           // redrew and dropped the copy, and the original stayed hidden; whoever has no copy standing is shown again
    for (k = 0; k < cs.length; k++) if (!tiltState.origOf.get(cs[k])) tiltAdopt(cs[k]);   // copies from an earlier paste are adopted first
    var hid = document.querySelectorAll('[data-bk-hidden]'), i, o, c;
    for (i = 0; i < hid.length; i++) { o = hid[i]; c = tiltState.copyOf.get(o); if (!c || !c.isConnected) { o.style.display = ''; o.removeAttribute('data-bk-hidden'); } }
  }
  function tiltCloseAll() {
    var cs = document.querySelectorAll('p[data-bk-raked]'), i;
    for (i = 0; i < cs.length; i++) tiltClose(cs[i]);
    tiltOrphans(); tiltState.opened = {};
  }
  function inViewWide(el) {                            // the viewport and a screen's worth above and below: paragraphs are dressed before they arrive, so a scroll meets less reflow (user1, 20 x: "scroll is rough with Vidoutes")
    var r = el.getBoundingClientRect(), h = window.innerHeight || document.documentElement.clientHeight; return r.height > 0 && r.bottom > -h && r.top < 2 * h;
  }
  function tiltHosts() {
    var all = document.body.querySelectorAll('p, li, blockquote'), out = [], i, el;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (el.closest(BELA_OWN) || el.querySelector('p, li, blockquote') || !inViewWide(el)) continue;
      if (el.closest('[contenteditable], [contenteditable="true"], [role="textbox"], textarea, form')) continue;   // the host's composer is not a paragraph (user1, 20 x: wyrds "appear in the bluebox from time to time")
      if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      if ((el.textContent || '').trim().length < 24) continue;
      out.push(el);
    }
    return out;
  }
  window.__belaReflow = 0;
  function tractionCheck() {
    if (traction.dressed) { window.__belaReflow += traction.dressed; if (typeof console !== 'undefined') console.log('[bela] reflow: ' + traction.dressed + ' change(s) to the page this pass, ' + window.__belaReflow + ' since the paste'); }                            // TRACTION CONTROL (user1, 20 x: "are we clambering correctly? ... or are we trapped in clamber, co-slapping the
    traction.hist.push(traction.dressed); traction.dressed = 0;   // fact of the intention of the Host? Bela's nose could go amber"): when pass after pass keeps re-dressing
    if (traction.hist.length > 8) traction.hist.shift();         // paragraphs the host keeps undressing, the tilts stand down for four seconds and the nose goes amber
    var busy = traction.hist.length >= 5 && traction.hist.slice(-5).every(function (n) { return n > 2; });
    var led = document.getElementById('bk-led');
    if (busy && !traction.wild) { traction.wild = true; traction.until = performance.now() + 4000; traction.hist = []; if (led) { led.__bkBg = led.__bkBg || led.style.background; led.style.background = '#ffb347'; led.style.boxShadow = '0 0 6px #ffb347'; } eatLabel.textContent = 'traction lost: the host keeps undressing what the tilts dress; standing down a moment'; }
    else if (traction.wild && performance.now() > traction.until) { traction.wild = false; if (led && led.__bkBg) { led.style.background = led.__bkBg; led.style.boxShadow = '0 0 6px ' + led.__bkBg; } }
    return traction.wild && performance.now() < traction.until;
  }
  function tiltView() {
    try {
      if (!live()) return;
      if (sleeping) { if (tiltState.layer) tiltState.layer.innerHTML = ''; return; }   // asleep: no chevrons, no flags, no columns drawn
      if (tractionCheck()) return;
      var L = tiltLayerOn(); L.innerHTML = ''; VID.colBottom = -1e9;
      tiltOrphans();
      if (!tiltState.pageWyrd) wyrdUnpadAll(); else { wyrdOrphans(); wyrdOldBands(); }   // the wyrd's block goes the moment it is off, and when its paragraph has gone; old bands close
      if (!tiltState.flags) flagsUnpadAll();
      if (!tiltState.vid) vidUnpadAll();
      if (!tiltState.on && !tiltState.pageWyrd && !tiltState.flags && !tiltState.vid) return;
      tiltHosts().forEach(function (h) {
        if (tiltState.vid) { try { vidAnyPlace(h, L); } catch (e4) {} }
        if (tiltState.pageWyrd) { try { wyrdTopPlace(h, L); } catch (e2) {} }
        if (tiltState.flags) { try { flagsAnyPlace(h, L); } catch (e3) {} }
        if (!tiltState.on) return;
        var level = h.hasAttribute('data-bk-raked') ? parseInt(h.getAttribute('data-bk-raked'), 10) : 0, k;
        if (!level) { k = tiltKey(flatText(h).text); if (tiltState.opened[k]) { tiltOpen(h, tiltState.opened[k]); return; } }   // dropped by a redraw: opened again by its words
        var r = h.getBoundingClientRect(), lx = r.left;
        if (h.hasAttribute('data-bk-raked') && h.parentElement) { var pr = h.parentElement.getBoundingClientRect(), pcs = getComputedStyle(h.parentElement); lx = pr.left + (parseFloat(pcs.paddingLeft) || 0); }   // an opened paragraph's chevrons stay where the paragraph began, however its copy narrows (user1, 22 x: "Where is my tilt?")
        var x = Math.max(2, lx - 34), y = r.top + 2 + (parseFloat(getComputedStyle(h).paddingTop) || 0);   // at the first line, whatever band stands above it: the chevrons propose to tilt the paragraph
        function chev(txt, lit_, dx, onclick, title) {
          var b = document.createElement('span'); b.textContent = txt; b.title = title;
          b.style.cssText = 'position:absolute;left:' + (x + dx) + 'px;top:' + y + 'px;pointer-events:auto;cursor:pointer;font:11px/14px ' + ART_FACE + ';color:' + (lit_ ? 'rgba(255,255,255,0.92)' : '#565b64') + ';user-select:none';
          b.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
          b.addEventListener('click', function (e) { e.stopPropagation(); onclick(); setTimeout(tiltView, 0); });
          L.appendChild(b);
        }
        chev('|>', level >= 1, 0, function () { if (level >= 1) tiltClose(h); else tiltOpen(h, 1); }, level >= 1 ? 'close it back up' : 'vent: by the marks');
        chev('|>', level >= 2, 14, function () { if (level >= 2) tiltOpen(h, 1); else tiltOpen(h, 2); }, level >= 2 ? 'back to vented' : 'rake: the words lifted');

      });
      tiltAt.el = tiltAt.last || null; tiltAt.top = scrollTopOf(tiltAt.el); L.style.transform = '';   // composed here: the scooch measures from this
    } catch (err) { if (typeof console !== 'undefined') console.warn('bela: the tilt-downs could not be placed (' + err.message + ')'); }
  }
  function tiltViewSoon() { if (!tiltState.on && !tiltState.pageWyrd && !tiltState.flags && !tiltState.vid) return; clearTimeout(tiltState.t); tiltState.t = setTimeout(tiltView, 120); }
  var tiltAt = { el: null, top: 0, last: null };          // the chevrons and flags scooch with the scroll, as the rings do (user1, 20 x: "it blinks out while scrolling")
  listen(document, 'scroll', function (e) {
    if (!tiltState.on && !tiltState.pageWyrd && !tiltState.flags && !tiltState.vid) return;
    var t = e.target; tiltAt.last = t;
    if (tiltState.layer && tiltAt.el === t) tiltState.layer.style.transform = 'translateY(' + (tiltAt.top - scrollTopOf(t)).toFixed(1) + 'px)';
    tiltViewSoon();
  }, true);
  listen(window, 'resize', tiltViewSoon);
  tiltBtn.onclick = function () { tiltState.on = !tiltState.on; lit(tiltBtn, tiltState.on); saveTilts(); if (!tiltState.on) tiltCloseAll(); tiltView(); eatLabel.textContent = tiltState.on ? 'tilt-downs: outer vents, inner rakes, again closes' : 'tilt-downs off: every paragraph as it was'; };
  lit(tiltBtn, tiltState.on); lit(vidBtn, tiltState.vid); flagsPaint(); lit(pwBtn, tiltState.pageWyrd); autoPaint(); if (tiltState.auto) playSet(true);
  if (typeof console !== 'undefined') console.log('[bela] generation ' + GEN + '; tilts restored: on=' + tiltState.on + ' flags=' + tiltState.flags + ' vidoutes=' + tiltState.vid + ' wyrd=' + tiltState.pageWyrd);   // what this paste believes it was told
  if (tiltState.pageWyrd || tiltState.on || tiltState.flags || tiltState.vid) setTimeout(tiltView, 400);
  // ================= THE RUBBER ROLLERS ≈ (user1, 20 x 2026) =================
  // "As your message comes in, it would be ideal to prevent it from jumping, as a set of rubber-rollers would do upon a page
  // traveling through a printer." The host keeps the newest line in view while a reply streams by setting the thread's scroll
  // to its end as each chunk lands, and the page jumps by a chunk at a time. The rollers watch the thread's scroller: a scroll
  // that was not the reader's (no wheel or key within the last half second) is a jump, and the thread is slid back by the same
  // amount with a transform and eased to rest over a few frames, so the words arrive at the speed of a roller rather than a
  // snap. Layout is untouched; the scroll position is the host's; only the picture is smoothed. By leave, from the ≈ button.
  var roll = { on: false, last: null, y: 0, raf: 0, userAt: 0, el: null };
  var rollBtn = document.createElement('span'); rollBtn.id = 'bk-roll'; rollBtn.textContent = '≈';
  rollBtn.title = 'rubber rollers: a streaming reply slides into view instead of jumping. the scroll is still the host\'s; only the picture is eased.';
  rollBtn.style.cssText = BTN + ';padding:0 5px';
  (function () { var t = document.getElementById('bk-tilt'); if (t && t.parentNode) t.parentNode.insertBefore(rollBtn, t.nextSibling); })();   // beside the tilts, in the head row
  function rollScroller() {
    var n = FEED(), cs;
    while (n && n !== document.body) { cs = getComputedStyle(n); if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 2) return n; n = n.parentElement; }
    return document.scrollingElement || document.documentElement;
  }
  function rollTop(s) { return s === document.scrollingElement || s === document.documentElement ? (window.scrollY || document.documentElement.scrollTop || 0) : s.scrollTop; }
  function rollTick() {
    if (!live()) return;
    var f = FEED(); roll.y *= 0.78;
    if (Math.abs(roll.y) < 0.4) { roll.y = 0; f.style.transform = ''; f.style.willChange = ''; roll.raf = 0; return; }
    f.style.transform = 'translateY(' + roll.y.toFixed(1) + 'px)'; roll.raf = requestAnimationFrame(rollTick);
  }
  ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach(function (k) { listen(document, k, function () { roll.userAt = performance.now(); }, { passive: true, capture: true }); });
  listen(document, 'scroll', function (e) {
    if (!roll.on) return;
    var s = rollScroller(), t = e.target === document ? (document.scrollingElement || document.documentElement) : e.target;
    if (t !== s) return;
    var top = rollTop(s), d = roll.last === null ? 0 : top - roll.last; roll.last = top; roll.el = s;
    if (performance.now() - roll.userAt < 500) return;                      // the reader's own hand: never eased
    if (Math.abs(d) < 3 || Math.abs(d) > 800) return;                       // a flicker, or a leap to elsewhere: left alone
    var f = FEED(); roll.y += d; f.style.willChange = 'transform'; f.style.transform = 'translateY(' + roll.y.toFixed(1) + 'px)';
    if (!roll.raf) roll.raf = requestAnimationFrame(rollTick);
  }, true);
  rollBtn.onclick = function () {
    roll.on = !roll.on; lit(rollBtn, roll.on); roll.last = null;
    try { localStorage.setItem('blinken-rollers', roll.on ? '1' : '0'); } catch (e) {}   // remembered: off to begin with, on again only if left on (user1, 22 x)
    if (!roll.on) { var f = FEED(); f.style.transform = ''; f.style.willChange = ''; roll.y = 0; }
    eatLabel.textContent = roll.on ? 'rollers: a streaming reply slides, the reader\'s own scroll is never touched' : 'rollers off';
  };
  try { roll.on = localStorage.getItem('blinken-rollers') === '1'; } catch (e) {}
  lit(rollBtn, roll.on);
  // ================= SLEEP _ o _ (user1, 20 x 2026) =================
  // "clicking his green nose, or a Fitts' field of double its radius, should Sleep him. His eyes would go _ o _ . All his additions
  // to the page etc, would evaporate." The nose takes the click within twice its radius; asleep, every view is taken off the page
  // and remembered; the clocks stop; the eyes close. Clicked again, he wakes as he was. And "the slim, dim, nice blue highlight
  // Bela has for Flap" is given to every button in the three fields, the nose's ring growing with it: "Me? OK I'll sleep."
  var sleepStyle = document.createElement('style');
  sleepStyle.textContent = '#blinken-clock span[id^="bk-"][style*="border"]:hover{border-color:#3f86d6 !important}#bk-outputter [data-bk-click]:hover{border-color:#3f86d6 !important;color:#d8e8fa !important;background:rgba(63,134,214,.12)}html.bk-asleep #bk-prov{display:none !important}#bk-led{cursor:pointer;transition:box-shadow .15s}#bk-led:hover{box-shadow:0 0 0 4px rgba(63,134,214,.45) !important}' +
    // ASLEEP, NOTHING OF HIS SHOWS (user1, 21 x 2026: "when Bela is sleeping, I would expect those seen-bars to disappear, along with the |>|>"): one class on the
    // page's root, and every mark of his is hidden by rule, whatever painted it and whenever -- the seen strips, inline or by rule, the tilts' glass, the rings' glass
    'html.bk-asleep [data-bk-checked],html.bk-asleep [data-bk-checked] *{background-image:none !important}html.bk-asleep #bk-tilts,html.bk-asleep #bk-ring-sheet,html.bk-asleep [data-bk-wyrd-box]{display:none !important}';
  document.head.appendChild(sleepStyle);
  var sleeping = null;
  function belaSleep() {
    if (sleeping) return;
    sleeping = { tint: voiceState.tint, tinct: tintState.on, rings: voiceState.rings, tilts: tiltState.on, flags: tiltState.flags, vid: tiltState.vid, wyrd: tiltState.pageWyrd, roll: roll.on, seed: document.getElementById('bk-seed').textContent, seed2: document.getElementById('bk-seed2').textContent };
    try { voiceState.tint = false; forgetLamp(); lampPaint(); } catch (e) {}
    try { tintState.on = false; forgetTints(); } catch (e) {}
    try { voiceState.rings = 0; ringsPaint(); ringView(); blueRings(); } catch (e) {}
    try { tiltState.on = false; tiltState.flags = 0; tiltState.vid = false; tiltState.pageWyrd = false; tiltCloseAll(); wyrdUnpadAll(); flagsUnpadAll(); vidUnpadAll(); if (tiltState.layer) tiltState.layer.innerHTML = ''; lit(tiltBtn, false); flagsPaint(); lit(vidBtn, false); lit(pwBtn, false); } catch (e) {}
    try { if (roll.on) { roll.on = false; lit(rollBtn, false); FEED().style.transform = ''; } } catch (e) {}
    try { clearInterval(gaugeTimer); gaugeTimer = null; } catch (e) {}
    try { clearInterval(glint.timer); glint.timer = null; } catch (e) {}
    try { blueTint(); } catch (e) {}
    document.getElementById('bk-seed').textContent = '_'; document.getElementById('bk-seed2').textContent = '_';
    var led = document.getElementById('bk-led'); if (led) { led.__bkBg = led.__bkBg || led.style.background; led.style.background = '#2a3340'; led.style.boxShadow = 'none'; led.style.animation = 'none'; }
    try { var ss = document.getElementById('bk-seen-style'); if (ss) ss.disabled = true; } catch (e) {}   // asleep, he has seen nothing
    document.documentElement.classList.add('bk-asleep');
    eatLabel.textContent = 'asleep. click his nose to wake him';
  }
  function belaWake() {
    if (!sleeping) return;
    var w = sleeping; sleeping = null;
    document.getElementById('bk-seed').textContent = w.seed; document.getElementById('bk-seed2').textContent = w.seed2;
    var led = document.getElementById('bk-led'); if (led) { led.style.background = led.__bkBg || ''; led.style.boxShadow = led.__bkBg ? '0 0 6px ' + led.__bkBg : ''; led.style.animation = ''; }
    try { voiceState.tint = w.tint; lampPaint(); if (w.tint) lampView(); } catch (e) {}
    try { tintState.on = w.tinct; if (w.tinct) tintView(); } catch (e) {}
    try { voiceState.rings = w.rings; ringsPaint(); ringView(); blueRings(); } catch (e) {}
    try { tiltState.on = w.tilts; tiltState.flags = w.flags; tiltState.vid = w.vid; tiltState.pageWyrd = w.wyrd; lit(tiltBtn, w.tilts); flagsPaint(); lit(vidBtn, w.vid); lit(pwBtn, w.wyrd); tiltView(); } catch (e) {}
    try { if (w.roll) { roll.on = true; lit(rollBtn, true); } } catch (e) {}
    try { gaugesStart(); } catch (e) {}
    try { if (glint.gl && !glint.timer) glint.timer = setInterval(glintTick, GLINT.ms); } catch (e) {}
    try { blueTint(); } catch (e) {}
    try { var ss = document.getElementById('bk-seen-style'); if (ss) ss.disabled = false; } catch (e) {}
    document.documentElement.classList.remove('bk-asleep');
    eatLabel.textContent = 'awake';
  }
  (function () {                                        // the nose, and a Fitts' field of twice its radius around it
    var led = document.getElementById('bk-led'), head = document.getElementById('bk-head'); if (!led || !head) return;
    led.title = 'sleep / wake';
    head.addEventListener('click', function (e) {
      var r = led.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (d > r.width) return;                          // twice the radius is the width
      e.stopPropagation(); if (sleeping) belaWake(); else belaSleep();
    });
  })();
  // ================= THE GLINT (user1, 19 x 2026) =================
  // "a small-box, 128x128, of live throughputted computing as the demos did, in Canvas, via GLSL ... Extending Bela's left-edge
  // ... a 128x128 gridded black square, in compliment to the inset appearance of the BeBox VU meters ... I propose actual
  // function. I want a little Conway Life ... We are computing things here, and having them checked to-and-fro with UIntN dumps
  // back and forth. No pixel iterates but that it demonstrates a fresh full cycle ... Only by full-cycling will we have
  // blinkenlights, and provable visual computing. ... The Glint must begin."
  // So: Life on the GPU, a fragment shader stepping a 128x128 texture, and every generation read back as bytes; the processor
  // steps the previous generation itself and the two are compared cell for cell; the processor's generation is then uploaded
  // as the next input, so authority alternates and no pixel has iterated that was not checked both ways. The title carries
  // the count of agreeing generations, and the first disagreement would stop the clock and say so. Bela widens by 128 and
  // chrome to the left; everything else stays where it stood. Click the square to reseed it from the clock; the seed at
  // birth is the bluebox's draft, if any, else an R-pentomino and a scatter.
  var GLINT = { n: 128, ms: 125, chrome: 16, shown: 92 };   // 128 cells computed, shown at 92 px, 72% (user1, 19 x: "scale its canvas ... keeping the 128x128 processing ... bats must be sleek"; then "72%, keeping its top-position and drawing in from left and bottom")
  var glint = { cv: null, gl: null, timer: null, gen: 0, ok: 0, bad: 0, a: null, b: null, fb: null, prog: null, show: null, cpu: null, alive: true };
  (function () {                                        // the room: the box widens left, the square sits at its left edge
    var w = parseInt(box.style.width, 10) || WIDTH, add = GLINT.shown + GLINT.chrome;
    box.style.width = (w + add) + 'px'; box.style.paddingLeft = (add + 12) + 'px';
    if (box.style.left && box.style.left !== 'auto') box.style.left = (parseFloat(box.style.left) - add) + 'px';   // hung by the left: the edge moves out, the body stays
    var cv = document.createElement('canvas'); cv.id = 'bk-glint'; cv.width = GLINT.n; cv.height = GLINT.n;
    cv.style.cssText = 'position:absolute;left:8px;top:9px;width:' + GLINT.shown + 'px;height:' + GLINT.shown + 'px;background:#070809;border-radius:5px;box-shadow:inset 0 0 0 1px #1d2026;cursor:pointer';   // 128 cells into 96 px: let the browser resample, greyscale loses little
    cv.title = 'the glint: Life on the GPU, every generation read back and checked by the processor, then handed back. click to reseed';
    box.appendChild(cv); glint.cv = cv;
    cv.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    cv.addEventListener('click', function () { glintSeed(null); });
  })();
  function glintSeed(text) {                            // bytes: one cell per texel, alive = 255 in red
    var n = GLINT.n, cells = new Uint8Array(n * n), i, x, y;
    if (text && text.length > 8) { for (i = 0; i < text.length && i < n * n; i++) if (text.charCodeAt(i) % 3 === 0) cells[(i * 37) % (n * n)] = 1; }
    else {
      var s = (Date.now() & 0xffff) || 1; function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
      for (i = 0; i < n * n; i++) if (rnd() < 0.08) cells[i] = 1;
    }
    [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]].forEach(function (p) { x = n / 2 + p[0]; y = n / 2 + p[1]; cells[y * n + x] = 1; });   // the R-pentomino at the heart
    glint.cpu = cells; glint.gen = 0; glint.ok = 0; glint.bad = 0;
    if (glint.gl) glintUpload(cells);
  }
  function glintUpload(cells) {
    var gl = glint.gl, n = GLINT.n, px = new Uint8Array(n * n * 4), i;
    for (i = 0; i < n * n; i++) { px[i * 4] = cells[i] ? 255 : 0; px[i * 4 + 3] = 255; }
    gl.bindTexture(gl.TEXTURE_2D, glint.a); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
  }
  function glintStepCpu(src) {                          // the processor's own Life, torus
    var n = GLINT.n, out = new Uint8Array(n * n), x, y, c, xm, xp, ym, yp;
    for (y = 0; y < n; y++) { ym = (y + n - 1) % n * n; yp = (y + 1) % n * n; var y0 = y * n;
      for (x = 0; x < n; x++) { xm = (x + n - 1) % n; xp = (x + 1) % n;
        c = src[ym + xm] + src[ym + x] + src[ym + xp] + src[y0 + xm] + src[y0 + xp] + src[yp + xm] + src[yp + x] + src[yp + xp];
        out[y0 + x] = (c === 3 || (c === 2 && src[y0 + x])) ? 1 : 0; } }
    return out;
  }
  function glintBoot() {
    var cv = glint.cv, gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) { cv.title = 'the glint: no WebGL2 here'; return false; }
    glint.gl = gl;
    function sh(type, src) { var h = gl.createShader(type); gl.shaderSource(h, src); gl.compileShader(h); if (!gl.getShaderParameter(h, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(h)); return h; }
    function prog(fs) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, '#version 300 es\nin vec2 p; out vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
    glint.prog = prog('#version 300 es\nprecision highp float; in vec2 uv; out vec4 o; uniform sampler2D t; uniform float n;\n' +
      'void main(){ float d = 1.0 / n; int c = 0; for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { if (i == 0 && j == 0) continue; c += texture(t, uv + vec2(float(i), float(j)) * d).r > 0.5 ? 1 : 0; }\n' +
      '  bool a = texture(t, uv).r > 0.5; bool b = (c == 3) || (c == 2 && a); o = vec4(b ? 1.0 : 0.0, 0.0, 0.0, 1.0); }');
    glint.show = prog('#version 300 es\nprecision highp float; in vec2 uv; out vec4 o; uniform sampler2D t; uniform float n;\n' +
      'void main(){ float a = texture(t, uv).r; vec2 g = fract(uv * n / 8.0); float grid = (g.x < 0.125 || g.y < 0.125) ? 1.0 : 0.0;\n' +
      '  vec3 ink = mix(vec3(0.027, 0.031, 0.035), vec3(0.56, 0.60, 0.65), a); ink += grid * 0.035; o = vec4(ink, 1.0); }');
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    [glint.prog, glint.show].forEach(function (p) { var loc = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); });
    function tex() { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GLINT.n, GLINT.n, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); return t; }
    glint.a = tex(); glint.b = tex(); glint.fb = gl.createFramebuffer();
    // THE THINKER's own programs and textures (linear, clamped), so Life's field is never touched: a feedback pass that turns the field
    // and draws it inward (mode 0), or folds the square into the disc (mode 1); and a plain colour display
    glint.seal = prog('#version 300 es\nprecision highp float; in vec2 uv; out vec4 o; uniform sampler2D t; uniform float ang, zoom, mode;\n' +
      'void main(){ vec2 p = uv - 0.5; float r = length(p), th = atan(p.y, p.x); vec2 q;\n' +
      '  if (mode < 0.5) q = vec2(cos(th + ang), sin(th + ang)) * r * zoom + 0.5;\n' +                         // turned, and drawn in a little (the camera's twist and zoom)
      '  else q = vec2(abs(fract(th / 6.2831853 + 0.5 + ang * 0.1) * 2.0 - 1.0), clamp(r * 2.0 * zoom, 0.0, 1.0));\n' +   // the square folded into the disc, mirrored so no seam
      '  vec3 c = texture(t, q).rgb * 0.6 + (texture(t, q + vec2(0.006, 0.0)).rgb + texture(t, q - vec2(0.006, 0.0)).rgb + texture(t, q + vec2(0.0, 0.006)).rgb + texture(t, q - vec2(0.0, 0.006)).rgb) * 0.1;\n' +
      '  float m = (c.r + c.g + c.b) / 3.0; c = clamp(m + (c - m) * 1.06, 0.0, 1.0);\n' +                         // a colour camera's saturation, a touch above one
      '  vec3 av = textureLod(t, vec2(0.5), 7.0).rgb; float gain = clamp(0.45 / max(max(av.r, max(av.g, av.b)), 0.02), 0.8, 1.6);\n' +   // and its iris: the whole frame's brightness held near the middle, so the field neither dies nor floods
      '  vec3 x = mix(texture(t, uv).rgb, c, 0.85); float L = max(x.r, max(x.g, x.b)), g = clamp(L * gain, 0.0, 1.0), S = g * g * (3.0 - 2.0 * g);\n' +
      '  o = vec4(clamp(x * (S / max(L, 0.0001)), 0.0, 1.0), 1.0); }');                                               // and its S on brightness alone: darks darker, lights lighter, hues kept
    glint.sealShow = prog('#version 300 es\nprecision highp float; in vec2 uv; out vec4 o; uniform sampler2D t; void main(){ o = vec4(texture(t, uv).rgb * 0.22, 1.0); }');   // the work shown at a fifth of its light (user1, 22 x: "it can't be brighter than 22% of the range. We may be reading")
    [glint.seal, glint.sealShow].forEach(function (p) { var loc = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); });
    function ltex() { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GLINT.n, GLINT.n, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); gl.generateMipmap(gl.TEXTURE_2D); return t; }
    glint.sa = ltex(); glint.sb = ltex();
    return true;
  }
  function glintTick() {                                // one generation, full cycle: GPU steps a -> b; b is read back; the processor steps a itself; compared; the processor's goes in as a
    if (!live()) return;
    try {
      var gl = glint.gl, n = GLINT.n, i;
      gl.viewport(0, 0, n, n);
      gl.bindFramebuffer(gl.FRAMEBUFFER, glint.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glint.b, 0);
      gl.useProgram(glint.prog); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, glint.a); gl.uniform1i(gl.getUniformLocation(glint.prog, 't'), 0); gl.uniform1f(gl.getUniformLocation(glint.prog, 'n'), n);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      var px = new Uint8Array(n * n * 4); gl.readPixels(0, 0, n, n, gl.RGBA, gl.UNSIGNED_BYTE, px);   // the dump back
      var mine = glintStepCpu(glint.cpu), agree = true;
      for (i = 0; i < n * n; i++) if ((px[i * 4] > 127 ? 1 : 0) !== mine[i]) { agree = false; break; }
      if (agree) glint.ok++; else glint.bad++;
      glint.gen++; glint.cpu = mine; glintUpload(mine);                                                 // the processor's word goes back in
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, n, n);
      gl.useProgram(glint.show); gl.bindTexture(gl.TEXTURE_2D, glint.a); gl.uniform1i(gl.getUniformLocation(glint.show, 't'), 0); gl.uniform1f(gl.getUniformLocation(glint.show, 'n'), n);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      glint.cv.title = 'the glint: generation ' + glint.gen + ', ' + glint.ok + ' agreed between the GPU and the processor' + (glint.bad ? ', ' + glint.bad + ' DISAGREED' : '') + '. click to reseed';
      if (!agree) { clearInterval(glint.timer); glint.timer = null; eatLabel.textContent = 'the glint: the GPU and the processor disagreed at generation ' + glint.gen; }
    } catch (err) { clearInterval(glint.timer); glint.timer = null; if (typeof console !== 'undefined') console.warn('bela: the glint stopped (' + err.message + ')'); }
  }
  function glintStart() {
    try { if (!glint.gl && !glintBoot()) return; glintSeed(ta && ta.value ? ta.value : null); if (!glint.timer) glint.timer = setInterval(glintTick, GLINT.ms); }
    catch (err) { if (typeof console !== 'undefined') console.warn('bela: the glint could not begin (' + err.message + ')'); glint.cv.title = 'the glint: ' + err.message; }
  }
  function glintStop() { clearInterval(glint.timer); glint.timer = null; if (glint.cv) glint.cv.remove(); }
  // ================= THE THINKER: seals (user1, 22 x 2026) =================
  // "running -- not an intelligence -- but a Thinker in Bela's Conway monitor ... Take a field of structure it is given, handsomely, by the
  // Painting process ... alternate between polar and rectilinear mapping, and draw inward." Video feedback, after Crutchfield (1984): a
  // paragraph's kept view is laid into the Glint's square, five texels to a cell, and turned through polar and square mappings, drawn
  // inward, thirty passes, a camera's iris holding the brightness, the Glint showing the work; the cohered disc, averaged to sixteen by sixteen, is read back and kept as the view's
  // SEAL, a small round mark unique to those words, made from their own picture. The twist and the zoom come from the picture itself, so
  // the same words always cohere the same way on one machine (a GPU's sampling may differ in its last bits on another, which is why the
  // seal, once made, is kept with the view). Life gives the box over for a second and has it back, its own field untouched.
  var SEAL = { n: 16, passes: 30, queue: [], busy: false };
  function sealRequest(c, done) {
    if (c.s) { done(c.s); return; }
    if (c.tr) return;                                  // a view still arriving is not sealed
    if (!glint.gl || !glint.seal) return;              // no WebGL2 here: no seals, and nothing else is the worse
    if (c.sq) { c.sq.push(done); return; }             // already waiting: one making per view, every asker told when it is made
    c.sq = [done]; SEAL.queue.push([c, function (seal) { var q = c.sq || []; delete c.sq; q.forEach(function (f) { try { f(seal); } catch (e) {} }); }]); sealPump();
  }
  function sealPump() {
    if (SEAL.busy || !SEAL.queue.length || !live() || sleeping) return;
    var job = SEAL.queue.shift(), c = job[0], fullMode = job[2] === 'full';
    if (!fullMode && c.s) { job[1](c.s); sealPump(); return; }
    SEAL.busy = true;
    var gl = glint.gl, N = GLINT.n, px = new Uint8Array(N * N * 4), rows = c.r.length, x0 = Math.floor((N - 125) / 2), y0 = Math.floor((N - rows * 5) / 2), r, k, i, j;
    for (r = 0; r < rows; r++) for (k = 0; k < 25; k++) {
      var ch = c.r[r].charAt(k); if (ch === ' ') continue;
      var hex = PALETTE[VID_PIG.indexOf(c.p[r].charAt(k))] || '#cfcbc2', R = parseInt(hex.slice(1, 3), 16), G = parseInt(hex.slice(3, 5), 16), B = parseInt(hex.slice(5, 7), 16);
      for (j = 0; j < 5; j++) for (i = 0; i < 5; i++) { var o = (((N - 1 - (y0 + r * 5 + j)) * N) + x0 + k * 5 + i) * 4; px[o] = R; px[o + 1] = G; px[o + 2] = B; px[o + 3] = 255; }
    }
    gl.bindTexture(gl.TEXTURE_2D, glint.sa); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, px); gl.generateMipmap(gl.TEXTURE_2D);
    var h = 0, all = c.r.join('') + c.p.join(''); for (i = 0; i < all.length; i++) h = (h * 31 + all.charCodeAt(i)) >>> 0;
    var ang = 0.15 + (h % 1000) / 1000 * 0.2, zoom = 0.9 + ((h >>> 10) % 1000) / 1000 * 0.07;   // from the picture itself: the same words, the same twist
    var src = glint.sa, dst = glint.sb, pass = 0, wasRunning = !!glint.timer;
    clearInterval(glint.timer); glint.timer = null;     // Life rests while the Thinker thinks
    function step() {
      if (!live()) { SEAL.busy = false; return; }
      gl.viewport(0, 0, N, N);
      gl.bindFramebuffer(gl.FRAMEBUFFER, glint.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dst, 0);
      gl.useProgram(glint.seal); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src);
      gl.uniform1i(gl.getUniformLocation(glint.seal, 't'), 0); gl.uniform1f(gl.getUniformLocation(glint.seal, 'ang'), ang); gl.uniform1f(gl.getUniformLocation(glint.seal, 'zoom'), zoom); gl.uniform1f(gl.getUniformLocation(glint.seal, 'mode'), pass % 3 === 2 ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindTexture(gl.TEXTURE_2D, dst); gl.generateMipmap(gl.TEXTURE_2D);   // the iris reads the frame's mean from its smallest level
      var t_ = src; src = dst; dst = t_; pass++;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(glint.sealShow); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(gl.getUniformLocation(glint.sealShow, 't'), 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);   // the Glint shows the work
      if (pass < SEAL.passes) { requestAnimationFrame(step); return; }
      var S = SEAL.n, full = new Uint8Array(N * N * 4), out = new Uint8Array(S * S * 4), bs = N / S, bx, by, sx, sy;
      gl.bindFramebuffer(gl.FRAMEBUFFER, glint.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, src, 0);
      gl.readPixels(0, 0, N, N, gl.RGBA, gl.UNSIGNED_BYTE, full); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (fullMode) {                                   // the whole cohered field at full size, for the globe: kept in memory for this visit only, never stored
        try { glintUpload(glint.cpu); } catch (e) {}
        if (wasRunning && !sleeping) glint.timer = setInterval(glintTick, GLINT.ms);
        SEAL.busy = false; try { job[1](full); } catch (e) {}
        setTimeout(sealPump, 60); return;
      }
      for (by = 0; by < S; by++) for (bx = 0; bx < S; bx++) {   // the whole cohered disc, each block of eight texels averaged into one
        var sum = [0, 0, 0]; for (sy = 0; sy < bs; sy++) for (sx = 0; sx < bs; sx++) { var oo = ((by * bs + sy) * N + bx * bs + sx) * 4; sum[0] += full[oo]; sum[1] += full[oo + 1]; sum[2] += full[oo + 2]; }
        var ob = (by * S + bx) * 4; out[ob] = sum[0] / (bs * bs); out[ob + 1] = sum[1] / (bs * bs); out[ob + 2] = sum[2] / (bs * bs); out[ob + 3] = 255;
      }
      var seal = '';                                    // each texel to its nearest YAM-PAL colour, one character each: 256 characters
      for (i = 0; i < S * S; i++) { var best = 0, bd = 1e9; for (k = 0; k < PALETTE.length && k < VID_PIG.length; k++) { var hx = PALETTE[k], dr = out[i * 4] - parseInt(hx.slice(1, 3), 16), dg = out[i * 4 + 1] - parseInt(hx.slice(3, 5), 16), db = out[i * 4 + 2] - parseInt(hx.slice(5, 7), 16), dd = dr * dr + dg * dg + db * db; if (dd < bd) { bd = dd; best = k; } } seal += VID_PIG.charAt(best); }
      c.s = seal; vidSaveSoon();
      try { glintUpload(glint.cpu); } catch (e) {}       // Life's field back, as it was
      if (wasRunning && !sleeping) glint.timer = setInterval(glintTick, GLINT.ms);
      SEAL.busy = false; try { job[1](seal); } catch (e) {}
      tiltViewSoon(); setTimeout(sealPump, 60);        // the glass redrawn with the new seal in its place
    }
    requestAnimationFrame(step);
  }
  function sealCanvas(seal, px) {                       // the seal drawn round, crisp, at px across
    var S = SEAL.n, cv = document.createElement('canvas'), g = cv.getContext('2d'), im = g.createImageData(S, S), i;
    cv.width = S; cv.height = S;
    for (i = 0; i < S * S; i++) { var hx = PALETTE[VID_PIG.indexOf(seal.charAt(i))] || '#000000', y = S - 1 - Math.floor(i / S), x = i % S, o = (y * S + x) * 4; im.data[o] = parseInt(hx.slice(1, 3), 16); im.data[o + 1] = parseInt(hx.slice(3, 5), 16); im.data[o + 2] = parseInt(hx.slice(5, 7), 16); im.data[o + 3] = 255; }
    g.putImageData(im, 0, 0);
    cv.style.cssText = 'width:' + px + 'px;height:' + px + 'px;border-radius:50%;image-rendering:pixelated;flex:none;box-shadow:0 0 0 1px #3a3f47;pointer-events:auto;cursor:zoom-in';
    cv.__seal = seal; cv.addEventListener('mouseenter', function () { marbleShow(cv); });
    cv.addEventListener('mouseleave', marbleHide);
    return cv;
  }
  // THE MARBLE (user1, 22 x 2026: "I wish to hover over it, to see it closely ... it contains mystery. I think here we have glassblown a unique
  // marble. An artisan at Burning Man long ago brought his works and did just that for visitors"): under the pointer the seal is held up
  // large, smooth, round, with a glass highlight over it, and put down again when the pointer leaves
  var marble = null;
  function marbleHide() { if (marble) { marble.remove(); marble = null; } }
  // THE GLOBE (user1, 22 x 2026: "my eye demand[s] ... Star Control II VGA globe-animation ... all canvas, classic scaler ops. We would simply
  // roll the texture through that spherical transform, or rather two of them, because otherwise the sphere would overwiden the centerline"):
  // the seal laid twice side by side as a world map, two seals round the equator so the turn never stretches one across the face, and
  // rolled under a sphere: for every pixel of the disc its longitude and latitude are worked out once, and each frame the map is read at
  // the longitude plus the turn, lit from the upper left. One turn in fourteen seconds, for as long as the pointer stays.
  var MARBLE_T0 = performance.now();                   // one clock for the turn, so a redrawn seal under the pointer does not start the world over
  // THE WORLDS (user1, 22 x 2026: "request these to be saved off in 64x64 on their way to 16x16 ... it needs noise to be applied to growl that
  // smooth upsample. I'd take it to 128x128 and add perlin noise, a little bit hue but mostly brightness"; "Terrestrial planets do not have much
  // of a specular fraction unless a watery medium fills in here and there"). Nothing larger is stored: the Thinker is the same on this machine
  // every time, so when a seal is held up the Thinker pours its view again and the whole field, 128 x 128, becomes the world -- kept in memory
  // for this visit. Until it arrives, the stored seal smoothed stands in. Both are roughened with Perlin noise, mostly in brightness, a little
  // in hue, seeded by the seal; and the shine is the water's: a world mostly dry is matte.
  var WORLDS = {};
  function worldFull(c, cb) {
    var k = c.h + ':' + vidHash(c.r.join('') + c.p.join(''));
    if (WORLDS[k]) { cb(WORLDS[k]); return; }
    if (!glint.gl || !glint.seal || c.tr) return;
    SEAL.queue.push([c, function (full) { WORLDS[k] = full; var ks = Object.keys(WORLDS); if (ks.length > 48) delete WORLDS[ks[0]]; cb(full); }, 'full']); sealPump();
  }
  function perlin(seed) {                               // a small Perlin gradient noise, seeded; returns f(x, y) in about -1..1
    var p = [], i, j, t; for (i = 0; i < 256; i++) p[i] = i;
    var s = seed >>> 0 || 1; for (i = 255; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; j = s % (i + 1); t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < 256; i++) p[256 + i] = p[i];
    function fade(q) { return q * q * q * (q * (q * 6 - 15) + 10); }
    function grad(h, x, y) { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } }
    return function (x, y) {
      var X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
      var u = fade(x), v = fade(y), a = p[X] + Y, b = p[X + 1] + Y;
      var l1 = grad(p[a], x, y) * (1 - u) + grad(p[b], x - 1, y) * u, l2 = grad(p[a + 1], x, y - 1) * (1 - u) + grad(p[b + 1], x - 1, y - 1) * u;
      return l1 * (1 - v) + l2 * v;
    };
  }
  function worldMap(srcCanvas, side, seed) {           // the half-map roughened with noise, then laid with its mirror: (2 side) x side, seamless both ways round
    var half = document.createElement('canvas'); half.width = side; half.height = side; var hg = half.getContext('2d'); hg.imageSmoothingEnabled = true; hg.imageSmoothingQuality = 'high';
    hg.drawImage(srcCanvas, 0, 0, side, side);
    var im = hg.getImageData(0, 0, side, side), d = im.data, nb = perlin(seed), nh = perlin(seed ^ 0x9e3779b9), x, y;
    for (y = 0; y < side; y++) for (x = 0; x < side; x++) {
      var fx = x / side, fy = y / side, n = 0, amp = 0.5, fr = 4;
      for (var o = 0; o < 4; o++) { n += nb(fx * fr, fy * fr) * amp; amp *= 0.5; fr *= 2; }   // four octaves: continents to grit
      var hn = nh(fx * 3, fy * 3), k = (y * side + x) * 4, br = 1 + 0.30 * n;
      d[k] = Math.max(0, Math.min(255, d[k] * br + 12 * hn)); d[k + 1] = Math.max(0, Math.min(255, d[k + 1] * br)); d[k + 2] = Math.max(0, Math.min(255, d[k + 2] * br - 12 * hn));
    }
    hg.putImageData(im, 0, 0);
    var m = document.createElement('canvas'); m.width = side * 2; m.height = side; var mg = m.getContext('2d');
    mg.drawImage(half, 0, 0); mg.save(); mg.translate(side * 2, 0); mg.scale(-1, 1); mg.drawImage(half, 0, 0); mg.restore();
    return { data: mg.getImageData(0, 0, side * 2, side).data, W: side * 2, H: side };
  }
  function marbleShow(src) {
    if (marble && marble.__seal === src.__seal) { marble.__src = src; return; }   // the same seal, drawn again under the pointer: the same globe goes on turning
    marbleHide();
    var R = 132, PX = 176, r = src.getBoundingClientRect(), d = document.createElement('div'), cv = document.createElement('canvas'), g = cv.getContext('2d');
    cv.width = PX; cv.height = PX; cv.style.cssText = 'width:' + R + 'px;height:' + R + 'px;border-radius:50%;display:block';
    var seed = 0, sealStr = String(src.__seal || ''), wet = 0, i, x, y;
    for (i = 0; i < sealStr.length; i++) { seed = (seed * 31 + sealStr.charCodeAt(i)) >>> 0; if ('dfg'.indexOf(sealStr.charAt(i)) >= 0) wet++; }   // sky, water, deep
    wet = sealStr.length ? wet / sealStr.length : 0;
    var M = worldMap(src, 64, seed);                    // the stored seal, smoothed and roughened, while the full world is poured
    var img = g.createImageData(PX, PX), out = img.data, tab = [], TILT = -0.38, cT = Math.cos(TILT), sT = Math.sin(TILT);   // the north tipped toward us: its pole always in sight, the south's never
    for (y = 0; y < PX; y++) for (x = 0; x < PX; x++) {           // the sphere's table: for each pixel inside the disc, its longitude, latitude and light
      var nx = (x + 0.5) / PX * 2 - 1, ny = (y + 0.5) / PX * 2 - 1, rr = nx * nx + ny * ny; if (rr > 1) { tab.push(null); continue; }
      var nz = Math.sqrt(1 - rr), wy = ny * cT + nz * sT, wz = -ny * sT + nz * cT;   // from the view back to the world, through the tilt
      var lon = Math.atan2(nx, wz), lat = Math.asin(Math.max(-1, Math.min(1, wy))), light = Math.max(0.16, (-nx * 0.45 - ny * 0.55 + nz * 0.7)) * 1.1;
      tab.push([lon / (2 * Math.PI), lat / Math.PI + 0.5, Math.min(1.2, light)]);
    }
    // WHERE IT HAPPENED (user1, 22 x 2026: "the world should show ... a white 75% opaque circle, where we are, where this View happened, at some
    // lat and long. No numbers, only the circle. Half of the time out of sight. (unless polar north or south, always and never respectively)"):
    // a place on the world chosen by the words themselves, turning with it
    var hw = 0, wtext = src.__c ? src.__c.r.join('') + src.__c.p.join('') : sealStr; for (i = 0; i < wtext.length; i++) hw = (hw * 33 + wtext.charCodeAt(i)) >>> 0;
    var mLat = ((hw % 1000) / 1000 * 2 - 1) * 1.35, mLon = ((hw >>> 10) % 1000) / 1000 * 2 * Math.PI;   // latitude within the polar circles' edge, any longitude
    // THE PLACE NAMED (user1, 22 x 2026: "Put the name of the place to the lower-right of the globe's lat/long ring, if it is a place (or noun)
    // we know" -- She Came From Planet Claire): the view's own noun when the painter knew it, else the setting its words named; on a slip of
    // glass over the world, so the name may run past the world's edge, at the ring's own opacity
    var c0 = src.__c, LX = window.VIDOUTE && window.VIDOUTE.LEX, place = c0 ? (c0.kn || (LX && LX.hasOwnProperty(c0.ti)) ? c0.ti : c0.st && c0.st !== 'hills' ? c0.st : c0.st === 'hills' ? 'the hills' : '') : '';
    var lab = null, lg = null, LW = R + 140, LH = R + 30, dpr = window.devicePixelRatio || 1;
    if (place) { lab = document.createElement('canvas'); lab.width = Math.round(LW * dpr); lab.height = Math.round(LH * dpr); lab.style.cssText = 'position:absolute;left:0;top:0;width:' + LW + 'px;height:' + LH + 'px;pointer-events:none'; lg = lab.getContext('2d'); lg.scale(dpr, dpr); lg.font = '10px ' + VID_FACE; lg.textBaseline = 'top'; }
    function marker(turn) {
      var lv = mLon - turn * 2 * Math.PI, wx = Math.cos(mLat) * Math.sin(lv), wyy = Math.sin(mLat), wzz = Math.cos(mLat) * Math.cos(lv);
      var vy = wyy * cT - wzz * sT, vz = wyy * sT + wzz * cT, behind = vz <= 0.05;   // round the back it is still shown, faintly, through the world (user1, 22 x: "at 32% opacity")
      g.beginPath(); g.arc((wx + 1) / 2 * PX, (vy + 1) / 2 * PX, PX * 0.034, 0, 2 * Math.PI); g.lineWidth = PX * 0.011; g.strokeStyle = behind ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.75)'; g.stroke();   // the ring only: "we will pretend to see that very area, do not block it" (user1, 22 x)
      if (lg) { var lx = (wx + 1) / 2 * R + R * 0.034 + 2, ly = (vy + 1) / 2 * R + R * 0.034 + 1; lg.clearRect(0, 0, LW, LH); lg.lineWidth = 2.5; lg.strokeStyle = behind ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.6)'; lg.strokeText(place, lx, ly); lg.fillStyle = behind ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.75)'; lg.fillText(place, lx, ly); }
    }
    function frame(t) {
      var turn = (t / 14000) % 1, k = 0, map = M.data, MW = M.W, MH = M.H;
      for (i = 0; i < PX * PX; i++, k += 4) {
        var e = tab[i]; if (!e) { out[k + 3] = 0; continue; }
        var u = ((e[0] + turn) % 1 + 1) % 1 * MW, v = e[1] * (MH - 1), u0 = Math.floor(u), v0 = Math.floor(v), fu = u - u0, fv = v - v0, u1 = (u0 + 1) % MW, v1 = Math.min(MH - 1, v0 + 1);
        for (var ch = 0; ch < 3; ch++) {
          var a = map[(v0 * MW + u0) * 4 + ch] * (1 - fu) + map[(v0 * MW + u1) * 4 + ch] * fu, b = map[(v1 * MW + u0) * 4 + ch] * (1 - fu) + map[(v1 * MW + u1) * 4 + ch] * fu;
          out[k + ch] = Math.min(255, (a * (1 - fv) + b * fv) * e[2]);
        }
        out[k + 3] = 255;
      }
      g.putImageData(img, 0, 0); marker(turn);
    }
    if (src.__c) worldFull(src.__c, function (full) {   // the whole field, 128 across, becomes the world
      var N = Math.round(Math.sqrt(full.length / 4)), fc = document.createElement('canvas'); fc.width = N; fc.height = N; var fg = fc.getContext('2d'), fi = fg.createImageData(N, N), yy;
      for (yy = 0; yy < N; yy++) fi.data.set(full.subarray((N - 1 - yy) * N * 4, (N - yy) * N * 4), yy * N * 4);   // read back bottom-up; set the right way up
      fg.putImageData(fi, 0, 0);
      var cs_ = Math.floor(N * 0.70), cx_ = Math.floor((N - cs_) / 2), cc = document.createElement('canvas'); cc.width = cs_; cc.height = cs_; cc.getContext('2d').drawImage(fc, cx_, cx_, cs_, cs_, 0, 0, cs_, cs_);   // the square inside the cohered disc, so no black corners become the poles
      if (marble === d) M = worldMap(cc, 128, seed);
    });
    var shine = wet > 0.25 ? 0.36 : 0.10;               // a wet world shines; a dry one hardly
    var gloss = document.createElement('div');
    gloss.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 34% 28%, rgba(255,255,255,' + shine + ') 0%, rgba(255,255,255,' + (shine / 5).toFixed(3) + ') 20%, rgba(255,255,255,0) 38%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%);pointer-events:none';
    var left = Math.min(window.innerWidth - R - 12, Math.max(8, r.left + r.width / 2 - R / 2)), top = r.bottom + R + 10 > window.innerHeight - 8 ? r.top - R - 10 : r.bottom + 10;   // below its seal, so the panel's movie plays above its world (user1, 22 x); above only when there is no room below
    d.style.cssText = 'position:fixed;left:' + left + 'px;top:' + top + 'px;width:' + R + 'px;height:' + R + 'px;z-index:2147483646;pointer-events:none;border-radius:50%;box-shadow:0 0 0 1px #3a3f47, 0 8px 30px rgba(0,0,0,0.6)';
    d.appendChild(cv); d.appendChild(gloss); if (lab) d.appendChild(lab); document.body.appendChild(d); marble = d; d.__seal = src.__seal; d.__src = src;
    var gone = 0;
    (function spin(now) {
      if (marble !== d) return;
      if (!d.__src.isConnected) { if (!gone) gone = now; if (now - gone > 600) { marbleHide(); return; } } else gone = 0;   // the glass redrawn: a moment's grace for the new seal to take it up
      frame(now - MARBLE_T0); requestAnimationFrame(spin);
    })(performance.now());
  }
  setTimeout(glintStart, 0);
  // ================= THE GAUGES (user1, 10 x 2026) =================
  // Four sparklines left of the go-lights, after ReadR's sysgraphs ("memory pressure, cpu responsiveness, and
  // open stuff in the DOM") and the VU for their looks. What a page may know of its own tab, once a second
  // (user1: "I would set the check-points very generously, perhaps no more than once a second"):
  //   LAG     how late a one-second timer fires, or the longest task in the second, in ms: the drag you feel.
  //           Purple; fuchsia once an observation came very late
  //   HEAP    performance.memory, Chromium only, coarse: a sawtooth whose teeth are collections; its floor
  //           rising is the clog. The window's floor is drawn as a faint line. Emerald; yellow-green once high
  //   NODES   elements in the document, in thousands: the line only a new chat brings down. Bluegray; a
  //           lighter blue-cyan once very many
  //   RANGES  runs held by the Highlight registry (the lamp's, the paint's, the tincture's): ours alone, and
  //           the first to show a leak. True grey; near-white once heavy
  // The hot colour is by leave only (user1: "a click on each would *allow* it to show its upper-color NOTICE
  // ME! range. Reason for: all Bela's controls are beneath my writing eyes ... I do require them to gently march
  // and have lease, but each cannot distract me"): a strip stays in its base colour however hot the reading,
  // until clicked; clicked, it shows the hot colour while the reading is hot, and a dim pip at its foot, left, says
  // it has leave; clicked again, the leave is withdrawn. Leave is remembered across pastes. The shape is never
  // amended. Hover for the number; a click also puts all four in the eat-label.
  var GAUGE = { w: 26, h: 14, n: 40, gap: 3, every: 1000 };
  var gaugeNames = ['lag', 'heap', 'nodes', 'ranges'], gaugeUnits = ['ms', 'MB', 'k', ''], gaugeSpan = [100, 20, 5, 1000];
  var gaugeBase = ['hsl(275,45%,62%)', 'hsl(150,55%,50%)', 'hsl(212,28%,62%)', 'hsl(0,0%,55%)'];
  var gaugeHotC = ['hsl(310,85%,66%)', 'hsl(80,80%,58%)', 'hsl(195,70%,74%)', 'hsl(0,0%,92%)'];
  function gaugeIsHot(i, x, lo) { return i === 0 ? x >= 300 : i === 1 ? x >= 1200 || (lo > 0 && x > lo * 1.4) : i === 2 ? x >= 60 : x >= 5000; }   // heap: hot at 1.4x its own window-floor, whatever the MB (user1 saw the floor spike unremarked at 246 MB)
  var gaugeData = gaugeNames.map(function () { return []; }), gaugeHot = [false, false, false, false], gaugeLeave = [false, false, false, false], gaugeTimer = null, gaugeLong = 0, gaugeLongObs = null, gaugeLast = 0;
  try { (JSON.parse(localStorage.getItem('blinken-gauges-leave') || '[]') || []).forEach(function (v, i) { if (i < 4) gaugeLeave[i] = !!v; }); } catch (e) {}
  var gaugeBox = document.createElement('span'); gaugeBox.id = 'bk-gauges';
  gaugeBox.style.cssText = 'display:inline-flex;gap:' + GAUGE.gap + 'px;margin-right:10px;align-items:center;cursor:pointer';   // the hand: these are clicked, not dragged by (the head's drag leaves them be)
  var gaugeCv = gaugeNames.map(function (nm, i) {
    var c = document.createElement('canvas'), dpr = window.devicePixelRatio || 1;
    c.width = Math.round(GAUGE.w * dpr); c.height = Math.round(GAUGE.h * dpr);
    c.style.cssText = 'width:' + GAUGE.w + 'px;height:' + GAUGE.h + 'px;background:#070809;border-radius:3px';
    c.getContext('2d').scale(dpr, dpr); c.title = nm; gaugeBox.appendChild(c);
    c.onclick = function () {
      gaugeLeave[i] = !gaugeLeave[i]; try { localStorage.setItem('blinken-gauges-leave', JSON.stringify(gaugeLeave)); } catch (e) {}
      gaugeDraw(); eatLabel.textContent = gaugeNames.map(function (n, k) { return gaugeFmt(k); }).join(' · ') + ' · ' + gaugeNames[i] + (gaugeLeave[i] ? ' may notice' : ' quiet');
    };
    return c;
  });
  (function () { var scan = document.getElementById('bk-scan'); if (scan && scan.parentNode) scan.parentNode.insertBefore(gaugeBox, scan); })();
  function gaugeHeap() { try { return performance.memory && performance.memory.usedJSHeapSize ? performance.memory.usedJSHeapSize / 1048576 : NaN; } catch (e) { return NaN; } }
  function gaugeRanges() {
    var n = 0; try { if (HL) CSS.highlights.forEach(function (h) { n += h.size; }); } catch (e) {} return n;
  }
  function gaugeFloor(i) { var ok = gaugeData[i].filter(function (x) { return !isNaN(x); }); return ok.length ? Math.min.apply(null, ok) : NaN; }
  function gaugeSample() {
    if (!live()) return;
    var now = performance.now(), late = gaugeLast ? Math.max(0, now - gaugeLast - GAUGE.every) : 0; gaugeLast = now;
    var v = [Math.max(late, gaugeLong), gaugeHeap(), document.getElementsByTagName('*').length / 1000, gaugeRanges()];
    gaugeLong = 0;
    v.forEach(function (x, i) {
      gaugeData[i].push(x); if (gaugeData[i].length > GAUGE.n) gaugeData[i].shift();
      gaugeHot[i] = !isNaN(x) && gaugeIsHot(i, x, gaugeFloor(i));              // live, not sticky: the colour follows the reading
    });
    gaugeDraw();
  }
  function gaugeFmt(i) {
    var d = gaugeData[i], x = d.length ? d[d.length - 1] : NaN;
    return gaugeNames[i] + ' ' + (isNaN(x) ? '--' : i === 1 ? x.toFixed(0) : i === 2 ? x.toFixed(1) : Math.round(x)) + gaugeUnits[i] + (gaugeHot[i] ? ' !' : '');
  }
  function gaugeDraw() {
    gaugeNames.forEach(function (nm, i) {
      var hot = gaugeHot[i] && gaugeLeave[i], c = gaugeCv[i], g = c.getContext('2d'), d = gaugeData[i], w = GAUGE.w, h = GAUGE.h, k, col = hot ? gaugeHotC[i] : gaugeBase[i];
      g.clearRect(0, 0, w, h);
      if (gaugeLeave[i]) { g.globalAlpha = 0.55; g.fillStyle = gaugeBase[i]; g.fillRect(1, h - 3, 2, 2); g.globalAlpha = 1; }   // the pip, at the line's initial position (user1: ". ______"): this strip may go hot
      var ok = d.filter(function (x) { return !isNaN(x); });
      if (!ok.length) { g.globalAlpha = 0.3; g.fillStyle = col; g.fillRect(2, h - 3, w - 4, 1); g.globalAlpha = 1; c.title = nm + ' --'; return; }
      var lo = Math.min.apply(null, ok), hi = Math.max.apply(null, ok);
      if (i === 0 || i === 3) lo = 0;                                             // lag and ranges stand on zero
      if (hi - lo < gaugeSpan[i]) hi = lo + gaugeSpan[i];                          // a floor on the span: quiet lies flat
      var sx = (w - 2) / (GAUGE.n - 1), y = function (x) { return h - 2 - (x - lo) / (hi - lo) * (h - 4); }, x0 = w - 1 - (d.length - 1) * sx;
      g.beginPath(); g.moveTo(x0, h - 1);
      for (k = 0; k < d.length; k++) g.lineTo(x0 + k * sx, isNaN(d[k]) ? h - 1 : y(d[k]));
      g.lineTo(x0 + (d.length - 1) * sx, h - 1); g.closePath();
      g.globalAlpha = hot ? 0.22 : 0.12; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
      g.beginPath();
      for (k = 0; k < d.length; k++) { var py = isNaN(d[k]) ? h - 1 : y(d[k]); if (k) g.lineTo(x0 + k * sx, py); else g.moveTo(x0, py); }
      g.strokeStyle = col; g.lineWidth = 1; g.stroke();
      if (i === 1) { var fy = Math.round(y(Math.min.apply(null, ok))) + 0.5; g.globalAlpha = 0.35; g.strokeStyle = col; g.beginPath(); g.moveTo(1, fy); g.lineTo(w - 1, fy); g.stroke(); g.globalAlpha = 1; }   // the heap's floor
      c.title = gaugeFmt(i) + (i === 1 ? ' (floor ' + Math.min.apply(null, ok).toFixed(0) + ')' : '') + (i === 0 ? ' late or blocked' : '') + (gaugeLeave[i] ? ' -- may notice; click for quiet' : ' -- quiet; click to let it notice');
    });
  }
  function gaugesStart() {
    if (gaugeTimer) return;
    try {                                                                          // long tasks, when the page may observe them: the longest in each second
      if (typeof PerformanceObserver === 'function') { gaugeLongObs = new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { if (e.duration > gaugeLong) gaugeLong = e.duration; }); }); gaugeLongObs.observe({ entryTypes: ['longtask'] }); }
    } catch (e) { gaugeLongObs = null; }
    gaugeLast = performance.now(); gaugeTimer = setInterval(gaugeSample, GAUGE.every); gaugeDraw();
  }
  function gaugesStop() { clearInterval(gaugeTimer); gaugeTimer = null; try { if (gaugeLongObs) gaugeLongObs.disconnect(); } catch (e) {} gaugeBox.remove(); }
  gaugesStart();
  setTimeout(lampSay, 0);                               // after the library at the foot has run
  document.getElementById('bk-bt').onclick = function () {
    if (screwState.show) { showScrew(false); return; }  // a swap: the words come with you
    blueState.show = !blueState.show; if (!blueState.show) { shade = 0; fit(); } saveBlue(); placeBlue(); if (blueState.show) ta.focus();   // rolled up: the shade is relieved
  };
  document.getElementById('bk-sb').onclick = function () { showScrew(!screwState.show); };
  if (screwState.show) showScrew(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (screwState.show) { screwMeasure(); screwRender(); } });

  function onResize(){ placeBlue(); if (screwState.show) { screwMeasure(); screwRender(); } }
  window.addEventListener('resize', onResize);
  fit();

  window.__blinkenStop = function () {
    try { document.documentElement.classList.remove('bk-asleep'); unlistenAll(); stopVoice(); gaugesStop(); glintStop(); tiltCloseAll(); galleryClose(); outputterClose(); if (provTip) provTip.remove(); playSet(false); wyrdUnpadAll(); flagsUnpadAll(); vidUnpadAll(); try { FEED().style.transform = ''; } catch (e0) {} if (tiltState.layer) tiltState.layer.remove(); if (ringSvg) { ringSvg.remove(); ringM.remove(); } if (ringSheet) ringSheet.remove(); unlamp(null); closeGear(); voiceRow.remove(); lampStyle.remove(); filterStyle.remove(); forgetLamp(); if (blueLamp) blueLamp.remove(); ta.style.color = BLUE.ink; lampNames.forEach(function (n) { CSS.highlights['delete'](n); }); } catch (e) {}   // the voice and the lamp go with him
    if (clockTimer) clearInterval(clockTimer); clearInterval(sweepTimer);
    if (raf) cancelAnimationFrame(raf); mo.disconnect();
    window.removeEventListener('resize', onResize);
    if (blue && blue.parentNode) blue.remove();
    if (prev && prev.parentNode) prev.remove();
    window.removeEventListener('wheel', onHandWheel, { capture: true });
    if (HL) hlNames.concat(tnNames).forEach(function (n) { CSS.highlights['delete'](n); });
    document.removeEventListener('scroll', onScrollTint, true); clearTimeout(tnScrollT);
    if (hlStyle && hlStyle.parentNode) hlStyle.remove();
    if (seenStyle && seenStyle.parentNode) seenStyle.remove();   // the seen strips go with him
    delete window.__belaWhy; delete window.__belaPaint;
    if (skyT) clearInterval(skyT); if (skyStyle && skyStyle.parentNode) skyStyle.remove();
    document.removeEventListener('click', onPicClick, true);
    jammed.forEach(unjamOne); jammed = [];
    rifPics = []; if (rifStyle) { rifStyle.remove(); rifStyle = null; }
    corners = []; if (cornerLayer) { cornerLayer.remove(); cornerLayer = null; }
    if (cycT) clearInterval(cycT); if (cycStyle && cycStyle.parentNode) cycStyle.remove(); delete window.__belaCycle;
    if (selStyle && selStyle.parentNode) selStyle.remove(); document.removeEventListener('dragstart', noDrag, true);
    if (screw && screw.parentNode) screw.remove(); clearInterval(screwBlink); if (P.raf) cancelAnimationFrame(P.raf);
    if (st && st.parentNode) st.remove(); delete window.__blinkenStop;
    if (box && box.parentNode) box.remove();           // v3: Bela himself, not only his boxes
  };

  sweep();
  (function(){ var el = document.getElementById('bk-led'); if (el) { el.style.background = RUN; el.style.boxShadow = '0 0 6px ' + RUN; } })();  // systems green
  console.log('%c chinguard lit ','background:#35d6d6;color:#000;border-radius:3px',
    '-- contrarotulus turning, left-rules charting, VU digesting, bluebox hung. __blinkenStop() to remove.');
  console.log('[chinguard] chat paint: ' + (HL ? 'Highlight API present; (  ) paints illustrations in view' : 'no Highlight API in this browser; illustrations in the chat stay plain'));
  console.log('[chinguard] grammar: ' + GRAMMAR_SRC + ' · palette: ' + PALETTE_NAME + ', ' + PALETTE.length + ' slots. No deck on this page, so this table is carried, not read.');
  console.log('[chinguard] bluebox: ' + (ed0 ? 'composer found, ' + defaultW + 'px, font ' + (BLUE.font || (ecs.fontSize + '/' + ecs.lineHeight + ' ' + ecs.fontFamily.split(',')[0])) : 'NO composer found yet'));
})();

/* the gem -- the green diamond, for Bela. Rides inside vespers.js, after him.
   The app draws its suggestion from p[data-placeholder] with CSS content:,
   which no one can select; Clarion paints it black. The gem lights only when
   a suggestion (not the house hint) is waiting. Hover: read it. Click: take it
   as your own words -- into the bluebox or the screwbox if one is open, else
   into the composer, at the caret. Bela's ✕ takes the gem down with him.
   __gemStop() removes it alone. */
(function () {
  'use strict';
  var ED    = '[data-testid="code-prompt-input"]';
  var HINT  = ED + ' p.is-editor-empty[data-placeholder]';
  var HOUSE = 'Type / for commands';                  // the app's own hint: not a suggestion
  var GEM   = '#35855b', LIT = '#6fd66f';              // YAM-PAL forest (slot 31), and its green (slot 7)

  if (window.__gemStop) window.__gemStop();
  var last = '';
  function offered() {
    var p = document.querySelector(HINT), s = p ? (p.dataset.placeholder || '').trim() : '';
    return s && s !== HOUSE ? s : '';
  }
  function shown(id) { var el = document.getElementById(id); return el && el.style.display !== 'none' ? el : null; }

  var gem = document.createElement('div');
  gem.id = 'bk-gem'; gem.textContent = '◆';
  gem.title = 'take this suggestion as editable words';
  gem.style.cssText = 'position:fixed;z-index:2147483001;display:none;cursor:pointer;user-select:none;' +
    'font:15px/1 \'DejaVu Sans Mono\',monospace;color:' + GEM + ';transition:color .12s, text-shadow .12s';
  var peek = document.createElement('div');           // Clarion blacks the hint out; the peek is where it can be read
  peek.id = 'bk-gem-peek';
  peek.style.cssText = 'position:fixed;z-index:2147483001;display:none;pointer-events:none;max-width:520px;' +
    'padding:6px 10px;border-left:3px solid ' + GEM + ';background:rgba(11,13,16,.92);color:rgba(255,255,255,.96);' +
    'font:11px/1.45 \'DejaVu Sans Mono\',monospace;white-space:pre-wrap';
  document.body.appendChild(gem); document.body.appendChild(peek);

  function take() {
    var s = offered() || last; if (!s) return;
    var tgt = shown('bk-screw') ? document.getElementById('bk-sc-ta')
            : shown('bk-blue')  ? document.getElementById('bk-blue-ta') : null;
    if (tgt) {                                         // Bela's own boxes: at the caret; their input handlers do the rest
      tgt.focus({ preventScroll: true });
      tgt.setRangeText(s, tgt.selectionStart, tgt.selectionEnd, 'end');
      tgt.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      var ed = document.querySelector(ED); if (!ed) return;
      ed.focus(); document.execCommand('insertText', false, s);   // ProseMirror takes this as a real transaction
    }
    peek.style.display = 'none';
  }
  gem.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); take(); });
  gem.addEventListener('pointerenter', function () {
    var s = offered() || last; if (!s) return;
    peek.textContent = s;
    var r = gem.getBoundingClientRect();
    peek.style.left = Math.max(8, r.left) + 'px';
    peek.style.bottom = Math.round(window.innerHeight - r.top + 6) + 'px';
    peek.style.display = 'block';
    gem.style.color = LIT; gem.style.textShadow = '0 0 6px ' + LIT;
  });
  gem.addEventListener('pointerleave', function () {
    peek.style.display = 'none'; gem.style.color = GEM; gem.style.textShadow = '';
  });

  var queued = 0;
  function place() {
    queued = 0;
    var s = offered(), ed = document.querySelector(ED);
    if (s) last = s;
    if (!s || !ed) { gem.style.display = peek.style.display = 'none'; return; }
    var r = ed.getBoundingClientRect();
    gem.style.left = Math.round(r.left - 18) + 'px';
    gem.style.top  = Math.round(r.top + 4) + 'px';
    gem.style.display = 'block';
  }
  function soon() { if (!queued) queued = requestAnimationFrame(place); }
  var mo = new MutationObserver(soon);
  mo.observe(document.body, { subtree: true, childList: true, attributes: true,
    attributeFilter: ['data-placeholder', 'class', 'data-doc-empty'] });
  addEventListener('resize', soon);
  place();

  function stop() {
    mo.disconnect(); removeEventListener('resize', soon); if (queued) cancelAnimationFrame(queued);
    gem.remove(); peek.remove(); delete window.__gemStop;
  }
  window.__gemStop = stop;
  var bela = window.__blinkenStop;                     // Bela's ✕ takes the gem down with him
  if (bela && !bela._gem) {
    window.__blinkenStop = function () { stop(); bela(); };
    window.__blinkenStop._gem = 1;
  }
  console.log('%c gem set ', 'background:' + GEM + ';color:#fff;border-radius:3px',
    '-- lights when a suggestion waits. hover to read, click to take. __gemStop() to remove.');
})();

/* the flap -- ( v^ ), for Bela. Rides inside vespers.js, after him.
   Two stations, UP and DOWN, each where you last put him. A press keeps
   flies him to the other. A drag is kept the moment you let go: where
   the user contrives to put a thing, it stays put. A squeeze into a
   smaller window is not a placing, and is not kept.
   Until DOWN has been placed, it follows the composer's frame: head
   8px under [data-cds="ChatComposer"] > div:first-child, in Chat or
   in Code. Shift+press sends him there and unplaces DOWN again.
   The arrow he will take next is lit. __flapStop() removes it. */
(function () {
  'use strict';
  var FLAP  = { gap: 8 };
  var FRAME = '[data-cds="ChatComposer"] > div:first-child';
  var KEY   = 'blinken-flap';                         // { at: 'up'|'down', up: {left,top}, down: {left,top} }

  if (window.__flapStop) window.__flapStop();
  var box = document.getElementById('blinken-clock');
  if (!box) { console.log('[flap] Bela is not hung; paste vespers.js whole'); return; }

  function here() { return { left: box.offsetLeft, top: box.offsetTop }; }
  var S = null;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!S || (S.at !== 'up' && S.at !== 'down')) S = { at: 'up', up: here(), down: null };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function keep() { S[S.at] = here(); save(); }      // this station is wherever he is now

  function frame() { return document.querySelector(FRAME); }
  function target() {                                 // his top-left, head under the frame
    var f = frame(); if (!f) return null;
    var r = f.getBoundingClientRect(), w = box.offsetWidth;
    return { left: Math.round(r.left + r.width / 2 - w / 2), top: Math.round(r.bottom + FLAP.gap) };
  }
  function inside(p) {                                // the other world may be a smaller window
    return {
      left: Math.max(0, Math.min(window.innerWidth  - box.offsetWidth,  p.left)),
      top:  Math.max(0, Math.min(window.innerHeight - box.offsetHeight, p.top))
    };
  }
  function moveTo(p) {
    p = inside(p);
    box.style.left = p.left + 'px'; box.style.top = p.top + 'px';
    box.style.right = 'auto'; box.style.bottom = 'auto';
    try { localStorage.setItem('blinken-hung', JSON.stringify(p)); } catch (e) {}
    window.dispatchEvent(new Event('resize'));         // Bela's own onResize carries the bluebox along
    paint();
  }

  var btn = document.createElement('span');
  btn.id = 'bk-flap';
  btn.style.cssText = 'position:absolute;right:50px;bottom:9px;cursor:pointer;color:#8f98a5;' +
    'font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;' +
    'white-space:pre;user-select:none';
  btn.innerHTML = '( <b id="bk-flap-v" style="font-weight:normal">v</b><b id="bk-flap-u" style="font-weight:normal">^</b> )';
  box.appendChild(btn);
  // PUPATE [ () ] (user1, 19 x 2026: "Sometimes, to hassle myself with one or another Anthropic menu, I need Bela out of the way ...
  // Click and he hides behind a tile large enough to accommodate Flap and Pupate ... When he is En Pupa, the Pupate button
  // becomes [ )( ] as if to suggest him taking wing again"): everything of his but Flap and this is folded away, the bluebox,
  // the screw and the read-ahead glass with it by a rule they cannot override; the box shrinks to the tile; Flap still flaps him.
  var pup = document.createElement('span');
  pup.id = 'bk-pupa';
  pup.style.cssText = 'position:absolute;right:12px;bottom:9px;cursor:pointer;color:#8f98a5;' +
    'font-size:12px;border:1px solid #1d2026;border-radius:6px;padding:0 7px;line-height:17px;white-space:pre;user-select:none';
  pup.textContent = '()'; pup.title = 'pupate: Bela behind a tile, out of the way';
  box.appendChild(pup);
  var pupa = { on: false, kept: null, style: null };
  function pupate(on) {
    var i, c, r0 = pup.getBoundingClientRect();        // the button stays under the mouse (user1: "click once, and hide all but the tablet. Then to click again ... leaving the button precisely in place")
    if (on === pupa.on) return;
    pupa.on = on;
    if (on) {
      pupa.kept = []; for (i = 0; i < box.children.length; i++) { c = box.children[i]; if (c === btn || c === pup) continue; pupa.kept.push([c, c.style.display]); c.style.display = 'none'; }
      pupa.style = { width: box.style.width, height: box.style.height, padding: box.style.padding, paddingLeft: box.style.paddingLeft, flapRight: btn.style.right, flapBottom: btn.style.bottom, pupBottom: pup.style.bottom };
      box.style.width = '88px'; box.style.height = '28px'; box.style.padding = '4px'; box.style.paddingLeft = '4px';
      btn.style.right = '46px'; btn.style.bottom = '5px'; pup.style.bottom = '5px';
      var st = document.createElement('style'); st.id = 'bk-pupa-style'; st.textContent = '#bk-blue, #bk-screw, #bk-prev { display: none !important; }'; document.head.appendChild(st);
      pup.textContent = ')('; pup.title = 'take wing: Bela back, as he was';
    } else {
      (pupa.kept || []).forEach(function (k) { k[0].style.display = k[1]; }); pupa.kept = null;
      var s = pupa.style || {}; box.style.width = s.width || ''; box.style.height = s.height || ''; box.style.padding = s.padding || ''; box.style.paddingLeft = s.paddingLeft || '';
      btn.style.right = s.flapRight || '50px'; btn.style.bottom = s.flapBottom || '9px'; pup.style.bottom = s.pupBottom || '9px';
      var old = document.getElementById('bk-pupa-style'); if (old) old.remove();
      pup.textContent = '()'; pup.title = 'pupate: Bela behind a tile, out of the way';
    }
    var r1 = pup.getBoundingClientRect(), p = { left: box.offsetLeft + (r0.left - r1.left), top: box.offsetTop + (r0.top - r1.top) };
    p.left = Math.max(0, Math.min(window.innerWidth - box.offsetWidth, p.left)); p.top = Math.max(0, Math.min(window.innerHeight - box.offsetHeight, p.top));
    box.style.left = p.left + 'px'; box.style.top = p.top + 'px'; box.style.right = 'auto'; box.style.bottom = 'auto';   // the box moves around the button, not the button with the box
    window.dispatchEvent(new Event('resize'));         // the bluebox and the rest learn the new shape
  }
  pup.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
  pup.addEventListener('click', function (e) { e.stopPropagation(); pupate(!pupa.on); });
  var vEl = btn.querySelector('#bk-flap-v'), uEl = btn.querySelector('#bk-flap-u');

  function paint() {                                  // light the way he will go next
    var down = S.at === 'up';
    vEl.style.color = down ? '#cfcbc2' : '#3a3f47';
    uEl.style.color = down ? '#3a3f47' : '#cfcbc2';
    btn.title = (down ? 'flap down' + (S.down ? ', to where you last put him' : ', under the composer')
                      : 'flap up, to where you last put him') +
                ' · shift: under the composer, and down follows it again';
  }
  btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); });
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (e.shiftKey) {                                 // re-teach DOWN: under the frame, now
      var t = target(); if (!t) { console.log('[flap] no composer frame on this page'); return; }
      S.at = 'down'; moveTo(t); S.down = null; save(); return;   // DOWN unplaced again: it follows the frame
    }
    S.at = S.at === 'up' ? 'down' : 'up';             // only a placing is kept: a drag, or shift
    var dest = S[S.at] || (S.at === 'down' ? target() : null);   // an unplaced DOWN follows the frame
    if (dest) moveTo(dest);
    save();
  });
  btn.addEventListener('pointerenter', function () { paint(); btn.style.borderColor = '#3f86d6'; });
  btn.addEventListener('pointerleave', function () { btn.style.borderColor = '#1d2026'; });

  var head = document.getElementById('bk-head');      // a drag by the head is a placing: keep it
  function dragged() { setTimeout(keep, 0); }
  if (head) head.addEventListener('pointerup', dragged);
  var land = S[S.at] || (S.at === 'down' ? target() : null);   // at paste: his station's true spot
  if (land) moveTo(land);
  save(); paint();

  function stop() { btn.remove(); if (head) head.removeEventListener('pointerup', dragged); delete window.__flapStop; }
  window.__flapStop = stop;
  var bela = window.__blinkenStop;                    // Bela's ✕ takes the flap down with him
  if (bela && !bela._flap) {
    window.__blinkenStop = function () { stop(); bela(); };
    window.__blinkenStop._flap = 1;
    if (bela._gem) window.__blinkenStop._gem = 1;
  }
  console.log('[flap] ( v^ ) set. frame ' + (frame() ? 'found' : 'NOT found') + '. __flapStop() to remove.');
})();


















































































































/* ==== ECOUTER BEGIN: ecouter.js (speaks) with the lamp (tints), written by ecouter\repo.make.js; folded here by bela.make.js. Do not edit here. ==== */
(function (global, outer) {
  var root = {}, module, exports;
(function (root) {
  'use strict';
  var A = [730, 1090, 2440], I = [270, 2290, 3010], U = [300, 870, 2240];
  var score = [
    { ms: 40, f0: 120, f: A, voice: 0 },
    { ms: 60, f0: 120, f: A, voice: 1 },
    { ms: 300, f0: 120, f: A, voice: 0.8 },
    { ms: 120, f0: 165, f: I, voice: 0.95 },
    { ms: 300, f0: 165, f: I, voice: 0.75 },
    { ms: 120, f0: 98, f: U, voice: 0.9 },
    { ms: 300, f0: 98, f: U, voice: 0.6 },
    { ms: 80, f0: 90, f: U, voice: 0 }
  ];
  function at(ms) { return Math.round(ms * 16); }
  var AIU = { score: score, mids: { a: at(250), i: at(670), u: at(1090) }, want: { a: 120, i: 165, u: 98 }, A: A, I: I, U: U };
  if (typeof module !== 'undefined' && module.exports) module.exports = AIU;
  else root.AIU = AIU;
})(root);
(function (root) {
  'use strict';
  function Reso() { this.y1 = 0; this.y2 = 0; }
  Reso.prototype.step = function (x, f, bw, sr) {
    var r = Math.exp(-Math.PI * bw / sr);
    var c = -r * r, b = 2 * r * Math.cos(2 * Math.PI * f / sr), a = 1 - b - c;
    var y = a * x + b * this.y1 + c * this.y2;
    this.y2 = this.y1; this.y1 = y;
    return y;
  };
  function Anti() { this.x1 = 0; this.x2 = 0; }
  Anti.prototype.step = function (x, f, bw, sr) {
    var r = Math.exp(-Math.PI * bw / sr);
    var c = -r * r, b = 2 * r * Math.cos(2 * Math.PI * f / sr), a = 1 - b - c;
    var y = x / a - (b / a) * this.x1 - (c / a) * this.x2;
    this.x2 = this.x1; this.x1 = x;
    return y;
  };
  function Noise(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var x = Math.imul(t ^ (t >>> 15), t | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 2147483648 - 1;
    };
  }
  var BW = [90, 100, 160];
  var F45 = [[3300, 350], [3750, 400]];
  var HISS = { s: [4600, 1600], sh: [3000, 2000], f: [1500, 3500], th: [4000, 3500], t: [4000, 2500], gain: 0.024, dull: 0.6 };
  var LIFE = { wobble: 0.016, waver: 0.06, flutter: 0.005, air: 0.035, open: 0.6 };
  function sing(frames, sr, opt) {
    sr = sr || 16000;
    var life = opt && opt.life !== undefined ? opt.life : 1;
    var total = 0, i;
    for (i = 0; i < frames.length; i++) total += Math.round(frames[i].ms * sr / 1000);
    var out = new Float32Array(total), n = 0;
    var r1 = new Reso(), r2 = new Reso(), r3 = new Reso(), r4 = new Reso(), r5 = new Reso(), anti = new Anti(), np = new Reso();
    var noise = Noise(1904), dice = Noise(1850), phase = 0, last = 0, peak = 0, longer = 1, taller = 1, hush = 0;
    var vent = new Reso(), hissNoise = Noise(1777), dullHiss = 0;
    var CEIL = Math.exp(-2 * Math.PI * 5500 / sr), CEIL_S = Math.exp(-2 * Math.PI * 7000 / sr), c1 = 0, c2 = 0, c3 = 0, c4 = 0;
    var from = frames[0];
    for (i = 0; i < frames.length; i++) {
      var to = frames[i], len = Math.round(to.ms * sr / 1000), k;
      for (k = 0; k < len; k++) {
        var t = (k + 1) / len;
        var f0 = from.f0 + (to.f0 - from.f0) * t;
        var v = from.voice + (to.voice - from.voice) * t;
        var br = (from.breath || 0) + ((to.breath || 0) - (from.breath || 0)) * t;
        var F1 = from.f[0] + (to.f[0] - from.f[0]) * t;
        var F2 = from.f[1] + (to.f[1] - from.f[1]) * t;
        var F3 = from.f[2] + (to.f[2] - from.f[2]) * t;
        var sec = n / sr;
        var flut = 1 + life * LIFE.flutter * (Math.sin(2 * Math.PI * 12.7 * sec) + Math.sin(2 * Math.PI * 7.1 * sec) + Math.sin(2 * Math.PI * 4.7 * sec));
        phase += f0 * flut * longer / sr;
        if (phase >= 1) {
          phase -= 1;
          longer = 1 + life * LIFE.wobble * dice();
          taller = 1 + life * LIFE.waver * dice();
        }
        var isOpen = phase < LIFE.open, flow = 0;
        if (isOpen) { var g = phase / LIFE.open; flow = 6.75 * (g * g - g * g * g); }
        var ease = F1 > 350 ? Math.pow(350 / F1, 0.4) : 1;
        var white = noise(), rush = white * (isOpen ? 1 : 0.3);
        hush += 0.35 * (white - hush);
        var puff = hush * (isOpen ? 1 : 1 - 0.7 * v), wide = 1 + 6 * br;
        c3 = c3 * CEIL + puff * (1 - CEIL); c4 = c4 * CEIL + c3 * (1 - CEIL); puff = c4;
        var src = flow * v * ease * taller + puff * br * 0.5 + rush * life * LIFE.air * v;
        var y = r3.step(r2.step(r1.step(src, F1, BW[0] * wide, sr), F2, BW[1] * wide, sr), F3, BW[2] * wide, sr);
        var nz = (from.nasal || 0) + ((to.nasal || 0) - (from.nasal || 0)) * t;
        if (nz > 0) {
          var zp = to.zero || from.zero || [1600, 300];
          var ny = np.step(anti.step(y, zp[0], zp[1], sr), 270, 100, sr);
          y = (1 - nz) * y + nz * ny;
        }
        y = r5.step(r4.step(y, F45[0][0], F45[0][1] * wide, sr), F45[1][0], F45[1][1] * wide, sr);
        var hs = (from.hiss || 0) + ((to.hiss || 0) - (from.hiss || 0)) * t;
        if (hs > 0) {
          var place = to.at || from.at || HISS.s;
          dullHiss += HISS.dull * (hissNoise() - dullHiss);
          var gate = 1 - v + v * (isOpen ? 0.1 + flow * 0.9 : 0.02);
          var hv = vent.step(dullHiss, place[0], place[1], sr) * hs * HISS.gain * gate;
          var ce = place[0] >= 4500 ? CEIL_S : CEIL;
          c1 = c1 * ce + hv * (1 - ce); c2 = c2 * ce + c1 * (1 - ce);
          y += c2;
        }
        var lip = y - last; last = y;
        out[n++] = lip;
        if (lip > peak) peak = lip; else if (-lip > peak) peak = -lip;
      }
      from = to;
    }
    govern(out, sr);
    peak = 0; for (i = 0; i < total; i++) { var ab = out[i] < 0 ? -out[i] : out[i]; if (ab > peak) peak = ab; }
    if (peak > 0) for (i = 0; i < total; i++) out[i] = out[i] / peak * 0.9;
    return out;
  }
  var GOV = { hz: 5500, share: 0.3, gamma: 1.2, close: 0.004, open: 0.040 };
  function taps(f, sr) {
    var N = 21, M = 10, h = [], n, w = 2 * Math.PI * f / sr, sum = 0, k;
    for (n = 0; n < N; n++) {
      k = n - M; h[n] = (k === 0 ? w / Math.PI : Math.sin(w * k) / (Math.PI * k)) * (0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1)));
      sum += h[n];
    }
    for (n = 0; n < N; n++) h[n] /= sum;
    return h;
  }
  function govern(x, sr) {
    var n = x.length, h = taps(GOV.hz, sr), N = h.length, M = (N - 1) / 2, lo, hi, i, j, a, e, ea = 0, et = 0, g = 1, want, xd;
    var kc = Math.exp(-1 / (GOV.close * sr)), ko = Math.exp(-1 / (GOV.open * sr)), src = x.slice();
    for (i = 0; i < n; i++) {
      lo = 0; for (j = 0; j < N; j++) { var at = i - j; if (at >= 0) lo += h[j] * src[at]; }
      xd = i - M >= 0 ? src[i - M] : 0; hi = xd - lo;
      a = hi < 0 ? -hi : hi; e = xd < 0 ? -xd : xd;
      ea = a > ea ? ea * kc + a * (1 - kc) : ea * ko + a * (1 - ko);
      et = e > et ? et * kc + e * (1 - kc) : et * ko + e * (1 - ko);
      want = ea > GOV.share * et && ea > 1e-6 ? Math.pow(GOV.share * et / ea, GOV.gamma) : 1;
      g = want < g ? g * kc + want * (1 - kc) : g * ko + want * (1 - ko);
      x[i] = lo + hi * g;
    }
    return x;
  }
  function wav(pcm, sr) {
    var n = pcm.length, b = new Uint8Array(44 + n * 2), d = new DataView(b.buffer), i;
    function tag(at, s) { for (var j = 0; j < 4; j++) b[at + j] = s.charCodeAt(j); }
    tag(0, 'RIFF'); d.setUint32(4, 36 + n * 2, true); tag(8, 'WAVE'); tag(12, 'fmt ');
    d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
    d.setUint32(24, sr, true); d.setUint32(28, sr * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true);
    tag(36, 'data'); d.setUint32(40, n * 2, true);
    for (i = 0; i < n; i++) d.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, Math.round(pcm[i] * 32767))), true);
    return b;
  }
  function mellow(pcm, sr) {
    sr = sr || 16000;
    var n = pcm.length, tail = Math.round(0.12 * sr), out = new Float32Array(n + tail), i;
    var kh = Math.exp(-2 * Math.PI * 2200 / sr), kl = Math.exp(-2 * Math.PI * 250 / sr), h1 = 0, h2 = 0, ll = 0;
    var d1 = Math.round(0.011 * sr), d2 = Math.round(0.023 * sr), d3 = Math.round(0.037 * sr), wet = new Float32Array(n + tail);
    for (i = 0; i < n + tail; i++) {
      var x = i < n ? pcm[i] : 0;
      h1 = h1 * kh + x * (1 - kh); h2 = h2 * kh + h1 * (1 - kh);
      ll = ll * kl + x * (1 - kl);
      var dry = 0.4 * x + 0.6 * h2 + 0.3 * ll;
      wet[i] = dry + (i >= d3 ? 0.18 * wet[i - d3] : 0);
      out[i] = dry + (i >= d1 ? 0.10 * wet[i - d1] : 0) + (i >= d2 ? 0.07 * wet[i - d2] : 0) + (i >= d3 ? 0.05 * wet[i - d3] : 0);
    }
    var peak = 0; for (i = 0; i < out.length; i++) { var a = out[i] < 0 ? -out[i] : out[i]; if (a > peak) peak = a; }
    if (peak > 0) for (i = 0; i < out.length; i++) out[i] = out[i] / peak * 0.8;
    return out;
  }
  var VOICEBOX = { sing: sing, mellow: mellow, wav: wav, govern: govern, HISS: HISS, GOV: GOV };
  if (typeof module !== 'undefined' && module.exports) module.exports = VOICEBOX;
  else root.VOICEBOX = VOICEBOX;
})(root);
(function (root) {
  'use strict';
  var N = 512, HOP = 128;
  function fft(re, im, inverse) {
    var n = re.length, i, j = 0, k, len, t;
    for (i = 1; i < n; i++) { k = n >> 1; while (j & k) { j ^= k; k >>= 1; } j ^= k; if (i < j) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (len = 2; len <= n; len <<= 1) {
      var ang = 2 * Math.PI / len * (inverse ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
      for (i = 0; i < n; i += len) {
        var cr = 1, ci = 0;
        for (k = 0; k < len / 2; k++) {
          var a = i + k, b = a + len / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
    if (inverse) for (i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
  var WIN = new Float32Array(N); (function () { for (var i = 0; i < N; i++) WIN[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N); })();
  var TWR = new Float32Array(N / 2), TWI = new Float32Array(N / 2);
  (function () { for (var k = 0; k < N / 2; k++) { TWR[k] = Math.cos(2 * Math.PI * k / N); TWI[k] = Math.sin(2 * Math.PI * k / N); } })();
  var REV = new Int32Array(N); (function () { var i, j = 0, k; for (i = 1; i < N; i++) { k = N >> 1; while (j & k) { j ^= k; k >>= 1; } j ^= k; REV[i] = j; } })();
  function fftN(re, im, inverse) {
    var i, j, k, len, t, step, a, b, xr, xi, cr, ci;
    for (i = 1; i < N; i++) { j = REV[i]; if (i < j) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (len = 2; len <= N; len <<= 1) {
      step = N / len;
      for (i = 0; i < N; i += len) {
        for (k = 0; k < len / 2; k++) {
          cr = TWR[k * step]; ci = inverse ? TWI[k * step] : -TWI[k * step];
          a = i + k; b = a + len / 2; xr = re[b] * cr - im[b] * ci; xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        }
      }
    }
    if (inverse) for (i = 0; i < N; i++) { re[i] /= N; im[i] /= N; }
  }
  function picture(x) {
    var frames = Math.max(1, Math.ceil((x.length + N) / HOP)), mag = [], pha = [], f, i;
    for (f = 0; f < frames; f++) {
      var re = new Float32Array(N), im = new Float32Array(N), s = f * HOP - N + HOP;
      for (i = 0; i < N; i++) { var k = s + i; re[i] = (k >= 0 && k < x.length ? x[k] : 0) * WIN[i]; }
      fft(re, im, false);
      var m = new Float32Array(N / 2 + 1), p = new Float32Array(N / 2 + 1);
      for (i = 0; i <= N / 2; i++) { m[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]); p[i] = Math.atan2(im[i], re[i]); }
      mag.push(m); pha.push(p);
    }
    return { mag: mag, pha: pha, length: x.length };
  }
  function sound(mag, pha, length) {
    var out = new Float32Array(length), wsum = new Float32Array(length), f, i;
    for (f = 0; f < mag.length; f++) {
      var re = new Float32Array(N), im = new Float32Array(N), s = f * HOP - N + HOP;
      for (i = 0; i <= N / 2; i++) { re[i] = mag[f][i] * Math.cos(pha[f][i]); im[i] = mag[f][i] * Math.sin(pha[f][i]); if (i > 0 && i < N / 2) { re[N - i] = re[i]; im[N - i] = -im[i]; } }
      fft(re, im, true);
      for (i = 0; i < N; i++) { var k = s + i; if (k >= 0 && k < length) { out[k] += re[i] * WIN[i]; wsum[k] += WIN[i] * WIN[i]; } }
    }
    for (i = 0; i < length; i++) if (wsum[i] > 1e-6) out[i] /= wsum[i];
    return out;
  }
  function blur(mag, cols, rows) {
    var F = mag.length, B = mag[0].length, f, b, a = mag.map(function (m) { return Float32Array.from(m); });
    function bell(sigma) {
      if (!(sigma > 0.05)) return null;
      var r = Math.max(1, Math.ceil(3 * sigma)), k = [], sum = 0, i;
      for (i = -r; i <= r; i++) { k.push(Math.exp(-i * i / (2 * sigma * sigma))); sum += k[k.length - 1]; }
      return { r: r, k: k.map(function (v) { return v / sum; }) };
    }
    function smear(get, set, len, kn) {
      var tmp = new Float32Array(len), i, j, s, w;
      for (i = 0; i < len; i++) { s = 0; w = 0; for (j = -kn.r; j <= kn.r; j++) if (i + j >= 0 && i + j < len) { s += get(i + j) * kn.k[j + kn.r]; w += kn.k[j + kn.r]; } tmp[i] = s / w; }
      for (i = 0; i < len; i++) set(i, tmp[i]);
    }
    var kc = bell(cols), kr = bell(rows);
    if (kc) for (b = 0; b < B; b++) smear(function (i) { return a[i][b]; }, function (i, v) { a[i][b] = v; }, F, kc);
    if (kr) for (f = 0; f < F; f++) smear(function (i) { return a[f][i]; }, function (i, v) { a[f][i] = v; }, B, kr);
    return a;
  }
  function fromPictureByPhases(mag, length, seedPha, turns) {
    var pha = seedPha, x = sound(mag, pha, length), i;
    for (i = 0; i < (turns === undefined ? 40 : turns); i++) { pha = picture(x).pha; x = sound(mag, pha, length); }
    return x;
  }
  var B = N / 2 + 1, bre = new Float32Array(N), bim = new Float32Array(N);
  function fromPicture(mag, length, seedPha, turns, fast) {
    turns = turns === undefined ? 40 : turns;
    var F = mag.length, M = new Float32Array(F * B), XR = new Float32Array(F * B), XI = new Float32Array(F * B), f, i, k, s, n, o;
    var x = new Float32Array(length), wsum = new Float32Array(length), CR, CI, PR, PI, alpha = 0.99;
    for (f = 0; f < F; f++) for (i = 0; i < B; i++) { o = f * B + i; M[o] = mag[f][i]; XR[o] = M[o] * Math.cos(seedPha[f][i]); XI[o] = M[o] * Math.sin(seedPha[f][i]); }
    for (f = 0; f < F; f++) { s = f * HOP - N + HOP; for (i = 0; i < N; i++) { k = s + i; if (k >= 0 && k < length) wsum[k] += WIN[i] * WIN[i]; } }
    for (i = 0; i < length; i++) wsum[i] = wsum[i] > 1e-6 ? 1 / wsum[i] : 0;
    function toSound() {
      var o2, s2, ar, ai, br2, bi2, two;
      for (i = 0; i < length; i++) x[i] = 0;
      for (f = 0; f < F; f += 2) {
        two = f + 1 < F; s = f * HOP - N + HOP; s2 = s + HOP; o = f * B; o2 = o + B;
        for (i = 0; i < N; i++) {
          if (i <= N / 2) { ar = XR[o + i]; ai = XI[o + i]; br2 = two ? XR[o2 + i] : 0; bi2 = two ? XI[o2 + i] : 0; }
          else { ar = XR[o + N - i]; ai = -XI[o + N - i]; br2 = two ? XR[o2 + N - i] : 0; bi2 = two ? -XI[o2 + N - i] : 0; }
          bre[i] = ar - bi2; bim[i] = ai + br2;
        }
        fftN(bre, bim, true);
        for (i = 0; i < N; i++) {
          k = s + i; if (k >= 0 && k < length) x[k] += bre[i] * WIN[i];
          if (two) { k = s2 + i; if (k >= 0 && k < length) x[k] += bim[i] * WIN[i]; }
        }
      }
      for (i = 0; i < length; i++) x[i] *= wsum[i];
    }
    function toPicture() {
      var r, m, g, zr, zi, wr, wi, o2, s2, two, j;
      for (f = 0; f < F; f += 2) {
        two = f + 1 < F; s = f * HOP - N + HOP; s2 = s + HOP; o = f * B; o2 = o + B;
        for (i = 0; i < N; i++) { k = s + i; bre[i] = (k >= 0 && k < length ? x[k] : 0) * WIN[i]; k = s2 + i; bim[i] = two && k >= 0 && k < length ? x[k] * WIN[i] : 0; }
        fftN(bre, bim, false);
        for (i = 0; i < B; i++) {
          j = i === 0 ? 0 : N - i; zr = bre[i]; zi = bim[i]; wr = bre[j]; wi = -bim[j];
          r = (zr + wr) / 2; m = (zi + wi) / 2; g = Math.sqrt(r * r + m * m);
          if (g > 1e-12) { g = M[o + i] / g; XR[o + i] = r * g; XI[o + i] = m * g; } else { XR[o + i] = M[o + i]; XI[o + i] = 0; }
          if (two) {
            r = (zi - wi) / 2; m = (wr - zr) / 2; g = Math.sqrt(r * r + m * m);
            if (g > 1e-12) { g = M[o2 + i] / g; XR[o2 + i] = r * g; XI[o2 + i] = m * g; } else { XR[o2 + i] = M[o2 + i]; XI[o2 + i] = 0; }
          }
        }
      }
    }
    if (fast) { CR = new Float32Array(F * B); CI = new Float32Array(F * B); PR = new Float32Array(F * B); PI = new Float32Array(F * B); }
    toSound();
    for (n = 0; n < turns; n++) {
      toPicture();
      if (fast) {
        for (i = 0; i < F * B; i++) { CR[i] = XR[i]; CI[i] = XI[i]; }
        if (n > 0) for (i = 0; i < F * B; i++) { XR[i] = CR[i] + alpha * (CR[i] - PR[i]); XI[i] = CI[i] + alpha * (CI[i] - PI[i]); }
        for (i = 0; i < F * B; i++) { PR[i] = CR[i]; PI[i] = CI[i]; }
        if (n === turns - 1) for (i = 0; i < F * B; i++) { XR[i] = CR[i]; XI[i] = CI[i]; }
      }
      toSound();
    }
    return x;
  }
  function gust(pcm, sr, opt) {
    opt = opt || {};
    var ms = opt.ms === undefined ? 50 : opt.ms, hz = opt.hz === undefined ? 26 : opt.hz, mix = opt.mix === undefined ? 1 : opt.mix;
    var p = picture(pcm);
    var cols = ms / 1000 * sr / HOP / 2, rows = hz / (sr / N) / 2;
    var soft = blur(p.mag, cols, rows);
    var wet = fromPicture(soft, pcm.length, p.pha, opt.turns, opt.fast), out = new Float32Array(pcm.length), i, ew = 0, ed = 0;
    for (i = 0; i < pcm.length; i++) { ew += wet[i] * wet[i]; ed += pcm[i] * pcm[i]; }
    var g = ew > 0 ? Math.sqrt(ed / ew) : 1, peak = 0;
    for (i = 0; i < pcm.length; i++) { out[i] = (1 - mix) * pcm[i] + mix * g * wet[i]; var a = out[i] < 0 ? -out[i] : out[i]; if (a > peak) peak = a; }
    if (peak > 0.95) for (i = 0; i < out.length; i++) out[i] = out[i] / peak * 0.9;
    return out;
  }
  function dialPicture(mag, k, sr) {
    var cut = Math.round(sr / 500), out = [], f, i;
    var loud = 0; for (f = 0; f < mag.length; f++) { var e0 = 0; for (i = 0; i <= N / 2; i++) e0 += mag[f][i] * mag[f][i]; if (e0 > loud) loud = e0; }
    for (f = 0; f < mag.length; f++) {
      var re = new Float32Array(N), im = new Float32Array(N), m = mag[f], e1 = 0, e2 = 0;
      for (i = 0; i <= N / 2; i++) e1 += m[i] * m[i];
      if (e1 < loud * 1e-5) { out.push(Float32Array.from(m)); continue; }
      for (i = 0; i <= N / 2; i++) { re[i] = Math.log(m[i] + 1e-7); if (i > 0 && i < N / 2) re[N - i] = re[i]; }
      fft(re, im, false);
      for (i = cut; i <= N - cut; i++) { re[i] *= (1 + k); im[i] *= (1 + k); }
      fft(re, im, true);
      var o = new Float32Array(N / 2 + 1);
      for (i = 0; i <= N / 2; i++) { var d = re[i] - Math.log(m[i] + 1e-7); if (d > 3) d = 3; else if (d < -3) d = -3; o[i] = m[i] * Math.exp(d); e2 += o[i] * o[i]; }
      var g = e2 > 0 ? Math.sqrt(e1 / e2) : 1;
      for (i = 0; i <= N / 2; i++) o[i] *= g;
      out.push(o);
    }
    return out;
  }
  function dial(pcm, sr, k, opt) {
    var p = picture(pcm), x = fromPicture(dialPicture(p.mag, k, sr), pcm.length, p.pha, opt && opt.turns, opt && opt.fast), i, peak = 0;
    for (i = 0; i < x.length; i++) { var a = x[i] < 0 ? -x[i] : x[i]; if (a > peak) peak = a; }
    if (peak > 0) for (i = 0; i < x.length; i++) x[i] = x[i] / peak * 0.9;
    return x;
  }
  function blend(a, b, share) {
    var n = Math.min(a.length, b.length), out = new Float32Array(n), i, peak = 0;
    for (i = 0; i < n; i++) { out[i] = share * a[i] + (1 - share) * b[i]; var v = out[i] < 0 ? -out[i] : out[i]; if (v > peak) peak = v; }
    if (peak > 0) for (i = 0; i < n; i++) out[i] = out[i] / peak * 0.9;
    return out;
  }
  function second(mag, sr) {
    var F = mag.length, B = N / 2, T = 1, f, k, q, top = 1e-9, mean = 0;
    while (T < F) T <<= 1;
    for (f = 0; f < F; f++) for (k = 0; k < B; k++) if (mag[f][k] > top) top = mag[f][k];
    var db = [];
    for (f = 0; f < F; f++) { var d = new Float32Array(B); for (k = 0; k < B; k++) { d[k] = Math.max(-60, 20 * Math.log(mag[f][k] / top + 1e-9) / Math.LN10); mean += d[k]; } db.push(d); }
    mean /= F * B;
    var RE = [], IM = [];
    for (f = 0; f < T; f++) {
      var re = new Float32Array(B), im = new Float32Array(B);
      if (f < F) { var wf = 0.5 - 0.5 * Math.cos(2 * Math.PI * (f + 0.5) / F); for (k = 0; k < B; k++) re[k] = (db[f][k] - mean) * wf * (0.5 - 0.5 * Math.cos(2 * Math.PI * (k + 0.5) / B)); }
      fft(re, im, false); RE.push(re); IM.push(im);
    }
    var out = [];
    for (q = 0; q <= B / 2; q++) {
      var r2 = new Float32Array(T), i2 = new Float32Array(T), m = new Float32Array(T);
      for (f = 0; f < T; f++) { r2[f] = RE[f][q]; i2[f] = IM[f][q]; }
      fft(r2, i2, false);
      for (f = 0; f < T; f++) m[f] = Math.sqrt(r2[f] * r2[f] + i2[f] * i2[f]);
      out.push(m);
    }
    return { mag: out, T: T, Q: B / 2, perStep: (sr || 16000) / HOP / T, msPerRow: 2000 / (sr || 16000) };
  }
  var GUST = { second: second, gust: gust, dial: dial, blend: blend, picture: picture, sound: sound, blur: blur, dialPicture: dialPicture, fromPicture: fromPicture, fromPictureByPhases: fromPictureByPhases, N: N, HOP: HOP };
  if (typeof module !== 'undefined' && module.exports) module.exports = GUST;
  else root.GUST = GUST;
})(root);
(function (root) {
  'use strict';
  var V = root.VOICEBOX || require('./voicebox.js');
  var G = root.GUST || require('./gust.js');
  var S = root.AIU || require('./aiu.score.js');
  var SR = 16000;
  var PLAIN = { a: 120, i: 165, u: 98, life: 1, dial: 0, gust: false, gustMs: 50, gustHz: 26, wear: 0, mellow: false, stocking: false, ess: false, entone: false, govern: true, conduction: true, fgl: false };
  var PRESETS = {
    'The Ruler': { life: 0 },
    'Alive': { },
    'House Gust': { gust: true },
    'Worn, 78 and 22': { gust: true, wear: 78 },
    'Worn, 79, stockinged': { gust: true, wear: 79, stocking: true },
    'Worn, 79, stockinged, entoned': { gust: true, wear: 79, stocking: true, entone: true, fgl: true, ess: true, mellow: true },
    'The Old Sailor': { dial: -0.5 },
    'The Young Tenor': { dial: 0.5 },
    'A Whisper': { dial: -1 }
  };
  function settings(over) { var s = {}, k; for (k in PLAIN) s[k] = PLAIN[k]; for (k in (over || {})) s[k] = over[k]; return s; }
  var HOUSE_NAME = 'Worn, 79, stockinged, entoned';
  function house() { return settings(PRESETS[HOUSE_NAME]); }
  function score(s) {
    var hz = [s.a, s.a, s.a, s.i, s.i, s.u, s.u, s.u * 90 / 98];
    return S.score.map(function (f, n) { return { ms: f.ms, f0: hz[n], f: f.f, voice: f.voice }; });
  }
  function stocking(pcm, sr) {
    var n = pcm.length, out = new Float32Array(n), i, x, a, b;
    var ks = Math.exp(-2 * Math.PI * 4000 / sr), kl = Math.exp(-2 * Math.PI * 6000 / sr), s1 = 0, s2 = 0, l1 = 0, l2 = 0;
    for (i = 0; i < n; i++) {
      x = pcm[i];
      s1 = s1 * ks + x * (1 - ks); s2 = s2 * ks + s1 * (1 - ks);
      a = 0.5 * x + 0.5 * s2;
      l1 = l1 * kl + a * (1 - kl); l2 = l2 * kl + l1 * (1 - kl);
      out[i] = l2;
    }
    var peak = 0; for (i = 0; i < n; i++) { b = out[i] < 0 ? -out[i] : out[i]; if (b > peak) peak = b; }
    if (peak > 0) for (i = 0; i < n; i++) out[i] = out[i] / peak * 0.9;
    return out;
  }
  function ess(pcm, sr) {
    var n = pcm.length, out = new Float32Array(n), i, x, lo, hi, e = 0, g, ka = Math.exp(-1 / (0.025 * sr)), kr = Math.exp(-1 / (0.040 * sr));
    var k = Math.exp(-2 * Math.PI * 4000 / sr), l1 = 0, l2 = 0, thr = 0.03, floor = 0.35;
    for (i = 0; i < n; i++) {
      x = pcm[i];
      l1 = l1 * k + x * (1 - k); l2 = l2 * k + l1 * (1 - k);
      lo = l2; hi = x - l2;
      var a = hi < 0 ? -hi : hi;
      e = a > e ? e * ka + a * (1 - ka) : e * kr + a * (1 - kr);
      g = e > thr ? Math.max(floor, thr / e) : 1;
      out[i] = lo + hi * g;
    }
    return out;
  }
  function entone(pcm, sr, frames, amount) {
    var n = pcm.length, out = new Float32Array(n), i, k, len, t, f0, v, from = frames[0], at = 0, P, j, fl, fr, back;
    amount = amount === undefined ? 0.45 : amount;
    for (i = 0; i < frames.length; i++) {
      var to = frames[i]; len = Math.round(to.ms * sr / 1000);
      for (k = 0; k < len && at < n; k++, at++) {
        t = (k + 1) / len; f0 = from.f0 + (to.f0 - from.f0) * t; v = from.voice + (to.voice - from.voice) * t;
        P = sr / Math.max(40, f0); j = at - P; fl = Math.floor(j); fr = j - fl;
        back = fl >= 1 ? out[fl] * (1 - fr) + out[fl + 1] * fr : 0;
        out[at] = pcm[at] + amount * v * v * back;
      }
      from = to;
    }
    for (; at < n; at++) out[at] = pcm[at];
    var peak = 0; for (i = 0; i < n; i++) { var a = out[i] < 0 ? -out[i] : out[i]; if (a > peak) peak = a; }
    if (peak > 0) for (i = 0; i < n; i++) out[i] = out[i] / peak * 0.9;
    return out;
  }
  var fs = typeof require === 'function' && typeof window === 'undefined' ? require('fs') : null, LARDER = 'larder';
  function hash(x, tag) {
    var h = 0x811c9dc5, i, v;
    for (i = 0; i < x.length; i++) { v = Math.round(x[i] * 32767) & 0xffff; h ^= v; h = Math.imul(h, 0x01000193); }
    for (i = 0; i < tag.length; i++) { h ^= tag.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16);
  }
  function kept(x, tag, cook) {
    if (!fs) return cook();
    var name = LARDER + '/' + hash(x, tag) + '.f32', b, out, i;
    if (fs.existsSync(name)) { b = fs.readFileSync(name); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4).slice(); }
    out = cook(); try { fs.mkdirSync(LARDER); } catch (e) {}
    b = new Uint8Array(out.buffer, out.byteOffset, out.byteLength); fs.writeFileSync(name, b);
    return out;
  }
  function make(s, turns) {
    var sc = s.frames || score(s), steps = [], share = V.GOV.share, x;
    if (s.govern === false) V.GOV.share = 10;
    try { x = V.sing(sc, SR, { life: s.life }); } finally { V.GOV.share = share; }
    steps.push('sung, life ' + s.life + (s.govern === false ? ', ungoverned' : ''));
    var fast = s.fgl === true, tn = fast ? (turns === undefined ? 10 : turns) : turns, tag = ' ' + tn + (fast ? ' fast' : '');
    if (s.dial) { x = kept(x, 'dial ' + s.dial + tag, function () { return G.dial(x, SR, s.dial, { turns: tn, fast: fast }); }); steps.push('dial ' + (s.dial > 0 ? '+' : '') + s.dial); }
    if (s.gust) { x = kept(x, 'gust ' + s.gustMs + ' ' + s.gustHz + tag, function () { return G.gust(x, SR, { ms: s.gustMs, hz: s.gustHz, turns: tn, fast: fast }); }); steps.push('gust ' + s.gustMs + ' ms, ' + s.gustHz + ' Hz' + (fast ? ', fast' : '')); }
    if (s.wear > 0) { x = G.blend(V.sing(sc, SR, { life: 0 }), x, s.wear / 100); steps.push(s.wear + '% ruler'); }
    if (s.mellow) { x = V.mellow(x, SR); steps.push('mellow'); }
    if (s.entone) { x = entone(x, SR, sc, s.entone === true ? undefined : s.entone); steps.push('entone'); }
    if (s.stocking) { x = stocking(x, SR); steps.push('stocking'); }
    if (s.ess) { x = ess(x, SR); steps.push('ess'); }
    return { pcm: x, sr: SR, steps: steps };
  }
  var CHAIN = { make: make, settings: settings, house: house, score: score, PLAIN: PLAIN, HOUSE_NAME: HOUSE_NAME, PRESETS: PRESETS, SR: SR };
  if (typeof module !== 'undefined' && module.exports) module.exports = CHAIN;
  else root.ECOUTER = CHAIN;
})(root);
(function (root) {
  'use strict';
  var VENT = { s: [4600, 1600], sh: [3000, 2000], f: [1500, 3500], th: [4000, 3500], t: [4000, 2500] };
  var HISS = root.VOICEBOX ? root.VOICEBOX.HISS
    : typeof require === 'function' ? require('./voicebox.js').HISS : VENT;
  var F = {
    IY: [270, 2290, 3010], IH: [390, 1990, 2550],
    EH: [530, 1840, 2480], AE: [660, 1720, 2410],
    AA: [730, 1090, 2440], AO: [570, 840, 2410],
    UH: [440, 1020, 2240], UW: [300, 870, 2240],
    ER: [490, 1350, 1690], AX: [500, 1500, 2500],
    AH: [640, 1190, 2390],
    l: [310, 1050, 2880], r: [460, 1300, 1700],
    w: [300, 870, 2240], y: [280, 2200, 3000],
    m: [280, 1000, 2200], n: [280, 1700, 2600],
    NG: [300, 1200, 2300],
    lips: [250, 900, 2300],
    teeth: [300, 1700, 2600],
    velum: [300, 2000, 2300],
    sh: [300, 1800, 2400]
  };
  var AT = {
    s: HISS.s, sh: HISS.sh, f: HISS.f, th: HISS.th,
    t: HISS.t,
    k: [1900, 900],
    kFront: [2900, 900],
    p: [1200, 3000]
  };
  var T = {
    IY: { kind: 'v', f: F.IY, ms: 130 },
    IH: { kind: 'v', f: F.IH, ms: 90 },
    EH: { kind: 'v', f: F.EH, ms: 110 },
    AE: { kind: 'v', f: F.AE, ms: 140 },
    AA: { kind: 'v', f: F.AA, ms: 140 },
    AO: { kind: 'v', f: F.AO, ms: 140 },
    UH: { kind: 'v', f: F.UH, ms: 90 },
    UW: { kind: 'v', f: F.UW, ms: 130 },
    ER: { kind: 'v', f: F.ER, ms: 130 },
    AX: { kind: 'v', f: F.AX, ms: 70 },
    AH: { kind: 'v', f: F.AH, ms: 100 },
    EY: { kind: 'd', f: F.EH, to: F.IH, ms: 160 },
    OW: { kind: 'd', f: F.AO, to: F.UH, ms: 160 },
    AY: { kind: 'd', f: F.AA, to: F.IH, ms: 170 },
    AW: { kind: 'd', f: F.AA, to: F.UH, ms: 170 },
    OY: { kind: 'd', f: F.AO, to: F.IH, ms: 170 },
    l: { kind: 'g', f: F.l, ms: 60, voice: 0.7 },
    r: { kind: 'g', f: F.r, ms: 70, voice: 0.7 },
    w: { kind: 'g', f: F.w, ms: 60, voice: 0.7 },
    y: { kind: 'g', f: F.y, ms: 60, voice: 0.7 },
    WH: { kind: 'g', f: F.w, ms: 70, voice: 0.5,
      breath: 0.3 },
    m: { kind: 'n', f: F.m, ms: 70, zero: [1000, 300] },
    n: { kind: 'n', f: F.n, ms: 70, zero: [1600, 300] },
    NG: { kind: 'n', f: F.NG, ms: 80, zero: [2600, 400] },
    f: { kind: 'f', at: AT.f, ms: 90, hiss: 0.55 },
    v: { kind: 'f', at: AT.f, ms: 60, hiss: 0.55,
      voice: 0.5 },
    TH: { kind: 'f', at: AT.th, ms: 90, hiss: 0.6 },
    DH: { kind: 'f', at: AT.th, ms: 50, hiss: 0.6,
      voice: 0.45 },
    s: { kind: 'f', at: AT.s, ms: 110, hiss: 0.35 },
    z: { kind: 'f', at: AT.s, ms: 80, hiss: 0.35,
      voice: 0.5 },
    SH: { kind: 'f', at: AT.sh, ms: 120, hiss: 0.5,
      f: F.sh },
    ZH: { kind: 'f', at: AT.sh, ms: 80, hiss: 0.5,
      f: F.sh, voice: 0.5 },
    p: { kind: 's', f: F.lips, shut: 60, burst: 10,
      at: AT.p, pop: 0.3, air: 40 },
    b: { kind: 's', f: F.lips, shut: 50, burst: 12,
      at: AT.f, pop: 0.35, hum: 0.4 },
    t: { kind: 's', f: F.teeth, shut: 50, burst: 14,
      at: AT.t, pop: 0.9, air: 30 },
    d: { kind: 's', f: F.teeth, shut: 50, burst: 12,
      at: AT.t, pop: 0.5, hum: 0.3 },
    k: { kind: 's', f: F.velum, shut: 60, burst: 20,
      at: AT.k, pop: 0.8, air: 45 },
    g: { kind: 's', f: F.velum, shut: 50, burst: 14,
      at: AT.k, pop: 0.5, hum: 0.3 },
    CH: { kind: 's', f: F.sh, shut: 50, burst: 80,
      at: AT.sh, pop: 0.5 },
    j: { kind: 's', f: F.sh, shut: 40, burst: 60,
      at: AT.sh, pop: 0.5, hum: 0.3, jv: 0.5 },
    HH: { kind: 'h', ms: 60, breath: 0.5, voice: 0.08 }
  };
  T.h = T.HH;
  T[','] = { kind: 'p', ms: 120 };
  T[';'] = { kind: 'p', ms: 170, end: 'half' };
  T['-'] = { kind: 'p', ms: 170, end: 'half' };
  T[':'] = { kind: 'p', ms: 180, end: 'hold' };
  T['.'] = { kind: 'p', ms: 220, end: 'fall' };
  T['!'] = { kind: 'p', ms: 220, end: 'exclaim' };
  T['?'] = { kind: 'p', ms: 220, end: 'rise' };
  var HUM = [300, 800, 2400];
  T['('] = { kind: 'b', ms: 100, f: HUM, notes: [-4, 0] }; T[')'] = { kind: 'b', ms: 100, f: HUM, notes: [0, -4] };
  T['['] = { kind: 'b', ms: 100, f: HUM, notes: [-5, 0] }; T[']'] = { kind: 'b', ms: 100, f: HUM, notes: [0, -5] };
  T['{'] = { kind: 'b', ms: 100, f: HUM, notes: [-7, 0] }; T['}'] = { kind: 'b', ms: 100, f: HUM, notes: [0, -7] };
  T['_'] = { kind: 'b', ms: 70, f: HUM, notes: [-7] };
  var BEEPS = '()[]{}_';
  var TUNE = { fall: [1.06, 0.96, 1.06], half: [1.06, 0.96, 1.02], hold: [1.06, 0.98, 1.09], rise: [1.06, 0.96, 1.06], exclaim: [1.10, 1.00, 1.12] };
  var CODES = Object.keys(T);
  function split(s) {
    var out = [], i = 0, two;
    while (i < s.length) {
      if (s.charAt(i) === ' ') { if (out.length && out[out.length - 1] !== ' ') out.push(' '); i++; continue; }
      two = s.substr(i, 2);
      if (T[two]) { out.push(two); i += 2; continue; }
      if (T[s.charAt(i)]) { out.push(s.charAt(i)); i++; continue; }
      throw new Error('not a phoneme code: ' + s.substr(i));
    }
    return out;
  }
  function mouth(codes, i) {
    var j, p;
    for (j = i + 1; j < codes.length; j++) {
      p = T[codes[j]]; if (!p || p.kind === 'p') break; if (p.f) return p.f; }
    for (j = i - 1; j >= 0; j--) {
      p = T[codes[j]]; if (!p || p.kind === 'p') break;
      if (p.f) return p.to || p.f; }
    return F.AX;
  }
  function isFront(c) { return c === 'IY' || c === 'IH' || c === 'EY' || c === 'EH' || c === 'AE' || c === 'y'; }
  function lenOf(p, pause, scale) {
    if (!p) return pause;
    if (p.kind === 's') return p.shut + p.burst + (p.air || 0);
    if (p.kind === 'v' || p.kind === 'd') return vowelMs(p, scale || 1);
    return p.ms;
  }
  function vowelMs(p, scale) {
    var a = Math.round(p.ms * scale);
    return p.kind === 'd' ? Math.round(a * 0.3) + Math.round(a * 0.25) + Math.round(a * 0.45) : Math.round(a * 0.35) + Math.round(a * 0.65);
  }
  function sentences(codes, pause, scale) {
    var out = [], start = 0, at = 0, i, p;
    for (i = 0; i < codes.length; i++) {
      p = T[codes[i]];
      if (p && p.kind === 'p' && p.end) { out.push({ from: start, to: at, end: p.end }); at += p.ms; start = at; continue; }
      at += lenOf(p, pause, scale ? scale[i] : 1);
    }
    if (at > start) out.push({ from: start, to: at, end: 'fall' });
    return out;
  }
  var WEAK = {};
  ['DHAX', 'DHIY', 'AX', 'AE', 'EY', 'AEn', 'tUW', 'AXv', 'IHn', 'AEnd', 'IHz', 'IHt', 'AY', 'yUW', 'wIY', 'hIY', 'SHIY', 'AEt', 'AAn',
    'fAOr', 'AEz', 'wIHTH', 'DHAEt', 'DHIHs', 'bAHt', 'AOr', 'bAY', 'mAY', 'wAAz', 'AAr', 'bIY', 'hAEz', 'hAEd', 'wIHl', 'DHEY',
    'DHEHm', 'hIHz', 'hER', 'AHs', 'sOW', 'IHf', 'nAAt', 'dUW', 'dIHd', 'AXm', 'AYm', 'AYv', 'wAHz', 'frAAm', 'AEz', 'DHAEn', 'DHAEt']
    .forEach(function (w) { WEAK[w] = true; });
  function isVowelCode(c) { var p = T[c]; return !!p && (p.kind === 'v' || p.kind === 'd'); }
  function voicedCode(c) { var p = T[c]; return !!p && (p.kind === 'v' || p.kind === 'd' || p.kind === 'g' || p.kind === 'n' || (p.kind === 'f' && p.voice > 0) || (p.kind === 's' && p.hum > 0)); }
  function phrase(codes) {
    var scale = [], voice = [], bump = [], i, j, k, word, vowels, weak, strong, lastStrong = -1;
    for (i = 0; i < codes.length; i++) { scale[i] = 1; voice[i] = 1; bump[i] = 1; }
    for (i = 0; i < codes.length; i++) {
      if (codes[i] === ' ' || (T[codes[i]] && T[codes[i]].kind === 'p')) continue;
      for (j = i; j < codes.length && codes[j] !== ' ' && !(T[codes[j]] && T[codes[j]].kind === 'p'); j++) {}
      word = codes.slice(i, j); vowels = []; for (k = i; k < j; k++) if (isVowelCode(codes[k])) vowels.push(k);
      weak = WEAK[word.join('')] === true; strong = weak || !vowels.length ? -1 : vowels[0];
      for (k = 0; k < vowels.length; k++) {
        if (weak) { scale[vowels[k]] = 0.7; voice[vowels[k]] = 0.8; bump[vowels[k]] = 0.98; }
        else if (vowels[k] === strong) { scale[vowels[k]] = 1.3; voice[vowels[k]] = 1; bump[vowels[k]] = 1.05; lastStrong = vowels[k]; }
        else { scale[vowels[k]] = 0.85; voice[vowels[k]] = 0.9; }
      }
      i = j - 1;
      if (j < codes.length && T[codes[j]] && T[codes[j]].kind === 'p' && T[codes[j]].end && lastStrong >= 0) { scale[lastStrong] *= T[codes[j]].end === 'exclaim' ? 1.35 : 1.2; lastStrong = -1; }
    }
    return { scale: scale, voice: voice, bump: bump };
  }
  function frames(s, o) {
    o = o || {};
    var codes = typeof s === 'string' ? split(s) : s;
    var f0 = o.f0 || 118, tune = o.tune || 'conduction';
    var pause = o.pause || 40, out = [], total = 0, i, c, p, m, at = 0, ph = phrase(codes), bumpNow = 1;
    for (i = 0; i < codes.length; i++) total += lenOf(T[codes[i]], pause, ph.scale[i]);
    var sents = sentences(codes, pause, ph.scale);
    function hz() {
      if (tune === 'apology') return f0 * (1 - 0.2 * at / total);
      var k, sn = null, u, f;
      for (k = 0; k < sents.length; k++) if (at <= sents[k].to) { sn = sents[k]; break; }
      if (!sn) sn = sents[sents.length - 1];
      u = sn.to > sn.from ? Math.max(0, Math.min(1, (at - sn.from) / (sn.to - sn.from))) : 0;
      var tn = TUNE[sn.end] || TUNE.fall, s0 = tn[0], s1 = tn[1], s2 = tn[2];
      f = f0 * (s0 + (s2 - s0) * u + (s1 - (s0 + s2) / 2) * 4 * u * (1 - u));
      if (sn.end === 'exclaim') { var left = sn.to - at; if (left < 150) f *= 1 - 0.18 * (1 - left / 150); }
      if (sn.end === 'rise') {
        var span = Math.min((sn.to - sn.from) / 3, 2100), w = (at - (sn.to - span)) / span;
        if (w > 0) f *= 1 + 0.25 * Math.pow(w, 1.5);
      }
      return f * bumpNow;
    }
    function fr(ms, f, voice, breath, hiss, place, nasal, zero) {
      at += ms;
      var x = { ms: ms, f0: hz(), f: f, voice: voice, breath: breath || 0,
        hiss: hiss || 0, ci: i };
      if (place) x.at = place;
      if (nasal) { x.nasal = nasal; x.zero = zero; }
      out.push(x);
    }
    for (i = 0; i < codes.length; i++) {
      c = codes[i]; p = T[c];
      bumpNow = ph.bump[i];
      if (!p) {
        var lean = i > 0 && i < codes.length - 1 && voicedCode(codes[i - 1]) && voicedCode(codes[i + 1]) ? 0.33 : 0;
        fr(Math.round(pause * 0.3), mouth(codes, i), lean); fr(Math.round(pause * 0.7), mouth(codes, i), lean); continue;
      }
      m = p.f || mouth(codes, i);
      var vms = p.kind === 'v' || p.kind === 'd' ? Math.round(p.ms * ph.scale[i]) : 0, vv = ph.voice[i];
      switch (p.kind) {
      case 'p':
        fr(Math.round(p.ms * 0.3), m, 0); fr(Math.round(p.ms * 0.7), m, 0); break;
      case 'b': {
        var nb = p.notes.length, q, each = Math.round(p.ms / nb);
        for (q = 0; q < nb; q++) { fr(each, p.f, 0.9); out[out.length - 1].f0 = f0 * Math.pow(2, p.notes[q] / 12); out[out.length - 1].beep = true; }
        break; }
      case 'v':
        fr(Math.round(vms * 0.35), m, 0.95 * vv); fr(Math.round(vms * 0.65), m, 0.95 * vv); break;
      case 'd':
        fr(Math.round(vms * 0.3), m, 0.95 * vv); fr(Math.round(vms * 0.25), m, 0.95 * vv);
        fr(Math.round(vms * 0.45), p.to, 0.85 * vv); break;
      case 'g':
        fr(Math.round(p.ms * 0.5), m, Math.min(1, p.voice + 0.1), p.breath); fr(Math.round(p.ms * 0.5), m, Math.min(1, p.voice + 0.1), p.breath); break;
      case 'n':
        fr(Math.round(p.ms * 0.4), m, 0.75, 0, 0, null, 1, p.zero);
        fr(Math.round(p.ms * 0.6), m, 0.7, 0, 0, null, 1, p.zero); break;
      case 'f':
        fr(Math.round(p.ms * 0.35), m, p.voice || 0, 0, p.hiss * 0.85, p.at);
        fr(Math.round(p.ms * 0.45), m, p.voice || 0, 0, p.hiss, p.at);
        fr(Math.round(p.ms * 0.2), m, p.voice || 0, 0, p.hiss * 0.6, p.at); break;
      case 'h':
        fr(Math.round(p.ms * 0.4), m, p.voice, p.breath); fr(Math.round(p.ms * 0.6), m, p.voice, p.breath); break;
      case 's':
        if (p.hum) { fr(Math.round(p.shut * 0.4), m, p.hum); fr(Math.round(p.shut * 0.2), m, 0); fr(Math.round(p.shut * 0.4), m, 0); }
        else { fr(Math.round(p.shut * 0.4), m, 0); fr(Math.round(p.shut * 0.6), m, 0); }
        var last = i === codes.length - 1 || !T[codes[i + 1]] || T[codes[i + 1]].kind === 'p', place = p.at, pop = last ? p.pop * 0.6 : p.pop;
        if ((c === 'k' || c === 'g') && !last && isFront(codes[i + 1])) place = AT.kFront;
        fr(p.burst, m, p.jv || (p.hum ? 0.3 : 0), 0, pop, place);
        if (p.air) fr(last ? Math.round(p.air * 0.6) : p.air, mouth(codes, i), 0.1, 0.3);
        break;
      }
    }
    return out;
  }
  var PHONES = { table: T, places: F, at: AT, codes: CODES, split: split, frames: frames, phrase: phrase, BEEPS: BEEPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = PHONES;
  else root.PHONES = PHONES;
})(root);
(function (root) {
  var RULES = {
    " ": [[""," ",""," "],["","-","",""],[".","'S","","z"],["#:.E","'S","","z"],["#","'S","","z"],["","'","",""],["",",",""," "],["",".",""," "],["","?",""," "],["","!",""," "]],
    "A": [["","A"," ","AX"],[" ","ARE"," ","AAr"],[" ","AR","O","AXr"],["","AR","#","EHr"],["^","AS","#","EYs"],["","A","WA","AX"],["","AW","","AO"],[" :","ANY","","EHnIY"],["","A","^+#","EY"],["#:","ALLY","","AXlIY"],[" ","AL","#","AXl"],["","AGAIN","","AXgEHn"],["#:","AG","E","IHj"],["","A","^+:#","AE"],[" :","A","^+ ","EY"],["","A","^%","EY"],[" ","ARR","","AXr"],["","ARR","","AEr"],[" :","AR"," ","AAr"],["","AR"," ","ER"],["","AR","","AAr"],["","AIR","","EHr"],["","AI","","EY"],["","AY","","EY"],["","AU","","AO"],["#:","AL"," ","AXl"],["#:","ALS"," ","AXlz"],["","ALK","","AOk"],["","AL","^","AOl"],[" :","ABLE","","EYbAXl"],["","ABLE","","AXbAXl"],["","ANG","+","EYnj"],["","A","","AE"]],
    "B": [[" ","BE","^#","bIH"],["","BEING","","bIYIHNG"],[" ","BOTH"," ","bOWTH"],[" ","BUS","#","bIHz"],["","BUIL","","bIHl"],["","B","","b"]],
    "C": [[" ","CH","^","k"],["^E","CH","","k"],["","CH","","CH"],[" S","CI","#","sAY"],["","CI","A","SH"],["","CI","O","SH"],["","CI","EN","SH"],["","C","+","s"],["","CK","","k"],["","COM","%","kAHm"],["","C","","k"]],
    "D": [["#:","DED"," ","dIHd"],[".E","D"," ","d"],["#:^E","D"," ","t"],[" ","DE","^#","dIH"],[" ","DO"," ","dUW"],[" ","DOES","","dAHz"],[" ","DOING","","dUWIHNG"],[" ","DOW","","dAW"],["","DU","A","jUW"],["","D","","d"]],
    "E": [["#:","E"," ",""],["':^","E"," ",""],[" :","E"," ","IY"],["#","ED"," ","d"],["#:","E","D ",""],["","EV","ER","EHv"],["","E","^%","IY"],["","ERI","#","IYrIY"],["","ERI","","EHrIH"],["#:","ER","#","ER"],["","ER","#","EHr"],["","ER","","ER"],[" ","EVEN","","IYvEHn"],["#:","E","W",""],["T","EW","","UW"],["S","EW","","UW"],["R","EW","","UW"],["D","EW","","UW"],["L","EW","","UW"],["Z","EW","","UW"],["N","EW","","UW"],["J","EW","","UW"],["TH","EW","","UW"],["CH","EW","","UW"],["SH","EW","","UW"],["","EW","","yUW"],["","E","O","IY"],["#:S","ES"," ","IHz"],["#:C","ES"," ","IHz"],["#:G","ES"," ","IHz"],["#:Z","ES"," ","IHz"],["#:X","ES"," ","IHz"],["#:J","ES"," ","IHz"],["#:CH","ES"," ","IHz"],["#:SH","ES"," ","IHz"],["#:","E","S ",""],["#:","ELY"," ","lIY"],["#:","EMENT","","mEHnt"],["","EFUL","","fUHl"],["","EE","","IY"],["","EARN","","ERn"],[" ","EAR","^","ER"],["","EAD","","EHd"],["#:","EA"," ","IYAX"],["","EA","SU","EH"],["","EA","","IY"],["","EIGH","","EY"],["","EI","","IY"],[" ","EYE","","AY"],["","EY","","IY"],["","EU","","yUW"],["","E","","EH"]],
    "F": [["","FUL","","fUHl"],["","F","","f"]],
    "G": [["","GIV","","gIHv"],[" ","G","I^","g"],["","GE","T","gEH"],["SU","GGES","","gjEHs"],["","GG","","g"],[" B#","G","","g"],["","G","+","j"],["","GREAT","","grEYt"],["#","GH","",""],["","G","","g"]],
    "H": [[" ","HAV","","hAEv"],[" ","HERE","","hIYr"],[" ","HOUR","","AWER"],["","HOW","","hAW"],["","H","#","h"],["","H","",""]],
    "I": [[" ","IN","","IHn"],[" ","I"," ","AY"],["","IN","D","AYn"],["","IER","","IYER"],["#:R","IED","","IYd"],["","IED"," ","AYd"],["","IEN","","IYEHn"],["","IE","T","AYEH"],[" :","I","%","AY"],["","I","%","IY"],["","IE","","IY"],["","I","^+:#","IH"],["","IR","#","AYr"],["","IZ","%","AYz"],["","IS","%","AYz"],["","I","D%","AY"],["+^","I","^+","IH"],["","I","T%","AY"],["#:^","I","^+","IH"],["","I","^+","AY"],["","IR","","ER"],["","IGH","","AY"],["","ILD","","AYld"],["","IGN"," ","AYn"],["","IGN","^","AYn"],["","IGN","%","AYn"],["","IQUE","","IYk"],["","I","","IH"]],
    "J": [["","J","","j"]],
    "K": [[" ","K","N",""],["","K","","k"]],
    "L": [["","LO","C#","lOW"],["L","L","",""],["#:^","L","%","AXl"],["","LEAD","","lIYd"],["","L","","l"]],
    "M": [["","MOV","","mUWv"],["","M","","m"]],
    "N": [["E","NG","+","nj"],["","NG","R","NGg"],["","NG","#","NGg"],["","NGL","%","NGgAXl"],["","NG","","NG"],["","NK","","NGk"],[" ","NOW"," ","nAW"],["","N","","n"]],
    "O": [["","OF"," ","AXv"],["","OROUGH","","EROW"],["#:","OR"," ","ER"],["#:","ORS"," ","ERz"],["","OR","","AOr"],[" ","ONE","","wAHn"],["","OW","","OW"],[" ","OVER","","OWvER"],["","OV","","AHv"],["","O","^%","OW"],["","O","^EN","OW"],["","O","^I#","OW"],["","OL","D","OWl"],["","OUGHT","","AOt"],["","OUGH","","AHf"],[" ","OU","","AW"],["H","OU","S#","AW"],["","OUS","","AXs"],["","OUR","","AOr"],["","OULD","","UHd"],["^","OU","^L","AH"],["","OUP","","UWp"],["","OU","","AW"],["","OY","","OY"],["","OING","","OWIHNG"],["","OI","","OY"],["","OOR","","AOr"],["","OOK","","UHk"],["","OOD","","UHd"],["","OO","","UW"],["","O","E","OW"],["","O"," ","OW"],["","OA","","OW"],[" ","ONLY","","OWnlIY"],[" ","ONCE","","wAHns"],["","ON'T","","OWnt"],["C","O","N","AA"],["","O","NG","AO"],[" :^","O","N","AH"],["I","ON","","AXn"],["#:","ON"," ","AXn"],["#^","ON","","AXn"],["","O","ST ","OW"],["","OF","^","AOf"],["","OTHER","","AHDHER"],["","OSS"," ","AOs"],["#:^","OM","","AHm"],["","O","","AA"]],
    "P": [["","PH","","f"],["","PEOP","","pIYp"],["","POW","","pAW"],["","PUT"," ","pUHt"],["","P","","p"]],
    "Q": [["","QUAR","","kwAOr"],["","QU","","kw"],["","Q","","k"]],
    "R": [[" ","RE","^#","rIY"],["","R","","r"]],
    "S": [["","SH","","SH"],["#","SION","","ZHAXn"],["","SOME","","sAHm"],["#","SUR","#","ZHER"],["","SUR","#","SHER"],["#","SU","#","ZHUW"],["#","SSU","#","SHUW"],["#","SED"," ","zd"],["#","S","#","z"],["","SAID","","sEHd"],["^","SION","","SHAXn"],["","S","S",""],[".","S"," ","z"],["#:.E","S"," ","z"],["#:^##","S"," ","z"],["#:^#","S"," ","s"],["U","S"," ","s"],[" :#","S"," ","z"],[" ","SCH","","sk"],["","S","C+",""],["#","SM","","zm"],["#","SN","'","zAXn"],["","S","","s"]],
    "T": [[" ","THE"," ","DHAX"],["","TO"," ","tUW"],["","THAT"," ","DHAEt"],[" ","THIS"," ","DHIHs"],[" ","THEY","","DHEY"],[" ","THERE","","DHEHr"],["","THER","","DHER"],["","THEIR","","DHEHr"],[" ","THAN"," ","DHAEn"],[" ","THEM"," ","DHEHm"],["","THESE"," ","DHIYz"],[" ","THEN","","DHEHn"],["","THROUGH","","THrUW"],["","THOSE","","DHOWz"],["","THOUGH"," ","DHOW"],[" ","THUS","","DHAHs"],["","TH","","TH"],["#:","TED"," ","tIHd"],["S","TI","#N","CH"],["","TI","O","SH"],["","TI","A","SH"],["","TIEN","","SHAXn"],["","TUR","#","CHER"],["","TU","A","CHUW"],[" ","TWO","","tUW"],["","T","","t"]],
    "U": [[" ","UN","I","yUWn"],[" ","UN","","AHn"],[" ","UPON","","AXpAOn"],["T","UR","#","UHr"],["S","UR","#","UHr"],["R","UR","#","UHr"],["D","UR","#","UHr"],["L","UR","#","UHr"],["Z","UR","#","UHr"],["N","UR","#","UHr"],["J","UR","#","UHr"],["TH","UR","#","UHr"],["CH","UR","#","UHr"],["SH","UR","#","UHr"],["","UR","#","yUHr"],["","UR","","ER"],["","U","^ ","AH"],["","U","^^","AH"],["","UY","","AY"],[" G","U","#",""],["G","U","%",""],["G","U","#","w"],["#N","U","","yUW"],["T","U","","UW"],["S","U","","UW"],["R","U","","UW"],["D","U","","UW"],["L","U","","UW"],["Z","U","","UW"],["N","U","","UW"],["J","U","","UW"],["TH","U","","UW"],["CH","U","","UW"],["SH","U","","UW"],["","U","","yUW"]],
    "V": [["","VIEW","","vyUW"],["","V","","v"]],
    "W": [[" ","WERE","","wER"],["","WA","S","wAA"],["","WA","T","wAA"],["","WHERE","","WHEHr"],["","WHAT","","WHAAt"],["","WHOL","","hOWl"],["","WHO","","hUW"],["","WH","","WH"],["","WAR","","wAOr"],["","WOR","^","wER"],["","WR","","r"],["","W","","w"]],
    "X": [["","X","","ks"]],
    "Y": [["","YOUNG","","yAHNG"],[" ","YOU","","yUW"],[" ","YES","","yEHs"],[" ","Y","","y"],["#:^","Y"," ","IY"],["#:^","Y","I","IY"],[" :","Y"," ","AY"],[" :","Y","#","AY"],[" :","Y","^+:#","IH"],[" :","Y","^#","AY"],["","Y","","IH"]],
    "Z": [["","Z","","z"]]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = RULES; else root.NRL_RULES = RULES;
})(root);
(function (root) {
  'use strict';
  var RULES = root.NRL_RULES || require('./rules.js');
  var DIGITS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  function isvowel(c) { return c === 'A' || c === 'E' || c === 'I' || c === 'O' || c === 'U'; }
  function isupper(c) { return c >= 'A' && c <= 'Z'; }
  function isconsonant(c) { return isupper(c) && !isvowel(c); }
  function isalpha(c) { return isupper(c) || (c >= 'a' && c <= 'z'); }
  function isvoiced(c) { return 'BDVGJLMNRWZ'.indexOf(c) >= 0 && c !== ''; }
  function isfront(c) { return c === 'E' || c === 'I' || c === 'Y'; }
  function at(word, i) { return i >= 0 && i < word.length ? word.charAt(i) : ''; }
  function leftmatch(pat, word, i) {
    var p = pat.length - 1, c;
    for (; p >= 0; p--) {
      c = pat.charAt(p);
      if (isalpha(c) || c === "'" || c === ' ') { if (c !== at(word, i)) return false; i--; continue; }
      switch (c) {
      case '#': if (!isvowel(at(word, i))) return false; i--; while (isvowel(at(word, i))) i--; break;
      case ':': while (isconsonant(at(word, i))) i--; break;
      case '^': if (!isconsonant(at(word, i))) return false; i--; break;
      case '.': if (!isvoiced(at(word, i))) return false; i--; break;
      case '+': if (!isfront(at(word, i))) return false; i--; break;
      default: return false;
      }
    }
    return true;
  }
  function rightmatch(pat, word, i) {
    var p, c;
    for (p = 0; p < pat.length; p++) {
      c = pat.charAt(p);
      if (isalpha(c) || c === "'" || c === ' ') { if (c !== at(word, i)) return false; i++; continue; }
      switch (c) {
      case '#': if (!isvowel(at(word, i))) return false; i++; while (isvowel(at(word, i))) i++; break;
      case ':': while (isconsonant(at(word, i))) i++; break;
      case '^': if (!isconsonant(at(word, i))) return false; i++; break;
      case '.': if (!isvoiced(at(word, i))) return false; i++; break;
      case '+': if (!isfront(at(word, i))) return false; i++; break;
      case '%':
        if (at(word, i) === 'E') {
          i++;
          if (at(word, i) === 'L') { i++; if (at(word, i) === 'Y') { i++; break; } else { i--; break; } }
          else if (at(word, i) === 'R' || at(word, i) === 'S' || at(word, i) === 'D') i++;
          break;
        } else if (at(word, i) === 'I') {
          i++; if (at(word, i) === 'N') { i++; if (at(word, i) === 'G') { i++; break; } }
          return false;
        } else return false;
      default: return false;
      }
    }
    return true;
  }
  function findRule(word, index, rules) {
    var r, k, m, rem, rule;
    for (r = 0; r < rules.length; r++) {
      rule = rules[r]; m = rule[1];
      for (k = 0, rem = index; k < m.length; k++, rem++) if (m.charAt(k) !== at(word, rem)) break;
      if (k < m.length) continue;
      if (!leftmatch(rule[0], word, index - 1)) continue;
      if (!rightmatch(rule[2], word, rem)) continue;
      return { out: rule[3], next: rem, rule: rule };
    }
    return null;
  }
  function xlateWord(word, trail) {
    var index = 1, out = '', c, group, hit;
    while (index < word.length && at(word, index) !== '') {
      c = at(word, index); group = RULES[isupper(c) ? c : ' '];
      hit = group ? findRule(word, index, group) : null;
      if (!hit) { if (trail) trail.push({ at: index, text: c, rule: null, out: '' }); index++; continue; }
      out += hit.out;
      if (trail) trail.push({ at: index, text: word.slice(index, hit.next), rule: hit.rule, out: hit.out });
      index = hit.next;
      if (index >= word.length - 1) break;
    }
    return out;
  }
  var ACCENTED = '\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00cd\u00ce\u00cf\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d9\u00da\u00db\u00dc\u00dd';
  var PLAIN = 'AAAAAACEEEEIIIINOOOOOUUUUY';
  function fold(s) {
    var out = '', i, k;
    for (i = 0; i < s.length; i++) { k = ACCENTED.indexOf(s.charAt(i)); out += k >= 0 ? PLAIN.charAt(k) : s.charAt(i); }
    return out;
  }
  function read(text, trail) {
    var s = fold(String(text).toUpperCase()), out = '', i = 0, j, run, c, hit, w;
    while (i < s.length) {
      c = s.charAt(i);
      if (isupper(c) || c === "'") {
        for (j = i; j < s.length && (isupper(s.charAt(j)) || s.charAt(j) === "'"); j++) {}
        run = s.slice(i, j); w = ' ' + run + ' ';
        if (trail) trail.push({ word: run, pos: i });
        out += xlateWord(w, trail) + ' ';
        i = j; continue;
      }
      if (c >= '0' && c <= '9') { if (trail) trail.push({ word: c, pos: i, said: DIGITS[c.charCodeAt(0) - 48] }); out += xlateWord(' ' + DIGITS[c.charCodeAt(0) - 48] + ' ', trail) + ' '; i++; continue; }
      if (c === ';' || c === ':' || (c === '-' && s.charAt(i - 1) === ' ' && s.charAt(i + 1) === ' ')) { out += ' ' + c + ' '; if (trail) trail.push({ word: c, pos: i, mark: c }); i++; continue; }
      if (LEXILLOGUE.beeps && BEEPS.indexOf(c) >= 0) { out += ' ' + c + ' '; if (trail) trail.push({ word: c, pos: i, mark: c }); i++; continue; }
      w = ' ' + c + ' '; hit = findRule(w, 1, RULES[' ']);
      if (hit && hit.out === ' ' && c !== ' ') { out += ' ' + c + ' '; if (trail) trail.push({ word: c, pos: i, mark: c }); }
      if (!hit && trail && c !== ' ') trail.push({ word: c, rule: null });
      i++;
    }
    while (out.indexOf('  ') >= 0) out = out.split('  ').join(' ');
    return out;
  }
  function say(text) { return read(text, null); }
  function trace(text) { var t = []; read(text, t); return t; }
  var BEEPS = '()[]{}_';
  var LEXILLOGUE = { say: say, trace: trace, rules: RULES, xlateWord: xlateWord, leftmatch: leftmatch, rightmatch: rightmatch, beeps: false };
  if (typeof module !== 'undefined' && module.exports) module.exports = LEXILLOGUE;
  else root.LEXILLOGUE = LEXILLOGUE;
})(root);
(function (root) {
  var CONSONANTS = `
CONSONANTS⠀IN⠀THREES
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀lip⠀⠀⠀⠀⠀⠀front⠀⠀⠀⠀point⠀⠀⠀⠀back
open⠀⠀⠀⠀⠀⠀..)⠀f⠀⠀⠀⠀(_)⠀⠀⠀⠀⠀⠀(^)⠀TH⠀⠀⠀(..⠀kHH
⠀voiced⠀⠀⠀.-)⠀v⠀⠀⠀⠀(|)⠀y⠀⠀⠀⠀(')⠀DH⠀⠀⠀(-.  
mixed⠀⠀⠀⠀⠀{.)⠀WH⠀⠀⠀(_}⠀SH⠀⠀⠀(^}⠀s⠀⠀⠀⠀(.}  
⠀voiced⠀⠀⠀{-)⠀w⠀⠀⠀⠀(|}⠀ZH⠀⠀⠀('}⠀z⠀⠀⠀⠀(-}
shut⠀⠀⠀⠀⠀⠀..]⠀p⠀⠀⠀⠀[_]⠀⠀⠀⠀⠀⠀[^]⠀t⠀⠀⠀⠀[..⠀k
⠀voiced⠀⠀⠀.-]⠀b⠀⠀⠀⠀[|]⠀⠀⠀⠀⠀⠀[']⠀d⠀⠀⠀⠀[-.⠀g  
nasal⠀⠀⠀⠀⠀{.]⠀⠀⠀⠀⠀⠀[_}⠀⠀⠀⠀⠀⠀[^}⠀⠀⠀⠀⠀⠀[.}  
⠀voiced⠀⠀⠀{-]⠀m⠀⠀⠀⠀[|}⠀⠀⠀⠀⠀⠀['}⠀n⠀⠀⠀⠀[-}⠀NG
divided⠀⠀⠀(:)⠀l⠀⠀⠀turned⠀⠀(r)⠀r⠀⠀breath⠀⠀(o)⠀HH
⠀⠀..̜.̭.̰̰.̰̰.̰̩.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̬̠.̦̰.̰̥.̭.̰̬.̞.̰̥.̬̠.̦̰.̣.̰̥.̬̠.̦̰.̝.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̭.̰̩.̞.̰̥.̬̠.̦̰.̰̤.̣.̰̥.̬̠.̦̰.̰̤.̝.̰̥.̬̠.̦̰.̗̟.̰̥.̭.̰̬.̞.̰̥.̬̠.̦̰.̣.̰̥.̬̠.̦̰.̰̤.̝.̰̥.̬̠.̦̰.̗̟.̰̥
⠀⠀.̭.̰̦.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̗̣.̰̥.̬̠.̦̰.̭.̰̬.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̗̣.̰̥.̬̠.̦̰.̭.̰̩.̗̟.̰̰.̰̦.̭.̰̬.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̗̣.̰̥.̬̠.̦̰.̰̤.̭.̰̭.̟.̰̥.̬̠.̦̰.̭.̰̬.̝.̰̥.̬̠.̦̰.̭.̰̬.̗̖.̰̥.̬̠.̦̰.̰̤
`;
  var VOWELS = `
VOWEL⠀STEMS
⠀⠀⠀⠀⠀⠀⠀⠀unrounded⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀round
⠀⠀⠀⠀⠀⠀⠀⠀back⠀⠀⠀⠀front⠀⠀⠀mixed⠀⠀⠀⠀⠀back⠀⠀⠀⠀front⠀⠀⠀mixed
high⠀⠀⠀⠀<|'⠀⠀⠀⠀⠀>|'⠀IY⠀⠀x|'⠀IH⠀⠀⠀⠀<+'⠀UW⠀⠀>+'⠀IY⠀⠀x+'⠀UW
⠀wide⠀⠀⠀<|"⠀⠀⠀⠀⠀>|"⠀IH⠀⠀x|"⠀IH⠀⠀⠀⠀<+"⠀UH⠀⠀>+"⠀IH⠀⠀x+"⠀UH
mid⠀⠀⠀⠀⠀<|:⠀AH⠀⠀>|:⠀EY⠀⠀x|:⠀AX⠀⠀⠀⠀<+:⠀OW⠀⠀>+:⠀EY⠀⠀x+:
⠀wide⠀⠀⠀<|;⠀AH⠀⠀>|;⠀EH⠀⠀x|;⠀AX⠀⠀⠀⠀<+;⠀AO⠀⠀>+;⠀EH⠀⠀x+;
low⠀⠀⠀⠀⠀<|.⠀AA⠀⠀>|.⠀AE⠀⠀x|.⠀AA⠀⠀⠀⠀<+.⠀AO⠀⠀>+.⠀⠀⠀⠀⠀x+.
⠀wide⠀⠀⠀<|,⠀AA⠀⠀>|,⠀AE⠀⠀x|,⠀AA⠀⠀⠀⠀<+,⠀AO⠀⠀>+,⠀⠀⠀⠀⠀x+,
⠀⠀..̜.̭.̰̰.̰̰.̰̰.̰̰.̰̰.̰̬.̗̟.̰̥.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̭.̰̦.̗̟.̰̥.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̭.̰̥.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰
⠀⠀.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̭.̰̦.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̭.̰̥.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̗̟.̰̬.̭.̰̦.̗̠.̰̥.̬̠
⠀⠀.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̗̟.̰̬
`;
  var MARKS = '()[]{}|+<>x', STEMS = '.-\'^_:or"; ,', BLANK = String.fromCharCode(0x2800);
  function slice(sheet, into, grey) {
    var lines = sheet.split('\n'), n, i;
    for (n = 0; n < lines.length; n++) {
      var line = lines[n], skip = false, flat = '';
      for (i = 0; i < line.length; i++) {
        var c = line.charCodeAt(i);
        if (c >= 0x300 && c <= 0x36F) { skip = true; break; }
        flat += c === 0x2800 ? ' ' : line.charAt(i);
      }
      if (skip) continue;
      var t = flat.split(' '), k = [], j;
      for (j = 0; j < t.length; j++) if (t[j] !== '') k.push(t[j]);
      for (j = 0; j < k.length; j++) {
        if (k[j].length !== 3 || !isGlyph(k[j])) continue;
        if (j + 1 < k.length && isCode(k[j + 1])) { into[k[j]] = k[j + 1]; j++; }
        else if (grey) grey.push(k[j]);
      }
    }
    return into;
  }
  function isCode(t) {
    var i, c;
    for (i = 0; i < t.length; i++) {
      c = t.charCodeAt(i);
      if (!((c >= 65 && c <= 90) || (c >= 97 && c <= 122))) return false;
    }
    return t.length > 0;
  }
  function isGlyph(g) {
    var i;
    for (i = 0; i < g.length; i++) if (MARKS.indexOf(g.charAt(i)) >= 0) return true;
    return false;
  }
  function isBellToken(t) {
    var i, c, marks = 0;
    if (t.length !== 3) return false;
    if ((t.charAt(0) === ':' || t.charAt(0) === ';') && t.charAt(1) === '-' && t.charAt(2) === ')') return false;
    for (i = 0; i < 3; i++) {
      c = t.charAt(i);
      if (MARKS.indexOf(c) >= 0) marks++;
      else if (STEMS.indexOf(c) < 0) return false;
    }
    return marks > 0;
  }
  var GREY = [];
  var B = slice(VOWELS, slice(CONSONANTS, {}, GREY), GREY);
  function straight(s) {
    return String(s).split('‘').join("'").split('’').join("'")
      .split('“').join('"').split('”').join('"').split(BLANK).join(' ');
  }
  function isMark(p) { return p === '.' || p === '!' || p === '?' || p === ','; }
  function notice(text) {
    var parts = straight(text).split('\n').join(' ').split(' '), k, p, bell = 0, other = 0;
    for (k = 0; k < parts.length; k++) {
      p = parts[k];
      if (p === '' || isMark(p)) continue;
      if (isBellToken(p)) bell++; else other++;
    }
    return bell >= 2 && bell > 2 * other;
  }
  function has(text) {
    var lines = straight(text).split('\n'), parts, k, m;
    for (m = 0; m < lines.length; m++) {
      if (isCodesLine(lines[m])) return true;
      parts = lines[m].split(' ');
      for (k = 0; k < parts.length; k++) if (isBellToken(parts[k])) return true;
    }
    return false;
  }
  var CODES = {}; 'IY IH EY EH AE AA AO OW UH UW ER AX AH AY AW OY p b t d k g f v TH DH s z SH ZH HH h m n NG l w y r CH j WH'.split(' ').forEach(function (c) { CODES[c] = true; });
  function parsesAsCodes(t) {
    var i = 0, c;
    if (t.length === 0) return false;
    while (i < t.length) {
      c = t.charAt(i);
      if (c >= 'A' && c <= 'Z') { if (CODES[t.slice(i, i + 2)] !== true) return false; i += 2; }
      else if (CODES[c] === true) i++;
      else return false;
    }
    return true;
  }
  function isCodesToken(t) {
    var i = 0, caps = 0;
    if (!parsesAsCodes(t)) return false;
    for (i = 0; i < t.length; i++) if (t.charAt(i) >= 'A' && t.charAt(i) <= 'Z') caps++;
    return caps > 0;
  }
  function isCodesLine(line) {
    var parts = line.split(' '), k, yes = 0, no = 0;
    for (k = 0; k < parts.length; k++) {
      if (parts[k] === '' || isMark(parts[k])) continue;
      if (isBellToken(parts[k])) return false;
      if (isCodesToken(parts[k])) yes++; else no++;
    }
    return yes >= 1 && yes > no;
  }
  function read(text, trail) {
    var L = root.LEXILLOGUE, s = straight(text), n = s.length, toks = [], i = 0, j;
    var lineAt = 0, codesLines = {};
    s.split('\n').forEach(function (ln) { if (isCodesLine(ln)) codesLines[lineAt] = true; lineAt += ln.length + 1; });
    while (i < n) {
      var c = s.charAt(i);
      if (c === '\n') { toks.push({ t: '\n', at: i, nl: true }); i++; continue; }
      if (c === ' ') { toks.push({ t: '', at: i, gap: true }); i++; continue; }
      for (j = i; j < n && s.charAt(j) !== ' ' && s.charAt(j) !== '\n'; j++) {}
      toks.push({ t: s.slice(i, j), at: i }); i = j;
    }
    var k, prev, next, bellish = [], line0 = 0, onCodes = false;
    for (k = 0; k < toks.length; k++) {
      var tk = toks[k];
      if (tk.nl) { bellish.push(false); line0 = tk.at + 1; onCodes = false; continue; }
      if (tk.at === line0 || (k === 0)) onCodes = !!codesLines[line0];
      if (onCodes && !tk.gap) { tk.codes = true; bellish.push(true); continue; }
      if (tk.gap) { bellish.push(false); continue; }
      if (isBellToken(tk.t)) { bellish.push(true); continue; }
      prev = null; next = null;
      for (j = k - 1; j >= 0; j--) if (!toks[j].gap) { prev = toks[j]; break; }
      for (j = k + 1; j < toks.length; j++) if (!toks[j].gap) { next = toks[j]; break; }
      var near = (prev && !prev.nl && isBellToken(prev.t)) || (next && !next.nl && isBellToken(next.t));
      bellish.push(near && (isMark(tk.t) || CODES[tk.t] === true));
    }
    var out = '', bad = [], w = '', engFrom = -1, engTo = -1;
    function endWord() { if (w) { out += w + ' '; w = ''; } }
    function flushEnglish() {
      if (engFrom < 0) return;
      var sub = s.slice(engFrom, engTo), codes = L.say(sub);
      if (trail) { var tr = L.trace(sub), e; for (e = 0; e < tr.length; e++) { if (tr[e].pos !== undefined) tr[e].pos += engFrom; trail.push(tr[e]); } }
      out += codes + (codes.charAt(codes.length - 1) === ' ' ? '' : ' '); engFrom = -1;
    }
    for (k = 0; k < toks.length; k++) {
      var tk = toks[k];
      if (!bellish[k]) {
        if (tk.gap && engFrom >= 0) { engTo = tk.at + 1; continue; }
        if (tk.gap) { endWord(); continue; }
        endWord(); if (engFrom < 0) engFrom = tk.at; engTo = tk.at + tk.t.length; continue;
      }
      flushEnglish();
      if (isMark(tk.t)) { endWord(); out += tk.t + ' '; if (trail) trail.push({ word: tk.t, pos: tk.at, mark: tk.t }); continue; }
      if (tk.codes) {
        endWord();
        if (!parsesAsCodes(tk.t)) { if (trail) { trail.push({ word: tk.t, pos: tk.at }); trail.push({ word: tk.t, rule: null }); } continue; }
        out += tk.t + ' '; if (trail) { trail.push({ word: tk.t, pos: tk.at }); trail.push({ rule: 'codes', out: tk.t, at: 1, text: tk.t }); } continue;
      }
      if (CODES[tk.t] === true && !isBellToken(tk.t)) {
        w += tk.t; if (trail) { trail.push({ word: tk.t, pos: tk.at }); trail.push({ rule: 'bell', out: tk.t, at: 1, text: tk.t, label: true }); } continue;
      }
      if (B[tk.t] === undefined) { bad.push(tk.t); if (trail) { trail.push({ word: tk.t, pos: tk.at }); trail.push({ word: tk.t, rule: null }); } continue; }
      w += B[tk.t]; if (trail) { trail.push({ word: tk.t, pos: tk.at }); trail.push({ rule: 'bell', out: B[tk.t], at: 1, text: tk.t }); }
      if (k + 1 < toks.length && toks[k + 1].gap && !(k + 2 < toks.length && toks[k + 2].gap)) k++;
    }
    endWord(); flushEnglish();
    if (bad.length && BELL.report) BELL.report(bad);
    while (out.indexOf('  ') >= 0) out = out.split('  ').join(' ');
    read.unread = bad;
    return out;
  }
  function trace(text) { var t = []; read(text, t); return t; }
  function codes(text) {
    var parts = straight(text).split('\n').join(' . ').split(' '), words = [], w = '', bad = [], k, p;
    for (k = 0; k < parts.length; k++) {
      p = parts[k];
      if (p === '') { if (w) { words.push(w); w = ''; } continue; }
      if (isMark(p)) { if (w) { words.push(w); w = ''; } words.push(p); continue; }
      if (B[p] === undefined) { bad.push(p); continue; }
      w += B[p];
    }
    if (w) words.push(w);
    if (bad.length && BELL.report) BELL.report(bad);
    return { codes: words.join(' ') + (words.length ? ' ' : ''), unread: bad };
  }
  function report(bad) {
    var msg = 'bell: ' + bad.length + ' glyph' + (bad.length === 1 ? '' : 's') + ' this voice cannot yet say: ' + bad.join(' ');
    if (typeof console !== 'undefined' && console.warn) console.warn(msg);
    else if (typeof print === 'function') print(msg);
  }
  var BELL = { table: B, grey: GREY, slice: slice, notice: notice, has: has, read: read, trace: trace, codes: codes, straight: straight, report: report, CODES: CODES, isCodesLine: isCodesLine,
    CONSONANTS: CONSONANTS, VOWELS: VOWELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = BELL;
  else root.BELL = BELL;
})(root);
(function (root) {
  'use strict';
  var L = root.LEXILLOGUE || require('./lexillogue.js');
  var P = root.PHONES || require('./phones.js');
  function tint(text, o) {
    o = o || {};
    var home = o.f0 || 118, homeHue = o.hue === undefined ? 120 : o.hue, full = o.full || 0.125;
    var white = o.white || [232, 232, 232], mix = o.mix === undefined ? 0.75 : o.mix, floor = o.floor === undefined ? 0.6 : o.floor, knee = o.knee === undefined ? 0.67 : o.knee;
    var ceiling = o.ceiling, step = o.step || 360;
    var BELL = root.BELL, trail = (BELL && BELL.has(text)) ? BELL.trace(text) : L.trace(text), codes = [], owner = [], label = [], out = [], i, j, k, e, n, pos = -1, one = false, chars = [];
    for (i = 0; i < trail.length; i++) {
      e = trail[i];
      if (e.word !== undefined) {
        pos = e.pos; one = !!e.said;
        if (e.mark) { codes.push(' '); owner.push(null); label.push(false); codes.push(e.mark); owner.push([pos, pos + 1]); label.push(false); codes.push(' '); owner.push(null); label.push(false); }
        else { codes.push(' '); owner.push(null); label.push(false); }
        continue;
      }
      if (!e.rule) continue;
      n = P.split(e.out.split(' ').join(''));
      for (k = 0; k < n.length; k++) { codes.push(n[k]); owner.push(one ? [pos, pos + 1] : [pos + e.at - 1, pos + e.at - 1 + e.text.length]); label.push(!!e.label); }
    }
    var seq = [];
    for (i = 0; i < codes.length; i++) { if (codes[i] === ' ' && (i === 0 || seq[seq.length - 1] === ' ')) continue; seq.push(codes[i]); }
    var frames = P.frames(seq, { f0: home, tune: o.tune }), ci;
    var map = [], s2 = 0;
    for (i = 0; i < codes.length; i++) { if (codes[i] === ' ' && (i === 0 || codes[i - 1] === ' ')) { map.push(-1); continue; } map.push(s2++); }
    var back = []; for (i = 0; i < map.length; i++) if (map[i] >= 0) back[map[i]] = i;
    var drag = o.drag === undefined ? 40 : o.drag, inflect = o.inflect === undefined ? 15 : o.inflect;
    var total = 0; for (i = 0; i < frames.length; i++) total += frames[i].ms;
    var lineF = new Float32Array(total), lineV = new Float32Array(total), lineA = new Float32Array(total), lineC = new Int32Array(total), at = 0, from = frames[0], to, k, t;
    for (i = 0; i < frames.length; i++) {
      to = frames[i]; ci = back[to.ci]; if (ci === undefined) ci = -1;
      for (k = 0; k < to.ms; k++) {
        t = (k + 1) / to.ms; lineF[at] = from.f0 + (to.f0 - from.f0) * t; lineV[at] = from.voice + (to.voice - from.voice) * t;
        lineA[at] = (from.breath || 0) + ((to.breath || 0) - (from.breath || 0)) * t + (from.hiss || 0) + ((to.hiss || 0) - (from.hiss || 0)) * t;
        lineC[at] = ci; at++;
      }
      from = to;
    }
    var first = [], last = [];
    for (i = 0; i < total; i++) { ci = lineC[i]; if (ci < 0) continue; if (first[ci] === undefined) first[ci] = i; last[ci] = i + 1; }
    var ROOMS = { close: [150, 0.10], normal: [400, 0.18], royal: [1200, 0.30] }, room = ROOMS[o.room] || null;
    for (i = 0; i < text.length; i++) chars.push({ ch: text.charAt(i), f0: 0, voice: 0, ms: 0, a: -1, b: -1 });
    for (i = 0; i < codes.length; i++) {
      if (!owner[i] || first[i] === undefined) continue;
      for (j = owner[i][0]; j < owner[i][1] && j < text.length; j++) { if (chars[j].a < 0 || first[i] < chars[j].a) chars[j].a = first[i]; if (last[i] > chars[j].b) chars[j].b = last[i]; if (label[i]) chars[j].label = true; }
    }
    var lastF = home, lastV = 0, pitchHome = home;
    for (i = 0; i < chars.length; i++) {
      var c = chars[i], wf = 0, wv = 0, w = 0, own = 0, ownV = 0;
      if (c.a >= 0) {
        for (k = Math.max(0, c.a - drag); k < Math.min(total, c.b + inflect); k++) { if (lineV[k] <= 0) continue; var wk = k >= c.a && k < c.b ? 1 : 0.33; wf += lineF[k] * wk; w += wk; }
        for (k = c.a; k < c.b; k++) { ownV += lineV[k]; own++; }
      }
      if (room && c.a >= 0) {
        var rf = 0, rn = 0, rv = 0, ra = 0;
        for (k = Math.max(0, c.b - room[0]); k < c.b; k++) { if (lineV[k] > 0) { rf += lineF[k]; rn++; } rv += lineV[k]; ra += lineA[k]; }
        c.roomF = rn ? rf / rn : 0; c.ring = rv + ra > 0 ? rv / (rv + ra) : 0;
      }
      c.from = c.a; c.to = c.b; delete c.a; delete c.b;
      if (w > 0) { c.f0 = wf / w; c.voice = own ? ownV / own : 0; lastF = c.f0; lastV = c.voice; } else { c.f0 = lastF; c.voice = c.ch === ' ' ? 0 : lastV; }
    }
    if (o.auto) {
      var fs = [], devs = [];
      for (i = 0; i < chars.length; i++) if (chars[i].voice > 0) fs.push(chars[i].f0);
      if (fs.length) {
        fs.sort(function (p, q) { return p - q; }); pitchHome = fs[Math.floor(fs.length / 2)];
        for (i = 0; i < fs.length; i++) devs.push(Math.abs(Math.log(fs[i] / pitchHome) / Math.LN2));
        devs.sort(function (p, q) { return p - q; }); full = Math.max(0.05, devs[Math.min(devs.length - 1, Math.floor(devs.length * 0.95))]);
      }
    }
    for (i = 0; i < chars.length; i++) {
      var c = chars[i];
      var oct = Math.log(c.f0 / pitchHome) / Math.LN2;
      c.sat = Math.min(1, Math.abs(oct) / full) * (c.voice > 0 ? 1 : 0) * (o.vivid === undefined ? 1 : o.vivid);
      var mode = o.mode || (o.omnia ? 'omnia' : 'viriditas'), turn = step * oct, whole = 180 * Math.max(-1, Math.min(1, oct / full));
      if (mode === 'none') { c.hue = ((homeHue + turn) % 360 + 360) % 360; c.css = css(c.hue, 0, white); }
      else if (mode === 'omnia') { c.hue = ((homeHue + whole) % 360 + 360) % 360; c.css = css(c.hue, c.sat, white, floor, knee, ceiling); }
      else if (mode === 'vivificat') { var lean = o.lean === undefined ? 0.62 : o.lean; c.hue = ((homeHue + turn + (whole - turn) * lean) % 360 + 360) % 360; c.css = css(c.hue, c.sat * (mix + (1 - mix) * lean), white, floor, knee, ceiling); }
      else { c.hue = ((homeHue + turn) % 360 + 360) % 360; c.css = css(c.hue, c.sat * mix, white, floor, knee, ceiling); }
      if (c.label && mode !== 'none') { c.hue = 212; c.sat = 0.28 * (o.vivid === undefined ? 1 : o.vivid); c.css = css(c.hue, c.sat, white, floor, knee, ceiling); }
      if (room && c.roomF > 0 && mode !== 'none') {
        var roct = Math.log(c.roomF / pitchHome) / Math.LN2, rturn = step * roct, rwhole = 180 * Math.max(-1, Math.min(1, roct / full)), roff;
        roff = mode === 'omnia' ? rwhole : mode === 'vivificat' ? rturn + (rwhole - rturn) * (o.lean === undefined ? 0.62 : o.lean) : rturn;
        c.roomHue = ((homeHue + roff) % 360 + 360) % 360;
        c.roomSat = Math.min(1, Math.abs(roct) / full) * c.ring;
        c.back = rgba(c.roomHue, room[1] * (0.3 + 0.7 * c.roomSat) * c.ring, o.roomLift);
      } else c.back = '';
      delete c.ms;
    }
    return chars;
  }
  function rgba(hue, alpha, lift) {
    var h = hue / 60, x = 1 - Math.abs(h % 2 - 1), r, g, b, L = lift || 0;
    if (h < 1) { r = 1; g = x; b = 0; } else if (h < 2) { r = x; g = 1; b = 0; } else if (h < 3) { r = 0; g = 1; b = x; }
    else if (h < 4) { r = 0; g = x; b = 1; } else if (h < 5) { r = x; g = 0; b = 1; } else { r = 1; g = 0; b = x; }
    r += (1 - r) * L; g += (1 - g) * L; b += (1 - b) * L;
    return 'rgba(' + Math.round(255 * r) + ',' + Math.round(255 * g) + ',' + Math.round(255 * b) + ',' + alpha.toFixed(3) + ')';
  }
  function css(hue, amount, white, floor, knee, ceiling) {
    var h = hue / 60, x = 1 - Math.abs(h % 2 - 1), r, g, b;
    if (h < 1) { r = 1; g = x; b = 0; } else if (h < 2) { r = x; g = 1; b = 0; } else if (h < 3) { r = 0; g = 1; b = x; }
    else if (h < 4) { r = 0; g = x; b = 1; } else if (h < 5) { r = x; g = 0; b = 1; } else { r = 1; g = 0; b = x; }
    if (floor !== undefined) {
      var lw = (0.2126 * white[0] + 0.7152 * white[1] + 0.0722 * white[2]) / 255, lc = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lc < floor && lw > floor) {
        var most = (lw - floor) / (lw - lc), k = (knee === undefined ? 0.67 : knee) * most;
        if (most < 1 && amount > k) { var u = Math.min(1, (amount - k) / (1 - k)); amount = k + (most - k) * u * (2 - u); }
      }
    }
    if (ceiling !== undefined) {
      var lw2 = (0.2126 * white[0] + 0.7152 * white[1] + 0.0722 * white[2]) / 255, lc2 = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lc2 > ceiling && lw2 < ceiling) {
        var most2 = (ceiling - lw2) / (lc2 - lw2), k2 = (knee === undefined ? 0.67 : knee) * most2;
        if (most2 < 1 && amount > k2) { var u2 = Math.min(1, (amount - k2) / (1 - k2)); amount = k2 + (most2 - k2) * u2 * (2 - u2); }
      }
    }
    function m(w, c) { return Math.round(w * (1 - amount) + 255 * c * amount); }
    return 'rgb(' + m(white[0], r) + ',' + m(white[1], g) + ',' + m(white[2], b) + ')';
  }
  function html(text, o) {
    var t = tint(text, o), out = '', i, run = '', last = null, words = o && o.words, inWord = false, wend = 0;
    function esc(s) { return s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;'); }
    function roomVars(back) { var n = back.slice(5, -1).split(','); return ';--room:' + n[0] + ' ' + n[1] + ' ' + n[2] + ';--ra:' + n[3]; }
    function flush() { if (run) { var parts = last.split('|'); out += '<span style="color:' + parts[0] + (parts[1] ? roomVars(parts[1]) : '') + '">' + esc(run) + '</span>'; run = ''; } }
    function isSpace(ch) { return ch === ' ' || ch === String.fromCharCode(10) || ch === String.fromCharCode(9); }
    for (i = 0; i < t.length; i++) {
      var sp = isSpace(t[i].ch);
      if (words && !sp && !inWord) { flush(); wend = 0; var j = i; while (j < t.length && !isSpace(t[j].ch)) { if (t[j].to > wend) wend = t[j].to; j++; } out += '<span class="w" data-end="' + wend + '">'; inWord = true; }
      if (words && sp && inWord) { flush(); out += '</span>'; inWord = false; }
      var key = t[i].css + '|' + (t[i].back || '');
      if (key !== last && run) flush();
      run += t[i].ch; last = key;
    }
    flush(); if (inWord) out += '</span>';
    return out;
  }
  var LAMP = { tint: tint, html: html, css: css };
  if (typeof module !== 'undefined' && module.exports) module.exports = LAMP;
  else root.LAMP = LAMP;
})(root);
  function read(text) { return root.BELL.has(text) ? root.BELL.read(text) : root.LEXILLOGUE.say(text); }
  function frames(text, o) {
    o = o || {}; var v = o.voice || {}, tune = o.tune || (v.conduction === false ? 'apology' : 'conduction');
    return root.PHONES.frames(o.codes || read(text), { tune: tune, f0: o.f0, pause: o.pause });
  }
  function say(text, o) {
    o = o || {};
    var s = root.ECOUTER.settings(o.voice || root.ECOUTER.PRESETS[root.ECOUTER.HOUSE_NAME]);
    s.frames = frames(text, o);
    return root.ECOUTER.make(s, o.turns).pcm;
  }
  function wav(text, o) { return root.VOICEBOX.wav(say(text, o), root.ECOUTER.SR); }
  function lead(pcm, seconds) { var n = Math.round((seconds === undefined ? 0.333 : seconds) * root.ECOUTER.SR), out = new Float32Array(n + pcm.length); out.set(pcm, n); return out; }
  var LIB = {
    say: say, wav: wav, lead: lead, frames: frames, codes: read, trace: root.LEXILLOGUE.trace, SR: root.ECOUTER.SR,
    bell: root.BELL.codes, notice: root.BELL.notice, has: root.BELL.has, BELL: root.BELL,
    tint: root.LAMP.tint, html: root.LAMP.html, LAMP: root.LAMP,
    VOICEBOX: root.VOICEBOX, GUST: root.GUST, CHAIN: root.ECOUTER, PHONES: root.PHONES, RULES: root.NRL_RULES, LEXILLOGUE: root.LEXILLOGUE
  };
  if (outer) outer.exports = LIB; else global.ECOUTER = LIB;
})(typeof window !== 'undefined' ? window : this, typeof module !== 'undefined' && module.exports ? module : null);
/* ==== ECOUTER END ==== */
/* ==== VIDOUTE BEGIN: the painter, folded here by bela.make.js from satchel\vidoute\vidoute.bundle.js. Do not edit here. ==== */
/* vidoute.bundle.js -- written by satchel\vidoute\vidoute.bundle.make.js; do not edit. The painter of vidoutes (vidoute.js),
   its reserve vocabulary (WordNet placing, Unicode names: 85 words), and BelaCells (185 glyphs, one Iosevka cell each). */
/* vidoute.js -- the painter of vidoutes: a 25 x 5 view drawn from a paragraph's own words, deterministically.
   (user1, 20-21 x 2026: "little 'views' ... which invite the viewer into that view with shapes, color and labels"; "I must never
   scroll up saying, I wish to show you this moon your message made! Only to find out that it has become a cut of cheese with a
   suspicious mouse. No, we would raise that same moon again.")

   Script-style, as the workshop's modules are. VIDOUTE.compose(text, tools) -> { rows, version, drawn, struck, focus, field },
   rows being 5 rows of 25 cells, each null or [glyph, pigment-name from YAM-PAL]. VIDOUTE.card(view, title) -> Belagram text.
   tools: { sentences(text) -> [[a,b]...], clauses(text,a,b) -> [[a,b,depth]...] } -- Bela's lineator; without them, a sentence
   is a clause and every clause depth 0.

   The order a noun is looked up in: the LEXICON (curated: stratum, glyph, pigment -- and metaphor, since Unicode has no
   single-cell tree); then AXIAL (WordNet's hypernym chains: where a thing usually is) with the MICROFICHE (Unicode's names: what
   to draw it with), if both are loaded; else it is not drawn. Nothing random anywhere: the same words and the same lexicon
   version make the same picture. The lexicon is append-only and versioned (VERSION); a view keeps the version it was drawn with.
   Every glyph here is drawn by DejaVu Sans Mono and none is an emoji presentation (checked by vidoute.test.js). */
(function (root) {
  var VERSION = 9, W = 25, MID = 12, HEIGHTS = [3, 5, 7, 9];
  // strata: 0 sky, 1 far (horizon, air), 2 mid, 3 near (standing, held), 4 ground
  var LEX = {
    // sky
    moon: [0, '☽', 'bone'], sun: [0, '☼', 'gold'], star: [0, '★', 'star'], stars: [0, '·', 'star'], sky: [0, '▔', 'sky'], heaven: [0, '▔', 'sky'], heavens: [0, '·', 'star'],
    cloud: [0, '☁', 'breath'], clouds: [0, '☁', 'breath'], rain: [0, '╲', 'sky'], snow: [0, '*', 'salt'], storm: [0, '☇', 'metal'], lightning: [0, '☇', 'gold'], thunder: [0, '☇', 'metal'],
    ring: [0, '◯', 'thread'], halo: [0, '◯', 'sunlit'], dawn: [1, '◠', 'amber'], sunrise: [1, '◠', 'amber'], sunset: [1, '◡', 'fire'], comet: [0, '☄', 'salt'], planet: [0, '♁', 'sky'], earth: [4, '▁', 'earth'],
    wind: [1, '~', 'breath'], air: [1, '˙', 'breath'], smoke: [1, '§', 'shadow'], fog: [1, '░', 'breath'], mist: [1, '░', 'breath'], light: [0, '✦', 'sunlit'], dark: [0, '▓', 'shadow'], darkness: [0, '▓', 'shadow'],
    // far
    mountain: [1, '▲', 'stone'], mountains: [1, '▲', 'stone'], hill: [1, '◠', 'field'], hills: [1, '◠', 'field'], horizon: [1, '─', 'stone'], cliff: [1, '▌', 'stone'], tower: [1, '♜', 'stone'], castle: [1, '♜', 'stone'],
    city: [1, '▙', 'metal'], bird: [1, 'v', 'ink'], birds: [1, 'v', 'ink'], sail: [3, '◺', 'bone'], kite: [0, '◇', 'rose'], plane: [1, '✈', 'metal'], balloon: [0, 'ʘ', 'rose'],
    // mid
    tree: [2, '♣', 'forest'], trees: [2, '♣', 'forest'], forest: [2, '♣', 'forest'], wood: [2, '♣', 'bark'], woods: [2, '♣', 'forest'], leaf: [2, '❦', 'leaf'], leaves: [2, '❦', 'leaf'], flower: [3, '⚘', 'rose'], flowers: [3, '⚘', 'rose'],
    house: [2, '⌂', 'bark'], home: [2, '⌂', 'bark'], church: [2, '☦', 'stone'], temple: [2, '⌂', 'stone'], cathedral: [2, '☦', 'stone'], bridge: [2, '⌒', 'stone'], wall: [2, '█', 'stone'], gate: [2, '∏', 'bark'],
    window: [2, '▢', 'sunlit'], door: [3, '▐', 'bark'], bell: [2, 'Ω', 'metal'], arch: [2, '∩', 'stone'], archway: [2, '∩', 'bark'], column: [2, '║', 'bone'], pillar: [2, '║', 'bone'], fire: [3, '▲', 'fire'], flame: [3, '▴', 'fire'],
    dust: [2, '˙', 'salt'], spark: [2, '✧', 'gold'], sparks: [2, '✧', 'gold'], shadow: [3, '▒', 'shadow'], mirror: [3, '◫', 'metal'], screen: [3, '▭', 'sky'], machine: [3, '▣', 'metal'], engine: [3, '▣', 'metal'],
    // near: figures
    man: [3, '¡', 'flesh'], woman: [3, '¡', 'rose'], person: [3, '¡', 'flesh'], people: [3, '¡', 'flesh'], child: [3, 'ı', 'flesh'], children: [3, 'ı', 'flesh'], walker: [3, '¡', 'flesh'], reader: [3, '¡', 'flesh'],
    friend: [3, '¡', 'flesh'], friends: [3, '¡', 'flesh'], crowd: [3, '¡', 'flesh'], king: [3, '♔', 'gold'], queen: [3, '♕', 'gold'], knight: [3, '♘', 'metal'], rider: [3, '♘', 'shadow'], horse: [3, '♞', 'bark'],
    cow: [3, 'Ж', 'bark'], cat: [3, 'ω', 'ink'], dog: [3, 'ɷ', 'bark'], bat: [1, 'v', 'shadow'], bats: [1, 'v', 'shadow'], mouse: [3, '·', 'stone'], fish: [4, '∝', 'water'], snake: [3, '§', 'leaf'], eye: [2, '◉', 'hero'], eyes: [2, '◉', 'hero'],
    // near: things held
    lamp: [3, '✦', 'amber'], candle: [3, 'ı', 'amber'], lantern: [3, '✦', 'amber'], book: [3, '▤', 'bone'], books: [3, '▤', 'bone'], page: [3, '▯', 'bone'], pages: [3, '▯', 'bone'], letter: [3, '✉', 'bone'], scroll: [3, '§', 'bone'],
    sheet: [3, '▯', 'bone'], sheets: [3, '▯', 'bone'], stele: [3, '▮', 'stone'], key: [3, '⌐', 'gold'], cup: [3, '∪', 'metal'], bowl: [3, '◡', 'bark'], tray: [3, '▬', 'black'], box: [3, '□', 'bark'], cube: [3, '■', 'sky'], cubes: [3, '■', 'sky'],
    cone: [3, '▲', 'amber'], cones: [3, '▲', 'amber'], wheel: [3, '◎', 'metal'], clock: [3, '◷', 'metal'], hourglass: [3, 'ɤ', 'grain'], scales: [3, '⚖', 'metal'],
    flag: [3, '⚑', 'blood'], flags: [3, '⚑', 'blood'], crown: [3, '♛', 'gold'], sword: [3, '†', 'metal'], cross: [3, '✝', 'bone'], heart: [3, '♥', 'blood'], diadem: [3, '◯', 'gold'], coin: [3, '●', 'gold'], coins: [3, '●', 'gold'],
    pen: [3, '✎', 'ink'], pencil: [3, '✎', 'grain'], scissors: [3, '✂', 'metal'], phone: [3, '☎', 'shadow'], telephone: [3, '☎', 'shadow'], music: [2, '♪', 'thread'], song: [2, '♫', 'thread'], note: [2, '♪', 'thread'], notes: [2, '♫', 'thread'],
    cheese: [3, '◣', 'grain'], bread: [3, '◖', 'grain'], bun: [3, '◖', 'grain'], egg: [3, '◯', 'bone'], seed: [3, '·', 'grain'], seeds: [3, '·', 'grain'], bobbin: [3, '◎', 'thread'], spool: [3, '◎', 'thread'], thread: [3, '~', 'thread'],
    scribe: [3, '¡', 'flesh'], clerk: [3, '¡', 'flesh'], tally: [3, '‖', 'bone'], ledger: [3, '▤', 'bone'], bucket: [3, '∪', 'metal'], riches: [3, '♦', 'gold'], treasure: [3, '♦', 'gold'], chest: [3, '▣', 'bark'],
    pandit: [3, '¡', 'flesh'], player: [3, '¡', 'flesh'], players: [3, '¡', 'flesh'], musician: [3, '¡', 'flesh'], sarod: [3, '♪', 'bark'], guitar: [3, '♪', 'amber'], sitar: [3, '♪', 'bark'], tabla: [3, '◖', 'bone'],
    drum: [3, '◖', 'bone'], drums: [3, '◖', 'bone'], cycle: [2, '◷', 'thread'], compass: [3, '⊕', 'metal'], ship: [1, '◢', 'bone'], ships: [1, '◢', 'bone'], boat: [3, '◡', 'bark'],
    // ground
    road: [4, '═', 'hay'], path: [4, '┄', 'hay'], street: [4, '═', 'stone'], rail: [4, '╪', 'metal'], track: [4, '╪', 'metal'], water: [4, '≈', 'water'], sea: [4, '≈', 'deep'], ocean: [4, '≈', 'deep'], river: [4, '≈', 'water'],
    lake: [4, '≈', 'water'], pool: [4, '≈', 'water'], wave: [4, '∽', 'water'], waves: [4, '∽', 'water'], field: [4, '▒', 'field'], fields: [4, '▒', 'field'], grass: [4, '″', 'leaf'], lawn: [4, '″', 'leaf'],
    cactus: [3, 'ψ', 'forest'], cacti: [3, 'ψ', 'forest'], saguaro: [3, 'ψ', 'forest'], mesa: [1, '▟', 'bark'], mesas: [1, '▟', 'bark'], canyon: [1, '▙', 'bark'],
    sand: [4, '░', 'grain'], desert: [4, '░', 'hay'], playa: [4, '░', 'hay'], ground: [4, '▁', 'earth'], floor: [4, '▁', 'bark'], stone: [4, '●', 'stone'], stones: [4, '●', 'stone'], rock: [4, '▲', 'stone'], rocks: [4, '▲', 'stone'], plate: [4, '▬', 'metal']
  };
  var NEG = { never: 1, no: 1, not: 1, nor: 1, without: 1, absent: 1, none: 1, nothing: 1, nobody: 1, neither: 1 };
  var NPNEG = { no: 1, without: 1, absent: 1, none: 1 };   // these negate a noun; never, not, nor, n't negate a clause
  var COP = { is: 1, are: 1, was: 1, were: 1, has: 1, had: 1, 'will': 1, would: 1, can: 1, could: 1, must: 1, may: 1, might: 1 };
  // a word the lexicon holds that is as often a verb or an adjective is a noun only with a determiner or a preposition within three
  // words before it and no mark between ("the guitar bursts and rings" is not a ring; "a cut of cheese" is a cheese)
  var AMBIG = words('scroll scrolls note notes ring rings ground book light fire fires water plane wave waves track box sail key fish bat dust rain snow storm pen flag flags leaf page field rock rocks plate screen bridge wall column crown coin bell house seed thread spool bobbin scales shadow mirror engine machine spark sparks home wood dark air wind smoke cross heart cup bowl bed floor sand stone path street rail lamp letter cycle drum player compass ship tally chest');
  var DET = words('the a an this that these those my your his her its our their some any each every no one two three four five many few several such what whose of in on at by with from to into onto over under above below beneath near beside behind between among through across along around toward towards for like as upon within without against');
  function words(s) { var o = {}; s.split(' ').forEach(function (w) { o[w] = 1; }); return o; }
  var LIFT = { over: 1, above: 1, on: 1, upon: 1, atop: 1, onto: 1 }, DROP = { under: 1, beneath: 1, below: 1, underneath: 1 };
  var FIELD = { night: ['night', 'deep'], midnight: ['night', 'deep'], dusk: ['dusk', 'mauve'], evening: ['dusk', 'mauve'], vespers: ['dusk', 'mauve'], dawn: ['dawn', 'amber'], morning: ['dawn', 'sunlit'],
                noon: ['day', 'sunlit'], winter: ['snow', 'salt'], snow: ['snow', 'salt'], rain: ['rain', 'sky'], storm: ['rain', 'metal'], summer: ['day', 'hay'], autumn: ['day', 'hay'] };
  var AX = { sky: 0, air: 1, far: 1, ground: 4, standing: 3, held: 3 };
  // NAMED COLOURS (user1, 22 x 2026: "What are we doing with colors? If they are ever mentioned by name - is there a case in which we should
  // *not* see it somehow, or suffused in bg"): a colour word before a thing the painter draws colours that thing; a colour word standing
  // alone washes the sky with it. Not seen: a colour negated ("not red"), a colour in an idiom ("feeling blue", "red tape", "white lie",
  // "green with envy"), a colour in a proper name (a capital mid-sentence: Red Cross, White House) -- the words say no such colour is there.
  // Black is drawn as shadow and white as salt, so neither vanishes into the night or glares.
  var COLOUR = { red: 'blood', scarlet: 'blood', crimson: 'blood', vermilion: 'cut', orange: 'fire', amber: 'amber', gold: 'gold', golden: 'gold', yellow: 'gold',
    green: 'leaf', emerald: 'forest', olive: 'field', blue: 'water', azure: 'sky', navy: 'deep', indigo: 'hayshade', violet: 'mauve', purple: 'mauve', lavender: 'thread',
    pink: 'rose', rose: 'rose', chartreuse: 'leaf', lime: 'leaf', teal: 'water', turquoise: 'breath', cyan: 'sky', magenta: 'rose', maroon: 'blood', ochre: 'hay', ocher: 'hay', umber: 'earth', sepia: 'bark', cream: 'bone', beige: 'grain', khaki: 'field', white: 'salt', ivory: 'bone', silver: 'metal', grey: 'stone', gray: 'stone', black: 'shadow', brown: 'bark', tan: 'grain', copper: 'flesh' };
  var IDIOM = ['feeling blue', 'feel blue', 'felt blue', 'red tape', 'red herring', 'white lie', 'white noise', 'green with envy', 'black sheep', 'grey area', 'gray area', 'golden rule',
    'yellow belly', 'in the red', 'in the black', 'out of the blue', 'black and white', 'red-handed', 'blue-collar', 'white-collar', 'silver lining', 'golden age', 'once in a blue moon'];
  var SET_DESERT = words('desert deserts playa sand sands dune dunes mesa mesas canyon arroyo cactus saguaro kokonino'), SET_SEA = words('sea seas ocean shore beach ship ships sail harbour harbor coast tide'), SET_TOWN = words('city town street streets house houses church village market square'), SET_WOOD = words('wood woods forest forests tree trees grove');
  // THE TERRAIN AND ITS VIEW (user1, 21 x 2026: "that path may be viewed from many views ... banded ripples, a bumpy road ahead ...
  // seen from the side ... seen as a bird, from top down"). The paragraph's route down the ladder (the Wyrd's) becomes the ground,
  // drawn in one of three projections chosen by the words themselves, the side view when nothing asks otherwise.
  // (and, 22 x: "the mountains rose above the valley" is not a bird's view: above as a preposition places a thing, it does not lift the eye;
  // only "from above", "from the air", "from on high" do, with the words that are themselves the eye in the sky)
  var PROJ_TOP = words('overhead map maps aerial hawk eagle bird\'s-eye overlook'), TOP_PHRASE = / from (above|the air|on high|the sky|overhead)\b/;
  var PROJ_ROUND = words('around round rounds circle circles cycle cycles ring orbit orbits circuit loop loops return returns returned again ambit periodic period recur recurs wheel');   // ETA (user1): "the path may be seen as a circle, periodos, a way around, an ambit"
  var PROJ_AHEAD = words('ahead toward towards forward road roads path paths journey walk walking travel approach horizon distance onward');
  var BANDS = '≈═▒″░┄╪∽';
  // THE COMPOSITIONS (user1, 22 x 2026: "Treat that set of mechanisms as a built marvel. Give it the adjustments to author vibrantly distinct,
  // yet accurate, compositions" -- "hill and dale, mountains range, water's edge, the classic compositional styles"; "road, and all forward
  // views, must show horizon"; "If road, middle must be open, split for us. We are Link, we are the Rogue"). The route (the depth of the words,
  // clause by clause) is still what is drawn; the words choose the country it is drawn as:
  //   dale   hill and dale: a light contour, high ground where the words hold to their head clause, a dale where they go deeper (the default)
  //   range  a far mountain range on the horizon, its heights and saddles the same route; a thin near ground
  //   shore  the water's edge: land where the words run in their head clause, water where they go deeper, the sea's own horizon if a sea
  //   road   the road ahead in perspective, open down its middle for the one who walks it; its edges run to the vanishing point on the
  //          horizon; the roadside marked where the words dive; the focus stands at the far end
  // and the horizon -- a line, the far furniture standing on it, and in Bela the sky's hard edge -- in every forward view. EXPANSE (user1,
  // the same night, of Ralph McQuarrie's paintings: "expanse itself"): words of open country lower the horizon and give the sky the frame.
  var RANGE = words('mountain mountains peak peaks summit summits alps ridge ridges cliff cliffs crag crags sierra massif');
  var SHORE = words('sea seas ocean oceans shore shores beach beaches coast coasts tide tides lake lakes river rivers water waters harbour harbor bay bays waves pond ponds stream streams brook');
  var ROADW = words('road roads path paths street streets track tracks trail trails lane lanes highway');
  var EXPANSE = words('vast expanse endless open plain plains prairie steppe tundra desert deserts playa dune dunes sky skies stars horizon wide distance distant far');
  var INDOOR = words('room rooms inside indoors kitchen hall halls chamber chambers corridor corridors cellar attic ceiling library office studio parlour parlor bedroom table desk door doors window windows wall walls cave cavern dungeon');   // a room: the frame drawn round it
  var BIRDY = words('bird birds wing wings flight fly flying flew sky skies air wind gull gulls crow crows swallow swallows');
  var extra = { axial: null, fiche: null, off: {} };     // VIDOUTE.load({ axial: {...}, fiche: {...}, wide: '◷♪...' }) widens the lexicon, or names glyphs to stand in for
  function load(o) { if (o && o.axial) extra.axial = o.axial; if (o && o.fiche) extra.fiche = o.fiche; if (o && o.wide) Array.from(o.wide).forEach(function (g) { extra.off[g] = 1; }); }
  // STAND-INS FOR PLAIN TEXT (user1, 21 x 2026: the rows "start fine on the left and lose intertrack on the right"): in plain text
  // nothing boxes a cell, and a glyph the reader's face lacks is drawn by a fallback font at its own width. A glyph measured off-width
  // in the reader's browser (glyphwidth.devtools.js) is given its stand-in in card(); Bela's own drawing boxes every cell instead.
  var STAND = root.VIDOUTE_STAND || {};             // the plain-text stand-ins live in satchel\vidoute\standins.js now; Bela draws with BelaCells and boxes, and needs none
  function lookup(w) {
    if (LEX.hasOwnProperty(w)) return LEX[w];
    var s = w.length > 3 && w.charAt(w.length - 1) === 's' ? w.slice(0, -1) : null;
    if (s && LEX.hasOwnProperty(s)) return LEX[s];
    if (extra.axial && extra.fiche && extra.axial.hasOwnProperty(w) && AX.hasOwnProperty(extra.axial[w]) && extra.fiche[w] && extra.fiche[w].length) return [AX[extra.axial[w]], extra.fiche[w][0], 'ink'];
    return null;
  }
  function tokens(text) {                               // words with their offsets, lowercased, punctuation off the ends
    var out = [], re = /\S+/g, m;
    while ((m = re.exec(text)) !== null) out.push({ w: m[0].toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, ''), at: m.index, raw: m[0] });
    return out;
  }
  function compose(text, tools, opts) {
    var H = opts && HEIGHTS.indexOf(opts.h) >= 0 ? opts.h : 7;   // 3, 5, 7 or 9 rows; 7 the usual
    var toks = tokens(text), i, j, r, c, k;
    var sents = tools && tools.sentences ? tools.sentences(text) : [[0, text.length]], clauses = [];
    sents.forEach(function (sn, si) { var cs = tools && tools.clauses ? tools.clauses(text, sn[0], sn[1]) : [[sn[0], sn[1], 0]]; cs.forEach(function (cl) { clauses.push({ a: cl[0], b: cl[1], d: cl[2], s: si }); }); });
    function clauseOf(at) { for (var q = 0; q < clauses.length; q++) if (at >= clauses[q].a && at < clauses[q].b) return clauses[q]; return null; }
    // NEGATION SCOPE: from a negator to the end of its clause, nouns are not painted ("a cut of cheese with a suspicious mouse")
    // the scope runs to the end of the negator's clause, and on through the clauses after it in the same sentence that sit deeper
    // ("I must never scroll up ..., I wish to show you this moon ..., only to find ... a cut of cheese"); "No," alone is an answer, not a negator
    var negSpans = [];
    toks.forEach(function (t, q) {
      if (!(NEG[t.w] || /n't$/.test(t.w))) return;
      if (t.w === 'no' && /[,.!;:]$/.test(t.raw)) return;
      if (NPNEG[t.w]) {                                  // "no X", "without X", "absent X": the next noun only, within four words ("absent a compass" strikes the compass, not the playa)
        for (var u = q + 1; u < toks.length && u <= q + 4; u++) { if (lookup(toks[u].w)) { negSpans.push([t.at, toks[u].at + 1]); break; } if (/[,.;:!?]$/.test(toks[u].raw)) break; }
        return;
      }
      var ci = -1; for (var z = 0; z < clauses.length; z++) if (t.at >= clauses[z].a && t.at < clauses[z].b) { ci = z; break; }
      if (ci < 0) return; var end = clauses[ci].b;
      for (var y = ci + 1; y < clauses.length && clauses[y].s === clauses[ci].s && clauses[y].d > clauses[ci].d; y++) end = clauses[y].b;
      negSpans.push([t.at, end]);
    });
    function negated(t) { for (var z = 0; z < negSpans.length; z++) if (t.at > negSpans[z][0] && t.at < negSpans[z][1]) return true; return false; }
    function nounHere(q) {
      var t = toks[q]; if (!AMBIG[t.w] && !AMBIG[t.w.replace(/s$/, '')]) return true;
      if (q + 1 < toks.length && COP[toks[q + 1].w] && !/[,.;:!?]$/.test(t.raw)) return true;   // a bare subject: "because water is"
      for (var z = q - 1; z >= 0 && z >= q - 3; z--) { if (DET[toks[z].w]) return true; if (/[,.;:!?]$/.test(toks[z].raw)) return false; }
      return false;
    }
    var field = null; toks.forEach(function (t) { if (!field && FIELD[t.w]) field = FIELD[t.w]; });
    // the nouns that can be drawn: first mention of each, with counts; a noun struck by negation stays struck
    var found = [], seen = {}, count = {};
    toks.forEach(function (t, q) {
      var e = lookup(t.w); if (!e || !nounHere(q)) return;
      count[t.w] = (count[t.w] || 0) + 1;
      if (negated(t)) { if (!seen[t.w]) seen[t.w] = 'neg'; return; }
      if (seen[t.w] === true) return; seen[t.w] = true;
      var cl = clauseOf(t.at), p1 = q > 0 ? toks[q - 1].w : '', p2 = q > 1 ? toks[q - 2].w : '', p3 = q > 2 ? toks[q - 3].w : '';
      var rel = LIFT[p1] || LIFT[p2] || LIFT[p3] ? 'lift' : DROP[p1] || DROP[p2] || DROP[p3] ? 'drop' : null;
      var prepAt = rel ? (LIFT[p1] || DROP[p1] ? q - 1 : LIFT[p2] || DROP[p2] ? q - 2 : q - 3) : -1;
      found.push({ w: t.w, k: q, ctx: toks.slice(Math.max(0, q - 2), q + 3).map(function (t2) { return t2.raw; }).join(' '), st: e[0], g: e[1], p: e[2], d: cl ? cl.d : 0, s: cl ? cl.s : 0, rel: rel, prepAt: prepAt, fig: e[2] === 'flesh' || e[2] === 'rose' || /[♔♕♘♞Жωɷ]/.test(e[1]) });
    });
    // the openers move the HEAD, not the thing they govern: in "the cow jumped over the moon" it is the cow that goes up
    found.forEach(function (f, q) {
      if (!f.rel) return; var h = null;
      for (var z = q - 1; z >= 0; z--) if (found[z].s === f.s && f.prepAt - found[z].k <= 3) { h = found[z]; break; }   // the head stands just before the preposition ("the cow jumped over"); a noun farther back is someone else's
      if (!h) return;
      if (f.rel === 'lift' && h.st >= f.st) { h.over = f; if (f.st === 0) { f.st = 1; h.st = 0; } else h.st = f.st - 1; }   // only ever upward: a moon "over the field" stays in the sky
      if (f.rel === 'drop' && h.st <= f.st) { h.over = f; h.st = Math.min(3, f.st + 1); }
    });
    // the named colours: idioms and names first struck out, then each colour on the next drawn thing within two words, else the sky's wash
    var low = ' ' + text.toLowerCase().replace(/[^a-z' -]+/g, ' ').replace(/\s+/g, ' ') + ' ', idiomAt = {}, wash = null;
    IDIOM.forEach(function (id) { var at = low.indexOf(' ' + id + ' '); while (at >= 0) { idiomAt[at] = id; at = low.indexOf(' ' + id + ' ', at + 1); } });
    var inIdiom = function (q) { var w0 = toks[q].w, ctx = toks.slice(Math.max(0, q - 3), q + 4).map(function (t) { return t.w; }).join(' '); return IDIOM.some(function (id) { return id.indexOf(w0) >= 0 && (' ' + ctx + ' ').indexOf(' ' + id + ' ') >= 0; }); };
    // (and, user1 the same evening, "just to be loud": "Silver gray! Dark pink! Striped white!"): a colour followed by another colour is that
    // second colour's tint, so the second is the head; dark, deep, pale, light, bright and striped before a colour are kept with the wash
    var washMod = null, groundPig = null, OVER = { over: 1, above: 1, atop: 1, on: 1, upon: 1 }, UNDER = { under: 1, beneath: 1, below: 1 }, MODS = { dark: 'dark', deep: 'dark', pale: 'pale', light: 'pale', bright: 'bright', vivid: 'bright', striped: 'striped', stripy: 'striped', banded: 'striped' };
    toks.forEach(function (t, q) {
      var pg = COLOUR[t.w]; if (!pg) return;
      if (negated(t) || inIdiom(q)) return;                                   // "not red", "feeling blue": no such colour is there
      if (q > 0 && /^[A-Z]/.test(t.raw) && !/[.!?:;]["')\]]*$/.test(toks[q - 1].raw)) return;   // a capital mid-sentence: a name (Red Cross)
      if (q + 1 < toks.length && COLOUR[toks[q + 1].w] && !/[,.;:!?]$/.test(t.raw)) return;   // "silver gray": the gray is the colour; silver only tints it
      if (q + 2 < toks.length && COLOUR[toks[q + 2].w] && (OVER[toks[q + 1].w] || UNDER[toks[q + 1].w])) {   // "lavender over chartreuse": the one above is the sky, the one below the ground
        var up = OVER[toks[q + 1].w] ? pg : COLOUR[toks[q + 2].w], dn = OVER[toks[q + 1].w] ? COLOUR[toks[q + 2].w] : pg;
        if (!wash) wash = up; if (!groundPig) groundPig = dn; return;
      }
      if (groundPig && q > 1 && (OVER[toks[q - 1].w] || UNDER[toks[q - 1].w]) && COLOUR[toks[q - 2].w]) return;   // the second of that pair, already placed
      var mod = q > 0 && MODS[toks[q - 1].w] ? MODS[toks[q - 1].w] : (q > 1 && COLOUR[toks[q - 1].w] && MODS[toks[q - 2].w] ? MODS[toks[q - 2].w] : null);
      var tgt = null; for (var z = 0; z < found.length; z++) if (found[z].k > q && found[z].k - q <= 2) { tgt = found[z]; break; }
      if (tgt) tgt.p = pg; else if (!wash) { wash = pg; washMod = mod; }
    });
    // FOCUS: a head clause's noun, the most mentioned, standing things before others; it stands at the middle column
    var focus = null;
    found.forEach(function (f) { f.score = (count[f.w] || 1) * 2 + (f.d === 0 ? 3 : 0) + (f.st === 2 || f.st === 3 ? 1 : 0) + (f.fig ? 2 : 0); if (!focus || f.score > focus.score) focus = f; });
    var before = found.filter(function (f) { return f !== focus && f.k < focus.k; }), after = found.filter(function (f) { return f !== focus && f.k > focus.k; });
    if (focus) focus.x = MID;
    before.forEach(function (f, q) { f.x = Math.round((q + 1) * MID / (before.length + 1)) - 1; });
    after.forEach(function (f, q) { f.x = MID + Math.round((q + 1) * MID / (after.length + 1)) + 1; });
    // THE FRAME (user1, 21 x 2026: "Choice of 5 or 7 or 9? ... this is not a stamping-machine ... even consider 3 for the slimmest
    // lines"): the height is chosen per view, 7 the usual. Strata keep their places by proportion: the sky the top row, the ground
    // the bottom, the near things just above it, the focus on the centre row where the projection puts things in the middle.
    var rows = []; for (r = 0; r < H; r++) { rows.push([]); for (c = 0; c < W; c++) rows[r].push(null); }
    var GR = H - 1, CR = Math.floor(H / 2);
    function rowOf(st) { return st === 4 ? GR : Math.min(H - 2, Math.round(st / 3 * (H - 2))); }
    // the route: the depth of the clause at each column of reading order (the Wyrd's ladder, sampled across the board)
    var depthAt = [], len = Math.max(1, text.length);
    for (c = 0; c < W; c++) { var at = Math.floor((c + 0.5) / W * len), dd = 0; for (k = 0; k < clauses.length; k++) if (at >= clauses[k].a && at < clauses[k].b) { dd = clauses[k].d; break; } depthAt.push(dd); }
    var proj = ' ' + text.toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ') + ' ', topPhrase = TOP_PHRASE.test(proj); proj = topPhrase ? 'top' : 'side';
    var cued = topPhrase;
    if (!topPhrase) toks.some(function (t) { if (PROJ_TOP[t.w]) { proj = 'top'; return cued = true; } if (PROJ_ROUND[t.w] || INDOOR[t.w]) { proj = 'round'; return cued = true; } if (PROJ_AHEAD[t.w]) { proj = 'ahead'; return cued = true; } if (RANGE[t.w] || SHORE[t.w]) return cued = true; return false; });
    // MORE ROOMS AND MORE PAINTED WYRDS (user1, 22 x 2026: "I would like to see, statistically if possible, more 'frame' diagrams, which look
    // like characters wandering a Zelda or Rogue room, and 'painted wyrd' views, which are wonderful, and rarely seen"): where no word asks for
    // a view, the route's own shape chooses -- a route that turns often (five turns or more across the frame) is worth seeing whole, from
    // above, as the painted wyrd; a route of several sentences that turns and comes back to the depth it set out from is a way around, a room.
    // Measured on the evening's own notes (satchel\vidoute\stats.js): from 86% side views, 12% rooms, 1% painted, to about half side.
    if (!cued) {
      var turns = 0; for (k = 1; k < W; k++) if (depthAt[k] !== depthAt[k - 1]) turns++;
      if (turns >= 4) proj = 'top';
      else if (sents.length >= 2 && turns >= 3 && depthAt[0] === depthAt[W - 1]) proj = 'round';
    }
    if (opts && opts.proj) proj = opts.proj;           // a making keeps the country of the finished view, so the words pour into one scene
    if (H < 5 && proj === 'ahead') proj = 'side';      // three rows hold a profile, a room or a plan, not a road
    var pathRow = function (cc) { return 1 + Math.round(Math.min(3, depthAt[cc]) / 3 * (H - 2)); };   // the route spread over the whole height of the frame
    // THE FIELD: a ground always, so a view has somewhere to stand; night, rain and snow mark the sky
    // THE GROUND IS GREY (user1, 21 x 2026: "moon-lit as we seem to be, earth itself should be gray, or infrequently brown, because that
    // color, in a void, draws the eye"): grey by default and by night; mauve at dusk, amber at dawn, hay in a summer or autumn day
    var night = field && field[0] === 'night', gp = groundPig || (field && field[0] === 'dusk' ? 'mauve' : field && field[0] === 'dawn' ? 'amber' : field && field[0] === 'day' ? 'hay' : 'shadow');
    var seedF = 0; for (k = 0; k < text.length; k++) seedF = (seedF * 31 + text.charCodeAt(k)) >>> 0;
    function rnd() { seedF = (seedF * 1103515245 + 12345) >>> 0; return (seedF >>> 8) / 16777216; }
    var setting = 'hills';
    toks.some(function (t) { if (SET_DESERT[t.w]) { setting = 'desert'; return true; } if (SET_SEA[t.w]) { setting = 'sea'; return true; } if (SET_TOWN[t.w]) { setting = 'town'; return true; } if (SET_WOOD[t.w]) { setting = 'wood'; return true; } return false; });
    var style = proj === 'ahead' ? 'road' : proj === 'top' ? 'plan' : proj === 'round' ? 'ambit' : 'dale';
    if (proj === 'side') toks.some(function (t) { if (RANGE[t.w]) { style = 'range'; return true; } if (SHORE[t.w]) { style = 'shore'; return true; } return false; });
    if (opts && opts.style && proj === 'side' && /^(dale|range|shore)$/.test(opts.style)) style = opts.style;
    var fwd = proj === 'side' || proj === 'ahead', expanse = toks.some(function (t) { return EXPANSE[t.w]; });
    var hz = fwd && H >= 5 ? (expanse && style === 'dale' && H >= 7 ? GR - 2 : Math.max(1, Math.round((H - 1) / 3))) : -1;   // the horizon row: a third down; low, for open country
    var hzy = null;                                      // where the horizon falls, in rows from the top (for Bela's sky, its hard edge)
    function putc(r0, c0, g, p, y) { if (r0 >= 0 && r0 < H && c0 >= 0 && c0 < W) rows[r0][c0] = [g, p, y]; }
    var gtop = []; for (c = 0; c < W; c++) gtop.push(GR);
    // the contour: levels above a base row; a flat is the lower eighth (▁), a rise ╱ and a fall ╲ each take their own cell, so the line joins
    function contour(base, tgt, flat, pig, wet) {
      var h = tgt[0];
      for (var c2 = 0; c2 < W; c2++) {
        var t = tgt[c2], d2 = String(Math.min(3, depthAt[c2] - dmin)), rr;
        if (t > h) { rr = base - h; putc(rr, c2, '╱', pig, d2); h++; }
        else if (t < h) { h--; rr = base - h; putc(rr, c2, '╲', pig, d2); }
        else { rr = base - h; var wg = wet ? wet(c2, h) : null; putc(rr, c2, wg ? wg[0] : flat, wg ? wg[1] : pig, d2); }
        if (base === GR) gtop[c2] = rr;
      }
    }
    var dmin = Math.min.apply(null, depthAt);
    if (style === 'dale') {                            // HILL AND DALE: high ground for the head clause, a dale for a dive
      var LV = expanse ? 1 : H >= 7 ? 2 : 1, tg = depthAt.map(function (d0) { return Math.max(0, LV - (d0 - dmin)); }), tmin = Math.min.apply(null, tg); tg = tg.map(function (t) { return t - tmin; });   // the lowest dale stands on the frame's foot
      contour(GR, tg, '▁', gp, null); if (hz >= 0) hzy = hz + 0.85;
    } else if (style === 'shore') {                    // THE WATER'S EDGE: land where the words hold to their head clause, water where they go deeper
      var land = depthAt.map(function (d0) { return d0 === dmin; });
      if (land.every(Boolean)) for (c = W - 8; c < W; c++) land[c] = false;   // words that never dive still come to the water, at their close
      if (!land.some(Boolean)) for (c = 0; c < 6; c++) land[c] = true;        // and words that never surface stand on a strand at their opening
      contour(GR, land.map(function (l) { return l ? 1 : 0; }), '▁', gp, function (c2, h) { return h === 0 ? (depthAt[c2] - dmin >= 2 ? ['≈', 'deep'] : ['~', 'water']) : null; });
      if (hz >= 0 && (setting === 'sea' || toks.some(function (t) { return t.w === 'sea' || t.w === 'ocean' || t.w === 'seas' || t.w === 'oceans'; }))) { for (c = 0; c < W; c++) putc(hz, c, '─', 'deep', 'h'); hzy = hz + 0.5; }
      else if (hz >= 0) hzy = hz + 0.85;
    } else if (style === 'range') {                    // A RANGE ON THE HORIZON: its heights where the words hold, its saddles where they go deeper
      var base = hz >= 0 ? hz : GR, maxP = hz >= 0 ? Math.min(hz, 3) : 1, ph = Math.floor(rnd() * 7), per = 5 + Math.floor(rnd() * 3);
      var tri = function (c0) { var q = (c0 + ph) % per, half = per / 2; return Math.round((1 - Math.abs(q - half) / half) * maxP); };   // peaks, their period and phase from the words
      contour(base, depthAt.map(function (d0, c0) { return Math.max(0, Math.min(maxP, tri(c0) - (d0 - dmin))); }), '▁', 'fieldshade', null);
      if (hz >= 0) { for (c = 0; c < W; c++) putc(GR, c, '▁', gp, 'g'); hzy = hz + 1; }
    } else if (style === 'road') {                     // THE ROAD AHEAD: open down its middle; its edges to the vanishing point; the roadside by depth
      // (user1, 22 x 2026: "The strong / \ bars will never well-align to a road at this angle, they look like paired road flares ... Is there a
      // much more aligned, low angle? ... Let's sub in some subtle slopes ... To meander it by left and right would be top drawer top gear"):
      // each edge is a true line from the vanishing point to the frame's foot, set cell by cell -- upright │, steep / \, the cell's diagonal
      // ╱ ╲, and where it runs shallow the five scan lines ⎺ ⎻ ─ ⎼ ⎽, stepping down a fifth of a row at a time. THE MEANDER: the road bends
      // toward where the words go deeper, by the running sum of their depth from our feet (the paragraph's close) to the horizon (its opening).
      for (c = 0; c < W; c++) putc(hz, c, '─', 'fieldshade', 'h'); hzy = hz + 0.5;
      var yH = hz + 0.5, yB = GR + 1, NS = 40, acc = [0], meanD = depthAt.reduce(function (a0, b0) { return a0 + b0; }, 0) / W, i2;
      for (i2 = 1; i2 <= NS; i2++) acc.push(acc[i2 - 1] + (depthAt[Math.round((1 - i2 / NS) * (W - 1))] - meanD) / NS);
      var farAt = function (y) { return Math.max(0, Math.min(1, (yB - y) / (yB - yH))); };
      var offAt = function (fr) { var q = fr * NS, i0 = Math.floor(q), u = q - i0, v0 = acc[Math.min(NS, i0)] * (1 - u) + acc[Math.min(NS, i0 + 1)] * u; return Math.max(-6, Math.min(6, v0 * 12)); };
      var cxAt = function (y) { return MID + 0.5 + offAt(farAt(y)); }, hwcAt = function (y) { return 0.5 + (1 - farAt(y)) * 12; };
      var edgeL = function (y) { return cxAt(y) - hwcAt(y); }, edgeR = function (y) { return cxAt(y) + hwcAt(y); };
      var SCAN = ['⎺', '⎻', '─', '⎼', '⎽'];
      // THE ROAD'S OWN COLOUR (user1, 22 x 2026: "Roads Ahead are always amber. They must also be green grass, water blue, road to mountain in
      // stippled gray ... any color, really"): a colour the words give the road itself; else the first country the words name -- grass and
      // meadow green, a river or a canal blue, mountain, stone and town a stippled grey, snow white, desert sand -- else the hour's: silver by
      // night, mauve at dusk; else the old amber
      var roadF = found.filter(function (f) { return ROADW[f.w]; })[0], rpig = roadF && LEX[roadF.w] && roadF.p !== LEX[roadF.w][2] ? roadF.p : null;
      var RCUE = { grass: 'leaf', meadow: 'leaf', meadows: 'leaf', lawn: 'leaf', pasture: 'leaf', fields: 'leaf', field: 'leaf', green: 'leaf', river: 'water', rivers: 'water', canal: 'water', stream: 'water', water: 'water', sea: 'water', lake: 'water',
        mountain: 'stone', mountains: 'stone', stone: 'stone', stones: 'stone', rock: 'stone', rocks: 'stone', gravel: 'stone', cliff: 'stone', cliffs: 'stone', peak: 'stone', peaks: 'stone', town: 'stone', city: 'stone', street: 'stone', streets: 'stone',
        snow: 'salt', winter: 'salt', desert: 'hay', sand: 'hay', dunes: 'hay', playa: 'hay' };
      if (!rpig) toks.some(function (t) { if (RCUE[t.w]) { rpig = RCUE[t.w]; return true; } return false; });
      if (!rpig) rpig = night ? 'metal' : field && field[0] === 'dusk' ? 'mauve' : 'hay';
      var stipple = rpig === 'stone';
      var roadL = [], roadR = [];                        // the outermost column each edge takes, row by row, for the roadside and its things
      var drawEdge = function (e, side) {
        for (var r0 = hz + 1; r0 <= GR; r0++) {
          var xa = e(r0), xb = e(r0 + 1), dx = xb - xa, lo = Math.min(xa, xb), hi = Math.max(xa, xb), cc;
          // where the edge runs steep -- at the road's far end, by the vanishing point -- no slash at all (user1, 22 x: "they all end in road flares!
          // ./ \. ... They should simply end in dots or colons not slashes, since at the end of the road, one looks up and center"): a dot at the
          // very end, a colon above it, so the two edges close to a point as an eye sees them close
          if (Math.abs(dx) < 1.15) { cc = Math.floor((xa + xb) / 2); putc(r0, cc, r0 === hz + 1 ? '·' : ':', rpig, 'e'); lo = hi = cc + 0.5; }
          else for (cc = Math.floor(lo); cc <= Math.floor(hi - 1e-6); cc++) { if (stipple && (cc + r0) % 2) continue; var xc = Math.max(lo, Math.min(hi, cc + 0.5)), t = (xc - xa) / dx; putc(r0, cc, SCAN[Math.min(4, Math.max(0, Math.floor(t * 5)))], rpig, 'e'); }
          if (side < 0) roadL[r0] = Math.floor(lo); else roadR[r0] = Math.floor(hi - 1e-6);
        }
      };
      drawEdge(edgeL, -1); drawEdge(edgeR, 1);
      for (var rr0 = hz + 1; rr0 <= GR; rr0++) {         // the roadside: a mark just outside each edge where the words dive (the far end the opening, the near the close)
        var far = farAt(rr0 + 0.5), dpt = depthAt[Math.round((1 - far) * (W - 1))] - dmin;
        if (dpt >= 1) { var sg = dpt === 1 ? '·' : '~', sd = String(Math.min(3, dpt)); if (!rows[rr0][roadL[rr0] - 1]) putc(rr0, roadL[rr0] - 1, sg, 'fieldshade', sd); if (!rows[rr0][roadR[rr0] + 1]) putc(rr0, roadR[rr0] + 1, sg, 'fieldshade', sd); }
      }
      var vpX = Math.floor(cxAt(yH));
    } else if (proj === 'round') {                      // PERIODOS: the route as a way around, read clockwise from the top left; the ripples where it dives
      var ring = [], q2; for (q2 = 3; q2 <= 21; q2++) ring.push([0, q2, 'h']); for (q2 = 1; q2 <= GR - 1; q2++) ring.push([q2, 22, 'v']); for (q2 = 21; q2 >= 3; q2--) ring.push([GR, q2, 'h']); for (q2 = GR - 1; q2 >= 1; q2--) ring.push([q2, 2, 'v']);
      ring.forEach(function (cell, q3) { var dpt = depthAt[Math.min(W - 1, Math.floor(q3 / ring.length * W))]; rows[cell[0]][cell[1]] = [cell[2] === 'v' ? (dpt === 0 ? '│' : '¦') : (dpt === 0 ? '─' : dpt === 1 ? '~' : '≈'), 'thread', String(Math.min(3, dpt))]; });
      rows[0][2] = ['╭', 'thread', 'c']; rows[0][22] = ['╮', 'thread', 'c']; rows[GR][22] = ['╯', 'thread', 'c']; rows[GR][2] = ['╰', 'thread', 'c'];
    } else {                                            // the bird's view: the route as a path across the plan, no sky, no ground line
      for (c = 0; c < W; c++) {
        var pr0 = c > 0 ? pathRow(c - 1) : pathRow(c), pr1 = pathRow(c), dc = String(Math.min(3, depthAt[c]));
        if (pr1 === pr0) { rows[pr1][c] = ['─', 'hay', dc]; continue; }
        var dn = pr1 > pr0, a1 = Math.min(pr0, pr1), b1 = Math.max(pr0, pr1);   // a turn: the corner where it leaves, the straight down or up, the corner where it lands
        rows[pr0][c] = [dn ? '╮' : '╯', 'hay', 'c']; for (var vr = a1 + 1; vr < b1; vr++) rows[vr][c] = ['│', 'hay', 'c']; rows[pr1][c] = [dn ? '╰' : '╭', 'hay', 'c'];
      }
    }
    if (night) [3, 9, 16, 21].forEach(function (x) { if (!rows[0][x]) rows[0][x] = ['·', 'star', 'x']; });
    // THE FURNITURE OF THE FIELD (user1, 21 x 2026: "Kokonino-inspired backgrounds. Furniture from the field will set each as definitively as
    // a saguaro"): landscape, never a claim -- the far furniture of the setting the words name, standing ON the horizon, at columns drawn from
    // the words themselves; never at the road's far end, never where a range or the sea's own line already stands. Only empty cells.
    if (fwd) {
      var farR = hz;
      var FURN = { hills: ['◠', 'fieldshade'], desert: ['▟', 'hayshade'], sea: null, town: ['▙', 'shadow'], wood: ['♣', 'shadow'] }[setting];
      if (farR >= 0 && FURN && style !== 'range' && !(style === 'shore' && hzy === hz + 0.5)) {
        var nF = 3 + Math.floor(rnd() * 2);
        for (k = 0; k < nF; k++) { var fx = Math.floor(rnd() * W); if (style === 'road' && Math.abs(fx - MID) <= 2) continue; if (!rows[farR][fx] || rows[farR][fx][2] === 'h') rows[farR][fx] = [FURN[0], FURN[1], 'f']; if (setting === 'desert' && fx + 1 < W && (!rows[farR][fx + 1] || rows[farR][fx + 1][2] === 'h')) rows[farR][fx + 1] = ['▙', FURN[1], 'f']; }
      }
      if (H >= 5 && setting === 'desert' && proj === 'side') { var sx = 2 + Math.floor(rnd() * (W - 4)), sr = gtop[sx] - 1; if (sr > hz && !rows[sr][sx]) rows[sr][sx] = ['ψ', 'forest', 'f']; }   // the saguaro, standing on the ground
      if (H >= 5 && field && field[0] === 'day' && style === 'dale') for (k = 0; k < 3; k++) { var tx = Math.floor(rnd() * W); if (rows[gtop[tx]][tx] && rows[gtop[tx]][tx][0] === '▁') rows[gtop[tx]][tx] = ['″', 'leaf', 'f']; }
      // THE CONSUMMATE V'S (user1, 22 x 2026: "if stick-figuring properly, w and v are our birds ... and from time to time the v, indicating,
      // bat"), made rarer (the same night: "as if the photographer were John James Audubon searching for a nest"): birds when the words speak
      // of the air or of flight; otherwise one now and then; at night, now and then, a bat. Seeded like the rest of the furniture.
      if (H >= 5 && !(field && (field[0] === 'rain' || field[0] === 'snow'))) {
        var birdy = toks.some(function (t) { return BIRDY[t.w]; }), skyRows = Math.max(1, hz >= 0 ? hz : rowOf(1)), nb = night ? (rnd() < 0.25 ? 1 : 0) : birdy ? 1 + Math.floor(rnd() * 2) : (rnd() < 0.25 ? 1 : 0);
        for (k = 0; k < nb; k++) { var bx = 2 + Math.floor(rnd() * (W - 4)), by = Math.floor(rnd() * skyRows); if (!rows[by][bx]) rows[by][bx] = night ? ['v', 'shadow', 'b'] : [rnd() < 0.5 ? 'v' : 'w', 'stone', 'b']; }
      }
    }
    if (field && field[0] === 'rain') [2, 7, 15, 20].forEach(function (x) { rows[0][x] = ['╲', 'sky', 'x']; if (H >= 7) rows[1][x + 2] = ['╲', 'sky', 'x']; });
    if (field && field[0] === 'snow') [4, 11, 18, 23].forEach(function (x) { rows[Math.min(1, H - 2)][x] = ['*', 'salt', 'x']; if (H >= 7) rows[3][(x + 3) % W] = ['*', 'salt', 'x']; });
    found.forEach(function (f) { if (f.over && f.over.x !== undefined && f !== focus) f.x = f.over.x; });   // a thing over or under another stands at its column
    var drawOrder = (focus ? [focus] : []).concat(before, after); drawOrder.sort(function (a2, b2) { return (a2.over ? 1 : 0) - (b2.over ? 1 : 0); });
    found.forEach(function (f) { f.row = rowOf(f.st); });
    // the country itself is not drawn twice: in a range the mountains ARE the range, on a road the road IS the road, at the water's edge the water IS the water
    found.forEach(function (f) { f.skip = (style === 'range' && RANGE[f.w]) || (style === 'road' && ROADW[f.w]) || (style === 'shore' && SHORE[f.w] && BANDS.indexOf(f.g) >= 0); });
    if (fwd && style !== 'road') found.forEach(function (f) {   // in a forward view: the sky above the horizon, the far on it, the near standing on the ground at its column
      var x = Math.max(0, Math.min(W - 1, f.x)), gt = gtop[x];
      if (f.st === 1 && hz >= 0) f.row = hz;
      else if (f.st === 2) f.row = hz >= 0 ? Math.max(hz + 1, Math.min(gt - 1, Math.round((hz + gt) / 2))) : Math.max(0, Math.min(gt - 1, f.row));
      else if (f.st >= 3) f.row = gt;
      if (f.st === 0 && hz >= 0) f.row = Math.min(f.row, hz - 1);
    });
    if (style === 'road') found.forEach(function (f) {  // the road kept open: the focus at its far end, the rest by the roadside, before it on the left, after on the right
      if (f === focus && f.st >= 1) { f.row = hz; f.x = vpX; f.over = null; return; }
      if (f.st === 0) { f.row = Math.max(0, Math.min(hz - 1, f.row)); return; }
      var left = focus ? f.k < focus.k : f.x < MID, r0 = f.st === 1 ? hz : f.st === 2 ? hz + 1 + Math.floor((GR - hz - 1) / 3) : GR - 1;
      while (r0 > hz && (left ? roadL[r0] - 2 < 0 : roadR[r0] + 2 >= W)) r0--;
      f.row = r0; f.over = null;
      if (r0 > hz) f.x = left ? Math.min(f.x, roadL[r0] - 2) : Math.max(f.x, roadR[r0] + 2); else if (Math.abs(f.x - vpX) < 2) f.x = vpX + (left ? -3 : 3);
      f.x = Math.max(0, Math.min(W - 1, f.x));
    });
    // THE THING AT FOOT (user1, 22 x 2026: "every now and again - something at foot. Some fundament found, perhaps at nadir of wyrd. The point
    // reached. The spot closest to us is 'magic' ... It's as if there is an invisible empty bowl there. (*) = our two hands hold a star"): when
    // the words dive deep (two clauses down or more), the thing named at their deepest is held at the foot of the view, in our two hands; if
    // nothing is named down there, the hands hold a star. Only in a forward view, where there is a foot to stand at.
    var maxD = clauses.reduce(function (m0, cl) { return Math.max(m0, cl.d); }, 0), foot = null, footStar = false;
    // HELD, INSPECTED, POINTED AT (user1, the same night: "guided by context ... Perhaps other things are held, inspected, in hand, closely
    // pointed linguistically. Then of course, one sometimes points | or .| or _| or |_ for the left-hand"): a thing the words hold, carry,
    // examine, have in hand, or bring close with "this", is the thing at foot -- if it is a thing of a hand's size (the mid and near strata)
    // -- drawn in its own glyph, since it is looked at closely (in any height of view: a slim one-line view has a foot too); the nadir's thing, found rather than handled, keeps the typewriter's plain key.
    var HOLD = { hold: 1, holds: 1, held: 1, holding: 1, carry: 1, carries: 1, carried: 1, carrying: 1, grasp: 1, grasped: 1, grasping: 1, clutch: 1, clutched: 1, clutching: 1, cradle: 1, cradled: 1, cradling: 1, inspect: 1, inspected: 1, inspecting: 1, examine: 1, examined: 1, examining: 1, weigh: 1, weighed: 1, weighing: 1, cupped: 1, offered: 1, offers: 1, offer: 1 };
    var heldF = null, handSize = function (f) { return f.st === 2 || f.st === 3; };
    toks.forEach(function (t, q) {
      if (heldF) return;
      var near = function (from, to) { for (var z = 0; z < found.length; z++) if (found[z].k >= from && found[z].k <= to && handSize(found[z])) return found[z]; return null; };
      if (HOLD[t.w] || (t.w === 'at' && q > 0 && /^look/.test(toks[q - 1].w))) heldF = near(q + 1, q + 4);
      else if ((t.w === 'this' || t.w === 'these') && q + 1 < toks.length) heldF = near(q + 1, q + 2);
      else if ((t.w === 'hand' || t.w === 'hands') && q > 1 && toks[q - 2].w === 'in') heldF = near(q - 6, q - 3);
    });
    var heldOwn = false, boardHeld = false;
    if (fwd && heldF) { foot = heldF; heldOwn = true; foot.skip = true; }
    else if (fwd && maxD - dmin >= 2) { foot = found.filter(function (f) { return f.d === maxD && f !== focus && !f.skip; })[0] || null; if (foot) foot.skip = true; else footStar = true; }
    // and where the words point ("look", "behold", "yonder", "over there", "see the ..."), a hand points up at the focus from the foot: |_ the
    // left hand under a thing left of centre, _| the right under one right of it
    var low2 = ' ' + text.toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ') + ' ', pm = /\b(yonder|behold|lo|look(s|ed|ing)? (at|up|over|there)|over there|out there|up there|right there|see (the|that|this|those|how|there))\b/.exec(low2);
    var pointCtx = pm ? low2.slice(Math.max(0, pm.index - 12), pm.index + pm[0].length + 14).trim() : null;
    if (proj === 'round') {                             // inside the ambit: the focus at its centre, the others round it in mention order, above and below by turns
      var others = found.filter(function (f) { return f !== focus; });
      others.forEach(function (f, q4) { f.x = 4 + Math.round((q4 + 0.5) * 16 / Math.max(1, others.length)); if (Math.abs(f.x - MID) < 2) f.x += 2; f.row = q4 % 2 ? GR - 1 : 1; f.over = null; });
      if (focus) focus.row = CR;
    }
    // seen from above, a thing stands beside the path -- the sun, the moon and the stars too (user1, 22 x 2026, of the Dreaming, and of the
    // Luba's lukasa and the Akan's adinkra: "heaven and earth, north and west, swept by earth and moon, ever upon time's river"): one country,
    // no band of sky laid over it
    if (proj === 'top') found.forEach(function (f) { var pr = pathRow(Math.max(0, Math.min(W - 1, f.x))); f.row = f.k % 2 === 0 && pr - 1 >= 0 ? pr - 1 : Math.min(GR, pr + 1); });
    drawOrder.forEach(function (f) {
      if (f.skip) return;
      var x = Math.max(0, Math.min(W - 1, f.x));
      if (proj === 'top' && BANDS.indexOf(f.g) >= 0) { for (k = Math.max(0, x - 3); k <= Math.min(W - 1, x + 3); k++) { var pk = rows[pathRow(k)][k]; if (!pk || '╮╯╰╭│'.indexOf(pk[0]) < 0) rows[pathRow(k)][k] = [f.g, f.p, 'w']; } return; }   // the turns stay turns   // seen from above, a river or a road IS the path, where it is mentioned
      if (f.st === 4 && BANDS.indexOf(f.g) >= 0 && style !== 'road') { for (k = Math.max(0, x - 3); k <= Math.min(W - 1, x + 3); k++) rows[fwd ? gtop[k] : GR][k] = [f.g, f.p, 'w']; return; }   // ground marks run as a band, along the ground's own line
      var plural = /s$/.test(f.w) && LEX.hasOwnProperty(f.w.slice(0, -1)) && f.g !== '·' && f.g !== '˙' && f.st !== 4, xs = plural ? [x - 1, x + 1] : [x];
      xs.forEach(function (xx) { xx = Math.max(0, Math.min(W - 1, xx)); var r2 = f.row; while (r2 >= 0 && rows[r2][xx] && rows[r2][xx][2] === 'w' && !(proj === 'round')) r2--; if (r2 >= 0) rows[r2][xx] = [f.g, f.p, 'w']; });   // over the country and its furniture; up past another thing
    });
    // WHAT THE HANDS HOLD IS DRAWN PLAIN (user1, 22 x 2026: "for handheld things, the basics: ' , ^ , # , @ , + , - , <> , ~ , : ... the
    // typewriter widget set"): the thing held is drawn with a typewriter's key by what it is made of (its pigment), in its own colour --
    // water ~, a sprig ', grain :, stone or metal #, a coil of thread @, wood -, bone or salt +, a living or precious thing <>, sky ^,
    // light and fire * -- and a star when nothing is named
    if (foot || footStar) {
      var TYPE = { water: '~', deep: '~', sky: '^', breath: '@', thread: '@', mauve: '@', star: '*', fire: '*', gold: '*', sunlit: '*', amber: '*', leaf: "'", forest: "'", field: "'", fieldshade: "'",
        grain: ':', hay: ':', hayshade: ':', stone: '#', metal: '#', shadow: '#', black: '#', bark: '-', earth: '-', bone: '+', salt: '+', ink: '+', flesh: '<>', rose: '<>', blood: '<>', hero: '<>', cut: '<>' };
      var held = foot ? TYPE[foot.p] || '+' : '*', hp = foot ? foot.p : 'gold', hx = MID - (held.length > 1 ? 1 : 0);
      // handled and looked at closely: its own shape, presented on open hands, |_ and _| (user1, 22 x: "an underbar says unequivocally: |_
      // between my hands. _| like bookmarks"); found at the deepest, cupped ( ), as a star is held
      if (heldOwn) { held = foot.g; putc(GR, MID - 2, '|', 'bone', 'n'); putc(GR, MID - 1, '_', 'bone', 'n'); putc(GR, MID, held, hp, 'n'); putc(GR, MID + 1, '_', 'bone', 'n'); putc(GR, MID + 2, '|', 'bone', 'n'); }
      else { putc(GR, hx - 1, '(', 'bone', 'n'); for (j = 0; j < held.length; j++) putc(GR, hx + j, held.charAt(j), hp, 'n'); putc(GR, hx + held.length, ')', 'bone', 'n'); }
    }
    if (pointCtx && fwd && focus && !focus.skip) {
      var fx = Math.max(1, Math.min(W - 2, focus.x)), right = fx >= MID, p0 = right ? fx - 1 : fx, clash = (foot || footStar) && p0 + 1 >= MID - 3 && p0 <= MID + 3;
      if (clash) p0 = right ? MID + 4 : MID - 5;       // the hands already hold something there: the pointing hand beside them
      putc(GR, p0, right ? '_' : '|', 'bone', 'p'); putc(GR, p0 + 1, right ? '|' : '_', 'bone', 'p');   // _| and |_ (user1, 22 x: "in our frame, there is often no ground-view ... an underbar says unequivocally"), one hand at a time
    }
    // RESTS, RINGS AND TRACKS (the same night: "Your suggestions are excellent ... We need structure. And water."): in the painted wyrd, where
    // the words come to rest -- each sentence's end -- the track holds a ring, ◎, and the paragraph's own end a full one, ◉; a ring by water
    // when its sentence names water (a waterhole, a well, a river), else in sunlight; and round each ring a few dots of the ground, where the
    // track has left room. The route between the rings is the track itself.
    if (proj === 'top') {
      var WETW = { water: 1, waters: 1, well: 1, wells: 1, spring: 1, springs: 1, pool: 1, pools: 1, waterhole: 1, river: 1, rivers: 1, rain: 1, lake: 1, sea: 1, stream: 1, creek: 1 };
      sents.forEach(function (sn, si) {
        var cR = Math.max(0, Math.min(W - 1, Math.floor((sn[1] - 1) / len * W))), rR = pathRow(cR), last = si === sents.length - 1;
        var wet = toks.some(function (t) { return t.at >= sn[0] && t.at < sn[1] && WETW[t.w]; });
        if (rows[rR][cR] && rows[rR][cR][2] === 'w') return;      // a thing the words drew there keeps its place
        rows[rR][cR] = [last ? '◉' : '◎', wet ? 'water' : 'sunlit', 'k'];
        [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]].forEach(function (o) { var rr = rR + o[0], cc = cR + o[1]; if (rr >= 0 && rr < H && cc >= 0 && cc < W && !rows[rr][cc]) rows[rr][cc] = ['·', wet ? 'deep' : 'fieldshade', 'd']; });
      });
      // A BOARD IN THE HAND: a short painted wyrd (one line of words), or one whose words hold and name nothing of a hand's size to hold, is
      // held whole between two hands at its foot -- the country carried and read up close
      var holdAny = toks.some(function (t) { return HOLD[t.w]; });
      if (H === 3 || (holdAny && !heldF)) { boardHeld = true; rows[GR][0] = ['|', 'bone', 'n']; rows[GR][1] = ['_', 'bone', 'n']; rows[GR][W - 2] = ['_', 'bone', 'n']; rows[GR][W - 1] = ['|', 'bone', 'n']; }
    }
    // THE LABEL: the focus's word beside it, where its row has room ("shapes, color and labels")
    if (focus && H >= 5 && !(opts && opts.label === false)) {
      var lab = focus.w, fr = -1; for (r = 0; r < H; r++) if (rows[r][MID] && rows[r][MID][0] === focus.g) { fr = r; break; }
      var free = function (a, b) { for (var q = a; q < b; q++) if (q < 0 || q >= W || rows[fr][q]) return false; return true; };
      if (fr < 0) for (r = 0; r < H; r++) for (c = 0; c < W; c++) if (fr < 0 && rows[r][c] && rows[r][c][0] === focus.g) fr = r;   // a band or a moved head: find where it went
      if (fr >= 0) {                                    // beside it right, left; else on the row under it, else over it, centred; else the sky
        var sv = fr, x0 = MID - Math.floor(lab.length / 2), put = function (row, x) { for (j = 0; j < lab.length; j++) rows[row][x + j] = [lab[j], 'ink', 'l']; };
        if (fr < GR && free(MID + 2, MID + 2 + lab.length)) put(fr, MID + 2);
        else if (fr < GR && free(MID - 1 - lab.length, MID - 1)) put(fr, MID - 1 - lab.length);
        else if ((fr = sv + 1) < GR && free(x0, x0 + lab.length)) put(fr, x0);
        else if ((fr = sv - 1) >= 0 && free(x0, x0 + lab.length)) put(fr, x0);
        else if (sv > 0 && (fr = 0) === 0 && free(x0, x0 + lab.length)) put(0, x0);
        fr = sv;
      }
    }
    // PROVENANCE (user1, 22 x 2026: "Provenance under the pointer ... would meaningfully replace 'a view of this paragraph'"): every mark
    // the words put there, with the five words around it, so a reader can check the picture against the text
    var marks = found.map(function (f) { return { w: f.w, g: f.g, p: f.p, ctx: f.ctx }; });
    var titleCtx = focus ? focus.ctx : null;
    return { rows: rows, h: H, version: VERSION, projection: proj, title: focus ? focus.w : null, titleCtx: titleCtx, marks: marks, setting: fwd ? setting : null, style: style, horizon: hzy, foot: foot ? foot.w : footStar ? '*' : null, point: pointCtx, footHow: heldOwn ? 'held' : foot ? 'nadir' : footStar ? 'star' : boardHeld ? 'board' : null, wash: wash, washMod: washMod, focus: focus ? focus.w : null, field: field ? field[0] : null,
             drawn: found.map(function (f) { return f.w; }), struck: Object.keys(seen).filter(function (w) { return seen[w] === 'neg'; }) };
  }
  // the Belagram: the art under its head, the burst in glyph mode (the head's slot, then one per distinct glyph)
  var DIG = [0x0316, 0x0317, 0x031C, 0x031D, 0x031E, 0x031F, 0x0320, 0x0323, 0x0324, 0x0325, 0x0326, 0x0329, 0x032C, 0x032D, 0x032E, 0x0330];
  var PAL = ['ink', 'hero', 'star', 'sky', 'fire', 'water', 'deep', 'leaf', 'bark', 'earth', 'grain', 'gold', 'flesh', 'stone', 'thread', 'blood', 'breath', 'bone', 'metal', 'salt', 'cut', 'shadow', 'rose', 'amber', 'sunlit', 'mauve', 'hay', 'hayshade', 'field', 'fieldshade', 'black', 'forest'];
  function slot(v) { return '.' + (v < 16 ? String.fromCharCode(DIG[v]) : String.fromCharCode(DIG[v >> 4]) + String.fromCharCode(DIG[v & 15])); }
  // THE CORRECT SHADOW (user1, 22 x 2026: the *.yowl.txt "correct inline illustration with colorstripe"): glyph mode when every kind of
  // glyph is one colour; positional mode (a bare period, then one slot per inked cell, repeats written once with again(n)) when any kind
  // is drawn in two colours, as the ground and the hills often are -- so the shadow never tells a colour the picture does not have
  function again(n) { return slot(0xF8 | (n - 1)); }
  function card(view, title) {
    var BL = '\u2800', glyphs = [], paint = {}, lines = [], cells = [], mixed = false, r, c, cell;
    for (r = 0; r < view.rows.length; r++) { var s = ''; for (c = 0; c < view.rows[r].length; c++) { cell = view.rows[r][c]; var ch = cell ? (extra.off[cell[0]] && STAND[cell[0]] ? STAND[cell[0]] : cell[0]) : BL; s += ch;
      if (cell) { var v0 = PAL.indexOf(cell[1]); v0 = v0 < 0 ? 0 : v0; cells.push(v0); if (glyphs.indexOf(ch) < 0) { glyphs.push(ch); paint[ch] = v0; } else if (paint[ch] !== v0) mixed = true; } } lines.push(s + '  '); }
    var burst;
    if (!mixed) burst = slot(PAL.indexOf('stone')) + glyphs.map(function (g) { return slot(paint[g]); }).join('');
    else { burst = '.' + slot(PAL.indexOf('stone')); var i = 0; while (i < cells.length) { var j = i + 1; while (j < cells.length && cells[j] === cells[i] && j - i <= 8) j++; burst += slot(cells[i]); if (j - i > 1) burst += again(j - i - 1); i = j; } }
    return [String(title || 'A VIEW').toUpperCase().split(' ').join(BL) + '  '].concat(lines, [BL + BL + burst + '  ']).join('\n');
  }
  // THE HEIGHT FOR A PLACE: the room the words give. One line of words, a slim 3; a short paragraph, 5; a vented paragraph or a raked
  // sentence, 7, the usual; a long raked paragraph given one view, 9, the painter's 4:3. Never the same stamp twice by rote.
  function heightFor(lines) { return lines <= 2 ? 3 : lines <= 6 ? 5 : lines <= 24 ? 7 : 9; }
  var VIDOUTE = { compose: compose, card: card, load: load, heightFor: heightFor, VERSION: VERSION, LEX: LEX, W: W, HEIGHTS: HEIGHTS, PAL: PAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = VIDOUTE;
  root.VIDOUTE = VIDOUTE;
})(typeof window !== 'undefined' ? window : this);
(function (root) { if (!root.VIDOUTE) return;
  root.VIDOUTE.load({ axial: {"airplane":"air","alembic":"held","angle":"standing","atom":"held","bar":"standing","base":"standing","bishop":"standing","blade":"standing","block":"held","bullet":"held","cap":"held","chess":"ground","coffin":"held","comma":"standing","corner":"standing","countersink":"held","crop":"standing","crosshatch":"held","david":"standing","delta":"far","diamond":"held","die":"held","electric":"standing","empty":"held","envelope":"held","equal":"standing","farsi":"standing","female":"standing","flat":"ground","gear":"held","generic":"held","greek":"standing","hammer":"held","hand":"standing","harpoon":"held","helm":"held","hook":"held","jupiter":"sky","keyboard":"held","latin":"standing","loop":"held","lozenge":"held","male":"standing","maltese":"standing","medium":"held","member":"standing","mercury":"sky","natural":"standing","neptune":"sky","nib":"standing","operator":"standing","original":"held","ornament":"held","paper":"held","pawn":"standing","pedestal":"standing","pinwheel":"standing","pluto":"sky","product":"held","propeller":"held","proportion":"standing","quad":"standing","quarters":"standing","recorder":"standing","recycling":"held","replacement":"standing","rook":"air","saltire":"held","saturn":"sky","shamrock":"standing","shoe":"held","sickle":"held","slash":"ground","snowflake":"air","snowman":"held","spade":"held","stile":"held","suit":"standing","tack":"held","tape":"held","thunderstorm":"sky","umbrella":"held","uranus":"sky","urn":"held","vane":"held"}, fiche: {"airplane":["✈"],"alembic":["⚗"],"angle":["∠"],"atom":["⚛"],"bar":["¦"],"base":["↨"],"bishop":["♗"],"blade":["✁"],"block":["█"],"bullet":["∙"],"cap":["⊓"],"chess":["♔"],"coffin":["⚰"],"comma":["⍪"],"corner":["⌜"],"countersink":["⌵"],"crop":["⌌"],"crosshatch":["▦"],"david":["✡"],"delta":["≜"],"diamond":["⋄"],"die":["⚀"],"electric":["⌁"],"empty":["∅"],"envelope":["✉"],"equal":["≃"],"farsi":["☫"],"female":["♀"],"flat":["♭"],"gear":["⚙"],"generic":["♺"],"greek":["✙"],"hammer":["☭"],"hand":["✌"],"harpoon":["↼"],"helm":["⎈"],"hook":["↩"],"jupiter":["♃"],"keyboard":["⌨"],"latin":["✝"],"loop":["↫"],"lozenge":["◊"],"male":["♂"],"maltese":["✠"],"medium":["▒"],"member":["∋"],"mercury":["☿"],"natural":["♮"],"neptune":["♆"],"nib":["✑"],"operator":["∗"],"original":["⊐"],"ornament":["❢"],"paper":["♼"],"pawn":["♙"],"pedestal":["⇫"],"pinwheel":["✯"],"pluto":["♇"],"product":["∏"],"propeller":["❊"],"proportion":["∷"],"quad":["⎕"],"quarters":["▆"],"recorder":["⌕"],"recycling":["♲"],"replacement":["�"],"rook":["♖"],"saltire":["☓"],"saturn":["♄"],"shamrock":["☘"],"shoe":["⍝"],"sickle":["☭"],"slash":["∕"],"snowflake":["❄"],"snowman":["☃"],"spade":["♠"],"stile":["⌽"],"suit":["♠"],"tack":["⊢"],"tape":["✇"],"thunderstorm":["☈"],"umbrella":["☂"],"uranus":["♅"],"urn":["⚱"],"vane":["⍅"]} });
  root.VIDOUTE_CELLS = { b64: "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", ranges: "U+263D,U+263C,U+2605,U+B7,U+2594,U+2601,U+2572,U+2607,U+25EF,U+25E0,U+25E1,U+2604,U+2641,U+2581,U+2D9,U+A7,U+2591,U+2726,U+2593,U+25B2,U+2500,U+258C,U+265C,U+2599,U+25FA,U+25C7,U+2708,U+298,U+2663,U+2766,U+2698,U+2302,U+2626,U+2312,U+2588,U+220F,U+25A2,U+2590,U+3A9,U+2229,U+2551,U+25B4,U+2727,U+2592,U+25EB,U+25AD,U+25A3,U+A1,U+131,U+2654,U+2655,U+2658,U+265E,U+416,U+3C9,U+277,U+221D,U+25C9,U+25A4,U+25AF,U+2709,U+25AE,U+2310,U+222A,U+25AC,U+25A1,U+25A0,U+25CE,U+25F7,U+264,U+2696,U+2691,U+265B,U+2020,U+271D,U+2665,U+25CF,U+270E,U+2702,U+260E,U+266A,U+266B,U+25E3,U+25D6,U+2016,U+2666,U+2295,U+25E2,U+2550,U+2504,U+256A,U+2248,U+223D,U+2033,U+3C8,U+259F,U+2584,U+2583,U+2582,U+2571,U+256D,U+256E,U+2570,U+256F,U+2502,U+A6,U+2697,U+2220,U+269B,U+21A8,U+2657,U+2701,U+2219,U+2293,U+26B0,U+236A,U+231C,U+2335,U+230C,U+25A6,U+2721,U+225C,U+22C4,U+2680,U+2301,U+2205,U+2243,U+262B,U+2640,U+266D,U+2699,U+267A,U+2719,U+262D,U+270C,U+21BC,U+2388,U+21A9,U+2643,U+2328,U+21AB,U+25CA,U+2642,U+2720,U+220B,U+263F,U+266E,U+2646,U+2711,U+2217,U+2290,U+2762,U+267C,U+2659,U+21EB,U+272F,U+2647,U+274A,U+2237,U+2395,U+2586,U+2315,U+2672,U+FFFD,U+2656,U+2613,U+2644,U+2618,U+235D,U+2215,U+2744,U+2603,U+2660,U+233D,U+22A2,U+2707,U+2608,U+2602,U+2645,U+26B1,U+2345,U+23BA,U+23BB,U+23BC,U+23BD" };
})(typeof window !== 'undefined' ? window : this);
/* ==== VIDOUTE END ==== */
/* ==== BELL SHEETS: Visible Speech in threes, shown here by bela.make.js from ecouter\bell-orthoes\bell.js, which is where they are read. Do not edit here. ====
CONSONANTS⠀IN⠀THREES  
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀lip⠀⠀⠀⠀⠀⠀front⠀⠀⠀⠀point⠀⠀⠀⠀back  
open⠀⠀⠀⠀⠀⠀..)⠀f⠀⠀⠀⠀(_)⠀⠀⠀⠀⠀⠀(^)⠀TH⠀⠀⠀(..⠀kHH  
⠀voiced⠀⠀⠀.-)⠀v⠀⠀⠀⠀(|)⠀y⠀⠀⠀⠀(')⠀DH⠀⠀⠀(-.  
mixed⠀⠀⠀⠀⠀{.)⠀WH⠀⠀⠀(_}⠀SH⠀⠀⠀(^}⠀s⠀⠀⠀⠀(.}  
⠀voiced⠀⠀⠀{-)⠀w⠀⠀⠀⠀(|}⠀ZH⠀⠀⠀('}⠀z⠀⠀⠀⠀(-}  
shut⠀⠀⠀⠀⠀⠀..]⠀p⠀⠀⠀⠀[_]⠀⠀⠀⠀⠀⠀[^]⠀t⠀⠀⠀⠀[..⠀k  
⠀voiced⠀⠀⠀.-]⠀b⠀⠀⠀⠀[|]⠀⠀⠀⠀⠀⠀[']⠀d⠀⠀⠀⠀[-.⠀g  
nasal⠀⠀⠀⠀⠀{.]⠀⠀⠀⠀⠀⠀[_}⠀⠀⠀⠀⠀⠀[^}⠀⠀⠀⠀⠀⠀[.}  
⠀voiced⠀⠀⠀{-]⠀m⠀⠀⠀⠀[|}⠀⠀⠀⠀⠀⠀['}⠀n⠀⠀⠀⠀[-}⠀NG  
divided⠀⠀⠀(:)⠀l⠀⠀⠀turned⠀⠀(r)⠀r⠀⠀breath⠀⠀(o)⠀HH  
⠀⠀..̜.̭.̰̰.̰̰.̰̩.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̬̠.̦̰.̰̥.̭.̰̬.̞.̰̥.̬̠.̦̰.̣.̰̥.̬̠.̦̰.̝.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̭.̰̩.̞.̰̥.̬̠.̦̰.̰̤.̣.̰̥.̬̠.̦̰.̰̤.̝.̰̥.̬̠.̦̰.̗̟.̰̥.̭.̰̬.̞.̰̥.̬̠.̦̰.̣.̰̥.̬̠.̦̰.̰̤.̝.̰̥.̬̠.̦̰.̗̟.̰̥  
⠀⠀.̭.̰̦.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̗̣.̰̥.̬̠.̦̰.̭.̰̬.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̗̣.̰̥.̬̠.̦̰.̭.̰̩.̗̟.̰̰.̰̦.̭.̰̬.̞.̰̥.̬̠.̦̰.̗̟.̰̥.̝.̰̥.̬̠.̦̰.̗̣.̰̥.̬̠.̦̰.̰̤.̭.̰̭.̟.̰̥.̬̠.̦̰.̭.̰̬.̝.̰̥.̬̠.̦̰.̭.̰̬.̗̖.̰̥.̬̠.̦̰.̰̤

VOWEL⠀STEMS  
⠀⠀⠀⠀⠀⠀⠀⠀unrounded⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀round  
⠀⠀⠀⠀⠀⠀⠀⠀back⠀⠀⠀⠀front⠀⠀⠀mixed⠀⠀⠀⠀⠀back⠀⠀⠀⠀front⠀⠀⠀mixed  
high⠀⠀⠀⠀<|'⠀⠀⠀⠀⠀>|'⠀IY⠀⠀x|'⠀IH⠀⠀⠀⠀<+'⠀UW⠀⠀>+'⠀IY⠀⠀x+'⠀UW  
⠀wide⠀⠀⠀<|"⠀⠀⠀⠀⠀>|"⠀IH⠀⠀x|"⠀IH⠀⠀⠀⠀<+"⠀UH⠀⠀>+"⠀IH⠀⠀x+"⠀UH  
mid⠀⠀⠀⠀⠀<|:⠀AH⠀⠀>|:⠀EY⠀⠀x|:⠀AX⠀⠀⠀⠀<+:⠀OW⠀⠀>+:⠀EY⠀⠀x+:  
⠀wide⠀⠀⠀<|;⠀AH⠀⠀>|;⠀EH⠀⠀x|;⠀AX⠀⠀⠀⠀<+;⠀AO⠀⠀>+;⠀EH⠀⠀x+;  
low⠀⠀⠀⠀⠀<|.⠀AA⠀⠀>|.⠀AE⠀⠀x|.⠀AA⠀⠀⠀⠀<+.⠀AO⠀⠀>+.⠀⠀⠀⠀⠀x+.  
⠀wide⠀⠀⠀<|,⠀AA⠀⠀>|,⠀AE⠀⠀x|,⠀AA⠀⠀⠀⠀<+,⠀AO⠀⠀>+,⠀⠀⠀⠀⠀x+,  
⠀⠀..̜.̭.̰̰.̰̰.̰̰.̰̰.̰̰.̰̬.̗̟.̰̥.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̭.̰̦.̗̟.̰̥.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̭.̰̥.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰  
⠀⠀.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̭.̰̦.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̟.̰̥.̭.̰̥.̗̠.̰̥.̬̠.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̗̟.̰̬.̭.̰̦.̗̠.̰̥.̬̠  
⠀⠀.̦̰.̰̤.̩.̰̥.̬̠.̦̰.̰̤.̗̥.̰̥.̬̠.̦̰.̰̤.̗̠.̰̥.̬̠.̦̰.̰̤.̗̟.̰̬
==== BELL SHEETS END ==== */
