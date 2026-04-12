"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SupportedLocale } from "@real-estate-ai/domain";
import { getMessages } from "@real-estate-ai/i18n";
import { cx } from "@real-estate-ai/ui";

export function CaseRouteTabs(props: {
  caseId: string;
  handoverCaseId?: string | undefined;
  locale: SupportedLocale;
}) {
  const pathname = usePathname();
  const messages = getMessages(props.locale);
  const tabs = [
    {
      href: `/${props.locale}/leads/${props.caseId}`,
      label: messages.profile.title
    },
    {
      href: `/${props.locale}/leads/${props.caseId}/conversation`,
      label: messages.conversation.title
    },
    {
      href: `/${props.locale}/leads/${props.caseId}/schedule`,
      label: messages.schedule.title
    },
    {
      href: `/${props.locale}/leads/${props.caseId}/documents`,
      label: messages.documents.title
    },
    props.handoverCaseId
      ? {
          href: `/${props.locale}/handover/${props.handoverCaseId}`,
          label: messages.handover.title
        }
      : null
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
  }>;

  return (
    <nav className="case-route-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          className={cx("case-route-tab", pathname === tab.href && "case-route-tab-active")}
          href={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
