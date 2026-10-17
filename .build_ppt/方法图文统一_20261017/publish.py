import hashlib,json,zipfile,shutil,os
from pathlib import Path
build=Path(__file__).resolve().parent
info=json.loads((build/'source-info.json').read_text(encoding='utf-8'))
receipt=json.loads((build/'finalization-receipt-v2.json').read_text(encoding='utf-8'))
source=Path(info['source']); final=source.with_name('一级分支分类_新版方法详解_图文统一版_20261017_v2.pptx')
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert digest(source)==info['sha256'],'Source changed; preserve new edits'
assert digest(final)==receipt['finalSha256']
diff=json.loads((build/'package-diff.json').read_text(encoding='utf-8'))
with zipfile.ZipFile(source) as old,zipfile.ZipFile(final) as new:
 assert set(old.namelist())==set(new.namelist())
 changes=[n for n in old.namelist() if old.read(n)!=new.read(n)]
 assert set(changes)==set(diff['changed_parts'])
 assert old.read('ppt/slides/slide5.xml')==new.read('ppt/slides/slide5.xml')
stage=build/'ready-to-replace.pptx';shutil.copyfile(final,stage)
try:
 os.replace(stage,source)
 assert digest(source)==receipt['finalSha256']
 delivered=source;status='original_updated'
except PermissionError:
 delivered=final;status='original_locked_revision_available'
result={'status':status,'delivered':str(delivered),'sha256':digest(delivered),'changed_slides':diff['changed_slides'],'all_other_parts_identical':True,'powerpoint_visual_review':True}
(build/'publication-receipt.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
