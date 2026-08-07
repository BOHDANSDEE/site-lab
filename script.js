document.documentElement.style.colorScheme = 'only light';

if (!document.querySelector('meta[name="color-scheme"]')) {
  const colorSchemeMeta = document.createElement('meta');
  colorSchemeMeta.name = 'color-scheme';
  colorSchemeMeta.content = 'light only';
  document.head.append(colorSchemeMeta);
}

const faqSection = document.querySelector('.home-faq');
const thoughtCard = document.querySelector('.hero > .thought-card');

if (faqSection && thoughtCard) {
  const thoughtSection = document.createElement('section');
  thoughtSection.className = 'section shell thought-section';
  thoughtSection.setAttribute('aria-labelledby', 'thought-title');
  thoughtSection.append(thoughtCard);
  faqSection.before(thoughtSection);
}

const fullFaqLink = document.querySelector('.home-faq .section-action');
if (fullFaqLink) fullFaqLink.remove();

const faqIntro = document.querySelector('.home-faq .section-heading > p:last-child');
if (faqIntro) {
  faqIntro.textContent = 'Поширені запитання зібрані тут, у кінці головної сторінки, після основних матеріалів і важливої думки.';
}

document.querySelectorAll('a[href="/faq/"]').forEach((link) => { link.href = '/#faq'; });

const pagePath = location.pathname.replace(/\/+$/, '') || '/';
if (pagePath === '/statti/yak-poboroty-lin') {
  document.querySelectorAll('.article-table tbody tr').forEach((row) => {
    row.querySelectorAll('td').forEach((cell) => {
      const text = cell.textContent.trim();
      if (text === 'Зменшити завдання до дії на 5–10 хвилин') {
        cell.textContent = 'Виберіть одне завдання й зробіть перший крок протягом 5–10 хвилин';
      }
      if (text === 'Тривалість, зміни сну, настрою, концентрації та функціонування') {
        cell.textContent = 'Як довго це триває та чи змінилися сон, настрій, концентрація й повсякденне життя';
      }
    });
  });
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.append(script);
});

loadScript('/articles-index.js')
  .then(() => loadScript('/article-topic-overrides.js'))
  .then(() => loadScript('/lazy-topic-overrides.js'))
  .then(() => loadScript('/phone-theme-update.js'))
  .then(() => loadScript('/catalog-30.js'))
  .then(() => import('/script-base.js'))
  .catch((error) => { console.error('Не вдалося завантажити сценарії сайту.', error); });
