import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://xn--k1ae9bxb.online';

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = new Map();
    this.body = '';
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  setHeader(name, value) {
    this.headers.set(String(name).toLowerCase(), String(value));
    return this;
  }
  send(body) {
    this.body = String(body);
    return this;
  }
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
assert.equal(slugs.length, 45, 'library must expose exactly 45 canonical article slugs');
assert.equal(new Set(slugs).size, 45, 'library article slugs must be unique');

const canonicals = new Set();
const titles = new Set();
const h1s = new Set();
let staticCount = 0;
let serverCount = 0;

for (const slug of slugs) {
  const staticPath = path.join(ROOT, 'statti', slug, 'index.html');
  let html;

  if (existsSync(staticPath)) {
    html = await readFile(staticPath, 'utf8');
    staticCount += 1;
  } else {
    const response = render(articleHandler, { slug });
    assert.equal(response.statusCode, 200, `${slug}: server-rendered page must return 200`);
    html = response.body;
    serverCount += 1;
  }

  const canonical = extract(html, /<link rel="canonical" href="([^"]+)">/i, 'canonical', slug);
  const title = extract(html, /<title>([^<]+)<\/title>/i, 'title', slug);
  const h1 = extract(html, /<h1[^>]*>([^<]+)<\/h1>/i, 'H1', slug);
  const description = extract(html, /<meta name="description" content="([^"]+)">/i, 'meta description', slug);

  assert.equal(canonical, `${SITE}/statti/${slug}/`, `${slug}: canonical must point to itself`);
  assert.ok(!/noindex/i.test(html), `${slug}: canonical article must not contain noindex`);
  assert.ok(!html.includes('Готуємо матеріал'), `${slug}: page must expose useful HTML immediately`);
  assert.ok(description.length >= 50, `${slug}: meta description should be meaningful`);
  assert.ok(title.length >= 15, `${slug}: title should be descriptive`);
  assert.ok(h1.length >= 10, `${slug}: H1 should be descriptive`);

  assert.ok(!canonicals.has(canonical), `${slug}: duplicate canonical ${canonical}`);
  assert.ok(!titles.has(title), `${slug}: duplicate title ${title}`);
  assert.ok(!h1s.has(h1), `${slug}: duplicate H1 ${h1}`);
  canonicals.add(canonical);
  titles.add(title);
  h1s.add(h1);
}

assert.equal(canonicals.size, 45);
assert.equal(titles.size, 45);
assert.equal(h1s.size, 45);
assert.ok(staticCount > 0, 'audit must include existing static article directories');
assert.ok(serverCount > 0, 'audit must include Vercel server-rendered article URLs');

const robots = await readFile(path.join(ROOT, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent:\s*\*/i);
assert.match(robots, /Allow:\s*\//i);
assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt must advertise the canonical sitemap');

console.log(`✅ Full SEO audit passed: ${slugs.length} unique canonical pages (${staticCount} static + ${serverCount} server-rendered)`);
