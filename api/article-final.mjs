import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import articleHandler from './article.mjs';
import { TOPIC_SPECIFIC_SECTIONS } from './topic-specific-sections.mjs';
import { TOPIC_SPECIFIC_META } from './topic-specific-meta.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://xn--k1ae9bxb.online';
const META_FILES = [
  'articles-index.js',
  'article-topic-overrides.js',
  'lazy-topic-overrides.js',
  'apathy-topic-overrides.js',
  'articles-index-45.js'
];
const TOPIC_UPDATED_LABEL = '12 серпня 2026 р.';
const TOPIC_UPDATED_ISO = '2026-08-12';

const PLACEHOLDER_TOPICS = {
  lin: { title: 'Лінь', category: 'Лінь', categoryPath: '/lin/' },
  motyvatsiia: { title: 'Мотивація', category: 'Лінь', categoryPath: '/lin/' },
  dystsyplina: { title: 'Дисципліна', category: 'Лінь', categoryPath: '/lin/' },
  'krashche-zhyttia': { title: 'Краще життя', category: 'Лінь', categoryPath: '/lin/' },
  'yak-nareshti-pochaty': { title: 'Як нарешті почати', category: 'Прокрастинація', categoryPath: '/prokrastynatsiia/' },
  'tysk-na-sebe': { title: 'Тиск на себе', category: 'Прокрастинація', categoryPath: '/prokrastynatsiia/' },
  'shchaslyve-zhyttia': { title: 'Щасливе життя', category: 'Прокрастинація', categoryPath: '/prokrastynatsiia/' },
  'yak-zminyty-svoi-zvychky': { title: 'Як змінити свої звички', category: 'Прокрастинація', categoryPath: '/prokrastynatsiia/' },
  'vtrata-interesu': { title: 'Втрата інтересу', category: 'Апатія', categoryPath: '/apatiia/' },
  'vysnazhennia-i-perevantazhennia': { title: 'Виснаження і перевантаження', category: 'Апатія', categoryPath: '/apatiia/' },
  'povernennia-pislia-zavysannia': { title: 'Повернення після зависання', category: 'Апатія', categoryPath: '/apatiia/' },
  'viddalennia-vid-liudei-i-zhyttia': { title: 'Віддалення від людей і життя', category: 'Апатія', categoryPath: '/apatiia/' }
};

let apathyCache = null;
let catalogCache = null;

class CaptureResponse {
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
    this.headers.set(String(name), String(value));
    return this;
  }
  send(body) {
    this.body = String(body);
    return this;
  }
}

function runBrowserScript(relativePath, sandbox) {
  const filename = path.join(ROOT, relativePath);
  vm.runInNewContext(readFileSync(filename, 'utf8'), sandbox, { filename, timeout: 1000 });
}

function loadApathyContent() {
  if (apathyCache) return apathyCache;
  const sandbox = { window: {} };
  for (const relativePath of ['apathy-rich-content.js', 'apathy-tone-overrides.js']) {
    runBrowserScript(relativePath, sandbox);
  }
  apathyCache = {
    articles: sandbox.window.HABITTEEN_APATHY_ARTICLES || {},
    sources: sandbox.window.HABITTEEN_APATHY_SOURCES || {}
  };
  return apathyCache;
}

