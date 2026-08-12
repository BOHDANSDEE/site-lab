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

function renderPage(items) {
  const canonical = `${SITE}/statti/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Статті про лінь, апатію та прокрастинацію',
        url: canonical,
        inLanguage: 'uk-UA',
        description: 'Бібліотека практичних матеріалів про лінь, апатію та прокрастинацію.'
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
  <title>45 статей про лінь, апатію та прокрастинацію | Лінь</title>
  <meta name="description" content="45 практичних матеріалів про лінь, апатію та прокрастинацію: причини, маленькі кроки, межі самодопомоги й надійні джерела.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:title" content="45 статей | Лінь">
  <meta property="og:description" content="Бібліотека матеріалів про лінь, апатію та прокрастинацію.">
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
      <h1>45 статей про те, що заважає діяти</h1>
      <p class="page-intro">Оберіть тему або знайдіть матеріал за кількома словами. Усі 45 матеріалів доступні прямо на цій сторінці — без прихованого завантаження через JavaScript.</p>
    </section>

    <section class="section shell">
      <div class="section-heading"><p class="section-kicker">Три напрямки</p><h2>Оберіть розділ</h2></div>
      <div class="topic-list">
        <a class="topic-link" href="/lin/"><span class="topic-number">01</span><span><h3>Лінь</h3><p>15 матеріалів про бар’єр старту, втому, звички й реалістичні маленькі дії.</p></span><span class="topic-arrow" aria-hidden="true">→</span></a>
        <a class="topic-link" href="/apatiia/"><span class="topic-number">02</span><span><h3>Апатія</h3><p>15 матеріалів про низьку енергію, втрату інтересу, сон, стрес і межі самодопомоги.</p></span><span class="topic-arrow" aria-hidden="true">→</span></a>
        <a class="topic-link" href="/prokrastynatsiia/"><span class="topic-number">03</span><span><h3>Прокрастинація</h3><p>15 матеріалів про відкладання, тривогу, перфекціонізм, увагу та завершення справ.</p></span><span class="topic-arrow" aria-hidden="true">→</span></a>
      </div>
    </section>

    <section class="soft-band">
      <div class="section shell">
        <div class="section-heading">
          <p class="section-kicker">45 матеріалів у бібліотеці</p>
          <h2>Знайдіть матеріал за запитом</h2>
          <p>Пошук перевіряє назви й короткі описи. Без пошуку нижче одразу доступні всі статті.</p>
        </div>

        <form class="article-search" data-article-search role="search" novalidate>
          <label for="article-search-input">Пошук у назвах і описах</label>
          <div class="article-search-field">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <input id="article-search-input" type="search" inputmode="search" autocomplete="off" placeholder="Наприклад: немає сил, сон, апатія">
            <button type="button" data-search-clear hidden>Очистити</button>
          </div>
          <p class="search-status" data-search-status aria-live="polite">Показано 45 матеріалів</p>
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
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.status(200).send(renderPage(items));
  } catch (error) {
    console.error('SSR article library failed', error);
    response.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Article library render failed');
  }
}
