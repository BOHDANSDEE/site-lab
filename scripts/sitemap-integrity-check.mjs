import { readFileSync } from 'node:fs';

const sitemap = readFileSync('sitemap.xml', 'utf8');
const linRenderer = readFileSync('api/lin-experiment.mjs', 'utf8');

const requiredPaths = [
  '/statti/lin/',
  '/statti/motyvatsiia/',
  '/statti/apatiia-chy-depresiia/',
  '/statti/prychyny-prokrastynatsii/',
  '/statti/yak-perestaty-vidkladaty-spravy/'
];

for (const path of requiredPaths) {
  const url = `https://xn--k1ae9bxb.online${path}`;
  const count = sitemap.split(url).length - 1;
  if (count !== 1) {
    throw new Error(`Expected exactly one sitemap entry for ${url}, found ${count}`);
  }
}

if (sitemap.includes('https://xn--k1ae9bxb.online/statti/lin-vybir/')) {
  throw new Error('Redirected /statti/lin-vybir/ must not be present in sitemap.xml');
}

if (linRenderer.includes('/statti/lin-vybir/')) {
  throw new Error('Lin renderer still references redirected /statti/lin-vybir/');
}

if (!linRenderer.includes("const canonical = `${SITE}/statti/lin/`;")) {
  throw new Error('Lin catalog canonical must point to /statti/lin/');
}

console.log('Sitemap/canonical integrity OK');
