import { notFound } from "next/navigation";

import { getDemoCaseById, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function DocumentsPage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro badge={caseItem.referenceCode} summary={messages.documents.summary} title={messages.documents.title} />
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <Panel title={messages.common.documents}>
        <StatefulStack
          emptySummary={messages.states.emptyDocumentsSummary}
          emptyTitle={messages.states.emptyDocumentsTitle}
          items={caseItem.documents}
          renderItem={(documentItem) => (
            <article key={documentItem.id} className="document-row">
              <div>
                <h3>{getLocalizedText(documentItem.name, locale)}</h3>
                <p>{getLocalizedText(documentItem.detail, locale)}</p>
              </div>
              <StatusBadge tone={documentItem.status === "missing" ? "critical" : documentItem.status === "review" ? "warning" : "success"}>
                {documentItem.status}
              </StatusBadge>
            </article>
          )}
        />
      </Panel>

      <PlaceholderNotice locale={locale} />
    </div>
  );
}
