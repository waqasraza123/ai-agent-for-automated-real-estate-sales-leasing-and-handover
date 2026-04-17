"use client";

import { useActionState } from "react";

import type { AutomationStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import { formActionsRowClassName, formFeedbackClassName, formStackClassName } from "@real-estate-ai/ui";

import { initialFormActionState, updateAutomationStatusAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getAutomationStatusCopy } from "@/lib/live-copy";

export function AutomationStatusForm(props: {
  canManage: boolean;
  caseId: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
  status: AutomationStatus;
}) {
  const copy = getAutomationStatusCopy(props.locale);
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(updateAutomationStatusAction, initialFormActionState);
  const nextStatus: AutomationStatus = props.status === "active" ? "paused" : "active";

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value={nextStatus} />

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={nextStatus === "paused" ? copy.paused : copy.active}
          pendingLabel={messages.forms.pendingUpdate}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}
