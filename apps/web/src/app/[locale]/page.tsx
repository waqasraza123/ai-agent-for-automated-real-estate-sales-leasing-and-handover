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
                <Link className={primaryLinkClassName} href={`/${locale}/dashboard`}>
                  {messages.landing.primaryAction}
                </Link>
                <Link className={secondaryLinkClassName} href={`/${locale}/leads`}>
                  {messages.landing.secondaryAction}
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-4xl border border-white/70 bg-white/85 p-4 shadow-panel">
                  <p className="text-xs font-semibold tracking-[0.18em] text-sand-700">
                    {locale === "ar" ? "استجابة متعددة القنوات" : "Multi-channel response"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">
                    {locale === "ar"
                      ? "من الموقع، واتساب، والبريد إلى مسار موحد للرد والمتابعة."
                      : "Website, WhatsApp, and email converge into one trusted response and follow-up flow."}
                  </p>
                </div>
                <div className="rounded-4xl border border-white/70 bg-white/85 p-4 shadow-panel">
                  <p className="text-xs font-semibold tracking-[0.18em] text-sand-700">
                    {locale === "ar" ? "حوكمة بشرية واضحة" : "Visible human governance"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">
                    {locale === "ar"
                      ? "الجودة، الموافقات، والتدخلات تظل صريحة وقابلة للتدقيق."
                      : "QA, approvals, and interventions stay explicit and auditable."}
                  </p>
                </div>
                <div className="rounded-4xl border border-white/70 bg-white/85 p-4 shadow-panel">
                  <p className="text-xs font-semibold tracking-[0.18em] text-sand-700">
                    {locale === "ar" ? "تشغيل جاهز للسوق السعودي" : "Saudi-ready operations"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">
                    {locale === "ar"
                      ? "تجربة عربية أولاً مع واجهة ثنائية اللغة جاهزة للفرق التشغيلية."
                      : "Arabic-first UX with bilingual control surfaces ready for daily operations."}
                  </p>
                </div>
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
                <StatusBadge>{locale === "ar" ? "تشغيل عربي أولاً" : "Arabic-first operations"}</StatusBadge>
                <StatusBadge tone="success">{locale === "ar" ? "واجهة موثوقة" : "Trusted operator UX"}</StatusBadge>
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
            <p className={panelSummaryClassName}>{messages.landing.liveAlphaSummary}</p>
            <LeadCaptureForm locale={locale} />
          </div>
        </Panel>

        <Panel title={messages.leads.title}>
          <div className="mt-4 space-y-5">
            <p className={panelSummaryClassName}>{messages.leads.summary}</p>
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
