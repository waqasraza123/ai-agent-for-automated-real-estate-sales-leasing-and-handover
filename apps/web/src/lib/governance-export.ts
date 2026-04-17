import type { ListGovernanceEventsQuery, SupportedLocale } from "@real-estate-ai/contracts";

import { buildCsvDocument, buildExportSummaryCsvRows, escapeCsvValue } from "./export-summary";

interface GovernanceExportOptions {
  filters: ListGovernanceEventsQuery;
  generatedAt?: string;
  locale: SupportedLocale;
}

export function buildGovernanceEventCsv(items: Array<Record<string, unknown>>, options: GovernanceExportOptions) {
  const summaryRows = buildGovernanceExportSummaryRows(items, options);
  const headers = [
    "createdAt",
    "action",
    "kind",
    "status",
    "subjectType",
    "triggerSource",
    "customerName",
    "caseId",
    "handoverCaseId",
    "actorName",
    "sampleSummary",
    "reviewSummary",
    "draftMessage",
    "policySignals",
    "triggerEvidence"
  ];

  const rows = items.map((item) =>
    [
      item.createdAt,
      item.action,
      item.kind,
      item.status,
      item.subjectType,
      item.triggerSource,
      item.customerName,
      item.caseId,
      item.handoverCaseId,
      item.actorName,
      item.sampleSummary,
      item.reviewSummary,
      item.draftMessage,
      Array.isArray(item.policySignals) ? item.policySignals.join(" | ") : "",
      Array.isArray(item.triggerEvidence) ? item.triggerEvidence.join(" | ") : ""
    ].map((value) => escapeCsvValue(typeof value === "string" ? value : value == null ? "" : String(value)))
  );

  return buildCsvDocument(headers, rows, { summaryRows });
}

function buildGovernanceExportSummaryRows(items: Array<Record<string, unknown>>, options: GovernanceExportOptions) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const matchingRows = items.length;
  const uniqueCaseCount = new Set(items.map((item) => String(item.caseId ?? ""))).size;
  const openedCount = items.filter((item) => item.action === "opened").length;
  const resolvedCount = items.filter((item) => item.action === "resolved").length;
  return buildExportSummaryCsvRows(options.locale, [
    { field: "generated_at", value: generatedAt },
    { field: "intended_audience", value: getGovernanceExportAudience(options.locale, options.filters) },
    { field: "review_focus", value: getGovernanceExportReviewFocus(options.locale, options.filters) },
    { field: "selected_scope", value: getGovernanceExportScopeLabel(options.locale, options.filters) },
    { field: "filter_summary", value: getGovernanceExportFilterSummary(options.locale, options.filters) },
    {
      field: "activity_summary",
      value: getGovernanceExportActivitySummary(options.locale, matchingRows, uniqueCaseCount, openedCount, resolvedCount)
    },
    { field: "share_summary", value: getGovernanceExportShareSummary(options.locale, options.filters, matchingRows) },
    { field: "matching_row_count", value: String(matchingRows) },
    { field: "unique_case_count", value: String(uniqueCaseCount) },
    { field: "opened_event_count", value: String(openedCount) },
    { field: "resolved_event_count", value: String(resolvedCount) }
  ]);
}

function getGovernanceExportAudience(locale: SupportedLocale, filters: ListGovernanceEventsQuery) {
  if (locale === "ar") {
    return filters.kind === "handover_customer_update"
      ? "قيادة التسليم والجودة"
      : filters.subjectType === "prepared_reply_draft"
        ? "قيادة الإيرادات ومراجعة الجودة"
        : "قيادة الإدارة اليومية";
  }

  return filters.kind === "handover_customer_update"
    ? "Handover leadership and QA review"
    : filters.subjectType === "prepared_reply_draft"
      ? "Revenue leadership and QA review"
      : "Manager operations review";
}

function getGovernanceExportReviewFocus(locale: SupportedLocale, filters: ListGovernanceEventsQuery) {
  if (locale === "ar") {
    if (filters.status === "pending_review") {
      return "حدود جودة ما زالت مفتوحة وتنتظر القرار";
    }

    if (filters.status === "follow_up_required") {
      return "قرارات جودة تحتاج متابعة تنفيذية";
    }

    if (filters.status === "approved") {
      return "حدود جودة حُسمت بالموافقة";
    }

    return "صورة تاريخية لفتحات الجودة وحسوماتها";
  }

  if (filters.status === "pending_review") {
    return "Open QA boundaries still waiting for decision";
  }

  if (filters.status === "follow_up_required") {
    return "QA decisions that still require follow-up";
  }

  if (filters.status === "approved") {
    return "QA boundaries already resolved with approval";
  }

  return "Historical view across governance openings and resolutions";
}

