import { notFound } from "next/navigation";

import { getDemoCaseById, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";
import { VisitSchedulingForm } from "@/components/visit-scheduling-form";
import { buildCaseReferenceCode } from "@/lib/persisted-case-presenters";
import { tryGetPersistedCaseDetail } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function SchedulePage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const persistedCase = await tryGetPersistedCaseDetail(caseId);
  const messages = getMessages(locale);

  if (persistedCase) {
    return (
      <div className="page-stack">
        <ScreenIntro badge={buildCaseReferenceCode(persistedCase.caseId)} summary={messages.schedule.summary} title={messages.schedule.title} />
        <CaseRouteTabs caseId={persistedCase.caseId} handoverCaseId={persistedCase.handoverCase?.handoverCaseId} locale={locale} />

        <div className="two-column-grid">
          <Panel title={messages.common.visitReadiness}>
            {persistedCase.currentVisit ? (
              <div className="stack-list">
                <div className="case-stack-card">
                  <p className="detail-label">{new Date(persistedCase.currentVisit.scheduledAt).toLocaleString(locale)}</p>
                  <h3>{persistedCase.currentVisit.location}</h3>
                  <p>
                    {locale === "ar"
                      ? "تم ربط الحالة بزيارة محفوظة داخل المسار الحي ويمكن للإدارة متابعتها من شاشة الحالة."
                      : "The case now has a persisted visit that managers can inspect directly from the live alpha workflow."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="panel-summary">
                {locale === "ar"
                  ? "لا توجد زيارة محفوظة بعد. استخدم النموذج المجاور لتحديد أول موعد فعلي."
                  : "No visit has been scheduled yet. Use the adjacent form to save the first live appointment."}
              </p>
            )}
          </Panel>

          <Panel title={messages.schedule.title}>
            <VisitSchedulingForm caseId={persistedCase.caseId} locale={locale} returnPath={`/${locale}/leads/${persistedCase.caseId}/schedule`} />
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
    <div className="page-stack">
      <ScreenIntro badge={caseItem.referenceCode} summary={messages.schedule.summary} title={messages.schedule.title} />
      <CaseRouteTabs caseId={caseItem.id} handoverCaseId={caseItem.handoverCaseId} locale={locale} />

      <div className="two-column-grid">
        <Panel title={messages.common.visitReadiness}>
          <p className="detail-label">{caseItem.visitPlan.scheduledAt}</p>
          <h3>{caseItem.customerName}</h3>
          <p>{caseItem.visitPlan.location[locale]}</p>
          <p>{caseItem.visitPlan.readinessNote[locale]}</p>
        </Panel>

        <Panel title={messages.schedule.title}>
          <div className="slot-grid">
            {caseItem.visitPlan.suggestedSlots.map((slot) => (
              <div key={slot} className="slot-card">
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
