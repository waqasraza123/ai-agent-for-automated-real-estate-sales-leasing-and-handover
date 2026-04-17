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

import { initialFormActionState, prepareCaseReplyDraftQaReviewAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCaseReplyDraftQaRequestCopy } from "@/lib/live-copy";

export function CaseReplyDraftQaRequestForm(props: {
  canManage: boolean;
  caseId: string;
  defaultDraftMessage?: string | null;
  defaultRequestedByName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getCaseReplyDraftQaRequestCopy(props.locale);
  const [state, action] = useActionState(prepareCaseReplyDraftQaReviewAction, initialFormActionState);

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
          <span className={fieldLabelClassName}>{copy.draftMessage}</span>
          <TextArea
            defaultValue={props.defaultDraftMessage ?? ""}
            disabled={!props.canManage}
            name="draftMessage"
            required
            rows={5}
          />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
