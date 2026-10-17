import hashlib,json,os,shutil,sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path.cwd()
BUILD=ROOT/'.build_ppt'/'新版方法分类详解_20261017'
SOURCE=ROOT/'output'/'一级分支分类PPT'/'一级分支分类_含各方向性能对比_20261016.pptx'
CANDIDATE=BUILD/'candidate.pptx'
FINAL=ROOT/'output'/'一级分支分类PPT'/'一级分支分类_新版方法详解_20261017.pptx'
checks=json.loads((BUILD/'validator-results.json').read_text(encoding='utf-8'))
assert all(r['exit_code']==0 for r in checks)
roundtrip=json.loads((BUILD/'roundtrip-verification.json').read_text(encoding='utf-8'))
assert len(roundtrip)==44 and all(r['pixel_identical'] for r in roundtrip)
content=json.loads((BUILD/'content-check.json').read_text(encoding='utf-8'))
assert content['slides']==44 and content['notes']==44 and content['method_categories']==8
assert os.path.commonpath([os.path.abspath(ROOT),os.path.abspath(FINAL)])==os.path.abspath(ROOT)
assert CANDIDATE.is_file() and not CANDIDATE.is_symlink() and not FINAL.parent.is_symlink()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source_sha=sha(SOURCE)
FINAL.parent.mkdir(exist_ok=True)
with CANDIDATE.open('rb') as src,FINAL.open('xb') as dst:
    shutil.copyfileobj(src,dst)
assert sha(CANDIDATE)==sha(FINAL)
assert sha(SOURCE)==source_sha
receipt={'final_path':str(FINAL),'sha256':sha(FINAL),'bytes':FINAL.stat().st_size,**content,
         'reviewed_papers':14,'source_preserved':True,'source_sha256':source_sha,
         'font_policy':{'basis':'reference','families':['Microsoft YaHei','微软雅黑'],'same_family_aliases':True},
         'validation':'Bundled integrity/layout/native-table/chart validators, nature audit, first-party PPTX import and all-slide render, exclusive copy with SHA256. Standard finalizer realpath is unavailable in Windows sandbox.',
         'native_powerpoint_opened':False}
(BUILD/'publication-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
qa='''# 新版方法分类详解PPT检查记录

- 依照最新版《一级分支分类.md》：五个方向、八类方法范式，文献作为类内实现。
- 输出44页。八类方法均含机制说明及代表论文解读，全部页面提供讲稿备注与来源。
- 方法与评测在前，训练算力从第38页开始。五张方向介绍页保留SR/SPL概览，七张完整结果页保留原有数据与协议说明。
- 10幅嵌入原论文方法图或任务图、27个原生可编辑表格。SoftNav图2拆成编码接口与融合决策两页，全部图中标签均保留。
- 首轮发现：SoftNav全图小标签难读、分类表孤字换行、AstraNav标题截断、CompassNav表格与底部说明贴近。均已修复并重新渲染检查。
- 第3页可见区补充OmniNav的1 m成功判据与SG3D给定真实计划设置。SoftNav/MSGNav GOAT评测规模差异、各论文阈值、SuperNav单独协议、SG3D s/t-SR均保留。
- JanusVLN明确区分论文双记忆设计与公开评测：语义历史重放、VGGT几何分支跨步KV缓存。
- 逐页视觉检查完成。最终结构、字体、页面几何、原生表格与图表检查通过。Nature XML审计high=0、medium=0、low=0。
- 44页导出后重新导入，逐页渲染与生成稿像素一致。使用bundled Artifact Tool检查，未在桌面PowerPoint打开。
- 标准finalizer因Windows沙箱realpath返回EPERM，采用同一组打包校验器、首方导入渲染、SHA256及不覆盖复制完成发布。最终输出与候选稿字节一致，旧PPT保留。
'''
(BUILD/'qa_report.md').write_text(qa,encoding='utf-8')
print(json.dumps({'final_path':str(FINAL),'slide_count':44,'bytes':FINAL.stat().st_size,'sha256':sha(FINAL)},ensure_ascii=False))
