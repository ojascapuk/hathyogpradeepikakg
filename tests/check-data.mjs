import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
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
const audit=read('corpus-audit'),curation=read('curation');
assert.equal(audit.corpusSha256,createHash('sha256').update(fs.readFileSync(new URL('../lib/corpus.json',import.meta.url))).digest('hex'),'Audit must describe the current corpus');
assert.deepEqual(audit.verses.map(v=>v.id),verses.map(v=>v.id));
assert.equal(verses.find(v=>v.id==='3.114').english.split('Keeping the feet').length-1,1,'Do not duplicate English III.107');
assert.ok(!verses.find(v=>v.id==='3.61').english.startsWith('The Mûla Bandha'));
assert.equal(verses.find(v=>v.id==='1.56').englishNumber,'55,56,57');
assert.equal(verses.find(v=>v.id==='1.57').englishNumber,'57,58');
assert.equal(verses.find(v=>v.id==='4.33').english,'','Do not invent a historical translation');
for(const v of verses){
 const a=analyses[v.id];assert.ok(a.translationAuthor,`${v.id}: missing translation attribution`);
 if(v.translationAuthor.startsWith('Pancham')&&a.translation===v.english)assert.equal(a.translationAuthor,v.translationAuthor,`${v.id}: inherited historical text must retain its author`);
 if(a.translationAuthor.startsWith('Pancham'))assert.equal(a.translation,v.english,`${v.id}: historical text must match its comparison source`);
 const correction=curation.verses[v.id];
 if(correction){assert.ok(correction.sources.length);for(const note of correction.notes)assert.ok(v.sourceNotes.includes(note),`${v.id}: curation lost on import`);}
 if(correction?.draftTranslation){assert.equal(a.translation,correction.draftTranslation);assert.ok(a.translationAuthor.startsWith('Study Atlas'));}
}
console.log(JSON.stringify({sourceVerses:verses.length,concepts:concepts.length,annotatedVerses:Object.keys(analyses).length,wordEntries:Object.values(analyses).reduce((n,a)=>n+a.words.length,0),englishRenderings:verses.filter(v=>v.english).length,checks:'Structural integrity and import regressions passed; not linguistic verification.'},null,2));
