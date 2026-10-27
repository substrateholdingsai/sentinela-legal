# Sentinela — Mapa de Construcción, Sprint Control & Control de Versiones

Documento rector del proyecto. Toda decisión de implementación, sprint, fachada de ventas y versión se traza aquí.

## 1. Visión & Alcance

Sentinela es un servicio RegTech autónomo (Cloudflare Worker edge) que monitorea fuentes regulatorias mexicanas/latinas, clasifica por canal, analiza impacto con IA y despacha webhooks firmados a suscriptores B2B (incluido Arkangel). Además, cuenta con una fachada comercial B2B pública con núcleo interactivo 3D para adquisición de prospectos corporativos.

Principio: **Arkangel ejecuta cobranza; Sentinela vigila la ley.**

Contacto comercial y ventas: `pavel@arksystems.site`

## 2. Arquitectura (resumen)

- Runtime: Cloudflare Workers (TypeScript/ESM), framework Hono.
- DB: Cloudflare D1 `sentinela-db` (ID: `cff329df-c19e-4fcf-a154-8f8512884eb7`).
- Cache/dedup: Cloudflare KV `sentinela-kv` (ID: `fae20869fa1341efa44c41c72b037961`).
- IA: Workers AI `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- Cron: L-V 07:30 y 18:30 CDMX.
- Auth: API Keys Bearer (admin) + multi-tenant (`tenant_id`) + auth soberano passwordless (magic code vía Resend, JWT HS256 Web Crypto, refresh rotativo 30 días, tabla de revocación).
- Frontend / Fachada B2B: Landing page pública embebida en Worker (`/` con negociación de contenido y `/landing`), Three.js WebGL autónomo con fallback procedimental 2D y captura de leads.

Módulos:
- `src/ingestors/*` — DOF RSS, SAT scraper.
- `src/ai/analyzer.ts` — análisis estructurado Llama 3.3 70B con fallback heurístico.
- `src/lib/db.ts` — persistencia D1, soporte multi-tenant y consultas indexadas.
- `src/lib/auth-sovereign.ts` — auth passwordless + JWT HS256 + refresh rotativo + revocación jti.
- `src/lib/auth.ts` — Bearer auth + rate limit KV por IP/tenant + tenant resolution.
- `src/webhook/dispatcher.ts` — entrega firmada HMAC-SHA256.
- `src/pipeline.ts` — orquestación con concurrencia acotada (`runPool`), cache KV (30d) y timeouts.
- `src/landing/page.ts` — fachada comercial B2B, motor 3D Three.js, simulador de alertas y captura comercial (`pavel@arksystems.site`).
- `scripts/generate_assets.py` — asset forge vectorial SVG de marca (15 assets nativos).
- `scripts/generate_seo_assets.py` — capa de rasterización PNG con Pillow (11 assets SEO/PWA + tarjetas dinámicas de alerta 1200x630).
- `src/index.ts` — API REST + cron + router de landing pública.

## 3. Seguridad & Throttling (v0.2.0)

- Todos los endpoints `/api/v1/*` requieren `Authorization: Bearer <ADMIN_API_KEY>` (o cabecera `x-api-key`).
- Rate limit por tenant + key + IP en KV: 60 req/min ventana fija.
- Pipeline: concurrencia 3 (`runPool`), tope 25 items/ejecución, cache IA por source_id (30 días), timeout 30s por item y 15s por dispatch.
- Secretos gestionados vía `wrangler secret` (`ADMIN_API_KEY`, `RESEND_API_KEY`, `JWT_SECRET`).

## 4. Estado Actual

Completado:
- Scaffold Worker + Hono + bindings edge (D1, KV, AI).
- Migraciones D1:
  - `0001_init.sql` (tablas base `regulatory_events`, `subscribers`, `delivery_logs`).
  - `0002_action_required.sql` (metadatos de acción regulatoria).
  - `0003_multi_tenant.sql` (`tenants`, aislamiento en `subscribers.tenant_id`).
  - `0004_auth.sql` (`auth_users`, `auth_codes`, `auth_sessions`, `revoked_tokens`).
- Auth soberano passwordless (`/auth/request-code`, `/auth/verify`, `/auth/refresh`, `/auth/logout`).
- CRUD de suscriptores con filtro y aislamiento por `tenant_id`.
- Ingestores DOF/SAT con matriz regex de 4 canales (`fiscal`, `cobranza`, `fintech_banca`, `laboral`).
- Pipeline con dedup KV + IA + dispatch HMAC (throttled).
- Design System v1.0 completo (`docs/designsystem.md`) bajo el principio rector: *"El color es significado, nunca decoración"*.
- Forges de activos generados y versionados:
  - Vectoriales: 15 SVGs en `public/assets/brand/`.
  - Raster: 11 PNGs/ICOs en `public/assets/seo/` y generador dinámico de alert cards OpenGraph.
- Landing Page pública B2B interactiva con Three.js (`src/landing/page.ts`), conmutador Dark NOC / Light Ejecutivo y captación a `pavel@arksystems.site`.
- API segura: health público (`/`), subscribers, events, run, auth.
- Cron scheduled handler.
- Suite de pruebas unitarias Vitest (18/18 pasando).
- Repositorio remoto Git configurado.

Pendiente:
- Ingestores oficiales faltantes: CONDUSEF, CNBV, Banxico.
- Auth por suscriptor individual (API keys emitidas por tenant).
- Reintentos con backoff exponencial en webhooks fallidos.
- Pruebas unitarias dedicadas para la suite de `/auth/*`.
- Dashboard / panel de control web para suscriptores.
- Sistema de facturación recurrente (monetización/billing).

## 5. Plan de Sprints

### Sprint 0 — Infra & Base (DONE)
- [x] Scaffold + wrangler config
- [x] D1/KV creados y migrados
- [x] Remote git

### Sprint 1 — Ingesta & Dedup (DONE/PARCIAL)
- [x] DOF RSS parser
- [x] SAT scraper
- [x] KV dedup
- [ ] CONDUSEF ingestor
- [ ] CNBV/Banxico ingestor

### Sprint 2 — IA & Clasificación (DONE/PARCIAL)
- [x] Workers AI integrado (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
- [x] Prompt JSON estricto + fallback heurístico
- [x] Cache IA + throttling con pool
- [ ] Tuning fino de prompts por canal
- [ ] Validación de severidad con reglas deterministas

### Sprint 2.5 — Identidad, Design System v1.0 & Fachada B2B (DONE)
- [x] Especificación técnica `docs/designsystem.md` (Dark NOC y Light Ejecutivo)
- [x] Asset Forge SVG (`scripts/generate_assets.py`) generando 15 assets de marca
- [x] Capa Raster PNG/PWA (`scripts/generate_seo_assets.py`) con Pillow y generador de tarjetas de alerta
- [x] Landing Page B2B interactiva 3D con Three.js WebGL, fallback 2D y captación de ventas (`pavel@arksystems.site`)

### Sprint 3 — API, Seguridad & Multi-Tenant (DONE/PARCIAL)
- [x] CRUD subscribers por tenant
- [x] Listado events con filtros
- [x] Dispatcher HMAC-SHA256
- [x] Bearer auth + rate limit en KV
- [x] Migración multi-tenant D1 (`tenants`, `tenant_id`)
- [x] Auth soberano passwordless (código 6 dígitos + JWT HS256 + refresh rotativo 30d + revocación)
- [ ] Tests unitarios automatizados para endpoints `/auth/*`
- [ ] Auth por suscriptor (API keys individuales)
- [ ] Reintentos con backoff para entrega de webhooks

### Sprint 4 — Integración Arkangel (PENDIENTE)
- [ ] Endpoint receptor en Arkangel
- [ ] Dashboard de auditoría regulatoria
- [ ] E2E con datos reales y flujo de cobranza supervisada

### Sprint 5 — Producción & Monetización (PENDIENTE)
- [ ] Facturación, planes y cobro recurrente
- [ ] Observabilidad y métricas de despacho
- [ ] SLA y documentación pública de API

## 6. Control de Versiones

Esquema SemVer: `MAJOR.MINOR.PATCH`.

- `MAJOR`: cambios incompatibles en API/payload.
- `MINOR`: nuevas capacidades (ingestores, endpoints, diseño).
- `PATCH`: fixes y ajustes.

Convención de commits (Conventional Commits):
- `feat:` nueva funcionalidad
- `fix:` corrección
- `docs:` documentación
- `chore:` infra/config
- `refactor:` refactor sin cambio funcional
- `test:` tests

Ramas:
- `main` / `master` — producción estable.
- `develop` — integración.
- `feature/<nombre>` — trabajo de sprint.
- `hotfix/<nombre>` — fixes urgentes.

Tags de release: `v0.x.y`. Cada release requiere:
1. Typecheck limpio (`tsc --noEmit`).
2. Suite de pruebas verde (`npm test`).
3. Migraciones aplicadas en D1 remoto.
4. CHANGELOG y mapa actualizados.

## 7. Convenciones de Código

- TypeScript strict, ESM.
- Sin comentarios redundantes salvo justificación técnica o de dominio normativo.
- Bindings por nombres `DB`, `KV`, `AI`.
- IDs con prefijo estandarizado (`reg_`, `sub_`, `del_`, `ten_`, `usr_`, `ses_`, `code_`, `jti_`).
- Cero secretos en repo; usar `wrangler secret`.

## 8. Riesgos & Dependencias

- Disponibilidad de feeds oficiales (DOF/SAT) y cambios de estructura HTML.
- Cuotas Workers AI en free tier.
- Límite de 5 cron triggers en Cloudflare Free Tier (error 10072 tolerado si ya existen crons en la cuenta).
- Entorno Windows: wrangler/vitest con diferencias de spawn; validar en CI.

## 9. Referencias

- PRD original: especificación Sentinela.
- Design System: `docs/designsystem.md`.
- Contacto y Ventas: `pavel@arksystems.site`.
- Repo: https://github.com/substrateholdingsai/sentinela-legal
