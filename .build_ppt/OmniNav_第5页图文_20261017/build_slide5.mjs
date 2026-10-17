import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {Presentation,PresentationFile,FileBlob} from 'file:///C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root=process.cwd();
const build=path.join(root,'.build_ppt','OmniNav_第5页图文_20261017');
const info=JSON.parse(await fs.readFile(path.join(build,'source-info.json'),'utf8'));
const runtime='C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const req=createRequire(path.join(runtime,'__slide5__.cjs'));
try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','Microsoft YaHei');}catch{}
try{req('skia-canvas').FontLibrary.use('Microsoft YaHei',['C:/Windows/Fonts/msyh.ttc']);}catch{}
try{req('@napi-rs/canvas').GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','微软雅黑');}catch{}
try{req('skia-canvas').FontLibrary.use('微软雅黑',['C:/Windows/Fonts/msyh.ttc']);}catch{}
const existing=await PresentationFile.importPptx(await FileBlob.load(info.source));
await fs.writeFile(path.join(build,'before-slide5.png'),new Uint8Array(await (await existing.export({slide:existing.slides.items[4],format:'png',scale:1})).arrayBuffer()));
const p=Presentation.create({slideSize:{width:1280,height:720}});
const s=p.slides.add();s.background.fill='#FAFBFC';
function text(value,x,y,w,h,size=24,color='#182D40',bold=false,name=''){
 const sh=s.shapes.add({geometry:'textbox',name:name||value.slice(0,30),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0,style:'solid'}});
 sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,color,bold,alignment:'left',verticalAlignment:'top',insets:0,wrap:'square',autoFit:'none',lineSpacing:1.15};return sh;
}
text('OmniNav：快慢系统的接口',72,45,1136,65,46,'#182D40',true,'slide-title');
text('以子目标坐标衔接全局规划与局部执行',72,128,1136,38,26,'#586D7B');
text('快慢系统通过子目标坐标协作',64,185,552,34,25,'#12776C',true);
s.images.add({blob:new Uint8Array(await fs.readFile(info.image_file)),contentType:'image/png',alt:'OmniNav原图1：共享VLM的快慢系统，慢系统选择空间子目标，快系统生成连续航点',fit:'contain',position:{left:64,top:232,width:552,height:302}});
text('慢系统确定下一探索点或目标位置。\n快系统把子目标转换为连续航点。',64,556,552,70,23);
text('快慢系统共享 VLM 参数',64,637,552,34,24,'#12776C',true);
const steps=[
 ['理解任务与当前状态','读取目标、当前与历史图像、位姿\n及探索前沿，判断目标是否出现。'],
 ['选择接口与子目标','未见目标选前沿，已见目标选位置。\n慢系统将坐标以 Point-Goal 传给快系统。'],
 ['执行专门模块','快系统结合子目标和近期观测，\n生成未来5个连续航点，由控制器执行。'],
 ['接收执行反馈','移动后更新图像、位姿与探索状态。\n到达子目标或需重规划时，再选下一处。'],
];
steps.forEach(([heading,body],i)=>{
 const y=185+i*118;
 text(String(i+1).padStart(2,'0'),662,y,47,37,28,'#12776C',true);
 text(heading,720,y,488,37,27,'#182D40',true);
 text(body,720,y+42,488,73,24);
});
text('来源：OmniNav，图1（PDF第4页）及第3节',72,681,1070,25,17,'#586D7B',false,'source-note');
const page=text('05',1160,679,48,24,18,'#586D7B',false,'page-number');page.text.style={alignment:'right'};
s.speakerNotes.text='OmniNav是分层与模块化协作的一种实现。第一步，读取导航目标、当前图像、带位姿的历史图像及地图前沿，形成任务与环境状态。完整慢系统另外依赖深度与里程计构图。第二步，慢系统在目标尚未出现时选择值得探索的前沿，目标已在当前或历史观测中出现时确定目标位置；以空间坐标作为Point-Goal接口传给快系统。第三步，快系统结合子目标、当前及近期视觉观测，由连续策略头生成未来5个航点，底层控制器负责实际移动。图中标作Diffusion Policy Head，正文实现采用Flow Matching。第四步，执行后更新图像、位姿、地图与探索状态，快系统滚动调整局部航点，到达子目标或需要重规划时重新进行高层选择。快慢系统共享VLM参数，分层指职责与决策尺度，不意味着两个完全独立训练的大模型。\n\n例如寻找洗碗机：先判断当前和历史是否看见目标，未见则选择厨房方向的探索前沿，快系统生成局部航点；获得洗碗机的新观察后，将子目标更新为目标位置并继续接近。\n\n来源：05_视觉语言动作决策与视频记忆/read-OmniNav.md；OmniNav §3，Fig.1，式(1)–(4)。';
await (await PresentationFile.exportPptx(p)).save(path.join(build,'replacement-slide5.pptx'));
await fs.writeFile(path.join(build,'after-slide5.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
await fs.writeFile(path.join(build,'replacement-inspect.ndjson'),(await p.inspect({kind:'slide,textbox,image,notes',maxChars:200000})).ndjson);
console.log('Slide 5 authored and rendered');
