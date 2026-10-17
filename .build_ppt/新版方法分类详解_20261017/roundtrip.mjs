import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {FileBlob,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root=process.cwd();
const build=path.join(root,'.build_ppt','新版方法分类详解_20261017');
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const req=createRequire(path.join(runtime,'__roundtrip__.cjs'));
try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try{req('skia-canvas').FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(build,'candidate.pptx')));
if(p.slides.items.length!==44)throw new Error('Count changed');
const dir=path.join(build,'previews-import');await fs.mkdir(dir,{recursive:true});
for(const [i,s] of p.slides.items.entries()){
 const blob=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(dir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 if((i+1)%10===0)console.log('Roundtrip',i+1);
}
console.log('Import/render complete',p.slides.items.length);
