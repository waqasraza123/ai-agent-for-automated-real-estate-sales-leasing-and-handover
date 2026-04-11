import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { MetricTile, Panel, StatusBadge } from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function DashboardPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro
        badge={messages.app.shellNote}
        summary={messages.dashboard.summary}
        title={messages.dashboard.title}
      />

      <section className="metric-grid">
        {demoDataset.dashboardMetrics.map((metric) => (
          <MetricTile
            key={metric.id}
            detail={getLocalizedText(metric.change, locale)}
            label={getLocalizedText(metric.label, locale)}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </section>

      <div className="two-column-grid">
        <Panel eyebrow={messages.common.demoState} title={messages.manager.title}>
          <div className="stack-list">
            {demoDataset.managerAlerts.map((alert) => (
              <article key={alert.id} className={`alert-row alert-row-${alert.severity}`}>
                <div className="row-between">
                  <h3>{getLocalizedText(alert.title, locale)}</h3>
                  <StatusBadge tone={alert.severity === "high" ? "critical" : "warning"}>{alert.severity}</StatusBadge>
                </div>
                <p>{getLocalizedText(alert.detail, locale)}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow={messages.common.nextAction} title={messages.leads.title}>
          <div className="stack-list">
            {demoDataset.cases.map((caseItem) => (
              <article key={caseItem.id} className="case-stack-card">
                <p className="case-link-meta">{caseItem.referenceCode}</p>
                <h3>{caseItem.customerName}</h3>
                <p>{getLocalizedText(caseItem.nextAction, locale)}</p>
                <div className="row-between">
                  <span>{caseItem.owner}</span>
                  <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
