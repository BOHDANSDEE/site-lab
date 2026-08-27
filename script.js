document.documentElement.style.colorScheme = 'only light';

if (!document.querySelector('meta[name="color-scheme"]')) {
  const colorSchemeMeta = document.createElement('meta');
  colorSchemeMeta.name = 'color-scheme';
  colorSchemeMeta.content = 'light only';
  document.head.append(colorSchemeMeta);
}

// Keep every reachable page consistent with the current site navigation.
document.querySelectorAll('a[href="/statti/"]').forEach((link) => {
  const label = link.textContent.trim();
  if (label === 'Теми' || label === 'Статті') link.textContent = 'Статті';
});

document.querySelectorAll('a[href="/pro-sait/"]').forEach((link) => {
  if (link.textContent.trim() === 'Про простір') link.textContent = 'Про сайт';
});

document.querySelectorAll('.footer-nav strong').forEach((heading) => {
  if (heading.textContent.trim() === 'Простір') heading.textContent = 'Сайт';
  if (heading.textContent.trim() === 'Напрямки') heading.textContent = 'Розділи';
});

const blankTopicHero = document.querySelector('.blank-topic-hero');
if (blankTopicHero) {
  const eyebrow = blankTopicHero.querySelector('.eyebrow');
  const backLink = blankTopicHero.querySelector('.page-actions a');
  const categoryName = eyebrow?.textContent.replace('· майбутня стаття', '').trim();

  if (eyebrow && categoryName) eyebrow.textContent = categoryName;
  if (backLink && categoryName) backLink.textContent = `← До розділу «${categoryName}»`;
}

// The article-list page for «Лінь» is a subblock page, so its back button must
// return to the parent section rather than loop back into the same subblock.
const linCatalogBackLink = document.querySelector('.lin-picker-hero .page-actions a');
if (linCatalogBackLink) {
  linCatalogBackLink.href = '/lin/';
  linCatalogBackLink.textContent = '← До розділу «Лінь»';
}

const escapeTopicHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const motivationGroups = [
  {
    title: 'Коли треба запустити мотивацію',
    intro: 'Початок, відсутність бажання і конкретні сфери, де важко зрушити з місця.'
  },
  {
    title: 'Коли мотивація зникає в процесі',
    intro: 'Повільний результат, невдачі, побут і довгі цілі, де одного натхнення недостатньо.'
  },
  {
    title: 'Навчання, робота і самомотивація',
    intro: 'Ситуації, де потрібно продовжувати без постійного зовнішнього контролю.'
  },
  {
    title: 'Довгі цілі та повернення до дії',
    intro: 'Як не зависати після паузи, доводити почате до кінця і підтримувати особисті проєкти.'
  }
];

