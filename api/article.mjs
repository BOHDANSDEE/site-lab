import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://xn--k1ae9bxb.online';
const UPDATED_FALLBACK = '6 серпня 2026 р.';
const META_FILES = [
  'articles-index.js',
  'article-topic-overrides.js',
  'lazy-topic-overrides.js',
  'apathy-topic-overrides.js',
  'articles-index-45.js'
];

const CATEGORY_FALLBACKS = {
  'Лінь': {
    intro: 'Побутове слово «лінь» часто приховує втому, нечіткість, страх помилки або відсутність сенсу. Корисніше не оцінювати характер, а з’ясувати, що саме робить дію складною.',
    sections: [
      { heading: 'Що перевірити перед стартом', paragraphs: ['Перевірте сон, харчування, фізичний стан і реальний обсяг справ. Коли ресурсу мало, самокритика не створює енергію.', 'Сформулюйте першу видиму дію замість загальної вимоги «зробити все». Конкретний крок зменшує невизначеність і полегшує старт.'] },
      { heading: 'Маленький старт без тиску', paragraphs: ['Оберіть дію на 2–10 хвилин: відкрити файл, підготувати матеріали, записати одне питання або виконати найпростішу частину.', 'Після короткої сесії свідомо вирішіть, чи продовжувати. Це допомагає відрізнити складний старт від реального браку ресурсу.'] }
    ],
    sources: ['nhs_fatigue', 'implementation']
  },
  'Апатія': {
    intro: 'Апатія описує зниження інтересу й активності, але сама по собі не встановлює причину або діагноз. Важливо оцінювати тривалість, вплив на життя й супутні зміни.',
    sections: [
      { heading: 'Що спостерігати', paragraphs: ['Запишіть, коли почалися зміни, у яких сферах вони помітні та чи впливають на сон, навчання, роботу, спілкування й догляд за собою.', 'Відрізняйте відсутність бажання від фізичної неможливості, виснаження, тривоги або втрати інтересу майже до всього.'] },
      { heading: 'Мінімальна підтримка дня', paragraphs: ['Поверніть одну базову опору: воду, просту їжу, короткий вихід на повітря або контакт із людиною, якій довіряєте.', 'Маленька дія не повинна доводити продуктивність. Її мета — підтримати функціонування й зібрати більше інформації про стан.'] }
    ],
    sources: ['nimh_depression', 'who_activity', 'cdc_sleep']
  },
  'Прокрастинація': {
    intro: 'Прокрастинація часто короткочасно зменшує неприємні емоції, але збільшує напруження перед дедлайном. Рішення починається з точного бар’єра, а не з ярлика.',
    sections: [
      { heading: 'Знайдіть механізм відкладання', paragraphs: ['Зверніть увагу, що відчуваєте безпосередньо перед перемиканням: нудьгу, тривогу, страх помилки, перевантаження або невизначеність.', 'Потім визначте першу фізичну дію. Чим менше рішень потрібно прийняти в момент старту, тим нижчий бар’єр.'] },
      { heading: 'Створіть коротке робоче вікно', paragraphs: ['Оберіть 10–30 хвилин, приберіть одне головне відволікання й сформулюйте видимий результат сесії.', 'Перед завершенням запишіть наступну дію. Це скорочує час повернення й не дозволяє перерві стерти контекст.'] }
    ],
    sources: ['procrast_stress', 'procrast_emotions', 'implementation']
  }
};

let catalogCache = null;
let apathyCache = null;

function runBrowserScript(relativePath, sandbox) {
  const filename = path.join(ROOT, relativePath);
  const source = readFileSync(filename, 'utf8');
  vm.runInNewContext(source, sandbox, { filename, timeout: 1000 });
}

function loadCatalog() {
  if (catalogCache) return catalogCache;
  const sandbox = { window: {} };
  for (const file of META_FILES) runBrowserScript(file, sandbox);
  catalogCache = {
    index: sandbox.window.HABITTEEN_ARTICLE_INDEX || [],
    sources: sandbox.window.HABITTEEN_ARTICLE_SOURCES || {}
  };
  return catalogCache;
}

