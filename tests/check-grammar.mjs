import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sanskritGrammar,compoundMatches,sanskritCompoundType} from '../lib/grammar.ts';

assert.equal(sanskritGrammar('Masculine nominative singular.'),'prathamā vibhaktiḥ · ekavacanam · puṃliṅgam');
assert.equal(sanskritGrammar('Feminine accusative plural.'),'dvitīyā vibhaktiḥ · bahuvacanam · strīliṅgam');
assert.equal(sanskritGrammar('gen. du. m.'),'ṣaṣṭhī vibhaktiḥ · dvivacanam · puṃliṅgam');
assert.match(sanskritGrammar('nom./acc. sg. n.'),/^prathamā \/ dvitīyā vibhaktiḥ/);
assert.equal(sanskritGrammar('Indeclinable governing accusative/instrumental/ablative'),'avyayam');
assert.match(sanskritGrammar('Present optative active third singular'),/prathamapuruṣaḥ · vidhiliṅ · parasmaipadam/);
assert.match(sanskritGrammar('Present indicative middle third singular'),/prathamapuruṣaḥ · laṭ · ātmanepadam/);
assert.match(sanskritGrammar('Present imperative, second person singular, active.'),/madhyamapuruṣaḥ · loṭ/);
assert.match(sanskritGrammar('Past passive participle, feminine nominative singular.'),/kta-pratyayāntaṃ kṛdantam/);
assert.match(sanskritGrammar('source form defective/uncertain'),/anirṇītam/);
assert.ok(compoundMatches({form:'haṭha-yoga-vidyā',lemma:'haṭhayogavidyā'},{form:'haṭha-yoga-vidyā'}));
assert.ok(compoundMatches({form:'nāsāgre',lemma:'nāsāgra'},{form:'nāsāgra'}));
assert.ok(!compoundMatches({form:'yogī',lemma:'yogin'},{form:'yoga-siddhi'}));
assert.equal(sanskritCompoundType('Genitive tatpuruṣa'),'ṣaṣṭhī-tatpuruṣaḥ');
assert.equal(sanskritCompoundType('Traditional name'),'');

const annotations=JSON.parse(fs.readFileSync(new URL('../lib/study-annotations.json',import.meta.url),'utf8'));
const curation=JSON.parse(fs.readFileSync(new URL('../lib/grammar-curation.json',import.meta.url),'utf8'));
const placeholder=/\b(?:lorem ipsum|todo|tbd|placeholder|filler|meaning pending|see translation)\b/i;
for(const [id,a] of Object.entries(annotations)){
 for(const w of a.words){
  assert.ok(!placeholder.test(w.meaning),`${id} ${w.form}: placeholder meaning`);
  assert.ok(sanskritGrammar(w.grammar),`${id} ${w.form}: untranslated grammatical tag`);
  const correction=curation.words[id]?.[w.form];
  if(correction)for(const [field,value] of Object.entries(correction))assert.equal(w[field],value);
 }
 for(const c of a.compounds){
  assert.ok(!placeholder.test(c.meaning),`${id} ${c.form}: placeholder compound meaning`);
  const correction=curation.compounds[c.form];
  if(correction){assert.equal(c.vigraha,correction.vigraha);assert.equal(c.typeSanskrit,correction.typeSanskrit);}
 }
}
console.log('Sanskrit labels, ambiguous cases, person/voice, compound association, curation persistence and placeholder checks passed.');