async function renderMotivationTopicList(canvas) {
  const modules = await Promise.all([
    import('/article-data/motivation-articles-1.mjs'),
    import('/article-data/motivation-articles-2.mjs'),
    import('/article-data/motivation-articles-3.mjs'),
    import('/article-data/motivation-articles-4.mjs')
  ]);

  const articles = [
    ...(modules[0].MOTIVATION_ARTICLES_1 || []),
    ...(modules[1].MOTIVATION_ARTICLES_2 || []),
    ...(modules[2].MOTIVATION_ARTICLES_3 || []),
    ...(modules[3].MOTIVATION_ARTICLES_4 || [])
  ];

  const groups = motivationGroups.map((group, groupIndex) => {
    const groupArticles = articles.slice(groupIndex * 5, groupIndex * 5 + 5);
    const cards = groupArticles.map((article, itemIndex) => {
      const globalIndex = groupIndex * 5 + itemIndex + 1;
      const href = `/statti/motyvatsiia/${escapeTopicHtml(article.slug)}/`;
      return `
        <article class="article-card topic-library-card">
          <span class="topic-library-meta">${String(globalIndex).padStart(2, '0')} · ${escapeTopicHtml(article.readMinutes)} хв</span>
          <h3>${escapeTopicHtml(article.title)}</h3>
          <p>${escapeTopicHtml(article.lead)}</p>
          <a class="topic-library-button" href="${href}">Читати статтю <span aria-hidden="true">→</span></a>
        </article>
      `;
    }).join('');

    return `
      <section class="topic-library-section" aria-labelledby="motivation-group-${groupIndex + 1}">
        <div class="topic-library-section-heading">
          <p class="section-kicker">Розділ ${groupIndex + 1}</p>
          <h2 id="motivation-group-${groupIndex + 1}">${escapeTopicHtml(group.title)}</h2>
          <p>${escapeTopicHtml(group.intro)}</p>
        </div>
        <div class="article-grid topic-library-grid">${cards}</div>
      </section>
    `;
  }).join('');

  canvas.classList.add('topic-article-library');
  canvas.innerHTML = `
    <div class="topic-library-heading">
      <p class="section-kicker">20 статей</p>
      <h2>Обери те, що зараз найближче</h2>
      <p>Статті розділені на чотири блоки, щоб не шукати потрібну тему в суцільному списку.</p>
    </div>
    ${groups}
  `;
}

function upgradeLinCatalogCards() {
  const cards = [...document.querySelectorAll('.lin-picker-list a.lin-choice-card')];
  if (!cards.length) return;

  cards.forEach((card) => {
    const href = card.getAttribute('href');
    const article = document.createElement('article');
    article.className = 'article-card lin-choice-card topic-library-card';

    const meta = card.querySelector(':scope > span')?.outerHTML || '';
    const title = card.querySelector('h3')?.outerHTML || '';
    const description = card.querySelector('p')?.outerHTML || '';

    article.innerHTML = `${meta}${title}${description}<a class="topic-library-button" href="${escapeTopicHtml(href)}">Читати статтю <span aria-hidden="true">→</span></a>`;
    card.replaceWith(article);
  });
}

upgradeLinCatalogCards();

const blankArticleCanvas = document.querySelector('.article-canvas');
if (blankArticleCanvas) {
  const topicPath = location.pathname.replace(/\/+$/, '/');

  if (topicPath === '/statti/motyvatsiia/') {
    renderMotivationTopicList(blankArticleCanvas).catch((error) => {
      console.error('Не вдалося завантажити список статей «Мотивація».', error);
      blankArticleCanvas.innerHTML = `
        <div class="topic-entry-actions">
          <p class="section-kicker">Мотивація</p>
          <h2>Не вдалося завантажити список статей</h2>
          <p class="topic-entry-note">Онови сторінку. Якщо помилка повториться, повернися до розділу статей.</p>
          <div class="page-actions"><a class="button button-primary" href="/statti/">До статей</a></div>
        </div>
      `;
    });
  } else if (topicPath !== '/statti/lin/') {
    // Future subblocks no longer show disabled "manual" and "test" choices.
    blankArticleCanvas.innerHTML = `
      <div class="topic-entry-actions">
        <p class="section-kicker">Статті</p>
        <h2>Матеріали цього підблоку готуються</h2>
        <p class="topic-entry-note">Коли статті будуть опубліковані, вони з’являться тут одразу списком.</p>
        <div class="page-actions"><a class="button button-primary" href="/statti/">До всіх підблоків</a></div>
      </div>
    `;
  }
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.append(script);
});

const loadBase = () => import('/script-base.js');
const isLegacyArticle = /^\/statti\/[^/]+\/?$/.test(location.pathname) && Boolean(document.querySelector('.article-body'));

if (isLegacyArticle) {
  loadScript('/article-deduplicate.js')
    .then(loadBase)
    .catch((error) => { console.error('Не вдалося завантажити сценарії статті.', error); });
} else {
  loadBase().catch((error) => { console.error('Не вдалося завантажити сценарії сайту.', error); });
}
