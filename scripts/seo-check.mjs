import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';
import linExperimentHandler from '../api/lin-experiment.mjs';
import { LIN_ARTICLES } from '../api/lin-experiment-data.mjs';

const SITE = 'https://xn--k1ae9bxb.online';
const EXPECTED = {
  lin: ['lin', 'motyvatsiia', 'dystsyplina', 'krashche-zhyttia'],
  prokrastynatsiia: ['yak-nareshti-pochaty', 'tysk-na-sebe', 'shchaslyve-zhyttia', 'yak-zminyty-svoi-zvychky'],
  apatiia: ['vtrata-interesu', 'vysnazhennia-i-perevantazhennia', 'povernennia-pislia-zavysannia', 'viddalennia-vid-liudei-i-zhyttia']
};
const ALL = Object.values(EXPECTED).flat();

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = new Map();
    this.body = '';
  }
  status(code) { this.statusCode = code; return this; }
  setHeader(name, value) { this.headers.set(String(name).toLowerCase(), String(value)); return this; }
  send(body) { this.body = String(body); return this; }
}

function render(handler, query = {}) {
  const response = new MockResponse();
  handler({ query }, response);
  return response;
}

function articleLinks(html) {
  return [...html.matchAll(/class="article-card"[^>]*href="\/statti\/([^"\/]+)\/"/g)].map((match) => match[1]);
}

function sitemapLocs(xml) {
  return new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
}

const library = render(libraryHandler);
assert.equal(library.statusCode, 200, 'article library must render');
assert.ok(library.body.includes('<h1>Оберіть розділ</h1>'), 'article library must start with category choice');
assert.equal(articleLinks(library.body).length, 0, 'top-level library must not dump article cards');

for (const category of Object.keys(EXPECTED)) {
  assert.ok(library.body.includes(`href="/${category}/"`), `article library must link to ${category}`);
}

const discovered = [];
for (const [category, expected] of Object.entries(EXPECTED)) {
  const response = render(libraryHandler, { category });
  assert.equal(response.statusCode, 200, `${category}: category must render`);
  const links = articleLinks(response.body);
  assert.equal(links.length, 4, `${category}: must expose exactly four topics`);
  assert.deepEqual(new Set(links), new Set(expected), `${category}: wrong topic slugs`);
  discovered.push(...links);
}

assert.equal(discovered.length, 12, 'three categories must expose exactly 12 topics total');
assert.equal(new Set(discovered).size, 12, 'all 12 topic links must be unique');
assert.deepEqual(new Set(discovered), new Set(ALL), 'category flow must expose the approved 12 topics');

for (const slug of ALL) {
  const response = render(articleHandler, { slug });
  assert.equal(response.statusCode, 200, `${slug}: topic canvas must render`);
  assert.ok(response.body.includes(`${SITE}/statti/${slug}/`), `${slug}: canonical URL is missing`);
  assert.ok(/name="robots" content="noindex,follow"/i.test(response.body), `${slug}: blank canvas must stay noindex`);
  assert.ok(response.body.includes('class="article-canvas"'), `${slug}: blank article canvas is missing`);
}

const linCatalog = render(linExperimentHandler, { view: 'catalog' });
assert.equal(linCatalog.statusCode, 200, 'lin manual catalog must render');
assert.ok(linCatalog.body.includes(`${SITE}/statti/lin-vybir/`), 'lin manual catalog canonical is missing');
assert.ok(/name="robots" content="index,follow/i.test(linCatalog.body), 'lin manual catalog must be indexable');
for (const article of LIN_ARTICLES) {
  assert.ok(linCatalog.body.includes(`href="/statti/lin/${article.slug}/"`), `${article.slug}: manual catalog link missing`);
}

assert.equal(LIN_ARTICLES.length, 20, 'lin manual catalog must expose exactly 20 articles');
assert.equal(new Set(LIN_ARTICLES.map((article) => article.slug)).size, 20, 'lin experiment slugs must be unique');
assert.equal(new Set(LIN_ARTICLES.map((article) => article.title)).size, 20, 'lin experiment titles must be unique');

for (const article of LIN_ARTICLES) {
  const response = render(linExperimentHandler, { slug: article.slug });
  const canonical = `${SITE}/statti/lin/${article.slug}/`;
  assert.equal(response.statusCode, 200, `${article.slug}: lin article must render`);
  assert.ok(response.body.includes(`<link rel="canonical" href="${canonical}">`), `${article.slug}: canonical URL is missing`);
  assert.ok(/name="robots" content="index,follow/i.test(response.body), `${article.slug}: article must be indexable`);
  assert.ok(response.body.includes('<h2 id="actions-title">Що можна спробувати</h2>'), `${article.slug}: action block missing`);
  assert.ok(response.body.includes('Продовжити розбір у боті'), `${article.slug}: bot transition missing`);
  assert.ok(response.body.includes('Наукові джерела'), `${article.slug}: sources block missing`);
}

const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
const locs = sitemapLocs(sitemap);
for (const slug of ALL) {
  assert.ok(!locs.has(`${SITE}/statti/${slug}/`), `${slug}: blank noindex topic must not be an exact sitemap URL`);
}
assert.ok(locs.has(`${SITE}/statti/lin-vybir/`), 'lin manual catalog must be in sitemap');
for (const article of LIN_ARTICLES) {
  assert.ok(locs.has(`${SITE}/statti/lin/${article.slug}/`), `${article.slug}: new lin article must be in sitemap`);
}

console.log('✅ SEO check passed: 3×4 guide flow + 20 indexable Lin articles with manual catalog');
