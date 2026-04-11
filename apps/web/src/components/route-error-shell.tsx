"use client";

import type { SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { EmptyState, Panel } from "@real-estate-ai/ui";

export function RouteErrorShell(props: {
  locale: SupportedLocale;
  reset: () => void;
}) {
  const messages = getMessages(props.locale);

  return (
    <div className="page-stack page-transition" data-testid="route-error-shell">
      <Panel eyebrow={messages.app.phaseLabel} title={messages.states.errorTitle}>
        <EmptyState
          action={
            <button className="primary-button" onClick={props.reset} type="button">
              {messages.states.retry}
            </button>
          }
          summary={messages.states.errorSummary}
          title={messages.states.errorTitle}
        />
      </Panel>
    </div>
  );
}
