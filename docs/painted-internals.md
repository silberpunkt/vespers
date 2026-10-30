> **A note for this repository.** These notes were written in the workshop where Bela was made, and they name its tools (`easel.js`, `build.js`, `photo.py` and others). Those tools are not in this repository. The grammar they serve is: it lives in [`try-him/yampal.js`](../try-him/yampal.js) and, as a courier copy, at the top of [`vespers.js`](../vespers.js).

# Painted internals

### Notes for local Claudes

THE⠀ROOMS  
http  
├─⠀tl⠀──⠀readme⠀──⠀lets⠀YOWL⠀⠀⠀⠀⠀⠀yampal.js⠀·⠀the⠀essential⠀note  
├─⠀entile  
│⠀⠀├─⠀yowl.yamls⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀the⠀decks⠀·⠀the⠀palette  
│⠀⠀├─⠀philinguity-color.html⠀⠀⠀⠀⠀⠀the⠀editor  
│⠀⠀└─⠀vespers⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Bela⠀·⠀painted⠀·⠀big-board⠀·⠀hands  
└─⠀hugos⠀karawane⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀the⠀rooms⠀of⠀the⠀caravan  
·⠀every⠀folder⠀name⠀begins⠀with⠀two⠀low⠀lines  
⠀⠀..̩.̰̩.̠.̰̤.̩.̰̤.̠.̰̤.̩.̰̬.̠.̰̤.̩.̰̮.̣.̰̰.̭.̣.̰̰.̰̮.̠.̰̤.̩.̰̬.̠.̰̥.̩.̰̰.̰̤.̣.̰̮.̭.̣.̰̰.̰̤.̠.̰̥.̩.̰̰.̰̰.̰̬.̣.̰̰.̠.̰̥.̩.̰̭.̗̠.̰̦.̭.̣.̰̭.̭.̣.̰̰.̭.̣.̰̩.̠.̰̤.̩.̰̰.̰̩.̣.̰̰.̰̰.̰̦.̗̟.̭.̰̰.̰̰.̰̰.̰̰.̰̦

This is the local half. The general half, with the grammar and the method,
is "painted chat - how to compose colorburst-shadow unicode art", beside
this file. Read that one first. This one says where things are kept on
user1's machine, who paints, and what the customs are.

Written by Odilon, 4 October 2026. Where a thing was not seen, it says so.

---

## 1. The authority

Two files, and only these, define the grammar:

- `__tl\__readme\lets YOWL\yampal.js`
  "the colorburst grammar, and the only copy of it." `decode`, `encode`,
  `pack`. It carries no palette; the palette is passed in.
- `__tl\__readme\lets YOWL\YOWL - the essential note (format + how-to).md`
  The whole format. Section 6 is the colorburst, 6b the high half, 8 is
  "being right on the nose".

Its law: the file is the only authority on its own colours, and a reader
that cannot read a mark must say which mark.

There are two courier copies, each named as such and each answerable to
`yampal.js`: the decoder inside Bela, and the reference encoder and
decoder printed in the general article, which `build.js` runs against
`yampal.js` at every build. If you find yourself writing a third, stop and
load `yampal.js` instead. I wrote one into `big-board\board.js`, read the
first line of `yampal.js`, and took mine out.

SKYPAL is the layer over it: `__entile\__vespers\painted\skypal.js`. user1
named it. It writes marks ABOVE the period, where yampal does not look, and
never touches `yampal.js`. Its test (`skypal.test.js`, 44 checks) holds it
to three promises: classic yampal reads the same colours under any sky;
clearing the sky returns the very shadow; and Bela's own reading of the
sky agrees with it. Bela carries courier copies, `skyWords` and
`skyBacks`. If you add a word to the sky, add it in `skypal.js` first, then
in Bela, then in section 10 of the general article, and let the test hold
all three together.

