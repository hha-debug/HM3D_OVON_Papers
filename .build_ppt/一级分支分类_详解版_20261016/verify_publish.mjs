import fs from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { FileBlob, PresentationFile } from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const root = process.cwd();
const build = path.join(root, '.build_ppt', '一级分支分类_详解版_20261016');
const candidate = path.join(build, 'candidate.pptx');
const original = path.join(root, 'output', '一级分支分类PPT', '一级分支分类_20261016.pptx');
const final = path.join(root, 'output', '一级分支分类PPT', '一级分支分类_方法详解版_20261016.pptx');
const support = path.join(path.dirname(final), '详解版资料');
const python = 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const modules = 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES = modules;
const requireRuntime = createRequire(path.join(modules, '__presentation__.cjs'));
try {
  const { GlobalFonts } = requireRuntime('@napi-rs/canvas');
  if (!GlobalFonts.families.some(f => f.family === 'Microsoft YaHei')) GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc', 'Microsoft YaHei');
} catch {}
try {
  const { FontLibrary } = requireRuntime('skia-canvas');
  if (!FontLibrary.families.includes('Microsoft YaHei')) FontLibrary.use('Microsoft YaHei', ['C:/Windows/Fonts/msyh.ttc']);
} catch {}
const results = JSON.parse(await fs.readFile(path.join(build, 'validator-results.json'), 'utf8'));
if (results.validators.some(r => r.exit_code !== 0) || !results.original_slides.every(r => r.pixel_identical)) throw new Error('A required check did not pass');
const hash = async (p) => createHash('sha256').update(await fs.readFile(p)).digest('hex');
const originalHash = await hash(original);
const imported = await PresentationFile.importPptx(await FileBlob.load(candidate));
if (imported.slides.items.length !== 27) throw new Error('PPTX import count mismatch');
const inspected = (await imported.inspect({ kind: 'slide,textbox,table,notes', maxChars: 600000 })).ndjson;
const names = ['TANGO','SuperNav','OmniNav','D3D-VLP','Uni-NaVid','MTU3D','MSGNav','SoftNav','AstraNav-Memory','JanusVLN','VLFM','OpenFrontier','OVSegDT','CompassNav','HM3D Semantics','HM3D-OVON','GOAT-Bench','SG3D / SG-LLM'];
for (const name of names) if (!inspected.includes(name)) throw new Error('Missing paper after import: ' + name);
await fs.writeFile(path.join(build, 'imported-text.ndjson'), inspected);
const importedPreview = path.join(build, 'previews-import');
await fs.mkdir(importedPreview, { recursive: true });
for (const [i, s] of imported.slides.items.entries()) {
  const img = await imported.export({ slide: s, format: 'png', scale: 1 });
  await fs.writeFile(path.join(importedPreview, `slide-${String(i + 1).padStart(2,'0')}.png`), new Uint8Array(await img.arrayBuffer()));
}
const comparisonScript = `
import json,sys
from pathlib import Path
from PIL import Image,ImageChops
b=Path(sys.argv[1])
results=[]
for i in range(1,28):
 a=Image.open(b/'previews'/f'slide-{i:02}.png').convert('RGBA')
 c=Image.open(b/'previews-import'/f'slide-{i:02}.png').convert('RGBA')
 equal=a.size==c.size and ImageChops.difference(a,c).getbbox() is None
 results.append({'slide':i,'pixel_identical':equal})
(b/'roundtrip-render-comparison.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps({'slides':len(results),'identical':sum(r['pixel_identical'] for r in results)}))
sys.exit(0 if all(r['pixel_identical'] for r in results) else 1)
`;
const compared = spawnSync(python, ['-c', comparisonScript, build], { encoding: 'utf8', env: {...process.env, PYTHONIOENCODING:'utf-8'} });
if (compared.status !== 0) throw new Error('Roundtrip changed rendered slides: '+compared.stdout+compared.stderr);
console.log(compared.stdout.trim());

