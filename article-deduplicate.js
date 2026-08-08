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

  const prune = () => {
    const body = document.querySelector('.article-body');
    if (!body) return false;

    // Промоблоки всередині статей повторювали вступ або практичний висновок.
    body.querySelectorAll(':scope > .bot-cta').forEach((block) => block.remove());

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

    body.dataset.deduplicated = 'true';
    return true;
  };

  if (prune()) return;

  const observer = new MutationObserver(() => {
    if (prune()) observer.disconnect();
  });
  observer.observe(document.querySelector('#content') || document.body, { childList: true, subtree: true });
})();
