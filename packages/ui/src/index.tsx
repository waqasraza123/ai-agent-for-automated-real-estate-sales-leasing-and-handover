import type { ReactNode } from "react";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function Panel(props: {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className={cx("surface-panel", props.className)}>
      {props.eyebrow ? <p className="surface-eyebrow">{props.eyebrow}</p> : null}
      {props.title ? <h2 className="surface-title">{props.title}</h2> : null}
      {props.children}
    </section>
  );
}

export function StatusBadge(props: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "critical";
}) {
  return <span className={cx("status-badge", props.tone ? `status-badge-${props.tone}` : null)}>{props.children}</span>;
}

export function MetricTile(props: {
  label: string;
  value: string;
  detail: string;
  tone: "ocean" | "sand" | "mint" | "rose";
}) {
  return (
    <div className={cx("metric-tile", `metric-tile-${props.tone}`)}>
      <p className="metric-label">{props.label}</p>
      <p className="metric-value">{props.value}</p>
      <p className="metric-detail">{props.detail}</p>
    </div>
  );
}

export function EmptyState(props: {
  title: string;
  summary: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div className="empty-state" data-testid={props.testId}>
      <h3>{props.title}</h3>
      <p>{props.summary}</p>
      {props.action ? <div className="empty-state-action">{props.action}</div> : null}
    </div>
  );
}

export function SkeletonBlock(props: {
  className?: string;
}) {
  return <div className={cx("skeleton-block", props.className)} />;
}

export function SkeletonLines(props: {
  className?: string;
  lines?: number;
}) {
  const lineCount = props.lines ?? 3;

  return (
    <div className={cx("skeleton-lines", props.className)}>
      {Array.from({ length: lineCount }, (_, index) => (
        <div key={index} className="skeleton-line" />
      ))}
    </div>
  );
}
