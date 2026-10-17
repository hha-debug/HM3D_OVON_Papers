import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { FileBlob, PresentationFile } from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const root = process.cwd();
const build = path.join(root, '.build_ppt', '一级分支分类_详解版_20261016');
const original = path.join(root, 'output', '一级分支分类PPT', '一级分支分类_20261016.pptx');
const support = path.join(root, 'output', '一级分支分类PPT', '详解版资料');
const figures = path.join(support, 'assets', 'figures');
const previews = path.join(build, 'previews');
await fs.mkdir(previews, { recursive: true });
const sources = JSON.parse(await fs.readFile(path.join(build, 'source-pages.json'), 'utf8'));
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

const pres = await PresentationFile.importPptx(await FileBlob.load(original));
if (pres.slides.items.length !== 9) throw new Error('Expected the original nine-slide deck');
const FONT = 'Microsoft YaHei';
const C = { bg: '#FAFBFC', white: '#FFFFFF', ink: '#182D40', muted: '#586D7B', teal: '#12776C', line: '#D6E0E6', pale: '#ECF3F5', amber: '#8D5C13' };
const usedFigures = [];
const metadata = [];

function text(s, value, x, y, w, h, size = 26, options = {}) {
  const shape = s.shapes.add({ geometry: 'textbox', name: options.name || value.slice(0, 30),
    position: { left: x, top: y, width: w, height: h },
    fill: 'none', line: { style: 'solid', fill: 'none', width: 0 } });
  shape.text = value;
  shape.text.style = { typeface: FONT, fontSize: size, color: options.color || C.ink,
    bold: options.bold || false, alignment: options.align || 'left', verticalAlignment: 'top',
    insets: 0, wrap: 'square', autoFit: 'none', lineSpacing: options.spacing || 1.18 };
  return shape;
}
function slide(title, note, citations = []) {
  const s = pres.slides.add();
  const number = pres.slides.items.length;
  s.background.fill = C.bg;
  text(s, title, 72, 45, 1136, 64, title.length > 29 ? 42 : 46, { bold: true, name: 'slide-title' });
  text(s, String(number).padStart(2, '0'), 1160, 679, 48, 24, 18, { align: 'right', color: C.muted, name: 'page-number' });
  s.speakerNotes.text = `${note}\n\n资料来源：\n${citations.join('\n')}`;
  metadata.push({ number, title, citations });
  return s;
}
function sub(s, t, y = 126, h = 70) { text(s, t, 72, y, 1136, h, 28, { color: C.muted }); }
function source(s, t) { text(s, t, 72, 680, 1060, 24, 17, { color: C.muted, name: 'source-note' }); }
function heading(s, t, x, y, w, size = 30) { text(s, t, x, y, w, 48, size, { bold: true, color: C.teal }); }
function block(s, head, body, x, y, w, bodyHeight = 90, size = 26) {
  heading(s, head, x, y, w, 28);
  text(s, body, x, y + 48, w, bodyHeight, size);
}
function table(s, values, widths, x, y, heights, size = 25) {
  const t = s.tables.add({ rows: values.length, columns: widths.length,
    left: x, top: y, width: widths.reduce((a,b) => a+b, 0), height: heights.reduce((a,b) => a+b, 0),
    columnWidths: widths, values });
  t.styleOptions = { headerRow: true, bandedRows: false, bandedColumns: false };
  t.borders.assign({ style: 'solid', fill: C.line, width: 0.8 });
  for (let r = 0; r < values.length; r++) {
    t.rows[r].height = heights[r];
    for (let c = 0; c < widths.length; c++) {
      const cell = t.getCell(r, c);
      cell.fill = r === 0 ? C.ink : C.white;
      cell.text.style = { typeface: FONT, fontSize: r === 0 ? 24 : size, color: r === 0 ? C.white : C.ink,
        bold: r === 0 || c === 0, alignment: 'left', verticalAlignment: 'middle',
        insets: { left: 16, right: 14, top: 7, bottom: 7 }, wrap: 'square', autoFit: 'none', lineSpacing: 1.12 };
      t.cells.block({ row: r, column: c, rowCount: 1, columnCount: 1 }).assign({ margins: { left: 16, right: 14, top: 7, bottom: 7 } });
    }
  }
  return t;
}
async function figure(s, id, x, y, w, h, alt) {
  const bytes = new Uint8Array(await fs.readFile(path.join(figures, id + '.png')));
  s.images.add({ blob: bytes, contentType: 'image/png', alt, fit: 'contain',
    position: { left: x, top: y, width: w, height: h } });
  usedFigures.push({ id, slide: pres.slides.items.length, alt });
}
const pdf = (key, location) => `${sources[key].pdf}，${location}`;
const note = (rel) => path.join(root, rel);
const classification = path.join(root, '一级分支分类.md');

