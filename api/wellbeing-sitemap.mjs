import { WELLBEING_ARTICLES } from '../article-data/wellbeing-articles-1.mjs';
import { WELLBEING_ARTICLES_2 } from '../article-data/wellbeing-articles-2.mjs';
import { WELLBEING_ARTICLES_3 } from '../article-data/wellbeing-articles-3.mjs';
import { WELLBEING_ARTICLES_4 } from '../article-data/wellbeing-articles-4.mjs';

const SITE = 'https://xn--k1ae9bxb.online';
const PATH = '/statti/zdorovia-ta-samopochuttia/';
const ARTICLES = [...WELLBEING_ARTICLES, ...WELLBEING_ARTICLES_2, ...WELLBEING_ARTICLES_3, ...WELLBEING_ARTICLES_4];

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export default function handler(_request, response) {
  const urls = [`${SITE}${PATH}`, ...ARTICLES.map((article) => `${SITE}${PATH}${article.slug}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
  response.setHeader('Content-Type', 'application/xml; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  response.status(200).send(xml);
}
