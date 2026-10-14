from pathlib import Path
import html
import json
import math
import re
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw, ImageFont
from graph_data import MODULES, PAPERS, DEPENDENCIES, INDIRECT_USAGE, MODULE_DEPENDENCIES

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
W = 3600
M = 76
GAP = 28
COLS = 4
CW = (W - 2 * M - (COLS - 1) * GAP) / COLS
FONT = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"
COLORS = {
    "ink": "#152a45", "muted": "#50647c", "line": "#d5dfeb", "bg": "#f5f8fc",
    "encoder": ("#eaf2ff", "#2b64aa"),
    "representation": ("#e7f5f4", "#18736d"),
    "perception": ("#edf8ef", "#287548"),
    "adapter": ("#fff5df", "#926518"),
    "decision": ("#f1edfc", "#685399"),
}
STATES = {
    "frozen": ("#e8f1fe", "#255d9a", "明确冻结编码器 / 基础权重"),
    "call": ("#e8f6ef", "#26744d", "直接调用已有模型"),
    "unknown": ("#fff2d8", "#946611", "部分更新范围未明确"),
    "mixed": ("#f0edf9", "#665291", "调用与训练并存"),
    "staged": ("#e6f4f5", "#207179", "分阶段训练 / 冻结"),
}
KINDS = {"method": "导航方法", "benchmark": "基准 / 作者基线", "foundation": "基础依赖"}
CAT = {"encoder": "输入编码器", "representation": "三维表征 / query 模块", "perception": "检测、分割与图文工具", "adapter": "连接与适配模块"}
fonts = {}

def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        fonts[key] = ImageFont.truetype(BOLD if bold else FONT, size)
    return fonts[key]

def wrap(s, width, size=24, bold=False):
    result = []
    for paragraph in s.split("\n"):
        tokens = re.findall(r"[A-Za-z0-9][A-Za-z0-9_.+/@\-]*|\s+|.", paragraph)
        line = ""
        for token in tokens:
            if line and font(size, bold).getlength(line + token) > width:
                result.append(line.rstrip())
                line = ""
            if font(size, bold).getlength(token) > width:
                for char in token:
                    if line and font(size, bold).getlength(line + char) > width:
                        result.append(line.rstrip())
                        line = ""
                    line += char
            else:
                line += token if line else token.lstrip()
        result.append(line.rstrip())
    return result

commands = []
svg = []
bounds = []

def add_group(node_id, kind, modules, search):
    attrs = dict(**{"data-node": node_id, "data-kind": kind, "data-modules": ",".join(modules), "data-search": search, "tabindex": "0", "role": "button"})
    svg.append("<g " + " ".join(f'{k}="{html.escape(str(v), quote=True)}"' for k, v in attrs.items()) + ">")

def end_group():
    svg.append("</g>")

def rect(x, y, w, h, fill, stroke=COLORS["line"], radius=14, sw=1.5):
    commands.append(("rect", x, y, w, h, fill, stroke, radius, sw))
    svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

def text(s, x, y, size=24, color=None, bold=False, width=None, leading=None):
    color = color or COLORS["ink"]
    lines = wrap(s, width, size, bold) if width else s.split("\n")
    leading = leading or size * 1.42
    for i, line in enumerate(lines):
        yy = y + i * leading
        commands.append(("text", line, x, yy, size, color, bold))
        # SVG and Pillow both use the font ascender baseline.
        ascender = font(size, bold).getmetrics()[0]
        svg.append(f'<text x="{x:.2f}" y="{yy + ascender:.2f}" fill="{color}" font-size="{size}" font-weight="{700 if bold else 400}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">{html.escape(line)}</text>')
    return len(lines) * leading

def line(points, color="#7d8ba0", sw=2.5, dashed=False, arrow=True):
    commands.append(("line", points, color, sw, dashed, arrow))
    pts = " ".join(f"{x:.2f},{y:.2f}" for x, y in points)
    dash = ' stroke-dasharray="8 6"' if dashed else ""
    marker = ' marker-end="url(#arrow)"' if arrow else ""
    svg.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linejoin="round"{dash}{marker}/>')

def section(title, subtitle, y):
    text(title, M, y, 36, bold=True)
    h = text(subtitle, M, y + 54, 23, COLORS["muted"], width=W - 2 * M)
    return y + 54 + h + 25

