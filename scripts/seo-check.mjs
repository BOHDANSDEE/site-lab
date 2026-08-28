import assert from 'node:assert/strict';
import motivationHandler from '../api/motivation.mjs';
import { DISCIPLINE_ARTICLES } from '../article-data/discipline-articles-1.mjs';
import { DISCIPLINE_ARTICLES_2 } from '../article-data/discipline-articles-2.mjs';
import { DISCIPLINE_ARTICLES_3 } from '../article-data/discipline-articles-3.mjs';
const SITE='https://xn--k1ae9bxb.online';
class MockResponse{constructor(){this.statusCode=200;this.body='';this.headers=new Map()}setHeader(n,v){this.headers.set(n,v);return this}end(v=''){this.body=String(v);return this}}
const render=(query={})=>{const r=new MockResponse();motivationHandler({query},r);return r};
const articles=[...DISCIPLINE_ARTICLES,...DISCIPLINE_ARTICLES_2,...DISCIPLINE_ARTICLES_3];
assert.equal(articles.length,20);assert.equal(new Set(articles.map(a=>a.slug)).size,20);assert.equal(new Set(articles.map(a=>a.title)).size,20);
const catalog=render({category:'discipline'});assert.equal(catalog.statusCode,200);assert.ok(catalog.body.includes(`${SITE}/statti/dystsyplina/`));
for(const a of articles){assert.ok(catalog.body.includes(`/statti/dystsyplina/${a.slug}/`));const r=render({category:'discipline',slug:a.slug});assert.equal(r.statusCode,200);assert.ok(r.body.includes(`<link rel="canonical" href="${SITE}/statti/dystsyplina/${a.slug}/">`));assert.ok(r.body.includes('<h1>'));assert.ok(r.body.includes('application/ld+json'))}
console.log('✅ SEO check passed: 20 Discipline articles');
