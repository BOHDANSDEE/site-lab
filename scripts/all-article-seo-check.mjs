import assert from 'node:assert/strict';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';

const SITE = 'https://xn--k1ae9bxb.online';
const TOPICS = [
  'lin',
  'motyvatsiia',
  'dystsyplina',
  'krashche-zhyttia',
  'yak-nareshti-pochaty',
  'tysk-na-sebe',
  'shchaslyve-zhyttia',
  'yak-zminyty-svoi-zvychky',
  'vtrata-interesu',
  'vysnazhennia-i-perevantazhennia',
  'povernennia-pislia-zavysannia',
  'viddalennia-vid-liudei-i-zhyttia'
];

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

function extract(html, pattern, label, slug) {
  const value = html.match(pattern)?.[1]?.trim();
  assert.ok(value, `${slug}: missing ${label}`);
  return value;
}

const categorySlugs = ['lin', 'prokrastynatsiia', 'apatiia'];
const discovered = [];
for (const category of categorySlugs) {
  const response = render(libraryHandler, { category });
  assert.equal(response.statusCode, 200, `${category}: category must render`);
  const slugs = [...response.body.matchAll(/class="article-card" href="\/statti\/([^"/]+)\/"/g)].map((match) => match[1]);
  assert.equal(slugs.length, 4, `${category}: category must contain four topics`);
  discovered.push(...slugs);
}

assert.equal(discovered.length, 12, 'categories must expose exactly 12 topic canvases');
assert.equal(new Set(discovered).size, 12, 'topic slugs must be unique');
assert.deepEqual(new Set(discovered), new Set(TOPICS), 'category navigation must match the 12 approved topics');

const canonicals = new Set();
const titles = new Set();
const h1s = new Set();

for (const slug of TOPICS) {
  const response = render(articleHandler, { slug });
  assert.equal(response.statusCode, 200, `${slug}: blank topic page must return 200`);
  const html = response.body;
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)">/i, 'canonical', slug);
  const title = extract(html, /<title>([^<]+)<\/title>/i, 'title', slug);
  const h1 = extract(html, /<h1[^>]*>([^<]+)<\/h1>/i, 'H1', slug);

  assert.equal(canonical, `${SITE}/statti/${slug}/`, `${slug}: canonical must point to itself`);
  assert.match(html, /<meta name="robots" content="noindex,follow">/i, `${slug}: blank topic page must be noindex`);
  assert.ok(html.includes('class="article-canvas"'), `${slug}: blank canvas is missing`);

  assert.ok(!canonicals.has(canonical), `${slug}: duplicate canonical ${canonical}`);
  assert.ok(!titles.has(title), `${slug}: duplicate title ${title}`);
  assert.ok(!h1s.has(h1), `${slug}: duplicate H1 ${h1}`);
  canonicals.add(canonical);
  titles.add(title);
  h1s.add(h1);
}

assert.equal(canonicals.size, 12);
assert.equal(titles.size, 12);
assert.equal(h1s.size, 12);

console.log('✅ Topic audit passed: 12 unique blank pages render server-side and remain noindex');
