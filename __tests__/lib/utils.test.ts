/**
 * Tests for lib/utils.ts — cn() utility
 */
import { cn } from "@/lib/utils";

describe("cn (className merge utility)", () => {
  test("merges multiple class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  test("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  test("deduplicates conflicting tailwind classes", () => {
    // twMerge should resolve px-4 vs px-2 to px-2 (last wins)
    const result = cn("px-4", "px-2");
    expect(result).toBe("px-2");
  });

  test("handles undefined and null inputs", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  test("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  test("handles array inputs", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });
});
