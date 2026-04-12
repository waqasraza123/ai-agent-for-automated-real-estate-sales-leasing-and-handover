import type {
  CreateWebsiteLeadInput,
  CreateWebsiteLeadResult,
  ManageCaseFollowUpInput,
  PersistedCaseDetail,
  PersistedCaseSummary,
  QualifyCaseInput,
  ScheduleVisitInput,
  UpdateAutomationStatusInput,
  UpdateDocumentRequestInput
} from "@real-estate-ai/contracts";
import { deriveDocumentWorkflowNextAction, type FollowUpCycleResult, type LeadCaptureStore } from "@real-estate-ai/database";

export async function getPersistedCaseDetail(store: LeadCaptureStore, caseId: string): Promise<PersistedCaseDetail | null> {
  return store.getCaseDetail(caseId);
}

export async function listPersistedCases(store: LeadCaptureStore): Promise<PersistedCaseSummary[]> {
  return store.listCases();
}

export async function managePersistedCaseFollowUp(
  store: LeadCaptureStore,
  caseId: string,
  input: ManageCaseFollowUpInput
): Promise<PersistedCaseDetail | null> {
  return store.manageCaseFollowUp(caseId, input);
}

export async function qualifyPersistedCase(
  store: LeadCaptureStore,
  caseId: string,
  input: QualifyCaseInput
): Promise<PersistedCaseDetail | null> {
  const caseDetail = await store.getCaseDetail(caseId);

  if (!caseDetail) {
    return null;
  }

  return store.applyQualification(caseId, {
    ...input,
    nextAction:
      caseDetail.preferredLocale === "ar" ? "اقتراح مواعيد الزيارة ومتابعة التأكيد" : "Offer visit slots and confirm the preferred appointment",
    nextActionDueAt: createFutureTimestamp(4)
  });
}

export async function runPersistedFollowUpCycle(
  store: LeadCaptureStore,
  input?: {
    limit?: number;
    runAt?: string;
  }
): Promise<FollowUpCycleResult> {
  return store.runDueFollowUpCycle({
    limit: input?.limit ?? 25,
    runAt: input?.runAt ?? new Date().toISOString()
  });
}

export async function schedulePersistedVisit(
  store: LeadCaptureStore,
  caseId: string,
  input: ScheduleVisitInput
): Promise<PersistedCaseDetail | null> {
  const caseDetail = await store.getCaseDetail(caseId);

  if (!caseDetail) {
    return null;
  }

  return store.scheduleVisit(caseId, {
    ...input,
    nextAction:
      caseDetail.preferredLocale === "ar"
        ? "إرسال تذكير الزيارة والتأكد من الحضور"
        : "Send the visit reminder and confirm attendance",
    nextActionDueAt: input.scheduledAt
  });
}

export async function setPersistedAutomationStatus(
  store: LeadCaptureStore,
  caseId: string,
  input: UpdateAutomationStatusInput
): Promise<PersistedCaseDetail | null> {
  return store.setAutomationStatus(caseId, {
    status: input.status
  });
}

export async function submitWebsiteLead(
  store: LeadCaptureStore,
  input: CreateWebsiteLeadInput
): Promise<CreateWebsiteLeadResult> {
  return store.createWebsiteLeadCase({
    ...input,
    nextAction:
      input.preferredLocale === "ar"
        ? "مراجعة الحالة وإرسال أول رد باللغة العربية"
        : "Review the lead and send the first response",
    nextActionDueAt: createFutureTimestamp(0.25)
  });
}

export async function updatePersistedDocumentRequest(
  store: LeadCaptureStore,
  caseId: string,
  documentRequestId: string,
  input: UpdateDocumentRequestInput
): Promise<PersistedCaseDetail | null> {
  const caseDetail = await store.getCaseDetail(caseId);

  if (!caseDetail) {
    return null;
  }

  const updatedDocumentRequests = caseDetail.documentRequests.map((documentRequest) =>
    documentRequest.documentRequestId === documentRequestId ? { ...documentRequest, status: input.status } : documentRequest
  );

  return store.updateDocumentRequestStatus(caseId, documentRequestId, {
    nextAction: deriveDocumentWorkflowNextAction(updatedDocumentRequests, caseDetail.preferredLocale),
    nextActionDueAt: createFutureTimestamp(input.status === "accepted" ? 4 : 24),
    status: input.status
  });
}

function createFutureTimestamp(hoursFromNow: number) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}
