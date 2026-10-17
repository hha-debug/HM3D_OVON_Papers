import json
from pathlib import Path

root=Path.cwd()
build=root/'.build_ppt'/'一级分支分类_性能数据_20261016'
papers=json.loads((build/'result-pages.json').read_text(encoding='utf-8'))
records=[]

def add(id,paper,branch,benchmark,split,sr,spl,page,table,protocol='',note='',**extra):
    records.append(dict(id=id,paper=paper,branch=branch,benchmark=benchmark,split=split,sr=sr,spl=spl,
                        unit='percent',source_pdf=papers[paper]['pdf'],source_page=page,source_table=table,
                        protocol=protocol,note=note,**extra))

def trip(prefix,paper,branch,benchmark,vals,page,table,protocol='',note=''):
    for suffix,split,v in zip(['S','Y','U'],['Val-Seen','Val-Seen-Synonyms','Val-Unseen'],vals):
        add(prefix+suffix,paper,branch,benchmark,split,*v,page,table,protocol,note)

# Main results are kept separate from privileged-mask and hyperparameter ablations.
trip('arch_omni_','omninav','系统组织架构','HM3D-OVON',[(56.1,30.0),(68.6,38.8),(59.2,33.2)],8,'Table 2','慢系统+CoT；RGB-D与里程计；1 m口径')
trip('arch_uni_','uninavid','系统组织架构','HM3D-OVON',[(41.3,21.1),(43.9,21.8),(39.5,19.8)],9,'Table V','论文主结果；单RGB')
trip('arch_mtu_','mtu3d','系统组织架构','HM3D-OVON',[(55.0,23.6),(45.0,14.7),(40.8,12.1)],6,'Table 3','RGB-D+位姿；0.25 m口径')
add('arch_tango_ovon','tango','系统组织架构','HM3D-OVON','Val-Unseen',35.5,19.5,7,'Table 1','标准主结果',sr_sd=.3,spl_sd=.3)
add('arch_d3d_ovon','d3dvlp','系统组织架构','HM3D-OVON','论文验证设置',47.3,30.4,7,'Table 2','RGB-D+位姿；表头未再列划分')
trip('arch_mtu_goat_','mtu3d','系统组织架构','GOAT-Bench',[(52.2,30.5),(48.4,30.3),(47.2,27.7)],7,'Table 5','跨子任务记忆')
add('arch_tango_goat','tango','系统组织架构','GOAT-Bench','Val-Unseen',32.1,16.5,8,'Table 3','多模态连续目标')
add('arch_omni_r2r','omninav','系统组织架构','R2R-CE','Val-Unseen',69.5,66.1,8,'Table 1','三视角快系统；不使用慢系统')
add('arch_omni_rxr','omninav','系统组织架构','RxR-CE','Val-Unseen',73.6,62.0,8,'Table 1','三视角快系统；不使用慢系统')
add('arch_d3d_r2r','d3dvlp','系统组织架构','R2R-CE','论文验证设置',61.3,56.1,7,'Table 2','RGB-D+位姿')
add('arch_uni_r2r','uninavid','系统组织架构','R2R-CE','Val-Unseen',47.0,42.7,8,'Table II','单RGB')
add('arch_uni_rxr','uninavid','系统组织架构','RxR-CE','Val-Unseen',48.7,40.9,8,'Table III','单RGB')
add('arch_d3d_reverie','d3dvlp','系统组织架构','REVERIE-CE','论文验证设置',47.5,34.7,7,'Table 2','单摄像头RGB-D流与位姿')
add('arch_d3d_navrag','d3dvlp','系统组织架构','NavRAG-CE','论文验证设置',31.1,23.9,7,'Table 2','单摄像头RGB-D流与位姿')
add('arch_d3d_sg3d','d3dvlp','系统组织架构','SG3D-Nav','导航任务',33.7,21.6,7,'Table 3','给定GT计划；s-SR=33.7；t-SR=13.8',task_sr=13.8)
add('arch_mtu_sg3d','mtu3d','系统组织架构','SG3D-Nav','导航任务',23.8,16.5,6,'Table 4','s-SR=23.8；t-SR=8.0',task_sr=8.0)
add('arch_uni_obj','uninavid','系统组织架构','HM3D ObjectNav','Val',73.7,37.1,8,'Table IV','原论文验证集；单RGB；与SuperNav重评协议分列')
add('arch_uni_follow','uninavid','系统组织架构','自建人物跟随','默认验证配置',61.21,None,9,'Table VII','无SPL；FR=71.93%，CR=2.07%')
# SuperNav SR is in percent, while its original SPL is 0–1. Convert SPL once.
for id,bench,split,sr,spl,page,tab,protocol in [
 ('super_ovon025','HM3D-OVON','Val-Unseen 120子集，0.25 m',68.33,38.37,8,'Table 2','Geo执行器；GPT-5.6 Terra high；到目标视点的测地距离'),
 ('super_ovon1','HM3D-OVON','Val-Unseen 120子集，1 m',73.33,41.05,8,'Table 2','Geo执行器；GPT-5.6 Terra high；到目标视点的测地距离'),
 ('super_astra025','HM3D-OVON','120子集，0.25 m；模型替换',71.67,45.79,8,'Table 3','GPT-6 Astra medium；模型配置变体，不混入主结果排行'),
 ('super_astra1','HM3D-OVON','120子集，1 m；模型替换',79.17,49.74,8,'Table 3','GPT-6 Astra medium；模型配置变体，不混入主结果排行'),
 ('super_hm302','HM3Dv2 ObjectNav','1000 episodes，0.2 m',80.30,33.38,8,'Table 2','Geo执行器；到目标视点测地距离'),
 ('super_hm31','HM3Dv2 ObjectNav','1000 episodes，1 m',86.50,36.38,8,'Table 2','Geo执行器；到目标视点测地距离'),
 ('super_single','Habitat-GS / InteriorGS','单目标，150 tasks',78.00,41.27,6,'Table 1','Geo执行器；距合格目标视点<1 m，需STOP'),
 ('super_multi','Habitat-GS / InteriorGS','顺序多目标，150 tasks',34.00,13.88,6,'Table 1','Geo执行器；2–5目标全部成功，需STOP'),
 ('super_demand','Demand-Bench / AI2-THOR','需求驱动，200 tasks',59.50,18.01,6,'Table 1','改编协议；进入顺序2 m包围盒区域，需STOP'),
]:
    add(id,'supernav','系统组织架构',bench,split,sr,spl,page,tab,protocol,'原SPL乘100转换为百分制')

