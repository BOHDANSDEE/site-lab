(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const index = window.HABITTEEN_ARTICLE_INDEX || [];
  const sources = window.HABITTEEN_ARTICLE_SOURCES || {};
  const item = index.find((entry) => entry.slug === slug);
  const main = document.querySelector('#content');

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const slugify = (value, position) => {
    const safe = value
      .toLocaleLowerCase('uk-UA')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
    return safe || `section-${position + 1}`;
  };

  if (!item || !main) {
    if (main) {
      main.innerHTML = '<section class="page-hero shell"><p class="eyebrow">Помилка 404</p><h1>Матеріал не знайдено</h1><p class="page-intro">Перевірте адресу або поверніться до бібліотеки.</p><div class="page-actions"><a class="button button-primary" href="/statti/">Усі статті</a></div></section>';
    }
    document.title = 'Матеріал не знайдено | Лінь';
    return;
  }

  const genericByCategory = {
    'Лінь': {
      intro: 'Побутове слово «лінь» часто приховує втому, нечіткість, страх помилки або відсутність сенсу. Корисніше не оцінювати характер, а з’ясувати, що саме робить дію складною.',
      sections: [
        ['Що варто перевірити перед стартом', [
          'Почніть із базових умов: сон, їжа, фізичний стан і реальний обсяг справ. Коли ресурсу мало, додаткова самокритика рідко створює енергію.',
          'Далі уточніть завдання. Формулювання «зробити все» або «стати продуктивним» не містить першої видимої дії. Конкретний крок зменшує невизначеність.'
        ]],
        ['Маленький старт без тиску', [
          'Оберіть дію на 2–10 хвилин: відкрити файл, підготувати матеріали, записати одне питання або зробити найпростішу частину.',
          'Після короткої сесії свідомо вирішіть, чи продовжувати. Це повертає відчуття вибору й допомагає відрізнити складний старт від повного браку ресурсу.'
        ]],
        ['Коли потрібна додаткова допомога', [
          'Тривалий спад сил, інтересу або здатності виконувати базові справи варто обговорити з лікарем чи фахівцем з психічного здоров’я.',
          'Стаття допомагає структурувати спостереження, але не встановлює діагноз і не замінює індивідуальну консультацію.'
        ]]
      ],
      sourceKeys: ['nhs_fatigue','implementation']
    },
    'Апатія': {
      intro: 'Апатія описує зниження інтересу й активності, але сама по собі не встановлює причину або діагноз. Важливо оцінювати тривалість, вплив на життя й супутні зміни.',
      sections: [
        ['Що спостерігати', [
          'Запишіть, коли почалися зміни, у яких сферах вони помітні та чи впливають на сон, навчання, роботу, спілкування й догляд за собою.',
          'Корисно відрізняти відсутність бажання від фізичної неможливості, виснаження, тривоги або втрати інтересу майже до всього.'
        ]],
        ['Мінімальна підтримка дня', [
          'Поверніть одну базову опору: воду, просту їжу, короткий вихід на повітря, контакт із людиною, якій довіряєте.',
          'Маленька дія не повинна доводити продуктивність. Її мета — підтримати функціонування й зібрати більше інформації про стан.'
        ]],
        ['Межі самодопомоги', [
          'Коли стан триває, погіршується або заважає базовому життю, потрібна консультація лікаря чи фахівця з психічного здоров’я.',
          'Якщо є думки про самопошкодження або небезпеку для себе, потрібна невідкладна допомога у вашій країні.'
        ]]
      ],
      sourceKeys: ['nimh_depression','who_activity','cdc_sleep']
    },
    'Прокрастинація': {
      intro: 'Прокрастинація часто допомагає короткочасно уникнути неприємних емоцій, але збільшує напруження перед дедлайном. Рішення починається з точного бар’єра, а не з ярлика.',
      sections: [
        ['Знайдіть механізм відкладання', [
          'Запитайте, що відчуваєте безпосередньо перед перемиканням: нудьгу, тривогу, страх помилки, перевантаження або невизначеність.',
          'Потім визначте першу фізичну дію. Чим менше рішень потрібно прийняти в момент старту, тим нижчий бар’єр.'
        ]],
        ['Створіть коротке робоче вікно', [
          'Оберіть 10–30 хвилин, приберіть одне головне відволікання й сформулюйте видимий результат сесії.',
          'Перед завершенням запишіть наступну дію. Це скорочує час повернення й не дозволяє перерві стерти контекст.'
        ]],
        ['Коли варто звернутися по допомогу', [
          'Якщо відкладання пов’язане із сильною тривогою, тривалими проблемами уваги, сну або настрою, варто звернутися до фахівця.',
          'Самодопомога може підтримати організацію, але не повинна замінювати оцінку стану, який суттєво погіршує життя.'
        ]]
      ],
      sourceKeys: ['procrast_stress','procrast_emotions','implementation']
    }
  };

  const renderArticle = (long) => {
  const categoryFallback = genericByCategory[item.cat] || genericByCategory['Прокрастинація'];
  const article = long || {
    title: item.title,
    lead: `${item.desc} ${categoryFallback.intro}`,
    tags: [item.cat.toLocaleLowerCase('uk-UA'), 'самодопомога', 'практичні кроки'],
    updated: '6 серпня 2026 р.',
    sections: categoryFallback.sections.map(([heading, paragraphs]) => ({heading, paragraphs})),
    faq: [
      {q: 'З чого почати сьогодні?', a: 'Оберіть одну конкретну ситуацію, визначте найменший видимий крок і працюйте коротку сесію без вимоги завершити все.'},
      {q: 'Коли самодопомоги недостатньо?', a: 'Коли стан триває, погіршується або суттєво впливає на навчання, роботу, сон чи догляд за собою, зверніться до фахівця.'}
    ],
    sources: categoryFallback.sourceKeys,
    related: index.filter((entry) => entry.cat === item.cat && entry.slug !== slug).slice(0, 3).map((entry) => entry.slug)
  };

  const canonical = `https://xn--k1ae9bxb.online/statti/${slug}/`;
  const description = article.lead.length > 160 ? `${article.lead.slice(0, 157).trim()}…` : article.lead;
  document.title = `${article.title} | Лінь`;

  const setMeta = (selector, content) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  };

  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.href = canonical;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', article.title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonical);

  const sections = article.sections.map((section, position) => ({
    ...section,
    id: slugify(section.heading, position)
  }));

  const tocHtml = sections.map((section) =>
    `<a href="#${escapeHtml(section.id)}">${escapeHtml(section.heading)}</a>`
  ).join('');

  const sectionsHtml = sections.map((section) => {
    const paragraphs = (section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const bullets = section.bullets?.length
      ? `<ul class="check-list">${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : '';
    const steps = section.steps?.length
      ? `<ol class="check-list">${section.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`
      : '';
    const note = section.note
      ? `<div class="note-box"><strong>Важлива примітка</strong><p>${escapeHtml(section.note)}</p></div>`
      : '';
    return `<section aria-labelledby="${escapeHtml(section.id)}-title"><h2 id="${escapeHtml(section.id)}-title">${escapeHtml(section.heading)}</h2>${paragraphs}${bullets}${steps}${note}</section>`;
  }).join('');

  const practicalReflection = `
    <section aria-labelledby="reflection-title">
      <h2 id="reflection-title">Як застосувати матеріал до своєї ситуації</h2>
      <p>Не намагайтеся використати всі поради одночасно. Оберіть одну повторювану ситуацію: конкретне завдання, час доби або момент, коли найчастіше відбувається відкладання. Протягом кількох днів записуйте, що передувало проблемі, яку дію ви зробили та що змінилося після неї.</p>
      <p>Корисний експеримент має бути достатньо малим, щоб його можна було повторити. Замість загальної мети «більше не прокрастинувати» перевірте одну зміну: прибрати телефон на 20 хвилин, створити ранню чернетку, записати наступний крок або попросити конкретний відгук.</p>
      <div class="table-wrap" tabindex="0" aria-label="Щоденник спостереження">
        <table class="article-table">
          <thead><tr><th>Ситуація</th><th>Що я відчував</th><th>Який крок зробив</th><th>Що сталося</th></tr></thead>
          <tbody>
            <tr><td>Коли й де виникла проблема</td><td>Тривога, нудьга, втома або розгубленість</td><td>Одна конкретна зміна</td><td>Що допомогло або завадило</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

  const safetySection = `
    <section aria-labelledby="help-title">
      <h2 id="help-title">Коли самодопомоги недостатньо</h2>
      <p>Зверніться до фахівця, якщо труднощі тривають, посилюються або суттєво впливають на навчання, роботу, сон, стосунки чи догляд за собою. Відкладання може поєднуватися з тривогою, депресією, проблемами сну, СДУГ або фізичним виснаженням, але стаття не може визначити причину.</p>
      <p>Підготуйте кілька конкретних прикладів: коли почалася проблема, у яких ситуаціях вона виникає, що вже пробували та як це впливає на повсякденне життя. Це зробить консультацію точнішою.</p>
    </section>
  `;

  const faqHtml = (article.faq || []).map((entry) =>
    `<details><summary>${escapeHtml(entry.q)}</summary><p>${escapeHtml(entry.a)}</p></details>`
  ).join('');

  const sourceHtml = (article.sources || [])
    .map((key) => sources[key])
    .filter(Boolean)
    .map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`)
    .join('');

  const relatedItems = (article.related || [])
    .map((relatedSlug) => index.find((entry) => entry.slug === relatedSlug))
    .filter(Boolean);

  const relatedHtml = relatedItems.map((related) =>
    `<a class="article-card" href="/statti/${escapeHtml(related.slug)}/"><span>${escapeHtml(related.cat)} · ${escapeHtml(related.time)} хв</span><h3>${escapeHtml(related.title)}</h3><p>${escapeHtml(related.desc)}</p></a>`
  ).join('');

  main.innerHTML = `
    <article class="article-page">
      <header class="article-header shell">
        <a class="back-link" href="/${escapeHtml(item.cat_slug)}/">← Повернутися до розділу</a>
        <div class="article-meta"><span>${escapeHtml(item.cat)}</span><span>${escapeHtml(item.time)} хв читання</span><span>Оновлено ${escapeHtml(article.updated)}</span></div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-lead">${escapeHtml(article.lead)}</p>
        <div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div>
        <div class="tag-list" aria-label="Теми статті">${(article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </header>

      <div class="article-layout shell">
        <aside class="article-toc" aria-label="Зміст статті">
          <strong>Зміст статті</strong>
          ${tocHtml}
          <a href="#reflection-title">Практика для своєї ситуації</a>
          <a href="#help-title">Коли потрібна допомога</a>
          <a href="#faq-title">Поширені запитання</a>
          <a href="#sources-title">Джерела</a>
        </aside>

        <div class="article-body">
          <p>${escapeHtml(categoryFallback.intro)}</p>
          <section class="bot-cta" aria-labelledby="bot-cta-top">
            <p class="section-kicker">Практика до статті</p>
            <h2 id="bot-cta-top">Розкладіть ситуацію на один реалістичний крок</h2>
            <p>У Telegram-боті можна коротко описати, що відкладається, визначити головну перешкоду та сформулювати дію, яку реально виконати сьогодні.</p>
            <a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Розібрати ситуацію в боті <span aria-hidden="true">↗</span></a>
          </section>
          ${sectionsHtml}
          ${practicalReflection}
          ${safetySection}
          <section aria-labelledby="faq-title"><h2 id="faq-title">Поширені запитання</h2><div class="faq-list">${faqHtml}</div></section>
          <section aria-labelledby="sources-title"><h2 id="sources-title">Джерела та додаткове читання</h2><ul class="source-list">${sourceHtml}</ul></section>
        </div>
      </div>

      ${relatedHtml ? `<section class="section shell"><div class="section-heading"><p class="section-kicker">Читайте далі</p><h2>Пов’язані матеріали</h2></div><div class="article-grid">${relatedHtml}</div></section>` : ''}
    </article>
  `;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description,
        datePublished: '2026-08-06',
        dateModified: '2026-08-06',
        inLanguage: 'uk',
        mainEntityOfPage: canonical,
        author: {'@type':'Organization', name:'Редакція «Лінь»'},
        publisher: {'@type':'Organization', name:'Лінь', url:'https://xn--k1ae9bxb.online/'}
      },
      {
        '@type': 'FAQPage',
        mainEntity: (article.faq || []).map((entry) => ({
          '@type':'Question',
          name: entry.q,
          acceptedAnswer: {'@type':'Answer', text: entry.a}
        }))
      }
    ]
  };
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify(jsonLd);
  document.head.append(ld);

  };

  const richSlugs = new Set([
    'prokrastynatsiia-i-perfektsionizm',
    'akademichna-prokrastynatsiia',
    'prokrastynatsiia-i-tryvoha',
    'chomu-vse-roblu-v-ostanniu-myt',
    'sduh-i-prokrastynatsiia',
    'metod-pomodoro',
    'nichna-prokrastynatsiia',
    'telefon-korotki-video-i-prokrastynatsiia'
  ]);

  if (richSlugs.has(slug)) {
    const dataScript = document.createElement('script');
    dataScript.src = `/article-data/${slug}.js`;
    dataScript.onload = () => renderArticle(window.HABITTEEN_LONG_ARTICLE || null);
    dataScript.onerror = () => renderArticle(null);
    document.head.append(dataScript);
  } else {
    renderArticle(null);
  }
})();