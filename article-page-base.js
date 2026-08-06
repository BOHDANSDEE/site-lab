(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const index = window.HABITTEEN_ARTICLE_INDEX || [];
  const sources = window.HABITTEEN_ARTICLE_SOURCES || {};
  const article = index.find((item) => item.slug === slug);
  const main = document.querySelector('#content');
  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  if (!article || !main) {
    if (main) {
      main.innerHTML = '<section class="page-hero shell"><p class="eyebrow">Помилка 404</p><h1>Матеріал не знайдено</h1><p class="page-intro">Перевірте адресу або поверніться до бібліотеки.</p><div class="page-actions"><a class="button button-primary" href="/statti/">Усі статті</a></div></section>';
    }
    document.title = 'Матеріал не знайдено | Лінь';
    return;
  }

  const focus = {
    'chomu-vazhko-pochaty-prostu-spravu':['Проблема часто не в розмірі справи, а в нечіткому першому кроці.','Назвіть одну фізичну дію, яку можна виконати за три хвилини.'],
    'yak-diiaty-koly-nemaie-motyvatsii':['Мотивація не завжди передує дії: іноді вона з’являється після короткого початку.','Призначте конкретний час і дію за правилом «якщо — то».'],
    'yak-povernutysia-do-sprav-pislia-perervy':['Повернення після перерви потребує нового темпу, а не миттєвого відновлення старої норми.','Перший день присвятіть лише перегляду матеріалів і одному короткому кроку.'],
    'lin-i-son':['Недосип знижує увагу, енергію та здатність приймати рішення.','Сім днів записуйте час сну, підйому й рівень енергії.'],
    'yak-rozbyty-velyke-zavdannia':['Велика мета стає доступнішою, коли кожен пункт описує видиму дію.','Розділіть результат на 3–5 етапів і виконайте найменший крок.'],
    'koly-vse-zdaietsia-zanadto-skladnym':['Перевантаження потребує зменшення кількості рішень, а не ще складнішого плану.','Оберіть одну базову потребу й одну зовнішню справу.'],
    'samodystsyplina-bez-samokrytyky':['Регулярність краще підтримують правила повернення, а не покарання за пропуск.','Визначте мінімум для слабкого дня й межу робочої сесії.'],
    'seredovyshche-dlia-lehkoho-startu':['Середовище може прибрати зайві рішення перед початком.','Підготуйте матеріали заздалегідь і приберіть одне головне відволікання.'],
    'apatiia-i-vyhorannia':['Апатія та вигорання можуть перетинатися, але мають різний контекст і потребують уважної оцінки.','Запишіть, де саме зник інтерес: у роботі, навчанні чи в усіх сферах.'],
    'yak-pidtrymaty-liudynu-z-apatiieiu':['Підтримка починається зі спокійної присутності, а не з вимоги швидко «зібратися».','Запропонуйте одну конкретну допомогу й вислухайте відповідь без тиску.'],
    'apatiia-pislia-stresu':['Після тривалого напруження організму може знадобитися час на відновлення.','Зменшіть навантаження й поверніть базові опори: сон, їжу, рух і контакт.'],
    'yak-povernuty-interes-do-sprav':['Інтерес часто повертається через маленький контакт із діяльністю, а не через очікування сильного бажання.','Спробуйте п’ять хвилин знайомої справи без вимоги отримати задоволення.'],
    'apatiia-i-son':['Порушення сну може посилювати млявість, зниження уваги та енергії.','Ведіть короткий щоденник сну й обговоріть тривалі зміни з лікарем.'],
    'apatiia-u-pidlitkiv':['У підлітків зміни настрою й активності важливо розглядати разом із навчанням, сном і спілкуванням.','Дорослому варто спокійно запитати про самопочуття та запропонувати допомогу.'],
    'yak-hovoryty-z-likarem-pro-apatiiu':['Конкретні приклади допомагають лікарю краще зрозуміти тривалість і вплив стану.','Запишіть, коли почалися зміни та як вони впливають на сон, навчання, роботу й догляд за собою.'],
    'mali-dii-pry-nyzkii-energii':['Коли енергії мало, корисно зменшити дію, але не вимагати від себе звичного темпу.','Оберіть дію на дві хвилини: вода, вікно, коротке повідомлення або проста їжа.'],
    'yak-ne-vidkladaty-navchannia':['Навчання легше почати, коли визначені місце, час і конкретний фрагмент матеріалу.','Заплануйте короткий блок і сформулюйте результат: одна задача або один абзац конспекту.'],
    'telefon-i-prokrastynatsiia':['Телефон часто допомагає швидко уникнути нудьги, тривоги або невизначеності.','Покладіть його поза зоною руки на одну коротку сесію.'],
    'strakh-pomylky-i-vidkladannia':['Відкладання може тимчасово захищати від оцінки, але не зменшує невизначеність.','Зробіть приватну чернетку й попросіть відгук лише на один фрагмент.'],
    'dedlainy-bez-nichnoho-avralu':['Один фінальний дедлайн залишає забагато рішень на останню ніч.','Створіть дати для старту, повної чернетки й фінальної перевірки.'],
    'metod-desiaty-khvylyn':['Коротка сесія зменшує зобов’язання перед початком.','Підготуйте матеріали й запустіть таймер на десять хвилин із правом зупинитися.'],
    'yak-planuvaty-den-pry-prokrastynatsii':['Довгий список справ залишає забагато виборів у момент виконання.','Використайте формат: одна головна справа, дві короткі й буфер часу.'],
    'prokrastynatsiia-cherez-perevantazhennia':['Коли справ більше, ніж часу й уваги, потрібне скорочення, а не лише новий таймер.','Розділіть список на: обов’язково, можна домовитися, можна відмовитися.']
  };

  const configs = {
    'Лінь': {
      intro:'Побутове слово «лінь» часто приховує втому, нечіткість, страх помилки або відсутність сенсу.',
      blockers:['Нечіткий перший крок','Завищений обсяг на одну сесію','Недосип або виснаження','Самокритика замість аналізу ситуації'],
      steps:['Опишіть проблему без ярлика','Перевірте сон, їжу та доступну енергію','Зменште дію до 2–10 хвилин','Після кроку запишіть, що допомогло'],
      mistakes:['Вимагати миттєвого результату','Порівнювати свій старт із чужим завершеним результатом','Використовувати сором як головний мотиватор'],
      help:'Тривалий спад сил, інтересу або здатності виконувати базові справи варто обговорити з лікарем чи фахівцем.',
      sourceKeys:['nhs_fatigue','implementation']
    },
    'Апатія': {
      intro:'Апатія описує зниження інтересу й активності, але сама по собі не встановлює причину або діагноз.',
      blockers:['Тривалий стрес або виснаження','Порушення сну й базового режиму','Ізоляція та відсутність підтримки','Спроба вимагати від себе звичного темпу'],
      steps:['Позначте тривалість і сфери змін','Поверніть одну базову опору','Додайте дуже малу активність','Розкажіть про стан людині, якій довіряєте'],
      mistakes:['Називати стан слабкістю характеру','Очікувати різкого повернення інтересу','Відкладати професійну оцінку при тривалому погіршенні'],
      help:'Коли стан триває, погіршується або впливає на сон, навчання, роботу чи догляд за собою, потрібна консультація фахівця.',
      sourceKeys:['nimh_depression','who_activity','cdc_sleep']
    },
    'Прокрастинація': {
      intro:'Прокрастинація часто регулює неприємні емоції тут і зараз, але збільшує напруження перед дедлайном.',
      blockers:['Страх помилки або оцінки','Перфекціонізм','Нечітке завдання','Телефон і автоматичні перемикання','Перевантаження'],
      steps:['Назвіть емоцію перед відкладанням','Визначте одну видиму дію','Створіть коротке робоче вікно','Приберіть одне відволікання','Запишіть наступний крок до завершення сесії'],
      mistakes:['Планувати весь день без запасу','Чекати, поки з’явиться правильний настрій','Надолужувати все нічним авралом'],
      help:'Якщо відкладання пов’язане із сильною тривогою, тривалими проблемами уваги, сну або настрою, варто звернутися до фахівця.',
      sourceKeys:['procrast_stress','procrast_emotions','implementation']
    }
  };

  const [focusText, todayAction] = focus[slug] || [article.desc,'Оберіть одну маленьку дію, яку реально виконати сьогодні.'];
  const config = configs[article.cat];
  const list = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const sourceLinks = config.sourceKeys.map((key) => {
    const source = sources[key];
    return source ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(source.label)}</strong><span>Офіційне або наукове джерело ↗</span></a>` : '';
  }).join('');
  const related = index.filter((item) => item.cat === article.cat && item.slug !== slug).slice(0,3);
  const relatedCards = related.map((item) => `<a class="article-card" href="/statti/${item.slug}/"><span>${item.cat} · ${item.time} хв</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc)}</p></a>`).join('');
  const canonical = `${location.origin}/statti/${slug}/`;

  document.title = `${article.title} | Лінь`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', article.desc);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', article.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', article.desc);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);

  main.innerHTML = `<article class="article-page">
    <header class="article-header shell"><a class="back-link" href="/${article.cat_slug}/">← До розділу «${article.cat}»</a><div class="article-meta"><span>${article.cat}</span><span>${article.time} хв читання</span><span>Оновлено 5 серпня 2026 р.</span></div><h1>${escapeHtml(article.title)}</h1><p class="article-lead">${escapeHtml(article.desc)}</p><div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div></header>
    <div class="article-layout shell"><aside class="article-toc"><strong>Зміст статті</strong><a href="#sut">Головна думка</a><a href="#barery">Що заважає</a><a href="#plan">Практичний план</a><a href="#pomylky">Поширені помилки</a><a href="#dopomoha">Коли потрібна допомога</a><a href="#dzherela">Джерела</a></aside>
    <div class="article-body"><p>${escapeHtml(config.intro)}</p><p>${escapeHtml(focusText)}</p><div class="note-box"><strong>Важливо</strong><p>Назва стану допомагає сформулювати запитання, але не визначає характер людини й не замінює індивідуальної оцінки.</p></div>
    <h2 id="sut">Головна думка</h2><p>${escapeHtml(article.desc)}</p><p>Корисно перейти від загальної оцінки до спостережень: коли проблема сильніша, що їй передує, що зменшує її хоча б трохи й який наступний крок доступний зараз.</p>
    <div class="practice-box"><div class="practice-heading"><span>Спробуйте сьогодні</span><strong>1 крок</strong></div><h3>${escapeHtml(todayAction)}</h3><p>Після виконання коротко запишіть результат без оцінки себе: що було легко, що завадило і що змінити наступного разу.</p></div>
    <h2 id="barery">Що може заважати</h2><ul class="check-list">${list(config.blockers)}</ul>
    <h2 id="plan">Практичний план</h2><ol>${list(config.steps)}</ol>
    <h2 id="pomylky">Поширені помилки</h2><ul>${list(config.mistakes)}</ul>
    <h2 id="dopomoha">Коли потрібна допомога</h2><p>${escapeHtml(config.help)}</p><div class="safety-box"><strong>Межі самодопомоги</strong><p>Матеріал має освітній характер і не встановлює діагнозів. При тривалому або різкому погіршенні самопочуття зверніться до лікаря чи фахівця з психічного здоров’я.</p><a class="text-link" href="/bezpeka/">Прочитати про безпеку →</a></div>
    <h2 id="dzherela">Джерела</h2><div class="source-list">${sourceLinks}</div>
    <section class="related-section"><div class="section-heading"><p class="section-kicker">Читайте далі</p><h2>Схожі матеріали</h2></div><div class="article-grid">${relatedCards}</div></section></div></div></article>`;
})();
