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
