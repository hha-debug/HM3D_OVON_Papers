# Reading order

这是一条学习依赖顺序，不是方法排名，也不是永久分类。

## 第一层：Benchmark 定义

1. **HM3D-OVON (IROS 2024)**
   - 为什么此时读：先统一任务定义、数据划分、成功条件与 SR/SPL。
   - 重点 Section：III（Benchmark）、IV（Experiments），以及 split 与 sensor 设置。
   - 前置知识：Habitat、ObjectNav、SR、SPL。
   - 建议先读：无。

## 第二层：建立实验协议与清晰系统基线

2. **TANGO (CVPR 2025)**
   - 为什么此时读：主文以单一 Val-Unseen 表呈现 HM3D-OVON，便于先练习核对实验协议。
   - 重点 Section：实验设置、Table 1、实现细节。
   - 前置知识：frontier exploration、PointGoal controller、LLM program composition。
   - 建议先读：HM3D-OVON。

3. **OpenFrontier (RSS 2026)**
   - 为什么此时读：训练依赖少，能直接观察 frontier、目标确认与低层控制如何连接。
   - 重点 Section：system overview、frontier management、Table I、real-world setup。
   - 前置知识：frontier、occupancy map、VLM prompting、PointGoal policy。
   - 建议先读：TANGO。

4. **OVSegDT (CVPR 2026)**
   - 为什么此时读：实验表对 split、传感器与训练目标写得集中，适合衔接 benchmark 的训练式基线。
   - 重点 Section：observation encoding、training objectives、Table 1、supplementary training details。
   - 前置知识：behavior cloning、PPO、segmentation mask、transformer policy。
   - 建议先读：HM3D-OVON，再读 TANGO。

## 第三层：探索、grounding 与空间表示

5. **MTU3D (ICCV 2025)**
   - 为什么此时读：需要同时理解在线 grounding、frontier query 与探索轨迹；其抽样评测限制也应一并核对。
   - 重点 Section：Approach、Experiment 4.1、Table 3、supplementary 的数据与抽样说明。
   - 前置知识：RGB-D、3D grounding、frontier、cross-attention。
   - 建议先读：OpenFrontier。

6. **MSGNav (CVPR 2026)**
   - 为什么此时读：HM3D-OVON 证据位于 supplementary，适合练习将主文系统描述与补充实验对齐。
   - 重点 Section：scene graph construction、decision loop、supplementary Section 2.1 / Table 3。
   - 前置知识：3D scene graph、open-vocabulary perception、pose 与 RGB-D 投影。
   - 建议先读：MTU3D。

## 第四层：视频 VLA 与端到端导航

7. **Uni-NaVid (RSS 2025)**
   - 为什么此时读：需要在理解基本协议后，再处理视频 token、统一动作接口与多任务训练数据。
   - 重点 Section：data unification、online token merge、ObjectNav/HM3D-OVON evaluation、real-world experiments。
   - 前置知识：VLM/VLA、video tokens、SFT、continuous navigation。
   - 建议先读：MTU3D。

8. **CompassNav (ICLR 2026)**
   - 为什么此时读：HM3D-OVON 结果在 Appendix Table 6，阅读时需把训练配方和扩展评测对应起来。
   - 重点 Section：data construction、SFT/RFT recipe、reward、Appendix Table 6。
   - 前置知识：SFT、reinforcement fine-tuning、action-value supervision。
   - 建议先读：Uni-NaVid。

9. **D3D-VLP (CVPR 2026)**
   - 为什么此时读：同时涉及在线 3D 表示、语言规划、grounding 与导航输出，依赖较多。
   - 重点 Section：3D CoT、hybrid data、Section 4、Table 2。
   - 前置知识：RGB-D feature field、VLM、CoT、waypoint navigation。
   - 建议先读：MTU3D 和 Uni-NaVid。

## 第五层：长时记忆与统一导航

10. **AstraNav-Memory (CVPR 2026)**
    - 为什么此时读：应先理解视频导航，再分析压缩后的长历史如何进入策略。
    - 重点 Section：visual tokenizer、memory length/compression ablation、Table 2。
    - 前置知识：ViT tokens、KV/context length、lifelong navigation。
    - 建议先读：Uni-NaVid。

11. **OmniNav (ICLR 2026)**
    - 为什么此时读：统一目标形式、快慢系统、frontier 与长历史同时出现，适合作为综合阅读。
    - 重点 Section：fast/slow systems、multi-task data、Tables 2–5、real-robot deployment。
    - 前置知识：VLM/VLA、flow matching、frontier、memory、multi-task training。
    - 建议先读：OpenFrontier、Uni-NaVid、AstraNav-Memory。

## 暂不进入正式顺序

- **JanusVLN (ICLR 2026)**：正式录用已确认，但当前未核验到论文自身的 HM3D-OVON 实验；在证据补齐前保持 `NEED_REVIEW`。

## 新增论文：SuperNav（2026-10-14）

- **SuperNav（arXiv 预印本，2026）**：归入大模型规划与工具调用，建议在 TANGO 后阅读。
- 重点 Section：§3.1 智能体循环与上下文管理、§3.2 工具与视觉点接口、§3.3 技能指引；Fig. 2（PDF 第 4 页）。
- 可对照 TANGO 的程序组合，比较 SuperNav 的按步工具调用、执行反馈、目标核验和失败恢复。
- HM3D-OVON 的抽样范围和成功距离见 §4.3 / Table 2；可选学习式低层控制器的训练见 Appendix C。
