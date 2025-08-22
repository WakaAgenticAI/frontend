export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1";

export async function postJSON<T>(path: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...init });
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
