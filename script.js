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

const blankArticleCanvas = document.querySelector('.blank-topic-section .article-canvas');
if (blankArticleCanvas && !blankArticleCanvas.querySelector('.article-canvas-choice')) {
  const choice = document.createElement('div');
  choice.className = 'article-canvas-choice';
  choice.setAttribute('aria-label', 'Спосіб вибору матеріалу');

  const manualButton = document.createElement('button');
  manualButton.type = 'button';
  manualButton.className = 'button button-primary';
  manualButton.textContent = 'Обрати вручну';
  manualButton.dataset.pendingDestination = 'manual';

  const testButton = document.createElement('button');
  testButton.type = 'button';
  testButton.className = 'button button-secondary';
  testButton.textContent = 'Пройти тест';
  testButton.dataset.pendingDestination = 'test';

  choice.append(manualButton, testButton);
  blankArticleCanvas.append(choice);
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
