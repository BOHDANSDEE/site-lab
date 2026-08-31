import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT=process.cwd();
const CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,'seo-optimizer/config.json'),'utf8'));
const HISTORY_PATH=path.join(ROOT,'seo-optimizer/history.json');
const HISTORY=JSON.parse(fs.readFileSync(HISTORY_PATH,'utf8'));
const DRY=process.argv.includes('--dry-run');
const SELF_TEST=process.argv.includes('--self-test');

function req(name){const v=process.env[name];if(!v)throw new Error(`Missing environment variable: ${name}`);return v;}
function iso(d){return d.toISOString().slice(0,10)}
function addDays(d,n){const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
function daysBetween(a,b){return Math.floor((new Date(b)-new Date(a))/86400000)}
function b64url(v){return Buffer.from(v).toString('base64url')}
function cleanText(s=''){return s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function extractTag(html,tag){const m=html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i'));return m?cleanText(m[1]):''}
function extractMeta(html,name){const a=html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`,'i'));const b=html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`,'i'));return (a||b)?.[1]||''}
function extractH2s(html){return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m=>cleanText(m[1])).filter(Boolean).slice(0,16)}
function pageProfile(url,html){const text=cleanText(html.replace(/<nav[\s\S]*?<\/nav>/gi,' ').replace(/<footer[\s\S]*?<\/footer>/gi,' '));return {url,title:extractTag(html,'title'),meta:extractMeta(html,'description'),h1:extractTag(html,'h1'),h2:extractH2s(html),sample:text.slice(0,3200)} }

async function serviceAccountToken(){
  const raw=req('GSC_SERVICE_ACCOUNT_JSON');
  const sa=JSON.parse(raw);
  const now=Math.floor(Date.now()/1000);
  const header=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const payload=b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
  const unsigned=`${header}.${payload}`;
  const signature=crypto.sign('RSA-SHA256',Buffer.from(unsigned),sa.private_key).toString('base64url');
  const jwt=`${unsigned}.${signature}`;
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:jwt});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!r.ok)throw new Error(`Google token failed ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function gscQuery(token,siteUrl,startDate,endDate){
  const endpoint=`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const r=await fetch(endpoint,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({startDate,endDate,dimensions:['page'],rowLimit:25000,dataState:'final',aggregationType:'byPage'})});
  if(!r.ok)throw new Error(`Search Console query failed ${r.status}: ${await r.text()}`);
  return (await r.json()).rows||[];
}

function normalizeRows(rows){const map=new Map();for(const row of rows){const url=row.keys?.[0];if(!url)continue;map.set(url,{url,clicks:Number(row.clicks||0),impressions:Number(row.impressions||0),ctr:Number(row.ctr||0),position:Number(row.position||99)});}return map}
function slugFromUrl(url){try{const p=new URL(url).pathname.split('/').filter(Boolean);return p.at(-1)||''}catch{return ''}}
function isArticleUrl(url){try{return new URL(url).pathname.startsWith(CONFIG.articlePathPrefix)}catch{return false}}

function collectSourceFiles(){
  const out=[];
  const walk=d=>{if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(mjs|js)$/.test(e.name))out.push(p)}};
  walk(path.join(ROOT,'article-data'));
  for(const name of fs.readdirSync(ROOT)){if(/^(article|apathy).+\.js$/.test(name))out.push(path.join(ROOT,name))}
  return [...new Set(out)];
}
function declarationRegex(slug){const esc=slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(`slug\\s*:\\s*['\"]${esc}['\"]`)}
function findSourceForSlug(slug,files){for(const file of files){const text=fs.readFileSync(file,'utf8');if(declarationRegex(slug).test(text))return {file,text};}return null}

function objectSpanForSlug(source,slug){
  const m=declarationRegex(slug).exec(source);if(!m)throw new Error(`slug declaration not found: ${slug}`);
  const idx=m.index;let quote=null,esc=false,line=false,block=false;const stack=[];let start=-1;
  for(let i=0;i<source.length;i++){
    const c=source[i],n=source[i+1];
    if(line){if(c==='\n')line=false;continue} if(block){if(c==='*'&&n==='/'){block=false;i++}continue}
    if(quote){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote)quote=null;continue}
    if(c==='/'&&n==='/'){line=true;i++;continue} if(c==='/'&&n==='*'){block=true;i++;continue}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue}
    if(c==='{'){stack.push(i)} else if(c==='}'){const open=stack.pop();if(start===open)return {start,end:i+1}}
    if(i===idx){start=stack.at(-1)??-1;if(start<0)throw new Error(`object start not found for ${slug}`)}
  }
  throw new Error(`object end not found for ${slug}`);
}