// 10–12: system organization, including variants beyond fast/slow systems.
{
  const s = slide('系统组织架构的设计空间',
    '本方向关注模块的职责划分、任务接口及执行反馈。程序编排、快慢系统和统一决策是当前文献集合中的不同组织方式。OmniNav只代表其中的快慢协作路线，不能用它概括整个分支。统一建模内部也有区别：D3D-VLP联合规划、三维定位与导航，Uni-NaVid统一多任务视频输入和动作输出，MTU3D将目标对象和探索前沿统一为候选查询打分。分类按主要贡献归纳，各分支允许共享组件。',
    [classification, note('03_大模型规划与工具调用/read-Tango.md'), note('03_大模型规划与工具调用/read-SuperNav.md'), note('04_三维空间表征与目标推理/read-D3D.md'), note('05_视觉语言动作决策与视频记忆/read-UniNavid.md'), note('04_三维空间表征与目标推理/read-MTU.md'), pdf('omni','第3节')]);
  sub(s, '核心问题：高层任务意图怎样转成可执行动作');
  table(s, [
    ['组织方式', '主要机制', '对应文献'],
    ['程序与工具编排', '模型生成程序或调度技能，\n执行后读取环境反馈', 'TANGO\nSuperNav'],
    ['快慢系统协作', '全局推理选择子目标，\n局部策略持续更新动作', 'OmniNav'],
    ['统一任务与决策接口', '用共享模型或候选打分机制，\n连接多任务或多个决策环节', 'D3D-VLP\nUni-NaVid、MTU3D'],
  ], [292, 520, 324], 72, 218, [50, 108, 108, 108], 26);
  text(s, '归类依据：主要贡献落在模块分工和接口设计。地图与记忆可以作为系统中的组件。', 72, 620, 1136, 48, 23, { color: C.muted });
  source(s, '整理自各篇阅读笔记与方法章节');
}
{
  const s = slide('OmniNav：快慢系统的接口',
    '读图先看左侧输入接口，再看右上角快系统，最后看底部的慢系统。快慢系统共享Qwen2.5-VL-3B参数，区别主要是输入和职责。慢系统使用占据地图得到的前沿、历史图像及位姿：未见目标时选择探索子目标，已在当前或历史观测中见到目标时预测目标位置。快系统利用视觉上下文和子目标，通过Flow Matching策略头一次生成未来5个连续航点，并随着新图像到来滚动更新。航点包含位置、朝向及到达标记。完整慢系统需要深度和里程计构图。原图中“Diffusion Policy Head”是概览标记，正文详细实现采用Flow Matching。',
    [pdf('omni','PDF第4页，图1；第3节，PDF第3–5页')]);
  await figure(s, 'omninav_fig1', 72, 130, 1136, 506, 'OmniNav原图1：输入表示、快系统连续航点输出、慢系统子目标选择以及共享VLM参数');
  text(s, '慢系统给出子目标，快系统生成连续航点，并根据新观测更新局部移动。', 72, 644, 1136, 30, 23);
  source(s, '来源：OmniNav，图1（PDF第4页）');
}
{
  const s = slide('OmniNav：执行闭环与验证边界',
    '以寻找电视为例：若目标未出现，慢系统结合前沿附近图像、空间位置和目标语义，选择值得探索的子目标。快系统执行时继续根据视觉观测绕障和调整航点，不能理解成单纯沿直线跟踪坐标。达到子目标或获得新证据后更新全局决策。右表摘录论文表3，均为HM3D-OVON Val-Unseen。原表还含“加入通用数据”一行（57.7/32.9），本页为便于说明仅显示所列配置，完整配置也包括通用数据与CoT。增加慢系统同时增加深度、里程计、占据地图和历史信息，因此不能把12.4个百分点的SR增长单独归因于推理模式。论文实机超过5Hz的报告对应快系统。训练两阶段分别为离散语义动作对齐和连续航点训练，并非快慢系统各自独立训练。',
    [pdf('omni','PDF第5页，第3节；PDF第7页，第4.3节；PDF第9页，表3与实机部署')]);
  block(s, '1  全局选择', '目标未出现时评价探索前沿，\n已出现时从观测与历史中定位目标。', 72, 142, 550, 85, 26);
  block(s, '2  局部执行', '连续生成未来5个航点，\n利用当前视觉绕障并调整朝向。', 72, 300, 550, 85, 26);
  block(s, '3  新观测反馈', '更新地图与图像历史，\n重新判断目标位置或下一探索方向。', 72, 458, 550, 85, 26);
  heading(s, 'Val-Unseen 的模块消融', 694, 142, 514, 28);
  table(s, [
    ['配置', 'SR %', 'SPL %'],
    ['自回归动作基线', '35.3', '22.1'],
    ['加入连续策略头', '43.5', '27.3'],
    ['再加入慢系统', '55.9', '30.7'],
    ['完整配置', '59.2', '33.2'],
  ], [286, 114, 114], 694, 202, [50, 68, 68, 68, 68], 24);
  text(s, '慢系统配置同时加入深度与里程计。\n实机超过5 Hz的结果对应快系统。', 694, 555, 514, 90, 22, { color: C.amber });
  source(s, 'SR：成功率。SPL：按路径长度加权的成功率。来源：OmniNav 第3节、表3及实机部署说明');
}

