export function ScreenIntro(props: {
  badge: string;
  title: string;
  summary: string;
}) {
  return (
    <section className="screen-intro">
      <p className="screen-intro-badge">{props.badge}</p>
      <h1>{props.title}</h1>
      <p className="screen-intro-summary">{props.summary}</p>
    </section>
  );
}
