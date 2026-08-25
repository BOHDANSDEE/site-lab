import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';

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
  return [...html.matchAll(/class="article-card"[^>]*href="\/statti\/([^"/]+)\/"/g)].map((match) => match[1]);
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

const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
for (const slug of ALL) {
  assert.ok(!sitemap.includes(`${SITE}/statti/${slug}/`), `${slug}: blank noindex topic must not be in sitemap`);
}

console.log('✅ SEO check passed: 3 category buttons, 4 topics each, 12 blank noindex canvases');
