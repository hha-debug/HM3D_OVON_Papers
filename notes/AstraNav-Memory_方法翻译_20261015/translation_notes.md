# 翻译说明

- 来源为用户提供的 Pasted text.txt，仅含第 3 节 Method 及其 3.1–3.3 小节；该范围内已完整翻译，未翻译或补写其他章节。
- 未提供原论文页码、图 5 及参考文献条目，因此不能定位原论文页码或复原图像。中英对照使用小节编号与 S001–S020、E001–E005 锚点定位。
- source_map.json 的 page=1 指本次粘贴文本的虚拟页，不是论文页码；original_page=null，page_kind=pasted-text-virtual-page。这样兼容验证工具对正整数 page 字段的要求，同时明确原论文页码未知。
- 公式恢复了粘贴时丢失的上下标和分式排版，如式 (4) 的 2^{2N}、4^N，以及填充条件 2^{N+1}。由于没有原版 PDF，公式排版恢复标为 medium 置信度。
- 式 (3) 按原文保留。文字将 PixelUnshuffle 纳入压缩块，但式中仅显式写出 Conv、BN、SiLU，未自行补入 PixelUnshuffle。
- 原文对原始 Qwen2.5-VL 中 patch-merger 与 ViT 的先后次序，以及二维位置编码的加入位置，可能需要作者结合图 5 与实现进一步核对。译文忠实保留原文，未进行技术订正。
- 原文出现 GOAT1M-50L / GOAT1M-500L 与 GOAT-1M-100L / GOAT-1M-200L 两种连字符形式；英文对照保留原貌，中文统一为 GOAT-1M-50L、GOAT-1M-100L、GOAT-1M-200L、GOAT-1M-500L。
- 原文 crossattention、sequence-tosequence、singlegoal 等断词问题在英文对照中做了空格或连字符规范化，不改变语义。
- 未使用外部检索，未加入原文之外的研究结论或训练设置。
