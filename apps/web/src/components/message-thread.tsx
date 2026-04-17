import { getLocalizedText, type ConversationMessage, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  EmptyState,
  StatusBadge,
  cx,
  messageCardClassName,
  messageMetaClassName,
  messageThreadClassName,
  rowBetweenClassName
} from "@real-estate-ai/ui";

export function MessageThread(props: {
  locale: SupportedLocale;
  messages: ConversationMessage[];
}) {
  const ui = getMessages(props.locale);

  if (props.messages.length === 0) {
    return (
      <EmptyState
        summary={ui.states.emptyMessagesSummary}
        testId="conversation-empty-state"
        title={ui.states.emptyMessagesTitle}
      />
    );
  }

  return (
    <div className={messageThreadClassName} data-testid="conversation-thread">
      {props.messages.map((message) => (
        <article key={message.id} className={messageCardClassName}>
          <div className={rowBetweenClassName}>
            <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{ui.common[message.sender]}</h3>
            {message.state ? <StatusBadge tone="warning">{getLocalizedText(message.state, props.locale)}</StatusBadge> : null}
          </div>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{getLocalizedText(message.body, props.locale)}</p>
          {message.translation ? <p className="mt-3 text-sm leading-7 text-ink-soft">{getLocalizedText(message.translation, props.locale)}</p> : null}
          <div className={cx("mt-4", messageMetaClassName)}>
            <span>{message.timestamp}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
