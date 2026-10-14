# SuperNav：第 3.3 节导航技能中英对照


来源：用户粘贴的第 3.3 节正文及表 1。范围仅限所给摘录；未提供页码，使用章节、表号及块编号定位。


索引：[标题](#S001) · [技能的组织与发现](#S002) · [导航指导](#S003) · [与智能体循环的集成](#S004) · [表 1](#T001) · [术语表](#terminology)


<a id="S001"></a>
**Source:** 第 3.3 节 / S001

**Original:** 3.3 NAVIGATION SKILLS

**中文:** 3.3 导航技能


<a id="S002"></a>
**Source:** 第 3.3 节 / S002

**Original:** Skill organization and discovery. Navigation Skills organize reusable navigation experience into procedural guidance that the MLLM can read on demand. Each Skill is a Markdown package describing its applicable situations, evidence to inspect, recommended steps, and linked references. The bundle comprises a main navigation Skill, backend-specific Tool-use instructions, and references for exploration, recovery, and entrance search, together covering search, recovery, and completion. The harness exposes Skill names and descriptions so the MLLM can discover the relevant package and load its instructions or linked references into the decision context.

**中文:** 技能的组织与发现。导航技能将可复用的导航经验整理成 MLLM 可以按需读取的操作指导。每项技能都是一个 Markdown 资料包，描述其适用情境、需要检查的证据、建议步骤，以及通过链接提供的参考资料。该技能集合包含一个主导航技能、针对不同后端的工具使用说明，以及有关探索、恢复和入口寻找的参考资料，共同覆盖搜索、恢复和任务完成。运行框架向 MLLM 提供技能名称和描述，使其能够发现相关技能包，并将其中的指导说明或链接的参考资料加载到决策上下文中。


<a id="S003"></a>
**Source:** 第 3.3 节 / S003

**Original:** Navigation guidance. The guidance addresses three recurring decisions: where to search, how to recover, and when to finish. Search guidance asks the MLLM to record inspected areas, visible openings, and uncertain branches, preserving alternatives for later exploration; revisiting relies on visual recognition rather than a stored return path. Recovery guidance recommends changing the point or route after failed motion, stepping back when a candidate is difficult to inspect, or seeking an entrance when glass blocks access. Completion guidance calls for checking the candidate’s appearance, requested relations, and surrounding context, then recording verified goals and continuing with any remaining request. For example, a blocked passage can prompt the MLLM to read recovery guidance, select another route, and reassess the candidate from the returned images.

**中文:** 导航指导。这些指导针对三类反复出现的决策：到哪里搜索、如何恢复，以及何时结束。搜索指导要求 MLLM 记录已经检查的区域、可见开口和尚不确定的探索分支，为后续探索保留备选方案；再次访问这些区域时，依靠视觉识别，而非存储的返程路径。恢复指导建议在移动失败后更换目标点或路线，在难以检查候选目标时后退，或在玻璃阻挡通行时寻找入口。完成指导要求检查候选目标的外观、请求中指定的关系以及周围环境信息，然后记录已经核验的目标，并继续处理请求中的剩余部分。例如，通道受阻可能促使 MLLM 读取恢复指导、选择另一条路线，并根据返回的图像重新评估候选目标。


<a id="S004"></a>
**Source:** 第 3.3 节 / S004

**Original:** Integration with the Agent loop. Together, the loop sustains decisions, Tools provide execution capabilities, and Skills guide their use. Skills influence decisions by entering the context; they neither add environment capabilities nor programmatically enforce action sequences or semantic judgments. The MLLM still chooses each operation from the current request and feedback, using the shared loop, interfaces, and guidance to handle different navigation tasks.

**中文:** 与智能体循环的集成。智能体循环维持持续决策，工具提供执行能力，技能指导这些工具的使用。技能通过进入上下文影响决策；它们既不会增加环境操作能力，也不会以程序方式强制规定动作序列或语义判断。MLLM 仍依据当前请求和反馈选择每一项操作，并利用共享的循环、接口和指导处理不同的导航任务。


<a id="C001"></a>
**Source:** 表 1 图注 / C001

**Original:** Table 1: Single-object, multi-object, and demand-driven navigation results. SR (%) and SPL (01): instance tasks use viewpoint geodesic distance < 1 m; demand-driven tasks use 2 m boundingbox regions. Task counts are in parentheses; bold marks column bests.

**中文:** 表 1：单目标、多目标和需求驱动导航结果。报告 SR（%）和 SPL（0–1）：实例级任务采用到目标视点的测地距离小于 1 m 的判定标准；需求驱动任务采用 2 m 包围框区域。括号中标注任务数量，粗体表示各列的最优结果。


<a id="T001"></a>
**Source:** 用户粘贴的表 1 / T001

**Original:** Our instance-navigation benchmark: Single-object (150), Multi-object (150). Demand-driven benchmark: Demand-driven (200).

| Method | Single-object SR↑ | Single-object SPL↑ | Multi-object SR↑ | Multi-object SPL↑ | Demand-driven SR↑ | Demand-driven SPL↑ |
|---|---:|---:|---:|---:|---:|---:|
| NaVid | 24.67 | 0.1599 | 2.67 | 0.0216 | 17.00 | 0.0920 |
| UniNaVid | 34.00 | 0.1833 | 1.33 | 0.0131 | 25.00 | 0.0943 |
| StreamVLN | 13.33 | 0.1036 | 0.00 | 0.0000 | 25.50 | 0.0775 |
| OmniNav (Action Former) | 27.33 | 0.2133 | 4.00 | 0.0275 | 37.50 | 0.1213 |
| SuperNav + Geo-based Executor | **78.00** | **0.4127** | **34.00** | **0.1388** | **59.50** | **0.1801** |
| SuperNav + Learned Executor | 68.00 | 0.2059 | **34.00** | 0.0862 | 45.00 | 0.1603 |

**中文:** 我们的实例级导航基准：单目标（150）、多目标（150）。需求驱动基准：需求驱动（200）。

| 方法 | 单目标 SR↑ | 单目标 SPL↑ | 多目标 SR↑ | 多目标 SPL↑ | 需求驱动 SR↑ | 需求驱动 SPL↑ |
|---|---:|---:|---:|---:|---:|---:|
| NaVid | 24.67 | 0.1599 | 2.67 | 0.0216 | 17.00 | 0.0920 |
| UniNaVid | 34.00 | 0.1833 | 1.33 | 0.0131 | 25.00 | 0.0943 |
| StreamVLN | 13.33 | 0.1036 | 0.00 | 0.0000 | 25.50 | 0.0775 |
| OmniNav (Action Former) | 27.33 | 0.2133 | 4.00 | 0.0275 | 37.50 | 0.1213 |
| SuperNav + 几何式执行器 | **78.00** | **0.4127** | **34.00** | **0.1388** | **59.50** | **0.1801** |
| SuperNav + 学习式执行器 | 68.00 | 0.2059 | **34.00** | 0.0862 | 45.00 | 0.1603 |


<a id="terminology"></a>
**术语表**

| 规范术语 | 定义或说明 | 原文形式 | 统一译法 |
|---|---|---|---|
| Navigation Skills | 沿用前文译法 | Navigation Skills | 导航技能 |
| MLLM | multimodal large language model；沿用前文的首次定义 | MLLM | 多模态大语言模型 |
| harness | 组织执行过程与上下文 | harness | 运行框架 |
| Tools | 可调用的环境操作 | Tools | 工具 |
| Agent loop | 沿用前文译法 | Agent loop | 智能体循环 |
| procedural guidance | 可按需读取的流程性指导 | procedural guidance | 操作指导 |
| semantic judgments | 保留与程序强制执行之间的区别 | semantic judgments | 语义判断 |
| Geo-based Executor | 沿用第 3.2 节译法 | Geo-based Executor | 几何式执行器 |
| Learned Executor | 沿用第 3.2 节译法 | Learned Executor | 学习式执行器 |