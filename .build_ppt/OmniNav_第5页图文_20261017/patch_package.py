from pathlib import Path
from xml.etree import ElementTree as ET
import hashlib,json,posixpath,sys,zipfile
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path.cwd();BUILD=ROOT/'.build_ppt'/'OmniNav_第5页图文_20261017'
info=json.loads((BUILD/'source-info.json').read_text(encoding='utf-8'))
SOURCE=Path(info['source']);CANDIDATE=BUILD/'candidate.pptx'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==info['sha256'],'Source changed during editing'
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
R='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
ET.register_namespace('a',NS['a']);ET.register_namespace('p',NS['p']);ET.register_namespace('r',R[1:-1])
with zipfile.ZipFile(BUILD/'replacement-slide5.pptx') as replacement:
    e=ET.fromstring(replacement.read('ppt/slides/slide1.xml'))
    image=e.findall('.//p:pic',NS);assert len(image)==1
    image[0].find('.//a:blip',NS).set(R+'embed',info['image_rid'])
    references=[(name,value) for elem in e.iter() for name,value in elem.attrib.items() if name.startswith(R)]
    assert references==[(R+'embed',info['image_rid'])],references
    new_slide=ET.tostring(e,encoding='utf-8',xml_declaration=True)
    ne=ET.fromstring(replacement.read('ppt/notesSlides/notesSlide1.xml'))
    new_body=next(sp for sp in ne.findall('.//p:sp',NS) if sp.find('.//p:ph',NS) is not None and sp.find('.//p:ph',NS).get('type')=='body')
    new_text_body=new_body.find('p:txBody',NS)
with zipfile.ZipFile(SOURCE) as original:
    old_notes=ET.fromstring(original.read(info['notes_part']))
    old_body=next(sp for sp in old_notes.findall('.//p:sp',NS) if sp.find('.//p:ph',NS) is not None and sp.find('.//p:ph',NS).get('type')=='body')
    old_body.remove(old_body.find('p:txBody',NS));old_body.append(new_text_body)
    changed={info['slide_part']:new_slide,info['notes_part']:ET.tostring(old_notes,encoding='utf-8',xml_declaration=True)}
    with zipfile.ZipFile(CANDIDATE,'w') as dst:
        for entry in original.infolist():dst.writestr(entry,changed.get(entry.filename,original.read(entry.filename)))
with zipfile.ZipFile(SOURCE) as original,zipfile.ZipFile(CANDIDATE) as updated:
    assert original.namelist()==updated.namelist()
    differences=[n for n in original.namelist() if original.read(n)!=updated.read(n)]
    assert set(differences)==set(changed),differences
    assert original.read(info['image_part'])==updated.read(info['image_part'])
print(json.dumps({'modified_parts':differences,'other_package_parts':'byte-identical','slides':info['slide_count']},ensure_ascii=False))
(BUILD/'package-diff.json').write_text(json.dumps({'modified_parts':differences,'all_other_parts_byte_identical':True,'image_preserved':True,'slide_count':info['slide_count']},ensure_ascii=False,indent=2),encoding='utf-8')
