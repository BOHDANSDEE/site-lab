(() => {
  const articlePath = /^\/statti\/[^/]+\/?$/;
  if (!articlePath.test(location.pathname)) return;

  const removeTocLinks = (labels) => {
    const normalized = new Set(labels.map((label) => label.trim().toLocaleLowerCase('uk-UA')));
    document.querySelectorAll('.article-toc a').forEach((link) => {
      const text = link.textContent.trim().toLocaleLowerCase('uk-UA');
      if (normalized.has(text)) link.remove();
    });
  };

  const removeSectionByHeading = (headingText) => {
    const wanted = headingText.trim().toLocaleLowerCase('uk-UA');
    const heading = [...document.querySelectorAll('.article-body h2')]
      .find((node) => node.textContent.trim().toLocaleLowerCase('uk-UA') === wanted);
    if (!heading) return false;

    const section = heading.closest('section');
    if (section && section.parentElement?.classList.contains('article-body')) {
      section.remove();
      removeTocLinks([headingText]);
      return true;
    }

    const next = heading.nextElementSibling;
    heading.remove();
    if (next?.classList.contains('key-points')) next.remove();
    removeTocLinks([headingText]);
    return true;
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
    // Спочатку прибираємо всі старі промоблоки, щоб у кожній статті було рівно два.
    body.querySelectorAll('.bot-cta').forEach((block) => block.remove());

    const faq = body.querySelector('section[aria-labelledby="faq-title"], .article-faq');
    const paragraphs = [...body.querySelectorAll('p')].filter((paragraph) => {
      if (paragraph.closest('.article-faq, [aria-labelledby="faq-title"], .source-list, .note-box, .safety-box')) return false;
      return paragraph.textContent.trim().length > 0;
    });

    // Перший CTA — після третього змістового абзацу. Якщо абзаців менше, після останнього доступного.
    const anchor = paragraphs[Math.min(2, Math.max(0, paragraphs.length - 1))];
    if (anchor) anchor.insertAdjacentElement('afterend', makeBotCta('top'));

    // Другий CTA — безпосередньо перед FAQ.
    if (faq) {
      faq.before(makeBotCta('bottom'));
    } else if (body.lastElementChild) {
      body.append(makeBotCta('bottom'));
    }
  };

  const prune = () => {
    const body = document.querySelector('.article-body');
    if (!body) return false;

    // Однакові службові блоки, що повторювали зміст у багатьох матеріалах.
    removeSectionByHeading('Практика на сім днів');
    removeSectionByHeading('Як застосувати матеріал до своєї ситуації');
    removeSectionByHeading('Головне з матеріалу');

    // Генератори додавали ще один загальний вступ перед уже тематичним першим H2.
    const firstParagraph = body.querySelector(':scope > p:first-child');
    if (firstParagraph) {
      const text = firstParagraph.textContent.trim();
      const repeatedIntroStarts = [
        'Слово «лінь» часто приховує',
        'Побутове слово «лінь» часто приховує',
        'Прокрастинація часто допомагає короткочасно уникнути',
        'Апатія описує зниження інтересу й активності'
      ];
      if (repeatedIntroStarts.some((start) => text.startsWith(start))) firstParagraph.remove();
    }

    placeBotCtas(body);
    body.dataset.deduplicated = 'true';
    body.dataset.botCtasPlaced = 'true';
    return true;
  };

  if (prune()) return;

  const observer = new MutationObserver(() => {
    if (prune()) observer.disconnect();
  });
  observer.observe(document.querySelector('#content') || document.body, { childList: true, subtree: true });
})();
