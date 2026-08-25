const SITE = 'https://xn--k1ae9bxb.online';

const CATEGORIES = {
  lin: {
    name: 'Лінь',
    path: '/lin/',
    intro: 'Лінь, мотивація, дисципліна та повсякденні способи зробити життя простішим.'
  },
  prokrastynatsiia: {
    name: 'Прокрастинація',
    path: '/prokrastynatsiia/',
    intro: 'Старт, внутрішній тиск, швидкі стимули та звички, які підтримують відкладання.'
  },
  apatiia: {
    name: 'Апатія',
    path: '/apatiia/',
    intro: 'Втрата інтересу, виснаження, повернення після паузи та віддалення від людей і життя.'
  }
};

const TOPICS = [
  {
    slug: 'lin',
    category: 'lin',
    title: 'Лінь',
    desc: 'Чому навіть важлива справа може викликати опір і що насправді стоїть за відчуттям «не хочу».'
  },
  {
    slug: 'motyvatsiia',
    category: 'lin',
    title: 'Мотивація',
    desc: 'Що відбувається, коли бажання діяти немає, швидко зникає або з’являється лише на короткий час.'
  },
  {
    slug: 'dystsyplina',
    category: 'lin',
    title: 'Дисципліна',
    desc: 'Як робити потрібне регулярніше без постійної боротьби із собою та без режиму «все або нічого».'
  },
  {
    slug: 'krashche-zhyttia',
    category: 'lin',
    title: 'Краще життя',
    desc: 'Ранок, побут, інформаційний шум, увага й прості зміни, які роблять повсякденне життя легшим.'
  },
  {
    slug: 'yak-nareshti-pochaty',
    category: 'prokrastynatsiia',
    title: 'Як нарешті почати',
    desc: 'Чому ми відкладаємо старт, зависаємо перед завданням і готуємося замість того, щоб перейти до дії.'
  },
  {
    slug: 'tysk-na-sebe',
    category: 'prokrastynatsiia',
    title: 'Тиск на себе',
    desc: 'Страх помилки, перфекціонізм, дедлайни та ситуації, коли власні вимоги роблять початок ще важчим.'
  },
  {
    slug: 'shchaslyve-zhyttia',
    category: 'prokrastynatsiia',
    title: 'Щасливе життя',
    desc: 'Телефон, TikTok, YouTube, ігри та інші швидкі стимули — як не віддати їм увесь вільний час і увагу.'
  },
  {
    slug: 'yak-zminyty-svoi-zvychky',
    category: 'prokrastynatsiia',
    title: 'Як змінити свої звички',
    desc: 'Чому стара поведінка запускається автоматично та як зробити нову дію простішою для повторення.'
  },
  {
    slug: 'vtrata-interesu',
    category: 'apatiia',
    title: 'Втрата інтересу',
    desc: 'Чому те, що раніше захоплювало, може перестати цікавити і як розібратися, що саме змінилося.'
  },
  {
    slug: 'vysnazhennia-i-perevantazhennia',
    category: 'apatiia',
    title: 'Виснаження і перевантаження',
    desc: 'Що відбувається, коли справ і напруги стає забагато, а навіть прості дії починають здаватися важкими.'
  },
  {
    slug: 'povernennia-pislia-zavysannia',
    category: 'apatiia',
    title: 'Повернення після зависання',
    desc: 'Як повернутися до справ після кількох порожніх днів, зриву або довгої паузи без самозвинувачення.'
  },
  {
    slug: 'viddalennia-vid-liudei-i-zhyttia',
    category: 'apatiia',
    title: 'Віддалення від людей і життя',
    desc: 'Коли все менше хочеться відповідати, виходити з дому, підтримувати контакт і бути включеним у звичне життя.'
  }
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

function topicCards(items) {
  return items.map((item) => `<a class="article-card" href="/statti/${escapeHtml(item.slug)}/">
    <span>Тема</span>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.desc)}</p>
  </a>`).join('\n');
}

function categoryCards() {
  return Object.entries(CATEGORIES).map(([key, category], index) => {
    const count = TOPICS.filter((item) => item.category === key).length;
    return `<a class="topic-link" href="${category.path}">
      <span class="topic-number">0${index + 1}</span>
      <span><h3>${category.name}</h3><p>${count} теми. ${category.intro}</p></span>
      <span class="topic-arrow" aria-hidden="true">→</span>
    </a>`;
  }).join('\n');
}

function renderPage(categoryKey = '') {
  const category = CATEGORIES[categoryKey] || null;
  const items = category ? TOPICS.filter((item) => item.category === categoryKey) : [];
  const canonicalPath = category ? category.path : '/statti/';
  const canonical = `${SITE}${canonicalPath}`;
  const pageTitle = category
    ? `${category.name}: 4 основні теми | Лінь`
    : 'Лінь, прокрастинація та апатія — оберіть напрям | Лінь';
  const description = category
    ? `${category.name}: 4 основні теми, з яких можна почати розбір своєї ситуації.`
    : 'Три головні напрямки: лінь, прокрастинація та апатія. Оберіть напрям і тему, яка найбільше схожа на вашу ситуацію.';

  const jsonLd = category
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name}: основні теми`,
        url: canonical,
        inLanguage: 'uk-UA',
        hasPart: items.map((item) => ({
          '@type': 'WebPage',
          name: item.title,
          url: `${SITE}/statti/${item.slug}/`
        }))
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Лінь, прокрастинація та апатія',
        url: canonical,
        inLanguage: 'uk-UA'
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
        <a href="/statti/" aria-current="page">Теми</a>
        <a href="/psykholoham/">Психологам</a>
        <a href="/pro-sait/">Про простір</a>
        <a href="/bezpeka/">Безпека</a>
      </nav>
    </div>
  </header>

  <main id="content">
    <section class="page-hero shell">
      <p class="eyebrow">${category ? 'Один напрям · чотири теми' : 'Три напрямки · дванадцять тем'}</p>
      <h1>${category ? escapeHtml(category.name) : 'Оберіть, що зараз найбільше схоже на вашу ситуацію'}</h1>
      <p class="page-intro">${category ? escapeHtml(category.intro) : 'Почніть із ліні, прокрастинації або апатії. Усередині кожного розділу — чотири окремі теми без зайвого дублювання.'}</p>
      ${category ? '<div class="page-actions"><a class="button button-secondary" href="/statti/">← Усі напрямки</a></div>' : ''}
    </section>

    <section class="section shell">
      <div class="section-heading">
        <p class="section-kicker">${category ? '4 теми' : '3 напрямки'}</p>
        <h2>${category ? 'Оберіть тему' : 'З чого почати'}</h2>
        <p>${category ? 'Натисніть на тему, яка найближча до вашої ситуації. Наповнення цих сторінок ми додамо наступним етапом.' : 'Якщо сумніваєтеся, оберіть найближчий за відчуттям напрям — пізніше додамо короткий тест, який допоможе точніше підібрати матеріал.'}</p>
      </div>
      ${category ? `<div class="article-grid">${topicCards(items)}</div>` : `<div class="topic-list">${categoryCards()}</div>`}
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a><p>Український простір про лінь, апатію та прокрастинацію.</p></div>
      <nav class="footer-nav" aria-label="Навігація"><strong>Простір</strong><a href="/statti/">Теми</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про простір</a><a href="/bezpeka/">Безпека</a></nav>
      <nav class="footer-nav" aria-label="Напрямки"><strong>Напрямки</strong><a href="/lin/">Лінь</a><a href="/prokrastynatsiia/">Прокрастинація</a><a href="/apatiia/">Апатія</a></nav>
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
  response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  response.setHeader('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  response.status(200).send(renderPage(categoryKey));
}
