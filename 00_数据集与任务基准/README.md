# 数据集与任务基准

定义场景、目标形式、任务依赖与评测协议；包含的基线方法用交叉标签说明。

主类别采用主要技术贡献；文件名中的年份与会议只用于识别原文件。

| 论文 | 核心机制 | 交叉标签 |
|---|---|---|
| [HM3D Semantics](2023_CVPR_HM3D_Semantics_ObjectNav.pdf) | 核心贡献是室内三维场景的纹理级实例语义标注，不是一个导航控制器。 | — |
| [HM3D-OVON](2024_IROS_HM3D_OVON.pdf) | 论文首先定义 OVON 数据与评测；DAgRL 等训练式基线作为交叉方法标签。 | 模仿学习与强化学习导航；开放词汇目标识别 |
| [GOAT-Bench](2024_CVPR_GOAT_Bench.pdf) | 定义类别、图像、语言目标与连续多目标评测，比较不同记忆和导航基线。 | 多模态目标；跨子任务记忆 |
| [SG3D / SG-LLM](2024_SG3D_Sequential_Grounding_and_Navigation.pdf) | 主要提供顺序 grounding 与导航任务；SG-LLM 基线利用物体 tokens 和历史目标。 | 三维空间表征与目标推理；顺序指代与 grounding |

[返回分类总览](../README.md) · [查看全部分类理由](../方法分类索引.md)
