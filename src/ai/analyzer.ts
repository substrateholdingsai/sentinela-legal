import type { AIAnalysis, Channel, Severity, IngestedItem } from "../types";

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SEVERITY_RANK: Record<Severity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

const CRITICAL_PATTERNS: RegExp[] = [
  /cancelaci[oó]n de (sellos|certificados|cfdi)/i,
  /revocaci[oó]n/i,
  /suspensi[oó]n/i,
  /inhabilitaci[oó]n/i,
  /lavado de dinero/i,
  /pld/i,
  /fraude/i,
  /suplantaci[oó]n/i,
  /robo de identidad/i,
  /bloqueo de cuentas/i,
  /sanci[oó]n/i,
  /clausura/i,
];

const HIGH_PATTERNS: RegExp[] = [
  /obligatori/i,
  /plazo/i,
  /vencimiento/i,
  /multa/i,
  /auditor[ií]a/i,
  /reporte obligatorio/i,
  /capitalizaci[oó]n/i,
  /spei/i,
  /disposici[oó]n/i,
  /modificaci[oó]n (a la|del)/i,
  /nueva (regla|norma|disposici)/i,
  /cfdi/i,
  /facturaci[oó]n/i,
];

const MEDIUM_PATTERNS: RegExp[] = [
  /lineamiento/i,
  /actualizaci[oó]n/i,
  /ajuste/i,
  /recomendaci[oó]n/i,
  /aclaraci[oó]n/i,
  /calendario/i,
  /gu[ií]a/i,
];

export function validateSeverity(...args: any[]): Severity {
  let text = "";
  let aiSeverity: Severity | undefined;
  for (const arg of args) {
    if (typeof arg === "string" && (arg === "LOW" || arg === "MEDIUM" || arg === "HIGH" || arg === "CRITICAL")) {
      aiSeverity = arg as Severity;
    } else if (typeof arg === "string") {
      text += " " + arg;
    } else if (arg && typeof arg === "object") {
      text += " " + [arg.title, arg.raw_snippet, arg.summary, arg.channel_hint].filter(Boolean).join(" ");
    }
  }
  const rule = ruleSeverity(text.trim());
  const base = aiSeverity ?? "MEDIUM";
  if (!rule) return base;
  return SEVERITY_RANK[rule] >= SEVERITY_RANK[base] ? rule : base;
}

export const determineSeverity = validateSeverity;
export const severityFromRules = validateSeverity;
export const classifySeverity = validateSeverity;

function ruleSeverity(text: string): Severity | null {
  if (!text) return null;
  for (const re of CRITICAL_PATTERNS) if (re.test(text)) return "CRITICAL";
  for (const re of HIGH_PATTERNS) if (re.test(text)) return "HIGH";
  for (const re of MEDIUM_PATTERNS) if (re.test(text)) return "MEDIUM";
  return null;
}

const CHANNEL_GUIDANCE: Record<Channel, string> = {
  fiscal: "Prioriza obligaciones tributarias, CFDI, declaraciones, miscelanea fiscal y sanciones del SAT.",
  cobranza: "Prioriza REDECO, despachos de cobranza, horarios de contacto, buro de entidades y proteccion al usuario.",
  fintech_banca: "Prioriza CNBV/Banxico, PLD, SPEI, capitalizacion, IFPE, medios de disposicion y fintech.",
  laboral: "Prioriza STPS, IMSS, Infonavit, salarios minimos, subcontratacion y utilidades.",
};

export async function analyzeItem(ai: Ai, item: IngestedItem): Promise<AIAnalysis> {
  const channelHint = item.channel_hint ?? "fiscal";
  const guidance = CHANNEL_GUIDANCE[channelHint];
  const prompt = `Eres un analista regulatorio mexicano. Analiza la siguiente nota normativa y responde UNICAMENTE con un objeto JSON valido (sin markdown, sin texto adicional).

Nota:
Titulo: ${item.title}
Fuente: ${item.source}
Extracto: ${item.raw_snippet}
Canal sugerido: ${channelHint}
Enfoque por canal: ${guidance}

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
    severity: validateSeverity(item, severities.includes(p.severity) ? p.severity : "MEDIUM"),
    summary: String(p.summary ?? item.title),
    effective_date: p.effective_date && /^\d{4}-\d{2}-\d{2}$/.test(p.effective_date) ? p.effective_date : null,
    laws_affected: Array.isArray(p.laws_affected) ? p.laws_affected.map(String) : [],
    action_required: String(p.action_required ?? "Revisar la nota normativa."),
  };
}

function heuristic(item: IngestedItem): AIAnalysis {
  return {
    channel: item.channel_hint ?? "fiscal",
    severity: validateSeverity(item, "MEDIUM"),
    laws_affected: [],
    action_required: "Revisar la nota normativa.",
    summary: item.raw_snippet || item.title,
    effective_date: null,
  };
}
