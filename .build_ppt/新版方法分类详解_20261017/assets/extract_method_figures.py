from pathlib import Path
import json
import sys
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
SOURCES = [
    dict(id='d3d', pdf='04_三维空间表征与目标推理/2026_CVPR_D3D-VLP.pdf', page=3, figure='Figure 2', bbox=(50,67,560,228)),
    dict(id='softnav', pdf='04_三维空间表征与目标推理/2607.14586v1.pdf', page=3, figure='Figure 2', bbox=(92,58,515,325)),
    dict(id='janusvln', pdf='05_视觉语言动作决策与视频记忆/ICLR-2026-janusvln-decoupling-semantics-and-spatiality-with-dual-implicit-memory-for-vision-language-navigation-Paper-Conference.pdf', page=5, figure='Figure 2', bbox=(104,78,507,303)),
]

def render(item, scale):
    doc = pdfium.PdfDocument(str(ROOT / item['pdf']))
    page = doc[item['page']-1]
    img = page.render(scale=scale).to_pil()
    size_pt = page.get_size()
    page.close()
    doc.close()
    return img, size_pt

def main():
    mode = sys.argv[1] if len(sys.argv)>1 else 'preview'
    OUT.mkdir(parents=True, exist_ok=True)
    manifest=[]
    for item in SOURCES:
        if mode == 'preview':
            img, _=render(item,1.5)
            path=OUT/f"preview_{item['id']}_p{item['page']}.png"
            img.save(path)
            print(path)
        else:
            img,size_pt=render(item,4.0)
            bbox=item['bbox']
            if bbox is None:
                raise ValueError(f"Crop not configured: {item['id']}")
            box_px=tuple(round(v*4) for v in bbox)
            cropped=img.crop(box_px)
            path=OUT/f"{item['id']}_fig2_method.png"
            cropped.save(path)
            manifest.append(dict(asset=str(path),source_pdf=str(ROOT/item['pdf']),pdf_page_1_based=item['page'],figure=item['figure'],panel='full figure',render_scale=4,dpi=288,page_size_points=list(size_pt),crop_coordinates_points_top_left=list(bbox),crop_coordinates_pixels_top_left=list(box_px),size_pixels=list(cropped.size),crop_qa='pass: full page preview followed by individual view_image inspection on 2026-10-17',preserved='All method labels, arrows, legends, input/output labels and small safety margin.',omitted='Surrounding body text and figure caption only.',slide_placement='Use full width; keep dense original labels readable. D3D particularly needs approximately 11-12 inches width on a 16:9 slide. SoftNav and JanusVLN need approximately 8-9 inches width with concise annotations outside the figure.',notes='JanusVLN image reflects paper design; speaker notes should distinguish public evaluation replay on Qwen side from cross-step VGGT KV cache.' if item['id']=='janusvln' else 'Original figure content unchanged.'))
            print(path)
    if mode!='preview':
        (OUT/'method-figure-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':
    main()
