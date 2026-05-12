import Link from "next/link";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  EmptyState,
  Panel,
  StatusBadge,
  WorkflowPanelBody,
  inlineLinkClassName,
  pageStackClassName
} from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";
import { getCurrentOperatorRole } from "@/lib/operator-session";
import { tryListCommercialSources } from "@/lib/live-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function InventoryPage(props: PageProps) {
  const { locale } = await props.params;
  const role = await getCurrentOperatorRole();
  const sources = await tryListCommercialSources(role);
  const inventorySources = sources.filter((source) => source.sourceType === "inventory_csv");

  return (
    <div className={pageStackClassName}>
      <ScreenIntro
        badge={locale === "ar" ? "مخزون محلي" : "Local inventory"}
        summary={locale === "ar" ? "آخر مصادر المخزون التي يمكن أن تقترح حقائق أسعار وتوفر للمدير." : "Latest inventory sources that can propose price and availability facts for manager approval."}
        title={locale === "ar" ? "المخزون" : "Inventory"}
      />

      <Panel title={locale === "ar" ? "مصادر المخزون" : "Inventory sources"}>
        <WorkflowPanelBody className="mt-4">
          {inventorySources.length === 0 ? (
            <EmptyState summary={locale === "ar" ? "ابدأ من مركز المصادر التجارية وأضف مصدر CSV للمخزون." : "Start in the Commercial Source Control Center and add an inventory CSV source."} title={locale === "ar" ? "لا يوجد مخزون" : "No inventory"} />
          ) : (
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>{locale === "ar" ? "المصدر" : "Source"}</DataTableHeaderCell>
                  <DataTableHeaderCell>{locale === "ar" ? "المشروع" : "Project"}</DataTableHeaderCell>
                  <DataTableHeaderCell>{locale === "ar" ? "آخر نسخة" : "Latest version"}</DataTableHeaderCell>
                  <DataTableHeaderCell>{locale === "ar" ? "أخطاء" : "Errors"}</DataTableHeaderCell>
                  <DataTableHeaderCell>{locale === "ar" ? "مراجعة" : "Review"}</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <tbody>
                {inventorySources.map((source) => (
                  <tr key={source.sourceId}>
                    <DataTableCell columnLabel={locale === "ar" ? "المصدر" : "Source"}>{source.sourceName}</DataTableCell>
                    <DataTableCell columnLabel={locale === "ar" ? "المشروع" : "Project"}>{source.projectCode}</DataTableCell>
                    <DataTableCell columnLabel={locale === "ar" ? "آخر نسخة" : "Latest version"}>{source.latestVersion?.versionLabel ?? "-"}</DataTableCell>
                    <DataTableCell columnLabel={locale === "ar" ? "أخطاء" : "Errors"}>
                      <StatusBadge tone={source.latestVersion && source.latestVersion.importErrors.length > 0 ? "warning" : "success"}>
                        {String(source.latestVersion?.importErrors.length ?? 0)}
                      </StatusBadge>
                    </DataTableCell>
                    <DataTableCell columnLabel={locale === "ar" ? "مراجعة" : "Review"}>
                      <Link className={inlineLinkClassName} href={`/${locale}/commercial-sources/${source.sourceId}`}>
                        {locale === "ar" ? "فتح" : "Open"}
                      </Link>
                    </DataTableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </WorkflowPanelBody>
      </Panel>
    </div>
  );
}
