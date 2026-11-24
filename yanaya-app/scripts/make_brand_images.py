"""
Generate app icons and social share (Open Graph) images from the cut-outs in public/smoovy/.
Re-run after replacing the cut-outs with the designer's originals.

Usage (from yanaya-app/):  python scripts/make_brand_images.py
Font: Bahnschrift (ships with Windows 10+), condensed bold to echo Barlow Condensed.
"""
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
SM = PUB / "smoovy"
CHAR = (42, 42, 44)
SAGE = (154, 180, 108)
WHITE = (255, 255, 255)


def font(size: int, style: str = "Bold Condensed") -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype("bahnschrift.ttf", size)
    try:
        f.set_variation_by_name(style)
    except Exception:
        pass
    return f


def hex2rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def flavours():
    """Read slugs, names, lines and colours straight from src/lib/smoovy.ts (single source of truth)."""
    src = (ROOT / "src" / "lib" / "smoovy.ts").read_text(encoding="utf-8")
    out = []
    for block in re.findall(r"\{\s*slug: \"([^\"]+)\",\s*name: \"([^\"]+)\".*?line: \"([^\"]+)\".*?bg: \"(#[0-9a-f]+)\", ink: \"(#[0-9a-f]+)\"", src, re.S):
        slug, name, line, bg, ink = block
        out.append({"slug": slug, "name": name, "line": line, "bg": hex2rgb(bg), "ink": hex2rgb(ink)})
    return out


def wrap(draw, text, fnt, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def paste_fit(canvas, im, box):
    x0, y0, x1, y1 = box
    im = im.copy()
    im.thumbnail((x1 - x0, y1 - y0), Image.LANCZOS)
    canvas.alpha_composite(im, (x0 + (x1 - x0 - im.width) // 2, y1 - im.height))


logo = Image.open(SM / "smoovy-logo.webp").convert("RGBA")

# ---------- App icons: Smoovy wordmark on charcoal ----------
icons = PUB / "icons"
icons.mkdir(exist_ok=True)


def icon(size, frac, rounded=False):
    im = Image.new("RGBA", (size, size), CHAR + (255,))
    d = ImageDraw.Draw(im)
    r = size * 0.42
    d.ellipse((size * 0.5 - r, size * 0.5 - r * 0.7, size * 0.5 + r, size * 0.5 + r * 1.3), fill=(58, 62, 48, 255))
    w = int(size * frac)
    lg = logo.resize((w, round(w * logo.height / logo.width)), Image.LANCZOS)
    im.alpha_composite(lg, ((size - w) // 2, (size - lg.height) // 2))
    return im


icon(192, 0.84).save(icons / "icon-192.png", optimize=True)
icon(512, 0.84).save(icons / "icon-512.png", optimize=True)
icon(512, 0.70).save(icons / "icon-maskable-512.png", optimize=True)
icon(180, 0.84).convert("RGB").save(icons / "apple-touch-icon.png", optimize=True)
print("icons done")

# ---------- Open Graph images (1200x630) ----------
og = PUB / "og"
og.mkdir(exist_ok=True)
FL = flavours()
assert len(FL) == 5, f"expected 5 flavours, parsed {len(FL)}"
bottles = {f["slug"]: Image.open(SM / "bottles" / f"{f['slug']}.webp").convert("RGBA") for f in FL}

# Home
im = Image.new("RGBA", (1200, 630), CHAR + (255,))
d = ImageDraw.Draw(im)
d.ellipse((560, 60, 1180, 680), fill=(58, 62, 48, 255))
lg = logo.resize((300, round(300 * logo.height / logo.width)), Image.LANCZOS)
im.alpha_composite(lg, (60, 56))
d.text((60, 190), "ENERGY IN", font=font(112), fill=WHITE)
d.text((60, 300), "A BOTTLE.", font=font(112), fill=WHITE)
d.text((62, 425), "HAPPINESS YOU CAN TASTE.", font=font(46), fill=SAGE)
d.text((62, 540), "sipsmoovy.com  ·  WhatsApp 0717 377 549", font=font(30, "SemiBold Condensed"), fill=(200, 200, 200))
order = ["berry-nice", "whey-strawberry", "baobalicious", "pineapple-express", "choco-mint"]
xs = [600, 700, 800, 900, 1000]
hs = [400, 450, 520, 450, 400]
for k in [0, 4, 1, 3, 2]:  # draw outer bottles first, centre last
    b = bottles[order[k]]
    h = hs[k]
    w = round(h * b.width / b.height)
    bb = b.resize((w, h), Image.LANCZOS)
    im.alpha_composite(bb, (xs[k] + 40 - w // 2 + 50, 600 - h))
im.convert("RGB").save(og / "home.jpg", quality=88, optimize=True)

# One per flavour
for f in FL:
    im = Image.new("RGBA", (1200, 630), f["bg"] + (255,))
    d = ImageDraw.Draw(im)
    d.ellipse((700, 40, 1220, 560), fill=tuple(min(255, c + 28) for c in f["bg"]) + (255,))
    ink = f["ink"]
    im.alpha_composite(lg, (60, 50))
    y = 180
    for ln in wrap(d, f["name"].upper(), font(104), 600):
        d.text((60, y), ln, font=font(104), fill=ink)
        y += 100
    for ln in wrap(d, f["line"], font(38, "SemiBold Condensed"), 600):
        d.text((62, y + 10), ln, font=font(38, "SemiBold Condensed"), fill=ink)
        y += 46
    d.text((62, 555), "Order on WhatsApp 0717 377 549", font=font(30, "SemiBold Condensed"), fill=ink)
    paste_fit(im, bottles[f["slug"]], (760, 40, 1140, 610))
    im.convert("RGB").save(og / f"{f['slug']}.jpg", quality=88, optimize=True)
print("og images done:", json.dumps([f["slug"] for f in FL]))
