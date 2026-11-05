# Building a console widget for a chat page

Bela is one JavaScript file you paste into the developer console of the Claude desktop app. This guide is about the *kind* of thing he is, so you can build one of your own: a widget that clips onto a running chat page, does something delightful, and comes off cleanly.

It's written for three readers at once. If you're new to this, the **plain words** at the top of each part are enough. If you write code, the **sketch** shows the pattern. If you've built these before, the **in Bela** note says where to find the real thing in [`vespers.js`](../vespers.js).

---

## 0. Where it lives

The desktop app draws its chats with a web page, the same stuff as any website. The developer console runs JavaScript *in that page*. Anything you paste there can see the page, add to it and listen to it, until the page reloads. Then it's gone.

That gives a console widget its character:

- **It can:** read what's on screen, draw its own elements, colour text, play sound, and react as new messages arrive.
- **It can't:** reach your files, your other apps or your account settings. Unless you write code that calls the network, it doesn't reach the network either.
- **It answers to you:** it runs only while you keep it, and a reload is always the off switch.

Keep those three lines true and people can trust what you hand them.

## 1. One file, one function

**Plain words:** everything comes in one paste, wrapped so it doesn't spill into the page.

```js
(function () {
  'use strict';
  // all of your widget lives in here
})();
```

Nothing leaks into the page's own variables. The one exception is what you deliberately hang on `window` (see part 2).

**In Bela:** the whole file is one such function. His parts (the voice, the films, the Bell sheets) are written as separate source files and *folded* into it by a build script, so people still paste just one thing.

## 2. Paste twice, get one

**Plain words:** if someone pastes the widget again (they will), the old copy steps down first.

```js
if (window.__myWidgetStop) window.__myWidgetStop();
```

**In Bela:** line 653, `if (window.__blinkenStop) window.__blinkenStop();`.

## 3. One handle that undoes everything

**Plain words:** one command takes it all away: every box, every listener, every timer, every colour.

Keep a list of everything you start, and make one function that ends it all:

```js
var undo = [];
function listen(target, type, fn, opts) {
  target.addEventListener(type, fn, opts);
  undo.push(function () { target.removeEventListener(type, fn, opts); });
}
function every(ms, fn) { var t = setInterval(fn, ms); undo.push(function () { clearInterval(t); }); }

window.__myWidgetStop = function () {
  while (undo.length) { try { undo.pop()(); } catch (e) {} }
  delete window.__myWidgetStop;
};
```

Tell people the command's name in the console when the widget starts, and again in your README.

**In Bela:** `window.__blinkenStop`, around line 5130. Listeners are added by name, so the stop can find them all again (see the note at line 2762).

## 4. Know the page by name, in one place

**Plain words:** the widget finds things on the page by the names the page gives them. Keep those names together, so when the app changes there's one place to fix.

```js
var PAGE = {
  composer: '[data-testid="chat-input"], [data-testid="code-prompt-input"]',
  send:     '[data-testid="chat-input-send"], [data-testid="code-prompt-send"]',
  blocks:   'p, li, blockquote, pre, [data-testid="user-message"] .whitespace-pre-wrap'
};
```

Prefer `data-testid` attributes and plain element names over generated class names like `.css-1x9ab`, which change with every build. When something isn't found, say so out loud instead of guessing. Bela once guessed the Send button from the whole page and found "Send feedback".

Give people a "why" command that reports what the widget saw:

```js
window.__myWidgetWhy = function () {
  return Object.keys(PAGE).map(function (k) {
    return k + ': ' + document.querySelectorAll(PAGE[k]).length + ' found';
  }).join('\n');
};
```

**In Bela:** the test ids are listed in the README; `PAINTS` is at line 1729; `__belaWhy()` reports block by block.

## 5. Watch, don't poll

**Plain words:** the widget notices new messages as they arrive instead of checking every second, and it waits for the page to settle before it acts.

```js
var mo = new MutationObserver(function () {
  clearTimeout(mo._t);
  mo._t = setTimeout(sweep, 500);   // half a second after the last change
});
mo.observe(document.body, { childList: true, subtree: true, characterData: true });
undo.push(function () { mo.disconnect(); });
```

Replies stream in a word at a time. Without the wait you'd redo your work hundreds of times per answer.

