import { canOperatorRoleAccessWorkspace, type PersistedCaseDetail, type SupportedLocale } from "@real-estate-ai/contracts";

import { ManagerWorkspaceUnavailable, RevenueManagerCommandCenter } from "@/components/manager-command-center";
import { tryGetPersistedCaseDetail, tryGetPersistedGovernanceSummary, tryListPersistedCases } from "@/lib/live-api";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { buildRevenueManagerBatchHistory, buildRevenueManagerScope, parseRevenueManagerFilters } from "@/lib/revenue-manager";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RevenueManagerPage(props: PageProps) {
  const [{ locale }, rawSearchParams] = await Promise.all([props.params, props.searchParams]);
  const currentOperatorRole = await getCurrentOperatorRole();

  if (!canOperatorRoleAccessWorkspace("manager_revenue", currentOperatorRole)) {
    return <ManagerWorkspaceUnavailable currentOperatorRole={currentOperatorRole} locale={locale} workspace="manager_revenue" />;
  }

  const filters = parseRevenueManagerFilters(rawSearchParams);
  const [persistedCases, governanceReport] = await Promise.all([tryListPersistedCases(), tryGetPersistedGovernanceSummary()]);
  const revenueScope = buildRevenueManagerScope(persistedCases, filters);
  const batchCaseDetails =
    filters.bulkBatchId && revenueScope.focusedCases.length > 0
      ? await Promise.all(revenueScope.focusedCases.map((caseItem) => tryGetPersistedCaseDetail(caseItem.caseId)))
      : [];
  const batchHistory =
    filters.bulkBatchId && revenueScope.batchScope
      ? buildRevenueManagerBatchHistory(
          revenueScope,
          batchCaseDetails.filter((caseDetail): caseDetail is PersistedCaseDetail => caseDetail !== null)
        )
      : null;

  return (
    <RevenueManagerCommandCenter
      batchHistory={batchHistory}
      currentOperatorRole={currentOperatorRole}
      filters={filters}
      governanceReport={governanceReport}
      locale={locale}
      persistedCases={persistedCases}
    />
  );
}
