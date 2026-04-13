"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, prepareCaseReplyDraftQaReviewAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCaseReplyDraftQaRequestCopy } from "@/lib/live-copy";

export function CaseReplyDraftQaRequestForm(props: {
  canManage: boolean;
  caseId: string;
  defaultDraftMessage?: string | null;
  defaultRequestedByName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getCaseReplyDraftQaRequestCopy(props.locale);
  const [state, action] = useActionState(prepareCaseReplyDraftQaReviewAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.requestedByName}</span>
          <input
            className="input-shell"
            defaultValue={props.defaultRequestedByName}
            disabled={!props.canManage}
            name="requestedByName"
            type="text"
          />
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.draftMessage}</span>
          <textarea
            className="textarea-shell"
            defaultValue={props.defaultDraftMessage ?? ""}
            disabled={!props.canManage}
            name="draftMessage"
            required
            rows={5}
          />
        </label>
      </div>

      <div className="form-actions-row">
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
