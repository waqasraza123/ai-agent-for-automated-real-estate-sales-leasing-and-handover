import type { ActionMessagesSection, ErrorsSection, FormsSection, ValidationSection } from "../types";

export const arValidation: ValidationSection = {
  generic: "راجع الحقول المطلوبة ثم أعد الإرسال."
};

export const arErrors: ErrorsSection = {
  genericAction: "تعذر إكمال العملية الحالية. تحقق من تشغيل الخدمات المحلية ثم أعد المحاولة.",
  liveServicesUnavailable: "خدمة الواجهة الحية غير متاحة حالياً. شغّل apps/api وapps/worker ثم أعد المحاولة.",
  localRoleRequired: "هذا الإجراء يتطلب دوراً مناسباً في وضع التحكم المحلي."
};

export const arForms: FormsSection = {
  pendingCreate: "جارٍ الإنشاء...",
  pendingSave: "جارٍ الحفظ...",
  pendingSend: "جارٍ الإرسال...",
  pendingUpdate: "جارٍ التحديث...",
  pendingStart: "جارٍ البدء...",
  pendingComplete: "جارٍ الإتمام...",
  pendingApprove: "جارٍ الاعتماد...",
  pendingPrepare: "جارٍ التجهيز...",
  pendingSchedule: "جارٍ حفظ الموعد...",
  updateAction: "تحديث",
  alreadyStarted: "تم البدء",
  alreadyCompleted: "مكتملة",
  waitingForScheduling: "بانتظار الجدولة",
  waitingForExecution: "بانتظار التنفيذ",
  leadCapture: {
    customerNamePlaceholder: "مها القحطاني",
    emailPlaceholder: "maha@example.com",
    phonePlaceholder: "+966 5X XXX XXXX",
    projectInterestPlaceholder: "صن رايز ريزيدنس",
    budgetPlaceholder: "1.8 إلى 2.1 مليون ريال",
    messagePlaceholder: "عميلة جادة تبحث عن شقة ثلاث غرف نوم وتفضّل زيارة نهاية الأسبوع.",
    preferredLanguageAr: "العربية",
    preferredLanguageEn: "الإنجليزية"
  },
  visitScheduling: {
    locationPlaceholder: "صالة مبيعات صن رايز ريزيدنس"
  }
};

export const arActions: ActionMessagesSection = {
  qualificationSaved: "تم حفظ التأهيل وتحديث الحالة.",
  visitScheduled: "تم حفظ موعد الزيارة.",
  automationPaused: "تم إيقاف الأتمتة لهذه الحالة.",
  automationResumed: "تمت إعادة تشغيل الأتمتة لهذه الحالة.",
  documentUpdated: "تم تحديث حالة المستند.",
  handoverTaskUpdated: "تم تحديث عنصر جاهزية التسليم.",
  handoverExecutionStarted: "تم بدء حالة التنفيذ في يوم التسليم على السجل الحي.",
  handoverExecutionBlocked: "لا يمكن بدء التنفيذ قبل اكتمال الجدولة الداخلية وتصفية جميع العوائق المفتوحة.",
  handoverCompleted: "تم إغلاق يوم التسليم بملخص إتمام مضبوط.",
  handoverCompletionBlocked: "لا يمكن إتمام التسليم قبل بدء التنفيذ ومعالجة جميع العوائق المفتوحة."
};
