import { describe, expect, it } from "vitest";

import { buildAutomaticQaSampleSummary, detectQaPolicyMatches } from "./qa-policy";

describe("qa policy sampling", () => {
  it("detects multiple policy signals from one message", () => {
    const matches = detectQaPolicyMatches(
      "I am frustrated, want a special approval on the deposit, and my lawyer will review your reply if this keeps happening."
    );

    expect(matches.map((match) => match.signal)).toEqual([
      "exception_request",
      "frustrated_customer_language",
      "legal_escalation_risk"
    ]);
  });

  it("builds a localized automatic summary", () => {
    expect(buildAutomaticQaSampleSummary("en", ["exception_request", "legal_escalation_risk"])).toContain(
      "automatic QA review"
    );
    expect(buildAutomaticQaSampleSummary("ar", ["frustrated_customer_language"])).toContain("مراجعة جودة");
  });
});
