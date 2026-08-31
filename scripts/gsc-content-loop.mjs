import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,'seo-optimizer/config.json'),'utf8'));
const SELF_TEST=process.argv.includes('--self-test');

function req(name){const v=process.env[name];if(!v)throw new Error(`Missing environment variable: ${name}`);return v;}
function iso(d){return d.toISOString().slice(0,10)}
function addDays(d,n){const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
function b64url(v){return Buffer.from(v).toString('base64url')}
function pct(v){return `${(Number(v||0)*100).toFixed(2)}%`}
function n(v,d=1){return Number(v||0).toFixed(d)}
function isArticleUrl(url){try{return new URL(url).pathname.startsWith(CONFIG.articlePathPrefix)}catch{return false}}
function normalizeUrl(url){try{const u=new URL(url);u.hash='';u.search='';return u.toString()}catch{return url}}

async function serviceAccountToken(){
  const sa=JSON.parse(req('GSC_SERVICE_ACCOUNT_JSON'));
  const now=Math.floor(Date.now()/1000);
  const header=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const payload=b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
  const unsigned=`${header}.${payload}`;
  const signature=crypto.sign('RSA-SHA256',Buffer.from(unsigned),sa.private_key).toString('base64url');
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${unsigned}.${signature}`});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!r.ok)throw new Error(`Google token failed ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function gscQuery(token,siteUrl,startDate,endDate,dimensions=['page']){
  const endpoint=`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const r=await fetch(endpoint,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({startDate,endDate,dimensions,rowLimit:25000,dataState:'final'})});
  if(!r.ok)throw new Error(`Search Console query failed ${r.status}: ${await r.text()}`);
  return (await r.json()).rows||[];
}

function currentSitemapUrls(){
  const out=new Set();
  for(const name of fs.readdirSync(ROOT).filter(x=>/^sitemap.*\.xml$/.test(x))){
    const xml=fs.readFileSync(path.join(ROOT,name),'utf8');
    for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
      const url=normalizeUrl(m[1].trim());
      if(isArticleUrl(url))out.add(url);
    }
  }
  return out;
}

function pageMap(rows){
  const m=new Map();
  for(const r of rows){const url=normalizeUrl(r.keys?.[0]);if(!url)continue;m.set(url,{url,clicks:Number(r.clicks||0),impressions:Number(r.impressions||0),ctr:Number(r.ctr||0),position:Number(r.position||99)});}
  return m;
}
function queryMap(rows){
  const m=new Map();
  for(const r of rows){const url=normalizeUrl(r.keys?.[0]),q=r.keys?.[1];if(!url||!q)continue;if(!m.has(url))m.set(url,[]);m.get(url).push({query:q,clicks:Number(r.clicks||0),impressions:Number(r.impressions||0),ctr:Number(r.ctr||0),position:Number(r.position||99)});}
  for(const arr of m.values())arr.sort((a,b)=>b.impressions-a.impressions||b.clicks-a.clicks);
  return m;
}
function median(values){const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2}
function ctrBenchmark(pages,pos){const lo=Math.max(1,Math.floor(pos)-2),hi=Math.ceil(pos)+2;return median(pages.filter(x=>x.impressions>=CONFIG.minImpressions&&x.position>=lo&&x.position<=hi).map(x=>x.ctr))}
function scorePage(cur,prev28,cur7,prev7,all){
  const bench=ctrBenchmark(all,cur.position),ctrGap=Math.max(0,bench-cur.ctr);
  const clickDrop=prev7?.clicks>0?Math.max(0,(prev7.clicks-(cur7?.clicks||0))/prev7.clicks):0;
  const posDrop=prev7&&cur7?Math.max(0,cur7.position-prev7.position):0;
  const longDrop=prev28?.clicks>0?Math.max(0,(prev28.clicks-cur.clicks)/prev28.clicks):0;
  return {benchCtr:bench,ctrGap,clickDrop,posDrop,longDrop,score:Math.log10(cur.impressions+10)*(ctrGap*140+clickDrop*2.4+longDrop*1.5+Math.min(posDrop,10)*0.08)};
}
function winnerScore(x){return Math.log10(x.impressions+10)*(x.clicks+1)*(Math.max(x.ctr,.001)*10)/Math.max(1,Math.sqrt(x.position))}

function makeMd(r){
  let md=`# Щоденний GSC аналіз — ${r.analysisDate}\n\nДані Google до **${r.dataThrough}**. Порівнюємо 28 днів із попередніми 28 і останні 7 завершених днів із попередніми 7.\n\n## Що заходить найкраще\n\n| URL | Clicks 28d | Impr. | CTR | Pos | Clicks 7d |\n|---|---:|---:|---:|---:|---:|\n`;
  for(const x of r.winners)md+=`| ${x.url} | ${x.clicks} | ${x.impressions} | ${pct(x.ctr)} | ${n(x.position)} | ${x.trend7.clicks} |\n`;
  md+='\n## Кандидати на «Переробку»\n\n| # | URL | Clicks | Impr. | CTR | Pos | CTR benchmark | 7d Δ clicks | Score |\n|---:|---|---:|---:|---:|---:|---:|---:|---:|\n';
  r.rewriteBatch.forEach((x,i)=>{md+=`| ${i+1} | ${x.url} | ${x.clicks} | ${x.impressions} | ${pct(x.ctr)} | ${n(x.position)} | ${pct(x.benchCtr)} | ${x.trend7.clickDelta} | ${n(x.score,2)} |\n`});
  md+=`\n## Правило циклу\n\nWorkflow тільки аналізує. Він **не переписує статті сам**. Коли користувач пише **«Переробка»**, ChatGPT бере останній звіт, читає production і source code кандидатів, порівнює їх із сильними статтями та переробляє до ${r.campaign.dailyTarget} статей в окремій branch/PR.\n\nКампанія: **${r.campaign.dailyTarget} × ${r.campaign.days} = до ${r.campaign.capacity} статей**. Якщо даних мало, сторінка не оголошується слабкою лише для заповнення десятки.\n`;
  return md;
}

async function main(){
  if(SELF_TEST){const sample=[{impressions:100,position:10,ctr:.02},{impressions:200,position:11,ctr:.05},{impressions:80,position:9,ctr:.04}];if(ctrBenchmark(sample,10)<=0)throw new Error('benchmark self-test failed');console.log('self-test ok');return;}
  const site=req('GSC_SITE_URL'),token=await serviceAccountToken(),end=addDays(new Date(),-CONFIG.dataLagDays);
  const cur28Start=addDays(end,-(CONFIG.lookbackDays-1)),prev28End=addDays(cur28Start,-1),prev28Start=addDays(prev28End,-(CONFIG.lookbackDays-1));
  const cur7Start=addDays(end,-(CONFIG.trendDays-1)),prev7End=addDays(cur7Start,-1),prev7Start=addDays(prev7End,-(CONFIG.trendDays-1));
  const [r28,p28,r7,p7,rq]=await Promise.all([
    gscQuery(token,site,iso(cur28Start),iso(end)),gscQuery(token,site,iso(prev28Start),iso(prev28End)),gscQuery(token,site,iso(cur7Start),iso(end)),gscQuery(token,site,iso(prev7Start),iso(prev7End)),gscQuery(token,site,iso(cur28Start),iso(end),['page','query'])
  ]);
  const sitemap=currentSitemapUrls(),cur28=pageMap(r28),prev28=pageMap(p28),cur7=pageMap(r7),prev7=pageMap(p7),queries=queryMap(rq);
  const all=[...cur28.values()].filter(x=>sitemap.has(x.url)&&isArticleUrl(x.url));
  const enriched=all.map(cur=>{const old28=prev28.get(cur.url)||null,c7=cur7.get(cur.url)||{clicks:0,impressions:0,ctr:0,position:99},old7=prev7.get(cur.url)||{clicks:0,impressions:0,ctr:0,position:99};return {...cur,...scorePage(cur,old28,c7,old7,all),previous28:old28,trend7:{clicks:c7.clicks,impressions:c7.impressions,ctr:c7.ctr,position:c7.position,previousClicks:old7.clicks,previousPosition:old7.position,clickDelta:c7.clicks-old7.clicks},topQueries:(queries.get(cur.url)||[]).slice(0,8)};});
  const candidates=enriched.filter(x=>x.impressions>=CONFIG.minImpressions&&x.score>0).sort((a,b)=>b.score-a.score),winners=enriched.slice().sort((a,b)=>winnerScore(b)-winnerScore(a)).slice(0,CONFIG.winnerReferenceCount),batch=candidates.slice(0,CONFIG.dailyRewriteTarget);
  const report={analysisDate:iso(new Date()),dataThrough:iso(end),ranges:{current28:[iso(cur28Start),iso(end)],previous28:[iso(prev28Start),iso(prev28End)],current7:[iso(cur7Start),iso(end)],previous7:[iso(prev7Start),iso(prev7End)]},sitemapArticleCount:sitemap.size,gscArticleCount:all.length,campaign:{dailyTarget:CONFIG.dailyRewriteTarget,days:CONFIG.campaignDays,capacity:CONFIG.dailyRewriteTarget*CONFIG.campaignDays},winners,rewriteBatch:batch,underperformers:candidates,insufficientData:[...sitemap].filter(url=>!cur28.has(url)||cur28.get(url).impressions<CONFIG.minImpressions)};
  fs.writeFileSync(path.join(ROOT,'seo-optimizer/latest-report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(ROOT,'seo-optimizer/latest-report.md'),makeMd(report));
  console.log(JSON.stringify({analysisDate:report.analysisDate,dataThrough:report.dataThrough,sitemapArticles:report.sitemapArticleCount,gscArticles:report.gscArticleCount,rewriteCandidates:batch.length,winners:winners.length},null,2));
}

main().catch(e=>{console.error(e);process.exit(1)});
