# SuperNav：第 3.2 节导航工具中英对照


来源：用户粘贴的第 3.2 节全文。范围仅限所给摘录；未提供页码，使用章节与块编号定位。


索引：[标题](#S001) · [工具集与设计原则](#S002) · [观察与视觉点导航](#S003) · [接口公式](#E001) · [运动执行后端](#S005) · [进度与终止](#S006) · [术语表](#terminology)


<a id="S001"></a>
**Source:** 第 3.2 节 / S001

**Original:** 3.2 AGENT-ORIENTED NAVIGATION TOOLS

**中文:** 3.2 面向智能体的导航工具


<a id="S002"></a>
**Source:** 第 3.2 节 / S002

**Original:** Tool suite and design principles. Agent-oriented Tools connect the MLLM’s navigation decisions to executable environment operations. The suite covers initialization, observation, turning, visual-point navigation, goal-progress management, and termination. Its design makes inputs easy for the MLLM to specify and returns useful for the next decision, while keeping destination representations consistent across motion backends. The central observation–motion interface implements these principles by pairing visual destinations with updated observations and execution feedback.

**中文:** 工具集与设计原则。面向智能体的工具将 MLLM 的导航决策与可执行的环境操作连接起来。该工具集涵盖初始化、观察、转向、视觉点导航、目标进度管理和终止。其设计使 MLLM 能够方便地指定输入，并使返回结果有助于下一次决策，同时保证不同运动执行后端采用一致的目的地表示。核心的观察—运动接口通过将图像中指定的目的地与更新后的观察结果及执行反馈相配对，落实上述设计原则。


<a id="S003"></a>
**Source:** 第 3.2 节 / S003

**Original:** Observation and visual-point navigation. An observation returns four RGB images labeled front, right, back, and left, relative to the robot’s heading at capture. These labels let the MLLM associate a candidate or passage with a particular view and select a destination through

**中文:** 观察与视觉点导航。一次观察会返回四张 RGB 图像，分别标记为前、右、后、左；这些方向以拍摄时机器人的朝向为基准。这些标签使 MLLM 能够将候选目标或通道与特定视角关联起来，并通过以下接口选择目的地：


<a id="E001"></a>
**Source:** 第 3.2 节，视觉点导航接口 / E001

$$
\operatorname{PointNav}(d,[u,v]),\qquad u,v\in[0,1],
$$


<a id="S004"></a>
**Source:** 第 3.2 节 / S004

**Original:** where $d$ identifies the view and $u$, $v$ are horizontal and vertical coordinates normalized from its top-left corner. The Agent may select a point on a candidate or on visible floor to approach a target or obtain a new view. The Tool executes the movement internally and returns new fourview images, execution status, and concise diagnostics; the turning Tool provides the same types of feedback. These returns connect destination selection to visual rechecking without requiring a separate observation call after every movement.

**中文:** 其中，$d$ 表示视角，$u$、$v$ 分别为以图像左上角为原点的归一化水平坐标和垂直坐标。智能体可以选择候选目标上的一点，或可见地面上的一点，以接近目标或获得新的视角。工具在内部执行移动，并返回新的四方向图像、执行状态和简要诊断信息；转向工具也提供相同类型的反馈。这些返回结果将目的地选择与视觉复核衔接起来，无需在每次移动后额外调用一次观察工具。


<a id="S005"></a>
**Source:** 第 3.2 节 / S005

**Original:** Interchangeable motion backends. The visual-point interface separates destination selection from the mechanism that executes it. The geometric backend, termed Geo-based Executor, uses depth, camera calibration, and pose to associate the selected point with an environment location, then plans and follows a path to a reachable goal. Simulation supplies rendered depth, camera poses, and navigation geometry, while robot deployment uses sensed geometry and localization (Appendix A.1). The learned backend, Learned Executor, is inspired by NoMaD’s goal-conditioned generative-policy design (Sridhar et al., 2024), replacing destination-image goals with marked points in reference observations. It predicts local displacement increments and a stopping signal from the selected image–point pair and recent RGB observations. It turns toward the selected view and repeatedly executes short predicted motion segments within one Tool call. Both backends accept visual destinations and return observations with execution feedback, so the Agent can retain the same decision workflow; learned-controller architecture and training details are deferred to Appendix C.

**中文:** 可互换的运动执行后端。视觉点接口将目的地选择与运动执行机制分离。几何式后端称为几何式执行器（Geo-based Executor），利用深度、相机标定信息和位姿，将所选点对应到环境中的一个位置，然后规划路径并沿路径前往可达的目标位置。仿真环境提供渲染得到的深度、相机位姿和用于导航的几何信息；机器人部署则使用传感器获取的几何信息和定位结果（附录 A.1）。学习式后端称为学习式执行器（Learned Executor），其设计受到 NoMaD 基于目标条件的生成式策略启发（Sridhar et al., 2024），将以目的地图像表示的目标替换为参考观察图像中标记的点。它根据所选的图像—点对和近期 RGB 观察，预测局部位移增量及停止信号。它会转向所选视角的方向，并在一次工具调用内部反复执行预测得到的短程运动片段。两种后端都接受图像中指定的目的地，并返回观察结果与执行反馈，因此智能体能够保持相同的决策流程；学习式控制器的架构与训练细节见附录 C。


<a id="S006"></a>
**Source:** 第 3.2 节 / S006

**Original:** Progress and termination. Progress and termination Tools extend this workflow from individual movements to complete requests. The progress Tool lets the MLLM query or update pending/found goals and continue with the remaining items; the termination Tool records its achieved/blocked judgment and closes the session. These records represent the MLLM’s reports rather than independent semantic verification. Deciding when to search further, recheck a candidate, or recover from failed motion thus remains the MLLM’s responsibility, for which Skills provide reusable guidance.

**中文:** 进度与终止。进度工具和终止工具将这一流程从单次移动扩展到完整请求的处理。进度工具使 MLLM 能够查询或更新待完成／已找到的目标，并继续处理剩余目标；终止工具记录其关于任务已完成或执行受阻的判断，并关闭会话。这些记录反映的是 MLLM 的报告，而非独立的语义核验结果。因此，何时继续搜索、复核候选目标，或从失败的移动中恢复，仍由 MLLM 负责判断，技能为这些决策提供可复用的指导。


<a id="terminology"></a>
**术语表**

| 规范术语 | 定义或说明 | 原文形式 | 统一译法 |
|---|---|---|---|
| agent-oriented Tools | 沿用前文译法 | agent-oriented Tools | 面向智能体的工具 |
| MLLM | multimodal large language model；沿用前文的首次定义 | MLLM | 多模态大语言模型 |
| visual-point navigation | 通过图像中的点指定目的地 | visual-point navigation | 视觉点导航 |
| visual-point interface | 视角与归一化图像坐标构成的接口 | visual-point interface | 视觉点接口 |
| Geo-based Executor | 使用深度、标定与位姿进行目标定位和运动执行 | Geo-based Executor | 几何式执行器 |
| Learned Executor | 依据 RGB 观察与图像—点对预测运动 | Learned Executor | 学习式执行器 |
| goal-conditioned generative policy | 保留生成式策略的目标条件含义 | goal-conditioned generative policy | 基于目标条件的生成式策略 |
| goal-progress management | 查询或更新待完成／已找到的目标 | goal-progress management | 目标进度管理 |
| semantic verification | 与模型自行报告区分 | semantic verification | 语义核验 |
| Skills | 模型可读取的可复用指导 | Skills | 技能 |