function loadApathyArticles() {
  if (apathyCache) return apathyCache;
  const sandbox = { window: {} };
  runBrowserScript('apathy-rich-content.js', sandbox);
  runBrowserScript('apathy-tone-overrides.js', sandbox);
  apathyCache = sandbox.window.HABITTEEN_APATHY_ARTICLES || {};
  return apathyCache;
}

function loadLongArticle(slug) {
  const file = path.join(ROOT, 'article-data', `${slug}.js`);
  if (!existsSync(file)) return null;
  const sandbox = { window: {} };
  const source = readFileSync(file, 'utf8');
  vm.runInNewContext(source, sandbox, { filename: file, timeout: 1000 });
  return sandbox.window.HABITTEEN_LONG_ARTICLE || null;
}

function buildFallbackArticle(item, index) {
  const fallback = CATEGORY_FALLBACKS[item.cat] || CATEGORY_FALLBACKS['Прокрастинація'];
  return {
    title: item.title,
    lead: `${item.desc} ${fallback.intro}`,
    intro: fallback.intro,
    tags: [item.cat.toLocaleLowerCase('uk-UA'), 'самодопомога', 'практичні кроки'],
    updated: UPDATED_FALLBACK,
    sections: fallback.sections,
    faq: [
      { q: 'З чого почати сьогодні?', a: 'Оберіть одну конкретну ситуацію, визначте найменший видимий крок і працюйте коротку сесію без вимоги завершити все.' },
      { q: 'Коли самодопомоги недостатньо?', a: 'Коли стан триває, погіршується або суттєво впливає на навчання, роботу, сон чи догляд за собою, зверніться до фахівця.' }
    ],
    sources: fallback.sources,
    related: index.filter((entry) => entry.cat === item.cat && entry.slug !== item.slug).slice(0, 3).map((entry) => entry.slug)
  };
}

