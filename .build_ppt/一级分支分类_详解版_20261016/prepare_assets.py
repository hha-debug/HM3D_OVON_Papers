import json
import sys
from pathlib import Path

import pypdfium2 as pdfium

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path.cwd()
BUILD = ROOT / '.build_ppt' / '一级分支分类_详解版_20261016'
ASSETS = ROOT / 'output' / '一级分支分类PPT' / '详解版资料' / 'assets' / 'figures'
SOURCES = json.loads((BUILD / 'source-pages.json').read_text(encoding='utf-8'))
PAGES = [('omni', 4), ('msg', 4), ('astra', 4), ('frontier', 2), ('ovseg', 4), ('goat', 1)]
CROPS = [
    ('omni', 4, 'omninav_fig1', 1, (110, 77, 507, 285)),
    ('msg', 4, 'msgnav_fig3', 3, (102, 66, 518, 247)),
    ('astra', 4, 'astranav_fig2', 2, (45, 68, 561, 288)),
    ('frontier', 2, 'openfrontier_fig2', 2, (48, 51, 565, 216)),
    ('ovseg', 4, 'ovsegdt_fig2', 2, (314, 106, 574, 312)),
    ('goat', 1, 'goatbench_fig1', 1, (46, 214, 565, 506)),
    ('msg', 6, 'msgnav_fig4', 4, (48, 61, 305, 214)),
]

if __name__ == '__main__':
    (BUILD / 'source-previews').mkdir(exist_ok=True)
    for key, number in PAGES:
        pdf = pdfium.PdfDocument(SOURCES[key]['pdf'])
        page = pdf[number - 1]
        bitmap = page.render(scale=1.5)
        image = bitmap.to_pil()
        image.save(BUILD / 'source-previews' / f'{key}-p{number}.png')
        bitmap.close()
        page.close()
        pdf.close()
        print(f'Rendered {key} p{number}')
    manifest = []
    ASSETS.mkdir(parents=True, exist_ok=True)
    for key, number, name, figure, box in CROPS:
        pdf = pdfium.PdfDocument(SOURCES[key]['pdf'])
        page = pdf[number - 1]
        bitmap = page.render(scale=4)
        image = bitmap.to_pil()
        out = ASSETS / f'{name}.png'
        image.crop(tuple(round(v * 4) for v in box)).save(out)
        manifest.append(dict(id=name, source_pdf=SOURCES[key]['pdf'], pdf_page=number,
                             figure=figure, crop_pt=list(box), image=str(out),
                             use='Original scientific figure, caption separately in slide notes'))
        bitmap.close()
        page.close()
        pdf.close()
        print(f'Extracted {name}')
    (ASSETS.parent.parent / 'asset_manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