trip('env_soft_ovon_','softnav','环境表征','HM3D-OVON',[(74.2,33.9),(68.3,28.6),(66.7,25.7)],5,'Table II','每划分120 episodes；0.25 m；RGB-D+位姿')
trip('env_soft_goat_','softnav','环境表征','GOAT-Bench',[(67.2,29.0),(63.2,25.8),(64.2,24.7)],5,'Table III','每划分30 episodes；0.25 m；OVON策略零样本迁移')
add('env_msg_goat','msgnav','环境表征','GOAT-Bench','Val-Unseen',52.0,29.6,7,'Table 1','360 episodes / 2669子任务；0.25 m；与SoftNav子集不同')
add('env_msg_hm3d','msgnav','环境表征','HM3D-ObjNav','Val，6类别',74.1,33.4,7,'Table 2','1000 episodes；1 m；RGB-D+位姿')
add('env_soft_sg3d','softnav','环境表征','SG3D','338 episodes / 1351子任务',47.2,14.7,5,'Table IV','s-SR=47.2；t-SR=16.6',task_sr=16.6)

trip('mem_astra_ovon_','astranav','历史记忆','HM3D-OVON',[(65.6,35.4),(57.5,33.0),(62.5,34.9)],6,'Table 2','1 m；图像与位姿历史')
trip('mem_astra_goat_','astranav','历史记忆','GOAT-Bench',[(65.5,49.0),(66.8,54.7),(62.7,56.9)],6,'Table 1','论文1 m成功判据；不可与0.25 m协议直接排名')
add('mem_janus_r2r','janusvln','历史记忆','R2R-CE','Val-Unseen',60.5,56.8,8,'Table 1','额外数据版；单RGB；采用主表SPL，附录Table 8为56.6')
add('mem_janus_rxr','janusvln','历史记忆','RxR-CE','Val-Unseen',56.2,47.5,8,'Table 2','额外数据版；单RGB')
add('mem_janus_ovon','janusvln','历史记忆','HM3D-OVON','Val-Unseen',44.9,31.7,19,'Table 6','未完整披露该项评测细节，作附录补充报告')

