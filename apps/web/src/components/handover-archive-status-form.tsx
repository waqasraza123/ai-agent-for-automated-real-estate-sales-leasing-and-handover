"use client";

import { useActionState } from "react";

import type { HandoverArchiveStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, updateHandoverArchiveStatusAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverArchiveStatusCopy, getHandoverArchiveStatusLabel } from "@/lib/live-copy";

export function HandoverArchiveStatusForm(props: {
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverArchiveStatus;
  statusOptions: HandoverArchiveStatus[];
  summary: string;
}) {
  const copy = getHandoverArchiveStatusCopy(props.locale);
  const [state, action] = useActionState(updateHandoverArchiveStatusAction, initialFormActionState);
  const isArchived = props.status === "archived";

  return (
    <form action={action} className="form-stack">
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.status}</span>
          <select className="select-shell" defaultValue={props.status} disabled={isArchived} name="status">
            {props.statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getHandoverArchiveStatusLabel(props.locale, statusOption)}
              </option>
            ))}
          </select>
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.summary}</span>
          <textarea
            className="textarea-shell"
            defaultValue={props.summary}
            disabled={isArchived}
            name="summary"
            required
            rows={4}
          />
        </label>
      </div>

      <div className="form-actions-row">
        {isArchived ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "مؤرشف" : "Archived"}
          </button>
        ) : (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."} />
        )}
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
