import { describe, expect, it } from "vitest";

import { defaultLocale, getDirection, getMessages, getIntlLocale, toggleLocale } from "./index";

describe("i18n helpers", () => {
  it("returns the correct text direction", () => {
    expect(getDirection("en")).toBe("ltr");
    expect(getDirection("ar")).toBe("rtl");
  });

  it("toggles locale and returns localized copy", () => {
    expect(toggleLocale("en")).toBe("ar");
    expect(getMessages("ar").navigation.dashboard).toBe("النظرة العامة");
  });

  it("defaults to arabic-first locale settings", () => {
    expect(defaultLocale).toBe("ar");
    expect(getIntlLocale("ar")).toBe("ar-SA-u-nu-latn");
    expect(getMessages("en").navigation.qa).toBe("Review queue");
    expect(getMessages("ar").forms.pendingComplete).toBe("جارٍ الإتمام...");
    expect(getMessages("en").actions.handoverExecutionStarted).toContain("handover-day execution");
  });
});
