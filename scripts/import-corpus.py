from bs4 import BeautifulSoup
import re,json,unicodedata,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Import the named GRETIL and Sinh snapshots without changing their Sanskrit readings.')
parser.add_argument('--source-dir',type=Path,default=ROOT.parent)
parser.add_argument('--output',type=Path,default=ROOT/'lib/corpus.json')
args=parser.parse_args()
WORK=args.source_dir
SOURCE='https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm'
# Transliteration preserves the source's spaces, compound hyphens and line breaks.
# Consonants receive a virama unless followed by a vowel token.
V={'a':('अ',''),'ā':('आ','ा'),'i':('इ','ि'),'ī':('ई','ी'),'u':('उ','ु'),'ū':('ऊ','ू'),'ṛ':('ऋ','ृ'),'ṝ':('ॠ','ॄ'),'ḷ':('ऌ','ॢ'),'ḹ':('ॡ','ॣ'),'e':('ए','े'),'ai':('ऐ','ै'),'o':('ओ','ो'),'au':('औ','ौ')}
C=dict(zip(['k','kh','g','gh','ṅ','c','ch','j','jh','ñ','ṭ','ṭh','ḍ','ḍh','ṇ','t','th','d','dh','n','p','ph','b','bh','m','y','r','l','v','ś','ṣ','s','h'],list('कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')))
D={'ṃ':'ं','ṁ':'ं','ḥ':'ः',"'":'ऽ','/':'।'}
TOK=sorted(list(V)+list(C)+list(D),key=len,reverse=True)
def deva(s):
 out=[];i=0;pending=False
 s=unicodedata.normalize('NFC',s)
 while i<len(s):
  tok=next((x for x in TOK if s.startswith(x,i)),None)
  if tok is None:
   if pending:out.append('्');pending=False
   out.append(s[i]);i+=1;continue
  if tok in C:
   if pending:out.append('्')
   out.append(C[tok]);pending=True
  elif tok in V:
   out.append(V[tok][1 if pending else 0]);pending=False
  else:
   if pending:out.append('्');pending=False
   out.append(D[tok])
  i+=len(tok)
 if pending:out.append('्')
 return ''.join(out)
soup=BeautifulSoup((WORK/'gretil.html').read_text(),'html.parser')
lines=[x.strip() for x in soup.get_text('\n').splitlines() if x.strip()]
lines=lines[lines.index('prathamopadeśaḥ')+1:]
verses=[];buf=[];section='Opening invocation'
for line in lines:
 if line.startswith('atha ') and 'HYP_' not in line:
  section=line.removesuffix('-').strip();continue
 if line.startswith('iti haṭha') or line=='iti nādānusandhānam' or line=='tatra dhautiḥ-' or re.match(r'^\([1-4]\)$',line) or re.match(r'^(prathamo|dvitīyo|tṛtīyo|caturtho)padeśaḥ',line) or line.startswith('tathā hi gorakṣa-vacanam'):continue
 m=re.search(r'// HYP_(\d+)\.(\d+) //',line)
 if m:
  ch,n=map(int,m.groups());clean=line[:m.start()].strip();buf.append(clean)
  iast='\n'.join(buf);buf=[]
  iast=re.sub(r'\s*// HYP_\d+\.\s*(?=\n)', '  /', iast)
  verses.append(dict(id=f'{ch}.{n}',chapter=ch,number=n,iast=iast,devanagari=deva(iast),section=section,english='',englishNumber='',translationNote='',sourceNotes=[],sourceUrl=SOURCE,translationSource=f'https://spiritmaji.com/sacredtext/hin/hyp/hyp0{ch+2}.htm'))
 else:
  if not re.match(r'^caturthopadeśaḥ|^dvitīyopadeśaḥ|^tṛtīyopadeśaḥ',line):buf.append(line)
byid={x['id']:x for x in verses}
translations={}
for ch in range(1,5):
 soup=BeautifulSoup((WORK/f'sinh{ch}.html').read_text(),'html.parser');pending=[];entries=[]
 for pi,p in enumerate(soup.find_all('p')):
  if ch==2 and 179<=pi<207:continue
  t=p.get_text(' ',strip=True)
  isgreen=bool(p.find('font',attrs={'color':re.compile('^green$',re.I)})) and (bool(re.search(r'\|\s*\d',t)) or bool(re.match('[\u0900-\u097f]',t)))
  if isgreen:
   pending=[];continue
  if not t or re.match(r'^p\. \d+|^Click to enlarge|^Next:',t):continue
  # The verse translation ends with the English edition's marginal number.
  m=re.search(r'\s(\d+(?:\s*(?:and|[-–])\s*\d+)?)\.?$',t)
  if m:
   ns=[int(x) for x in re.findall(r'\d+',m[1])]
   text=t[:m.start()].strip()
   if pending:text=' '.join(pending+[text])
   pending=[]
   if any(x.startswith(('Note','NḄ','N.B.','Translation:')) for x in [text]):continue
   entries.append((ns,text))
  else:pending.append(t)
 # Some mirror paragraphs are duplicated verbatim (notably English III.107).
 translations[ch]=list(dict.fromkeys((tuple(ns),text) for ns,text in entries))
