import type { SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { Panel, SkeletonBlock, SkeletonLines } from "@real-estate-ai/ui";

import { ScreenIntro } from "@/components/screen-intro";

export function RouteLoadingShell(props: {
  locale?: SupportedLocale;
}) {
  const messages = getMessages(props.locale ?? "en");

  return (
    <div className="page-stack page-transition" data-testid="route-loading-shell">
      <ScreenIntro
        badge={messages.app.phaseLabel}
        summary={messages.states.loadingSummary}
        title={messages.states.loadingTitle}
      />

      <section className="metric-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="metric-tile metric-tile-ocean">
            <SkeletonBlock className="skeleton-heading" />
            <SkeletonBlock className="skeleton-metric" />
            <SkeletonBlock className="skeleton-detail" />
          </div>
        ))}
      </section>

      <div className="two-column-grid">
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
