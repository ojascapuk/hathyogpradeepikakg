// Run against a headless Chrome CDP endpoint; see README for the command.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const output=process.env.QA_OUTPUT_DIR||'/tmp/pradipika-browser-qa';fs.mkdirSync(output,{recursive:true});
const base=process.env.APP_URL||'http://127.0.0.1:8787';
const targets=await fetch((process.env.BROWSER_DEBUG_URL||'http://127.0.0.1:9223')+'/json').then(r=>r.json());
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map();const errors=[];
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const until=async expression=>{for(let i=0;i<80;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,150));}throw new Error('Timed out: '+expression);};
const choose=async value=>{await evaluate(`document.querySelector('[aria-label="Use ${value[0].toUpperCase()+value.slice(1)} theme"]').click()`);await until(`localStorage.getItem('hpa-theme')===${JSON.stringify(value)}`);};
await call('Runtime.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
await call('Page.navigate',{url:base});
await until(`document.querySelector('[aria-label="Reading theme"]') && document.querySelector('.graph')`);
await until(`document.querySelector('.theme-control')?.dataset.ready==='true'`);await choose('dark');await until(`document.documentElement.dataset.theme==='dark'`);
assert.equal(await evaluate(`getComputedStyle(document.body).backgroundColor`),'rgb(17, 26, 35)');
await call('Page.reload');await until(`document.querySelector('[aria-label="Reading theme"]')?.value==='2' && document.querySelector('.graph')`);
assert.equal(await evaluate(`document.documentElement.dataset.theme`),'dark');
const printed=await evaluate(`document.querySelector('.detail-hero .samhita').textContent`);
assert.equal(printed,'श्रीआदिनाथाय नमोऽस्तु तस्मै येनोपदिष्टा हठयोगविद्या ।\nविभ्राजते प्रोन्नतराजयोगमारोढुमिच्छोरधिरोहिणीव ॥ १ ॥');
await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedVerse=text}}});Array.from(document.querySelectorAll('.verse-tools button')).find(button=>button.textContent==='Copy').click()`);
await until(`Boolean(window.__copiedVerse)`);
assert.ok((await evaluate(`window.__copiedVerse`)).startsWith(printed));
assert.ok(!(await evaluate(`window.__copiedVerse`)).includes('-'));
const ratio=await evaluate(`document.querySelector('.main').getBoundingClientRect().width/document.querySelector('.detail-panel').getBoundingClientRect().width`);
assert.ok(Math.abs(ratio-1.618034)<.02,'Desktop panels should follow the golden ratio');
const smallText=await evaluate(`Array.from(document.querySelectorAll('body *')).filter(el=>Array.from(el.childNodes).some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0&&getComputedStyle(el).visibility!=='hidden').filter(el=>parseFloat(getComputedStyle(el).fontSize)<12).map(el=>({tag:el.tagName,text:el.textContent.slice(0,40),size:getComputedStyle(el).fontSize}))`);
assert.deepEqual(smallText,[],'Visible text must be at least 12px');
assert.ok(await evaluate(`Array.from(document.querySelectorAll('.graph text')).filter(el=>getComputedStyle(el).opacity!=='0'&&getComputedStyle(el).display!=='none').every(el=>parseFloat(getComputedStyle(el).fontSize)*el.getScreenCTM().a>=11.8)`),'SVG labels must remain readable after viewBox scaling');
assert.ok(await evaluate(`!document.body.innerText.includes('DRAFT')&&!document.querySelector('[aria-label="Open my study notebook"]')&&!document.querySelector('textarea')`));
fs.writeFileSync(output+'/dark-desktop.png',Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
await evaluate(`document.querySelector('[aria-label="Reading theme"]').focus()`);await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Home',code:'Home',windowsVirtualKeyCode:36});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Home',code:'Home',windowsVirtualKeyCode:36});await until(`localStorage.getItem('hpa-theme')==='light'`);await choose('light');await until(`document.documentElement.dataset.theme==='light'`);
assert.equal(await evaluate(`getComputedStyle(document.body).backgroundColor`),'rgb(248, 245, 238)');
await choose('system');
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});await until(`document.documentElement.dataset.theme==='dark'`);
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});await until(`document.documentElement.dataset.theme==='light'`);
await choose('dark');
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await call('Page.reload');await until(`document.querySelector('.mobile-nav') && document.querySelector('[aria-label="Reading theme"]')?.value==='2'`);
assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),'Mobile horizontal overflow');
assert.ok(await evaluate(`(()=>{const r=document.querySelector('[aria-label="Reading theme"]').getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&r.width>0})()`),'Theme control must remain visible on mobile');
fs.writeFileSync(output+'/dark-mobile.png',Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true});
assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),'320px phone must not overflow');
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:base+'/?check=historical#3.4'});await until(`document.querySelector('.theme-control')?.dataset.ready==='true' && document.querySelector('.hero-number')?.textContent==='3.4'`);
assert.equal(await evaluate(`document.querySelector('.detail-body .mini-label').textContent`),'PANCHAM SINH · HISTORICAL TRANSLATION');
await call('Page.navigate',{url:base+'/?check=editorial#3.11'});await until(`document.querySelector('.theme-control')?.dataset.ready==='true' && document.querySelector('.hero-number')?.textContent==='3.11'`);
assert.match(await evaluate(`document.querySelector('.translation').textContent`),/upward/);
assert.match(await evaluate(`document.querySelector('.detail-body .mini-label').textContent`),/STUDY TRANSLATION/);
await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Sources & references').click()`);
await until(`document.querySelector('.sources-content')`);
assert.ok(await evaluate(`document.querySelectorAll('.source-card a').length>=9`));
fs.writeFileSync(output+'/sources-dark.png',Buffer.from((await call('Page.captureScreenshot')).data,'base64'));

