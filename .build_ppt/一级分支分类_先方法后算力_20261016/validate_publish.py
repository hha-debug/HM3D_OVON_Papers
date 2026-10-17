import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile
from xml.etree import ElementTree as ET
from PIL import Image, ImageChops

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path.cwd()
BUILD = ROOT/'.build_ppt'/'一级分支分类_先方法后算力_20261016'
SOURCE = ROOT/'output'/'一级分支分类PPT'/'一级分支分类_方法详解版_20261016.pptx'
CANDIDATE = BUILD/'candidate.pptx'
FINAL = ROOT/'output'/'一级分支分类PPT'/'一级分支分类_先方法后算力_20261016.pptx'
TOOLS = Path('C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations/container_tools')
mapping = json.loads((BUILD/'mapping.json').read_text(encoding='utf-8'))
tables = json.loads((BUILD/'native-table-slides.json').read_text(encoding='utf-8'))
commands = [
 ('package',[str(TOOLS/'inspect_presentation_package_integrity.py'),str(CANDIDATE),'--fail-on-findings']),
 ('layout',[str(TOOLS/'inspect_presentation_layout_geometry.py'),str(CANDIDATE),'--fail-on-findings',
             '--expected-slide-size-emu','12192000,6858000','--expected-slide-count','27',
             '--required-default-font-family','Microsoft YaHei','--validate-bullet-geometry','--validate-heading-fit',
             *sum((['--require-native-table-slide',str(n)] for n in tables),[])]),
 ('table-arithmetic',[str(TOOLS/'native_table_arithmetic_gate.py'),str(CANDIDATE)]),
 ('chart-titles',[str(TOOLS/'native_chart_title_gate.py'),str(CANDIDATE)]),
 ('quantitative-charts',[str(TOOLS/'native_quantitative_chart_gate.py'),str(CANDIDATE),'--discover-chart-slides']),
]
results=[]
for name,args in commands:
    p=subprocess.run([sys.executable,*args],env=dict(os.environ,PYTHONIOENCODING='utf-8'),capture_output=True,encoding='utf-8')
    results.append(dict(name=name,exit_code=p.returncode,stdout=p.stdout,stderr=p.stderr))
    print(name,p.returncode)
(BUILD/'validator-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
if any(r['exit_code'] for r in results):
    raise RuntimeError('A required validator did not pass')

# Check each slide against its former position. Only the page marker, cover
# subtitle, and the obsolete page-reference footer are authorized text changes.
comparisons=[]
for m in mapping:
    old=ROOT/'.build_ppt'/'一级分支分类_详解版_20261016'/'previews-import'/f"slide-{m['old']:02}.png"
    new=BUILD/'previews'/f"slide-{m['new']:02}.png"
    a,b=Image.open(old).convert('RGB'),Image.open(new).convert('RGB')
    if a.size!=b.size:
        raise RuntimeError('Slide dimensions changed')
    diff=ImageChops.difference(a,b)
    # Page-number position is constant throughout the deck.
    diff.paste((0,0,0),(1155,674,1220,710))
    if m['old']==1:
        diff.paste((0,0,0),(80,370,1100,445))
    if m['old']==27:
        diff.paste((0,0,0),(65,675,1140,710))
    identical=diff.getbbox() is None
    comparisons.append(dict(old=m['old'],new=m['new'],unchanged_except_authorized_text=identical))
if not all(c['unchanged_except_authorized_text'] for c in comparisons):
    (BUILD/'visual-comparison.json').write_text(json.dumps(comparisons,indent=2),encoding='utf-8')
    raise RuntimeError('Unintended visual change')

NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
with zipfile.ZipFile(CANDIDATE) as z:
    # The section boundary starts with detailed architecture on slide 3,
    # and the training GPU tables start at slide 21.
    def content(n):
        return ''.join(ET.fromstring(z.read(f'ppt/slides/slide{n}.xml')).itertext())
    for n,expected in [(3,'系统组织架构的设计空间'),(20,'五个方向的贡献位置'),(21,'训练 GPU 配置'),(27,'训练算力统计口径')]:
        if expected not in content(n):
            raise RuntimeError(f'Unexpected section boundary at slide {n}')
    slide_notes=[n for n in z.namelist() if n.startswith('ppt/notesSlides/notesSlide') and n.endswith('.xml')]
    media=[n for n in z.namelist() if n.startswith('ppt/media/') and not n.endswith('/')]
    if len(slide_notes)!=27 or len(media)!=7:
        raise RuntimeError('Notes or figures were lost')

sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source_hash=sha(SOURCE)
if not str(FINAL.absolute()).lower().startswith(str(ROOT.absolute()).lower()+os.sep):
    raise RuntimeError('Unexpected output path')
if CANDIDATE.is_symlink() or FINAL.parent.is_symlink():
    raise RuntimeError('Unexpected symlink')
# Exclusive creation preserves the prior version.
with CANDIDATE.open('rb') as src,FINAL.open('xb') as dst:
    shutil.copyfileobj(src,dst)
if sha(FINAL)!=sha(CANDIDATE) or sha(SOURCE)!=source_hash:
    raise RuntimeError('Hash verification failed')
receipt=dict(final_path=str(FINAL),sha256=sha(FINAL),bytes=FINAL.stat().st_size,slide_count=27,
             method_pages=[3,20],compute_pages=[21,27],notes=27,figures=7,
             source_preserved=True,visual_comparisons=comparisons,
             finalization='Packaged validators + first-party reimport/render + no-overwrite copy; realpath unavailable in Windows sandbox')
(BUILD/'publication-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:receipt[k] for k in ['final_path','slide_count','bytes']},ensure_ascii=False))
