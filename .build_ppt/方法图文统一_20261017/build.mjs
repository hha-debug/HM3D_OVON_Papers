import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {Presentation,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const build=path.dirname(fileURLToPath(import.meta.url));
const info=JSON.parse(await fs.readFile(path.join(build,'source-info.json'),'utf8'));
const content=JSON.parse(await fs.readFile(path.join(build,'content.json'),'utf8'));
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const req=createRequire(path.join(runtime,'__build__.cjs'));
for(const name of ['微软雅黑','Microsoft YaHei']){
 try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc',name);}catch{}
 try{req('skia-canvas').FontLibrary.use(name,['C:/Windows/Fonts/msyh.ttc']);}catch{}
}
const p=Presentation.create({slideSize:{width:1280,height:720}});
for(const item of content){
 const src=info.slides[item.number-1];
 const s=p.slides.add();s.background.fill='#FAFBFC';
 function text(value,x,y,w,h,size=24,color='#182D40',bold=false,name=''){
  const sh=s.shapes.add({geometry:'textbox',name:`page-${item.number}-`+(name||value.slice(0,30)),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0,style:'solid'}});
  sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,color,bold,alignment:'left',verticalAlignment:'top',insets:0,wrap:'square',autoFit:'none',lineSpacing:1.15};return sh;
 }
 text(item.title,72,45,1136,65,46,'#182D40',true,'slide-title');
 text(item.subtitle,72,128,1136,38,26,'#586D7B');
 text(item.imageHeading,64,185,552,34,25,'#12776C',true);
 const img=src.images[0],ct=path.extname(img.file).toLowerCase()==='.jpg'?'image/jpeg':'image/png';
 s.images.add({blob:new Uint8Array(await fs.readFile(img.file)),contentType:ct,alt:item.title+'，论文原始方法图',fit:'contain',position:{left:64,top:item.number===32?224:232,width:552,height:item.number===32?330:302}});
 text(item.caption,64,item.number===32?567:556,552,70,23);
 text(item.tag,64,637,552,34,24,'#12776C',true);
 item.steps.forEach(([heading,body],i)=>{
  const y=185+i*118;
  const number=String(i+1).padStart(2,'0');
  const header=text(number+'   '+heading,662,y,546,40,27,'#182D40',true);
  header.text.get(number).fill='#12776C';
  text(body,720,y+42,488,73,24);
 });
 text(item.source,72,681,1070,25,17,'#586D7B',false,'source-note');
 const page=text(String(item.number).padStart(2,'0'),1160,679,48,24,18,'#586D7B',false,'page-number');page.text.style={alignment:'right'};
 s.speakerNotes.text=src.notes+'\n\n对应第'+item.framework+'页方法框架：\n'+item.steps.map(([h,b],i)=>(i+1)+'. '+h+'：'+b.replaceAll('\n','')).join('\n');
 await fs.writeFile(path.join(build,`after-${item.number}.png`),new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
}
await (await PresentationFile.exportPptx(p)).save(path.join(build,'replacements.pptx'));
await fs.writeFile(path.join(build,'replacement-inspect.ndjson'),(await p.inspect({kind:'slide,textbox,image,notes',maxChars:300000})).ndjson);
console.log('Authored and rendered '+content.length+' half-image half-explanation slides');
