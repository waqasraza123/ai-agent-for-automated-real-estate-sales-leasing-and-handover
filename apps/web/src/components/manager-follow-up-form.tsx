"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import {
  TextArea,
  TextInput,
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName
} from "@real-estate-ai/ui";

import { initialFormActionState, saveManagerFollowUpAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getFollowUpManagerCopy } from "@/lib/live-copy";

export function ManagerFollowUpForm(props: {
  canManage: boolean;
  caseId: string;
  disabledLabel: string;
  locale: SupportedLocale;
  nextAction: string;
  nextActionDueAt: string;
  ownerName: string;
  returnPath: string;
}) {
  const copy = getFollowUpManagerCopy(props.locale);
  const [state, action] = useActionState(saveManagerFollowUpAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.nextAction}</span>
          <TextArea defaultValue={props.nextAction} disabled={!props.canManage} name="nextAction" required rows={4} />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.nextActionDueAt}</span>
          <TextInput
            defaultValue={toDateTimeLocalValue(props.nextActionDueAt)}
            disabled={!props.canManage}
            name="nextActionDueAt"
            required
            type="datetime-local"
          />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}
