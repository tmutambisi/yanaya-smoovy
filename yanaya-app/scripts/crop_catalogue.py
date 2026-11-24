"""
Cut website assets out of the Smoovy catalogue pages (assets/catalogue/*.jpg).

INTERIM ONLY: the catalogue pages are WhatsApp-compressed (902x1280), so these
cut-outs are soft. Replace them with the designer's original files before launch
(same output names = no code changes needed).

Usage (from yanaya-app/):  python scripts/crop_catalogue.py
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "catalogue"
OUT = ROOT / "public" / "smoovy"


def open_rgb(name: str) -> Image.Image:
    return Image.open(SRC / name).convert("RGB")


def cutout(im: Image.Image, white: int = 238, feather: float = 0.8) -> Image.Image:
    """Remove near-white background connected to the image edges (flood fill)."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    seen = bytearray(w * h)
    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    q = deque([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
              + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, _ = px[x, y]
        if min(r, g, b) < white:
            continue
        mp[x, y] = 0
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    if feather:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))
    rgba.putalpha(mask)
    bbox = rgba.getbbox()
    return rgba.crop(bbox) if bbox else rgba


def bottle_cutout(im: Image.Image) -> Image.Image:
    """
    Bottle mockups sit on white with the poster's charcoal band behind them and
    fruit nearby, so a plain flood fill leaves junk. The bottle is symmetric:
    measure its half-width per row from the flood-fill mask, take the smaller
    side (drops one-sided junk), cap it at the body width (drops the band),
    stop at the bottom of the liquid (drops the shadow) and fill each row solid
    (closes the white label).
    """
    base = cutout(im, white=240, feather=0)  # cropped to bbox; we need the full frame
    rgba0 = im.convert("RGBA")
    # recompute the raw flood mask on the full frame
    full = cutout_mask(im, white=240)
    w, h = im.size
    m = full.load()
    rgb = im.load()

    lefts, rights = [None] * h, [None] * h
    for y in range(h):
        xs = [x for x in range(w) if m[x, y] > 0]
        if xs:
            lefts[y], rights[y] = xs[0], xs[-1]

    body_rows = range(int(h * 0.59), int(h * 0.80))  # coloured lower body, below the label
    centres = sorted((lefts[y] + rights[y]) / 2 for y in body_rows if lefts[y] is not None)
    cx = centres[len(centres) // 2]
    halves = sorted(min(cx - lefts[y], rights[y] - cx) for y in body_rows if lefts[y] is not None)
    body_half = halves[len(halves) // 2]

    # bottom of the bottle = last row whose centre pixel is saturated (liquid), not grey shadow
    bottom = h - 1
    for y in range(h - 1, 0, -1):
        r, g, b = rgb[int(cx), y]
        if max(r, g, b) - min(r, g, b) >= 22:
            bottom = min(h - 1, y + 3)
            break

    half = [0.0] * h
    for y in range(h):
        if lefts[y] is None or y > bottom:
            continue
        half[y] = min(cx - lefts[y], rights[y] - cx, body_half)
    # The walls are straight from the shoulders to the bottom curve: force full body width
    # there, so the white label (which the flood fill nibbles into) never gets notches.
    wall = [y for y in range(h) if half[y] >= body_half - 2]
    if wall:
        for y in range(wall[0], wall[-1] + 1):
            half[y] = body_half
    # median-smooth the outline
    sm = half[:]
    for y in range(h):
        win = sorted(half[max(0, y - 2): y + 3])
        sm[y] = win[len(win) // 2]

    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    for y in range(h):
        if sm[y] > 1:
            d.line([(cx - sm[y], y), (cx + sm[y], y)], fill=255)
    mask = mask.filter(ImageFilter.MinFilter(3))  # shave 1px: removes white specks at the label edge
    mask = mask.filter(ImageFilter.GaussianBlur(0.9))
    rgba0.putalpha(mask)
    bbox = rgba0.getbbox()
    del base
    return rgba0.crop(bbox) if bbox else rgba0


def cutout_mask(im: Image.Image, white: int) -> Image.Image:
    """Flood-fill background mask (255 = keep) on the full frame, no cropping."""
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    q = deque([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
              + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b = px[x, y][:3]
        if min(r, g, b) < white:
            continue
        mp[x, y] = 0
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return mask


def save(im: Image.Image, rel: str, quality: int = 90) -> None:
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)
    print(f"{rel:38s} {im.size}")


# 1) Bottles: the large bottle on each flavour page (same position on every page)
BOTTLE_BOX = (58, 182, 322, 748)
for slug in ["baobalicious", "whey-strawberry", "berry-nice", "choco-mint", "pineapple-express"]:
    save(bottle_cutout(open_rgb(f"{slug}.jpg").crop(BOTTLE_BOX)), f"bottles/{slug}.webp")

# 2) Smoovy wordmark (from the philosophy page, on white)
save(cutout(open_rgb("philosophy.jpg").crop((66, 262, 368, 372)), white=236), "smoovy-logo.webp")

# 3) Flavour mood tiles (2x2 grid at the top of flavour-tiles.jpg)
tiles = open_rgb("flavour-tiles.jpg")
for slug, box in {
    "baobalicious": (0, 0, 451, 451),
    "berry-nice": (451, 0, 902, 451),
    "choco-mint": (0, 451, 451, 902),
    "pineapple-express": (451, 451, 902, 902),
}.items():
    save(tiles.crop(box), f"tiles/{slug}.webp", quality=88)

# 4) Farmer holding baobab fruit (white out the poster text first, then cut out)
farm = open_rgb("farmers.jpg").crop((0, 0, 902, 976))
ImageDraw.Draw(farm).rectangle((415, 150, 840, 535), fill=(255, 255, 255))
save(cutout(farm, white=238), "farmer.webp")

# 5) Blender (process page)
save(cutout(open_rgb("process.jpg").crop((540, 118, 838, 642)), white=238), "blender.webp")

# 6) Decorative fruit (floating accents)
save(cutout(open_rgb("berry-nice.jpg").crop((730, 205, 902, 400)), white=238), "fruit/blackberry.webp")
save(cutout(open_rgb("baobalicious.jpg").crop((298, 0, 566, 150)), white=238), "fruit/baobab-pod.webp")
