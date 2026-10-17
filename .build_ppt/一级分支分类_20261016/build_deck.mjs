import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { Presentation, PresentationFile } from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const workspaceDir = process.cwd();
const buildDir = path.join(workspaceDir, '.build_ppt', '一级分支分类_20261016');
const previewDir = path.join(buildDir, 'previews');
const sourcePath = path.join(workspaceDir, '一级分支分类.md');
const skillDir = 'C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations';
const runtimeModules = 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const runtimePython = 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const finalPath = path.join(workspaceDir, 'output', '一级分支分类PPT', process.env.PPT_FINAL_NAME || '一级分支分类_20261016.pptx');
process.env.RUNTIME_NODE_MODULES = runtimeModules;
await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });

const requireFromRuntime = createRequire(path.join(runtimeModules, '__presentation__.cjs'));
let fontAvailable = false;
try {
  const canvas = requireFromRuntime('@napi-rs/canvas');
  fontAvailable = canvas.GlobalFonts.families.some(f => f.family === 'Microsoft YaHei');
  if (!fontAvailable) fontAvailable = canvas.GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc', 'Microsoft YaHei');
} catch {}
try {
  const { FontLibrary } = requireFromRuntime('skia-canvas');
  if (!FontLibrary.families.includes('Microsoft YaHei')) FontLibrary.use('Microsoft YaHei', ['C:/Windows/Fonts/msyh.ttc']);
  fontAvailable = true;
} catch {}
if (!fontAvailable) throw new Error('Microsoft YaHei font was not available in the rendering runtime');

const { finalizePresentation, resolvePresentationFont } = await import(pathToFileURL(path.join(skillDir, 'container_tools', 'artifact_tool_utils.mjs')).href);
const FONT = resolvePresentationFont({ fontFamily: 'Microsoft YaHei' });
const markdown = (await fs.readFile(sourcePath, 'utf8')).replace(/\r\n/g, '\n');
const tree = markdown.match(/```text\n([\s\S]*?)\n```/)[1];
const groups = [];
const benchmarks = [];
let current;
for (const line of tree.split('\n')) {
  const branch = line.match(/^│   [├└]── (.+)$/);
  if (branch) { current = { name: branch[1], papers: [] }; groups.push(current); continue; }
  const paper = line.match(/^(?:│   │   |│       )[├└]── (.+?)【训练：(.+)】$/);
  if (paper && current) { current.papers.push({ name: paper[1], training: paper[2] }); continue; }
  const benchmark = line.match(/^    [├└]── (.+?)【训练：(.+)】$/);
  if (benchmark) benchmarks.push({ name: benchmark[1], training: benchmark[2] });
}
if (groups.length !== 5 || groups.reduce((a, g) => a + g.papers.length, 0) !== 14 || benchmarks.length !== 4) throw new Error('Unexpected source classification coverage');
const methods = new Map();
for (const line of markdown.split('\n')) {
  const row = line.match(/^\| ([^|]+) \| ([^|]+) \|$/);
  if (row && row[1] !== '分类') methods.set(row[1].trim(), row[2].trim());
}
await fs.writeFile(path.join(buildDir, 'source-data.json'), JSON.stringify({ source: sourcePath, groups, benchmarks, methods: Object.fromEntries(methods) }, null, 2));

const C = { bg: '#FAFBFC', white: '#FFFFFF', ink: '#182D40', muted: '#586D7B', teal: '#12776C', line: '#D6E0E6', pale: '#ECF3F5', amber: '#8D5C13' };
const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
pres.theme.defaultFont = FONT;
pres.theme.colorScheme = { name: 'Academic Navy Teal', themeColors: {
  accent1: C.teal, accent2: C.ink, accent3: '#5C7F9B', accent4: '#6A748E', accent5: '#A8792C', accent6: '#668574',
  bg1: C.bg, bg2: C.pale, tx1: C.ink, tx2: C.muted, dk1: '#000000', dk2: C.ink,
  lt1: '#FFFFFF', lt2: C.pale, hlink: C.teal, folHlink: '#6A748E',
} };

