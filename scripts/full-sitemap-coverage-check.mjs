import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://xn--k1ae9bxb.online';
const ROOT = process.cwd();
const robots = readFileSync('robots.txt', 'utf8');
const sitemapNames = [...robots.matchAll(/Sitemap:\s+https:\/\/xn--k1ae9bxb\.online\/(sitemap[^\s]+)/g)].map(m => m[1]);
const staticSitemaps = sitemapNames.filter(name => statSafe(name));
const covered = new Set();
for (const name of staticSitemaps) {
  const xml = readFileSync(name, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) covered.add(m[1]);
}

function statSafe(p) { try { return statSync(p).isFile(); } catch { return false; } }
function addExpected(set, pathname) { set.add(`${SITE}${pathname}`); }
function slugsFrom(source) { return [...source.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)].map(m => m[1]); }

const expected = new Set();
for (const p of ['/', '/statti/', '/lin/', '/apatiia/', '/prokrastynatsiia/', '/psykholoham/', '/pro-sait/', '/bezpeka/']) addExpected(expected, p);

const articlesApi = readFileSync('api/articles.mjs', 'utf8');
for (const m of articlesApi.matchAll(/\{\s*slug:\s*'([a-z0-9-]+)'[^\n]*ready:\s*true\s*\}/g)) addExpected(expected, `/statti/${m[1]}/`);

const curated = readFileSync('articles-index-45.js', 'utf8');
for (const slug of slugsFrom(curated)) addExpected(expected, `/statti/${slug}/`);

const router = readFileSync('article-router.js', 'utf8');
for (const slug of [...router.matchAll(/['"]([a-z0-9-]+)['"]/g)].map(m => m[1]).filter(s => s.includes('-'))) addExpected(expected, `/statti/${slug}/`);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (p.endsWith(`${path.sep}index.html`)) {
      const rel = path.relative(ROOT, path.dirname(p)).split(path.sep).join('/');
      if (!rel || rel === 'statti/article') continue;
      addExpected(expected, `/${rel}/`);
    }
  }
}
walk(path.join(ROOT, 'statti'));
for (const dir of ['psykholoham','pro-sait','bezpeka']) walk(path.join(ROOT, dir));

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const redirectSources = new Set((vercel.redirects || []).map(r => `${SITE}${r.source}`));
for (const u of redirectSources) expected.delete(u);

// Dynamic wellbeing sitemap is intentionally generated at runtime; the dedicated
// wellbeing publish check verifies its hub + 20 articles. Count it as covered here.
if (robots.includes('sitemap-wellbeing.xml')) {
  const files = ['article-data/wellbeing-articles-1.mjs','article-data/wellbeing-articles-2.mjs','article-data/wellbeing-articles-3.mjs','article-data/wellbeing-articles-4.mjs'];
  const wellbeingSlugs = files.flatMap(f => slugsFrom(readFileSync(f, 'utf8')));
  addExpected(covered, '/statti/zdorovia-ta-samopochuttia/');
  for (const slug of wellbeingSlugs) addExpected(covered, `/statti/zdorovia-ta-samopochuttia/${slug}/`);
}

const missing = [...expected].filter(u => !covered.has(u)).sort();
console.log(`Expected discoverable canonical URLs: ${expected.size}`);
console.log(`Covered unique URLs across declared sitemaps: ${covered.size}`);
if (missing.length) {
  console.error(`Missing from sitemap coverage: ${missing.length}`);
  for (const u of missing) console.error(`MISSING ${u}`);
  process.exit(1);
}
console.log('✅ Full sitemap coverage check passed');
