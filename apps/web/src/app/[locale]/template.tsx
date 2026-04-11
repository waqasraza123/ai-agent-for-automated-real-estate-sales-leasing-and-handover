import type { ReactNode } from "react";

export default function LocaleTemplate(props: {
  children: ReactNode;
}) {
  return <div className="page-transition">{props.children}</div>;
}