// 13–15: representations and an original last-mile illustration.
{
  const s = slide('环境表征：结构与模型接口',
    '环境表征回答的是模型可以访问什么状态，以及状态用什么形式表示。MSGNav将对象、位置、房间属性以及共同观察对象的图像组织成多模态三维场景图，供视觉语言推理查询。SoftNav则将三维物体和前沿的连续特征，经MLP映射到VLM的嵌入空间形成soft tokens，和压缩视觉历史、文字目标联合处理。soft token是实体特征向量，不是把三维坐标改写成文字。两者都使用RGB-D与位姿，也包含历史或探索后端，但这里依据主要的信息组织与输入接口贡献归类。',
    [pdf('msg','第3.2–3.3节'), note('04_三维空间表征与目标推理/read-SoftNav.md')]);
  sub(s, '核心问题：把跨视角观测转成可查询、可决策的环境状态');
  heading(s, '显式图结构：MSGNav', 72, 222, 536, 32);
  text(s, '表示对象\n物体节点、三维属性，以及保存共同观测图像的边。', 72, 287, 520, 104, 27);
  text(s, '信息读取\n先选目标相关子图，再向VLM提供少量视觉证据。', 72, 420, 520, 104, 27);
  heading(s, '连续特征接口：SoftNav', 682, 222, 526, 32);
  text(s, '表示对象\n三维物体和探索前沿的特征向量，每个实体对应一个soft token。', 682, 287, 526, 104, 27);
  text(s, '信息读取\n投影到VLM嵌入空间，与图像历史及语言目标共同参与注意力计算。', 682, 420, 526, 104, 27);
  text(s, '主要取舍：显式结构便于查询和核查，连续接口保留特征并需要学习跨模态对齐。', 72, 597, 1136, 62, 24, { color: C.muted });
  source(s, '整理自 MSGNav 方法章节与 SoftNav 阅读笔记');
}
{
  const s = slide('MSGNav：三维场景图怎样用于导航',
    '图左说明表示构建：通过检测、分割和视觉编码得到对象，结合深度与位姿跨帧匹配对象并融合属性。图的边保存邻近对象对共同出现的RGB-D图像，不应把它简单理解成语言模型生成的关系文本。右侧四个模块依次用于降低查询成本、扩充词汇、利用决策反馈以及选择最终观察位置。KSS先压缩为邻接信息，再选择相关对象并用贪心图像覆盖保留关键证据。AVU由图像证据发现预设词表外的对象名称。CLR记录历史决策与反馈。VVD在目标附近选择可见率更高的可通行位置。',
    [pdf('msg','PDF第4页，图3；第3.2–3.3节')]);
  sub(s, '物体节点保留空间属性，图边保留共同观测的图像证据', 126, 40);
  await figure(s, 'msgnav_fig3', 72, 172, 1136, 458, 'MSGNav原图3：增量场景图构建与KSS、AVU、CLR、VVD四个导航模块');
  text(s, 'KSS筛选子图，AVU更新词汇，CLR读取决策反馈，VVD选择终点观察位置。', 72, 641, 1136, 31, 23);
  source(s, '来源：MSGNav，图3（PDF第4页）');
}
{
  const s = slide('MSGNav：目标定位后的视角选择',
    '左图展示目标是镜子时的最后一段导航。仅选择离物体最近的可通行点可能视野不好，或者物体遮挡严重。VVD围绕物体采样可通行位置，根据场景点云判断各位置到目标点云的可见率，再选择得分更高的观察位置。这说明表征必须保留足以支持后续动作选择的空间与视觉证据。图中数值是该示意中的可见率，不是导航成功率。KSS在论文中平均每次查询约4张图，并报告较完整输入减少超过95%的token成本，这不是所有场景的固定上限。该系统无需新增导航专项训练，但依赖感知模型、稳定的深度与位姿，以及VLM推理服务。',
    [pdf('msg','PDF第5页，第3.3.1节；PDF第6页，图4和第3.3.4节')]);
  text(s, '定位物体之后，还要选择能清楚看见目标的可通行位置。', 72, 132, 610, 78, 28, { color: C.muted });
  await figure(s, 'msgnav_fig4', 72, 225, 600, 357, 'MSGNav原图4：最近可通行点与按可见率选择的观察位置对比，含候选点与完整图例');
  text(s, '左：只靠距离可能停在较差视角\n右：采样候选位置并计算目标可见率', 72, 596, 620, 60, 23);
  block(s, 'KSS：选择相关证据', '相关物体筛选后，以较少图像覆盖关键关系，平均约4张图像／查询。', 736, 132, 472, 90, 25);
  block(s, 'AVU 与 CLR：修正决策', '利用原始视觉证据更新对象词汇，结合过去的决策与反馈再次推理。', 736, 300, 472, 90, 25);
  block(s, 'VVD：选择观察位置', '对目标周围的可通行位置计算可见率，选取遮挡较少的位置。', 736, 468, 472, 90, 25);
  source(s, '来源：MSGNav 图4、第3.3节。依赖RGB-D与位姿，感知和VLM推理成本另计');
}

