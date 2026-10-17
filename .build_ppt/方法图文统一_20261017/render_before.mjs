import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {PresentationFile,FileBlob} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const build=path.dirname(fileURLToPath(import.meta.url));
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const req=createRequire(path.join(runtime,'__render__.cjs'));
for(const name of ['微软雅黑','Microsoft YaHei']){
 try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc',name);}catch{}
 try{req('skia-canvas').FontLibrary.use(name,['C:/Windows/Fonts/msyh.ttc']);}catch{}
}
const info=JSON.parse(await fs.readFile(path.join(build,'source-info.json'),'utf8'));
const data=JSON.parse(await fs.readFile(path.join(build,'content.json'),'utf8'));
const p=await PresentationFile.importPptx(await FileBlob.load(info.source));
for(const item of data){
 const png=await p.export({slide:p.slides.items[item.number-1],format:'png',scale:1});
 await fs.writeFile(path.join(build,`before-${item.number}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('Rendered '+data.length+' original slides');
