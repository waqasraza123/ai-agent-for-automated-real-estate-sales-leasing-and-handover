import type { PersistedCaseDetail, PersistedCaseSummary, SupportedLocale } from "@real-estate-ai/contracts";

import { buildCsvDocument, buildExportSummaryCsvRows, escapeCsvValue, parseExportRecipient } from "./export-summary";
import type { ExportRecipient } from "./export-summary";
import { buildManagerWorkspaceQueues } from "./manager-workspace";
import { hasPersistedLatestHumanReplyEscalation } from "./persisted-case-presenters";

type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

type PersistedRevenueManagerCase = PersistedCaseDetail | PersistedCaseSummary;

export type RevenueManagerQueueFilter = "all" | "escalated_handoffs";
export type RevenueManagerBatchDriftFilter = "changed_later";
export type RevenueManagerBatchDriftReasonFilter = "follow_up_only" | "later_bulk_reset_only" | "mixed";

export interface RevenueManagerFilters {
  bulkBatchId?: string;
  batchDrift?: RevenueManagerBatchDriftFilter;
  batchDriftReason?: RevenueManagerBatchDriftReasonFilter;
  ownerName?: string;
  queue: RevenueManagerQueueFilter;
}

export interface RevenueManagerBulkBatchScope {
  batchId: string;
  caseCount: number;
  clearedCaseCount: number;
  currentOwnerNames: string[];
  savedAt: string;
  scopedOwnerName: string;
  stillEscalatedCaseCount: number;
}

export interface RevenueManagerBatchOwnerGroup {
  cases: PersistedRevenueManagerCase[];
  caseCount: number;
  clearedCaseCount: number;
  ownerName: string;
  stillEscalatedCaseCount: number;
}

export interface RevenueManagerScope {
  batchOwnerGroups: RevenueManagerBatchOwnerGroup[];
  batchScope?: RevenueManagerBulkBatchScope;
  focusedCases: PersistedRevenueManagerCase[];
  ownerScopedCases: PersistedRevenueManagerCase[];
  ownerScopedQueues: ReturnType<typeof buildManagerWorkspaceQueues>;
}

interface RevenueManagerBatchExportOptions {
  filters?: Partial<RevenueManagerFilters>;
  generatedAt?: string;
  locale?: SupportedLocale;
  recipient?: ExportRecipient;
}

export type RevenueManagerBatchHistoryEntryType = "follow_up_update" | "later_bulk_reset" | "scoped_batch_reset";

export interface RevenueManagerBatchHistoryEntry {
  batchCaseCount?: number;
  batchId?: string;
  caseId: string;
  createdAt: string;
  currentOwnerName: string;
  currentRiskStatus: "cleared" | "still_escalated";
  customerName: string;
  nextAction: string;
  nextActionDueAt: string;
  ownerName: string;
  scopedOwnerName?: string;
  type: RevenueManagerBatchHistoryEntryType;
}

export interface RevenueManagerBatchHistoryCase {
  caseId: string;
  currentOwnerName: string;
  currentRiskStatus: "cleared" | "still_escalated";
  customerName: string;
  entries: RevenueManagerBatchHistoryEntry[];
}

export interface RevenueManagerBatchHistorySummary {
  casesWithHistoryCount: number;
  casesWithLaterChangesCount: number;
  historyCases: RevenueManagerBatchHistoryCase[];
  laterBulkResetCount: number;
  postBatchFollowUpUpdateCount: number;
}

export interface RevenueManagerBatchDriftReasonSummary {
  caseId: string;
  laterBulkResetCount: number;
  latestDriftAt: string;
  postBatchFollowUpUpdateCount: number;
  reasons: Array<"follow_up_update" | "later_bulk_reset">;
}

export interface RevenueManagerBatchDriftReasonMixSummary {
  driftedCaseCount: number;
  followUpUpdateOnlyCaseCount: number;
  laterBulkResetOnlyCaseCount: number;
  mixedReasonCaseCount: number;
}

interface RevenueManagerScopeOptions {
  changedCaseIds?: ReadonlySet<string>;
}

export const revenueManagerFocusedQueueId = "revenue-focused-queue";

export function parseRevenueManagerFilters(searchParams: SearchParamsInput): RevenueManagerFilters {
  const rawSearchParams =
    searchParams instanceof URLSearchParams ? Object.fromEntries(searchParams.entries()) : normalizeSearchParamRecord(searchParams);
  const bulkBatchId = sanitizeBatchId(rawSearchParams.bulkBatchId);
  const batchDrift = sanitizeBatchDrift(rawSearchParams.batchDrift);
  const batchDriftReason = sanitizeBatchDriftReason(rawSearchParams.batchDriftReason);
  const ownerName = sanitizeOwnerName(rawSearchParams.ownerName);
  const filters: RevenueManagerFilters = {
    queue: rawSearchParams.queue === "escalated_handoffs" ? "escalated_handoffs" : "all"
  };

  if (bulkBatchId) {
    filters.bulkBatchId = bulkBatchId;
  }

  if (ownerName) {
    filters.ownerName = ownerName;
  }

  if (batchDrift && bulkBatchId) {
    filters.batchDrift = batchDrift;
  }

  if (batchDrift && batchDriftReason && bulkBatchId) {
    filters.batchDriftReason = batchDriftReason;
  }

  return filters;
}

