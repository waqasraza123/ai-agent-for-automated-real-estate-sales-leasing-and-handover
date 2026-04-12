import type {
  CreateHandoverIntakeInput,
  CreateWebsiteLeadInput,
  CreateWebsiteLeadResult,
  ManageCaseFollowUpInput,
  PersistedCaseDetail,
  PersistedCaseSummary,
  PersistedHandoverCaseDetail,
  QualifyCaseInput,
  ScheduleVisitInput,
  UpdateAutomationStatusInput,
  UpdateDocumentRequestInput,
  UpdateHandoverTaskStatusInput
} from "@real-estate-ai/contracts";
import {
  deriveDocumentWorkflowNextAction,
  deriveHandoverCaseStatus,
  getHandoverCaseNextAction,
  getHandoverCaseNextActionDueAt,
  type FollowUpCycleResult,
  type LeadCaptureStore
} from "@real-estate-ai/database";

export class WorkflowRuleError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export async function getPersistedCaseDetail(store: LeadCaptureStore, caseId: string): Promise<PersistedCaseDetail | null> {
  return store.getCaseDetail(caseId);
}

export async function getPersistedHandoverCaseDetail(
  store: LeadCaptureStore,
  handoverCaseId: string
): Promise<PersistedHandoverCaseDetail | null> {
  return store.getHandoverCaseDetail(handoverCaseId);
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

export async function startPersistedHandoverIntake(
  store: LeadCaptureStore,
  caseId: string,
  input: CreateHandoverIntakeInput
): Promise<PersistedCaseDetail | null> {
  const caseDetail = await store.getCaseDetail(caseId);

  if (!caseDetail) {
    return null;
  }

  if (caseDetail.handoverCase) {
    throw new WorkflowRuleError("handover_case_exists");
  }

  if (!caseDetail.documentRequests.every((documentRequest) => documentRequest.status === "accepted")) {
    throw new WorkflowRuleError("documents_incomplete_for_handover");
  }

  return store.startHandoverIntake(caseId, {
    ...input,
    nextAction:
      caseDetail.preferredLocale === "ar"
        ? "بدء قائمة جاهزية التسليم مع الفريق الداخلي"
        : "Start the handover readiness checklist with the internal team",
    nextActionDueAt: createFutureTimestamp(24)
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

export async function updatePersistedHandoverTask(
  store: LeadCaptureStore,
  handoverCaseId: string,
  handoverTaskId: string,
  input: UpdateHandoverTaskStatusInput
): Promise<PersistedHandoverCaseDetail | null> {
  const handoverCase = await store.getHandoverCaseDetail(handoverCaseId);

  if (!handoverCase) {
    return null;
  }

  const updatedTasks = handoverCase.tasks.map((task) => (task.taskId === handoverTaskId ? { ...task, status: input.status } : task));
  const nextHandoverStatus = deriveHandoverCaseStatus(updatedTasks);

  return store.updateHandoverTaskStatus(handoverCaseId, handoverTaskId, {
    nextAction: getHandoverCaseNextAction(handoverCase.preferredLocale, nextHandoverStatus, updatedTasks),
    nextActionDueAt: getHandoverCaseNextActionDueAt(nextHandoverStatus, updatedTasks),
    nextHandoverStatus,
    status: input.status
  });
}

function createFutureTimestamp(hoursFromNow: number) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}
