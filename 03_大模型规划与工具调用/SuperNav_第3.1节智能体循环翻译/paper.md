# SuperNav：第 3.1 节智能体循环中英对照


来源：用户在当前聊天粘贴的第 3.1 节全文。范围仅限所给摘录；未提供页码，使用章节与块编号定位。


索引：[标题](#S001) · [持续决策](#S002) · [任务状态与上下文管理](#S003) · [任务终止](#S004) · [术语表](#terminology)


<a id="S001"></a>
**Source:** 第 3.1 节 / S001

**Original:** 3.1 AGENT LOOP

**中文:** 3.1 智能体循环


<a id="S002"></a>
**Source:** 第 3.1 节 / S002

**Original:** Continuous decision-making. The agent loop organizes the request, visual observations, and interaction history into a continuing navigation process. Initialization opens a session and returns the first observation, from which the MLLM interprets the requested goals and completion conditions. At each subsequent step, it uses the current context and task progress to choose an operation: observe, move, update goal state, or read relevant Skill guidance. Tool returns and retrieved instructions enter the context for the next decision, allowing execution feedback to change the MLLM’s plan. For example, after approaching a candidate, the MLLM inspects the new images, judges whether the candidate satisfies the request, and either records completion or continues searching.

**中文:** 持续决策。智能体循环将请求、视觉观察和交互历史组织成一个持续进行的导航过程。初始化时，系统开启一个会话，并返回首次观察结果，MLLM 据此理解请求中的目标及任务完成条件。在随后的每一步中，MLLM 根据当前上下文和任务进度选择一种操作：观察、移动、更新目标状态，或读取相关技能指导。工具返回的结果和读取到的指导说明会进入下一次决策的上下文，使执行反馈能够改变 MLLM 的计划。例如，在接近一个候选目标后，MLLM 会检查新的图像，判断该候选目标是否满足请求，并据此记录完成状态或继续搜索。


<a id="S003"></a>
**Source:** 第 3.1 节 / S003

**Original:** Task state and context management. Long-horizon execution requires these local decisions to remain connected to earlier evidence and unfinished goals. Goal records maintain pending and completed items, while textual interaction history retains inspected areas, candidate clues, and failed attempts for later decisions. To control the growing image context, the harness removes an image’s media payload from subsequent requests once it has been processed and superseded by newer observations. It preserves textual history, task state, and image paths; the MLLM can request earlier images from the workspace when needed. This media-only pruning limits repeated image transmission while retaining access to earlier evidence and task progress.

**中文:** 任务状态与上下文管理。长时程执行要求这些局部决策始终与先前的证据和未完成的目标保持关联。目标记录保存待完成项和已完成项，而文本形式的交互历史则保留已经检查的区域、候选目标线索和失败尝试，供后续决策使用。为了控制不断增长的图像上下文，运行框架会在某幅图像已被处理、且被更新的观察结果替代后，将该图像的媒体内容从后续请求中移除。运行框架仍保留文本历史、任务状态和图像路径；MLLM 可以在需要时请求读取工作区中的早期图像。这种仅针对媒体内容的裁剪减少了图像的重复传输，同时保留了对先前证据和任务进度的访问。


<a id="S004"></a>
**Source:** 第 3.1 节 / S004

**Original:** Task termination. The MLLM judges whether the request is satisfied or execution is blocked from the observations and progress records, and selects the termination Tool to end the loop. A termination Tool records either declared outcome and closes the session; successful closure confirms that the session ended, not that the task succeeded. Benchmark scoring evaluates success separately from this declaration. The loop therefore depends on operations that expose observations, execute motion, and maintain state, whose interfaces we describe next; runtime restrictions and execution limits appear in Appendix A.

**中文:** 任务终止。MLLM 根据观察结果和进度记录，判断请求是否已得到满足，或执行过程是否受阻，并选择终止工具结束循环。终止工具记录模型声明的结果（任务已完成或执行受阻），并关闭会话；成功关闭会话只能确认会话已经结束，并不能证明任务已经成功完成。基准评测中的评分会独立于这一声明判断任务是否成功。因此，这一循环依赖于能够提供观察结果、执行运动和维护状态的操作。接下来我们将介绍这些操作的接口；运行时约束和执行限制见附录 A。


<a id="terminology"></a>
**术语表**

| 规范术语 | 定义或说明 | 原文形式 | 统一译法 |
|---|---|---|---|
| Agent loop | 与上一部分保持一致 | Agent loop | 智能体循环 |
| MLLM | multimodal large language model；沿用上一部分的首次定义 | MLLM | 多模态大语言模型 |
| harness | 沿用第 3 节概述的译法 | harness | 运行框架 |
| Skills / Skill guidance | 模型可读取的指导说明 | Skills / Skill guidance | 技能 / 技能指导 |
| Tools / Tool calls | 可调用的操作 | Tools / Tool calls | 工具 / 工具调用 |
| task state | 与目标状态和任务进度区分 | task state | 任务状态 |
| context | 与上下文管理保持同一译法 | context | 上下文 |
| media-only pruning | 移除后续请求中的旧图像媒体内容，保留文本、状态和路径 | media-only pruning | 仅针对媒体内容的裁剪 |
| Task termination | 关闭会话与任务成功分别表述 | Task termination | 任务终止 |