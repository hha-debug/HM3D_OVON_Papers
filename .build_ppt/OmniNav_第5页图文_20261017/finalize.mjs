import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {FileBlob,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root=process.cwd(),build=path.join(root,'.build_ppt','OmniNav_第5页图文_20261017');
const info=JSON.parse(await fs.readFile(path.join(build,'source-info.json'),'utf8'));
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
process.env.RUNTIME_NODE='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe';
const req=createRequire(path.join(runtime,'__verify__.cjs'));
try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try{req('skia-canvas').FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','微软雅黑');}catch{}
try{req('skia-canvas').FontLibrary.use('微软雅黑',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const candidate=path.join(build,'candidate.pptx');
const p=await PresentationFile.importPptx(await FileBlob.load(candidate));
if(p.slides.items.length!==info.slide_count)throw new Error('Slide count changed');
await fs.writeFile(path.join(build,'roundtrip-slide5.png'),new Uint8Array(await (await p.export({slide:p.slides.items[4],format:'png',scale:1})).arrayBuffer()));
await fs.writeFile(path.join(build,'candidate-slide5-inspect.ndjson'),(await p.inspect({kind:'slide,textbox,image,notes',maxChars:500000})).ndjson);
const skill='C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools','artifact_tool_utils.mjs')).href);
const finalPath=path.join(root,'output','一级分支分类PPT','一级分支分类_新版方法详解_第5页图文版_20261017.pptx');
try{
 const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath,
  pythonExecutable:'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath:path.join(skill,'container_tools','inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools','inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu',info.size_emu.cx+','+info.size_emu.cy,'--expected-slide-count',String(info.slide_count),'--validate-heading-fit'],
  fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:info.source,referenceSha256:info.sha256},
  verifyArtifactToolImport:true,receiptPath:path.join(build,'finalization-receipt.json')});
 console.log(JSON.stringify(result));
}catch(e){
 await fs.writeFile(path.join(build,'finalizer-error.json'),JSON.stringify({error:String(e),stack:e.stack},null,2));
 console.error(String(e));process.exitCode=1;
}