THE PACKED SHADOW is section 12 of the general article. Its author's tool
is `__entile\__vespers\painted\packed.js`, with `packed.ps1` for the one
errand QuickJS cannot run (it has no deflate). Bela reads it with
`packLine`, `holdsPacked`, `inflate` and `unpack`, opens it in `shadowRun`,
and from there it is a classic shadow. `packed.test.js` holds his inflater
to every photograph's statements. It carries no sky yet: if you give it
one, the place is a second flag bit in byte 0, and section 12 first.

## 2. The palette

YAM-PAL, 32 slots, lives at the top of a deck:
`__entile\yowl.yamls\v0\the-karawane_yowl.yaml`, under `palette:`.
Position is the format; never reorder it. Bela carries a copy and says so;
`window.BLINKEN_PALETTE`, set before pasting, gives him another table.

## 3. The reader: Bela

`__entile\__vespers\vespers.js`, pasted whole into the app's console. His
note is `vespers - a note.md`, beside him. For painting, what matters:

- He paints through the CSS Custom Highlight API. No spans; the page is not
  edited; a copy is still plain text.
- He draws a pole-stripe beside a message that holds art and shadow. The
  colours come when the chirp `(  )` is pressed, and only for what is in
  view. Press again after scrolling or after the app redraws.
- He looks up sixteen lines from the shadow for the art.
- The headline is the line in capitals directly on the art; of three lines
  at most, the nearest one in capitals.
- He cannot enter the Code tab's code blocks.
- Block elements and Braille dots are paint, not ink: courtesy leaves
  them as written. With `window.BELA_SOLID = 1` he rebuilds each such
  cell's meant colour from its glyph and its hue and lays it flat.
  Pictures made "by luma" are in `painted\photographs\`; `photo.py`
  makes them. Flat painting is not seen live.
- From 4 October a painted picture's shadow is faded to dust, about an
  eighth solid. `window.BELA_DUST = 1` before pasting leaves shadows as
  written. A shadow whose art was not found is never faded. Not seen.
- From 4 October he is courteous: a colour that does not stand off its
  ground by 3 has its lightness moved until it does, hue kept.
  `window.BELA_COURTESY = 0` before pasting turns it off.
  The lightness is moved in OKLCH, so hue and vividness hold.
  `painted\courtesy.test.js`, 17 checks. Not seen live.
- From 4 October he reads a shadow broken over several lines: shadow
  lines standing one directly on the next are joined, and the art is
  looked for above the first. `shadowRun` in `vespers.js`. A Bela pasted
  before that day reads each line as its own shadow and finds no art;
  paste him again. `painted\broken-shadow.test.js`, 15 checks.
- `__belaWhy()` in the console says whether art was found and what the
  count was. Ask user1 to run it when a painting stays plain.
- STUCCO is his default (`BELA_SOLID` 1): each paint cell a ground, with
  its glyph's ink a little brighter on it. 0 is plain dots, 2 perfectly
  flat. user1 saw two faces in nine rows in stucco and in no other way.
- He reads the sky: TURN (a picture's own palette cycling), GROUND and
  BACK. A click on a turning picture stills it. `__belaCycle([slots], ms)`
  still turns the whole table by hand.
- His settings are window variables set before pasting: `BELA_SOLID`,
  `BELA_HINT`, `BELA_DUST`, `BELA_COURTESY`, `BLINKEN_PALETTE`. user1 would
  rather not use the console (it slows his browser); a menu on Bela's green
  light is wanted and not built.
- THE SHIMMER is on by default at half the honest band (`BELA_RIFFLE`
  0.5; 0 for none). It was a brightness riffle for one evening; user1
  called that "lightning" and asked for the characters to shimmer
  instead. `__belaShimmer(k)` holds every picture at k for a photograph.
- THE CORNER (`BELA_CORNER` 0 to leave it off) lives in `#bk-corners`,
  placed at every chirp and on resize, by the last painted range's rect.
