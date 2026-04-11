import { getLocalizedText, type JourneyEvent, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel } from "@real-estate-ai/ui";

export function TimelinePanel(props: {
  events: JourneyEvent[];
  locale: SupportedLocale;
}) {
  const messages = getMessages(props.locale);

  return (
    <Panel title={messages.common.timeline}>
      <div className="timeline-list">
        {props.events.map((event) => (
          <article key={event.id} className="timeline-item">
            <h3>{getLocalizedText(event.title, props.locale)}</h3>
            <p>{getLocalizedText(event.detail, props.locale)}</p>
            <div className="message-meta">
              <span>{event.timestamp}</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
