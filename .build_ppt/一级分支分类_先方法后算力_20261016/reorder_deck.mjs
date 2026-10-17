import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { FileBlob, PresentationFile } from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const root = process.cwd();
const build = path.join(root, '.build_ppt', '一级分支分类_先方法后算力_20261016');
const source = path.join(root, 'output', '一级分支分类PPT', '一级分支分类_方法详解版_20261016.pptx');
const runtime = 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES = runtime;
const req = createRequire(path.join(runtime, '__slides__.cjs'));
try { const {GlobalFonts} = req('@napi-rs/canvas'); if (!GlobalFonts.families.some(f=>f.family==='Microsoft YaHei')) GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei'); } catch {}
try { const {FontLibrary} = req('skia-canvas'); if (!FontLibrary.families.includes('Microsoft YaHei')) FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']); } catch {}

await fs.mkdir(path.join(build, 'previews'), {recursive:true});
const p = await PresentationFile.importPptx(await FileBlob.load(source));
if (p.slides.items.length !== 27) throw new Error('Expected 27 source slides');
const original = [...p.slides.items];
const order = [1,2,...Array.from({length:18},(_,i)=>i+10),3,4,5,6,7,8,9];
const mapping = order.map((oldNumber,i)=>({old:oldNumber,new:i+1,id:original[oldNumber-1].id}));
// The existing title and summary labels follow the revised presentation order.
const cover = original[0].shapes.items.find(s=>s.name==='对应文献与训练算力');
if (!cover) throw new Error('Cover label missing');
cover.text.replace('对应文献与训练算力','方法方向阐释与训练算力');
const summarySource = original[26].shapes.items.find(s=>s.name==='source-note');
if (!summarySource) throw new Error('Summary source label missing');
summarySource.text.replace('训练算力与传感器作为独立属性保留在前9页','训练算力与传感器作为独立属性见后续页面');
p.slides.reorder(mapping.map(m=>'sl/'+m.id));
for (const [i,s] of p.slides.items.entries()) {
  const number = s.shapes.items.find(sh=>sh.name==='page-number');
  if (!number) throw new Error('Page marker missing');
  number.text = String(i+1).padStart(2,'0');
}
await fs.writeFile(path.join(build,'mapping.json'),JSON.stringify(mapping,null,2));
await fs.writeFile(path.join(build,'native-table-slides.json'),JSON.stringify(p.slides.items.flatMap((s,i)=>s.tables.items.length?[i+1]:[])));
await fs.writeFile(path.join(build,'slide-text.ndjson'),(await p.inspect({kind:'slide,textbox,table,notes',maxChars:600000})).ndjson);
const candidate = path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
// Render the exported file so previews reflect the deliverable's import path.
const imported = await PresentationFile.importPptx(await FileBlob.load(candidate));
if (imported.slides.items.length!==27) throw new Error('Reimport slide count changed');
for (const [i,s] of imported.slides.items.entries()) {
  const blob = await imported.export({slide:s,format:'png',scale:1});
  await fs.writeFile(path.join(build,'previews',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
console.log(JSON.stringify({candidate,slides:27,order}));
