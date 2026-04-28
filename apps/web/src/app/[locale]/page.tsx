import Link from "next/link";

import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  bodyTextClassName,
  caseMetaClassName,
  cardSurfaceClassName,
  cx,
  detailGridClassName,
  heroActionsClassName,
  heroCopyClassName,
  heroEyebrowClassName,
  heroSummaryClassName,
  metricGridCompactClassName,
  MetricTile,
  pageStackClassName,
  Panel,
  panelSummaryClassName,
  primaryLinkClassName,
  secondaryLinkClassName,
  StatusBadge,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import { LeadCaptureForm } from "@/components/lead-capture-form";
import { LinkedQueueCard } from "@/components/linked-queue-card";
import { MarketingOrchestrationVisual } from "@/components/marketing-orchestration-visual";
import { StatefulStack } from "@/components/stateful-stack";
import { buildCaseReferenceCode, getPersistedCaseStageLabel } from "@/lib/persisted-case-presenters";
import { tryListPersistedCases } from "@/lib/live-api";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

type Tone = "brand" | "ai" | "warning" | "success";

interface LandingCopy {
  productName: string;
  heroTitle: string;
  heroSummary: string;
  demoCta: string;
  previewCta: string;
  operatorSignals: Array<{ detail: string; label: string }>;
  proofBadges: string[];
  problemTitle: string;
  problemSummary: string;
  problems: Array<{ detail: string; label: string; tone: Tone }>;
  workflowTitle: string;
  workflowSummary: string;
  workflowSteps: Array<{ detail: string; label: string }>;
  usersTitle: string;
  usersSummary: string;
  users: Array<{ detail: string; label: string }>;
  controlTitle: string;
  controlSummary: string;
  controls: Array<{ detail: string; label: string; tone: Tone }>;
  liveProofTitle: string;
  liveProofSummary: string;
  inboxProofSummary: string;
  handoverTitle: string;
  handoverSummary: string;
  demoTitle: string;
  demoSummary: string;
  demoFields: Array<{ detail: string; label: string }>;
  demoNote: string;
}

