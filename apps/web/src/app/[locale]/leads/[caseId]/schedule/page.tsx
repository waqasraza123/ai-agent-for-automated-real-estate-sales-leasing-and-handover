import { notFound } from "next/navigation";

import { getDemoCaseById, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function SchedulePage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro badge={caseItem.referenceCode} summary={messages.schedule.summary} title={messages.schedule.title} />
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <div className="two-column-grid">
        <Panel title={messages.common.visitReadiness}>
          <p className="detail-label">{caseItem.visitPlan.scheduledAt}</p>
          <h3>{caseItem.customerName}</h3>
          <p>{caseItem.visitPlan.location[locale]}</p>
          <p>{caseItem.visitPlan.readinessNote[locale]}</p>
        </Panel>

        <Panel title={messages.schedule.title}>
          <div className="slot-grid">
            {caseItem.visitPlan.suggestedSlots.map((slot) => (
              <div key={slot} className="slot-card">
                <span>{slot}</span>
                <StatusBadge tone="success">{messages.common.demoState}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <PlaceholderNotice locale={locale} />
    </div>
  );
}
