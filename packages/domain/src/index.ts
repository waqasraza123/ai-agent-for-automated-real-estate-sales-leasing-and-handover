export type SupportedLocale = "en" | "ar";

export type LocalizedText = Record<SupportedLocale, string>;

export type CasePriority = "high" | "medium" | "watch";
export type DocumentStatus = "missing" | "received" | "review";
export type HandoverStatus = "blocked" | "ready" | "in-progress";

export interface DashboardMetric {
  id: string;
  label: LocalizedText;
  value: string;
  change: LocalizedText;
  tone: "ocean" | "sand" | "mint" | "rose";
}

export interface ManagerAlert {
  id: string;
  title: LocalizedText;
  detail: LocalizedText;
  severity: "high" | "medium" | "low";
}

export interface JourneyEvent {
  id: string;
  title: LocalizedText;
  detail: LocalizedText;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  sender: "customer" | "automation" | "manager";
  body: LocalizedText;
  translation?: LocalizedText;
  timestamp: string;
  state?: LocalizedText;
}

export interface VisitPlan {
  scheduledAt: string;
  location: LocalizedText;
  readinessNote: LocalizedText;
  suggestedSlots: string[];
}

export interface DocumentItem {
  id: string;
  name: LocalizedText;
  detail: LocalizedText;
  status: DocumentStatus;
}

export interface HandoverMilestone {
  id: string;
  title: LocalizedText;
  owner: string;
  dueDate: string;
  status: HandoverStatus;
  detail: LocalizedText;
}

export interface DemoCase {
  id: string;
  handoverCaseId: string;
  referenceCode: string;
  customerName: string;
  preferredLocale: SupportedLocale;
  source: LocalizedText;
  stage: LocalizedText;
  projectName: LocalizedText;
  summary: LocalizedText;
  nextAction: LocalizedText;
  attentionNote: LocalizedText;
  budgetLabel: LocalizedText;
  owner: string;
  lastMeaningfulChange: string;
  visitPlan: VisitPlan;
  conversation: ConversationMessage[];
  documents: DocumentItem[];
  timeline: JourneyEvent[];
}

export interface DemoHandoverCase {
  id: string;
  projectName: LocalizedText;
  customerName: string;
  readinessLabel: LocalizedText;
  milestones: HandoverMilestone[];
}

export interface DemoDataset {
  dashboardMetrics: DashboardMetric[];
  managerAlerts: ManagerAlert[];
  cases: DemoCase[];
  handoverCases: DemoHandoverCase[];
}

export const supportedLocales: SupportedLocale[] = ["ar", "en"];

export function getLocalizedText(value: LocalizedText, locale: SupportedLocale): string {
  return value[locale];
}

