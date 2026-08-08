(() => {
  const items = window.HABITTEEN_ARTICLE_INDEX || [];
  const path = location.pathname.replace(/\/+$/, '/') || '/';

  const apathyOverrides = {
    'apatiia-i-vyhorannia': {time: 11, desc: 'Як відрізнити загальний спад інтересу від виснаження, пов’язаного з роботою або навчанням, і зрозуміти, що перевірити далі.'},
    'yak-pidtrymaty-liudynu-z-apatiieiu': {time: 11, desc: 'Як бути поруч без тиску, пропонувати конкретну допомогу, підтримувати контакт і помічати ситуації, коли потрібен фахівець.'},
    'apatiia-pislia-stresu': {time: 11, desc: 'Чому після тривалого напруження може зникати енергія й інтерес та як повертати звичний ритм без різкого навантаження.'},
    'yak-povernuty-interes-do-sprav': {time: 11, desc: 'Як повертатися до занять без очікування сильного бажання: маленькі спроби, контакт із людьми й перевірка того, що справді оживляє.'},
    'apatiia-i-son': {time: 10, desc: 'Як сон і апатія можуть впливати одне на одного, що записувати протягом тижня та коли проблеми зі сном варто обговорити з лікарем.'},
    'apatiia-u-pidlitkiv': {time: 12, desc: 'Як помічати тривалі зміни в активності, сні, навчанні й спілкуванні підлітка та говорити про це без ярликів і допиту.'},
    'yak-hovoryty-z-likarem-pro-apatiiu': {time: 10, desc: 'Як підготуватися до консультації: описати тривалість, зміни сну й енергії, вплив на повсякденне життя та важливі запитання.'},
    'mali-dii-pry-nyzkii-energii': {time: 10, desc: 'Що робити в день, коли сил дуже мало: базові потреби, дії на кілька хвилин, менше рішень і зрозуміла межа самодопомоги.'}
  };

  items.forEach((item) => {
    const replacement = apathyOverrides[item.slug];
    if (replacement) Object.assign(item, replacement);
  });

  const makeCard = (item) => {
    const link = document.createElement('a');
    link.className = 'article-card';
    link.href = `/statti/${item.slug}/`;
    link.dataset.articleCard = '';
    link.innerHTML = `<span>${item.cat} · ${item.time} хв</span><h3></h3><p></p>`;
    link.querySelector('h3').textContent = item.title;
    link.querySelector('p').textContent = item.desc;
    return link;
  };

  const appendMissing = (grid, list) => {
    if (!grid) return;
    const existing = new Set([...grid.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    list.forEach((item) => {
      const href = `/statti/${item.slug}/`;
      if (!existing.has(href)) grid.append(makeCard(item));
    });
  };

  const setMeta = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
  };

  const countByCategory = (category) => items.filter((item) => item.cat === category).length;

  if (path === '/statti/') {
    appendMissing(document.querySelector('[data-article-grid]'), items);
    const kicker = document.querySelector('.soft-band .section-kicker');
    if (kicker) kicker.textContent = `Усі матеріали · ${items.length}`;

    document.querySelectorAll('.topic-link').forEach((link) => {
      const name = link.querySelector('h3')?.textContent.trim();
      const p = link.querySelector('p');
      if (!p) return;
      if (name === 'Лінь') p.textContent = `${countByCategory('Лінь')} статей про бар’єр старту, втому, мотивацію й реалістичні маленькі дії.`;
      if (name === 'Апатія') p.textContent = `${countByCategory('Апатія')} обережних статей про втрату інтересу, енергію, підтримку та межі самодопомоги.`;
      if (name === 'Прокрастинація') p.textContent = `${countByCategory('Прокрастинація')} статей про відкладання, страх помилки, перфекціонізм, телефон і планування.`;
    });

    setMeta('meta[name="description"]', `${items.length} матеріалів про лінь, апатію та прокрастинацію: пояснення, практичні кроки, межі самодопомоги й джерела.`);
  }

  const category = path === '/lin/' ? 'Лінь' : path === '/apatiia/' ? 'Апатія' : path === '/prokrastynatsiia/' ? 'Прокрастинація' : '';

  if (category) {
    const categoryItems = items.filter((item) => item.cat === category);
    const grid = document.querySelector('.article-grid');
    appendMissing(grid, categoryItems);
    const section = grid?.closest('.section');
    const kicker = section?.querySelector('.section-kicker');
    if (kicker) kicker.textContent = `${categoryItems.length} матеріалів`;
  }
})();
