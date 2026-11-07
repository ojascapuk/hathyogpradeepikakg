'use client';
import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {grammarGlossary,wikipediaReference} from '../lib/glossary';
import {normalizeSearch} from '../lib/reading';
import {VerseSources} from './verse-sources';
import type {VerseReference} from '../lib/reading';

type Concept={id:string;title:string;devanagari:string;english:string;description:string;ranges:number[][]};
export function Glossary({concepts,verses,onOpenVerse}:{concepts:Concept[];verses:VerseReference[];onOpenVerse:(id:string)=>void}){
  const [query,setQuery]=useState('');
  const match=(text:string)=>normalizeSearch(text).includes(normalizeSearch(query));
  const selected=concepts.filter(c=>match([c.title,c.devanagari,c.english,c.description].join(' '))).sort((a,b)=>a.title.localeCompare(b.title));
  const grammar=grammarGlossary.filter(entry=>match([entry.term,entry.sanskrit,entry.meaning].join(' ')));
  return <section className="glossary"><label className="glossary-filter">Find a term<input className="lex-filter" aria-label="Filter glossary" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try prāṇa, samāsa, or समाधि…"/></label>
    <p className="prose">{selected.length} text topics · {grammar.length} grammar terms. Verse links open the passage; source and Wikipedia links open the named reference.</p>
    <div className="glossary-grid">{selected.map(concept=>{
      const passages=verses.filter(v=>concept.ranges.some(([ch,start,end])=>v.chapter===ch&&Number(v.id.split('.')[1])>=start&&Number(v.id.split('.')[1])<=end));
      const wiki=wikipediaReference(concept.id);
      return <article className="glossary-entry" id={'term-'+concept.id} key={concept.id}><h2 lang="sa">{concept.devanagari}</h2><h3>{concept.title}</h3><p className="glossary-meaning">{concept.english}</p><p>{concept.description}</p><a className="text-link" target="_blank" rel="noreferrer" href={wiki.url}>Wikipedia · {wiki.title}<ArrowUpRight size={16}/></a><h4>PASSAGES</h4><div className="ref-grid">{passages.map(v=><button key={v.id} onClick={()=>onOpenVerse(v.id)} aria-label={`Read verse ${v.id}`}>{v.id}</button>)}</div>{passages[0]&&<details><summary>Text sources for this entry</summary><VerseSources verse={passages[0]}/></details>}</article>;
    })}</div>
    {grammar.length>0&&<><h2 className="glossary-section-title">Grammar & reading</h2><div className="glossary-grid">{grammar.map(entry=><article className="glossary-entry" key={entry.term}><h2 lang="sa">{entry.sanskrit}</h2><h3>{entry.term}</h3><p>{entry.meaning}</p><a className="text-link" href={wikipediaReference('grammar').url} target="_blank" rel="noreferrer">Wikipedia · Sanskrit grammar<ArrowUpRight size={16}/></a></article>)}</div></>}
    {!selected.length&&!grammar.length&&<p className="empty">No glossary terms match this search.</p>}
  </section>;
}
