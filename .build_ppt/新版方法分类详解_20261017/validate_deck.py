import json, os, subprocess, sys, zipfile, posixpath, hashlib
from pathlib import Path
from xml.etree import ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path.cwd()
BUILD=ROOT/'.build_ppt'/'新版方法分类详解_20261017'
CANDIDATE=BUILD/'candidate.pptx'
TOOLS=Path('C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations/container_tools')
tables=json.loads((BUILD/'native-table-slides.json').read_text(encoding='utf-8'))
commands=[
 ('package',[str(TOOLS/'inspect_presentation_package_integrity.py'),str(CANDIDATE),'--fail-on-findings']),
 ('layout',[str(TOOLS/'inspect_presentation_layout_geometry.py'),str(CANDIDATE),'--fail-on-findings','--expected-slide-size-emu','12192000,6858000','--expected-slide-count','44','--approved-font-family','Microsoft YaHei','--approved-font-family','微软雅黑','--validate-bullet-geometry','--validate-heading-fit',*sum((['--require-native-table-slide',str(n)] for n in tables),[])]),
 ('table-arithmetic',[str(TOOLS/'native_table_arithmetic_gate.py'),str(CANDIDATE)]),
 ('chart-titles',[str(TOOLS/'native_chart_title_gate.py'),str(CANDIDATE)]),
 ('quantitative-charts',[str(TOOLS/'native_quantitative_chart_gate.py'),str(CANDIDATE),'--discover-chart-slides']),
 ('nature-audit',['D:/Codex/skills/nature-paper2ppt/scripts/audit_pptx_quality.py',str(CANDIDATE),'--report',str(BUILD/'nature-audit.md'),'--json',str(BUILD/'nature-audit.json'),'--fail-on','high']),
]
results=[]
for name,args in commands:
    proc=subprocess.run([sys.executable,*args],env=dict(os.environ,PYTHONIOENCODING='utf-8'),capture_output=True,encoding='utf-8')
    results.append(dict(name=name,exit_code=proc.returncode,stdout=proc.stdout,stderr=proc.stderr))
    print(name,proc.returncode)
(BUILD/'validator-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')

NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
R='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
with zipfile.ZipFile(CANDIDATE) as z:
    pe=ET.fromstring(z.read('ppt/presentation.xml'))
    rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
    parts=[posixpath.normpath(target.lstrip('/') if target.startswith('/') else 'ppt/'+target) for s in pe.find('p:sldIdLst',NS) for target in [rels[s.attrib[R+'id']]]]
    slides=[ET.fromstring(z.read(part)) for part in parts]
    txt=[''.join(e.itertext()) for e in slides]
    assert len(slides)==44
    for n,label in [(3,'系统组织架构'),(12,'环境表征'),(20,'历史记忆'),(26,'探索与目标搜索'),(30,'导航策略训练与优化')]:
        assert label in txt[n-1] and 'SR' in txt[n-1] and 'SPL' in txt[n-1], (n,label)
    for label in ['分层与模块化协作','多能力统一联合建模','显式地图与场景结构','学习式连续空间特征','观察历史的压缩与重放','递归状态与缓存更新','语义引导的前沿搜索','模仿学习与强化学习结合']:
        assert any(label in text for text in txt),label
    assert '训练 GPU 配置' in txt[37]
    assert '训练算力统计口径' in txt[43]
    notes=[part for part in z.namelist() if part.startswith('ppt/notesSlides/notesSlide') and part.endswith('.xml')]
    assert len(notes)==44
    for part in notes:
        note=''.join(ET.fromstring(z.read(part)).itertext())
        assert len(note)>80,part
    image_count=len([part for part in z.namelist() if part.startswith('ppt/media/') and not part.endswith('/')])
    table_count=sum(len(e.findall('.//a:tbl',NS)) for e in slides)
    print('content',json.dumps({'slides':44,'notes':len(notes),'media':image_count,'tables':table_count},ensure_ascii=False))
    (BUILD/'content-check.json').write_text(json.dumps({'slides':44,'notes':len(notes),'media':image_count,'tables':table_count,'method_categories':8,'intro_slides':[3,12,20,26,30],'compute_starts':38},ensure_ascii=False,indent=2),encoding='utf-8')
if any(r['exit_code'] for r in results):
    for r in results:
        if r['exit_code']:
            try:
                details=json.loads(r['stdout'])
                print(r['name'],json.dumps({k:v for k,v in details.items() if k!='findings'},ensure_ascii=False),json.dumps(details.get('findings',[])[:6],ensure_ascii=False))
            except Exception: print(r['name'],r['stdout'][:2000],r['stderr'][:1000])
    raise RuntimeError('Required validator failed')
