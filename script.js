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

// Every one of the 12 blank topic canvases gets the same two entry choices.
// Destinations will be connected later when the manual picker and test are ready.
const blankArticleCanvas = document.querySelector('.article-canvas');
if (blankArticleCanvas && !blankArticleCanvas.querySelector('.topic-entry-actions')) {
  const choicePanel = document.createElement('div');
  choicePanel.className = 'topic-entry-actions';
  choicePanel.innerHTML = `
    <p class="section-kicker">Як продовжити</p>
    <div class="page-actions">
      <button class="button button-secondary" type="button" data-future-action="manual">Обрати вручну</button>
      <button class="button" type="button" data-future-action="test">Пройти тест</button>
    </div>
    <p class="topic-entry-note">Переходи для цих кнопок додамо пізніше.</p>
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
