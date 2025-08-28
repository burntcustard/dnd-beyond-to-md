import './styles.css';
import { bookmarkletMain } from './parser';

// Build a robust single-string bookmarklet (no external deps, mirrors parser/index logic)
function buildBookmarkletHref(): { href: string; hrefPlain: string; source: string } {
  // Convert the TS function into a javascript: payload. We call it immediately.
  const raw = `(${bookmarkletMain.toString()})()`;
  const hrefPlain = `javascript:${raw}`;
  const href = `javascript:${encodeURIComponent(raw)}`;
  return { href, hrefPlain, source: raw };
}

function init() {
  const { href, hrefPlain } = buildBookmarkletHref();
  const a = document.getElementById('bm') as HTMLAnchorElement | null;
  if (a) {
    a.href = href;
    a.setAttribute('draggable', 'true');
    a.addEventListener('dragstart', (e) => {
      if (!e.dataTransfer) return;
      // Ensure the bookmark stores the javascript: URL (encoded to preserve newlines)
      e.dataTransfer.setData('text/uri-list', href);
      e.dataTransfer.setData('text/plain', href);
    });
  }
  const pre = document.getElementById('bm-src');
  if (pre) pre.textContent = hrefPlain;

  const copyBtn = document.getElementById('copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(hrefPlain);
  (copyBtn as HTMLButtonElement).textContent = 'Copied!';
  setTimeout(() => { (copyBtn as HTMLButtonElement).textContent = 'Copy URL'; }, 1200);
      } catch {
        alert('Copy failed. Select and copy the URL above.');
      }
    });
  }
}

init();
