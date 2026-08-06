(() => {
  const replacements = {
    'prokrastynatsiia-i-tryvoha': {
      title: 'Прокрастинація на роботі: як перестати відкладати важливі завдання',
      desc: 'Як захистити час для складної роботи, створити проміжні дедлайни, керувати повідомленнями й узгоджувати реальні пріоритети.',
      time: 12
    },
    'sduh-i-prokrastynatsiia': {
      title: 'Як зосередитися й не відволікатися під час роботи або навчання',
      desc: 'Практична система уваги: ясний результат сесії, менше перемикань, робочі інтервали та швидке повернення після перерви.',
      time: 12
    }
  };

  const items = window.HABITTEEN_ARTICLE_INDEX || [];
  items.forEach((item) => {
    const replacement = replacements[item.slug];
    if (replacement) Object.assign(item, replacement);
  });
})();
