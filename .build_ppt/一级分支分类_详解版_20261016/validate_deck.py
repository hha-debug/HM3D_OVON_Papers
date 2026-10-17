import json
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageChops

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path.cwd()
BUILD = ROOT / '.build_ppt' / '一级分支分类_详解版_20261016'
PPTX = BUILD / 'candidate.pptx'
TOOLS = Path('C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations/container_tools')
env = dict(os.environ, PYTHONIOENCODING='utf-8')
native_tables = [3,4,5,6,7,8,9,10,12,16,18,19,21,24,25,27]
commands = [
    ('package', [str(TOOLS/'inspect_presentation_package_integrity.py'), str(PPTX), '--fail-on-findings']),
    ('layout', [str(TOOLS/'inspect_presentation_layout_geometry.py'), str(PPTX), '--fail-on-findings',
                '--expected-slide-size-emu', '12192000,6858000', '--expected-slide-count', '27',
                '--required-default-font-family', 'Microsoft YaHei', '--validate-bullet-geometry', '--validate-heading-fit',
                *sum((['--require-native-table-slide', str(n)] for n in native_tables), [])]),
    ('table-arithmetic', [str(TOOLS/'native_table_arithmetic_gate.py'), str(PPTX)]),
    ('chart-titles', [str(TOOLS/'native_chart_title_gate.py'), str(PPTX)]),
    ('quantitative-charts', [str(TOOLS/'native_quantitative_chart_gate.py'), str(PPTX), '--discover-chart-slides']),
    ('nature-audit', ['D:/Codex/skills/nature-paper2ppt/scripts/audit_pptx_quality.py', str(PPTX),
                      '--report', str(BUILD/'nature-audit.md'), '--json', str(BUILD/'nature-audit.json'), '--fail-on', 'high']),
]
results = []
for name, args in commands:
    p = subprocess.run([sys.executable, *args], env=env, encoding='utf-8', capture_output=True)
    results.append(dict(name=name, exit_code=p.returncode, output=p.stdout, error=p.stderr, args=args))
    print(name, p.returncode, p.stdout[:2200], p.stderr[:500])

comparison = []
for i in range(1,10):
    old = ROOT / '.build_ppt' / '一级分支分类_20261016' / 'previews-import' / f'slide-{i:02}.png'
    new = BUILD / 'previews' / f'slide-{i:02}.png'
    a, b = Image.open(old).convert('RGBA'), Image.open(new).convert('RGBA')
    equal = a.size == b.size and ImageChops.difference(a,b).getbbox() is None
    comparison.append(dict(slide=i, pixel_identical=equal))
    print('Original slide', i, 'pixel identical', equal)
data = dict(validators=results, original_slides=comparison)
(BUILD/'validator-results.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
if any(r['exit_code'] != 0 for r in results) or not all(x['pixel_identical'] for x in comparison):
    sys.exit(1)
