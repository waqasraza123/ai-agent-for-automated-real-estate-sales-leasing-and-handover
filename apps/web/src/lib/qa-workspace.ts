import type { PersistedCaseDetail, PersistedCaseSummary, SupportedLocale } from "@real-estate-ai/contracts";

type PersistedQaCase = PersistedCaseDetail | PersistedCaseSummary;

export function buildQaWorkspaceQueues(persistedCases: PersistedQaCase[]) {
  const qaCases = persistedCases.filter((caseItem) => caseItem.currentQaReview || caseItem.currentHandoverCustomerUpdateQaReview);

  const sortedQaCases = [...qaCases].sort((left, right) => {
    const leftPriority = getQaStatusPriority(getActiveQaStatus(left));
    const rightPriority = getQaStatusPriority(getActiveQaStatus(right));

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return new Date(getActiveQaUpdatedAt(right)).getTime() - new Date(getActiveQaUpdatedAt(left)).getTime();
  });

  return {
    approvedCases: sortedQaCases.filter((caseItem) => getActiveQaStatus(caseItem) === "approved"),
    followUpCases: sortedQaCases.filter((caseItem) => getActiveQaStatus(caseItem) === "follow_up_required"),
    pendingCases: sortedQaCases.filter((caseItem) => getActiveQaStatus(caseItem) === "pending_review"),
    qaCases: sortedQaCases
  };
}

export function getQaWorkspaceCopy(locale: SupportedLocale) {
  if (locale === "ar") {
    return {
      accessRequiredTitle: "مساحة الجودة مطلوبة",
      summary: "طابور مراجعة الجودة للحالات الحية التي تحتاج فحصاً بشرياً واضحاً للسلامة أو التفسير أو جودة الرد.",
      title: "مركز مراجعة الجودة"
    };
  }

  return {
    accessRequiredTitle: "QA workspace required",
    summary: "A QA review queue for live cases that need explicit human inspection for safety, interpretation, or response quality.",
    title: "QA review center"
  };
}

function getActiveQaStatus(caseItem: PersistedQaCase) {
  const caseQaStatus = caseItem.currentQaReview?.status;
  const handoverQaStatus = caseItem.currentHandoverCustomerUpdateQaReview?.reviewStatus;

  if (!caseQaStatus) {
    return handoverQaStatus ?? "approved";
  }

  if (!handoverQaStatus) {
    return caseQaStatus;
  }

  return getQaStatusPriority(handoverQaStatus) < getQaStatusPriority(caseQaStatus) ? handoverQaStatus : caseQaStatus;
}

function getActiveQaUpdatedAt(caseItem: PersistedQaCase) {
  const caseQaUpdatedAt = caseItem.currentQaReview?.updatedAt;
  const handoverQaUpdatedAt = caseItem.currentHandoverCustomerUpdateQaReview?.updatedAt;
  const caseQaStatus = caseItem.currentQaReview?.status;
  const handoverQaStatus = caseItem.currentHandoverCustomerUpdateQaReview?.reviewStatus;

  if (!caseQaUpdatedAt) {
    return handoverQaUpdatedAt ?? caseItem.updatedAt;
  }

  if (!handoverQaUpdatedAt) {
    return caseQaUpdatedAt;
  }

  if (!caseQaStatus || !handoverQaStatus) {
    return new Date(caseQaUpdatedAt).getTime() > new Date(handoverQaUpdatedAt).getTime() ? caseQaUpdatedAt : handoverQaUpdatedAt;
  }

  return getQaStatusPriority(handoverQaStatus) < getQaStatusPriority(caseQaStatus)
    ? handoverQaUpdatedAt
    : getQaStatusPriority(handoverQaStatus) > getQaStatusPriority(caseQaStatus)
      ? caseQaUpdatedAt
      : new Date(caseQaUpdatedAt).getTime() > new Date(handoverQaUpdatedAt).getTime()
        ? caseQaUpdatedAt
        : handoverQaUpdatedAt;
}

function getQaStatusPriority(status: "approved" | "follow_up_required" | "pending_review" | "not_required") {
  if (status === "pending_review") {
    return 0;
  }

  if (status === "follow_up_required") {
    return 1;
  }

  if (status === "approved") {
    return 2;
  }

  return 3;
}
