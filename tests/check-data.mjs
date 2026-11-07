import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=n=>JSON.parse(fs.readFileSync(new URL(`../lib/${n}.json`,import.meta.url),'utf8'));
const verses=read('corpus'),concepts=read('concepts'),analyses=read('study-annotations');
assert.equal(verses.length,392);assert.equal(new Set(verses.map(v=>v.id)).size,392);
for(const[ch,count]of [[1,70],[2,78],[3,130],[4,114]])assert.deepEqual(verses.filter(v=>v.chapter===ch).map(v=>v.number),Array.from({length:count},(_,i)=>i+1));
const ids=new Set(verses.map(v=>v.id));
assert.equal(Object.keys(analyses).length,392,'Every source verse must retain a draft analysis');
for(const id of ids)assert.ok(analyses[id],`Missing analysis ${id}`);
for(const v of verses){assert.ok(v.iast.trim()&&v.devanagari.trim());assert.ok(!/HYP_|haṭha-pradīpikāyāṃ.*upadeśaḥ/.test(v.iast),`Unremoved marker ${v.id}`);assert.ok(concepts.some(c=>c.ranges.some(([ch,s,e])=>v.chapter===ch&&v.number>=s&&v.number<=e)),`No topic coverage ${v.id}`)}
for(const c of concepts)for(const id of c.related)assert.ok(concepts.some(x=>x.id===id),`Unknown concept ${id}`);
for(const[id,a]of Object.entries(analyses)){assert.ok(ids.has(id));for(const s of ['translation','anvaya','meaning'])assert.ok(typeof a[s]==='string'&&a[s].trim(),`${id} missing ${s}`);for(const s of ['words','sandhi','compounds','notes'])assert.ok(Array.isArray(a[s]),`${id} missing ${s}`);assert.ok(a.words.length>0);for(const w of a.words)for(const s of ['form','lemma','meaning','grammar'])assert.ok(typeof w[s]==='string'&&w[s].trim(),`${id} word missing ${s}`)}
assert.ok(verses.find(x=>x.id==='1.31').iast.startsWith('iti paścimatānam'));
assert.ok(verses.find(x=>x.id==='3.128').iast.startsWith('iti mudrā'));
console.log(JSON.stringify({sourceVerses:verses.length,concepts:concepts.length,annotatedVerses:Object.keys(analyses).length,wordEntries:Object.values(analyses).reduce((n,a)=>n+a.words.length,0),englishRenderings:verses.filter(v=>v.english).length,checks:'Structural integrity and import regressions passed; not linguistic verification.'},null,2));