function sitemapDates(){const map=new Map();for(const f of fs.readdirSync(ROOT).filter(x=>/^sitemap.*\.xml$/.test(x))){const xml=fs.readFileSync(path.join(ROOT,f),'utf8');for(const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)){if(m[2])map.set(m[1],m[2])}}return map}
function lastRewrite(url){const items=HISTORY.rewrites.filter(x=>x.url===url).sort((a,b)=>String(b.date).localeCompare(String(a.date)));return items[0]?.date||null}
function opportunity(cur,prev){const ctrGap=Math.max(0,0.06-cur.ctr);const posFactor=Math.max(0.15,Math.min(1,(31-cur.position)/26));const decline=prev?.clicks?Math.max(0,(prev.clicks-cur.clicks)/prev.clicks):0;return cur.impressions*ctrGap*posFactor + cur.impressions*0.015*decline}

function selectPages(current,previous,dates,files){const now=new Date();const candidates=[];for(const cur of current.values()){
  if(!isArticleUrl(cur.url)||cur.impressions<CONFIG.minImpressions||cur.position>CONFIG.maxAveragePosition)continue;
  const slug=slugFromUrl(cur.url);const src=findSourceForSlug(slug,files);if(!src)continue;
  const lm=dates.get(cur.url);if(lm&&daysBetween(lm,now)<CONFIG.minPageAgeDays)continue;
  const lr=lastRewrite(cur.url);if(lr&&daysBetween(lr,now)<CONFIG.rewriteCooldownDays)continue;
  candidates.push({...cur,slug,source:src,prev:previous.get(cur.url)||null,score:opportunity(cur,previous.get(cur.url))});
 }
 return candidates.sort((a,b)=>b.score-a.score).slice(0,CONFIG.maxRewritesPerRun);
}
function selectWinners(current,exclude=new Set()){return [...current.values()].filter(x=>isArticleUrl(x.url)&&!exclude.has(x.url)&&x.clicks>=CONFIG.winnerMinClicks&&x.position<=CONFIG.winnerMaxPosition).sort((a,b)=>(b.clicks*1.3+b.impressions*b.ctr)-(a.clicks*1.3+a.impressions*a.ctr)).slice(0,CONFIG.winnerReferenceCount)}

async function fetchProfile(url){const r=await fetch(url,{headers:{'user-agent':'Lin-GSC-Optimizer/1.0'}});if(!r.ok)throw new Error(`Page fetch ${r.status}: ${url}`);return pageProfile(url,await r.text())}
function extractResponseText(json){if(typeof json.output_text==='string')return json.output_text;for(const item of json.output||[])for(const c of item.content||[])if(c.type==='output_text'&&c.text)return c.text;return ''}

async function rewriteObject(target,winners,targetProfile){
  const key=req('OPENAI_API_KEY');const span=objectSpanForSlug(target.source.text,target.slug);const currentObject=target.source.text.slice(span.start,span.end);
  const prompt=`Ти редактор українського SEO-сайту «Лінь» про лінь, прокрастинацію, апатію та пов'язані проблеми. Треба покращити ОДНУ статтю на основі реальних Search Console даних і структурних рис сторінок, які вже працюють краще.\n\nЖОРСТКІ ПРАВИЛА:\n- Поверни ТІЛЬКИ повний JavaScript object literal цієї статті: від { до }. Без markdown і пояснень.\n- Не змінюй slug. Не вигадуй search volume. Не додавай діагнози або гарантовані медичні причини.\n- Збережи поточну схему полів об'єкта, внутрішні посилання й CTA-сумісність.\n- Не копіюй фрази з переможців; перенось принципи: ясний intent, конкретність, сильний вступ, корисна структура, приклади, механізм, практичні дії.\n- Не роби косметичний рерайт. Усунь слабкі місця, через які сторінка може недоотримувати кліки або не відповідати intent.\n- Title/H1/meta мають відповідати запиту без клікбейту.\n- Стаття повинна залишатися самодостатньою і корисною без бота.\n- Орієнтир long-form: приблизно 1400–2000 українських слів, якщо природно.\n\nЦІЛЬОВА СТОРІНКА GSC:\n${JSON.stringify({url:target.url,clicks:target.clicks,impressions:target.impressions,ctr:target.ctr,position:target.position,previous:target.prev},null,2)}\n\nПОТОЧНИЙ RENDER PROFILE:\n${JSON.stringify(targetProfile,null,2)}\n\nКРАЩІ СТОРІНКИ ДЛЯ ПОРІВНЯННЯ:\n${JSON.stringify(winners,null,2)}\n\nПОТОЧНИЙ OBJECT, ЯКИЙ ТРЕБА ПОВЕРНУТИ ПОКРАЩЕНИМ:\n${currentObject}`;
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||CONFIG.openAiModel,input:[{role:'developer',content:'Редагуй обережно, зберігай фактичну коректність, URL та структуру даних. Вихід — лише JavaScript object literal.'},{role:'user',content:prompt}],reasoning:{effort:'medium'},max_output_tokens:32000})});
  if(!r.ok)throw new Error(`OpenAI response failed ${r.status}: ${await r.text()}`);const out=extractResponseText(await r.json()).trim().replace(/^```(?:js|javascript)?\s*/,'').replace(/```$/,'').trim();
  if(!out.startsWith('{')||!out.endsWith('}'))throw new Error(`Model did not return object literal for ${target.slug}`);
  if(!declarationRegex(target.slug).test(out))throw new Error(`Model changed or removed slug for ${target.slug}`);
  return {span,replacement:out};
}

