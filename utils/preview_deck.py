"""Rough PNG preview of a .pptx (no PowerPoint/LibreOffice needed) + text-overflow check.

Usage (repo root):  python utils/preview_deck.py utils/presentation.pptx <out_dir>
Approximate: real line-heights/fonts differ slightly; transparent logos show on black; ovals/arrowheads simplified.
"""
import sys, io
from pptx import Presentation
from pptx.util import Emu
from PIL import Image, ImageDraw, ImageFont
F = "/System/Library/Fonts/Supplemental/"
def font(name, size, bold):
    base = {"Times New Roman": "Times New Roman", "Courier New": "Courier New", "Cambria Math": "Arial", "Georgia": "Georgia"}.get(name or "Arial", "Arial")
    try: return ImageFont.truetype(F + base + (" Bold" if bold else "") + ".ttf", size)
    except Exception: return ImageFont.truetype(F + "Arial.ttf", size)
p = Presentation(sys.argv[1]); out = sys.argv[2]
SC = 1280 / p.slide_width
px = lambda e: int(e * SC)
issues = []
def draw_text(d, tf, x, y, w, h, sid, name):
    cy = y + 3
    for para in tf.paragraphs:
        runs = para.runs
        if not runs: cy += 10; continue
        r = runs[0]; size = r.font.size.pt if r.font.size else 18
        f = font(r.font.name, int(size * 1280 / 960 * 1.0), r.font.bold)
        col = tuple(r.font.color.rgb) if r.font.color and r.font.color.type else (0,0,0)
        txt = "".join(x.text for x in runs)
        words = txt.split(" "); line = ""; lines = []
        for wd in words:
            t = (line + " " + wd).strip()
            if d.textlength(t, font=f) > w - 6 and line: lines.append(line); line = wd
            else: line = t
        lines.append(line)
        lh = int(size * 1280 / 960 * 1.2)
        for ln in lines:
            tw = d.textlength(ln, font=f)
            lx = x + 3 if para.alignment in (None, 1) else (x + (w - tw) / 2 if para.alignment == 2 else x + w - tw - 3)
            d.text((lx, cy), ln, font=f, fill=col); cy += lh
        cy += int(para.space_after.pt * 1.33) if para.space_after else 0
    if cy > y + h + 4: issues.append(f"slide {sid}: text overflows box '{tf.text[:40]}' by {cy-(y+h)}px")
for i, s in enumerate(p.slides, 1):
    bg = (255,255,255)
    try: bg = tuple(s.background.fill.fore_color.rgb)
    except Exception: pass
    im = Image.new("RGB", (1280, 720), bg); d = ImageDraw.Draw(im)
    for sh in s.shapes:
        x, y, w, h = px(sh.left), px(sh.top), px(sh.width), px(sh.height)
        if sh.shape_type == 13:
            img = Image.open(io.BytesIO(sh.image.blob)).convert("RGB")
            cb = sh.crop_bottom or 0
            if cb: img = img.crop((0, 0, img.width, int(img.height * (1 - cb))))
            im.paste(img.resize((max(1,w), max(1,h))), (x, y))
        elif sh.shape_type == 9 or sh.shape_type is None and hasattr(sh, "begin_x"):
            d.line([(px(sh.begin_x), px(sh.begin_y)), (px(sh.end_x), px(sh.end_y))], fill=(120,130,140), width=2)
            d.ellipse([px(sh.end_x)-4, px(sh.end_y)-4, px(sh.end_x)+4, px(sh.end_y)+4], fill=(120,130,140))
        elif sh.has_table:
            t = sh.table; cy = y
            for ri, row in enumerate(t.rows):
                cx = x; rh = px(row.height)
                for ci, col in enumerate(t.columns):
                    cw = px(col.width); cell = t.cell(ri, ci)
                    fc = tuple(cell.fill.fore_color.rgb) if cell.fill.type == 1 else (255,255,255)
                    d.rectangle([cx, cy, cx+cw, cy+rh], fill=fc, outline=(220,228,236))
                    draw_text(d, cell.text_frame, cx+6, cy+4, cw-12, rh-4, i, "cell")
                    cx += cw
                cy += rh
        else:
            try:
                if sh.fill.type == 1 and getattr(sh, "auto_shape_type", None) == 9: d.ellipse([x, y, x+w, y+h], fill=tuple(sh.fill.fore_color.rgb))
                elif sh.fill.type == 1: d.rounded_rectangle([x, y, x+w, y+h], radius=8, fill=tuple(sh.fill.fore_color.rgb), outline=(220,228,236))
            except Exception: pass
            if sh.has_text_frame and sh.text_frame.text.strip():
                draw_text(d, sh.text_frame, x, y, w, h, i, sh.name)
    for sh in s.shapes:
        if sh.left + sh.width > p.slide_width + 10 or sh.top + sh.height > p.slide_height + 10:
            issues.append(f"slide {i}: shape off-slide {sh.name}")
    im.save(f"{out}/s{i:02d}.png")
print("\n".join(issues) or "no overflow detected")
