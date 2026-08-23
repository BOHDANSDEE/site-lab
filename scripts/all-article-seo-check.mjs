import assert from 'node:assert/strict';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';

const SITE = 'https://xn--k1ae9bxb.online';

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

const library = render(libraryHandler);
assert.equal(library.statusCode, 200);
const slugs = [...library.body.matchAll(/class="article-card" data-article-card href="\/statti\/([^"/]+)\/"/g)].map((match) => match[1]);
assert.equal(slugs.length, 9, 'library must expose exactly 9 canonical article slugs');
assert.equal(new Set(slugs).size, 9, 'library article slugs must be unique');

const canonicals = new Set();
const titles = new Set();
const h1s = new Set();

for (const slug of slugs) {
  const response = render(articleHandler, { slug });
  assert.equal(response.statusCode, 200, `${slug}: server-rendered page must return 200`);
  const html = response.body;
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)">/i, 'canonical', slug);
  const title = extract(html, /<title>([^<]+)<\/title>/i, 'title', slug);
  const h1 = extract(html, /<h1[^>]*>([^<]+)<\/h1>/i, 'H1', slug);
  const description = extract(html, /<meta name="description" content="([^"]+)">/i, 'meta description', slug);

  assert.equal(canonical, `${SITE}/statti/${slug}/`, `${slug}: canonical must point to itself`);
  assert.ok(!/noindex/i.test(html), `${slug}: selected article must stay indexable`);
  assert.ok(!html.includes('Готуємо матеріал'), `${slug}: page must expose useful HTML immediately`);
  assert.ok(description.length >= 50, `${slug}: meta description should be meaningful`);
  assert.ok(title.length >= 10, `${slug}: title should be descriptive`);
  assert.ok(h1.length >= 8, `${slug}: H1 should be descriptive`);

  assert.ok(!canonicals.has(canonical), `${slug}: duplicate canonical ${canonical}`);
  assert.ok(!titles.has(title), `${slug}: duplicate title ${title}`);
  assert.ok(!h1s.has(h1), `${slug}: duplicate H1 ${h1}`);
  canonicals.add(canonical);
  titles.add(title);
  h1s.add(h1);
}

assert.equal(canonicals.size, 9);
assert.equal(titles.size, 9);
assert.equal(h1s.size, 9);

console.log('✅ Full SEO audit passed: 9 unique selected article pages render server-side');
