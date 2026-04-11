import type { SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";

export function PlaceholderNotice(props: {
  locale: SupportedLocale;
}) {
  const messages = getMessages(props.locale);

  return <div className="placeholder-note">{messages.common.placeholderNotice}</div>;
}
