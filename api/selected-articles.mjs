const SITE = 'https://xn--k1ae9bxb.online';

const ARTICLES = [
  { slug:'yak-poboroty-lin', cat:'Лінь', cat_slug:'lin', title:'Як побороти лінь', desc:'Як зрозуміти, що саме заважає почати, і перейти до конкретної дії.', time:11 },
  { slug:'prychyny-lini', cat:'Лінь', cat_slug:'lin', title:'Чому виникає лінь і що з цим робити', desc:'Причини складного старту та способи працювати з ними без самозвинувачення.', time:12 },
  { slug:'yak-diiaty-koly-nemaie-motyvatsii', cat:'Лінь', cat_slug:'lin', title:'Що робити, коли немає мотивації', desc:'Як почати діяти, не чекаючи правильного настрою.', time:12 },
  { slug:'yak-vstaty-z-lizhka-vrantsi', cat:'Лінь', cat_slug:'lin', title:'Як прокидатися зранку', desc:'Що допомагає зробити ранковий підйом простішим і стабільнішим.', time:11 },
  { slug:'apatiia-u-pidlitkiv', cat:'Апатія', cat_slug:'apatiia', title:'Апатія у підлітків: ознаки, причини та коли потрібна допомога', desc:'Тривалі зміни, сон, навантаження та ознаки, які важливо не ігнорувати.', time:11 },
  { slug:'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia', cat:'Апатія', cat_slug:'apatiia', title:'Нічого не радує: як повернути інтерес до життя', desc:'Як поступово повертати залученість без вимоги негайно відчути радість.', time:11 },
  { slug:'apatiia-shcho-robyty', cat:'Апатія', cat_slug:'apatiia', title:'Апатія: що робити, коли нічого не хочеться', desc:'Перші кроки, підтримка та ситуації, коли варто звернутися по професійну допомогу.', time:12 },
  { slug:'yak-vybraty-priorytet-koly-vse-terminove', cat:'Прокрастинація', cat_slug:'prokrastynatsiia', title:'Як вибирати пріоритети', desc:'Як відрізнити важливе від термінового та обрати одну головну справу.', time:10 },
  { slug:'sduh-i-prokrastynatsiia', cat:'Прокрастинація', cat_slug:'prokrastynatsiia', title:'Як зосередитися на навчанні', desc:'Як зменшити відволікання, ясніше бачити завдання й повертатися до навчання.', time:12 }
];

const CATEGORIES = {
  lin: { name:'Лінь', path:'/lin/' },
  apatiia: { name:'Апатія', path:'/apatiia/' },
  prokrastynatsiia: { name:'Прокрастинація', path:'/prokrastynatsiia/' }
};

const esc = (value) => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const cards = (items) => items.map((a) => `<a class="article-card" href="/statti/${a.slug}/"><span>${esc(a.cat)} · ${a.time} хв</span><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p></a>`).join('\n');

function render(items, categoryKey='') {
  const category = CATEGORIES[categoryKey] || null;
  const visible = category ? items.filter((a) => a.cat_slug === categoryKey) : items;
  const canonicalPath = category ? category.path : '/statti/';
  const heading = category ? `${category.name}: ${visible.length} статті` : '9 вибраних статей';
  const title = category ? `${category.name}: ${visible.length} статті | Лінь` : '9 статей про лінь, апатію та прокрастинацію | Лінь';
  const jsonLd = { '@context':'https://schema.org', '@type':'ItemList', numberOfItems:visible.length, itemListElement:visible.map((a,i)=>({ '@type':'ListItem', position:i+1, name:a.title, url:`${SITE}/statti/${a.slug}/` })) };
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="Відібрані матеріали про лінь, апатію та прокрастинацію."><meta name="robots" content="index,follow"><link rel="canonical" href="${SITE}${canonicalPath}"><script type="application/ld+json">${JSON.stringify(jsonLd)}</script><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/refresh.css"></head><body><a class="skip-link" href="#content">Перейти до змісту</a><header class="site-header"><div class="shell brand-row"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">Л</span><span>Лінь</span></a></div><div class="nav-wrap"><nav class="site-nav shell"><a href="/">Головна</a><a href="/statti/" aria-current="page">Статті</a><a href="/psykholoham/">Психологам</a><a href="/pro-sait/">Про простір</a></nav></div></header><main id="content"><section class="page-hero shell"><p class="eyebrow">Бібліотека матеріалів</p><h1>${esc(heading)}</h1><p class="page-intro">Залишені тільки статті, які будемо далі оновлювати й переписувати.</p></section>${category ? '' : `<section class="section shell"><div class="topic-list"><a class="topic-link" href="/lin/"><span><h3>Лінь</h3><p>4 статті</p></span></a><a class="topic-link" href="/apatiia/"><span><h3>Апатія</h3><p>3 статті</p></span></a><a class="topic-link" href="/prokrastynatsiia/"><span><h3>Прокрастинація</h3><p>2 статті</p></span></a></div></section>`}<section class="section shell"><div class="section-heading"><p class="section-kicker">${visible.length} матеріалів</p><h2>${category ? esc(category.name) : 'Усі вибрані статті'}</h2></div><div class="article-grid">${cards(visible)}</div></section></main><footer class="site-footer"><div class="shell footer-bottom"><span>© 2026 Лінь</span><span>Матеріали для самоосвіти, а не самодіагностики</span></div></footer></body></html>`;
}

export default function handler(request, response) {
  const category = String(request.query?.category || '').trim();
  if (category && !CATEGORIES[category]) return response.status(404).send('Category not found');
  response.setHeader('Content-Type','text/html; charset=utf-8');
  response.setHeader('Cache-Control','public, max-age=0, must-revalidate');
  response.status(200).send(render(ARTICLES, category));
}
