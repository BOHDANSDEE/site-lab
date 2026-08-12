import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import articleHandler from '../api/article-final.mjs';
import libraryHandler from '../api/articles.mjs';
import { TOPIC_SPECIFIC_SECTIONS } from '../api/topic-specific-sections.mjs';
import { TOPIC_SPECIFIC_META } from '../api/topic-specific-meta.mjs';

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

function articleLinks(html) {
  return [...html.matchAll(/class="article-card"(?: data-article-card)? href="\/statti\/([^"/]+)\/"/g)].map((match) => match[1]);
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
  assert.ok(!response.body.includes('/article-router.js'), `${slug} must not replace SSR content with a second client render`);
  assert.ok(!response.body.includes('/article-toc-fix.js'), `${slug} must keep server TOC stable`);
  assert.ok(!response.body.includes('/articles-index.js'), `${slug} does not need article catalog JS after server render`);
  assert.ok(response.body.length > 5000, `${slug} server HTML should contain substantial content`);
}

const apathy = renderArticle('apatiia-pislia-stresu');
assert.ok(
  apathy.body.includes('https://www.who.int/publications/i/item/9789240003927'),
  'apathy SSR must retain the apathy-specific WHO stress source'
);

const topicSlugs = Object.keys(TOPIC_SPECIFIC_SECTIONS);
const topicMetaSlugs = Object.keys(TOPIC_SPECIFIC_META);
assert.equal(topicSlugs.length, 15, 'all 15 newest article topics must have unique server-side sections');
assert.deepEqual(new Set(topicMetaSlugs), new Set(topicSlugs), 'all 15 newest topics must also have topic-specific FAQ/related metadata');
assert.equal(new Set(topicSlugs.map((slug) => TOPIC_SPECIFIC_SECTIONS[slug].intro)).size, 15, 'topic intros must be unique');
assert.equal(
  new Set(topicSlugs.map((slug) => TOPIC_SPECIFIC_SECTIONS[slug].sections.map((section) => section.heading).join('|'))).size,
  15,
  'topic section heading sets must be unique'
);

