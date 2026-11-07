import { devanagari } from '../lib/sanskrit';
import { sanskritGrammar, compoundMatches, sanskritCompoundType } from '../lib/grammar';

export type Compound = {form:string;split:string;type:string;meaning:string;vigraha?:string;typeSanskrit?:string};

export function GrammarLabels({ grammar }: { grammar:string }) {
  const sanskrit=sanskritGrammar(grammar);
  return <>
    {sanskrit&&<div className="word-grammar-sa"><div lang="sa">{devanagari(sanskrit)}</div><div lang="sa-Latn">{sanskrit}</div></div>}
    <p className="grammar-english">{grammar}</p>
  </>;
}

export function CompoundAnalysis({ compound:c }: {compound:Compound}) {
  const typeSanskrit=c.typeSanskrit||sanskritCompoundType(c.type);
  return <div className="analysis-card compound">
    <strong lang="sa-Latn">{c.form}</strong>
    <div className="compound-type"><b>समासभेदः · Samāsa type</b>{typeSanskrit&&<><div className="vigraha" lang="sa">{devanagari(typeSanskrit)}</div><div lang="sa-Latn">{typeSanskrit}</div></>}<p>{c.type}</p></div>
    {c.vigraha?<><b>समासविग्रहः · Syntactic expansion</b><div className="vigraha" lang="sa">{devanagari(c.vigraha)}</div><div className="vigraha" lang="sa-Latn">{c.vigraha}</div></>:null}
    <b>पदविभागः · Components / earlier analysis</b><span>{c.split}</span>
    <p>{c.meaning}</p>
  </div>;
}

export function WordCompounds({word,compounds}:{word:{form:string;lemma:string};compounds:Compound[]}) {
  const matches=compounds.filter(compound=>compoundMatches(word,compound));
  if(!matches.length)return null;
  return <details className="word-compounds"><summary>समासः · Compound analysis ({matches.length})</summary>{matches.map((compound,index)=><CompoundAnalysis key={index} compound={compound}/>)}</details>;
}
