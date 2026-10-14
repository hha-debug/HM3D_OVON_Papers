"""Source-grounded data for the paper/encoder relationship figure.

The source of component choices and training states is ../论文编码器关系总表.md.
Unknown states are preserved; architecture inspiration is not weight inheritance.
"""

MODULES = [
    dict(id="E01", name="SigLIP 图像 / 文本编码器", kind="encoder", io="RGB / 目标文字 → 对齐的图文特征", function="将观察和目标类别编码到可比较的语义空间，供策略理解开放词汇目标。", note="图像编码与文本编码是两路；在 OVON 与 OVSegDT 中冻结。"),
    dict(id="E02", name="CLIP / OpenCLIP", kind="encoder", io="图像 / 文字 → 语义向量或 patch 特征", function="支持图文相似度、物体外观匹配、目标编码，或作为三维特征场的视觉基础。", note="各论文使用的模型尺寸、权重和提取层不一定相同。"),
    dict(id="E03", name="DINO（MTU3D）", kind="encoder", io="RGB → 像素 / patch 视觉特征", function="为区域与物体 queries 提供外观特征，再与三维几何特征融合。", note="正文引用 DINO / DINOv2；未确定具体版本，不等同于 DINOv3。"),
    dict(id="E04", name="DINOv3", kind="encoder", io="RGB → 自监督视觉 patch 特征", function="提取图像语义与空间外观特征，随后压缩为视觉历史 tokens。", note="SoftNav 与 AstraNav 冻结该骨干；型号不强行统一。"),
    dict(id="E05", name="EVA-CLIP", kind="encoder", io="视频单帧 RGB → 视觉 patch tokens", function="编码 Uni-NaVid 的逐帧视频观察，为当前、短期和长期记忆提供视觉特征。", note="记忆压缩由后续池化 / token 合并完成。"),
    dict(id="E06", name="Qwen2.5-VL 原生视觉编码器", kind="encoder", io="图像 / 输入视觉特征 → 视觉 tokens", function="提供 VLM 的图像语义表示，供语言主干进行目标理解和导航决策。", note="AstraNav 用压缩特征接入 ViT；SoftNav 的 DINOv3 输入路径不画成原生 ViT 编码。"),
    dict(id="E07", name="VGGT encoder + fusion decoder", kind="encoder", io="多帧 RGB → 空间几何特征", function="提取跨视角空间先验，补充 Qwen 的语义特征；JanusVLN 用其构建空间隐式记忆。", note="Janus 使用空间特征，不等同于直接建立显式三维场景图。"),
    dict(id="E08", name="PointNet++", kind="encoder", io="三维点集 → 点云 / 区域特征", function="编码局部几何及点集上下文，支持三维物体理解、grounding 或类别预测。", note="SG3D 明确用于对照基线；SG-LLM 的最底层 backbone 未明确。"),
    dict(id="E09", name="稀疏卷积 U-Net", kind="encoder", io="稀疏三维点 / 体素 → 多尺度几何特征", function="编码三维几何结构，供区域 pooling、实例 queries 与三维分割使用。", note="PQ3D 为 Mask3D 风格；MTU3D 使用自身在线感知设置。"),
    dict(id="E10", name="OpenSeg / OpenScene 多视角路径", kind="encoder", io="图像像素特征 → 三维 segment 视觉特征", function="将二维语义特征反投影并跨视角汇聚，与点云、体素特征在三维区域上对齐。", note="原始 PQ3D 的输入路径；不直接复制到 SoftNav 组件清单。"),
    dict(id="E11", name="BERT-base-uncased", kind="encoder", io="目标句子 → 句子语义向量", function="编码 GOAT-Bench LanguageNav 中描述目标实例的自然语言。", note="冻结；后续 GRU 策略负责导航。"),
    dict(id="E12", name="CroCo-v2", kind="encoder", io="观察图像 / 目标图像 → 跨视角视觉特征", function="建立具有跨视角一致性的图像表征，用于实例图像目标的识别和接近。", note="GOAT-Bench ImageNav 技能使用冻结模型。"),
    dict(id="E13", name="ResNet9（mask 分支）", kind="encoder", io="目标二值 mask → mask 特征向量", function="把目标的位置、形状和占据范围编码为 OVSegDT 策略输入。", note="这是新增可学习分支，不是 SigLIP 的图像编码器。"),
    dict(id="E14", name="ResNet18（普通 RGB）", kind="encoder", io="RGB → 视觉特征", function="为 HM3D Semantics 的模仿学习策略提供当前观察特征。", note="该基线从随机初始化开始；具体冻结范围未明确。"),
    dict(id="E15", name="ResNet50（普通视觉 / 深度）", kind="encoder", io="深度或 RGB-D → 视觉 / 几何特征", function="编码可通行环境和当前观察，供 PointNav 或 ObjectNav 循环策略预测动作。", note="MOPA 使用深度版本；HM3D Semantics 的用途随基线变化。"),
    dict(id="E16", name="CLIP ResNet50（CLIP-RN50）", kind="encoder", io="RGB → 图文预训练的视觉语义特征", function="编码 GOAT-Bench 中的导航观察，再与目标特征、位姿一起输入 GRU。", note="不同于普通 ResNet50；两者不能视为同一训练权重。"),
    dict(id="E17", name="PQ3D 风格 query decoder", kind="representation", io="场景特征 + 提示 → 更新后的实体 queries", function="通过场景 / 提示 cross-attention 与空间 self-attention 汇聚任务相关实体信息。", note="MTU3D 借鉴解码结构；不是完整复制原始 PQ3D 权重。"),
    dict(id="E18", name="MTU3D / PQ3D 系在线后端", kind="representation", io="RGB-D + 位姿 → 物体 / frontier queries", function="持续提取和合并三维物体特征，并把物体与探索前沿组织为统一实体表征。", note="SoftNav 冻结调用；后端权重按基准选择，策略 projector / LoRA 跨基准共享。"),
    dict(id="E19", name="Dynam3D encoder", kind="representation", io="CLIP 特征 + 深度 / 位姿 → patch–instance–zone", function="把二维特征投到三维，聚合为物体与区域 tokens，并渲染局部全景特征。", note="底层 CLIP + FastSAM + 三维聚合；D3D-VLP 是否更新该 encoder 未明确。"),
    dict(id="E20", name="SG-LLM 空间 Transformer", kind="representation", io="三维物体实例 → 带空间上下文的 object tokens", function="把场景中的物体组织成语言主干可接收的三维实体表征，支持顺序指代与 grounding。", note="原文未明确最底层对象特征 backbone 和完整冻结范围。"),
    dict(id="E21", name="SemExp 语义地图 CNN", kind="encoder", io="俯视语义 / 占据地图 → 地图特征", function="编码已探索区域、障碍和物体分布，再结合目标类别预测下一步探索位置。", note="HM3D Semantics modular 基线训练探索策略；不是 RGB 图像编码器。"),
    dict(id="E22", name="PointNav 深度视觉编码路径", kind="encoder", io="当前深度图 → 局部环境特征", function="让低层导航策略结合 waypoint 的相对距离和方向选择移动动作。", note="VLFM / TANGO 正文未细分骨干型号；OpenFrontier 复用 VLFM 权重，不补猜 ResNet 版本。"),
    dict(id="P01", name="YOLO-World", kind="perception", io="RGB + 检测词表 → 类别与物体框", function="开放词汇物体检测；MSGNav 用它建立物体节点并识别房间相关语义。", note="完整检测器，不与独立视觉特征编码器等同。"),
    dict(id="P02", name="YOLOv7", kind="perception", io="RGB → COCO 类物体框", function="在原 VLFM 中识别 COCO 目标类别，触发目标接近阶段。", note="固定类别检测器；非 COCO 类使用 GroundingDINO。"),
    dict(id="P03", name="GroundingDINO", kind="perception", io="RGB + 目标文字 → 目标框", function="语言条件的开放词汇检测，为 VLFM 的非 COCO 目标提供定位。", note="GroundingDINO 检测器与 DINO 自监督特征骨干是不同组件。"),
    dict(id="P04", name="YOLOE", kind="perception", io="RGB + 目标类别 → 目标分割 mask", function="部署时为 OVSegDT 提供预测目标 mask，替代训练场景中的真值 mask。", note="论文训练的是接收预测 mask 的导航策略，未证明其微调 YOLOE。"),
    dict(id="P05", name="OWLv2", kind="perception", io="RGB + 类别 / 文字 → 开放词汇框", function="确认目标是否出现；用于 TANGO 检测工具和 OVON 的 OD / VLFM 对照。", note="OVON 修改版 VLFM 使用它；原 VLFM 使用别的检测器。"),
    dict(id="P06", name="DETR", kind="perception", io="RGB → 类别与物体框", function="TANGO 用它检测 COCO 类物体，为程序中的 detect 工具提供结果。", note="与 OWLv2 共同组成不同类别下的工具选择。"),
    dict(id="P07", name="Faster R-CNN", kind="perception", io="RGB → 指定类别物体框", function="MOPA 的 MultiON 检测模块，识别圆柱或自然物体目标。", note="在对应 MultiON 设置中离线微调；不是统一冻结的检测器。"),
    dict(id="P08", name="Detic", kind="perception", io="RGB + 类别词汇 → 语义检测", function="为物体导航和语义 / 实例地图提供类别检测结果。", note="MOPA ObjectNav 冻结调用；GOAT 模块化基线也使用它。"),
    dict(id="P09", name="SAM", kind="perception", io="RGB + 物体提示 → 实例 mask", function="分离检测框对应的物体像素，供深度反投影和三维物体节点构建。", note="MSGNav 的实例分割组件。"),
    dict(id="P10", name="Mobile-SAM", kind="perception", io="RGB + 检测框 → 目标轮廓 mask", function="VLFM 用目标轮廓与深度估计目标位置，生成接近 waypoint。", note="轻量分割组件。"),
    dict(id="P11", name="FastSAM", kind="perception", io="RGB → 图像区域 / 实例 masks", function="给特征 pooling 和三维实例聚合提供区域分组。", note="MTU3D 与 Dynam3D 使用；后续物体特征由其他编码 / 聚合模块产生。"),
    dict(id="P12", name="SAM3", kind="perception", io="RGB + 目标概念 → 目标 mask", function="OpenFrontier 用它提出候选目标，之后由 VLM 验证目标是否存在。", note="分割与 VLM 目标验证是两个步骤。"),
    dict(id="P13", name="RedNet", kind="perception", io="RGB-D → 语义分割与目标面积", function="为 HM3D Semantics IL 基线提供语义标签和 Semantic Goal Exists 特征。", note="使用已有模型；它不是 IL 的 RGB ResNet18 分支。"),
    dict(id="P14", name="SuperGlue", kind="perception", io="两幅图的关键点特征 → 匹配关系", function="TANGO 用跨图像匹配确认目标实例，辅助图像目标导航。", note="匹配网络，不是独立三维场景编码器。"),
    dict(id="P15", name="FrontierNet", kind="perception", io="RGB → 视觉 frontier 与信息增益", function="从图像提出探索候选，并估计候选能揭示的未知空间；VLM 再评估目标相关性。", note="OpenFrontier 直接使用预训练权重。"),
    dict(id="P16", name="BLIP-2（图文工具）", kind="perception", io="图像 + 文字 → 相似度 / 属性 / 回答", function="VLFM 用于语义价值，TANGO 用于探索与问答，GOAT 用于生成目标外观属性。", note="完整图文模型；不同用途不代表都在导航中生成回答。"),
    dict(id="A01", name="MLP projector", kind="adapter", io="视觉 / 三维特征 → 语言模型输入 embedding", function="对齐特征维度与分布，让已有语言模型能够接收视觉或三维 tokens。", note="SoftNav、Uni-NaVid 等训练此连接模块；不等于重新训练编码器。"),
    dict(id="A02", name="视觉压缩 / token 合并", kind="adapter", io="密集视觉 tokens → 少量历史 tokens", function="降低长历史输入成本；AstraNav / SoftNav 使用压缩，Uni-NaVid 使用池化和在线合并。", note="包含不同机制，不表示三篇使用相同压缩权重。"),
    dict(id="A03", name="空间 / 坐标 MLP", kind="adapter", io="坐标 / 距离 / 方向 → 空间 embedding", function="把相对位置或目标坐标接入模型，使空间 tokens 和动作候选可被联合处理。", note="D3D-VLP、Dynam3D、OmniNav 的具体设计不同。"),
    dict(id="A04", name="LoRA", kind="adapter", io="基础模型 + 低秩增量参数 → 适配后的模型", function="用少量增量参数调整已有模型；基础权重冻结并不意味着有效模型行为不变。", note="适配范围按论文记录；CompassNav 视觉分支的具体范围仍未明确。"),
]

