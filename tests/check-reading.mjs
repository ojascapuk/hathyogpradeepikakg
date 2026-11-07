import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchVerses,sourceLinks} from '../lib/reading.ts';
import {grammarGlossary,wikipediaReference} from '../lib/glossary.ts';
const load=name=>JSON.parse(fs.readFileSync(new URL('../lib/'+name+'.json',import.meta.url),'utf8'));
const verses=load('corpus'),analyses=load('study-annotations'),concepts=load('concepts');
for(const query of ['2.54','verse 2.54','2:54','२.५४'])assert.deepEqual(searchVerses(verses,analyses,query).map(v=>v.id),['2.54']);
assert.deepEqual(searchVerses(verses,analyses,'4.11').map(v=>v.id),['4.11']);
assert.deepEqual(searchVerses(verses,analyses,'4.999'),[]);
assert.ok(searchVerses(verses,analyses,'prana').length);
assert.ok(searchVerses(verses,analyses,'प्राण').length);
for(const verse of verses){
 const links=sourceLinks(verse);
 assert.ok(links[0].url.includes(encodeURIComponent('// HYP_'+verse.id+' //')));
 assert.ok(links.some(link=>link.url.includes('sanskritdocuments.org')&&link.url.includes('#:~:text=')));
 if(verse.englishNumber)assert.ok(links.some(link=>link.url.includes('spiritmaji.com')&&new URL(link.url).hash));
 for(const link of links)assert.ok(new URL(link.url).hash,'Source links must target a passage, not a chapter top');
}
assert.ok(sourceLinks(verses.find(v=>v.id==='1.28')).some(link=>link.url.endsWith('#28-29.')));
assert.ok(sourceLinks(verses.find(v=>v.id==='1.55')).some(link=>decodeURIComponent(link.url).includes('#55\u00a0and\u00a056.')));
assert.equal(wikipediaReference('bhramari').title,'Pranayama','Do not confuse the breathing technique with the goddess');
for(const concept of concepts)assert.ok(wikipediaReference(concept.id).url.startsWith('https://en.wikipedia.org/wiki/'));
assert.equal(grammarGlossary.length,14);
console.log('Exact references, Devanagari search, all 392 passage source links, translation crosswalks and glossary references passed.');
