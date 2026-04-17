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
    <nav className="flex flex-wrap items-center gap-2 rounded-full border border-canvas-line/80 bg-white/80 p-1 shadow-panel">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          className={cx(
            "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition",
            pathname === tab.href ? "bg-brand-600 text-white shadow-brand-glow" : "text-ink-soft hover:bg-brand-50 hover:text-brand-700"
          )}
          href={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
