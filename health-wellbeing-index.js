(() => {
  const items = [
    {slug:'chomu-prokydaiusia-vtomlenym-pislia-snu',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Чому прокидаюся втомленим навіть після 8 годин сну',desc:'Як перевірити фактичну тривалість і якість сну, нічні пробудження та денну сонливість.',time:10},
    {slug:'yak-nalahodyty-rezhym-snu',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Як налагодити режим сну',desc:'Як стабілізувати підйом, ранкове світло й вечірній сценарій без різкого перевороту графіка.',time:10},
    {slug:'yak-shvydko-zasnuty-bez-likiv',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Як швидко заснути без ліків',desc:'Що робити, коли сон не приходить: менше боротьби, спокійний сценарій і межі домашньої самодопомоги.',time:10},
    {slug:'chomu-vazhko-prokynutysia-vrantsi',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Чому важко прокидатися вранці',desc:'Як відрізнити недосип, нестабільний режим і стійку денну сонливість.',time:10},
    {slug:'chomu-khochetsia-spaty-pislia-yizhi',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Чому після їжі хочеться спати',desc:'Коли післяобідній спад може бути звичайним і що перевірити при сильній повторюваній сонливості.',time:9},
    {slug:'chomu-bolyt-holova-i-nemaie-syl',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Головний біль і немає сил: що перевірити',desc:'Як оцінити сон, воду, їжу, повторюваність і тривожні ознаки без самодіагностики.',time:9},
    {slug:'chomu-krutytsia-holova-i-slabkist',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Крутиться голова і слабкість: що робити',desc:'Безпечні перші дії, точний опис запаморочення і ознаки, з якими не варто чекати.',time:9},
    {slug:'yak-vidnovytysia-pislia-nedosypu',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Як відновитися після недосипу',desc:'Як пройти день безпечніше, використати відпочинок і не зламати наступну ніч.',time:9},
    {slug:'chomu-nemaie-syl-pislia-khvoroby',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Немає сил після хвороби: як відновлюватися',desc:'Як повертати навантаження поступово й оцінювати динаміку відновлення.',time:9},
    {slug:'chomu-nemaie-apetytu-i-syl',cat:'Здоров’я та самопочуття',cat_slug:'statti/zdorovia-ta-samopochuttia',title:'Немає апетиту і сил: що перевірити',desc:'Як підтримати базове харчування, оцінити тривалість і не пропустити ситуації для консультації.',time:9}
  ];
  const current = window.HABITTEEN_ARTICLE_INDEX || [];
  const slugs = new Set(items.map(x => x.slug));
  window.HABITTEEN_ARTICLE_INDEX = [...current.filter(x => !slugs.has(x.slug)), ...items];
})();