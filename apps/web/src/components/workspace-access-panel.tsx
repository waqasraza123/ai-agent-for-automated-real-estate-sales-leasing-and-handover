import Link from "next/link";

import type { OperatorRole, OperatorWorkspace, SupportedLocale } from "@real-estate-ai/contracts";
import { Panel, StatusBadge, inlineLinkClassName, pageStackClassName, panelSummaryClassName, statusRowWrapClassName } from "@real-estate-ai/ui";

import { getOperatorRoleLabel, getOperatorWorkspaceLabel } from "@/lib/operator-role";

export function WorkspaceAccessPanel(props: {
  actionHref: string;
  actionLabel: string;
  locale: SupportedLocale;
  operatorRole: OperatorRole;
  summary: string;
  title: string;
  workspace: OperatorWorkspace;
}) {
  return (
    <Panel title={props.title}>
      <div className={pageStackClassName}>
        <p className={panelSummaryClassName}>{props.summary}</p>
        <div className={statusRowWrapClassName}>
          <StatusBadge>{getOperatorRoleLabel(props.locale, props.operatorRole)}</StatusBadge>
          <StatusBadge tone="warning">{getOperatorWorkspaceLabel(props.locale, props.workspace)}</StatusBadge>
        </div>
        <Link className={inlineLinkClassName} href={props.actionHref}>
          {props.actionLabel}
        </Link>
      </div>
    </Panel>
  );
}
