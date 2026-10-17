from pathlib import Path
from xml.etree import ElementTree as ET
from PIL import Image, ImageOps, ImageDraw
import json, zipfile, sys, posixpath

sys.stdout.reconfigure(encoding='utf-8')
root = Path.cwd()
build = root / '.build_ppt' / '新版方法分类详解_20261017'
build.mkdir(parents=True, exist_ok=True)
source = root / 'output' / '一级分支分类PPT' / '一级分支分类_含各方向性能对比_20261016.pptx'
ns = {'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
slides = []
with zipfile.ZipFile(source) as z:
    pe=ET.fromstring(z.read('ppt/presentation.xml'))
    rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
    slide_paths=[posixpath.normpath('ppt/'+rels[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]) for s in pe.find('p:sldIdLst',ns)]
    for n,slide_path in enumerate(slide_paths,1):
        e=ET.fromstring(z.read(slide_path))
        texts=[''.join(t.itertext()) for t in e.findall('.//a:t',ns)]
        slides.append({'n':n,'part':slide_path,'title':next((t for t in texts if not t.isdigit()),''),'texts':texts})
    print('size', ET.fromstring(z.read('ppt/presentation.xml')).find('p:sldSz',ns).attrib)
(build/'reference-slides.json').write_text(json.dumps(slides,ensure_ascii=False,indent=2),encoding='utf-8')
for s in slides: print(s['n'],s['title'])
previews=build/'reference-previews'
for start in range(1,len(slides)+1,6):
    canvas=Image.new('RGB',(1440,588),'#dde3e8')
    draw=ImageDraw.Draw(canvas)
    for i,n in enumerate(range(start,min(start+6,len(slides)+1))):
        im=Image.open(previews/f'slide-{n:02}.png').convert('RGB')
        im.thumbnail((476,268))
        x=(i%3)*480+2;y=(i//3)*294+22
        canvas.paste(im,(x,y));draw.text((x,y-18),str(n),fill='black')
    canvas.save(build/f'reference-contact-{start:02}.png')
