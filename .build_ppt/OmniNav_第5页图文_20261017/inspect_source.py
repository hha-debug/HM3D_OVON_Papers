from pathlib import Path
from xml.etree import ElementTree as ET
import hashlib,json,posixpath,shutil,sys,zipfile
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path.cwd()
BUILD=ROOT/'.build_ppt'/'OmniNav_第5页图文_20261017'
SOURCE=ROOT/'output'/'一级分支分类PPT'/'一级分支分类_新版方法详解_20261017.pptx'
BUILD.mkdir(parents=True,exist_ok=True)
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
R='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
def target(part,t):return posixpath.normpath(t.lstrip('/') if t.startswith('/') else posixpath.join(posixpath.dirname(part),t))
def relpart(part):return posixpath.join(posixpath.dirname(part),'_rels',posixpath.basename(part)+'.rels')
with zipfile.ZipFile(SOURCE) as z:
    pe=ET.fromstring(z.read('ppt/presentation.xml'))
    rels={r.attrib['Id']:r.attrib for r in ET.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
    parts=[target('ppt/presentation.xml',rels[s.attrib[R+'id']]['Target']) for s in pe.find('p:sldIdLst',NS)]
    part=parts[4]
    e=ET.fromstring(z.read(part))
    text=[''.join(t.itertext()) for t in e.findall('.//a:t',NS)]
    assert any('OmniNav' in t for t in text),text
    sr={r.attrib['Id']:r.attrib for r in ET.fromstring(z.read(relpart(part)))}
    pics=e.findall('.//p:pic',NS)
    assert len(pics)==1,len(pics)
    rid=pics[0].find('.//a:blip',NS).attrib[R+'embed']
    imagepart=target(part,sr[rid]['Target'])
    imagefile=BUILD/('source-figure'+Path(imagepart).suffix)
    imagefile.write_bytes(z.read(imagepart))
    nr=next(r for r in sr.values() if r['Type'].endswith('/notesSlide'))
    notespart=target(part,nr['Target'])
    styles=[]
    for sh in e.findall('.//p:sp',NS):
        styles.append({'text':''.join(sh.itertext()),'xml':ET.tostring(sh,encoding='unicode')})
    out={'source':str(SOURCE),'sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'slide_count':len(parts),'slide_part':part,'notes_part':notespart,'image_part':imagepart,'image_rid':rid,'image_file':str(imagefile),'size_emu':pe.find('p:sldSz',NS).attrib,'texts':text,'styles':styles}
    (BUILD/'source-info.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
    (BUILD/'source-slide5.xml').write_bytes(z.read(part))
    (BUILD/'source-notes5.xml').write_bytes(z.read(notespart))
backup=BUILD/'original-before-slide5-edit.pptx'
if not backup.exists():shutil.copyfile(SOURCE,backup)
assert hashlib.sha256(backup.read_bytes()).hexdigest()==out['sha256']
print(json.dumps({k:out[k] for k in ['slide_count','slide_part','image_file','size_emu','texts']},ensure_ascii=False))
