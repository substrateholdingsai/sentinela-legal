export type Channel = "fiscal" | "cobranza" | "fintech_banca" | "laboral";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Source = "DOF" | "SAT" | "CONDUSEF" | "CNBV" | "BANXICO";

export interface RegulatoryEvent {
  id: string;
  source: Source;
  source_url: string;
  source_id: string;
  channel: Channel;
  title: string;
  summary: string;
  severity: Severity;
  effective_date: string | null;
  laws_affected: string[];
  raw_snippet: string | null;
  action_required: string | null;
  created_at: string;
}

export interface Subscriber {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  channels: Channel[];
  webhook_url: string | null;
  webhook_secret: string | null;
  active: number;
  created_at: string;
}

export interface IngestedItem {
  source: Source;
  source_url: string;
  source_id: string;
  title: string;
  raw_snippet: string;
  channel_hint: Channel | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  active: number;
  created_at: string;
}

export interface AIAnalysis {
  channel: Channel;
  severity: Severity;
  summary: string;
  effective_date: string | null;
  laws_affected: string[];
  action_required: string;
}
