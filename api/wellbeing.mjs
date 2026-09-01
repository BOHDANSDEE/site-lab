import { WELLBEING_ARTICLES } from '../article-data/wellbeing-articles-1.mjs';
import { WELLBEING_ARTICLES_2 } from '../article-data/wellbeing-articles-2.mjs';
import { WELLBEING_ARTICLES_3 } from '../article-data/wellbeing-articles-3.mjs';
import { WELLBEING_ARTICLES_4 } from '../article-data/wellbeing-articles-4.mjs';

const SITE = 'https://xn--k1ae9bxb.online';
const TOPIC_PATH = '/statti/zdorovia-ta-samopochuttia/';
const ARTICLES = [...WELLBEING_ARTICLES, ...WELLBEING_ARTICLES_2, ...WELLBEING_ARTICLES_3, ...WELLBEING_ARTICLES_4];
const ARTICLE_MAP = new Map(ARTICLES.map((article) => [article.slug, article]));

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

function articleText(article) {
  return [article.title, article.lead, ...(article.sections || []).flatMap((section) => [section.heading, ...(section.paragraphs || [])])].join(' ');
}

function wordCount(article) {
  return articleText(article).trim().split(/\s+/).filter(Boolean).length;
}

function readMinutes(article) {
  return Math.max(3, Math.ceil(wordCount(article) / 190));
}

function header() {
  return `<a class="skip-link" href="#content">Перейти до змісту</a><header class="site-header"><div class="shell brand-row"><a class="brand" href="/" aria-label="Лінь — головна"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p class="brand-note">Без осуду. Без спрощених відповідей.</p></div><div class="nav-wrap"><nav class="site-nav shell" aria-label="Головна навігація"><a href="/">Головна</a><a href="/statti/" aria-current="page">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про сайт</a><a href="/bezpeka/">Безпека</a></nav></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="shell footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український простір про лінь, апатію та прокрастинацію.</p></div><nav class="footer-nav" aria-label="Навігація"><strong>Сайт</strong><a href="/statti/">Статті</a><a href="/pro-sait/">Про сайт</a><a href="/bezpeka/">Безпека</a></nav><nav class="footer-nav" aria-label="Розділи"><strong>Розділи</strong><a href="/lin/">Лінь</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/apatiia/">Апатія</a></nav></div><div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div></footer>`;
}

function pageShell({ title, description, canonical, type = 'website', jsonLd, body }) {
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="${canonical}"><meta property="og:type" content="${type}"><meta property="og:locale" content="uk_UA"><meta property="og:title" content="${escapeHtml(title.replace(/ \| Лінь$/, ''))}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="Лінь"><meta name="theme-color" content="#eaf7ff"><script type="application/ld+json">${safeJson(jsonLd)}</script><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/refresh.css"></head><body>${header()}${body}${footer()}<script src="/script.js" defer></script></body></html>`;
}

