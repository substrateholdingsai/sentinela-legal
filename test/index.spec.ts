import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

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
});
