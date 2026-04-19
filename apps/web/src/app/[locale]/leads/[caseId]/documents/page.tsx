import Link from "next/link";
import { notFound } from "next/navigation";

import { canOperatorRoleAccessWorkspace } from "@real-estate-ai/contracts";
import { getDemoCaseById, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  caseMetaClassName,
  HighlightNotice,
  inlineLinkClassName,
  pageStackClassName,
  Panel,
  StatusBadge,
  twoColumnGridClassName,
  WorkflowCard,
  WorkflowListItem,
  WorkflowPanelBody
} from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { DocumentStatusForm } from "@/components/document-status-form";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import {
  buildCaseReferenceCode,
  getPersistedDocumentDisplay,
  getPersistedHandoverStatusLabel
} from "@/lib/persisted-case-presenters";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { getPreferredOperatorSurfacePath } from "@/lib/operator-role";
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
    const canAccessHandoverWorkspace = canOperatorRoleAccessWorkspace("handover", currentOperatorRole);

    return (
      <div className={pageStackClassName}>
        <ScreenIntro badge={buildCaseReferenceCode(persistedCase.caseId)} summary={messages.documents.summary} title={messages.documents.title} />
        <CaseRouteTabs caseId={persistedCase.caseId} locale={locale} />

        <div className={twoColumnGridClassName}>
          <Panel title={messages.common.documents}>
            <WorkflowPanelBody className="mt-4">
              <StatefulStack
                emptySummary={messages.states.emptyDocumentsSummary}
                emptyTitle={messages.states.emptyDocumentsTitle}
                items={documentItems}
                renderItem={(documentItem) => (
                  <WorkflowListItem
                    key={documentItem.documentRequestId}
                    badges={<StatusBadge tone={documentItem.statusTone}>{documentItem.statusLabel}</StatusBadge>}
                    meta={<p className={caseMetaClassName}>{documentItem.updatedAt}</p>}
                    summary={documentItem.detail}
                    title={documentItem.label}
                    actions={
                      <DocumentStatusForm
                        caseId={persistedCase.caseId}
                        documentRequestId={documentItem.documentRequestId}
                        locale={locale}
                        returnPath={`/${locale}/leads/${persistedCase.caseId}/documents`}
                        status={documentItem.value}
                      />
                    }
                  />
                )}
              />
            </WorkflowPanelBody>
          </Panel>

          <Panel title={locale === "ar" ? "المسار التالي" : "Next workflow boundary"}>
            {persistedCase.handoverCase ? (
              <WorkflowPanelBody className="mt-4">
                <WorkflowCard
                  actions={
                    canAccessHandoverWorkspace ? (
                      <Link className={inlineLinkClassName} href={`/${locale}/handover/${persistedCase.handoverCase.handoverCaseId}`}>
                        {locale === "ar" ? "فتح سجل التسليم" : "Open handover record"}
                      </Link>
                    ) : null
                  }
                  badges={<StatusBadge tone="success">{getPersistedHandoverStatusLabel(locale, persistedCase.handoverCase)}</StatusBadge>}
                  meta={<p className={caseMetaClassName}>{persistedCase.handoverCase.ownerName}</p>}
                  summary={
                    locale === "ar"
                      ? "يوجد سجل تسليم مرتبط بالفعل، لكنه يبقى خارج الوتد الحالي للمنتج ويظهر هنا كمرجع لاحق فقط."
                      : "A linked handover record already exists, but it stays outside the current product wedge and appears here only as a downstream reference."
                  }
                  title={locale === "ar" ? "مرجع تسليم لاحق" : "Downstream handover reference"}
                  tone="success"
                />
              </WorkflowPanelBody>
            ) : (
              <WorkflowPanelBody className="mt-4">
                <WorkflowCard
                  summary={
                    locale === "ar"
                      ? "ينتهي الوتد الحالي عند جاهزية المستندات. أي مسار تسليم لاحق يبقى مؤجلاً حتى يثبت المنتج تحسن المؤشرات الأساسية على القنوات الحية."
                      : "The current wedge stops at document readiness. Any downstream handover workflow stays deferred until the product proves core KPI improvement on live channels."
                  }
                  title={locale === "ar" ? "المسار التالي مؤجل حالياً" : "Downstream workflow is currently deferred"}
                  tone="warning"
                >
                  <HighlightNotice tone="warning">
                    {locale === "ar"
                      ? "ركّز هذه الصفحة على ما ينقص الملف الآن: العناصر المطلوبة، والحالات المرفوضة، وما يمنع اكتمال الجاهزية."
                      : "Keep this page focused on what blocks the case now: missing items, rejected submissions, and the work needed to reach readiness."}
                  </HighlightNotice>
                </WorkflowCard>
              </WorkflowPanelBody>
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
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <Panel title={messages.common.documents}>
        <WorkflowPanelBody className="mt-4">
          <StatefulStack
            emptySummary={messages.states.emptyDocumentsSummary}
            emptyTitle={messages.states.emptyDocumentsTitle}
            items={caseItem.documents}
            renderItem={(documentItem) => (
              <WorkflowListItem
                key={documentItem.id}
                badges={
                  <StatusBadge tone={documentItem.status === "missing" ? "critical" : documentItem.status === "review" ? "warning" : "success"}>
                    {documentItem.status}
                  </StatusBadge>
                }
                summary={getLocalizedText(documentItem.detail, locale)}
                title={getLocalizedText(documentItem.name, locale)}
              />
            )}
          />
        </WorkflowPanelBody>
      </Panel>

      <PlaceholderNotice locale={locale} />
    </div>
  );
}
