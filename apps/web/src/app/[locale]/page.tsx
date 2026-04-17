import Link from "next/link";

import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { MetricTile, Panel, StatusBadge } from "@real-estate-ai/ui";

import { LeadCaptureForm } from "@/components/lead-capture-form";
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
    <div className="page-stack">
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="hero-eyebrow">{messages.landing.eyebrow}</p>
          <h1>{messages.landing.title}</h1>
          <p className="hero-summary">{messages.landing.summary}</p>
          <div className="hero-actions">
            <Link className="primary-link" href={`/${locale}/dashboard`}>
              {messages.landing.primaryAction}
            </Link>
            <Link className="secondary-link" href={`/${locale}/leads`}>
              {messages.landing.secondaryAction}
            </Link>
          </div>
        </div>
        <Panel className="hero-spotlight" eyebrow={messages.app.phaseLabel} title={messages.landing.spotlightTitle}>
          <p className="panel-summary" data-testid="landing-shell-note">
            {messages.landing.spotlightSummary}
          </p>
          <StatusBadge tone="warning">{messages.common.demoState}</StatusBadge>
          <div className="metric-grid">
            {demoDataset.dashboardMetrics.map((metric) => (
              <MetricTile
                key={metric.id}
                detail={getLocalizedText(metric.change, locale)}
                label={getLocalizedText(metric.label, locale)}
                tone={metric.tone}
                value={metric.value}
              />
            ))}
          </div>
        </Panel>
      </section>

      <div className="two-column-grid">
        <Panel title={messages.landing.liveAlphaTitle}>
          <p className="panel-summary">{messages.landing.liveAlphaSummary}</p>
          <LeadCaptureForm locale={locale} />
        </Panel>

        <Panel title={messages.leads.title}>
          <p className="panel-summary">{messages.leads.summary}</p>
          {highlightedCases.length > 0 ? (
            <StatefulStack
              emptySummary={messages.states.emptyCasesSummary}
              emptyTitle={messages.states.emptyCasesTitle}
              items={highlightedCases}
              renderItem={(item) => (
                <Link key={item.caseId} className="case-link-card" href={`/${locale}/leads/${item.caseId}`}>
                  <div>
                    <p className="case-link-meta">{buildCaseReferenceCode(item.caseId)}</p>
                    <h3>{item.customerName}</h3>
                    <p>{item.nextAction}</p>
                  </div>
                  <StatusBadge>{getPersistedCaseStageLabel(locale, item.stage)}</StatusBadge>
                </Link>
              )}
            />
          ) : (
            <StatefulStack
              emptySummary={messages.states.emptyCasesSummary}
              emptyTitle={messages.states.emptyCasesTitle}
              items={demoDataset.cases}
              renderItem={(item) => (
                <Link key={item.id} className="case-link-card" href={`/${locale}/leads/${item.id}`}>
                  <div>
                    <p className="case-link-meta">{item.referenceCode}</p>
                    <h3>{item.customerName}</h3>
                    <p>{getLocalizedText(item.summary, locale)}</p>
                  </div>
                  <StatusBadge>{getLocalizedText(item.stage, locale)}</StatusBadge>
                </Link>
              )}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
