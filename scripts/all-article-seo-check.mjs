import assert from 'node:assert/strict';
import libraryHandler from '../api/articles.mjs';
import { handlePressure } from '../lib/pressure-render.mjs';

class MockResponse {
  constructor() { this.statusCode = 200; this.headers = new Map(); this.body = ''; }
  status(code) { this.statusCode = code; return this; }
  setHeader(name, value) { this.headers.set(String(name).toLowerCase(), String(value)); return this; }
  send(body) { this.body = String(body); return this; }
  end(body = '') { this.body = String(body); return this; }
}

function render(query = {}) {
  const response = new MockResponse();
  libraryHandler({ query }, response);
  return response;
}

const EXPECTED = {
  lin: {
    ready: ['lin', 'motyvatsiia', 'dystsyplina', 'enerhiia-ta-syly'],
    pendingTitles: []
  },
  apatiia: {
    ready: ['vtrata-interesu', 'shchastia', 'vazhki-emotsii'],
    pendingTitles: ['Здоров’я та самопочуття']
  },
  prokrastynatsiia: {
    ready: ['yak-pochaty', 'tysk-na-sebe'],
    pendingTitles: ['Увага та концентрація', 'Як змінити себе']
  }
};

const allReady = [];
let pendingCount = 0;
for (const [category, expected] of Object.entries(EXPECTED)) {
  const response = render({ category });
  assert.equal(response.statusCode, 200, `${category}: category must render`);
  const html = response.body;
  const ready = [...html.matchAll(/<a class="article-card" href="\/statti\/([^"/]+)\/">/g)].map((match) => match[1]);
  assert.deepEqual(ready, expected.ready, `${category}: ready hubs must match current content state`);
  allReady.push(...ready);

  for (const title of expected.pendingTitles) {
    assert.ok(html.includes(`<h3>${title}</h3>`), `${category}: missing pending topic ${title}`);
  }
  const pending = [...html.matchAll(/class="article-card topic-card-pending"/g)].length;
  assert.equal(pending, expected.pendingTitles.length, `${category}: pending count mismatch`);
  pendingCount += pending;
}

assert.deepEqual(allReady, ['lin', 'motyvatsiia', 'dystsyplina', 'enerhiia-ta-syly', 'vtrata-interesu', 'shchastia', 'vazhki-emotsii', 'yak-pochaty', 'tysk-na-sebe']);
assert.equal(new Set(allReady).size, 9, 'ready hub slugs must be unique');
assert.equal(pendingCount, 3, 'exactly three future subblocks should be marked pending');

const root = render();
assert.ok(root.body.indexOf('href="/lin/"') < root.body.indexOf('href="/apatiia/"'), 'root order must place Apathy after Laziness');
assert.ok(root.body.indexOf('href="/apatiia/"') < root.body.indexOf('href="/prokrastynatsiia/"'), 'root order must place Procrastination after Apathy');

const legacy = ['krashche-zhyttia', 'yak-nareshti-pochaty', 'shchaslyve-zhyttia', 'yak-zminyty-svoi-zvychky', 'vysnazhennia-i-perevantazhennia', 'povernennia-pislia-zavysannia', 'viddalennia-vid-liudei-i-zhyttia'];
for (const slug of legacy) {
  assert.ok(!root.body.includes(`/statti/${slug}/`), `root must not expose stale topic ${slug}`);
  for (const category of Object.keys(EXPECTED)) {
    assert.ok(!render({ category }).body.includes(`/statti/${slug}/`), `${category}: must not expose stale topic ${slug}`);
  }
}

const pressureResponse = new MockResponse();
handlePressure({ query: { audit: '1' } }, pressureResponse);
assert.equal(pressureResponse.statusCode, 200, 'pressure audit must render');
const pressureAudit = JSON.parse(pressureResponse.body);
assert.equal(pressureAudit.count, 15, 'Тиск на себе must contain 15 ready articles');
const nextFive = new Set([
  'postiinno-treba-buty-produktyvnym',
  'znetsiniuiu-vlasni-rezultaty',
  'samootsinka-zalezhyt-vid-produktyvnosti',
  'sorom-cherez-nevykonani-spravy',
  'karaiu-sebe-pislia-zryvu'
]);
const checked = pressureAudit.articles.filter(article => nextFive.has(article.slug));
assert.equal(checked.length, 5, 'all pressure articles 11–15 must be present');
for (const article of checked) {
  assert.ok(article.words >= 1400, `${article.slug}: ${article.words} words, expected at least 1400`);
  assert.ok(article.words <= 1600, `${article.slug}: ${article.words} words, expected at most 1600 for 7–8 min`);
  assert.ok(article.minutes >= 7 && article.minutes <= 8, `${article.slug}: expected 7–8 min, got ${article.minutes}`);
}
console.log('✅ Pressure 11–15:', checked.map(({slug, words, minutes}) => `${slug}=${words}w/${minutes}m`).join(', '));
console.log('✅ Catalog audit passed: 9 ready hubs + 3 honest pending subblocks, no stale topic links');
