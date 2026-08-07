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

  const renderPractice = (practice) => {
    if (!practice?.rows?.length) return '';
    const [leftHeader, rightHeader] = practice.headers || ['Що помічаєте', 'Що зробити'];
    const rows = practice.rows.map(([left, right]) => `
      <tr>
        <td data-label="${escapeHtml(leftHeader)}">${escapeHtml(left)}</td>
        <td data-label="${escapeHtml(rightHeader)}">${escapeHtml(right)}</td>
      </tr>`).join('');

    return `
      <section aria-labelledby="practice-title">
        <h2 id="practice-title">${escapeHtml(practice.title || 'Практична шпаргалка')}</h2>
        ${practice.intro ? `<p>${escapeHtml(practice.intro)}</p>` : ''}
        <div class="table-wrap table-wrap-readable" tabindex="0" aria-label="${escapeHtml(practice.aria || practice.title || 'Практична таблиця')}">
          <table class="article-table article-table-readable">
            <thead><tr><th>${escapeHtml(leftHeader)}</th><th>${escapeHtml(rightHeader)}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${practice.note ? `<p>${escapeHtml(practice.note)}</p>` : ''}
      </section>`;
  };

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

    const sections = article.sections.map((section, position) => ({...section, id: slugify(section.heading, position)}));
    const tocHtml = sections.map((section) => `<a href="#${escapeHtml(section.id)}-title">${escapeHtml(section.heading)}</a>`).join('');

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

    const faqHtml = (article.faq || []).map((entry) => `<details><summary>${escapeHtml(entry.q)}</summary><p>${escapeHtml(entry.a)}</p></details>`).join('');
    const sourceHtml = (article.sources || [])
      .map((key) => sources[key])
      .filter(Boolean)
      .map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`)
      .join('');

    const relatedItems = (article.related || [])
      .map((relatedSlug) => index.find((entry) => entry.slug === relatedSlug))
      .filter(Boolean);
    const relatedHtml = relatedItems.map((related) => `<a class="article-card" href="/statti/${escapeHtml(related.slug)}/"><span>${escapeHtml(related.cat)} · ${escapeHtml(related.time)} хв</span><h3>${escapeHtml(related.title)}</h3><p>${escapeHtml(related.desc)}</p></a>`).join('');

    main.innerHTML = `
      <article class="article-page">
        <header class="article-header shell">
          <a class="back-link" href="/apatiia/">← Повернутися до розділу «Апатія»</a>
          <div class="article-meta"><span>Апатія</span><span>${escapeHtml(item.time)} хв читання</span><span>Оновлено ${escapeHtml(article.updated)}</span></div>
          <h1>${escapeHtml(article.title)}</h1>
          <p class="article-lead">${escapeHtml(article.lead)}</p>
          <div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div>
          <div class="tag-list" aria-label="Теми статті">${(article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        </header>

        <div class="article-layout shell">
          <aside class="article-toc" aria-label="Зміст статті">
            <strong>Зміст статті</strong>
            ${tocHtml}
            ${article.practice ? '<a href="#practice-title">Практична шпаргалка</a>' : ''}
            <a href="#help-title">Коли потрібна допомога</a>
            <a href="#faq-title">Поширені запитання</a>
            <a href="#sources-title">Джерела</a>
          </aside>

          <div class="article-body">
            <p>Апатія — не характеристика людини й не доказ слабкої сили волі. Важливіше дивитися на те, що саме змінилося, як довго це триває та наскільки стан впливає на звичне життя.</p>
            <section class="bot-cta" aria-labelledby="bot-cta-top">
              <p class="section-kicker">Практика до статті</p>
              <h2 id="bot-cta-top">Опишіть стан без самозвинувачення</h2>
              <p>У Telegram-боті можна коротко зафіксувати, що змінилося, скільки це триває та який маленький крок реально зробити сьогодні.</p>
              <a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Розібрати ситуацію в боті <span aria-hidden="true">↗</span></a>
            </section>
            ${sectionsHtml}
            ${renderPractice(article.practice)}
            <section aria-labelledby="help-title">
              <h2 id="help-title">Коли самодопомоги недостатньо</h2>
              <p>Зверніться до лікаря або фахівця з психічного здоров’я, якщо втрата інтересу, енергії чи активності триває, посилюється або помітно впливає на сон, навчання, роботу, стосунки, харчування чи догляд за собою.</p>
              <p>Матеріал має освітній характер і не встановлює діагноз. Якщо є безпосередня небезпека для життя чи здоров’я, потрібна невідкладна допомога.</p>
            </section>
            <section aria-labelledby="faq-title"><h2 id="faq-title">Поширені запитання</h2><div class="faq-list">${faqHtml}</div></section>
            <section aria-labelledby="sources-title"><h2 id="sources-title">Джерела та додаткове читання</h2><ul class="source-list">${sourceHtml}</ul></section>
          </div>
        </div>

        ${relatedHtml ? `<section class="section shell"><div class="section-heading"><p class="section-kicker">Читайте далі</p><h2>Пов’язані матеріали</h2></div><div class="article-grid">${relatedHtml}</div></section>` : ''}
      </article>`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: article.title,
          description,
          datePublished: '2026-08-07',
          dateModified: '2026-08-07',
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
