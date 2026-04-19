import { notFound } from "next/navigation";

import { canOperatorRoleAccessWorkspace } from "@real-estate-ai/contracts";
import { getDemoCaseById, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  detailLabelClassName,
  HighlightNotice,
  pageStackClassName,
  Panel,
  slotCardClassName,
  slotGridClassName,
  StatusBadge,
  twoColumnGridClassName,
  WorkflowCard,
  WorkflowPanelBody
} from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { VisitSchedulingForm } from "@/components/visit-scheduling-form";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { formatDateTime } from "@/lib/format";
import { getPreferredOperatorSurfacePath } from "@/lib/operator-role";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { buildCaseReferenceCode } from "@/lib/persisted-case-presenters";
import { tryGetPersistedCaseDetail } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function SchedulePage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const messages = getMessages(locale);
  const currentOperatorRole = await getCurrentOperatorRole();

  if (!canOperatorRoleAccessWorkspace("sales", currentOperatorRole)) {
    return (
      <div className={pageStackClassName}>
        <ScreenIntro badge={messages.schedule.title} summary={messages.schedule.summary} title={messages.schedule.title} />
        <WorkspaceAccessPanel
          actionHref={getPreferredOperatorSurfacePath(locale, currentOperatorRole)}
          actionLabel={locale === "ar" ? "العودة إلى مركز القيادة" : "Return to the command center"}
          locale={locale}
          operatorRole={currentOperatorRole}
          summary={
            locale === "ar"
              ? "جدولة الزيارات الفعلية تظل داخل مساحة المبيعات المحلية حتى يتم إدخال نموذج صلاحيات أوسع."
              : "Live visit scheduling remains inside the local sales workspace until a broader identity model is introduced."
          }
          title={locale === "ar" ? "الجدولة مقصورة على المبيعات" : "Scheduling is limited to sales"}
          workspace="sales"
        />
      </div>
    );
  }

  const persistedCase = await tryGetPersistedCaseDetail(caseId);

  if (persistedCase) {
    const booking = persistedCase.currentVisit?.booking ?? null;
    const bookingStatusLabel =
      booking?.status === "confirmed"
        ? locale === "ar"
          ? "مؤكد في تقويم Google"
          : "Confirmed in Google Calendar"
        : booking?.status === "blocked"
          ? locale === "ar"
            ? "ينتظر بيانات عميل Google Calendar"
            : "Awaiting client Google Calendar credentials"
        : booking?.status === "failed"
          ? locale === "ar"
            ? "فشل ربط تقويم Google"
            : "Google Calendar failed"
          : booking?.status === "pending"
            ? locale === "ar"
              ? "بانتظار تقويم Google"
              : "Google Calendar pending"
            : null;

    return (
      <div className={pageStackClassName}>
        <ScreenIntro badge={buildCaseReferenceCode(persistedCase.caseId)} summary={messages.schedule.summary} title={messages.schedule.title} />
        <CaseRouteTabs caseId={persistedCase.caseId} locale={locale} />

        <div className={twoColumnGridClassName}>
          <Panel title={messages.common.visitReadiness}>
            {persistedCase.currentVisit ? (
              <WorkflowPanelBody className="mt-4">
                <WorkflowCard
                  meta={<p className={detailLabelClassName}>{formatDateTime(persistedCase.currentVisit.scheduledAt, locale)}</p>}
                  summary={
                    locale === "ar"
                      ? "تم ربط الحالة بزيارة محفوظة داخل المسار الحي ويمكن للإدارة متابعتها من شاشة الحالة."
                      : "The case now has a persisted visit that managers can inspect directly from the live alpha workflow."
                  }
                  title={persistedCase.currentVisit.location}
                >
                  {bookingStatusLabel ? (
                    <HighlightNotice tone={booking?.status === "failed" ? "warning" : booking?.status === "blocked" ? "ai" : "brand"}>
                      {bookingStatusLabel}
                    </HighlightNotice>
                  ) : null}
                  {booking?.failureCode === "client_credentials_pending" ? (
                    <p className={detailLabelClassName}>
                      {locale === "ar"
                        ? "تم تنفيذ مسار الربط البرمجي بالكامل، لكنه سيبقى في وضع الانتظار إلى أن يضيف العميل بيانات Google Calendar الخاصة به."
                        : "The booking integration path is implemented, but it stays in waiting mode until the client adds their Google Calendar credentials."}
                    </p>
                  ) : null}
                  {booking?.failureDetail ? <p className={detailLabelClassName}>{booking.failureDetail}</p> : null}
                </WorkflowCard>
              </WorkflowPanelBody>
            ) : (
              <WorkflowPanelBody
                summary={
                  locale === "ar"
                    ? "لا توجد زيارة محفوظة بعد. استخدم النموذج المجاور لتحديد أول موعد فعلي."
                    : "No visit has been scheduled yet. Use the adjacent form to save the first live appointment."
                }
              />
            )}
          </Panel>

          <Panel title={messages.schedule.title}>
            <WorkflowPanelBody className="mt-4">
              <VisitSchedulingForm caseId={persistedCase.caseId} locale={locale} returnPath={`/${locale}/leads/${persistedCase.caseId}/schedule`} />
            </WorkflowPanelBody>
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
      <ScreenIntro badge={caseItem.referenceCode} summary={messages.schedule.summary} title={messages.schedule.title} />
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <div className={twoColumnGridClassName}>
        <Panel title={messages.common.visitReadiness}>
          <WorkflowPanelBody className="mt-4">
            <WorkflowCard
              meta={<p className={detailLabelClassName}>{caseItem.visitPlan.scheduledAt}</p>}
              summary={caseItem.visitPlan.location[locale]}
              title={caseItem.customerName}
            >
              <HighlightNotice>{caseItem.visitPlan.readinessNote[locale]}</HighlightNotice>
            </WorkflowCard>
          </WorkflowPanelBody>
        </Panel>

        <Panel title={messages.schedule.title}>
          <div className={slotGridClassName}>
            {caseItem.visitPlan.suggestedSlots.map((slot) => (
              <div key={slot} className={slotCardClassName}>
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
