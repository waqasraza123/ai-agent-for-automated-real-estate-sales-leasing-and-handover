import type { ListGovernanceEventsQuery, SupportedLocale } from "@real-estate-ai/contracts";

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

  return [...summaryRows, "", headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function buildGovernanceExportSummaryRows(items: Array<Record<string, unknown>>, options: GovernanceExportOptions) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const matchingRows = items.length;
  const uniqueCaseCount = new Set(items.map((item) => String(item.caseId ?? ""))).size;
  const openedCount = items.filter((item) => item.action === "opened").length;
  const resolvedCount = items.filter((item) => item.action === "resolved").length;
  const rows = [
    [
      options.locale === "ar" ? "القسم" : "section",
      options.locale === "ar" ? "الحقل" : "field",
      options.locale === "ar" ? "القيمة" : "value"
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "أنشئ في" : "generated_at",
      generatedAt
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "الجمهور المقصود" : "intended_audience",
      getGovernanceExportAudience(options.locale, options.filters)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "محور المراجعة" : "review_focus",
      getGovernanceExportReviewFocus(options.locale, options.filters)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "النطاق المختار" : "selected_scope",
      getGovernanceExportScopeLabel(options.locale, options.filters)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "خلاصة الفلاتر" : "filter_summary",
      getGovernanceExportFilterSummary(options.locale, options.filters)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "خلاصة النشاط" : "activity_summary",
      getGovernanceExportActivitySummary(options.locale, matchingRows, uniqueCaseCount, openedCount, resolvedCount)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "غرض المشاركة" : "share_summary",
      getGovernanceExportShareSummary(options.locale, options.filters, matchingRows)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "الصفوف المطابقة" : "matching_row_count",
      String(matchingRows)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "الحالات الفريدة" : "unique_case_count",
      String(uniqueCaseCount)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "الفتحات" : "opened_event_count",
      String(openedCount)
    ],
    [
      options.locale === "ar" ? "ملخص التصدير" : "export_summary",
      options.locale === "ar" ? "الحسومات" : "resolved_event_count",
      String(resolvedCount)
    ]
  ];

  return rows.map((row) => row.map((value) => escapeCsvValue(value)).join(","));
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

function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}