function text(slide, value, x, y, w, h, size = 26, options = {}) {
  const shape = slide.shapes.add({ geometry: 'textbox', name: options.name || value.slice(0, 24),
    position: { left: x, top: y, width: w, height: h },
    fill: 'none', line: { style: 'solid', fill: 'none', width: 0 } });
  shape.text = value;
  shape.text.style = { typeface: FONT, fontSize: size, color: options.color || C.ink,
    bold: options.bold || false, alignment: options.align || 'left', verticalAlignment: options.vertical || 'top',
    insets: 0, wrap: 'square', autoFit: 'none', lineSpacing: 1.18 };
  return shape;
}
function line(slide, x, y, w, h = 0, color = C.line, weight = 1) {
  return slide.shapes.add({ geometry: 'line', name: 'diagram-connector',
    position: { left: x, top: y, width: w, height: h }, fill: 'none',
    line: { style: 'solid', fill: color, width: weight } });
}
function addSlide(title, note = '') {
  const slide = pres.slides.add();
  slide.background.fill = C.bg;
  if (title) text(slide, title, 72, 45, 1136, 64, 46, { bold: true, name: 'slide-title' });
  text(slide, String(pres.slides.items.length).padStart(2, '0'), 1160, 679, 48, 24, 18, { align: 'right', color: C.muted, name: 'page-number' });
  slide.speakerNotes.text = `资料来源：${sourcePath}\n\n${note}`;
  return slide;
}
function method(slide, value) { text(slide, value, 72, 126, 1136, 78, 28, { color: C.muted, name: 'main-methods' }); }
function foot(slide, value, y = 653) { text(slide, value, 72, y, 1080, 48, 18, { color: C.muted, name: 'source-note' }); }
function table(slide, values, widths, y, rowHeights, fontSize = 26) {
  const height = rowHeights.reduce((a, v) => a + v, 0);
  const t = slide.tables.add({ rows: values.length, columns: widths.length,
    left: 72, top: y, width: 1136, height, columnWidths: widths, values });
  t.styleOptions = { headerRow: true, bandedRows: false, bandedColumns: false };
  t.borders.assign({ style: 'solid', fill: C.line, width: 0.8 });
  for (let r = 0; r < values.length; r++) {
    t.rows[r].height = rowHeights[r];
    for (let c = 0; c < widths.length; c++) {
      const cell = t.getCell(r, c);
      cell.fill = r === 0 ? C.ink : C.white;
      cell.text.style = { typeface: FONT, fontSize: r === 0 ? 24 : fontSize, color: r === 0 ? C.white : C.ink,
        bold: r === 0 || c === 0, alignment: 'left', verticalAlignment: 'middle', insets: { left: 18, right: 14, top: 6, bottom: 6 },
        wrap: 'square', autoFit: 'none', lineSpacing: 1.1 };
      t.cells.block({ row: r, column: c, rowCount: 1, columnCount: 1 }).assign({
        margins: { left: 18, right: 14, top: 6, bottom: 6 },
      });
    }
  }
  return t;
}

// 1. Minimal cover.
{
  const s = addSlide('', '文献范围：14篇方法论文，4篇数据集与评测基准。分类及训练配置均采用源文档口径。');
  text(s, 'HM3D-OVON', 80, 133, 1120, 60, 38, { color: C.teal, bold: true });
  text(s, '论文方法一级分类', 80, 236, 1120, 110, 76, { bold: true, name: 'cover-title' });
  text(s, '对应文献与训练算力', 84, 375, 1000, 60, 34, { color: C.muted });
  text(s, '5 个一级分支', 84, 522, 330, 48, 30, { bold: true });
  text(s, '14 篇方法论文', 444, 522, 350, 48, 30, { bold: true });
  text(s, '4 篇基准文章', 830, 522, 360, 48, 30, { bold: true });
  text(s, '2026年10月', 84, 640, 800, 32, 22, { color: C.muted });
}

// 2. Editable classification tree. Lines encode taxonomy, not decoration.
{
  const s = addSlide('一级分支总览', tree);
  text(s, '方法论文', 490, 135, 300, 46, 34, { align: 'center', bold: true, color: C.teal });
  line(s, 640, 185, 0, 30, C.teal, 1.5);
  const centers = groups.map((g, i) => 180 + 230 * i);
  line(s, centers[0], 215, centers[4] - centers[0], 0, C.teal, 1.5);
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i], x = 72 + i * 230;
    line(s, centers[i], 215, 0, 25, C.teal, 1.5);
    const label = g.name === '导航策略训练与优化' ? '导航策略\n训练与优化' : g.name;
    text(s, label, x, 251, 216, 72, 28, { align: 'center', bold: true });
    text(s, `${g.papers.length} 篇`, x, 330, 216, 32, 22, { align: 'center', color: C.muted });
    for (let j = 0; j < g.papers.length; j++) {
      text(s, g.papers[j].name, x, 382 + j * 40, 216, 34, 24, { align: 'center' });
    }
  }
  foot(s, '另列数据集与评测基准：HM3D Semantics、HM3D-OVON、GOAT-Bench、SG3D / SG-LLM', 646);
}

