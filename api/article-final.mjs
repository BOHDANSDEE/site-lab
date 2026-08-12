import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import articleHandler from './article.mjs';
import { TOPIC_SPECIFIC_SECTIONS } from './topic-specific-sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let apathyCache = null;

class CaptureResponse {
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
    this.headers.set(String(name), String(value));
    return this;
  }
  send(body) {
    this.body = String(body);
    return this;
  }
}

function loadApathyContent() {
  if (apathyCache) return apathyCache;
  const sandbox = { window: {} };
  for (const relativePath of ['apathy-rich-content.js', 'apathy-tone-overrides.js']) {
    const filename = path.join(ROOT, relativePath);
    vm.runInNewContext(readFileSync(filename, 'utf8'), sandbox, { filename, timeout: 1000 });
  }
  apathyCache = {
    articles: sandbox.window.HABITTEEN_APATHY_ARTICLES || {},
    sources: sandbox.window.HABITTEEN_APATHY_SOURCES || {}
  };
  return apathyCache;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function removeClientArticleRerender(html) {
  const rerenderScripts = [
    'articles-index.js',
    'article-topic-overrides.js',
    'lazy-topic-overrides.js',
    'apathy-topic-overrides.js',
    'articles-index-45.js',
    'article-router.js',
    'article-toc-fix.js'
  ];

  let output = html;
  for (const filename of rerenderScripts) {
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(
      new RegExp(`\\s*<script\\s+src=["']/${escaped}["'](?:\\s+defer)?><\\/script>`, 'gi'),
      ''
    );
  }
  return output;
}

function enrichTopicSpecificSections(html, slug) {
  const topic = TOPIC_SPECIFIC_SECTIONS[slug];
  if (!topic?.sections?.length) return html;

  const sections = topic.sections.map((section, index) => {
    const id = `topic-${index + 1}-title`;
    const paragraphs = (section.paragraphs || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('');
    return `<section class="topic-specific-section" aria-labelledby="${id}"><h2 id="${id}">${escapeHtml(section.heading)}</h2>${paragraphs}</section>`;
  }).join('');

  const intro = `<p class="topic-specific-intro">${escapeHtml(topic.intro)}</p>`;
  const bodyMarker = '<div class="article-body">';
  let output = html.replace(bodyMarker, `${bodyMarker}${intro}${sections}`);

  const tocLinks = topic.sections
    .map((section, index) => `<a href="#topic-${index + 1}-title">${escapeHtml(section.heading)}</a>`)
    .join('');
  output = output.replace(
    /(<aside class="article-toc" aria-label="Зміст статті"><strong>Зміст статті<\/strong>)/i,
    `$1${tocLinks}`
  );

  return output;
}

function enrichApathySources(html, slug) {
  const apathy = loadApathyContent();
  const article = apathy.articles[slug];
  if (!article?.sources?.length) return html;

  const missing = article.sources
    .map((key) => apathy.sources[key])
    .filter(Boolean)
    .filter((source) => !html.includes(source.url));

  if (!missing.length) return html;

  const extraItems = missing
    .map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`)
    .join('');

  const sourceListPattern = /(<section aria-labelledby="sources-title">[\s\S]*?<ul class="source-list">)([\s\S]*?)(<\/ul><\/section>)/i;
  if (sourceListPattern.test(html)) {
    return html.replace(sourceListPattern, (_match, open, existing, close) => `${open}${existing}${extraItems}${close}`);
  }

  const sourceSection = `<section aria-labelledby="sources-title"><h2 id="sources-title">Джерела та додаткове читання</h2><ul class="source-list">${extraItems}</ul></section>`;
  return html.replace('</div>\n        </div>', `${sourceSection}\n        </div>\n      </div>`);
}

function copyResponse(captured, response, body) {
  for (const [name, value] of captured.headers) response.setHeader(name, value);
  response.status(captured.statusCode).send(body);
}

export default function handler(request, response) {
  const captured = new CaptureResponse();
  articleHandler(request, captured);

  if (captured.statusCode !== 200) {
    copyResponse(captured, response, captured.body);
    return;
  }

  const slug = String(request.query?.slug || '').trim().toLowerCase();
  let html = removeClientArticleRerender(captured.body);
  html = enrichTopicSpecificSections(html, slug);
  html = enrichApathySources(html, slug);
  copyResponse(captured, response, html);
}
