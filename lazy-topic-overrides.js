(() => {
  window.HABITTEEN_ARTICLE_SOURCES = Object.assign(
    window.HABITTEEN_ARTICLE_SOURCES || {},
    {
      who_burnout: {
        label: 'ВООЗ: вигорання як професійне явище',
        url: 'https://www.who.int/standards/classifications/frequently-asked-questions/burn-out-an-occupational-phenomenon'
      },
      who_adolescent: {
        label: 'ВООЗ: психічне здоров’я підлітків',
        url: 'https://www.who.int/news-room/fact-sheets/adolescent-mental-health'
      },
      cdc_teen_sleep: {
        label: 'CDC: сон дітей і підлітків',
        url: 'https://www.cdc.gov/physical-activity-education/staying-healthy/sleep.html'
      },
      cdc_adult_sleep: {
        label: 'CDC: сон дорослих',
        url: 'https://www.cdc.gov/sleep/data-research/facts-stats/adults-sleep-facts-and-stats.html'
      },
      habit_formation: {
        label: 'Систематичний огляд: як формуються звички',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/'
      },
      retrieval_practice: {
        label: 'Науковий огляд: практика відтворення для навчання',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6920642/'
      }
    }
  );

  const replacements = {
    'chomu-vazhko-pochaty-prostu-spravu': {
      slug: 'prychyny-lini',
      title: 'Чому виникає лінь: 8 причин і що з ними робити',
      desc: '8 зрозумілих причин, чому відкладаються навчання, побут, робочі й особисті справи, та що можна зробити.',
      time: 12
    },
    'yak-diiaty-koly-nemaie-motyvatsii': {
      slug: 'yak-diiaty-koly-nemaie-motyvatsii',
      title: 'Як діяти, коли немає мотивації',
      desc: 'Як починати без очікування правильного настрою й мати простий план навіть на слабкий день.',
      time: 12
    },
    'yak-povernutysia-do-sprav-pislia-perervy': {
      slug: 'yak-zmusyty-sebe-vchytysia',
      title: 'Як змусити себе вчитися, коли лінь: практичний план',
      desc: 'Короткі навчальні сесії, зрозумілий результат і перевірка себе без нескінченного перечитування.',
      time: 12
    },
    'lin-i-son': {
      slug: 'yak-zmusyty-sebe-prybyraty',
      title: 'Як змусити себе прибирати, коли лінь',
      desc: 'Як почати з однієї зони й повернути порядок без генерального прибирання на пів дня.',
      time: 11
    },
    'yak-rozbyty-velyke-zavdannia': {
      slug: 'lin-u-pidlitkiv',
      title: 'Лінь у підлітків: причини та що робити батькам',
      desc: 'Як перевірити сон, навчальне навантаження, самостійність і тривалі зміни без ярлика «ледачий».',
      time: 12
    },
    'koly-vse-zdaietsia-zanadto-skladnym': {
      slug: 'yak-vstaty-z-lizhka-vrantsi',
      title: 'Як змусити себе встати з ліжка вранці',
      desc: 'Як перевірити сон, будильник, світло й ранкові звички, якщо важко прокидатися вчасно.',
      time: 11
    },
    'samodystsyplina-bez-samokrytyky': {
      slug: 'chomu-pislia-roboty-nichoho-ne-khochetsia',
      title: 'Чому після роботи нічого не хочеться робити',
      desc: 'Як зрозуміти тип вечірньої втоми й не перетворювати вечір на другу робочу зміну.',
      time: 12
    },
    'seredovyshche-dlia-lehkoho-startu': {
      slug: 'yak-rozvynuty-samodystsyplinu',
      title: 'Як розвинути самодисципліну й перестати лінуватися',
      desc: 'Система для навчання, роботи, спорту й побуту без щоденної боротьби із собою.',
      time: 12
    }
  };

  const baseCopy = {
    'yak-poboroty-lin': 'Як знайти конкретну причину складного старту й зробити перший реальний крок за 5–10 хвилин.',
    'lin-chy-vtoma': 'Як зрозуміти, чи важко через конкретну справу, чи організму справді бракує сил і відновлення.'
  };

  window.HABITTEEN_ARTICLE_INDEX = (window.HABITTEEN_ARTICLE_INDEX || []).map((item) => {
    const replacement = replacements[item.slug];
    const mapped = replacement ? Object.assign({}, item, replacement) : Object.assign({}, item);
    if (baseCopy[mapped.slug]) mapped.desc = baseCopy[mapped.slug];
    return mapped;
  });
})();
