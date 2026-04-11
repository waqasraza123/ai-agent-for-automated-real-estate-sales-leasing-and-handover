import { describe, expect, it } from "vitest";

import { getLocaleFromPathname, getLocaleFromValue } from "./locale";

describe("locale helpers", () => {
  it("normalizes locale values safely", () => {
    expect(getLocaleFromValue("en")).toBe("en");
    expect(getLocaleFromValue("ar")).toBe("ar");
    expect(getLocaleFromValue("fr")).toBe("en");
    expect(getLocaleFromValue(undefined)).toBe("en");
  });

  it("extracts locale from pathname", () => {
    expect(getLocaleFromPathname("/ar/dashboard")).toBe("ar");
    expect(getLocaleFromPathname("/en/leads/lead-sunrise-001")).toBe("en");
    expect(getLocaleFromPathname("/dashboard")).toBe("en");
  });
});
