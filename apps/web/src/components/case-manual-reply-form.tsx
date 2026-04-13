"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, sendCaseReplyAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCaseManualReplyCopy } from "@/lib/live-copy";

export function CaseManualReplyForm(props: {
  canSend: boolean;
  caseId: string;
  defaultMessage?: string | null;
  defaultSentByName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
  showApprovedDraftNote: boolean;
}) {
  const copy = getCaseManualReplyCopy(props.locale);
  const [state, action] = useActionState(sendCaseReplyAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.sentByName}</span>
          <input
            className="input-shell"
            defaultValue={props.defaultSentByName}
            disabled={!props.canSend}
            name="sentByName"
            type="text"
          />
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.message}</span>
          <textarea
            className="textarea-shell"
            defaultValue={props.defaultMessage ?? ""}
            disabled={!props.canSend}
            name="message"
            required
            rows={5}
          />
        </label>
      </div>

      {props.showApprovedDraftNote ? <p className="field-note">{copy.approvedDraftNote}</p> : null}

      <div className="form-actions-row">
        <FormSubmitButton
          disabled={!props.canSend}
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
