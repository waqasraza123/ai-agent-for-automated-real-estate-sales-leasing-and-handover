"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, planHandoverAppointmentAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverAppointmentPlanCopy } from "@/lib/live-copy";

export function HandoverAppointmentForm(props: {
  coordinatorName: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  location: string;
  returnPath: string;
  scheduledAt: string;
}) {
  const copy = getHandoverAppointmentPlanCopy(props.locale);
  const [state, action] = useActionState(planHandoverAppointmentAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.location}</span>
          <input className="input-shell" defaultValue={props.location} name="location" required type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.scheduledAt}</span>
          <input className="input-shell" defaultValue={props.scheduledAt} name="scheduledAt" required type="datetime-local" />
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.coordinatorName}</span>
          <input className="input-shell" defaultValue={props.coordinatorName} name="coordinatorName" type="text" />
        </label>
      </div>

      <div className="form-actions-row">
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."} />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
