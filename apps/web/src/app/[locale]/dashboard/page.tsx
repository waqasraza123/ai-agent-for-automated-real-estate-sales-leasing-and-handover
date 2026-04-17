import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  alertCardClassName,
  caseMetaClassName,
  caseStackCardClassName,
  criticalAlertCardClassName,
  cx,
  MetricTile,
  metricGridClassName,
  pageStackClassName,
  Panel,
  rowBetweenClassName,
  StatusBadge,
  successCardClassName,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function DashboardPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);

  return (
    <div className={pageStackClassName}>
      <ScreenIntro
        badge={messages.app.shellNote}
        summary={messages.dashboard.summary}
        title={messages.dashboard.title}
      />

      <section className={metricGridClassName}>
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

      <div className={twoColumnGridClassName}>
        <Panel eyebrow={messages.common.demoState} title={messages.manager.title}>
          <div className="mt-4">
            <StatefulStack
              emptySummary={messages.states.emptyAlertsSummary}
              emptyTitle={messages.states.emptyAlertsTitle}
              items={demoDataset.managerAlerts}
              renderItem={(alert) => (
                <article
                  key={alert.id}
                  className={cx(
                    alert.severity === "high"
                      ? criticalAlertCardClassName
                      : alert.severity === "medium"
                        ? alertCardClassName
                        : successCardClassName,
                    "space-y-3"
                  )}
                >
                  <div className={rowBetweenClassName}>
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{getLocalizedText(alert.title, locale)}</h3>
                    <StatusBadge tone={alert.severity === "high" ? "critical" : "warning"}>{alert.severity}</StatusBadge>
                  </div>
                  <p className="text-sm leading-7 text-ink-soft">{getLocalizedText(alert.detail, locale)}</p>
                </article>
              )}
            />
          </div>
        </Panel>

        <Panel eyebrow={messages.common.nextAction} title={messages.leads.title}>
          <div className="mt-4">
            <StatefulStack
              emptySummary={messages.states.emptyCasesSummary}
              emptyTitle={messages.states.emptyCasesTitle}
              items={demoDataset.cases}
              renderItem={(caseItem) => (
                <article key={caseItem.id} className={caseStackCardClassName}>
                  <p className={caseMetaClassName}>{caseItem.referenceCode}</p>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{caseItem.customerName}</h3>
                  <p className="text-sm leading-7 text-ink-soft">{getLocalizedText(caseItem.nextAction, locale)}</p>
                  <div className={rowBetweenClassName}>
                    <span className="text-sm text-ink-soft">{caseItem.owner}</span>
                    <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
                  </div>
                </article>
              )}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
