---
title: AstraNav 论文方法部分中英对照
source_format: pasted-text
scope: 用户提供的第 3 节 Method（含 3.1–3.3）
status: excerpt-complete
source_pages: unknown
date: 2026-10-15
---

# AstraNav 论文：方法部分中英对照

本文完整翻译用户提供的方法部分。原论文页码未知；以下按小节和段落定位。原文提及图 5，但未提供图片。公式恢复了粘贴时丢失的上下标和分式排版，未改动原文的技术主张。

目录：[3. 方法](#method) · [3.1 预备知识](#preliminary) · [3.2 模型架构](#architecture) · [3.3 数据集构建](#datasets)

## 公式索引

- [E001 · 式 (1)](#E001)：模型输入序列
- [E002 · 式 (2)](#E002)：PixelUnshuffle 的维度变换
- [E003 · 式 (3)](#E003)：压缩块
- [E004 · 式 (4)](#E004)：总空间压缩倍数
- [E005 · 式 (5)](#E005)：每帧视觉 token 序列

术语约定：

| 原文术语 | 本文译法 | 原文变体及处理 |
|---|---|---|
| token | token（标记） | 统一保留 token |
| frontier | 前沿 | frontier-based sub-goal 译为“基于前沿的子目标” |
| traversability | 可通行性 | 统一译法 |
| patch-merger | 图像块合并器 | 保留英文以便对应模块 |
| compression block | 压缩块 | 统一译法 |
| backbone | 骨干网络 | 统一译法 |
| lifelong navigation | 终身导航 | lifelong learning 译为“终身学习” |
| GOAT-1M-50L / GOAT-1M-500L | 保留数据集名称 | 原文亦写作 GOAT1M-50L / GOAT1M-500L；统一连字符 |

<a id="method"></a>
## 3. Method / 方法

<a id="S001"></a>
**Source:** §3 · S001

**Original:** We present AstraNav-Memory, which compresses each frame into a compact token sequence and feeds it to the Qwen2.5-VL-3B ViT. It reduces the per-frame sequence from 598 tokens to 30. The language model and cross-attention remain unchanged.

**中文:** 我们提出 AstraNav-Memory，将每一帧压缩为紧凑的 token 序列，并将其输入 Qwen2.5-VL-3B 的视觉 Transformer（ViT）。该方法将每帧的序列长度从 598 个 token 缩减至 30 个，同时保持语言模型和交叉注意力机制不变。

<a id="S002"></a>
**Source:** §3 · S002 · Fig. 5（未提供图片）

**Original:** As shown in Fig. 5. The model extracts features with DINOv3-ViT-Base. Two PixelUnshuffle stages follow, each paired with a channel-alignment block. We then flatten the grid and apply a $2\times2$ patch-merger to form 30 tokens. This sequence is passed directly to the first block of the Qwen2.5-VL-3B ViT. The compressor preserves mid-level spatial cues—landmarks, layout, traversability—while substantially reducing sequence length.

**中文:** 如图 5 所示，模型首先使用 DINOv3-ViT-Base 提取特征，随后依次经过两个 PixelUnshuffle 阶段，每个阶段均配有一个通道对齐模块。接着，我们将特征网格展平，并通过一个 $2\times2$ 图像块合并器（patch-merger），生成 30 个 token。该序列直接输入 Qwen2.5-VL-3B ViT 的第一个模块。压缩器在大幅缩短序列长度的同时，保留地标、空间布局和可通行性等中层空间线索。

<a id="preliminary"></a>
## 3.1. Preliminary / 预备知识

<a id="S003"></a>
**Source:** §3.1 · S003

**Original:** Vanilla Qwen2.5-VL uses VisionPatchEmbed (patch=14) and a $2\times2$ patch-merger. The merged tokens go through the Qwen2.5-VL-3B ViT and the multimodal projector, then interact with the LM. We cast navigation as a sequence-to-sequence problem. The model input is

**中文:** 原始 Qwen2.5-VL 使用 VisionPatchEmbed（图像块大小为 14）和一个 $2\times2$ 图像块合并器。合并后的 token 经过 Qwen2.5-VL-3B ViT 和多模态投影器，再与语言模型（LM）交互。我们将导航建模为序列到序列问题，模型输入如下。

<a id="E001"></a>
**Source:** §3.1 · E001 · Eq. (1)

$$
x=[\mathrm{SYS};(P_1,I_1);(P_2,I_2);\ldots;(P_T,I_T);\mathrm{INSTR}]
$$

式 (1)

<a id="S004"></a>
**Source:** §3.1 · S004

**Original:** where SYS is the system prompt, INSTR is the current instruction, and $(P_t,I_t)$ denotes the $t$-th camera-pose and image pair. The camera pose $P_t$ is serialized as text tokens and inserted immediately before the visual tokens of $I_t$, so all pose information is processed by the model’s text encoder.

**中文:** 其中，SYS 为系统提示词，INSTR 为当前指令，$(P_t,I_t)$ 表示第 $t$ 个相机位姿与图像对。相机位姿 $P_t$ 被序列化为文本 token，并紧接在图像 $I_t$ 的视觉 token 之前插入，因此所有位姿信息均由模型的文本编码器处理。

<a id="S005"></a>
**Source:** §3.1 · S005

**Original:** The model then outputs natural language describing either a frontier or a target, whose 2D locations are wrapped in special tags, e.g., `<coordinate>x, y</coordinate>`. As history grows, the cost scales with (tokens per frame) × (history length). This is the long-horizon bottleneck. We change only the visual input sequence. All later modules stay the same.

**中文:** 随后，模型输出描述前沿或目标的自然语言，并使用特殊标签包裹其二维位置，例如 `<coordinate>x, y</coordinate>`。随着历史记录增长，计算开销随“每帧 token 数 × 历史长度”增大，这构成了长时程导航的瓶颈。我们仅改变视觉输入序列，后续所有模块均保持不变。

<a id="architecture"></a>
## 3.2. Model Architecture / 模型架构

<a id="S006"></a>
**Source:** §3.2 · S006

**Original:** Base feature extractor. We first use DINOv3-ViT-Base to extract features from 2D images of the 3D scene. DINOv3 is chosen for its strong self-supervised semantics, robustness to domain shifts, and ability to capture mid-level spatial cues without task labels. The representation is stable under lighting and texture changes and transfers well to unseen environments, which is crucial for VLN exploration. The DINOv3 backbone is frozen to stabilize semantics, reduce training cost, and decouple the compressor and policy from the encoder, preventing co-adaptation and enabling drop-in backbone upgrades.

**中文:** **基础特征提取器。** 我们首先使用 DINOv3-ViT-Base，从三维场景的二维图像中提取特征。选择 DINOv3，是因为它具有较强的自监督语义表征能力、对域偏移的鲁棒性，以及在无需任务标签的情况下捕获中层空间线索的能力。其表征在光照和纹理变化下保持稳定，并能良好地迁移至未见过的环境，这对视觉语言导航（VLN）中的探索至关重要。我们冻结 DINOv3 骨干网络，以稳定语义表征、降低训练成本，并使压缩器及策略与编码器解耦，从而避免共同适应，也便于直接替换、升级骨干网络。

<a id="S007"></a>
**Source:** §3.2 · S007

**Original:** Compression. To reduce sequence length while retaining geometric information, we adopt rearrangement rather than pooling. PixelUnshuffle moves each local $2\times2$ neighborhood into channels,

**中文:** **压缩。** 为在缩短序列长度的同时保留几何信息，我们采用重排操作，而非池化。PixelUnshuffle 将每个局部 $2\times2$ 邻域内的信息重排至通道维度，其维度变换如下。

<a id="E002"></a>
**Source:** §3.2 · E002 · Eq. (2)

$$
\mathrm{PU}_2:\mathbb{R}^{H\times W\times C}\rightarrow\mathbb{R}^{\frac{H}{2}\times\frac{W}{2}\times(4C)}
$$

式 (2)

<a id="S008"></a>
**Source:** §3.2 · S008

**Original:** Compression block. After each PixelUnshuffle (stride 2), the tensor passes through a stride 1 $3\times3$ convolution followed by BatchNorm and SiLU. We refer to this sequence as a compression block. A single block halves the height and width, thus reducing the spatial token count by $4\times$ while remapping channels:

**中文:** **压缩块。** 每次执行 PixelUnshuffle（步长为 2）后，张量依次经过一个步长为 1 的 $3\times3$ 卷积、批归一化（BatchNorm）和 SiLU 激活函数。我们将这一操作序列称为压缩块。单个压缩块将特征图的高度和宽度各减半，从而使空间 token 数量降至原来的四分之一，同时完成通道重映射。

<a id="E003"></a>
**Source:** §3.2 · E003 · Eq. (3)

$$
X^{(i)}=\operatorname{SiLU}\left(\operatorname{BN}\left(\operatorname{Conv}\left(X^{(i-1)}\right)\right)\right)
$$

式 (3)

<a id="S009"></a>
**Source:** §3.2 · S009

**Original:** where $(H_i,W_i)=(H_{i-1}/2,W_{i-1}/2)$. A stack of $N$ compression blocks yields a total spatial compression of

**中文:** 其中，$(H_i,W_i)=(H_{i-1}/2,W_{i-1}/2)$。堆叠 $N$ 个压缩块后，总空间压缩倍数及输出尺寸如下。

<a id="E004"></a>
**Source:** §3.2 · E004 · Eq. (4)

$$
r=2^{2N}=4^N,\qquad(H_N,W_N)=\left(\frac{H_0}{2^N},\frac{W_0}{2^N}\right)
$$

式 (4)

<a id="S010"></a>
**Source:** §3.2 · S010

**Original:** If a final $2\times2$ patch-merger is applied, $(H_N,W_N)$ must be even. We therefore pad the DINO feature patch grid so that $H_0,W_0$ are multiples of $2^{N+1}$, which ensures that both the downsampled grid and the merger are well-defined.

**中文:** 如果最后再使用一个 $2\times2$ 图像块合并器，则 $H_N$ 和 $W_N$ 均须为偶数。因此，我们对 DINO 特征块网格进行填充，使 $H_0$ 和 $W_0$ 均为 $2^{N+1}$ 的整数倍，以确保下采样网格和合并操作均能正常执行。

<a id="S011"></a>
**Source:** §3.2 · S011

**Original:** On the downsampled grid, we add 2D positional encodings. Let $\hat X^{(N)}\in\mathbb{R}^{H_N\times W_N\times C_N}$ denote the output of the last block. After flattening and a $2\times2$ patch-merger $M_2$, the per-frame sequence is

**中文:** 我们在下采样后的网格上加入二维位置编码。令 $\hat X^{(N)}\in\mathbb{R}^{H_N\times W_N\times C_N}$ 表示最后一个压缩块的输出。经过展平和一个 $2\times2$ 图像块合并器 $M_2$ 后，每帧的序列如下。

<a id="E005"></a>
**Source:** §3.2 · E005 · Eq. (5)

$$
\tilde Z_t=M_2\left(\operatorname{Flatten}\left(\hat X^{(N)}\right)\right)+P^{(2D)},\qquad\tilde Z_t\in\mathbb{R}^{L_t\times C_N}
$$

式 (5)

<a id="S012"></a>
**Source:** §3.2 · S012

**Original:** In our main setting with two blocks ($N=2$), a $720\times640$ input (DINO patch (16)) yields $H_0\times W_0=45\times40$, padded to $48\times40$, then $(H_2,W_2)=(12,10)$. After the merger, $L_t=\frac{12\cdot10}{4}=30$.

**中文:** 在采用两个压缩块的主要配置中（$N=2$），对于 $720\times640$ 的输入，DINO 的图像块大小为 16，得到的初始特征网格为 $H_0\times W_0=45\times40$。将其填充至 $48\times40$ 后，经过两次压缩得到 $(H_2,W_2)=(12,10)$。再经图像块合并器处理，每帧的 token 数为 $L_t=\frac{12\cdot10}{4}=30$。

<a id="S013"></a>
**Source:** §3.2 · S013

**Original:** To interface with Qwen2.5-VL-3B ViT, the channel dimension $C_N$ is matched to the ViT hidden size (1280) by the last block (the stride-1 $3\times3$ projection in $\operatorname{Conv}(\cdot)$). The resulting tokens $\tilde Z_t\in\mathbb{R}^{30\times1280}$ are fed directly into the first ViT block, without CLS or register tokens. The multimodal projector and the language model remain unchanged.

**中文:** 为与 Qwen2.5-VL-3B ViT 对接，最后一个压缩块通过 $\operatorname{Conv}(\cdot)$ 中步长为 1 的 $3\times3$ 投影，将通道维度 $C_N$ 对齐至 ViT 的隐藏维度 1280。得到的 token 序列 $\tilde Z_t\in\mathbb{R}^{30\times1280}$ 直接输入 ViT 的第一个模块，不包含 CLS token 或寄存器 token。多模态投影器和语言模型保持不变。

<a id="datasets"></a>
## 3.3. Dataset Construction / 数据集构建

<a id="S014"></a>
**Source:** §3.3 · S014

**Original:** Open-vocabulary object navigation data (OVON). We use the OVON [55] dataset and follow the data generation methodology proposed in mtu3d [64]. Navigation data is comprised of four discrete actions: MOVE FORWARD, TURN LEFT, TURN RIGHT, and STOP. Each action corresponds to a continuous trajectory point, which is defined by its 6-DOF (Degrees of Freedom) pose. This pose consists of a 3D position $(x,y,z)$ and an orientation represented as a quaternion $(w,x,y,z)$.

**中文:** **开放词汇目标导航数据（OVON）。** 我们使用 OVON 数据集 [55]，并遵循 mtu3d [64] 提出的数据生成方法。导航数据包含四种离散动作：前进（MOVE FORWARD）、左转（TURN LEFT）、右转（TURN RIGHT）和停止（STOP）。每个动作对应连续轨迹上的一个点，该点由六自由度（6-DOF）位姿定义。位姿由三维位置 $(x,y,z)$ 和以四元数 $(w,x,y,z)$ 表示的朝向组成。

<a id="S015"></a>
**Source:** §3.3 · S015

**Original:** Then, for each training sample, we randomly sample a pair of start pose and target object category within the scene. During the agent’s exploration, we maintain a 3D occupancy map that classifies each region as either “explored” or “unknown”. The frontier is defined as the boundary points between the two regions.

**中文:** 随后，对于每个训练样本，我们在场景中随机采样一组起始位姿和目标物体类别。在智能体探索过程中，我们维护一张三维占据地图，将各区域标记为“已探索”或“未知”。前沿定义为这两类区域之间的边界点。

<a id="S016"></a>
**Source:** §3.3 · S016

**Original:** The next-subgoal selection policy first computes the shortest-path cost from each candidate frontier to the target and ranks them. It then prefers the shortest path while introducing limited randomness: with high probability it selects the minimum-cost frontier, and with a small probability it randomly samples one from the remaining candidates, balancing efficiency and exploration diversity.

**中文:** 下一子目标的选择策略首先计算各候选前沿到目标的最短路径代价，并据此排序。随后，该策略在优先选择最短路径的同时引入有限的随机性：以较高概率选择代价最低的前沿，以较小概率从其余候选前沿中随机采样一个，从而兼顾效率与探索多样性。

<a id="S017"></a>
**Source:** §3.3 · S017

**Original:** A successful task, which terminates upon finding the target, is recorded as a tuple containing: a first-person RGB video stream, a sequence of frontier-based sub-goals that guided the exploration, and a descriptive natural language instruction. Ultimately, we constructed the OVON-500K training dataset by uniformly sampling from all 145 available scenes.

**中文:** 成功任务在找到目标时终止，并被记录为一个元组，其中包含第一人称 RGB 视频流、引导探索的基于前沿的子目标序列，以及一条描述性的自然语言指令。最终，我们通过对全部 145 个可用场景进行均匀采样，构建了 OVON-500K 训练数据集。

<a id="S018"></a>
**Source:** §3.3 · S018

**Original:** Lifelong Navigation data (GOAT). A novel and more challenging navigation task named GOAT-Bench [23] that integrates multi-modal goal navigation within a lifelong learning paradigm. Different from the episodic and single-goal settings of tasks like OVON, the agent must continuously navigate to a sequence of target objects in a persistent indoor environment (HM3D) in GOAT-Bench.

**中文:** **终身导航数据（GOAT）。** GOAT-Bench [23] 是一项新颖且更具挑战性的导航任务，将多模态目标导航融入终身学习范式。与 OVON 等任务采用的回合式、单目标设置不同，在 GOAT-Bench 中，智能体必须在一个持续存在的室内环境（HM3D）中，连续导航至一系列目标物体。

<a id="S019"></a>
**Source:** §3.3 · S019

**Original:** The defining characteristic of this task is its state continuity: upon completing a sub-task, neither the environment nor the agent’s state is reset, instead, the agent builds upon a persistent memory of history experiences and executes its next instruction after it finishes the current sub-task. This continuous setup is explicitly designed to evaluate the agent’s ability to accumulate and leverage long-term spatial knowledge from prior exploration to perform subsequent subtasks with higher efficiency.

**中文:** 该任务的核心特征是状态的连续性：完成一个子任务后，环境和智能体状态均不重置；智能体在保留历史经验记忆的基础上，于当前子任务结束后执行下一条指令。这种连续设置旨在评估智能体能否从先前探索中积累并利用长期空间知识，以更高效率完成后续子任务。

<a id="S020"></a>
**Source:** §3.3 · S020

**Original:** Consequently, we designed several datasets from all 136 distinct scenes, each corresponding to a different memory length: 50, 100, 200, and 500 steps. This resulted in four datasets, namely GOAT1M-50L, GOAT-1M-100L, GOAT-1M-200L, and GOAT1M-500L. For each dataset, we subsequently performed a data filtering process to prevent an over-representation of overly short trajectories.

**中文:** 因此，我们基于全部 136 个不同场景构建了多组数据集，分别对应 50、100、200 和 500 步的记忆长度，由此得到四个数据集：GOAT-1M-50L、GOAT-1M-100L、GOAT-1M-200L 和 GOAT-1M-500L。随后，我们对各数据集进行过滤，以避免过短轨迹占比过高。

## 阅读提示

此稿仅覆盖用户提供的方法节选。图 5、参考文献 [23]、[55]、[64] 的条目及原论文页码均未提供；未从外部资料补充。译文按原文保留模型流程和公式，未将翻译与技术核验混合。原文排版恢复与表述疑点见同目录 translation_notes.md。
