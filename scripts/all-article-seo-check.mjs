import assert from 'node:assert/strict';
import libraryHandler from '../api/articles.mjs';
import { handlePressure } from '../lib/pressure-render.mjs';
import { handleFocus } from '../lib/focus-render.mjs';

class MockResponse {
  constructor() { this.statusCode = 200; this.headers = new Map(); this.body = ''; }
  status(code) { this.statusCode = code; return this; }
  setHeader(name, value) { this.headers.set(String(name).toLowerCase(), String(value)); return this; }
  send(body) { this.body = String(body); return this; }
  end(body = '') { this.body = String(body); return this; }
}
function render(query = {}) { const response = new MockResponse(); libraryHandler({ query }, response); return response; }
const EXPECTED = {
  lin:{ready:['lin','motyvatsiia','dystsyplina','enerhiia-ta-syly'],pendingTitles:[]},
  apatiia:{ready:['vtrata-interesu','shchastia','vazhki-emotsii'],pendingTitles:['Здоров’я та самопочуття']},
  prokrastynatsiia:{ready:['yak-pochaty','tysk-na-sebe','uvaha-ta-kontsentratsiia'],pendingTitles:['Як змінити себе']}
};
const allReady=[]; let pendingCount=0;
for(const [category,expected] of Object.entries(EXPECTED)){
  const response=render({category}); assert.equal(response.statusCode,200,`${category}: category must render`); const html=response.body;
  const ready=[...html.matchAll(/<a class="article-card" href="\/statti\/([^"/]+)\/">/g)].map(m=>m[1]);
  assert.deepEqual(ready,expected.ready,`${category}: ready hubs must match current content state`); allReady.push(...ready);
  for(const title of expected.pendingTitles) assert.ok(html.includes(`<h3>${title}</h3>`),`${category}: missing pending topic ${title}`);
  const pending=[...html.matchAll(/class="article-card topic-card-pending"/g)].length; assert.equal(pending,expected.pendingTitles.length,`${category}: pending count mismatch`); pendingCount+=pending;
}
assert.deepEqual(allReady,['lin','motyvatsiia','dystsyplina','enerhiia-ta-syly','vtrata-interesu','shchastia','vazhki-emotsii','yak-pochaty','tysk-na-sebe','uvaha-ta-kontsentratsiia']);
assert.equal(new Set(allReady).size,10,'ready hub slugs must be unique'); assert.equal(pendingCount,2,'exactly two future subblocks should be marked pending');
const root=render(); assert.ok(root.body.indexOf('href="/lin/"')<root.body.indexOf('href="/apatiia/"'),'root order must place Apathy after Laziness'); assert.ok(root.body.indexOf('href="/apatiia/"')<root.body.indexOf('href="/prokrastynatsiia/"'),'root order must place Procrastination after Apathy');
const legacy=['krashche-zhyttia','yak-nareshti-pochaty','shchaslyve-zhyttia','yak-zminyty-svoi-zvychky','vysnazhennia-i-perevantazhennia','povernennia-pislia-zavysannia','viddalennia-vid-liudei-i-zhyttia'];
for(const slug of legacy){assert.ok(!root.body.includes(`/statti/${slug}/`),`root must not expose stale topic ${slug}`);for(const category of Object.keys(EXPECTED)) assert.ok(!render({category}).body.includes(`/statti/${slug}/`),`${category}: must not expose stale topic ${slug}`);}
const pressureResponse=new MockResponse(); handlePressure({query:{audit:'1'}},pressureResponse); assert.equal(pressureResponse.statusCode,200,'pressure audit must render'); const pressureAudit=JSON.parse(pressureResponse.body); assert.equal(pressureAudit.count,20,'Тиск на себе must contain 20 ready articles');
const finalFive=new Set(['treba-bulo-pochaty-ranishe','boiusia-rozcharuvaty-inshykh','ne-mozhu-dozvolyty-sobi-zrobyty-pohano','vidstaiu-vid-odnolitkiv-i-zhyttia','vymagaiu-vid-sebe-nemozhlyvoho']);
const checked=pressureAudit.articles.filter(a=>finalFive.has(a.slug)); assert.equal(checked.length,5,'all pressure articles 16–20 must be present');
for(const article of checked){assert.ok(article.words>=1400,`${article.slug}: ${article.words} words, expected at least 1400`);assert.ok(article.words<=1600,`${article.slug}: ${article.words} words, expected at most 1600 for 7–8 min`);assert.ok(article.minutes>=7&&article.minutes<=8,`${article.slug}: expected 7–8 min, got ${article.minutes}`);}
const focusResponse=new MockResponse(); handleFocus({query:{audit:'1'}},focusResponse); assert.equal(focusResponse.statusCode,200,'focus audit must render'); const focusAudit=JSON.parse(focusResponse.body); assert.equal(focusAudit.count,5,'Увага та концентрація must contain first 5 ready articles');
const focusFive=new Set(['ne-mozhu-zoseredytysia-postiino-vidvolikaiusia','telefon-vidvolikaie-vid-navchannia-i-roboty','chytaiu-i-ne-pamiataiu-shcho-prochytav','pochynaiu-odne-i-pereskakuiu-na-inshe','dumky-zavazhaiut-zoseredytysia']);
const focusChecked=focusAudit.articles.filter(a=>focusFive.has(a.slug)); assert.equal(focusChecked.length,5,'all focus articles 1–5 must be present');
console.log('Focus 1–5 audit:',focusChecked.map(({slug,words,minutes})=>`${slug}=${words}w/${minutes}m`).join(', '));
for(const article of focusChecked){assert.ok(article.words>=1350,`${article.slug}: ${article.words} words, expected at least 1350`);assert.ok(article.words<=1700,`${article.slug}: ${article.words} words, expected at most 1700`);assert.ok(article.minutes>=7&&article.minutes<=8,`${article.slug}: expected 7–8 min, got ${article.minutes}`);}
console.log('✅ Catalog audit passed: 10 ready hubs + 2 honest pending subblocks, no stale topic links');
