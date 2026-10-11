# 视觉语言动作决策与视频记忆

以多模态大模型或其适配策略为核心，由图像、视频或压缩历史预测动作、候选索引或移动坐标。

主类别采用主要技术贡献；文件名中的年份与会议只用于识别原文件。

| 论文 | 核心机制 | 交叉标签 |
|---|---|---|
| [CompassNav](2026_ICLR_CompassNav.pdf) | VLM 选择画面上的可行极坐标动作候选；SFT/GRPO 是训练方式。主要配方不使用长视频记忆。 | 模仿学习与强化学习导航；可行动作候选；单帧视觉决策 |
| [Uni-NaVid](2025_RSS_Uni-NaVid.pdf) | 以 RGB 视频和任务文本统一动作预测及问答，记忆由多档视频 tokens 表示。 | 统一多任务 VLA；分级视频压缩 |
| [AstraNav-Memory](2026_CVPR_AstraNav-Memory.pdf) | 将长历史图像压缩成少量视觉 tokens，由 VLM 结合位姿预测导航坐标。 | 长历史视觉压缩；带位姿图像；坐标预测 |
| [JanusVLN](ICLR-2026-janusvln-decoupling-semantics-and-spatiality-with-dual-implicit-memory-for-vision-language-navigation-Paper-Conference.pdf) | 语义与空间双分支维护 KV 记忆，融合后预测离散动作；空间先验不同于显式三维场景图。 | 双分支隐式记忆；RGB 空间先验；路线指令导航 |
| [OmniNav](2026_ICLR_OmniNav.pdf) | 主要模型路线是快慢系统：慢 VLM 选择子目标，快策略生成连续 waypoints；地图探索是交叉机制。 | 大模型规划与工具调用；语义地图与前沿探索；快慢分工；连续 waypoint |

[返回分类总览](../README.md) · [查看全部分类理由](../方法分类索引.md)
