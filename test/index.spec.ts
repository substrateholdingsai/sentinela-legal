import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index";
import { generateId, hmacSha256Hex, sha256Hex } from "../src/lib/crypto";
import { classifyChannel, parseRssItems } from "../src/ingestors/keywords";
import { ingestDof } from "../src/ingestors/dof";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

beforeAll(async () => {
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, api_key_hash TEXT, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS subscribers (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'default', name TEXT NOT NULL, email TEXT NOT NULL, channels TEXT NOT NULL, webhook_url TEXT, webhook_secret TEXT, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, tenant_id TEXT NOT NULL DEFAULT 'default', created_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_codes (id TEXT PRIMARY KEY, email TEXT NOT NULL, code TEXT NOT NULL, expires_at TEXT NOT NULL, used INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, refresh_token TEXT UNIQUE NOT NULL, expires_at TEXT NOT NULL, revoked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS revoked_tokens (jti TEXT PRIMARY KEY, expires_at TEXT NOT NULL)`).run();
});

describe("Sentinela worker", () => {
	it("health endpoint responds", async () => {
		const request = new IncomingRequest("http://example.com/");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		const json: any = await response.json();
		expect(json.name).toBe("sentinela");
	});

	it("integration health", async () => {
		const response = await SELF.fetch("https://example.com/");
		expect(response.status).toBe(200);
	});

	it("serves public 3D landing page when Accept includes text/html or at /landing", async () => {
		const request = new IncomingRequest("http://example.com/", {
			headers: { Accept: "text/html,application/xhtml+xml" },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");
		const html = await response.text();
		expect(html).toContain("pavel@arksystems.site");
		expect(html).toContain("sentinela-3d-canvas");
		expect(html).toContain("SENTINELA");
	});

	it("rejects unauthorized access to /api/v1/run", async () => {
		const request = new IncomingRequest("http://example.com/api/v1/run", {
			method: "POST",
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(401);
		const json: any = await response.json();
		expect(json.error).toContain("Unauthorized");
	});

	it("rejects unauthorized access to /api/v1/subscribers", async () => {
		const request = new IncomingRequest("http://example.com/api/v1/subscribers", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Test", email: "test@example.com", channels: ["fiscal"] }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(401);
	});

	it("authorizes /api/v1/subscribers with Bearer fallback token or ADMIN_KEY", async () => {
		const request = new IncomingRequest("http://example.com/api/v1/subscribers", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.ADMIN_KEY ?? "dev-admin-key"}`,
			},
			body: JSON.stringify({}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		// Body validation fails with 400, proving auth passed
		expect(response.status).toBe(400);
	});

	it("authorizes /api/v1/subscribers with x-api-key header", async () => {
		const request = new IncomingRequest("http://example.com/api/v1/subscribers", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": env.ADMIN_KEY ?? "dev-admin-key",
			},
			body: JSON.stringify({}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(400);
	});
});

describe("Unit tests: Crypto module", () => {
	it("generates IDs with expected prefix", () => {
		const id = generateId("reg");
		expect(id.startsWith("reg_")).toBe(true);
		expect(id.length).toBeGreaterThan(10);
	});

	it("computes deterministic SHA-256 hex digest", async () => {
		const hash = await sha256Hex("hello world");
		expect(hash).toBe("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
	});

	it("computes valid HMAC-SHA-256 signature", async () => {
		const sig = await hmacSha256Hex("secret-key", "test payload");
		expect(typeof sig).toBe("string");
		expect(sig.length).toBe(64);
	});
});

describe("Unit tests: Keywords and Classification", () => {
	it("classifies fiscal texts correctly", () => {
		expect(classifyChannel("Nueva resolucion miscelanea fiscal del SAT sobre CFDI")).toBe("fiscal");
	});

	it("classifies cobranza texts correctly", () => {
		expect(classifyChannel("Normativa CONDUSEF sobre despacho de cobranza y REDECO")).toBe("cobranza");
	});

	it("classifies fintech_banca texts correctly", () => {
		expect(classifyChannel("Disposicion de CNBV y BANXICO para prevencion de lavado de dinero PLD")).toBe("fintech_banca");
	});

	it("classifies laboral texts correctly", () => {
		expect(classifyChannel("Decreto STPS sobre aumento al salario minimo e IMSS")).toBe("laboral");
	});

	it("returns null for irrelevant text", () => {
		expect(classifyChannel("Receta de cocina para pastel de tres leches")).toBeNull();
	});

	it("parses RSS XML items filtering by keywords", () => {
		const xml = `
			<rss><channel>
				<item>
					<title><![CDATA[Reglas del SAT para devolucion de impuestos]]></title>
					<link>https://dof.gob.mx/nota_detalle.php?codigo=123</link>
					<description><![CDATA[Nuevos requisitos para facturacion electronica]]></description>
					<guid>dof-123</guid>
				</item>
				<item>
					<title>Aviso no relacionado sobre clima</title>
					<link>https://dof.gob.mx/nota_detalle.php?codigo=456</link>
					<description>Pronostico del tiempo</description>
				</item>
			</channel></rss>
		`;
		const items = parseRssItems(xml, "DOF");
		expect(items.length).toBe(1);
		expect(items[0].source_id).toBe("dof-123");
		expect(items[0].channel_hint).toBe("fiscal");
		expect(items[0].title).toBe("Reglas del SAT para devolucion de impuestos");
	});
});

describe("Unit tests: DOF Ingestor", () => {
	it("handles mock fetch response and parses items", async () => {
		const mockXml = `
			<rss><channel>
				<item>
					<title>Acuerdo STPS en materia laboral</title>
					<link>https://dof.gob.mx/test</link>
					<description>Lineamientos laborales</description>
				</item>
			</channel></rss>
		`;
		const mockFetch = (async () => new Response(mockXml, { status: 200 })) as any;
		const items = await ingestDof(mockFetch);
		expect(items.length).toBe(1);
		expect(items[0].channel_hint).toBe("laboral");
	});

	it("returns empty array on network failure", async () => {
		const mockFetch = (async () => { throw new Error("Network error"); }) as any;
		const items = await ingestDof(mockFetch);
		expect(items).toEqual([]);
	});
});

describe("Auth Soberano Passwordless Flow", () => {
	it("completes full auth lifecycle: request-code -> verify -> refresh -> logout", async () => {
		const email = "vigilante@sentinela.test";

		// 1. Request code
		const reqCode = new IncomingRequest("http://example.com/auth/request-code", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		const ctx1 = createExecutionContext();
		const resCode = await worker.fetch(reqCode, env, ctx1);
		await waitOnExecutionContext(ctx1);
		expect(resCode.status).toBe(200);
		const jsonCode: any = await resCode.json();
		expect(jsonCode.ok).toBe(true);

		// Extract code from D1 test DB
		const codeRow = await env.DB.prepare(
			"SELECT code FROM auth_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
		).bind(email).first<{ code: string }>();
		expect(codeRow?.code).toBeDefined();

		// 2. Verify invalid code -> 401
		const reqBad = new IncomingRequest("http://example.com/auth/verify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, code: "000000" }),
		});
		const ctxBad = createExecutionContext();
		const resBad = await worker.fetch(reqBad, env, ctxBad);
		await waitOnExecutionContext(ctxBad);
		expect(resBad.status).toBe(401);

		// 3. Verify valid code -> JWT + Refresh
		const reqVerify = new IncomingRequest("http://example.com/auth/verify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, code: codeRow!.code }),
		});
		const ctx2 = createExecutionContext();
		const resVerify = await worker.fetch(reqVerify, env, ctx2);
		await waitOnExecutionContext(ctx2);
		expect(resVerify.status).toBe(200);
		const jsonVerify: any = await resVerify.json();
		expect(jsonVerify.token).toBeDefined();
		expect(jsonVerify.refresh_token).toBeDefined();

		// 4. Refresh token rotation
		const reqRefresh = new IncomingRequest("http://example.com/auth/refresh", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh_token: jsonVerify.refresh_token }),
		});
		const ctx3 = createExecutionContext();
		const resRefresh = await worker.fetch(reqRefresh, env, ctx3);
		await waitOnExecutionContext(ctx3);
		expect(resRefresh.status).toBe(200);
		const jsonRefresh: any = await resRefresh.json();
		expect(jsonRefresh.token).toBeDefined();
		expect(jsonRefresh.refresh_token).not.toBe(jsonVerify.refresh_token);

		// 5. Logout and revoke JWT
		const reqLogout = new IncomingRequest("http://example.com/auth/logout", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${jsonRefresh.token}`,
			},
		});
		const ctx4 = createExecutionContext();
		const resLogout = await worker.fetch(reqLogout, env, ctx4);
		await waitOnExecutionContext(ctx4);
		expect(resLogout.status).toBe(200);
		const jsonLogout: any = await resLogout.json();
		expect(jsonLogout.ok).toBe(true);
	});
});
