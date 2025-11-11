export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1";

export async function postJSON<T>(path: string, body: any, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as any || {}) };
  try {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("access_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as any || {}) };
  try {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("access_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, { headers, ...init });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

export type ChatSession = { id: number; status: string; last_activity_at: string };
export type ChatMessage = { id: number; role: string; content: string; created_at: string; audio_url?: string | null };

export async function createChatSession(reuse_recent = true): Promise<ChatSession> {
  return postJSON("/chat/sessions", { reuse_recent });
}

export async function sendChatMessage(sessionId: number, content: string): Promise<ChatMessage> {
  return postJSON(`/chat/sessions/${sessionId}/messages`, { content });
}

export async function executeTool(intent: string, payload: any): Promise<any> {
  return postJSON("/tools/execute", { intent, payload });
}

// AI Endpoints
export interface AICompleteRequest {
  prompt: string;
  session_id?: number;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AICompleteResponse {
  content: string;
  model: string;
  session_id?: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TranscribeRequest {
  audio_url?: string;
  audio_data?: string;
  filename?: string;
  language?: string;
}

export interface TranscribeResponse {
  text: string;
  language: string;
  confidence?: number;
}

export interface MultilingualRequest {
  message: string;
  context?: string;
}

export interface MultilingualResponse {
  original_message: string;
  detected_language: string;
  confidence: number;
  english_translation: string;
  response: string;
  response_language: string;
}

export interface IntentClassificationRequest {
  message: string;
  context?: any;
}

export interface IntentClassificationResponse {
  intent: string;
  confidence: number;
  agent?: string;
  workflow?: string[];
}

export interface CapabilitiesResponse {
  llm_models: string[];
  supported_languages: Array<{
    code: string;
    name: string;
    display_name: string;
  }>;
  audio_formats: string[];
  agents: Record<string, {
    description: string;
    tools: string[];
  }>;
  features: string[];
  multilingual_support: boolean;
}

export interface LanguagesResponse {
  supported_languages: Array<{
    code: string;
    name: string;
    display_name: string;
  }>;
}

export async function aiComplete(request: AICompleteRequest): Promise<AICompleteResponse> {
  return postJSON("/ai/complete", request);
}

export async function aiTranscribe(request: TranscribeRequest): Promise<TranscribeResponse> {
  return postJSON("/ai/transcribe", request);
}

export async function aiMultilingual(request: MultilingualRequest): Promise<MultilingualResponse> {
  return postJSON("/ai/multilingual", request);
}

export async function aiClassifyIntent(request: IntentClassificationRequest): Promise<IntentClassificationResponse> {
  return postJSON("/ai/classify-intent", request);
}

export async function getAICapabilities(): Promise<CapabilitiesResponse> {
  return getJSON("/ai/capabilities");
}

export async function getSupportedLanguages(): Promise<LanguagesResponse> {
  return getJSON("/ai/languages");
}

// Streaming AI completion
export async function* aiCompleteStream(request: AICompleteRequest): AsyncGenerator<string, void, unknown> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("access_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}

  const response = await fetch(`${API_BASE}/ai/complete/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`HTTP ${response.status}: ${txt}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              yield parsed.content;
            }
          } catch (e) {
            // Ignore malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// RAG-enhanced completion
export async function aiCompleteRAG(
  prompt: string, 
  options: {
    collection?: string;
    top_k?: number;
    session_id?: number;
  } = {}
): Promise<AICompleteResponse> {
  return postJSON("/ai/complete/rag", {
    prompt,
    collection: options.collection || "general",
    top_k: options.top_k || 3,
    session_id: options.session_id,
  });
}

// Debt management APIs
export interface Debt {
  id: number;
  type: string;
  entity_type: string;
  entity_id?: number;
  amount_ngn: number;
  currency: string;
  description?: string;
  due_date?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface DebtSummary {
  receivables_total: number;
  payables_total: number;
  receivables_count: number;
  payables_count: number;
  overdue_receivables: number;
  overdue_payables: number;
}

export interface DebtAgingReport {
  range_0_30: number;
  range_31_60: number;
  range_61_90: number;
  range_90_plus: number;
  total_overdue_amount: number;
  total_debts: number;
  total_amount: number;
}

export interface DebtPayment {
  id: number;
  debt_id: number;
  amount_ngn: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export async function getDebts(params: {
  type_filter?: string;
  status_filter?: string;
  entity_type?: string;
  entity_id?: number;
  due_before?: string;
  due_after?: string;
  skip?: number;
  limit?: number;
} = {}): Promise<Debt[]> {
  const queryParams = new URLSearchParams();
  if (params.type_filter) queryParams.set('type_filter', params.type_filter);
  if (params.status_filter) queryParams.set('status_filter', params.status_filter);
  if (params.entity_type) queryParams.set('entity_type', params.entity_type);
  if (params.entity_id) queryParams.set('entity_id', params.entity_id.toString());
  if (params.due_before) queryParams.set('due_before', params.due_before);
  if (params.due_after) queryParams.set('due_after', params.due_after);
  if (params.skip) queryParams.set('skip', params.skip.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

  return getJSON(`/debts?${queryParams.toString()}`);
}

export async function createDebt(data: {
  type: string;
  entity_type: string;
  entity_id?: number;
  amount_ngn: number;
  currency?: string;
  description?: string;
  due_date?: string;
  priority?: string;
}): Promise<Debt> {
  return postJSON('/debts', data);
}

export async function updateDebt(debtId: number, data: {
  status?: string;
  priority?: string;
  description?: string;
  due_date?: string;
}): Promise<Debt> {
  return postJSON(`/debts/${debtId}`, data, { method: 'PUT' });
}

export async function addPayment(debtId: number, data: {
  amount_ngn: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
}): Promise<DebtPayment> {
  return postJSON(`/debts/${debtId}/payments`, data);
}

export async function getDebtSummary(): Promise<DebtSummary> {
  return getJSON('/debts/reports/summary');
}

export async function getAgingReport(): Promise<DebtAgingReport> {
  return getJSON('/debts/reports/aging');
}
