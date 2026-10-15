"""Build the source map and Chinese-only copy from the bilingual method reader."""

import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = Path(r"C:\Users\horizona\.codex\attachments\a8205d53-9936-4c70-981f-9690eb197a05\Pasted text.txt")
paper = (ROOT / "paper.md").read_text(encoding="utf-8")
raw_source = SOURCE.read_text(encoding="utf-8-sig")
shutil.copyfile(SOURCE, ROOT / "source.txt")
(ROOT / "assets").mkdir(exist_ok=True)

anchors = list(re.finditer(r'<a id="([SE]\d{3})"></a>', paper))
blocks = []
for order, anchor in enumerate(anchors, 1):
    end = anchors[order].start() if order < len(anchors) else paper.index("## 阅读提示")
    body = paper[anchor.end():end]
    block_id = anchor.group(1)
    source_line = re.search(r"\*\*Source:\*\* ([^\n]+)", body).group(1)
    block = {
        "id": block_id,
        "page": 1,
        "original_page": None,
        "page_kind": "pasted-text-virtual-page",
        "section": re.search(r"§([\d.]+)", source_line).group(1),
        "order": order,
        "source_location": source_line,
    }
    if block_id.startswith("S"):
        pair = re.search(r"\*\*Original:\*\* (.*?)\n\n\*\*中文:\*\* (.*?)(?=\n\n<a|\Z)", body, re.S)
        if pair is None:
            raise ValueError(f"Missing bilingual pair: {block_id}")
        block.update({
            "type": "text",
            "original": pair.group(1).strip(),
            "translation": pair.group(2).strip(),
            "confidence": "high",
            "nearby_figure_references": ["Fig. 5"] if block_id == "S002" else [],
        })
    else:
        block.update({
            "type": "equation",
            "equation_number": re.search(r"Eq\. \((\d+)\)", source_line).group(1),
            "latex": re.search(r"\$\$\n(.*?)\n\$\$", body, re.S).group(1),
            "confidence": "medium",
            "bbox": None,
            "image_path": None,
        })
    blocks.append(block)

glossary = [
    {"term": "token", "translation": "token（标记）"},
    {"term": "frontier", "translation": "前沿"},
    {"term": "traversability", "translation": "可通行性"},
    {"term": "patch-merger", "translation": "图像块合并器"},
    {"term": "compression block", "translation": "压缩块"},
    {"term": "backbone", "translation": "骨干网络"},
    {"term": "lifelong navigation", "translation": "终身导航"},
    {"term": "VLN", "translation": "视觉语言导航"},
    {"term": "occupancy map", "translation": "占据地图"},
]
mapping = {
    "title": "AstraNav 论文方法部分",
    "source_format": "pasted-text",
    "source_file": str(SOURCE),
    "raw_source_copy": "source.txt",
    "raw_source_text": raw_source,
    "scope": "Section 3, including Sections 3.1–3.3",
    "original_pages_known": False,
    "virtual_page_note": "page=1 identifies this pasted-text excerpt only; original paper page is unknown.",
    "coverage": {"text_blocks": 20, "display_equations": 5, "provided_figures": 0},
    "blocks": blocks,
    "glossary": glossary,
}
(ROOT / "source_map.json").write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Keep the same headings, equation anchors and equations in the Chinese copy.
body_start = paper.index('<a id="method"></a>')
body_end = paper.index("## 阅读提示")
chinese = paper[body_start:body_end]
chinese = re.sub(r"\*\*Source:\*\* [^\n]+\n\n", "", chinese)
chinese = re.sub(r"\*\*Original:\*\* .*?\n\n\*\*中文:\*\* ", "", chinese, flags=re.S)
for source_heading, target_heading in [
    ("## 3. Method / 方法", "## 3. 方法"),
    ("## 3.1. Preliminary / 预备知识", "## 3.1 预备知识"),
    ("## 3.2. Model Architecture / 模型架构", "## 3.2 模型架构"),
    ("## 3.3. Dataset Construction / 数据集构建", "## 3.3 数据集构建"),
]:
    chinese = chinese.replace(source_heading, target_heading)
index_start = paper.index("## 公式索引")
index_end = paper.index("术语约定：")
chinese = "# AstraNav 论文：方法部分中文翻译\n\n" + paper[index_start:index_end] + chinese
(ROOT / "方法部分_中文翻译.md").write_text(chinese.strip() + "\n", encoding="utf-8")

assert len([b for b in blocks if b["type"] == "text"]) == 20
assert len([b for b in blocks if b["type"] == "equation"]) == 5
assert "**Original:**" not in chinese
assert all(b["translation"] in chinese for b in blocks if b["type"] == "text")
assert all(f'<a id="{b["id"]}"></a>' in paper for b in blocks)
assert all(marker in chinese for marker in ["598", "1280", "145", "136", "GOAT-1M-500L", "[23]", "[55]", "[64]"])
print("Built bilingual reader, Chinese translation, and source map: 20 text blocks, 5 display equations.")
