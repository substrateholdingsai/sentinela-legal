# Sentinela — Mapa de Construcción, Sprint Control & Control de Versiones

Documento rector del proyecto. Toda decisión de implementación, sprint, fachada de ventas y versión se traza aquí.

## 1. Visión & Alcance

Sentinela es un servicio RegTech autónomo (Cloudflare Worker edge) que monitorea fuentes regulatorias mexicanas/latinas, clasifica por canal, analiza impacto con IA y despacha webhooks firmados a suscriptores B2B (incluido Arkangel). Además, cuenta con una fachada comercial B2B pública con un widget de publicaciones recientes del DOF para adquisición de prospectos corporativos.

Principio: **Arkangel ejecuta cobranza; Sentinela vigila la ley.**

Contacto comercial y ventas: `pavel@arksystems.site`

## 2. Arquitectura (resumen)

- Runtime: Cloudflare Workers (TypeScript/ESM), framework Hono.
- DB: Cloudflare D1 `sentinela-db` (ID: `cff329df-c19e-4fcf-a154-8f8512884eb7`).
- Cache/dedup: Cloudflare KV `sentinela-kv` (ID: `fae20869fa1341efa44c41c72b037961`).
- IA: Workers AI `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- Cron: L-V 07:30 y 18:30 CDMX.
- Auth: API Keys Bearer (admin) + multi-tenant (`tenant_id`) + auth soberano passwordless (magic code vía Resend, JWT HS256 Web Crypto, refresh rotativo 30 días, tabla de revocación).
- Frontend / Fachada B2B: Landing page pública embebida en Worker (`/` con negociación de contenido y `/landing`), widget de publicaciones recientes del DOF RSS oficial con caché KV de 5 minutos y captura de leads.

Módulos:
- `src/ingestors/*` — DOF RSS, SAT scraper, CONDUSEF scraper (gob.mx), CNBV scraper (gob.mx), BANXICO scraper (normativa cronológica).
- `src/ai/analyzer.ts` — análisis estructurado Llama 3.3 70B con fallback heurístico.
- `src/lib/db.ts` — persistencia D1, soporte multi-tenant y consultas indexadas.
- `src/lib/auth-sovereign.ts` — auth passwordless + JWT HS256 + refresh rotativo + revocación jti.
- `src/lib/auth.ts` — Bearer auth + rate limit KV por IP/tenant + tenant resolution.
- `src/webhook/dispatcher.ts` — entrega firmada HMAC-SHA256.
- `src/pipeline.ts` — orquestación concurrente con `Promise.allSettled` sobre las 5 fuentes, control de flujo (`runPool`), cache KV (30d) y timeouts.
- `src/landing/page.ts` — fachada comercial B2B, widget DOF integrado al design system y captura comercial (`pavel@arksystems.site`).
- `GET /api/public/dof/latest` — publicaciones recientes del RSS oficial del DOF, con enlaces validados y caché KV de 5 minutos.
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
- Migraciones D1 (todas aplicadas en producción):
  - `0001_init.sql` (tablas base `regulatory_events`, `subscribers`, `delivery_logs`).
  - `0002_action_required.sql` (metadatos de acción regulatoria).
  - `0003_multi_tenant.sql` (`tenants`, aislamiento en `subscribers.tenant_id`).
  - `0004_auth.sql` (`auth_users`, `auth_codes`, `auth_sessions`, `revoked_tokens`).
- Auth soberano passwordless (`/auth/request-code`, `/auth/verify`, `/auth/refresh`, `/auth/logout`).
- CRUD de suscriptores con filtro y aislamiento por `tenant_id`.
- 5 Ingestores regulatorios oficiales:
  - DOF (Diario Oficial de la Federación — RSS nativo).
  - SAT (Servicio de Administración Tributaria — scraper fiscal).
  - CONDUSEF (Comisión Nacional para la Protección de Usuarios Financieros — REDECO / Cobranza).
  - CNBV (Comisión Nacional Bancaria y de Valores — Fintech IFPE / Capitalización Bancaria).
  - BANXICO (Banco de México — Circulares normativas / SPEI / Medios de Disposición).
- Pipeline orquestado con `Promise.allSettled` resiliente a caídas de portales individuales, dedup KV + IA + dispatch HMAC.
- Reintentos con backoff exponencial en entrega de webhooks (`src/webhook/dispatcher.ts`: hasta 3 intentos, backoff 100/200/400 ms, reintento en 408/429/5xx y errores de red).
- Validación determinista de severidad regulatoria (`src/ai/analyzer.ts`: reglas por palabras clave, exportada como validateSeverity/determineSeverity/severityFromRules/classifySeverity).
- Tuning fino de prompts por canal (`src/ai/analyzer.ts`: guía de enfoque por canal fiscal/cobranza/fintech_banca/laboral inyectada al prompt).
- Design System v1.0 completo (`docs/designsystem.md`) bajo el principio rector: *"El color es significado, nunca decoración"*.
- Forges de activos generados y versionados:
  - Vectoriales: 15 SVGs en `public/assets/brand/`.
  - Raster: 11 PNGs/ICOs en `public/assets/seo/` y generador dinámico de alert cards OpenGraph.
- Landing Page pública B2B (`src/landing/page.ts`) con widget del RSS oficial DOF, conmutador Dark NOC / Light Ejecutivo y captación a `pavel@arksystems.site`.
- API segura: health público (`/`), subscribers, events, run, auth.
- Cron scheduled handler.
- Suite de pruebas unitarias Vitest (28/28 pasando).
- Repositorio remoto Git configurado.

Pendiente:
- Auth por suscriptor individual (API keys emitidas por tenant).
- Dashboard / panel de control web NOC para suscriptores.
- Sistema de facturación recurrente (monetización/billing).

## 5. Plan de Sprints

### Sprint 0 — Infra & Base (DONE)
- [x] Scaffold + wrangler config
- [x] D1/KV creados y migrados
- [x] Remote git

### Sprint 1 — Ingesta & Dedup (DONE)
- [x] DOF RSS parser
- [x] SAT scraper
- [x] CONDUSEF ingestor (REDECO / Cobranza)
- [x] CNBV ingestor (Bancos / Fintech)
- [x] BANXICO ingestor (Circulares / SPEI)
- [x] KV dedup de 30 días

### Sprint 2 — IA & Clasificación (DONE/PARCIAL)
- [x] Workers AI integrado (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
- [x] Prompt JSON estricto + fallback heurístico
- [x] Cache IA + throttling con pool
- [x] Tuning fino de prompts por canal
- [x] Validación de severidad con reglas deterministas

### Sprint 2.5 — Identidad, Design System v1.0 & Fachada B2B (DONE)
- [x] Especificación técnica `docs/designsystem.md` (Dark NOC y Light Ejecutivo)
- [x] Asset Forge SVG (`scripts/generate_assets.py`) generando 15 assets de marca
- [x] Capa Raster PNG/PWA (`scripts/generate_seo_assets.py`) con Pillow y generador de tarjetas de alerta
- [x] Landing Page B2B con widget DOF basado en RSS oficial, design system y captación de ventas (`pavel@arksystems.site`)

### Sprint 3 — API, Seguridad & Multi-Tenant (DONE/PARCIAL)
- [x] CRUD subscribers por tenant
- [x] Listado events con filtros
- [x] Dispatcher HMAC-SHA256
- [x] Bearer auth + rate limit en KV
- [x] Migración multi-tenant D1 (`tenants`, `tenant_id`)
- [x] Auth soberano passwordless (código 6 dígitos + JWT HS256 + refresh rotativo 30d + revocación)
- [x] Tests unitarios automatizados para endpoints `/auth/*` y los 5 ingestores (25 tests verdes)
- [ ] Auth por suscriptor (API keys individuales)
- [x] Reintentos con backoff para entrega de webhooks

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

- Disponibilidad de feeds oficiales (DOF/SAT/CONDUSEF/CNBV/BANXICO); mitigado con `Promise.allSettled`.
- Cuotas Workers AI en free tier.
- Límite de 5 cron triggers en Cloudflare Free Tier (error 10072 tolerado si ya existen crons en la cuenta).
- Entorno Windows: wrangler/vitest con diferencias de spawn; validar en CI.

## 9. Referencias

- PRD original: especificación Sentinela.
- Design System: `docs/designsystem.md`.
- Contacto y Ventas: `pavel@arksystems.site`.
- Repo: https://github.com/substrateholdingsai/sentinela-legal
