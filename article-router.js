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
    'emotsiine-vyhorannia-symptomy',
    'yak-dopomohty-liudyni-z-apatiieiu',
    'apatiia-pislia-stresu',
    'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia',
    'postiino-khochetsia-spaty-i-nemaie-syl',
    'apatiia-u-pidlitkiv',
    'postiina-vtoma-i-nemaie-syl',
    'nemaie-syl-nichoho-robyty'
  ]);

  const script = document.createElement('script');
  script.src = apathyRichSlugs.has(slug)
    ? '/article-page-apathy.js'
    : lazinessRichSlugs.has(slug)
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