// 16–18: memory, compression and the measured loss of detail.
{
  const s = slide('历史记忆：保留内容与更新方式',
    '历史记忆关注信息如何跨时间保留，以及新观测到来后怎样更新和读取。AstraNav-Memory主要降低每帧的视觉token数量，使同样预算下可以纳入更长的图像与位姿序列。JanusVLN将语义和几何拆成两路隐式特征，几何分支借助VGGT历史KV逐步更新，缓存保留最初8帧与最近48帧。需要区分论文架构和公开评测实现：后者每步重新输入采样的历史图像给Qwen语义侧，并没有显式将上一步语言模型KV传入下一次generate。因此不能将两条分支一概说成跨步永久缓存。更长记忆也可能带来检索困难及细节损失。',
    [pdf('astra','第3节'), note('05_视觉语言动作决策与视频记忆/read-JANUSVLN.md')]);
  sub(s, '核心问题：有限上下文中，怎样利用过去看见的环境');
  table(s, [
    ['路线', '保存的内容', '控制开销的方式'],
    ['视觉历史压缩\nAstraNav-Memory', '带相机位姿的历史图像序列', '降低每帧视觉token数量，\n扩大可读取的历史范围'],
    ['双分支隐式记忆\nJanusVLN', '语义特征与几何特征，\n分别利用历史上下文', '起始窗口与最近窗口，\n限制部分历史缓存长度'],
  ], [350, 370, 416], 72, 228, [54, 139, 139], 26);
  text(s, '主要取舍：细节保留、历史覆盖，以及更新和读取的开销。', 72, 595, 1136, 48, 29, { bold: true });
  source(s, 'JanusVLN公开评测：语义侧重读采样历史，几何侧跨步维护缓存。来源详见备注');
}
{
  const s = slide('AstraNav-Memory：压缩后读取长期历史',
    '原始Qwen2.5-VL在该输入设置下每帧为598个视觉tokens，主配置压缩后每帧30个。冻结的DINOv3提取空间语义特征，压缩模块经空间重排和通道映射减少特征序列，再接入Qwen2.5-VL的视觉编码接口。相机位姿作为文字tokens放在对应图像之前，帮助模型将图像内容与位置关联。模型生成文字及目标或探索前沿的二维坐标，并交由下层导航。记忆本体是图像与位姿序列，不能等同于显式对象级地图。原图压缩模块标注PixelShuffle，而正文第3.2节写PixelUnshuffle，本页按照正文解释空间重排压缩。训练冻结DINOv3，微调压缩器及Qwen，采用32张H20，论文未报告训练总时长。',
    [pdf('astra','PDF第4页，图2及第3.1–3.2节；PDF第5页，训练设置')]);
  sub(s, '主配置每帧视觉token：原始598个，压缩后30个', 126, 46);
  await figure(s, 'astranav_fig2', 72, 188, 1136, 440, 'AstraNav-Memory原图2：压缩视觉编码器、历史图像、相机位姿与语言目标共同输入Qwen2.5-VL-3B');
  text(s, '图像与位姿成对输入模型，用于预测目标位置或下一探索前沿坐标。', 72, 641, 1136, 31, 24);
  source(s, '来源：AstraNav-Memory，图2（PDF第4页）；压缩算子按正文第3.2节解释');
}
{
  const s = slide('AstraNav-Memory：历史长度与信息损失',
    '左表完整摘录论文表3的四个配置，SR、推理时长及显存均沿用该表口径。相同50帧输入下，压缩降低了推理时长与显存，但SR也下降，不能只报告效率改善。100帧压缩配置的SR高于200帧配置，说明历史容量不是唯一因素。论文表4在均匀抽样子集上也显示极强压缩可能明显损害准确率。“16×”是压缩模块的空间token标记，而598到30是原始Qwen路径与压缩路径的最终token数量比较，分母不同，不应混为一个比值。表3的显存值没有明确单卡最低部署口径，本页原样保留，不将其解释成单卡显存门槛。',
    [pdf('astra','PDF第7页，表3、表4与第4.3节')]);
  heading(s, '论文效率实验', 72, 142, 720, 30);
  table(s, [
    ['历史设置', 'SR %', '推理 秒', '显存 GB'],
    ['50帧，原始输入', '60.2', '10.3', '90.6'],
    ['50帧，压缩输入', '56.6', '2.2', '46.8'],
    ['100帧，压缩输入', '57.5', '4.2', '68.5'],
    ['200帧，压缩输入', '55.2', '5.6', '86.8'],
  ], [300, 100, 160, 160], 72, 202, [54, 86, 86, 86, 86], 25);
  heading(s, '更长历史仍有代价', 870, 142, 338, 30);
  text(s, '同为50帧，推理由10.3秒降到2.2秒，SR也由60.2%降到56.6%。', 870, 214, 338, 150, 27);
  text(s, '压缩后100帧优于200帧。历史长度、细节损失与模型读取能力共同影响结果。', 870, 403, 338, 170, 27);
  text(s, '压缩行采用原表16×空间压缩标记，与598到30的最终token统计口径不同。', 72, 621, 1136, 40, 22, { color: C.muted });
  source(s, '整理自 AstraNav-Memory 表3。推理单位：秒／指令；显存按原表口径保留');
}