for id,bench,sr,spl in [('exp_vlfm_gibson','Gibson',84.0,52.2),('exp_vlfm_hm3d','HM3D ObjectNav',52.5,30.4),('exp_vlfm_mp3d','MP3D ObjectNav',36.4,17.5)]:
    add(id,'vlfm','探索与目标搜索',bench,'Val',sr,spl,5,'Table I','VLFM原论文验证设置')
trip('exp_vlfm_ovon_','vlfm','探索与目标搜索','HM3D-OVON',[(35.2,18.6),(32.4,17.3),(35.2,19.6)],6,'HM3D-OVON Table III','HM3D-OVON基准论文重评，来源为基准PDF')
for r in records:
    if r['id'].startswith('exp_vlfm_ovon_'):
        r['source_pdf']=str(root/'00_数据集与任务基准'/'2024_IROS_HM3D_OVON.pdf')
for id,bench,split,sr,spl in [('exp_open_hm3d','HM3D ObjectNav','Val',77.3,35.6),('exp_open_mp3d','MP3D ObjectNav','Val',40.7,17.8),('exp_open_ovon','HM3D-OVON','Val-Unseen',39.0,20.1)]:
    add(id,'openfrontier','探索与目标搜索',bench,split,sr,spl,5,'Table I','Gemini-2.5-Flash；同一套系统参数')

trip('train_ovseg_','ovsegdt','导航策略训练与优化','HM3D-OVON',[(43.6,20.1),(40.1,17.9),(44.7,20.6)],7,'Table 1','预测YOLOE掩码；RGB策略；均值±标准差')
for r in records:
    if r['id'].startswith('train_ovseg_'): r.update(sr_sd=.4,spl_sd=.2 if r['id'].endswith(('S','U')) else .1)
add('train_compass_ovon','compassnav','导航策略训练与优化','HM3D-OVON','Val-Unseen',43.5,21.6,14,'Table 6','沿Nav-R1评测设置；深度与位姿用于候选生成')
for id,bench,split,sr,spl,page,tab in [
 ('train_compass_hm3d1','HM3D ObjectNav','Table 1 设置',56.6,27.6,8,'Table 1'),
 ('train_compass_hm3d2','HM3D ObjectNav','Table 2 设置',61.6,27.8,8,'Table 2'),
 ('train_compass_mp3d','MP3D ObjectNav','Val',42.0,17.5,8,'Table 1'),
 ('train_compass_iin','Instance-ImageNav','Table 2 设置',35.6,14.8,8,'Table 2'),
 ('train_compass_procthor','AI2-THOR / ProcTHOR','未见合成环境',58.1,32.8,14,'Table 7'),
]:
    add(id,'compassnav','导航策略训练与优化',bench,split,sr,spl,page,tab,'最终SFT+RFT配置；1 m成功判据','HM3D表1/表2未完整对应v1/v2，保留原表设置')

policy={
 'scope':'用户确认：仅比较已收录14篇方法论文；不是全领域SOTA检索',
 'selection':'同方向、同benchmark分别选主结果中的领先报告值。消融、真值掩码、超参数变体不替代主结果。SuperNav模型替换配置单列。',
 'pairing':'每组SR和SPL均来自同一篇论文同一配置。SR/SPL领先论文不同则并列，禁止拼接成虚构模型。',
 'comparability':'未经统一复测。不同子集、距离阈值、目标形式、传感器和数据条件保留并列，不宣称严格排行榜。',
 'units':'SR、SPL统一为百分制；SuperNav SPL从0–1乘100。—为未报告。',
 'sg3d':'s-SR是子任务，t-SR是整任务；SPL沿原论文导航统计口径，不把t-SR写成普通SR。',
 'not_navigation_metrics':'CityWalker MAOE、OpenEQA/MP3D-EQA问答分数、A-EQA的LLM-SR/LLM-SPL均不充当导航SR/SPL。',
 'version':'性能数据采用当前收录本地论文版本。OVSegDT旧网页摘要与本地Table 1不同，采用本地主表；MSGNav旧arXiv与CVPR版不同，不混用。'
}
out=dict(policy=policy,record_count=len(records),papers={k:dict(name=v['paper'],pdf=v['pdf']) for k,v in papers.items()},records=records)
(build/'curated-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('Curated',len(records),'records from',len(papers),'papers')
