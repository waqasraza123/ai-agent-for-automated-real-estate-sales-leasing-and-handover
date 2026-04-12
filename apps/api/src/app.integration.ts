import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildApiApp } from "./app";

import { createAlphaLeadCaptureStore } from "@real-estate-ai/database";

describe("lead capture api", () => {
  let store: Awaited<ReturnType<typeof createAlphaLeadCaptureStore>>;
  let app: ReturnType<typeof buildApiApp>;

  beforeEach(async () => {
    store = await createAlphaLeadCaptureStore({
      inMemory: true
    });
    app = buildApiApp({
      store
    });
  });

  afterEach(async () => {
    await app.close();
    await store.close();
  });

  it("creates a persisted website lead case with seeded document requests", async () => {
    const response = await app.inject({
      method: "POST",
      payload: {
        budget: "USD 650,000",
        customerName: "Aisha Rahman",
        email: "aisha@example.com",
        message: "Looking for a three-bedroom apartment and can visit this weekend.",
        phone: "+1-555-0100",
        preferredLocale: "en",
        projectInterest: "Sunrise Residences"
      },
      url: "/v1/website-leads"
    });

    expect(response.statusCode).toBe(201);

    const createdCase = response.json();

    expect(createdCase.stage).toBe("new");
    expect(createdCase.source).toBe("website");
    expect(createdCase.ownerName).toBe("Revenue Ops Queue");
    expect(createdCase.followUpStatus).toBe("on_track");
    expect(createdCase.automationStatus).toBe("active");

    const detailResponse = await app.inject({
      method: "GET",
      url: `/v1/cases/${createdCase.caseId}`
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().documentRequests).toHaveLength(3);
    expect(detailResponse.json().managerInterventions).toHaveLength(0);
  });

  it("qualifies a case, schedules a visit, updates documents, and accepts manager follow-up controls", async () => {
    const createResponse = await app.inject({
      method: "POST",
      payload: {
        customerName: "Omar Haddad",
        email: "omar@example.com",
        message: "Need an Arabic-speaking follow-up for a family home search.",
        preferredLocale: "ar",
        projectInterest: "Palm Horizon"
      },
      url: "/v1/website-leads"
    });

    const createdCase = createResponse.json();

    const qualificationResponse = await app.inject({
      method: "POST",
      payload: {
        budgetBand: "SAR 1.9M to 2.2M",
        intentSummary: "Family buyer with high intent and flexible weekend availability.",
        moveInTimeline: "Within 60 days",
        readiness: "high"
      },
      url: `/v1/cases/${createdCase.caseId}/qualification`
    });

    expect(qualificationResponse.statusCode).toBe(200);
    expect(qualificationResponse.json().stage).toBe("qualified");
    expect(qualificationResponse.json().qualificationSnapshot.readiness).toBe("high");

    const visitResponse = await app.inject({
      method: "POST",
      payload: {
        location: "Palm Horizon Discovery Center",
        scheduledAt: "2026-04-15T12:30:00.000Z"
      },
      url: `/v1/cases/${createdCase.caseId}/visits`
    });

    expect(visitResponse.statusCode).toBe(200);
    expect(visitResponse.json().stage).toBe("visit_scheduled");
    expect(visitResponse.json().currentVisit.location).toBe("Palm Horizon Discovery Center");

    const documentRequestId = visitResponse.json().documentRequests[0]?.documentRequestId;

    const documentResponse = await app.inject({
      method: "PATCH",
      payload: {
        status: "under_review"
      },
      url: `/v1/cases/${createdCase.caseId}/documents/${documentRequestId}`
    });

    expect(documentResponse.statusCode).toBe(200);
    expect(documentResponse.json().stage).toBe("documents_in_progress");
    expect(documentResponse.json().documentRequests[0]?.status).toBe("under_review");

    const followUpResponse = await app.inject({
      method: "POST",
      payload: {
        nextAction: "Manager follow-up confirmed for tomorrow morning.",
        nextActionDueAt: "2026-04-16T08:30:00.000Z",
        ownerName: "Leasing Desk Alpha"
      },
      url: `/v1/cases/${createdCase.caseId}/follow-up-plan`
    });

    expect(followUpResponse.statusCode).toBe(200);
    expect(followUpResponse.json().ownerName).toBe("Leasing Desk Alpha");
    expect(followUpResponse.json().nextAction).toBe("Manager follow-up confirmed for tomorrow morning.");

    const pauseResponse = await app.inject({
      method: "POST",
      payload: {
        status: "paused"
      },
      url: `/v1/cases/${createdCase.caseId}/automation`
    });

    expect(pauseResponse.statusCode).toBe(200);
    expect(pauseResponse.json().automationStatus).toBe("paused");

    const listResponse = await app.inject({
      method: "GET",
      url: "/v1/cases"
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().cases).toHaveLength(1);
    expect(listResponse.json().cases[0]?.stage).toBe("documents_in_progress");
    expect(listResponse.json().cases[0]?.automationStatus).toBe("paused");
  });

  it("rejects invalid payloads for mutation endpoints", async () => {
    const createResponse = await app.inject({
      method: "POST",
      payload: {
        customerName: "X",
        email: "invalid-email"
      },
      url: "/v1/website-leads"
    });

    expect(createResponse.statusCode).toBe(400);

    const missingCaseResponse = await app.inject({
      method: "POST",
      payload: {
        budgetBand: "USD 1M",
        intentSummary: "Valid qualification summary for a missing case lookup.",
        moveInTimeline: "Soon",
        readiness: "high"
      },
      url: "/v1/cases/00000000-0000-0000-0000-000000000000/qualification"
    });

    expect(missingCaseResponse.statusCode).toBe(404);

    const invalidAutomationResponse = await app.inject({
      method: "POST",
      payload: {
        status: "stopped"
      },
      url: "/v1/cases/00000000-0000-0000-0000-000000000000/automation"
    });

    expect(invalidAutomationResponse.statusCode).toBe(400);
  });
});
