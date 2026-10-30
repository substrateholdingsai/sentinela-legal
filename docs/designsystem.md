# 📄 SENTINELA-LEGAL.md
> **Design System v1.0** · Instancia: `Sentinela · NOC Regulatorio` · Cliente: **sentinela-legal (Cloudflare Worker)**
> Tipo de Huésped: `service` (RegTech Observability · panel interno + alertas B2B)

## 1 · Identidad, Tono y Filosofía Visual

**Sentinela** es el oráculo regulatorio: escucha al DOF, Banxico, CNBV, SAT y STPS,
y traduce el ruido oficial en señales accionables. No es un newsletter fiscal:
es una **consola de mando (NOC)** donde cada píxel de color significa riesgo.

**Voz de marca:** soberana, vigilante, precisa, minimalista.
- Sentinela no opina: **cita, clasifica y fecha**.
- Cero adornos innecesarios. El ornamento aquí es un error de señal.
- Dark theme prioritario (consola NOC). Light theme gemelo para reportes
  imprimibles y PDFs ejecutivos (misma semántica, luminancia invertida).

**Principio rector del color:**
> *El color es significado, nunca decoración.*
> Severidad y canal agotan la paleta cromática. Todo lo interactivo
> (foco, hover, selección) se resuelve con luminancia y bordes, no con tono.

**Ética:** citamos la fuente oficial con folio y hash. Nunca resumimos un
artículo sin link al decreto. Una alerta sin folio DOF es un bug, no una alerta.

## 2 · Design Tokens

### 2.1 · Severidad de Impacto Normativo

| Token | Base HEX / HSL / Tailwind | Dark (texto/badge) | Light (texto/badge) | Semántica |
|---|---|---|---|---|
| `sev-critical` | `#E11D48` · hsl(347 77% 50%) · `rose-600` | `#FB7185` | `#BE123C` | Reformas constitucionales, multas directas, CP 284 Bis |
| `sev-high` | `#F97316` · hsl(25 95% 53%) · `orange-500` | `#FBBF24` | `#C2410C` | Miscelánea fiscal, horarios REDECO, CFDI 4.0 |
| `sev-medium` | `#06B6D4` · hsl(189 94% 43%) · `cyan-500` | `#22D3EE` | `#0E7490` | Circulares Banxico/CNBV, convocatorias |
| `sev-low` | `#64748B` · hsl(215 16% 47%) · `slate-500` | `#94A3B8` | `#475569` | Fe de erratas, trámites ordinarios |

### 2.2 · Canales Temáticos

| Token | Base HEX / HSL / Tailwind | Dark | Light | Canal |
|---|---|---|---|---|
| `ch-fiscal` | `#10B981` · hsl(160 84% 39%) · `emerald-500` | `#34D399` | `#047857` | SAT, miscelánea, ISR/IVA |
| `ch-cobranza` | `#3B82F6` · hsl(217 91% 60%) · `blue-500` | `#60A5FA` | `#1D4ED8` | Cobranza, CONDUSEF |
| `ch-fintech` | `#8B5CF6` · hsl(258 90% 66%) · `violet-500` | `#A78BFA` | `#6D28D9` | Banxico, CNBV, Ley Fintech |
| `ch-laboral` | `#F59E0B` · hsl(38 92% 50%) · `amber-500` | `#FBBF24` | `#B45309` | STPS, IMSS, INFONAVIT |

> **Regla anti-colisión:** `sev-high` (naranja) y `ch-laboral` (ámbar) son
> vecinos cromáticos a propósito, pero **nunca comparten slot**: la severidad
> vive en el pill y el borde izquierdo; el canal vive en el badge y el ícono.
> Si un componente necesita ambos, el canal va a la izquierda, la severidad a la derecha.

### 2.3 · Superficies (temas gemelos)

| Token | Dark | Light | Rol |
|---|---|---|---|
| `bg-canvas` | `#070A11` | `#F8FAFC` | Lienzo de fondo |
| `bg-surface` | `#0F172A` | `#FFFFFF` | Cards, paneles |
| `bg-surface-2` | `#16203A` | `#F1F5F9` | Hover de superficie, filas alternas |
| `border-line` | `#1E293B` | `#E2E8F0` | Bordes técnicos sutiles |
| `border-strong` | `#334155` | `#CBD5E1` | Hover de borde, foco estructural |
| `text-1` | `#F8FAFC` | `#0F172A` | Texto primario |
| `text-2` | `#94A3B8` | `#475569` | Texto secundario |
| `text-3` | `#64748B` | `#64748B` | Meta, timestamps (idéntico en ambos temas) |

