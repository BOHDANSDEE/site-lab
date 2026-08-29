(() => {
 const items=[
  {slug:'apatiia-shcho-robyty',cat:'Апатія',cat_slug:'apatiia',title:'Апатія: що робити',desc:'Як розібратися, чому зникли бажання та інтерес, що можна зробити самостійно і коли потрібна професійна оцінка.',time:10},
  {slug:'chomu-nichoho-ne-khochetsia-robyty',cat:'Апатія',cat_slug:'apatiia',title:'Чому нічого не хочеться робити',desc:'Як відрізнити брак сил, втрату сенсу конкретних справ і ширшу втрату інтересу.',time:10},
  {slug:'nichogo-ne-raduie',cat:'Апатія',cat_slug:'apatiia',title:'Чому нічого не радує',desc:'Чому звичні приємні речі можуть перестати давати відгук і коли це варто обговорити з фахівцем.',time:10},
  {slug:'yak-povernuty-interes-do-zhyttia',cat:'Апатія',cat_slug:'apatiia',title:'Як повернути інтерес до життя',desc:'Як поступово повертати цікавість і залученість без вимоги негайно відчути сильну мотивацію.',time:10},
  {slug:'lin-chy-apatiia',cat:'Апатія',cat_slug:'apatiia',title:'Лінь чи апатія',desc:'Як відрізнити небажання конкретної справи від ширшої втрати інтересу та обрати різні дії.',time:10}
 ];
 const current=window.HABITTEEN_ARTICLE_INDEX||[];
 const slugs=new Set(items.map(x=>x.slug));
 window.HABITTEEN_ARTICLE_INDEX=[...current.filter(x=>!slugs.has(x.slug)),...items];
})();