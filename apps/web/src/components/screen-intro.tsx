import {
  screenIntroBadgeClassName,
  screenIntroClassName,
  screenIntroSummaryClassName,
  screenIntroTitleClassName
} from "@real-estate-ai/ui";

export function ScreenIntro(props: {
  badge: string;
  title: string;
  summary: string;
}) {
  return (
    <section className={screenIntroClassName}>
      <p className={screenIntroBadgeClassName}>{props.badge}</p>
      <h1 className={screenIntroTitleClassName}>{props.title}</h1>
      <p className={screenIntroSummaryClassName}>{props.summary}</p>
    </section>
  );
}
