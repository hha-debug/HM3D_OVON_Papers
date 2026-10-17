import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {FileBlob,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const build=path.join(process.cwd(),'.build_ppt','一级分支分类_性能数据_20261016');
const modules='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=modules;
const req=createRequire(path.join(modules,'__slides__.cjs'));
try{const{GlobalFonts}=req('@napi-rs/canvas');if(!GlobalFonts.families.some(f=>f.family==='Microsoft YaHei'))GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try{const{FontLibrary}=req('skia-canvas');if(!FontLibrary.families.includes('Microsoft YaHei'))FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(build,'candidate.pptx')));
if(p.slides.items.length!==34)throw new Error('Import count mismatch');
const out=path.join(build,'previews-import');await fs.mkdir(out,{recursive:true});
for(const[i,s]of p.slides.items.entries()){
 const blob=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(out,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
console.log('Reimported and rendered 34 slides');
