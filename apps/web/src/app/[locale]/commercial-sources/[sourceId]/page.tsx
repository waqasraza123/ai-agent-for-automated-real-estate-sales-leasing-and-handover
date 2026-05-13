import { notFound } from "next/navigation";

import { canOperatorRolePerform, type SupportedLocale } from "@real-estate-ai/contracts";
import {
  DetailGrid,
  DetailItem,
  EmptyState,
  Panel,
  StatusBadge,
  WorkflowCard,
  WorkflowListItem,
  WorkflowPanelBody,
  caseMetaClassName,
  pageStackClassName,
  statusRowWrapClassName,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import { BulkProposalDecisionForms, CommercialFactExpiryReviewForm, InventoryImportForm, ProposalDecisionForms } from "@/components/commercial-source-forms";
import { ScreenIntro } from "@/components/screen-intro";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { tryGetCommercialSourceDetail } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; sourceId: string }>;
}

export default async function CommercialSourceDetailPage(props: PageProps) {
  const { locale, sourceId } = await props.params;
  const role = await getCurrentOperatorRole();
  const canManage = canOperatorRolePerform("manage_commercial_sources", role);
  const source = await tryGetCommercialSourceDetail(sourceId, role);

  if (!source) {
    notFound();
  }

  const pendingProposals = source.proposals.filter((proposal) => proposal.state === "pending_review");
  const activeFactsNeedingReview = source.activeFacts.filter(
    (fact) => fact.freshnessStatus === "expiring_soon" || fact.freshnessStatus === "stale" || fact.freshnessStatus === "expired"
  );

  return (
    <div className={pageStackClassName}>
      <ScreenIntro
        badge={source.projectCode}
        summary={locale === "ar" ? "نسخ المصدر، أخطاء الاستيراد، المقترحات، والحقائق المعتمدة." : "Source versions, import errors, proposals, and approved facts."}
        title={source.sourceName}
      />

      <div className={twoColumnGridClassName}>
        <Panel title={locale === "ar" ? "حالة المصدر" : "Source state"}>
          <WorkflowPanelBody className="mt-4">
            <DetailGrid>
              <DetailItem label={locale === "ar" ? "النوع" : "Type"} value={source.sourceType} />
              <DetailItem label={locale === "ar" ? "الحالة" : "State"} value={source.state} />
              <DetailItem label={locale === "ar" ? "حقائق نشطة" : "Active facts"} value={String(source.activeFactsCount)} />
              <DetailItem label={locale === "ar" ? "مقترحات معلقة" : "Pending proposals"} value={String(source.pendingProposalsCount)} />
            </DetailGrid>
          </WorkflowPanelBody>
        </Panel>

        <Panel title={locale === "ar" ? "استيراد مخزون CSV" : "Import inventory CSV"}>
          <WorkflowPanelBody className="mt-4">
            <InventoryImportForm canManage={canManage} locale={locale} returnPath={`/${locale}/commercial-sources/${source.sourceId}`} sourceId={source.sourceId} />
          </WorkflowPanelBody>
        </Panel>
      </div>

      <Panel title={locale === "ar" ? "نسخ المصدر" : "Source versions"}>
        <WorkflowPanelBody className="mt-4">
          {source.versions.length === 0 ? (
            <EmptyState summary={locale === "ar" ? "لم يتم استيراد نسخة بعد." : "No source version has been imported yet."} title={locale === "ar" ? "لا توجد نسخ" : "No versions"} />
          ) : (
            <div className="grid gap-4">
              {source.versions.map((version) => (
                <WorkflowCard
                  key={version.versionId}
                  badges={<StatusBadge tone={version.importErrors.length > 0 ? "warning" : "success"}>{version.status}</StatusBadge>}
                  summary={locale === "ar" ? `${version.rowCount} صفوف` : `${version.rowCount} rows`}
                  title={version.versionLabel}
                >
                  {version.importErrors.length > 0 ? (
                    <div className="space-y-2">
                      {version.importErrors.slice(0, 8).map((error) => (
                        <p key={`${version.versionId}-${error.rowNumber}-${error.field}`} className={caseMetaClassName}>
                          {locale === "ar" ? "صف" : "Row"} {error.rowNumber}: {error.reason}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </WorkflowCard>
              ))}
            </div>
          )}
        </WorkflowPanelBody>
      </Panel>

      <Panel title={locale === "ar" ? "مقترحات الحقائق" : "Fact proposals"}>
        <WorkflowPanelBody
          className="mt-4"
          summary={
            pendingProposals.length > 1
              ? locale === "ar"
                ? "يمكن اعتماد أو رفض مجموعة من المقترحات عندما تشارك نفس مصدر القرار."
                : "Approve or reject multiple proposals when they share the same decision source."
              : undefined
          }
        >
          {source.proposals.length === 0 ? (
            <EmptyState summary={locale === "ar" ? "لا توجد مقترحات بعد." : "No proposals yet."} title={locale === "ar" ? "لا توجد مقترحات" : "No proposals"} />
          ) : (
            <div className="grid gap-4">
              {pendingProposals.length > 1 ? (
                <BulkProposalDecisionForms canManage={canManage} locale={locale} proposals={pendingProposals} returnPath={`/${locale}/commercial-sources/${source.sourceId}`} />
              ) : null}
              {source.proposals.map((proposal) => (
                <WorkflowListItem
                  key={proposal.proposalId}
                  badges={
                    <div className={statusRowWrapClassName}>
                      <StatusBadge tone={proposal.state === "pending_review" ? "warning" : proposal.state === "approved" ? "success" : "critical"}>{proposal.state}</StatusBadge>
                      <StatusBadge>{proposal.kind}</StatusBadge>
                      <StatusBadge>{proposal.locale}</StatusBadge>
                    </div>
                  }
                  summary={proposal.content}
                  title={proposal.title}
                >
                  <ProposalDecisionForms canManage={canManage} locale={locale} proposal={proposal} returnPath={`/${locale}/commercial-sources/${source.sourceId}`} />
                </WorkflowListItem>
              ))}
            </div>
          )}
        </WorkflowPanelBody>
      </Panel>

      <Panel title={locale === "ar" ? "مراجعة الحقائق النشطة" : "Active fact review"}>
        <WorkflowPanelBody
          className="mt-4"
          summary={
            locale === "ar"
              ? "راجع صلاحية الحقائق المرتبطة بهذا المصدر قبل استخدامها في ردود واتساب التجارية."
              : "Review source-linked facts before they are used in commercial WhatsApp replies."
          }
        >
          {source.activeFacts.length === 0 ? (
            <EmptyState summary={locale === "ar" ? "لم يعتمد هذا المصدر أي حقائق بعد." : "This source has no approved facts yet."} title={locale === "ar" ? "لا توجد حقائق" : "No facts"} />
          ) : (
            <div className="grid gap-4">
              {source.activeFacts.map((fact) => (
                <WorkflowListItem
                  key={fact.factId}
                  badges={
                    <div className={statusRowWrapClassName}>
                      <StatusBadge tone={fact.freshnessStatus === "active" ? "success" : fact.freshnessStatus === "expiring_soon" ? "warning" : "critical"}>{fact.freshnessStatus}</StatusBadge>
                      <StatusBadge>{fact.kind}</StatusBadge>
                      <StatusBadge>{fact.locale}</StatusBadge>
                    </div>
                  }
                  meta={
                    <p className={caseMetaClassName}>
                      {locale === "ar" ? "تنتهي:" : "Expires:"} {fact.expiresAt ?? "-"}
                    </p>
                  }
                  summary={fact.content}
                  title={fact.title}
                >
                  {activeFactsNeedingReview.some((item) => item.factId === fact.factId) ? (
                    <CommercialFactExpiryReviewForm canManage={canManage} fact={fact} locale={locale} returnPath={`/${locale}/commercial-sources/${source.sourceId}`} />
                  ) : null}
                </WorkflowListItem>
              ))}
            </div>
          )}
        </WorkflowPanelBody>
      </Panel>
    </div>
  );
}
