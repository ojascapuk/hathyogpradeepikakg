// Related encyclopedia articles are named explicitly, including broader articles
// where this atlas's editorial topic is not an independent encyclopedia entry.
const articles:Record<string,{title:string;slug:string}>={
  asana:{title:'Asana',slug:'Asana'},prana:{title:'Pranayama',slug:'Pranayama'},
  diet:{title:'Mitahara',slug:'Mitahara'},cleansings:{title:'Shatkarma',slug:'Shatkarma'},
  dhauti:{title:'Shatkarma',slug:'Shatkarma'},basti:{title:'Shatkarma',slug:'Shatkarma'},
  neti:{title:'Neti (Hatha Yoga)',slug:'Neti_(Hatha_Yoga)'},trataka:{title:'Shatkarma',slug:'Shatkarma'},
  nauli:{title:'Shatkarma',slug:'Shatkarma'},kapalabhati:{title:'Shatkarma',slug:'Shatkarma'},
  kumbhaka:{title:'Kumbhaka',slug:'Kumbhaka'},kevala:{title:'Kumbhaka',slug:'Kumbhaka'},
  bhastrika:{title:'Bhastrika',slug:'Bhastrika'},bhramari:{title:'Pranayama',slug:'Pranayama'},
  suryabheda:{title:'Pranayama',slug:'Pranayama'},ujjayi:{title:'Pranayama',slug:'Pranayama'},
  cooling:{title:'Pranayama',slug:'Pranayama'},murccha:{title:'Pranayama',slug:'Pranayama'},plavini:{title:'Pranayama',slug:'Pranayama'},
  kundalini:{title:'Kundalini',slug:'Kundalini'},sakticalana:{title:'Kundalini',slug:'Kundalini'},granthi:{title:'Kundalini',slug:'Kundalini'},
  mudra:{title:'Mudra',slug:'Mudra'},mahamudra:{title:'Mudra',slug:'Mudra'},mahavedha:{title:'Mudra',slug:'Mudra'},
  khecari:{title:'Khecarī mudrā',slug:'Khecarī_mudrā'},
  mula:{title:'Bandha (yoga)',slug:'Bandha_(yoga)'},uddiyana:{title:'Bandha (yoga)',slug:'Bandha_(yoga)'},
  jalandhara:{title:'Bandha (yoga)',slug:'Bandha_(yoga)'},bandhas:{title:'Bandha (yoga)',slug:'Bandha_(yoga)'},mahabandha:{title:'Bandha (yoga)',slug:'Bandha_(yoga)'},
  samadhi:{title:'Samadhi',slug:'Samadhi'},unmani:{title:'Samadhi',slug:'Samadhi'},liberation:{title:'Samadhi',slug:'Samadhi'},
  nadis:{title:'Nadi (yoga)',slug:'Nadi_(yoga)'},susumna:{title:'Nadi (yoga)',slug:'Nadi_(yoga)'},
  lineage:{title:'Guru–shishya tradition',slug:'Guru–shishya_tradition'},ethics:{title:'Yamas',slug:'Yamas'},
  nada:{title:'Nāda yoga',slug:'Nāda_yoga'},sounds:{title:'Nāda yoga',slug:'Nāda_yoga'},metaphors:{title:'Nāda yoga',slug:'Nāda_yoga'},silence:{title:'Nāda yoga',slug:'Nāda_yoga'},
  mind:{title:'Prana',slug:'Prana'},
  grammar:{title:'Sanskrit grammar',slug:'Sanskrit_grammar'},
};
for(const id of ['seats','balances','matsyendra','pascima','mayura','sava','siddha','padma','simha','bhadra'])articles[id]=articles.asana;

export function wikipediaReference(id:string){
  const article=articles[id]||{title:'Hatha Yoga Pradipika',slug:'Hatha_Yoga_Pradipika'};
  return {title:article.title,url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(article.slug)};
}

export const grammarGlossary=[
  {term:'Padaccheda',sanskrit:'पदच्छेदः',meaning:'Separation of a joined Sanskrit passage into its constituent words.'},
  {term:'Sandhi',sanskrit:'सन्धिः',meaning:'Sound changes at the meeting of sounds, within words or across word boundaries.'},
  {term:'Samāsa',sanskrit:'समासः',meaning:'A compound combining nominal members into a single grammatical expression.'},
  {term:'Vigraha',sanskrit:'विग्रहः',meaning:'A phrase expanding the grammatical relationship between the members of a compound.'},
  {term:'Anvaya',sanskrit:'अन्वयः',meaning:'An interpretive prose arrangement showing how the words of a passage connect.'},
  {term:'Vibhakti',sanskrit:'विभक्तिः',meaning:'A case ending expressing a word’s grammatical relation. The nominative is prathamā, accusative dvitīyā, instrumental tṛtīyā, dative caturthī, ablative pañcamī, genitive ṣaṣṭhī, and locative saptamī.'},
  {term:'Vacana',sanskrit:'वचनम्',meaning:'Grammatical number: ekavacana is singular, dvivacana dual, and bahuvacana plural.'},
  {term:'Liṅga',sanskrit:'लिङ्गम्',meaning:'Grammatical gender: masculine, feminine, or neuter. This grammatical use differs from other uses of liṅga in the text.'},
  {term:'Puruṣa',sanskrit:'पुरुषः',meaning:'Grammatical person. Prathamapuruṣa corresponds to English third person, madhyamapuruṣa to second, and uttamapuruṣa to first.'},
  {term:'Tatpuruṣa',sanskrit:'तत्पुरुषः',meaning:'A dependent compound in which the earlier member is related to the final member, often by a case relation.'},
  {term:'Karmadhāraya',sanskrit:'कर्मधारयः',meaning:'A descriptive or appositional compound whose members refer to the same thing.'},
  {term:'Bahuvrīhi',sanskrit:'बहुव्रीहिः',meaning:'A compound describing an external referent, such as “one whose body is straight”.'},
  {term:'Dvandva',sanskrit:'द्वन्द्वः',meaning:'A coordinative compound joining members in an “and” relationship.'},
  {term:'Avyaya',sanskrit:'अव्ययम्',meaning:'An indeclinable word whose form does not vary with case, number, or gender.'},
];
