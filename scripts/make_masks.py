"""Generate car-body paint masks for the configurator studio shots.  (v2)

v2 changes (per QA):
  * wheels are NEVER painted: hard tire-ellipse cut re-applied AFTER feathering
    (no arch-cap restore — the fender arch stays covered by the colour threshold)
  * mirrors excluded via fitted polygons (front + rear views)
  * floor / undercarriage shadow hard-cut below the tyre contact line
  * background bleed removed: border-connected orange background core subtracted
  * orange-lit body edge "add" zones clipped to the car silhouette (no bg spill)
  * rear lower bumper / plate band still fully excluded

The body itself (incl. grey patches / unpainted spots on sheet metal) is kept
fully painted via the low-saturation colour threshold + AI base.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SAT_MAX = 0.30
VAL_MIN = 0.09  # dark shadowed sheet metal (rockers/arches) still counts as body
VAL_MAX = 1.01  # include pure-white speculars on body (old mask painted them too)

DESIGN = (1280, 720)

ZONES = {
    "config-front.jpg": [
        ("wheel_polar", (657.9, 465.3, 101.7, 98.4, 19.9, [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.001, 1.007, 1.024, 1.051, 1.073, 1.085, 1.09, 1.094, 1.099, 1.105, 1.11, 1.113, 1.116, 1.117, 1.118, 1.119, 1.119, 1.12, 1.121, 1.117, 1.101, 1.072, 1.038, 1.015, 1.004, 0.998, 0.989, 0.97, 0.95, 0.943, 0.958, 0.994, 1.043, 1.09, 1.117, 1.122, 1.115, 1.108, 1.105, 1.105, 1.104, 1.1, 1.095, 1.091, 1.087, 1.083, 1.078, 1.072, 1.065, 1.058, 1.051, 1.043, 1.035, 1.027, 1.017, 1.008, 1.002, 1.0, 1.0, 1.0, 0.999, 0.996, 0.992, 0.987, 0.984, 0.982, 0.981, 0.981, 0.983, 0.988, 0.994, 0.998, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0])),  # front/front-wheel: polar tyre boundary, ratios every 2deg from -180
        ("wheel_dark", (657.9, 465.3, 101.7, 98.4, 19.9)),  # front/front-wheel: v9-parity dark/sat cut
        ("wheel_polar", (233.2, 450.3, 68.8, 96.2, 5.8, [1.103, 1.086, 1.074, 1.07, 1.068, 1.066, 1.062, 1.054, 1.045, 1.035, 1.024, 1.014, 1.004, 0.994, 0.982, 0.97, 0.964, 0.964, 0.967, 0.969, 0.969, 0.966, 0.958, 0.945, 0.929, 0.923, 0.928, 0.936, 0.943, 0.951, 0.959, 0.966, 0.97, 0.974, 0.98, 0.987, 0.992, 0.997, 1.002, 1.007, 1.01, 1.013, 1.017, 1.019, 1.021, 1.023, 1.027, 1.029, 1.03, 1.03, 1.03, 1.03, 1.029, 1.027, 1.023, 1.02, 1.017, 1.014, 1.011, 1.007, 1.003, 1.001, 1.0, 0.999, 0.997, 0.993, 0.991, 0.989, 0.987, 0.983, 0.981, 0.98, 0.98, 0.98, 0.98, 0.981, 0.983, 0.987, 0.989, 0.99, 0.991, 0.993, 0.997, 0.999, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.001, 1.004, 1.014, 1.028])),  # front/rear-wheel: polar tyre boundary, ratios every 2deg from -180
        ("wheel_dark", (233.2, 450.3, 68.8, 96.2, 5.8)),  # front/rear-wheel: v9-parity dark/sat cut
        ("sub", [(540, 196), (705, 186), (862, 272), (845, 282), (596, 286)]),   # windshield
        ("sub", [(238, 216), (525, 192), (536, 274), (296, 290)]),               # side windows
        ("sub", [(742, 335), (878, 360), (880, 392), (745, 386)]),               # headlight
        ("sub", [(1080, 348), (1110, 352), (1108, 392), (1078, 388)]),           # far headlight edge
        ("add_edge", [(172, 296), (214, 300), (208, 368), (170, 362)]),          # quarter orange-lit edge
        ("add_bright", [(560, 282), (900, 282), (900, 318), (560, 318)]),        # hood cowl
        ("add_ai", [(240, 150), (700, 140), (940, 190), (900, 220), (640, 180), (300, 210)]),  # roof band
        # door mirror: head blob + dark arm only. The right edge follows the
        # A-pillar's left edge (the pillar is body and must stay painted);
        # the bottom stops above the bright door band.
        ("exclude_poly", [(446, 252), (500, 244), (526, 250), (530, 262),
                          (536, 272), (544, 282), (549, 290), (500, 291),
                          (492, 296), (486, 302), (448, 302), (444, 290)]),
        ("floor_color", 505),
    ],
    "config-rear.jpg": [
        ("wheel_polar", (584.8, 445.0, 84.1, 109.5, 1.6, [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.002, 1.006, 1.013, 1.021, 1.036, 1.063, 1.097, 1.121, 1.128, 1.13, 1.13, 1.13, 1.129, 1.126, 1.12, 1.114, 1.106, 1.098, 1.087, 1.075, 1.058, 1.036, 1.014, 1.0, 0.995, 0.998, 1.009, 1.022, 1.036, 1.046, 1.054, 1.059, 1.063, 1.064, 1.065, 1.064, 1.063, 1.061, 1.057, 1.052, 1.047, 1.043, 1.038, 1.033, 1.028, 1.023, 1.018, 1.013, 1.008, 1.004, 1.001, 1.002, 1.005, 1.01, 1.014, 1.014, 1.01, 1.005, 1.001, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0])),  # rear/rear-wheel: polar tyre boundary, ratios every 2deg from -180
        ("wheel_dark", (584.8, 445.0, 84.1, 109.5, 1.6)),  # rear/rear-wheel: v9-parity dark/sat cut
        ("wheel_polar", (204.1, 458.6, 71.6, 96.6, -2.7, [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.001, 1.009, 1.03, 1.06, 1.079, 1.08, 1.073, 1.07, 1.077, 1.095, 1.114, 1.125, 1.128, 1.124, 1.118, 1.113, 1.11, 1.106, 1.101, 1.095, 1.089, 1.082, 1.075, 1.068, 1.062, 1.055, 1.048, 1.043, 1.039, 1.036, 1.033, 1.03, 1.023, 1.02, 1.035, 1.06, 1.076, 1.077, 1.068, 1.05, 1.026, 1.001, 0.977, 0.955, 0.935, 0.92, 0.914, 0.917, 0.929, 0.949, 0.97, 0.989, 1.002, 1.012, 1.024, 1.04, 1.055, 1.07, 1.082, 1.077, 1.053, 1.024, 1.007, 1.001, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.002, 1.013, 1.043, 1.085, 1.11, 1.102, 1.074, 1.043, 1.019, 1.005, 1.001, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0])),  # rear/front-wheel: polar tyre boundary, ratios every 2deg from -180
        ("wheel_dark", (204.1, 458.6, 71.6, 96.6, -2.7)),  # rear/front-wheel: v9-parity dark/sat cut
        ("sub", [(258, 178), (616, 168), (620, 286), (298, 302)]),               # side windows
        ("sub", [(560, 172), (1148, 200), (1102, 238), (612, 216)]),             # rear windshield
        ("sub", [(963, 403), (1102, 406), (1098, 452), (966, 450)]),             # license plate
        ("add_edge", [(1000, 292), (1128, 298), (1122, 368), (996, 362)]),       # tailgate specular
        ("add_edge", [(154, 380), (196, 380), (188, 478), (156, 478)]),          # left bumper orange-lit edge
        ("add_ai", [(280, 150), (640, 138), (840, 150), (830, 176), (620, 168), (320, 196)]),  # roof band
        ("band", [(700, 450), (1255, 450), (1255, 565), (700, 565)]),            # rear lower bumper / plate zone (starts right of the quarter panel)
        # door mirror (seen from behind): head blob (bright, left) + dark
        # housing; the bright door surface around/below it is body (painted)
        ("exclude_poly", [(248, 282), (250, 260), (326, 255), (334, 296),
                          (330, 306), (295, 308), (252, 304)]),
        ("floor", 519),
    ],
}

def rgb2hsv(a):
    mx = a.max(-1)
    mn = a.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = d > 0
    mr = m & (mx == r)
    mg = m & (mx == g) & ~mr
    mb = m & ~mr & ~mg
    h[mr] = np.mod((g - b)[mr] / d[mr], 6)
    h[mg] = (b - r)[mg] / d[mg] + 2
    h[mb] = (r - g)[mb] / d[mb] + 4
    h /= 6
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    return np.stack([h, s, mx], -1)


def hsv2rgb(a):
    h, s, v = a[..., 0], a[..., 1], a[..., 2]
    i = np.floor(h * 6) % 6
    f = h * 6 - np.floor(h * 6)
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    out = np.zeros_like(a)
    for k, (rr, gg, bb) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = (i == k)[..., None]
        out = np.where(m, np.stack([rr, gg, bb], -1), out)
    return out


def poly(W, H, sx, sy, geom):
    z = Image.new("L", (W, H), 0)
    ImageDraw.Draw(z).polygon([(x * sx, y * sy) for x, y in geom], fill=255)
    return np.array(z) > 0


def ellip(W, H, sx, sy, cx, cy, rx, ry):
    yy, xx = np.mgrid[0:H, 0:W]
    return ((xx - cx * sx) / (rx * sx)) ** 2 + ((yy - cy * sy) / (ry * sy)) ** 2 <= 1


def ellip_rot(W, H, sx, sy, cx, cy, rx, ry, rot_deg):
    yy, xx = np.mgrid[0:H, 0:W]
    x = (xx - cx * sx) / (rx * sx)
    y = (yy - cy * sy) / (ry * sy)
    th = np.radians(rot_deg)
    ca, sa = np.cos(th), np.sin(th)
    return (ca * x + sa * y) ** 2 + (-sa * x + ca * y) ** 2 <= 1


def background_core(rgb, W, H):
    """Border-connected orange studio background, eroded 3px so the lit body
    rim at the silhouette survives."""
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    orange = (r > 0.30) & (r > 1.25 * g) & (g > 1.05 * b) & (sat > 0.40) & (mx > 0.20)
    lab, n = ndimage.label(orange)
    border = set(np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    return ndimage.binary_erosion(bg, iterations=3)


def paint_preview(img, mask, hexcolor):
    rgb = np.array(img.convert("RGB")).astype(np.float32) / 255
    col = np.array([int(hexcolor[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
    hsv_col = rgb2hsv(col[None, None, :])
    base = rgb2hsv(rgb)
    paint = np.empty_like(rgb)
    paint[..., 0] = hsv_col[..., 0]
    paint[..., 1] = hsv_col[..., 1]
    paint[..., 2] = base[..., 2]
    blended = hsv2rgb(paint)
    m = (mask / 255)[..., None]
    out = rgb * (1 - m) + blended * m
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))


def make_mask(path, ai_path, mask_out, preview_out):
    name = path.rsplit("/", 1)[-1]
    img = Image.open(path)
    W, H = img.size
    sx, sy = W / DESIGN[0], H / DESIGN[1]
    rgb = np.array(img.convert("RGB")).astype(np.float32) / 255
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-6)

    # ---- threshold supplement: low-sat sheet metal (body + fenders) ----
    th = (sat < SAT_MAX) & (mx > VAL_MIN) & (mx < VAL_MAX)
    m = Image.fromarray((th * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    th = np.array(m) > 127

    labels, n = ndimage.label(th)
    if n:
        sizes = ndimage.sum(th, labels, range(1, n + 1))
        main = int(np.argmax(sizes)) + 1
        ys, xs = np.where(labels == main)
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        pad = 0.06 * H
        keep_th = np.zeros_like(th)
        for idx in range(1, n + 1):
            if sizes[idx - 1] < max(2000, 0.01 * sizes.max()):
                continue
            cys, cxs = np.where(labels == idx)
            cy, cx = cys.mean(), cxs.mean()
            if y0 - pad <= cy <= y1 + pad and x0 - pad <= cx <= x1 + pad:
                keep_th |= labels == idx
    else:
        keep_th = th

    inv = ~keep_th
    hlabels, hn = ndimage.label(inv)
    for idx in range(1, hn + 1):
        hole = hlabels == idx
        if hole.sum() < 0.05 * H * W and not (
            hole[0, :].any() or hole[-1, :].any() or hole[:, 0].any() or hole[:, -1].any()
        ):
            keep_th |= hole

    for kind, geom in ZONES.get(name, []):
        if kind != "sub":
            continue
        keep_th &= ~poly(W, H, sx, sy, geom)

    # ---- AI base ----
    ai = np.array(Image.open(ai_path).convert("L")) > 127
    ai = ndimage.binary_closing(ai, structure=np.ones((5, 5)))

    keep = keep_th | ai
    car_silhouette = ndimage.binary_dilation(keep, iterations=6)

    # ---- add zones ----
    for kind, geom in ZONES.get(name, []):
        if kind in ("add", "add_edge"):
            z = poly(W, H, sx, sy, geom)
            # clip to the car silhouette so orange-lit edge paint can't spill into the background
            keep |= z & car_silhouette
        elif kind == "add_bright":
            z = poly(W, H, sx, sy, geom)
            keep |= z & (sat < 0.35) & (mx > 0.25)
        elif kind == "add_ai":
            z = poly(W, H, sx, sy, geom)
            keep |= z & ai

    # ---- hard exclusions (applied again after feathering) ----
    excl = np.zeros((H, W), bool)
    yy, xx = np.mgrid[0:H, 0:W]
    for kind, geom in ZONES.get(name, []):
        if kind == "exclude_poly":
            excl |= poly(W, H, sx, sy, geom)
        elif kind == "exclude_ellipse":
            excl |= ellip(W, H, sx, sy, *geom)
        elif kind == "exclude_dark":
            # mirror arm: only the dark arm pixels inside the box (bright fender stays painted)
            x0, y0, x1, y1 = geom
            boxm = (xx >= x0 * sx) & (xx <= x1 * sx) & (yy >= y0 * sy) & (yy <= y1 * sy)
            dark = boxm & (mx < 0.45) & (sat < 0.55)
            excl |= ndimage.binary_dilation(dark, iterations=2)
        elif kind == "band":
            excl |= poly(W, H, sx, sy, geom)
    keep &= ~excl

    # background core (border-connected orange studio)
    bgc = background_core(rgb, W, H)
    keep &= ~bgc

    # floor / undercarriage: never paint below the tyre contact line
    row = np.mgrid[0:H, 0:W][0]
    floor_excl = np.zeros((H, W), bool)
    floor_y = next((g for k, g in ZONES[name] if k == "floor"), None)
    floor_color_y = next((g for k, g in ZONES[name] if k == "floor_color"), None)
    if floor_y is not None:
        floor_excl |= row >= floor_y * sy
    if floor_color_y is not None:
        # front view: floor is angled, not a single line — below the line keep
        # only low-sat bright body (bumper lips / diffuser), cut floor & shadow.
        # "near the car" keeps bright floor reflections out of the paint.
        below = row >= floor_color_y * sy
        body_like = (sat < 0.30) & (mx > 0.25)
        car_near = ndimage.binary_dilation(keep, iterations=10)
        floor_excl |= below & ~(body_like & car_near)
    keep &= ~floor_excl

    # ---- feather ----
    feathered = np.array(
        Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))
    )

    # ---- wheels: polar tyre-boundary cut AFTER feathering (v10).
    # Each wheel's boundary is measured per-angle from the photo (anchored on
    # the black arch gap / bright fender / orange bg) and stored as radius
    # ratios vs the old fitted ellipse -> the full tyre incl. lit sidewalls is
    # cut with NO exceptions. "wheel_dark" keeps v9 parity for dark/saturated
    # pixels inside the old ellipse; a 12px dark-neutral ring outside the cut
    # removes the dark-red arch-gap arcs v9 used to paint.
    wheel_cut = np.zeros((H, W), bool)
    for kind, geom in ZONES[name]:
        if kind == "wheel_polar":
            dx, dy, rx, ry, rot, ratios = geom
            cx, cy, Rx, Ry = dx * sx, dy * sy, rx * sx, ry * sy
            th = np.radians(rot)
            ca, sa = np.cos(th), np.sin(th)
            Rmax = max(ratios) * 1.03 + 0.03
            x0 = max(int(cx - Rx * Rmax), 0)
            x1 = min(int(cx + Rx * Rmax) + 1, W - 1)
            y0 = max(int(cy - Ry * Rmax), 0)
            y1 = min(int(cy + Ry * Rmax) + 1, H - 1)
            yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
            x = (xx - cx) / Rx
            y = (yy - cy) / Ry
            d = np.sqrt((ca * x + sa * y) ** 2 + (-sa * x + ca * y) ** 2)
            ang = np.degrees(np.arctan2(-sa * x + ca * y, ca * x + sa * y))
            ti = np.clip(np.round((ang + 180.0) / 2.0).astype(int), 0, len(ratios) - 1)
            R = np.asarray(ratios, np.float32)[ti]
            wheel_cut[y0:y1 + 1, x0:x1 + 1] |= d <= R
    wheel_cut = ndimage.binary_dilation(wheel_cut, iterations=2)
    for kind, geom in ZONES[name]:
        if kind == "wheel_dark":
            dx, dy, rx, ry, rot = geom
            # v9 parity: dark/saturated pixels inside the old ellipse stay cut
            e2 = ndimage.binary_dilation(
                ellip_rot(W, H, sx, sy, dx, dy, rx, ry, rot), iterations=2)
            wheel_cut |= e2 & ((mx < 0.20) | (sat > 0.25))
            # dark arch annulus: the colour blend renders ANY low-sat pixel up
            # to vivid red, so the whole dark ring around the tyre (arch gap,
            # wheel well, shadowed lip, V<0.32) between the polar boundary and
            # 1.16x the old ellipse is cut; lit fender/quarter (V>=0.32) stays
            # painted.
            e116 = ellip_rot(W, H, sx, sy, dx, dy, rx * 1.16, ry * 1.16, rot)
            dark_ann = e116 & ~wheel_cut & (mx < 0.32) & (sat < 0.60)
            dark_ann = ndimage.binary_closing(dark_ann, np.ones((3, 3)))
            # swallow tiny bright islands left inside the dark annulus so the
            # arch edge stays clean (no red specks)
            keep_region = e116 & ~wheel_cut & ~dark_ann
            lblk, nk = ndimage.label(keep_region)
            if nk:
                szs = ndimage.sum(keep_region, lblk, range(1, nk + 1))
                small = np.isin(lblk, [i + 1 for i, s in enumerate(szs) if s < 6])
                dark_ann |= small
            wheel_cut |= dark_ann
    alpha = np.where(wheel_cut, 0, feathered)
    alpha = np.where(excl, 0, alpha)
    alpha = np.where(bgc, 0, alpha)
    alpha = np.where(floor_excl, 0, alpha)

    rgba = np.dstack([np.full_like(alpha, 255)] * 3 + [alpha]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(mask_out)

    paint_preview(img, alpha, "#ce1730").save(preview_out, quality=85)
    print(f"{name} -> {mask_out} (body coverage {(alpha > 127).mean() * 100:.1f}%)")


if __name__ == "__main__":
    base = "/home/user/work/lan5/lan5/public/images"
    scr = "/home/user/work/lan5/lan5/scripts"
    make_mask(f"{base}/config-front.jpg", f"{scr}/ai-mask-front.png", f"{base}/mask-front.png", f"{scr}/preview-front.jpg")
    make_mask(f"{base}/config-rear.jpg", f"{scr}/ai-mask-rear.png", f"{base}/mask-rear.png", f"{scr}/preview-rear.jpg")
    print("OK")
