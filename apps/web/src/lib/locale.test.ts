import { describe, expect, it } from "vitest";

import { extractLocaleFromPathname, getLocaleFromPathname, getLocaleFromValue, replacePathLocale } from "./locale";

describe("locale helpers", () => {
  it("normalizes locale values safely", () => {
    expect(getLocaleFromValue("en")).toBe("en");
    expect(getLocaleFromValue("ar")).toBe("ar");
    expect(getLocaleFromValue("fr")).toBe("ar");
    expect(getLocaleFromValue(undefined)).toBe("ar");
  });

  it("extracts locale from pathname", () => {
    expect(extractLocaleFromPathname("/ar/dashboard")).toBe("ar");
    expect(extractLocaleFromPathname("/dashboard")).toBeNull();
    expect(getLocaleFromPathname("/ar/dashboard")).toBe("ar");
    expect(getLocaleFromPathname("/en/leads/lead-sunrise-001")).toBe("en");
    expect(getLocaleFromPathname("/dashboard")).toBe("ar");
  });

  it("replaces or prefixes locale segments without losing path context", () => {
    expect(replacePathLocale("/ar/leads/123", "en")).toBe("/en/leads/123");
    expect(replacePathLocale("/leads/123", "ar")).toBe("/ar/leads/123");
    expect(replacePathLocale("/", "ar")).toBe("/ar");
  });
});
