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

import { createHandoverIntakeAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverIntakeCopy } from "@/lib/live-copy";

export function HandoverIntakeForm(props: {
  canManage: boolean;
  caseId: string;
  defaultOwnerName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getHandoverIntakeCopy(props.locale);
  const [state, action] = useActionState(createHandoverIntakeAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.defaultOwnerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.readinessSummary}</span>
          <TextArea disabled={!props.canManage} name="readinessSummary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ البدء..." : "Starting..."}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}