export function buildRevenueManagerHref(
  locale: SupportedLocale,
  filters: Partial<RevenueManagerFilters> = {},
  options: { hash?: string } = {}
) {
  const searchParams = new URLSearchParams();

  if (filters.queue && filters.queue !== "all") {
    searchParams.set("queue", filters.queue);
  }

  if (filters.ownerName) {
    searchParams.set("ownerName", filters.ownerName);
  }

  if (filters.bulkBatchId) {
    searchParams.set("bulkBatchId", filters.bulkBatchId);
  }

  if (filters.batchDrift) {
    searchParams.set("batchDrift", filters.batchDrift);
  }

  if (filters.batchDriftReason) {
    searchParams.set("batchDriftReason", filters.batchDriftReason);
  }

  const serialized = searchParams.toString();
  const hash = options.hash ? `#${options.hash}` : "";
  const path = serialized.length > 0 ? `/${locale}/manager/revenue?${serialized}` : `/${locale}/manager/revenue`;

  return `${path}${hash}`;
}

export function buildRevenueManagerExportHref(
  locale: SupportedLocale,
  filters: Partial<RevenueManagerFilters> = {},
  options: { recipient?: ExportRecipient } = {}
) {
  const searchParams = buildRevenueManagerSearchParams(filters);

  if (options.recipient && options.recipient !== "manager") {
    searchParams.set("recipient", options.recipient);
  }

  const serialized = searchParams.toString();

  return serialized.length > 0 ? `/${locale}/manager/revenue/export?${serialized}` : `/${locale}/manager/revenue/export`;
}

export function buildRevenueManagerScope(
  persistedCases: PersistedRevenueManagerCase[],
  filters: RevenueManagerFilters,
  options: RevenueManagerScopeOptions = {}
): RevenueManagerScope {
  const ownerScopedCases = filters.ownerName
    ? persistedCases.filter((caseItem) => caseItem.ownerName === filters.ownerName)
    : persistedCases;
  const allBatchScopedCases = filters.bulkBatchId
    ? [...ownerScopedCases]
        .filter((caseItem) => caseItem.latestManagerFollowUp?.bulkAction?.batchId === filters.bulkBatchId)
        .sort((left, right) => compareBatchScopedCases(left, right))
    : null;
  const batchScopedCases =
    filters.batchDrift === "changed_later" && allBatchScopedCases && options.changedCaseIds
      ? allBatchScopedCases.filter((caseItem) => options.changedCaseIds?.has(caseItem.caseId) ?? false)
      : allBatchScopedCases;
  const ownerScopedQueues = buildManagerWorkspaceQueues(ownerScopedCases);
  const fullBatchScope = allBatchScopedCases ? buildRevenueManagerBulkBatchScope(allBatchScopedCases) : undefined;
  const batchScope =
    batchScopedCases && batchScopedCases.length > 0
      ? buildRevenueManagerBulkBatchScope(batchScopedCases)
      : filters.batchDrift === "changed_later" && fullBatchScope
        ? {
            ...fullBatchScope,
            clearedCaseCount: 0,
            currentOwnerNames: [],
            stillEscalatedCaseCount: 0
          }
        : undefined;

  return {
    batchOwnerGroups: batchScopedCases ? buildRevenueManagerBatchOwnerGroups(batchScopedCases) : [],
    ...(batchScope ? { batchScope } : {}),
    focusedCases:
      batchScopedCases ??
      (filters.queue === "escalated_handoffs" ? ownerScopedQueues.escalatedPostReplyHandoffCases : ownerScopedQueues.revenueAttentionCases),
    ownerScopedCases,
    ownerScopedQueues
  };
}

export function buildRevenueManagerBatchExportCsv(
  scope: RevenueManagerScope,
  options: RevenueManagerBatchExportOptions = {}
) {
  if (!scope.batchScope) {
    return null;
  }

  const ownerGroups = new Map(scope.batchOwnerGroups.map((ownerGroup) => [ownerGroup.ownerName, ownerGroup]));
  const summaryRows = buildRevenueManagerBatchExportSummaryRows(scope, options);
  const headers = [
    "batchId",
    "batchSavedAt",
    "batchScopedOwnerName",
    "batchVisibleCaseCount",
    "batchStillEscalatedCaseCount",
    "batchClearedCaseCount",
    "currentOwnerName",
    "currentOwnerGroupCaseCount",
    "currentOwnerGroupStillEscalatedCaseCount",
    "currentOwnerGroupClearedCaseCount",
    "riskStatus",
    "customerName",
    "caseReference",
    "caseId",
    "projectInterest",
    "preferredLocale",
    "nextAction",
    "nextActionDueAt",
    "followUpStatus",
    "openInterventionsCount",
    "latestHumanReplySentBy",
    "latestHumanReplySentAt",
    "latestHumanReplyApprovedFromQa",
    "latestManagerFollowUpSavedAt",
    "latestManagerFollowUpOwnerName",
    "latestManagerFollowUpNextAction"
  ];
  const rows = scope.focusedCases.map((caseItem) => {
    const ownerGroup = ownerGroups.get(caseItem.ownerName);
    const isStillEscalated = hasPersistedLatestHumanReplyEscalation(
      caseItem.ownerName,
      caseItem.latestHumanReply,
      caseItem.followUpStatus,
      caseItem.openInterventionsCount
    );

    return [
      scope.batchScope?.batchId,
      scope.batchScope?.savedAt,
      scope.batchScope?.scopedOwnerName,
      scope.focusedCases.length,
      scope.batchScope?.stillEscalatedCaseCount,
      scope.batchScope?.clearedCaseCount,
      caseItem.ownerName,
      ownerGroup?.caseCount ?? 0,
      ownerGroup?.stillEscalatedCaseCount ?? 0,
      ownerGroup?.clearedCaseCount ?? 0,
      isStillEscalated ? "still_escalated" : "cleared",
      caseItem.customerName,
      buildCaseReferenceCode(caseItem.caseId),
      caseItem.caseId,
      caseItem.projectInterest,
      caseItem.preferredLocale,
      caseItem.nextAction,
      caseItem.nextActionDueAt,
      caseItem.followUpStatus,
      caseItem.openInterventionsCount,
      caseItem.latestHumanReply?.sentByName ?? "",
      caseItem.latestHumanReply?.sentAt ?? "",
      caseItem.latestHumanReply ? String(caseItem.latestHumanReply.approvedFromQa) : "",
      caseItem.latestManagerFollowUp?.savedAt ?? "",
      caseItem.latestManagerFollowUp?.ownerName ?? "",
      caseItem.latestManagerFollowUp?.nextAction ?? ""
    ].map((value) => escapeCsvValue(typeof value === "string" ? value : value == null ? "" : String(value)));
  });

  return buildCsvDocument(headers, rows, { summaryRows });
}

