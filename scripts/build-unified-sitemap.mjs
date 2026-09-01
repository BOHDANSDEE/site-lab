import { readFileSync } from 'node:fs';

const SITE = 'https://xn--k1ae9bxb.online';
const SOURCE_SITEMAPS = [
  'sitemap.xml',
  'sitemap-loss-interest.xml',
  'sitemap-happiness.xml',
  'sitemap-heavy-emotions.xml',
  'sitemap-pressure.xml',
  'sitemap-focus.xml',
  'sitemap-change-self.xml',
  'sitemap-missing.xml'
];
const WELLBEING_FILES = [
  'article-data/wellbeing-articles-1.mjs',
  'article-data/wellbeing-articles-2.mjs',
  'article-data/wellbeing-articles-3.mjs',
  'article-data/wellbeing-articles-4.mjs'
];

function locsFromXml(file) {
  const xml = readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}

function slugsFrom(file) {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)].map(m => m[1]);
}

const urls = new Set();
for (const file of SOURCE_SITEMAPS) {
  for (const url of locsFromXml(file)) urls.add(url);
}
urls.add(`${SITE}/statti/zdorovia-ta-samopochuttia/`);
for (const file of WELLBEING_FILES) {
  for (const slug of slugsFrom(file)) {
    urls.add(`${SITE}/statti/zdorovia-ta-samopochuttia/${slug}/`);
  }
}

const ordered = [...urls].sort((a, b) => {
  if (a === `${SITE}/`) return -1;
  if (b === `${SITE}/`) return 1;
  return a.localeCompare(b, 'en');
});

if (ordered.length !== 259) {
  console.error(`Expected 259 unique canonical URLs, found ${ordered.length}`);
  process.exit(1);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ordered.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;

if (process.argv.includes('--print')) {
  process.stdout.write(xml);
} else if (process.argv.includes('--check')) {
  const current = readFileSync('sitemap.xml', 'utf8');
  const currentLocs = [...current.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const currentSet = new Set(currentLocs);
  const missing = ordered.filter(url => !currentSet.has(url));
  const extra = [...currentSet].filter(url => !urls.has(url));
  const duplicateCount = currentLocs.length - currentSet.size;
  console.log(`Unified sitemap expected URLs: ${ordered.length}`);
  console.log(`Root sitemap unique URLs: ${currentSet.size}`);
  if (missing.length || extra.length || duplicateCount) {
    if (missing.length) console.error(`Missing in root sitemap: ${missing.join(', ')}`);
    if (extra.length) console.error(`Unexpected in root sitemap: ${extra.join(', ')}`);
    if (duplicateCount) console.error(`Duplicate root sitemap entries: ${duplicateCount}`);
    process.exit(1);
  }
  console.log('✅ Root sitemap is the complete 259-URL source of truth');
} else {
  console.log(`Unified sitemap unique URLs: ${ordered.length}`);
}
