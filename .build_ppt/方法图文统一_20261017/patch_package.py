import hashlib,json,zipfile,copy,posixpath
from pathlib import Path
import xml.etree.ElementTree as ET
build=Path(__file__).resolve().parent
info=json.loads((build/'source-info.json').read_text(encoding='utf-8'))
content=json.loads((build/'content.json').read_text(encoding='utf-8'))
source=Path(info['source'])
assert hashlib.sha256(source.read_bytes()).hexdigest()==info['sha256'],'Source changed'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for k,v in ns.items(): ET.register_namespace(k,v)
with zipfile.ZipFile(source) as old, zipfile.ZipFile(build/'replacements.pptx') as replacement:
 changed={}
 for i,item in enumerate(content,1):
  src=info['slides'][item['number']-1]
  xml=ET.fromstring(replacement.read(f'ppt/slides/slide{i}.xml'))
  blips=xml.findall('.//a:blip',ns); assert len(blips)==1
  blips[0].set('{'+ns['r']+'}embed',src['images'][0]['rid'])
  changed[src['part']]=ET.tostring(xml,encoding='utf-8',xml_declaration=True)
  originalnotes=ET.fromstring(old.read(src['notes_part']))
  newnotes=ET.fromstring(replacement.read(f'ppt/notesSlides/notesSlide{i}.xml'))
  def body(x):
   return next(s for s in x.findall('.//p:sp',ns) if s.find('.//p:ph',ns) is not None and s.find('.//p:ph',ns).attrib.get('type')=='body')
  dst=body(originalnotes); tx=dst.find('p:txBody',ns); idx=list(dst).index(tx)
  dst.remove(tx);dst.insert(idx,copy.deepcopy(body(newnotes).find('p:txBody',ns)))
  changed[src['notes_part']]=ET.tostring(originalnotes,encoding='utf-8',xml_declaration=True)
 with zipfile.ZipFile(build/'candidate.pptx','w',zipfile.ZIP_DEFLATED) as out:
  for entry in old.infolist(): out.writestr(copy.copy(entry),changed.get(entry.filename,old.read(entry.filename)))
 with zipfile.ZipFile(build/'candidate.pptx') as out:
  actual=[n for n in old.namelist() if old.read(n)!=out.read(n)]
  assert set(actual)==set(changed)
  for item in content:
   src=info['slides'][item['number']-1]
   assert out.read(src['images'][0]['part'])==old.read(src['images'][0]['part'])
receipt={'changed_parts':actual,'changed_slides':[c['number'] for c in content],'other_parts_identical':True,'original_image_bytes_preserved':True}
(build/'package-diff.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(receipt,ensure_ascii=False))
