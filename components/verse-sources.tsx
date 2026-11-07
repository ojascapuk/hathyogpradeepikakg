import {ArrowUpRight} from 'lucide-react';
import {sourceLinks} from '../lib/reading';
import type {VerseReference} from '../lib/reading';
import curation from '../lib/curation.json';

export function VerseSources({verse}:{verse:VerseReference}){
  const critical=(curation.verses as Record<string,{sources:string[]}>)[verse.id]?.sources.filter(url=>url.includes('ox.ac.uk')&&url.includes('#'))||[];
  return <div className="source-note verse-sources"><h4>TEXT & TRANSLATION SOURCES · {verse.id}</h4>
    <p>{verse.translationAuthor?.replace(' (unreviewed)','')}</p>
    {sourceLinks(verse).map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight size={16}/></a>)}
    {critical.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">Critical edition · related passage<ArrowUpRight size={16}/></a>)}
  </div>;
}
