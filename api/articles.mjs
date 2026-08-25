const SITE = 'https://xn--k1ae9bxb.online';

const CATEGORIES = {
  lin: {
    name: 'Лінь',
    path: '/lin/',
    intro: 'Лінь, мотивація, дисципліна та способи зробити повсякденне життя простішим.'
  },
  prokrastynatsiia: {
    name: 'Прокрастинація',
    path: '/prokrastynatsiia/',
    intro: 'Відкладання, складний старт, тиск на себе, швидкі розваги та звички.'
  },
  apatiia: {
    name: 'Апатія',
    path: '/apatiia/',
    intro: 'Втрата інтересу, виснаження, повернення після паузи та віддалення від людей.'
  }
};

const TOPICS = [
  { slug: 'lin', category: 'lin', title: 'Лінь', desc: 'Чому не хочеться діяти навіть тоді, коли справа важлива.' },
  { slug: 'motyvatsiia', category: 'lin', title: 'Мотивація', desc: 'Що робити, коли бажання діяти немає або воно швидко зникає.' },
  { slug: 'dystsyplina', category: 'lin', title: 'Дисципліна', desc: 'Як робити потрібне регулярно без режиму «все або нічого».' },
  { slug: 'krashche-zhyttia', category: 'lin', title: 'Краще життя', desc: 'Ранок, побут, інформаційний шум, увага та прості зміни в щоденному житті.' },
  { slug: 'yak-nareshti-pochaty', category: 'prokrastynatsiia', title: 'Як нарешті почати', desc: 'Чому ми відкладаємо старт і що відбувається до першої реальної дії.' },
  { slug: 'tysk-na-sebe', category: 'prokrastynatsiia', title: 'Тиск на себе', desc: 'Страх помилки, перфекціонізм, дедлайни та завищені вимоги до себе.' },
  { slug: 'shchaslyve-zhyttia', category: 'prokrastynatsiia', title: 'Щасливе життя', desc: 'Телефон, TikTok, YouTube, ігри та баланс між швидкими розвагами й рештою життя.' },
  { slug: 'yak-zminyty-svoi-zvychky', category: 'prokrastynatsiia', title: 'Як змінити свої звички', desc: 'Як автоматична поведінка закріплюється і як поступово її змінювати.' },
  { slug: 'vtrata-interesu', category: 'apatiia', title: 'Втрата інтересу', desc: 'Чому те, що раніше подобалося, може перестати цікавити.' },
  { slug: 'vysnazhennia-i-perevantazhennia', category: 'apatiia', title: 'Виснаження і перевантаження', desc: 'Коли справ і напруги стає забагато, а навіть прості дії здаються важкими.' },
  { slug: 'povernennia-pislia-zavysannia', category: 'apatiia', title: 'Повернення після зависання', desc: 'Як повернутися до звичних справ після кількох днів або довшої паузи.' },
  { slug: 'viddalennia-vid-liudei-i-zhyttia', category: 'apatiia', title: 'Віддалення від людей і життя', desc: 'Коли дедалі менше хочеться відповідати, виходити з дому й підтримувати контакт.' }
];

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

function renderTopicCards(items) {
  return items.map((item) => `<a class="article-card" href="/statti/${escapeHtml(item.slug)}/">
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.desc)}</p>
  </a>`).join('\n');
}

function renderLibraryGroups() {
  return Object.entries(CATEGORIES).map(([key, category]) => {
    const items = TOPICS.filter((item) => item.category === key);
    return `<section class="library-group" aria-labelledby="${key}-title">
      <div class="library-group-heading">
        <div>
          <p class="section-kicker">${escapeHtml(category.name)}</p>
          <h2 id="${key}-title">${escapeHtml(category.name)}</h2>
          <p>${escapeHtml(category.intro)}</p>
        </div>
        <a class="text-link" href="${category.path}">Відкрити розділ →</a>
      </div>
      <div class="article-grid">${renderTopicCards(items)}</div>
    </section>`;
  }).join('\n');
}

function renderPage(categoryKey = '') {
  const category = CATEGORIES[categoryKey] || null;
  const items = category ? TOPICS.filter((item) => item.category === categoryKey) : TOPICS;
  const canonicalPath = category ? category.path : '/statti/';
  const canonical = `${SITE}${canonicalPath}`;
  const pageTitle = category ? `${category.name} — статті | Лінь` : 'Статті про лінь, прокрастинацію та апатію | Лінь';
  const description = category
    ? `${category.name}: чотири основні теми для майбутніх матеріалів.`
    : '12 тем про лінь, прокрастинацію та апатію, згрупованих у три розділи.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category ? `${category.name}: статті` : 'Статті сайту «Лінь»',
    url: canonical,
    inLanguage: 'uk-UA',
    hasPart: items.map((item) => ({
      '@type': 'WebPage',
      name: item.title,
      url: `${SITE}/statti/${item.slug}/`
    }))
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
  </header>

  <main id="content">
    <section class="page-hero shell">
      <p class="eyebrow">${category ? escapeHtml(category.name) : '12 тем · 3 розділи'}</p>
      <h1>${category ? escapeHtml(category.name) : 'Статті'}</h1>
      <p class="page-intro">${category ? escapeHtml(category.intro) : 'Виберіть тему, яку хочете прочитати. Усі 12 майбутніх статей уже мають окремі сторінки.'}</p>
      ${category ? '<div class="page-actions"><a class="button button-secondary" href="/statti/">← Усі статті</a></div>' : ''}
    </section>

    <section class="section shell topic-choice-section">
      ${category
        ? `<div class="section-heading"><h2>Статті</h2></div><div class="article-grid">${renderTopicCards(items)}</div>`
        : renderLibraryGroups()}
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український простір про лінь, прокрастинацію та апатію.</p></div>
      <nav class="footer-nav" aria-label="Навігація"><strong>Сайт</strong><a href="/statti/">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про сайт</a><a href="/bezpeka/">Безпека</a></nav>
      <nav class="footer-nav" aria-label="Розділи"><strong>Розділи</strong><a href="/lin/">Лінь</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/apatiia/">Апатія</a></nav>
    </div>
    <div class="shell footer-bottom"><span>© <span data-current-year>2026</span> Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div>
  </footer>
  <script src="/script.js" defer></script>
</body>
</html>`;
}

export default function handler(request, response) {
  const categoryKey = String(request.query?.category || '').trim();
  if (categoryKey && !CATEGORIES[categoryKey]) {
    response.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Category not found');
    return;
  }

  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  response.status(200).send(renderPage(categoryKey));
}