function resolveArticle(slug) {
  const { index, sources } = loadCatalog();
  const item = index.find((entry) => entry.slug === slug);
  if (!item) return null;
  const article = loadLongArticle(slug) || loadApathyArticles()[slug] || buildFallbackArticle(item, index);
  return { item, article, index, sources };
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

function slugify(value, position) {
  const safe = String(value || '')
    .toLocaleLowerCase('uk-UA')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return safe || `section-${position + 1}`;
}

function trimDescription(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text;
}

function renderSections(article) {
  return (article.sections || []).map((section, index) => {
    const id = `${slugify(section.heading, index)}-title`;
    const paragraphs = (section.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    const bullets = section.bullets?.length ? `<ul class="check-list">${section.bullets.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '';
    const steps = section.steps?.length ? `<ol class="check-list">${section.steps.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ol>` : '';
    const note = section.note ? `<div class="note-box"><strong>Важлива примітка</strong><p>${escapeHtml(section.note)}</p></div>` : '';
    return `<section aria-labelledby="${escapeHtml(id)}"><h2 id="${escapeHtml(id)}">${escapeHtml(section.heading)}</h2>${paragraphs}${bullets}${steps}${note}</section>`;
  }).join('');
}

function renderToc(article) {
  return (article.sections || []).map((section, index) => {
    const id = `${slugify(section.heading, index)}-title`;
    return `<a href="#${escapeHtml(id)}">${escapeHtml(section.heading)}</a>`;
  }).join('');
}

function renderTable(article) {
  if (!article.table?.rows?.length) return '';
  const table = article.table;
  return `<section aria-labelledby="table-title"><h2 id="table-title">${escapeHtml(table.left)} → ${escapeHtml(table.right)}</h2><div class="table-wrap" tabindex="0"><table class="article-table"><thead><tr><th>${escapeHtml(table.left)}</th><th>${escapeHtml(table.right)}</th></tr></thead><tbody>${table.rows.map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function renderPractice(article) {
  if (!article.practice?.length) return '';
  return `<section aria-labelledby="practice-title"><h2 id="practice-title">Практичний план</h2><ol class="check-list">${article.practice.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section>`;
}

function renderHelp(article) {
  const paragraphs = article.help?.length
    ? article.help.map((p) => `<p>${escapeHtml(p)}</p>`).join('')
    : '<p>Якщо труднощі тривають, посилюються або суттєво впливають на сон, навчання, роботу, стосунки чи догляд за собою, зверніться до лікаря або фахівця з психічного здоров’я.</p>';
  return `<section aria-labelledby="help-title"><h2 id="help-title">Коли самодопомоги недостатньо</h2>${paragraphs}<div class="note-box"><strong>Важливо</strong><p>Матеріал має освітній характер і не встановлює діагнозів. За безпосередньої небезпеки потрібна невідкладна допомога у вашій країні.</p></div></section>`;
}

function renderFaq(article) {
  if (!article.faq?.length) return '';
  return `<section aria-labelledby="faq-title"><h2 id="faq-title">Поширені запитання</h2><div class="faq-list">${article.faq.map((entry) => `<details><summary>${escapeHtml(entry.q)}</summary><p>${escapeHtml(entry.a)}</p></details>`).join('')}</div></section>`;
}

function renderSources(article, sources) {
  const items = (article.sources || []).map((key) => sources[key]).filter(Boolean);
  if (!items.length) return '';
  return `<section aria-labelledby="sources-title"><h2 id="sources-title">Джерела та додаткове читання</h2><ul class="source-list">${items.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`).join('')}</ul></section>`;
}

function renderRelated(article, index) {
  const related = (article.related || []).map((slug) => index.find((entry) => entry.slug === slug)).filter(Boolean).slice(0, 3);
  if (!related.length) return '';
  return `<section class="section shell"><div class="section-heading"><p class="section-kicker">Читайте далі</p><h2>Пов’язані матеріали</h2></div><div class="article-grid">${related.map((entry) => `<a class="article-card" href="/statti/${escapeHtml(entry.slug)}/"><span>${escapeHtml(entry.cat)} · ${escapeHtml(entry.time)} хв</span><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.desc)}</p></a>`).join('')}</div></section>`;
}

function renderPage(slug, resolved) {
  const { item, article, index, sources } = resolved;
  const canonical = `${SITE}/statti/${slug}/`;
  const categoryUrl = `${SITE}/${item.cat_slug}/`;
  const title = article.title || item.title;
  const lead = article.lead || item.desc;
  const description = trimDescription(lead);
  const updated = article.updated || UPDATED_FALLBACK;
  const intro = article.intro || item.desc;
  const botUrl = `https://t.me/HabitTeen_bot?start=article_${encodeURIComponent(slug)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', headline: title, description, inLanguage: 'uk-UA',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: { '@type': 'Organization', name: 'Редакція «Лінь»' },
        publisher: { '@type': 'Organization', name: 'Лінь', url: `${SITE}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Головна', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Статті', item: `${SITE}/statti/` },
          { '@type': 'ListItem', position: 3, name: item.cat, item: categoryUrl },
          { '@type': 'ListItem', position: 4, name: title, item: canonical }
        ]
      },
      ...(article.faq?.length ? [{
        '@type': 'FAQPage',
        mainEntity: article.faq.map((entry) => ({ '@type': 'Question', name: entry.q, acceptedAnswer: { '@type': 'Answer', text: entry.a } }))
      }] : [])
    ]
  };

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>${escapeHtml(title)} | Лінь</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:site_name" content="Лінь">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#eaf7ff">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/refresh.css">
</head>
<body>
  <a class="skip-link" href="#content">Перейти до змісту</a>
  <header class="site-header">
    <div class="shell brand-row"><a class="brand" href="/" aria-label="Лінь — головна сторінка"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p class="brand-note">Без осуду. Без спрощених діагнозів.</p></div>
    <div class="nav-wrap"><nav class="site-nav shell" aria-label="Головна навігація"><a href="/">Головна</a><a href="/statti/" aria-current="page">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про простір</a><a href="/bezpeka/">Безпека</a></nav></div>
  </header>

  <main id="content">
    <article class="article-page">
      <header class="article-header shell">
        <nav aria-label="Хлібні крихти"><a class="back-link" href="/${escapeHtml(item.cat_slug)}/">← Повернутися до розділу «${escapeHtml(item.cat)}»</a></nav>
        <div class="article-meta"><span>${escapeHtml(item.cat)}</span><span>${escapeHtml(item.time)} хв читання</span><span>Оновлено ${escapeHtml(updated)}</span></div>
        <h1>${escapeHtml(title)}</h1>
        <p class="article-lead">${escapeHtml(lead)}</p>
        <div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div>
        <div class="tag-list" aria-label="Теми статті">${(article.tags || [item.cat]).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </header>

      <div class="article-layout shell">
        <aside class="article-toc" aria-label="Зміст статті"><strong>Зміст статті</strong>${renderToc(article)}<a href="#help-title">Коли потрібна допомога</a>${article.faq?.length ? '<a href="#faq-title">Поширені запитання</a>' : ''}</aside>
        <div class="article-body">
          <p>${escapeHtml(intro)}</p>
          <section class="bot-cta" aria-labelledby="bot-cta-server"><p class="section-kicker">Практика до статті</p><h2 id="bot-cta-server">Продовжити роботу з цією темою</h2><p>Після читання можна одразу перейти до відповідного рівня HabitTeen у Telegram і зробити практичний розбір.</p><a class="button button-primary" href="${escapeHtml(botUrl)}" target="_blank" rel="noopener noreferrer">Пройти цей рівень у Telegram <span aria-hidden="true">↗</span></a></section>
          ${renderSections(article)}
          ${renderTable(article)}
          ${renderPractice(article)}
          ${renderHelp(article)}
          ${renderFaq(article)}
          ${renderSources(article, sources)}
        </div>
      </div>
      ${renderRelated(article, index)}
    </article>
  </main>

  <footer class="site-footer"><div class="shell footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український інформаційний простір про лінь, апатію та прокрастинацію.</p></div><nav class="footer-nav" aria-label="Навігація"><strong>Простір</strong><a href="/statti/">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про простір</a><a href="/bezpeka/">Безпека</a></nav><nav class="footer-nav" aria-label="Теми"><strong>Теми</strong><a href="/lin/">Лінь</a><a href="/apatiia/">Апатія</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/#faq">FAQ</a></nav></div><div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div></footer>

  <script src="/articles-index.js"></script>
  <script src="/article-topic-overrides.js"></script>
  <script src="/lazy-topic-overrides.js"></script>
  <script src="/apathy-topic-overrides.js"></script>
  <script src="/articles-index-45.js"></script>
  <script src="/phone-theme-update.js"></script>
  <script src="/article-router.js" defer></script>
  <script src="/article-toc-fix.js" defer></script>
  <script src="/script.js" defer></script>
</body>
</html>`;
}

function notFoundPage() {
  return '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Матеріал не знайдено | Лінь</title></head><body><main><h1>Матеріал не знайдено</h1><p><a href="/statti/">Повернутися до статей</a></p></main></body></html>';
}

export default function handler(request, response) {
  const slug = String(request.query?.slug || '').trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    response.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(notFoundPage());
    return;
  }

  try {
    const resolved = resolveArticle(slug);
    if (!resolved) {
      response.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(notFoundPage());
      return;
    }
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.status(200).send(renderPage(slug, resolved));
  } catch (error) {
    console.error('SSR article render failed', slug, error);
    response.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Article render failed');
  }
}
