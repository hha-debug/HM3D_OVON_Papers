from pathlib import Path
import json,re,sys
import pypdfium2 as pdfium

sys.stdout.reconfigure(encoding='utf-8')
root=Path.cwd()
build=root/'.build_research'/'benchmark_compute_20261017'
build.mkdir(parents=True,exist_ok=True)
data=json.loads((root/'.build_ppt'/'一级分支分类_性能数据_20261016'/'curated-results.json').read_text(encoding='utf-8'))
paths=sorted({Path(r['source_pdf']) for r in data['records']}|set((root/'00_数据集与任务基准').glob('*.pdf')))
pat=re.compile(r'GPU|NVIDIA|RTX|wall.clock|latency|runtime|\bFPS\b|\bHz\b|\b\d+(?:\.\d+)?\s*(?:seconds?|hours?|days?|ms|GB)\b',re.I)
out=[]
for source in paths:
    pdf=pdfium.PdfDocument(source)
    matches=[]
    for pi in range(len(pdf)):
        page=pdf[pi];tp=page.get_textpage();txt=tp.get_text_range();lines=txt.splitlines()
        hit=[]
        for i,line in enumerate(lines):
            if pat.search(line):
                block=' '.join(lines[max(0,i-2):min(len(lines),i+4)])
                if block not in hit:hit.append(block)
        if hit: matches.append({'page':pi+1,'blocks':hit})
        tp.close();page.close()
    pdf.close()
    out.append({'source':str(source),'matches':matches})
(build/'local-compute-evidence.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
for record in out:
    if '00_数据集' not in record['source']:continue
    print('\nSOURCE',Path(record['source']).name)
    for page in record['matches']:
        for block in page['blocks']:print('page',page['page'],block[:650])
print('\nScanned',len(out),'PDFs. Full evidence saved privately.')
