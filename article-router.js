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
  const apathyRichSlugs = new Set([
    'apatiia-i-vyhorannia',
    'yak-pidtrymaty-liudynu-z-apatiieiu',
    'apatiia-pislia-stresu',
    'yak-povernuty-interes-do-sprav',
    'apatiia-i-son',
    'apatiia-u-pidlitkiv',
    'yak-hovoryty-z-likarem-pro-apatiiu',
    'mali-dii-pry-nyzkii-energii'
  ]);

  const script = document.createElement('script');
  script.src = lazinessRichSlugs.has(slug)
    ? '/article-page-lazy.js'
    : apathyRichSlugs.has(slug)
      ? '/article-page-apathy.js'
      : procrastinationRichSlugs.has(slug)
        ? '/article-page.js'
        : '/article-page-base.js';
  script.async = false;
  script.onerror = () => {
    const main = document.querySelector('#content');
    if (main) main.innerHTML = '<section class="page-hero shell"><h1>Не вдалося завантажити матеріал</h1><p class="page-intro">Спробуйте оновити сторінку або поверніться до бібліотеки.</p></section>';
  };
  document.head.append(script);

  if (apathyRichSlugs.has(slug)) {
    const seoScript = document.createElement('script');
    seoScript.src = '/apathy-search-optimizations.js';
    seoScript.async = false;
    document.head.append(seoScript);
  }
})();
