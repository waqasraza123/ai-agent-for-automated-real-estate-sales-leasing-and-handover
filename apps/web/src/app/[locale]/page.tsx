import Link from "next/link";

import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { MetricTile, Panel, StatusBadge } from "@real-estate-ai/ui";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function LandingPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);

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
        <Panel title={messages.dashboard.title}>
          <p className="panel-summary">{messages.dashboard.summary}</p>
          <div className="stack-list">
            {demoDataset.managerAlerts.map((alert) => (
              <article key={alert.id} className={`alert-row alert-row-${alert.severity}`}>
                <h3>{getLocalizedText(alert.title, locale)}</h3>
                <p>{getLocalizedText(alert.detail, locale)}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title={messages.leads.title}>
          <p className="panel-summary">{messages.leads.summary}</p>
          <div className="stack-list">
            {demoDataset.cases.map((caseItem) => (
              <Link key={caseItem.id} className="case-link-card" href={`/${locale}/leads/${caseItem.id}`}>
                <div>
                  <p className="case-link-meta">{caseItem.referenceCode}</p>
                  <h3>{caseItem.customerName}</h3>
                  <p>{getLocalizedText(caseItem.summary, locale)}</p>
                </div>
                <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
