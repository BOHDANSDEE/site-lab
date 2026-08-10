(() => {
  const articlePath = /^\/statti\/[^/]+\/?$/;
  if (!articlePath.test(location.pathname)) return;

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

    if (position === 'top') {
      section.innerHTML = `
        <p class="section-kicker">Практика</p>
        <h2>Розібрати свою ситуацію в Telegram-боті</h2>
        <p>Коротко опишіть, що відбувається, і визначте один конкретний крок.</p>
        <a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Відкрити Telegram-бота <span aria-hidden="true">↗</span></a>`;
    } else {
      section.innerHTML = `
        <p class="section-kicker">Спробуйте на своїй ситуації</p>
        <h2>Перейдіть від читання до конкретної дії</h2>
        <p>Опишіть свою ситуацію в боті та сформулюйте наступний практичний крок.</p>
        <a class="button button-primary" href="https://t.me/HabitTeen_bot" target="_blank" rel="noopener noreferrer">Відкрити Telegram-бота <span aria-hidden="true">↗</span></a>`;
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
