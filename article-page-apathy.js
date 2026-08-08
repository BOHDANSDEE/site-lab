(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const main = document.querySelector('#content');

  const escapeHtml = (value) => String(value ?? '')
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

  const relatedIndex = {
    'apatiia-shcho-robyty': { title: 'Апатія: що робити, коли нічого не хочеться', desc: 'Базові кроки, оцінка стану, маленька активність і межі самодопомоги.', time: 12 },
    'apatiia-chy-depresiia': { title: 'Апатія чи депресія: у чому різниця', desc: 'Що може перетинатися, які ознаки важливо описати та чому потрібна фахова оцінка.', time: 11 },
    'emotsiine-vyhorannia-symptomy': { title: 'Емоційне вигорання: симптоми та чим відрізняється від апатії', desc: 'Робочий контекст, виснаження, дистанціювання та межі самодіагностики.', time: 12 },
    'yak-dopomohty-liudyni-z-apatiieiu': { title: 'Як допомогти людині з апатією: підтримка без тиску', desc: 'Що можуть зробити близькі, де проходять межі відповідальності та коли потрібен фахівець.', time: 11 },
    'apatiia-pislia-stresu': { title: 'Апатія після стресу: чому нічого не хочеться і як відновлюватися', desc: 'Як повернути базові опори після напруженого періоду й оцінити динаміку стану.', time: 12 },
    'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia': { title: 'Нічого не радує: як повернути інтерес до життя', desc: 'Короткі контакти зі старими й новими інтересами без вимоги негайної радості.', time: 11 },
    'postiino-khochetsia-spaty-i-nemaie-syl': { title: 'Постійно хочеться спати і немає сил: причини та що робити', desc: 'Як відрізнити сонливість від втоми та що перевірити у сні й самопочутті.', time: 12 },
    'apatiia-u-pidlitkiv': { title: 'Апатія у підлітків: ознаки, причини та коли потрібна допомога', desc: 'Тривалі зміни, сон, навчальне навантаження, функціонування та ознаки безпеки.', time: 11 },
    'postiina-vtoma-i-nemaie-syl': { title: 'Постійна втома і немає сил: причини та що перевірити', desc: 'Як описати тривалу втому, перевірити базові фактори й підготуватися до консультації.', time: 12 },
    'nemaie-syl-nichoho-robyty': { title: 'Немає сил нічого робити: що робити, коли енергія на нулі', desc: 'Мінімум для слабкого дня, делегування окремих задач і межа між самодопомогою й зверненням.', time: 11 }
  };

  const showNotFound = () => {
    if (!main) return;
    main.innerHTML = '<section class="page-hero shell"><p class="eyebrow">Помилка 404</p><h1>Матеріал не знайдено</h1><p class="page-intro">Перевірте адресу або поверніться до бібліотеки.</p><div class="page-actions"><a class="button button-primary" href="/statti/">Усі статті</a></div></section>';
    document.title = 'Матеріал не знайдено | Лінь';
  };

  const render = () => {
    const article = window.HABITTEEN_APATHY_ARTICLES?.[slug];
    const sources = window.HABITTEEN_APATHY_SOURCES || {};
    if (!article || !main) return showNotFound();

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

    const sections = (article.sections || []).map((section, position) => ({ ...section, id: slugify(section.heading, position) }));
    const tocHtml = sections.map((section) => `<a href="#${escapeHtml(section.id)}-title">${escapeHtml(section.heading)}</a>`).join('');
    const sectionsHtml = sections.map((section) => {
      const paragraphs = (section.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
      return `<section aria-labelledby="${escapeHtml(section.id)}-title"><h2 id="${escapeHtml(section.id)}-title">${escapeHtml(section.heading)}</h2>${paragraphs}</section>`;
    }).join('');

    const table = article.table || { left: 'Що помічаєте', right: 'Що робити', rows: [] };
    const tableHtml = `<div class="table-wrap" tabindex="0" aria-label="${escapeHtml(table.left)} — ${escapeHtml(table.right)}"><table class="article-table"><thead><tr><th>${escapeHtml(table.left)}</th><th>${escapeHtml(table.right)}</th></tr></thead><tbody>${(table.rows || []).map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join('')}</tbody></table></div>`;

    const practiceHtml = (article.practice || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('');
    const helpHtml = (article.help || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    const faqHtml = (article.faq || []).map((entry) => `<details><summary>${escapeHtml(entry.q)}</summary><p>${escapeHtml(entry.a)}</p></details>`).join('');
    const sourceHtml = (article.sources || []).map((key) => sources[key]).filter(Boolean).map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`).join('');
    const relatedHtml = (article.related || []).map((relatedSlug) => {
      const item = relatedIndex[relatedSlug];
      if (!item) return '';
      return `<a class="article-card" href="/statti/${escapeHtml(relatedSlug)}/"><span>Апатія · ${escapeHtml(item.time)} хв</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc)}</p></a>`;
    }).join('');

    main.innerHTML = `
      <article class="article-page">
        <header class="article-header shell">
          <a class="back-link" href="/apatiia/">← Повернутися до розділу «Апатія»</a>
          <div class="article-meta"><span>Апатія</span><span>${escapeHtml(article.time)} хв читання</span><span>Оновлено ${escapeHtml(article.updated)}</span></div>
          <h1>${escapeHtml(article.title)}</h1>
          <p class="article-lead">${escapeHtml(article.lead)}</p>
          <div class="article-byline"><strong>Автор:</strong> редакція «Лінь»</div>
          <div class="tag-list" aria-label="Теми статті">${(article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        </header>

        <div class="article-layout shell">
          <aside class="article-toc" aria-label="Зміст статті">
            <strong>Зміст статті</strong>
            ${tocHtml}
            <a href="#table-title">Що помічаєте → що робити</a>
            <a href="#practice-title">Практичний план</a>
            <a href="#help-title">Коли самодопомоги недостатньо</a>
            <a href="#faq-title">Поширені запитання</a>
            <a href="#sources-title">Джерела</a>
          </aside>

          <div class="article-body">
            <p>${escapeHtml(article.intro)}</p>
            <section class="bot-cta" aria-labelledby="bot-cta-top">
              <p class="section-kicker">Практика до статті</p>
              <h2 id="bot-cta-top">Розкладіть стан на конкретні спостереження</h2>
              <p>У Telegram-боті можна коротко описати, що саме змінилося, відокремити факт від самокритики й обрати один доступний крок на сьогодні.</p>
              <a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Розібрати ситуацію в боті <span aria-hidden="true">↗</span></a>
            </section>
            ${sectionsHtml}
            <section aria-labelledby="table-title"><h2 id="table-title">Що помічаєте → що робити</h2>${tableHtml}</section>
            <section aria-labelledby="practice-title"><h2 id="practice-title">Практичний план на найближчі дні</h2><ol class="check-list">${practiceHtml}</ol></section>
            <section aria-labelledby="help-title"><h2 id="help-title">Коли самодопомоги недостатньо</h2>${helpHtml}<div class="note-box"><strong>Важливо</strong><p>Матеріал має освітній характер і не встановлює діагнозів. За безпосередньої небезпеки потрібна невідкладна допомога у вашій країні.</p></div></section>
            <section aria-labelledby="faq-title"><h2 id="faq-title">Поширені запитання</h2><div class="faq-list">${faqHtml}</div></section>
            <section aria-labelledby="sources-title"><h2 id="sources-title">Надійні джерела</h2><ul class="source-list">${sourceHtml}</ul></section>
          </div>
        </div>

        ${relatedHtml ? `<section class="section shell"><div class="section-heading"><p class="section-kicker">Читайте далі</p><h2>Пов’язані матеріали</h2></div><div class="article-grid">${relatedHtml}</div></section>` : ''}
      </article>`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', headline: article.title, description, datePublished: '2026-08-08', dateModified: '2026-08-08', inLanguage: 'uk', mainEntityOfPage: canonical, author: {'@type':'Organization', name:'Редакція «Лінь»'}, publisher: {'@type':'Organization', name:'Лінь', url:'https://xn--k1ae9bxb.online/'} },
        { '@type': 'FAQPage', mainEntity: (article.faq || []).map((entry) => ({ '@type':'Question', name:entry.q, acceptedAnswer:{'@type':'Answer', text:entry.a} })) }
      ]
    };
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify(jsonLd);
    document.head.append(ld);
  };

  const renderWithToneOverrides = () => {
    const toneScript = document.createElement('script');
    toneScript.src = '/apathy-tone-overrides.js';
    toneScript.onload = render;
    toneScript.onerror = render;
    document.head.append(toneScript);
  };

  if (!main) return;
  if (window.HABITTEEN_APATHY_ARTICLES) {
    renderWithToneOverrides();
  } else {
    const dataScript = document.createElement('script');
    dataScript.src = '/apathy-rich-content.js';
    dataScript.onload = renderWithToneOverrides;
    dataScript.onerror = showNotFound;
    document.head.append(dataScript);
  }
})();
