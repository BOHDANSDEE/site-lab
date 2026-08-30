const SITE = 'https://xn--k1ae9bxb.online';

const CATEGORIES = {
  lin: { name: 'Лінь', path: '/lin/', intro: 'Лінь, мотивація, дисципліна та енергія і сили.' },
  apatiia: { name: 'Апатія', path: '/apatiia/', intro: 'Втрата інтересу, щастя, важкі емоції та здоров’я і самопочуття.' },
  prokrastynatsiia: { name: 'Прокрастинація', path: '/prokrastynatsiia/', intro: 'Як почати, зменшити тиск на себе, повернути увагу та змінювати себе.' }
};

const TOPICS = [
  { slug: 'lin', category: 'lin', title: 'Лінь', desc: 'Чому не хочеться діяти навіть тоді, коли справа важлива.', ready: true },
  { slug: 'motyvatsiia', category: 'lin', title: 'Мотивація', desc: 'Що робити, коли бажання діяти немає або воно швидко зникає.', ready: true },
  { slug: 'dystsyplina', category: 'lin', title: 'Дисципліна', desc: 'Як робити потрібне регулярно без режиму «все або нічого».', ready: true },
  { slug: 'enerhiia-ta-syly', category: 'lin', title: 'Енергія та сили', desc: 'Втома, сон, відновлення, навантаження та причини нестачі сил.', ready: true },

  { slug: 'vtrata-interesu', category: 'apatiia', title: 'Втрата інтересу', desc: 'Чому те, що раніше подобалося, може перестати цікавити.', ready: true },
  { slug: 'shchastia', category: 'apatiia', title: 'Як бути щасливим', desc: 'Що реально допомагає будувати задоволеніше життя без вимоги бути щасливим постійно.', ready: true },
  { slug: 'vazhki-emotsii', category: 'apatiia', title: 'Важкі емоції', desc: 'Тривога, страх, злість, провина, сором, втрата, безсилля та відчай.', ready: true },
  { slug: 'zdorovia-ta-samopochuttia', category: 'apatiia', title: 'Здоров’я та самопочуття', desc: 'Коли самопочуття впливає на сили, бажання діяти й повсякденне функціонування.', ready: false },

  { slug: 'yak-pochaty', category: 'prokrastynatsiia', title: 'Як почати', desc: 'Що відбувається до першої реальної дії і як полегшити старт.', ready: false },
  { slug: 'tysk-na-sebe', category: 'prokrastynatsiia', title: 'Тиск на себе', desc: 'Страх помилки, перфекціонізм, дедлайни та завищені вимоги до себе.', ready: false },
  { slug: 'uvaha-ta-kontsentratsiia', category: 'prokrastynatsiia', title: 'Увага та концентрація', desc: 'Телефон, відволікання, фокус і повернення уваги до важливої справи.', ready: false },
  { slug: 'yak-zminyty-sebe', category: 'prokrastynatsiia', title: 'Як змінити себе', desc: 'Як перевіряти звичні пояснення своєї поведінки й поступово будувати інші дії.', ready: false }
];

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function safeJson(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }

function renderTopicCards(items) {
  return items.map((item) => {
    const content = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc)}</p>`;
    return item.ready
      ? `<a class="article-card" href="/statti/${escapeHtml(item.slug)}/">${content}<span class="topic-status">Відкрити матеріали →</span></a>`
      : `<article class="article-card topic-card-pending" aria-label="${escapeHtml(item.title)} — матеріали готуються">${content}<span class="topic-status">Матеріали готуються</span></article>`;
  }).join('\n');
}
function renderCategoryCards() {
  return Object.values(CATEGORIES).map((category, index) => `<a class="topic-link" href="${category.path}"><span class="topic-number">0${index + 1}</span><span><h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.intro)}</p></span><span class="topic-arrow" aria-hidden="true">→</span></a>`).join('\n');
}

function renderPage(categoryKey = '') {
  const category = CATEGORIES[categoryKey] || null;
  const items = category ? TOPICS.filter((item) => item.category === categoryKey) : [];
  const canonicalPath = category ? category.path : '/statti/';
  const canonical = `${SITE}${canonicalPath}`;
  const pageTitle = category ? `${category.name} — 4 підблоки | Лінь` : 'Статті | Лінь';
  const description = category ? `${category.name}: чотири основні підблоки.` : 'Три розділи: лінь, апатія та прокрастинація. У кожному — чотири основні підблоки.';
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: category ? `${category.name}: підблоки` : 'Статті сайту «Лінь»', url: canonical, inLanguage: 'uk-UA',
    hasPart: category ? items.filter((item) => item.ready).map((item) => ({ '@type': 'WebPage', name: item.title, url: `${SITE}/statti/${item.slug}/` })) : Object.values(CATEGORIES).map((item) => ({ '@type': 'CollectionPage', name: item.name, url: `${SITE}${item.path}` }))
  };
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(pageTitle)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:locale" content="uk_UA"><meta property="og:title" content="${escapeHtml(pageTitle)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="Лінь"><meta name="theme-color" content="#eaf7ff"><script type="application/ld+json">${safeJson(jsonLd)}</script><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/refresh.css"></head><body><a class="skip-link" href="#content">Перейти до змісту</a><header class="site-header"><div class="shell brand-row"><a class="brand" href="/" aria-label="Лінь — головна"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p class="brand-note">Без осуду. Без спрощених відповідей.</p></div><div class="nav-wrap"><nav class="site-nav shell" aria-label="Головна навігація"><a href="/">Головна</a><a href="/statti/" aria-current="page">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про сайт</a><a href="/bezpeka/">Безпека</a></nav></div></header><main id="content"><section class="page-hero shell"><p class="eyebrow">${category ? escapeHtml(category.name) : 'Статті'}</p><h1>${category ? escapeHtml(category.name) : 'Оберіть розділ'}</h1><p class="page-intro">${category ? escapeHtml(category.intro) : 'Лінь, апатія або прокрастинація.'}</p>${category ? '<div class="page-actions"><a class="button button-secondary" href="/statti/">← До розділів</a></div>' : ''}</section><section class="section shell topic-choice-section">${category ? `<div class="article-grid">${renderTopicCards(items)}</div>` : `<div class="topic-list">${renderCategoryCards()}</div>`}</section></main><footer class="site-footer"><div class="shell footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український простір про лінь, прокрастинацію та апатію.</p></div><nav class="footer-nav" aria-label="Навігація"><strong>Сайт</strong><a href="/statti/">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про сайт</a><a href="/bezpeka/">Безпека</a></nav><nav class="footer-nav" aria-label="Розділи"><strong>Розділи</strong><a href="/lin/">Лінь</a><a href="/apatiia/">Апатія</a><a href="/prokrastynatsiia/">Прокрастинація</a></nav></div><div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div></footer><script src="/script.js" defer></script></body></html>`;
}

export default function handler(request, response) {
  const categoryKey = String(request.query?.category || '').trim();
  if (categoryKey && !CATEGORIES[categoryKey]) { response.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Category not found'); return; }
  response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.setHeader('Cache-Control', 'no-store, max-age=0'); response.setHeader('CDN-Cache-Control', 'no-store'); response.setHeader('Vercel-CDN-Cache-Control', 'no-store'); response.status(200).send(renderPage(categoryKey));
}
