import { describe, expect, it } from "vitest";

import { getDirection, getMessages, toggleLocale } from "./index";

describe("i18n helpers", () => {
  it("returns the correct text direction", () => {
    expect(getDirection("en")).toBe("ltr");
    expect(getDirection("ar")).toBe("rtl");
  });

  it("toggles locale and returns localized copy", () => {
    expect(toggleLocale("en")).toBe("ar");
    expect(getMessages("ar").navigation.dashboard).toBe("لوحة المتابعة");
  });
});
