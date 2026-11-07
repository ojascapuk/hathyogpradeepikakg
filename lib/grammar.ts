// These labels translate the existing editorial tags. They do not infer a parse
// from a word ending or settle alternatives in an uncertain source reading.
export function sanskritGrammar(grammar: string): string {
  const g = grammar.toLowerCase();
  const labels: string[] = [];
  const caseNames = [
    ['nominative', 'nom', 'prathamā'], ['accusative', 'acc', 'dvitīyā'],
    ['instrumental', 'instr', 'tṛtīyā'], ['dative', 'dat', 'caturthī'],
    ['ablative', 'abl', 'pañcamī'], ['genitive', 'gen', 'ṣaṣṭhī'],
    ['locative', 'loc', 'saptamī'], ['vocative', 'voc', 'sambodhanam'],
  ];
  // A case governed by a particle is not the case of that particle itself.
  const indeclinable = /indeclinable|relative adverb|correlative adverb|prohibitive particle|quotation\/list marker/.test(g) || (/adverb/.test(g)&&!/singular|dual|plural|\b(?:sg|du|pl)\./.test(g));
  if (indeclinable) labels.push('avyayam');
  else {
    const cases = caseNames.filter(([full, short]) => new RegExp(`\\b${full}\\b|\\b${short}(?=[./\\s])`).test(g)).map(([, , sa]) => sa);
    if (cases.length) labels.push(cases.join(' / ') + (cases.includes('sambodhanam') ? '' : ' vibhaktiḥ'));
    if (/singular|\bsg\./.test(g)) labels.push('ekavacanam');
    if (/\bdual\b|\bdu\./.test(g)) labels.push('dvivacanam');
    if (/plural|\bpl\./.test(g)) labels.push('bahuvacanam');
    const genders = [
      [/\bmasculine\b|\bm(?=[./])/, 'puṃliṅgam'],
      [/\bfeminine\b|\bf(?=[./])/, 'strīliṅgam'],
      [/\bneuter\b|\bn(?=[./])/, 'napuṃsakaliṅgam'],
    ] as const;
    const genderLabels = genders.filter(([pattern]) => pattern.test(g)).map(([, sa]) => sa);
    if (genderLabels.length) labels.push(genderLabels.join(' / '));
  }
  if (/third|3rd/.test(g)) labels.push('prathamapuruṣaḥ');
  if (/second|2nd/.test(g)) labels.push('madhyamapuruṣaḥ');
  if (/first person|1st/.test(g)) labels.push('uttamapuruṣaḥ');
  if (/optative/.test(g)) labels.push('vidhiliṅ');
  else if (/imperative/.test(g)) labels.push('loṭ');
  else if (/imperfect/.test(g)) labels.push('laṅ');
  else if (/perfect/.test(g)) labels.push('liṭ');
  else if (/present/.test(g) && !/participle/.test(g)) labels.push('laṭ');
  if (/middle/.test(g)) labels.push('ātmanepadam');
  if (/passive/.test(g)) labels.push('karmaṇi prayogaḥ');
  else if (/\bactive\b/.test(g) && !/participle/.test(g)) labels.push('parasmaipadam');
  if (/causative/.test(g)) labels.push('ṇijantam');
  if (/past passive participle/.test(g)) labels.push('kta-pratyayāntaṃ kṛdantam');
  else if (/participle/.test(g)) labels.push('kṛdantam');
  if (/absolutive|gerund(?!ive)/.test(g)) labels.push('ktvā / lyap-pratyayāntam avyayam');
  if (/infinitive/.test(g)) labels.push('tumun-pratyayāntam avyayam');
  if (/-tas/.test(g)) labels.push('tasil-pratyayāntam');
  if (/compound member|compound qualifying|stem.*compound/.test(g)) labels.push('samāsasya avayavaḥ');
  if (/uncertain|defective|corrupt|problematic|irregular/.test(g)) labels.push('anirṇītam');
  return [...new Set(labels)].join(' · ');
}

export function compoundMatches(word: {form:string;lemma:string}, compound: {form:string}): boolean {
  const normalize = (s:string) => s.normalize('NFC').replace(/[\s-]/g, '').toLowerCase();
  const forms = [normalize(word.form), normalize(word.lemma)];
  const stem = normalize(compound.form);
  // Only associate an explicitly annotated compound with a matching form/stem.
  return forms.some(form => form === stem || (form.startsWith(stem) && /^(m|ḥ|s|aḥ|am|ā|āḥ|ām|ena|asya|e|āt|au|ayoḥ|ān|āni|aiḥ|ebhyaḥ|eṣu)$/.test(form.slice(stem.length))));
}

export function sanskritCompoundType(type:string):string {
  const t=type.toLowerCase();
  const kinds:string[]=[];
  if(/bahuvrīhi/.test(t))kinds.push('bahuvrīhiḥ');
  if(/dvandva/.test(t))kinds.push(/itaretara/.test(t)?'itaretara-dvandvaḥ':'dvandvaḥ');
  if(/karmadhāraya|appositional/.test(t))kinds.push('karmadhārayaḥ');
  if(/avyayībhāva/.test(t))kinds.push('avyayībhāvaḥ');
  const dependent=[
    [/ṣaṣṭhī|genitive/,'ṣaṣṭhī-tatpuruṣaḥ'],[/tṛtīyā|instrumental/,'tṛtīyā-tatpuruṣaḥ'],
    [/saptamī|locative/,'saptamī-tatpuruṣaḥ'],[/pañcamī|ablative/,'pañcamī-tatpuruṣaḥ'],
    [/upapada/,'upapada-tatpuruṣaḥ'],
  ] as const;
  for(const [pattern,label] of dependent)if(pattern.test(t))kinds.push(label);
  if(!kinds.length&&/tatpuruṣa/.test(t))kinds.push('tatpuruṣaḥ');
  // A descriptive English relation is not sufficient to assign a formal type.
  return kinds.join(' / ');
}

export function splitCompoundParts(split:string):Array<{form:string;gloss?:string}> {
  return split.split(/\s+\+\s+/).map(part=>{
    const match=part.match(/^(.+?)\s+\(([^()]*)\)$/);
    return match?{form:match[1],gloss:match[2]}:{form:part};
  });
}