export function buildRevenueManagerBatchHistory(
  scope: RevenueManagerScope,
  caseDetails: PersistedCaseDetail[]
): RevenueManagerBatchHistorySummary | null {
  if (!scope.batchScope) {
    return null;
  }

  const detailById = new Map(caseDetails.map((caseDetail) => [caseDetail.caseId, caseDetail]));
  const batchSavedAt = new Date(scope.batchScope.savedAt).getTime();
  const historyCases: RevenueManagerBatchHistoryCase[] = [];
  let laterBulkResetCount = 0;
  let postBatchFollowUpUpdateCount = 0;
  let casesWithLaterChangesCount = 0;

  for (const caseItem of scope.focusedCases) {
    const caseDetail = detailById.get(caseItem.caseId);

    if (!caseDetail) {
      continue;
    }

    const currentRiskStatus = isStillEscalated(caseItem) ? "still_escalated" : "cleared";
    const entries = caseDetail.auditEvents
      .filter((event) => event.eventType === "manager_follow_up_updated")
      .map((event) => hydrateBatchHistoryEntry(caseDetail, caseItem.ownerName, currentRiskStatus, scope.batchScope?.batchId, event))
      .filter((entry): entry is RevenueManagerBatchHistoryEntry => {
        if (!entry) {
          return false;
        }

        if (entry.type === "scoped_batch_reset") {
          return true;
        }

        return new Date(entry.createdAt).getTime() >= batchSavedAt;
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    if (entries.length === 0) {
      continue;
    }

    if (entries.some((entry) => entry.type !== "scoped_batch_reset")) {
      casesWithLaterChangesCount += 1;
    }

    laterBulkResetCount += entries.filter((entry) => entry.type === "later_bulk_reset").length;
    postBatchFollowUpUpdateCount += entries.filter((entry) => entry.type === "follow_up_update").length;

    historyCases.push({
      caseId: caseDetail.caseId,
      currentOwnerName: caseItem.ownerName,
      currentRiskStatus,
      customerName: caseDetail.customerName,
      entries
    });
  }

  return {
    casesWithHistoryCount: historyCases.length,
    casesWithLaterChangesCount,
    historyCases,
    laterBulkResetCount,
    postBatchFollowUpUpdateCount
  };
}

export function buildRevenueManagerDriftedCaseIds(batchHistory: RevenueManagerBatchHistorySummary | null) {
  if (!batchHistory) {
    return [];
  }

  return buildRevenueManagerBatchDriftReasonSummaries(batchHistory).map((historyCase) => historyCase.caseId);
}

export function buildRevenueManagerDriftedCaseIdsByReason(
  batchHistory: RevenueManagerBatchHistorySummary | null,
  reason: RevenueManagerBatchDriftReasonFilter
) {
  return buildRevenueManagerBatchDriftReasonSummaries(batchHistory)
    .filter((summary) => getRevenueManagerBatchDriftReasonFilter(summary) === reason)
    .map((summary) => summary.caseId);
}

export function buildRevenueManagerBatchDriftReasonSummaries(batchHistory: RevenueManagerBatchHistorySummary | null) {
  if (!batchHistory) {
    return [];
  }

  return batchHistory.historyCases.flatMap((historyCase) => {
    const laterBulkResetCount = historyCase.entries.filter((entry) => entry.type === "later_bulk_reset").length;
    const postBatchFollowUpUpdateCount = historyCase.entries.filter((entry) => entry.type === "follow_up_update").length;

    if (laterBulkResetCount === 0 && postBatchFollowUpUpdateCount === 0) {
      return [];
    }

    const latestDriftEntry = historyCase.entries.find((entry) => entry.type !== "scoped_batch_reset");

    if (!latestDriftEntry) {
      return [];
    }

    return [
      {
        caseId: historyCase.caseId,
        laterBulkResetCount,
        latestDriftAt: latestDriftEntry.createdAt,
        postBatchFollowUpUpdateCount,
        reasons: [
          ...(postBatchFollowUpUpdateCount > 0 ? (["follow_up_update"] as const) : []),
          ...(laterBulkResetCount > 0 ? (["later_bulk_reset"] as const) : [])
        ]
      }
    ];
  });
}

export function buildRevenueManagerBatchDriftReasonMixSummary(
  batchHistory: RevenueManagerBatchHistorySummary | null
): RevenueManagerBatchDriftReasonMixSummary {
  const driftReasonSummaries = buildRevenueManagerBatchDriftReasonSummaries(batchHistory);

  return driftReasonSummaries.reduce<RevenueManagerBatchDriftReasonMixSummary>(
    (summary, reasonSummary) => {
      if (reasonSummary.reasons.length > 1) {
        return {
          ...summary,
          driftedCaseCount: summary.driftedCaseCount + 1,
          mixedReasonCaseCount: summary.mixedReasonCaseCount + 1
        };
      }

      if (reasonSummary.reasons[0] === "later_bulk_reset") {
        return {
          ...summary,
          driftedCaseCount: summary.driftedCaseCount + 1,
          laterBulkResetOnlyCaseCount: summary.laterBulkResetOnlyCaseCount + 1
        };
      }

      return {
        ...summary,
        driftedCaseCount: summary.driftedCaseCount + 1,
        followUpUpdateOnlyCaseCount: summary.followUpUpdateOnlyCaseCount + 1
      };
    },
    {
      driftedCaseCount: 0,
      followUpUpdateOnlyCaseCount: 0,
      laterBulkResetOnlyCaseCount: 0,
      mixedReasonCaseCount: 0
    }
  );
}

export function getRevenueManagerBatchDriftReasonFilter(
  summary: RevenueManagerBatchDriftReasonSummary
): RevenueManagerBatchDriftReasonFilter {
  if (summary.reasons.length > 1) {
    return "mixed";
  }

  return summary.reasons[0] === "later_bulk_reset" ? "later_bulk_reset_only" : "follow_up_only";
}

function normalizeSearchParamRecord(searchParams: SearchParamsInput) {
  if (!searchParams) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(searchParams).flatMap(([key, value]) => {
      if (typeof value === "undefined") {
        return [];
      }

      if (Array.isArray(value)) {
        return value.length > 0 ? [[key, value[0]]] : [];
      }

      return [[key, value]];
    })
  );
}

function buildRevenueManagerSearchParams(filters: Partial<RevenueManagerFilters>) {
  const searchParams = new URLSearchParams();

  if (filters.queue && filters.queue !== "all") {
    searchParams.set("queue", filters.queue);
  }

  if (filters.ownerName) {
    searchParams.set("ownerName", filters.ownerName);
  }

  if (filters.bulkBatchId) {
    searchParams.set("bulkBatchId", filters.bulkBatchId);
  }

  if (filters.batchDrift) {
    searchParams.set("batchDrift", filters.batchDrift);
  }

  if (filters.batchDriftReason) {
    searchParams.set("batchDriftReason", filters.batchDriftReason);
  }

  return searchParams;
}

function buildRevenueManagerBatchExportSummaryRows(
  scope: RevenueManagerScope,
  options: RevenueManagerBatchExportOptions
) {
  if (!scope.batchScope) {
    return [];
  }

  const locale = options.locale ?? "en";
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const recipient = options.recipient ?? "manager";
  const audience = getRevenueManagerExportAudience(locale, scope, recipient, options.filters);
  const riskPosture = getRevenueManagerExportRiskPosture(locale, scope);
  const scopeLabel = getRevenueManagerExportScopeLabel(locale, options.filters);
  const shareSummary = getRevenueManagerExportShareSummary(locale, scope, recipient, options.filters);
  const recommendationStatus = getRevenueManagerExportRecommendationStatus(locale, recipient, options.filters);
  const recommendationRationale = getRevenueManagerExportRecommendationRationale(locale, scope, recipient, options.filters);
  const comparisonSummary = getRevenueManagerExportComparisonSummary(locale, scope, recipient, options.filters);
  const ownerHandoffContext = getRevenueManagerExportOwnerHandoffContext(locale, scope, recipient);
  return buildExportSummaryCsvRows(locale, [
    { field: "generated_at", value: generatedAt },
    { field: "recipient_variant", value: recipient },
    { field: "intended_audience", value: audience },
    { field: "risk_posture", value: riskPosture },
    { field: "selected_scope", value: scopeLabel },
    { field: "recommendation_status", value: recommendationStatus },
    { field: "selection_rationale", value: recommendationRationale },
    { field: "scope_comparison", value: comparisonSummary },
    { field: "owner_handoff_context", value: ownerHandoffContext },
    { field: "share_summary", value: shareSummary },
    { field: "batch_id", value: scope.batchScope.batchId },
    { field: "batch_saved_at", value: scope.batchScope.savedAt },
    { field: "scoped_owner", value: scope.batchScope.scopedOwnerName },
    { field: "visible_case_count", value: String(scope.focusedCases.length) },
    { field: "still_escalated_case_count", value: String(scope.batchScope.stillEscalatedCaseCount) },
    { field: "cleared_case_count", value: String(scope.batchScope.clearedCaseCount) }
  ]);
}

function getRevenueManagerExportAudience(
  locale: SupportedLocale,
  scope: RevenueManagerScope,
  recipient: ExportRecipient,
  filters?: Partial<RevenueManagerFilters>
) {
  if (recipient === "qa") {
    return locale === "ar" ? "مراجعة الجودة وحوكمة الإيرادات" : "QA review and revenue governance";
  }

  if (recipient === "operations") {
    return locale === "ar" ? "ملاك المتابعة الحاليون وقيادة العمليات" : "Current follow-up owners and operations leads";
  }

  if (locale === "ar") {
    if (filters?.batchDriftReason === "mixed") {
      return "قيادة الإيرادات مع مراجعة الجودة";
    }

    if (filters?.batchDrift === "changed_later") {
      return "قيادة الإيرادات وملاك المتابعة الحاليون";
    }

    return scope.batchScope && scope.batchScope.stillEscalatedCaseCount > 0 ? "قيادة العمليات والإيرادات" : "مراجعة العمليات";
  }

  if (filters?.batchDriftReason === "mixed") {
    return "Revenue leadership and QA follow-up";
  }

  if (filters?.batchDrift === "changed_later") {
    return "Revenue managers and current follow-up owners";
  }

  return scope.batchScope && scope.batchScope.stillEscalatedCaseCount > 0 ? "Revenue and operations leadership" : "Operations review";
}

function getRevenueManagerExportRiskPosture(locale: SupportedLocale, scope: RevenueManagerScope) {
  if (!scope.batchScope) {
    return locale === "ar" ? "غير متاح" : "Unavailable";
  }

  if (scope.batchScope.stillEscalatedCaseCount > 0 && scope.batchScope.clearedCaseCount > 0) {
    return locale === "ar" ? "ضغط حي مختلط مع حالات مفلترة" : "Mixed live pressure with cleared cases";
  }

  if (scope.batchScope.stillEscalatedCaseCount > 0) {
    return locale === "ar" ? "ضغط حي يتطلب متابعة تشغيلية" : "Live pressure requiring operational follow-up";
  }

  return locale === "ar" ? "مراجعة استقرار بعد الاحتواء" : "Stability review after containment";
}

function getRevenueManagerExportScopeLabel(locale: SupportedLocale, filters?: Partial<RevenueManagerFilters>) {
  if (locale === "ar") {
    if (filters?.batchDriftReason === "follow_up_only") {
      return "انجراف المتابعة فقط";
    }

    if (filters?.batchDriftReason === "later_bulk_reset_only") {
      return "انجراف الدفعات فقط";
    }

    if (filters?.batchDriftReason === "mixed") {
      return "انجراف مختلط";
    }

    if (filters?.batchDrift === "changed_later") {
      return "الحالات التي تغيّرت لاحقاً";
    }

    return "كامل الحالات المتأثرة";
  }

  if (filters?.batchDriftReason === "follow_up_only") {
    return "Follow-up-only drift";
  }

  if (filters?.batchDriftReason === "later_bulk_reset_only") {
    return "Bulk-reset-only drift";
  }

  if (filters?.batchDriftReason === "mixed") {
    return "Mixed-reason drift";
  }

  if (filters?.batchDrift === "changed_later") {
    return "Changed-later cases";
  }

  return "Full affected cases";
}

function getRevenueManagerExportShareSummary(
  locale: SupportedLocale,
  scope: RevenueManagerScope,
  recipient: ExportRecipient,
  filters?: Partial<RevenueManagerFilters>
) {
  if (!scope.batchScope) {
    return locale === "ar" ? "لا يوجد نطاق دفعة صالح للمشاركة." : "No valid batch scope is available for sharing.";
  }

  const visibleCount = scope.focusedCases.length;
  const stillEscalatedCount = scope.batchScope.stillEscalatedCaseCount;
  const clearedCount = scope.batchScope.clearedCaseCount;

  if (recipient === "qa") {
    return locale === "ar"
      ? `هذا الملف مهيأ لمراجعة الجودة لأنه يجمع ${visibleCount} حالات حيّة مع ${stillEscalatedCount} ما زالت متصاعدة و${clearedCount} خرجت من الخطر داخل نفس مسار الحوكمة.`
      : `This export is packaged for QA review because it keeps ${visibleCount} live cases together with ${stillEscalatedCount} still escalated and ${clearedCount} now cleared under the same governance path.`;
  }

  if (recipient === "operations") {
    return locale === "ar"
      ? `هذا الملف مهيأ للتنفيذ التشغيلي لأنه يجمع ${visibleCount} حالات حيّة مع ${stillEscalatedCount} ما زالت تحتاج متابعة و${clearedCount} حالات تم احتواؤها داخل نفس النطاق.`
      : `This export is packaged for operational execution because it keeps ${visibleCount} live cases together with ${stillEscalatedCount} still needing follow-up and ${clearedCount} already contained in the same scope.`;
  }

  if (locale === "ar") {
    if (filters?.batchDriftReason === "mixed") {
      return `هذا الملف يركّز على ${visibleCount} حالات تحمل أسباب انجراف مختلطة، منها ${stillEscalatedCount} ما زالت متصاعدة و${clearedCount} خرجت من الخطر داخل النطاق الحالي.`;
    }

    if (filters?.batchDrift === "changed_later") {
      return `هذا الملف يحصر ${visibleCount} حالات تغيّرت بعد إعادة الضبط الأصلية، مع ${stillEscalatedCount} حالات ما زالت متصاعدة و${clearedCount} حالات مفلترة داخل العرض الحالي.`;
    }

    return `هذا الملف يقدّم الأثر الكامل لـ ${visibleCount} حالات حيّة من الدفعة، مع ${stillEscalatedCount} حالات ما زالت متصاعدة و${clearedCount} حالات مفلترة للمراجعة التشغيلية.`;
  }

  if (filters?.batchDriftReason === "mixed") {
    return `This export isolates ${visibleCount} mixed-reason drifted cases, including ${stillEscalatedCount} still escalated and ${clearedCount} now cleared inside the current scope.`;
  }

  if (filters?.batchDrift === "changed_later") {
    return `This export narrows to ${visibleCount} cases that changed after the original bulk reset, with ${stillEscalatedCount} still escalated and ${clearedCount} now cleared in the visible scope.`;
  }

  return `This export keeps the full live batch outcome across ${visibleCount} cases, including ${stillEscalatedCount} still escalated and ${clearedCount} now cleared for operational review.`;
}

function getRevenueManagerExportRecommendationStatus(
  locale: SupportedLocale,
  recipient: ExportRecipient,
  filters?: Partial<RevenueManagerFilters>
) {
  if (recipient === "qa") {
    return locale === "ar" ? "صيغة مراجعة جودة" : "QA review variant";
  }

  if (recipient === "operations") {
    return locale === "ar" ? "صيغة متابعة تشغيلية" : "Operations action variant";
  }

  if (locale === "ar") {
    return filters?.batchDrift || filters?.batchDriftReason ? "نطاق موصى به من تقرير الحوكمة" : "نطاق مراجعة شامل";
  }

  return filters?.batchDrift || filters?.batchDriftReason
    ? "Recommended scope from governance report"
    : "Broad review scope";
}

function getRevenueManagerExportRecommendationRationale(
  locale: SupportedLocale,
  scope: RevenueManagerScope,
  recipient: ExportRecipient,
  filters?: Partial<RevenueManagerFilters>
) {
  const visibleCount = scope.focusedCases.length;

  if (recipient === "qa") {
    return locale === "ar"
      ? `اختيرت هذه الصيغة لأنها تحتفظ بـ ${visibleCount} حالات حيّة مع سياق التوصية نفسه حتى تتمكن الجودة من مراجعة سبب الاختيار من دون فقد أثر المخاطر الحالية.`
      : `This variant was chosen because it preserves the same ${visibleCount} live cases with their recommendation context, so QA can review why this scope was selected without losing the current risk picture.`;
  }

  if (recipient === "operations") {
    return locale === "ar"
      ? `اختيرت هذه الصيغة لأنها تبقي الحالات القابلة للتنفيذ في المقدمة حتى يتمكن ملاك المتابعة الحاليون من العمل على نفس النطاق الذي أوصى به التقرير.`
      : "This variant was chosen because it keeps the action-ready cases and recommendation context together for the current follow-up owners who need to execute the next step.";
  }

  if (locale === "ar") {
    if (filters?.batchDriftReason === "mixed") {
      return `اختير هذا النطاق لأنه يعزل ${visibleCount} حالات تجمع بين تحديثات متابعة فردية ودفعات جماعية لاحقة، وهي أعلى فئة مخاطرة عند مشاركة أثر الانجراف.`;
    }

    if (filters?.batchDriftReason === "follow_up_only") {
      return `اختير هذا النطاق لأنه يحصر الحالات التي انجرفت بسبب تحديثات متابعة فردية فقط، ما يجعله أوضح لتقييم انضباط الملاك الحاليين.`;
    }

    if (filters?.batchDriftReason === "later_bulk_reset_only") {
      return `اختير هذا النطاق لأنه يركّز على الحالات التي تأثرت بإعادات ضبط جماعية لاحقة فقط، ما يوضح أثر التدخلات المجمعة بعد الدفعة الأصلية.`;
    }

    if (filters?.batchDrift === "changed_later") {
      return `اختير هذا النطاق لأنه يرفع فقط الحالات التي تغيّرت بعد إعادة الضبط الأصلية بدلاً من كامل الدفعة، لتسريع المراجعة التشغيلية على الحالات التي ما زالت تحتاج تفسيراً.`;
    }

    return `اختير هذا النطاق لأنه يحافظ على الصورة الكاملة للدفعة الحية عندما تكون مراجعة كل الحالات المتأثرة أهم من تضييق سبب الانجراف.`;
  }

  if (filters?.batchDriftReason === "mixed") {
    return `This scope was chosen because it isolates ${visibleCount} cases touched by both later follow-up saves and later bulk resets, which is the highest-risk drift pattern to forward outside the product.`;
  }

  if (filters?.batchDriftReason === "follow_up_only") {
    return "This scope was chosen because it keeps the export focused on cases drifted only by later individual follow-up saves, making current-owner discipline easier to review.";
  }

  if (filters?.batchDriftReason === "later_bulk_reset_only") {
    return "This scope was chosen because it isolates cases changed only by later bulk resets, making repeated batch intervention effects easier to explain.";
  }

  if (filters?.batchDrift === "changed_later") {
    return "This scope was chosen because it keeps only the cases that moved after the original bulk reset, instead of forwarding the full batch outcome.";
  }

  return "This scope was chosen because the full live batch picture is more useful than narrowing to one drift reason.";
}

function getRevenueManagerExportComparisonSummary(
  locale: SupportedLocale,
  scope: RevenueManagerScope,
  recipient: ExportRecipient,
  filters?: Partial<RevenueManagerFilters>
) {
  const visibleCount = scope.focusedCases.length;
  const fullScopeCount = scope.batchScope?.caseCount ?? visibleCount;
  const excludedCount = Math.max(fullScopeCount - visibleCount, 0);

  if (recipient === "qa") {
    return locale === "ar"
      ? "تحافظ هذه الصيغة على مقارنة النطاق كما هي حتى تبقى مراجعة الجودة مرتبطة بنفس سبب التوصية وليس بسياق تشغيلي مختلف."
      : "This variant preserves the same scope comparison so QA review stays anchored to the recommendation itself rather than a different operational framing.";
  }

  if (recipient === "operations") {
    return locale === "ar"
      ? "تحافظ هذه الصيغة على مقارنة النطاق كما هي حتى يعرف الملاك الحاليون ما الذي استُبعد من العرض الأوسع قبل تنفيذ المتابعة."
      : "This variant preserves the same scope comparison so current owners can see what was excluded from the broader batch before they act.";
  }

  if (locale === "ar") {
    if (filters?.batchDriftReason || filters?.batchDrift === "changed_later") {
      return excludedCount > 0
        ? `يستبعد هذا النطاق ${excludedCount} حالات من العرض الأوسع حتى يركّز فقط على الحالات التي تفسر سبب التوصية الحالية.`
        : "لا يستبعد هذا النطاق حالات إضافية من العرض الأوسع، لكنه يحافظ على سبب التوصية الحالي واضحاً داخل الملف.";
    }

    return "يمثل هذا التصدير النطاق الأوسع نفسه، لذا لا توجد مقارنة أضيق محفوظة داخل الملف الحالي.";
  }

  if (filters?.batchDriftReason || filters?.batchDrift === "changed_later") {
    return excludedCount > 0
      ? `This scope excludes ${excludedCount} cases from the broader batch view so the forwarded file stays focused on the reason it was recommended.`
      : "This scope does not exclude additional cases from the broader view, but it still preserves the recommendation context for the forwarded file.";
  }

  return "This export already represents the broadest live batch scope, so no narrower recommendation comparison is embedded here.";
}

function getRevenueManagerExportOwnerHandoffContext(
  locale: SupportedLocale,
  scope: RevenueManagerScope,
  recipient: ExportRecipient
) {
  const ownerCount = scope.batchOwnerGroups.length;
  const ownerNames = scope.batchOwnerGroups.map((group) => group.ownerName);

  if (recipient === "qa") {
    return locale === "ar"
      ? ownerCount <= 1
        ? `تحتاج الجودة إلى مراجعة مسار مالك حالي واحد: ${ownerNames[0] ?? scope.batchScope?.scopedOwnerName ?? "غير محدد"}.`
        : `تحتاج الجودة إلى مراجعة نطاق موزع على ${ownerCount} ملاك حاليين: ${ownerNames.join(" | ")}.`
      : ownerCount <= 1
        ? `QA should review one current-owner path: ${ownerNames[0] ?? scope.batchScope?.scopedOwnerName ?? "Unassigned"}.`
        : `QA should review a scope now split across ${ownerCount} current owners: ${ownerNames.join(" | ")}.`;
  }

  if (recipient === "operations") {
    return locale === "ar"
      ? ownerCount <= 1
        ? `التنفيذ الحالي يقع تحت مالك واحد: ${ownerNames[0] ?? scope.batchScope?.scopedOwnerName ?? "غير محدد"}.`
        : `التنفيذ الحالي موزع على ${ownerCount} ملاك: ${ownerNames.join(" | ")}.`
      : ownerCount <= 1
        ? `Execution currently sits with one owner: ${ownerNames[0] ?? scope.batchScope?.scopedOwnerName ?? "Unassigned"}.`
        : `Execution is currently split across ${ownerCount} owners: ${ownerNames.join(" | ")}.`;
  }

  if (locale === "ar") {
    return ownerCount <= 1
      ? `يبقى هذا النطاق تحت مالك حالي واحد: ${ownerNames[0] ?? scope.batchScope?.scopedOwnerName ?? "غير محدد"}.`
      : `يتوزع هذا النطاق حالياً على ${ownerCount} ملاك: ${ownerNames.join(" | ")}.`;
  }

  return ownerCount <= 1
    ? `This scope remains under one current owner: ${ownerNames[0] ?? scope.batchScope?.scopedOwnerName ?? "Unassigned"}.`
    : `This scope is currently split across ${ownerCount} owners: ${ownerNames.join(" | ")}.`;
}

function sanitizeOwnerName(ownerName: string | undefined) {
  const trimmedOwnerName = ownerName?.trim();

  return trimmedOwnerName ? trimmedOwnerName : undefined;
}

function sanitizeBatchId(batchId: string | undefined) {
  const trimmedBatchId = batchId?.trim();

  return trimmedBatchId && isUuid(trimmedBatchId) ? trimmedBatchId : undefined;
}

function sanitizeBatchDrift(batchDrift: string | undefined): RevenueManagerBatchDriftFilter | undefined {
  return batchDrift === "changed_later" ? "changed_later" : undefined;
}

function sanitizeBatchDriftReason(batchDriftReason: string | undefined): RevenueManagerBatchDriftReasonFilter | undefined {
  if (
    batchDriftReason === "follow_up_only" ||
    batchDriftReason === "later_bulk_reset_only" ||
    batchDriftReason === "mixed"
  ) {
    return batchDriftReason;
  }

  return undefined;
}

export function parseRevenueManagerExportRecipient(searchParams: SearchParamsInput) {
  const rawSearchParams =
    searchParams instanceof URLSearchParams ? Object.fromEntries(searchParams.entries()) : normalizeSearchParamRecord(searchParams);

  return parseExportRecipient(rawSearchParams.recipient);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildRevenueManagerBulkBatchScope(batchScopedCases: PersistedRevenueManagerCase[]): RevenueManagerBulkBatchScope | undefined {
  const [firstCase] = batchScopedCases;

  if (!firstCase) {
    return undefined;
  }

  const firstBulkAction = firstCase.latestManagerFollowUp?.bulkAction;

  if (!firstBulkAction) {
    return undefined;
  }

  let savedAt = firstCase.latestManagerFollowUp?.savedAt ?? firstCase.updatedAt;
  let clearedCaseCount = 0;
  let stillEscalatedCaseCount = 0;
  const currentOwnerNames = new Set<string>();

  for (const caseItem of batchScopedCases) {
    currentOwnerNames.add(caseItem.ownerName);

    const isStillEscalated = hasPersistedLatestHumanReplyEscalation(
      caseItem.ownerName,
      caseItem.latestHumanReply,
      caseItem.followUpStatus,
      caseItem.openInterventionsCount
    );

    if (isStillEscalated) {
      stillEscalatedCaseCount += 1;
    } else {
      clearedCaseCount += 1;
    }

    const caseSavedAt = caseItem.latestManagerFollowUp?.savedAt ?? caseItem.updatedAt;

    if (new Date(caseSavedAt).getTime() > new Date(savedAt).getTime()) {
      savedAt = caseSavedAt;
    }
  }

  return {
    batchId: firstBulkAction.batchId,
    caseCount: Math.max(firstBulkAction.caseCount, batchScopedCases.length),
    clearedCaseCount,
    currentOwnerNames: [...currentOwnerNames].sort((left, right) => left.localeCompare(right)),
    savedAt,
    scopedOwnerName: firstBulkAction.scopedOwnerName,
    stillEscalatedCaseCount
  };
}

function buildRevenueManagerBatchOwnerGroups(batchScopedCases: PersistedRevenueManagerCase[]): RevenueManagerBatchOwnerGroup[] {
  const ownerGroups = new Map<string, RevenueManagerBatchOwnerGroup>();

  for (const caseItem of batchScopedCases) {
    const currentGroup = ownerGroups.get(caseItem.ownerName) ?? {
      cases: [],
      caseCount: 0,
      clearedCaseCount: 0,
      ownerName: caseItem.ownerName,
      stillEscalatedCaseCount: 0
    };

    const isStillEscalated = hasPersistedLatestHumanReplyEscalation(
      caseItem.ownerName,
      caseItem.latestHumanReply,
      caseItem.followUpStatus,
      caseItem.openInterventionsCount
    );

    ownerGroups.set(caseItem.ownerName, {
      ...currentGroup,
      cases: [...currentGroup.cases, caseItem],
      caseCount: currentGroup.caseCount + 1,
      clearedCaseCount: currentGroup.clearedCaseCount + (isStillEscalated ? 0 : 1),
      stillEscalatedCaseCount: currentGroup.stillEscalatedCaseCount + (isStillEscalated ? 1 : 0)
    });
  }

  return [...ownerGroups.values()].sort((left, right) => {
    if (left.stillEscalatedCaseCount !== right.stillEscalatedCaseCount) {
      return right.stillEscalatedCaseCount - left.stillEscalatedCaseCount;
    }

    if (left.caseCount !== right.caseCount) {
      return right.caseCount - left.caseCount;
    }

    return left.ownerName.localeCompare(right.ownerName);
  });
}

function compareBatchScopedCases(left: PersistedRevenueManagerCase, right: PersistedRevenueManagerCase) {
  const leftEscalated = hasPersistedLatestHumanReplyEscalation(
    left.ownerName,
    left.latestHumanReply,
    left.followUpStatus,
    left.openInterventionsCount
  );
  const rightEscalated = hasPersistedLatestHumanReplyEscalation(
    right.ownerName,
    right.latestHumanReply,
    right.followUpStatus,
    right.openInterventionsCount
  );

  if (leftEscalated !== rightEscalated) {
    return leftEscalated ? -1 : 1;
  }

  if (left.ownerName !== right.ownerName) {
    return left.ownerName.localeCompare(right.ownerName);
  }

  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

function isStillEscalated(caseItem: PersistedRevenueManagerCase) {
  return hasPersistedLatestHumanReplyEscalation(
    caseItem.ownerName,
    caseItem.latestHumanReply,
    caseItem.followUpStatus,
    caseItem.openInterventionsCount
  );
}

function hydrateBatchHistoryEntry(
  caseDetail: PersistedCaseDetail,
  currentOwnerName: string,
  currentRiskStatus: RevenueManagerBatchHistoryEntry["currentRiskStatus"],
  scopedBatchId: string | undefined,
  event: PersistedCaseDetail["auditEvents"][number]
): RevenueManagerBatchHistoryEntry | null {
  const nextAction = readPayloadString(event.payload, "nextAction");
  const nextActionDueAt = readPayloadString(event.payload, "nextActionDueAt");
  const ownerName = readPayloadString(event.payload, "ownerName");

  if (!nextAction || !nextActionDueAt || !ownerName) {
    return null;
  }

  const batchId = readPayloadString(event.payload, "bulkActionBatchId");
  const batchCaseCount = readPayloadInteger(event.payload, "bulkActionCaseCount");
  const scopedOwnerName = readPayloadString(event.payload, "bulkActionScopedOwnerName");

  return {
    ...(batchCaseCount !== null && batchCaseCount >= 2 ? { batchCaseCount } : {}),
    ...(batchId ? { batchId } : {}),
    caseId: caseDetail.caseId,
    createdAt: event.createdAt,
    currentOwnerName,
    currentRiskStatus,
    customerName: caseDetail.customerName,
    nextAction,
    nextActionDueAt,
    ownerName,
    ...(scopedOwnerName ? { scopedOwnerName } : {}),
    type: batchId ? (batchId === scopedBatchId ? "scoped_batch_reset" : "later_bulk_reset") : "follow_up_update"
  };
}

function buildCaseReferenceCode(caseId: string) {
  return `CASE-${caseId.slice(0, 8).toUpperCase()}`;
}

function readPayloadInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function readPayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "string" && value.trim() ? value : null;
}
