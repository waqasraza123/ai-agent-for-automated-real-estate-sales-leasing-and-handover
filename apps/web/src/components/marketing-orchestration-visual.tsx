import { StatusBadge } from "@real-estate-ai/ui";

interface MarketingOrchestrationVisualProps {
  locale: "ar" | "en";
}

export function MarketingOrchestrationVisual({ locale }: MarketingOrchestrationVisualProps) {
  const isArabic = locale === "ar";
  const copy = isArabic
    ? {
        title: "مسار واتساب حي",
        subtitle: "عميل جديد من حملة مشروع سكني",
        channel: "واتساب",
        owner: "المالك: نورة - فريق المبيعات",
        replyLabel: "رد آلي تحت السيطرة",
        reply:
          "أهلاً أحمد، وصلنا طلبك بخصوص شقة بثلاث غرف. هل يناسبك موعد زيارة هذا الأسبوع؟",
        qualification: "التأهيل",
        qualificationDetail: "الميزانية، الجاهزية، وتوقيت الشراء محفوظة في نفس الحالة.",
        documents: "المستندات",
        documentsDetail: "الهوية وإثبات الدخل مطلوبان قبل تثبيت الحجز.",
        manager: "تنبيه المدير",
        managerDetail: "متابعة متأخرة بعد 4 ساعات، مع مالك وخطوة تالية واضحة.",
        cta: "جاهز للتدخل"
      }
    : {
        title: "Live WhatsApp path",
        subtitle: "New buyer from a residential campaign",
        channel: "WhatsApp",
        owner: "Owner: Noura - sales team",
        replyLabel: "Controlled automated reply",
        reply:
          "Hi Ahmed, we received your request for a three-bedroom apartment. Would a visit this week work for you?",
        qualification: "Qualification",
        qualificationDetail: "Budget, readiness, and buying timeline stay on the same case.",
        documents: "Documents",
        documentsDetail: "ID and income proof are requested before reservation is confirmed.",
        manager: "Manager alert",
        managerDetail: "Follow-up is overdue after 4 hours, with owner and next step visible.",
        cta: "Ready for intervention"
      };

  const proofItems = isArabic
    ? ["رد خلال دقيقتين", "خطوة تالية محفوظة", "تصعيد بلا تخمين"]
    : ["Reply in 2 minutes", "Next step saved", "No guessing on escalation"];

  return (
    <div className="relative min-h-[25rem] overflow-hidden rounded-5xl border border-canvas-line/80 bg-white/88 p-5 shadow-panel-lg backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4 border-b border-canvas-line/70 pb-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-sand-700">{copy.channel}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">{copy.title}</h2>
          <p className="mt-1 text-sm leading-7 text-ink-soft">{copy.subtitle}</p>
        </div>
        <StatusBadge tone="success">{copy.cta}</StatusBadge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-4xl border border-brand-200/70 bg-brand-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-700">{copy.replyLabel}</p>
            <span className="text-xs text-ink-muted">{copy.owner}</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-ink">{copy.reply}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <WorkflowStep title={copy.qualification} detail={copy.qualificationDetail} tone="brand" />
          <WorkflowStep title={copy.documents} detail={copy.documentsDetail} tone="sand" />
          <WorkflowStep title={copy.manager} detail={copy.managerDetail} tone="warning" />
        </div>
      </div>

      <div className="mt-5 rounded-4xl border border-canvas-line/70 bg-canvas-raised/80 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {proofItems.map((item) => (
            <div key={item} className="rounded-3xl border border-white/80 bg-white/82 px-4 py-3 text-sm font-semibold text-ink shadow-panel-soft">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({
  detail,
  title,
  tone
}: {
  detail: string;
  title: string;
  tone: "brand" | "sand" | "warning";
}) {
  const toneClassName =
    tone === "brand"
      ? "border-brand-200/70 bg-brand-50/70"
      : tone === "sand"
        ? "border-sand-200/70 bg-sand-50/75"
        : "border-warning-200/75 bg-warning-50/75";

  return (
    <div className={`rounded-4xl border p-4 ${toneClassName}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{detail}</p>
    </div>
  );
}
