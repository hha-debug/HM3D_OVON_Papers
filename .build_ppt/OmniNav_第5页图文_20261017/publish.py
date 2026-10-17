import hashlib
import json
import os
import shutil
import zipfile
from pathlib import Path

build = Path(__file__).resolve().parent
info = json.loads((build / 'source-info.json').read_text(encoding='utf-8-sig'))
source = Path(info['source'])
final = source.with_name('一级分支分类_新版方法详解_第5页图文版_20261017.pptx')
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert digest(source) == info['sha256'], 'Original changed since editing; do not overwrite.'
assert digest(final) == 'e1168b92dc4ffc59b1583b6ad905dd4a0b8c11713a4167669120e6e4806ef09b'
with zipfile.ZipFile(source) as old, zipfile.ZipFile(final) as new:
    assert set(old.namelist()) == set(new.namelist())
    changed = [n for n in old.namelist() if old.read(n) != new.read(n)]
    assert set(changed) == {info['slide_part'], info['notes_part']}, changed
stage = build / 'ready-to-replace.pptx'
shutil.copyfile(final, stage)
try:
    os.replace(stage, source)
    assert digest(source) == digest(final)
    delivered = source
    status = 'original_updated'
except PermissionError:
    delivered = final
    status = 'original_locked_revision_available'
receipt = {'status': status, 'delivered': str(delivered), 'sha256': digest(delivered), 'changed_parts': changed}
(build / 'publication-receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(receipt, ensure_ascii=False))
