import { notFound } from "next/navigation";

import { getDemoCaseById, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { DocumentStatusForm } from "@/components/document-status-form";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";
import { buildCaseReferenceCode, getPersistedDocumentDisplay } from "@/lib/persisted-case-presenters";
import { tryGetPersistedCaseDetail } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function DocumentsPage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const persistedCase = await tryGetPersistedCaseDetail(caseId);
  const messages = getMessages(locale);

  if (persistedCase) {
    const documentItems = getPersistedDocumentDisplay(locale, persistedCase);

    return (
      <div className="page-stack">
        <ScreenIntro badge={buildCaseReferenceCode(persistedCase.caseId)} summary={messages.documents.summary} title={messages.documents.title} />
        <CaseRouteTabs caseId={persistedCase.caseId} locale={locale} />

        <Panel title={messages.common.documents}>
          <StatefulStack
            emptySummary={messages.states.emptyDocumentsSummary}
            emptyTitle={messages.states.emptyDocumentsTitle}
            items={documentItems}
            renderItem={(documentItem) => (
              <article key={documentItem.documentRequestId} className="document-row document-row-live">
                <div>
                  <h3>{documentItem.label}</h3>
                  <p>{documentItem.detail}</p>
                  <p className="case-link-meta">{documentItem.updatedAt}</p>
                </div>
                <div className="document-row-actions">
                  <StatusBadge tone={documentItem.statusTone}>{documentItem.statusLabel}</StatusBadge>
                  <DocumentStatusForm
                    caseId={persistedCase.caseId}
                    documentRequestId={documentItem.documentRequestId}
                    locale={locale}
                    returnPath={`/${locale}/leads/${persistedCase.caseId}/documents`}
                    status={documentItem.value}
                  />
                </div>
              </article>
            )}
          />
        </Panel>
      </div>
    );
  }

  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

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
