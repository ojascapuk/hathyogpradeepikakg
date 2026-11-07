import fs from 'node:fs';
const directory=new URL('../lib/',import.meta.url);
const merged={};
for(const name of ['annotations.json','annotations-12.json','annotations-3.json','annotations-4.json']){
 const path=new URL(name,directory);if(!fs.existsSync(path))continue;
 const data=JSON.parse(fs.readFileSync(path,'utf8'));for(const[id,a]of Object.entries(data)){if(merged[id]&&JSON.stringify(merged[id])!==JSON.stringify(a))throw new Error(`Conflicting annotation ${id}`);merged[id]=a;}
}
const sorted=Object.fromEntries(Object.entries(merged).sort(([a],[b])=>{const ac=a.split('.').map(Number),bc=b.split('.').map(Number);return ac[0]-bc[0]||ac[1]-bc[1]}));
const corpus=JSON.parse(fs.readFileSync(new URL('corpus.json',directory),'utf8'));
const curation=JSON.parse(fs.readFileSync(new URL('curation.json',directory),'utf8'));
for(const verse of corpus){
 const annotation=sorted[verse.id];
 if(!annotation)continue;
 // Chapter 3 was seeded from the historical import. Preserve that attribution
 // even when import cleanup removes a duplicated paragraph or section heading.
 if(verse.chapter===3 && verse.number>=4){
  annotation.translation=verse.english;
  annotation.translationAuthor=verse.translationAuthor;
 }else annotation.translationAuthor='Study Atlas editorial rendering (unreviewed)';
 const correction=curation.verses[verse.id];
 if(correction?.draftTranslation){
  annotation.translation=correction.draftTranslation;
  annotation.translationAuthor='Study Atlas editorial rendering (unreviewed)';
 }
}
const target=new URL('study-annotations.json',directory),temporary=new URL('study-annotations.tmp',directory);
fs.writeFileSync(temporary,JSON.stringify(sorted,null,2));fs.renameSync(temporary,target);
console.log(JSON.stringify({annotatedVerses:Object.keys(sorted).length,wordEntries:Object.values(sorted).reduce((n,a)=>n+a.words.length,0)}));