- A CHIRP is a pass of `paintView`: Bela reads what is on screen and
  paints it. His ( ) button is one; Beladrome makes one when a scroll
  comes to rest; a page may call `__belaPaint(true)` for the whole page.
- His face is user1's to rule, whisker by whisker: eyes upright and never
  turning, amber at work, one quick blink. Do not restyle it unasked.

## 4. The editor: Philinguity

`__entile\philinguity-color.html`. The deluxe authoring path for decks,
and the origin of the positional rule: its `toBurst` spends one slot per
inked cell and none on blanks. Bela once counted every cell and found no
art in any painting with a gap; he was corrected to match. It is user1's
code. Read it; do not change it unless asked.

## 5. The tools in this room

All in `__entile\__vespers\`:

- `painted\build.js` paints every picture in both articles, checks each
  with Bela's decoder, and sets them into the sources. Run from its
  folder: `qjs --std build.js`. To add a picture, add a block that makes
  a Canvas and calls `picture(name, ...)`, and put `{{picture name}}` on a
  line of its own in a source.
- `painted\painted chat.src.md`, `painted\painted internals.src.md`: the
  sources. Edit these, not the built articles.
- `painted\easel.js` makes one picture for a reply, checked and ready
  to paste: `qjs --std easel.js tree.sketch.js`. It borrows its tools
  from `build.js`. Use it to illustrate replies; user1 asked for that.
- `painted\faces.js` opens font files and says which set our three
  ranges at one width: `qjs --std faces.js C:\Windows\Fonts\consola.ttf`.
  On this machine Iosevka (user fonts) and Cascadia (system) are fit;
  DejaVu Sans Mono lacks Braille; Consolas has only the DOS blocks.
- `painted\png.js`, `luma.js`, `photo.js`: a PNG cut into cells by
  QuickJS alone (they replaced `photo.py`). `luma.js` is the one ladder; a
  page can load it. Grades: fine (dots, eighths) and `safe` (DOS set).
- `painted\skypal.js`: the sky over yampal. Words above the period;
  the first is TURN. `skypal.test.js`, 22 checks.
- `painted\bela-page\`: BELADROME, the stand-in page for Bela's
  painter. `python make.py`, then `bash ..\..\hands\hands.sh
  painter.steps.txt`. Run it around any change to the painter.
- `big-board\board.js` and `facts.ps1`: SPACE INFLATORS by TAIPO.
  PowerShell gathers the facts, QuickJS draws the board.
- `hands\`: a real mouse in a headless LibreWolf, for looking at pages.
  Not needed for painting.

## 5b. Beladrome

`painted\bela-page\painter.test.html`, named by user1. A stand-in chat
page that hangs Bela, chirps three times, turns the table, and writes its
checks into itself. At its head: dots, stucco, flat; night, day; wind.

    python make.py                              builds the page
    bash ..\..\hands\hands.sh painter.steps.txt     drives it six ways

Eight pictures, 18 checks. It needs a tall window (`size 1000 2600`) so
every picture is in view. It carries Cascadia Mono beside it so that any
browser shows it in a face that holds its columns. **Run it before and
after any change to Bela's painter.** Two faults reached user1 before it
existed, and none of that kind since.

The hands' browser is silent on purpose. It once pressed Play on the bench
and sang through user1's speakers.

## 6. Customs

- **QuickJS, not Node.** `qjs` is on the PATH. user1: "You will not Node on
  this machine unless there is no alternative."
- **Ask before running anything new** on his machine. A capability is not a
  permission.
- **His code and his volumes are read-only** unless he asks.
- **No regular expressions in code written for him**: "use actual
  procedures."
- **Never use the Write or Edit tool on an `.html` file** in the desktop
  app; it opens a pane and takes his keyboard. Use the shell.
- **Prose to 78 columns, code blocks to 52.**
- **In QuickJS, open files to write with 'wb'.** With 'w' it writes two
  characters at every line end, and a read-patch-write adds one each time.
  See `__tl\__readme\QuickJS as a systems language`.
- **Links and paths.** Give the full path in plain text beside any link.
- **No tables of the app's kind in a reply to him;** a table typed as plain
  text in a code block is welcome.
- **Look before you say a thing looks right.** Say what was seen and what
  was not.

## 7. What has been seen, and what has not

Seen painted, live, by user1:

- glyph mode, 68 columns by 14 rows, 45 periods: the big board
- glyph mode, small: the butterfly
- positional, small: a single word; and his own POOH-BAH card
- a word sent back by a model coming up in its colour
- MUNSELLS TREE, 4 October, sent in a reply and painted where it stood
  in the chat as well as in the card ("positional, 82 cells"): 4-4-4
  gradients, a shadow broken over two lines, the two-blank indent, and
  courtesy lifting the dark foot of the trunk. So large positional
  pictures in a sent message, broken shadows, and courtesy are all seen.
- positional, large: SPACE INFLATORS, 46 by 13, 123 cells, with one true
  colour (the aquamarine star). Seen 4 October in Bela's card over the
  bluebox, from user1's paste of the built article: "positional, 123
  cells", every colour right. That is the preview glass; the same picture
  standing in the chat itself was not shown painted in that screenshot.
- widecolor, all three kinds: WIDECOLOR, "positional, 96 cells", 180
  periods. Seen the same day in the same card: the 2-2-2 row in coarse
  steps, the 4-4-4 and 8-8-8 rows smooth. Runs after a widecolor are in
  that picture (the 2-2-2 row), so they are seen too.

Checked by Bela's decoder under QuickJS, but not yet seen through a chat:

- the other six pictures of the general article
- any large positional picture standing in a sent message, as against
  the card over the bluebox

- a shadow broken over lines. `build.js` now trims every shadow at 78
  columns, so the long ones in the general article are broken; Bela's
  joining is checked under QuickJS only

- A MADE SUNSET FIVE, 4 October: solid blocks in 4-4-4, 130 cells, 140
  periods copied into a reply by hand, painted where it stood. Dark
  pixels stayed dark (paint is not ink) and the shadow under it was
  faded to dust, nearly invisible. Both seen.

- A SEA THAT TURNS, 4 October: `__belaCycle([6, 5, 3, 2], 150)` in the
  console set four palette slots turning, and the sea moved. Seen with
  cells laid flat (`BELA_SOLID`), which also showed that a flat ground
  leaves a dark gap between rows. Cycling is a trial by hand; the
  grammar has no word for it.
- Pictures "by luma" (Braille, shades, eighths in the glyph; hue in the
  shadow) pasted from `painted\photographs\` and seen in the cards.

- 5 October: THE FORD and SUNSET BY FINE LUMA, 78 columns wide, with
  `BELA_SOLID = 1`: each cell a ground with its glyph's ink a little
  brighter upon it. user1: "a grid stucco mural ... so balanced." Seen
  in the cards. The largest shadows yet pasted: four lines.

Not seen: the cards turning; the stippled (not flat) sea turning; a
sweep on arrival, which is not built. The table fix half works: the
drag is refused, but the app's own popup still takes the selection.

The painter itself has no stand-in page and no checks. Two faults
reached user1 on 4 October because of that. Build one before changing
`paintHost`, `unpaint` or the highlight registry again; `hands\` can
drive it.

A trial apart from the grammar, 4 October: periods carrying three, four
and eight marks (`painted\stripe.js`). A Claude wrote three such stripes
into a reply; user1 copied them out and pasted them back; all three came
back identical to the byte and decoded to their sentences. He reports
they stay visible and overlap the line below. So a deeper stack survives
model, chat, copy and paste in the Code tab. `yampal.js` still allows one
or two marks only; nothing has been added to it.

Not tried at all: claude.ai's own chat, outside the Code tab.

When you send one of these for the first time, say that it is the first
time, and ask what was seen.
