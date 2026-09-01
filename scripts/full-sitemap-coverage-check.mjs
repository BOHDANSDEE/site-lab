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
function addUrl(set, pathname) { set.add(`${SITE}${pathname}`); }
function articleSlugs(source) { return [...source.matchAll(/\{\s*slug:\s*['"]([a-z0-9-]+)['"]/g)].map(m => m[1]); }

const expected = new Set();
for (const p of ['/', '/statti/', '/lin/', '/apatiia/', '/prokrastynatsiia/', '/psykholoham/', '/pro-sait/', '/bezpeka/']) addUrl(expected, p);

const articlesApi = readFileSync('api/articles.mjs', 'utf8');
for (const m of articlesApi.matchAll(/\{\s*slug:\s*'([a-z0-9-]+)'[^\n]*ready:\s*true\s*\}/g)) addUrl(expected, `/statti/${m[1]}/`);

const curated = readFileSync('articles-index-45.js', 'utf8');
for (const slug of articleSlugs(curated)) addUrl(expected, `/statti/${slug}/`);

// These 14 legacy articles are still rendered as indexable self-canonical pages by
// the current generic server renderer, but were not present in the curated index.
const legacyPublished = [
  'akademichna-prokrastynatsiia',
  'chomu-pislia-roboty-nichoho-ne-khochetsia',
  'chomu-vse-roblu-v-ostanniu-myt',
  'emotsiine-vyhorannia-symptomy',
  'lin-chy-vyhorannia',
  'lin-u-pidlitkiv',
  'metod-pomodoro',
  'nichna-prokrastynatsiia',
  'prokrastynatsiia-i-perfektsionizm',
  'prokrastynatsiia-i-tryvoha',
  'telefon-korotki-video-i-prokrastynatsiia',
  'yak-dopomohty-liudyni-z-apatiieiu',
  'yak-zmusyty-sebe-prybyraty',
  'yak-zmusyty-sebe-vchytysia'
];
for (const slug of legacyPublished) addUrl(expected, `/statti/${slug}/`);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (p.endsWith(`${path.sep}index.html`)) {
      const rel = path.relative(ROOT, path.dirname(p)).split(path.sep).join('/');
      if (!rel || rel === 'statti/article') continue;
      addUrl(expected, `/${rel}/`);
    }
  }
}
walk(path.join(ROOT, 'statti'));
for (const dir of ['psykholoham','pro-sait','bezpeka']) walk(path.join(ROOT, dir));

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
for (const redirect of vercel.redirects || []) expected.delete(`${SITE}${redirect.source}`);

// Runtime wellbeing sitemap is covered by its dedicated publish check. Add its URLs
// to the coverage set here so this global gate can reason over all declared sitemaps.
if (robots.includes('sitemap-wellbeing.xml')) {
  const files = ['article-data/wellbeing-articles-1.mjs','article-data/wellbeing-articles-2.mjs','article-data/wellbeing-articles-3.mjs','article-data/wellbeing-articles-4.mjs'];
  const wellbeingSlugs = files.flatMap(f => articleSlugs(readFileSync(f, 'utf8')));
  addUrl(covered, '/statti/zdorovia-ta-samopochuttia/');
  for (const slug of wellbeingSlugs) addUrl(covered, `/statti/zdorovia-ta-samopochuttia/${slug}/`);
}

const missing = [...expected].filter(u => !covered.has(u)).sort();
console.log(`Expected discoverable canonical URLs audited: ${expected.size}`);
console.log(`Covered unique URLs across declared sitemaps: ${covered.size}`);
if (missing.length) {
  console.error(`Missing from sitemap coverage: ${missing.length}`);
  for (const u of missing) console.error(`MISSING ${u}`);
  process.exit(1);
}
console.log('✅ Full sitemap coverage check passed');
