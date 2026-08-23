(() => {
  const items = window.HABITTEEN_ARTICLE_INDEX || [];
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const byHref = new Map(items.map((item) => [`/statti/${item.slug}/`, item]));

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

  const syncGrid = (grid, list) => {
    if (!grid) return;
    const allowed = new Set(list.map((item) => `/statti/${item.slug}/`));

    grid.querySelectorAll('a.article-card[href]').forEach((card) => {
      const href = card.getAttribute('href');
      if (!allowed.has(href)) {
        card.remove();
        return;
      }
      const item = byHref.get(href);
      if (!item) return;
      const meta = card.querySelector('span');
      const title = card.querySelector('h3');
      const desc = card.querySelector('p');
      if (meta) meta.textContent = `${item.cat} · ${item.time} хв`;
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.desc;
    });

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

  const categoryCount = (category) => items.filter((item) => item.cat === category).length;

  if (path === '/statti/') {
    syncGrid(document.querySelector('[data-article-grid]'), items);
    const kicker = document.querySelector('.soft-band .section-kicker');
    if (kicker) kicker.textContent = `${items.length} матеріалів у бібліотеці`;

    document.querySelectorAll('.topic-link').forEach((link) => {
      const name = link.querySelector('h3')?.textContent.trim();
      const p = link.querySelector('p');
      if (!p || !name) return;
      if (name === 'Лінь') p.textContent = `${categoryCount('Лінь')} статті про лінь, мотивацію, причини складного старту та ранковий підйом.`;
      if (name === 'Апатія') p.textContent = `${categoryCount('Апатія')} статті про апатію, втрату інтересу та апатію у підлітків.`;
      if (name === 'Прокрастинація') p.textContent = `${categoryCount('Прокрастинація')} статті про пріоритети та концентрацію під час навчання.`;
    });
    setMeta('meta[name="description"]', `${items.length} відібраних матеріалів про лінь, апатію та прокрастинацію.`);
  }

  const category = path === '/lin/' ? 'Лінь' : path === '/apatiia/' ? 'Апатія' : path === '/prokrastynatsiia/' ? 'Прокрастинація' : '';
  if (category) {
    const list = items.filter((item) => item.cat === category);
    const grid = document.querySelector('.article-grid');
    syncGrid(grid, list);
    const section = grid?.closest('.section');
    const kicker = section?.querySelector('.section-kicker');
    if (kicker) kicker.textContent = `${list.length} матеріали`;
  }
})();