# Explicit crosswalk for this historical edition. Sanskrit and English numbers diverge.
def targets(ch,ns):
 n=ns[0]
 if ch==1:
  if len(ns)>1:return ns
  if n==57:return [56,57]
  if n==58:return [57,58]
  if n==62:return [62,63]
  if n>=63:return [n+1]
  return [n]
 if ch==2:return ns
 if ch==3:
  if n<=42:return ns
  if 43<=n<=89:return [n+1]
  if 90<=n<=96:return [n+2]
  if 97<=n<=123:return [n+7]
  return []
 if ch==4:return [x+(1 if x>=33 else 0) for x in ns]
for ch,entries in translations.items():
 for ns,text in entries:
  if ch==2 and ns[0]<=21 and text.startswith(('In a clean spot','Having extolled','Salutation to the Lord','Before Kumbhaka','Sipping a little','Such as','With composed','This has been spoken','He should practise mudrâs','He should resign','The bath should','Yogîs should','Some like camphor','After taking food','In the evening','Evening sandhyâ','Viparîta Karṇi')):continue
  for n in targets(ch,ns):
   key=f'{ch}.{n}'
   if key not in byid:continue
   v=byid[key]
   if v['english']:v['english']+=' '+text
   else:v['english']=text
   v['englishNumber']=','.join(dict.fromkeys(v['englishNumber'].split(',')+list(map(str,ns)))).strip(',')
   if n not in ns or len(targets(ch,ns))>1:v['translationNote']='English and Sanskrit numbering/segmentation differ in the Sinh digitization; the translation is cross-referenced by content. A shared translation may cover more than one verse.'
# Flag transcription anomalies, preserving the imported text verbatim.
notes={'1.16':'Source reads tattva-jñānāś; expected sandhi in context is tattva-jñānāc (tattva-jñānāt + ca). No silent correction has been made.', '1.34':'Source reads śabavad; the expected reading is śavavad (śava-vat, like a corpse). The diplomatic source spelling is retained.', '2.68':'Source reads yogīndrāṇī̀am, an anomalous form with a combining grave accent; compare yogīndrāṇām. The source spelling is preserved.', '2.2':'A stray incomplete HYP_2. reference label in the source has been removed from the verse display.', '2.1':'Source reads dṛdhe; expected dṛḍhe. The diplomatic source spelling is retained.', '4.114':'The GRETIL transcription reads vidur in the second pāda; compare editions reading binduḥ. The Sinh digitization omits the first pāda in its romanized display; GRETIL preserves it.'}
for k,n in notes.items():byid[k]['sourceNotes'].append(n)
# Original literal study renderings for verses omitted from the historical English edition.
original={
 '3.43':"Even when bindu has moved and reached the region of the yoni, held by yoni-mudrā and drawn by śakti it moves upward.",
 '3.91':"One should similarly preserve a menstruating woman's rajas and one's own bindu; one skilled in correct practice should draw it upward by means of the penis.",
 '3.99':"If a woman, through proficiency in correct practice, draws in a man's bindu and preserves her rajas by vajrolī, she too is a yoginī.",
 '3.100':"None of her rajas is lost—there is no doubt. In her body, nāda itself becomes bindu.",
 '3.101':"That bindu and that rajas, becoming one within the body, bestow every accomplishment through the practice of vajrolī.",
 '3.102':"She who preserves rajas upward by contraction is indeed a yoginī. She knows past and future, and surely becomes khecarī.",
 '3.103':"She also obtains bodily perfection through the practice of vajrolī. This meritorious yoga grants liberation even when enjoyment has been experienced.",
}
for key,value in original.items():
 v=byid[key];v['english']=value;v['englishNumber']='';v['translationNote']='Original literal study rendering; this verse has no corresponding translation in the imported Sinh English text. Technical terms retain their Sanskrit forms. Not independently reviewed.';v['translationAuthor']='Study Atlas editorial rendering (unreviewed)'
byid['4.19']['english']='The Vâyu should be made to enter the Suṣumnâ without restraint by him who has practised the control of breathing and has awakened the Kuṇḍali by the (gastric) fire.'
byid['4.19']['englishNumber']='19'
byid['4.33']['translationNote']='No corresponding English translation occurs in the imported Sinh text. The Sanskrit of this verse requires textual and syntactic review; an uncertain translation has not been supplied.'
byid['3.48']['sourceNotes'].append('The imported English digitization prints गी for the word discussed. The Sanskrit reads go (गो); this appears to be a digitization error in the translation.')
for v in verses:
 v.setdefault('translationAuthor','Pancham Sinh (1914/1915 digitized edition)')
 # Strip imported English subsection headings when they precede a translation.
 v['english']=re.sub(r'^The Uḍḍiyâna Bandha \. ', '', v['english'])
 v['english']=re.sub(r'^The Mûla Bandha \. ', '', v['english'])
# Curatorial notes are kept separately so re-importing cannot erase them.
curation_path=ROOT/'lib/curation.json'
if curation_path.exists():
 for key,entry in json.loads(curation_path.read_text()).get('verses',{}).items():
  byid[key]['sourceNotes'].extend(entry.get('notes',[]))
args.output.write_text(json.dumps(verses,ensure_ascii=False,indent=2))
print('Counts',len(verses),{c:sum(v['chapter']==c for v in verses) for c in range(1,5)})
print('Missing translations',[v['id'] for v in verses if not v['english']])
print('First',verses[0])
