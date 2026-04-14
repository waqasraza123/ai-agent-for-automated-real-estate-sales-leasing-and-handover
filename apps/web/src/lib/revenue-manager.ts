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

export function buildRevenueManagerScope(persistedCases: PersistedRevenueManagerCase[], filters: RevenueManagerFilters) {
  const ownerScopedCases = filters.ownerName
    ? persistedCases.filter((caseItem) => caseItem.ownerName === filters.ownerName)
    : persistedCases;
  const batchScopedCases = filters.bulkBatchId
    ? [...ownerScopedCases]
        .filter((caseItem) => caseItem.latestManagerFollowUp?.bulkAction?.batchId === filters.bulkBatchId)
        .sort((left, right) => compareBatchScopedCases(left, right))
    : null;
  const ownerScopedQueues = buildManagerWorkspaceQueues(ownerScopedCases);

  return {
    batchOwnerGroups: batchScopedCases ? buildRevenueManagerBatchOwnerGroups(batchScopedCases) : [],
    batchScope: batchScopedCases ? buildRevenueManagerBulkBatchScope(batchScopedCases) : undefined,
    focusedCases:
      batchScopedCases ??
      (filters.queue === "escalated_handoffs" ? ownerScopedQueues.escalatedPostReplyHandoffCases : ownerScopedQueues.revenueAttentionCases),
    ownerScopedCases,
    ownerScopedQueues
  };
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
