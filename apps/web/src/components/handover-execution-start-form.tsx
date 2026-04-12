"use client";

import { useActionState } from "react";

import type { HandoverCaseStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, startHandoverExecutionAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverExecutionCopy } from "@/lib/live-copy";

export function HandoverExecutionStartForm(props: {
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverCaseStatus;
}) {
  const copy = getHandoverExecutionCopy(props.locale);
  const [state, action] = useActionState(startHandoverExecutionAction, initialFormActionState);
  const canStart = props.status === "scheduled";
  const alreadyStarted = props.status === "in_progress" || props.status === "completed";

  return (
    <form action={action} className="form-stack">
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="in_progress" />

      <div className="form-actions-row">
        {alreadyStarted ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "تم البدء" : "Already started"}
          </button>
        ) : canStart ? (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ البدء..." : "Starting..."} />
        ) : (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "بانتظار الجدولة" : "Waiting for scheduling"}
          </button>
        )}
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
