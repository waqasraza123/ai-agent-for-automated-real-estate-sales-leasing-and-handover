import Link from "next/link";

import { type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages, isSupportedLocale } from "@real-estate-ai/i18n";
import { Panel } from "@real-estate-ai/ui";

interface PageProps {
  params?: Promise<{ locale?: string }>;
}

export default async function NotFoundPage(props: PageProps) {
  const resolvedParams = props.params ? await props.params : undefined;
  const locale: SupportedLocale = resolvedParams?.locale && isSupportedLocale(resolvedParams.locale) ? resolvedParams.locale : "en";
  const messages = getMessages(locale);

  return (
    <div className="page-stack">
      <Panel title={messages.app.name}>
        <p className="panel-summary">{messages.common.placeholderNotice}</p>
        <Link className="primary-link" href={`/${locale}`}>
          {messages.navigation.landing}
        </Link>
      </Panel>
    </div>
  );
}
