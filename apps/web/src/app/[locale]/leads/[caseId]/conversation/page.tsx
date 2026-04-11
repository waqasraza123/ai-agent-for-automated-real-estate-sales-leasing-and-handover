import { notFound } from "next/navigation";

import { getDemoCaseById, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel } from "@real-estate-ai/ui";

import { CaseRouteTabs } from "@/components/case-route-tabs";
import { MessageThread } from "@/components/message-thread";
import { PlaceholderNotice } from "@/components/placeholder-notice";
import { ScreenIntro } from "@/components/screen-intro";

interface PageProps {
  params: Promise<{ locale: SupportedLocale; caseId: string }>;
}

export default async function ConversationPage(props: PageProps) {
  const { locale, caseId } = await props.params;
  const caseItem = getDemoCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <ScreenIntro
        badge={caseItem.referenceCode}
        summary={messages.conversation.summary}
        title={messages.conversation.title}
      />
      <CaseRouteTabs caseId={caseItem.id} locale={locale} />

      <Panel title={caseItem.customerName}>
        <MessageThread locale={locale} messages={caseItem.conversation} />
      </Panel>

      <PlaceholderNotice locale={locale} />
    </div>
  );
}