// 3. Architecture branch, all six papers.
{
  const g = groups[0];
  const s = addSlide('系统组织架构', `${methods.get(g.name)}\n\n${g.papers.map(p => `${p.name}：${p.training}`).join('\n')}\nSuperNav执行器训练：https://arxiv.org/html/2610.12126v1，附录C.2。`);
  method(s, '程序与工具／技能编排、快慢系统分层协作\n多任务及规划、定位、探索与导航能力的统一建模');
  table(s, [
    ['文献', '训练 GPU 配置', '时长与备注'],
    ['TANGO', '无需新增导航专项训练', '复用预训练模型'],
    ['SuperNav', '主模型与几何执行器无需专项训练', '学习式执行器\nGPU 配置未报告'],
    ['OmniNav', '阶段1：96 × H20\n阶段2：64 × H20', '120小时\n48小时'],
    ['D3D-VLP', '4 × RTX 6000 Ada', '约14天'],
    ['Uni-NaVid', '40 × H800', '约35小时'],
    ['MTU3D', '4 × A100', '约164 GPU·小时'],
  ], [216, 510, 410], 220, [46, 60, 65, 67, 60, 60, 60], 24);
  foot(s, '训练配置沿用源文档口径，基础模型与复用组件的预训练开销另计', 663);
}

// 4. Representation branch.
{
  const g = groups[1];
  const s = addSlide('环境表征', `${methods.get(g.name)}\n\n${g.papers.map(p => `${p.name}：${p.training}`).join('\n')}`);
  method(s, '三维场景图组织物体、空间信息与视觉证据\n三维物体和前沿特征的 soft-token 表示接口');
  table(s, [
    ['文献', '训练 GPU 配置', '时长与备注'],
    ['MSGNav', '无需新增导航专项训练', '推理资源另计'],
    ['SoftNav', '1 × RTX 4090', '时长未报告'],
  ], [310, 490, 336], 270, [54, 128, 128], 30);
}

// 5. Memory branch, retaining the attribution limitation.
{
  const g = groups[2];
  const s = addSlide('历史记忆', `${methods.get(g.name)}\n\n${g.papers.map(p => `${p.name}：${p.training}`).join('\n')}\nJanusVLN配置由源文档转引阅读笔记中的作者答复。本次未能加载评论正文，未独立复核。\n阅读笔记：${path.join(workspaceDir, '05_视觉语言动作决策与视频记忆', 'read-JANUSVLN.md')}\n作者答复：https://github.com/MIV-XJTU/JanusVLN/issues/3#issuecomment-3375195701`);
  method(s, '长期视觉历史压缩\n语义与空间双分支记忆、历史缓存与滑动窗口更新');
  table(s, [
    ['文献', '训练 GPU 配置', '时长与备注'],
    ['AstraNav-Memory', '32 × H20', '时长未报告'],
    ['JanusVLN', '64 × H20', '约31小时\n笔记转引作者答复'],
  ], [360, 350, 426], 270, [54, 128, 128], 29);
  foot(s, 'JanusVLN 配置据阅读笔记转引作者答复，本次未能加载评论正文', 638);
}

// 6. Exploration branch.
{
  const g = groups[3];
  const s = addSlide('探索与目标搜索', `${methods.get(g.name)}\n\n${g.papers.map(p => `${p.name}：${p.training}`).join('\n')}`);
  method(s, '语义价值地图与视觉前沿\n结合目标相关性、信息增益和距离选择探索位置，并确认目标');
  table(s, [
    ['文献', '训练配置', '统计口径'],
    ['VLFM', '无需新增导航专项训练', '复用组件的预训练开销另计'],
    ['OpenFrontier', '无需新增导航专项训练', '运行与推理仍需计算资源'],
  ], [280, 440, 416], 270, [54, 128, 128], 27);
  foot(s, '源文档未将运行显卡配置计作训练算力', 638);
}