// 19–21: exploration and verification.
{
  const s = slide('探索与目标搜索：候选位置的价值',
    '探索前沿通常位于已知区域与未知区域的交界，是继续探索的候选位置。VLFM利用RGB与目标文字的图文相似度生成语义价值，将多视角观测按置信度融合到俯视价值地图中，再评价前沿位置。OpenFrontier将候选前沿直接标在RGB图像中，让VLM利用原始场景上下文判断目标相关性，结合FrontierNet预测的信息增益及距离选择全局前沿。前者侧重累积空间价值，后者侧重将可行动位置作为VLM的推理接口。两者均复用预训练组件，无需新增导航专项训练，但需要感知和控制后端。',
    [note('02_语义地图与前沿探索/VLFM_Vision-Language_Frontier_Maps_for_Zero-Shot_Semantic_Navigation.pdf') + '，第IV节', pdf('frontier','第III节')]);
  sub(s, '核心问题：目标尚未出现时，下一步去哪里更有价值');
  table(s, [
    ['文献', '决策载体', '选择依据'],
    ['VLFM', '语义价值地图', '图文相似度累积到空间，\n用价值地图评价前沿'],
    ['OpenFrontier', '图像中的视觉前沿', '目标相关性结合信息增益，\n再考虑移动距离'],
  ], [250, 350, 536], 72, 227, [54, 136, 136], 28);
  text(s, '共同闭环：发现候选位置，执行移动，更新观测，再确认目标。', 72, 593, 1136, 60, 28, { bold: true });
  source(s, '探索前沿指已知与未知区域的交界。整理自 VLFM 与 OpenFrontier 方法章节');
}
{
  const s = slide('OpenFrontier：在图像中评价探索方向',
    '图中以“去客厅”为例。FrontierNet从关键帧识别视觉前沿簇，并给出探索信息增益估计。系统在RGB图像上为前沿加标记，让VLM一次评价各候选与目标的相关概率。语义概率重新加权信息增益后，将前沿投影到三维空间并加入稀疏的全局候选集合。系统反复合并重复前沿、删除已到达或失败候选，并选择适合的下层导航执行。该架构不要求构建稠密三维语义地图，但前沿三维定位和目标接近仍需要几何信息。视觉语义决策与实际运动执行通过前沿位姿连接，VLM不直接控制每个电机动作。',
    [pdf('frontier','PDF第2页，图2；PDF第3–4页，第III节')]);
  sub(s, '标记候选前沿后，VLM根据周围场景判断哪个方向更可能通向目标');
  await figure(s, 'openfrontier_fig2', 72, 218, 1136, 363, 'OpenFrontier原图2：图像前沿识别、VLM相关性评分、信息增益加权、三维前沿管理及路径执行');
  text(s, 'FrontierNet提供探索先验，VLM提供目标相关概率，三维后端维护全局候选位置。', 72, 610, 1136, 62, 26);
  source(s, '来源：OpenFrontier，图2（PDF第2页）');
}
{
  const s = slide('OpenFrontier：候选效用与目标确认',
    '正文公式将目标相关概率p与FrontierNet信息增益估计g相乘，再除以机器人到前沿的欧氏距离，得到用于全局选择的效用。这是启发式选择分数，不是保证最优的概率模型。目标确认属于另一个闭环：开放词汇分割先给出疑似物体掩码，利用深度和位姿估计三维中心，在物体前方插入优先级极高的观察位姿前沿。到达该处后由VLM再次确认。确认则靠近目标，未确认则移除假设并继续搜索。系统可以接PointGoal策略，或使用可选几何地图规划器。该方法无需导航专项训练不等于不使用预训练感知模型，也不意味着无需深度或位姿。',
    [pdf('frontier','PDF第4页，公式1–3、算法1与目标确认说明'), note('02_语义地图与前沿探索/read.md')]);
  heading(s, '前沿效用的组成', 72, 142, 620, 30);
  text(s, '目标相关概率 × 信息增益 ÷ 到达距离', 72, 202, 620, 79, 31, { bold: true });
  table(s, [
    ['量', '来源与含义'],
    ['目标相关概率', 'VLM根据图像与目标评估方向'],
    ['信息增益', 'FrontierNet预测可揭示的未知空间'],
    ['到达距离', '当前位置到候选前沿的空间距离'],
  ], [210, 410], 72, 300, [50, 78, 78, 78], 24);
  heading(s, '停止前的目标确认', 754, 142, 454, 30);
  block(s, '1  提出观察位置', '分割检测到疑似目标，结合深度与位姿，生成面向物体的观察位置。', 754, 215, 454, 80, 25);
  block(s, '2  到达后再次核查', '由VLM检查当前图像，判断该物体是否满足目标描述。', 754, 369, 454, 80, 25);
  text(s, '确认后靠近目标。未确认则丢弃假设，恢复前沿搜索。', 754, 537, 454, 88, 26);
  source(s, '整理自 OpenFrontier 第III节。仍依赖相机几何、位姿和下层导航，推理开销另计');
}

