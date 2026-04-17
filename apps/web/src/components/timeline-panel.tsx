import { getLocalizedText, type JourneyEvent, type SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { EmptyState, Panel, cx, messageMetaClassName, timelineItemClassName, timelineListClassName } from "@real-estate-ai/ui";

export function TimelinePanel(props: {
  events: JourneyEvent[];
  locale: SupportedLocale;
}) {
  const messages = getMessages(props.locale);

  if (props.events.length === 0) {
    return (
      <Panel title={messages.common.timeline}>
        <EmptyState summary={messages.states.emptyTimelineSummary} title={messages.states.emptyTimelineTitle} />
      </Panel>
    );
  }

  return (
    <Panel title={messages.common.timeline}>
      <div className={timelineListClassName}>
        {props.events.map((event) => (
          <article key={event.id} className={timelineItemClassName}>
            <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{getLocalizedText(event.title, props.locale)}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{getLocalizedText(event.detail, props.locale)}</p>
            <div className={cx("mt-4", messageMetaClassName)}>
              <span>{event.timestamp}</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
