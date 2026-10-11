# TANGO Method

```text
TANGO Method
├── ① 系统架构：怎样把指令变成行为？
│   ├── LLM：指令 + 15 个固定示例 → 伪程序
│   └── Interpreter：执行模块调用，保存中间结果
│
├── ② 导航执行：怎样找到并到达目标？
│   ├── OWLv2 / DETR：检测目标
│   ├── VLFM 式探索：语义价值地图 → 探索航点
│   └── PointNav：深度 + 相对目标距离、方向 → 动作
│
└── ③ 空间记忆：怎样利用以前看过的目标？
    ├── 特征地图：保存已观察区域的视觉特征
    └── 新目标 → 重新计算相似度 → 优先搜索记忆位置
```

**主要贡献：**LLM 程序化组合具身任务；跨目标复用空间记忆。

**输入：**用户指令、上下文示例、RGB、深度、位姿、目标文本／图像，分别交给对应模块。

**历史：**程序变量保存执行结果；空间特征地图保存已见区域。

**输出：**

- LLM：伪程序。
- 感知模块：检测框、图像匹配结果、问答答案。
- 探索模块：航点；PointNav：移动动作。

**训练：**复用预训练模型，三项主要任务无需额外任务训练。

[论文](https://openaccess.thecvf.com/content/CVPR2025/papers/Ziliotto_TANGO_Training-free_Embodied_AI_Agents_for_Open-world_Tasks_CVPR_2025_paper.pdf) · [补充材料](https://openaccess.thecvf.com/content/CVPR2025/supplemental/Ziliotto_TANGO_Training-free_Embodied_CVPR_2025_supplemental.pdf)