// 22–24: policy learning and the uncertainty gate.
{
  const s = slide('导航策略训练与优化：学习信号',
    '本分支重点是训练信号和优化方式。OVSegDT通过目标二值分割掩码提供类别无关的视觉定位线索，使用辅助掩码重建、语义奖励，以及基于动作熵的行为克隆与PPO配比。CompassNav将可通行区域构造成带编号的候选动作，先用成功示范进行SFT，再用GRPO比较同一观察下多次回答的动作质量。其奖励包含候选动作到目标的距离分数与差距感知最优动作奖励。推理时不把真实目标坐标或训练距离标签交给VLM。BC指行为克隆，PPO指近端策略优化，SFT指监督微调，GRPO指组相对策略优化。',
    [pdf('ovseg','第4节'), note('05_视觉语言动作决策与视频记忆/read-CompassNav.md')]);
  sub(s, '核心问题：怎样训练开放词汇目标搜索策略，并适应未见类别');
  heading(s, 'OVSegDT：分割与混合优化', 72, 224, 538, 31);
  text(s, '目标视觉线索\n将目标掩码直接作为输入，并用辅助重建保留目标位置线索。', 72, 293, 538, 112, 27);
  text(s, '优化方式\n根据动作不确定性，连续调节BC与PPO的损失权重。', 72, 438, 538, 112, 27);
  heading(s, 'CompassNav：比较候选动作', 686, 224, 522, 31);
  text(s, '示范初始化\nSFT学习教师的分析与动作编号，建立基本导航决策能力。', 686, 293, 522, 112, 27);
  text(s, '质量反馈\nGRPO结合候选动作的距离评分及差距感知奖励，改进动作选择。', 686, 438, 522, 112, 27);
  text(s, 'BC：行为克隆。PPO：近端策略优化。SFT：监督微调。GRPO：组相对策略优化。', 72, 615, 1136, 50, 22, { color: C.muted });
  source(s, '整理自 OVSegDT 第4节与 CompassNav 阅读笔记');
}
{
  const s = slide('OVSegDT：目标掩码怎样进入策略',
    '从图底部向上阅读。RGB和目标文字由冻结SigLIP编码，上一步动作使用查表嵌入，目标二值掩码由ResNet9编码。将这些特征拼接为每一步的观测向量，最近100步观测送入4层、8头、隐藏维度512的decoder-only Transformer。动作头预测6个高层离散动作的分布，价值头服务于强化学习，分割头重建当前目标掩码，辅助学习目标相关特征。分割头是训练时的辅助头，不应与提供输入掩码的外部YOLOE混淆。策略推理采用RGB，不需深度或里程计作为策略传感器输入；但训练时专家、奖励和真值掩码使用模拟器特权信息。',
    [pdf('ovseg','PDF第4页，图2与第4.1节；PDF第5页，辅助分割监督')]);
  await figure(s, 'ovsegdt_fig2', 72, 153, 630, 499, 'OVSegDT原图2：RGB、目标文字、上一步动作和目标掩码输入，时序Transformer与动作、价值、分割三个头');
  block(s, '输入', '当前RGB、目标文字、\n上一步动作、目标二值掩码。', 775, 154, 433, 85, 26);
  block(s, '时间建模', 'Transformer读取最近100步，\n预测动作分布与状态价值。', 775, 321, 433, 85, 26);
  block(s, '辅助监督', '重建目标掩码，促使序列特征\n保留目标位置线索。', 775, 488, 433, 85, 26);
  source(s, '来源：OVSegDT，图2（PDF第4页）。图中分割头为训练辅助头，输入掩码由外部感知提供');
}
{
  const s = slide('OVSegDT：BC 与 PPO 的自适应配比',
    'EALM追踪动作分布的Shannon熵，并取指数移动平均。正文将其在线性区间映射为PPO权重lambda，BC权重为1-lambda。较高熵说明策略动作分布较分散，增加BC；较低熵说明动作分布集中，提高PPO比重。权重连续变化，不要求人为指定切换时刻。这里的熵是模型不确定性代理，不保证低熵动作一定正确。整体损失还包括价值回归、熵奖励和辅助分割损失。使用真值掩码训练200M步，再对YOLOE预测掩码用PPO适配15M步。表1最终预测掩码配置在HM3D-OVON Val-Unseen的SR为44.7±0.4，SPL为20.6±0.2，三随机种子均值±标准差。依赖掩码质量及校准，不能由2张A100推出总训练成本很低。',
    [pdf('ovseg','PDF第5页，公式5–9；PDF第6页，训练与预测分割适配；PDF第7页，表1')]);
  sub(s, '使用动作熵的滑动平均，连续调节两种学习信号的权重');
  table(s, [
    ['策略状态', 'BC 比重', 'PPO 比重'],
    ['高熵：动作选择较分散', '增大，更多学习专家', '减小'],
    ['低熵：动作选择更集中', '减小', '增大，更多依赖交互奖励'],
  ], [450, 343, 343], 72, 219, [52, 88, 88], 26);
  heading(s, '适应预测掩码', 72, 490, 536, 30);
  text(s, '真值掩码训练2亿步，\n再使用YOLOE预测掩码适配1500万步。', 72, 551, 536, 98, 27);
  heading(s, 'HM3D-OVON Val-Unseen', 690, 490, 518, 30);
  text(s, 'SR 44.7 ± 0.4%，SPL 20.6 ± 0.2%\n目标掩码的质量仍然影响泛化。', 690, 551, 518, 98, 25);
  source(s, '整理自 OVSegDT 第4.2–4.3节及表1。指标为三随机种子均值±标准差；训练2 × A100');
}

