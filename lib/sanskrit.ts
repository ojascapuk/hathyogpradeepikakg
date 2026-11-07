/** Mechanical script conversion, not editorial correction or morphological parsing. */
const V:Record<string,[string,string]>={a:['अ',''],ā:['आ','ा'],i:['इ','ि'],ī:['ई','ी'],u:['उ','ु'],ū:['ऊ','ू'],ṛ:['ऋ','ृ'],ṝ:['ॠ','ॄ'],ḷ:['ऌ','ॢ'],ḹ:['ॡ','ॣ'],e:['ए','े'],ai:['ऐ','ै'],o:['ओ','ो'],au:['औ','ौ']};
const C:Record<string,string>=Object.fromEntries(['k','kh','g','gh','ṅ','c','ch','j','jh','ñ','ṭ','ṭh','ḍ','ḍh','ṇ','t','th','d','dh','n','p','ph','b','bh','m','y','r','l','v','ś','ṣ','s','h'].map((s,i)=>[s,Array.from('कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')[i]]));
const D:Record<string,string>={'ṃ':'ं','ṁ':'ं','ḥ':'ः',"'":'ऽ','’':'ऽ','/':'।'};
const all=Object.keys({...V,...C,...D}).sort((a,b)=>b.length-a.length);
export function devanagari(input:string){const s=input.toLowerCase().normalize('NFC');let out='',i=0,pending=false;while(i<s.length){const t=all.find(x=>s.startsWith(x,i));if(!t){if(pending){out+='्';pending=false}out+=s[i++];continue}if(C[t]){if(pending)out+='्';out+=C[t];pending=true}else if(V[t]){out+=V[t][pending?1:0];pending=false}else{if(pending){out+='्';pending=false}out+=D[t]}i+=t.length}if(pending)out+='्';return out}

/** A continuous reading form, distinct from the word-separated source witness.
 * Source letters already encode sandhi. Remove editorial compound separators
 * and join consonant-final boundaries before conversion so, for example,
 * yogam āroḍhum becomes योगमारोढुम् rather than योगम् आरोढुम्.
 * This does not conjecture vowel sandhi, emend readings, or renumber verses.
 */
export function formatVerse(iast:string,number:number){
  if(!Number.isInteger(number)||number<1)throw new Error('A positive verse number is required');
  const parts=iast.normalize('NFC').trim().split(/\s*\/\s*/).filter(Boolean);
  const digits=String(number).replace(/\d/g,digit=>'०१२३४५६७८९'[Number(digit)]);
  const lines=parts.map((part,index)=>{
    const text=part.replace(/[-‐‑]\s*/g,'').replace(/\s+/g,' ').trim()
      .replace(/\s+(?=['’])/g,'')
      .replace(/([kgṅcjñṭḍṇtdnpbmyrlvśṣsh])\s+(?=[aāiīuūṛṝḷḹeokgṅcjñṭḍṇtdnpbmyrlvśṣsh])/gu,'$1');
    const last=index===parts.length-1;
    return {iast:text,devanagari:devanagari(text),iastEnding:last?`|| ${number} ||`:'|',devanagariEnding:last?`॥ ${digits} ॥`:'।'};
  });
  return {lines,iast:lines.map(line=>`${line.iast} ${line.iastEnding}`).join('\n'),devanagari:lines.map(line=>`${line.devanagari} ${line.devanagariEnding}`).join('\n')};
}
// Broad, spelling-based segmental aid. No accent, metre, or regional recitation inference.
const IPA:Record<string,string>={a:'ɐ',ā:'aː',i:'i',ī:'iː',u:'u',ū:'uː',ṛ:'r̩',ṝ:'r̩ː',ḷ:'l̩',ḹ:'l̩ː',e:'eː',ai:'ɐi̯',o:'oː',au:'ɐu̯',k:'k',kh:'kʰ',g:'ɡ',gh:'ɡʱ',ṅ:'ŋ',c:'t͡ɕ',ch:'t͡ɕʰ',j:'d͡ʑ',jh:'d͡ʑʱ',ñ:'ɲ',ṭ:'ʈ',ṭh:'ʈʰ',ḍ:'ɖ',ḍh:'ɖʱ',ṇ:'ɳ',t:'t̪',th:'t̪ʰ',d:'d̪',dh:'d̪ʱ',n:'n̪',p:'p',ph:'pʰ',b:'b',bh:'bʱ',m:'m',y:'j',r:'r',l:'l',v:'ʋ',ś:'ɕ',ṣ:'ʂ',s:'s',h:'ɦ',ḥ:'h',ṃ:'̃',ṁ:'̃',"'":'', '’':''};
export function phonetic(input:string){const s=input.toLowerCase().normalize('NFC');let out='',i=0;while(i<s.length){const t=all.find(x=>s.startsWith(x,i));if(t){out+=IPA[t]??t;i+=t.length}else{out+=s[i++];}}return '/'+out+'/' }
