import type {
  CaseQaPolicySignal,
  PersistedCaseDetail,
  PersistedCaseSummary,
  HandoverCustomerUpdateQaPolicySignal
} from "@real-estate-ai/contracts";

type PersistedGovernanceCase = PersistedCaseDetail | PersistedCaseSummary;

type GovernanceAttentionStatus = "follow_up_required" | "pending_review";

export interface GovernanceSignalCount {
  count: number;
  kind: "case_message" | "handover_customer_update";
  signal: CaseQaPolicySignal | HandoverCustomerUpdateQaPolicySignal;
}

export function buildManagerGovernanceSummary(
  persistedCases: PersistedGovernanceCase[],
  options: { now?: Date } = {}
) {
  const revenueAttentionCases = [...persistedCases]
    .filter((caseItem) => getRevenueGovernanceStatus(caseItem) !== null)
    .sort((left, right) =>
      compareGovernanceItems(
        getRevenueGovernanceStatus(left) ?? "follow_up_required",
        left.currentQaReview?.updatedAt ?? left.updatedAt,
        getRevenueGovernanceStatus(right) ?? "follow_up_required",
        right.currentQaReview?.updatedAt ?? right.updatedAt
      )
    );

  const handoverAttentionCases = [...persistedCases]
    .filter((caseItem) => getHandoverGovernanceStatus(caseItem) !== null)
    .sort((left, right) =>
      compareGovernanceItems(
        getHandoverGovernanceStatus(left) ?? "follow_up_required",
        left.currentHandoverCustomerUpdateQaReview?.updatedAt ?? left.updatedAt,
        getHandoverGovernanceStatus(right) ?? "follow_up_required",
        right.currentHandoverCustomerUpdateQaReview?.updatedAt ?? right.updatedAt
      )
    );

  const pendingCasesCount =
    revenueAttentionCases.filter((caseItem) => getRevenueGovernanceStatus(caseItem) === "pending_review").length +
    handoverAttentionCases.filter((caseItem) => getHandoverGovernanceStatus(caseItem) === "pending_review").length;

  const followUpRequiredCasesCount =
    revenueAttentionCases.filter((caseItem) => getRevenueGovernanceStatus(caseItem) === "follow_up_required").length +
    handoverAttentionCases.filter((caseItem) => getHandoverGovernanceStatus(caseItem) === "follow_up_required").length;

  const now = options.now ?? new Date();
  const stalePendingCasesCount =
    revenueAttentionCases.filter((caseItem) => isGovernanceItemStale(getRevenueGovernanceStatus(caseItem), caseItem.currentQaReview?.updatedAt, now)).length +
    handoverAttentionCases.filter((caseItem) =>
      isGovernanceItemStale(getHandoverGovernanceStatus(caseItem), caseItem.currentHandoverCustomerUpdateQaReview?.updatedAt, now)
    ).length;

  const policyTriggeredCasesCount =
    revenueAttentionCases.filter((caseItem) => caseItem.currentQaReview?.triggerSource === "policy_rule").length + handoverAttentionCases.length;
  const manualRequestCasesCount = revenueAttentionCases.filter((caseItem) => caseItem.currentQaReview?.triggerSource === "manual_request").length;

  const topPolicySignals = buildTopGovernanceSignals(revenueAttentionCases, handoverAttentionCases);

  return {
    followUpRequiredCasesCount,
    handoverAttentionCases,
    manualRequestCasesCount,
    pendingCasesCount,
    policyTriggeredCasesCount,
    revenueAttentionCases,
    stalePendingCasesCount,
    topPolicySignals,
    totalAttentionCasesCount: revenueAttentionCases.length + handoverAttentionCases.length,
    uniqueAttentionCaseCount: new Set(
      [...revenueAttentionCases, ...handoverAttentionCases].map((caseItem) => caseItem.caseId)
    ).size
  };
}

function buildTopGovernanceSignals(
  revenueAttentionCases: PersistedGovernanceCase[],
  handoverAttentionCases: PersistedGovernanceCase[]
): GovernanceSignalCount[] {
  const signalCounts = new Map<string, GovernanceSignalCount>();

  for (const caseItem of revenueAttentionCases) {
    for (const signal of caseItem.currentQaReview?.policySignals ?? []) {
      const key = `case:${signal}`;
      const current = signalCounts.get(key);

      signalCounts.set(key, {
        count: (current?.count ?? 0) + 1,
        kind: "case_message",
        signal
      });
    }
  }

  for (const caseItem of handoverAttentionCases) {
    for (const signal of caseItem.currentHandoverCustomerUpdateQaReview?.policySignals ?? []) {
      const key = `handover:${signal}`;
      const current = signalCounts.get(key);

      signalCounts.set(key, {
        count: (current?.count ?? 0) + 1,
        kind: "handover_customer_update",
        signal
      });
    }
  }

  return [...signalCounts.values()]
    .sort((left, right) => {
      if (left.count !== right.count) {
        return right.count - left.count;
      }

      if (left.kind !== right.kind) {
        return left.kind.localeCompare(right.kind);
      }

      return left.signal.localeCompare(right.signal);
    })
    .slice(0, 3);
}

function compareGovernanceItems(
  leftStatus: GovernanceAttentionStatus,
  leftUpdatedAt: string,
  rightStatus: GovernanceAttentionStatus,
  rightUpdatedAt: string
) {
  const leftPriority = getGovernanceStatusPriority(leftStatus);
  const rightPriority = getGovernanceStatusPriority(rightStatus);

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  return new Date(rightUpdatedAt).getTime() - new Date(leftUpdatedAt).getTime();
}

function getGovernanceStatusPriority(status: GovernanceAttentionStatus) {
  return status === "pending_review" ? 0 : 1;
}

function isGovernanceItemStale(status: GovernanceAttentionStatus | null | undefined, updatedAt: string | undefined, now: Date) {
  if (status !== "pending_review" || !updatedAt) {
    return false;
  }

  return now.getTime() - new Date(updatedAt).getTime() >= 24 * 60 * 60 * 1000;
}

function getRevenueGovernanceStatus(caseItem: PersistedGovernanceCase): GovernanceAttentionStatus | null {
  return caseItem.currentQaReview?.status === "pending_review" || caseItem.currentQaReview?.status === "follow_up_required"
    ? caseItem.currentQaReview.status
    : null;
}

function getHandoverGovernanceStatus(caseItem: PersistedGovernanceCase): GovernanceAttentionStatus | null {
  return (
    caseItem.currentHandoverCustomerUpdateQaReview?.reviewStatus === "pending_review" ||
    caseItem.currentHandoverCustomerUpdateQaReview?.reviewStatus === "follow_up_required"
  )
    ? caseItem.currentHandoverCustomerUpdateQaReview.reviewStatus
    : null;
}