**In Bela:** line 869. The VU meter shows his appetite: one paragraph per meal, then rest.

## 6. Paint, don't edit

**Plain words:** the widget colours the text *over* the page, like a gel on a stage light, instead of rewriting it. The words stay exactly as they were, and copying the text still copies plain text.

The CSS Custom Highlight API does this. You make ranges over the text, put them in a named `Highlight`, and style that name:

```js
var hl = new Highlight();
CSS.highlights.set('my-gold', hl);
var style = document.createElement('style');
style.textContent = '::highlight(my-gold) { color: #ffd23f; }';
document.head.appendChild(style);
undo.push(function () { CSS.highlights.delete('my-gold'); style.remove(); });

function goldWord(textNode, start, end) {
  var r = new Range();
  r.setStart(textNode, start); r.setEnd(textNode, end);
  hl.add(r);
}
```

Only colours and decorations are allowed in `::highlight()`, not sizes or positions. That limit is a good thing: it keeps you from breaking the page's layout.

When you *must* change the page's own elements, do it as little as you can, keep a record of each change, and undo every one in your stop.

**In Bela:** `hlFor()` near line 1530 makes one highlight per colour. The single edit he allows himself, the jam (one wrapping span to close up a shadow's line spacing), keeps a record of each wrap and unwraps it on the way out.

## 7. Eat in meals

**Plain words:** on a long chat, the widget works through it a bit at a time, so the page never freezes.

```js
function inMeals(items, eat) {
  var i = 0;
  (function meal() {
    var until = performance.now() + 8;               // about half a frame
    while (i < items.length && performance.now() < until) eat(items[i++]);
    if (i < items.length) setTimeout(meal, 0);
  })();
}
```

**In Bela:** the painter and the VU both work in meals, and his gauges (Lag, Heap, Nodes, Ranges) show the cost while it happens.

## 8. Keep to the page

**Plain words:** nothing leaves the page. What the widget remembers stays in this browser, under its own labelled drawer.

- No `fetch`, XHR, WebSocket or beacon. A reader can check that with a single search through your file, so make it true and say so.
- Settings go in `localStorage` under one prefix, wrapped in `try`, because storage can be full or switched off:

```js
function keep(k, v) { try { localStorage.setItem('mywidget-' + k, JSON.stringify(v)); } catch (e) {} }
function recall(k, d) { try { var v = localStorage.getItem('mywidget-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
```

**In Bela:** every key starts with `blinken-`. The README lists what he keeps.

## 9. Act through the app's own controls, and only when asked

**Plain words:** if the widget sends a message, it uses the app's own Send button, and only when you press a key that means "send".

Fill the app's own composer and click its own Send. Don't invent your own way of talking to a server. Afterwards, check that the send worked: if the composer didn't empty, keep the draft and say so.

**In Bela:** the bluebox sends on Enter through `chat-input-send` or `code-prompt-send`. He says "sent" only once the composer has emptied.

## 10. Test on a page of your own

**Plain words:** build a pretend chat page and try the widget there, where nothing real can go wrong.

Copy the *shape* of the real page: the same `data-testid` names, the same nesting for a message. Then load your widget on it and run a list of checks, each one a name and a pass or fail:

```js
function t(name, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + name); }
t('the widget hung', typeof window.__myWidgetStop === 'function');
t('plain prose is left alone', document.querySelector('p.plain').textContent === 'A line of plain prose.');
```

**In Bela:** [the Beladrome](https://silberpunkt.github.io/vespers/try-him/) is exactly this. It runs its checks at load and prints them at the foot of the page. That's also why it doubles as the demo.

## 11. Hand it over

**Plain words:** one file, a picture, four steps, and the off switch.

A good README for a console widget says, near the top:

1. what it does, in one line, with one picture;
2. where to try it without installing anything, if you can offer that;
3. how to paste it, and that the console may ask you to type `allow pasting` (it's protecting people from strangers' code, which is a good thing);
4. how to remove it;
5. what it reads, keeps, sends and changes, and what in the app it depends on.

The last point matters most. It's how a casual reader knows it's safe, a developer knows where it lives, and an expert knows why it works.

---

*Make it delightful. Make it leave no mess. Hand it ever forward.*
