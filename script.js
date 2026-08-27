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

  const cards = articles.map((article, index) => `
    <a class="article-card topic-library-card" href="/statti/motyvatsiia/${escapeTopicHtml(article.slug)}/">
      <span class="topic-library-meta">${String(index + 1).padStart(2, '0')} · ${escapeTopicHtml(article.readMinutes)} хв</span>
      <h3>${escapeTopicHtml(article.title)}</h3>
      <p>${escapeTopicHtml(article.lead)}</p>
      <strong class="topic-library-open">Читати статтю →</strong>
    </a>
  `).join('');

  canvas.classList.add('topic-article-library');
  canvas.innerHTML = `
    <div class="topic-library-heading">
      <p class="section-kicker">20 статей</p>
      <h2>Обери те, що зараз найближче</h2>
      <p>Кожна картка — окрема ситуація. Відкрий ту, в якій найбільше впізнаєш свою проблему.</p>
    </div>
    <div class="article-grid topic-library-grid">${cards}</div>
  `;
}

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
