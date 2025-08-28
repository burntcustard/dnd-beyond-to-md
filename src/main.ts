import { bookmarklet } from './bookmarklet';

function init() {
  const rawIIFE = `(${bookmarklet.toString()})()`;
  const href = `javascript:${encodeURIComponent(rawIIFE)}`;
  const a = document.getElementById('bm') as HTMLAnchorElement | null;

  if (!a) return;

  a.href = href;
  a.setAttribute('draggable', 'true');
  a.addEventListener('dragstart', (e) => e.dataTransfer?.setData('text/uri-list', href))
}

init();
