"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
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

import { initialFormActionState, requestCaseQaReviewAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getQaReviewRequestCopy } from "@/lib/live-copy";

export function QaReviewRequestForm(props: {
  canManage: boolean;
  caseId: string;
  defaultRequestedByName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getQaReviewRequestCopy(props.locale);
  const [state, action] = useActionState(requestCaseQaReviewAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.requestedByName}</span>
          <TextInput
            defaultValue={props.defaultRequestedByName}
            disabled={!props.canManage}
            name="requestedByName"
            type="text"
          />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.sampleSummary}</span>
          <TextArea disabled={!props.canManage} name="sampleSummary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ الإرسال..." : "Sending..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
