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

const simplifyCausesTable = () => {
  if (pagePath !== '/statti/prychyny-lini') return true;

  const practiceTitle = document.querySelector('#practice-title');
  const practiceSection = practiceTitle?.closest('section');
  const table = practiceSection?.querySelector('.article-table');
  if (!practiceSection || !table) return false;

  practiceTitle.textContent = '8 причин: коротка шпаргалка';

  const paragraphs = practiceSection.querySelectorAll(':scope > p');
  if (paragraphs[0]) {
    paragraphs[0].textContent = 'Не потрібно запам’ятовувати всі причини одразу. Знайдіть рядок, який найбільше схожий на вашу ситуацію, і перевірте один простий крок.';
  }
  if (paragraphs[1]) {
    paragraphs[1].textContent = 'Якщо кілька причин підходять одночасно, почніть із базового: сон і відновлення, потім уточніть завдання та приберіть одне головне відволікання.';
  }

  const tocLink = document.querySelector('.article-toc a[href="#practice-title"]');
  if (tocLink) tocLink.textContent = '8 причин: коротка шпаргалка';

  const wrap = table.closest('.table-wrap');
  if (wrap) wrap.setAttribute('aria-label', 'Вісім причин ліні та перший крок для кожної');

  table.classList.add('article-table-compact');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Причина</th>
        <th>Що зробити зараз</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>1. Втома або недосип</td><td>Дайте пріоритет сну й відновленню. Якщо виснаження тривале або сильне — зверніться до лікаря.</td></tr>
      <tr><td>2. Завдання нечітке або завелике</td><td>Запишіть одну конкретну дію, яку можна виконати за 10–20 хвилин.</td></tr>
      <tr><td>3. Результат надто далекий</td><td>Розбийте справу на короткий етап із видимим результатом.</td></tr>
      <tr><td>4. Страх помилки</td><td>Зробіть чернетку без вимоги одразу отримати ідеальний результат.</td></tr>
      <tr><td>5. Немає зрозумілого сенсу</td><td>Уточніть, навіщо це потрібно, який мінімум достатній або чи можна змінити домовленість.</td></tr>
      <tr><td>6. Забагато рішень і перемикань</td><td>Оберіть одну головну справу й підготуйте все потрібне до початку.</td></tr>
      <tr><td>7. Автоматичне уникнення</td><td>Приберіть одне головне відволікання на коротку робочу сесію.</td></tr>
      <tr><td>8. Тривалий спад настрою або здоров’я</td><td>Не списуйте все на «лінь» — за тривалих змін зверніться по професійну оцінку.</td></tr>
    </tbody>
  `;

  return true;
};

if (!simplifyCausesTable()) {
  const causesObserver = new MutationObserver(() => {
    if (simplifyCausesTable()) causesObserver.disconnect();
  });
  const articleRoot = document.querySelector('#content');
  if (articleRoot) causesObserver.observe(articleRoot, { childList: true, subtree: true });
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
