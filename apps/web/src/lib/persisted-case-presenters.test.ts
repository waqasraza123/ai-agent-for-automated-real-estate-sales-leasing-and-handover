import { describe, expect, it } from "vitest";

import type { PersistedCaseDetail } from "@real-estate-ai/contracts";

import { buildPersistedConversation } from "./persisted-case-presenters";

const qaReviewId = "11111111-1111-4111-8111-111111111111";

function buildCaseDetail(auditEvents: PersistedCaseDetail["auditEvents"]): PersistedCaseDetail {
  return {
    auditEvents,
    automationHoldReason: null,
    automationStatus: "active",
    budget: null,
    caseId: "22222222-2222-4222-8222-222222222222",
    createdAt: "2026-04-13T09:00:00.000Z",
    currentHandoverCustomerUpdateQaReview: null,
    currentQaReview: {
      createdAt: "2026-04-13T09:05:00.000Z",
      draftMessage: "Approved reply draft text",
      policySignals: [],
      qaReviewId,
      requestedByName: "Revenue Ops",
      reviewSummary: "Approved for the next human response.",
      reviewedAt: "2026-04-13T09:10:00.000Z",
      reviewerName: "QA Desk",
      sampleSummary: "Review the prepared draft",
      status: "approved",
      subjectType: "prepared_reply_draft",
      triggerEvidence: [],
      triggerSource: "manual_request",
      updatedAt: "2026-04-13T09:10:00.000Z"
    },
    currentVisit: null,
    customerName: "Nadia Khan",
    documentRequests: [],
    email: "nadia@example.com",
    followUpStatus: "on_track",
    handoverCase: null,
    handoverClosure: null,
    managerInterventions: [],
    message: "Please send me the next reservation step.",
    nextAction: "Reply with the approved payment instructions",
    nextActionDueAt: "2026-04-14T09:00:00.000Z",
    openInterventionsCount: 0,
    ownerName: "Revenue Ops",
    phone: null,
    preferredLocale: "en",
    projectInterest: "Canal Heights",
    qaReviews: [
      {
        createdAt: "2026-04-13T09:05:00.000Z",
        draftMessage: "Approved reply draft text",
        policySignals: [],
        qaReviewId,
        requestedByName: "Revenue Ops",
        reviewSummary: "Approved for the next human response.",
        reviewedAt: "2026-04-13T09:10:00.000Z",
        reviewerName: "QA Desk",
        sampleSummary: "Review the prepared draft",
        status: "approved",
        subjectType: "prepared_reply_draft",
        triggerEvidence: [],
        triggerSource: "manual_request",
        updatedAt: "2026-04-13T09:10:00.000Z"
      }
    ],
    qualificationSnapshot: null,
    source: "website",
    stage: "new",
    updatedAt: "2026-04-13T09:12:00.000Z"
  };
}

describe("buildPersistedConversation", () => {
  it("replaces a consumed approved reply draft with the recorded human reply", () => {
    const messages = buildPersistedConversation(
      buildCaseDetail([
        {
          createdAt: "2026-04-13T09:12:00.000Z",
          eventType: "case_reply_sent",
          payload: {
            approvedDraftQaReviewId: qaReviewId,
            message: "Approved reply draft text",
            sentByName: "Amina Rahman"
          }
        }
      ])
    );

    const managerMessages = messages.filter((message) => message.sender === "manager");

    expect(managerMessages).toHaveLength(1);
    expect(managerMessages[0]?.body.en).toBe("Approved reply draft text");
    expect(managerMessages[0]?.state?.en).toBe("Human reply sent after QA approval");
  });
});
