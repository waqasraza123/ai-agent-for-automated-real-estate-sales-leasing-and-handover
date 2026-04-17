import { describe, expect, it } from "vitest";

import { demoDataset, getDemoCaseById, supportedLocales } from "./index";

describe("domain fixtures", () => {
  it("keeps both supported locales", () => {
    expect(supportedLocales).toEqual(["ar", "en"]);
  });

  it("resolves seeded cases by id", () => {
    expect(getDemoCaseById("lead-sunrise-001")?.referenceCode).toBe("SUN-001");
    expect(demoDataset.cases).toHaveLength(2);
  });
});
