import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {FileBlob,PresentationFile} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const root=process.cwd();
const build=path.join(root,'.build_ppt','一级分支分类_性能数据_20261016');
const source=path.join(root,'output','一级分支分类PPT','一级分支分类_先方法后算力_20261016.pptx');
const data=JSON.parse(await fs.readFile(path.join(build,'curated-results.json'),'utf8'));
const records=new Map(data.records.map(r=>[r.id,r]));
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const req=createRequire(path.join(runtime,'__slides__.cjs'));
try {const {GlobalFonts}=req('@napi-rs/canvas');if(!GlobalFonts.families.some(f=>f.family==='Microsoft YaHei'))GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try {const {FontLibrary}=req('skia-canvas');if(!FontLibrary.families.includes('Microsoft YaHei'))FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const p=await PresentationFile.importPptx(await FileBlob.load(source));
if(p.slides.items.length!==27)throw new Error('Expected 27 source slides');
const original=[...p.slides.items];
const C={bg:'#FAFBFC',ink:'#182D40',muted:'#586D7B',teal:'#12776C',line:'#D6E0E6',white:'#FFFFFF',amber:'#8D5C13'};
const FONT='Microsoft YaHei';
const replacements=new Map();
const insertions=new Map();
const newSlides=[];
const slideEvidence=[];
const canonicalName=k=>data.papers[k].name;

function text(s,t,x,y,w,h,size=26,o={}){
 const sh=s.shapes.add({geometry:'textbox',name:o.name||t.slice(0,25),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0,style:'solid'}});
 sh.text=t;sh.text.style={typeface:FONT,fontSize:size,color:o.color||C.ink,bold:!!o.bold,alignment:o.align||'left',verticalAlignment:'top',insets:0,wrap:'square',autoFit:'none',lineSpacing:o.spacing||1.12};return sh;
}
function make(title,note=''){
 const s=p.slides.add();s.background.fill=C.bg;
 text(s,title,72,45,1136,64,title.length>30?42:46,{bold:true,name:'slide-title'});
 text(s,'00',1160,679,48,24,18,{align:'right',color:C.muted,name:'page-number'});
 s.speakerNotes.text=note;newSlides.push(s.id);return s;
}
function footer(s,t){text(s,t,72,681,1070,25,17,{color:C.muted,name:'source-note'});}
function table(s,values,widths,x,y,heights,size=23,highlights=[]){
 const t=s.tables.add({rows:values.length,columns:widths.length,left:x,top:y,width:widths.reduce((a,b)=>a+b,0),height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values});
 t.styleOptions={headerRow:true,bandedRows:false,bandedColumns:false};t.borders.assign({style:'solid',fill:C.line,width:.8});
 values.forEach((row,r)=>{t.rows[r].height=heights[r];row.forEach((v,c)=>{
  const cell=t.getCell(r,c);cell.fill=r===0?C.ink:C.white;
  cell.text.style={typeface:FONT,fontSize:r===0?23:size,color:r===0?C.white:C.ink,bold:r===0||c===1,alignment:'left',verticalAlignment:'middle',insets:{left:12,right:12,top:6,bottom:6},wrap:'square',autoFit:'none',lineSpacing:1.08};
  t.cells.block({row:r,column:c,rowCount:1,columnCount:1}).assign({margins:{left:12,right:12,top:6,bottom:6}});
 });});
 for(const [r,c]of highlights){t.getCell(r,c).text.style={bold:true,color:C.teal};}
 return t;
}
function num(v,sd=null){return v==null?'—':String(v)+(sd==null?'':` ± ${sd}`);}
function pair(id,o={}){
 const r=records.get(id);if(!r)throw new Error('Missing data '+id);
 return [o.benchmark||`${r.benchmark} / ${r.split}`,o.paper||canonicalName(r.paper),o.sr||num(r.sr,o.sd?r.sr_sd:null),o.spl||num(r.spl,o.sd?r.spl_sd:null)];
}
function cite(s,ids,note=''){
 const unique=[...new Set(ids)];
 const lines=unique.map(id=>{const r=records.get(id);return `${id}: ${canonicalName(r.paper)}，${r.benchmark} / ${r.split}，SR=${r.sr??'未报告'}%，SPL=${r.spl??'未报告'}%。来源：${r.source_pdf}，PDF第${r.source_page}页，${r.source_table}。协议：${r.protocol}。${r.note}`;});
 s.speakerNotes.text+=`\n\n新增性能数据说明：${note}\n比较范围：已收录14篇方法论文，按当前分类分支分别选择主结果。未经统一复测，不同传感器、阈值或子集不得理解为严格排行榜。SR与SPL始终取自同一论文同一配置。SuperNav的SPL已从0–1转换到百分制。\n\n${lines.join('\n')}`;
 slideEvidence.push({id:s.id,records:unique,note});
}
function intro(old,title,question,blocks,rows,ids,foot,note=''){
 const s=make(title,original[old-1].speakerNotes.text);
 text(s,question,72,126,1136,40,27,{color:C.muted});
 text(s,'主要方法',72,172,325,33,27,{bold:true,color:C.teal});
 text(s,'已收录主结果概览（%）',432,172,776,33,25,{bold:true,color:C.teal});
 blocks.forEach((b,i)=>{
  const y=230+i*130;
  text(s,b[0],72,y,320,36,25,{bold:true,color:C.teal});
  text(s,b[1],72,y+43,320,83,24);
 });
 table(s,[['Benchmark／设置','论文／配置','SR','SPL'],...rows],[310,250,108,108],432,208,[44,...rows.map(()=>58)],22);
 text(s,foot,72,642,1136,38,17,{color:C.muted,spacing:1.05});
 footer(s,'SR：成功率。SPL：按路径长度加权的成功率。范围仅限已收录论文，完整协议与来源见备注');
 cite(s,ids,note);replacements.set(old,s);return s;
}
function detail(title,ids,rows,foot,options={}){
 const s=make(title,options.note||'');
 const y=options.y??166;
 const rowHeight=options.rowHeight??61;
 table(s,[['Benchmark／设置','论文／配置','SR %','SPL %'],...rows],options.widths||[442,302,196,196],72,y,[48,...rows.map(()=>rowHeight)],options.font||23,options.highlights||[]);
 text(s,foot,72,options.footY??645,1136,options.footH??33,options.footFont??18,{color:options.amber?C.amber:C.muted});
 footer(s,options.source||'数值均按原论文主表记录。不同协议并列展示，未作统一复测；详细来源见讲稿备注');
 cite(s,ids,options.note||'');return s;
}

// Direction 1: summary is visible on the introduction slide, full tasks follow.
{
 const ids=['arch_omni_U','arch_mtu_goat_U','arch_omni_r2r','arch_omni_rxr','arch_d3d_sg3d','super_astra025'];
 intro(3,'系统组织架构：方法与领先结果','核心问题：高层任务意图怎样转成可执行动作',[
  ['程序与工具编排','TANGO、SuperNav\n工具调用与执行反馈'],
  ['快慢系统协作','OmniNav\n子目标规划与连续航点'],
  ['统一任务与决策','D3D-VLP、MTU3D等\n统一规划、定位或任务接口']
 ],[
  pair(ids[0],{benchmark:'HM3D-OVON / Val-Unseen'}),
  pair(ids[1],{benchmark:'GOAT-Bench / Val-Unseen'}),
  pair(ids[2],{benchmark:'R2R-CE / Val-Unseen'}),
  pair(ids[3],{benchmark:'RxR-CE / Val-Unseen'}),
  pair(ids[4],{benchmark:'SG3D-Nav / 子任务与整任务',sr:'33.7 s\n13.8 t'}),
  pair(ids[5],{benchmark:'OVON / 120子集，0.25 m',paper:'SuperNav*'})
 ],ids,'* SuperNav为GPT-6 Astra模型替换配置，子集协议单列。s/t分别为子任务／整任务SR。其余benchmark见后续3页。',
 '常规主表的OVON、GOAT和VLN分别显示该方向较高的报告值。SuperNav子集与距离定义不同，不能和常规OVON行作严格排名。');
 const objectIds=['arch_omni_S','arch_omni_Y','arch_omni_U','arch_mtu_goat_S','arch_mtu_goat_Y','arch_mtu_goat_U','arch_uni_obj'];
 const a=detail('系统组织架构：目标导航结果',objectIds,objectIds.map(id=>pair(id)),
 'OmniNav为慢系统+CoT；MTU3D使用RGB-D与位姿；Uni-NaVid为单RGB。训练与传感器条件未统一。',
 {source:'来源：OmniNav 表2；MTU3D 表5；Uni-NaVid 表IV',rowHeight:61,y:156,footY:638,footH:38,footFont:17});
 const vlnIds=['arch_omni_r2r','arch_omni_rxr','arch_d3d_reverie','arch_d3d_navrag','arch_d3d_sg3d','arch_uni_follow'];
 const b=detail('系统组织架构：指令与顺序任务结果',vlnIds,[
  pair(vlnIds[0]),pair(vlnIds[1]),pair(vlnIds[2]),pair(vlnIds[3]),
  pair(vlnIds[4],{benchmark:'SG3D-Nav / 导航任务',sr:'33.7 s / 13.8 t'}),pair(vlnIds[5])
 ],'其他评测采用不同指标：CityWalker使用MAOE，问答任务使用ACC、Score或LLM-SR／LLM-SPL，均不充当导航SR／SPL。',
 {rowHeight:61,y:174,footY:610,footH:62,footFont:20,source:'来源：OmniNav 表1；D3D-VLP 表2–3；Uni-NaVid 表VII。—表示未报告SPL',
 note:'OmniNav是三视角快系统。D3D-VLP的SG3D给定真实计划文本，表中SR分子任务和整任务，SPL取原导航统计。Uni-NaVid人物跟随无SPL。非导航评测包括：TANGO OpenEQA Score=37.2±1.8；MTU3D辅助GPT-4o的A-EQA LLM-SR=51.1、LLM-SPL=42.6；Uni-NaVid MP3D-EQA自主导航ACC=47.3。OmniNav CityWalker MAOE=11.53%。这些指标不能替代普通导航SR/SPL。'});
 const superIds=['super_ovon025','super_ovon1','super_astra025','super_astra1','super_hm302','super_hm31','super_single','super_multi','super_demand'];
 const superLabels=[
  ['OVON / Val-Unseen，120子集，0.25 m','Geo，主模型'],
  ['OVON / Val-Unseen，120子集，1 m','Geo，主模型'],
  ['OVON / 120子集，0.25 m','GPT-6 Astra*'],
  ['OVON / 120子集，1 m','GPT-6 Astra*'],
  ['HM3Dv2 / 1000 episodes，0.2 m','Geo，主模型'],
  ['HM3Dv2 / 1000 episodes，1 m','Geo，主模型'],
  ['Habitat-GS / 单目标，150 tasks','Geo，主模型'],
  ['Habitat-GS / 顺序多目标，150 tasks','Geo，主模型'],
  ['Demand-Bench / 改编协议，200 tasks','Geo，主模型']
 ];
 const c=detail('SuperNav：子集、阈值与自建任务',superIds,superIds.map((id,i)=>pair(id,{benchmark:superLabels[i][0],paper:superLabels[i][1]})),
 '* 模型替换配置。主模型为GPT-5.6 Terra high。SPL已乘100；视点距离、子集与改编任务不与其他协议混排。',
 {widths:[590,274,136,136],rowHeight:50,y:148,font:22,footY:654,footH:24,footFont:17,source:'来源：SuperNav 表1–3。Geo表示几何执行器；严格距离定义见原论文附录B'});
 insertions.set(3,[a,b,c]);
}

// Direction 2: SR and SPL leaders can differ, especially across evaluation sets.
{
 const ids=['env_soft_ovon_U','env_soft_goat_U','env_msg_goat','env_msg_hm3d','env_soft_sg3d'];
 intro(6,'环境表征：方法与领先结果','核心问题：把跨视角观测转成可查询、可决策的环境状态',[
  ['MSGNav：显式场景图','物体节点保留空间属性\n图边保留共同观测图像'],
  ['SoftNav：连续特征接口','三维物体与前沿的特征\n映射为VLM的soft tokens'],
  ['SR与SPL需要同时看','GOAT较高SR来自SoftNav\n较高SPL来自MSGNav']
 ],[
  pair(ids[0],{benchmark:'HM3D-OVON\nVal-Unseen，0.25 m'}),
  pair(ids[1],{benchmark:'GOAT-Bench / Val-Unseen',paper:'SoftNav（SR较高）'}),
  pair(ids[2],{benchmark:'GOAT-Bench / Val-Unseen',paper:'MSGNav（SPL较高）'}),
  pair(ids[3],{benchmark:'HM3D-ObjNav / Val'}),
  pair(ids[4],{benchmark:'SG3D / 子任务与整任务',sr:'47.2 s\n16.6 t'})
 ],ids,'GOAT两篇使用不同评测规模，报告值并列展示，不作严格排名。各划分与SG3D完整结果见后续2页。',
 'SoftNav GOAT每划分30 episodes，MSGNav GOAT为360 episodes / 2669子任务。两套子集不能当成统一排行榜。');
 const ids1=['env_soft_ovon_S','env_soft_ovon_Y','env_soft_ovon_U','env_msg_hm3d'];
 const a=detail('环境表征：OVON与ObjectNav结果',ids1,ids1.map(id=>pair(id)),
 'SoftNav：每划分120 episodes、0.25 m。MSGNav：HM3D-ObjNav为1000 episodes、1 m。两者属于不同任务设置。',
 {rowHeight:88,y:216,footY:630,footH:42,footFont:18,source:'来源：SoftNav 表II；MSGNav 表2',
 note:'本表给出本分支已报告的最优主结果。MSGNav的OVON补充材料在阅读笔记中转引Seen=48.3/27.0，本次未重新获取补充PDF，因此不以该转引值参与新表排名。不能使用旧arXiv版的HM3D-OVON结果替换CVPR版结果。'});
 const ids2=['env_soft_goat_S','env_soft_goat_Y','env_soft_goat_U','env_msg_goat','env_soft_sg3d'];
 const b=detail('环境表征：GOAT与SG3D结果',ids2,[...ids2.slice(0,4).map(id=>pair(id)),pair(ids2[4],{sr:'47.2 s / 16.6 t'})],
 'SoftNav的GOAT每划分30 episodes，MSGNav为360 episodes。SG3D的s/t分别表示子任务／整任务SR。',
 {rowHeight:75,y:198,footY:632,footH:42,footFont:18,source:'来源：SoftNav 表III–IV；MSGNav 表1。SPL最高报告值与SR最高报告值分别保留',highlights:[[3,2],[4,3]]});
 insertions.set(6,[a,b]);
}

// Direction 3: both kinds of navigation tasks and all reported category splits.
{
 const ids=['mem_astra_ovon_U','mem_astra_goat_U','mem_janus_r2r','mem_janus_rxr'];
 intro(9,'历史记忆：方法与领先结果','核心问题：有限上下文中，怎样利用过去看见的环境',[
  ['AstraNav-Memory','减少每帧视觉tokens\n读取长期图像与位姿'],
  ['JanusVLN','分离语义与空间特征\n使用历史窗口与缓存'],
  ['两个任务组分别比较','目标搜索：OVON、GOAT\n指令跟随：R2R、RxR']
 ],ids.map(id=>pair(id)),ids,
 'AstraNav采用论文1 m判据；Janus为额外数据版、单RGB。三个Seen／Synonyms／Unseen划分见下一页。',
 'AstraNav GOAT的1 m判据与SoftNav/MSGNav的0.25 m不同，不应跨分支直接比较成功率。Janus采用主表R2R SPL=56.8，附录同配置写56.6，不自行统一。');
 const full=['mem_astra_ovon_S','mem_astra_ovon_Y','mem_astra_ovon_U','mem_astra_goat_S','mem_astra_goat_Y','mem_astra_goat_U','mem_janus_r2r','mem_janus_rxr'];
 const a=detail('历史记忆：各benchmark与划分结果',full,full.map(id=>pair(id)),
 '补充：JanusVLN另报OVON Val-Unseen为44.9／31.7，评测细节披露有限，不与AstraNav作严格排名。',
 {rowHeight:55,y:150,font:23,footY:646,footH:28,footFont:18,source:'来源：AstraNav-Memory 表1–2；JanusVLN 表1–2及附录表6',
 note:'JanusVLN附录Table 6的OVON SR/SPL=44.9/31.7，仅作补充。AstraNav全部六个划分结果已列出，Janus只有OVON Val-Unseen、R2R/RxR Val-Unseen报告，不能补填未报告划分。'});
 cite(a,['mem_janus_ovon']);insertions.set(9,[a]);
}

// Direction 4: six benchmark/split rows fit directly on the introduction slide.
{
 const ids=['exp_vlfm_gibson','exp_open_hm3d','exp_open_mp3d','exp_vlfm_ovon_S','exp_vlfm_ovon_Y','exp_open_ovon'];
 intro(12,'探索与目标搜索：方法与领先结果','核心问题：目标尚未出现时，下一步去哪里更有价值',[
  ['VLFM：语义价值地图','累积图文相似度\n评价地图前沿的价值'],
  ['OpenFrontier：视觉前沿','评价图像中候选方向\n结合信息增益与距离'],
  ['目标确认闭环','执行移动后更新观测\n核查目标是否满足描述']
 ],ids.map((id,i)=>pair(id,{benchmark:['Gibson / Val','HM3D ObjectNav / Val','MP3D ObjectNav / Val','HM3D-OVON / Seen','HM3D-OVON / Synonyms','HM3D-OVON / Unseen'][i],paper:canonicalName(records.get(id).paper)+(id==='exp_vlfm_gibson'||id.endsWith('_S')||id.endsWith('_Y')?'†':'')})),ids,
 '† 本分支仅一篇报告该benchmark或划分，列原值而不推断领先性。VLFM的OVON数据来自基准论文重评。',
 'OpenFrontier在同一张表中列出VLFM并在HM3D、MP3D与OVON Val-Unseen的SR/SPL均更高。Gibson及OVON Seen/Synonyms只有VLFM报告，不能将OpenFrontier未报告项记为零。');
}

// Direction 5: retain both paired results when the SR/SPL leaders differ.
{
 const ids=['train_ovseg_U','train_compass_ovon','train_compass_hm3d2','train_compass_mp3d','train_compass_iin','train_compass_procthor'];
 intro(15,'策略训练与优化：方法与领先结果','核心问题：怎样训练目标搜索策略，并适应未见类别',[
  ['OVSegDT','目标掩码与辅助重建\n动作熵调节BC／PPO配比'],
  ['CompassNav','SFT建立决策基础\nGRPO比较候选动作质量'],
  ['OVON指标各有领先','SR较高：OVSegDT\nSPL较高：CompassNav']
 ],[
  pair(ids[0],{benchmark:'HM3D-OVON / Unseen',paper:'OVSegDT'}),
  pair(ids[1],{benchmark:'HM3D-OVON / Unseen',paper:'CompassNav'}),
  pair(ids[2],{benchmark:'HM3D ObjectNav / 表2'}),
  pair(ids[3],{benchmark:'MP3D ObjectNav / Val'}),
  pair(ids[4],{benchmark:'Instance-ImageNav / 表2'}),
  pair(ids[5],{benchmark:'ProcTHOR / 未见环境'})
 ],ids,'两篇传感器与评测设置不同，最高报告值分别保留。OVSegDT为三次实验均值；全部划分与标准差见下一页。',
 '不将OVSegDT的较高SR与CompassNav的较高SPL合成一行。CompassNav表1和表2中的HM3D版本未完整对应v1/v2，按原表标签分别保留，不把61.6当作56.6的同条件更新值。');
 const all=['train_ovseg_S','train_ovseg_Y','train_ovseg_U','train_compass_ovon','train_compass_hm3d1','train_compass_hm3d2','train_compass_mp3d','train_compass_iin','train_compass_procthor'];
 const labels=['OVON / Val-Seen','OVON / Val-Seen-Synonyms','OVON / Val-Unseen','OVON / Val-Unseen','HM3D ObjectNav / 表1设置','HM3D ObjectNav / 表2设置','MP3D ObjectNav / Val','Instance-ImageNav / 表2设置','ProcTHOR / 未见环境'];
 const a=detail('策略训练与优化：完整结果与统计口径',all,all.map((id,i)=>pair(id,{benchmark:labels[i],sd:id.startsWith('train_ovseg_')})),
 'HM3D保留原表1／表2设置，不自行对应v1／v2；±为三随机种子的标准差。仅比较主配置，不混入真值掩码消融。',
 {rowHeight:50,y:148,font:23,widths:[438,300,199,199],footY:654,footH:25,footFont:17,source:'来源：OVSegDT 表1；CompassNav 表1–2、附录表6–7'});
 insertions.set(15,[a]);
}

// Preserve every unchanged slide, with methods and performance before compute.
const desired=[];const mapping=[];
for(const [i,s]of original.entries()){
 const n=i+1;const owner=replacements.get(n)||s;desired.push('sl/'+owner.id);
 mapping.push({old:n,id:owner.id,replaced:replacements.has(n),new:desired.length});
 for(const extra of insertions.get(n)||[])desired.push('sl/'+extra.id);
}
p.slides.keep(desired);p.slides.reorder(desired);
if(p.slides.items.length!==34)throw new Error('Expected 34 slides');
const cover=p.slides.items[0].shapes.items.find(s=>s.name==='对应文献与训练算力');
if(cover)cover.text.replace('方法方向阐释与训练算力','方法方向、评测结果与训练算力');
for(const [i,s]of p.slides.items.entries()){
 const page=s.shapes.items.find(sh=>sh.name==='page-number');if(!page)throw new Error('Page number missing');page.text=String(i+1).padStart(2,'0');
}
const evidence=slideEvidence.map(e=>({...e,slide:p.slides.items.findIndex(s=>s.id===e.id)+1}));
await fs.writeFile(path.join(build,'mapping.json'),JSON.stringify(mapping,null,2));
await fs.writeFile(path.join(build,'slide-evidence.json'),JSON.stringify(evidence,null,2));
await fs.writeFile(path.join(build,'native-table-slides.json'),JSON.stringify(p.slides.items.flatMap((s,i)=>s.tables.items.length?[i+1]:[])));
await fs.writeFile(path.join(build,'slide-text.ndjson'),(await p.inspect({kind:'slide,textbox,table,notes',maxChars:900000})).ndjson);
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const dir=path.join(build,'previews');await fs.mkdir(dir,{recursive:true});
for(const [i,s]of p.slides.items.entries()){
 const blob=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(dir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
console.log(JSON.stringify({slides:34,introductions:mapping.filter(m=>m.replaced).map(m=>m.new),computeStarts:mapping.find(m=>m.old===21).new}));
