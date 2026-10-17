import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile
from xml.etree import ElementTree as ET
from PIL import Image,ImageChops

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path.cwd()
BUILD=ROOT/'.build_ppt'/'一级分支分类_性能数据_20261016'
SOURCE=ROOT/'output'/'一级分支分类PPT'/'一级分支分类_先方法后算力_20261016.pptx'
CANDIDATE=BUILD/'candidate.pptx'
FINAL=ROOT/'output'/'一级分支分类PPT'/'一级分支分类_含各方向性能对比_20261016.pptx'
TOOLS=Path('C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations/container_tools')
mapping=json.loads((BUILD/'mapping.json').read_text(encoding='utf-8'))
tables=json.loads((BUILD/'native-table-slides.json').read_text(encoding='utf-8'))
commands=[
 ('package',[str(TOOLS/'inspect_presentation_package_integrity.py'),str(CANDIDATE),'--fail-on-findings']),
 ('layout',[str(TOOLS/'inspect_presentation_layout_geometry.py'),str(CANDIDATE),'--fail-on-findings','--expected-slide-size-emu','12192000,6858000','--expected-slide-count','34','--required-default-font-family','Microsoft YaHei','--validate-bullet-geometry','--validate-heading-fit',*sum((['--require-native-table-slide',str(n)] for n in tables),[])]),
 ('table-arithmetic',[str(TOOLS/'native_table_arithmetic_gate.py'),str(CANDIDATE)]),
 ('chart-titles',[str(TOOLS/'native_chart_title_gate.py'),str(CANDIDATE)]),
 ('quantitative-charts',[str(TOOLS/'native_quantitative_chart_gate.py'),str(CANDIDATE),'--discover-chart-slides']),
 ('nature-audit',['D:/Codex/skills/nature-paper2ppt/scripts/audit_pptx_quality.py',str(CANDIDATE),'--report',str(BUILD/'nature-audit.md'),'--json',str(BUILD/'nature-audit.json'),'--fail-on','high']),
]
results=[]
for name,args in commands:
    p=subprocess.run([sys.executable,*args],env=dict(os.environ,PYTHONIOENCODING='utf-8'),capture_output=True,encoding='utf-8')
    results.append(dict(name=name,exit_code=p.returncode,stdout=p.stdout,stderr=p.stderr))
    print(name,p.returncode)
