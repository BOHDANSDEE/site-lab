import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';

const SITE = 'https://xn--k1ae9bxb.online';
const EXPECTED = {
  lin: [
    'yak-poboroty-lin',
    'yak-diiaty-koly-nemaie-motyvatsii',
    'yak-vstaty-z-lizhka-vrantsi'
  ],
  apatiia: [
    'apatiia-shcho-robyty'
  ],
  prokrastynatsiia: [
    'yak-vybraty-priorytet-koly-vse-terminove'
  ]
};
const ALL = Object.values(EXPECTED).flat();
const TITLES = new Map([
  ['yak-poboroty-lin', 'Як побороти лінь'],
  ['yak-diiaty-koly-nemaie-motyvatsii', 'Що робити, коли немає мотивації'],
  ['yak-vstaty-z-lizhka-vrantsi', 'Як прокидатися зранку'],
  ['apatiia-shcho-robyty', 'Апатія: що робити, коли нічого не хочеться'],
  ['yak-vybraty-priorytet-koly-vse-terminove', 'Як вибирати пріоритети']
]);

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
  return [...html.matchAll(/class="article-card"(?: data-article-card)? href="\/statti\/([^"/]+)\/"/g)].map((match) => match[1]);
}

const library = render(libraryHandler);
assert.equal(library.statusCode, 200);
assert.match(library.body, /<title>5 статей про лінь, апатію та прокрастинацію \| Лінь<\/title>/);
assert.match(library.body, /<h1>5 статей про те, що заважає діяти<\/h1>/);
assert.ok(!library.body.includes('9 статей'));
assert.ok(!library.body.includes('45 статей'));
const libraryLinks = articleLinks(library.body);
assert.equal(libraryLinks.length, 5);
assert.equal(new Set(libraryLinks).size, 5);
assert.deepEqual(new Set(libraryLinks), new Set(ALL));

for (const [slug, title] of TITLES) {
  assert.ok(library.body.includes(`<h3>${title}</h3>`), `${slug}: curated title must appear in library`);
}

for (const [category, expected] of Object.entries(EXPECTED)) {
  const response = render(libraryHandler, { category });
  assert.equal(response.statusCode, 200, `${category}: category must render`);
  assert.ok(response.body.includes(`<link rel="canonical" href="${SITE}/${category}/">`));
  const links = articleLinks(response.body);
  assert.equal(links.length, expected.length, `${category}: wrong curated count`);
  assert.deepEqual(new Set(links), new Set(expected), `${category}: wrong curated slugs`);
}

assert.ok(render(libraryHandler, { category: 'apatiia' }).body.includes('<h1>Апатія: 1 стаття</h1>'));
assert.ok(render(libraryHandler, { category: 'prokrastynatsiia' }).body.includes('<h1>Прокрастинація: 1 стаття</h1>'));

for (const slug of ALL) {
  const response = render(articleHandler, { slug });
  assert.equal(response.statusCode, 200, `${slug}: selected article must render`);
  assert.ok(response.body.includes(`<link rel="canonical" href="${SITE}/statti/${slug}/">`));
  assert.ok(response.body.includes('name="robots" content="index,follow'));
  assert.ok(!response.body.includes('Готуємо матеріал'));
  const related = articleLinks(response.body);
  for (const relatedSlug of related) {
    assert.ok(ALL.includes(relatedSlug), `${slug}: related link must stay inside curated 5: ${relatedSlug}`);
  }
}

for (const slug of [
  'prychyny-lini',
  'sduh-i-prokrastynatsiia',
  'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia',
  'apatiia-u-pidlitkiv',
  'lin-chy-vyhorannia',
  'apatiia-chy-depresiia',
  'prokrastynatsiia-i-nudga'
]) {
  const response = render(articleHandler, { slug });
  assert.equal(response.statusCode, 404, `${slug}: removed article must return 404`);
  assert.ok(response.body.includes('noindex,follow'));
}

const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
const sitemapSlugs = [...sitemap.matchAll(/<loc>https:\/\/xn--k1ae9bxb\.online\/statti\/([^<]+)\/<\/loc>/g)].map((match) => match[1]);
assert.equal(sitemapSlugs.length, 5, 'sitemap must list exactly 5 article URLs');
assert.deepEqual(new Set(sitemapSlugs), new Set(ALL));

const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
assert.deepEqual(vercel.rewrites, [
  { source: '/lin/', destination: '/api/articles?category=lin' },
  { source: '/apatiia/', destination: '/api/articles?category=apatiia' },
  { source: '/prokrastynatsiia/', destination: '/api/articles?category=prokrastynatsiia' },
  { source: '/statti/', destination: '/api/articles' },
  { source: '/statti/:slug/', destination: '/api/article-final?slug=:slug' }
]);
for (const redirect of vercel.redirects || []) {
  assert.ok(!redirect.destination.includes('/statti/prychyny-lini/'));
  assert.ok(!redirect.destination.includes('/statti/nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia/'));
}

console.log('✅ SEO check passed: only 5 curated articles remain crawlable (3 лінь + 1 апатія + 1 прокрастинація)');
