import type {formatVerse} from '../lib/sanskrit';

type Reading=ReturnType<typeof formatVerse>;
export function VerseText({reading,script,small=false}:{reading:Reading;script:string;small?:boolean}){
  return <div className={small?'verse-text small':'verse-text'}>
    {script!=='iast'&&<p className="devanagari samhita" lang="sa">{reading.lines.map((line,index)=><span className="verse-line" key={index}>{line.devanagari}{' '}<span className="verse-ending">{line.devanagariEnding}</span>{index<reading.lines.length-1?'\n':''}</span>)}</p>}
    {script!=='dev'&&<p className="iast" lang="sa-Latn">{reading.lines.map((line,index)=><span className="verse-line" key={index}>{line.iast}{' '}<span className="verse-ending">{line.iastEnding}</span>{index<reading.lines.length-1?'\n':''}</span>)}</p>}
  </div>;
}
