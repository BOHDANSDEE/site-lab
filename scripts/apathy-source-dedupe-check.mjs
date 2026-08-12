import assert from 'node:assert/strict';
import articleHandler from '../api/article-final.mjs';

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = new Map();
    this.body = '';
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  setHeader(name, value) {
    this.headers.set(String(name).toLowerCase(), String(value));
    return this;
  }
  send(body) {
    this.body = String(body);
    return this;
  }
}

function render(slug) {
  const response = new MockResponse();
  articleHandler({ query: { slug } }, response);
  return response;
}

const richApathySlugs = [
  'emotsiine-vyhorannia-symptomy',
  'yak-dopomohty-liudyni-z-apatiieiu',
  'apatiia-pislia-stresu',
  'nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia',
  'postiino-khochetsia-spaty-i-nemaie-syl',
  'apatiia-u-pidlitkiv',
  'postiina-vtoma-i-nemaie-syl',
  'nemaie-syl-nichoho-robyty'
];

for (const slug of richApathySlugs) {
  const response = render(slug);
  assert.equal(response.statusCode, 200, `${slug} must render with HTTP 200`);
  const sourceSection = response.body.match(/<section aria-labelledby="sources-title">[\s\S]*?<\/section>/i)?.[0] || '';
  const labels = [...sourceSection.matchAll(/<li><a [^>]*>([^<]+?) ↗<\/a><\/li>/g)].map((match) => match[1]);
  assert.equal(new Set(labels).size, labels.length, `${slug} must not contain duplicate source labels`);
}

const stress = render('apatiia-pislia-stresu');
assert.ok(
  stress.body.includes('https://www.who.int/publications/i/item/9789240003927'),
  'apathy-only WHO stress source must remain in initial HTML'
);

const unicefUrl = 'https://www.unicef.org/ukraine/stories/when-help-your-teen-find-mental-health-support';
for (const slug of ['yak-dopomohty-liudyni-z-apatiieiu', 'apatiia-u-pidlitkiv']) {
  const response = render(slug);
  assert.ok(
    response.body.includes(unicefUrl),
    `${slug} must retain the apathy-only UNICEF teen-support source in initial HTML`
  );
}

console.log('✅ Apathy source check passed: no duplicate labels and WHO/UNICEF apathy-only sources are preserved');