function getGovernanceExportScopeLabel(locale: SupportedLocale, filters: ListGovernanceEventsQuery) {
  const kindLabel = filters.kind
    ? filters.kind === "handover_customer_update"
      ? locale === "ar"
        ? "التسليم"
        : "Handover"
      : locale === "ar"
        ? "الإيرادات"
        : "Revenue"
    : locale === "ar"
      ? "كل الأسطح"
      : "All surfaces";
  const subjectLabel = filters.subjectType
    ? filters.subjectType === "prepared_reply_draft"
      ? locale === "ar"
        ? "مسودات الردود"
        : "Reply drafts"
      : filters.subjectType === "appointment_confirmation"
        ? locale === "ar"
          ? "تأكيدات المواعيد"
          : "Appointment confirmations"
        : filters.subjectType === "scheduling_invite"
          ? locale === "ar"
            ? "دعوات الجدولة"
            : "Scheduling invites"
          : locale === "ar"
            ? "رسائل المحادثة"
            : "Conversation messages"
    : locale === "ar"
      ? "كل الموضوعات"
      : "All subjects";

  return locale === "ar" ? `${kindLabel} · ${subjectLabel}` : `${kindLabel} · ${subjectLabel}`;
}

function getGovernanceExportFilterSummary(locale: SupportedLocale, filters: ListGovernanceEventsQuery) {
  if (locale === "ar") {
    return `نافذة ${filters.windowDays} يوماً، حد أقصى ${filters.limit} حدثاً${filters.action ? `، إجراء ${filters.action}` : ""}${filters.triggerSource ? `، مصدر ${filters.triggerSource}` : ""}.`;
  }

  return `Window ${filters.windowDays} days, up to ${filters.limit} events${filters.action ? `, action ${filters.action}` : ""}${filters.triggerSource ? `, trigger source ${filters.triggerSource}` : ""}.`;
}

function getGovernanceExportActivitySummary(
  locale: SupportedLocale,
  matchingRows: number,
  uniqueCaseCount: number,
  openedCount: number,
  resolvedCount: number
) {
  if (locale === "ar") {
    return `يعرض هذا الملف ${matchingRows} صفوفاً عبر ${uniqueCaseCount} حالات فريدة، منها ${openedCount} فتحات و${resolvedCount} حسومات داخل النطاق الحالي.`;
  }

  return `This file covers ${matchingRows} rows across ${uniqueCaseCount} unique cases, including ${openedCount} openings and ${resolvedCount} resolutions in the current scope.`;
}

function getGovernanceExportShareSummary(locale: SupportedLocale, filters: ListGovernanceEventsQuery, matchingRows: number) {
  if (locale === "ar") {
    if (filters.status === "pending_review") {
      return `هذا التصدير مناسب لجلسات الفرز السريع لأنه يجمع ${matchingRows} حدود جودة ما زالت مفتوحة ضمن نفس النطاق.`;
    }

    if (filters.subjectType === "prepared_reply_draft") {
      return `هذا التصدير مناسب لمراجعة الانضباط التجاري لأنه يجمع ${matchingRows} أحداثاً تخص مسودات الردود وحدودها.`;
    }

    return `هذا التصدير مناسب للمراجعة الإدارية أو أرشفة المتابعة لأنه يجمع ${matchingRows} أحداث جودة ضمن نفس النطاق التاريخي.`;
  }

  if (filters.status === "pending_review") {
    return `This export is suited for fast manager triage because it collects ${matchingRows} governance boundaries that are still open in the current scope.`;
  }

  if (filters.subjectType === "prepared_reply_draft") {
    return `This export is suited for commercial governance review because it collects ${matchingRows} events tied to reply-draft boundaries.`;
  }

  return `This export is suited for manager review or historical follow-up because it collects ${matchingRows} governance events inside one historical scope.`;
}
