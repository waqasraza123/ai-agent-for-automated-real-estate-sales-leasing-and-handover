import Link from "next/link";

import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function ManagerPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro badge={messages.app.shellNote} summary={messages.manager.summary} title={messages.manager.title} />

      <div className="two-column-grid">
        <Panel title={messages.manager.title}>
          <StatefulStack
            emptySummary={messages.states.emptyAlertsSummary}
            emptyTitle={messages.states.emptyAlertsTitle}
            items={demoDataset.managerAlerts}
            renderItem={(alert) => (
              <article key={alert.id} className={`alert-row alert-row-${alert.severity}`}>
                <div className="row-between">
                  <h3>{getLocalizedText(alert.title, locale)}</h3>
                  <StatusBadge tone={alert.severity === "high" ? "critical" : "warning"}>{alert.severity}</StatusBadge>
                </div>
                <p>{getLocalizedText(alert.detail, locale)}</p>
              </article>
            )}
          />
        </Panel>

        <Panel title={messages.leads.title}>
          <StatefulStack
            emptySummary={messages.states.emptyCasesSummary}
            emptyTitle={messages.states.emptyCasesTitle}
            items={demoDataset.cases}
            renderItem={(caseItem) => (
              <Link key={caseItem.id} className="case-link-card" href={`/${locale}/leads/${caseItem.id}`}>
                <div>
                  <p className="case-link-meta">{caseItem.referenceCode}</p>
                  <h3>{caseItem.customerName}</h3>
                  <p>{getLocalizedText(caseItem.nextAction, locale)}</p>
                </div>
                <StatusBadge>{caseItem.owner}</StatusBadge>
              </Link>
            )}
          />
        </Panel>
      </div>
    </div>
  );
}