// 25–26: task benchmarks, not an additional methods branch.
{
  const s = slide('评测基准：各自检验什么',
    '这四项属于数据集与评测资源，独立于五个方法分支。HM3D Semantics主要提供室内三维语义标注。HM3D-OVON用已见、同义词和未见类别切分考查开放词汇目标泛化。GOAT-Bench把类别、图像及语言目标串成连续子任务，检验同一环境中历史经验的复用。SG3D侧重任务上下文中的顺序目标定位和导航，后续目标可能隐含引用前序对象；SG-LLM是其中的模型基线。不同基准的传感器、成功条件、划分和序列协议不同，结果不能直接作为统一排名。',
    [note('00_数据集与任务基准/README.md'), note('00_数据集与任务基准/2024_SG3D_Sequential_Grounding_and_Navigation.pdf') + '，第1–3节', pdf('goat','第3–4节')]);
  sub(s, '任务定义决定应验证哪一种能力');
  table(s, [
    ['基准', '任务或资源', '主要检验内容'],
    ['HM3D Semantics', '室内三维场景语义标注', '提供物体与空间语义基础'],
    ['HM3D-OVON', '开放词汇类别目标导航', '已见、同义词及未见类别泛化'],
    ['GOAT-Bench', '多模态目标连续导航', '历史积累与跨目标复用'],
    ['SG3D / SG-LLM', '顺序目标定位与导航，\n以及相应模型基线', '任务上下文与跨步骤对象引用'],
  ], [290, 430, 416], 72, 207, [52, 85, 85, 85, 97], 25);
  source(s, '整理自四篇基准论文。跨论文比较需对齐目标类型、传感器、划分及成功条件');
}
{
  const s = slide('GOAT-Bench：连续多模态目标任务',
    '图1例子从同一环境出发，依次寻找躺椅、图中的烤箱、客厅茶几上的白色书等目标。每个episode包含5至10个子任务，目标形式可为类别名称、参考图像或自然语言描述。一个子任务结束后继续给下一个目标，环境与智能体状态不重置，因此此前探索过的物体和空间可以帮助后续搜索。原始论文第3节规定每子任务最多500步，并在目标实例1米内调用STOP作为成功条件，实际复现实验应始终核对所用版本的评测配置。评价既包括成功率，也包括SPL等路径效率。该基准为历史记忆和统一目标接口提供验证场景，不保证任何特定记忆方案有效。',
    [pdf('goat','PDF第1页，图1；PDF第3页，第3节任务定义')]);
  sub(s, '同一环境内依次完成5至10个子任务，环境与智能体状态持续保留');
  await figure(s, 'goatbench_fig1', 72, 192, 830, 467, 'GOAT-Bench原图1：类别、图像和语言目标组成的连续导航任务，完整目标序列与模态图例');
  block(s, '目标形式', '类别名称\n参考图像\n语言描述', 948, 209, 260, 112, 26);
  block(s, '历史价值', '复用已见物体及位置，\n减少后续重复探索。', 948, 403, 260, 112, 26);
  text(s, '评测成功率与路径效率，检验跨目标经验复用。', 948, 574, 260, 88, 23);
  source(s, '来源：GOAT-Bench，图1与第3节');
}

