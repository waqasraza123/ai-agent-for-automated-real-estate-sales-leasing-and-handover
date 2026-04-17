import { canOperatorRoleAccessWorkspace } from "@real-estate-ai/contracts";
import { operatorSessionHeaderName } from "@real-estate-ai/contracts";

import { parseExportRecipient } from "@/lib/export-summary";
import { buildGovernanceEventsPath, getWebApiBaseUrl, WebApiError } from "@/lib/live-api";
import { buildGovernanceEventCsv } from "@/lib/governance-export";
import { parseGovernanceReportSearchParams } from "@/lib/governance-report";
import { getCurrentOperatorRole, getCurrentOperatorSessionToken } from "@/lib/operator-session";

export async function GET(request: Request, context: { params: Promise<{ locale: string }> }) {
  const [{ locale }, currentOperatorRole] = await Promise.all([context.params, getCurrentOperatorRole()]);
  const canAccessManagerReport =
    canOperatorRoleAccessWorkspace("manager_revenue", currentOperatorRole) ||
    canOperatorRoleAccessWorkspace("manager_handover", currentOperatorRole);

  if (!canAccessManagerReport) {
    return new Response(locale === "ar" ? "وصول إداري مطلوب" : "Manager access required", {
      status: 403
    });
  }

  const requestUrl = new URL(request.url);
  const filters = parseGovernanceReportSearchParams(requestUrl.searchParams);
  const recipient = parseExportRecipient(requestUrl.searchParams.get("recipient"));
  const sessionToken = await getCurrentOperatorSessionToken();

  try {
    const response = await fetch(`${getWebApiBaseUrl()}${buildGovernanceEventsPath({ ...filters, limit: 500 })}`, {
      cache: "no-store",
      headers: {
        [operatorSessionHeaderName]: sessionToken
      },
      signal: AbortSignal.timeout(8000)
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new WebApiError(`web_api_request_failed:${response.status}`, response.status, responseBody);
    }

    const csv = buildGovernanceEventCsv(responseBody?.items ?? [], {
      filters,
      locale: locale === "ar" ? "ar" : "en",
      recipient
    });
    const filename = `governance-report-${recipient !== "manager" ? `${recipient}-` : ""}${locale}-${filters.windowDays}d.csv`;

    return new Response(csv, {
      headers: {
        "content-disposition": `attachment; filename="${filename}"`,
        "content-type": "text/csv; charset=utf-8"
      },
      status: 200
    });
  } catch {
    return new Response(locale === "ar" ? "تعذر إنشاء تقرير CSV" : "Unable to generate CSV report", {
      status: 502
    });
  }
}