(BUILD/'validator-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
if any(r['exit_code'] for r in results):raise RuntimeError('Required validator failed')

roundtrip=[]
for i in range(1,35):
    a=Image.open(BUILD/'previews'/f'slide-{i:02}.png').convert('RGB')
    b=Image.open(BUILD/'previews-import'/f'slide-{i:02}.png').convert('RGB')
    same=a.size==b.size and ImageChops.difference(a,b).getbbox() is None
    roundtrip.append(dict(slide=i,pixel_identical=same))
if not all(c['pixel_identical'] for c in roundtrip):raise RuntimeError('Roundtrip changed layout')
retained=[]
for m in mapping:
    if m['replaced']:continue
    a=Image.open(ROOT/'.build_ppt'/'一级分支分类_先方法后算力_20261016'/'previews'/f"slide-{m['old']:02}.png").convert('RGB')
    b=Image.open(BUILD/'previews-import'/f"slide-{m['new']:02}.png").convert('RGB')
    diff=ImageChops.difference(a,b)
    diff.paste((0,0,0),(1155,674,1220,710))
    if m['old']==1:diff.paste((0,0,0),(80,370,1120,445))
    same=diff.getbbox() is None
    retained.append(dict(old=m['old'],new=m['new'],unchanged_except_authorized_labels=same))
if not all(c['unchanged_except_authorized_labels'] for c in retained):
    (BUILD/'retention-diffs.json').write_text(json.dumps(retained,indent=2),encoding='utf-8')
    raise RuntimeError('Unintended change to an existing slide')

curated=json.loads((BUILD/'curated-results.json').read_text(encoding='utf-8'))
for r in curated['records']:
    if r['sr'] is not None and not 0<=r['sr']<=100:raise RuntimeError('Invalid SR')
    if r['spl'] is not None and not 0<=r['spl']<=r['sr']:raise RuntimeError('Invalid SPL')
    if not Path(r['source_pdf']).is_file():raise RuntimeError('Missing primary source')

NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
with zipfile.ZipFile(CANDIDATE) as z:
    def xmltext(n):return ''.join(ET.fromstring(z.read(f'ppt/slides/slide{n}.xml')).itertext())
    for n,expected in [(3,'系统组织架构'),(9,'环境表征'),(14,'历史记忆'),(18,'探索与目标搜索'),(21,'策略训练与优化'),(28,'训练 GPU 配置'),(34,'训练算力统计口径')]:
        if expected not in xmltext(n):raise RuntimeError(f'Unexpected content at {n}')
    for n in [3,9,14,18,21]:
        if 'SR' not in xmltext(n) or 'SPL' not in xmltext(n):raise RuntimeError('Missing introduction data')
    notes=[n for n in z.namelist() if n.startswith('ppt/notesSlides/notesSlide') and n.endswith('.xml')]
    media=[n for n in z.namelist() if n.startswith('ppt/media/') and not n.endswith('/')]
    if len(notes)!=34 or len(media)!=7:raise RuntimeError('Lost notes or figures')
    table_count=sum(len(ET.fromstring(z.read(f'ppt/slides/slide{i}.xml')).findall('.//a:tbl',NS)) for i in range(1,35))
    if table_count!=25:raise RuntimeError('Unexpected native table count')

sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source_hash=sha(SOURCE)
if not str(FINAL.absolute()).lower().startswith(str(ROOT.absolute()).lower()+os.sep):raise RuntimeError('Unexpected output path')
if CANDIDATE.is_symlink() or FINAL.parent.is_symlink():raise RuntimeError('Unexpected symlink')
with CANDIDATE.open('rb') as src,FINAL.open('xb') as dst:shutil.copyfileobj(src,dst)
if sha(FINAL)!=sha(CANDIDATE) or sha(SOURCE)!=source_hash:raise RuntimeError('Hash verification failed')
receipt=dict(final_path=str(FINAL),sha256=sha(FINAL),bytes=FINAL.stat().st_size,slide_count=34,
             reviewed_papers=14,curated_records=71,notes=34,figures=7,native_tables=25,
             scope=curated['policy'],roundtrip=roundtrip,retained_slides=retained,
             finalization='Packaged validators, first-party import/render, exclusive copy and SHA-256; Windows sandbox realpath unavailable',
             native_powerpoint_opened=False)
(BUILD/'publication-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
support=FINAL.parent/'性能对比版资料'
support.mkdir(exist_ok=True)
qa='''# 性能对比版检查记录

- 输出34页，五个方向介绍页包含SR/SPL摘要，7页列出不同benchmark及划分。算力部分位于最后7页。
- 范围按用户确认，限已收录14篇方法论文。审阅正文和所需附录，整理71条候选结果。
- 原论文方法图7幅均保留，原生可编辑表格25个，讲稿备注34页。
- 每组SR/SPL取自同一论文同一配置。SG3D明确s-SR/t-SR，SuperNav的SPL从0–1转为百分制，未报告项使用“—”。
- SuperNav子集与改编任务单列，SoftNav/MSGNav GOAT评测规模及AstraNav成功距离阈值均保留说明。CompassNav HM3D表1/表2设置分列，不自行推断v1/v2。
- 首轮视觉检查发现多行表格挤占脚注、左栏长句和CompassNav名称断行，已通过缩短标签、调整行高与明确换行修正。新增和改动页面逐页渲染检查，保留页与原版比较。
- 最终检查：34页PPTX往返导入渲染一致，22页原有页面除页码与封面副标题外保持一致。结构、字体、页面几何、原生表格及图像保留检查通过。
- nature-paper2ppt审计high=0、medium=0，封面有4条原有3 pt近似对齐的低等级提示，按原样保留。
- 无新提取论文图像，复用原有7幅及其来源。所有性能表均为原生对象，逐项来源写入讲稿备注。
- 使用bundled Artifact Tool验证和渲染，未在桌面PowerPoint中打开。标准finalizer的realpath在当前Windows沙箱不可用，使用同一套打包校验器、导入渲染、SHA-256与不覆盖复制完成输出。
'''
(support/'qa_report.md').write_text(qa,encoding='utf-8')
print(json.dumps({k:receipt[k] for k in ['final_path','slide_count','bytes','native_tables']},ensure_ascii=False))