// 27: connect the branches without changing the existing taxonomy.
{
  const s = slide('五个方向的贡献位置',
    '该表是针对当前14篇方法文献的工作性归纳，按主要技术贡献安排一级分支，不宣称是整个领域唯一或互斥的分类。实际系统可能同时包含统一架构、三维表征、长期记忆、前沿搜索与训练优化。分析一篇文章时可以先问主要改变哪个环节，再给其他环节交叉标签。训练算力和传感器应作为独立比较属性，不能由其大小决定一级归类。五篇代表分别用于阐释一个具体路线，不能代替该分支的全部论文。',
    [classification, ...['omni','msg','astra','frontier','ovseg'].map(k => pdf(k,'方法章节'))]);
  sub(s, '按主要方法贡献归类，同一系统可以同时采用多个方向的组件');
  table(s, [
    ['方向', '重点改变的环节', '典型输出或载体', '代表论文'],
    ['系统组织架构', '模块职责与任务接口', '子目标、航点或统一决策', 'OmniNav'],
    ['环境表征', '观测信息的组织与表达', '场景图或连续特征', 'MSGNav'],
    ['历史记忆', '跨时间信息的保留与读取', '压缩历史或隐式缓存', 'AstraNav-Memory'],
    ['探索与目标搜索', '候选位置的价值与目标确认', '下一探索位置', 'OpenFrontier'],
    ['策略训练与优化', '监督、奖励与优化配比', '学到的导航策略', 'OVSegDT'],
  ], [250, 322, 298, 266], 72, 216, [52, 77, 77, 77, 77, 77], 24);
  source(s, '依据当前文献集归纳。训练算力与传感器作为独立属性保留在前9页');
}

if (pres.slides.items.length !== 27) throw new Error('Expected 27 total slides');
await fs.writeFile(path.join(build, 'deck.json'), JSON.stringify(pres.toProto()));
await fs.writeFile(path.join(build, 'new-slides.json'), JSON.stringify(metadata, null, 2));
await fs.writeFile(path.join(build, 'used-figures.json'), JSON.stringify(usedFigures, null, 2));
await fs.writeFile(path.join(build, 'slide-text.ndjson'), (await pres.inspect({ kind: 'slide,textbox,table,notes', maxChars: 600000 })).ndjson);
await (await PresentationFile.exportPptx(pres)).save(path.join(build, 'candidate.pptx'));
console.log('Exported 27-slide draft');
for (const [i, s] of pres.slides.items.entries()) {
  const stem = `slide-${String(i + 1).padStart(2, '0')}`;
  const blob = await pres.export({ slide: s, format: 'png', scale: 1 });
  await fs.writeFile(path.join(previews, stem + '.png'), new Uint8Array(await blob.arrayBuffer()));
  const layout = await s.export({ format: 'layout' });
  await fs.writeFile(path.join(previews, stem + '.layout.json'), await layout.text());
  console.log('Rendered ' + stem);
}
