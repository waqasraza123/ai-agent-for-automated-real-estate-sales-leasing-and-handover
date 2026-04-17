import Link from "next/link";

import { canOperatorRoleAccessWorkspace } from "@real-estate-ai/contracts";
import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  caseMetaClassName,
  dataTableCellClassName,
  dataTableClassName,
  dataTableHeaderCellClassName,
  dataTableWrapperClassName,
  EmptyState,
  inlineLinkClassName,
  pageStackClassName,
  Panel,
  stackTightClassName,
  StatusBadge,
  statusRowWrapClassName,
  tableLinkClassName,
  tableLinkMetaClassName,
  tableLinkTitleClassName
} from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import {
  buildCaseReferenceCode,
  formatCaseLastChange,
  formatDueAt,
  formatLatestManagerFollowUpSavedAt,
  formatLatestHumanReplySentAt,
  getPersistedAutomationLabel,
  getPersistedAutomationHoldReasonLabel,
  getPersistedCaseStageLabel,
  getPersistedFollowUpLabel,
  getPersistedHandoverWorkspaceDisplay,
  getPersistedLatestManagerFollowUpLabel,
  getPersistedLatestManagerFollowUpNote,
  getPersistedLatestHumanReplyEscalationLabel,
  getPersistedLatestHumanReplyLabel,
  getPersistedLatestHumanReplyOwnershipLabel,
  getPersistedQaReviewDisplay
} from "@/lib/persisted-case-presenters";
import { formatDateTime } from "@/lib/format";
import { getInterventionCountLabel } from "@/lib/live-copy";
import { tryListPersistedCases } from "@/lib/live-api";
import { getPreferredOperatorSurfacePath } from "@/lib/operator-role";
import { getCurrentOperatorRole } from "@/lib/operator-session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function LeadsPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);
  const currentOperatorRole = await getCurrentOperatorRole();
  const canAccessHandoverWorkspace = canOperatorRoleAccessWorkspace("handover", currentOperatorRole);

  if (!canOperatorRoleAccessWorkspace("sales", currentOperatorRole)) {
    return (
      <div className={pageStackClassName}>
        <ScreenIntro badge={messages.app.phaseLabel} summary={messages.leads.summary} title={messages.leads.title} />
        <WorkspaceAccessPanel
          actionHref={getPreferredOperatorSurfacePath(locale, currentOperatorRole)}
          actionLabel={messages.common.backToCommandCenter}
          locale={locale}
          operatorRole={currentOperatorRole}
          summary={
            locale === "ar"
              ? "هذه الصفحة مخصصة لمساحة المبيعات في وضع الجلسة المحلي الموثوق. استخدم مسارات التسليم أو مركز القيادة المناسب لدورك الحالي."
              : "This route is reserved for the sales workspace in trusted local session mode. Use the handover workspace or the command center that matches your current role."
          }
          title={locale === "ar" ? "وصول المبيعات مطلوب" : "Sales workspace required"}
          workspace="sales"
        />
      </div>
    );
  }

  const persistedCases = await tryListPersistedCases();
  const columnLabels = {
    currentOwner: messages.common.currentOwner,
    dueAt: locale === "ar" ? "موعد الخطوة التالية" : "Next action due",
    handover: locale === "ar" ? "مسار التسليم" : "Handover workflow",
    lastChange: messages.common.lastChange,
    lead: messages.common.lead,
    nextAction: messages.common.nextAction,
    stage: messages.common.stage
  };

  return (
    <div className={pageStackClassName}>
      <ScreenIntro badge={messages.app.phaseLabel} summary={messages.leads.summary} title={messages.leads.title} />

      <Panel title={messages.leads.title}>
        {persistedCases.length === 0 && demoDataset.cases.length === 0 ? (
          <EmptyState summary={messages.states.emptyCasesSummary} title={messages.states.emptyCasesTitle} />
        ) : persistedCases.length > 0 ? (
          <div className={dataTableWrapperClassName} data-testid="lead-table-wrapper">
            <table className={dataTableClassName}>
              <thead>
                <tr>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.lead}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.stage}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.handover}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.currentOwner}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.nextAction}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.dueAt}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.lastChange}</th>
                </tr>
              </thead>
              <tbody>
                {persistedCases.map((caseItem) => (
                  (() => {
                    const handoverDisplay = getPersistedHandoverWorkspaceDisplay(locale, caseItem);
                    const qaReviewDisplay = getPersistedQaReviewDisplay(locale, caseItem);
                    const automationHoldReasonLabel = getPersistedAutomationHoldReasonLabel(locale, caseItem.automationHoldReason);
                    const latestManagerFollowUpLabel = getPersistedLatestManagerFollowUpLabel(locale, caseItem.latestManagerFollowUp);
                    const latestManagerFollowUpSavedAt = formatLatestManagerFollowUpSavedAt(caseItem.latestManagerFollowUp, locale);
                    const latestManagerFollowUpNote = getPersistedLatestManagerFollowUpNote(locale, caseItem.latestManagerFollowUp);
                    const latestHumanReplyLabel = getPersistedLatestHumanReplyLabel(locale, caseItem.latestHumanReply);
                    const latestHumanReplySentAt = formatLatestHumanReplySentAt(caseItem.latestHumanReply, locale);
                    const latestHumanReplyOwnershipLabel = getPersistedLatestHumanReplyOwnershipLabel(
                      locale,
                      caseItem.ownerName,
                      caseItem.latestHumanReply
                    );
                    const latestHumanReplyEscalationLabel = getPersistedLatestHumanReplyEscalationLabel(
                      locale,
                      caseItem.ownerName,
                      caseItem.latestHumanReply,
                      caseItem.followUpStatus,
                      caseItem.openInterventionsCount
                    );

                    return (
                      <tr key={caseItem.caseId}>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.lead}>
                          <Link className={tableLinkClassName} href={`/${locale}/leads/${caseItem.caseId}`}>
                            <strong className={tableLinkTitleClassName}>{caseItem.customerName}</strong>
                            <span className={tableLinkMetaClassName}>{buildCaseReferenceCode(caseItem.caseId)}</span>
                          </Link>
                        </td>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.stage}>
                          <StatusBadge>{getPersistedCaseStageLabel(locale, caseItem.stage)}</StatusBadge>
                        </td>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.handover}>
                          {handoverDisplay ? (
                            <div className={stackTightClassName}>
                              <div className={statusRowWrapClassName}>
                                <StatusBadge tone={handoverDisplay.statusTone}>{handoverDisplay.statusLabel}</StatusBadge>
                                <StatusBadge>{handoverDisplay.surfaceLabel}</StatusBadge>
                              </div>
                              {canAccessHandoverWorkspace ? (
                                <Link className={inlineLinkClassName} href={`/${locale}/handover/${handoverDisplay.handoverCaseId}`}>
                                  {messages.common.openHandover}
                                </Link>
                              ) : null}
                            </div>
                          ) : (
                            <span className={caseMetaClassName}>{messages.common.notActive}</span>
                          )}
                        </td>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.currentOwner}>{caseItem.ownerName}</td>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.nextAction}>
                          <div className={stackTightClassName}>
                            <span>{caseItem.nextAction}</span>
                            {caseItem.latestHumanReply ? (
                              <div className={stackTightClassName}>
                                <span className={caseMetaClassName}>
                                  {latestHumanReplyLabel}
                                  {" · "}
                                  {caseItem.latestHumanReply.sentByName}
                                  {" · "}
                                  {latestHumanReplySentAt}
                                </span>
                                {latestHumanReplyOwnershipLabel ? (
                                  <span className={caseMetaClassName}>{latestHumanReplyOwnershipLabel}</span>
                                ) : null}
                                {latestHumanReplyEscalationLabel ? (
                                  <span className={caseMetaClassName}>{latestHumanReplyEscalationLabel}</span>
                                ) : null}
                              </div>
                            ) : null}
                            {caseItem.latestManagerFollowUp && latestManagerFollowUpLabel && latestManagerFollowUpSavedAt ? (
                              <div className={stackTightClassName}>
                                <span className={caseMetaClassName}>
                                  {latestManagerFollowUpLabel}
                                  {" · "}
                                  {caseItem.latestManagerFollowUp.ownerName}
                                  {" · "}
                                  {latestManagerFollowUpSavedAt}
                                </span>
                                {latestManagerFollowUpNote ? <span className={caseMetaClassName}>{latestManagerFollowUpNote}</span> : null}
                              </div>
                            ) : null}
                            <div className={statusRowWrapClassName}>
                              <StatusBadge>{getPersistedAutomationLabel(locale, caseItem.automationStatus)}</StatusBadge>
                              {automationHoldReasonLabel ? <StatusBadge tone="warning">{automationHoldReasonLabel}</StatusBadge> : null}
                              {caseItem.openInterventionsCount > 0 ? (
                                <StatusBadge tone="warning">{getInterventionCountLabel(locale, caseItem.openInterventionsCount)}</StatusBadge>
                              ) : null}
                              {qaReviewDisplay ? <StatusBadge tone={qaReviewDisplay.statusTone}>{qaReviewDisplay.statusLabel}</StatusBadge> : null}
                            </div>
                            <StatusBadge tone={caseItem.followUpStatus === "attention" ? "critical" : "success"}>
                              {getPersistedFollowUpLabel(locale, caseItem)}
                            </StatusBadge>
                          </div>
                        </td>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.dueAt}>{formatDueAt(caseItem, locale)}</td>
                        <td className={dataTableCellClassName} data-column-label={columnLabels.lastChange}>{formatCaseLastChange(caseItem, locale)}</td>
                      </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={dataTableWrapperClassName} data-testid="lead-table-wrapper">
            <table className={dataTableClassName}>
              <thead>
                <tr>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.lead}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.stage}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.handover}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.currentOwner}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.nextAction}</th>
                  <th className={dataTableHeaderCellClassName}>{columnLabels.lastChange}</th>
                </tr>
              </thead>
              <tbody>
                {demoDataset.cases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className={dataTableCellClassName} data-column-label={columnLabels.lead}>
                      <Link className={tableLinkClassName} href={`/${locale}/leads/${caseItem.id}`}>
                        <strong className={tableLinkTitleClassName}>{caseItem.customerName}</strong>
                        <span className={tableLinkMetaClassName}>{getLocalizedText(caseItem.projectName, locale)}</span>
                      </Link>
                    </td>
                    <td className={dataTableCellClassName} data-column-label={columnLabels.stage}>
                      <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
                    </td>
                    <td className={dataTableCellClassName} data-column-label={columnLabels.handover}>
                      <span className={caseMetaClassName}>{messages.common.notActive}</span>
                    </td>
                    <td className={dataTableCellClassName} data-column-label={columnLabels.currentOwner}>{caseItem.owner}</td>
                    <td className={dataTableCellClassName} data-column-label={columnLabels.nextAction}>{getLocalizedText(caseItem.nextAction, locale)}</td>
                    <td className={dataTableCellClassName} data-column-label={columnLabels.lastChange}>{formatDateTime(caseItem.lastMeaningfulChange, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
