/**
 * Tests for components/chat/chat-interface.tsx — ChatInterface component
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  })),
}));

// Mock realtime module
jest.mock("@/lib/realtime", () => ({
  connectChat: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  })),
  joinChatSession: jest.fn(),
}));

// Mock API calls
jest.mock("@/lib/api", () => ({
  createChatSession: jest.fn().mockResolvedValue({ id: 1, status: "active" }),
  sendChatMessage: jest.fn().mockResolvedValue({ id: 10, role: "assistant", content: "Hello!" }),
  executeTool: jest.fn().mockResolvedValue({ result: "done" }),
  aiComplete: jest.fn().mockResolvedValue({ content: "AI response", model: "llama" }),
  aiCompleteStream: jest.fn(),
  aiMultilingual: jest.fn().mockResolvedValue({
    response: "Translated response",
    detected_language: "en",
    confidence: 0.95,
  }),
  aiClassifyIntent: jest.fn().mockResolvedValue({
    intent: "chat.general",
    confidence: 0.9,
  }),
}));

// Mock sub-components that have complex dependencies
jest.mock("@/components/chat/audio-recorder", () => ({
  AudioRecorder: ({ onRecordingComplete }: any) => (
    <button data-testid="audio-recorder" onClick={() => onRecordingComplete?.("test-audio")}>
      Record
    </button>
  ),
}));

jest.mock("@/components/chat/audio-player", () => ({
  AudioPlayer: ({ url }: any) => <div data-testid="audio-player">{url}</div>,
}));

jest.mock("@/components/chat/tool-suggestions", () => ({
  ToolSuggestions: ({ suggestions }: any) => (
    <div data-testid="tool-suggestions">{suggestions?.length ?? 0} suggestions</div>
  ),
}));

jest.mock("@/components/chat/language-selector", () => ({
  LanguageSelector: ({ value, onChange }: any) => (
    <select data-testid="language-selector" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="en">English</option>
      <option value="pcm">Pidgin</option>
    </select>
  ),
}));

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  },
});

import { ChatInterface } from "@/components/chat/chat-interface";

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(store).forEach((k) => delete store[k]);
});

describe("ChatInterface", () => {
  test("renders welcome message", () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Welcome to WakaAgent AI/)).toBeInTheDocument();
  });

  test("renders initial bot message with memory indicator", () => {
    render(<ChatInterface />);
    expect(
      screen.getByText(/I remember your last order/)
    ).toBeInTheDocument();
  });

  test("renders message input field", () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Type your message/i);
    expect(input).toBeInTheDocument();
  });

  test("renders send button", () => {
    render(<ChatInterface />);
    // The send button should exist
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("renders language selector", () => {
    render(<ChatInterface />);
    expect(screen.getByTestId("language-selector")).toBeInTheDocument();
  });

  test("allows typing in the input field", async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, "Hello WakaAgent");
    expect(input).toHaveValue("Hello WakaAgent");
  });

  test("renders tool suggestions for bot messages", () => {
    render(<ChatInterface />);
    // The initial bot message has tool suggestions
    const suggestions = screen.getAllByTestId("tool-suggestions");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test("displays chat header with title", () => {
    render(<ChatInterface />);
    expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();
  });
});
