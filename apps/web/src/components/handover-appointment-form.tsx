"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import {
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

import { initialFormActionState, planHandoverAppointmentAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverAppointmentPlanCopy } from "@/lib/live-copy";

export function HandoverAppointmentForm(props: {
  canManage: boolean;
  coordinatorName: string;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  location: string;
  returnPath: string;
  scheduledAt: string;
}) {
  const copy = getHandoverAppointmentPlanCopy(props.locale);
  const [state, action] = useActionState(planHandoverAppointmentAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.location}</span>
          <TextInput defaultValue={props.location} disabled={!props.canManage} name="location" required type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.scheduledAt}</span>
          <TextInput defaultValue={props.scheduledAt} disabled={!props.canManage} name="scheduledAt" required type="datetime-local" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.coordinatorName}</span>
          <TextInput defaultValue={props.coordinatorName} disabled={!props.canManage} name="coordinatorName" type="text" />
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