export const demoDataset: DemoDataset = {
  dashboardMetrics: [
    {
      id: "response",
      label: {
        en: "Median first response",
        ar: "متوسط أول استجابة"
      },
      value: "04m 18s",
      change: {
        en: "22% faster than last week",
        ar: "أسرع بنسبة 22٪ من الأسبوع الماضي"
      },
      tone: "ocean"
    },
    {
      id: "visits",
      label: {
        en: "Visits confirmed",
        ar: "الزيارات المؤكدة"
      },
      value: "18",
      change: {
        en: "6 high-intent prospects this weekend",
        ar: "6 عملاء ذوي نية عالية هذا الأسبوع"
      },
      tone: "sand"
    },
    {
      id: "documents",
      label: {
        en: "Document blockers",
        ar: "عوائق المستندات"
      },
      value: "07",
      change: {
        en: "3 need manager review",
        ar: "3 منها تحتاج مراجعة إدارية"
      },
      tone: "rose"
    },
    {
      id: "handover",
      label: {
        en: "Active handovers",
        ar: "حالات التسليم النشطة"
      },
      value: "05",
      change: {
        en: "2 are ready to schedule",
        ar: "2 منها جاهزة للجدولة"
      },
      tone: "mint"
    }
  ],
  managerAlerts: [
    {
      id: "alert-001",
      severity: "high",
      title: {
        en: "Sunrise lead cluster needs reassignment",
        ar: "مجموعة عملاء مشروع صن رايز تحتاج إعادة توزيع"
      },
      detail: {
        en: "Three qualified leads are waiting on the same owner after Friday viewings.",
        ar: "ثلاث حالات مؤهلة ما زالت بانتظار نفس المسؤول بعد زيارات يوم الجمعة."
      }
    },
    {
      id: "alert-002",
      severity: "medium",
      title: {
        en: "Arabic leasing copy approved for launch review",
        ar: "نسخة التأجير العربية جاهزة للمراجعة قبل الإطلاق"
      },
      detail: {
        en: "The leasing flow shell is visually ready but still fixture-backed in Phase 1.",
        ar: "قالب رحلة التأجير جاهز بصرياً لكنه ما زال يعتمد على بيانات تجريبية في المرحلة الأولى."
      }
    }
  ],
  cases: [
    {
      id: "lead-sunrise-001",
      handoverCaseId: "handover-sunrise-001",
      referenceCode: "SUN-001",
      customerName: "Maha Al-Qahtani",
      preferredLocale: "ar",
      source: {
        en: "WhatsApp campaign",
        ar: "حملة واتساب"
      },
      stage: {
        en: "Qualified and visit-ready",
        ar: "مؤهلة وجاهزة للزيارة"
      },
      projectName: {
        en: "Sunrise Residences",
        ar: "صن رايز ريزيدنس"
      },
      summary: {
        en: "Looking for a three-bedroom family apartment with a fast move decision.",
        ar: "تبحث عن شقة عائلية بثلاث غرف نوم مع قرار سريع للانتقال."
      },
      nextAction: {
        en: "Confirm Saturday site visit with parking details",
        ar: "تأكيد زيارة السبت مع إرسال تفاصيل المواقف"
      },
      attentionNote: {
        en: "Human takeover is available because the customer asked for special move timing.",
        ar: "يمكن تفعيل الاستلام البشري لأن العميلة طلبت توقيت انتقال خاص."
      },
      budgetLabel: {
        en: "Budget band: SAR 1.8M to 2.1M",
        ar: "نطاق الميزانية: 1.8 إلى 2.1 مليون ريال"
      },
      owner: "Layla Faris",
      lastMeaningfulChange: "2026-04-10T17:40:00Z",
      visitPlan: {
        scheduledAt: "Saturday, 3:30 PM",
        location: {
          en: "Sunrise Residences Sales Pavilion",
          ar: "جناح مبيعات صن رايز ريزيدنس"
        },
        readinessNote: {
          en: "Parking map and bilingual host brief are queued for confirmation.",
          ar: "خريطة المواقف وملخص الاستقبال الثنائي اللغة جاهزان للإرسال عند التأكيد."
        },
        suggestedSlots: ["Saturday 3:30 PM", "Saturday 5:00 PM", "Sunday 11:00 AM"]
      },
      conversation: [
        {
          id: "msg-1",
          sender: "customer",
          body: {
            en: "I need a quick viewing this weekend for a family apartment.",
            ar: "أحتاج إلى زيارة سريعة هذا الأسبوع لشقة عائلية."
          },
          translation: {
            en: "I need a quick viewing this weekend for a family apartment.",
            ar: "أحتاج إلى زيارة سريعة هذا الأسبوع لشقة عائلية."
          },
          timestamp: "10:12 AM"
        },
        {
          id: "msg-2",
          sender: "automation",
          body: {
            en: "I can help with availability, pricing range, and scheduling. Is Saturday suitable?",
            ar: "أستطيع المساعدة في التوفر ونطاق الأسعار والجدولة. هل يناسبك يوم السبت؟"
          },
          timestamp: "10:13 AM",
          state: {
            en: "Fixture-backed agent draft",
            ar: "مسودة وكيل تعتمد على بيانات تجريبية"
          }
        },
        {
          id: "msg-3",
          sender: "manager",
          body: {
            en: "Keep parking and family-friendly amenities visible in the next reply.",
            ar: "أبرزِ المواقف والمرافق المناسبة للعائلات في الرد التالي."
          },
          timestamp: "10:19 AM"
        }
      ],
      documents: [
        {
          id: "doc-1",
          name: {
            en: "National ID copy",
            ar: "نسخة الهوية الوطنية"
          },
          detail: {
            en: "Received in preview quality only",
            ar: "تم الاستلام بجودة معاينة فقط"
          },
          status: "review"
        },
        {
          id: "doc-2",
          name: {
            en: "Proof of funds",
            ar: "إثبات الملاءة المالية"
          },
          detail: {
            en: "Requested after visit confirmation",
            ar: "سيتم طلبه بعد تأكيد الزيارة"
          },
          status: "missing"
        },
        {
          id: "doc-3",
          name: {
            en: "Reservation form",
            ar: "نموذج الحجز"
          },
          detail: {
            en: "Prepared in bilingual format",
            ar: "مجهز بصيغة ثنائية اللغة"
          },
          status: "received"
        }
      ],
      timeline: [
        {
          id: "event-1",
          title: {
            en: "Lead created",
            ar: "تم إنشاء الحالة"
          },
          detail: {
            en: "Captured from Arabic WhatsApp campaign with project intent attached.",
            ar: "تم التقاطها من حملة واتساب عربية مع ربط نية المشروع."
          },
          timestamp: "10:12 AM"
        },
        {
          id: "event-2",
          title: {
            en: "Qualification snapshot updated",
            ar: "تم تحديث ملخص التأهيل"
          },
          detail: {
            en: "Budget and move timing support a guided site visit.",
            ar: "الميزانية وتوقيت الانتقال يدعمان زيارة ميدانية موجهة."
          },
          timestamp: "10:18 AM"
        },
        {
          id: "event-3",
          title: {
            en: "Manager note added",
            ar: "تمت إضافة ملاحظة إدارية"
          },
          detail: {
            en: "Keep a human-ready path because the customer requested an exception.",
            ar: "يجب إبقاء خيار التدخل البشري جاهزاً لأن العميلة طلبت استثناء."
          },
          timestamp: "10:19 AM"
        }
      ]
    },
    {
      id: "lead-oasis-002",
      handoverCaseId: "handover-oasis-002",
      referenceCode: "OAS-002",
      customerName: "Daniel Brooks",
      preferredLocale: "en",
      source: {
        en: "Developer website",
        ar: "موقع المطور"
      },
      stage: {
        en: "Visit booked, documents warming",
        ar: "تم حجز الزيارة وتجهيز المستندات"
      },
      projectName: {
        en: "Oasis Boulevard",
        ar: "واحة بوليفارد"
      },
      summary: {
        en: "Relocating family seeking a premium townhome and early handover confidence.",
        ar: "عائلة تنتقل وتبحث عن تاون هاوس فاخر مع وضوح مبكر بشأن التسليم."
      },
      nextAction: {
        en: "Prepare post-visit document pack and manager summary",
        ar: "تجهيز حزمة المستندات بعد الزيارة وملخص المدير"
      },
      attentionNote: {
        en: "This shell demonstrates handover visibility without real workflow automation.",
        ar: "هذا القالب يعرض وضوح التسليم دون تشغيل أتمتة فعلية."
      },
      budgetLabel: {
        en: "Budget band: USD 780K to 920K",
        ar: "نطاق الميزانية: 780 ألف إلى 920 ألف دولار"
      },
      owner: "Marcus Hale",
      lastMeaningfulChange: "2026-04-10T14:10:00Z",
      visitPlan: {
        scheduledAt: "Friday, 4:15 PM",
        location: {
          en: "Oasis Boulevard Discovery Suite",
          ar: "جناح الاستكشاف في واحة بوليفارد"
        },
        readinessNote: {
          en: "Model-unit path and financing FAQ remain in demo mode.",
          ar: "مسار الوحدة النموذجية والأسئلة الشائعة عن التمويل ما زالت في وضع العرض."
        },
        suggestedSlots: ["Friday 4:15 PM", "Saturday 12:00 PM", "Saturday 2:45 PM"]
      },
      conversation: [
        {
          id: "msg-1",
          sender: "customer",
          body: {
            en: "Can you show me a family unit with early handover confidence?",
            ar: "هل يمكن عرض وحدة عائلية مع وضوح مبكر بخصوص التسليم؟"
          },
          timestamp: "8:44 AM"
        },
        {
          id: "msg-2",
          sender: "automation",
          body: {
            en: "I can guide you through current availability, visit times, and next-step requirements.",
            ar: "يمكنني إرشادك حول التوفر الحالي ومواعيد الزيارة ومتطلبات الخطوات التالية."
          },
          timestamp: "8:45 AM",
          state: {
            en: "Phase 1 shell response",
            ar: "رد ضمن قالب المرحلة الأولى"
          }
        }
      ],
      documents: [
        {
          id: "doc-1",
          name: {
            en: "Proof of funds",
            ar: "إثبات الملاءة المالية"
          },
          detail: {
            en: "Pack prepared but not yet sent",
            ar: "تم تجهيز الحزمة لكنها لم ترسل بعد"
          },
          status: "missing"
        },
        {
          id: "doc-2",
          name: {
            en: "Visit confirmation brief",
            ar: "ملخص تأكيد الزيارة"
          },
          detail: {
            en: "Ready in English and Arabic",
            ar: "جاهز بالإنجليزية والعربية"
          },
          status: "received"
        },
        {
          id: "doc-3",
          name: {
            en: "Customer preference summary",
            ar: "ملخص تفضيلات العميل"
          },
          detail: {
            en: "Awaiting manager annotation",
            ar: "بانتظار تعليقات المدير"
          },
          status: "review"
        }
      ],
      timeline: [
        {
          id: "event-1",
          title: {
            en: "Website inquiry triaged",
            ar: "تم فرز استفسار الموقع"
          },
          detail: {
            en: "Lead tagged for premium family inventory.",
            ar: "تم وسم الحالة لفئة الوحدات العائلية المميزة."
          },
          timestamp: "8:44 AM"
        },
        {
          id: "event-2",
          title: {
            en: "Visit route prepared",
            ar: "تم تجهيز مسار الزيارة"
          },
          detail: {
            en: "Discovery suite and model unit added to the visit plan.",
            ar: "تمت إضافة جناح الاستكشاف والوحدة النموذجية إلى خطة الزيارة."
          },
          timestamp: "9:10 AM"
        }
      ]
    }
  ],
  handoverCases: [
    {
      id: "handover-sunrise-001",
      customerName: "Maha Al-Qahtani",
      projectName: {
        en: "Sunrise Residences",
        ar: "صن رايز ريزيدنس"
      },
      readinessLabel: {
        en: "Readiness view prepared for premium handover storytelling",
        ar: "تم إعداد لوحة الجاهزية لعرض تجربة تسليم مميزة"
      },
      milestones: [
        {
          id: "handover-1",
          title: {
            en: "Pre-handover checklist review",
            ar: "مراجعة قائمة ما قبل التسليم"
          },
          owner: "Noura Saeed",
          dueDate: "Tuesday",
          status: "in-progress",
          detail: {
            en: "Fixture milestone representing internal readiness review.",
            ar: "مرحلة تجريبية تمثل مراجعة الجاهزية الداخلية."
          }
        },
        {
          id: "handover-2",
          title: {
            en: "Customer scheduling window",
            ar: "نافذة جدولة العميل"
          },
          owner: "Layla Faris",
          dueDate: "Wednesday",
          status: "ready",
          detail: {
            en: "Customer-facing update can be sent once the final slot is selected.",
            ar: "يمكن إرسال تحديث للعميلة بمجرد اختيار الموعد النهائي."
          }
        },
        {
          id: "handover-3",
          title: {
            en: "Snag confirmation",
            ar: "تأكيد الملاحظات الفنية"
          },
          owner: "Project Ops",
          dueDate: "Thursday",
          status: "blocked",
          detail: {
            en: "Blocked by final contractor note in this fixture state.",
            ar: "متوقف بسبب ملاحظة المقاول النهائية في هذه الحالة التجريبية."
          }
        }
      ]
    }
  ]
};

export function getDemoCaseById(caseId: string): DemoCase | undefined {
  return demoDataset.cases.find((item) => item.id === caseId);
}

export function getDemoHandoverCaseById(handoverCaseId: string): DemoHandoverCase | undefined {
  return demoDataset.handoverCases.find((item) => item.id === handoverCaseId);
}
