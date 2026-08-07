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
    document.head.append(script);
  }
})();
