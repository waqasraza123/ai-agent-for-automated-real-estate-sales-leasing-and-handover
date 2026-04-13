import { describe, expect, it } from "vitest";

import {
  buildAutomaticQaSampleSummary,
  buildCaseReplyDraftQaSampleSummary,
  buildHandoverCustomerUpdateQaSampleSummary,
  detectCaseReplyDraftQaPolicyMatches,
  detectHandoverCustomerUpdateQaPolicyMatches,
  detectQaPolicyMatches
} from "./qa-policy";

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

  it("detects outbound draft policy signals on prepared customer updates", () => {
    const matches = detectHandoverCustomerUpdateQaPolicyMatches(
      "We guarantee the keys by Friday and can waive the late fee if you confirm today."
    );

    expect(matches.map((match) => match.signal)).toEqual([
      "possession_date_promise",
      "pricing_or_exception_promise"
    ]);
  });

  it("builds a localized outbound-review summary", () => {
    expect(
      buildHandoverCustomerUpdateQaSampleSummary("en", ["possession_date_promise", "legal_claim_risk"])
    ).toContain("QA approval");
    expect(buildHandoverCustomerUpdateQaSampleSummary("ar", ["pricing_or_exception_promise"])).toContain("جودة");
  });

  it("detects policy signals on prepared customer reply drafts", () => {
    const matches = detectCaseReplyDraftQaPolicyMatches(
      "We can definitely lock in the discount today and there will be no legal issue with that exception."
    );

    expect(matches.map((match) => match.signal)).toEqual([
      "guaranteed_outcome_promise",
      "pricing_or_exception_promise",
      "legal_escalation_risk"
    ]);
  });

  it("builds a localized prepared-reply summary", () => {
    expect(buildCaseReplyDraftQaSampleSummary("en", ["guaranteed_outcome_promise"])).toContain("prepared reply draft");
    expect(buildCaseReplyDraftQaSampleSummary("ar", [])).toContain("مسودة رد");
  });
});
