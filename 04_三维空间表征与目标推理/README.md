# 三维空间表征与目标推理

把观察组织成三维物体、场景图、查询向量或特征场，再进行目标定位与探索决策。

主类别采用主要技术贡献；文件名中的年份与会议只用于识别原文件。

| 论文 | 核心机制 | 交叉标签 |
|---|---|---|
| [MTU3D](2025_ICCV_MTU3D_Move_to_Understand_a_3D_Scene.pdf) | 用在线三维 query 记忆，把物体定位和探索候选选择统一为学习式评分。 | 学习式 grounding 与探索；物体与 frontier queries |
| [MSGNav](2026_CVPR_MSGNav.pdf) | 核心组织方式是多模态三维场景图；VLM 在图像证据和空间记忆上推理，兼有大模型规划。 | 大模型规划与工具调用；闭环视觉证据；最后接近与视角选择 |
| [D3D-VLP](2026_CVPR_D3D-VLP.pdf) | 动态三维特征场及多层次空间 tokens 支撑计划、grounding 和 waypoint 的联合模型。 | 大模型规划与工具调用；联合训练与部分监督 |
| [SoftNav](2607.14586v1.pdf) | 核心接口是把三维物体/frontier queries 投影为 VLM soft tokens，输出探索坐标。 | 视觉语言动作决策与视频记忆；soft tokens；LoRA 适配 |

[返回分类总览](../README.md) · [查看全部分类理由](../方法分类索引.md)
