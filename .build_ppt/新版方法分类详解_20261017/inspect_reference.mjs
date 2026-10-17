import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {FileBlob,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root=process.cwd();
const build=path.join(root,'.build_ppt','新版方法分类详解_20261017');
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const req=createRequire(path.join(runtime,'__inspect__.cjs'));
try{const {GlobalFonts}=req('@napi-rs/canvas');GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try{const {FontLibrary}=req('skia-canvas');FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'output','一级分支分类PPT','一级分支分类_含各方向性能对比_20261016.pptx')));
await fs.mkdir(path.join(build,'reference-previews'),{recursive:true});
const inspect=await p.inspect({kind:'slide,textbox,table,image,layout',maxChars:1000000});
await fs.writeFile(path.join(build,'reference-inspect.ndjson'),inspect.ndjson);
for(let i=0;i<p.slides.items.length;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(build,'reference-previews',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 if((i+1)%8===0)console.log('Reference rendered',i+1);
}
console.log('Complete',p.slides.items.length);
