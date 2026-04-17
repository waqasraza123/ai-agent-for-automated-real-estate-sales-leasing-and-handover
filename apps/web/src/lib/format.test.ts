import { describe, expect, it } from "vitest";

import { formatCurrency, formatDateTime, formatNumber, formatShortDate } from "./format";

describe("format helpers", () => {
  it("formats arabic values with latin digits", () => {
    const formatted = formatDateTime("2026-04-13T09:12:00.000Z", "ar");

    expect(formatted).toMatch(/[0-9]/);
    expect(formatted).not.toMatch(/[٠-٩]/);
  });

  it("formats numbers and currencies through one locale-aware layer", () => {
    expect(formatNumber(1200, "en")).toBe("1,200");
    expect(formatCurrency(1200, "ar", "SAR")).toMatch(/[0-9]/);
  });

  it("formats compact calendar labels consistently", () => {
    expect(formatShortDate("2026-04-13T00:00:00.000Z", "en")).toMatch(/Apr|13/);
  });
});
