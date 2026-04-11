import type { PersistedCaseDetail, PersistedCaseSummary, PersistedDocumentRequest, SupportedLocale } from "@real-estate-ai/contracts";
import type { ConversationMessage, JourneyEvent } from "@real-estate-ai/domain";

import {
  getCaseStageLabel,
  getDocumentRequestDetail,
  getDocumentRequestStatusLabel,
  getDocumentRequestTypeLabel,
  getFollowUpStatusLabel,
  getQualificationReadinessLabel,
  getSourceLabel
} from "./live-copy";

export function buildCaseReferenceCode(caseId: string) {
  return `CASE-${caseId.slice(0, 8).toUpperCase()}`;
}

export function buildPersistedConversation(caseDetail: PersistedCaseDetail): ConversationMessage[] {
  return [
    {
      body: {
        ar: caseDetail.message,
        en: caseDetail.message
      },
      id: `${caseDetail.caseId}-customer`,
      sender: "customer",
      timestamp: formatTimestamp(caseDetail.createdAt)
    },
    {
      body: {
        ar: caseDetail.nextAction,
        en: caseDetail.nextAction
      },
      id: `${caseDetail.caseId}-workflow`,
      sender: "automation",
      state: {
        ar: "تم توليدها من حالة حية محفوظة",
        en: "Generated from the persisted alpha workflow"
      },
      timestamp: formatTimestamp(caseDetail.updatedAt)
    }
  ];
}

export function buildPersistedTimeline(caseDetail: PersistedCaseDetail): JourneyEvent[] {
  return caseDetail.auditEvents.map((event, index) => ({
    detail: {
      ar: describeAuditEvent(caseDetail, event.eventType, "ar", "detail"),
      en: describeAuditEvent(caseDetail, event.eventType, "en", "detail")
    },
    id: `${caseDetail.caseId}-${index}`,
    timestamp: formatTimestamp(event.createdAt),
    title: {
      ar: describeAuditEvent(caseDetail, event.eventType, "ar", "title"),
      en: describeAuditEvent(caseDetail, event.eventType, "en", "title")
    }
  }));
}

export function formatCaseLastChange(value: PersistedCaseDetail | PersistedCaseSummary, locale: SupportedLocale) {
  return new Date(value.updatedAt).toLocaleString(locale);
}

export function formatDueAt(value: PersistedCaseDetail | PersistedCaseSummary, locale: SupportedLocale) {
  return new Date(value.nextActionDueAt).toLocaleString(locale);
}

export function getPersistedCaseStageLabel(locale: SupportedLocale, caseStage: PersistedCaseDetail["stage"] | PersistedCaseSummary["stage"]) {
  return getCaseStageLabel(locale, caseStage);
}

export function getPersistedDocumentDisplay(locale: SupportedLocale, caseDetail: PersistedCaseDetail) {
  return caseDetail.documentRequests.map((documentRequest) => ({
    detail: getDocumentRequestDetail(locale, documentRequest.type),
    documentRequestId: documentRequest.documentRequestId,
    label: getDocumentRequestTypeLabel(locale, documentRequest.type),
    statusLabel: getDocumentRequestStatusLabel(locale, documentRequest.status),
    statusTone: getStatusTone(documentRequest.status),
    updatedAt: new Date(documentRequest.updatedAt).toLocaleString(locale),
    value: documentRequest.status
  }));
}

export function getPersistedQualificationSummary(locale: SupportedLocale, caseDetail: PersistedCaseDetail) {
  if (!caseDetail.qualificationSnapshot) {
    return null;
  }

  return {
    budgetBand: caseDetail.qualificationSnapshot.budgetBand,
    intentSummary: caseDetail.qualificationSnapshot.intentSummary,
    moveInTimeline: caseDetail.qualificationSnapshot.moveInTimeline,
    readiness: getQualificationReadinessLabel(locale, caseDetail.qualificationSnapshot.readiness),
    updatedAt: new Date(caseDetail.qualificationSnapshot.updatedAt).toLocaleString(locale)
  };
}

export function getPersistedSourceLabel(locale: SupportedLocale) {
  return getSourceLabel(locale);
}

export function getPersistedFollowUpLabel(locale: SupportedLocale, caseSummary: PersistedCaseDetail | PersistedCaseSummary) {
  return getFollowUpStatusLabel(locale, caseSummary.followUpStatus);
}

function describeAuditEvent(caseDetail: PersistedCaseDetail, eventType: string, locale: SupportedLocale, variant: "detail" | "title") {
  const descriptions = {
    ar: {
      case_qualified: {
        detail: "تم حفظ بيانات التأهيل وربطها بالحالة.",
        title: "تحديث التأهيل"
      },
      document_request_updated: {
        detail: "تم تحديث حالة أحد المستندات المطلوبة في هذه الحالة.",
        title: "تحديث المستندات"
      },
      visit_scheduled: {
        detail: "تم ربط الحالة بموعد زيارة فعلي مع الموقع المحدد.",
        title: "موعد زيارة محفوظ"
      },
      website_lead_received: {
        detail: `وصلت الحالة من ${getSourceLabel(locale)} وتم إسنادها إلى ${caseDetail.ownerName}.`,
        title: "استلام عميل جديد"
      }
    },
    en: {
      case_qualified: {
        detail: "Qualification fields were captured and attached to the persisted case.",
        title: "Qualification updated"
      },
      document_request_updated: {
        detail: "One of the required document requests changed state for this case.",
        title: "Document status updated"
      },
      visit_scheduled: {
        detail: "The case now has a scheduled visit with a saved location and time.",
        title: "Visit scheduled"
      },
      website_lead_received: {
        detail: `The lead arrived from ${getSourceLabel(locale)} and was assigned to ${caseDetail.ownerName}.`,
        title: "Website lead received"
      }
    }
  } as const;

  const copy = locale === "ar" ? descriptions.ar : descriptions.en;
  const eventCopy = copy[eventType as keyof typeof copy] ?? copy.website_lead_received;

  return eventCopy[variant];
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  });
}

function getStatusTone(status: PersistedDocumentRequest["status"]): "success" | "critical" | "warning" {
  if (status === "accepted") {
    return "success";
  }

  if (status === "rejected") {
    return "critical";
  }

  return "warning";
}
