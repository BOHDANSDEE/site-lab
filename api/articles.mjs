import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://xn--k1ae9bxb.online';
const META_FILES = [
  'articles-index.js',
  'article-topic-overrides.js',
  'lazy-topic-overrides.js',
  'apathy-topic-overrides.js',
  'articles-index-45.js'
];

const CATEGORIES = {
  lin: { name: 'Лінь', path: '/lin/' },
  apatiia: { name: 'Апатія', path: '/apatiia/' },
  prokrastynatsiia: { name: 'Прокрастинація', path: '/prokrastynatsiia/' }
};

let cache = null;

function loadIndex() {
  if (cache) return cache;
  const sandbox = { window: {} };
  for (const relativePath of META_FILES) {
    const filename = path.join(ROOT, relativePath);
    vm.runInNewContext(readFileSync(filename, 'utf8'), sandbox, { filename, timeout: 1000 });
  }
  const index = sandbox.window.HABITTEEN_ARTICLE_INDEX || [];
  const seen = new Set();
  cache = index.filter((item) => {
    if (!item?.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
  return cache;
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

function renderCards(items) {
  return items.map((item) => `<a class="article-card" data-article-card href="/statti/${escapeHtml(item.slug)}/"><span>${escapeHtml(item.cat)} · ${escapeHtml(item.time)} хв</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc)}</p></a>`).join('\n');
}

function countByCategory(items, catSlug) {
  return items.filter((item) => item.cat_slug === catSlug).length;
}

function renderTopics(items) {
  const descriptions = {
    lin: 'Матеріали про лінь, мотивацію, причини складного старту та ранковий підйом.',
    apatiia: 'Матеріали про апатію, втрату інтересу та апатію у підлітків.',
    prokrastynatsiia: 'Матеріали про пріоритети та концентрацію під час навчання.'
  };

  return `<section class="section shell">
    <div class="section-heading"><p class="section-kicker">Три напрямки</p><h2>Оберіть розділ</h2></div>
    <div class="topic-list">
      ${Object.entries(CATEGORIES).map(([key, category], index) => `<a class="topic-link" href="${category.path}"><span class="topic-number">0${index + 1}</span><span><h3>${category.name}</h3><p>${countByCategory(items, key)} статті. ${descriptions[key]}</p></span><span class="topic-arrow" aria-hidden="true">→</span></a>`).join('\n')}
    </div>
  </section>`;
}

function renderPage(allItems, categoryKey = '') {
  const category = CATEGORIES[categoryKey] || null;
  const items = category ? allItems.filter((item) => item.cat_slug === categoryKey) : allItems;
  const canonicalPath = category ? category.path : '/statti/';
  const canonical = `${SITE}${canonicalPath}`;
  const heading = category ? `${category.name}: ${items.length} статті` : `${items.length} статей про те, що заважає діяти`;
  const pageTitle = category ? `${category.name}: ${items.length} статті | Лінь` : `${items.length} статей про лінь, апатію та прокрастинацію | Лінь`;
  const description = category
    ? `${items.length} відібрані матеріали у розділі «${category.name}».`
    : `${items.length} відібраних матеріалів про лінь, апатію та прокрастинацію.`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: category ? `Статті: ${category.name}` : 'Статті про лінь, апатію та прокрастинацію',
        url: canonical,
        inLanguage: 'uk-UA',
        description
      },
      {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          url: `${SITE}/statti/${item.slug}/`
        }))
      }
    ]
  };

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
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
    <div class="shell brand-row"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p class="brand-note">Без осуду. Без спрощених діагнозів.</p></div>
    <div class="nav-wrap"><nav class="site-nav shell" aria-label="Головна навігація"><a href="/">Головна</a><a href="/statti/" aria-current="page">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про простір</a><a href="/bezpeka/">Безпека</a></nav></div>
  </header>

  <main id="content">
    <section class="page-hero shell">
      <p class="eyebrow">Бібліотека матеріалів</p>
      <h1>${escapeHtml(heading)}</h1>
      <p class="page-intro">${category ? `У цьому розділі залишені тільки відібрані матеріали. <a href="/statti/">Повернутися до всіх статей</a>.` : 'Залишені тільки матеріали, які ми будемо далі оновлювати й переписувати.'}</p>
    </section>

    ${category ? '' : renderTopics(allItems)}

    <section class="soft-band">
      <div class="section shell">
        <div class="section-heading">
          <p class="section-kicker">${items.length} матеріалів у списку</p>
          <h2>${category ? `Статті: ${escapeHtml(category.name)}` : 'Знайдіть матеріал за запитом'}</h2>
          <p>Нижче доступні всі статті, які залишилися в бібліотеці.</p>
        </div>

        <form class="article-search" data-article-search role="search" novalidate>
          <label for="article-search-input">Пошук у назвах і описах</label>
          <div class="article-search-field">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <input id="article-search-input" type="search" inputmode="search" autocomplete="off" placeholder="Наприклад: мотивація, апатія, навчання">
            <button type="button" data-search-clear hidden>Очистити</button>
          </div>
          <p class="search-status" data-search-status aria-live="polite">Показано ${items.length} матеріалів</p>
        </form>

        <div class="article-grid" data-article-grid>
          ${renderCards(items)}
        </div>
        <p class="search-empty" data-search-empty hidden>За цим запитом матеріалів поки немає. Спробуйте інше слово або очистіть пошук.</p>
      </div>
    </section>

    <section class="section shell"><div class="callout"><p class="section-kicker">Не знаєте, яку статтю обрати?</p><h2>Почніть із короткого розбору ситуації</h2><p>Опишіть, що саме не виходить: немає сил, нічого не хочеться або справа постійно відкладається.</p><a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Розбір ситуації ↗</a></div></section>
  </main>

  <footer class="site-footer"><div class="shell footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український інформаційний простір про лінь, апатію та прокрастинацію.</p></div><nav class="footer-nav" aria-label="Навігація"><strong>Простір</strong><a href="/statti/">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про простір</a><a href="/bezpeka/">Безпека</a></nav><nav class="footer-nav" aria-label="Теми"><strong>Теми</strong><a href="/lin/">Лінь</a><a href="/apatiia/">Апатія</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/#faq">FAQ</a></nav></div><div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div></footer>
  <script src="/script.js" defer></script>
</body>
</html>`;
}

export default function handler(request, response) {
  try {
    const items = loadIndex();
    const categoryKey = String(request.query?.category || '').trim();
    if (categoryKey && !CATEGORIES[categoryKey]) {
      response.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Category not found');
      return;
    }
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    response.status(200).send(renderPage(items, categoryKey));
  } catch (error) {
    console.error('SSR article library failed', error);
    response.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Article library render failed');
  }
}