def paper(id, name, family, enc, rep, decision, training, modules, source, locator, state="mixed", kind="method", note=""):
    return dict(id=id, name=name, family=family, encoding=enc, representation=rep,
                decision=decision, training=training, modules=modules, source=source,
                locator=locator, state=state, kind=kind, note=note)

PAPERS = [
    paper("mtu", "MTU3D", "在线三维 queries", "DINO [E03] + FastSAM [P11]；稀疏 U-Net [E09] 编码几何；CLIP [E02] 编码目标。", "PQ3D 风格 decoder [E17] → 物体 / frontier queries；动态空间记忆合并物体。", "Spatial Reasoning Transformer → 选择物体或探索前沿 → 局部执行。", "感知 query proposal 先训练后冻结；后续训练空间推理。底层 DINO / CLIP / U-Net 的逐阶段更新范围未明确。", ["E03","P11","E09","E02","E17"], "04_三维空间表征与目标推理/2025_ICCV_MTU3D_Move_to_Understand_a_3D_Scene.pdf", "§3.1–3.4；PDF p.4–6", "staged"),
    paper("soft", "SoftNav", "三维 soft tokens + 视觉历史", "在线三维后端 [E18] → 768 维物体 / frontier queries；DINOv3 [E04] → 图像特征。", "MLP [A01]：768→2048；压缩 [A02]：16 帧×15 tokens；三维 / 视觉两路联合输入。", "Qwen2.5-VL-3B → 探索坐标 → 合格 frontier → GreedyGeodesicFollower。", "冻结三维后端、视觉骨干和 VLM 基础权重；训练 projector + LoRA [A04]。导航策略共享，三维后端权重按基准选择。", ["E18","E04","A01","A02","A04"], "04_三维空间表征与目标推理/2607.14586v1.pdf", "§III–IV-A；PDF p.2–4", "frozen"),
    paper("msg", "MSGNav", "显式多模态场景图", "YOLO-World [P01] 检测 + SAM [P09] 分割；CLIP / OpenCLIP [E02] 编码物体。", "三维物体节点 + 共现图像边 → 关键子图；决策记忆与词表更新。", "GPT-4o（另评估 Qwen-VL-Max）→ 目标 / frontier；VVD 选择可见视点。", "预训练感知与 VLM 直接调用；没有导航专用微调。闭源 VLM 的内部编码器未公开。", ["P01","P09","E02"], "04_三维空间表征与目标推理/2026_CVPR_MSGNav.pdf", "§3.2–4.1；PDF p.4–6；作者附录 §6.3", "call"),
    paper("d3d", "D3D-VLP", "动态三维 tokens + 统一规划", "Dynam3D encoder [E19] → 全景 patch / instance / zone 三层特征。", "空间 MLP [A03] + projector [A01]；CoT 历史；学习式 waypoint 候选。", "NVILA-Lite-2B → 计划；grounding head → 物体；navigation head → waypoint。", "SLFS 联合训练规划 / 定位 / 导航，并训练 waypoint predictor。Dynam3D encoder 在本论文中是否更新未明确。", ["E19","A03","A01"], "04_三维空间表征与目标推理/2026_CVPR_D3D-VLP.pdf", "§3–4.1；PDF p.3–6", "unknown"),
    paper("astra", "AstraNav-Memory", "压缩图像历史", "冻结 DINOv3 [E04] → PixelUnshuffle / Conv [A02] → Qwen 原生 ViT [E06]。", "压缩视觉 tokens + 带位姿历史图像 → 长时图像记忆。", "Qwen2.5-VL-3B → 导航坐标 → 局部执行。", "冻结 DINOv3；训练压缩模块并微调 Qwen。后续 ViT 逐层冻结范围未明确；正文 / 附录 DINO 型号命名不一致。", ["E04","A02","E06"], "05_视觉语言动作决策与视频记忆/2026_CVPR_AstraNav-Memory.pdf", "§3–4.1；PDF p.4–5；附录 p.11", "mixed"),
    paper("janus", "JanusVLN", "语义 / 空间双路隐式记忆", "语义：Qwen 原生视觉 encoder [E06]；空间：VGGT encoder + decoder [E07]。", "两路 KV 记忆 + 投影 / 空间感知融合 [A01]。", "Qwen2.5-VL-7B 语言主干 → 离散导航动作。", "明确冻结语义和空间编码器；只微调 LLM 与 projection layer。DINOv2 / SigLIP 2 仅为替换消融。", ["E06","E07","A01"], "05_视觉语言动作决策与视频记忆/ICLR-2026-janusvln-decoupling-semantics-and-spatiality-with-dual-implicit-memory-for-vision-language-navigation-Paper-Conference.pdf", "§3.3–4.1；PDF p.6–7", "frozen"),
    paper("uni", "Uni-NaVid", "多级视频 token 记忆", "EVA-CLIP [E05] 编码视频帧；当前 / 短期 / 长期视觉 tokens。", "池化与在线 token 合并 [A02] → MLP projector [A01] → 指令联合输入。", "Vicuna-7B → 动作序列或语言回答。", "Stage 1 只训练 projector；Stage 2 训练 projector + LLM。原文列出的两阶段训练对象不含视觉编码器。", ["E05","A02","A01"], "https://arxiv.org/html/2412.06224v2", "作者 v2 §IV–V；已有作者 PDF p.4–7", "staged"),
    paper("omni", "OmniNav", "快慢系统 + 连续动作", "Qwen2.5-VL 原生视觉 encoder [E06]；坐标 MLP [A03] 编码坐标模态。", "慢系统：frontier + 长期图像记忆；快系统：短历史融合特征。", "Qwen2.5-VL-3B-Instruct → 子目标；DiT / flow policy → 连续 waypoints。", "先 AR 多任务训练，后加入 flow policy 并联合 AR 数据。视觉编码器的具体冻结 / 更新范围未明确。", ["E06","A03"], "05_视觉语言动作决策与视频记忆/2026_ICLR_OmniNav.pdf", "§3 / §4.3；PDF p.3–5、7–8", "unknown"),
    paper("compass", "CompassNav", "视觉动作候选决策", "Qwen2.5-VL-7B 原生视觉 encoder [E06]；深度 / occupancy 生成图像上的动作候选。", "候选箭头 + 当前图像 + 指令 → VLM 候选选择；另有 Stop Agent。", "Qwen2.5-VL-7B → 候选索引 → 低层运动；Qwen-QvQ 是数据教师。", "LoRA [A04] SFT 后做 GRPO。Fig.4 两分支标为可训练，但视觉 tower 逐层适配范围未明确。", ["E06","A04"], "05_视觉语言动作决策与视频记忆/2026_ICLR_CompassNav.pdf", "Fig.4 / Implementation / 附录；PDF p.6、8、21", "unknown"),
    paper("vlfm", "VLFM", "语义价值地图 + frontier", "BLIP-2 [P16] 图文相似度；YOLOv7 [P02] / GroundingDINO [P03] 检测；Mobile-SAM [P10] 分割。", "深度 / 位姿 → occupancy；语义分数 → value map → frontier。", "PointNav 深度编码 [E22] + 相对位姿 → 移动动作；骨干型号未细分。", "感知模型直接调用；语义搜索不做目标任务训练。作者使用 VER 在 HM3D 上训练低层 PointNav。", ["P16","P02","P03","P10","E22"], "02_语义地图与前沿探索/VLFM_Vision-Language_Frontier_Maps_for_Zero-Shot_Semantic_Navigation.pdf", "§IV；PDF p.3–5", "mixed"),
    paper("open", "OpenFrontier", "视觉 frontier 与全局管理", "FrontierNet [P15] → 候选与信息增益；SAM3 [P12] → 候选目标 mask。", "带标记图像 → VLM 目标相关性；全局 frontier 管理与几何过滤。", "Gemini-2.5-flash 主实验 → frontier / 目标验证；PointNav [E22] → 移动。", "使用已有 FrontierNet / SAM3 / VLM；不做导航微调。低层复用 VLFM 的 PointNav 权重。", ["P15","P12","E22"], "02_语义地图与前沿探索/2026_RSS_OpenFrontier.pdf", "§III–IV；PDF p.3–6", "call"),
    paper("tango", "TANGO", "程序规划 + 感知工具", "BLIP-2 [P16] 探索 / 问答；CLIP [E02] 分类；OWLv2 / DETR [P05/P06] 检测；SuperGlue [P14] 匹配。", "解释器调用工具；扩展 VLFM 风格特征地图，可针对新目标重算价值。", "GPT-4o → 可执行程序；已有深度 PointNav [E22] → waypoint 导航。", "调用已有模型，不做目标任务微调。低层 PointNav 有 HM3D 预训练历史。", ["P16","E02","P05","P06","P14","E22"], "03_大模型规划与工具调用/2025_CVPR_TANGO.pdf", "§3–4；PDF p.3–6", "call"),
    paper("mopa", "MOPA", "模块化物体导航", "MultiON：Faster R-CNN [P07]；ObjectNav：Detic [P08]；深度 PointNav 用 ResNet50 [E15]。", "语义地图记录物体；规则探索 / 目标位置 → PointNav 输入。", "PointNav：ResNet50 + MLP + LSTM + actor / critic → 移动动作。", "复用 DD-PPO PointNav。MultiON 检测器离线微调；ObjectNav 的 Detic 冻结调用。", ["P07","P08","E15"], "03_大模型规划与工具调用/2024_WACV_MOPA.pdf", "§4–5.3；PDF p.3–5、8", "mixed"),
    paper("ovseg", "OVSegDT", "SigLIP 策略 + 目标 mask", "冻结 SigLIP [E01] 编码 RGB / 目标文字；ResNet9 [E13] 编码 mask；YOLOE [P04] 提供部署 mask。", "观察 / 目标 / mask / 上一动作 → 历史 Transformer。", "动作头 / 价值头 / mask 重建头 → 离散导航动作。", "训练策略与新增 mask 分支，采用 BC / PPO。SigLIP 冻结；使用 YOLOE 预测 mask 不等于微调 YOLOE。", ["E01","E13","P04"], "01_模仿学习与强化学习导航/2026_CVPR_OVSegDT.pdf", "§4.1–5；PDF p.4–8", "frozen"),
    paper("pq", "PQ3D", "基础依赖 · 多模态三维 queries", "PointNet++ [E08]、稀疏 U-Net [E09]、多视角 OpenSeg 路径 [E10]；CLIP [E02] 编码提示。", "特征对齐到三维 segments；prompt-guided query decoder [E17] 汇聚信息。", "mask / 相关性 / 文字输出头 → 分割、grounding、问答等任务。", "进行三维视觉语言多任务学习。MTU3D 借鉴结构，原始编码器清单不直接等于 SoftNav 后端。", ["E08","E09","E10","E02","E17"], "https://arxiv.org/html/2405.11442v2", "原文 §3.1–3.4", "staged", "foundation"),
    paper("dynam", "Dynam3D", "基础依赖 · 动态三维分层表征", "CLIP ViT-L/14 [E02] + FastSAM [P11]；深度 / 位姿把特征投到三维。", "instance / zone encoders 与特征场 [E19] → 三层 tokens；空间 MLP [A03]。", "LLaVA-Phi-3-mini → 转向 / 移动 / 停止动作。", "先训练三维 representation model；训练导航 VLM 时保留已预训练表征与特征场，优化语言模型。", ["E02","P11","E19","A03"], "https://proceedings.neurips.cc/paper_files/paper/2025/file/e1a1847e39a7b79b41199176b152f0e6-Paper-Conference.pdf", "正式论文 §3 / 训练附录；PDF p.3–7、23", "staged", "foundation"),
    paper("sem", "HM3D Semantics", "基准 · 三类作者策略", "RL：ResNet50 [E15] 编码 RGB-D；IL：ResNet18 [E14] + 深度 ResNet50 + RedNet [P13]。", "RL → LSTM；IL → GRU；modular → SemExp 语义地图 CNN [E21]。", "DD-PPO / 行为克隆策略 → 动作；SemExp → 探索目标 + 几何规划。", "数据集本身不带固定编码器。作者训练导航基线；IL RGB 从随机初始化，深度来自 PointNav 预训练，冻结范围未细分。", ["E15","E14","P13","E21"], "00_数据集与任务基准/2023_CVPR_HM3D_Semantics_ObjectNav.pdf", "§4.1–4.3；PDF p.7–8", "mixed", "benchmark"),
    paper("ovon", "HM3D-OVON", "基准 · 统一作者策略架构", "冻结 SigLIP [E01] 编码观察 / 目标；OD 版本增加 OWLv2 [P05]。", "观察特征 + 上一动作 → 历史 Transformer；OD 可切换到目标接近。", "BC / DAgger / PPO / DAgRL 等 → 动作；VLFM 对照改用 OWLv2。", "训练历史策略，SigLIP 冻结。此处的 OWLv2 是 OVON 修改版 VLFM 配置，不是原 VLFM 的检测器。", ["E01","P05"], "00_数据集与任务基准/2024_IROS_HM3D_OVON.pdf", "Policy Architecture / §IV；PDF p.3–6", "frozen", "benchmark"),
    paper("goat", "GOAT-Bench", "基准 · 模块化与学习式基线", "CLIP-RN50 [E16] + CLIP [E02]；LanguageNav 用 BERT [E11]；ImageNav 用 CroCo-v2 [E12]；modular 用 Detic [P08]。", "分技能 / 单一 GRU：隐式记忆；Modular GOAT：语义与实例地图；数据生成用 BLIP-2 [P16]。", "SenseAct-NN 策略 → 动作；模块化匹配 → 导航。ChatGPT-3.5 只用于目标描述生成。", "CLIP、BERT、CroCo-v2 在相应作者策略中冻结；训练 GRU 策略。数据生成模型与在线导航组件分开。", ["E16","E02","E11","E12","P08","P16"], "00_数据集与任务基准/2024_CVPR_GOAT_Bench.pdf", "§4–5 / 附录 C.1；PDF p.4–6、12–14", "frozen", "benchmark"),
    paper("sg", "SG3D / SG-LLM", "基准 · grounding 与导航分开", "SG-LLM 用空间 Transformer [E20]；PointNet++ [E08] 明确属于 3D-VG / 纯 LLM 对照；导航用 CLIP [E02]。", "SG-LLM：object tokens + sequential adapter；导航：CLIP 记忆或 GRU 隐藏状态。", "Vicuna-7B + grounding head → 目标；导航基线单独预测动作。", "SG-LLM 用 LoRA [A04] 适配。最底层对象 backbone 未明确；端到端导航从 GOAT 策略初始化后微调。", ["E20","E08","E02","A04"], "00_数据集与任务基准/2024_SG3D_Sequential_Grounding_and_Navigation.pdf", "§4–5 / 附录 A.3–4；PDF p.5–6、15–16", "mixed", "benchmark"),
]

