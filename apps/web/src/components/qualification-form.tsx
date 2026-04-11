"use client";

import { useActionState } from "react";

import type { QualificationReadiness, SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, saveQualificationAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getQualificationCopy, getQualificationReadinessLabel } from "@/lib/live-copy";

export function QualificationForm(props: {
  caseId: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getQualificationCopy(props.locale);
  const [state, action] = useActionState(saveQualificationAction, initialFormActionState);
  const readinessOptions: QualificationReadiness[] = ["watch", "medium", "high"];

  return (
    <form action={action} className="form-stack">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.budgetBand}</span>
          <input className="input-shell" name="budgetBand" placeholder="SAR 1.8M to 2.1M" required type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.moveInTimeline}</span>
          <input className="input-shell" name="moveInTimeline" placeholder="Within 60 days" required type="text" />
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.intentSummary}</span>
          <textarea className="textarea-shell" name="intentSummary" required rows={4} />
        </label>
        <label className="field-stack">
          <span>{copy.readiness}</span>
          <select className="select-shell" defaultValue="medium" name="readiness">
            {readinessOptions.map((option) => (
              <option key={option} value={option}>
                {getQualificationReadinessLabel(props.locale, option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-actions-row">
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ حفظ التأهيل..." : "Saving qualification..."} />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
