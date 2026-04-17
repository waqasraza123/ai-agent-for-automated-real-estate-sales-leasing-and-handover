import { describe, expect, it } from "vitest";

import { buildGovernanceEventCsv } from "./governance-export";

describe("governance export", () => {
  it("prepends a share-ready summary to governance event csv exports", () => {
    const csv = buildGovernanceEventCsv(
      [
        {
          action: "opened",
          actorName: "QA Reviewer",
          caseId: "case-1",
          createdAt: "2026-04-11T11:00:00.000Z",
          customerName: "Amina Noor",
          draftMessage: "Need approval before sending.",
          handoverCaseId: null,
          kind: "case_message",
          policySignals: ["exception_request"],
          reviewSummary: null,
          sampleSummary: "Draft opened for QA.",
          status: "pending_review",
          subjectType: "prepared_reply_draft",
          triggerEvidence: ["discount request"],
          triggerSource: "manual_request"
        },
        {
          action: "resolved",
          actorName: "QA Reviewer",
          caseId: "case-2",
          createdAt: "2026-04-11T12:00:00.000Z",
          customerName: "Omar Saleh",
          draftMessage: null,
          handoverCaseId: null,
          kind: "case_message",
          policySignals: ["discrimination_risk"],
          reviewSummary: "Approved after revision.",
          sampleSummary: "Conversation review",
          status: "approved",
          subjectType: "prepared_reply_draft",
          triggerEvidence: ["review complete"],
          triggerSource: "policy_rule"
        }
      ],
      {
        filters: {
          kind: "case_message",
          limit: 500,
          status: "pending_review",
          subjectType: "prepared_reply_draft",
          windowDays: 30
        },
        generatedAt: "2026-04-11T13:00:00.000Z",
        locale: "en"
      }
    );

    expect(csv).toContain("export_summary,generated_at,2026-04-11T13:00:00.000Z");
    expect(csv).toContain("export_summary,recipient_variant,manager");
    expect(csv).toContain("export_summary,intended_audience,Revenue leadership and QA review");
    expect(csv).toContain("export_summary,review_focus,Open QA boundaries still waiting for decision");
    expect(csv).toContain("export_summary,selected_scope,Revenue · Reply drafts");
    expect(csv).toContain(
      'export_summary,share_summary,This export is suited for fast manager triage because it collects 2 governance boundaries that are still open in the current scope.'
    );
    expect(csv).toContain("export_summary,matching_row_count,2");
    expect(csv).toContain("export_summary,unique_case_count,2");
    expect(csv).toContain("export_summary,opened_event_count,1");
    expect(csv).toContain("export_summary,resolved_event_count,1");
    expect(csv).toContain(
      "createdAt,action,kind,status,subjectType,triggerSource,customerName,caseId,handoverCaseId,actorName,sampleSummary,reviewSummary,draftMessage,policySignals,triggerEvidence"
    );
  });

  it("can package governance history for qa-specific recipients", () => {
    const csv = buildGovernanceEventCsv(
      [
        {
          action: "opened",
          actorName: "QA Reviewer",
          caseId: "case-1",
          createdAt: "2026-04-11T11:00:00.000Z",
          customerName: "Amina Noor",
          draftMessage: "Need approval before sending.",
          handoverCaseId: null,
          kind: "case_message",
          policySignals: ["exception_request"],
          reviewSummary: null,
          sampleSummary: "Draft opened for QA.",
          status: "pending_review",
          subjectType: "prepared_reply_draft",
          triggerEvidence: ["discount request"],
          triggerSource: "manual_request"
        }
      ],
      {
        filters: {
          kind: "case_message",
          limit: 500,
          status: "pending_review",
          subjectType: "prepared_reply_draft",
          windowDays: 30
        },
        generatedAt: "2026-04-11T13:00:00.000Z",
        locale: "en",
        recipient: "qa"
      }
    );

    expect(csv).toContain("export_summary,recipient_variant,qa");
    expect(csv).toContain("export_summary,intended_audience,QA review and policy audit");
    expect(csv).toContain("export_summary,review_focus,Audit-ready governance history across QA decisions and policy triggers");
    expect(csv).toContain(
      "export_summary,share_summary,This export is suited for QA audit because it collects 1 governance events under the same decision boundary and policy-trigger scope."
    );
  });
});
