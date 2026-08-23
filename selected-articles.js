(() => {
  const selected = [
    ['yak-poboroty-lin', 'Як побороти лінь'],
    ['prychyny-lini', 'Чому виникає лінь і що з цим робити'],
    ['yak-diiaty-koly-nemaie-motyvatsii', 'Що робити, коли немає мотивації'],
    ['yak-vstaty-z-lizhka-vrantsi', 'Як прокидатися зранку'],
    ['apatiia-u-pidlitkiv', 'Апатія у підлітків: ознаки, причини та коли потрібна допомога'],
    ['nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia', 'Нічого не радує: як повернути інтерес до життя'],
    ['apatiia-shcho-robyty', 'Апатія: що робити, коли нічого не хочеться'],
    ['yak-vybraty-priorytet-koly-vse-terminove', 'Як вибирати пріоритети'],
    ['sduh-i-prokrastynatsiia', 'Як зосередитися на навчанні']
  ];

  const source = window.HABITTEEN_ARTICLE_INDEX || [];
  const bySlug = new Map(source.map((item) => [item.slug, item]));
  window.HABITTEEN_ARTICLE_INDEX = selected
    .map(([slug, title]) => {
      const item = bySlug.get(slug);
      return item ? Object.assign({}, item, { title }) : null;
    })
    .filter(Boolean);
})();
