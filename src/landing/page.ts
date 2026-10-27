export const LANDING_HTML = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sentinela · NOC Regulatorio &amp; Observabilidad Legal en Tiempo Real</title>
  <meta name="description" content="Observabilidad regulatoria autónoma en tiempo real: DOF, SAT, CONDUSEF, CNBV, Banxico y STPS clasificados por severidad de impacto con IA y despachados vía Webhooks firmados HMAC-SHA256." />
  <link rel="canonical" href="https://sentinela.substrateholdingsai.workers.dev/" />
  <meta name="theme-color" content="#070A11" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg" />
  <link rel="icon" type="image/x-icon" href="/assets/seo/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/seo/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/seo/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/seo/apple-touch-icon.png" />

  <!-- Open Graph / Social -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Sentinela · NOC Regulatorio" />
  <meta property="og:title" content="Sentinela · El Oráculo de Observabilidad Regulatoria y Fiscal" />
  <meta property="og:description" content="Monitoreo diario autónomo del DOF, SAT, CONDUSEF, CNBV, Banxico y STPS. Alertas clasificadas por severidad e impacto legal con IA y Webhooks B2B." />
  <meta property="og:url" content="https://sentinela.substrateholdingsai.workers.dev/" />
  <meta property="og:image" content="https://sentinela.substrateholdingsai.workers.dev/assets/seo/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Sentinela · NOC Regulatorio B2B" />
  <meta name="twitter:description" content="Observabilidad normativa en tiempo real: DOF, Banxico, CNBV, SAT y STPS." />
  <meta name="twitter:image" content="https://sentinela.substrateholdingsai.workers.dev/assets/seo/twitter-card.png" />

  <!-- Fonts: Inter, Source Serif 4, JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet" />

  <style>
    /* ==========================================================================
       SENTINELA DESIGN SYSTEM v1.0 · TOKENS OFICIALES
       Principio: "El color es significado, nunca decoración."
       ========================================================================== */
    :root, [data-theme="dark"] {
      --bg-canvas: #070A11;
      --bg-surface: #0F172A;
      --bg-surface-2: #16203A;
      --border-line: #1E293B;
      --border-strong: #334155;
      --text-1: #F8FAFC;
      --text-2: #94A3B8;
      --text-3: #64748B;
      --signal: #22D3EE;

      /* Severidad (Base + Texto por tema) */
      --sev-critical: #E11D48;
      --sev-critical-text: #FB7185;
      --sev-high: #F97316;
      --sev-high-text: #FBBF24;
      --sev-medium: #06B6D4;
      --sev-medium-text: #22D3EE;
      --sev-low: #64748B;
      --sev-low-text: #94A3B8;

      /* Canales Temáticos */
      --ch-fiscal: #10B981;
      --ch-fiscal-text: #34D399;
      --ch-cobranza: #3B82F6;
      --ch-cobranza-text: #60A5FA;
      --ch-fintech: #8B5CF6;
      --ch-fintech-text: #A78BFA;
      --ch-laboral: #F59E0B;
      --ch-laboral-text: #FBBF24;

      --reticle-opacity: 1;
      --header-bg: rgba(7, 10, 17, 0.86);
    }

    [data-theme="light"] {
      --bg-canvas: #F8FAFC;
      --bg-surface: #FFFFFF;
      --bg-surface-2: #F1F5F9;
      --border-line: #E2E8F0;
      --border-strong: #CBD5E1;
      --text-1: #0F172A;
      --text-2: #475569;
      --text-3: #64748B;
      --signal: #0E7490;

      --sev-critical: #E11D48;
      --sev-critical-text: #BE123C;
      --sev-high: #F97316;
      --sev-high-text: #C2410C;
      --sev-medium: #06B6D4;
      --sev-medium-text: #0E7490;
      --sev-low: #64748B;
      --sev-low-text: #475569;

      --ch-fiscal: #10B981;
      --ch-fiscal-text: #047857;
      --ch-cobranza: #3B82F6;
      --ch-cobranza-text: #1D4ED8;
      --ch-fintech: #8B5CF6;
      --ch-fintech-text: #6D28D9;
      --ch-laboral: #F59E0B;
      --ch-laboral-text: #B45309;

      --reticle-opacity: 0.08;
      --header-bg: rgba(248, 250, 252, 0.90);
    }

    :root {
      --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      --font-legal: 'Source Serif 4', Georgia, serif;
      --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      background-color: var(--bg-canvas);
      color: var(--text-1);
      font-family: var(--font-ui);
      font-size: 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    body {
      background-color: var(--bg-canvas);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M0 0.5H48M0.5 0V48' stroke='%230D1420' stroke-width='1'/%3E%3Cpath d='M24 18v12M18 24h12' stroke='%231B2536' stroke-width='1'/%3E%3C/svg%3E");
      min-height: 100vh;
      overflow-x: hidden;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    [data-theme="light"] body {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M0 0.5H48M0.5 0V48' stroke='%23E2E8F0' stroke-width='1'/%3E%3Cpath d='M24 18v12M18 24h12' stroke='%23CBD5E1' stroke-width='1'/%3E%3C/svg%3E");
    }

    /* Foco estricto sin tono: blanco fantasma en dark, tinta en light */
    a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
      outline: 2px solid var(--text-1);
      outline-offset: 2px;
    }

    .container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ==========================================================================
       TOP COMMAND BAR (NOC NAVBAR)
       ========================================================================== */
    .noc-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--header-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-line);
    }

    .noc-header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 68px;
      gap: 16px;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-1);
    }

    .brand-symbol {
      width: 34px;
      height: 34px;
      color: var(--signal);
      flex-shrink: 0;
    }

    .brand-wordmark {
      display: flex;
      flex-direction: column;
    }

    .brand-wordmark__title {
      font: 700 18px/1 var(--font-ui);
      letter-spacing: 0.14em;
      color: var(--text-1);
    }

    .brand-wordmark__sub {
      font: 400 10px/1 var(--font-mono);
      letter-spacing: 0.18em;
      color: var(--text-2);
      margin-top: 4px;
    }

    .noc-nav {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .noc-nav a {
      font: 500 13.5px var(--font-ui);
      color: var(--text-2);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .noc-nav a:hover {
      color: var(--text-1);
    }

    .noc-header__actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-ticker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 28px;
      padding: 0 10px;
      border-radius: 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      font: 400 11px var(--font-mono);
      color: var(--text-2);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--ch-fiscal-text);
      animation: sentinela-pulse 1.6s ease-in-out infinite;
    }

    /* Botones por Luminancia (Cero decoración cromática) */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font: 500 12px/1 var(--font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--bg-surface);
      color: var(--text-1);
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    }

    .btn:hover {
      background: var(--bg-surface-2);
      border-color: var(--text-2);
    }

    .btn--primary {
      background: var(--text-1);
      color: var(--bg-canvas);
      border-color: var(--text-1);
      font-weight: 600;
    }

    .btn--primary:hover {
      background: var(--text-2);
      border-color: var(--text-2);
      color: var(--bg-canvas);
    }

    .btn--sm {
      padding: 7px 10px;
      font-size: 11px;
    }

    /* ==========================================================================
       HERO SECTION · 3D SENTINELA CORE + PROPUESTA DE VALOR
       ========================================================================== */
    .hero {
      padding: 56px 0 64px;
      border-bottom: 1px solid var(--border-line);
      position: relative;
    }

    .hero__grid {
      display: grid;
      grid-template-columns: 1.08fr 0.92fr;
      gap: 40px;
      align-items: center;
    }

    .hero__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 5px 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      border-radius: 999px;
      font: 500 11px var(--font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-2);
      margin-bottom: 20px;
    }

    .hero__title {
      font: 700 44px/1.12 var(--font-ui);
      letter-spacing: -0.02em;
      color: var(--text-1);
      margin-bottom: 20px;
    }

    .hero__subtitle {
      font: 400 17px/1.6 var(--font-ui);
      color: var(--text-2);
      margin-bottom: 28px;
      max-width: 580px;
    }

    .hero__subtitle strong {
      color: var(--text-1);
      font-weight: 600;
    }

    .hero__ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 32px;
    }

    .hero__metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid var(--border-line);
    }

    .metric-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      border-radius: 8px;
      padding: 12px 14px;
    }

    .metric-box__val {
      font: 600 20px/1.2 var(--font-mono);
      color: var(--text-1);
    }

    .metric-box__label {
      font: 400 12px/1.4 var(--font-mono);
      color: var(--text-3);
      margin-top: 4px;
    }

    /* 3D Viewport Frame (NOC Radar Console) */
    .viewport-3d {
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      border-radius: 8px;
      height: 500px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Esquinas de mira táctica */
    .viewport-3d::before, .viewport-3d::after {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      border-color: var(--signal);
      border-style: solid;
      pointer-events: none;
      z-index: 10;
    }
    .viewport-3d::before {
      top: 10px;
      left: 10px;
      border-width: 2px 0 0 2px;
    }
    .viewport-3d::after {
      bottom: 10px;
      right: 10px;
      border-width: 0 2px 2px 0;
    }

    .viewport-3d__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border-line);
      background: var(--bg-canvas);
      font: 400 11px var(--font-mono);
      color: var(--text-3);
      z-index: 5;
    }

    .viewport-3d__canvas-wrap {
      position: relative;
      flex: 1;
      width: 100%;
      height: 100%;
      cursor: grab;
      background: radial-gradient(circle at 50% 50%, rgba(22, 32, 58, 0.55) 0%, rgba(7, 10, 17, 0.95) 85%);
    }

    .viewport-3d__canvas-wrap:active {
      cursor: grabbing;
    }

    #sentinela-3d-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* HUD Flotante sobre el 3D */
    .hud-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .hud-telemetry {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .hud-tag {
      background: rgba(7, 10, 17, 0.82);
      border: 1px solid var(--border-line);
      border-radius: 6px;
      padding: 6px 10px;
      font: 400 11px/1.4 var(--font-mono);
      color: var(--text-2);
      backdrop-filter: blur(6px);
    }

    .hud-live-alert {
      background: rgba(15, 23, 42, 0.90);
      border: 1px solid var(--border-strong);
      border-left: 3px solid var(--sev-critical);
      border-radius: 6px;
      padding: 10px 12px;
      max-width: 100%;
      backdrop-filter: blur(8px);
      transition: border-left-color 0.25s ease;
    }

    .hud-live-alert__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .hud-live-alert__title {
      font: 600 13px/1.3 var(--font-ui);
      color: #F8FAFC;
    }

    .hud-live-alert__meta {
      font: 400 11px var(--font-mono);
      color: #94A3B8;
      margin-top: 3px;
    }

    .viewport-3d__controls {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 12px;
      background: var(--bg-canvas);
      border-top: 1px solid var(--border-line);
      z-index: 5;
    }

    .sim-btn {
      flex: 1;
      min-width: 110px;
      padding: 7px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-line);
      background: var(--bg-surface);
      color: var(--text-2);
      font: 500 10.5px var(--font-mono);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }

    .sim-btn:hover, .sim-btn.active {
      background: var(--bg-surface-2);
      color: var(--text-1);
      border-color: var(--border-strong);
    }

    .sim-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    /* ==========================================================================
       COMPONENTES OFICIALES DEL DESIGN SYSTEM (Sección 4)
       ========================================================================== */
    /* 4.2 · Severity Pill */
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 20px;
      padding: 0 8px;
      border-radius: 999px;
      font: 500 11px/1 var(--font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--sev-text);
      background: color-mix(in srgb, var(--sev) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--sev) 35%, transparent);
    }
    .pill::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--sev-text);
    }
    .pill--active.pill--critical::before {
      animation: sentinela-pulse 1.6s ease-in-out infinite;
    }
    @keyframes sentinela-pulse {
      50% { opacity: 0.25; }
    }
    @media (prefers-reduced-motion: reduce) {
      .pill::before, .status-dot { animation: none; }
    }

    .sev-critical { --sev: var(--sev-critical); --sev-text: var(--sev-critical-text); }
    .sev-high     { --sev: var(--sev-high);     --sev-text: var(--sev-high-text); }
    .sev-medium   { --sev: var(--sev-medium);   --sev-text: var(--sev-medium-text); }
    .sev-low      { --sev: var(--sev-low);      --sev-text: var(--sev-low-text); }

    /* Channel Badge (Siempre a la izquierda por Regla Anti-colisión) */
    .channel-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 22px;
      padding: 0 9px;
      border-radius: 6px;
      font: 500 11px/1 var(--font-mono);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ch-text);
      background: color-mix(in srgb, var(--ch) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--ch) 30%, transparent);
    }
    .channel-badge svg {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .ch-fiscal   { --ch: var(--ch-fiscal);   --ch-text: var(--ch-fiscal-text); }
    .ch-cobranza { --ch: var(--ch-cobranza); --ch-text: var(--ch-cobranza-text); }
    .ch-fintech  { --ch: var(--ch-fintech);  --ch-text: var(--ch-fintech-text); }
    .ch-laboral  { --ch: var(--ch-laboral);  --ch-text: var(--ch-laboral-text); }

    /* 4.1 · Regulatory Event Card */
    .event-card {
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      border-radius: 8px;
      border-left: 3px solid var(--sev);
      padding: 18px 18px 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .event-card:hover {
      border-color: var(--border-strong);
      border-left-color: var(--sev);
      background: var(--bg-surface-2);
    }
    .event-card__head {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .event-card__time {
      margin-left: auto;
      font: 400 12px var(--font-mono);
      color: var(--text-3);
    }
    .event-card__title {
      font: 600 17px/1.35 var(--font-ui);
      letter-spacing: -0.01em;
      color: var(--text-1);
    }
    .event-card__excerpt {
      font: 400 14px/1.6 var(--font-ui);
      color: var(--text-2);
    }
    .event-card__excerpt blockquote.decreto {
      font-family: var(--font-legal);
      font-size: 14.5px;
      line-height: 1.55;
      color: var(--text-1);
      padding: 8px 12px;
      margin-top: 8px;
      border-left: 2px solid var(--border-strong);
      background: color-mix(in srgb, var(--bg-canvas) 45%, transparent);
      border-radius: 0 6px 6px 0;
    }
    .event-card__meta {
      font: 400 12px/1.5 var(--font-mono);
      color: var(--text-3);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding-top: 6px;
      border-top: 1px solid var(--border-line);
    }
    .event-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 4px;
    }
    .btn-decreto {
      font: 500 12px var(--font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-1);
      background: transparent;
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      padding: 7px 12px;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-decreto:hover {
      background: var(--bg-surface);
      border-color: var(--text-2);
    }

    /* 4.3 · Diff Highlighter (adicionado / reformado / derogado) */
    .diff-stack {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }
    .diff {
      font: 400 13px/1.6 var(--font-mono);
      padding: 8px 12px 8px 14px;
      border-left: 2px solid var(--d);
      background: color-mix(in srgb, var(--d) 8%, transparent);
      border-radius: 0 6px 6px 0;
      color: var(--text-1);
    }
    .diff::before {
      font-weight: 600;
      margin-right: 8px;
      color: var(--d);
    }
    .diff--adicionado { --d: #06B6D4; }
    .diff--adicionado::before { content: "+ [ADICIONADO]"; }
    .diff--reformado  { --d: #F97316; }
    .diff--reformado::before  { content: "± [REFORMADO]"; }
    .diff--derogado   { --d: #E11D48; }
    .diff--derogado::before   { content: "− [DEROGADO]"; }
    .diff--derogado .diff__text {
      text-decoration: line-through;
      opacity: 0.65;
    }

    /* ==========================================================================
       SECCIONES GENERALES
       ========================================================================== */
    .section {
      padding: 72px 0;
      border-bottom: 1px solid var(--border-line);
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 36px;
    }

    .section-kicker {
      font: 500 12px var(--font-mono);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-3);
      margin-bottom: 8px;
    }

    .section-title {
      font: 700 32px/1.2 var(--font-ui);
      letter-spacing: -0.02em;
      color: var(--text-1);
    }

    .section-desc {
      font: 400 16px/1.6 var(--font-ui);
      color: var(--text-2);
      max-width: 600px;
      margin-top: 8px;
    }

    /* Filter Tabs */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
    }

    .filter-tab {
      font: 500 12px var(--font-mono);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--border-line);
      background: var(--bg-surface);
      color: var(--text-2);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .filter-tab:hover, .filter-tab.active {
      background: var(--bg-surface-2);
      color: var(--text-1);
      border-color: var(--text-2);
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    /* Canales Grid */
    .channels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .channel-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      border-top: 3px solid var(--ch);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .channel-card:hover {
      background: var(--bg-surface-2);
      border-color: var(--border-strong);
      border-top-color: var(--ch);
    }

    .channel-card__title {
      font: 600 17px var(--font-ui);
      color: var(--text-1);
    }

    .channel-card__list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font: 400 13.5px var(--font-ui);
      color: var(--text-2);
    }

    .channel-card__list li::before {
      content: "→ ";
      font-family: var(--font-mono);
      color: var(--text-3);
    }

    /* Webhook & Arquitectura B2B */
    .webhook-showcase {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 28px;
      align-items: stretch;
    }

    .code-panel {
      background: #070A11;
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .code-panel__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #0F172A;
      border-bottom: 1px solid #1E293B;
      font: 500 11.5px var(--font-mono);
      color: #94A3B8;
    }

    .code-panel__body {
      padding: 16px;
      font: 400 12.5px/1.65 var(--font-mono);
      color: #F8FAFC;
      overflow-x: auto;
      white-space: pre;
    }

    /* Pricing / Licenciamiento B2B */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .price-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-line);
      border-radius: 8px;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 24px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .price-card--featured {
      border-color: var(--text-1);
      background: var(--bg-surface-2);
    }

    .price-card__tier {
      font: 600 12px var(--font-mono);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-2);
    }

    .price-card__name {
      font: 700 22px var(--font-ui);
      color: var(--text-1);
      margin-top: 6px;
    }

    .price-card__desc {
      font: 400 14px/1.55 var(--font-ui);
      color: var(--text-2);
      margin-top: 8px;
    }

    .price-card__features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font: 400 13.5px var(--font-ui);
      color: var(--text-1);
      padding-top: 18px;
      border-top: 1px solid var(--border-line);
    }

    .price-card__features li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .price-card__features li span.check {
      font-family: var(--font-mono);
      color: var(--ch-fiscal-text);
      font-weight: 600;
    }

    /* Contact & Lead Form (pavel@arksystems.site) */
    .contact-box {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 32px;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      padding: 36px;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font: 500 12px var(--font-mono);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-2);
    }

    .field-input, .field-select, .field-textarea {
      background: var(--bg-canvas);
      border: 1px solid var(--border-line);
      border-radius: 6px;
      padding: 11px 14px;
      color: var(--text-1);
      font: 400 14px var(--font-ui);
      transition: border-color 0.15s ease;
    }

    .field-input:hover, .field-select:hover, .field-textarea:hover {
      border-color: var(--border-strong);
    }

    .channel-checks {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .channel-check-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      background: var(--bg-canvas);
      border: 1px solid var(--border-line);
      border-radius: 6px;
      font: 500 12px var(--font-mono);
      color: var(--text-1);
      cursor: pointer;
    }

    .channel-check-label:hover {
      border-color: var(--border-strong);
    }

    .direct-mail-banner {
      margin-top: 20px;
      padding: 16px;
      background: var(--bg-canvas);
      border: 1px solid var(--border-line);
      border-left: 3px solid var(--signal);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .direct-mail-banner__email {
      font: 600 16px var(--font-mono);
      color: var(--text-1);
      text-decoration: none;
    }

    .direct-mail-banner__email:hover {
      text-decoration: underline;
    }

    /* Footer */
    .noc-footer {
      padding: 40px 0;
      font: 400 12.5px var(--font-mono);
      color: var(--text-3);
    }

    .noc-footer__inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    @media (max-width: 980px) {
      .hero__grid, .events-grid, .webhook-showcase, .pricing-grid, .contact-box {
        grid-template-columns: 1fr;
      }
      .channels-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .hero__title {
        font-size: 34px;
      }
      .noc-nav {
        display: none;
      }
    }

    @media (max-width: 600px) {
      .channels-grid, .hero__metrics, .channel-checks {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- ========================================================================
       1. TOP COMMAND BAR (NOC HEADER)
       ======================================================================== -->
  <header class="noc-header">
    <div class="container noc-header__inner">
      <a href="#" class="brand-link" aria-label="Sentinela Inicio">
        <svg class="brand-symbol" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="256,48 436,152 436,360 256,464 76,360 76,152" fill="none" stroke="currentColor" stroke-width="32" stroke-linejoin="round"/>
          <circle cx="256" cy="256" r="96" fill="none" stroke="currentColor" stroke-width="32"/>
          <circle cx="256" cy="256" r="40" fill="currentColor"/>
          <line x1="256" y1="88" x2="256" y2="132" stroke="currentColor" stroke-width="32" stroke-linecap="round"/>
          <line x1="256" y1="380" x2="256" y2="424" stroke="currentColor" stroke-width="32" stroke-linecap="round"/>
          <line x1="100" y1="256" x2="144" y2="256" stroke="currentColor" stroke-width="32" stroke-linecap="round"/>
          <line x1="368" y1="256" x2="412" y2="256" stroke="currentColor" stroke-width="32" stroke-linecap="round"/>
        </svg>
        <div class="brand-wordmark">
          <span class="brand-wordmark__title">SENTINELA</span>
          <span class="brand-wordmark__sub">NOC REGULATORIO</span>
        </div>
      </a>

      <nav class="noc-nav" aria-label="Navegación principal">
        <a href="#expedientes">Expedientes en Vivo</a>
        <a href="#canales">Canales Oficiales</a>
        <a href="#webhooks">API &amp; Webhooks</a>
        <a href="#planes">Licencias B2B</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <div class="noc-header__actions">
        <div class="status-ticker" title="Estado del motor en Cloudflare Edge">
          <span class="status-dot"></span>
          <span>RADAR ACTIVO · DOF/SAT</span>
        </div>
        <button type="button" class="btn btn--sm" id="theme-toggle" title="Alternar modo NOC Dark / Reporte Light">
          TEMA: DARK
        </button>
        <a href="#contacto" class="btn btn--primary btn--sm">Contratar</a>
      </div>
    </div>
  </header>

  <!-- ========================================================================
       2. HERO SECTION + MOTOR 3D INTERACTIVO SENTINELA
       ======================================================================== -->
  <section class="hero">
    <div class="container hero__grid">
      <div>
        <div class="hero__eyebrow">
          <span>ORÁCULO REGTECH AUTÓNOMO</span>
          <span>·</span>
          <span>MÉXICO &amp; LATAM</span>
        </div>
        <h1 class="hero__title">
          La ley cambia hoy en el DOF.<br />
          ¿Tu operación se entera en segundos o tras la primera sanción?
        </h1>
        <p class="hero__subtitle">
          <strong>Sentinela</strong> vigila el Diario Oficial de la Federación, SAT, CONDUSEF, CNBV, Banxico y STPS en tiempo real. Filtra el ruido institucional con IA legal, clasifica la <strong>severidad de impacto</strong> y despacha alertas accionables o webhooks firmados directo a tu equipo jurídico y tus sistemas.
        </p>

        <div class="hero__ctas">
          <a href="#contacto" class="btn btn--primary">Solicitar Acceso B2B →</a>
          <a href="mailto:pavel@arksystems.site?subject=Solicitud%20de%20Informaci%C3%B3n%20-%20Sentinela%20NOC%20Regulatorio" class="btn">
            pavel@arksystems.site
          </a>
          <a href="#expedientes" class="btn">Explorar Consola NOC</a>
        </div>

        <div class="hero__metrics">
          <div class="metric-box">
            <div class="metric-box__val">07:30 &amp; 18:30</div>
            <div class="metric-box__label">Barrido matutino y vespertino DOF/SAT</div>
          </div>
          <div class="metric-box">
            <div class="metric-box__val">HMAC-SHA256</div>
            <div class="metric-box__label">Webhooks firmados con folio y hash</div>
          </div>
          <div class="metric-box">
            <div class="metric-box__val">&lt; 15 seg</div>
            <div class="metric-box__label">Análisis de impacto con Llama-3.3-70B</div>
          </div>
        </div>
      </div>

      <!-- VISOR 3D INTERACTIVO (OJO DE LA LEY / PRISMA SENTINELA) -->
      <div class="viewport-3d" aria-label="Simulador 3D del núcleo regulatorio Sentinela">
        <div class="viewport-3d__topbar">
          <span>CORE 3D · PRISMA SENTINELA v1.0</span>
          <span id="hud-coords">AZIMUTH: 0.0° · FREQ: 60Hz</span>
        </div>

        <div class="viewport-3d__canvas-wrap" id="canvas-container">
          <canvas id="sentinela-3d-canvas"></canvas>

          <div class="hud-overlay">
            <div class="hud-telemetry">
              <div class="hud-tag">
                <div>FUENTES: <strong>DOF · SAT · CNBV · CONDUSEF</strong></div>
                <div id="hud-mode-label">ESTADO: ESCANEO MULTICANAL ACTIVO</div>
              </div>
              <span class="pill pill--active pill--critical sev-critical" id="hud-sev-pill">CRITICAL</span>
            </div>

            <div class="hud-live-alert" id="hud-alert-box">
              <div class="hud-live-alert__head">
                <span class="channel-badge ch-cobranza" id="hud-channel-badge">COBRANZA · CONDUSEF</span>
                <span style="font: 400 11px var(--font-mono); color: #94A3B8;" id="hud-folio">DOF-2026-X891</span>
              </div>
              <div class="hud-live-alert__title" id="hud-title">
                Reforma al Art. 284 Bis CPF y Disposiciones REDECO: Ventana Horaria de Cobranza
              </div>
              <div class="hud-live-alert__meta" id="hud-meta">
                ENTRADA EN VIGOR: 2026-11-01 · ACCIÓN: AJUSTAR MOTOR DE ENVÍOS A 08:00–20:00 HRS
              </div>
            </div>
          </div>
        </div>

        <div class="viewport-3d__controls" role="group" aria-label="Simular impactos normativos en el núcleo 3D">
          <button type="button" class="sim-btn active" data-sim="critical">
            <span class="sim-dot" style="background:#E11D48"></span>
            CP 284 Bis (Critical)
          </button>
          <button type="button" class="sim-btn" data-sim="high">
            <span class="sim-dot" style="background:#F97316"></span>
            RMF SAT (High)
          </button>
          <button type="button" class="sim-btn" data-sim="medium">
            <span class="sim-dot" style="background:#06B6D4"></span>
            Circular CNBV (Med)
          </button>
          <button type="button" class="sim-btn" data-sim="low">
            <span class="sim-dot" style="background:#64748B"></span>
            Radar Normal
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       3. EXPEDIENTES EN VIVO · REGULATORY EVENT CARDS & DIFF LEGAL
       ======================================================================== -->
  <section class="section" id="expedientes">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">01 · CONSOLA DE OBSERVABILIDAD</div>
          <h2 class="section-title">Señales accionables, nunca resúmenes ambiguos</h2>
          <p class="section-desc">
            Cada evento regulatorio incluye su canal temático, severidad de impacto, cita textual del decreto, comparativa de artículos reformados/derogados y folio verificable.
          </p>
        </div>

        <div class="filter-bar" role="tablist" aria-label="Filtrar eventos por canal">
          <button type="button" class="filter-tab active" data-filter="all">Todos (4)</button>
          <button type="button" class="filter-tab" data-filter="cobranza">Cobranza</button>
          <button type="button" class="filter-tab" data-filter="fiscal">Fiscal</button>
          <button type="button" class="filter-tab" data-filter="fintech">Fintech &amp; Banca</button>
          <button type="button" class="filter-tab" data-filter="laboral">Laboral</button>
        </div>
      </div>

      <div class="events-grid" id="events-container">

        <!-- CARD 1: COBRANZA + CRITICAL -->
        <article class="event-card sev-critical" data-channel="cobranza">
          <div class="event-card__head">
            <span class="channel-badge ch-cobranza">
              <svg viewBox="0 0 24 24"><path d="M12 2.8 19.5 6v6.2c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z"/><path d="M8 12h2l1.5-3 2 5 1.5-2h1"/></svg>
              cobranza
            </span>
            <span class="pill pill--active pill--critical sev-critical">CRITICAL</span>
            <span class="event-card__time">DOF MATUTINO · 07:31 CDMX</span>
          </div>

          <h3 class="event-card__title">
            Decreto por el que se reforman las Disposiciones Generales de REDECO CONDUSEF y lineamientos del Art. 284 Bis CPF
          </h3>

          <div class="event-card__excerpt">
            Se reduce el horario permitido para gestiones de cobranza extrajudicial telefónica y por mensajería electrónica, imponiendo multas directas por contacto fuera de ventana.
            <blockquote class="decreto">
              «Queda estrictamente prohibido realizar requerimientos de cobro o notificaciones por cualquier medio entre las 20:01 y las 07:59 horas del día siguiente.»
            </blockquote>
          </div>

          <div class="diff-stack">
            <div class="diff diff--derogado">
              <span class="diff__text">Ventana horaria permitida de 07:00 a 22:00 horas en días hábiles.</span>
            </div>
            <div class="diff diff--reformado">
              <span class="diff__text">Nueva ventana obligatoria de 08:00 a 20:00 horas (Lunes a Viernes).</span>
            </div>
          </div>

          <div class="event-card__meta">
            <span>FUENTE: DOF / CONDUSEF</span>
            <span>FOLIO: DOF-2026-1026-01</span>
            <span>VIGENCIA: 2026-11-01</span>
            <span>sha256:9f2c8b41e0a7…</span>
          </div>

          <div class="event-card__footer">
            <a href="https://www.dof.gob.mx" target="_blank" rel="noopener" class="btn-decreto">Ver Decreto Oficial ↗</a>
            <a href="#contacto" class="btn-decreto">Suscribir Canal Cobranza</a>
          </div>
        </article>

        <!-- CARD 2: FISCAL + HIGH -->
        <article class="event-card sev-high" data-channel="fiscal">
          <div class="event-card__head">
            <span class="channel-badge ch-fiscal">
              <svg viewBox="0 0 24 24"><path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/><circle cx="10.2" cy="12.2" r="1.5"/><circle cx="13.8" cy="16.8" r="1.5"/><path d="M14.6 10.6 9.4 18.4"/></svg>
              fiscal
            </span>
            <span class="pill sev-high">HIGH</span>
            <span class="event-card__time">PORTAL SAT · 08:15 CDMX</span>
          </div>

          <h3 class="event-card__title">
            Octava Resolución de Modificaciones a la Resolución Miscelánea Fiscal y Anexo 20 (Complemento de Pagos CFDI 4.0)
          </h3>

          <div class="event-card__excerpt">
            El SAT actualiza las reglas de validación para la emisión del Complemento de Recepción de Pagos (REP 2.0) y acorta el plazo de cancelación sin aceptación del receptor.
            <blockquote class="decreto">
              «Los contribuyentes deberán emitir el CFDI con complemento para recepción de pagos a más tardar al quinto día natural del mes inmediato siguiente al que corresponda el pago.»
            </blockquote>
          </div>

          <div class="diff-stack">
            <div class="diff diff--adicionado">
              <span class="diff__text">Regla 2.7.1.32: Validación cruzada automática de RFC en lista 69-B previo al timbrado de notas de crédito.</span>
            </div>
          </div>

          <div class="event-card__meta">
            <span>FUENTE: SAT / RMF</span>
            <span>FOLIO: SAT-RMF-2026-08</span>
            <span>VIGENCIA: 2026-11-15</span>
            <span>sha256:4a17d930c812…</span>
          </div>

          <div class="event-card__footer">
            <a href="https://www.sat.gob.mx" target="_blank" rel="noopener" class="btn-decreto">Ver Decreto Oficial ↗</a>
            <a href="#contacto" class="btn-decreto">Suscribir Canal Fiscal</a>
          </div>
        </article>

        <!-- CARD 3: FINTECH & BANCA + MEDIUM -->
        <article class="event-card sev-medium" data-channel="fintech">
          <div class="event-card__head">
            <span class="channel-badge ch-fintech">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="4.6" r="1.8"/><circle cx="4.9" cy="16.6" r="1.8"/><circle cx="19.1" cy="16.6" r="1.8"/><path d="M12 10.1V6.4M10.4 13 6.4 15.6M13.6 13l4 2.6"/></svg>
              fintech_banca
            </span>
            <span class="pill sev-medium">MEDIUM</span>
            <span class="event-card__time">DOF VESPERTINO · 18:32 CDMX</span>
          </div>

          <h3 class="event-card__title">
            Circular CNBV / Banxico sobre umbrales de reporte PLD y monitoreo de transferencias SPEI en ITF
          </h3>

          <div class="event-card__excerpt">
            Actualización de criterios de debida diligencia reforzada en Instituciones de Tecnología Financiera y transmisores de dinero conforme al Art. 58 de la Ley Fintech.
          </div>

          <div class="diff-stack">
            <div class="diff diff--adicionado">
              <span class="diff__text">Obligación de conservar huella criptográfica del expediente KYC digital por 10 años.</span>
            </div>
          </div>

          <div class="event-card__meta">
            <span>FUENTE: CNBV / BANXICO</span>
            <span>FOLIO: CIRC-CNBV-14-2026</span>
            <span>VIGENCIA: 2026-12-01</span>
            <span>sha256:7e89b551f304…</span>
          </div>

          <div class="event-card__footer">
            <a href="https://www.dof.gob.mx" target="_blank" rel="noopener" class="btn-decreto">Ver Decreto Oficial ↗</a>
            <a href="#contacto" class="btn-decreto">Suscribir Canal Fintech</a>
          </div>
        </article>

        <!-- CARD 4: LABORAL + HIGH -->
        <article class="event-card sev-high" data-channel="laboral">
          <div class="event-card__head">
            <span class="channel-badge ch-laboral">
              <svg viewBox="0 0 24 24"><rect x="3.5" y="7.5" width="17" height="12.5" rx="2"/><path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3.5 12.5h17M12 11.5v2"/></svg>
              laboral
            </span>
            <span class="pill sev-high">HIGH</span>
            <span class="event-card__time">STPS / DOF · 07:40 CDMX</span>
          </div>

          <h3 class="event-card__title">
            Acuerdo STPS / IMSS sobre actualización de tabuladores de cuotas patronales y protocolo de inspección REPSE
          </h3>

          <div class="event-card__excerpt">
            Nuevos requisitos documentales en el portal ICSOE y SISUB para empresas de servicios especializados, con cruce automático ante el IMSS e INFONAVIT.
          </div>

          <div class="diff-stack">
            <div class="diff diff--reformado">
              <span class="diff__text">Plazo de solventación de requerimientos de inspección extraordinaria reducido de 5 a 3 días hábiles.</span>
            </div>
          </div>

          <div class="event-card__meta">
            <span>FUENTE: STPS / IMSS</span>
            <span>FOLIO: STPS-REPSE-2026-04</span>
            <span>VIGENCIA: 2026-11-10</span>
            <span>sha256:c105a988d21e…</span>
          </div>

          <div class="event-card__footer">
            <a href="https://www.dof.gob.mx" target="_blank" rel="noopener" class="btn-decreto">Ver Decreto Oficial ↗</a>
            <a href="#contacto" class="btn-decreto">Suscribir Canal Laboral</a>
          </div>
        </article>

      </div>
    </div>
  </section>

  <!-- ========================================================================
       4. LOS 4 CANALES DE INTELIGENCIA REGULATORIA
       ======================================================================== -->
  <section class="section" id="canales">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">02 · COBERTURA ESPECIALIZADA</div>
          <h2 class="section-title">Cuatro canales temáticos libres de ruido</h2>
          <p class="section-desc">
            Tu empresa elige únicamente las materias que impactan su operación. Sentinela descarta el 94% de publicaciones irrelevantes del DOF y entrega solo lo que exige acción.
          </p>
        </div>
      </div>

      <div class="channels-grid">
        <div class="channel-card ch-fiscal">
          <span class="channel-badge ch-fiscal" style="align-self:flex-start;">
            <svg viewBox="0 0 24 24"><path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/><circle cx="10.2" cy="12.2" r="1.5"/><circle cx="13.8" cy="16.8" r="1.5"/><path d="M14.6 10.6 9.4 18.4"/></svg>
            CANAL FISCAL
          </span>
          <h3 class="channel-card__title">SAT, Impuestos y CFDI</h3>
          <ul class="channel-card__list">
            <li>Resolución Miscelánea Fiscal (RMF) y Anexos</li>
            <li>Complementos CFDI 4.0 y Carta Porte</li>
            <li>Listas definitivas y presuntas Art. 69-B CFF</li>
            <li>Reformas a LISR, LIVA y Código Fiscal</li>
            <li>Criterios no vinculativos y tasas de recargos</li>
          </ul>
        </div>

        <div class="channel-card ch-cobranza">
          <span class="channel-badge ch-cobranza" style="align-self:flex-start;">
            <svg viewBox="0 0 24 24"><path d="M12 2.8 19.5 6v6.2c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z"/><path d="M8 12h2l1.5-3 2 5 1.5-2h1"/></svg>
            CANAL COBRANZA
          </span>
          <h3 class="channel-card__title">CONDUSEF &amp; Marco Penal</h3>
          <ul class="channel-card__list">
            <li>Disposiciones REDECO y despachos de cobranza</li>
            <li>Reformas al Art. 284 Bis del Código Penal Federal</li>
            <li>Norma Oficial Mexicana NOM-184-SCFI</li>
            <li>Horarios permitidos, frecuencias y prohibiciones</li>
            <li>Criterios de PROFECO y protección al consumidor</li>
          </ul>
        </div>

        <div class="channel-card ch-fintech">
          <span class="channel-badge ch-fintech" style="align-self:flex-start;">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="4.6" r="1.8"/><circle cx="4.9" cy="16.6" r="1.8"/><circle cx="19.1" cy="16.6" r="1.8"/><path d="M12 10.1V6.4M10.4 13 6.4 15.6M13.6 13l4 2.6"/></svg>
            CANAL FINTECH &amp; BANCA
          </span>
          <h3 class="channel-card__title">CNBV, Banxico y PLD</h3>
          <ul class="channel-card__list">
            <li>Disposiciones de carácter general CNBV / Ley Fintech</li>
            <li>Circulares de Banco de México (SPEI, CoDi, tasas)</li>
            <li>Prevención de Lavado de Dinero (UIF / LFPIORPI)</li>
            <li>Regulación de SOFOMes, IFPE e IFC</li>
            <li>Requerimientos de ciberseguridad y APIs Open Finance</li>
          </ul>
        </div>

        <div class="channel-card ch-laboral">
          <span class="channel-badge ch-laboral" style="align-self:flex-start;">
            <svg viewBox="0 0 24 24"><rect x="3.5" y="7.5" width="17" height="12.5" rx="2"/><path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3.5 12.5h17M12 11.5v2"/></svg>
            CANAL LABORAL
          </span>
          <h3 class="channel-card__title">STPS, IMSS e INFONAVIT</h3>
          <ul class="channel-card__list">
            <li>Reformas a la Ley Federal del Trabajo (jornadas, primas)</li>
            <li>Lineamientos de subcontratación REPSE / ICSOE</li>
            <li>NOMs de seguridad e higiene (NOM-035, NOM-037)</li>
            <li>Salarios mínimos CONASAMI y UMA</li>
            <li>Cuotas obrero-patronales y criterios del IMSS</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       5. ARQUITECTURA DE WEBHOOKS & API B2B
       ======================================================================== -->
  <section class="section" id="webhooks">
    <div class="container">
      <div class="webhook-showcase">
        <div style="display:flex; flex-direction:column; justify-content:center; gap:20px;">
          <div class="section-kicker">03 · CONEXIÓN MÁQUINA A MÁQUINA</div>
          <h2 class="section-title">Conecta la ley directo a tu software vía Webhook</h2>
          <p class="section-desc">
            Además de alertar a tus abogados y directivos, Sentinela permite que tus sistemas (ERPs, plataformas de cobranza como <strong>Arkangel</strong>, motores de facturación o core bancario) reaccionen solos cuando una norma entra en vigor.
          </p>

          <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
            <div class="metric-box">
              <div style="font:600 13px var(--font-mono); color:var(--text-1);">1. Firma Criptográfica HMAC-SHA256</div>
              <div style="font:400 13.5px var(--font-ui); color:var(--text-2); margin-top:4px;">
                Cada petición incluye el header <code>X-Sentinela-Signature: sha256=...</code> generado con tu llave secreta para garantizar autenticidad absoluta.
              </div>
            </div>
            <div class="metric-box">
              <div style="font:600 13px var(--font-mono); color:var(--text-1);">2. API Histórica RESTful (Edge D1)</div>
              <div style="font:400 13.5px var(--font-ui); color:var(--text-2); margin-top:4px;">
                Consulta el expediente normativo en cualquier momento mediante <code>GET /api/v1/events?channel=fiscal</code> con latencia menor a 20 ms.
              </div>
            </div>
          </div>

          <div style="margin-top:8px;">
            <a href="#contacto" class="btn btn--primary">Solicitar API Key de Prueba →</a>
          </div>
        </div>

        <div class="code-panel">
          <div class="code-panel__head">
            <span>POST https://tu-empresa.com/webhooks/sentinela</span>
            <span class="pill sev-critical">X-Sentinela-Signature: sha256=8f4a2e...</span>
          </div>
          <div class="code-panel__body">{
  "event": "regulatory.update_detected",
  "timestamp": "2026-10-26T13:31:08.000Z",
  "data": {
    "id": "reg_9f2c8b41e0a74d12",
    "channel": "cobranza",
    "source": "Diario Oficial de la Federación",
    "source_url": "https://dof.gob.mx/nota_detalle.php?codigo=5741920",
    "severity": "CRITICAL",
    "title": "Reforma a las Disposiciones Generales de REDECO CONDUSEF",
    "effective_date": "2026-11-01",
    "summary": "Se modifican los horarios permitidos de contacto para cobranza extrajudicial de 07:00-22:00 a 08:00-20:00 hrs de lunes a viernes.",
    "laws_affected": [
      "Disposiciones de Carácter General CONDUSEF 2026",
      "Artículo 284 Bis Código Penal Federal"
    ],
    "action_required": "Ajustar ventana horaria de llamadas y mensajes automáticos antes del 1 de noviembre."
  }
}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       6. LICENCIAMIENTO B2B Y PLANES COMERCIALES
       ======================================================================== -->
  <section class="section" id="planes">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">04 · MODALIDADES DE SUSCRIPCIÓN</div>
          <h2 class="section-title">Planes diseñados para equipos legales y financieros</h2>
          <p class="section-desc">
            Una sola multa evitada del SAT, CONDUSEF o CNBV paga décadas de observabilidad con Sentinela.
          </p>
        </div>
      </div>

      <div class="pricing-grid">
        <!-- Plan 1 -->
        <div class="price-card">
          <div>
            <div class="price-card__tier">NIVEL 01 · DESPACHOS &amp; PYMES</div>
            <div class="price-card__name">Vigilancia Esencial</div>
            <p class="price-card__desc">
              Ideal para despachos contables, firmas jurídicas boutique y empresas que requieren monitoreo puntual en un canal específico.
            </p>
            <ul class="price-card__features" style="margin-top:20px;">
              <li><span class="check">✓</span> <span><strong>1 Canal temático</strong> a elegir (ej. Fiscal o Laboral)</span></li>
              <li><span class="check">✓</span> <span>Resúmenes ejecutivos de impacto con IA (Llama-70B)</span></li>
              <li><span class="check">✓</span> <span>Folio DOF verificable y enlace directo al decreto</span></li>
              <li><span class="check">✓</span> <span>1 Endpoint de Webhook firmado (HMAC-SHA256)</span></li>
              <li><span class="check">✓</span> <span>Acceso de lectura a la API histórica (30 días)</span></li>
            </ul>
          </div>
          <a href="#contacto" class="btn" data-plan="Vigilancia Esencial">Solicitar Cotización →</a>
        </div>

        <!-- Plan 2 -->
        <div class="price-card price-card--featured">
          <div>
            <div class="price-card__tier">NIVEL 02 · FINTECHS, COBRANZA &amp; CORPORATIVOS</div>
            <div class="price-card__name">Oráculo Corporativo</div>
            <p class="price-card__desc">
              Cobertura integral para áreas de Compliance, Dirección Jurídica y motores transaccionales o de cobranza automatizada.
            </p>
            <ul class="price-card__features" style="margin-top:20px;">
              <li><span class="check">✓</span> <span><strong>Los 4 Canales incluidos</strong> (Fiscal, Cobranza, Fintech, Laboral)</span></li>
              <li><span class="check">✓</span> <span>Alertas en tiempo real (edición matutina y vespertina DOF)</span></li>
              <li><span class="check">✓</span> <span>Webhooks ilimitados con firma criptográfica y reintentos</span></li>
              <li><span class="check">✓</span> <span>API Key con 60 req/min y acceso completo al histórico D1</span></li>
              <li><span class="check">✓</span> <span>Integración nativa lista para <strong>Arkangel</strong>, Slack y ERPs</span></li>
            </ul>
          </div>
          <a href="#contacto" class="btn btn--primary" data-plan="Oráculo Corporativo">Activar Prueba B2B →</a>
        </div>

        <!-- Plan 3 -->
        <div class="price-card">
          <div>
            <div class="price-card__tier">NIVEL 03 · BANCA &amp; REGULADOS</div>
            <div class="price-card__name">Soberanía Enterprise</div>
            <p class="price-card__desc">
              Para instituciones financieras, grupos empresariales y plataformas SaaS que desean revender o personalizar reglas normativas.
            </p>
            <ul class="price-card__features" style="margin-top:20px;">
              <li><span class="check">✓</span> <span><strong>Fuentes y palabras clave a medida</strong> (gacetas estatales, NOMs)</span></li>
              <li><span class="check">✓</span> <span>Prompts de auditoría ajustados a las políticas de tu empresa</span></li>
              <li><span class="check">✓</span> <span>Instancia dedicada en Cloudflare Edge y SLA garantizado</span></li>
              <li><span class="check">✓</span> <span>Soporte de ingeniería directo para integración de Webhooks</span></li>
              <li><span class="check">✓</span> <span>Reportes ejecutivos imprimibles en tema Light para Comité</span></li>
            </ul>
          </div>
          <a href="#contacto" class="btn" data-plan="Soberanía Enterprise">Hablar con Arquitectura →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       7. CONTACTO DIRECTO & ACTIVACIÓN DE SUSCRIPCIÓN (pavel@arksystems.site)
       ======================================================================== -->
  <section class="section" id="contacto">
    <div class="container">
      <div class="contact-box">
        <div style="display:flex; flex-direction:column; justify-content:space-between; gap:24px;">
          <div>
            <div class="section-kicker">05 · CONTRATACIÓN Y DEMO TÉCNICA</div>
            <h2 class="section-title">Blinda tu cumplimiento legal hoy mismo</h2>
            <p class="section-desc">
              Configuramos tu suscripción a los canales regulatorios de Sentinela y te entregamos tus credenciales <code>Bearer</code> + <code>webhook_secret</code> en menos de 24 horas.
            </p>

            <div class="direct-mail-banner">
              <span style="font:500 11px var(--font-mono); color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase;">
                ATENCIÓN DIRECTA DE DIRECCIÓN Y ARQUITECTURA:
              </span>
              <a href="mailto:pavel@arksystems.site?subject=Contrataci%C3%B3n%20Sentinela%20RegTech%20B2B" class="direct-mail-banner__email">
                pavel@arksystems.site
              </a>
              <span style="font:400 13px var(--font-ui); color:var(--text-2);">
                Escríbenos directamente o completa el formulario lateral para generar tu orden de alta técnica con los canales seleccionados.
              </span>
              <div style="margin-top:8px; display:flex; gap:8px;">
                <button type="button" class="btn btn--sm" id="copy-email-btn">Copiar correo</button>
                <a href="mailto:pavel@arksystems.site?subject=Solicitud%20Demo%20Sentinela%20RegTech" class="btn btn--sm">Abrir cliente de correo ↗</a>
              </div>
            </div>
          </div>

          <div style="font:400 12px/1.6 var(--font-mono); color:var(--text-3); border-top:1px solid var(--border-line); padding-top:16px;">
            <div>INFRAESTRUCTURA: CLOUDFLARE WORKERS EDGE · D1 · KV · WORKERS AI</div>
            <div>ARQUITECTURA: ARKANGEL COBRANZA EJECUTA · SENTINELA VIGILA LA LEY</div>
          </div>
        </div>

        <!-- Formulario que arma solicitud a pavel@arksystems.site -->
        <form class="form-grid" id="lead-form">
          <div class="field-group">
            <label class="field-label" for="lead-name">Nombre y Cargo</label>
            <input class="field-input" id="lead-name" type="text" required placeholder="Ej. Lic. Roberto Méndez · Director Jurídico / Compliance" />
          </div>

          <div class="field-group">
            <label class="field-label" for="lead-company">Empresa / Despacho / Institución</label>
            <input class="field-input" id="lead-company" type="text" required placeholder="Ej. Financiera CrediNorte S.A.P.I. de C.V." />
          </div>

          <div class="field-group">
            <label class="field-label" for="lead-email">Correo Corporativo</label>
            <input class="field-input" id="lead-email" type="email" required placeholder="tu.nombre@empresa.com" />
          </div>

          <div class="field-group">
            <label class="field-label" for="lead-plan">Plan de Interés</label>
            <select class="field-select" id="lead-plan">
              <option value="Oráculo Corporativo (4 Canales + Webhooks)">Oráculo Corporativo (4 Canales + Webhooks B2B)</option>
              <option value="Vigilancia Esencial (1 Canal)">Vigilancia Esencial (1 Canal Temático)</option>
              <option value="Soberanía Enterprise (Custom / SLA)">Soberanía Enterprise (Reglas a medida / Banca)</option>
            </select>
          </div>

          <div class="field-group">
            <span class="field-label">Canales Temáticos a Monitorear</span>
            <div class="channel-checks">
              <label class="channel-check-label">
                <input type="checkbox" name="channel" value="fiscal" checked />
                <span>FISCAL (SAT/RMF)</span>
              </label>
              <label class="channel-check-label">
                <input type="checkbox" name="channel" value="cobranza" checked />
                <span>COBRANZA (CONDUSEF)</span>
              </label>
              <label class="channel-check-label">
                <input type="checkbox" name="channel" value="fintech_banca" />
                <span>FINTECH / CNBV</span>
              </label>
              <label class="channel-check-label">
                <input type="checkbox" name="channel" value="laboral" />
                <span>LABORAL (STPS/IMSS)</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="lead-notes">Necesidad Específica o Sistema a Conectar (Opcional)</label>
            <textarea class="field-textarea" id="lead-notes" rows="2" placeholder="Ej. Necesitamos recibir alertas por correo y conectar el webhook a nuestro ERP / CRM..."></textarea>
          </div>

          <button type="submit" class="btn btn--primary" style="width:100%; padding:14px;">
            Enviar Solicitud a pavel@arksystems.site →
          </button>
          <div id="form-feedback" style="display:none; font:400 12px var(--font-mono); color:var(--ch-fiscal-text); text-align:center;"></div>
        </form>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       8. FOOTER NOC
       ======================================================================== -->
  <footer class="noc-footer">
    <div class="container noc-footer__inner">
      <div>
        <strong>SENTINELA · NOC REGULATORIO v0.2.0</strong> · SUBSTRATE HOLDINGS AI / ARKSYSTEMS
      </div>
      <div style="display:flex; gap:20px; flex-wrap:wrap;">
        <a href="mailto:pavel@arksystems.site" style="color:var(--text-2); text-decoration:none;">pavel@arksystems.site</a>
        <a href="/health" style="color:var(--text-3); text-decoration:none;">API Status: OK</a>
        <span>DOF · SAT · CONDUSEF · CNBV · BANXICO · STPS</span>
      </div>
    </div>
  </footer>

  <!-- ========================================================================
       MOTOR 3D WEBGL INTERACTIVO (THREE.JS + INTERACTIVIDAD NOC)
       ======================================================================== -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    (function () {
      // 1. Toggle de Tema (Dark NOC / Light Ejecutivo)
      const themeBtn = document.getElementById('theme-toggle');
      const htmlEl = document.documentElement;
      themeBtn.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        themeBtn.textContent = 'TEMA: ' + next.toUpperCase();
      });

      // 2. Filtro de Tarjetas de Eventos Regulatorios
      const filterTabs = document.querySelectorAll('.filter-tab');
      const eventCards = document.querySelectorAll('.event-card');
      filterTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          filterTabs.forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          const filter = tab.getAttribute('data-filter');
          eventCards.forEach((card) => {
            if (filter === 'all' || card.getAttribute('data-channel') === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });

      // 3. Selección rápida de plan hacia formulario
      document.querySelectorAll('[data-plan]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const planName = btn.getAttribute('data-plan');
          const sel = document.getElementById('lead-plan');
          if (sel && planName) {
            for (let i = 0; i < sel.options.length; i++) {
              if (sel.options[i].value.includes(planName)) {
                sel.selectedIndex = i;
                break;
              }
            }
          }
        });
      });

      // 4. Copiar correo pavel@arksystems.site
      const copyBtn = document.getElementById('copy-email-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText('pavel@arksystems.site');
            copyBtn.textContent = '✓ COPIADO: pavel@arksystems.site';
            setTimeout(() => { copyBtn.textContent = 'COPIAR CORREO'; }, 2500);
          } catch (_) {
            window.location.href = 'mailto:pavel@arksystems.site';
          }
        });
      }

      // 5. Envío de Formulario B2B a pavel@arksystems.site
      const leadForm = document.getElementById('lead-form');
      const feedback = document.getElementById('form-feedback');
      if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('lead-name').value.trim();
          const company = document.getElementById('lead-company').value.trim();
          const email = document.getElementById('lead-email').value.trim();
          const plan = document.getElementById('lead-plan').value;
          const notes = document.getElementById('lead-notes').value.trim();
          const channels = Array.from(document.querySelectorAll('input[name="channel"]:checked')).map(c => c.value);

          const subject = encodeURIComponent('[Sentinela B2B] Solicitud de Licencia - ' + company);
          const body = encodeURIComponent(
            'Hola Pavel,\n\n' +
            'Solicito información y activación de Sentinela · NOC Regulatorio con los siguientes datos:\n\n' +
            '• Nombre y Cargo: ' + name + '\n' +
            '• Empresa: ' + company + '\n' +
            '• Correo: ' + email + '\n' +
            '• Plan seleccionado: ' + plan + '\n' +
            '• Canales de interés: ' + (channels.join(', ') || 'Todos') + '\n' +
            '• Notas / Integración: ' + (notes || 'N/A') + '\n\n' +
            'Enviado desde la consola pública de Sentinela.'
          );

          feedback.style.display = 'block';
          feedback.textContent = '✓ Abriendo cliente de correo hacia pavel@arksystems.site...';
          window.location.href = 'mailto:pavel@arksystems.site?subject=' + subject + '&body=' + body;
        });
      }

      // 6. ESCENA 3D INTERACTIVA: PRISMA HEXAGONAL & OJO DE LA LEY SENTINELA
      const canvas = document.getElementById('sentinela-3d-canvas');
      const container = document.getElementById('canvas-container');
      if (!canvas || !window.THREE) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 9.2);

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Iluminación dramática de centro de mando
      const ambientLight = new THREE.AmbientLight(0x94A3B8, 0.7);
      scene.add(ambientLight);

      const keyLight = new THREE.PointLight(0x22D3EE, 2.4, 25);
      keyLight.position.set(4, 4, 5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0xE11D48, 1.8, 25);
      rimLight.position.set(-4, -3, 3);
      scene.add(rimLight);

      // Grupo maestro del Centinela 3D
      const sentinelGroup = new THREE.Group();
      scene.add(sentinelGroup);

      // A) Hexágono Exterior (Escudo Centinela en espacio 3D)
      const hexRadius = 2.65;
      const hexShape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + Math.PI / 6;
        const x = hexRadius * Math.cos(angle);
        const y = hexRadius * Math.sin(angle);
        if (i === 0) hexShape.moveTo(x, y);
        else hexShape.lineTo(x, y);
      }
      hexShape.closePath();

      const holePath = new THREE.Path();
      const innerR = 2.32;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + Math.PI / 6;
        const x = innerR * Math.cos(angle);
        const y = innerR * Math.sin(angle);
        if (i === 0) holePath.moveTo(x, y);
        else holePath.lineTo(x, y);
      }
      holePath.closePath();
      hexShape.holes.push(holePath);

      const extrudeSettings = { depth: 0.28, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
      const hexGeo = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
      hexGeo.center();
      const hexMat = new THREE.MeshStandardMaterial({
        color: 0x16203A,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x0D1420,
        emissiveIntensity: 0.5
      });
      const hexMesh = new THREE.Mesh(hexGeo, hexMat);
      sentinelGroup.add(hexMesh);

      // Aristas luminosas del hexágono
      const hexEdges = new THREE.EdgesGeometry(hexGeo);
      const hexLineMat = new THREE.LineBasicMaterial({ color: 0x22D3EE, transparent: true, opacity: 0.65 });
      const hexWireframe = new THREE.LineSegments(hexEdges, hexLineMat);
      sentinelGroup.add(hexWireframe);

      // B) 4 Anillos Giroscópicos (Los 4 Canales: Fiscal, Cobranza, Fintech, Laboral)
      const channelColors = [0x10B981, 0x3B82F6, 0x8B5CF6, 0xF59E0B];
      const rings = [];
      channelColors.forEach((col, idx) => {
        const r = 1.92 - idx * 0.22;
        const torusGeo = new THREE.TorusGeometry(r, 0.025, 16, 90);
        const torusMat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.45,
          metalness: 0.7,
          roughness: 0.25
        });
        const ring = new THREE.Mesh(torusGeo, torusMat);
        ring.rotation.x = (idx * 0.42);
        ring.rotation.y = (idx * 0.65);
        sentinelGroup.add(ring);
        rings.push(ring);
      });

      // C) Iris y Pupila Central (El Ojo que nunca parpadea)
      const irisGeo = new THREE.IcosahedronGeometry(0.82, 1);
      const irisMat = new THREE.MeshStandardMaterial({
        color: 0x0F172A,
        emissive: 0xE11D48,
        emissiveIntensity: 0.75,
        wireframe: true
      });
      const irisMesh = new THREE.Mesh(irisGeo, irisMat);
      sentinelGroup.add(irisMesh);

      const pupilGeo = new THREE.SphereGeometry(0.46, 32, 32);
      const pupilMat = new THREE.MeshStandardMaterial({
        color: 0xFB7185,
        emissive: 0xE11D48,
        emissiveIntensity: 1.2,
        metalness: 0.3,
        roughness: 0.1
      });
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      sentinelGroup.add(pupilMesh);

      // D) Nube de Nodos Oficiales en Órbita
      const particlesGeo = new THREE.BufferGeometry();
      const count = 90;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rad = 2.9 + Math.random() * 1.4;
        positions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = rad * Math.cos(phi);
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMat = new THREE.PointsMaterial({ color: 0x22D3EE, size: 0.055, transparent: true, opacity: 0.75 });
      const particleCloud = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particleCloud);

      // Interacción con Mouse / Touch
      let targetRotX = 0;
      let targetRotY = 0;
      let pulseSpeed = 3.2;
      const coordsEl = document.getElementById('hud-coords');

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        targetRotY = nx * 0.65;
        targetRotX = -ny * 0.45;
        if (coordsEl) {
          coordsEl.textContent = 'AZIMUTH: ' + (nx * 45).toFixed(1) + '° · ELEV: ' + (ny * 30).toFixed(1) + '°';
        }
      });

      container.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
      });

      // Estados de Simulación Interactiva
      const SIM_STATES = {
        critical: {
          color: 0xE11D48,
          lit: 0xFB7185,
          hexColor: '#E11D48',
          speed: 3.6,
          mode: 'ESTADO: ALERTA CRÍTICA DETECTADA EN DOF',
          pillClass: 'pill pill--active pill--critical sev-critical',
          pillText: 'CRITICAL',
          chClass: 'channel-badge ch-cobranza',
          chText: 'COBRANZA · CONDUSEF',
          folio: 'DOF-2026-X891',
          title: 'Reforma al Art. 284 Bis CPF y Disposiciones REDECO: Ventana Horaria de Cobranza',
          meta: 'ENTRADA EN VIGOR: 2026-11-01 · ACCIÓN: AJUSTAR MOTOR DE ENVÍOS A 08:00–20:00 HRS'
        },
        high: {
          color: 0xF97316,
          lit: 0xFBBF24,
          hexColor: '#F97316',
          speed: 2.4,
          mode: 'ESTADO: CAMBIO RELEVANTE EN PORTAL SAT',
          pillClass: 'pill sev-high',
          pillText: 'HIGH',
          chClass: 'channel-badge ch-fiscal',
          chText: 'FISCAL · SAT RMF',
          folio: 'SAT-RMF-2026-08',
          title: 'Octava Resolución Miscelánea Fiscal: Nuevas Reglas CFDI 4.0 y Complemento de Pagos',
          meta: 'ENTRADA EN VIGOR: 2026-11-15 · ACCIÓN: ACTUALIZAR VALIDADOR DE TIMBRADO Y RFC 69-B'
        },
        medium: {
          color: 0x06B6D4,
          lit: 0x22D3EE,
          hexColor: '#06B6D4',
          speed: 1.6,
          mode: 'ESTADO: CIRCULAR TÉCNICA CNBV / BANXICO',
          pillClass: 'pill sev-medium',
          pillText: 'MEDIUM',
          chClass: 'channel-badge ch-fintech',
          chText: 'FINTECH & BANCA',
          folio: 'CIRC-CNBV-14-2026',
          title: 'Disposiciones de Carácter General sobre Expediente KYC Digital y Monitoreo SPEI',
          meta: 'ENTRADA EN VIGOR: 2026-12-01 · ACCIÓN: REVISAR RETENCIÓN CRIPTOGRÁFICA PLD'
        },
        low: {
          color: 0x64748B,
          lit: 0x94A3B8,
          hexColor: '#64748B',
          speed: 1.0,
          mode: 'ESTADO: ESCANEO PERIMETRAL ORDINARIO',
          pillClass: 'pill sev-low',
          pillText: 'LOW',
          chClass: 'channel-badge ch-laboral',
          chText: 'LABORAL · STPS',
          folio: 'DOF-2026-A102',
          title: 'Fe de Erratas y Calendario Anual de Días Inhábiles de Autoridades Administrativas',
          meta: 'INFORMATIVO · SIN IMPACTO EN REGLAS DE NEGOCIO O CUMPLIMIENTO INMEDIATO'
        }
      };

      const simBtns = document.querySelectorAll('.sim-btn');
      simBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          simBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-sim');
          const st = SIM_STATES[key];
          if (!st) return;

          irisMat.emissive.setHex(st.color);
          pupilMat.color.setHex(st.lit);
          pupilMat.emissive.setHex(st.color);
          rimLight.color.setHex(st.color);
          hexLineMat.color.setHex(st.lit);
          pulseSpeed = st.speed;

          document.getElementById('hud-mode-label').textContent = st.mode;
          const sevPill = document.getElementById('hud-sev-pill');
          sevPill.className = st.pillClass;
          sevPill.textContent = st.pillText;

          const chBadge = document.getElementById('hud-channel-badge');
          chBadge.className = st.chClass;
          chBadge.textContent = st.chText;

          document.getElementById('hud-folio').textContent = st.folio;
          document.getElementById('hud-title').textContent = st.title;
          document.getElementById('hud-meta').textContent = st.meta;
          document.getElementById('hud-alert-box').style.borderLeftColor = st.hexColor;
        });
      });

      // Loop de Animación a 60 FPS
      let clock = 0;
      function animate() {
        requestAnimationFrame(animate);
        clock += 0.016;

        // Seguimiento suave del cursor
        sentinelGroup.rotation.y += (targetRotY - sentinelGroup.rotation.y) * 0.06;
        sentinelGroup.rotation.x += (targetRotX - sentinelGroup.rotation.x) * 0.06;

        // Rotación giroscópica de cada anillo de canal
        rings.forEach((ring, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          ring.rotation.z += 0.004 * dir * (i + 1);
          ring.rotation.x += 0.002 * dir;
        });

        // Pulso del iris y la pupila según la severidad activa
        const s = 1 + Math.sin(clock * pulseSpeed) * 0.075;
        pupilMesh.scale.set(s, s, s);
        irisMesh.rotation.y -= 0.008;
        irisMesh.rotation.z += 0.005;

        particleCloud.rotation.y += 0.0012;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });
    })();
  </script>
</body>
</html>`;
