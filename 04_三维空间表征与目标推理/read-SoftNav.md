# SoftNav Method

```text
SoftNav Method
├── ① 三维感知与视觉记忆：怎样把连续观测变成场景特征？
│   ├── RGB-D + 位姿：沿用 MTU3D 适配的 PQ3D 后端 → 增量分割、物体库与占据地图前沿
│   ├── 三维 queries：每个物体或 frontier 对应一个 768 维向量 → 编码几何、语义与空间上下文
│   └── 视觉历史：冻结 DINOv3 + CompressionHead/PatchMerger → 每帧 15 tokens，保留最近 16 帧
│
├── ② Soft-token 注入与决策：怎样让 VLM 使用三维特征？
│   ├── MLP projector：768 → 1408 → 2048，GELU + LayerNorm → 每个三维实体生成一个 soft token
│   ├── 输入拼接：用 soft tokens 替换占位 embedding → 与视觉记忆、文本指令一起输入 Qwen2.5-VL-3B
│   └── VLM 推理：联合注意力处理三种输入 → 自回归生成下一步探索坐标；默认保留全部三维 tokens
│
└── ③ 导航执行：怎样把生成坐标变成可执行探索点？
    ├── 前沿吸附：选择最接近预测坐标的合格 frontier；到机器人距离不超过最近 frontier 距离的 2 倍
    ├── 局部导航：GreedyGeodesicFollower 前往选定 frontier → 获取新观测，更新场景特征与视觉记忆
    └── 异常恢复：frontier 集合为空时触发 rescue → 从当前位姿重新启动探索
```

**主要贡献：**将三维编码器的物体与 frontier 连续表征直接投影到 VLM 输入空间，通过 soft-token 接口联合三维感知、近期视觉记忆与语言目标进行探索决策。一个 soft token 对应一个实体的特征向量；论文通过文字坐标、丰富文字描述、文字坐标加 LoRA 与 soft tokens 的消融，检验三维信息传递接口的影响。

**输入：**文本导航指令，以及 RGB-D 图像流与机器人位姿；VLM 接收压缩后的视觉历史、投影后的三维物体/frontier tokens 和文本指令。

**历史：**三维后端维护跨观测的物体库与占据地图，并更新探索前沿；视觉分支滚动保留最近 16 帧，每帧 15 tokens，形成最多 240 个视觉 tokens。三维 token 块默认以前沿在前、物体在后的顺序组织。

**输出：**

- VLM：下一步探索坐标的文本字符串，例如“0.5, 3.2”。
- 前沿选择模块：将预测坐标吸附到满足距离约束的 frontier，得到可执行 waypoint。
- 局部导航模块：前往该 waypoint 的移动动作；随后进入下一轮感知与决策。

**训练：**冻结视觉编码器、PQ3D 系三维后端与 Qwen2.5-VL-3B 基础权重，只训练约 4M 参数的 MLP projector 和约 13M 参数的 LoRA，合计约 17M 可训练参数。监督来自 MTU3D 在 OVON 训练场景中成功 episodes 的 1,187 个决策样本，以教师选择的 frontier 坐标字符串为标签，用自回归交叉熵训练 6 epochs。导航策略只在 OVON 训练一次并跨基准复用，但 PQ3D 后端使用 MTU3D 的基准专用 stage-2 权重。

**推理算力（论文配置）：**单张 NVIDIA RTX 4090 上，每次高层决策约 1 s；PQ3D 三维感知约 0.45 s，VLM 推理约 0.49 s，MLP projector 约 0.07 ms。训练也使用单张 RTX 4090。

**评测：**HM3D-OVON 的 Val Seen、Val Seen Synonyms、Val Unseen 各评测 120 个 episodes，成功距离阈值为 0.25 m；SR 分别为 74.2%、68.3%、66.7%，SPL 分别为 33.9%、28.6%、25.7%。导航策略不再训练即可用于 GOAT-Bench 与 SG3D：GOAT-Bench Val Seen 的 SR/SPL 为 67.2%/29.0%，SG3D 的子任务 SR、整任务 SR、SPL 为 47.2%、16.6%、14.7%。实体机器人测试在 Unitree Go2 上完成 19/30 次成功导航，成功由人工判断。

**原文定位：**方法见 §III、Fig. 2 和 Algorithm 1（PDF 第 2–4 页）；训练配置见 §IV-A（第 4 页）；基准结果见 Tables II–IV（第 5 页）；接口消融见 Table V（第 6 页）；推理效率见 §IV-D（第 6 页），实体机器人测试见第 8 页。

[论文](2607.14586v1.pdf) · [arXiv 全文](https://arxiv.org/html/2607.14586v1)
