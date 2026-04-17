"use client";

import { useActionState } from "react";

import type { HandoverCaseStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import {
  Button,
  fieldLabelClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  TextArea
} from "@real-estate-ai/ui";

import { completeHandoverAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverCompletionCopy } from "@/lib/live-copy";

export function HandoverCompletionForm(props: {
  canManage: boolean;
  completionSummary: string;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverCaseStatus;
}) {
  const copy = getHandoverCompletionCopy(props.locale);
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(completeHandoverAction, initialFormActionState);
  const canComplete = props.status === "in_progress";
  const isCompleted = props.status === "completed";

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="completed" />

      <label className={fieldStackClassName}>
        <span className={fieldLabelClassName}>{copy.completionSummary}</span>
        <TextArea
          defaultValue={props.completionSummary}
          disabled={isCompleted || !props.canManage}
          name="completionSummary"
          required
          rows={4}
        />
      </label>

      <div className={formActionsRowClassName}>
        {isCompleted ? (
          <Button disabled type="button">
            {messages.forms.alreadyCompleted}
          </Button>
        ) : !props.canManage ? (
          <Button disabled type="button">
            {props.disabledLabel}
          </Button>
        ) : canComplete ? (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={messages.forms.pendingComplete} />
        ) : (
          <Button disabled type="button">
            {messages.forms.waitingForExecution}
          </Button>
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
