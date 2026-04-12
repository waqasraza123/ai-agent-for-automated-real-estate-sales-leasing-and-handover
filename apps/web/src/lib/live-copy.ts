import type {
  AutomationStatus,
  CaseStage,
  DocumentRequestStatus,
  DocumentRequestType,
  FollowUpStatus,
  ManagerInterventionSeverity,
  ManagerInterventionType,
  QualificationReadiness,
  SupportedLocale
} from "@real-estate-ai/contracts";

export function getAutomationStatusCopy(locale: SupportedLocale) {
  if (locale === "ar") {
    return {
      action: "تحديث حالة الأتمتة",
      active: "تشغيل الأتمتة",
      paused: "إيقاف الأتمتة",
      summary: "أوقف أو استأنف إنشاء تنبيهات المتابعة للحالة الحالية.",
      title: "التحكم في الأتمتة"
    };
  }

  return {
    action: "Update automation",
    active: "Resume automation",
    paused: "Pause automation",
    summary: "Pause or resume follow-up intervention generation for the current case.",
    title: "Automation control"
  };
}

export function getAutomationStatusLabel(locale: SupportedLocale, status: AutomationStatus) {
  const labels = {
    ar: {
      active: "نشطة",
      paused: "متوقفة"
    },
    en: {
      active: "Active",
      paused: "Paused"
    }
  } as const;

  return labels[locale][status];
}

export function getCaseStageLabel(locale: SupportedLocale, stage: CaseStage) {
  const labels = {
    ar: {
      documents_in_progress: "المستندات قيد المتابعة",
      new: "حالة جديدة",
      qualified: "مؤهلة",
      visit_scheduled: "زيارة مجدولة"
    },
    en: {
      documents_in_progress: "Documents in progress",
      new: "New case",
      qualified: "Qualified",
      visit_scheduled: "Visit scheduled"
    }
  } as const;

  return labels[locale][stage];
}

export function getDocumentRequestDetail(locale: SupportedLocale, type: DocumentRequestType) {
  const details = {
    ar: {
      employment_letter: "لتأكيد جهة العمل أو الشركة ودعم مراجعة الجدارة.",
      government_id: "مطلوب للتحقق الأساسي من الهوية قبل تقدم الحالة.",
      proof_of_funds: "يساعد على تأكيد الجاهزية المالية قبل الحجز أو الانتقال للخطوة التالية."
    },
    en: {
      employment_letter: "Required to confirm employer or company context before manager review.",
      government_id: "Required for baseline identity verification before the case progresses.",
      proof_of_funds: "Used to confirm financial readiness before reservation or the next approval step."
    }
  } as const;

  return details[locale][type];
}

export function getDocumentRequestStatusLabel(locale: SupportedLocale, status: DocumentRequestStatus) {
  const labels = {
    ar: {
      accepted: "مقبول",
      rejected: "مرفوض",
      requested: "مطلوب",
      under_review: "قيد المراجعة"
    },
    en: {
      accepted: "Accepted",
      rejected: "Rejected",
      requested: "Requested",
      under_review: "Under review"
    }
  } as const;

  return labels[locale][status];
}

export function getDocumentRequestTypeLabel(locale: SupportedLocale, type: DocumentRequestType) {
  const labels = {
    ar: {
      employment_letter: "خطاب جهة العمل أو الشركة",
      government_id: "هوية حكومية",
      proof_of_funds: "إثبات ملاءة أو قدرة مالية"
    },
    en: {
      employment_letter: "Employment or company letter",
      government_id: "Government ID",
      proof_of_funds: "Proof of funds"
    }
  } as const;

  return labels[locale][type];
}

export function getFollowUpManagerCopy(locale: SupportedLocale) {
  if (locale === "ar") {
    return {
      action: "حفظ خطة المتابعة",
      nextAction: "الخطوة التالية",
      nextActionDueAt: "موعد الخطوة التالية",
      ownerName: "المالك الحالي",
      summary: "تحديث الخطوة التالية وموعدها وإسنادها لإزالة التدخل المفتوح وإعادة جدولة المتابعة.",
      title: "تدخل المدير"
    };
  }

  return {
    action: "Save follow-up plan",
    nextAction: "Next action",
    nextActionDueAt: "Next action due",
    ownerName: "Current owner",
    summary: "Update the next step, due time, and ownership to clear the open intervention and re-arm follow-up.",
    title: "Manager intervention"
  };
}

