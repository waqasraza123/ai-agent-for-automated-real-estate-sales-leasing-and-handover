import Link from "next/link";

import { demoDataset, getLocalizedText, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, StatusBadge } from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";

interface PageProps {
  params: Promise<{ locale: SupportedLocale }>;
}

export default async function LeadsPage(props: PageProps) {
  const { locale } = await props.params;
  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro badge={messages.app.phaseLabel} summary={messages.leads.summary} title={messages.leads.title} />

      <Panel title={messages.leads.title}>
        <div className="lead-table-wrapper">
          <table className="lead-table">
            <thead>
              <tr>
                <th>{messages.common.lead}</th>
                <th>{messages.common.stage}</th>
                <th>{messages.common.currentOwner}</th>
                <th>{messages.common.nextAction}</th>
                <th>{messages.common.lastChange}</th>
              </tr>
            </thead>
            <tbody>
              {demoDataset.cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>
                    <Link className="table-link" href={`/${locale}/leads/${caseItem.id}`}>
                      <strong>{caseItem.customerName}</strong>
                      <span>{getLocalizedText(caseItem.projectName, locale)}</span>
                    </Link>
                  </td>
                  <td>
                    <StatusBadge>{getLocalizedText(caseItem.stage, locale)}</StatusBadge>
                  </td>
                  <td>{caseItem.owner}</td>
                  <td>{getLocalizedText(caseItem.nextAction, locale)}</td>
                  <td>{new Date(caseItem.lastMeaningfulChange).toLocaleString(locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
