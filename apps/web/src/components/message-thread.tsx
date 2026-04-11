import { getLocalizedText, type ConversationMessage, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { EmptyState, StatusBadge } from "@real-estate-ai/ui";

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
    <div className="message-thread" data-testid="conversation-thread">
      {props.messages.map((message) => (
        <article key={message.id} className="message-card">
          <div className="row-between">
            <h3>{ui.common[message.sender]}</h3>
            {message.state ? <StatusBadge tone="warning">{getLocalizedText(message.state, props.locale)}</StatusBadge> : null}
          </div>
          <p>{getLocalizedText(message.body, props.locale)}</p>
          {message.translation ? <p>{getLocalizedText(message.translation, props.locale)}</p> : null}
          <div className="message-meta">
            <span>{message.timestamp}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
