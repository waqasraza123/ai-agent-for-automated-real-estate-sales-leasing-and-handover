import { notFound } from "next/navigation";

import { getDemoCaseById, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { TimelinePanel } from "@/components/timeline-panel";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function LeadProfilePage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro badge={caseItem.referenceCode} summary={getLocalizedText(caseItem.summary, locale)} title={messages.profile.title} />
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <div className="two-column-grid">
        <Panel title={caseItem.customerName}>
          <div className="detail-grid">
            <div>
              <p className="detail-label">{messages.common.stage}</p>
              <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
            </div>
            <div>
              <p className="detail-label">{messages.common.currentOwner}</p>
              <p>{caseItem.owner}</p>
            </div>
            <div>
              <p className="detail-label">{messages.common.nextAction}</p>
              <p>{getLocalizedText(caseItem.nextAction, locale)}</p>
            </div>
            <div>
              <p className="detail-label">{messages.common.lastChange}</p>
              <p>{new Date(caseItem.lastMeaningfulChange).toLocaleString(locale)}</p>
            </div>
          </div>
          <div className="case-callout">
            <p>{getLocalizedText(caseItem.budgetLabel, locale)}</p>
            <p>{getLocalizedText(caseItem.attentionNote, locale)}</p>
          </div>
        </Panel>

        <Panel title={messages.common.visitReadiness}>
          <div className="stack-list">
            <div className="case-stack-card">
              <p className="detail-label">{caseItem.visitPlan.scheduledAt}</p>
              <h3>{getLocalizedText(caseItem.visitPlan.location, locale)}</h3>
              <p>{getLocalizedText(caseItem.visitPlan.readinessNote, locale)}</p>
            </div>
          </div>
        </Panel>
      </div>

      <TimelinePanel events={caseItem.timeline} locale={locale} />
      <PlaceholderNotice locale={locale} />
    </div>
  );
}
