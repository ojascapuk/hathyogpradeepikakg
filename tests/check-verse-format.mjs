import assert from 'node:assert/strict';
import fs from 'node:fs';
import {formatVerse,devanagari} from '../lib/sanskrit.ts';
import {searchVerses} from '../lib/reading.ts';
const load=name=>JSON.parse(fs.readFileSync(new URL('../lib/'+name+'.json',import.meta.url),'utf8'));
const verses=load('corpus'),analyses=load('study-annotations');
const before=JSON.stringify(verses);
const readings=Object.fromEntries(verses.map(verse=>[verse.id,formatVerse(verse.iast,verse.number)]));
const first=readings['1.1'];
assert.equal(first.devanagari,'श्रीआदिनाथाय नमोऽस्तु तस्मै येनोपदिष्टा हठयोगविद्या ।\nविभ्राजते प्रोन्नतराजयोगमारोढुमिच्छोरधिरोहिणीव ॥ १ ॥');
assert.equal(readings['1.2'].devanagari,'प्रणम्य श्रीगुरुं नाथं स्वात्मारामेण योगिना ।\nकेवलं राजयोगाय हठविद्योपदिश्यते ॥ २ ॥');
assert.ok(readings['1.21'].devanagari.includes('सम्यक्कृत्वा पादतले'));
assert.ok(readings['1.61'].iast.includes('śākasauvīra'),'A compound continuation across a source line must join');
assert.equal(readings['1.63'].lines.length,1);
assert.equal(formatVerse('yogam / āroḍhum',1).devanagari,'योगम् ।\nआरोढुम् ॥ १ ॥','Do not join across the half-verse pause');
assert.equal(readings['3.31'].lines.length,3,'Retain the source’s additional hemistich');
assert.ok(readings['4.114'].devanagari.endsWith('॥ ११४ ॥'));
// Existing sandhi is reconnected orthographically. New vowel sandhi is not invented.
assert.ok(formatVerse('tatra api / iti',1).iast.startsWith('tatra api'));
assert.equal(devanagari('yogam āroḍhum'),'योगम् आरोढुम्','The word-level transliterator remains unchanged');
for(const verse of verses){
 const reading=readings[verse.id];
 assert.ok(!/[-‐‑]/.test(reading.devanagari),verse.id+' must not contain study hyphens');
 assert.ok(!/[a-zāīūṛṅñṭḍṇśṣ]/i.test(reading.devanagari),verse.id+' must render entirely in Devanagari');
 assert.equal(reading.lines.length,verse.iast.split('/').length);
 assert.equal((reading.devanagari.match(/॥/g)||[]).length,2,'Exactly one closing double-daṇḍa pair: '+verse.id);
 const letters=s=>s.normalize('NFC').replace(/[\s\-/|\d]/g,'');
 assert.equal(letters(reading.iast),letters(verse.iast),'Presentation must not change Sanskrit letters: '+verse.id);
}
assert.equal(JSON.stringify(verses),before);
assert.ok(searchVerses(verses,analyses,'राजयोगमारोढुमिच्छोरधिरोहिणीव',readings).some(v=>v.id==='1.1'));
assert.ok(searchVerses(verses,analyses,'rājayogamāroḍhumicchoradhirohiṇīva',readings).some(v=>v.id==='1.1'));
console.log('All 392 verse readings passed: continuous compounds, consonant joins, daṇḍas, numbering, half-verse boundaries, letter fidelity and joined-form search.');
