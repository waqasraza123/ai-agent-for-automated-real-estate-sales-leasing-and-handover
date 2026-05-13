import { canOperatorRolePerform, type SupportedLocale } from "@real-estate-ai/contracts";
import {
  EmptyState,
  Panel,
  StatusBadge,
  WorkflowListItem,
  WorkflowPanelBody,
  caseMetaClassName,
  pageStackClassName,
  statusRowWrapClassName
} from "@real-estate-ai/ui";

import { BulkProposalDecisionForms, ProposalDecisionForms } from "@/components/commercial-source-forms";
import { ScreenIntro } from "@/components/screen-intro";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { tryListCommercialFactProposals } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function CommercialFactReviewPage(props: PageProps) {
  const { locale } = await props.params;
  const role = await getCurrentOperatorRole();
  const canManage = canOperatorRolePerform("manage_commercial_sources", role);
  const proposals = await tryListCommercialFactProposals(role);
  const pending = proposals.filter((proposal) => proposal.state === "pending_review");
  const decided = proposals.filter((proposal) => proposal.state !== "pending_review").slice(0, 25);

  return (
    <div className={pageStackClassName}>
      <ScreenIntro
        badge={locale === "ar" ? "اعتماد المدير" : "Manager approval"}
        summary={locale === "ar" ? "لا يستخدم الوكيل أي مقترح تجاري قبل اعتماده وربطه بدليل المصدر." : "The agent cannot use any proposed commercial fact until it is approved and linked to source evidence."}
        title={locale === "ar" ? "مراجعة الحقائق التجارية" : "Commercial Fact Review"}
      />

      <Panel title={locale === "ar" ? "بانتظار الاعتماد" : "Pending approval"}>
        <WorkflowPanelBody
          className="mt-4"
          summary={
            locale === "ar"
              ? "استخدم القرار الجماعي عندما تكون المقترحات من نفس نسخة المصدر وتشارك نفس تاريخ الصلاحية أو سبب الرفض."
              : "Use bulk decisions when proposals come from the same source version and share the same expiry or rejection rationale."
          }
        >
          {pending.length === 0 ? (
            <EmptyState summary={locale === "ar" ? "لا توجد مقترحات معلقة." : "No proposals are pending."} title={locale === "ar" ? "لا يوجد انتظار" : "No pending work"} />
          ) : (
            <div className="grid gap-4">
              <BulkProposalDecisionForms canManage={canManage} locale={locale} proposals={pending} returnPath={`/${locale}/commercial-facts/review`} />
              {pending.map((proposal) => (
                <WorkflowListItem
                  key={proposal.proposalId}
                  badges={
                    <div className={statusRowWrapClassName}>
                      <StatusBadge tone="warning">{proposal.kind}</StatusBadge>
                      <StatusBadge>{proposal.locale}</StatusBadge>
                      <StatusBadge>{proposal.projectCode}</StatusBadge>
                    </div>
                  }
                  meta={<p className={caseMetaClassName}>{proposal.evidence.map((item) => item.sourceName).join(", ")}</p>}
                  summary={proposal.content}
                  title={proposal.title}
                >
                  <ProposalDecisionForms canManage={canManage} locale={locale} proposal={proposal} returnPath={`/${locale}/commercial-facts/review`} />
                </WorkflowListItem>
              ))}
            </div>
          )}
        </WorkflowPanelBody>
      </Panel>

      <Panel title={locale === "ar" ? "آخر القرارات" : "Recent decisions"}>
        <WorkflowPanelBody className="mt-4">
          {decided.length === 0 ? (
            <EmptyState summary={locale === "ar" ? "ستظهر قرارات الاعتماد والرفض هنا." : "Approval and rejection decisions will appear here."} title={locale === "ar" ? "لا توجد قرارات" : "No decisions"} />
          ) : (
            <div className="grid gap-4">
              {decided.map((proposal) => (
                <WorkflowListItem
                  key={proposal.proposalId}
                  badges={<StatusBadge tone={proposal.state === "approved" ? "success" : "critical"}>{proposal.state}</StatusBadge>}
                  meta={<p className={caseMetaClassName}>{proposal.updatedAt}</p>}
                  summary={proposal.rejectionReason ?? proposal.content}
                  title={proposal.title}
                />
              ))}
            </div>
          )}
        </WorkflowPanelBody>
      </Panel>
    </div>
  );
}
