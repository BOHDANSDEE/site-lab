import { LIN_ARTICLES, LIN_ARTICLE_MAP, LIN_GROUPS, LIN_SOURCES } from './lin-experiment-data.mjs';

const SITE = 'https://xn--k1ae9bxb.online';
const UPDATED_LABEL = '26 серпня 2026 р.';
const UPDATED_ISO = '2026-08-26';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function inlineMarkdown(value) {
  const escaped = escapeHtml(value);
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function trimDescription(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text;
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

function shellHeader() {
  return `<a class="skip-link" href="#content">Перейти до змісту</a>
  <header class="site-header">
    <div class="shell brand-row">
      <a class="brand" href="/" aria-label="Лінь — головна"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a>
      <p class="brand-note">Без осуду. Без спрощених відповідей.</p>
    </div>
    <div class="nav-wrap">
      <nav class="site-nav shell" aria-label="Головна навігація">
        <a href="/">Головна</a>
        <a href="/statti/" aria-current="page">Статті</a>
        <a href="/psykholoham/">Психологам</a>
        <a href="/pro-sait/">Про сайт</a>
        <a href="/bezpeka/">Безпека</a>
      </nav>
    </div>
  </header>`;
}

function shellFooter() {
  return `<footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український простір про лінь, апатію та прокрастинацію.</p></div>
      <nav class="footer-nav" aria-label="Навігація"><strong>Сайт</strong><a href="/statti/">Статті</a><a href="/pro-sait/">Про сайт</a><a href="/bezpeka/">Безпека</a></nav>
      <nav class="footer-nav" aria-label="Розділи"><strong>Розділи</strong><a href="/lin/">Лінь</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/apatiia/">Апатія</a></nav>
    </div>
    <div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div>
  </footer>`;
}

function renderCatalog() {
  const canonical = `${SITE}/statti/lin-vybir/`;
  const description = '20 конкретних ситуацій про лінь, складний старт, невпевненість, зусилля та швидку винагороду. Оберіть ту, що найближча до вашої ситуації.';
  const groups = LIN_GROUPS.map((group, groupIndex) => {
    const cards = LIN_ARTICLES
      .filter((article) => article.group === groupIndex)
      .map((article) => `<a class="article-card lin-choice-card" href="/statti/lin/${escapeHtml(article.slug)}/"><span>Лінь · ${escapeHtml(article.readMinutes)} хв</span><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.lead)}</p></a>`)
      .join('');
    return `<section class="library-group">
      <div class="library-group-heading"><div><p class="section-kicker">Ситуації ${groupIndex + 1}</p><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.intro)}</p></div></div>
      <div class="article-grid">${cards}</div>
    </section>`;
  }).join('');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Лінь — обрати ситуацію',
    url: canonical,
    inLanguage: 'uk-UA',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: LIN_ARTICLES.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${SITE}/statti/lin/${article.slug}/`
      }))
    }
  };

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>Лінь: обрати свою ситуацію | Лінь</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:title" content="Лінь: обрати свою ситуацію">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Лінь">
  <meta name="theme-color" content="#eaf7ff">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/refresh.css">
</head>
<body>
  ${shellHeader()}
  <main id="content">
    <section class="page-hero shell lin-picker-hero">
      <p class="eyebrow">Лінь · обрати вручну</p>
      <h1>Знайди ситуацію, яка схожа на твою</h1>
      <p class="page-intro">Тут не потрібно вгадувати психологічний «тип». Відкрий опис, який найближче передає те, що реально відбувається у твоєму житті.</p>
      <div class="page-actions"><a class="button button-secondary" href="/statti/lin/">← До теми «Лінь»</a></div>
    </section>
    <section class="section shell lin-picker-list">${groups}</section>
  </main>
  ${shellFooter()}
  <script src="/script.js" defer></script>
</body>
</html>`;
}

function renderArticleSection(section, index) {
  const id = `${slugify(section.heading, index)}-title`;
  const paragraphs = section.paragraphs.map((paragraph) => `<p>${inlineMarkdown(paragraph)}</p>`).join('');
  const className = section.kind === 'science' ? 'topic-section-block science-section' : 'topic-section-block';
  return `<section class="${className}" aria-labelledby="${escapeHtml(id)}"><h2 id="${escapeHtml(id)}">${escapeHtml(section.heading)}</h2>${paragraphs}</section>`;
}

function renderArticle(article) {
  const canonical = `${SITE}/statti/lin/${article.slug}/`;
  const description = trimDescription(article.lead);
  const sources = article.sourceKeys.map((key) => LIN_SOURCES[key]).filter(Boolean);
  const related = LIN_ARTICLES.filter((candidate) => candidate.group === article.group && candidate.slug !== article.slug).slice(0, 3);
  const botUrl = `https://t.me/HabitTeen_bot?start=article_${encodeURIComponent(article.slug)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description,
        inLanguage: 'uk-UA',
        dateModified: UPDATED_ISO,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: { '@type': 'Organization', name: 'Редакція «Лінь»' },
        publisher: { '@type': 'Organization', name: 'Лінь', url: `${SITE}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Головна', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Статті', item: `${SITE}/statti/` },
          { '@type': 'ListItem', position: 3, name: 'Лінь', item: `${SITE}/statti/lin/` },
          { '@type': 'ListItem', position: 4, name: 'Обрати вручну', item: `${SITE}/statti/lin-vybir/` },
          { '@type': 'ListItem', position: 5, name: article.title, item: canonical }
        ]
      }
    ]
  };

  const toc = article.sections.map((section, index) => {
    const id = `${slugify(section.heading, index)}-title`;
    return `<a href="#${escapeHtml(id)}">${escapeHtml(section.heading)}</a>`;
  }).join('');

  const actionList = `<section class="topic-section-block" aria-labelledby="actions-title"><h2 id="actions-title">Що можна спробувати</h2><ol class="check-list">${article.actions.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ol></section>`;
  const phrase = `<section class="practice-box lin-phrase" aria-labelledby="phrase-title"><div class="practice-heading"><span>На момент, коли хочеться відкласти</span></div><h2 id="phrase-title">Коротка фраза</h2><blockquote>${escapeHtml(article.phrase)}</blockquote><p>Це не афірмація і не спроба переконати себе в тому, чого ти не відчуваєш. Фраза потрібна як коротке нагадування між імпульсом і дією.</p></section>`;
  const sourceBlock = sources.length ? `<section class="topic-section-block" aria-labelledby="sources-title"><h2 id="sources-title">Наукові джерела</h2><p>Ці джерела підтримують механізми, про які йдеться вище. Вони не доводять, що одна й та сама причина пояснює поведінку кожної людини.</p><ul class="source-list">${sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} <span>Відкрити джерело ↗</span></a></li>`).join('')}</ul></section>` : '';
  const bot = `<section class="bot-cta bot-cta-final" aria-labelledby="bot-title"><p class="section-kicker">Твоя конкретна ситуація</p><h2 id="bot-title">Продовжити розбір у боті</h2><p>Стаття дає одну робочу гіпотезу, але не знає деталей твого випадку. Бот може продовжити вже з конкретного питання:</p><p class="bot-question"><strong>${escapeHtml(article.botQuestion)}</strong></p><a class="button button-primary" href="${escapeHtml(botUrl)}" target="_blank" rel="noopener noreferrer">Розібрати мою ситуацію <span aria-hidden="true">↗</span></a></section>`;

  const relatedBlock = related.length ? `<section class="section shell related-section"><div class="section-heading"><p class="section-kicker">Схожі ситуації</p><h2>Можливо, ближче інший опис</h2></div><div class="article-grid">${related.map((item) => `<a class="article-card" href="/statti/lin/${escapeHtml(item.slug)}/"><span>Лінь · ${escapeHtml(item.readMinutes)} хв</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.lead)}</p></a>`).join('')}</div></section>` : '';

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>${escapeHtml(article.title)} | Лінь</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Лінь">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#eaf7ff">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/refresh.css">
</head>
<body>
  ${shellHeader()}
  <main id="content">
    <article class="article-page lin-experiment-article">
      <header class="article-header shell">
        <nav aria-label="Хлібні крихти"><a class="back-link" href="/statti/lin-vybir/">← До вибору ситуації</a></nav>
        <div class="article-meta"><span>Лінь</span><span>${escapeHtml(article.readMinutes)} хв читання</span><span>Оновлено ${UPDATED_LABEL}</span></div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-lead">${escapeHtml(article.lead)}</p>
        <div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div>
      </header>

      <div class="article-layout shell">
        <aside class="article-toc" aria-label="Зміст статті"><strong>Зміст статті</strong>${toc}<a href="#actions-title">Що можна спробувати</a><a href="#phrase-title">Коротка фраза</a><a href="#sources-title">Наукові джерела</a><a href="#bot-title">Продовжити в боті</a></aside>
        <div class="article-body">
          ${article.sections.map(renderArticleSection).join('')}
          ${actionList}
          ${phrase}
          ${sourceBlock}
          ${bot}
        </div>
      </div>
      ${relatedBlock}
    </article>
  </main>
  ${shellFooter()}
  <script src="/script.js" defer></script>
</body>
</html>`;
}

function notFound() {
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Матеріал не знайдено | Лінь</title></head><body><main><h1>Матеріал не знайдено</h1><p><a href="/statti/lin-vybir/">Повернутися до вибору</a></p></main></body></html>`;
}

export default function handler(request, response) {
  try {
    const view = String(request.query?.view || '').trim().toLowerCase();
    if (view === 'catalog') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      response.status(200).send(renderCatalog());
      return;
    }

    const slug = String(request.query?.slug || '').trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      response.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(notFound());
      return;
    }

    const article = LIN_ARTICLE_MAP.get(slug);
    if (!article) {
      response.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(notFound());
      return;
    }

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.status(200).send(renderArticle(article));
  } catch (error) {
    console.error('lin experiment render failed', error);
    response.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Render failed');
  }
}