await call('Page.navigate',{url:base+'/?check=grammar#1.1'});await until(`location.search==='?check=grammar' && document.querySelector('.theme-control')?.dataset.ready==='true' && document.querySelector('.hero-number')?.textContent==='1.1'`);
await evaluate(`Array.from(document.querySelectorAll('[role="tab"]')).find(b=>b.textContent==='Words').click()`);
await until(`document.querySelector('.word-grammar-sa')`);
assert.match(await evaluate(`document.querySelector('.word-grammar-sa').textContent`),/caturthī.*ekavacanam/);
assert.ok(await evaluate(`Boolean(document.querySelector('.word-compounds'))`));
await evaluate(`document.querySelector('.word-compounds').open=true`);
assert.match(await evaluate(`document.querySelector('.word-compounds').textContent`),/samās|Syntactic expansion/i);
await evaluate(`document.querySelector('.detail-panel').scrollTop=650`);
fs.writeFileSync(output+'/words-dark.png',Buffer.from((await call('Page.captureScreenshot')).data,'base64'));

const contrast=await evaluate(`(()=>{
 const rgb=s=>{const m=s.match(/rgba?\\(([^)]+)\\)/);return m?m[1].split(',').slice(0,3).map(Number):null};
 const lum=c=>c.map(n=>n/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const failures=[];let count=0,minimum=100;
 for(const el of document.querySelectorAll('.word-grammar-sa,.grammar-english,.word-entry strong,.analysis-card p,.vigraha,.translation,.concept-label,.node-title,.node-dev,.mini-label,.theme-stops button,.topnav button')){
  const rect=el.getBoundingClientRect();if(!rect.width||!rect.height||el.closest('[disabled]'))continue;
  const style=getComputedStyle(el);const foreground=rgb(el instanceof SVGElement?style.fill:style.color);if(!foreground)continue;
  let ancestor=el,background=null;
  if(el.matches('.node-title,.node-dev'))background=[35,60,80];
  while(ancestor&&!background){const color=getComputedStyle(ancestor).backgroundColor;if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent')background=rgb(color);ancestor=ancestor.parentElement;}
  if(!background)continue;const a=lum(foreground),b=lum(background);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);count++;minimum=Math.min(minimum,ratio);if(ratio<4.5)failures.push({text:el.textContent.slice(0,60),ratio,foreground,background});
 }
 return {count,minimum,failures};
})()`);
fs.writeFileSync(output+'/contrast.json',JSON.stringify(contrast,null,2));
assert.ok(contrast.count>20,'Contrast test must inspect actual text');
assert.deepEqual(contrast.failures,[],'Text contrast must reach 4.5:1');
console.log('Dark-mode text contrast:',contrast.count,'elements; minimum',contrast.minimum.toFixed(2)+':1');
for(const passage of ['2.28','2.34','4.33','4.114']){
 await call('Page.navigate',{url:base+'/?check=word-layout-'+passage+'#'+passage});
 await until(`document.querySelector('.theme-control')?.dataset.ready==='true' && document.querySelector('.hero-number')?.textContent===${JSON.stringify(passage)}`);
 await evaluate(`Array.from(document.querySelectorAll('[role="tab"]')).find(b=>b.textContent==='Words').click()`);
 await until(`document.querySelector('.word-grammar-sa')`);
 assert.ok(await evaluate(`(()=>{const p=document.querySelector('.detail-panel');return p.scrollWidth<=p.clientWidth+1})()`),'Word panel overflow at '+passage);
}
await call('Page.navigate',{url:base+'/?check=compound#1.41'});
await until(`document.querySelector('.theme-control')?.dataset.ready==='true' && document.querySelector('.hero-number')?.textContent==='1.41'`);
await evaluate(`Array.from(document.querySelectorAll('[role="tab"]')).find(b=>b.textContent==='Sandhi').click()`);
await until(`document.querySelector('.compound-form')`);
assert.match(await evaluate(`document.querySelector('.compound-form').textContent`),/चतुरशीति.*पीठ/);
assert.match(await evaluate(`document.querySelector('.compound-part-script').textContent`),/चतुरशीति.*caturaśīti.*84/);
assert.match(await evaluate(`document.querySelector('.sandhi-parts').textContent`),/सदा.*अभ्यसेत्.*sadā.*abhyaset/);
await call('Page.navigate',{url:base+'/?check=wikipedia'});
await until(`document.querySelector('.theme-control')?.dataset.ready==='true'`);
await evaluate(`document.querySelector('.concept-index summary').click()`);
for(const concept of ['Bhrāmarī','Bhastrikā','Neti']){
 await evaluate(`Array.from(document.querySelectorAll('.concept-index button')).find(b=>b.textContent.includes(${JSON.stringify(concept)})).click()`);
 await until(`document.querySelector('.concept-heading')?.textContent.length && document.querySelector('.wikipedia-link')`);
 assert.ok((await evaluate(`document.querySelector('.wikipedia-link').href`)).includes('en.wikipedia.org/wiki/'));
 if(concept==='Bhrāmarī')assert.ok((await evaluate(`document.querySelector('.wikipedia-link').href`)).endsWith('/Pranayama'));
}
await call('Page.navigate',{url:base+'/?check=search'});
await until(`location.search==='?check=search' && document.querySelector('.theme-control')?.dataset.ready==='true'`);
await evaluate(`(()=>{const input=document.querySelector('[aria-label="Search verses, concepts, and translations"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'2.54');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
await until(`document.querySelectorAll('.search-results .result-row').length===1`);
await evaluate(`document.querySelector('[aria-label="Search verses, concepts, and translations"]').focus()`);
await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
await until(`location.hash==='#2.54'&&document.getElementById('verse-2.54')?.classList.contains('selected')`);
await until(`(()=>{const r=document.getElementById('verse-2.54').getBoundingClientRect();return r.top>=0&&r.top<80})()`);
assert.match(await evaluate(`document.querySelector('.hero-number').textContent`),/2.54/);
assert.ok(await evaluate(`document.querySelector('.verse-sources a').hash.includes('HYP_2.54')`));
await call('Page.navigate',{url:base+'/?check=glossary'});
await until(`location.search==='?check=glossary' && document.querySelector('.theme-control')?.dataset.ready==='true'`);
await evaluate(`Array.from(document.querySelectorAll('.sidebar button')).find(b=>b.textContent==='Glossary').click()`);
await until(`document.querySelectorAll('.glossary-entry').length===86`);
assert.ok(await evaluate(`document.querySelectorAll('.glossary-entry a[href*="wikipedia.org/wiki/"]').length===86`));
fs.writeFileSync(output+'/glossary-desktop.png',Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
await evaluate(`document.querySelector('[aria-label="Read verse 2.54"]').click()`);
await until(`location.hash==='#2.54'&&document.getElementById('verse-2.54')?.classList.contains('selected')`);
await until(`document.getElementById('verse-2.54').getBoundingClientRect().top<80`);
assert.deepEqual(errors,[],'Browser runtime errors');
console.log('PASS: light/dark/system, live OS changes, reload persistence, mobile fit, historical attribution, corrected draft, source audit, Devanagari-first sandhi/samasa, concept Wikipedia links, 12px minimum text, golden-ratio panels, simplified UI, 86 glossary entries and exact search scrolling; no browser exceptions.');


ws.close();
