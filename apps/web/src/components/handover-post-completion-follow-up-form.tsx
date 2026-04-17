"use client";

import { useActionState } from "react";

import type { HandoverPostCompletionFollowUpStatus, SupportedLocale } from "@real-estate-ai/contracts";
import {
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  TextArea,
  TextInput
} from "@real-estate-ai/ui";

import { createHandoverPostCompletionFollowUpAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverPostCompletionFollowUpCopy } from "@/lib/live-copy";

export function HandoverPostCompletionFollowUpForm(props: {
  dueAt: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  ownerName: string;
  returnPath: string;
  summary: string;
  status: HandoverPostCompletionFollowUpStatus;
}) {
  const copy = getHandoverPostCompletionFollowUpCopy(props.locale);
  const [state, action] = useActionState(createHandoverPostCompletionFollowUpAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="open" />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.ownerName} name="ownerName" type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.dueAt}</span>
          <TextInput defaultValue={props.dueAt} name="dueAt" required type="datetime-local" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.summary}</span>
          <TextArea defaultValue={props.summary} name="summary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."} />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
