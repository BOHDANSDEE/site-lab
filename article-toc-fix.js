(() => {
  const fixLinks = () => {
    document.querySelectorAll('.article-toc a[href^="#"]').forEach((link) => {
      const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
      if (!targetId || document.getElementById(targetId)) return;
      if (document.getElementById(`${targetId}-title`)) {
        link.setAttribute('href', `#${targetId}-title`);
      }
    });
  };

  const content = document.querySelector('#content');
  if (!content) return;
  const observer = new MutationObserver(fixLinks);
  observer.observe(content, { childList: true, subtree: true });
  fixLinks();
})();
