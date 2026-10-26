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
- Auth: API Keys Bearer (admin) para endpoints; HMAC-SHA256 en webhooks.

Módulos:
- `src/ingestors/*` — DOF RSS, SAT.
- `src/ai/analyzer.ts` — análisis estructurado.
- `src/lib/db.ts` — persistencia D1.
- `src/lib/auth.ts` — Bearer auth + rate limit KV.
- `src/webhook/dispatcher.ts` — entrega firmada.
- `src/pipeline.ts` — orquestación (throttled).
- `src/index.ts` — API + cron.

## 3. Seguridad & Throttling (v0.2.0)

- Todos los endpoints `/api/v1/*` requieren `Authorization: Bearer <ADMIN_API_KEY>`.
- Rate limit por key+IP en KV: 60 req/min ventana fija.
- Pipeline: concurrencia 3, tope 25 items/ejecución, cache IA por source_id (30 días), timeout 30s por item y 15s por dispatch.
- `ADMIN_API_KEY` almacenado como secret de Wrangler.

## 4. Estado Actual

Completado:
- Scaffold Worker + Hono + bindings (D1, KV, AI).
- Esquema D1 aplicado (regulatory_events, subscribers, webhook_deliveries, action_required).
- Ingestores DOF/SAT con clasificación por keywords.
- Pipeline con dedup KV + IA + dispatch (throttled).
- API segura: health (público), subscribers, events, run.
- Cron scheduled handler.
- Remote git configurado.

Pendiente:
- CONDUSEF/CNBV/Banxico ingestors.
- Auth por suscriptor (API keys individuales).
- Reintentos/backoff de webhooks.
- Tests de integración en entorno compatible.
- Dashboard/portal de suscriptores.
- Monetización/billing.

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
- [x] Workers AI integrado
- [x] Prompt JSON estricto + fallback heurístico
- [x] Cache IA + throttling
- [ ] Tuning de prompts por canal
- [ ] Validación de severidad con reglas

### Sprint 3 — API & Seguridad (DONE/PARCIAL)
- [x] CRUD subscribers
- [x] Listado events con filtros
- [x] Dispatcher HMAC
- [x] Bearer auth + rate limit
- [ ] Auth por suscriptor
- [ ] Reintentos/backoff
- [ ] Rate limiting avanzado

### Sprint 4 — Integración Arkangel (PENDIENTE)
- [ ] Endpoint receptor en Arkangel
- [ ] Dashboard de auditoría
- [ ] E2E con datos reales

### Sprint 5 — Producción & Monetización (PENDIENTE)
- [ ] Billing/planes
- [ ] Observabilidad/alertas
- [ ] SLA y docs públicas

## 6. Control de Versiones

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

## 7. Convenciones de Código

- TypeScript strict, ESM.
- Sin comentarios salvo justificación no obvia.
- Bindings por nombres `DB`, `KV`, `AI`.
- IDs con prefijo (`reg_`, `sub_`, `del_`).
- No secretos en repo; usar `wrangler secret`.

## 8. Riesgos & Dependencias

- Disponibilidad de feeds oficiales (DOF/SAT) y cambios de estructura HTML.
- Cuotas Workers AI en free tier.
- Entorno Windows: wrangler/vitest con issues de spawn; validar en CI/Linux.

## 9. Referencias

- PRD original: especificación Sentinela.
- Repo: https://github.com/substrateholdingsai/sentinela-legal
