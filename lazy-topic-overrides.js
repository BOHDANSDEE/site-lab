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
      desc: 'Як відрізнити нестачу ресурсу, нечітку мету, страх помилки, відсутність сенсу та звичку до швидкої винагороди.',
      time: 12
    },
    'yak-diiaty-koly-nemaie-motyvatsii': {
      slug: 'yak-diiaty-koly-nemaie-motyvatsii',
      title: 'Як діяти, коли немає мотивації',
      desc: 'Як не чекати правильного настрою, перевірити енергію, почати з мінімальної дії та повернутися після пропуску без самокритики.',
      time: 12
    },
    'yak-povernutysia-do-sprav-pislia-perervy': {
      slug: 'yak-zmusyty-sebe-vchytysia',
      title: 'Як змусити себе вчитися, коли лінь: практичний план',
      desc: 'Як почати навчання без багатогодинного примусу, зробити матеріал конкретним і перевіряти знання активними способами.',
      time: 12
    },
    'lin-i-son': {
      slug: 'yak-zmusyty-sebe-prybyraty',
      title: 'Як змусити себе прибирати, коли лінь',
      desc: 'Система коротких зон, видимого результату й простого завершення, щоб прибирання не перетворювалося на проєкт на весь день.',
      time: 11
    },
    'yak-rozbyty-velyke-zavdannia': {
      slug: 'lin-u-pidlitkiv',
      title: 'Лінь у підлітків: причини та що робити батькам',
      desc: 'Як відрізнити звичайний опір від недосипу, перевантаження або тривалих змін і домовлятися без ярликів та приниження.',
      time: 12
    },
    'koly-vse-zdaietsia-zanadto-skladnym': {
      slug: 'yak-vstaty-z-lizhka-vrantsi',
      title: 'Як змусити себе встати з ліжка вранці',
      desc: 'Що робити з ранковою млявістю: світло, стабільний підйом, підготовка вечора та перші дії без переговорів із собою.',
      time: 11
    },
    'samodystsyplina-bez-samokrytyky': {
      slug: 'chomu-pislia-roboty-nichoho-ne-khochetsia',
      title: 'Чому після роботи нічого не хочеться робити',
      desc: 'Як розрізнити нормальну потребу у відпочинку, перевантаження й виснаження та повернути сили на вечір без другого робочого дня.',
      time: 12
    },
    'seredovyshche-dlia-lehkoho-startu': {
      slug: 'yak-rozvynuty-samodystsyplinu',
      title: 'Як розвинути самодисципліну й перестати лінуватися',
      desc: 'Як будувати регулярність через стабільні сигнали, мінімальну версію дії, видимий прогрес і правило повернення після пропуску.',
      time: 12
    }
  };

  window.HABITTEEN_ARTICLE_INDEX = (window.HABITTEEN_ARTICLE_INDEX || []).map((item) => {
    const replacement = replacements[item.slug];
    return replacement ? Object.assign({}, item, replacement) : item;
  });
})();
