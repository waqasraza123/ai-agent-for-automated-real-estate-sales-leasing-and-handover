"use client";

import { useActionState } from "react";

import type { HandoverCaseStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import { Button, formActionsRowClassName, formFeedbackClassName, formStackClassName } from "@real-estate-ai/ui";

import { initialFormActionState, startHandoverExecutionAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverExecutionCopy } from "@/lib/live-copy";

export function HandoverExecutionStartForm(props: {
  canManage: boolean;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverCaseStatus;
}) {
  const copy = getHandoverExecutionCopy(props.locale);
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(startHandoverExecutionAction, initialFormActionState);
  const canStart = props.status === "scheduled";
  const alreadyStarted = props.status === "in_progress" || props.status === "completed";

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="in_progress" />

      <div className={formActionsRowClassName}>
        {alreadyStarted ? (
          <Button disabled type="button">
            {messages.forms.alreadyStarted}
          </Button>
        ) : !props.canManage ? (
          <Button disabled type="button">
            {props.disabledLabel}
          </Button>
        ) : canStart ? (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={messages.forms.pendingStart} />
        ) : (
          <Button disabled type="button">
            {messages.forms.waitingForScheduling}
          </Button>
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
