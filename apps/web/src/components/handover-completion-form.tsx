"use client";

import { useActionState } from "react";

import type { HandoverCaseStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { completeHandoverAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverCompletionCopy } from "@/lib/live-copy";

export function HandoverCompletionForm(props: {
  canManage: boolean;
  completionSummary: string;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverCaseStatus;
}) {
  const copy = getHandoverCompletionCopy(props.locale);
  const [state, action] = useActionState(completeHandoverAction, initialFormActionState);
  const canComplete = props.status === "in_progress";
  const isCompleted = props.status === "completed";

  return (
    <form action={action} className="form-stack">
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="completed" />

      <label className="field-stack">
        <span>{copy.completionSummary}</span>
        <textarea
          className="textarea-shell"
          defaultValue={props.completionSummary}
          disabled={isCompleted || !props.canManage}
          name="completionSummary"
          required
          rows={4}
        />
      </label>

      <div className="form-actions-row">
        {isCompleted ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "مكتملة" : "Completed"}
          </button>
        ) : !props.canManage ? (
          <button className="primary-button" disabled type="button">
            {props.disabledLabel}
          </button>
        ) : canComplete ? (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الإتمام..." : "Completing..."} />
        ) : (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "بانتظار التنفيذ" : "Waiting for execution"}
          </button>
        )}
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
