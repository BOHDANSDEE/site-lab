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
      desc: 'Для підлітків і молодих дорослих: 8 зрозумілих причин, чому відкладаються навчання, побут і особисті справи.',
      time: 12
    },
    'yak-diiaty-koly-nemaie-motyvatsii': {
      slug: 'yak-diiaty-koly-nemaie-motyvatsii',
      title: 'Як діяти, коли немає мотивації',
      desc: 'Для старшокласників, студентів і молодих працівників: як починати без очікування правильного настрою.',
      time: 12
    },
    'yak-povernutysia-do-sprav-pislia-perervy': {
      slug: 'yak-zmusyty-sebe-vchytysia',
      title: 'Як змусити себе вчитися, коли лінь: практичний план',
      desc: 'Для школярів, студентів і абітурієнтів: короткі навчальні сесії, зрозумілий результат і перевірка себе без підглядання.',
      time: 12
    },
    'lin-i-son': {
      slug: 'yak-zmusyty-sebe-prybyraty',
      title: 'Як змусити себе прибирати, коли лінь',
      desc: 'Для студентів і молодих людей: як почати з однієї зони в кімнаті, гуртожитку чи квартирі без генерального прибирання.',
      time: 11
    },
    'yak-rozbyty-velyke-zavdannia': {
      slug: 'lin-u-pidlitkiv',
      title: 'Лінь у підлітків: причини та що робити батькам',
      desc: 'Для батьків підлітків: як перевірити сон, навчальне навантаження, самостійність і тривалі зміни без ярлика «ледачий».',
      time: 12
    },
    'koly-vse-zdaietsia-zanadto-skladnym': {
      slug: 'yak-vstaty-z-lizhka-vrantsi',
      title: 'Як змусити себе встати з ліжка вранці',
      desc: 'Для старшокласників, студентів і молодих працівників: сон, будильник, світло й простіші ранкові дії.',
      time: 11
    },
    'samodystsyplina-bez-samokrytyky': {
      slug: 'chomu-pislia-roboty-nichoho-ne-khochetsia',
      title: 'Чому після роботи нічого не хочеться робити',
      desc: 'Для працюючих дорослих: як зрозуміти тип вечірньої втоми й не перетворювати вечір на другу робочу зміну.',
      time: 12
    },
    'seredovyshche-dlia-lehkoho-startu': {
      slug: 'yak-rozvynuty-samodystsyplinu',
      title: 'Як розвинути самодисципліну й перестати лінуватися',
      desc: 'Для старшокласників, студентів і молодих дорослих: система для навчання, спорту й побуту без щоденної боротьби із собою.',
      time: 12
    }
  };

  const baseAudienceCopy = {
    'yak-poboroty-lin': 'Для підлітків, студентів і дорослих: як знайти конкретну причину складного старту й зробити перший крок за 5–10 хвилин.',
    'lin-chy-vtoma': 'Для тих, хто після навчання або роботи не розуміє, чи це небажання конкретної справи, чи справжня втома.'
  };

  window.HABITTEEN_ARTICLE_INDEX = (window.HABITTEEN_ARTICLE_INDEX || []).map((item) => {
    const replacement = replacements[item.slug];
    const mapped = replacement ? Object.assign({}, item, replacement) : Object.assign({}, item);
    if (baseAudienceCopy[mapped.slug]) mapped.desc = baseAudienceCopy[mapped.slug];
    return mapped;
  });
})();
