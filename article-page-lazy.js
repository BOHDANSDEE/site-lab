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
    const safe = String(value)
      .toLocaleLowerCase('uk-UA')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
    return safe || `section-${position + 1}`;
  };

  const showNotFound = () => {
    if (!main) return;
    main.innerHTML = '<section class="page-hero shell"><p class="eyebrow">Помилка 404</p><h1>Матеріал не знайдено</h1><p class="page-intro">Перевірте адресу або поверніться до бібліотеки.</p><div class="page-actions"><a class="button button-primary" href="/statti/">Усі статті</a></div></section>';
    document.title = 'Матеріал не знайдено | Лінь';
  };

  if (!item || !main) {
    showNotFound();
    return;
  }

  const render = (article) => {
    if (!article || !Array.isArray(article.sections)) {
      showNotFound();
      return;
    }

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
      `<a href="#${escapeHtml(section.id)}-title">${escapeHtml(section.heading)}</a>`
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
            <a href="#practice-title">Практика на сім днів</a>
            <a href="#help-title">Коли потрібна допомога</a>
            <a href="#faq-title">Поширені запитання</a>
            <a href="#sources-title">Джерела</a>
          </aside>

          <div class="article-body">
            <p>Слово «лінь» часто приховує конкретну перешкоду: нестачу ресурсу, нечіткість, перевантаження, відсутність сенсу або звичний спосіб уникнути дискомфорту. Матеріал допомагає перевірити умови, а не оцінювати характер.</p>
            <section class="bot-cta" aria-labelledby="bot-cta-top">
              <p class="section-kicker">Практика до статті</p>
              <h2 id="bot-cta-top">Знайдіть одну причину й один доступний крок</h2>
              <p>У Telegram-боті можна коротко описати ситуацію, визначити головну перешкоду та сформулювати дію, яку реально виконати сьогодні.</p>
              <a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Розібрати ситуацію в боті <span aria-hidden="true">↗</span></a>
            </section>
            ${sectionsHtml}
            <section aria-labelledby="practice-title">
              <h2 id="practice-title">Практика на сім днів</h2>
              <p>Оберіть одну повторювану ситуацію, а не намагайтеся змінити весь спосіб життя. Щодня коротко записуйте: коли виникло небажання, який був фізичний стан, яка думка з’явилася, яку маленьку дію ви спробували та що сталося після неї.</p>
              <p>Наприкінці тижня шукайте закономірність. Якщо допоміг конкретніший план — збережіть його. Якщо проблема пов’язана з недосипом або виснаженням — пріоритетом буде відновлення. Якщо стан тривалий і впливає на різні сфери, зверніться по професійну оцінку.</p>
              <div class="table-wrap" tabindex="0" aria-label="Щоденник спостереження">
                <table class="article-table">
                  <thead><tr><th>Ситуація</th><th>Що заважало</th><th>Маленький крок</th><th>Результат</th></tr></thead>
                  <tbody><tr><td>Коли й де</td><td>Сон, страх, нечіткість, перевантаження</td><td>Одна конкретна зміна</td><td>Що допомогло або ні</td></tr></tbody>
                </table>
              </div>
            </section>
            <section aria-labelledby="help-title">
              <h2 id="help-title">Коли самодопомоги недостатньо</h2>
              <p>Зверніться до лікаря або фахівця з психічного здоров’я, якщо втома, втрата активності чи інші труднощі тривають, посилюються або суттєво впливають на сон, навчання, роботу, стосунки чи догляд за собою.</p>
              <p>Стаття має освітній характер і не встановлює діагнозів. Якщо є безпосередня небезпека або думки про самопошкодження, потрібна невідкладна допомога у вашій країні.</p>
            </section>
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

  const dataScript = document.createElement('script');
  dataScript.src = `/article-data/${slug}.js`;
  dataScript.onload = () => render(window.HABITTEEN_LONG_ARTICLE || null);
  dataScript.onerror = showNotFound;
  document.head.append(dataScript);
})();
