import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const build=path.join(root,'.build_ppt','新版方法分类详解_20261017');
const skill='C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const source=path.join(root,'output','一级分支分类PPT','一级分支分类_含各方向性能对比_20261016.pptx');
const finalPath=path.join(root,'output','一级分支分类PPT','一级分支分类_新版方法详解_20261017.pptx');
process.env.RUNTIME_NODE_MODULES='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe';
const checks=JSON.parse(await fs.readFile(path.join(build,'validator-results.json'),'utf8'));
if(checks.some(r=>r.exit_code!==0))throw new Error('Unresolved validation errors');
const roundtrip=JSON.parse(await fs.readFile(path.join(build,'roundtrip-verification.json'),'utf8'));
if(roundtrip.length!==44||roundtrip.some(r=>!r.pixel_identical))throw new Error('Roundtrip not verified');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceSha=hash(await fs.readFile(source));
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools','artifact_tool_utils.mjs')).href);
try{
 const result=await finalizePresentation({
  workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,
  pythonExecutable:'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath:path.join(skill,'container_tools','inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools','inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--expected-slide-count','44','--validate-bullet-geometry','--validate-heading-fit'],
  requiredNativeTableOwnerSlides:JSON.parse(await fs.readFile(path.join(build,'native-table-slides.json'),'utf8')),
  fontPolicy:{basis:'reference',families:['Microsoft YaHei','微软雅黑'],referencePath:source,referenceSha256:sourceSha},
  verifyArtifactToolImport:true,receiptPath:path.join(build,'finalization-receipt.json'),
 });
 console.log(JSON.stringify(result));
}catch(e){
 await fs.writeFile(path.join(build,'finalizer-attempt.json'),JSON.stringify({error:String(e),stack:e.stack,finalPath,sourceSha},null,2));
 console.error(String(e));process.exitCode=1;
}