papers = {p["id"]: p for p in PAPERS}
mods = {m["id"]: m for m in MODULES}
assert len(papers) == 20 and len(mods) == 42
assert sum(p["kind"] == "method" for p in PAPERS) == 14
assert sum(p["kind"] == "benchmark" for p in PAPERS) == 4
for p in PAPERS:
    assert all(m in mods for m in p["modules"]), p["name"]
    if not p["source"].startswith("https://"):
        assert (ROOT / p["source"]).exists(), p["source"]
for dep in DEPENDENCIES:
    assert dep["source"] in papers and dep["target"] in papers
for m in MODULES:
    m["users"] = []
    for p in PAPERS:
        if m["id"] in p["modules"]:
            scope = p["module_scopes"].get(m["id"], "")
            m["users"].append(p["name"] + ("（" + scope + "）" if scope else ""))
    for use in INDIRECT_USAGE:
        if use["module"] == m["id"]:
            m["users"].append(papers[use["paper"]]["name"] + "（" + use["label"] + "）")
    assert m["users"], m["name"]

text("具身导航论文 × 编码器关系图", M, 48, 60, bold=True)
text("18 篇本地论文 · 2 篇基础依赖 · 22 个编码 / 三维表征模块 · 16 个感知工具 · 4 类连接与适配模块", M, 131, 27, COLORS["muted"])
text("每篇流程说明：输入如何编码 → 特征怎样组织 → 谁负责决策；功能索引说明每个模块的输入、输出和用途。", M, 178, 25, COLORS["muted"])

y = section("01  已确认的论文继承关系", "箭头只表示标签中的具体关系；共用模型家族、借鉴架构与复用权重分别记录。", 256)
LCW = (W - 2 * M - 2 * GAP) / 3
LH = 255

def dep_node(pid, x, yy, width=224):
    p = papers[pid]
    add_group(pid, "paper", p["modules"], p["name"])
    rect(x, yy, width, 65, "#edf3fd", "#94b2dc", 12)
    text(p["name"], x + 16, yy + 15, 25, bold=True, width=width - 26)
    end_group()
    return (x, yy, width, 65)

def edge(a, b, label, color="#42688f", dashed=False, offset=0, label_y=None):
    sx, sy, sw, sh = a
    tx, ty, tw, th = b
    start = (sx + sw, sy + sh / 2 + offset)
    end = (tx - 3, ty + th / 2 + offset)
    mid = (start[0] + end[0]) / 2
    points = [start, (mid, start[1]), (mid, end[1]), end]
    line(points, color, 2.6, dashed)
    text(label, mid - 95, min(sy, ty) - 30 if label_y is None else label_y, 19, color, width=190)