**Contraste verificado:** `text-1`/`bg-surface` 16.4:1 AAA · `text-2`/`bg-surface` 6.9:1 AA+ ·
pills dark sobre surface: critical 6.6:1, high 9.8:1, medium 9.9:1, low 6.9:1 ·
light: critical 6.3:1, high 5.2:1, medium 5.4:1, low 7.6:1.

**Foco e interacción (sin tono):** `outline: 2px solid var(--text-1); outline-offset: 2px`.
En dark, el foco es blanco fantasma; en light, tinta. Nunca un anillo de color.

### 2.4 · Retícula de rastreo (fondo)
`reticle-grid.svg` (tile 48×48) como `background-image` del canvas, opacidad nativa
baja (líneas `#0D1420`, cruces `#1B2536`). Es el único "ornamento": el radar encendido.

## 3 · Tipografía y Jerarquía

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| **Display / UI** | `Inter` | 500 / 600 / 700 | Títulos, nav, botones. Tracking `-0.02em` en display, `-0.01em` en títulos de card |
| **Cuerpo / UI** | `Inter` | 400 / 500 | Lectura de interfaz, extractos |
| **Lectura Legal** | `Source Serif 4` | 400 / 600 | **Solo** citas textuales de artículos (`blockquote.decreto`). La ley se cita como códice |
| **Técnica (mono)** | `JetBrains Mono` | 400 / 500 | **Obligatoria** para: artículos numerados, fechas de entrada en vigor, hashes SHA-256, folios DOF, payloads de webhook, pills de severidad |

Escala: `12 · 13.5 · 14 · 16 · 17 · 20 · 24 · 32 · 44 · 76`.
Regla: todo lo que un humano deba **transcribir** (folio, hash, fecha) es mono.
Todo lo que deba **comprender** es Inter. Todo lo que deba **respetar** es serif.

## 4 · Anatomía de Componentes Clave

### 4.1 · Regulatory Event Card
```css
.event-card{
  position:relative; background:var(--bg-surface);
  border:1px solid var(--border-line); border-radius:8px;
  border-left:3px solid var(--sev);            /* arista de señal */
  padding:16px 16px 14px 20px;
}
.event-card:hover{ border-color:var(--border-strong); border-left-color:var(--sev);
  background:var(--bg-surface-2); }
.event-card__head{ display:flex; align-items:center; gap:8px; }
.event-card__channel{ /* badge de canal: ícono 14px + nombre, color del canal al 12% */ }
.event-card__time{ margin-left:auto; font:400 12px var(--font-mono); color:var(--text-3); }
.event-card__title{ font:600 17px/1.35 var(--font-ui); letter-spacing:-0.01em; color:var(--text-1); }
.event-card__excerpt{ font:400 14px/1.6 var(--font-ui); color:var(--text-2);
  display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.event-card__excerpt blockquote.decreto{ font-family:var(--font-legal); font-size:14.5px; color:var(--text-1); }
.event-card__meta{ font:400 12px/1.5 var(--font-mono); color:var(--text-3); }
.btn-decreto{ font:500 12px var(--font-mono); letter-spacing:.08em; text-transform:uppercase;
  color:var(--text-1); border:1px solid var(--border-strong); border-radius:6px; padding:8px 12px; }
.btn-decreto:hover{ background:var(--bg-surface-2); }
.btn-decreto:focus-visible{ outline:2px solid var(--text-1); outline-offset:2px; }
/* severidad por clase: */
.sev-critical{ --sev:#E11D48; } .sev-high{ --sev:#F97316; }
.sev-medium{ --sev:#06B6D4; }  .sev-low{ --sev:#64748B; }
```
Anatomía: `[badge canal] [pill severidad] .... [timestamp mono]` → título →
extracto (≤3 líneas, cita en serif si es artículo) → meta mono
(`DOF 27/10/2026 · folio 1234-A · sha256:9f2c…`) → footer `[Ver Decreto] [Silenciar 24h]`.

