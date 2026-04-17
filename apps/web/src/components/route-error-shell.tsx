"use client";

import type { SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Button, EmptyState, Panel, cx, pageStackClassName, pageTransitionClassName } from "@real-estate-ai/ui";

export function RouteErrorShell(props: {
  locale: SupportedLocale;
  reset: () => void;
}) {
  const messages = getMessages(props.locale);

  return (
    <div className={cx(pageStackClassName, pageTransitionClassName)} data-testid="route-error-shell">
      <Panel eyebrow={messages.app.phaseLabel} title={messages.states.errorTitle}>
        <EmptyState
          action={
            <Button onClick={props.reset} type="button">
              {messages.states.retry}
            </Button>
          }
          summary={messages.states.errorSummary}
          title={messages.states.errorTitle}
        />
      </Panel>
    </div>
  );
}