DEPENDENCIES = [
    dict(source="pq", target="mtu", type="architecture", label="query 学习 / decoder 结构"),
    dict(source="mtu", target="soft", type="backend", label="在线三维后端 / 基准权重"),
    dict(source="mtu", target="soft", type="supervision", label="成功轨迹 → 坐标监督"),
    dict(source="astra", target="soft", type="design", label="视觉压缩设计"),
    dict(source="dynam", target="d3d", type="backend", label="Dynam3D encoder"),
    dict(source="ovon", target="ovseg", type="architecture", label="SigLIP / 历史策略架构"),
    dict(source="vlfm", target="tango", type="design", label="探索与特征地图机制"),
    dict(source="vlfm", target="open", type="weights", label="PointNav 权重"),
    dict(source="goat", target="sg", type="weights", label="端到端导航基线初始化"),
]

# The scope disambiguates benchmark baselines from the dataset and from SG-LLM.
for p in PAPERS:
    p["module_scopes"] = {m: "" for m in p["modules"]}
    if p["kind"] == "benchmark":
        p["module_scopes"] = {m: "作者基线" for m in p["modules"]}
    if p["id"] == "goat":
        p["module_scopes"]["P16"] = "数据生成"
    if p["id"] == "sg":
        p["module_scopes"] = {"E20": "SG-LLM", "A04": "SG-LLM", "E08": "3D-VG / LLM 对照", "E02": "导航基线"}
    if p["id"] == "mtu":
        p["module_scopes"]["E17"] = "架构借鉴"

# Only explicitly supported internal backend dependencies are expanded.
MODULE_DEPENDENCIES = {"E19": ["E02", "P11"]}
INDIRECT_USAGE = [
    dict(paper="d3d", module="E02", via="E19", label="经 Dynam3D 后端"),
    dict(paper="d3d", module="P11", via="E19", label="经 Dynam3D 后端"),
]
