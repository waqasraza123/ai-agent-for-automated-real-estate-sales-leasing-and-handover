import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  alertCardClassName,
  caseMetaClassName,
  caseStackCardClassName,
  criticalAlertCardClassName,
  cx,
  MetricTile,
  metricGridClassName,
  pageStackClassName,
  Panel,
  rowBetweenClassName,
  secondaryLinkClassName,
  StatusBadge,
  successCardClassName,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import Link from "next/link";

import { ScreenIntro } from "@/components/screen-intro";
import { StatefulStack } from "@/components/stateful-stack";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function DashboardPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);
  const introBadge =
    locale === "ar" ? "لوحة عمليات واتساب الحية" : "Live WhatsApp operating console";
  const managerSummary =
    locale === "ar"
      ? "هذه ليست لوحة مؤشرات عامة فقط. طابور المدير يلتقط تعثر أول رد واتساب، التأخر بلا رد، وفشل الحجز قبل أن تتحول الحالة إلى فقدان صامت."
      : "This is not just a general overview. The manager queue catches failed first WhatsApp replies, no-response drift, and booking failures before the case turns into a silent loss.";
  const inboxSummary =
    locale === "ar"
      ? "صندوق العملاء هو مكتب واتساب اليومي. كل حالة تحمل آخر نشاط وارد، حالة التسليم، المالك الحالي، وما إذا كانت الزيارة مؤكدة أو ما زالت تحتاج تدخلاً."
      : "The lead inbox is the daily WhatsApp desk. Each case carries the latest inbound activity, delivery state, current owner, and whether the visit is confirmed or still needs intervention.";
  const whatsappBadges =
    locale === "ar"
      ? ["واتساب أساسي", "الموقع إلى المحادثة", "حالة التسليم مرئية"]
      : ["WhatsApp primary", "Website to thread", "Delivery state visible"];

  return (
    <div className={pageStackClassName}>
      <ScreenIntro badge={introBadge} summary={messages.dashboard.summary} title={messages.dashboard.title} />

      <div className="flex flex-wrap items-center gap-2">
        {whatsappBadges.map((badge, index) => (
          <StatusBadge key={badge} tone={index === whatsappBadges.length - 1 ? "success" : "neutral"}>
            {badge}
          </StatusBadge>
        ))}
      </div>

      <section className={metricGridClassName}>
        {demoDataset.dashboardMetrics.map((metric) => (
          <MetricTile
            key={metric.id}
            detail={getLocalizedText(metric.change, locale)}
            label={getLocalizedText(metric.label, locale)}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </section>

      <div className={twoColumnGridClassName}>
        <Panel
          eyebrow={locale === "ar" ? "إشارات تدخل المدير" : "Manager intervention signals"}
          title={locale === "ar" ? "طابور مخاطر واتساب" : "WhatsApp risk queue"}
        >
          <div className="mt-4 space-y-5">
            <p className="text-sm leading-7 text-ink-soft">{managerSummary}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="warning">{locale === "ar" ? "فشل إرسال أول رد" : "First reply failed"}</StatusBadge>
              <StatusBadge>{locale === "ar" ? "لا رد ضمن SLA" : "No response inside SLA"}</StatusBadge>
              <StatusBadge tone="critical">{locale === "ar" ? "فشل حجز الزيارة" : "Booking failed"}</StatusBadge>
            </div>
            <Link className={secondaryLinkClassName} href={`/${locale}/manager`}>
              {locale === "ar" ? "فتح طابور واتساب للمدير" : "Open WhatsApp manager queue"}
            </Link>
            <StatefulStack
              emptySummary={messages.states.emptyAlertsSummary}
              emptyTitle={messages.states.emptyAlertsTitle}
              items={demoDataset.managerAlerts}
              renderItem={(alert) => (
                <article
                  key={alert.id}
                  className={cx(
                    alert.severity === "high"
                      ? criticalAlertCardClassName
                      : alert.severity === "medium"
                        ? alertCardClassName
                        : successCardClassName,
                    "space-y-3"
                  )}
                >
                  <div className={rowBetweenClassName}>
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{getLocalizedText(alert.title, locale)}</h3>
                    <StatusBadge tone={alert.severity === "high" ? "critical" : "warning"}>{alert.severity}</StatusBadge>
                  </div>
                  <p className="text-sm leading-7 text-ink-soft">{getLocalizedText(alert.detail, locale)}</p>
                </article>
              )}
            />
          </div>
        </Panel>

        <Panel
          eyebrow={locale === "ar" ? "سطح التشغيل اليومي" : "Primary daily surface"}
          title={locale === "ar" ? "صندوق واتساب" : "WhatsApp inbox"}
        >
          <div className="mt-4 space-y-5">
            <p className="text-sm leading-7 text-ink-soft">{inboxSummary}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{locale === "ar" ? "آخر وارد من العميل" : "Latest inbound customer message"}</StatusBadge>
              <StatusBadge tone="success">{locale === "ar" ? "تسليم واتساب مؤكد" : "WhatsApp delivery confirmed"}</StatusBadge>
            </div>
            <Link className={secondaryLinkClassName} href={`/${locale}/leads`}>
              {locale === "ar" ? "فتح صندوق واتساب" : "Open WhatsApp inbox"}
            </Link>
            <StatefulStack
              emptySummary={messages.states.emptyCasesSummary}
              emptyTitle={messages.states.emptyCasesTitle}
              items={demoDataset.cases}
              renderItem={(caseItem) => (
                <article key={caseItem.id} className={caseStackCardClassName}>
                  <p className={caseMetaClassName}>{caseItem.referenceCode}</p>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{caseItem.customerName}</h3>
                  <p className="text-sm leading-7 text-ink-soft">{getLocalizedText(caseItem.nextAction, locale)}</p>
                  <div className={rowBetweenClassName}>
                    <span className="text-sm text-ink-soft">{caseItem.owner}</span>
                    <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
                  </div>
                </article>
              )}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
