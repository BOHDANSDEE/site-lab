(() => {
  const articlePath = /^\/statti\/([^/]+)\/?$/;
  const articleMatch = location.pathname.match(articlePath);
  if (!articleMatch) return;

  const BOT_BASE_URL = 'https://t.me/HabitTeen_bot';
  const ARTICLE_START_PREFIX = 'article_';

  const articleSlug = articleMatch[1];
  const startPayload = `${ARTICLE_START_PREFIX}${articleSlug}`;
  const hasSafePayload = /^[A-Za-z0-9_-]+$/.test(startPayload) && startPayload.length <= 64;
  const articleBotUrl = hasSafePayload
    ? `${BOT_BASE_URL}?start=${encodeURIComponent(startPayload)}`
    : BOT_BASE_URL;

  const removableHeadings = new Set([
    'Практика на сім днів',
    'Як застосувати матеріал до своєї ситуації',
    'Головне з матеріалу'
  ].map((label) => label.toLocaleLowerCase('uk-UA')));

  const repeatedIntroStarts = [
    'Слово «лінь» часто приховує',
    'Побутове слово «лінь» часто приховує',
    'Прокрастинація часто допомагає короткочасно уникнути',
    'Апатія описує зниження інтересу й активності'
  ];

  const removeRepeatedSections = (body) => {
    const removedLabels = new Set();

    body.querySelectorAll('h2').forEach((heading) => {
      const label = heading.textContent.trim();
      if (!removableHeadings.has(label.toLocaleLowerCase('uk-UA'))) return;

      const section = heading.closest('section');
      if (section && section.parentElement === body) {
        section.remove();
      } else {
        const next = heading.nextElementSibling;
        heading.remove();
        if (next?.classList.contains('key-points')) next.remove();
      }
      removedLabels.add(label.toLocaleLowerCase('uk-UA'));
    });

    if (!removedLabels.size) return;
    document.querySelectorAll('.article-toc a').forEach((link) => {
      if (removedLabels.has(link.textContent.trim().toLocaleLowerCase('uk-UA'))) link.remove();
    });
  };

  const makeBotCta = (position) => {
    const section = document.createElement('section');
    section.className = `bot-cta article-bot-cta article-bot-cta-${position}`;
    section.dataset.articleSlug = articleSlug;
    section.dataset.botStartPayload = hasSafePayload ? startPayload : '';

    if (position === 'top') {
      section.innerHTML = `
        <p class="section-kicker">Практика до цієї статті</p>
        <h2>Пройдіть саме цей рівень у Telegram</h2>
        <p>Не шукайте тему повторно. Кнопка відкриє в HabitTeen рівень цієї статті, а бот одразу дасть розбір: стан, проблему, вторинну вигоду, значення в житті, три конкретні кроки та афірмацію.</p>
        <a class="button button-primary" data-article-bot-deeplink="true" href="${articleBotUrl}" target="_blank" rel="noopener noreferrer">🚀 Пройти цей рівень у Telegram <span aria-hidden="true">↗</span></a>`;
    } else {
      section.innerHTML = `
        <p class="section-kicker">Від читання до дії</p>
        <h2>Застосуйте матеріал одразу після статті</h2>
        <p>HabitTeen відкриє саме цей рівень без меню й повторного пошуку. Пройдіть розбір і виберіть дію, яку реально зробити зараз.</p>
        <a class="button button-primary" data-article-bot-deeplink="true" href="${articleBotUrl}" target="_blank" rel="noopener noreferrer">✨ Відкрити рівень цієї статті <span aria-hidden="true">↗</span></a>`;
    }

    return section;
  };

  const placeBotCtas = (body) => {
    body.querySelectorAll('.bot-cta').forEach((block) => block.remove());

    const faq = body.querySelector('section[aria-labelledby="faq-title"], .article-faq');
    let anchor = null;
    let paragraphCount = 0;

    for (const paragraph of body.querySelectorAll('p')) {
      if (paragraph.closest('.article-faq, [aria-labelledby="faq-title"], .source-list, .note-box, .safety-box')) continue;
      if (!paragraph.textContent.trim()) continue;
      anchor = paragraph;
      paragraphCount += 1;
      if (paragraphCount === 3) break;
    }

    if (anchor) anchor.insertAdjacentElement('afterend', makeBotCta('top'));

    if (faq) {
      faq.before(makeBotCta('bottom'));
    } else {
      body.append(makeBotCta('bottom'));
    }
  };

  const notifyReady = () => {
    document.dispatchEvent(new CustomEvent('habitteen:article-ready'));
  };

  const prune = () => {
    const body = document.querySelector('.article-body');
    if (!body || body.dataset.deduplicated === 'true') return false;

    removeRepeatedSections(body);

    const firstParagraph = body.querySelector(':scope > p:first-child');
    if (firstParagraph) {
      const text = firstParagraph.textContent.trim();
      if (repeatedIntroStarts.some((start) => text.startsWith(start))) firstParagraph.remove();
    }

    placeBotCtas(body);
    body.dataset.deduplicated = 'true';
    body.dataset.botCtasPlaced = 'true';
    body.dataset.articleBotDeeplink = hasSafePayload ? 'true' : 'fallback';
    return true;
  };

  if (prune()) {
    notifyReady();
    return;
  }

  const target = document.querySelector('#content') || document.body;
  const observer = new MutationObserver(() => {
    if (!prune()) return;
    observer.disconnect();
    notifyReady();
  });
  observer.observe(target, { childList: true, subtree: true });
})();
