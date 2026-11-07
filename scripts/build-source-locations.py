import json,re
from pathlib import Path
from bs4 import BeautifulSoup
import argparse
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Build source fragment targets from preserved chapter snapshots.')
parser.add_argument('--source-dir',type=Path,required=True)
snapshot=parser.parse_args().source_dir
anchors={}
for ch in range(1,5):
 soup=BeautifulSoup((snapshot/f'sinh{ch}.html').read_text(),'html.parser');rows={}
 for a in soup.find_all('a',attrs={'name':True}):
  name=a['name']
  if not re.fullmatch(r'\d+(?:[.\s\d–-]|and)*',name):continue
  numbers=re.findall(r'\d+',name)
  for n in numbers:rows.setdefault(n,name)
 anchors[str(ch)]=rows
soup=BeautifulSoup((snapshot/'hyp.html').read_text(),'html.parser');lines=soup.select_one('#content').get_text('\n').splitlines();ch=0;buf=[];secondary={};digits=str.maketrans('०१२३४५६७८९','0123456789')
for line in lines:
 line=line.strip()
 if not line:continue
 head=re.match(r'^॥\s*([१-४])॥\s*(?:प्रथम|द्वितीय|तृतीय|चतुर्थ)',line)
 if head:ch=int(head[1].translate(digits));buf=[];continue
 if not ch or line.startswith(('##','Input by','Converted to','इति हठ','तथा हि गोरक्ष')):continue
 end=re.search(r'॥\s*([०-९]+)॥',line)
 if (line.startswith('अथ ') and not end) or line in ['तत्र धौतिः','इति नादानुसन्धानम्']:continue
 if end:
  buf.append(line[:end.start()]);secondary[f'{ch}.{int(end[1].translate(digits))}']=' '.join(' '.join(buf).split());buf=[]
 else:buf.append(line)
assert len(secondary)==392,len(secondary)
(root/'lib/source-locations.json').write_text(json.dumps({'sinhAnchors':anchors,'sanskritDocumentsText':secondary},ensure_ascii=False,indent=2)+'\n')