export function getFollowUpStatusLabel(locale: SupportedLocale, status: FollowUpStatus) {
  const labels = {
    ar: {
      attention: "تحتاج اهتماماً",
      on_track: "ضمن المتابعة"
    },
    en: {
      attention: "Needs attention",
      on_track: "On track"
    }
  } as const;

  return labels[locale][status];
}

export function getInterventionCountLabel(locale: SupportedLocale, count: number) {
  if (locale === "ar") {
    return count === 1 ? "تدخل مفتوح واحد" : `${count} تدخلات مفتوحة`;
  }

  return count === 1 ? "1 open intervention" : `${count} open interventions`;
}

export function getInterventionSeverityLabel(locale: SupportedLocale, severity: ManagerInterventionSeverity) {
  const labels = {
    ar: {
      critical: "حرج",
      warning: "يتطلب متابعة"
    },
    en: {
      critical: "Critical",
      warning: "Needs review"
    }
  } as const;

  return labels[locale][severity];
}

export function getInterventionSummary(locale: SupportedLocale, type: ManagerInterventionType) {
  const summaries = {
    ar: {
      follow_up_overdue: "تجاوزت الخطوة التالية موعدها المحدد وتحتاج إلى تدخل المدير."
    },
    en: {
      follow_up_overdue: "The next action is overdue and now requires manager intervention."
    }
  } as const;

  return summaries[locale][type];
}

export function getIntakeCopy(locale: SupportedLocale) {
  if (locale === "ar") {
    return {
      action: "إنشاء الحالة الحية",
      budget: "الميزانية",
      customerName: "اسم العميل",
      email: "البريد الإلكتروني",
      helper: "هذا النموذج يرسل إلى واجهة `apps/api` الحية عند توفرها، مع بقاء واجهة العرض التجريبية سليمة إذا لم تكن الخدمة تعمل.",
      message: "تفاصيل الطلب",
      phone: "رقم الهاتف",
      preferredLanguage: "لغة العميل المفضلة",
      projectInterest: "المشروع أو الوحدة المطلوبة",
      summary: "إثبات أول مسار حي من الموقع إلى الحالة المحفوظة ثم إلى شاشة الإدارة.",
      title: "التقاط عميل جديد"
    };
  }

  return {
    action: "Create live case",
    budget: "Budget",
    customerName: "Customer name",
    email: "Email",
    helper: "This form posts into the live `apps/api` alpha when it is available, while the demo shell still degrades safely when it is not.",
    message: "Inquiry details",
    phone: "Phone",
    preferredLanguage: "Customer preferred language",
    projectInterest: "Project or unit of interest",
    summary: "Prove the first live path from website intake to a persisted case and into manager-facing views.",
    title: "Capture a live website lead"
  };
}

export function getQualificationCopy(locale: SupportedLocale) {
  if (locale === "ar") {
    return {
      action: "حفظ التأهيل",
      budgetBand: "نطاق الميزانية",
      intentSummary: "ملخص النية والملاءمة",
      moveInTimeline: "الإطار الزمني للانتقال",
      readiness: "درجة الجاهزية",
      summary: "تسجيل التأهيل بشكل منظم بدل إبقائه داخل المحادثة فقط.",
      title: "تأهيل الحالة"
    };
  }

  return {
    action: "Save qualification",
    budgetBand: "Budget band",
    intentSummary: "Intent and fit summary",
    moveInTimeline: "Move-in timeline",
    readiness: "Readiness score",
    summary: "Capture qualification in a structured way instead of leaving it buried in the thread.",
    title: "Qualification snapshot"
  };
}

export function getQualificationReadinessLabel(locale: SupportedLocale, readiness: QualificationReadiness) {
  const labels = {
    ar: {
      high: "عالية",
      medium: "متوسطة",
      watch: "تحتاج متابعة"
    },
    en: {
      high: "High",
      medium: "Medium",
      watch: "Watch"
    }
  } as const;

  return labels[locale][readiness];
}

export function getSourceLabel(locale: SupportedLocale) {
  return locale === "ar" ? "نموذج الموقع" : "Website form";
}

export function getVisitCopy(locale: SupportedLocale) {
  if (locale === "ar") {
    return {
      action: "حفظ موعد الزيارة",
      location: "الموقع",
      scheduledAt: "تاريخ ووقت الزيارة",
      summary: "ربط الحالة بموعد حقيقي وتحديث الخطوة التالية للإدارة.",
      title: "جدولة الزيارة"
    };
  }

  return {
    action: "Save visit",
    location: "Location",
    scheduledAt: "Visit date and time",
    summary: "Attach a real appointment to the case and move the next action forward for managers.",
    title: "Visit scheduling"
  };
}
