"""Reproduce source comparisons from downloaded snapshots; never edits the corpus.

Requires BeautifulSoup (python3-bs4). See scripts/CORPUS-REPORT.md for inputs.
Modern English translations and apparatus are neither extracted nor republished.
"""
from bs4 import BeautifulSoup
from pathlib import Path
import argparse, hashlib, json, re, subprocess, sys, tempfile, unicodedata, difflib
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--source-dir',type=Path,required=True)
parser.add_argument('--output',type=Path,default=ROOT/'lib/corpus-audit.json')
parser.add_argument('--date',default='2026-11-07')
args=parser.parse_args();src=args.source_dir
corpus=json.loads((ROOT/'lib/corpus.json').read_text())
curation=json.loads((ROOT/'lib/curation.json').read_text())
def norm(s):return re.sub(r"[\s/|.\-’'।॥]",'',unicodedata.normalize('NFC',s))
def digest(data):return hashlib.sha256(data).hexdigest()
with tempfile.TemporaryDirectory() as temp:
 output=Path(temp)/'corpus.json'
 subprocess.run([sys.executable,str(ROOT/'scripts/import-corpus.py'),'--source-dir',str(src),'--output',str(output)],check=True,stdout=subprocess.DEVNULL)
 rebuilt=json.loads(output.read_text())
assert len(corpus)==len(rebuilt)==392
rebuilt={v['id']:v for v in rebuilt}
mp={'R^i':'ṛ','R^I':'ṝ','L^i':'ḷ','L^I':'ḹ','RRi':'ṛ','RRI':'ṝ','chCh':'cch','Ch':'ch','ch':'c','sh':'ś','Sh':'ṣ','~N':'ṅ','~n':'ñ','A':'ā','I':'ī','U':'ū','N':'ṇ','T':'ṭ','D':'ḍ','M':'ṃ','H':'ḥ','.a':"'",'.h':'','\\-':'-'}
rx=re.compile('|'.join(re.escape(x) for x in sorted(mp,key=len,reverse=True)))
def iast(s):return rx.sub(lambda m:mp[m[0]],s)
h={};buf=[];ch=0
for line in (src/'hyp.itx').read_text().splitlines():
 m=re.match(r'\|\| ([1-4])\|\| .*opadeshaH',line)
 if m:ch=int(m[1]);buf=[];continue
 if not ch or (line.startswith('atha ') and not re.search(r'\|\|\s*\d+\|\|',line)) or line.startswith(('\\','%','#','iti haTha','tathA hi gorakSha')) or line in ['iti nAdAnusandhAnam','tatra dhautiH']:continue
 m=re.search(r'\|\|\s*(\d+)\|\|',line)
 if m:
  buf.append(line[:m.start()]);h[f'{ch}.{int(m[1])}']=iast('\n'.join(buf));buf=[]
 else:buf.append(line)

assert len(h)==392, f'Unexpected Sanskrit Documents record count: {len(h)}'
modern={}
soup=BeautifulSoup((src/'oxford.html').read_text(),'html.parser')
for unit in soup.select('.vers-wrap.hp'):
 title=unit.select_one('.vers-title');latin=unit.select_one('.vers-latin')
 if title is None or latin is None:continue
 for fn in latin.select('.fn'):fn.decompose()
 modern[title['id']]=norm(latin.get_text('',strip=False))
assert len(modern)>300, 'Critical-edition Sanskrit could not be parsed'
def grams(s):return {s[i:i+3] for i in range(max(0,len(s)-2))}
modern_grams={ref:grams(t) for ref,t in modern.items()}
records=[]
for verse in corpus:
 id=verse['id'];expected=rebuilt[id]
 # Compare all imported fields, including complete historical reference lists.
 assert verse==expected, f'{id}: checked-in corpus differs from reconstructed import'
 a=norm(verse['iast']);b=norm(h[id]);changes=[]
 for op,i,j,k,l in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
  if op!='equal':changes.append({'base':a[i:j],'comparison':b[k:l]})
 ga=grams(a)
 candidates=[ref for ref in modern if ref.startswith(f"hp0{verse['chapter']}_") or (verse['chapter']==4 and ref.startswith('hpx4_'))]
 candidates=sorted(candidates,key=lambda ref:len(ga & modern_grams[ref])/max(1,len(ga | modern_grams[ref])),reverse=True)[:12]
 scores=sorted([(difflib.SequenceMatcher(None,a,modern[ref],autojunk=False).ratio(),ref) for ref in candidates],reverse=True)
 score=scores[0][0];refs=[ref for n,ref in scores if n>=score-.001] if score>=.70 else []
 records.append({'id':id,'gretilImport':'matches','sanskritDocuments':'differs' if changes else 'matches-normalized','sanskritDocumentsDifferences':changes,'historicalEnglishNumbers':verse['englishNumber'],'translationAuthor':verse['translationAuthor'],'historicalImport':'matches-rebuilt-import' if verse['englishNumber'] else 'absent' if not verse['english'] else 'editorial-supplement','criticalEdition':{'status':'candidate-requires-review' if refs else 'unresolved','candidateReferences':refs,'similarity':round(score,3)},'curatorialNotes':id in curation['verses']})
files=['gretil.html','hyp.itx','sinh1.html','sinh2.html','sinh3.html','sinh4.html','oxford.html']
report={'date':args.date,'method':'Full-record re-import comparison; normalized Sanskrit comparison; similarity-based critical-edition candidate discovery. No claim of full philological or translation certification.','normalization':'NFC; ignore spaces, line breaks, compound hyphens, apostrophes and verse punctuation. Do not normalize letters or accents.','sourceDependence':'GRETIL, Sanskrit Documents and the Sinh Sanskrit digitization share distinctive errors. They must not be counted as three independent manuscript witnesses.','sources':{'gretil':'https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm','sanskritDocuments':'https://sanskritdocuments.org/doc_yoga/hyp.itx','historical':'https://spiritmaji.com/sacredtext/hin/hyp/','criticalEdition':'https://yoga.ames.ox.ac.uk/hp/reader/edition/'},'snapshotSha256':{name:digest((src/name).read_bytes()) for name in files},'corpusSha256':digest((ROOT/'lib/corpus.json').read_bytes()),'summary':{'verses':len(records),'gretilImportMatches':len(records),'sanskritDocumentsMatches':sum(r['sanskritDocuments']=='matches-normalized' for r in records),'sanskritDocumentsDifferences':sum(r['sanskritDocuments']=='differs' for r in records),'historicalTranslationRecords':sum(bool(v['englishNumber']) for v in corpus),'editorialSupplements':sum(bool(v['english']) and not v['englishNumber'] for v in corpus),'missingHistorical':sum(not bool(v['english']) for v in corpus),'curatedPassages':len(curation['verses']),'draftCorrections':sum('draftTranslation' in v for v in curation['verses'].values()),'criticalEditionUnresolved':sum(not r['criticalEdition']['candidateReferences'] for r in records)},'verses':records}
args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report['summary'],indent=2))
