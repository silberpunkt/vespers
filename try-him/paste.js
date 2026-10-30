/* paste.js -- Beladrome's pastebox. user1, 28 x 2026:
     "I'd love to have a pasteable area in the beladrome to test him
      on arbitrary hunks of text."

   Paste any hunk (a picture with its shadow, Bell in threes, plain
   prose, or all of them) and set it into the page as a message, in
   either of the two shapes the app writes:

     as yours    one div.whitespace-pre-wrap inside
                 [data-testid="user-message"], lines parted by
                 newlines (a message of user1's in Chat)
     as a reply  a <p> whose lines are parted by <br> (a reply, or
                 a message in the Code tab)

   The message goes to the head of the feed, replacing the last one
   pasted, and Bela is asked to chirp. Select any of it and press his
   Play to hear it. Ctrl+Enter in the box sets it as yours.
   The box keeps its text between visits. */
(function () {
  'use strict';
  var NL = String.fromCharCode(10);
  var box = document.getElementById('paste-box'), say = document.getElementById('paste-say');
  if (!box) return;
  try { box.value = localStorage.getItem('beladrome paste') || ''; } catch (e) {}
  box.addEventListener('input', function () { try { localStorage.setItem('beladrome paste', box.value); } catch (e) {} });
  function tell(s) { say.textContent = s; }
  function set(shape) {
    var text = box.value.split(String.fromCharCode(13)).join('');
    while (text.charAt(text.length - 1) === NL) text = text.slice(0, -1);
    if (!text) { tell('nothing to set: paste a hunk first'); return; }
    var feed = document.querySelector('[role="feed"]'), old = document.getElementById('pasted');
    if (old) old.remove();
    var div = document.createElement('div'); div.className = 'msg'; div.id = 'pasted';
    if (shape === 'yours') {
      var um = document.createElement('div'), body = document.createElement('div');
      um.setAttribute('data-testid', 'user-message');
      body.className = 'whitespace-pre-wrap'; body.style.whiteSpace = 'pre-wrap';
      body.appendChild(document.createTextNode(text));
      um.appendChild(body); div.appendChild(um);
    } else {
      var p = document.createElement('p');
      text.split(NL).forEach(function (l, i) { if (i) p.appendChild(document.createElement('br')); p.appendChild(document.createTextNode(l)); });
      div.appendChild(p);
    }
    feed.insertBefore(div, feed.firstChild);
    var n = -1;
    try { n = window.__belaPaint(true); } catch (e) { tell('set as ' + shape + ' · Bela would not chirp: ' + e); return; }
    tell('set as ' + shape + ', ' + text.split(NL).length + ' lines · Bela painted ' + n + (n === 1 ? ' picture' : ' pictures') + ' on the page');
    div.scrollIntoView({ block: 'start' });
  }
  document.getElementById('paste-yours').onclick = function (e) { e.preventDefault(); set('yours'); };
  document.getElementById('paste-reply').onclick = function (e) { e.preventDefault(); set('a reply'); };
  document.getElementById('paste-clear').onclick = function (e) {
    e.preventDefault(); box.value = ''; try { localStorage.removeItem('beladrome paste'); } catch (e2) {}
    var old = document.getElementById('pasted'); if (old) old.remove(); tell('cleared');
  };
  box.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); set('yours'); } });
  window.__dromePaste = function (text, shape) { box.value = text; set(shape || 'yours'); };   // for the hands
})();
