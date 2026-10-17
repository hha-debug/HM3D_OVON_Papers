from pathlib import Path
import re
import json
import pdfplumber

root = Path.cwd()
papers = {
    'omni': '05_视觉语言动作决策与视频记忆/2026_ICLR_OmniNav.pdf',
    'msg': '04_三维空间表征与目标推理/2026_CVPR_MSGNav.pdf',
    'astra': '05_视觉语言动作决策与视频记忆/2026_CVPR_AstraNav-Memory.pdf',
    'frontier': '02_语义地图与前沿探索/2026_RSS_OpenFrontier.pdf',
    'ovseg': '01_模仿学习与强化学习导航/2026_CVPR_OVSegDT.pdf',
    'goat': '00_数据集与任务基准/2024_CVPR_GOAT_Bench.pdf',
}
records = {}
for key, relative in papers.items():
    entries = []
    with pdfplumber.open(root / relative) as pdf:
        for index, page in enumerate(pdf.pages[:8]):
            text = page.extract_text() or ''
            captions = []
            for match in re.finditer(r'(?:Figure|Fig\.)\s*[1234][\s:.-]', text):
                captions.append(text[match.start():match.start()+230].replace('\n', ' '))
            print(json.dumps({'paper': key, 'page': index+1, 'size': [page.width,page.height], 'captions': captions}, ensure_ascii=False))
            entries.append({'page': index+1, 'width':page.width,'height':page.height,'text':text})
    records[key] = {'pdf': str(root / relative), 'pages': entries}
(root / '.build_ppt/一级分支分类_详解版_20261016/source-pages.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
