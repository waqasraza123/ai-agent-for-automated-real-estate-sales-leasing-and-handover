import { describe, expect, it } from "vitest";

import type { PersistedCaseSummary } from "@real-estate-ai/contracts";

import { buildRevenueManagerHref, buildRevenueManagerScope, parseRevenueManagerFilters } from "./revenue-manager";

function buildCase(caseId: string, overrides?: Partial<PersistedCaseSummary>) {
  return {
    automationHoldReason: null,
    automationStatus: "active",
    caseId,
    createdAt: "2026-04-10T08:00:00.000Z",
    currentHandoverCustomerUpdateQaReview: null,
    currentQaReview: null,
    customerName: `Customer ${caseId}`,
    followUpStatus: "on_track",
    handoverCase: null,
    handoverClosure: null,
    latestHumanReply: null,
    latestManagerFollowUp: null,
    nextAction: "Next follow-up",
    nextActionDueAt: "2026-04-12T08:00:00.000Z",
    openInterventionsCount: 0,
    ownerName: "Revenue Ops",
    preferredLocale: "en",
    projectInterest: "Sunrise Residences",
    source: "website",
    stage: "new",
    updatedAt: "2026-04-11T08:00:00.000Z",
    ...overrides
  } satisfies PersistedCaseSummary;
}

describe("revenue manager filters", () => {
  it("parses defaults from empty search params", () => {
    expect(parseRevenueManagerFilters(undefined)).toEqual({
      ownerName: undefined,
      queue: "all"
    });
  });

  it("keeps the first value when repeated params are present", () => {
    expect(
      parseRevenueManagerFilters({
        bulkBatchId: ["33333333-3333-4333-8333-333333333333", "44444444-4444-4444-8444-444444444444"],
        ownerName: [" Manager Desk North ", "Revenue Ops"],
        queue: ["escalated_handoffs", "all"]
      })
    ).toEqual({
      bulkBatchId: "33333333-3333-4333-8333-333333333333",
      ownerName: "Manager Desk North",
      queue: "escalated_handoffs"
    });
  });

  it("builds stable revenue manager drill-down links", () => {
    expect(buildRevenueManagerHref("en")).toBe("/en/manager/revenue");
    expect(
      buildRevenueManagerHref(
        "en",
        {
          bulkBatchId: "33333333-3333-4333-8333-333333333333",
          ownerName: "Manager Desk North",
          queue: "escalated_handoffs"
        },
        { hash: "revenue-focused-queue" }
      )
    ).toBe(
      "/en/manager/revenue?queue=escalated_handoffs&ownerName=Manager+Desk+North&bulkBatchId=33333333-3333-4333-8333-333333333333#revenue-focused-queue"
    );
  });

  it("scopes operational-risk drill-downs to the selected owner and queue", () => {
    const scope = buildRevenueManagerScope(
      [
        buildCase("owner-escalated", {
          followUpStatus: "attention",
          latestHumanReply: {
            approvedFromQa: true,
            message: "Shared the approved update.",
            nextAction: "Confirm the next call",
            nextActionDueAt: "2026-04-12T09:00:00.000Z",
            sentAt: "2026-04-11T10:00:00.000Z",
            sentByName: "Amina Rahman"
          },
          ownerName: "Manager Desk North"
        }),
        buildCase("owner-aligned", {
          followUpStatus: "attention",
          ownerName: "Manager Desk North"
        }),
        buildCase("other-owner-escalated", {
          followUpStatus: "attention",
          latestHumanReply: {
            approvedFromQa: false,
            message: "Shared a manual follow-up.",
            nextAction: "Wait for callback",
            nextActionDueAt: "2026-04-12T10:00:00.000Z",
            sentAt: "2026-04-11T11:00:00.000Z",
            sentByName: "Omar Saleh"
          },
          ownerName: "Manager Desk South"
        })
      ],
      {
        ownerName: "Manager Desk North",
        queue: "escalated_handoffs"
      }
    );

    expect(scope.ownerScopedCases.map((caseItem) => caseItem.caseId)).toEqual(["owner-escalated", "owner-aligned"]);
    expect(scope.focusedCases.map((caseItem) => caseItem.caseId)).toEqual(["owner-escalated"]);
  });

  it("prioritizes exact bulk batch scope over queue filtering", () => {
    const batchId = "33333333-3333-4333-8333-333333333333";
    const scope = buildRevenueManagerScope(
      [
        buildCase("batch-escalated", {
          followUpStatus: "attention",
          latestHumanReply: {
            approvedFromQa: true,
            message: "Sent the approved update.",
            nextAction: "Confirm callback timing",
            nextActionDueAt: "2026-04-12T09:00:00.000Z",
            sentAt: "2026-04-11T10:00:00.000Z",
            sentByName: "Amina Rahman"
          },
          latestManagerFollowUp: {
            bulkAction: {
              batchId,
              caseCount: 3,
              scopedOwnerName: "Revenue Ops Queue"
            },
            nextAction: "Reset the desk follow-up",
            nextActionDueAt: "2026-04-12T11:00:00.000Z",
            ownerName: "Manager Desk North",
            savedAt: "2026-04-11T11:30:00.000Z"
          },
          openInterventionsCount: 1,
          ownerName: "Manager Desk North"
        }),
        buildCase("batch-cleared", {
          followUpStatus: "on_track",
          latestHumanReply: {
            approvedFromQa: false,
            message: "Sent the manual correction.",
            nextAction: "Wait for reply",
            nextActionDueAt: "2026-04-12T08:30:00.000Z",
            sentAt: "2026-04-11T09:30:00.000Z",
            sentByName: "Omar Saleh"
          },
          latestManagerFollowUp: {
            bulkAction: {
              batchId,
              caseCount: 3,
              scopedOwnerName: "Revenue Ops Queue"
            },
            nextAction: "Reset the desk follow-up",
            nextActionDueAt: "2026-04-12T11:00:00.000Z",
            ownerName: "Manager Desk North",
            savedAt: "2026-04-11T11:30:00.000Z"
          },
          ownerName: "Manager Desk South"
        }),
        buildCase("other-escalated", {
          followUpStatus: "attention",
          latestHumanReply: {
            approvedFromQa: false,
            message: "Sent a manual update.",
            nextAction: "Wait for callback",
            nextActionDueAt: "2026-04-12T10:00:00.000Z",
            sentAt: "2026-04-11T11:00:00.000Z",
            sentByName: "Omar Saleh"
          },
          ownerName: "Manager Desk South"
        })
      ],
      {
        bulkBatchId: batchId,
        queue: "escalated_handoffs"
      }
    );

    expect(scope.focusedCases.map((caseItem) => caseItem.caseId)).toEqual(["batch-escalated", "batch-cleared"]);
    expect(scope.batchScope).toEqual({
      batchId,
      caseCount: 3,
      clearedCaseCount: 1,
      currentOwnerNames: ["Manager Desk North", "Manager Desk South"],
      savedAt: "2026-04-11T11:30:00.000Z",
      scopedOwnerName: "Revenue Ops Queue",
      stillEscalatedCaseCount: 1
    });
    expect(scope.batchOwnerGroups).toEqual([
      {
        cases: [scope.focusedCases[0]],
        caseCount: 1,
        clearedCaseCount: 0,
        ownerName: "Manager Desk North",
        stillEscalatedCaseCount: 1
      },
      {
        cases: [scope.focusedCases[1]],
        caseCount: 1,
        clearedCaseCount: 1,
        ownerName: "Manager Desk South",
        stillEscalatedCaseCount: 0
      }
    ]);
  });
});
