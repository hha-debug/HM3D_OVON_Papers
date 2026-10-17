import json, hashlib, zipfile, posixpath, shutil
from pathlib import Path
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[2]
build=Path(__file__).resolve().parent
source=root/'output/一级分支分类PPT/一级分支分类_新版方法详解_20261017.pptx'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
def relationships(z,p):
 rp=posixpath.join(posixpath.dirname(p),'_rels',posixpath.basename(p)+'.rels')
 return {r.attrib['Id']:posixpath.normpath(posixpath.join(posixpath.dirname(p),r.attrib['Target'])) for r in ET.fromstring(z.read(rp)) if r.attrib.get('TargetMode')!='External'}
with zipfile.ZipFile(source) as z:
 pr=ET.fromstring(z.read('ppt/presentation.xml')); rels=relationships(z,'ppt/presentation.xml')
 slides=[]
 for i,n in enumerate(pr.find('p:sldIdLst',ns),1):
  part=rels[n.attrib['{'+ns['r']+'}id']]; x=ET.fromstring(z.read(part)); rr=relationships(z,part)
  text=[''.join(p.itertext()) for p in []]
  text=[''.join(t.text or '' for t in p.findall('.//a:t',ns)) for p in x.findall('.//a:p',ns)]
  images=[]
  for j,pic in enumerate(x.findall('.//p:pic',ns)):
   blip=pic.find('.//a:blip',ns)
   if blip is None: continue
   rid=blip.attrib.get('{'+ns['r']+'}embed'); img=rr[rid]
   f=build/f'slide{i:02d}-image{j+1}{Path(img).suffix}'; f.write_bytes(z.read(img))
   images.append({'rid':rid,'part':img,'file':str(f)})
  notespart=next((v for v in rr.values() if '/notesSlides/notesSlide' in v),None)
  notes='\n'.join(t.text or '' for t in ET.fromstring(z.read(notespart)).findall('.//a:t',ns)) if notespart else ''
  slides.append({'number':i,'part':part,'texts':text,'images':images,'notes_part':notespart,'notes':notes})
 info={'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'slides':slides,'size_emu':pr.find('p:sldSz',ns).attrib}
 (build/'source-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
 shutil.copyfile(source,build/'original-before-edit.pptx')
 for s in slides:
  print(f"PAGE {s['number']:02d} IMAGES {len(s['images'])}: "+' / '.join(s['texts']))
