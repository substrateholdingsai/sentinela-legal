#!/usr/bin/env python3
"""
SENTINELA · NOC Regulatorio — Asset Forge (SVG puro, cero dependencias)
-----------------------------------------------------------------------
Genera el kit de marca completo en public/assets/brand/:
  sentinela-symbol.svg · sentinela-logo-dark.svg · sentinela-logo-light.svg
  favicon.svg · channel-{fiscal,cobranza,fintech,laboral}.svg
  badge-{critical,high,medium,low}.svg · reticle-grid.svg · og-image.svg
  manifest.json

Uso:
    python scripts/generate_assets.py --out public/assets/brand
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# UTF-8 Windows nativo
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# --------------------------------------------------------------------------
# TOKENS SENTINELA
# --------------------------------------------------------------------------
CANVAS_D   = "#070A11"
SURFACE_D  = "#0F172A"
BORDER_D   = "#1E293B"
GRID_LINE  = "#0D1420"
GRID_CROSS = "#1B2536"
TEXT_1_D   = "#F8FAFC"
TEXT_2_D   = "#94A3B8"
TEXT_3     = "#64748B"
TEXT_1_L   = "#0F172A"
TEXT_2_L   = "#475569"
SIGNAL_D   = "#22D3EE"   # símbolo en dark
SIGNAL_L   = "#0E7490"   # símbolo en light

SEV = {
    "critical": {"base": "#E11D48", "dark": "#FB7185", "label": "CRITICAL"},
    "high":     {"base": "#F97316", "dark": "#FBBF24", "label": "HIGH"},
    "medium":   {"base": "#06B6D4", "dark": "#22D3EE", "label": "MEDIUM"},
    "low":      {"base": "#64748B", "dark": "#94A3B8", "label": "LOW"},
}
CHANNELS = {
    "fiscal":   "#10B981",
    "cobranza": "#3B82F6",
    "fintech":  "#8B5CF6",
    "laboral":  "#F59E0B",
}
FONT_UI   = "'Inter', system-ui, sans-serif"
FONT_MONO = "'JetBrains Mono', ui-monospace, monospace"


def n(v: float) -> str:
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


# ==========================================================================
#  FORGE
# ==========================================================================
class SentinelaForge:

    # ---------------- SÍMBOLO: el ojo de la ley ----------------
    def _symbol_group(self, color: str, sw: float = 32.0, simplified: bool = False) -> str:
        """Hexágono-centinela + iris + pupila + retícula cardinal (espacio 512)."""
        hex_pts = "256,48 436,152 436,360 256,464 76,360 76,152"
        g = [f'<polygon points="{hex_pts}" fill="none" stroke="{color}" '
             f'stroke-width="{n(sw)}" stroke-linejoin="round"/>',
             f'<circle cx="256" cy="256" r="96" fill="none" stroke="{color}" '
             f'stroke-width="{n(sw)}"/>',
             f'<circle cx="256" cy="256" r="40" fill="{color}"/>']
        if not simplified:
            for x1, y1, x2, y2 in ((256, 88, 256, 132), (256, 380, 256, 424),
                                   (100, 256, 144, 256), (368, 256, 412, 256)):
                g.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                         f'stroke="{color}" stroke-width="{n(sw)}" stroke-linecap="round"/>')
        return "".join(g)

    def symbol(self) -> str:
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">'
                f'{self._symbol_group("currentColor")}</svg>')

    # ---------------- LOGOS ----------------
    def logo(self, dark: bool = True) -> str:
        sig = SIGNAL_D if dark else SIGNAL_L
        t1 = TEXT_1_D if dark else TEXT_1_L
        t2 = TEXT_2_D if dark else TEXT_2_L
        sc = 96 / 512
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="560" height="128" '
            f'viewBox="0 0 560 128">'
            f'<g transform="translate(16,16) scale({n(sc)})">'
            f'{self._symbol_group(sig)}</g>'
            f'<text x="136" y="72" font-family={FONT_UI} font-size="44" font-weight="700" '
            f'letter-spacing="6" fill="{t1}">SENTINELA</text>'
            f'<text x="138" y="100" font-family={FONT_MONO} font-size="13" '
            f'letter-spacing="5.2" fill="{t2}">SISTEMA REGULATORIO</text>'
            f'</svg>'
        )

    # ---------------- FAVICON ----------------
    def favicon(self) -> str:
        sc = 48 / 512
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
                f'<rect width="64" height="64" rx="14" fill="{CANVAS_D}"/>'
                f'<g transform="translate(8,8) scale({n(sc)})">'
                f'{self._symbol_group(SIGNAL_D, sw=40, simplified=True)}</g></svg>')

    # ---------------- ICONOS DE CANAL 24×24 ----------------
    def channel_icon(self, key: str) -> str:
        inner = {
            "fiscal": ('<path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/>'
                       '<circle cx="10.2" cy="12.2" r="1.5"/><circle cx="13.8" cy="16.8" r="1.5"/>'
                       '<path d="M14.6 10.6 9.4 18.4"/>'),
            "cobranza": ('<path d="M12 2.8 19.5 6v6.2c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z"/>'
                         '<path d="M8 12h2l1.5-3 2 5 1.5-2h1"/>'),
            "fintech": ('<circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="4.6" r="1.8"/>'
                        '<circle cx="4.9" cy="16.6" r="1.8"/><circle cx="19.1" cy="16.6" r="1.8"/>'
                        '<path d="M12 10.1V6.4M10.4 13 6.4 15.6M13.6 13l4 2.6"/>'),
            "laboral": ('<rect x="3.5" y="7.5" width="17" height="12.5" rx="2"/>'
                        '<path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>'
                        '<path d="M3.5 12.5h17M12 11.5v2"/>'),
        }[key]
        S = ('fill="none" stroke="currentColor" stroke-width="1.5" '
             'stroke-linecap="round" stroke-linejoin="round"')
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
                f'<g {S}>{inner}</g></svg>')

    # ---------------- BADGES DE SEVERIDAD ----------------
    def badge(self, sev: str) -> str:
        s = SEV[sev]
        widths = {"critical": 96, "high": 68, "medium": 84, "low": 60}
        w = widths[sev]
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="22" '
            f'viewBox="0 0 {w} 22">'
            f'<rect x="0.5" y="0.5" width="{w-1}" height="21" rx="10.5" '
            f'fill="{s["base"]}" fill-opacity="0.14" stroke="{s["base"]}" stroke-opacity="0.35"/>'
            f'<circle cx="13" cy="11" r="3" fill="{s["dark"]}"/>'
            f'<text x="22" y="15" font-family={FONT_MONO} font-size="11" font-weight="500" '
            f'letter-spacing="1" fill="{s["dark"]}">{s["label"]}</text>'
            f'</svg>'
        )

    # ---------------- RETÍCULA DE RASTREO (seamless) ----------------
    def reticle_grid(self) -> str:
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" '
                f'viewBox="0 0 48 48">'
                f'<path d="M0 0.5H48M0.5 0V48" stroke="{GRID_LINE}" stroke-width="1"/>'
                f'<path d="M24 18v12M18 24h12" stroke="{GRID_CROSS}" stroke-width="1"/>'
                f'</svg>')

    # ---------------- OG IMAGE 1200×630 ----------------
    def og_image(self) -> str:
        rows = "".join(
            f'<circle cx="780" cy="{200 + i * 52}" r="5" fill="{SEV[k]["dark"]}"/>'
            f'<text x="800" y="{205 + i * 52}" font-family={FONT_MONO} font-size="14" '
            f'letter-spacing="2" fill="{TEXT_2_D}">{SEV[k]["label"]}</text>'
            f'<text x="900" y="{205 + i * 52}" font-family={FONT_MONO} font-size="12" '
            f'fill="{TEXT_3}">{d}</text>'
            for i, (k, d) in enumerate((
                ("critical", "reformas · multas · CP 284 Bis"),
                ("high", "miscelánea · REDECO · CFDI"),
                ("medium", "circulares Banxico · CNBV"),
                ("low", "erratas · trámites"),
            )))
        sc = 180 / 512
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" '
            f'viewBox="0 0 1200 630">'
            f'<defs><pattern id="rg" width="48" height="48" patternUnits="userSpaceOnUse">'
            f'<path d="M0 0.5H48M0.5 0V48" stroke="{GRID_LINE}" stroke-width="1"/>'
            f'<path d="M24 18v12M18 24h12" stroke="{GRID_CROSS}" stroke-width="1"/>'
            f'</pattern></defs>'
            f'<rect width="1200" height="630" fill="{CANVAS_D}"/>'
            f'<rect width="1200" height="630" fill="url(#rg)"/>'
            f'<rect x="36" y="36" width="1128" height="558" fill="none" stroke="{BORDER_D}"/>'
            f'<path d="M36 76V36h40M1124 36h40v40M1164 554v40h-40M76 594H36v-40" '
            f'stroke="{SIGNAL_D}" stroke-width="2" fill="none"/>'
            f'<g transform="translate(84,96) scale({n(sc)})">{self._symbol_group(SIGNAL_D)}</g>'
            f'<text x="84" y="392" font-family={FONT_UI} font-size="76" font-weight="700" '
            f'letter-spacing="4" fill="{TEXT_1_D}">SENTINELA</text>'
            f'<text x="86" y="428" font-family={FONT_MONO} font-size="16" letter-spacing="4" '
            f'fill="{TEXT_2_D}">SISTEMA REGULATORIO · DOF · BANXICO · CNBV · SAT</text>'
            f'<text x="84" y="560" font-family={FONT_UI} font-size="13" letter-spacing="3" '
            f'fill="{TEXT_3}">OBSERVABILIDAD NORMATIVA EN TIEMPO REAL</text>'
            f'{rows}'
            f'<text x="1116" y="566" text-anchor="end" font-family={FONT_MONO} font-size="14" '
            f'letter-spacing="2" fill="{SIGNAL_D}">sentinela.arksystems.site</text>'
            f'</svg>'
        )

    # ---------------- BUILD ----------------
    def build(self, out: Path) -> list[dict]:
        out.mkdir(parents=True, exist_ok=True)
        files = {
            "sentinela-symbol.svg":     self.symbol(),
            "sentinela-logo-dark.svg":  self.logo(dark=True),
            "sentinela-logo-light.svg": self.logo(dark=False),
            "favicon.svg":              self.favicon(),
            "channel-fiscal.svg":       self.channel_icon("fiscal"),
            "channel-cobranza.svg":     self.channel_icon("cobranza"),
            "channel-fintech.svg":      self.channel_icon("fintech"),
            "channel-laboral.svg":      self.channel_icon("laboral"),
            "badge-critical.svg":       self.badge("critical"),
            "badge-high.svg":           self.badge("high"),
            "badge-medium.svg":         self.badge("medium"),
            "badge-low.svg":            self.badge("low"),
            "reticle-grid.svg":         self.reticle_grid(),
            "og-image.svg":             self.og_image(),
        }
        manifest = []
        for name, content in files.items():
            p = out / name
            p.write_text(content, encoding="utf-8")
            kb = round(p.stat().st_size / 1024, 2)
            manifest.append({"file": name, "kb": kb})
            print(f"  ✓ {name:<26} {kb:>6.2f} KB")
        mp = out / "manifest.json"
        mp.write_text(json.dumps(
            {"system": "Sentinela · NOC Regulatorio", "client": "sentinela-legal",
             "assets": manifest}, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  ✓ {'manifest.json':<26} {round(mp.stat().st_size/1024,2):>6.2f} KB")
        return manifest


def main():
    ap = argparse.ArgumentParser(description="Sentinela · NOC Regulatorio · Asset Forge")
    ap.add_argument("--out", default="public/assets/brand", help="carpeta de salida")
    a = ap.parse_args()
    print(f"\n🛰️  SENTINELA · NOC Regulatorio — Asset Forge (SVG puro, stdlib only)\n")
    SentinelaForge().build(Path(a.out))
    print(f"\n  ✔ 15 assets → {a.out}/\n")


if __name__ == "__main__":
    main()
