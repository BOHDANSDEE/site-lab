import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import articleHandler from '../api/article.mjs';
import libraryHandler from '../api/articles.mjs';

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

function renderArticle(slug) {
  const response = new MockResponse();
  articleHandler({ query: { slug } }, response);
  return response;
}

function renderLibrary() {
  const response = new MockResponse();
  libraryHandler({ query: {} }, response);
  return response;
}

const samples = [
  ['akademichna-prokrastynatsiia', 'Академічна прокрастинація'],
  ['apatiia-pislia-stresu', 'Апатія після стресу'],
  ['prokrastynatsiia-v-pobuti', 'Прокрастинація в побуті']
];

for (const [slug, titlePart] of samples) {
  const response = renderArticle(slug);
  assert.equal(response.statusCode, 200, `${slug} must render with HTTP 200`);
  assert.match(response.headers.get('content-type') || '', /text\/html/i);
  assert.match(response.body, new RegExp(`<h1>[^<]*${titlePart}`, 'i'));
  assert.ok(response.body.includes(`<link rel="canonical" href="https://xn--k1ae9bxb.online/statti/${slug}/">`));
  assert.ok(response.body.includes('name="robots" content="index,follow'));
  assert.ok(response.body.includes('application/ld+json'));
  assert.ok(response.body.includes('BreadcrumbList'));
  assert.ok(response.body.includes(`https://t.me/HabitTeen_bot?start=article_${slug}`));
  assert.ok(!response.body.includes('Готуємо матеріал'), `${slug} must contain useful HTML before JavaScript`);
  assert.ok(response.body.length > 5000, `${slug} server HTML should contain substantial content`);
}

const missing = renderArticle('not-a-real-article');
assert.equal(missing.statusCode, 404);
assert.ok(missing.body.includes('noindex,follow'));

const library = renderLibrary();
assert.equal(library.statusCode, 200, 'article library must render with HTTP 200');
assert.match(library.headers.get('content-type') || '', /text\/html/i);
assert.ok(library.body.includes('<title>45 статей про лінь, апатію та прокрастинацію | Лінь</title>'));
assert.ok(library.body.includes('<link rel="canonical" href="https://xn--k1ae9bxb.online/statti/">'));
assert.ok(library.body.includes('name="robots" content="index,follow'));
assert.ok(library.body.includes('CollectionPage'));
assert.ok(library.body.includes('ItemList'));
assert.ok(library.body.includes('<h1>45 статей про те, що заважає діяти</h1>'));
const libraryLinks = [...library.body.matchAll(/class="article-card" data-article-card href="\/statti\/([^"/]+)\/"/g)].map((match) => match[1]);
assert.equal(libraryLinks.length, 45, 'initial library HTML must expose all 45 article links');
assert.equal(new Set(libraryLinks).size, 45, 'all 45 library links must be unique');

const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
assert.equal(vercel.rewrites.length, 2);
assert.deepEqual(vercel.rewrites[0], {
  source: '/statti/',
  destination: '/api/articles'
});
assert.deepEqual(vercel.rewrites[1], {
  source: '/statti/:slug/',
  destination: '/api/article?slug=:slug'
});
assert.equal(vercel.functions['api/article.mjs'].includeFiles, '**/*.js');
assert.equal(vercel.functions['api/articles.mjs'].includeFiles, '**/*.js');

const template = await readFile(new URL('../statti/article/index.html', import.meta.url), 'utf8');
assert.ok(template.includes('name="robots" content="noindex,follow"'));
assert.ok(!template.includes('rel="canonical"'), 'technical template must not send a conflicting canonical');

const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
const articleUrls = [...sitemap.matchAll(/<loc>https:\/\/xn--k1ae9bxb\.online\/statti\/([^<]+)\/<\/loc>/g)];
assert.equal(articleUrls.length, 45, 'sitemap must keep exactly 45 canonical article URLs');
assert.ok(sitemap.includes('<lastmod>2026-08-12</lastmod>'));
for (const slug of libraryLinks) {
  assert.ok(
    sitemap.includes(`<loc>https://xn--k1ae9bxb.online/statti/${slug}/</loc>`),
    `library link must also exist in sitemap: ${slug}`
  );
}

console.log('✅ SEO server-render check passed: 45 crawlable library links + rich, apathy and fallback article HTML');
