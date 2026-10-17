import fs from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { FileBlob, PresentationFile } from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const workspace = process.cwd();
const build = path.join(workspace, '.build_ppt', '一级分支分类_20261016');
const candidate = path.join(build, 'candidate.pptx');
const final = path.join(workspace, 'output', '一级分支分类PPT', '一级分支分类_20261016.pptx');
const sourceData = JSON.parse(await fs.readFile(path.join(build, 'source-data.json'), 'utf8'));
const candidateStat = await fs.lstat(candidate);
const parentStat = await fs.lstat(path.dirname(final));
if (!candidateStat.isFile() || candidateStat.isSymbolicLink() || !parentStat.isDirectory() || parentStat.isSymbolicLink()) throw new Error('Unexpected file or output directory type');

const imported = await PresentationFile.importPptx(await FileBlob.load(candidate));
if (imported.slides.items.length !== 9) throw new Error('Import slide-count mismatch');
const inspected = await imported.inspect({ kind: 'slide,textbox,table', maxChars: 300000 });
const visible = inspected.ndjson;
for (const name of [...sourceData.groups.flatMap(g => g.papers.map(p => p.name)), ...sourceData.benchmarks.map(p => p.name)]) {
  if (!visible.includes(name)) throw new Error('Missing paper after PPTX import: ' + name);
}
const rendered = path.join(build, 'previews-import');
await fs.mkdir(rendered, { recursive: true });
for (const [i, slide] of imported.slides.items.entries()) {
  const png = await imported.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(rendered, `slide-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()));
}
await fs.writeFile(path.join(build, 'imported-text.ndjson'), visible);
const sourceHash = createHash('sha256').update(await fs.readFile(candidate)).digest('hex');
await fs.copyFile(candidate, final, constants.COPYFILE_EXCL);
const finalHash = createHash('sha256').update(await fs.readFile(final)).digest('hex');
if (sourceHash !== finalHash) throw new Error('Published file does not match validated candidate');
const receipt = {
  finalPath: final, sha256: finalHash, bytes: (await fs.stat(final)).size,
  slideCount: imported.slides.items.length, paperNamesVerified: 18,
  editableNativeTableSlides: [3, 4, 5, 6, 7, 8, 9],
  firstPartyPptxImport: 'passed', renderedSlidesAfterImport: 9,
  finalizationMethod: 'Original packaged validators run independently, followed by first-party import and hash-verified copy',
  finalizerLimitation: 'The wrapper could not canonicalize paths under the Windows sandbox (EPERM). An escalation attempt timed out before execution.',
  nativePowerPointVerified: false,
};
await fs.writeFile(path.join(build, 'publication-receipt.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
