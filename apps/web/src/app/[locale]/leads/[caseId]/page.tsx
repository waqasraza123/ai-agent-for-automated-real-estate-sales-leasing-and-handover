import { notFound } from "next/navigation";

import { getDemoCaseById, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { QualificationForm } from "@/components/qualification-form";
import { ScreenIntro } from "@/components/screen-intro";
import { TimelinePanel } from "@/components/timeline-panel";
import {
  buildCaseReferenceCode,
  buildPersistedTimeline,
  formatCaseLastChange,
  formatDueAt,
  getPersistedCaseStageLabel,
  getPersistedFollowUpLabel,
  getPersistedQualificationSummary,
  getPersistedSourceLabel
} from "@/lib/persisted-case-presenters";
import { tryGetPersistedCaseDetail } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function LeadProfilePage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const persistedCase = await tryGetPersistedCaseDetail(caseId);
  const messages = getMessages(locale);

  if (persistedCase) {
    const qualificationSummary = getPersistedQualificationSummary(locale, persistedCase);

    return (
      <div className="page-stack">
        <ScreenIntro badge={buildCaseReferenceCode(persistedCase.caseId)} summary={persistedCase.message} title={messages.profile.title} />
        <CaseRouteTabs caseId={persistedCase.caseId} locale={locale} />

        <div className="two-column-grid">
          <Panel title={persistedCase.customerName}>
            <div className="detail-grid">
              <div>
                <p className="detail-label">{messages.common.stage}</p>
                <StatusBadge>{getPersistedCaseStageLabel(locale, persistedCase.stage)}</StatusBadge>
              </div>
              <div>
                <p className="detail-label">{messages.common.currentOwner}</p>
                <p>{persistedCase.ownerName}</p>
              </div>
              <div>
                <p className="detail-label">{messages.common.nextAction}</p>
                <p>{persistedCase.nextAction}</p>
              </div>
              <div>
                <p className="detail-label">{locale === "ar" ? "موعد المتابعة" : "Follow-up due"}</p>
                <p>{formatDueAt(persistedCase, locale)}</p>
              </div>
              <div>
                <p className="detail-label">{messages.common.lastChange}</p>
                <p>{formatCaseLastChange(persistedCase, locale)}</p>
              </div>
              <div>
                <p className="detail-label">{locale === "ar" ? "مصدر الحالة" : "Lead source"}</p>
                <p>{getPersistedSourceLabel(locale)}</p>
              </div>
            </div>
            <div className="case-callout">
              <p>{persistedCase.budget ?? persistedCase.projectInterest}</p>
              <p>{getPersistedFollowUpLabel(locale, persistedCase)}</p>
            </div>
          </Panel>

          <Panel title={locale === "ar" ? "التفاصيل الأساسية" : "Core intake details"}>
            <dl className="detail-list">
              <div>
                <dt>{locale === "ar" ? "البريد الإلكتروني" : "Email"}</dt>
                <dd>{persistedCase.email}</dd>
              </div>
              <div>
                <dt>{locale === "ar" ? "الهاتف" : "Phone"}</dt>
                <dd>{persistedCase.phone ?? "—"}</dd>
              </div>
              <div>
                <dt>{locale === "ar" ? "المشروع المطلوب" : "Project interest"}</dt>
                <dd>{persistedCase.projectInterest}</dd>
              </div>
              <div>
                <dt>{locale === "ar" ? "لغة العميل" : "Customer language"}</dt>
                <dd>{persistedCase.preferredLocale === "ar" ? "العربية" : "English"}</dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="two-column-grid">
          <Panel title={locale === "ar" ? "ملخص التأهيل الحالي" : "Current qualification"}>
            {qualificationSummary ? (
              <dl className="detail-list">
                <div>
                  <dt>{locale === "ar" ? "نطاق الميزانية" : "Budget band"}</dt>
                  <dd>{qualificationSummary.budgetBand}</dd>
                </div>
                <div>
                  <dt>{locale === "ar" ? "الإطار الزمني" : "Move-in timeline"}</dt>
                  <dd>{qualificationSummary.moveInTimeline}</dd>
                </div>
                <div>
                  <dt>{locale === "ar" ? "الجاهزية" : "Readiness"}</dt>
                  <dd>{qualificationSummary.readiness}</dd>
                </div>
                <div>
                  <dt>{locale === "ar" ? "آخر تحديث" : "Last updated"}</dt>
                  <dd>{qualificationSummary.updatedAt}</dd>
                </div>
                <div>
                  <dt>{locale === "ar" ? "الملخص" : "Summary"}</dt>
                  <dd>{qualificationSummary.intentSummary}</dd>
                </div>
              </dl>
            ) : (
              <p className="panel-summary">
                {locale === "ar"
                  ? "لم يتم حفظ التأهيل بعد. استخدم النموذج المجاور لتسجيل أول شريحة تأهيلية للحالة."
                  : "Qualification has not been saved yet. Use the adjacent form to capture the first structured qualification snapshot."}
              </p>
            )}
          </Panel>

          <Panel title={locale === "ar" ? "تحديث التأهيل" : "Update qualification"}>
            <p className="panel-summary">
              {locale === "ar"
                ? "هذا النموذج يرفع الحالة من عميل جديد إلى عميل مؤهل داخل المسار الحي."
                : "This form moves the live case from a new lead into a qualified state."}
            </p>
            <QualificationForm caseId={persistedCase.caseId} locale={locale} returnPath={`/${locale}/leads/${persistedCase.caseId}`} />
          </Panel>
        </div>

        <TimelinePanel events={buildPersistedTimeline(persistedCase)} locale={locale} />
      </div>
    );
  }

  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className="page-stack">
      <ScreenIntro badge={caseItem.referenceCode} summary={getLocalizedText(caseItem.summary, locale)} title={messages.profile.title} />
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <div className="two-column-grid">
        <Panel title={caseItem.customerName}>
          <div className="detail-grid">
            <div>
              <p className="detail-label">{messages.common.stage}</p>
              <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
            </div>
            <div>
              <p className="detail-label">{messages.common.currentOwner}</p>
              <p>{caseItem.owner}</p>
            </div>
            <div>
              <p className="detail-label">{messages.common.nextAction}</p>
              <p>{getLocalizedText(caseItem.nextAction, locale)}</p>
            </div>
            <div>
              <p className="detail-label">{messages.common.lastChange}</p>
              <p>{new Date(caseItem.lastMeaningfulChange).toLocaleString(locale)}</p>
            </div>
          </div>
          <div className="case-callout">
            <p>{getLocalizedText(caseItem.budgetLabel, locale)}</p>
            <p>{getLocalizedText(caseItem.attentionNote, locale)}</p>
          </div>
        </Panel>

        <Panel title={messages.common.visitReadiness}>
          <div className="stack-list">
            <div className="case-stack-card">
              <p className="detail-label">{caseItem.visitPlan.scheduledAt}</p>
              <h3>{getLocalizedText(caseItem.visitPlan.location, locale)}</h3>
              <p>{getLocalizedText(caseItem.visitPlan.readinessNote, locale)}</p>
            </div>
          </div>
        </Panel>
      </div>

      <TimelinePanel events={caseItem.timeline} locale={locale} />
      <PlaceholderNotice locale={locale} />
    </div>
  );
}
