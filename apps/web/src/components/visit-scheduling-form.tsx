"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, scheduleVisitAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getVisitCopy } from "@/lib/live-copy";

export function VisitSchedulingForm(props: {
  caseId: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getVisitCopy(props.locale);
  const [state, action] = useActionState(scheduleVisitAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.location}</span>
          <input className="input-shell" name="location" placeholder="Sunrise Residences Sales Pavilion" required type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.scheduledAt}</span>
          <input className="input-shell" name="scheduledAt" required type="datetime-local" />
        </label>
      </div>

      <div className="form-actions-row">
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ حفظ الموعد..." : "Saving visit..."} />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
