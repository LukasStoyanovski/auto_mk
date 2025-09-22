// file: src/components/price.test.ts
import { describe, it, expect } from "vitest";
import { formatMkd, formatEur } from "./price";

describe("price helpers", () => {
  it("formats MKD with locale", () => {
    expect(formatMkd(1234567)).toBe("1.234.567 MKD");
  });
  it("formats EUR with locale", () => {
    expect(formatEur(9876)).toBe("€ 9.876");
  });
  it("handles null/undefined", () => {
    expect(formatMkd(undefined)).toBe("—");
    expect(formatEur(null)).toBe("—");
  });
});