// 7. Policy training branch.
{
  const g = groups[4];
  const s = addSlide('导航策略训练与优化', `${methods.get(g.name)}\n\n${g.papers.map(p => `${p.name}：${p.training}`).join('\n')}\nCompassNav RFT时长为源文档估算：170步×20分钟/步≈56.7小时。`);
  method(s, '目标分割辅助监督与自适应 BC／PPO 联合优化\n基于候选动作质量的 SFT／GRPO 与差距感知奖励');
  table(s, [
    ['文献', '训练 GPU 配置', '训练规模与时长'],
    ['OVSegDT', '2 × A100', '约2.15亿环境步\n时长未报告'],
    ['CompassNav', 'SFT：8 × A800\nRFT：8 × H200', 'SFT：约12小时\nRFT：约56.7小时（估算）'],
  ], [250, 420, 466], 270, [54, 128, 128], 27);
  foot(s, 'CompassNav 的 RFT 时长按约170步、每步约20分钟换算', 638);
}

// 8. Benchmarks remain separate from method branches.
{
  const s = addSlide('数据集与评测基准', `${methods.get('数据集与评测基准')}\n\n${benchmarks.map(p => `${p.name}：${p.training}`).join('\n')}`);
  method(s, '场景语义标注、开放词汇与多模态目标构建\n连续或顺序任务设计，以及评测协议和基线设计');
  table(s, [
    ['文献', '训练算力统计口径'],
    ['HM3D Semantics', '数据集本身不适用，导航基线另计'],
    ['HM3D-OVON', '按各基线分别统计'],
    ['GOAT-Bench', '按各基线分别统计'],
    ['SG3D / SG-LLM', '按 SG-LLM 等基线分别统计'],
  ], [430, 706], 238, [52, 84, 84, 84, 84], 28);
}

// 9. Source caveats and compute interpretation.
{
  const s = addSlide('训练算力统计口径', '资料口径沿用源文档。GPU·小时表示GPU数量乘以训练小时数，不能把不同GPU型号的卡时直接视为等价算力。\nSuperNav学习式执行器训练见：https://arxiv.org/html/2610.12126v1，附录C.2。\nJanusVLN作者答复由源文档及阅读笔记转引，本次网页未加载评论正文。');
  table(s, [
    ['统计项', '口径'],
    ['配置来源', '各篇阅读笔记记录的论文或作者报告配置'],
    ['成本范围', '基础模型与复用组件的预训练开销另计\n免训练方法仍需推理资源'],
    ['时间与卡时', 'GPU·小时 = GPU 数量 × 训练小时数\n不同型号 GPU 的卡时分别保留'],
    ['缺失与估算', '未报告的数据保留“未报告”\nCompassNav RFT 的约56.7小时属于换算估计'],
  ], [260, 876], 158, [52, 84, 106, 106, 106], 27);
  foot(s, 'JanusVLN 的训练配置保留“阅读笔记转引作者答复”来源说明', 642);
}

if (pres.slides.items.length !== 9) throw new Error('Expected nine slides');
await fs.writeFile(path.join(buildDir, 'deck.json'), JSON.stringify(pres.toProto()));
await fs.writeFile(path.join(buildDir, 'slide-text.ndjson'), (await pres.inspect({ kind: 'slide,textbox,table,notes', maxChars: 300000 })).ndjson);
const candidatePath = path.join(buildDir, 'candidate.pptx');
await (await PresentationFile.exportPptx(pres)).save(candidatePath);
console.log('Draft exported: ' + candidatePath);

for (const [index, slide] of pres.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, '0')}`;
  const png = await pres.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(previewDir, `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
  const layout = await slide.export({ format: 'layout' });
  await fs.writeFile(path.join(previewDir, `${stem}.layout.json`), await layout.text());
  console.log('Rendered ' + stem);
}
const montage = await pres.export({ format: 'webp', montage: true, scale: 0.5 });
await fs.writeFile(path.join(buildDir, 'montage.webp'), new Uint8Array(await montage.arrayBuffer()));

const result = await finalizePresentation({
  workspaceDir, candidatePath, finalPath, pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit',
    ...[3, 4, 5, 6, 7, 8, 9].flatMap(n => ['--require-native-table-slide', String(n)])],
  requiredNativeTableOwnerSlides: [3, 4, 5, 6, 7, 8, 9],
  explicitTotalSlideCount: 9,
  fontPolicy: { basis: 'design', families: [FONT] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, `${path.basename(finalPath)}.validation.json`),
});
console.log(JSON.stringify({ finalPath, result }, null, 2));