// Same validator set as finalizePresentation. Its path-canonicalization helper is
// unavailable in this Windows sandbox; no-overwrite copy is checked explicitly.
if (!path.resolve(final).toLowerCase().startsWith(path.resolve(root).toLowerCase() + path.sep)) throw new Error('Unexpected final target');
for (const [p, directory] of [[candidate,false],[path.dirname(final),true]]) {
  const stat = await fs.lstat(p);
  if (stat.isSymbolicLink() || (directory ? !stat.isDirectory() : !stat.isFile())) throw new Error('Unexpected file type');
}
const candidateHash = await hash(candidate);
await fs.copyFile(candidate, final, constants.COPYFILE_EXCL);
if ((await hash(final)) !== candidateHash || (await hash(original)) !== originalHash) throw new Error('Hash verification failed');

const manifest = JSON.parse(await fs.readFile(path.join(support, 'asset_manifest.json'), 'utf8'));
const uses = JSON.parse(await fs.readFile(path.join(build, 'used-figures.json'), 'utf8'));
const figureRows = manifest.map(a => {
  const used = uses.find(u => u.id === a.id);
  return `| ${a.id}.png | ${path.basename(a.source_pdf)} | ${a.pdf_page} | 图${a.figure} | ${a.crop_pt.join(', ')} | ${used?.slide || ''} | 原图完整，必要标记和图例保留 |`;
}).join('\n');
await fs.writeFile(path.join(support,'asset_manifest.md'), `# 图像来源记录\n\n所有图像均由本地论文PDF以4倍分辨率渲染后裁取。未重绘数据，未更改原始图中文字。裁剪单位为PDF点，坐标原点为页面左上。幻灯片中保持图像纵横比。\n\n| 资产 | 源PDF | PDF页码 | 原图 | 裁剪框 x0,y0,x1,y1 | 幻灯片 | 检查结果 |\n|---|---|---:|---|---|---:|---|\n${figureRows}\n`, 'utf8');
const qa = `# 方法详解版 PPT 检查记录\n\n- 输出：${path.basename(final)}，27页。前9页沿用原PPT，新增18页。\n- 插入7幅原论文图像，无缺失图片或占位图。可编辑表格16个，讲稿备注27页。\n- 图像检查：图1/图2/图3/图4等必要标签、图例、候选点及流程模块保留，均采用等比例容纳。\n- 已逐页检查新增18页，并核对前9页与原文件的渲染一致。第一轮修正第27页AstraNav-Memory断词、第24页预测掩码措辞、第12页基线名称与指标释义。\n- 结构、尺寸、字体、标题适配、边界和表格原生性检查通过。新旧往返导入的27页渲染逐像素一致。\n- nature-paper2ppt审计最终结果：high=0、medium=0、low=4。四项低等级提示来自原始封面左边缘3 pt对齐差异，为保留原有9页不作调整。\n- 正文、标题、图注、表格和页码已检查，无已知截断或重叠。采用整幅方法图、双栏解释和原生数据表，按证据类型安排页面。\n- 事实核查：代表论文方法与图号核对本地PDF，OmniNav表3、AstraNav-Memory表3、OVSegDT表1数值核对原表，保留传感器、效率统计与随机种子口径说明。\n- 已有训练算力来源与JanusVLN转引限制保留在原9页中。\n- 验证方式：bundled Artifact Tool导入和渲染，原生PPTX包检查及nature审计。未在桌面PowerPoint中打开。\n- 环境限制：标准finalizePresentation的realpath路径规范化在当前Windows沙箱不可用。本次使用相同打包校验器、再次导入渲染及SHA-256校验后，按不覆盖方式复制至输出文件。详细记录在私有构建目录。\n`;
await fs.writeFile(path.join(support,'qa_report.md'), qa, 'utf8');
const receipt = { finalPath:final, sha256:candidateHash, originalPath:original, originalSha256:originalHash,
  bytes:(await fs.stat(final)).size, slideCount:27, originalSlidesUnchanged:true,
  roundtripPixelIdentical:27, paperNamesVerified:names.length, nativeTableCount:16, embeddedFigureCount:7,
  validatorResults:path.join(build,'validator-results.json'),
  finalizationMethod:'Same packaged validators, first-party import+render, COPYFILE_EXCL, SHA-256 verification; sandbox realpath unavailable',
  nativePowerPointOpened:false };
await fs.writeFile(path.join(build,'publication-receipt.json'), JSON.stringify(receipt,null,2));
console.log(JSON.stringify({finalPath:final, bytes:receipt.bytes, slides:27, sha256:candidateHash},null,2));
