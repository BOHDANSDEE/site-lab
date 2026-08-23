import assert from 'node:assert/strict';
import articleHandler from '../api/article-final.mjs';

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = new Map();
    this.body = '';
  }
  status(code) { this.statusCode = code; return this; }
  setHeader(name, value) { this.headers.set(String(name).toLowerCase(), String(value)); return this; }
  send(body) { this.body = String(body); return this; }
}

function render(slug) {
  const response = new MockResponse();
  articleHandler({ query: { slug } }, response);
  return response;
}

const selectedApathySlugs = [
  'apatiia-shcho-robyty',
  'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia',
  'apatiia-u-pidlitkiv'
];

for (const slug of selectedApathySlugs) {
  const response = render(slug);
  assert.equal(response.statusCode, 200, `${slug} must render with HTTP 200`);
  const sourceSection = response.body.match(/<section aria-labelledby="sources-title">[\s\S]*?<\/section>/i)?.[0] || '';
  const labels = [...sourceSection.matchAll(/<li><a [^>]*>([^<]+?) ↗<\/a><\/li>/g)].map((match) => match[1]);
  assert.equal(new Set(labels).size, labels.length, `${slug} must not contain duplicate source labels`);
}

const teen = render('apatiia-u-pidlitkiv');
assert.ok(
  teen.body.includes('https://www.unicef.org/ukraine/stories/when-help-your-teen-find-mental-health-support'),
  'teen apathy article must retain the UNICEF teen-support source'
);

console.log('✅ Apathy source check passed for the 3 selected apathy articles');
