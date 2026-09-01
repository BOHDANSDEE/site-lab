import { WELLBEING_ARTICLES } from '../article-data/wellbeing-articles-1.mjs';
import { WELLBEING_ARTICLES_2 } from '../article-data/wellbeing-articles-2.mjs';
import { WELLBEING_ARTICLES_3 } from '../article-data/wellbeing-articles-3.mjs';
import { WELLBEING_ARTICLES_4 } from '../article-data/wellbeing-articles-4.mjs';
import wellbeingHandler from '../api/wellbeing.mjs';
import sitemapHandler from '../api/wellbeing-sitemap.mjs';
import { readFileSync } from 'node:fs';

const ARTICLES = [...WELLBEING_ARTICLES, ...WELLBEING_ARTICLES_2, ...WELLBEING_ARTICLES_3, ...WELLBEING_ARTICLES_4];
const SITE = 'https://xn--k1ae9bxb.online';
const BASE = '/statti/zdorovia-ta-samopochuttia/';

if (ARTICLES.length !== 20) throw new Error(`Expected 20 wellbeing articles, got ${ARTICLES.length}`);
const slugs = ARTICLES.map((article) => article.slug);
if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate wellbeing slugs');

for (const article of ARTICLES) {
  if (!/^[a-z0-9-]+$/.test(article.slug)) throw new Error(`Bad slug: ${article.slug}`);
  if (!article.title || !article.metaDescription || !article.lead) throw new Error(`Missing SEO fields: ${article.slug}`);
  if (!Array.isArray(article.sections) || article.sections.length < 5) throw new Error(`Too few sections: ${article.slug}`);
  if (article.sections.some((section) => !section.heading || !Array.isArray(section.paragraphs) || section.paragraphs.length < 2)) throw new Error(`Incomplete section: ${article.slug}`);
}

function run(handler, query = {}) {
  let statusCode = 200;
  let body = '';
  const headers = new Map();
  const response = {
    setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); return this; },
    status(code) { statusCode = code; return this; },
    send(value) { body = String(value); return this; }
  };
  handler({ query }, response);
  return { statusCode, body, headers };
}

const catalog = run(wellbeingHandler);
if (catalog.statusCode !== 200) throw new Error('Wellbeing catalog did not render 200');
if (!catalog.body.includes(`<link rel="canonical" href="${SITE}${BASE}">`)) throw new Error('Catalog canonical missing');
if (!catalog.body.includes('CollectionPage')) throw new Error('Catalog JSON-LD missing');
if ((catalog.body.match(/class="article-card"/g) || []).length < 20) throw new Error('Catalog does not expose all articles');

for (const article of ARTICLES) {
  const page = run(wellbeingHandler, { slug: article.slug });
  const canonical = `${SITE}${BASE}${article.slug}/`;
  if (page.statusCode !== 200) throw new Error(`Article render failed: ${article.slug}`);
  if (!page.body.includes(`<link rel="canonical" href="${canonical}">`)) throw new Error(`Canonical missing: ${article.slug}`);
  if (!page.body.includes('Article') || !page.body.includes('BreadcrumbList')) throw new Error(`Structured data missing: ${article.slug}`);
  if (!page.body.includes('index,follow')) throw new Error(`Index rule missing: ${article.slug}`);
}

const sitemap = run(sitemapHandler);
if (sitemap.statusCode !== 200) throw new Error('Wellbeing sitemap failed');
const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length !== 21) throw new Error(`Expected 21 wellbeing sitemap URLs, got ${locs.length}`);
for (const url of [`${SITE}${BASE}`, ...ARTICLES.map((article) => `${SITE}${BASE}${article.slug}/`)]) {
  if (!locs.includes(url)) throw new Error(`Sitemap missing ${url}`);
}

const robots = readFileSync('robots.txt', 'utf8');
if (!robots.includes('Sitemap: https://xn--k1ae9bxb.online/sitemap-wellbeing.xml')) throw new Error('robots.txt does not expose wellbeing sitemap');
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const rewrites = vercel.rewrites || [];
for (const source of ['/sitemap-wellbeing.xml', '/statti/zdorovia-ta-samopochuttia/', '/statti/zdorovia-ta-samopochuttia/:slug/']) {
  if (!rewrites.some((rule) => rule.source === source)) throw new Error(`Missing rewrite ${source}`);
}
const articlesApi = readFileSync('api/articles.mjs', 'utf8');
if (!articlesApi.includes("slug: 'zdorovia-ta-samopochuttia'") || !articlesApi.includes("slug: 'zdorovia-ta-samopochuttia', category: 'apatiia', title: 'Здоров’я та самопочуття', desc: 'Коли самопочуття впливає на сили, бажання діяти й повсякденне функціонування.', ready: true")) {
  throw new Error('Wellbeing topic is not marked ready');
}

console.log(`✅ Wellbeing publish check passed: ${ARTICLES.length} articles + hub, all in sitemap`);
