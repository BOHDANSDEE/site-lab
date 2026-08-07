(() => {
  const items = window.HABITTEEN_ARTICLE_INDEX || [];
  const article = items.find((item) => item.slug === 'telefon-korotki-video-i-prokrastynatsiia');

  if (article) {
    Object.assign(article, {
      title: 'Як менше сидіти в телефоні й жити вільніше',
      desc: 'Практичний план без жорсткого цифрового детоксу: повернути собі час, увагу, сон і більше живих справ.',
      time: 12
    });
  }

  if (!document.querySelector('script[data-audience-copy-loader]')) {
    const script = document.createElement('script');
    script.src = '/article-audience.js';
    script.defer = true;
    script.dataset.audienceCopyLoader = '';
    script.onload = () => {
      const removeGenericAudienceTag = () => {
        document.querySelectorAll('[data-audience-tag]').forEach((tag) => tag.remove());
      };
      removeGenericAudienceTag();
      const root = document.querySelector('#content') || document.body;
      const observer = new MutationObserver(removeGenericAudienceTag);
      observer.observe(root, { childList: true, subtree: true });
    };
    document.head.append(script);
  }
})();
