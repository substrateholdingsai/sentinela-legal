import type { RegulatoryEvent } from "../types";
import { listSubscribers, logDelivery } from "../lib/db";
import { generateId, hmacSha256Hex } from "../lib/crypto";

const MAX_DELIVERY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function backoffDelay(attempt: number): number {
  return INITIAL_BACKOFF_MS * Math.pow(2, Math.max(0, attempt - 1));
}

export async function dispatchEvent(env: Env, event: RegulatoryEvent): Promise<void> {
  const subs = await listSubscribers(env.DB, undefined, true);
  for (const sub of subs) {
    if (!sub.channels.includes(event.channel as any)) continue;
    if (!sub.webhook_url) continue;
    const payload = {
      event: "regulatory.update_detected",
      timestamp: new Date().toISOString(),
      data: {
        id: event.id,
        channel: event.channel,
        source: event.source === "DOF" ? "Diario Oficial de la Federación" : event.source,
        source_url: event.source_url,
        severity: event.severity,
        title: event.title,
        effective_date: event.effective_date,
        summary: event.summary,
        laws_affected: event.laws_affected,
        action_required: event.action_required ?? "Revisar y ajustar procesos conforme a la nueva disposicion.",
      },
    };
    const body = JSON.stringify(payload);

    let statusCode: number | null = null;
    let responseBody: string | null = null;

    for (let attempt = 1; attempt <= MAX_DELIVERY_ATTEMPTS; attempt++) {
      try {
        const signature = sub.webhook_secret ? await hmacSha256Hex(sub.webhook_secret, body) : "";
        const res = await fetch(sub.webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(signature ? { "X-Sentinela-Signature": `sha256=${signature}` } : {}),
          },
          body,
        });
        statusCode = res.status;
        responseBody = (await res.text()).slice(0, 2000);
        if (res.ok || !isRetryableStatus(statusCode)) break;
      } catch (e: any) {
        statusCode = 0;
        responseBody = String(e?.message ?? e).slice(0, 2000);
      }

      if (attempt < MAX_DELIVERY_ATTEMPTS) {
        await sleep(backoffDelay(attempt));
      }
    }

    await logDelivery(env.DB, {
      id: generateId("del"),
      subscriber_id: sub.id,
      event_id: event.id,
      status_code: statusCode,
      response_body: responseBody,
    });
  }
}