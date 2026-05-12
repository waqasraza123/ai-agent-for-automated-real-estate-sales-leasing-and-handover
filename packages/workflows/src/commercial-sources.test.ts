import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createAlphaLeadCaptureStore, type LeadCaptureStore } from "@real-estate-ai/database";

import {
  approvePersistedCommercialFactProposal,
  createPersistedCommercialSource,
  importPersistedInventoryCsv
} from "./index";

describe("commercial source lifecycle workflows", () => {
  let store: LeadCaptureStore;

  beforeEach(async () => {
    store = await createAlphaLeadCaptureStore({ inMemory: true });
  });

  afterEach(async () => {
    await store.close();
  });

  it("imports inventory CSV rows into deterministic proposals and explicit row errors", async () => {
    const source = await createPersistedCommercialSource(store, {
      projectCode: "Palm Horizon",
      sourceName: "May inventory sheet",
      sourceType: "inventory_csv",
      tenantId: "local-alpha"
    });

    const detail = await importPersistedInventoryCsv(store, source.sourceId, {
      csvText: [
        "projectCode,unitCode,unitType,bedrooms,areaSqm,floor,view,priceSar,availabilityStatus,paymentPlanCode,handoverDate,sourceUpdatedAt",
        "Palm Horizon,U-101,Apartment,2,110,12,Sea,950000,available,PLAN-A,2027-06-01,2026-05-01T10:00:00.000Z",
        "Palm Horizon,U-102,Apartment,2,98,10,City,not-a-price,available,PLAN-B,2027-07-01,2026-05-01T10:00:00.000Z"
      ].join("\n"),
      importedByName: "Revenue Manager",
      sourceLabel: "may-inventory"
    });

    expect(detail?.latestVersion?.status).toBe("partially_imported");
    expect(detail?.latestVersion?.rowCount).toBe(2);
    expect(detail?.latestVersion?.importErrors).toEqual([
      {
        field: "priceSar",
        reason: "Price must be a whole SAR amount.",
        rowNumber: 3
      }
    ]);
    expect(detail?.inventorySnapshots.map((snapshot) => snapshot.unitCode)).toEqual(["U-101"]);
    expect(detail?.proposals.map((proposal) => `${proposal.locale}:${proposal.kind}:${proposal.unitCode}`).sort()).toEqual(
      [
        "ar:availability:U-101",
        "ar:handover_date:U-101",
        "ar:payment_plan:U-101",
        "ar:pricing:U-101",
        "ar:unit_status:U-101",
        "en:availability:U-101",
        "en:handover_date:U-101",
        "en:payment_plan:U-101",
        "en:pricing:U-101",
        "en:unit_status:U-101"
      ].sort()
    );
  });

  it("approves proposals into active source-linked facts and readiness counts", async () => {
    const source = await createPersistedCommercialSource(store, {
      projectCode: "Palm Horizon",
      sourceName: "Approved inventory sheet",
      sourceType: "inventory_csv",
      tenantId: "local-alpha"
    });
    const detail = await importPersistedInventoryCsv(store, source.sourceId, {
      csvText: [
        "projectCode,unitCode,unitType,bedrooms,areaSqm,floor,view,priceSar,availabilityStatus,paymentPlanCode,handoverDate,sourceUpdatedAt",
        "Palm Horizon,U-201,Apartment,3,140,18,Park,1250000,available,PLAN-C,2027-08-01,2026-05-01T10:00:00.000Z"
      ].join("\n"),
      importedByName: "Revenue Manager",
      sourceLabel: "approved-inventory"
    });
    const pricingProposal = detail?.proposals.find((proposal) => proposal.kind === "pricing" && proposal.locale === "en");

    expect(pricingProposal).toBeTruthy();

    const approvedProposal = await approvePersistedCommercialFactProposal(store, pricingProposal!.proposalId, {
      approvedByName: "Revenue Manager",
      expiresAt: "2099-01-01T00:00:00.000Z"
    });
    const activeFacts = await store.listActiveCommercialFacts({
      kind: "pricing",
      locale: "en",
      now: "2026-05-12T00:00:00.000Z",
      projectCode: "Palm Horizon",
      tenantId: "local-alpha"
    });
    const readiness = await store.getProjectCommercialReadinessSummary({
      projectCode: "Palm Horizon",
      tenantId: "local-alpha"
    });

    expect(approvedProposal?.state).toBe("approved");
    expect(activeFacts).toHaveLength(1);
    expect(activeFacts[0]?.evidence[0]?.sourceName).toBe("Approved inventory sheet");
    expect(activeFacts[0]?.evidence[0]?.sourceVersionLabel).toBe("approved-inventory");
    expect(readiness.activeApprovedFactsCount).toBe(1);
    expect(readiness.pendingApprovalsCount).toBe(9);
    expect(readiness.latestInventorySourceVersion?.versionLabel).toBe("approved-inventory");
  });

  it("excludes unapproved, expired, and cross-project commercial facts from grounding", async () => {
    await store.createManualCommercialFact({
      content: "Palm Horizon has an approved active starting price of SAR 950000.",
      evidenceLabel: "Manager approved price",
      expiresAt: "2099-01-01T00:00:00.000Z",
      kind: "pricing",
      locale: "en",
      projectCode: "Palm Horizon",
      scope: "whatsapp_reply",
      tenantId: "local-alpha",
      title: "Palm Horizon approved price"
    });
    await store.createManualCommercialFact({
      content: "Harbor Gate had an old approved active starting price of SAR 850000.",
      evidenceLabel: "Expired manager price",
      expiresAt: "2020-01-01T00:00:00.000Z",
      kind: "pricing",
      locale: "en",
      projectCode: "Harbor Gate",
      scope: "whatsapp_reply",
      tenantId: "local-alpha",
      title: "Harbor Gate expired price"
    });
    const source = await createPersistedCommercialSource(store, {
      projectCode: "Harbor Gate",
      sourceName: "Pending Harbor inventory",
      sourceType: "inventory_csv",
      tenantId: "local-alpha"
    });
    await importPersistedInventoryCsv(store, source.sourceId, {
      csvText: [
        "projectCode,unitCode,unitType,bedrooms,areaSqm,floor,view,priceSar,availabilityStatus,paymentPlanCode,handoverDate,sourceUpdatedAt",
        "Harbor Gate,H-101,Apartment,1,70,5,City,750000,available,PLAN-H,,2026-05-01T10:00:00.000Z"
      ].join("\n")
    });

    await expect(
      store.listApprovedCommercialFacts({
        kinds: ["pricing"],
        locale: "en",
        now: "2026-05-12T00:00:00.000Z",
        projectInterest: "Palm Horizon"
      })
    ).resolves.toHaveLength(1);
    await expect(
      store.listApprovedCommercialFacts({
        kinds: ["pricing"],
        locale: "en",
        now: "2026-05-12T00:00:00.000Z",
        projectInterest: "Harbor Gate"
      })
    ).resolves.toHaveLength(0);
    await expect(
      store.listApprovedCommercialFacts({
        kinds: ["pricing"],
        locale: "en",
        now: "2026-05-12T00:00:00.000Z",
        projectInterest: "Diriyah Heights"
      })
    ).resolves.toHaveLength(0);
  });
});
