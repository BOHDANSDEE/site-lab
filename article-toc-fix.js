(() => {
  const content = document.querySelector('#content');
  if (!content) return;

  const fixLinks = () => {
    const links = document.querySelectorAll('.article-toc a[href^="#"]');
    if (!links.length) return false;

    links.forEach((link) => {
      const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
      if (!targetId || document.getElementById(targetId)) return;
      const titledTarget = document.getElementById(`${targetId}-title`);
      if (titledTarget) link.setAttribute('href', `#${targetId}-title`);
    });

    return Boolean(document.querySelector('.article-body'));
  };

  if (fixLinks()) return;

  const observer = new MutationObserver(() => {
    if (!fixLinks()) return;
    observer.disconnect();
  });
  observer.observe(content, { childList: true, subtree: true });
})();