const landingCopy: Record<SupportedLocale, LandingCopy> = {
  ar: {
    productName: "نظام تشغيل العملاء العقاريين في السعودية",
    heroTitle: "حوّل واتساب من فوضى متابعة إلى مسار مبيعات واضح.",
    heroSummary:
      "صفحة تصميم شريك لفرق المطورين العقاريين في السعودية: رد أول سريع، تأهيل عربي وإنجليزي، متابعة لا تضيع، جاهزية مستندات، وتصعيد إداري واضح قبل خسارة العميل.",
    demoCta: "احجز عرضاً تجريبياً",
    previewCta: "شاهد صندوق العملاء",
    operatorSignals: [
      {
        detail: "كل عميل يدخل في حالة واحدة لها مالك، لغة، مرحلة، وخطوة تالية.",
        label: "حالة موحدة"
      },
      {
        detail: "الردود والأسئلة الأولى تعمل بالعربية أو الإنجليزية مع حدود موافقة واضحة.",
        label: "تشغيل ثنائي اللغة"
      },
      {
        detail: "المدير يرى التأخير، التعثر، وحاجة التدخل من طابور واحد.",
        label: "رؤية إدارية"
      }
    ],
    proofBadges: ["واتساب أولاً", "للمبيعات والتأجير", "تدخل بشري آمن"],
    problemTitle: "المشكلة التي ندخل عليها",
    problemSummary:
      "فرق المبيعات لا تخسر العملاء لأن المنتج العقاري ضعيف فقط. غالباً تخسرهم بسبب تأخر الرد، متابعة غير منضبطة، ومعلومات مشتتة بين واتساب، الجداول، والموظفين.",
    problems: [
      {
        detail: "عميل يدخل مساءً أو وقت ضغط ولا يجد رداً سريعاً باللغة المناسبة.",
        label: "رد أول بطيء",
        tone: "warning"
      },
      {
        detail: "العميل يسأل ثم يختفي، ولا يعرف المدير هل تمت المتابعة أم لا.",
        label: "متابعة غير مرئية",
        tone: "ai"
      },
      {
        detail: "المستندات المطلوبة تظهر متأخرة، بلا مالك واضح أو تاريخ استحقاق.",
        label: "مطاردة مستندات",
        tone: "brand"
      }
    ],
    workflowTitle: "كيف يجعل التشغيل أبسط",
    workflowSummary:
      "المنتج لا يحاول استبدال فريق المبيعات. هو يثبت إيقاعاً تشغيلياً واضحاً حول الأشياء التي تتكرر يومياً وتضيع الإيراد عندما تبقى يدوية.",
    workflowSteps: [
      {
        detail: "نموذج الموقع أو واتساب يفتح حالة محفوظة فوراً.",
        label: "1. التقاط العميل"
      },
      {
        detail: "الرد الأول يرسل باللغة المناسبة ضمن سياسة الفريق.",
        label: "2. رد فوري"
      },
      {
        detail: "الميزانية، التوقيت، والملاءمة تتحول إلى حقول واضحة.",
        label: "3. تأهيل منظم"
      },
      {
        detail: "الزيارة أو الاتصال يظهر عندما تكون الجاهزية كافية.",
        label: "4. جدولة"
      },
      {
        detail: "التذكيرات والخطوات التالية تبقى مرتبطة بالمالك والوقت.",
        label: "5. متابعة"
      },
      {
        detail: "المستندات والتعثرات تظهر للمدير قبل أن تتوقف الحالة.",
        label: "6. جاهزية وتصعيد"
      }
    ],
    usersTitle: "ماذا يصبح أسهل لكل مستخدم",
    usersSummary:
      "كل مساحة تعرض ما يحتاجه صاحب الدور لاتخاذ القرار التالي، بدون البحث في محادثات متفرقة أو سؤال الفريق يدوياً.",
    users: [
      {
        detail: "يرى العملاء الجدد، آخر رد، والخطوة التالية من نفس الصندوق.",
        label: "مندوب المبيعات"
      },
      {
        detail: "يعرف الحالات المتأخرة، المالك الحالي، وسبب التصعيد.",
        label: "مدير المبيعات"
      },
      {
        detail: "يتابع المطلوب، المرفوع، والمرفوض من قائمة واحدة.",
        label: "مسؤول المستندات"
      },
      {
        detail: "يفهم ضغط القناة وحالة التقويم بدون تقرير يدوي.",
        label: "قائد التشغيل"
      }
    ],
    controlTitle: "الأتمتة موجودة، لكن الحكم التجاري يبقى بشرياً",
    controlSummary:
      "النظام يسرع الردود والمتابعة، لكنه لا يعد بسعر، خصم، التزام قانوني، أو موعد تسليم خارج قواعد الفريق.",
    controls: [
      {
        detail: "يرسل الردود منخفضة المخاطر ويطلب معلومات التأهيل الأساسية.",
        label: "ما يمكن أتمتته",
        tone: "success"
      },
      {
        detail: "يعرض مسودة عندما يحتاج الرد حساسية أو ثقة أعلى.",
        label: "ما يحتاج مراجعة",
        tone: "ai"
      },
      {
        detail: "يصعد الغضب، الاستثناءات، الوعود التجارية، ومخاطر السياسة للمدير.",
        label: "ما يجب إيقافه",
        tone: "warning"
      }
    ],
    liveProofTitle: "جرّب مسار العميل الحي",
    liveProofSummary:
      "أدخل عميلاً تجريبياً لترى كيف يتحول إلى حالة محفوظة داخل صندوق العملاء مع قناة واتساب، متابعة، وجدولة واضحة.",
    inboxProofSummary:
      "هذه ليست قائمة أسماء. إنها معاينة تشغيلية للحالة، آخر خطوة، والمالك الذي سيمنع ضياع العميل.",
    handoverTitle: "التسليم يأتي لاحقاً",
    handoverSummary:
      "يمكن ربط التسليم بعد إثبات مسار المبيعات والتأجير. الواجهة الحالية تبقي التسليم كإضافة لاحقة حتى لا يتشتت المنتج عن أول قيمة تجارية.",
    demoTitle: "احجز عرض تصميم شريك",
    demoSummary:
      "الخطوة المناسبة الآن هي جلسة مع فريق مبيعات أو تأجير سعودي لديه ضغط عملاء حقيقي على واتساب والموقع. نراجع القنوات، قواعد التأهيل، المتابعة، وطابور المدير.",
    demoFields: [
      {
        detail: "مطور عقاري أو فريق تأجير لديه تدفق عملاء وارد.",
        label: "الفريق المناسب"
      },
      {
        detail: "واتساب، نموذج الموقع، التقويم، وقائمة المستندات المطلوبة.",
        label: "ما نحتاجه"
      },
      {
        detail: "رد أسرع، متابعة أوضح، وتصعيد إداري قبل ضياع العميل.",
        label: "ما نثبته"
      }
    ],
    demoNote: "هذا القسم لا يرسل طلباً بعد. اربطه لاحقاً بالبريد أو CRM عندما يتم اختيار قناة مبيعات حقيقية."
  },
  en: {
    productName: "Saudi Real Estate Lead OS",
    heroTitle: "Turn WhatsApp lead chaos into a controlled sales workflow.",
    heroSummary:
      "A design-partner landing page for Saudi real-estate developers: fast first response, Arabic and English qualification, disciplined follow-up, document readiness, and manager escalation before leads are lost.",
    demoCta: "Book a demo",
    previewCta: "View lead inbox",
    operatorSignals: [
      {
        detail: "Every inquiry becomes one case with an owner, language, stage, and next action.",
        label: "Unified case"
      },
      {
        detail: "First replies and qualification prompts work in Arabic or English with approval boundaries.",
        label: "Bilingual operation"
      },
      {
        detail: "Managers see delays, blockers, and intervention needs from one queue.",
        label: "Manager visibility"
      }
    ],
    proofBadges: ["WhatsApp first", "Sales and leasing", "Human-controlled AI"],
    problemTitle: "The problem it removes",
    problemSummary:
      "Real-estate teams rarely lose leads because the project is weak. They lose them through slow replies, inconsistent follow-up, and customer context scattered across WhatsApp, spreadsheets, and agents.",
    problems: [
      {
        detail: "A buyer arrives after hours or during campaign volume and waits too long for the right-language response.",
        label: "Slow first response",
        tone: "warning"
      },
      {
        detail: "The customer asks a question, goes quiet, and the manager cannot see whether follow-up happened.",
        label: "Invisible follow-up",
        tone: "ai"
      },
      {
        detail: "Required documents appear late, with no clear owner, due time, or blocker trail.",
        label: "Document chasing",
        tone: "brand"
      }
    ],
    workflowTitle: "How it makes daily work simpler",
    workflowSummary:
      "The product does not replace the sales team. It gives the team a repeatable operating rhythm around the work that happens every day and leaks revenue when it stays manual.",
    workflowSteps: [
      {
        detail: "Website form or WhatsApp inquiry opens a saved case immediately.",
        label: "1. Capture"
      },
      {
        detail: "The first reply goes out in the right language under team policy.",
        label: "2. Respond"
      },
      {
        detail: "Budget, timing, and fit become structured fields.",
        label: "3. Qualify"
      },
      {
        detail: "Visit or call scheduling appears when the case is ready.",
        label: "4. Schedule"
      },
      {
        detail: "Reminders and next actions stay tied to an owner and due time.",
        label: "5. Follow up"
      },
      {
        detail: "Documents and stalled cases become visible before the deal stops.",
        label: "6. Escalate"
      }
    ],
    usersTitle: "What gets easier for each operator",
    usersSummary:
      "Each workspace shows the next decision for that role, without digging through scattered chats or asking the team for manual updates.",
    users: [
      {
        detail: "Sees new leads, latest reply, and next action from the same inbox.",
        label: "Sales agent"
      },
      {
        detail: "Knows overdue cases, current owner, and escalation reason.",
        label: "Sales manager"
      },
      {
        detail: "Tracks requested, uploaded, rejected, and missing evidence in one checklist.",
        label: "Document staff"
      },
      {
        detail: "Understands channel pressure and calendar state without a manual report.",
        label: "Operations lead"
      }
    ],
    controlTitle: "Automation moves fast, commercial judgment stays human",
    controlSummary:
      "The system speeds up replies and follow-up, but it does not promise pricing, incentives, legal terms, or possession timelines outside approved rules.",
    controls: [
      {
        detail: "Sends low-risk replies and asks the basic qualification questions.",
        label: "Can automate",
        tone: "success"
      },
      {
        detail: "Prepares a draft when the reply needs sensitivity or stronger confidence.",
        label: "Needs review",
        tone: "ai"
      },
      {
        detail: "Escalates anger, exceptions, commercial promises, and policy risk to a manager.",
        label: "Must stop",
        tone: "warning"
      }
    ],
    liveProofTitle: "Try the live lead path",
    liveProofSummary:
      "Submit a test lead to see it become a saved case in the lead inbox with WhatsApp channel state, follow-up, and scheduling context.",
    inboxProofSummary:
      "This is not a name list. It is an operational preview of stage, latest action, and the owner responsible for keeping the lead alive.",
    handoverTitle: "Handover comes later",
    handoverSummary:
      "Handover can attach after the sales and leasing workflow proves measurable value. The landing page keeps it as a later add-on so the product stays focused on the first commercial wedge.",
    demoTitle: "Book a design-partner demo",
    demoSummary:
      "The right next step is a working session with a Saudi sales or leasing team that already has real inbound pressure from WhatsApp and website leads. We map channels, qualification rules, follow-up policy, and the manager queue.",
    demoFields: [
      {
        detail: "A developer sales or leasing team with inbound lead volume.",
        label: "Best-fit team"
      },
      {
        detail: "WhatsApp, website form, calendar, and document checklist.",
        label: "What we review"
      },
      {
        detail: "Faster response, clearer follow-up, and escalation before leads are lost.",
        label: "What we prove"
      }
    ],
    demoNote: "This section is static for now. Connect it to email or CRM after the real sales channel is chosen."
  }
};

