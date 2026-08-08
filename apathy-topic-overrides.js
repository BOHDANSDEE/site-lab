(() => {
  const replacements = {
    'apatiia-i-vyhorannia': {
      slug: 'emotsiine-vyhorannia-symptomy',
      title: 'Емоційне вигорання: симптоми та чим відрізняється від апатії',
      desc: 'Робочий контекст, виснаження, дистанціювання, падіння ефективності й межі самодіагностики.',
      time: 12
    },
    'yak-pidtrymaty-liudynu-z-apatiieiu': {
      slug: 'yak-dopomohty-liudyni-z-apatiieiu',
      title: 'Як допомогти людині з апатією: підтримка без тиску',
      desc: 'Що можуть зробити близькі, де проходять межі відповідальності та коли потрібен фахівець.',
      time: 11
    },
    'apatiia-pislia-stresu': {
      slug: 'apatiia-pislia-stresu',
      title: 'Апатія після стресу: чому нічого не хочеться і як відновлюватися',
      desc: 'Як повернути базові опори після напруженого періоду й оцінити динаміку стану.',
      time: 12
    },
    'yak-povernuty-interes-do-sprav': {
      slug: 'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia',
      title: 'Нічого не радує: як повернути інтерес до життя',
      desc: 'Як оцінити широку втрату інтересу й поступово повертати залученість без вимоги негайної радості.',
      time: 11
    },
    'apatiia-i-son': {
      slug: 'postiino-khochetsia-spaty-i-nemaie-syl',
      title: 'Постійно хочеться спати і немає сил: причини та що робити',
      desc: 'Як відрізнити денну сонливість від загальної втоми, що перевірити у сні та коли звернутися до лікаря.',
      time: 12
    },
    'apatiia-u-pidlitkiv': {
      slug: 'apatiia-u-pidlitkiv',
      title: 'Апатія у підлітків: ознаки, причини та коли потрібна допомога',
      desc: 'Тривалі зміни, сон, навчальне навантаження, функціонування та ознаки безпеки.',
      time: 11
    },
    'yak-hovoryty-z-likarem-pro-apatiiu': {
      slug: 'postiina-vtoma-i-nemaie-syl',
      title: 'Постійна втома і немає сил: причини та що перевірити',
      desc: 'Як описати тривалу втому, перевірити базові фактори й підготуватися до консультації.',
      time: 12
    },
    'mali-dii-pry-nyzkii-energii': {
      slug: 'nemaie-syl-nichoho-robyty',
      title: 'Немає сил нічого робити: що робити, коли енергія на нулі',
      desc: 'Мінімум для слабкого дня, делегування окремих задач і межа між самодопомогою й професійною оцінкою.',
      time: 11
    }
  };

  window.HABITTEEN_ARTICLE_INDEX = (window.HABITTEEN_ARTICLE_INDEX || []).map((item) => {
    const replacement = replacements[item.slug];
    return replacement ? Object.assign({}, item, replacement) : item;
  });
})();
