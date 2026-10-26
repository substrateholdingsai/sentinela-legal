# Sentinela — Mapa de Construcción, Sprint Control & Control de Versiones

Documento rector del proyecto. Toda decisión de implementación, sprint y versión se traza aquí.

## 1. Visión & Alcance

Sentinela es un servicio RegTech autónomo (Cloudflare Worker edge) que monitorea fuentes regulatorias mexicanas/latinas, clasifica por canal, analiza impacto con IA y despacha webhooks firmados a suscriptores B2B (incluido Arkangel).

Principio: **Arkangel ejecuta cobranza; Sentinela vigila la ley.**

## 2. Arquitectura (resumen)

- Runtime: Cloudflare Workers (TypeScript/ESM), framework Hono.
- DB: Cloudflare D1 `sentinela-db`.
- Cache/dedup: Cloudflare KV `sentinela-kv`.
- IA: Workers AI `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- Cron: L-V 07:30 y 18:30 CDMX.
- Auth: API Keys Bearer para suscriptores; HMAC-SHA256 en webhooks.

Módulos:
- `src/ingestors/*` — DOF RSS, SAT.
- `src/ai/analyzer.ts` — análisis estructurado.
- `src/lib/db.ts` — persistencia D1.
- `src/webhook/dispatcher.ts` — entrega firmada.
- `src/pipeline.ts` — orquestación.
- `src/index.ts` — API + cron.

## 3. Estado Actual (v0.1.0)

Completado:
- Scaffold Worker + Hono + bindings (D1, KV, AI).
- Esquema D1 aplicado (regulatory_events, subscribers, webhook_deliveries).
- Ingestores DOF/SAT con clasificación por keywords.
- Pipeline con dedup KV + IA + dispatch.
- API: health, subscribers, events, run.
- Cron scheduled handler.
- Remote git configurado.

Pendiente:
- CONDUSEF/CNBV/Banxico ingestors.
- Autenticación API Key en endpoints.
- Reintentos y backoff de webhooks.
- Tests de integración (vitest + cloudflare plugin) en entorno compatible.
- Dashboard/portal de suscriptores.
- Monetización/billing.

## 4. Plan de Sprints

### Sprint 0 — Infra & Base (DONE)
Objetivo: Worker desplegable con bindings y esquema.
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
- [x] Workers AI integrado
- [x] Prompt JSON estricto + fallback heurístico
- [ ] Tuning de prompts por canal
- [ ] Validación de severidad con reglas

### Sprint 3 — API & Webhooks (DONE/PARCIAL)
- [x] CRUD subscribers
- [x] Listado events con filtros
- [x] Dispatcher HMAC
- [ ] Auth API Key
- [ ] Reintentos/backoff
- [ ] Rate limiting

### Sprint 4 — Integración Arkangel (PENDIENTE)
- [ ] Endpoint receptor en Arkangel
- [ ] Dashboard de auditoría
- [ ] E2E con datos reales

### Sprint 5 — Producción & Monetización (PENDIENTE)
- [ ] Billing/planes
- [ ] Observabilidad/alertas
- [ ] SLA y docs públicas

## 5. Control de Versiones

Esquema SemVer: `MAJOR.MINOR.PATCH`.

- `MAJOR`: cambios incompatibles en API/payload.
- `MINOR`: nuevas capacidades (ingestores, endpoints).
- `PATCH`: fixes y ajustes.

Convención de commits (Conventional Commits):
- `feat:` nueva funcionalidad
- `fix:` corrección
- `docs:` documentación
- `chore:` infra/config
- `refactor:` refactor sin cambio funcional
- `test:` tests

Ramas:
- `main` — producción estable.
- `develop` — integración.
- `feature/<nombre>` — trabajo de sprint.
- `hotfix/<nombre>` — fixes urgentes.

Tags de release: `v0.x.y`. Cada release requiere:
1. Typecheck limpio (`tsc --noEmit`).
2. Migraciones aplicadas en D1 remoto.
3. CHANGELOG actualizado.

## 6. Convenciones de Código

- TypeScript strict, ESM.
- Sin comentarios salvo justificación no obvia.
- Bindings por nombres `DB`, `KV`, `AI`.
- IDs con prefijo (`reg_`, `sub_`, `del_`).
- No secretos en repo; usar `wrangler secret`.

## 7. Riesgos & Dependencias

- Disponibilidad de feeds oficiales (DOF/SAT) y cambios de estructura HTML.
- Cuotas Workers AI en free tier.
- Entorno Windows: wrangler/vitest con issues de spawn; validar en CI/Linux.

## 8. Referencias

- PRD original: especificación Sentinela.
- Repo: https://github.com/substrateholdingsai/sentinela-legal
