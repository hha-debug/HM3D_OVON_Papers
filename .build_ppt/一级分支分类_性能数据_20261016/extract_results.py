import json
import re
import sys
from pathlib import Path
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')
root=Path.cwd()
build=root/'.build_ppt'/'一级分支分类_性能数据_20261016'
manifest=json.loads((root/'方法分类清单.json').read_text(encoding='utf-8'))
papers={}
for p in manifest['papers']:
    if p['id'] in ['hm3dsem','ovon','goat','sg3d']:
        continue
    rel=Path(*Path(p['pdf']).parts[1:])
    f=root/rel
    result_pages=[]
    with pdfplumber.open(f) as pdf:
        for i,page in enumerate(pdf.pages):
            text=page.extract_text() or ''
            compact=re.sub(r'\s+','',text)
            if 'SPL' in text and (re.search(r'Table\d|TABLE[IVX\d]',compact,re.I) or re.search(r'\d\.\d',text)):
                result_pages.append(dict(page=i+1,text=text))
    papers[p['id']]=dict(paper=p['paper'],pdf=str(f),pages=result_pages)
    print(p['id'],[p['page'] for p in result_pages])
(build/'result-pages.json').write_text(json.dumps(papers,ensure_ascii=False,indent=2),encoding='utf-8')