const faqQuestions = new Set();
for (const slug of topicSlugs) {
  const topic = TOPIC_SPECIFIC_SECTIONS[slug];
  const meta = TOPIC_SPECIFIC_META[slug];
  assert.equal(topic.sections.length, 3, `${slug} must have three unique topic sections`);
  assert.ok(meta.faq?.length >= 2, `${slug} must have topic-specific FAQ entries`);
  assert.equal(meta.related?.length, 3, `${slug} must have three curated related links`);
  assert.ok(meta.sources?.length >= 2, `${slug} must have topic-relevant sources`);

  for (const entry of meta.faq) {
    assert.ok(!faqQuestions.has(entry.q), `${slug}: FAQ question must be unique across newest topics: ${entry.q}`);
    faqQuestions.add(entry.q);
  }

  const response = renderArticle(slug);
  assert.equal(response.statusCode, 200, `${slug} unique-content page must return 200`);
  assert.ok(response.body.includes(topic.intro), `${slug} must expose its unique intro in initial HTML`);
  for (const section of topic.sections) {
    assert.ok(response.body.includes(section.heading), `${slug} must expose unique heading: ${section.heading}`);
  }
  assert.equal(
    (response.body.match(/class="topic-specific-section"/g) || []).length,
    3,
    `${slug} must render three unique sections before shared fallback content`
  );
  for (const entry of meta.faq) {
    assert.ok(response.body.includes(`<summary>${entry.q}</summary>`), `${slug} must expose topic-specific visible FAQ: ${entry.q}`);
    assert.ok(response.body.includes(`"name":"${entry.q}"`), `${slug} FAQ schema must match visible FAQ: ${entry.q}`);
  }
  assert.equal((response.body.match(/"@type":"FAQPage"/g) || []).length, 1, `${slug} must expose exactly one FAQPage schema`);
  assert.ok(!response.body.includes('<summary>З чого почати сьогодні?</summary>'), `${slug} must not keep generic fallback FAQ`);
  for (const relatedSlug of meta.related) {
    assert.ok(response.body.includes(`href="/statti/${relatedSlug}/"`), `${slug} must expose curated related link: ${relatedSlug}`);
  }
  assert.ok(response.body.includes('"dateModified":"2026-08-12"'), `${slug} Article schema must carry its real content update date`);
  assert.ok(response.body.includes('Оновлено 12 серпня 2026 р.'), `${slug} visible update date must match the content change`);
  assert.ok(response.body.length > 7000, `${slug} must provide substantial initial HTML after enrichment`);
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
for (const slug of topicSlugs) {
  assert.ok(libraryLinks.includes(slug), `unique topic must be crawlable from library: ${slug}`);
}

const expectedCategories = {
  lin: [
    'yak-poboroty-lin', 'prychyny-lini', 'lin-chy-vyhorannia', 'yak-diiaty-koly-nemaie-motyvatsii',
    'yak-zmusyty-sebe-vchytysia', 'yak-zmusyty-sebe-prybyraty', 'lin-u-pidlitkiv', 'yak-vstaty-z-lizhka-vrantsi',
    'chomu-pislia-roboty-nichoho-ne-khochetsia', 'yak-rozvynuty-samodystsyplinu', 'chomu-ne-vystachaie-syly-voli',
    'yak-pochaty-trenuvatysia-koly-lin', 'yak-ne-kydaty-spravy-na-pivdorozi', 'yak-vyrobyty-korysnu-zvychku',
    'chomu-pislia-navchannia-nichoho-ne-khochetsia'
  ],
  apatiia: [
    'apatiia-shcho-robyty', 'apatiia-chy-depresiia', 'emotsiine-vyhorannia-symptomy', 'yak-dopomohty-liudyni-z-apatiieiu',
    'apatiia-pislia-stresu', 'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia', 'postiino-khochetsia-spaty-i-nemaie-syl',
    'apatiia-u-pidlitkiv', 'postiina-vtoma-i-nemaie-syl', 'nemaie-syl-nichoho-robyty', 'apatiia-i-tryvoha',
    'emotsiine-oniminnia', 'apatiia-pislia-khvoroby', 'apatiia-i-sotsialna-izoliatsiia', 'yak-povernuty-rezhym-pislia-apatii'
  ],
  prokrastynatsiia: [
    'yak-perestaty-vidkladaty-spravy', 'prychyny-prokrastynatsii', 'prokrastynatsiia-i-perfektsionizm',
    'akademichna-prokrastynatsiia', 'prokrastynatsiia-i-tryvoha', 'chomu-vse-roblu-v-ostanniu-myt',
    'sduh-i-prokrastynatsiia', 'metod-pomodoro', 'nichna-prokrastynatsiia', 'telefon-korotki-video-i-prokrastynatsiia',
    'prokrastynatsiia-v-pobuti', 'prokrastynatsiia-bez-dedlainu', 'yak-zavershuvaty-spravy',
    'yak-vybraty-priorytet-koly-vse-terminove', 'prokrastynatsiia-i-nudga'
  ]
};

for (const [category, expected] of Object.entries(expectedCategories)) {
  const html = await readFile(new URL(`../${category}/index.html`, import.meta.url), 'utf8');
  const links = articleLinks(html);
  assert.equal(links.length, 15, `/${category}/ must expose exactly 15 canonical article links`);
  assert.equal(new Set(links).size, 15, `/${category}/ article links must be unique`);
  assert.deepEqual(new Set(links), new Set(expected), `/${category}/ must link to the complete canonical category set`);
  assert.ok(html.includes(`<link rel="canonical" href="https://xn--k1ae9bxb.online/${category}/">`), `/${category}/ must self-canonicalize`);
  assert.ok(html.includes('name="robots" content="index,follow'), `/${category}/ must be indexable`);
  assert.ok(html.includes('CollectionPage'), `/${category}/ must expose CollectionPage schema`);
  assert.ok(html.includes('ItemList'), `/${category}/ must expose ItemList schema`);
  for (const slug of links) assert.ok(libraryLinks.includes(slug), `/${category}/ link must be present in the 45-article library: ${slug}`);
}

const linCategory = await readFile(new URL('../lin/index.html', import.meta.url), 'utf8');
assert.ok(!linCategory.includes('href="/statti/lin-chy-vtoma/"'), '/lin/ must not link to the redirected legacy article URL');

const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
assert.equal(vercel.rewrites.length, 2);
assert.deepEqual(vercel.rewrites[0], {
  source: '/statti/',
  destination: '/api/articles'
});
assert.deepEqual(vercel.rewrites[1], {
  source: '/statti/:slug/',
  destination: '/api/article-final?slug=:slug'
});
assert.equal(vercel.functions['api/article.mjs'].includeFiles, '**/*.js');
assert.equal(vercel.functions['api/article-final.mjs'].includeFiles, '**/*.js');
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

console.log('✅ SEO check passed: 45 crawlable links + 3 complete category hubs + stable SSR + 15 fully topic-specific enrichments');
