import { bookmarklet } from './bookmarklet';

const rawIIFE = `(${bookmarklet.toString().replace(
  /await\s+[\w$]+\([\s\S]*?import\((['"][^'")]+['"])\)[\s\S]*?import\.meta\.url\s*\)/g,
  'await import($1)'
)})()`;

const a = document.getElementById('bookmarklet') as HTMLAnchorElement | null;

if (a) {
  a.href = `javascript:${encodeURIComponent(rawIIFE)}`;
}
