import type { AIAnalysis, Channel, Severity, IngestedItem } from "../types";

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export async function analyzeItem(ai: Ai, item: IngestedItem): Promise<AIAnalysis> {
  const prompt = `Eres un analista regulatorio mexicano. Analiza la siguiente nota normativa y responde UNICAMENTE con un objeto JSON valido (sin markdown, sin texto adicional).

Nota:
Titulo: ${item.title}
Fuente: ${item.source}
Extracto: ${item.raw_snippet}
Canal sugerido: ${item.channel_hint ?? "fiscal"}

El JSON debe tener exactamente estos campos:
{
  "channel": "fiscal" | "cobranza" | "fintech_banca" | "laboral",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Resumen ejecutivo de 3 parrafos en lenguaje claro",
  "effective_date": "YYYY-MM-DD o null",
  "laws_affected": ["ley o articulo afectado"],
  "action_required": "accion requerida para el suscriptor"
}

Clasifica severidad segun impacto operativo. Si no hay fecha explicita, null.`;

  try {
    const resp: any = await ai.run(MODEL, {
      messages: [
        { role: "system", content: "Responde solo JSON valido." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    });
    const text = typeof resp === "string" ? resp : (resp?.response ?? resp?.result ?? JSON.stringify(resp));
    const jsonMatch = String(text).match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return normalize(parsed, item);
    }
  } catch {
    // fall through to heuristic
  }
  return heuristic(item);
}

function normalize(p: any, item: IngestedItem): AIAnalysis {
  const channels: Channel[] = ["fiscal", "cobranza", "fintech_banca", "laboral"];
  const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return {
    channel: channels.includes(p.channel) ? p.channel : (item.channel_hint ?? "fiscal"),
    severity: severities.includes(p.severity) ? p.severity : "MEDIUM",
    summary: String(p.summary ?? item.title),
    effective_date: p.effective_date && /^\d{4}-\d{2}-\d{2}$/.test(p.effective_date) ? p.effective_date : null,
    laws_affected: Array.isArray(p.laws_affected) ? p.laws_affected.map(String) : [],
    action_required: String(p.action_required ?? "Revisar la nota normativa."),
  };
}

function heuristic(item: IngestedItem): AIAnalysis {
  return {
    channel: item.channel_hint ?? "fiscal",
    severity: "MEDIUM",
    summary: item.raw_snippet || item.title,
    effective_date: null,
    laws_affected: [],
    action_required: "Revisar la nota normativa.",
  };
}
