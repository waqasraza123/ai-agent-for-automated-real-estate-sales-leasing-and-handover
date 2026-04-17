import Link from "next/link";
import { notFound } from "next/navigation";

import { canOperatorRoleAccessWorkspace, canOperatorRolePerform, type SupportedLocale } from "@real-estate-ai/contracts";
import {
  caseMetaClassName,
  detailGridClassName,
  detailLabelClassName,
  detailListClassName,
  inlineLinkClassName,
  pageStackClassName,
  Panel,
  panelSummaryClassName,
  rowBetweenClassName,
  StatusBadge,
  statusRowWrapClassName,
  successCardClassName,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import { HandoverCustomerUpdateQaReviewForm } from "@/components/handover-customer-update-qa-review-form";
import { MessageThread } from "@/components/message-thread";
import { QaReviewResolutionForm } from "@/components/qa-review-resolution-form";
import { QaWorkspaceUnavailable } from "@/components/qa-command-center";
import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";
import { TimelinePanel } from "@/components/timeline-panel";
import { getQaReviewResolutionCopy } from "@/lib/live-copy";
import { tryGetPersistedCaseDetail } from "@/lib/live-api";
import { getOperatorPermissionGuardNote } from "@/lib/operator-role";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import {
  buildCaseReferenceCode,
  buildPersistedConversation,
  buildPersistedTimeline,
  formatCaseLastChange,
  getPersistedCaseStageLabel,
  getPersistedFollowUpLabel,
  getPersistedHandoverCustomerUpdateQaReviewDisplay,
  getPersistedQaReviewDisplay,
  getPersistedQaReviewHistory
} from "@/lib/persisted-case-presenters";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function QaCaseDetailPage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const currentOperatorRole = await getCurrentOperatorRole();

  if (!canOperatorRoleAccessWorkspace("qa", currentOperatorRole)) {
    return <QaWorkspaceUnavailable currentOperatorRole={currentOperatorRole} locale={locale} />;
  }

  const persistedCase = await tryGetPersistedCaseDetail(caseId);

  if (!persistedCase) {
    notFound();
  }

  const currentQaReview = getPersistedQaReviewDisplay(locale, persistedCase);
  const currentCustomerUpdateQaReview = getPersistedHandoverCustomerUpdateQaReviewDisplay(locale, persistedCase);
  const qaReviewHistory = getPersistedQaReviewHistory(locale, persistedCase);
  const resolutionCopy = getQaReviewResolutionCopy(locale);
  const canManageQaReview = canOperatorRolePerform("manage_qa_reviews", currentOperatorRole);
  const qaGuardNote = getOperatorPermissionGuardNote(locale, "manage_qa_reviews");
  const canAccessSalesWorkspace = canOperatorRoleAccessWorkspace("sales", currentOperatorRole);

  return (
    <div className={pageStackClassName}>
      <ScreenIntro
        badge={buildCaseReferenceCode(persistedCase.caseId)}
        summary={locale === "ar" ? "سجل مراجعة الجودة للحالة الحية." : "QA review record for the live case."}
        title={locale === "ar" ? "تفاصيل مراجعة الجودة" : "QA case detail"}
      />

      <div className={twoColumnGridClassName}>
        <Panel title={persistedCase.customerName}>
          <div className={detailGridClassName}>
            <div>
              <p className={detailLabelClassName}>{locale === "ar" ? "مرحلة الحالة" : "Case stage"}</p>
              <StatusBadge>{getPersistedCaseStageLabel(locale, persistedCase.stage)}</StatusBadge>
            </div>
            <div>
              <p className={detailLabelClassName}>{locale === "ar" ? "الحالة الحالية" : "Current state"}</p>
              <StatusBadge tone={currentQaReview?.statusTone ?? currentCustomerUpdateQaReview?.reviewStatusTone ?? "warning"}>
                {currentQaReview?.statusLabel ??
                  currentCustomerUpdateQaReview?.reviewStatusLabel ??
                  (locale === "ar" ? "لا توجد مراجعة" : "No QA review")}
              </StatusBadge>
            </div>
            <div>
              <p className={detailLabelClassName}>{locale === "ar" ? "المالك الحالي" : "Current owner"}</p>
              <p className="text-sm leading-7 text-ink">{persistedCase.ownerName}</p>
            </div>
            <div>
              <p className={detailLabelClassName}>{locale === "ar" ? "متابعة الحالة" : "Follow-up health"}</p>
              <p className="text-sm leading-7 text-ink">{getPersistedFollowUpLabel(locale, persistedCase)}</p>
            </div>
            <div>
              <p className={detailLabelClassName}>{locale === "ar" ? "آخر تغيير" : "Last change"}</p>
              <p className="text-sm leading-7 text-ink">{formatCaseLastChange(persistedCase, locale)}</p>
            </div>
            <div>
              <p className={detailLabelClassName}>{locale === "ar" ? "المشروع" : "Project"}</p>
              <p className="text-sm leading-7 text-ink">{persistedCase.projectInterest}</p>
            </div>
          </div>
          <div className={`mt-5 ${statusRowWrapClassName}`}>
            {currentQaReview ? (
              <>
                <StatusBadge tone={currentQaReview.statusTone}>{currentQaReview.statusLabel}</StatusBadge>
                <StatusBadge>{currentQaReview.requestedByName}</StatusBadge>
              </>
            ) : null}
            {currentCustomerUpdateQaReview ? (
              <>
                <StatusBadge tone={currentCustomerUpdateQaReview.reviewStatusTone}>
                  {currentCustomerUpdateQaReview.reviewStatusLabel}
                </StatusBadge>
                <StatusBadge>{currentCustomerUpdateQaReview.typeLabel}</StatusBadge>
              </>
            ) : null}
          </div>
          {canAccessSalesWorkspace ? (
            <Link className={`mt-4 ${inlineLinkClassName}`} href={`/${locale}/leads/${persistedCase.caseId}`}>
              {locale === "ar" ? "فتح ملف الحالة الكامل" : "Open full case profile"}
            </Link>
          ) : null}
        </Panel>

        <Panel title={locale === "ar" ? "عناصر الجودة الحالية" : "Current QA items"}>
          {currentQaReview || currentCustomerUpdateQaReview ? (
            <div className="mt-4 space-y-5">
              {currentQaReview ? (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{currentQaReview.subjectTypeLabel}</h3>
                  <p className="text-sm leading-7 text-ink-soft">{currentQaReview.sampleSummary}</p>
                  <div className={statusRowWrapClassName}>
                    <StatusBadge>{currentQaReview.subjectTypeLabel}</StatusBadge>
                    <StatusBadge>{currentQaReview.triggerSourceLabel}</StatusBadge>
                    {currentQaReview.policySignalLabels.map((label) => (
                      <StatusBadge key={label}>{label}</StatusBadge>
                    ))}
                  </div>
                  <dl className={detailListClassName}>
                    {currentQaReview.draftMessage ? (
                      <div>
                        <dt className={detailLabelClassName}>{locale === "ar" ? "الرد المجهز" : "Prepared reply draft"}</dt>
                        <dd className="mt-1 text-sm leading-7 text-ink">{currentQaReview.draftMessage}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "الجهة الطالبة" : "Requested by"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{currentQaReview.requestedByName}</dd>
                    </div>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "الأدلة المطابقة" : "Matched evidence"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">
                        {currentQaReview.triggerEvidence.length > 0 ? currentQaReview.triggerEvidence.join(", ") : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "آخر تحديث" : "Last updated"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{currentQaReview.updatedAt}</dd>
                    </div>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "قرار المراجع" : "Reviewer decision"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{currentQaReview.reviewSummary ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
              {currentCustomerUpdateQaReview ? (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">
                    {locale === "ar" ? "مراجعة مسودة تحديث العميل" : "Customer-update draft review"}
                  </h3>
                  <p className="text-sm leading-7 text-ink-soft">{currentCustomerUpdateQaReview.reviewSampleSummary}</p>
                  <div className={statusRowWrapClassName}>
                    <StatusBadge>{currentCustomerUpdateQaReview.typeLabel}</StatusBadge>
                    {currentCustomerUpdateQaReview.policySignalLabels.map((label) => (
                      <StatusBadge key={label}>{label}</StatusBadge>
                    ))}
                  </div>
                  <dl className={detailListClassName}>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "المسودة المجهزة" : "Prepared draft"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{currentCustomerUpdateQaReview.deliverySummary ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "الأدلة المطابقة" : "Matched evidence"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">
                        {currentCustomerUpdateQaReview.triggerEvidence.length > 0
                          ? currentCustomerUpdateQaReview.triggerEvidence.join(", ")
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "آخر تحديث" : "Last updated"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{currentCustomerUpdateQaReview.updatedAt}</dd>
                    </div>
                    <div>
                      <dt className={detailLabelClassName}>{locale === "ar" ? "قرار المراجع" : "Reviewer decision"}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{currentCustomerUpdateQaReview.reviewSummary ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>
          ) : (
            <p className={panelSummaryClassName}>
              {locale === "ar" ? "لا توجد مراجعة جودة مسجلة على هذه الحالة." : "No QA review has been recorded for this case."}
            </p>
          )}
        </Panel>
      </div>

      <div className={twoColumnGridClassName}>
        <Panel title={locale === "ar" ? "سياق المحادثة الحية" : "Live conversation context"}>
          <MessageThread locale={locale} messages={buildPersistedConversation(persistedCase, locale)} />
        </Panel>

        <Panel title={resolutionCopy.title}>
          <div className="mt-4 space-y-4">
            <p className={panelSummaryClassName}>{resolutionCopy.summary}</p>
            <p className="text-sm leading-7 text-ink-soft">{qaGuardNote}</p>
          {currentQaReview || currentCustomerUpdateQaReview ? (
            <div className="space-y-5">
              {currentQaReview ? (
                currentQaReview.status === "pending_review" ? (
                  <QaReviewResolutionForm
                    canManage={canManageQaReview}
                    caseId={persistedCase.caseId}
                    currentStatus={currentQaReview.status}
                    defaultReviewerName={locale === "ar" ? "فريق الجودة" : "QA Team"}
                    disabledLabel={locale === "ar" ? "يتطلب مراجع جودة" : "QA reviewer required"}
                    locale={locale}
                    qaReviewId={currentQaReview.qaReviewId}
                    returnPath={`/${locale}/qa/cases/${persistedCase.caseId}`}
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{currentQaReview.subjectTypeLabel}</h3>
                    <StatusBadge tone={currentQaReview.statusTone}>{currentQaReview.statusLabel}</StatusBadge>
                    <div className={statusRowWrapClassName}>
                      <StatusBadge>{currentQaReview.subjectTypeLabel}</StatusBadge>
                      <StatusBadge>{currentQaReview.triggerSourceLabel}</StatusBadge>
                      {currentQaReview.policySignalLabels.map((label) => (
                        <StatusBadge key={label}>{label}</StatusBadge>
                      ))}
                    </div>
                    {currentQaReview.draftMessage ? <p className="text-sm leading-7 text-ink-soft">{currentQaReview.draftMessage}</p> : null}
                    <p className="text-sm leading-7 text-ink-soft">{currentQaReview.reviewSummary ?? currentQaReview.sampleSummary}</p>
                    <p className={caseMetaClassName}>{currentQaReview.reviewedAt ?? currentQaReview.updatedAt}</p>
                  </div>
                )
              ) : null}
              {currentCustomerUpdateQaReview ? (
                currentCustomerUpdateQaReview.reviewStatus === "pending_review" ? (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">
                      {locale === "ar" ? "قرار مسودة تحديث العميل" : "Customer-update draft decision"}
                    </h3>
                    <HandoverCustomerUpdateQaReviewForm
                      canManage={canManageQaReview}
                      customerUpdateId={currentCustomerUpdateQaReview.customerUpdateId}
                      defaultReviewerName={locale === "ar" ? "فريق الجودة" : "QA Team"}
                      disabledLabel={locale === "ar" ? "يتطلب مراجع جودة" : "QA reviewer required"}
                      handoverCaseId={currentCustomerUpdateQaReview.handoverCaseId}
                      locale={locale}
                      returnPath={`/${locale}/qa/cases/${persistedCase.caseId}`}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">
                      {locale === "ar" ? "قرار مسودة تحديث العميل" : "Customer-update draft decision"}
                    </h3>
                    <StatusBadge tone={currentCustomerUpdateQaReview.reviewStatusTone}>
                      {currentCustomerUpdateQaReview.reviewStatusLabel}
                    </StatusBadge>
                    <div className={statusRowWrapClassName}>
                      <StatusBadge>{currentCustomerUpdateQaReview.typeLabel}</StatusBadge>
                      {currentCustomerUpdateQaReview.policySignalLabels.map((label) => (
                        <StatusBadge key={label}>{label}</StatusBadge>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-ink-soft">
                      {currentCustomerUpdateQaReview.reviewSummary ?? currentCustomerUpdateQaReview.reviewSampleSummary}
                    </p>
                    <p className={caseMetaClassName}>
                      {currentCustomerUpdateQaReview.reviewedAt ?? currentCustomerUpdateQaReview.updatedAt}
                    </p>
                  </div>
                )
              ) : null}
            </div>
          ) : (
            <p className={panelSummaryClassName}>
              {locale === "ar"
                ? "لا يوجد عنصر جودة مفتوح لهذه الحالة حالياً."
                : "There is no open QA item on this case right now."}
            </p>
          )}
          </div>
        </Panel>
      </div>

      <Panel title={locale === "ar" ? "سجل مراجعات الجودة" : "QA review history"}>
        <div className="mt-4">
          <StatefulStack
            emptySummary={
              locale === "ar"
                ? "لم يتم حفظ أي قرارات جودة لهذه الحالة بعد."
                : "No QA decisions have been saved for this case yet."
            }
            emptyTitle={locale === "ar" ? "لا يوجد سجل جودة" : "No QA history yet"}
            items={qaReviewHistory}
            renderItem={(qaReview) => (
              <article key={qaReview.qaReviewId} className={successCardClassName}>
                <div className={rowBetweenClassName}>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{qaReview.subjectTypeLabel}</h3>
                  <StatusBadge tone={qaReview.statusTone}>{qaReview.statusLabel}</StatusBadge>
                </div>
                <div className={`mt-3 ${statusRowWrapClassName}`}>
                  <StatusBadge>{qaReview.subjectTypeLabel}</StatusBadge>
                  <StatusBadge>{qaReview.triggerSourceLabel}</StatusBadge>
                  {qaReview.policySignalLabels.map((label) => (
                    <StatusBadge key={label}>{label}</StatusBadge>
                  ))}
                </div>
                {qaReview.draftMessage ? <p className="mt-3 text-sm leading-7 text-ink-soft">{qaReview.draftMessage}</p> : null}
                <p className="mt-3 text-sm leading-7 text-ink-soft">{qaReview.reviewSummary ?? "—"}</p>
                <p className={`mt-3 ${caseMetaClassName}`}>
                  {qaReview.reviewerName ?? qaReview.requestedByName}
                  {" · "}
                  {qaReview.reviewedAt ?? qaReview.createdAt}
                </p>
              </article>
            )}
          />
        </div>
      </Panel>

      <TimelinePanel events={buildPersistedTimeline(persistedCase, locale)} locale={locale} />
    </div>
  );
}
