(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const richSlugs = new Set([
    'prokrastynatsiia-i-perfektsionizm',
    'akademichna-prokrastynatsiia',
    'prokrastynatsiia-i-tryvoha',
    'chomu-vse-roblu-v-ostanniu-myt',
    'sduh-i-prokrastynatsiia',
    'metod-pomodoro',
    'nichna-prokrastynatsiia',
    'telefon-korotki-video-i-prokrastynatsiia'
  ]);

  const script = document.createElement('script');
  script.src = richSlugs.has(slug) ? '/article-page.js' : '/article-page-base.js';
  script.async = false;
  script.onerror = () => {
    const main = document.querySelector('#content');
    if (main) main.innerHTML = '<section class="page-hero shell"><h1>Не вдалося завантажити матеріал</h1><p class="page-intro">Спробуйте оновити сторінку або поверніться до бібліотеки.</p></section>';
  };
  document.head.append(script);
})();
