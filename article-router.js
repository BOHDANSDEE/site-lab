(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const procrastinationRichSlugs = new Set([
    'prokrastynatsiia-i-perfektsionizm',
    'akademichna-prokrastynatsiia',
    'prokrastynatsiia-i-tryvoha',
    'chomu-vse-roblu-v-ostanniu-myt',
    'sduh-i-prokrastynatsiia',
    'metod-pomodoro',
    'nichna-prokrastynatsiia',
    'telefon-korotki-video-i-prokrastynatsiia'
  ]);
  const lazinessRichSlugs = new Set([
    'prychyny-lini',
    'lin-chy-vyhorannia',
    'yak-diiaty-koly-nemaie-motyvatsii',
    'yak-zmusyty-sebe-vchytysia',
    'yak-zmusyty-sebe-prybyraty',
    'lin-u-pidlitkiv',
    'yak-vstaty-z-lizhka-vrantsi',
    'chomu-pislia-roboty-nichoho-ne-khochetsia',
    'yak-rozvynuty-samodystsyplinu'
  ]);

  const script = document.createElement('script');
  script.src = lazinessRichSlugs.has(slug)
    ? '/article-page-lazy.js'
    : procrastinationRichSlugs.has(slug)
      ? '/article-page.js'
      : '/article-page-base.js';
  script.async = false;
  script.onerror = () => {
    const main = document.querySelector('#content');
    if (main) main.innerHTML = '<section class="page-hero shell"><h1>Не вдалося завантажити матеріал</h1><p class="page-intro">Спробуйте оновити сторінку або поверніться до бібліотеки.</p></section>';
  };
  document.head.append(script);
})();
