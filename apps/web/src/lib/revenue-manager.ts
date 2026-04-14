import type { PersistedCaseDetail, PersistedCaseSummary, SupportedLocale } from "@real-estate-ai/contracts";

import { buildManagerWorkspaceQueues } from "./manager-workspace";

type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

type PersistedRevenueManagerCase = PersistedCaseDetail | PersistedCaseSummary;

export type RevenueManagerQueueFilter = "all" | "escalated_handoffs";

export interface RevenueManagerFilters {
  ownerName?: string;
  queue: RevenueManagerQueueFilter;
}

export const revenueManagerFocusedQueueId = "revenue-focused-queue";

export function parseRevenueManagerFilters(searchParams: SearchParamsInput): RevenueManagerFilters {
  const rawSearchParams =
    searchParams instanceof URLSearchParams ? Object.fromEntries(searchParams.entries()) : normalizeSearchParamRecord(searchParams);
  const ownerName = sanitizeOwnerName(rawSearchParams.ownerName);

  return ownerName
    ? {
        ownerName,
        queue: rawSearchParams.queue === "escalated_handoffs" ? "escalated_handoffs" : "all"
      }
    : {
        queue: rawSearchParams.queue === "escalated_handoffs" ? "escalated_handoffs" : "all"
      };
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

  const serialized = searchParams.toString();
  const hash = options.hash ? `#${options.hash}` : "";
  const path = serialized.length > 0 ? `/${locale}/manager/revenue?${serialized}` : `/${locale}/manager/revenue`;

  return `${path}${hash}`;
}

export function buildRevenueManagerScope(persistedCases: PersistedRevenueManagerCase[], filters: RevenueManagerFilters) {
  const ownerScopedCases = filters.ownerName
    ? persistedCases.filter((caseItem) => caseItem.ownerName === filters.ownerName)
    : persistedCases;
  const ownerScopedQueues = buildManagerWorkspaceQueues(ownerScopedCases);

  return {
    focusedCases:
      filters.queue === "escalated_handoffs" ? ownerScopedQueues.escalatedPostReplyHandoffCases : ownerScopedQueues.revenueAttentionCases,
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
