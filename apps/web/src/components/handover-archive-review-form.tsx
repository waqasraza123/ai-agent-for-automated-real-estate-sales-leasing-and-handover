"use client";

import { useActionState } from "react";

import type { HandoverArchiveOutcome, SupportedLocale } from "@real-estate-ai/contracts";
import {
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  Select,
  TextArea
} from "@real-estate-ai/ui";

import { initialFormActionState, saveHandoverArchiveReviewAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverArchiveOutcomeLabel, getHandoverArchiveReviewCopy } from "@/lib/live-copy";

export function HandoverArchiveReviewForm(props: {
  handoverCaseId: string;
  locale: SupportedLocale;
  outcome: HandoverArchiveOutcome;
  returnPath: string;
  summary: string;
}) {
  const copy = getHandoverArchiveReviewCopy(props.locale);
  const [state, action] = useActionState(saveHandoverArchiveReviewAction, initialFormActionState);
  const outcomeOptions: HandoverArchiveOutcome[] = ["ready_to_archive", "hold_for_review"];

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.outcome}</span>
          <Select defaultValue={props.outcome} name="outcome">
            {outcomeOptions.map((outcomeOption) => (
              <option key={outcomeOption} value={outcomeOption}>
                {getHandoverArchiveOutcomeLabel(props.locale, outcomeOption)}
              </option>
            ))}
          </Select>
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.summary}</span>
          <TextArea defaultValue={props.summary} name="summary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."} />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
