import locations from './source-locations.json' with {type:'json'};

export type VerseReference={id:string;chapter:number;iast:string;devanagari:string;english?:string;englishNumber?:string;translationAuthor?:string};
export const normalizeSearch=(text:string)=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'–—-]/g,'').trim();

export function searchVerses<T extends VerseReference>(verses:T[],analyses:Record<string,{translation:string}>,query:string,readings?:Record<string,{iast:string;devanagari:string}>):T[]{
  const q=normalizeSearch(query);
  if(!q)return [];
  const reference=q.replace(/[०-९]/g,digit=>String('०१२३४५६७८९'.indexOf(digit))).match(/^(?:(?:verse|hyp)\s*)?([1-4])\s*[.:/]\s*(\d{1,3})$/);
  if(reference)return verses.filter(verse=>verse.id===`${Number(reference[1])}.${Number(reference[2])}`);
  return verses.filter(verse=>normalizeSearch([verse.iast,verse.devanagari,verse.english||'',analyses[verse.id]?.translation||'',readings?.[verse.id]?.iast||'',readings?.[verse.id]?.devanagari||''].join(' ')).includes(q));
}

export function sourceLinks(verse:VerseReference){
  const textFragment=(text:string)=>'#:~:text='+encodeURIComponent(text);
  const links=[{label:`GRETIL · verse ${verse.id}`,url:'https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm'+textFragment(`// HYP_${verse.id} //`)}];
  const comparison=(locations.sanskritDocumentsText as Record<string,string>)[verse.id];
  if(comparison)links.push({label:`Sanskrit Documents · verse ${verse.id}`,url:'https://sanskritdocuments.org/doc_yoga/hyp.html'+textFragment(comparison)});
  if(verse.englishNumber){
    const numbers=verse.englishNumber.split(',');
    const anchors=(locations.sinhAnchors as Record<string,Record<string,string>>)[String(verse.chapter)];
    const used=new Set<string>();
    for(const number of numbers){
      const anchor=anchors[number];
      const fragment=anchor?'#'+encodeURIComponent(anchor):textFragment((verse.english||'').split(/\s+/).slice(0,12).join(' '));
      if(used.has(fragment))continue;used.add(fragment);
      links.push({label:`Pancham Sinh · English ${number}`,url:`https://spiritmaji.com/sacredtext/hin/hyp/hyp0${verse.chapter+2}.htm${fragment}`});
    }
  }
  return links;
}
