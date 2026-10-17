# 新版方法分类PPT：性能素材审查

比较范围仅为当前收录的14篇方法论文，采用本地PDF版本。原有结果库、PPT和阅读笔记均未改动。

## 数据结构与口径

- curated-results.json 顶层为 policy、record_count、papers、records；共71条记录。
- records 包含 id、paper、branch、benchmark、split、sr、spl、unit、source_pdf、source_page、source_table、protocol、note；部分有 sr_sd、spl_sd 或 task_sr。source_page为PDF页序号，从1开始。
- result-pages.json 按14篇paper键组织，包含 paper、pdf、pages；pages包含 page、width、height、text。Uni-NaVid的pages为空，应使用已渲染的第6–9页或PDF本体。
- SR、SPL统一为百分制；SuperNav原SPL是0–1，已经乘100，不能再转换。未报告SPL保持空值。
- SG3D的sr字段是s-SR，task_sr是t-SR；必须在PPT可见位置写清子任务/整任务。

benchmark原始键：HM3D-OVON；GOAT-Bench；R2R-CE；RxR-CE；REVERIE-CE；NavRAG-CE；SG3D-Nav；HM3D ObjectNav；自建人物跟随；HM3Dv2 ObjectNav；Habitat-GS / InteriorGS；Demand-Bench / AI2-THOR；HM3D-ObjNav；SG3D；Gibson；MP3D ObjectNav；Instance-ImageNav；AI2-THOR / ProcTHOR。

HM3D ObjectNav、HM3D-ObjNav、HM3Dv2 ObjectNav不可直接按名字归并为同一协议；SG3D/SG3D-Nav也需确认统计口径。

## 一级方向简介页建议呈现

| 一级方向 | 可呈现的报告结果（SR / SPL，%） | 比较边界 |
|---|---|---|
| 系统组织架构 | OmniNav：OVON Unseen 59.2 / 33.2（1 m）；MTU3D：GOAT Unseen 47.2 / 27.7；OmniNav：R2R 69.5 / 66.1、RxR 73.6 / 62.0；D3D：REVERIE 47.5 / 34.7、NavRAG 31.1 / 23.9、SG3D s-SR33.7 / t-SR13.8 / SPL21.6 | OVON另列SuperNav120子集0.25 m：68.33 / 38.37，1 m：73.33 / 41.05。其他协议不可挤成一个榜首。OmniNav在R2R/RxR是该方向最高公开报告值，三视角等观察条件未统一。 |
| 环境表征 | SoftNav：OVON Unseen 66.7 / 25.7；GOAT SoftNav 64.2 / 24.7、MSGNav 52.0 / 29.6；MSGNav：HM3D-ObjNav74.1 / 33.4；SoftNav：SG3D s-SR47.2 / t-SR16.6 / SPL14.7 | GOAT两个数值对使用不同子集，只可并列。SoftNav在GOAT/SG3D零样本迁移是导航策略不重训，PQ3D仍使用基准特定stage-2权重，不等同于整系统完全未接触目标基准。 |
| 历史记忆 | AstraNav：OVON Unseen62.5 / 34.9、GOAT Unseen62.7 / 56.9；Janus：R2R60.5 / 56.8、RxR56.2 / 47.5 | AstraNav用1 m；Janus为额外数据版。Janus附录OVON44.9 / 31.7评测细节有限，应在补充表列出。 |
| 探索与目标搜索 | VLFM：Gibson84.0 / 52.2；OpenFrontier：HM3D77.3 / 35.6、MP3D40.7 / 17.8、OVON Unseen39.0 / 20.1 | OpenFrontier表I直接对照VLFM，三项SR/SPL均更高；Gibson仅VLFM报告。OVON Seen35.2 / 18.6、Synonyms32.4 / 17.3也仅VLFM报告。 |
| 导航策略训练与优化 | OVON Unseen：OVSegDT44.7 / 20.6、CompassNav43.5 / 21.6；CompassNav：HM3D表1 56.6 / 27.6、表2 61.6 / 27.8，MP3D42.0 / 17.5、Instance-ImageNav35.6 / 14.8、ProcTHOR58.1 / 32.8 | OVON最高SR、SPL来自不同论文，需保留两对。HM3D原表设置不同，不能只挑61.6替换56.6，不能自行命名v1/v2。 |

每个benchmark全部划分、可比组与原文来源已写入direction-best.json。推荐首页用“已收录论文报告结果”，附表列全部设置。只有single_report的项目应写“唯一已报告”，不写“最优”。

## 不得遗漏的风险

