import fs from 'node:fs';
const directory=new URL('../lib/',import.meta.url);
const merged={};
for(const name of ['annotations.json','annotations-12.json','annotations-3.json','annotations-4.json']){
 const path=new URL(name,directory);if(!fs.existsSync(path))continue;
 const data=JSON.parse(fs.readFileSync(path,'utf8'));for(const[id,a]of Object.entries(data)){if(merged[id]&&JSON.stringify(merged[id])!==JSON.stringify(a))throw new Error(`Conflicting annotation ${id}`);merged[id]=a;}
}
const sorted=Object.fromEntries(Object.entries(merged).sort(([a],[b])=>{const ac=a.split('.').map(Number),bc=b.split('.').map(Number);return ac[0]-bc[0]||ac[1]-bc[1]}));
const target=new URL('study-annotations.json',directory),temporary=new URL('study-annotations.tmp',directory);
fs.writeFileSync(temporary,JSON.stringify(sorted,null,2));fs.renameSync(temporary,target);
console.log(JSON.stringify({annotatedVerses:Object.keys(sorted).length,wordEntries:Object.values(sorted).reduce((n,a)=>n+a.words.length,0)}));