### 4.2 · Severity Pill / Badges
```css
.pill{ display:inline-flex; align-items:center; gap:6px; height:20px; padding:0 8px;
  border-radius:999px; font:500 11px/1 var(--font-mono); letter-spacing:.08em;
  text-transform:uppercase; color:var(--sev-text);
  background:color-mix(in srgb, var(--sev) 14%, transparent);
  border:1px solid color-mix(in srgb, var(--sev) 35%, transparent); }
.pill::before{ content:""; width:6px; height:6px; border-radius:50%; background:var(--sev-text); }
.pill--active.pill--critical::before{ animation:sentinela-pulse 1.6s ease-in-out infinite; }
.pill--inactive{ opacity:.55; } .pill--inactive::before{ display:none; }
@keyframes sentinela-pulse{ 50%{ opacity:.25; } }
@media (prefers-reduced-motion:reduce){ .pill::before{ animation:none; } }
```
Tamaños: alto 20px (compacto 16px en tablas densas). Tailwind equivalente:
`bg-rose-500/15 text-rose-400 border-rose-500/35` (dark) ·
`bg-rose-600/10 text-rose-700 border-rose-600/30` (light).

### 4.3 · Diff Highlighter (artículos adicionados / reformados / derogados)
El diff **reutiliza la gramática de severidad**: lo derogado mata tu cumplimiento
(critical), lo reformado lo altera (high), lo adicionado entra a observación (medium).
```css
.diff{ font:400 13.5px/1.7 var(--font-mono); padding:8px 12px 8px 14px;
  border-left:2px solid var(--d); background:color-mix(in srgb, var(--d) 8%, transparent); }
.diff::before{ font-weight:500; margin-right:8px; color:var(--d); }
.diff--adicionado{ --d:#06B6D4; } .diff--adicionado::before{ content:"+"; }
.diff--reformado { --d:#F97316; } .diff--reformado::before{ content:"±"; }
.diff--derogado  { --d:#E11D48; } .diff--derogado::before{ content:"−"; }
.diff--derogado .diff__text{ text-decoration:line-through; opacity:.6; }
```

### 4.4 · DOF Feed Widget
La landing muestra hasta cinco publicaciones recientes del RSS oficial del DOF.
Usa `bg-surface` para el panel, `bg-canvas` para filas y metadatos en `font-mono`;
los títulos y extractos usan `font-ui` con los tokens de texto existentes. Cada
fila enlaza directamente al dominio oficial y el pie muestra la hora de consulta
en CDMX. La indisponibilidad del feed se comunica explícitamente, sin presentar
datos guardados como publicaciones recién actualizadas.

## 5 · Metáfora de Operación (vocabulario del tenant)

| Concepto genérico | Vocabulario Sentinela |
|---|---|
| Post / noticia | **Evento regulatorio** |
| Fuente RSS | **Fuente oficial** (DOF, Banxico, CNBV, SAT, STPS) |
| Categoría | **Canal temático** (fiscal · cobranza · fintech_banca · laboral) |
| Urgencia | **Severidad de impacto** (CRITICAL · HIGH · MEDIUM · LOW) |
| Deadline | **Entrada en vigor** / **Ventana de cumplimiento** |
| ID externo | **Folio DOF** + **hash SHA-256** del payload |
| CTA primario | **Ver Decreto** |
| Suscribirse | **Suscribir canal** / **Silenciar canal 24h** |

Flujo canónico: *escucha → clasifica → alerta → expediente*. Ninguna alerta
existe sin expediente; ningún expediente existe sin fuente.

## 6 · Inventario de Assets → `scripts/generate_assets.py`

| Archivo | Uso |
|---|---|
| `sentinela-symbol.svg` | Isotipo (viewBox 512, `currentColor`) |
| `sentinela-logo-dark.svg` / `-light.svg` | Imagotipo completo por tema |
| `favicon.svg` | Pestaña / PWA |
| `channel-fiscal.svg` · `channel-cobranza.svg` · `channel-fintech.svg` · `channel-laboral.svg` | Iconos 24×24 stroke 1.5 |
| `badge-critical.svg` · `badge-high.svg` · `badge-medium.svg` · `badge-low.svg` | Pills para emails/webhooks |
| `reticle-grid.svg` | Retícula de rastreo (fondo seamless) |
| `og-image.svg` | Social meta 1200×630 |
| `manifest.json` | Auditoría de pesos |

**Checklist:** tokens CSS → fuentes (Inter + JetBrains Mono + Source Serif 4) →
assets del forge → Event Card → pills → diff → suscripción de canales → deploy.
