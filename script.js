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

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.append(script);
});

loadScript('/articles-index.js')
  .then(() => loadScript('/catalog-30.js'))
  .then(() => import('/script-base.js'))
  .catch((error) => { console.error('Не вдалося завантажити сценарії сайту.', error); });