export default async function LandingPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);
  const copy = landingCopy[locale];
  const persistedCases = await tryListPersistedCases();
  const highlightedCases = persistedCases.slice(0, 3);

  return (
    <div className={pageStackClassName}>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.88fr)]">
        <div className={cx(heroCopyClassName, "min-h-[31rem]")}>
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className={heroEyebrowClassName}>{messages.landing.eyebrow}</p>
              <p className="text-sm font-semibold text-brand-700">{copy.productName}</p>
              <h1 className="max-w-[13ch] text-balance font-display text-4xl font-semibold leading-none text-ink sm:text-5xl xl:text-7xl">
                {copy.heroTitle}
              </h1>
              <p className={heroSummaryClassName}>{copy.heroSummary}</p>
            </div>

            <div className="space-y-5">
              <div className={heroActionsClassName}>
                <a className={primaryLinkClassName} href="#book-demo">
                  {copy.demoCta}
                </a>
                <Link className={secondaryLinkClassName} href={`/${locale}/leads`}>
                  {copy.previewCta}
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {copy.operatorSignals.map((signal) => (
                  <ValueCard key={signal.label} detail={signal.detail} label={signal.label} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <MarketingOrchestrationVisual locale={locale} />
          <Panel eyebrow={messages.app.phaseLabel} title={messages.landing.spotlightTitle}>
            <div className="mt-4 space-y-5">
              <p className={panelSummaryClassName} data-testid="landing-shell-note">
                {messages.landing.spotlightSummary}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="warning">{messages.common.demoState}</StatusBadge>
                {copy.proofBadges.map((badge, index) => (
                  <StatusBadge key={badge} tone={index === 2 ? "success" : "neutral"}>
                    {badge}
                  </StatusBadge>
                ))}
              </div>
              <div className={metricGridCompactClassName}>
                {demoDataset.dashboardMetrics.map((metric) => (
                  <MetricTile
                    density="compact"
                    key={metric.id}
                    detail={getLocalizedText(metric.change, locale)}
                    label={getLocalizedText(metric.label, locale)}
                    tone={metric.tone}
                    value={metric.value}
                  />
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <Panel title={copy.problemTitle}>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <p className={panelSummaryClassName}>{copy.problemSummary}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {copy.problems.map((problem) => (
              <InsightCard key={problem.label} detail={problem.detail} label={problem.label} tone={problem.tone} />
            ))}
          </div>
        </div>
      </Panel>

      <Panel title={copy.workflowTitle}>
        <div className="mt-4 space-y-5">
          <p className={panelSummaryClassName}>{copy.workflowSummary}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {copy.workflowSteps.map((step) => (
              <div key={step.label} className={cx(cardSurfaceClassName, "p-5")}>
                <p className="text-sm font-semibold text-brand-700">{step.label}</p>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className={twoColumnGridClassName}>
        <Panel title={copy.usersTitle}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{copy.usersSummary}</p>
            <div className={detailGridClassName}>
              {copy.users.map((user) => (
                <ValueCard key={user.label} detail={user.detail} label={user.label} />
              ))}
            </div>
          </div>
        </Panel>

        <Panel title={copy.controlTitle}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{copy.controlSummary}</p>
            <div className="grid gap-3">
              {copy.controls.map((control) => (
                <InsightCard key={control.label} detail={control.detail} label={control.label} tone={control.tone} />
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className={twoColumnGridClassName}>
        <Panel title={copy.liveProofTitle}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{copy.liveProofSummary}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="success">{locale === "ar" ? "مسار واتساب تجريبي" : "Test WhatsApp path"}</StatusBadge>
              <StatusBadge>{locale === "ar" ? "التقاط من الموقع" : "Website capture"}</StatusBadge>
            </div>
            <LeadCaptureForm locale={locale} />
          </div>
        </Panel>

        <Panel title={messages.leads.title}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{copy.inboxProofSummary}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{locale === "ar" ? "آخر رد واتساب" : "Latest WhatsApp reply"}</StatusBadge>
              <StatusBadge tone="warning">{locale === "ar" ? "خطر المتابعة ظاهر" : "Follow-up risk visible"}</StatusBadge>
            </div>
            {highlightedCases.length > 0 ? (
              <StatefulStack
                emptySummary={messages.states.emptyCasesSummary}
                emptyTitle={messages.states.emptyCasesTitle}
                items={highlightedCases}
                renderItem={(item) => (
                  <LinkedQueueCard
                    key={item.caseId}
                    badges={<StatusBadge>{getPersistedCaseStageLabel(locale, item.stage)}</StatusBadge>}
                    href={`/${locale}/leads/${item.caseId}`}
                    meta={buildCaseReferenceCode(item.caseId)}
                    summary={item.nextAction}
                    title={item.customerName}
                  />
                )}
              />
            ) : (
              <StatefulStack
                emptySummary={messages.states.emptyCasesSummary}
                emptyTitle={messages.states.emptyCasesTitle}
                items={demoDataset.cases}
                renderItem={(item) => (
                  <LinkedQueueCard
                    key={item.id}
                    badges={<StatusBadge>{getLocalizedText(item.stage, locale)}</StatusBadge>}
                    href={`/${locale}/leads/${item.id}`}
                    meta={item.referenceCode}
                    summary={getLocalizedText(item.summary, locale)}
                    title={item.customerName}
                  />
                )}
              />
            )}
          </div>
        </Panel>
      </div>

      <Panel title={copy.handoverTitle}>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className={panelSummaryClassName}>{copy.handoverSummary}</p>
          <StatusBadge>{locale === "ar" ? "إضافة لاحقة" : "Later add-on"}</StatusBadge>
        </div>
      </Panel>

      <Panel className="scroll-mt-8" title={copy.demoTitle}>
        <div id="book-demo" className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-4">
            <p className={panelSummaryClassName}>{copy.demoSummary}</p>
            <p className={cx(bodyTextClassName, "rounded-3xl border border-dashed border-canvas-line/70 bg-white/70 p-4")}>{copy.demoNote}</p>
          </div>
          <div className="grid gap-3">
            {copy.demoFields.map((field) => (
              <div key={field.label} className={cx(cardSurfaceClassName, "p-5")}>
                <p className="text-xs font-semibold tracking-[0.16em] text-sand-700">{field.label}</p>
                <p className="mt-2 text-sm leading-7 text-ink">{field.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function ValueCard({
  detail,
  label
}: {
  detail: string;
  label: string;
}) {
  return (
    <div className={cx(cardSurfaceClassName, "p-4")}>
      <p className={caseMetaClassName}>{label}</p>
      <p className="mt-2 text-sm leading-7 text-ink">{detail}</p>
    </div>
  );
}

function InsightCard({
  detail,
  label,
  tone
}: {
  detail: string;
  label: string;
  tone: Tone;
}) {
  const toneClassName =
    tone === "success"
      ? "border-success-200/75 bg-success-50/75"
      : tone === "warning"
        ? "border-warning-200/75 bg-warning-50/80"
        : tone === "ai"
          ? "border-ai-200/75 bg-ai-50/75"
          : "border-brand-200/75 bg-brand-50/75";

  return (
    <div className={cx("rounded-4xl border p-5 shadow-panel-soft backdrop-blur-sm", toneClassName)}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-sm leading-7 text-ink-soft">{detail}</p>
    </div>
  );
}
