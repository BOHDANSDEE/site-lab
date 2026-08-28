import assert from 'node:assert/strict';
import motivationHandler from '../api/motivation.mjs';
import { DISCIPLINE_ARTICLES } from '../article-data/discipline-articles-1.mjs';
import { DISCIPLINE_ARTICLES_2 } from '../article-data/discipline-articles-2.mjs';
import { DISCIPLINE_ARTICLES_3 } from '../article-data/discipline-articles-3.mjs';
import { ENERGY_STRENGTH_ARTICLES } from '../article-data/energy-strength-articles-1.mjs';
const SITE='https://xn--k1ae9bxb.online';
class MockResponse{constructor(){this.statusCode=200;this.body='';this.headers=new Map()}setHeader(n,v){this.headers.set(n,v);return this}end(v=''){this.body=String(v);return this}}
const render=(query={})=>{const r=new MockResponse();motivationHandler({query},r);return r};
const discipline=[...DISCIPLINE_ARTICLES,...DISCIPLINE_ARTICLES_2,...DISCIPLINE_ARTICLES_3];
assert.equal(discipline.length,20);assert.equal(new Set(discipline.map(a=>a.slug)).size,20);assert.equal(new Set(discipline.map(a=>a.title)).size,20);
const dc=render({category:'discipline'});assert.equal(dc.statusCode,200);for(const a of discipline){assert.ok(dc.body.includes(`/statti/dystsyplina/${a.slug}/`));const r=render({category:'discipline',slug:a.slug});assert.equal(r.statusCode,200);assert.ok(r.body.includes(`<link rel="canonical" href="${SITE}/statti/dystsyplina/${a.slug}/">`));assert.ok(r.body.includes('<h1>'));assert.ok(r.body.includes('application/ld+json'))}
assert.equal(ENERGY_STRENGTH_ARTICLES.length,10);assert.equal(new Set(ENERGY_STRENGTH_ARTICLES.map(a=>a.slug)).size,10);assert.equal(new Set(ENERGY_STRENGTH_ARTICLES.map(a=>a.title)).size,10);
const ec=render({category:'energy'});assert.equal(ec.statusCode,200);assert.ok(ec.body.includes(`<link rel="canonical" href="${SITE}/statti/enerhiia-ta-syly/">`));for(const a of ENERGY_STRENGTH_ARTICLES){assert.ok(ec.body.includes(`/statti/enerhiia-ta-syly/${a.slug}/`));const r=render({category:'energy',slug:a.slug});assert.equal(r.statusCode,200);assert.ok(r.body.includes(`<link rel="canonical" href="${SITE}/statti/enerhiia-ta-syly/${a.slug}/">`));assert.ok(r.body.includes('<h1>'));assert.ok(r.body.includes('application/ld+json'))}
console.log('✅ SEO check passed: 20 Discipline + 10 Energy articles');
