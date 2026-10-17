# 新增核心方法图

三图均用本地 PDF 经 pypdfium2 以 4 倍比例（288 dpi）渲染后裁剪；先检查整页，再逐图执行 view_image 检查。原图内容未改动。裁剪去除正文与图注，保留全部方法标签、箭头、图例和小安全边距。

所有裁剪坐标均为 **PDF 点坐标、左上角原点**，顺序为 `[left, top, right, bottom]`，页码为 PDF 文件页序、从 1 开始。

| 论文 | 资源 | 来源 | 裁剪坐标 | 图像尺寸 | QA |
|---|---|---|---|---|---|
| D3D-VLP | `d3d_fig2_method.png` | `04_三维空间表征与目标推理/2026_CVPR_D3D-VLP.pdf`，第 3 页，Fig. 2 | `[50, 67, 560, 228]` | 2040 × 644 px | 通过 |
| SoftNav | `softnav_fig2_method.png` | `04_三维空间表征与目标推理/2607.14586v1.pdf`，第 3 页，Fig. 2 | `[92, 58, 515, 325]` | 1692 × 1068 px | 通过 |
| JanusVLN | `janusvln_fig2_method.png` | `05_视觉语言动作决策与视频记忆/ICLR-2026-janusvln-decoupling-semantics-and-spatiality-with-dual-implicit-memory-for-vision-language-navigation-Paper-Conference.pdf`，第 5 页，Fig. 2 | `[104, 78, 507, 303]` | 1612 × 900 px | 通过 |

## 放置要求

- D3D-VLP 是宽幅框架图，小字主要集中在航点和输出端，建议占幻灯片 11–12 英寸宽度。正文放在图下，不将图压进半页。
- SoftNav 包含完整双流编码、soft-token 注入与导航闭环，建议占 8–9 英寸宽度，配少量外置解释；若要同时保留较多方法文字，拆为“方法机制页＋完整原图页”。
- JanusVLN 建议占 8–9 英寸宽度。图为论文设计示意；讲者备注需要提醒公开评测在 Qwen 语义侧重新输入采样历史，VGGT 空间侧才明确跨导航步复用缓存，不将原图直接解释为两路均跨步复用 KV。

机器可读元数据见 `method-figure-manifest.json`；复现脚本为 `extract_method_figures.py`，参数 `preview` 输出预览，参数 `crop` 输出三张裁图与 JSON 元数据。

## SoftNav 分页放大图（新增）

两幅局部合起来覆盖 Fig. 2 的全部方法内容。仅省略父图 y=505–519 px 的灰色水平分隔线和相邻空白，没有省略任何模块、箭头或方法标签。两图已逐张 view_image 检查通过，建议分别全宽放置。

| 资源 | 父图像素裁剪坐标 | PDF 点坐标（左上原点） | 尺寸 | 内容 | QA |
|---|---|---|---|---|---|
| `softnav_encoding_detail.png` | `[0, 0, 1692, 505]` | `[92, 58, 515, 184.25]` | 1692 × 505 px | 上半：视觉编码、三维查询与 MLP soft-token 接口 | 通过 |
| `softnav_decision_detail.png` | `[0, 520, 1692, 1068]` | `[92, 188, 515, 325]` | 1692 × 548 px | 下半：视觉／三维／文本融合、模型输出与前沿选择 | 通过 |

父图：`softnav_fig2_method.png`。源 PDF：`04_三维空间表征与目标推理/2607.14586v1.pdf`，第 3 页，Fig. 2。
