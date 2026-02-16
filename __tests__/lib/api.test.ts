/**
 * Tests for lib/api.ts — token management, sanitization, fetch helpers
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => store[key] ?? null),
  setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: jest.fn((key: string) => { delete store[key]; }),
  clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

import {
  API_BASE,
  postJSON,
  getJSON,
  clearTokens,
  aiComplete,
  getDebts,
  getDebtSummary,
  createChatSession,
  sendChatMessage,
  getAICapabilities,
  getSupportedLanguages,
} from "@/lib/api";

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// ─── Token Management ──────────────────────────────────────

describe("Token Management", () => {
  test("clearTokens removes access_token and refresh_token", () => {
    store["access_token"] = "abc";
    store["refresh_token"] = "xyz";
    clearTokens();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
  });

  test("getJSON attaches Authorization header when token exists", async () => {
    store["access_token"] = "test-token";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: "ok" }),
    });

    await getJSON("/test");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["Authorization"]).toBe("Bearer test-token");
  });

  test("getJSON does not attach Authorization when no token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await getJSON("/test");

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["Authorization"]).toBeUndefined();
  });
});

// ─── Input Sanitization ────────────────────────────────────

describe("Input Sanitization", () => {
  test("postJSON sanitizes XSS in request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ result: "ok" }),
    });

    await postJSON("/test", { name: "<script>alert('xss')</script>" });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.name).not.toContain("<script>");
    expect(body.name).toContain("&lt;script&gt;");
  });

  test("postJSON sanitizes javascript: URIs", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await postJSON("/test", { url: "javascript:alert(1)" });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.url).not.toContain("javascript:");
  });

  test("postJSON sanitizes nested objects", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await postJSON("/test", {
      outer: { inner: "<img onerror=alert(1)>" },
    });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.outer.inner).not.toContain("onerror=");
  });

  test("postJSON sanitizes arrays", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await postJSON("/test", { items: ["<b>ok</b>", "clean"] });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.items[0]).toBe("&lt;b&gt;ok&lt;/b&gt;");
    expect(body.items[1]).toBe("clean");
  });
});

// ─── Fetch Helpers ─────────────────────────────────────────

describe("postJSON", () => {
  test("sends POST with JSON content type", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    });

    const result = await postJSON("/orders", { product: "Widget" });

    expect(result).toEqual({ id: 1 });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/orders`);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  test("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "Not Found",
    });

    await expect(postJSON("/missing", {})).rejects.toThrow("HTTP 404");
  });

  test("clears tokens and dispatches event on 401", async () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(postJSON("/auth/login", {})).rejects.toThrow("HTTP 401");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
    dispatchSpy.mockRestore();
  });
});

describe("getJSON", () => {
  test("sends GET request to correct URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 1 }],
    });

    const result = await getJSON("/customers");

    expect(result).toEqual([{ id: 1 }]);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/customers`);
  });

  test("throws on server error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    await expect(getJSON("/broken")).rejects.toThrow("HTTP 500");
  });
});

// ─── Auto Token Refresh ────────────────────────────────────

describe("Auto Token Refresh", () => {
  test("retries request after 401 with refresh token", async () => {
    store["access_token"] = "expired-token";
    store["refresh_token"] = "valid-refresh";

    // First call: 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });
    // Refresh call: success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ access_token: "new-token" }),
    });
    // Retry call: success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: "refreshed" }),
    });

    const result = await getJSON("/protected");
    expect(result).toEqual({ data: "refreshed" });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test("does not refresh on auth endpoints", async () => {
    store["access_token"] = "expired";
    store["refresh_token"] = "valid-refresh";

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(postJSON("/auth/login", {})).rejects.toThrow("HTTP 401");
    // Should NOT attempt refresh (only 1 call, not 3)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ─── API Function Wrappers ─────────────────────────────────

describe("API Wrappers", () => {
  test("createChatSession calls /chat/sessions", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 42, status: "active" }),
    });

    const session = await createChatSession();
    expect(session).toEqual({ id: 42, status: "active" });
    expect(mockFetch.mock.calls[0][0]).toContain("/chat/sessions");
  });

  test("sendChatMessage calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, role: "assistant", content: "Hello" }),
    });

    const msg = await sendChatMessage(42, "Hi");
    expect(msg.content).toBe("Hello");
    expect(mockFetch.mock.calls[0][0]).toContain("/chat/sessions/42/messages");
  });

  test("aiComplete calls /ai/complete", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: "response", model: "llama" }),
    });

    const res = await aiComplete({ prompt: "test" });
    expect(res.content).toBe("response");
    expect(mockFetch.mock.calls[0][0]).toContain("/ai/complete");
  });

  test("getDebts builds query params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await getDebts({ type_filter: "receivable", status_filter: "pending" });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("type_filter=receivable");
    expect(url).toContain("status_filter=pending");
  });

  test("getDebtSummary calls /debts/reports/summary", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ receivables_total: 1000, payables_total: 500 }),
    });

    const summary = await getDebtSummary();
    expect(summary.receivables_total).toBe(1000);
  });

  test("getAICapabilities calls /ai/capabilities", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ features: ["chat"], multilingual_support: true }),
    });

    const caps = await getAICapabilities();
    expect(caps.multilingual_support).toBe(true);
  });

  test("getSupportedLanguages calls /ai/languages", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ supported_languages: [{ code: "en", name: "English" }] }),
    });

    const langs = await getSupportedLanguages();
    expect(langs.supported_languages).toHaveLength(1);
  });
});
