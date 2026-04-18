import Link from "next/link";
import type { ReactNode } from "react";

import {
  bodyTextClassName,
  caseLinkAsideClassName,
  caseLinkCardClassName,
  caseMetaClassName,
  cardTitleClassName,
  cx,
  stackTightClassName
} from "@real-estate-ai/ui";

export function LinkedQueueCard(props: {
  badges?: ReactNode;
  children?: ReactNode;
  className?: string;
  href: string;
  meta?: ReactNode;
  summary?: ReactNode;
  testId?: string;
  title: ReactNode;
}) {
  return (
    <Link className={cx(caseLinkCardClassName, props.className)} data-testid={props.testId} href={props.href}>
      <div className={stackTightClassName}>
        {props.meta ? <div className={caseMetaClassName}>{props.meta}</div> : null}
        <h3 className={cardTitleClassName}>{props.title}</h3>
        {props.summary ? <div className={bodyTextClassName}>{props.summary}</div> : null}
        {props.children}
      </div>
      {props.badges ? <div className={caseLinkAsideClassName}>{props.badges}</div> : null}
    </Link>
  );
}
