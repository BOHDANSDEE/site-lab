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

const blankArticleCanvas = document.querySelector('.article-canvas');
if (blankArticleCanvas && !blankArticleCanvas.querySelector('.topic-entry-actions')) {
  const isLinGuide = /^\/statti\/lin\/?$/.test(location.pathname);
  const choicePanel = document.createElement('div');
  choicePanel.className = 'topic-entry-actions';
  choicePanel.innerHTML = `
    <p class="section-kicker">Як продовжити</p>
    <h2>Знайди матеріал під свою ситуацію</h2>
    <p class="topic-entry-note">Можна обрати опис вручну або пізніше пройти короткий тест, який сам підбере матеріал.</p>
    <div class="page-actions">
      ${isLinGuide
        ? '<a class="button button-primary" href="/statti/lin-vybir/">Обрати вручну</a>'
        : '<button class="button button-primary" type="button" disabled aria-disabled="true">Обрати вручну</button>'}
      <button class="button button-secondary" type="button" disabled aria-disabled="true">Пройти тест</button>
    </div>
  `;
  blankArticleCanvas.prepend(choicePanel);
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
