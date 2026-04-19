import Link from "next/link";

import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  heroActionsClassName,
  heroCopyClassName,
  heroEyebrowClassName,
  heroShellClassName,
  heroSummaryClassName,
  heroTitleClassName,
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

export default async function LandingPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);
  const persistedCases = await tryListPersistedCases();
  const highlightedCases = persistedCases.slice(0, 3);
  const whatsappSignals =
    locale === "ar"
      ? [
          {
            detail: "من نموذج الموقع إلى أول رد واتساب خلال نفس المسار التشغيلي.",
            label: "أول رد واتساب"
          },
          {
            detail: "حالة الإرسال والتسليم والفشل تظهر بوضوح قبل أن يتوه العميل من الفريق.",
            label: "وضوح حالة التسليم"
          },
          {
            detail: "الزيارة والتأهيل والمستندات تبقى مرتبطة بنفس الخط الزمني ونفس المالك.",
            label: "ارتباط كامل للحالة"
          }
        ]
      : [
          {
            detail: "Website intake opens the case and triggers the first WhatsApp reply on the same operating path.",
            label: "WhatsApp first reply"
          },
          {
            detail: "Queued, sent, delivered, and failed states stay visible before the customer falls through the cracks.",
            label: "Delivery-state proof"
          },
          {
            detail: "Visit booking, qualification, and documents stay correlated to one timeline and one owner.",
            label: "Correlated case flow"
          }
        ];
  const spotlightBadges =
    locale === "ar"
      ? ["واتساب هو القناة الأساسية", "تزامن تقويم جوجل", "تصعيد المدير ظاهر"]
      : ["WhatsApp is primary", "Google Calendar synced", "Manager escalation visible"];
  const liveAlphaSummary =
    locale === "ar"
      ? "أرسل عميلاً من الموقع لترى الحالة تدخل مباشرة إلى مسار واتساب الحي مع متابعة، وجدولة، وإشارات تدخل إدارية واضحة."
      : "Submit a website lead and watch it enter the live WhatsApp operating path with follow-up, scheduling, and explicit manager intervention signals.";
  const inboxSummary =
    locale === "ar"
      ? "هذا الصندوق ليس قائمة أسماء فقط. إنه سطح واتساب الحي: حالة الإرسال، آخر رد وارد، الخطوة التالية، والجاهزية قبل الزيارة."
      : "This inbox is not just a lead list. It is the live WhatsApp operating surface: delivery state, latest inbound reply, next action, and readiness before the visit.";

  return (
    <div className={pageStackClassName}>
      <section className={heroShellClassName}>
        <div className={heroCopyClassName}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
          <div className="absolute -top-16 start-8 h-40 w-40 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute end-6 top-12 h-28 w-28 rounded-full bg-ai-100/70 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className={heroEyebrowClassName}>{messages.landing.eyebrow}</p>
              <h1 className={heroTitleClassName}>{messages.landing.title}</h1>
              <p className={heroSummaryClassName}>{messages.landing.summary}</p>
            </div>

            <div className="space-y-5">
              <div className={heroActionsClassName}>
                <Link className={primaryLinkClassName} href={`/${locale}/leads`}>
                  {messages.landing.primaryAction}
                </Link>
                <Link className={secondaryLinkClassName} href={`/${locale}/manager`}>
                  {messages.landing.secondaryAction}
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {whatsappSignals.map((signal) => (
                  <div key={signal.label} className="rounded-4xl border border-white/70 bg-white/85 p-4 shadow-panel">
                    <p className="text-xs font-semibold tracking-[0.18em] text-sand-700">{signal.label}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <MarketingOrchestrationVisual />
          <Panel eyebrow={messages.app.phaseLabel} title={messages.landing.spotlightTitle}>
            <div className="mt-4 space-y-5">
              <p className={panelSummaryClassName} data-testid="landing-shell-note">
                {messages.landing.spotlightSummary}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="warning">{messages.common.demoState}</StatusBadge>
                {spotlightBadges.map((badge, index) => (
                  <StatusBadge key={badge} tone={index === spotlightBadges.length - 1 ? "success" : "neutral"}>
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

      <div className={twoColumnGridClassName}>
        <Panel title={messages.landing.liveAlphaTitle}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{liveAlphaSummary}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="success">{locale === "ar" ? "بدء محادثة واتساب" : "Start WhatsApp thread"}</StatusBadge>
              <StatusBadge>{locale === "ar" ? "التقاط من الموقع" : "Website capture"}</StatusBadge>
            </div>
            <LeadCaptureForm locale={locale} />
          </div>
        </Panel>

        <Panel title={messages.leads.title}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{inboxSummary}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{locale === "ar" ? "آخر رد واتساب" : "Latest WhatsApp reply"}</StatusBadge>
              <StatusBadge tone="warning">{locale === "ar" ? "تعثر التسليم ظاهر" : "Delivery failures visible"}</StatusBadge>
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
    </div>
  );
}
