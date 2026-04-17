import type { SupportedLocale } from "@real-estate-ai/contracts";

export interface ExportSummaryField {
  field: string;
  value: string;
}

export function buildExportSummaryCsvRows(
  locale: SupportedLocale,
  fields: ExportSummaryField[],
  options: { sectionLabel?: string } = {}
) {
  const sectionLabel =
    options.sectionLabel ?? (locale === "ar" ? "ملخص التصدير" : "export_summary");
  const rows = [
    [
      locale === "ar" ? "القسم" : "section",
      locale === "ar" ? "الحقل" : "field",
      locale === "ar" ? "القيمة" : "value"
    ],
    ...fields.map((field) => [sectionLabel, field.field, field.value])
  ];

  return rows.map((row) => row.map((value) => escapeCsvValue(value)).join(","));
}

export function buildCsvDocument(headers: string[], rows: string[][], options?: { summaryRows?: string[] }) {
  const summaryRows = options?.summaryRows ?? [];
  return [
    ...summaryRows,
    ...(summaryRows.length > 0 ? [""] : []),
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");
}

export function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}
