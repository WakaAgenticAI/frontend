/**
 * Tests for hooks/use-mobile.ts — useIsMobile hook
 */
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  let matchMediaListeners: Array<() => void>;

  beforeEach(() => {
    matchMediaListeners = [];
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn((_event: string, handler: () => void) => {
        matchMediaListeners.push(handler);
      }),
      removeEventListener: jest.fn(),
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test("returns false for desktop width", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test("returns true for mobile width", () => {
    Object.defineProperty(window, "innerWidth", { value: 500 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test("returns true at exactly 767px (below breakpoint)", () => {
    Object.defineProperty(window, "innerWidth", { value: 767 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test("returns false at exactly 768px (at breakpoint)", () => {
    Object.defineProperty(window, "innerWidth", { value: 768 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test("responds to resize via matchMedia listener", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 500 });
      matchMediaListeners.forEach((fn) => fn());
    });
    expect(result.current).toBe(true);
  });
});
