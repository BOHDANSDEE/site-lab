import assert from 'node:assert/strict';
import motivationHandler from '../api/motivation.mjs';
import { DISCIPLINE_ARTICLES } from '../article-data/discipline-articles-1.mjs';
import { DISCIPLINE_ARTICLES_2 } from '../article-data/discipline-articles-2.mjs';
import { DISCIPLINE_ARTICLES_3 } from '../article-data/discipline-articles-3.mjs';
const SITE='https://xn--k1ae9bxb.online';
class MockResponse{constructor(){this.statusCode=200;this.body='';this.headers=new Map()}setHeader(n,v){this.headers.set(n,v);return this}end(v=''){this.body=String(v);return this}}
const render=(query={})=>{const r=new MockResponse();motivationHandler({query},r);return r};
const articles=[...DISCIPLINE_ARTICLES,...DISCIPLINE_ARTICLES_2,...DISCIPLINE_ARTICLES_3];
assert.equal(articles.length,20,'discipline must expose exactly 20 ready articles');
assert.equal(new Set(articles.map(a=>a.slug)).size,20,'discipline slugs must be unique');
assert.equal(new Set(articles.map(a=>a.title)).size,20,'discipline titles must be unique');
const catalog=render({category:'discipline'});
assert.equal(catalog.statusCode,200);
assert.ok(catalog.body.includes(`<link rel="canonical" href="${SITE}/statti/dystsyplina/">`));
for(const article of articles){assert.ok(catalog.body.includes(`/statti/dystsyplina/${article.slug}/`),`${article.slug}: catalog link missing`);const r=render({category:'discipline',slug:article.slug});assert.equal(r.statusCode,200,`${article.slug}: render failed`);assert.ok(r.body.includes(`<link rel="canonical" href="${SITE}/statti/dystsyplina/${article.slug}/">`),`${article.slug}: canonical missing`);assert.ok(r.body.includes('<h1>'),`${article.slug}: H1 missing`);assert.ok(r.body.includes('application/ld+json'),`${article.slug}: structured data missing`)}
console.log('✅ SEO check passed: 20 Discipline articles render with unique slugs, H1, canonical and structured data');
