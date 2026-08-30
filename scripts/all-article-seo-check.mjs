import assert from 'node:assert/strict';
import libraryHandler from '../api/articles.mjs';

class MockResponse {
  constructor() { this.statusCode = 200; this.headers = new Map(); this.body = ''; }
  status(code) { this.statusCode = code; return this; }
  setHeader(name, value) { this.headers.set(String(name).toLowerCase(), String(value)); return this; }
  send(body) { this.body = String(body); return this; }
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
    ready: [],
    pendingTitles: ['Як почати', 'Тиск на себе', 'Увага та концентрація', 'Як змінити себе']
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

assert.deepEqual(allReady, ['lin', 'motyvatsiia', 'dystsyplina', 'enerhiia-ta-syly', 'vtrata-interesu', 'shchastia', 'vazhki-emotsii']);
assert.equal(new Set(allReady).size, 7, 'ready hub slugs must be unique');
assert.equal(pendingCount, 5, 'exactly five future subblocks should be marked pending');

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

console.log('✅ Catalog audit passed: 7 ready hubs + 5 honest pending subblocks, no stale topic links');
