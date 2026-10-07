// Pack the web export (dist/) into ONE self-contained HTML file that opens by
// double-click (file://), offline, with no server.
//
//   npm run export:html   →   dist-html/cu-chi-stories.html
//
// Three things make that work:
//  1. Images are inlined as data: URIs.
//  2. The JS bundle is inlined into the page.
//  3. Routing runs on the URL hash (#/map, #/chapter/…). Browsers refuse
//     history.pushState('/map') on file:// pages, so the bundle's reads of
//     window.location are pointed at a "virtual location" derived from the
//     hash, and pushState/replaceState are wrapped to write '#/path'.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const outDir = path.join(root, 'dist-html');
const outFile = path.join(outDir, 'cu-chi-stories.html');

const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(path.join(dist, 'index.html'))) fail('dist/index.html not found — run `npx expo export -p web` first.');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const entryMatch = html.match(/<script src="([^"]+entry-[^"]+\.js)" defer><\/script>/);
if (!entryMatch) fail('Could not find the entry <script> in dist/index.html.');
let js = fs.readFileSync(path.join(dist, entryMatch[1]), 'utf8');

// 1) Inline every bundled asset ("/assets/…") as a data: URI.
const mime = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
};
let assets = 0;
js = js.replace(/"(\/assets\/[^"]+)"/g, (whole, url) => {
  const file = path.join(dist, decodeURIComponent(url));
  const type = mime[path.extname(file).toLowerCase()];
  if (!type || !fs.existsSync(file)) return whole;
  assets++;
  return `"data:${type};base64,${fs.readFileSync(file).toString('base64')}"`;
});

// 2) Point the bundle's location reads at the virtual, hash-based location.
const patches = [
  [/\bwindow\.location\b/g, 'window.__vloc'],
  [/\{location:(\w+)\}=window/g, '{__vloc:$1}=window'],
  [/(?<![\w$.])location\.(pathname|search|hash|href|origin|protocol|host|hostname)\b/g, '__vloc.$1'],
];
for (const [re, to] of patches) {
  const n = (js.match(re) || []).length;
  if (!n) fail(`Router patch did not match: ${re} — the Expo Router version may have changed.`);
  js = js.replace(re, to);
}
if (/(?<![\w$.])location\.(pathname|search|hash)\b/.test(js)) fail('Unpatched location reads remain in the bundle.');

// Keep the inline script from closing early.
js = js.replace(/<\/script/gi, '<\\/script');

const shim = `
(function () {
  var real = window.location;
  var ORIGIN = 'http://localhost';
  // Current in-app path: everything after '#', e.g. "/chapter/nap-ham?x=1".
  function vpath() { var h = real.hash.slice(1); return h.charAt(0) === '/' ? h : '/'; }
  function part(re) { var m = vpath().match(re); return m ? m[0] : ''; }
  function toHash(u) {
    if (u == null) return u;
    u = String(u);
    if (u.indexOf(ORIGIN) === 0) u = u.slice(ORIGIN.length) || '/';
    if (u.charAt(0) === '/') return '#' + u;
    if (u.charAt(0) === '#') return '#' + vpath().split('#')[0] + u;
    return u;
  }
  var vloc = {
    get pathname() { return vpath().split(/[?#]/)[0]; },
    get search() { return part(/\\?[^#]*/); },
    get hash() { var p = vpath(), i = p.indexOf('#'); return i < 0 ? '' : p.slice(i); },
    get href() { return ORIGIN + vpath(); },
    set href(u) { real.hash = toHash(u); },
    origin: ORIGIN, protocol: 'http:', host: 'localhost', hostname: 'localhost', port: '',
    assign: function (u) { real.hash = toHash(u); },
    replace: function (u) { history.replaceState(history.state, '', u); window.dispatchEvent(new PopStateEvent('popstate')); },
    reload: function () { real.reload(); },
    toString: function () { return this.href; }
  };
  Object.defineProperty(window, '__vloc', { get: function () { return vloc; }, set: function (u) { vloc.assign(u); } });
  var push = history.pushState.bind(history), rep = history.replaceState.bind(history);
  history.pushState = function (s, t, u) { return push(s, t, toHash(u)); };
  history.replaceState = function (s, t, u) { return rep(s, t, toHash(u)); };
})();`;

html = html
  .replace('<html lang="en">', '<html lang="vi">')
  .replace(/<meta httpEquiv[^>]*>\s*/, '')
  .replace(/<link rel="icon"[^>]*>/, '')
  .replace('</head>', `<script>${shim}</script>\n</head>`)
  .replace(entryMatch[0], () => `<script>${js}</script>`);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html);
const mb = (fs.statSync(outFile).size / 1024 / 1024).toFixed(1);
console.log(`✔ ${path.relative(root, outFile)} (${mb} MB, ${assets} images inlined)`);
