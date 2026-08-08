(() => {
  const items = window.HABITTEEN_ARTICLE_INDEX || [];
  const path = location.pathname.replace(/\/+$/, '/') || '/';
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

  if (path === '/statti/') {
    appendMissing(document.querySelector('[data-article-grid]'), items);
    const kicker = document.querySelector('.soft-band .section-kicker');
    if (kicker) kicker.textContent = 'Усі 30 статей';
    document.querySelectorAll('.topic-link').forEach((link) => {
      const name = link.querySelector('h3')?.textContent.trim();
      const p = link.querySelector('p');
      if (!p) return;
      if (name === 'Лінь') p.textContent = '10 статей про бар’єр старту, втому, мотивацію й реалістичні маленькі дії.';
      if (name === 'Апатія') p.textContent = '10 статей про втрату інтересу, енергію, сонливість, вигорання, причини та межі самодопомоги.';
      if (name === 'Прокрастинація') p.textContent = '10 статей про відкладання, страх помилки, перфекціонізм, телефон і планування.';
    });
    setMeta('meta[name="description"]', '30 матеріалів про лінь, апатію та прокрастинацію: пояснення, практичні кроки, межі самодопомоги й джерела.');
  }

  const category = path === '/lin/' ? 'Лінь' : path === '/apatiia/' ? 'Апатія' : path === '/prokrastynatsiia/' ? 'Прокрастинація' : '';
  if (category) {
    const grid = document.querySelector('.article-grid');
    appendMissing(grid, items.filter((item) => item.cat === category));
    const section = grid?.closest('.section');
    const kicker = section?.querySelector('.section-kicker');
    if (kicker) kicker.textContent = '10 матеріалів';
  }
})();
