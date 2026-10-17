import json, sys
from pathlib import Path
from PIL import Image,ImageChops

sys.stdout.reconfigure(encoding='utf-8')
build=Path.cwd()/'.build_ppt'/'新版方法分类详解_20261017'
results=[]
for n in range(1,45):
    a=Image.open(build/'previews'/f'slide-{n:02}.png').convert('RGB')
    b=Image.open(build/'previews-import'/f'slide-{n:02}.png').convert('RGB')
    same=a.size==b.size and ImageChops.difference(a,b).getbbox() is None
    results.append({'slide':n,'pixel_identical':same})
(build/'roundtrip-verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
assert all(r['pixel_identical'] for r in results),[r for r in results if not r['pixel_identical']]
print('44页导出后重新导入的渲染与原稿一致。')
