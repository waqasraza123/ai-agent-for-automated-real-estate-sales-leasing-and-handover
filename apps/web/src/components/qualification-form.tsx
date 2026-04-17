"use client";

import { useActionState } from "react";

import type { QualificationReadiness, SupportedLocale } from "@real-estate-ai/contracts";
import {
  Select,
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
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.budgetBand}</span>
          <TextInput name="budgetBand" placeholder="SAR 1.8M to 2.1M" required type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.moveInTimeline}</span>
          <TextInput name="moveInTimeline" placeholder="Within 60 days" required type="text" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.intentSummary}</span>
          <TextArea name="intentSummary" required rows={4} />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.readiness}</span>
          <Select defaultValue="medium" name="readiness">
            {readinessOptions.map((option) => (
              <option key={option} value={option}>
                {getQualificationReadinessLabel(props.locale, option)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ حفظ التأهيل..." : "Saving qualification..."} />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}