function renderCatalog() {
  const canonical = `${SITE}${TOPIC_PATH}`;
  const description = '20 матеріалів про втому, слабкість, сонливість та інші зміни самопочуття: що можна перевірити вдома і коли варто звернутися до лікаря.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Здоров’я та самопочуття',
    url: canonical,
    inLanguage: 'uk-UA',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ARTICLES.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${canonical}${article.slug}/`
      }))
    }
  };
  const cards = ARTICLES.map((article) => `<a class="article-card" href="${TOPIC_PATH}${escapeHtml(article.slug)}/"><span>Здоров’я та самопочуття · ${readMinutes(article)} хв</span><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.lead)}</p></a>`).join('');
  const body = `<main id="content"><section class="page-hero shell"><p class="eyebrow">Апатія / самопочуття</p><h1>Здоров’я та самопочуття</h1><p class="page-intro">Коли слабкість, сонливість, біль або інші симптоми заважають звичним справам, продуктивність не варто оцінювати окремо від стану організму. Ці матеріали допомагають зібрати контекст без самодіагностики.</p><div class="page-actions"><a class="button button-secondary" href="/apatiia/">← До розділу «Апатія»</a></div></section><section class="section shell"><div class="article-grid">${cards}</div></section></main>`;
  return pageShell({ title: 'Здоров’я та самопочуття: 20 матеріалів | Лінь', description, canonical, jsonLd, body });
}

function renderArticle(article) {
  const canonical = `${SITE}${TOPIC_PATH}${article.slug}/`;
  const minutes = readMinutes(article);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.metaDescription,
        inLanguage: 'uk-UA',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: { '@type': 'Organization', name: 'Редакція «Лінь»' },
        publisher: { '@type': 'Organization', name: 'Лінь', url: `${SITE}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Головна', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Статті', item: `${SITE}/statti/` },
          { '@type': 'ListItem', position: 3, name: 'Здоров’я та самопочуття', item: `${SITE}${TOPIC_PATH}` },
          { '@type': 'ListItem', position: 4, name: article.title, item: canonical }
        ]
      }
    ]
  };
  const sections = (article.sections || []).map((section) => `<section class="topic-section-block"><h2>${escapeHtml(section.heading)}</h2>${(section.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('');
  const related = ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 3).map((item) => `<a class="article-card" href="${TOPIC_PATH}${escapeHtml(item.slug)}/"><span>${readMinutes(item)} хв</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.lead)}</p></a>`).join('');
  const body = `<main id="content"><article class="article-page"><header class="article-header shell"><nav aria-label="Хлібні крихти"><a class="back-link" href="${TOPIC_PATH}">← Здоров’я та самопочуття</a></nav><div class="article-meta"><span>Здоров’я та самопочуття</span><span>${minutes} хв читання</span></div><h1>${escapeHtml(article.title)}</h1><p class="article-lead">${escapeHtml(article.lead)}</p><div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div></header><div class="article-layout shell"><aside class="article-toc" aria-label="Навігація"><strong>У цьому матеріалі</strong><a href="#content-body">Пояснення й дії</a><a href="#next-step">Що робити далі</a></aside><div class="article-body" id="content-body">${sections}<section class="practice-box" id="next-step"><div class="practice-heading"><span>Наступний крок</span></div><h2>Не зводьте самопочуття до сили волі</h2><p>Якщо симптом повторюється або помітно змінює ваше звичне функціонування, зафіксуйте час появи, тривалість, супутні ознаки та зміни від вашої норми. Якщо в матеріалі описані ознаки, що потребують швидкої допомоги, не відкладайте звернення.</p><p>Для пов’язаних побутових причин можна також переглянути <a href="/statti/enerhiia-ta-syly/">матеріали про енергію та відновлення</a>. Якщо зміни самопочуття поєднуються з тривалою втратою інтересу, є окремий розділ <a href="/statti/vtrata-interesu/">«Втрата інтересу»</a>.</p></section><section class="bot-cta bot-cta-final"><p class="section-kicker">Безпека</p><h2>Сумніваєтеся, чи симптом небезпечний?</h2><p>Матеріали сайту не замінюють медичну допомогу. Перевірте короткі правила, коли варто звертатися терміново.</p><a class="button button-primary" href="/bezpeka/">Відкрити правила безпеки →</a></section></div></div><section class="section shell related-section"><div class="section-heading"><p class="section-kicker">Пов’язані матеріали</p><h2>Ще про самопочуття</h2></div><div class="article-grid">${related}</div></section></article></main>`;
  return pageShell({ title: `${article.title} | Лінь`, description: article.metaDescription, canonical, type: 'article', jsonLd, body });
}

function notFound() {
  return '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Матеріал не знайдено | Лінь</title></head><body><main><h1>Матеріал не знайдено</h1><p><a href="/statti/zdorovia-ta-samopochuttia/">До матеріалів про самопочуття</a></p></main></body></html>';
}

export default function handler(request, response) {
  const slug = String(request.query?.slug || '').trim().toLowerCase();
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  if (!slug) {
    response.status(200).send(renderCatalog());
    return;
  }
  if (!/^[a-z0-9-]+$/.test(slug) || !ARTICLE_MAP.has(slug)) {
    response.status(404).send(notFound());
    return;
  }
  response.status(200).send(renderArticle(ARTICLE_MAP.get(slug)));
}
