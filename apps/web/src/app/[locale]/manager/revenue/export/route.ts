import { canOperatorRoleAccessWorkspace } from "@real-estate-ai/contracts";

import { tryListPersistedCases } from "@/lib/live-api";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { buildRevenueManagerBatchExportCsv, buildRevenueManagerScope, parseRevenueManagerFilters } from "@/lib/revenue-manager";

export async function GET(request: Request, context: { params: Promise<{ locale: string }> }) {
  const [{ locale }, currentOperatorRole] = await Promise.all([context.params, getCurrentOperatorRole()]);

  if (!canOperatorRoleAccessWorkspace("manager_revenue", currentOperatorRole)) {
    return new Response(locale === "ar" ? "وصول قيادة الإيرادات مطلوب" : "Revenue manager access required", {
      status: 403
    });
  }

  const requestUrl = new URL(request.url);
  const filters = parseRevenueManagerFilters(requestUrl.searchParams);

  if (!filters.bulkBatchId) {
    return new Response(locale === "ar" ? "مطلوب نطاق دفعة جماعية صالح" : "A valid bulk batch scope is required", {
      status: 400
    });
  }

  const persistedCases = await tryListPersistedCases();
  const revenueScope = buildRevenueManagerScope(persistedCases, filters);

  if (!revenueScope.batchScope || revenueScope.focusedCases.length === 0) {
    return new Response(locale === "ar" ? "لا توجد حالات حية لهذه الدفعة" : "No live cases remain for this batch", {
      status: 404
    });
  }

  const csv = buildRevenueManagerBatchExportCsv(revenueScope);

  if (!csv) {
    return new Response(locale === "ar" ? "تعذر إنشاء تصدير الدفعة" : "Unable to build batch export", {
      status: 502
    });
  }

  const filename = `revenue-batch-${revenueScope.batchScope.batchId.slice(0, 8)}-${locale}.csv`;

  return new Response(csv, {
    headers: {
      "content-disposition": `attachment; filename="${filename}"`,
      "content-type": "text/csv; charset=utf-8"
    },
    status: 200
  });
}
