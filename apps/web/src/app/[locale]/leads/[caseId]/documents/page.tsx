import Link from "next/link";
import { notFound } from "next/navigation";

import { canOperatorRoleAccessWorkspace, canOperatorRolePerform } from "@real-estate-ai/contracts";
import { getDemoCaseById, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  caseMetaClassName,
  caseStackCardClassName,
  documentRowActionsClassName,
  documentRowClassName,
  inlineLinkClassName,
  pageStackClassName,
  Panel,
  panelSummaryClassName,
  StatusBadge,
  stackListClassName,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { DocumentStatusForm } from "@/components/document-status-form";
import { HandoverIntakeForm } from "@/components/handover-intake-form";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import {
  buildCaseReferenceCode,
  getPersistedDocumentDisplay,
  getPersistedHandoverStatusLabel
} from "@/lib/persisted-case-presenters";
import { getHandoverIntakeCopy } from "@/lib/live-copy";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { getOperatorPermissionGuardNote, getPreferredOperatorSurfacePath } from "@/lib/operator-role";
import { tryGetPersistedCaseDetail } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function DocumentsPage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const messages = getMessages(locale);
  const currentOperatorRole = await getCurrentOperatorRole();

  if (!canOperatorRoleAccessWorkspace("sales", currentOperatorRole)) {
    return (
      <div className={pageStackClassName}>
        <ScreenIntro badge={messages.documents.title} summary={messages.documents.summary} title={messages.documents.title} />
        <WorkspaceAccessPanel
          actionHref={getPreferredOperatorSurfacePath(locale, currentOperatorRole)}
          actionLabel={locale === "ar" ? "العودة إلى السطح المتاح" : "Return to an allowed surface"}
          locale={locale}
          operatorRole={currentOperatorRole}
          summary={
            locale === "ar"
              ? "مركز المستندات الحي ما زال ضمن مساحة المبيعات المحلية، حتى عندما يقود إلى بدء مسار التسليم."
              : "The live document center remains inside the local sales workspace even when it leads into handover initiation."
          }
          title={locale === "ar" ? "مركز المستندات مقصور على المبيعات" : "Document center is limited to sales"}
          workspace="sales"
        />
      </div>
    );
  }

  const persistedCase = await tryGetPersistedCaseDetail(caseId);

  if (persistedCase) {
    const documentItems = getPersistedDocumentDisplay(locale, persistedCase);
    const handoverIntakeCopy = getHandoverIntakeCopy(locale);
    const documentsAccepted = persistedCase.documentRequests.every((documentRequest) => documentRequest.status === "accepted");
    const canAccessHandoverWorkspace = canOperatorRoleAccessWorkspace("handover", currentOperatorRole);
    const canManageHandoverIntake = canOperatorRolePerform("manage_handover_intake", currentOperatorRole);
    const handoverIntakeGuardNote = getOperatorPermissionGuardNote(locale, "manage_handover_intake");

    return (
      <div className={pageStackClassName}>
        <ScreenIntro badge={buildCaseReferenceCode(persistedCase.caseId)} summary={messages.documents.summary} title={messages.documents.title} />
        <CaseRouteTabs caseId={persistedCase.caseId} handoverCaseId={persistedCase.handoverCase?.handoverCaseId} locale={locale} />

        <div className={twoColumnGridClassName}>
          <Panel title={messages.common.documents}>
            <div className="mt-4">
              <StatefulStack
                emptySummary={messages.states.emptyDocumentsSummary}
                emptyTitle={messages.states.emptyDocumentsTitle}
                items={documentItems}
                renderItem={(documentItem) => (
                  <article key={documentItem.documentRequestId} className={documentRowClassName}>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{documentItem.label}</h3>
                      <p className="text-sm leading-7 text-ink-soft">{documentItem.detail}</p>
                      <p className={caseMetaClassName}>{documentItem.updatedAt}</p>
                    </div>
                    <div className={documentRowActionsClassName}>
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
            </div>
          </Panel>

          <Panel title={handoverIntakeCopy.title}>
            {persistedCase.handoverCase ? (
              <div className={stackListClassName}>
                <div className={caseStackCardClassName}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">
                      {locale === "ar" ? "سجل التسليم مرتبط" : "Linked handover record"}
                    </h3>
                    <StatusBadge tone="success">{getPersistedHandoverStatusLabel(locale, persistedCase.handoverCase)}</StatusBadge>
                  </div>
                  <p className="text-sm leading-7 text-ink-soft">{handoverIntakeCopy.helperReady}</p>
                  <p className={caseMetaClassName}>{persistedCase.handoverCase.ownerName}</p>
                  {canAccessHandoverWorkspace ? (
                    <Link className={inlineLinkClassName} href={`/${locale}/handover/${persistedCase.handoverCase.handoverCaseId}`}>
                      {locale === "ar" ? "فتح سجل التسليم" : "Open handover record"}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : documentsAccepted ? (
              <div className="mt-4 space-y-4">
                <p className={panelSummaryClassName}>{handoverIntakeCopy.helperReady}</p>
                <p className="text-sm leading-7 text-ink-soft">{handoverIntakeGuardNote}</p>
                <HandoverIntakeForm
                  canManage={canManageHandoverIntake}
                  caseId={persistedCase.caseId}
                  defaultOwnerName={persistedCase.ownerName}
                  disabledLabel={locale === "ar" ? "يتطلب مدير التسليم" : "Handover manager required"}
                  locale={locale}
                  returnPath={`/${locale}/leads/${persistedCase.caseId}/documents`}
                />
              </div>
            ) : (
              <div className={stackListClassName}>
                <div className={caseStackCardClassName}>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">
                    {locale === "ar" ? "اعتماد التسليم ما زال مقفلاً" : "Handover approval is still locked"}
                  </h3>
                  <p className="text-sm leading-7 text-ink-soft">{handoverIntakeCopy.helperLocked}</p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    );
  }

  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className={pageStackClassName}>
      <ScreenIntro badge={caseItem.referenceCode} summary={messages.documents.summary} title={messages.documents.title} />
      <CaseRouteTabs caseId={caseItem.id} handoverCaseId={caseItem.handoverCaseId} locale={locale} />

      <Panel title={messages.common.documents}>
        <div className="mt-4">
          <StatefulStack
            emptySummary={messages.states.emptyDocumentsSummary}
            emptyTitle={messages.states.emptyDocumentsTitle}
            items={caseItem.documents}
            renderItem={(documentItem) => (
              <article key={documentItem.id} className={documentRowClassName}>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{getLocalizedText(documentItem.name, locale)}</h3>
                  <p className="text-sm leading-7 text-ink-soft">{getLocalizedText(documentItem.detail, locale)}</p>
                </div>
                <div className={documentRowActionsClassName}>
                  <StatusBadge tone={documentItem.status === "missing" ? "critical" : documentItem.status === "review" ? "warning" : "success"}>
                    {documentItem.status}
                  </StatusBadge>
                </div>
              </article>
            )}
          />
        </div>
      </Panel>

      <PlaceholderNotice locale={locale} />
    </div>
  );
}
