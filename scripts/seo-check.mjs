import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import articleHandler from '../api/selected-article.mjs';
import libraryHandler from '../api/selected-articles.mjs';

class MockResponse {
  constructor(){ this.statusCode=200; this.headers=new Map(); this.body=''; }
  status(code){ this.statusCode=code; return this; }
  setHeader(name,value){ this.headers.set(String(name).toLowerCase(), String(value)); return this; }
  send(body){ this.body=String(body); return this; }
}

const selected = [
  ['yak-poboroty-lin','Як побороти лінь','lin'],
  ['prychyny-lini','Чому виникає лінь і що з цим робити','lin'],
  ['yak-diiaty-koly-nemaie-motyvatsii','Що робити, коли немає мотивації','lin'],
  ['yak-vstaty-z-lizhka-vrantsi','Як прокидатися зранку','lin'],
  ['apatiia-u-pidlitkiv','Апатія у підлітків: ознаки, причини та коли потрібна допомога','apatiia'],
  ['nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia','Нічого не радує: як повернути інтерес до життя','apatiia'],
  ['apatiia-shcho-robyty','Апатія: що робити, коли нічого не хочеться','apatiia'],
  ['yak-vybraty-priorytet-koly-vse-terminove','Як вибирати пріоритети','prokrastynatsiia'],
  ['sduh-i-prokrastynatsiia','Як зосередитися на навчанні','prokrastynatsiia']
];

function renderArticle(slug){ const r=new MockResponse(); articleHandler({query:{slug}},r); return r; }
function renderLibrary(category=''){ const r=new MockResponse(); libraryHandler({query: category ? {category} : {}},r); return r; }
function links(html){ return [...html.matchAll(/href="\/statti\/([^"/]+)\/"/g)].map((m)=>m[1]); }

const all = renderLibrary();
assert.equal(all.statusCode,200);
assert.ok(all.body.includes('<h1>9 вибраних статей</h1>'));
assert.deepEqual(new Set(links(all.body)), new Set(selected.map(([slug])=>slug)));
assert.equal(new Set(links(all.body)).size,9);

for (const [category,count] of [['lin',4],['apatiia',3],['prokrastynatsiia',2]]) {
  const page=renderLibrary(category);
  assert.equal(page.statusCode,200);
  assert.equal(new Set(links(page.body)).size,count);
  assert.ok(page.body.includes(`${count} статті`) || page.body.includes(`${count} матеріалів`));
}

for (const [slug,title] of selected) {
  const page=renderArticle(slug);
  assert.equal(page.statusCode,200,`${slug} must remain public`);
  assert.ok(page.body.includes(title),`${slug} must use approved title`);
  assert.ok(page.body.includes(`<link rel="canonical" href="https://xn--k1ae9bxb.online/statti/${slug}/">`));
}

for (const removed of ['lin-chy-vyhorannia','apatiia-chy-depresiia','metod-pomodoro','yak-perestaty-vidkladaty-spravy']) {
  assert.equal(renderArticle(removed).statusCode,404,`${removed} must be removed from public article routes`);
}

const vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
assert.deepEqual(vercel.rewrites,[
  {source:'/statti/',destination:'/api/selected-articles'},
  {source:'/lin/',destination:'/api/selected-articles?category=lin'},
  {source:'/apatiia/',destination:'/api/selected-articles?category=apatiia'},
  {source:'/prokrastynatsiia/',destination:'/api/selected-articles?category=prokrastynatsiia'},
  {source:'/statti/:slug/',destination:'/api/selected-article?slug=:slug'}
]);
assert.equal(vercel.functions['api/selected-article.mjs'].includeFiles,'**/*.js');

const sitemap=await readFile(new URL('../sitemap.xml',import.meta.url),'utf8');
const sitemapSlugs=[...sitemap.matchAll(/<loc>https:\/\/xn--k1ae9bxb\.online\/statti\/([^<]+)\/<\/loc>/g)].map((m)=>m[1]);
assert.deepEqual(new Set(sitemapSlugs),new Set(selected.map(([slug])=>slug)));
assert.equal(sitemapSlugs.length,9);

console.log('✅ SEO check passed: only 9 selected articles remain public, listed and indexed');