function validateChangedFiles(files){for(const f of files){execFileSync(process.execPath,['--check',f],{stdio:'inherit'})}}
function pct(v){return `${(v*100).toFixed(2)}%`}
function reportMarkdown(rewrites,winners,range){let md=`# GSC content optimization — ${iso(new Date())}\n\nПеріод: ${range.start} → ${range.end}; порівняння: ${range.prevStart} → ${range.prevEnd}.\n\n`;
 if(!rewrites.length)return md+'Немає сторінок, які одночасно пройшли пороги даних, віку та cooldown.\n';
 md+='## Запропоновані переробки\n\n| URL | Clicks | Impressions | CTR | Position | Previous clicks |\n|---|---:|---:|---:|---:|---:|\n';for(const x of rewrites)md+=`| ${x.url} | ${x.clicks} | ${x.impressions} | ${pct(x.ctr)} | ${x.position.toFixed(1)} | ${x.prev?.clicks??0} |\n`;
 md+='\n## Референсні переможці\n\n';for(const w of winners)md+=`- ${w.url} — ${w.clicks} clicks, ${w.impressions} impressions, CTR ${pct(w.ctr)}, position ${w.position.toFixed(1)}\n`;
 md+='\nАвтоматизація не merge-ить зміни. Вона створює PR для ручної перевірки, а наступний цикл оцінює вже нові Search Console дані.\n';return md}

async function main(){
 if(SELF_TEST){const sample=`export const A=[{slug:'abc',title:'X',sections:[{heading:'H',paragraphs:['a { b }']}]}];`;const s=objectSpanForSlug(sample,'abc');if(!sample.slice(s.start,s.end).includes("slug:'abc'"))throw new Error('object parser self-test failed');console.log('✅ gsc-content-loop self-test passed');return;}
 const siteUrl=req('GSC_SITE_URL');const token=await serviceAccountToken();const end=addDays(new Date(),-CONFIG.dataLagDays),start=addDays(end,-CONFIG.lookbackDays+1),prevEnd=addDays(start,-1),prevStart=addDays(prevEnd,-CONFIG.comparisonDays+1);
 const [curRows,prevRows]=await Promise.all([gscQuery(token,siteUrl,iso(start),iso(end)),gscQuery(token,siteUrl,iso(prevStart),iso(prevEnd))]);const current=normalizeRows(curRows),previous=normalizeRows(prevRows),files=collectSourceFiles(),dates=sitemapDates();
 const targets=selectPages(current,previous,dates,files);const winners=selectWinners(current,new Set(targets.map(x=>x.url)));const winnerProfiles=[];for(const w of winners){try{winnerProfiles.push({...w,profile:await fetchProfile(w.url)})}catch(e){console.warn(e.message)}}
 const changed=new Set(),completed=[];
 for(const target of targets){
   const targetProfile=await fetchProfile(target.url);
   if(DRY){completed.push(target);continue}
   const liveSource=fs.readFileSync(target.source.file,'utf8');target.source={file:target.source.file,text:liveSource};
   const {span,replacement}=await rewriteObject(target,winnerProfiles,targetProfile);const next=liveSource.slice(0,span.start)+replacement+liveSource.slice(span.end);fs.writeFileSync(target.source.file,next);changed.add(target.source.file);completed.push(target);
 }
 if(!DRY&&changed.size){validateChangedFiles([...changed]);for(const t of completed)HISTORY.rewrites.push({date:iso(new Date()),url:t.url,slug:t.slug,metrics:{clicks:t.clicks,impressions:t.impressions,ctr:t.ctr,position:t.position},source:path.relative(ROOT,t.source.file)});fs.writeFileSync(HISTORY_PATH,JSON.stringify(HISTORY,null,2)+'\n');const report=reportMarkdown(completed,winners,{start:iso(start),end:iso(end),prevStart:iso(prevStart),prevEnd:iso(prevEnd)});fs.writeFileSync(path.join(ROOT,'seo-optimizer/latest-report.md'),report);}
 const report=reportMarkdown(completed,winners,{start:iso(start),end:iso(end),prevStart:iso(prevStart),prevEnd:iso(prevEnd)});console.log(report);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report+'\n');
}

main().catch(e=>{console.error(e.stack||e);process.exit(1)});
