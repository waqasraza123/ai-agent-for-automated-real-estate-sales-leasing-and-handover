import type { PersistedCaseDetail, PersistedCaseSummary, SupportedLocale } from "@real-estate-ai/contracts";

import { buildManagerWorkspaceQueues } from "./manager-workspace";
import { hasPersistedLatestHumanReplyEscalation } from "./persisted-case-presenters";

type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

type PersistedRevenueManagerCase = PersistedCaseDetail | PersistedCaseSummary;

export type RevenueManagerQueueFilter = "all" | "escalated_handoffs";

export interface RevenueManagerFilters {
  bulkBatchId?: string;
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

export const revenueManagerFocusedQueueId = "revenue-focused-queue";

export function parseRevenueManagerFilters(searchParams: SearchParamsInput): RevenueManagerFilters {
  const rawSearchParams =
    searchParams instanceof URLSearchParams ? Object.fromEntries(searchParams.entries()) : normalizeSearchParamRecord(searchParams);
  const bulkBatchId = sanitizeBatchId(rawSearchParams.bulkBatchId);
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

  const serialized = searchParams.toString();
  const hash = options.hash ? `#${options.hash}` : "";
  const path = serialized.length > 0 ? `/${locale}/manager/revenue?${serialized}` : `/${locale}/manager/revenue`;

  return `${path}${hash}`;
}

export function buildRevenueManagerExportHref(locale: SupportedLocale, filters: Partial<RevenueManagerFilters> = {}) {
  const searchParams = buildRevenueManagerSearchParams(filters);
  const serialized = searchParams.toString();

  return serialized.length > 0 ? `/${locale}/manager/revenue/export?${serialized}` : `/${locale}/manager/revenue/export`;
}

export function buildRevenueManagerScope(persistedCases: PersistedRevenueManagerCase[], filters: RevenueManagerFilters): RevenueManagerScope {
  const ownerScopedCases = filters.ownerName
    ? persistedCases.filter((caseItem) => caseItem.ownerName === filters.ownerName)
    : persistedCases;
  const batchScopedCases = filters.bulkBatchId
    ? [...ownerScopedCases]
        .filter((caseItem) => caseItem.latestManagerFollowUp?.bulkAction?.batchId === filters.bulkBatchId)
        .sort((left, right) => compareBatchScopedCases(left, right))
    : null;
  const ownerScopedQueues = buildManagerWorkspaceQueues(ownerScopedCases);
  const batchScope = batchScopedCases ? buildRevenueManagerBulkBatchScope(batchScopedCases) : undefined;

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

export function buildRevenueManagerBatchExportCsv(scope: RevenueManagerScope) {
  if (!scope.batchScope) {
    return null;
  }

  const ownerGroups = new Map(scope.batchOwnerGroups.map((ownerGroup) => [ownerGroup.ownerName, ownerGroup]));
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

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
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

  return searchParams;
}

function sanitizeOwnerName(ownerName: string | undefined) {
  const trimmedOwnerName = ownerName?.trim();

  return trimmedOwnerName ? trimmedOwnerName : undefined;
}

function sanitizeBatchId(batchId: string | undefined) {
  const trimmedBatchId = batchId?.trim();

  return trimmedBatchId && isUuid(trimmedBatchId) ? trimmedBatchId : undefined;
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

function buildCaseReferenceCode(caseId: string) {
  return `CASE-${caseId.slice(0, 8).toUpperCase()}`;
}

function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}
