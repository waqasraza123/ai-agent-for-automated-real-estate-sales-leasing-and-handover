"use client";

import { useActionState } from "react";

import type { HandoverPostCompletionFollowUpStatus, SupportedLocale } from "@real-estate-ai/contracts";
import {
  Button,
  fieldLabelClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  TextArea
} from "@real-estate-ai/ui";

import { initialFormActionState, resolveHandoverPostCompletionFollowUpAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverPostCompletionFollowUpResolutionCopy } from "@/lib/live-copy";

export function HandoverPostCompletionFollowUpResolutionForm(props: {
  followUpId: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  resolutionSummary: string;
  returnPath: string;
  status: HandoverPostCompletionFollowUpStatus;
}) {
  const copy = getHandoverPostCompletionFollowUpResolutionCopy(props.locale);
  const [state, action] = useActionState(resolveHandoverPostCompletionFollowUpAction, initialFormActionState);
  const isResolved = props.status === "resolved";

  return (
    <form action={action} className={formStackClassName}>
      <input name="followUpId" type="hidden" value={props.followUpId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="resolved" />

      <label className={fieldStackClassName}>
        <span className={fieldLabelClassName}>{copy.resolutionSummary}</span>
        <TextArea
          defaultValue={props.resolutionSummary}
          disabled={isResolved}
          name="resolutionSummary"
          required
          rows={4}
        />
      </label>

      <div className={formActionsRowClassName}>
        {isResolved ? (
          <Button disabled type="button">
            {props.locale === "ar" ? "مغلقة" : "Resolved"}
          </Button>
        ) : (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الإغلاق..." : "Resolving..."} />
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
