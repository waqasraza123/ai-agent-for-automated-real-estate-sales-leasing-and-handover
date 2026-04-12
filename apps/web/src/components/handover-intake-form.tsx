"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { createHandoverIntakeAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverIntakeCopy } from "@/lib/live-copy";

export function HandoverIntakeForm(props: {
  caseId: string;
  defaultOwnerName: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getHandoverIntakeCopy(props.locale);
  const [state, action] = useActionState(createHandoverIntakeAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.ownerName}</span>
          <input className="input-shell" defaultValue={props.defaultOwnerName} name="ownerName" type="text" />
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.readinessSummary}</span>
          <textarea className="textarea-shell" name="readinessSummary" required rows={4} />
        </label>
      </div>

      <div className="form-actions-row">
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ البدء..." : "Starting..."} />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