for idx in range(6):
    cx = M + (idx % 3) * (LCW + GAP)
    cy = y + (idx // 3) * (LH + GAP)
    rect(cx, cy, LCW, LH, "#ffffff")
    if idx == 0:
        a = dep_node("pq", cx + 24, cy + 49, 174)
        b = dep_node("mtu", cx + 380, cy + 49, 188)
        c = dep_node("soft", cx + 770, cy + 49, 224)
        edge(a, b, "query 结构借鉴", dashed=True)
        edge(b, c, "三维后端 / 权重", "#18736d")
        aa = dep_node("astra", cx + 24, cy + 159, 288)
        line([(cx + 312, cy + 191), (cx + 920, cy + 191), (cx + 920, cy + 118)], "#866293", 2.7, True)
        text("视觉压缩设计", cx + 450, cy + 161, 19, "#866293")
        text("MTU3D 成功轨迹另提供 SoftNav 的坐标监督。", cx + 354, cy + 213, 19, COLORS["muted"], width=LCW - 380)
    elif idx == 1:
        a = dep_node("dynam", cx + 35, cy + 89, 290)
        b = dep_node("d3d", cx + 724, cy + 89, 280)
        edge(a, b, "三维 encoder 复用", "#18736d")
        text("D3D-VLP 的 encoder 冻结范围未明确；决策主干改为 NVILA。", cx + 30, cy + 183, 21, COLORS["muted"], width=LCW - 60)
    elif idx == 2:
        a = dep_node("ovon", cx + 30, cy + 89, 305)
        b = dep_node("ovseg", cx + 733, cy + 89, 275)
        edge(a, b, "SigLIP / 策略架构", dashed=True)
        text("OVSegDT 增加目标 mask 编码与分割监督。", cx + 30, cy + 183, 21, COLORS["muted"], width=LCW - 60)
    elif idx == 3:
        a = dep_node("vlfm", cx + 35, cy + 95, 220)
        b = dep_node("tango", cx + 731, cy + 34, 280)
        c = dep_node("open", cx + 731, cy + 155, 280)
        edge(a, b, "探索 / 特征地图机制", "#866293", True)
        edge(a, c, "PointNav 权重复用", "#18736d", label_y=cy + 207)
    elif idx == 4:
        a = dep_node("goat", cx + 30, cy + 89, 310)
        b = dep_node("sg", cx + 718, cy + 89, 310)
        edge(a, b, "RL 导航策略初始化", "#18736d")
        text("此边仅对应 SG3D 的端到端导航基线，不对应 SG-LLM。", cx + 30, cy + 183, 21, COLORS["muted"], width=LCW - 60)
    else:
        text("关系与颜色图例", cx + 30, cy + 20, 25, bold=True)
        line([(cx + 30, cy + 88), (cx + 180, cy + 88)], "#18736d", 3)
        text("已明确的 encoder / 权重复用", cx + 200, cy + 70, 22)
        line([(cx + 30, cy + 133), (cx + 180, cy + 133)], "#42688f", 3, True)
        text("架构来源 / 机制借鉴", cx + 200, cy + 115, 22)
        text("蓝：输入编码   绿：感知工具   青：三维表征", cx + 30, cy + 173, 21, COLORS["muted"])
        text("紫：决策模型   金：连接 / 适配及未明确状态", cx + 30, cy + 207, 21, COLORS["muted"])

y += 2 * LH + GAP + 60
y = section("02  逐篇论文的编码与决策流程", "每张卡片列出所有实际使用或基线中的模块。E / P / A 编号对应下方功能索引；数据生成、对照基线与主方法在文字中注明。", y)

def card_metrics(p):
    content_w = CW - 70
    fields = [("① 输入编码 / 感知", p["encoding"]), ("② 表征 / 记忆 / 连接", p["representation"]), ("③ 决策 / 输出", p["decision"])]
    hs = [len(wrap(v, content_w - 28, 23)) * 32.7 + 61 for _, v in fields]
    train_h = len(wrap(p["training"], content_w, 22)) * 31.3
    loc_h = len(wrap(p["locator"], content_w, 18)) * 25.6
    return fields, hs, train_h, loc_h, 94 + sum(hs) + 40 + 43 + train_h + 18 + loc_h + 55

paper_bounds = {}
for row in range(math.ceil(len(PAPERS) / COLS)):
    items = PAPERS[row * COLS:(row + 1) * COLS]
    height = max(card_metrics(p)[-1] for p in items)
    for col, p in enumerate(items):
        x = M + col * (CW + GAP)
        fields, hs, train_h, loc_h, _ = card_metrics(p)
        add_group(p["id"], "paper", p["modules"], " ".join([p["name"], p["encoding"], p["representation"], p["decision"], p["training"]]))
        rect(x, y, CW, height, "#ffffff", "#cbd9e8", 18)
        name_size = 32 if len(p["name"]) < 18 else 29
        text(p["name"], x + 26, y + 19, name_size, bold=True)
        text(KINDS[p["kind"]] + " · " + p["family"], x + 26, y + 64, 20, COLORS["muted"], width=CW - 52)
        yy = y + 100
        for j, ((label, content), hh) in enumerate(zip(fields, hs)):
            fill, color = COLORS[["encoder", "representation", "decision"][j]]
            rect(x + 24, yy, CW - 48, hh, fill, fill, 10)
            text(label, x + 39, yy + 12, 22, color, bold=True)
            text(content, x + 39, yy + 47, 23, width=CW - 78, leading=32.7)
            yy += hh
            if j < 2:
                line([(x + CW / 2, yy + 2), (x + CW / 2, yy + 17)], color, 2)
                yy += 20
        fill, color, label = STATES[p["state"]]
        yy += 16
        rect(x + 24, yy, CW - 48, 35, fill, fill, 6)
        text(label, x + 37, yy + 3, 20, color, bold=True)
        yy += 46
        yy += text(p["training"], x + 32, yy, 22, COLORS["muted"], width=CW - 64, leading=31.3)
        yy += 15
        text(p["locator"], x + 32, yy, 18, "#6e7e91", width=CW - 64, leading=25.6)
        assert yy + loc_h + 12 <= y + height, (p["name"], yy + loc_h, y + height)
        paper_bounds[p["id"]] = dict(x=x, y=y, w=CW, h=height)
        end_group()
    y += height + GAP

y += 30
y = section("03  每个编码器与模块的功能索引", "功能按实际输入与输出阐述。训练状态属于“论文 × 模块”的组合，不给共享编码器设一个统一冻结状态。", y)
module_bounds = {}
for cat in ["encoder", "representation", "perception", "adapter"]:
    group = [m for m in MODULES if m["kind"] == cat]
    fill, color = COLORS[cat]
    text(CAT[cat], M, y, 30, color, bold=True)
    y += 53
    for row in range(math.ceil(len(group) / COLS)):
        items = group[row * COLS:(row + 1) * COLS]
        def module_height(m):
            return 34 + len(wrap(m["name"], CW - 126, 27, True)) * 38.3 + 17 + sum(len(wrap(s, CW - 54, 21)) * 30 for s in [m["io"], m["function"], m["note"], "使用：" + "、".join(m["users"])]) + 42
        height = max(module_height(m) for m in items)
        for col, m in enumerate(items):
            x = M + col * (CW + GAP)
            add_group(m["id"], "module", [m["id"]], " ".join([m["name"], m["io"], m["function"], m["note"], *m["users"]]))
            rect(x, y, CW, height, "#ffffff", "#cbd9e8", 16)
            rect(x + 20, y + 22, 76, 34, fill, fill, 7)
            text(m["id"], x + 31, y + 23, 21, color, bold=True)
            hh = text(m["name"], x + 113, y + 22, 27, color, bold=True, width=CW - 134, leading=38.3)
            yy = y + 22 + max(38.3, hh) + 19
            for idx, s in enumerate([m["io"], m["function"], m["note"], "使用：" + "、".join(m["users"])]):
                yy += text(s, x + 26, yy, 21, COLORS["ink"] if idx < 2 else COLORS["muted"], width=CW - 52, leading=30)
                yy += 7
            assert yy <= y + height + 1, (m["name"], yy, y + height)
            module_bounds[m["id"]] = dict(x=x, y=y, w=CW, h=height)
            end_group()
        y += height + GAP
    y += 24

y += 12
rect(M, y, W - 2 * M, 202, "#e9eef6", "#d5dfeb", 14)
text("来源与准确性边界", M + 24, y + 18, 28, bold=True)
text("依据本地《论文编码器关系总表.md》及其中原文定位，2026-10-14。涵盖 18 篇独立论文与 PQ3D / Dynam3D 两篇基础依赖。", M + 24, y + 62, 23, width=W - 2 * M - 48)
text("未明确：D3D-VLP / OmniNav / CompassNav 的部分 encoder 更新范围；SG-LLM 对象 backbone；MTU3D 的底层分阶段更新；AstraNav 的型号与 ViT 配置。", M + 24, y + 107, 23, width=W - 2 * M - 48)
text("闭源 VLM 的内部视觉编码器不补猜；共享 CLIP / Qwen 家族不代表论文之间继承导航权重。交互版可点击节点查看完整功能、相关论文与出处。", M + 24, y + 152, 23, width=W - 2 * M - 48)
H = math.ceil(y + 202 + M)

defs = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>'
svg_full = f'<svg xmlns="http://www.w3.org/2000/svg" id="relationSvg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" aria-label="论文与编码器功能关系图">' + defs + f'<rect width="{W}" height="{H}" fill="{COLORS["bg"]}"/>' + "".join(svg) + "</svg>"
ET.fromstring(svg_full)
(HERE / "论文编码器详细关系图.svg").write_text(svg_full, encoding="utf-8")

image = Image.new("RGB", (W, H), COLORS["bg"])
draw = ImageDraw.Draw(image)
for cmd in commands:
    if cmd[0] == "rect":
        _, x, yy, w, h, fill, stroke, radius, sw = cmd
        draw.rounded_rectangle((x, yy, x + w, yy + h), radius, fill, stroke, round(sw))
    elif cmd[0] == "text":
        _, s, x, yy, size, color, bold = cmd
        draw.text((x, yy), s, font=font(size, bold), fill=color, anchor="la")
    else:
        _, pts, color, sw, dashed, arrow = cmd
        if not dashed:
            draw.line(pts, fill=color, width=round(sw), joint="curve")
        else:
            for a, b in zip(pts, pts[1:]):
                dx, dy = b[0] - a[0], b[1] - a[1]
                distance = math.hypot(dx, dy)
                if not distance:
                    continue
                for i in range(0, math.ceil(distance), 14):
                    end = min(i + 8, distance)
                    draw.line([(a[0] + dx * i / distance, a[1] + dy * i / distance), (a[0] + dx * end / distance, a[1] + dy * end / distance)], fill=color, width=round(sw))
        if arrow:
            a, b = pts[-2:]
            angle = math.atan2(b[1] - a[1], b[0] - a[0])
            arrowpts = [b, (b[0] - 16 * math.cos(angle) + 6 * math.sin(angle), b[1] - 16 * math.sin(angle) - 6 * math.cos(angle)), (b[0] - 16 * math.cos(angle) - 6 * math.sin(angle), b[1] - 16 * math.sin(angle) + 6 * math.cos(angle))]
            draw.polygon(arrowpts, fill=color)
image.save(HERE / "论文编码器详细关系图.png", optimize=True)

# Visual QA viewports are rendered directly from the same commands above.
for label, area in {"overview": (0, 0, W, 1030), "paper_row1": (0, paper_bounds["mtu"]["y"] - 15, W, paper_bounds["mtu"]["y"] + paper_bounds["mtu"]["h"] + 15), "functions": (0, module_bounds["E01"]["y"] - 15, W, module_bounds["E01"]["y"] + module_bounds["E01"]["h"] + 15)}.items():
    image.crop(tuple(round(v) for v in area)).save(HERE / f"qa_{label}.png")

data = dict(width=W, height=H, papers=PAPERS, modules=MODULES, dependencies=DEPENDENCIES, indirect_usage=INDIRECT_USAGE, module_dependencies=MODULE_DEPENDENCIES, paper_bounds=paper_bounds, module_bounds=module_bounds)
(HERE / "关系图数据.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

md = ["# 编码器与感知模块功能说明", "", "对应：[详细关系图](论文编码器详细关系图.svg) · [交互关系图](论文编码器交互关系图.html) · [原始总表](../论文编码器关系总表.md)", "", "本图按论文逐一记录训练状态；以下定义模块功能。检测、分割、投影、适配与决策模型不合并为同一种编码器。", ""]
for cat in ["encoder", "representation", "perception", "adapter"]:
    md += ["## " + CAT[cat], "", "| 编号 / 模块 | 输入 → 输出 | 对应功能 | 使用者与边界 |", "|---|---|---|---|"]
    for m in MODULES:
        if m["kind"] == cat:
            md.append(f'| {m["id"]} {m["name"]} | {m["io"]} | {m["function"]} | {"、".join(m["users"])}。{m["note"]} |')
    md.append("")
md += ["## 逐篇论文的训练与来源", ""]
for p in PAPERS:
    src = p["source"] if p["source"].startswith("https://") else "../" + p["source"]
    md += ["### " + p["name"], "", "**编码 / 感知：**" + p["encoding"], "", "**表征 / 连接：**" + p["representation"], "", "**决策：**" + p["decision"], "", "**训练：**" + p["training"], "", f'**来源：**[原文]({src})；{p["locator"]}。', ""]
(HERE / "编码器功能说明.md").write_text("\n".join(md), encoding="utf-8")

template = (HERE / "viewer_template.html").read_text(encoding="utf-8")
page = template.replace("__SVG__", svg_full).replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("<", "\\u003c"))
(HERE / "论文编码器交互关系图.html").write_text(page, encoding="utf-8")
print(json.dumps(dict(width=W, height=H, papers=len(PAPERS), modules=len(MODULES), dependencies=len(DEPENDENCIES), outputs=["论文编码器详细关系图.svg", "论文编码器详细关系图.png", "论文编码器交互关系图.html", "编码器功能说明.md", "关系图数据.json"]), ensure_ascii=False))