1. 新MD二级范式允许跨分支采用。性能分组仍依文献的主要一级归属；不能在每个二级方法下重复把跨分支论文列作独立最优，避免人为增加样本。
2. SoftNav/MSGNav GOAT：每划分30 episodes与360 episodes/2669子任务不同。最高报告SR和SPL也不能证明同条件优劣。
3. 1 m、0.25 m、0.2 m及目标视点测地距离不可混排。SuperNav表2外部条目也明示协议和子集不同。
4. SuperNav GPT-6 Astra的71.67/45.79与79.17/49.74属于模型替换变体；单列说明，不替代主模型结果。
5. D3D SG3D评测提供GT计划文本。表3可支持相对于其中MTU3D的导航指标领先，但不能据此说明从高层意图到计划的全链路成功率。
6. OVSegDT采用主表预测YOLOE掩码结果，不混入GT分割mask上限；CompassNav不把GRPO组大小K=7的消融SR61.8替代主配置61.6。
7. Janus R2R主表SPL56.8与附录56.6有冲突，取主表并注明；不平均。MSGNav正文“52.0% SPL”是笔误，表1表头清楚指SR52.0/SPL29.6。
8. VLFM OVON值的source_pdf指向基准PDF，result-pages.json中vlfm键并未保存这份基准原文页，不能仅凭该键下第6页定位。正确来源是HM3D-OVON基准PDF第6页；本次未新增渲染。
9. CityWalker MAOE、问答ACC/Score、A-EQA LLM-SR/LLM-SPL不作普通导航SR/SPL。人物跟随SPL未报告，不补0。
10. OVSegDT网页旧摘要与本地Table1、MSGNav旧arXiv与CVPR版不同，继续采用当前本地版本。训练算力不得从GPU型号推断方法性能。

## 可复用原文资产

已有方法图：

- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\astranav_fig2.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\goatbench_fig1.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\msgnav_fig3.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\msgnav_fig4.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\omninav_fig1.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\openfrontier_fig2.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\output\一级分支分类PPT\详解版资料\assets\figures\ovsegdt_fig2.png

性能原文页定位（仅来源指针，不新增渲染）：

- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\2026_ICLR_OmniNav.pdf，PDF第8页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\2025_RSS_Uni-NaVid.pdf，PDF第8页；已有PNG：E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\.build_ppt\一级分支分类_性能数据_20261016\uninavid-page8.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\2025_RSS_Uni-NaVid.pdf，PDF第9页；已有PNG：E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\.build_ppt\一级分支分类_性能数据_20261016\uninavid-page9.png
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\04_三维空间表征与目标推理\2025_ICCV_MTU3D_Move_to_Understand_a_3D_Scene.pdf，PDF第6页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\04_三维空间表征与目标推理\2025_ICCV_MTU3D_Move_to_Understand_a_3D_Scene.pdf，PDF第7页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\03_大模型规划与工具调用\2025_CVPR_TANGO.pdf，PDF第7页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\03_大模型规划与工具调用\2025_CVPR_TANGO.pdf，PDF第8页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\04_三维空间表征与目标推理\2026_CVPR_D3D-VLP.pdf，PDF第7页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\03_大模型规划与工具调用\SuperNav.pdf，PDF第6页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\03_大模型规划与工具调用\SuperNav.pdf，PDF第8页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\04_三维空间表征与目标推理\2607.14586v1.pdf，PDF第5页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\04_三维空间表征与目标推理\2026_CVPR_MSGNav.pdf，PDF第7页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\2026_CVPR_AstraNav-Memory.pdf，PDF第6页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\ICLR-2026-janusvln-decoupling-semantics-and-spatiality-with-dual-implicit-memory-for-vision-language-navigation-Paper-Conference.pdf，PDF第8页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\ICLR-2026-janusvln-decoupling-semantics-and-spatiality-with-dual-implicit-memory-for-vision-language-navigation-Paper-Conference.pdf，PDF第19页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\02_语义地图与前沿探索\VLFM_Vision-Language_Frontier_Maps_for_Zero-Shot_Semantic_Navigation.pdf，PDF第5页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\00_数据集与任务基准\2024_IROS_HM3D_OVON.pdf，PDF第6页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\02_语义地图与前沿探索\2026_RSS_OpenFrontier.pdf，PDF第5页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\01_模仿学习与强化学习导航\2026_CVPR_OVSegDT.pdf，PDF第7页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\2026_ICLR_CompassNav.pdf，PDF第8页
- E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\05_视觉语言动作决策与视频记忆\2026_ICLR_CompassNav.pdf，PDF第14页

旧版Uni-NaVid PNG：E:\科研_机器人\HM3D-OVON\HM3D_OVON_Papers\.build_ppt\一级分支分类_性能数据_20261016\uninavid-page6.png 至 uninavid-page9.png；旧版source-previews还保留Omni/MSG/Astra/OpenFrontier/OVSegDT/GOAT原文页预览。
