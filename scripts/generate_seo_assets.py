#!/usr/bin/env python3
"""
SENTINELA · NOC Regulatorio — SEO / PWA / Social Raster Layer
--------------------------------------------------------------
Capa de rasterización oficial (PNG nativo) sobre el forge SVG.
Requiere Pillow (única dependencia externa justificada: los crawlers
de WhatsApp/FB/LinkedIn/X no rasterizan SVG en og:image).

Modo estático (kit completo):
    python scripts/generate_seo_assets.py --out public/assets/seo

Modo dinámico (tarjeta de alerta regulatoria 1200x630):
    python scripts/generate_seo_assets.py --alert \
      --channel cobranza --severity CRITICAL \
      --title "Reforma al Art. 284 Bis CPF: Prohibición de Cobranza en Horarios Nocturnos" \
      --date "2026-11-01" --folio "DOF-2026-X891" \
      --out public/assets/seo/alert-example.png

Python 3.10+ · Pillow 9+ · fallback tipográfico suave (nunca truena).
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("✗ Falta Pillow. Instala: pip install Pillow")

# --------------------------------------------------------------------------
# TOKENS SENTINELA
# --------------------------------------------------------------------------
CANVAS   = "#070A11"
BORDER   = "#1E293B"
GRID_LN  = "#0D1420"
GRID_CR  = "#1B2536"
TEXT_1   = "#F8FAFC"
TEXT_2   = "#94A3B8"
TEXT_3   = "#64748B"
SIGNAL   = "#22D3EE"

SEV = {
    "CRITICAL": {"base": "#E11D48", "lit": "#FB7185"},
    "HIGH":     {"base": "#F97316", "lit": "#FBBF24"},
    "MEDIUM":   {"base": "#06B6D4", "lit": "#22D3EE"},
    "LOW":      {"base": "#64748B", "lit": "#94A3B8"},
}
CHANNELS = {
    "fiscal": "#10B981", "cobranza": "#3B82F6",
    "fintech": "#8B5CF6", "laboral": "#F59E0B",
}
CH_ALIAS = {"fintech_banca": "fintech", "banca": "fintech", "fintech": "fintech",
            "fiscal": "fiscal", "cobranza": "cobranza", "laboral": "laboral"}

DESCRIPTION = ("Observabilidad regulatoria en tiempo real: DOF, Banxico, CNBV, SAT y STPS "
               "clasificados por severidad de impacto y canal temático.")

# --------------------------------------------------------------------------
# FUENTES: cadena de fallback suave (nunca tronar)
# --------------------------------------------------------------------------
_FONT_CANDIDATES = {
    ("ui", False):   ["Inter-Regular.ttf", "Inter.ttf",
                      "/usr/share/fonts/truetype/inter/Inter-Regular.ttf",
                      "DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                      "arial.ttf", "Helvetica.ttf"],
    ("ui", True):    ["Inter-Bold.ttf", "Inter-SemiBold.ttf",
                      "/usr/share/fonts/truetype/inter/Inter-Bold.ttf",
                      "DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                      "arialbd.ttf", "Helvetica-Bold.ttf"],
    ("mono", False): ["JetBrainsMono-Regular.ttf", "JetBrains Mono Regular.ttf",
                      "/usr/share/fonts/truetype/jetbrains/JetBrainsMono-Regular.ttf",
                      "CascadiaMono-Regular.ttf", "consolas.ttf",
                      "DejaVuSansMono.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
                      "cour.ttf"],
    ("mono", True):  ["JetBrainsMono-Bold.ttf", "CascadiaMono-Bold.ttf", "consolab.ttf",
                      "DejaVuSansMono-Bold.ttf",
                      "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"],
}
_FONT_CACHE: dict = {}


def load_font(kind: str, size: int, bold: bool = False):
    key = (kind, bold, size)
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    f = None
    for path in _FONT_CANDIDATES[(kind, bold)]:
        try:
            f = ImageFont.truetype(path, size)
            break
        except Exception:
            continue
    if f is None:
        try:
            f = ImageFont.load_default(size)
        except Exception:
            f = ImageFont.load_default()
    _FONT_CACHE[key] = f
    return f


# --------------------------------------------------------------------------
# UTILIDADES DE COLOR / MEDIDA
# --------------------------------------------------------------------------
def hex2rgb(h):
    if isinstance(h, tuple):
        return h
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def blend(fg: str, bg: str, a: float):
    fb, bb = hex2rgb(fg), hex2rgb(bg)
    return tuple(round(fb[i] * a + bb[i] * (1 - a)) for i in range(3))


# --------------------------------------------------------------------------
# CANVAS CON SUPERSAMPLING
# --------------------------------------------------------------------------
class Canvas:
    def __init__(self, w: int, h: int, ss: int = 4, bg: str = CANVAS):
        self.w, self.h, self.ss = w, h, ss
        self.img = Image.new("RGB", (w * ss, h * ss), hex2rgb(bg))
        self.d = ImageDraw.Draw(self.img)

    def _x(self, v): return v * self.ss

    def line(self, x1, y1, x2, y2, color, w=1):
        self.d.line([self._x(x1), self._x(y1), self._x(x2), self._x(y2)],
                    fill=hex2rgb(color), width=max(1, int(w * self.ss)))

    def polyline(self, pts, color, w=1, close=False):
        p = [(self._x(a), self._x(b)) for a, b in pts]
        if close:
            p.append(p[0])
        self.d.line(p, fill=hex2rgb(color), width=max(1, int(w * self.ss)), joint="curve")

    def rect(self, x0, y0, x1, y1, color, w=1):
        self.d.rectangle([self._x(x0), self._x(y0), self._x(x1), self._x(y1)],
                         outline=hex2rgb(color), width=max(1, int(w * self.ss)))

    def rrect(self, x0, y0, x1, y1, r, fill=None, outline=None, w=1):
        self.d.rounded_rectangle(
            [self._x(x0), self._x(y0), self._x(x1), self._x(y1)],
            radius=self._x(r),
            fill=hex2rgb(fill) if fill else None,
            outline=hex2rgb(outline) if outline else None,
            width=max(1, int(w * self.ss)))

    def circle(self, cx, cy, r, fill=None, outline=None, w=1):
        self.d.ellipse([self._x(cx - r), self._x(cy - r), self._x(cx + r), self._x(cy + r)],
                       fill=hex2rgb(fill) if fill else None,
                       outline=hex2rgb(outline) if outline else None,
                       width=max(1, int(w * self.ss)))

    def text(self, x, y, s, font, color):
        self.d.text((self._x(x), self._x(y)), s, font=font, fill=hex2rgb(color))

    def text_ls(self, x, y, s, font, color, ls=0):
        """Texto con letter-spacing manual (marca / watermarks)."""
        cx = x
        for ch in s:
            self.d.text((self._x(cx), self._x(y)), ch, font=font, fill=hex2rgb(color))
            bb = self.d.textbbox((0, 0), ch, font=font)
            cx += (bb[2] - bb[0]) / self.ss + ls
        return cx

    def measure_ls(self, s, font, ls=0):
        w = 0.0
        for ch in s:
            bb = self.d.textbbox((0, 0), ch, font=font)
            w += (bb[2] - bb[0]) / self.ss + ls
        return max(0.0, w - ls)

    def measure(self, s, font):
        bb = self.d.textbbox((0, 0), s, font=font)
        return (bb[2] - bb[0]) / self.ss, (bb[3] - bb[1]) / self.ss

    def wrap(self, text, font, maxw):
        lines, cur = [], ""
        for word in text.split():
            t = (cur + " " + word).strip()
            if self.measure(t, font)[0] <= maxw or not cur:
                cur = t
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines

    def finish(self) -> Image.Image:
        return self.img.resize((self.w, self.h), Image.LANCZOS)


# --------------------------------------------------------------------------
# SÍMBOLO SENTINELA (hexágono-centinela + iris + pupila + retícula)
# --------------------------------------------------------------------------
def draw_symbol(c: Canvas, cx, cy, R, color, sw, level=2):
    pts = [(cx + R * math.cos(math.radians(a)), cy - R * math.sin(math.radians(a)))
           for a in (90, 30, -30, -90, -150, 150)]
    c.polyline(pts, color, w=sw, close=True)
    if level >= 1:
        c.circle(cx, cy, R * 0.4615, outline=color, w=sw)
    c.circle(cx, cy, R * 0.1923, fill=color)
    if level >= 2:
        g = R * 0.2115
        for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
            c.line(cx + dx * (R * 0.6538 + g) * (1 if dx else 0) + (0 if dx else dx),
                   cy + dy * (R * 0.6538 + g) * (1 if dy else 0),
                   cx + dx * (R * 0.8654), cy + dy * (R * 0.8654), color, w=sw)


def grid_and_frame(c: Canvas):
    for x in range(0, c.w + 1, 48):
        c.line(x, 0, x, c.h, GRID_LN, 1)
    for y in range(0, c.h + 1, 48):
        c.line(0, y, c.w, y, GRID_LN, 1)
    for tx in range(24, c.w, 48):
        for ty in range(24, c.h, 48):
            c.line(tx - 6, ty, tx + 6, ty, GRID_CR, 1)
            c.line(tx, ty - 6, tx, ty + 6, GRID_CR, 1)
    c.rect(36, 36, c.w - 36, c.h - 36, BORDER, 1)
    L = 40
    for cx0, cy0, sx, sy in ((36, 36, 1, 1), (c.w - 36, 36, -1, 1),
                             (c.w - 36, c.h - 36, -1, -1), (36, c.h - 36, 1, -1)):
        c.line(cx0, cy0, cx0 + sx * L, cy0, SIGNAL, 2)
        c.line(cx0, cy0, cx0, cy0 + sy * L, SIGNAL, 2)


# --------------------------------------------------------------------------
# RENDERIZADORES
# --------------------------------------------------------------------------
def render_brand_og(ss: int, domain: str) -> Image.Image:
    c = Canvas(1200, 630, ss)
    grid_and_frame(c)
    draw_symbol(c, 84 + 90, 96 + 90, 74, SIGNAL, 11, level=2)

    f_title = load_font("ui", 76 * ss, bold=True)
    f_sub   = load_font("mono", 16 * ss)
    f_lab   = load_font("mono", 14 * ss, bold=True)
    f_desc  = load_font("mono", 12 * ss)
    f_tag   = load_font("ui", 13 * ss)
    f_wm    = load_font("mono", 14 * ss)

    c.text_ls(84, 326, "SENTINELA", f_title, TEXT_1, ls=4)
    c.text_ls(86, 414, "SISTEMA REGULATORIO · DOF · BANXICO · CNBV · SAT", f_sub, TEXT_2, ls=3)

    legend = (("CRITICAL", "reformas · multas · CP 284 Bis"),
              ("HIGH", "miscelánea · REDECO · CFDI"),
              ("MEDIUM", "circulares Banxico · CNBV"),
              ("LOW", "erratas · trámites"))
    for i, (lab, desc) in enumerate(legend):
        y = 200 + i * 52
        c.circle(780, y - 5, 5, fill=SEV[lab]["lit"])
        c.text_ls(800, y - 12, lab, f_lab, SEV[lab]["lit"], ls=2)
        c.text(905, y - 11, desc, f_desc, TEXT_3)

    c.text_ls(84, 546, "OBSERVABILIDAD NORMATIVA EN TIEMPO REAL", f_tag, TEXT_3, ls=3)
    wm = domain
    w = c.measure_ls(wm, f_wm, ls=2)
    c.text_ls(1116 - w, 550, wm, f_wm, SIGNAL, ls=2)
    return c.finish()


def render_alert(ss: int, domain: str, channel: str, severity: str,
                 title: str, date: str, folio: str) -> Image.Image:
    sev, ch = SEV[severity], CHANNELS[channel]
    c = Canvas(1200, 630, ss)
    grid_and_frame(c)
    c.d.rectangle([0, 0, c._x(6), c._x(630)], fill=hex2rgb(sev["base"]))  # arista de señal

    f_pill  = load_font("mono", 13 * ss, bold=True)
    f_title = load_font("ui", 46 * ss, bold=True)
    f_meta  = load_font("mono", 18 * ss)
    f_wm    = load_font("mono", 12 * ss)
    f_url   = load_font("mono", 14 * ss)

    # pill de canal (izquierda)
    ch_lab = channel.upper()
    chw = c.measure_ls(ch_lab, f_pill, ls=2)
    c.rrect(84, 72, 84 + 14 + 10 + chw + 14, 72 + 34, 17,
            fill=blend(ch, CANVAS, 0.14), outline=blend(ch, CANVAS, 0.40), w=1)
    c.circle(84 + 14 + 4, 72 + 17, 4, fill=ch)
    c.text_ls(84 + 14 + 10 + 4, 72 + 10, ch_lab, f_pill, ch, ls=2)

    # badge de severidad (esquina superior derecha)
    sv_lab = severity
    svw = c.measure_ls(sv_lab, f_pill, ls=2)
    bx1 = 1116
    bx0 = bx1 - (14 + 10 + svw + 14)
    c.rrect(bx0, 72, bx1, 72 + 34, 17,
            fill=blend(sev["base"], CANVAS, 0.14), outline=blend(sev["base"], CANVAS, 0.40), w=1)
    c.circle(bx0 + 18, 72 + 17, 4, fill=sev["lit"])
    c.text_ls(bx0 + 32, 72 + 10, sv_lab, f_pill, sev["lit"], ls=2)

    # titular legal (máx. 3 líneas)
    lines = c.wrap(title, f_title, 1032)[:3]
    y = 168
    for ln in lines:
        c.text(84, y, ln, f_title, TEXT_1)
        y += 62
    if len(c.wrap(title, f_title, 1032)) > 3:
        c.text(84, y, "…", f_title, TEXT_2)
        y += 62

    # meta mono: folio + entrada en vigor
    c.line(84, y + 8, 1116, y + 8, BORDER, 1)
    c.text_ls(84, y + 30, f"{folio}  ·  ENTRADA EN VIGOR {date}", f_meta, TEXT_2, ls=1)

    # watermark discreto
    c.text_ls(84, 552, "SENTINELA REGTECH OBSERVABILITY · VER DECRETO OFICIAL",
              f_wm, TEXT_3, ls=2)
    w = c.measure_ls(domain, f_url, ls=2)
    c.text_ls(1116 - w, 550, domain, f_url, SIGNAL, ls=2)
    return c.finish()


def render_icon(ss: int, size: int) -> Image.Image:
    level = 2 if size >= 48 else (1 if size >= 32 else 0)
    sw = size * (0.0625 if size >= 32 else 0.095)
    c = Canvas(size, size, ss)
    draw_symbol(c, size / 2, size / 2, size * 0.36, SIGNAL, sw, level=level)
    return c.finish()


# --------------------------------------------------------------------------
# METADATOS
# --------------------------------------------------------------------------
def write_meta_files(web_root: Path, domain: str, manifest: list) -> list:
    web_root.mkdir(parents=True, exist_ok=True)
    base = f"https://{domain}"
    ico = "/assets/seo"

    webmanifest = {
        "name": "Sentinela · NOC Regulatorio",
        "short_name": "Sentinela",
        "description": DESCRIPTION,
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "theme_color": "#070A11",
        "background_color": "#070A11",
        "icons": [
            {"src": f"{ico}/android-chrome-192x192.png", "sizes": "192x192",
             "type": "image/png", "purpose": "any"},
            {"src": f"{ico}/android-chrome-512x512.png", "sizes": "512x512",
             "type": "image/png", "purpose": "any maskable"},
        ],
    }
    p = web_root / "site.webmanifest"
    p.write_text(json.dumps(webmanifest, indent=2, ensure_ascii=False), encoding="utf-8")
    manifest.append({"file": str(p), "kb": round(p.stat().st_size / 1024, 2)})

    robots = (f"# Sentinela · NOC Regulatorio\n"
              f"User-agent: *\n"
              f"Allow: /\n"
              f"Disallow: /api/v1/\n\n"
              f"Sitemap: {base}/sitemap.xml\n")
    p = web_root / "robots.txt"
    p.write_text(robots, encoding="utf-8")
    manifest.append({"file": str(p), "kb": round(p.stat().st_size / 1024, 2)})

    meta = f"""<!-- SENTINELA · NOC Regulatorio — metadatos generados -->
