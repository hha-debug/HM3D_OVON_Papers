import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {FileBlob,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const root=process.cwd();
const build=path.join(root,'.build_ppt','新版方法分类详解_20261017');
const source=path.join(root,'output','一级分支分类PPT','一级分支分类_含各方向性能对比_20261016.pptx');
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const req=createRequire(path.join(runtime,'__slides__.cjs'));
try{const {GlobalFonts}=req('@napi-rs/canvas');GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try{const {FontLibrary}=req('skia-canvas');FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const old=[...p.slides.items];
if(old.length!==32)throw new Error('Reference changed; inspect before editing');
const metrics=JSON.parse(await fs.readFile(path.join(root,'.build_ppt','一级分支分类_性能数据_20261016','curated-results.json'),'utf8'));
const records=new Map(metrics.records.map(r=>[r.id,r]));
const arch=await fs.readFile(path.join(build,'content-architecture.md'),'utf8');
const rep=await fs.readFile(path.join(build,'content-representation-memory.md'),'utf8');
const FONT='Microsoft YaHei';
const C={bg:'#FAFBFC',ink:'#182D40',muted:'#586D7B',teal:'#12776C',line:'#D6E0E6',white:'#FFFFFF',amber:'#8D5C13'};
const order=[],meta=[],evidence=[],usedFigures=[];
const local=rel=>path.join(root,rel);
const citeNotes=(notes,sources=[])=>`${notes}\n\n资料来源：\n${sources.join('\n')}`;

function editorial(text,key){
 const h=text.indexOf(`## ${key}`);if(h<0)throw new Error('Missing editorial note '+key);
 const end=text.indexOf('\n## ',h+4),section=text.slice(h,end<0?undefined:end);
 const m=section.match(/(?:### 讲者备注[^\n]*|\*\*讲者备注：\*\*)\n+([\s\S]*?)(?=\n### |$)/);
 if(!m)throw new Error('Missing speaker note '+key);
 return m[1].trim();
}
function text(s,t,x,y,w,h,size=26,o={}){
 const sh=s.shapes.add({geometry:'textbox',name:o.name||t.slice(0,28),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0,style:'solid'}});
 sh.text=t;sh.text.style={typeface:FONT,fontSize:size,color:o.color||C.ink,bold:!!o.bold,alignment:o.align||'left',verticalAlignment:'top',insets:0,wrap:'square',autoFit:'none',lineSpacing:o.spacing||1.12};return sh;
}
function slide(title,note='',sources=[],kind='method'){
 const s=p.slides.add();s.background.fill=C.bg;
 text(s,title,72,45,1136,65,title.length>29?42:46,{bold:true,name:'slide-title'});
 text(s,'00',1160,679,48,24,18,{align:'right',color:C.muted,name:'page-number'});
 s.speakerNotes.text=citeNotes(note,sources);order.push(s);meta.push({id:s.id,title,kind,sources});return s;
}
function footer(s,t){text(s,t,72,681,1070,25,17,{color:C.muted,name:'source-note'});}
function subtitle(s,t){text(s,t,72,128,1136,63,27,{color:C.muted});}
function table(s,values,widths,x=72,y=210,heights=null,size=25){
 heights??=[48,...values.slice(1).map(()=>76)];
 const t=s.tables.add({rows:values.length,columns:widths.length,left:x,top:y,width:widths.reduce((a,b)=>a+b,0),height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values});
 t.styleOptions={headerRow:true,bandedRows:false,bandedColumns:false};t.borders.assign({style:'solid',fill:C.line,width:.8});
 values.forEach((row,r)=>{t.rows[r].height=heights[r];row.forEach((v,c)=>{
  const cell=t.getCell(r,c);cell.fill=r===0?C.ink:C.white;
  cell.text.style={typeface:FONT,fontSize:r===0?23:size,color:r===0?C.white:C.ink,bold:r===0||c===0,alignment:'left',verticalAlignment:'middle',insets:{left:14,right:12,top:7,bottom:7},wrap:'square',autoFit:'none',lineSpacing:1.10};
  t.cells.block({row:r,column:c,rowCount:1,columnCount:1}).assign({margins:{left:14,right:12,top:7,bottom:7}});
 });});return t;
}
function keep(n,kind='retained',note=null){
 const s=old[n-1];if(!s)throw new Error('Missing source slide '+n);order.push(s);meta.push({id:s.id,sourceSlide:n,kind});
 if(note)s.speakerNotes.text=note;return s;
}
async function figure(s,file,x,y,w,h,alt){
 const bytes=new Uint8Array(await fs.readFile(file));
 s.images.add({blob:bytes,contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});
 usedFigures.push({id:s.id,file,alt});
}
function mechanism(title,lead,steps,insight,bounds,note,sources=[]){
 const s=slide(title,note,sources);subtitle(s,lead);
 steps.forEach(([label,body],i)=>{
  const y=224+i*91;
  text(s,String(i+1).padStart(2,'0'),72,y,62,40,32,{bold:true,color:C.teal});
  text(s,label,154,y,342,39,28,{bold:true});
  text(s,body,520,y,688,73,27);
 });
 text(s,insight,72,606,1136,35,25,{bold:true,color:C.teal});
 text(s,bounds,72,647,1136,26,20,{color:C.muted});
 footer(s,'机制依据原论文与阅读笔记归纳。代表实现和详细来源见讲稿备注');return s;
}
function num(v){return v==null?'—':String(v);}
function pair(id,label=null,name=null,sr=null){
 const r=records.get(id);if(!r)throw new Error('Missing metric '+id);
 return [label||`${r.benchmark} / ${r.split}`,name||metrics.papers[r.paper].name,sr||num(r.sr),num(r.spl)];
}
function metricNotes(ids){return ids.map(id=>{const r=records.get(id);return `${id}：${metrics.papers[r.paper].name}；${r.benchmark} / ${r.split}；SR ${r.sr??'未报告'}%，SPL ${r.spl??'未报告'}%。${r.source_pdf}，PDF第${r.source_page}页，${r.source_table}。协议：${r.protocol}。${r.note}`;}).join('\n');}
function intro(title,question,blocks,rows,ids,foot,note){
 const s=slide(title,note+'\n\n'+metricNotes(ids),[local('一级分支分类.md')],'direction-intro');
 text(s,question,72,128,1136,38,27,{color:C.muted});
 text(s,'方法类别',72,176,325,34,27,{bold:true,color:C.teal});
 text(s,'已收录论文的较高报告值（%）',432,176,776,34,25,{bold:true,color:C.teal});
 const blockH=blocks.length===2?176:132;
 blocks.forEach(([h,b],i)=>{const y=234+i*blockH;text(s,h,72,y,320,64,26,{bold:true,color:C.teal});text(s,b,72,y+72,320,91,25);});
 table(s,[['Benchmark／设置','论文／配置','SR','SPL'],...rows],[310,250,108,108],432,216,[46,...rows.map(()=>61)],22);
 text(s,foot,72,635,1136,40,18,{color:C.muted});
 footer(s,'SR：成功率。SPL：按路径长度加权的成功率。仅限已收录论文，各评测协议分别展示');
 evidence.push({id:s.id,records:ids});return s;
}

// Opening: the current taxonomy, with methods as the organizing unit.
{
 const s=slide('开放词汇导航的方法分类',
  '本报告依照最新版一级分支分类，先按论文主要贡献划分五个方向，再按可复用的方法机制归并为八类。重点解释每类如何处理输入、维护状态并形成决策，再用代表论文展示具体实现。方法类别可组合，一篇论文的主归属不排除其采用其他类别的组件。指标范围仅限已收录的十四篇方法论文，数据集和基准单列。',
  [local('一级分支分类.md')],'cover');
 text(s,'HM3D-OVON-Papers',72,177,1136,60,36,{color:C.teal});
 text(s,'五个研究方向，八类方法范式',72,277,1136,82,48,{bold:true});
 text(s,'方法机制、代表论文与评测结果',72,395,1136,48,31,{color:C.muted});
 text(s,'训练算力置于方法讲解之后',72,458,1136,40,27,{color:C.muted});
 text(s,'依据本地已收录文献与阅读笔记',72,588,1136,32,22,{color:C.muted});
 footer(s,'2026年10月17日');
}
{
 const s=slide('方法分类总览',
  '系统组织架构关注职责和接口，环境表征关注空间信息怎样组织，历史记忆关注过去信息怎样保留与读取，探索与目标搜索关注未知目标出现前怎样选择位置，训练与优化关注策略从什么学习信号改进。二级分类概括可复用机制，而具体模型与算法是类内差异。图表按主要贡献列出论文。二维和三维属于表征属性，任务数量与训练算力另外记录。',
  [local('一级分支分类.md')],'taxonomy');
 table(s,[
  ['一级方向','二级方法类别','主要归属文献'],
  ['系统组织架构','分层与模块化协作\n多能力统一联合建模','TANGO、SuperNav、OmniNav\nD3D-VLP、Uni-NaVid、MTU3D'],
  ['环境表征','显式地图与场景结构\n学习式连续空间特征','MSGNav\nSoftNav'],
  ['历史记忆','观察历史的压缩与重放\n递归状态与缓存更新','AstraNav-Memory\nJanusVLN'],
  ['探索与目标搜索','语义引导的前沿搜索','VLFM、OpenFrontier'],
  ['导航策略\n训练与优化','模仿学习与强化学习结合','OVSegDT、CompassNav'],
 ],[248,422,466],72,158,[49,97,88,88,70,70],25);
 text(s,'主要归属用于组织汇报。显式结构、连续特征、历史重放与缓存可以组合。',72,640,1136,35,23,{color:C.muted});
 footer(s,'分类依据：一级分支分类.md。数据集与评测基准另列');
}

// 1. System organization: two reusable method families.
intro('系统组织架构：方法与评测概览','研究问题：任务决策怎样与感知、规划和执行协作',[
 ['分层与模块化协作','通过工具或子目标接口，\n衔接高层决策与局部执行'],
 ['多能力统一联合建模','共享表示与决策接口，\n联合处理多种能力或任务'],
],[
 pair('arch_omni_U','HM3D-OVON / Val-Unseen'),pair('arch_mtu_goat_U','GOAT-Bench / Val-Unseen'),
 pair('arch_omni_r2r','R2R-CE / Val-Unseen'),pair('arch_omni_rxr','RxR-CE / Val-Unseen'),
 pair('arch_d3d_sg3d','SG3D-Nav / 子任务与整任务',null,'33.7 s\n13.8 t'),
],['arch_omni_U','arch_mtu_goat_U','arch_omni_r2r','arch_omni_rxr','arch_d3d_sg3d'],
 'OmniNav OVON按1 m判据。SG3D给定真实计划，s／t为子任务／整任务SR。其他结果见后续页。',
 '比较范围为本方向六篇已收录方法论文。OmniNav采用完整慢系统与CoT配置，MTU3D为物体与前沿统一决策。D3D-VLP的SG3D结果使用给定真实计划的评测设置，不能据此推断完整任务规划性能。两类组织机制可以组合，不以任务数、传感器或算力决定归类。');
mechanism('分层与模块化协作',
 '高层处理任务意图，通过明确接口调用专门的执行模块',[
 ['理解任务与当前状态','读取目标、当前观测和已完成进度'],
 ['选择接口与子目标','输出程序调用、工具参数或空间子目标'],
 ['执行专门模块','感知、局部规划或策略完成短程移动'],
 ['接收执行反馈','根据新观测更新任务状态与后续选择'],
 ],'类内实现：TANGO程序编排，SuperNav工具循环，OmniNav快慢协作',
 '收益：模块可复用、可替换。限制：接口误差传递，高层证据可能滞后。',
 editorial(arch,'页面 A1'),[local('03_大模型规划与工具调用/read-Tango.md'),local('03_大模型规划与工具调用/read-SuperNav.md'),local('05_视觉语言动作决策与视频记忆/read-OmniNav.md')]);
keep(6,'representative',citeNotes(editorial(arch,'页面 A2'),[local('05_视觉语言动作决策与视频记忆/read-OmniNav.md'),'OmniNav §3，Fig.1，式(1)–(4)']));
mechanism('多能力统一联合建模',
 '用共享表示或输出接口，让相关能力共同参与一次决策',[
 ['形成统一输入','将指令、观测、空间与历史编码为模型输入'],
 ['共享语义与空间理解','联合建模任务意图、目标实体和可行动位置'],
 ['产生能力相关输出','输出结构化决策、任务动作或候选评分'],
 ['联合训练并更新决策','多源监督训练共享模型，执行后更新状态'],
 ],'类内实现：结构化决策链、多任务动作生成、物体与前沿统一评分',
 '收益：减少能力间表示割裂。限制：依赖任务对齐与数据覆盖，仍可保留执行器。',
 editorial(arch,'页面 B1'),[local('04_三维空间表征与目标推理/read-D3D.md'),local('05_视觉语言动作决策与视频记忆/read-UniNavid.md'),local('04_三维空间表征与目标推理/read-MTU.md')]);
{
 const s=slide('D3D-VLP：计划、目标定位与航点联合决策',editorial(arch,'页面 B2'),[local('04_三维空间表征与目标推理/read-D3D.md'),'D3D-VLP §3.1–3.3，Figs.2–3']);
 await figure(s,path.join(build,'assets','d3d_fig2_method.png'),72,132,1136,436,'D3D-VLP原论文核心方法图，动态三维记忆、结构化计划、目标定位与导航输出');
 text(s,'环境记忆保存三维证据，决策记忆保存计划、目标与已执行轨迹。',72,586,1136,36,26,{bold:true,color:C.teal});
 text(s,'部分标注样本只对已有监督项计算损失。航点仍交由底层控制器执行。',72,635,1136,36,24);
 footer(s,'来源：D3D-VLP 方法章节，原论文框架图。图号与裁剪记录见素材清单');
}
{
 const s=slide('同类架构的接口差异',editorial(arch,'页面 C'),[local('一级分支分类.md'),local('方法分类索引.md')]);
 table(s,[
  ['方法类别','论文例子','关键接口'],
  ['分层与模块化协作','TANGO','程序与可调用原语'],
  ['分层与模块化协作','SuperNav','技能指引、工具调用与图像点'],
  ['分层与模块化协作','OmniNav','空间子目标与连续航点'],
  ['多能力统一联合建模','D3D-VLP','计划、三维目标与航点决策链'],
  ['多能力统一联合建模','Uni-NaVid','统一视频输入与任务标记'],
  ['多能力统一联合建模','MTU3D','物体和探索前沿的统一评分'],
 ],[325,260,551],72,156,[48,66,66,66,66,66,66],25);
 text(s,'两类可以共存：OmniNav共享多任务骨干，D3D-VLP与MTU3D仍保留执行模块。',72,636,1136,36,23,{color:C.muted});
 footer(s,'论文作为同类方法的实现例子。主分类不替代二维／三维、任务范围或资源条件');
}
keep(3,'benchmark-results');keep(4,'benchmark-results');keep(5,'benchmark-results');

// 2. Representations: structural records and learned feature interfaces.
intro('环境表征：方法与评测概览','研究问题：跨视角观测怎样形成可查询、可决策的环境状态',[
 ['显式地图与场景结构','用格子、实体与关系\n保存位置、语义和证据'],
 ['学习式连续空间特征','用空间向量表达实体，\n经投影或评分接入决策'],
],[pair('env_soft_ovon_U','HM3D-OVON\nUnseen，0.25 m'),pair('env_soft_goat_U','GOAT-Bench / Unseen','SoftNav（SR较高）'),pair('env_msg_goat','GOAT-Bench / Unseen','MSGNav（SPL较高）'),pair('env_msg_hm3d','HM3D-ObjNav / Val'),pair('env_soft_sg3d','SG3D / 子任务与整任务',null,'47.2 s\n16.6 t')],
 ['env_soft_ovon_U','env_soft_goat_U','env_msg_goat','env_msg_hm3d','env_soft_sg3d'],
 'GOAT两篇评测子集规模不同，保留各自结果，不作严格排名。二维／三维与显式／连续属于不同属性。',
 'SoftNav GOAT每划分30 episodes，MSGNav为360 episodes与2669子任务。较高SR与SPL来自不同报告，必须保留各自完整结果对。SoftNav三维特征输入与二维坐标输出属于不同处理阶段。显式对象身份和连续向量可以同时存在。');
mechanism('显式地图与场景结构',
 '把空间单元、实体及关系保存成可查询的环境记录',[
 ['建立空间记录','对齐多帧观测，生成地图格子或物体节点'],
 ['合并重复观测','维护位置、类别、对象身份与图像证据'],
 ['按当前目标读取','查询相关区域、物体、关系或支持图像'],
 ['转换为导航子目标','选择探索前沿、目标位置或可见视点'],
 ],'类内实现：二维语义价值地图、三维物体图与视觉证据索引',
 '收益：证据与位置易检查。限制：漏检、位姿误差与错误关联会随记录积累。',
 editorial(rep,'R1'),[local('04_三维空间表征与目标推理/read-MSGNav.md'),local('方法分类索引.md')]);
keep(10,'representative',citeNotes(editorial(rep,'R2'),[local('04_三维空间表征与目标推理/read-MSGNav.md'),'MSGNav §3.2–3.3，Fig.3，Algorithm 1']));
mechanism('学习式连续空间特征',
 '用特征向量传递外观与几何信息，学习目标与实体的决策关系',[
 ['编码空间实体','把物体、区域与前沿表示成连续特征向量'],
 ['对齐目标与特征','通过投影、注意力或查询解码接入决策模型'],
 ['联合评分或生成','对候选打分，或生成下一目标与移动位置'],
 ['更新环境特征','执行后合并新观测，刷新对象库与前沿'],
 ],'类内实现：SoftNav空间soft tokens，MTU3D查询评分，D3D-VLP三维tokens',
 '收益：保留丰富连续信息。限制：含义较难直接解释，依赖编码器和训练分布。',
 editorial(rep,'R3'),[local('04_三维空间表征与目标推理/read-SoftNav.md'),local('04_三维空间表征与目标推理/read-MTU.md'),local('04_三维空间表征与目标推理/read-D3D.md')]);
{
 const s=slide('SoftNav：三维特征的soft-token接口',editorial(rep,'R4'),[local('04_三维空间表征与目标推理/read-SoftNav.md'),'SoftNav §III，Fig.2上半部分，Table V']);
 await figure(s,path.join(build,'assets','softnav_encoding_detail.png'),72,157,1136,360,'SoftNav图2上半部分：视觉历史压缩，三维查询向量经768至2048维投影形成soft tokens');
 text(s,'PQ3D提供物体与前沿向量，MLP将768维特征投影到2048维。',72,550,1136,43,28,{bold:true,color:C.teal});
 text(s,'空间向量直接进入VLM。视觉分支另保留最近16帧的压缩历史。',72,612,1136,45,26);
 footer(s,'来源：SoftNav Fig.2上半部分。下页继续展示融合决策与执行，原图两部分均保留');
}
{
 const s=slide('SoftNav：空间、视觉历史与语言联合决策',
  editorial(rep,'R4')+'\n\n本页延续上一页的特征编码，展示三类输入的联合注意力与最终前沿执行。模型输入包含视觉历史、三维实体soft tokens和任务文本；生成的坐标需要通过几何约束转成合法前沿。图中二维执行平面与三维感知信息处在不同处理阶段。',
  [local('04_三维空间表征与目标推理/read-SoftNav.md'),'SoftNav §III，Fig.2下半部分，Algorithm 1']);
 await figure(s,path.join(build,'assets','softnav_decision_detail.png'),72,145,1136,393,'SoftNav图2下半部分：视觉tokens、三维soft tokens与文本共同输入Qwen，输出前沿并执行');
 text(s,'视觉历史、三维实体tokens与指令共同参与注意力计算。',72,567,1136,40,28,{bold:true,color:C.teal});
 text(s,'输出二维探索坐标，再吸附到合法前沿并交由导航器执行。',72,620,1136,39,26);
 footer(s,'来源：SoftNav Fig.2下半部分。二维坐标输出不改变三维环境表征的归属');
}
keep(8,'benchmark-results');keep(9,'benchmark-results');

// 3. Historical observations versus persistent model state.
intro('历史记忆：方法与评测概览','研究问题：有限上下文中怎样利用过去见过的环境',[
 ['观察历史的压缩与重放','保留图像或视觉tokens，\n本次决策重新读取历史'],
 ['递归状态与缓存更新','保留可更新的内部状态，\n新观测增量读写历史缓存'],
],['mem_astra_ovon_U','mem_astra_goat_U','mem_janus_r2r','mem_janus_rxr'].map(id=>pair(id)),
 ['mem_astra_ovon_U','mem_astra_goat_U','mem_janus_r2r','mem_janus_rxr'],
 'AstraNav按论文1 m判据；JanusVLN为额外数据版、单RGB。目标搜索与路线指令任务分别展示。',
 '两类方法关注历史如何进入当前决策。AstraNav图像和位姿历史不等于跨步持续语言模型KV。JanusVLN公开评测中VGGT几何缓存跨步复用，语义分支重放采样历史。Janus附录OVON结果44.9/31.7仅作补充，披露细节不足以和AstraNav严格排名。');
mechanism('观察历史的压缩与重放',
 '保存可再次读取的视觉经历，在当前决策中提供历史上下文',[
 ['保存观察与位置','存储图像或已编码视觉tokens，必要时关联位姿'],
 ['控制历史信息量','减少每帧tokens、分级压缩或合并相似观察'],
 ['重放选取的历史','与当前观测及目标共同输入本次决策模型'],
 ['利用过去出现的目标','后续任务重读经历，减少重复探索'],
 ],'类内实现：AstraNav每帧压缩，Uni-NaVid分级历史，SoftNav近期窗口',
 '收益：可复用视觉经历。限制：历史越长成本越高，强压缩会损失细节。',
 editorial(rep,'R5'),[local('05_视觉语言动作决策与视频记忆/read-AstraNav.md'),local('05_视觉语言动作决策与视频记忆/read-UniNavid.md'),local('04_三维空间表征与目标推理/read-SoftNav.md')]);
{
 const s=keep(14,'representative',citeNotes(editorial(rep,'R6'),[local('05_视觉语言动作决策与视频记忆/read-AstraNav.md'),'AstraNav-Memory §3，Fig.2，Tables 3–4']));
 const title=s.shapes.items.find(sh=>sh.name==='slide-title');
 if(!title)throw new Error('Missing Astra title');
 title.text='AstraNav：压缩后读取长期历史';
}
mechanism('递归状态与缓存更新',
 '把历史保留在跨步更新的状态中，每次只增量处理新观察',[
 ['读取历史状态','当前帧查询已保存的几何特征或Key／Value'],
 ['写入当前观察','新特征进入状态，供后续导航步使用'],
 ['维护有限容量','保留初始锚点与近期窗口，移除中间历史'],
 ['融合当前决策','将历史增强的空间特征与语义、指令结合'],
 ],'KV缓存是跨步状态的一种实现，视觉特征缓存与语言模型KV需分别说明',
 '收益：减少旧观察的重复编码。限制：窗口会遗忘，旧状态误差可能继续传播。',
 editorial(rep,'R7'),[local('05_视觉语言动作决策与视频记忆/read-JANUSVLN.md'),'JanusVLN §3.2，Fig.2，Appendix B']);
{
 const s=slide('JanusVLN：语义历史与流式几何缓存',editorial(rep,'R8'),[local('05_视觉语言动作决策与视频记忆/read-JANUSVLN.md'),'JanusVLN §3.2–3.3，Fig.2；笔记核对公开评测实现']);
 await figure(s,path.join(build,'assets','janusvln_fig2_method.png'),72,132,1136,386,'JanusVLN原论文双隐式记忆框架，语义特征与流式几何特征融合预测动作');
 table(s,[['分支','公开评测路径'],['语义分支','重放采样历史图像，最多9张'],['几何分支','VGGT跨步KV，保留初始8帧与近期48帧']], [235,901],72,535,[40,46,46],23);
 footer(s,'来源：JanusVLN Fig.2及官方实现核对。纯RGB输入仍可使用学习到的三维先验');
}
keep(13,'benchmark-results');

// 4. Both collected approaches instantiate semantic frontier search.
intro('探索与目标搜索：方法与评测概览','研究问题：目标尚未出现时，下一探索位置怎样选择',[
 ['语义引导的前沿搜索','以未知区域边界为候选，\n按目标相关性选择下一位置'],
 ['同类方法的实现差异','地图赋值或图像前沿评分，\n可再结合信息增益与距离'],
],[pair('exp_vlfm_gibson','Gibson / Val','VLFM†'),pair('exp_open_hm3d','HM3D ObjectNav / Val'),pair('exp_open_mp3d','MP3D ObjectNav / Val'),pair('exp_vlfm_ovon_S','HM3D-OVON / Seen','VLFM†'),pair('exp_vlfm_ovon_Y','HM3D-OVON / Synonyms','VLFM†'),pair('exp_open_ovon','HM3D-OVON / Unseen')],
 ['exp_vlfm_gibson','exp_open_hm3d','exp_open_mp3d','exp_vlfm_ovon_S','exp_vlfm_ovon_Y','exp_open_ovon'],
 '† 本方向仅一篇报告该benchmark或划分。VLFM的OVON结果来自基准论文重评，未报告项不补零。',
 'VLFM与OpenFrontier是同一类语义引导前沿搜索的不同实现。OpenFrontier论文同表列出VLFM，在HM3D、MP3D与OVON Unseen的SR/SPL更高；其余划分不能外推。前沿相关性不是真实目标存在概率的保证，执行后还需要目标确认。');
mechanism('语义引导的前沿搜索',
 '先评价哪些未知区域值得探索，再将候选位置交给导航执行器',[
 ['产生探索候选','从占据地图或当前图像中识别探索前沿'],
 ['评价目标相关性','用图文相似度或视觉语言模型评价搜索方向'],
 ['权衡收益与代价','结合信息增益、置信度或到达距离选子目标'],
 ['移动后更新与核验','更新观察和候选，发现疑似目标后再次确认'],
 ],'VLFM与OpenFrontier共享“候选产生、语义评价、执行反馈”的方法链',
 '收益：复用预训练语义能力。限制：语义先验会误导，目标误检与局部卡住仍会发生。',
 '语义前沿搜索把连续导航拆成候选位置选择与局部执行。寻找微波炉时，模型可以优先评价厨房相关前沿；这只是依据场景先验调整搜索顺序，并不能证明目标存在。VLFM把相关性投到二维价值地图并跨视角融合，OpenFrontier则直接评价图像标记的视觉前沿，再将其定位到三维并管理。两者都需要可达性、局部导航和最终目标确认，类内差异不必分别提升为一级方法。无需新增导航训练指复用已有组件，不代表组件没有预训练成本。',
 [local('方法分类索引.md'),local('02_语义地图与前沿探索/read.md'),'VLFM §IV；OpenFrontier §III，Algorithm 1']);
keep(17,'representative',citeNotes('OpenFrontier在RGB图像标记视觉前沿，FrontierNet预测潜在信息增益，视觉语言模型根据目标评价每个方向。深度与相机位姿将候选投到三维，全局前沿集合负责合并重复位置、移除已清空或不可达项。效用结合相关性、信息增益和距离。发现疑似目标后，分割与几何模块提出观察位姿，到达后再用VLM核验。其共同方法仍是语义前沿搜索，新增的接口主要是图像中的前沿候选与稀疏三维候选管理。',[local('02_语义地图与前沿探索/read.md'),'OpenFrontier Fig.2，§III，Algorithm 1']));
{
 const s=slide('前沿搜索的两种实现',
  '两篇都先提出候选，再评价语义价值，但评价发生的位置不同。VLFM对整个观测计算图文相关性，并在二维地图中累积带置信度的价值，随后读取前沿区域的分数。OpenFrontier对图像中的每个视觉前沿打分，结合信息增益和距离，维护稀疏三维候选。后者无需把稠密三维语义地图作为语义决策的必要接口，但仍使用几何信息。两者的导航性能既受语义评价影响，也受候选覆盖、局部规划与目标核验影响。',
  [local('方法分类索引.md'),local('02_语义地图与前沿探索/read.md')]);
 table(s,[['比较环节','VLFM','OpenFrontier'],['候选来源','二维占据地图的前沿','RGB图像中的视觉前沿'],['语义评价','图文相似度投影到价值地图','VLM直接评价标记的前沿'],['跨视角组织','地图价值与置信度融合','三维前沿集合合并与清理'],['子目标选择','读取高价值前沿','相关性、信息增益与距离'],['发现疑似目标后','检测、分割与深度定位','前往观察位姿后VLM核验']], [230,453,453],72,180,[48,76,76,76,76,76],25);
 text(s,'空间属性：VLFM为二维地图；OpenFrontier结合二维图像候选与三维位置管理。',72,635,1136,38,23,{color:C.muted});
 footer(s,'整理自VLFM §IV和OpenFrontier §III。二者属于同一方法范式');
}

// 5. Demonstrations and rewards are combined learning signals.
intro('导航策略训练与优化：方法与评测概览','研究问题：示范监督与环境奖励怎样共同改进导航策略',[
 ['模仿学习与强化学习结合','先从示范建立决策能力，\n再或同时用奖励改进策略'],
 ['类内训练设计','BC／SFT与PPO／GRPO，\n辅助监督、权重与奖励设计'],
],[pair('train_ovseg_U','HM3D-OVON / Unseen'),pair('train_compass_ovon','HM3D-OVON / Unseen'),pair('train_compass_hm3d2','HM3D ObjectNav / 表2'),pair('train_compass_mp3d','MP3D ObjectNav / Val'),pair('train_compass_iin','Instance-ImageNav / 表2'),pair('train_compass_procthor','ProcTHOR / 未见环境')],
 ['train_ovseg_U','train_compass_ovon','train_compass_hm3d2','train_compass_mp3d','train_compass_iin','train_compass_procthor'],
 'OVON较高SR为OVSegDT，较高SPL为CompassNav，分别保留整对数值。不同传感器与协议不作统一排名。',
 '两篇都是示范信号和奖励信号结合的训练方法。OVSegDT连续调整BC和PPO权重，CompassNav先SFT再GRPO，不能据此当成两个互不相干的方法类别。CompassNav HM3D表1与表2的版本对应不充分，按原表设置保留，不把61.6视为56.6的同条件更新。OVSegDT为三种子均值，标准差在完整结果页展示。');
mechanism('模仿学习与强化学习结合',
 '示范告诉策略怎样行动，奖励让策略比较行动带来的后果',[
 ['从示范学习决策','用专家动作或教师回答训练BC／SFT初始能力'],
 ['构建策略优化信号','按导航进展、成功或候选动作质量给奖励'],
 ['联合或分阶段优化','同时加权BC与PPO，或先SFT再GRPO'],
 ['适应部署时的输入','用预测掩码或可行动作候选缩小训练执行差异'],
 ],'共同范式：示范监督与奖励优化结合。配比策略和奖励形状属于类内设计。',
 '收益：利用示范并改进决策质量。限制：依赖示范覆盖、奖励质量与训练预算。',
 '模仿学习降低初始探索难度，让模型先获得基本动作或回答格式；强化学习则通过奖励比较行动的后果。两篇的区别主要是信号如何组合。OVSegDT用策略熵的平滑统计动态调整行为克隆与PPO的混合权重，辅助分割保留目标相关特征。CompassNav先用教师分析与动作做SFT，再对同一观察采样多个候选回答，用GRPO优化到目标距离构造的奖励。奖励所用真实目标坐标只存在于训练标注，不向测试策略提供。',
 [local('01_模仿学习与强化学习导航/read.md'),local('05_视觉语言动作决策与视频记忆/read-CompassNav.md')]);
keep(21,'representative',citeNotes('OVSegDT将当前RGB、目标文本、上一动作和目标二值掩码编码，利用最近100步的Transformer上下文产生动作与价值，同时重建目标掩码。目标掩码提供定位线索，辅助分割损失约束状态保留目标信息。训练用策略熵的平滑统计调节BC与PPO权重：策略不确定时更多依靠示范，动作集中后提高奖励优化作用。真值掩码主训练之后，再使用YOLOE预测掩码适配，减少实际感知误差带来的分布差异。',[local('01_模仿学习与强化学习导航/read.md'),'OVSegDT Fig.2；§4.2–4.3，§5 Training details']));
{
 const s=slide('CompassNav：SFT之后用GRPO比较动作质量',
  'CompassNav先在RGB图像画出基于深度与几何后端生成的可行动作箭头。SFT学习成功教师的分析文本与动作编号，建立基本的决策与输出能力。RFT阶段对同一状态采样多个回答，以候选落点到目标的测地距离计算连续质量分数。最佳候选与次佳候选差距大时，增加最优动作奖励；差距小时保留接近的评分。奖励只验证选出的动作，不逐句验证分析文本。真实目标坐标和距离用于训练标签，推理输入只含目标与带候选箭头的观测。',
  [local('05_视觉语言动作决策与视频记忆/read-CompassNav.md'),'CompassNav §3–4，Figs.3–4，式(1)–(6)，Appendix C']);
 const compassPath=path.join(build,'assets','compassnav_method.png');
 try{await figure(s,compassPath,72,135,1136,365,'CompassNav原论文SFT与GRPO训练框架，候选动作距离标签与差距感知奖励');}
 catch(e){if(e.code!=='ENOENT')throw e;table(s,[['训练阶段','学习信号','作用'],['SFT初始化','教师分析与动作编号','建立基本决策能力'],['GRPO优化','候选动作的连续质量奖励','改进动作间的比较']], [200,490,446],72,159,[48,90,90],27);}
 text(s,'差距感知奖励的作用',72,434,1136,39,28,{bold:true,color:C.teal});
 table(s,[['候选动作关系','奖励倾向'],['最佳与次佳距离接近','给接近的连续评分，最优额外奖励较弱'],['最佳候选明显更好','加大最优候选的额外奖励']], [365,771],72,482,[44,56,56],25);
 text(s,'真实目标坐标仅用于训练标签；分析文字的正确性未被逐句监督验证。',72,649,1136,27,22,{color:C.muted});
 footer(s,'来源：CompassNav §3–4、Fig.4及奖励公式。训练与推理可见信息分别说明');
}
keep(20,'benchmark-results');

// Synthesis and benchmark context precede all compute pages.
{
 const s=slide('方法类别怎样组合成一个导航系统',
  '五个一级方向描述不同环节，因此一套系统可以同时采用多种方法。显式三维物体图可以附带连续特征，保存的图像也可以被压缩重放；分层系统可以使用统一多任务骨干。代表论文的主要归属用于组织文献，不是限制组件组合。讨论新研究时，应先指明改变的是哪一环节，再明确维度、传感器、任务与训练预算，最后在相同协议下验证改善。',
  [local('一级分支分类.md'),local('方法分类索引.md')],'synthesis');
 table(s,[['设计环节','方法选择','需要单独报告的条件'],['职责与接口','分层模块协作／统一联合建模','模块依赖与执行器'],['环境状态','显式地图结构／连续空间特征','二维或三维、深度与位姿'],['历史利用','压缩重放／递归缓存','历史长度、信息损失与更新方式'],['探索决策','语义引导的前沿搜索','候选覆盖、可达性与目标核验'],['策略学习','示范监督与奖励优化结合','数据规模、训练配置与奖励定义']], [235,496,405],72,170,[48,78,78,78,78,78],25);
 text(s,'比较新方法时，先对齐任务、传感器与评测协议，再讨论具体机制的贡献。',72,630,1136,38,25,{color:C.teal,bold:true});
 footer(s,'方法可组合。文献主归属、表征维度和训练算力分别记录');
}
keep(23,'benchmark-context');keep(24,'benchmark-context');
for(let n=26;n<=32;n++)keep(n,'compute');

// Bring compute summaries into line with the current method families.
const computeLines=new Map([
 [26,['分层与模块化协作：TANGO、SuperNav、OmniNav','多能力统一联合建模：D3D-VLP、Uni-NaVid、MTU3D']],
 [27,['显式地图与场景结构','学习式连续空间特征']],
 [28,['观察历史的压缩与重放','递归状态与缓存更新']],
 [29,['语义引导的前沿搜索','VLFM与OpenFrontier采用不同的语义评价接口']],
 [30,['模仿学习与强化学习结合','联合加权BC／PPO，或先SFT再GRPO']],
]);
for(const [n,lines] of computeLines){
 const s=old[n-1];
 const candidates=s.shapes.items.filter(sh=>sh.name!=='page-number'&&sh.position.top>=115&&sh.position.top<200&&sh.text?.toString?.());
 if(candidates.length){candidates[0].text=lines.join('\n');}
}
// Retained source pages carry complete metric citations. Add cross-page scope.
for(const m of meta){if(m.sourceSlide){const s=old[m.sourceSlide-1];s.speakerNotes.text+='\n\n新版分类说明：具体论文作为方法范式内实例，原始指标和统计协议保留。依据：'+local('一级分支分类.md');}}

const ids=order.map(s=>'sl/'+s.id);p.slides.keep(ids);p.slides.reorder(ids);
if(p.slides.items.length!==44)throw new Error('Expected 44 slides, got '+p.slides.items.length);
for(const [i,s] of p.slides.items.entries()){
 const page=s.shapes.items.find(sh=>sh.name==='page-number');if(!page)throw new Error('Missing page '+i);page.text=String(i+1).padStart(2,'0');
}
const slideNumber=id=>p.slides.items.findIndex(s=>s.id===id)+1;
await fs.writeFile(path.join(build,'deck-metadata.json'),JSON.stringify(meta.map(m=>({...m,slide:slideNumber(m.id)})),null,2));
await fs.writeFile(path.join(build,'slide-evidence.json'),JSON.stringify(evidence.map(m=>({...m,slide:slideNumber(m.id)})),null,2));
await fs.writeFile(path.join(build,'used-figures.json'),JSON.stringify(usedFigures.map(m=>({...m,slide:slideNumber(m.id)})),null,2));
await fs.writeFile(path.join(build,'native-table-slides.json'),JSON.stringify(p.slides.items.flatMap((s,i)=>s.tables.items.length?[i+1]:[])));
await fs.writeFile(path.join(build,'slide-text.ndjson'),(await p.inspect({kind:'slide,textbox,table,notes',maxChars:1500000})).ndjson);
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const dir=path.join(build,'previews');await fs.mkdir(dir,{recursive:true});
for(const [i,s] of p.slides.items.entries()){
 const blob=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(dir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 if((i+1)%8===0)console.log('Rendered',i+1);
}
console.log(JSON.stringify({slides:p.slides.items.length,introductions:meta.filter(m=>m.kind==='direction-intro').map(m=>slideNumber(m.id)),computeStarts:meta.filter(m=>m.kind==='compute').map(m=>slideNumber(m.id))[0]}));
