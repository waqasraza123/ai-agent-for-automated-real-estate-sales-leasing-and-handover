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
        ownerName: [" Manager Desk North ", "Revenue Ops"],
        queue: ["escalated_handoffs", "all"]
      })
    ).toEqual({
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
          ownerName: "Manager Desk North",
          queue: "escalated_handoffs"
        },
        { hash: "revenue-focused-queue" }
      )
    ).toBe("/en/manager/revenue?queue=escalated_handoffs&ownerName=Manager+Desk+North#revenue-focused-queue");
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
});