function loadCatalog() {
  if (catalogCache) return catalogCache;
  const sandbox = { window: {} };
  for (const relativePath of META_FILES) runBrowserScript(relativePath, sandbox);
  catalogCache = {
    index: sandbox.window.HABITTEEN_ARTICLE_INDEX || [],
    sources: sandbox.window.HABITTEEN_ARTICLE_SOURCES || {}
  };
  return catalogCache;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderPlaceholder(topic, slug) {
  const canonical = `${SITE}/statti/${slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: topic.title,
    url: canonical,
    inLanguage: 'uk-UA'
  };

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(topic.title)} | Лінь</title>
  <meta name="description" content="Сторінка теми «${escapeHtml(topic.title)}». Наповнення буде додано пізніше.">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:title" content="${escapeHtml(topic.title)} | Лінь">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Лінь">
  <meta name="theme-color" content="#eaf7ff">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/refresh.css">
</head>
<body>
  <a class="skip-link" href="#content">Перейти до змісту</a>
  <header class="site-header">
    <div class="shell brand-row">
      <a class="brand" href="/" aria-label="Лінь — головна"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a>
      <p class="brand-note">Без осуду. Без спрощених відповідей.</p>
    </div>
    <div class="nav-wrap">
      <nav class="site-nav shell" aria-label="Головна навігація">
        <a href="/">Головна</a>
        <a href="/statti/" aria-current="page">Теми</a>
        <a href="/psykholoham/">Психологам</a>
        <a href="/pro-sait/">Про простір</a>
        <a href="/bezpeka/">Безпека</a>
      </nav>
    </div>
  </header>

  <main id="content">
    <section class="page-hero shell blank-topic-hero">
      <p class="eyebrow">${escapeHtml(topic.category)} · майбутня стаття</p>
      <h1>${escapeHtml(topic.title)}</h1>
      <div class="page-actions"><a class="button button-secondary" href="${topic.categoryPath}">← Назад до тем</a></div>
    </section>
    <section class="section shell blank-topic-section">
      <article class="article-canvas" aria-label="Місце для майбутнього тексту статті"></article>
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український простір про лінь, апатію та прокрастинацію.</p></div>
      <nav class="footer-nav" aria-label="Навігація"><strong>Простір</strong><a href="/statti/">Теми</a><a href="/pro-sait/">Про простір</a><a href="/bezpeka/">Безпека</a></nav>
      <nav class="footer-nav" aria-label="Напрямки"><strong>Напрямки</strong><a href="/lin/">Лінь</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/apatiia/">Апатія</a></nav>
    </div>
    <div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div>
  </footer>
  <script src="/script.js" defer></script>
</body>
</html>`;
}

function removeClientArticleRerender(html) {
  const rerenderScripts = [
    'articles-index.js',
    'article-topic-overrides.js',
    'lazy-topic-overrides.js',
    'apathy-topic-overrides.js',
    'articles-index-45.js',
    'article-router.js',
    'article-toc-fix.js'
  ];

  let output = html;
  for (const filename of rerenderScripts) {
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(
      new RegExp(`\\s*<script\\s+src=["']/${escaped}["'](?:\\s+defer)?><\\/script>`, 'gi'),
      ''
    );
  }
  return output;
}

function enrichTopicSpecificSections(html, slug) {
  const topic = TOPIC_SPECIFIC_SECTIONS[slug];
  if (!topic?.sections?.length) return html;

  const sections = topic.sections.map((section, index) => {
    const id = `topic-${index + 1}-title`;
    const paragraphs = (section.paragraphs || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('');
    return `<section class="topic-specific-section" aria-labelledby="${id}"><h2 id="${id}">${escapeHtml(section.heading)}</h2>${paragraphs}</section>`;
  }).join('');

  const intro = `<p class="topic-specific-intro">${escapeHtml(topic.intro)}</p>`;
  const bodyMarker = '<div class="article-body">';
  let output = html.replace(bodyMarker, `${bodyMarker}${intro}${sections}`);

  const tocLinks = topic.sections
    .map((section, index) => `<a href="#topic-${index + 1}-title">${escapeHtml(section.heading)}</a>`)
    .join('');
  output = output.replace(
    /(<aside class="article-toc" aria-label="Зміст статті"><strong>Зміст статті<\/strong>)/i,
    `$1${tocLinks}`
  );

  return output;
}

function renderFaqSection(faq) {
  return `<section aria-labelledby="faq-title"><h2 id="faq-title">Поширені запитання</h2><div class="faq-list">${faq.map((entry) => `<details><summary>${escapeHtml(entry.q)}</summary><p>${escapeHtml(entry.a)}</p></details>`).join('')}</div></section>`;
}

function updateTopicStructuredData(html, faq) {
  return html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,
    (match, rawJson) => {
      try {
        const data = JSON.parse(rawJson);
        if (!Array.isArray(data?.['@graph'])) return match;
        const graph = data['@graph'].filter((node) => node?.['@type'] !== 'FAQPage');
        const article = graph.find((node) => node?.['@type'] === 'Article');
        if (article) article.dateModified = TOPIC_UPDATED_ISO;
        graph.push({
          '@type': 'FAQPage',
          mainEntity: faq.map((entry) => ({
            '@type': 'Question',
            name: entry.q,
            acceptedAnswer: { '@type': 'Answer', text: entry.a }
          }))
        });
        data['@graph'] = graph;
        return `<script type="application/ld+json">${safeJson(data)}</script>`;
      } catch {
        return match;
      }
    }
  );
}

function enrichTopicSpecificFaq(html, slug) {
  const faq = TOPIC_SPECIFIC_META[slug]?.faq;
  if (!faq?.length) return html;
  const faqPattern = /<section aria-labelledby="faq-title">[\s\S]*?<\/section>/i;
  let output = faqPattern.test(html)
    ? html.replace(faqPattern, renderFaqSection(faq))
    : html;
  output = updateTopicStructuredData(output, faq);
  return output;
}

function enrichTopicSpecificRelated(html, slug) {
  const relatedSlugs = TOPIC_SPECIFIC_META[slug]?.related;
  if (!relatedSlugs?.length) return html;
  const index = loadCatalog().index;
  const related = relatedSlugs
    .map((relatedSlug) => index.find((entry) => entry.slug === relatedSlug))
    .filter(Boolean)
    .slice(0, 3);
  if (!related.length) return html;

  const cards = related.map((entry) => `<a class="article-card" href="/statti/${escapeHtml(entry.slug)}/"><span>${escapeHtml(entry.cat)} · ${escapeHtml(entry.time)} хв</span><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.desc)}</p></a>`).join('');
  const section = `<section class="section shell"><div class="section-heading"><p class="section-kicker">Читайте далі</p><h2>Пов’язані матеріали</h2></div><div class="article-grid">${cards}</div></section>`;
  const relatedPattern = /<section class="section shell"><div class="section-heading"><p class="section-kicker">Читайте далі<\/p><h2>Пов’язані матеріали<\/h2><\/div><div class="article-grid">[\s\S]*?<\/div><\/section>/i;
  return relatedPattern.test(html) ? html.replace(relatedPattern, section) : html;
}

function appendSources(html, items) {
  if (!items.length) return html;
  const missing = items.filter((source) => source?.url && !html.includes(source.url));
  if (!missing.length) return html;

  const extraItems = missing
    .map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`)
    .join('');

  const sourceListPattern = /(<section aria-labelledby="sources-title">[\s\S]*?<ul class="source-list">)([\s\S]*?)(<\/ul><\/section>)/i;
  if (sourceListPattern.test(html)) {
    return html.replace(sourceListPattern, (_match, open, existing, close) => `${open}${existing}${extraItems}${close}`);
  }

  const sourceSection = `<section aria-labelledby="sources-title"><h2 id="sources-title">Джерела та додаткове читання</h2><ul class="source-list">${extraItems}</ul></section>`;
  return html.replace('</div>\n        </div>', `${sourceSection}\n        </div>\n      </div>`);
}

function enrichTopicSpecificSources(html, slug) {
  const sourceKeys = TOPIC_SPECIFIC_META[slug]?.sources;
  if (!sourceKeys?.length) return html;
  const sources = loadCatalog().sources;
  return appendSources(html, sourceKeys.map((key) => sources[key]).filter(Boolean));
}

function enrichApathySources(html, slug) {
  const apathy = loadApathyContent();
  const article = apathy.articles[slug];
  if (!article?.sources?.length) return html;

  const commonSources = loadCatalog().sources;
  const missing = article.sources
    .filter((key) => !commonSources[key])
    .map((key) => apathy.sources[key])
    .filter(Boolean);

  return appendSources(html, missing);
}

function enrichTopicUpdatedLabel(html, slug) {
  if (!TOPIC_SPECIFIC_META[slug]) return html;
  return html.replace(/Оновлено [^<]+<\/span>/i, `Оновлено ${TOPIC_UPDATED_LABEL}</span>`);
}

function copyResponse(captured, response, body) {
  for (const [name, value] of captured.headers) response.setHeader(name, value);
  response.status(captured.statusCode).send(body);
}

export default function handler(request, response) {
  const slug = String(request.query?.slug || '').trim().toLowerCase();
  const placeholder = PLACEHOLDER_TOPICS[slug];

  if (placeholder) {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    response.status(200).send(renderPlaceholder(placeholder, slug));
    return;
  }

  const captured = new CaptureResponse();
  articleHandler(request, captured);

  if (captured.statusCode !== 200) {
    copyResponse(captured, response, captured.body);
    return;
  }

  let html = removeClientArticleRerender(captured.body);
  html = enrichTopicSpecificSections(html, slug);
  html = enrichTopicSpecificFaq(html, slug);
  html = enrichTopicSpecificRelated(html, slug);
  html = enrichTopicSpecificSources(html, slug);
  html = enrichApathySources(html, slug);
  html = enrichTopicUpdatedLabel(html, slug);
  copyResponse(captured, response, html);
}