<title>Sentinela · NOC Regulatorio</title>
<meta name="description" content="{DESCRIPTION}">
<link rel="canonical" href="{base}/">
<meta name="theme-color" content="#070A11">
<link rel="manifest" href="/site.webmanifest">
<link rel="icon" type="image/x-icon" href="{ico}/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="{ico}/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="{ico}/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="{ico}/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sentinela">
<meta property="og:title" content="Sentinela · NOC Regulatorio">
<meta property="og:description" content="{DESCRIPTION}">
<meta property="og:url" content="{base}/">
<meta property="og:image" content="{base}{ico}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Sentinela · NOC Regulatorio">
<meta name="twitter:description" content="{DESCRIPTION}">
<meta name="twitter:image" content="{base}{ico}/twitter-card.png">
"""
    p = web_root / "meta-tags.html"
    p.write_text(meta, encoding="utf-8")
    manifest.append({"file": str(p), "kb": round(p.stat().st_size / 1024, 2)})
    return manifest


# --------------------------------------------------------------------------
# BUILD
# --------------------------------------------------------------------------
def save(img: Image.Image, path: Path, manifest: list, **kw):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, **kw)
    manifest.append({"file": str(path), "kb": round(path.stat().st_size / 1024, 2)})


def main():
    ap = argparse.ArgumentParser(description="Sentinela · SEO/PWA/Social raster layer")
    ap.add_argument("--out", default="public/assets/seo")
    ap.add_argument("--web-root", default="public")
    ap.add_argument("--domain", default="sentinela.arksystems.site")
    ap.add_argument("--ss", type=int, default=4, help="supersampling (4 = calidad brand)")
    ap.add_argument("--alert", action="store_true", help="modo tarjeta dinámica")
    ap.add_argument("--channel", default="cobranza")
    ap.add_argument("--severity", default="CRITICAL")
    ap.add_argument("--title", default="")
    ap.add_argument("--date", default="")
    ap.add_argument("--folio", default="")
    a = ap.parse_args()

    manifest: list = []

    # ---------- MODO DINÁMICO ----------
    if a.alert:
        sev = a.severity.upper()
        ch = CH_ALIAS.get(a.channel.lower().strip(), a.channel.lower().strip())
        if sev not in SEV:
            sys.exit(f"✗ severidad desconocida: {sev} (válidas: {', '.join(SEV)})")
        if ch not in CHANNELS:
            sys.exit(f"✗ canal desconocido: {ch} (válidos: {', '.join(CHANNELS)})")
        if not a.title:
            sys.exit("✗ --alert requiere --title")
        target = Path(a.out)
        if target.suffix.lower() != ".png":
            target = target / "alert-card.png"
        img = render_alert(a.ss, a.domain, ch, sev, a.title, a.date or "S/F", a.folio or "S/FOLIO")
        save(img, target, manifest)
        print(f"\n🛰️  SENTINELA · tarjeta de alerta {sev} / {ch.upper()}")
        for m in manifest:
            print(f"  ✓ {Path(m['file']).name:<26} {m['kb']:>7.2f} KB")
        print()
        return

    # ---------- MODO ESTÁTICO ----------
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    print(f"\n🛰️  SENTINELA · SEO/PWA/Social raster layer (ss={a.ss}×)\n")

    og = render_brand_og(a.ss, a.domain)
    save(og, out / "og-image.png", manifest)
    save(og, out / "twitter-card.png", manifest)

    save(render_icon(a.ss, 180), out / "apple-touch-icon.png", manifest)
    save(render_icon(a.ss, 32),  out / "favicon-32x32.png", manifest)
    save(render_icon(a.ss, 16),  out / "favicon-16x16.png", manifest)
    save(render_icon(a.ss, 192), out / "android-chrome-192x192.png", manifest)
    icon512 = render_icon(a.ss, 512)
    save(icon512, out / "android-chrome-512x512.png", manifest)

    ico_path = out / "favicon.ico"
    icon512.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    manifest.append({"file": str(ico_path), "kb": round(ico_path.stat().st_size / 1024, 2)})

    write_meta_files(Path(a.web_root), a.domain, manifest)

    for m in manifest:
        print(f"  ✓ {Path(m['file']).name:<28} {m['kb']:>7.2f} KB")
    total = sum(m["kb"] for m in manifest)
    print(f"\n  ✔ {len(manifest)} archivos · {total:.1f} KB totales → {out}/\n")


if __name__ == "__main__":
    main()
