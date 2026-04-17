import type { SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import {
  Panel,
  SkeletonBlock,
  SkeletonLines,
  cardBaseClassName,
  cx,
  metricGridClassName,
  pageStackClassName,
  pageTransitionClassName,
  twoColumnGridClassName
} from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";

export function RouteLoadingShell(props: {
  locale?: SupportedLocale;
}) {
  const messages = getMessages(props.locale ?? "en");

  return (
    <div className={cx(pageStackClassName, pageTransitionClassName)} data-testid="route-loading-shell">
      <ScreenIntro
        badge={messages.app.phaseLabel}
        summary={messages.states.loadingSummary}
        title={messages.states.loadingTitle}
      />

      <section className={metricGridClassName}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={cx(cardBaseClassName, "min-h-44 space-y-4 bg-gradient-to-b from-ai-50 to-white")}>
            <SkeletonBlock className="h-4 w-[42%]" />
            <SkeletonBlock className="h-11 w-[32%]" />
            <SkeletonBlock className="h-4 w-[74%]" />
          </div>
        ))}
      </section>

      <div className={twoColumnGridClassName}>
        <Panel title={messages.dashboard.title}>
          <SkeletonLines lines={4} />
        </Panel>
        <Panel title={messages.leads.title}>
          <SkeletonLines lines={5} />
        </Panel>
      </div>
    </div>
  );
}
