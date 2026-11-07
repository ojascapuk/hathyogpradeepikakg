type V={id:string;chapter:number;number:number;iast:string;devanagari:string};
type C={id:string;title:string;english:string;chapter:number;ranges:number[][];related:string[]};
type A={words:{form:string;lemma:string;meaning:string;grammar:string}[]};
export function knowledgeGraph(verses:V[],concepts:C[],analyses:Record<string,A>){
 const nodes:{id:string;type:string;label:string;[key:string]:unknown}[]=[{id:'book',type:'Text',label:'Haṭhayogapradīpikā',author:'Svātmārāma',edition:'GRETIL reference transcription',scope:'One four-chapter transcription; not every recension or manuscript.'}];
 const edges:{source:string;target:string;relation:string;basis:string}[]=[];
 const add=(source:string,target:string,relation:string,basis:string)=>edges.push({source,target,relation,basis});
 for(let n=1;n<=4;n++){nodes.push({id:`chapter:${n}`,type:'Chapter',label:`Chapter ${n}`});add('book',`chapter:${n}`,'contains','text hierarchy')}
 const forms=new Map<string,string[]>();
 for(const v of verses){const id=`verse:${v.id}`;nodes.push({id,type:'Verse',label:v.id,iast:v.iast,devanagari:v.devanagari,analysisStatus:analyses[v.id]?'editorial draft':'pending'});add(`chapter:${v.chapter}`,id,'contains','text hierarchy');
  const whole=v.iast.replace(/[\/|.,;:!?\d]/g,' ').split(/\s+/).filter(Boolean);const parts=whole.flatMap(s=>s.split('-').filter(Boolean));
  for(const form of new Set([...whole,...parts])){if(!forms.has(form))forms.set(form,[]);forms.get(form)!.push(v.id)}
 }
 for(const c of concepts){const id=`concept:${c.id}`;nodes.push({id,type:'Concept',label:c.title,english:c.english});add(`chapter:${c.chapter}`,id,'organizes','editorial navigation');for(const v of verses)if(c.ranges.some(([ch,s,e])=>v.chapter===ch&&v.number>=s&&v.number<=e))add(id,`verse:${v.id}`,'hasPassage','editorial topic range');for(const target of c.related)add(id,`concept:${target}`,'relatedTo','editorial study association')}
 for(const [form,refs]of forms){const id=`form:${encodeURIComponent(form)}`;nodes.push({id,type:'SourceForm',label:form});for(const ref of refs)add(`verse:${ref}`,id,'attests','exact transcription token or component at an editorial hyphen')}
 for(const [ref,a]of Object.entries(analyses)){a.words.forEach((w,i)=>{const id=`analysis:${ref}:${i}`;nodes.push({id,type:'ParsedWord',label:w.form,lemma:w.lemma,meaning:w.meaning,grammar:w.grammar,status:'editorial draft; context dependent'});add(`verse:${ref}`,id,'analyzedAs','editorial Sanskrit parsing')})}
 return {format:'Pradīpikā typed property graph, version 1',provenance:'Base Sanskrit: GRETIL; concepts and analyses: Study Atlas editorial drafts',nodes,edges};
}
