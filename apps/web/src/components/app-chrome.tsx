"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { OperatorRole } from "@real-estate-ai/contracts";
import { canOperatorRoleAccessWorkspace } from "@real-estate-ai/contracts";
import type { SupportedLocale } from "@real-estate-ai/domain";
import type { AppMessages } from "@real-estate-ai/i18n";
import { getLocaleLabel, locales } from "@real-estate-ai/i18n";
import { cx } from "@real-estate-ai/ui";

import { OperatorRoleSwitcher } from "@/components/operator-role-switcher";
import { replacePathLocale } from "@/lib/locale";
import { getQaWorkspaceCopy } from "@/lib/qa-workspace";

export function AppChrome(props: {
  children: ReactNode;
  currentOperatorRole: OperatorRole;
  locale: SupportedLocale;
  messages: AppMessages;
}) {
  const pathname = usePathname();
  const qaWorkspaceCopy = getQaWorkspaceCopy(props.locale);
  const navigation = [
    {
      href: `/${props.locale}`,
      label: props.messages.navigation.landing,
      summary: props.messages.app.shellNote,
      visible: true
    },
    {
      href: `/${props.locale}/dashboard`,
      label: props.messages.navigation.dashboard,
      summary: props.messages.dashboard.title,
      visible: true
    },
    {
      href: `/${props.locale}/leads`,
      label: props.messages.navigation.leads,
      summary: props.messages.leads.title,
      visible: canOperatorRoleAccessWorkspace("sales", props.currentOperatorRole)
    },
    {
      href: `/${props.locale}/manager`,
      label: props.messages.navigation.manager,
      summary: props.messages.manager.title,
      visible:
        canOperatorRoleAccessWorkspace("manager_revenue", props.currentOperatorRole) ||
        canOperatorRoleAccessWorkspace("manager_handover", props.currentOperatorRole)
    },
    {
      href: `/${props.locale}/qa`,
      label: props.messages.navigation.qa,
      summary: qaWorkspaceCopy.title,
      visible: canOperatorRoleAccessWorkspace("qa", props.currentOperatorRole)
    }
  ].filter((item) => item.visible);

  return (
    <div className="chrome-shell" data-testid="app-chrome">
      <a className="skip-link" href="#main-content">
        {props.messages.common.skipToContent}
      </a>

      <header className="chrome-header">
        <div className="chrome-brand">
          <strong>{props.messages.app.name}</strong>
          <p>{props.messages.app.shellNote}</p>
        </div>
        <div className="chrome-actions">
          <span className="chrome-status">{props.messages.app.phaseLabel}</span>
          <div className="chrome-role-group">
            <OperatorRoleSwitcher currentOperatorRole={props.currentOperatorRole} messages={props.messages} />
            <p className="chrome-role-note">{props.messages.common.roleGuardNote}</p>
          </div>
          <nav aria-label={props.messages.common.switchLanguage} className="locale-switch">
            {locales.map((locale) => (
              <Link
                key={locale}
                aria-current={props.locale === locale ? "page" : undefined}
                className={cx(props.locale === locale && "locale-active")}
                href={replacePathLocale(pathname, locale)}
              >
                {getLocaleLabel(locale)}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="chrome-layout">
        <aside className="chrome-sidebar">
          <p className="sidebar-label">{props.messages.app.phaseLabel}</p>
          <nav
            aria-label={props.messages.common.primaryNavigation}
            className="sidebar-stack"
            data-testid="primary-navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cx("sidebar-link", pathname === item.href && "sidebar-link-active")}
                href={item.href}
              >
                <strong>{item.label}</strong>
                <span>{item.summary}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="chrome-main" data-testid="chrome-main" id="main-content" tabIndex={-1}>
          {props.children}
        </main>
      </div>
    </div>
  );
}
