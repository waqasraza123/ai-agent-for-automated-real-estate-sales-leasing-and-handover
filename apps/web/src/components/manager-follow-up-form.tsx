"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, saveManagerFollowUpAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getFollowUpManagerCopy } from "@/lib/live-copy";

export function ManagerFollowUpForm(props: {
  canManage: boolean;
  caseId: string;
  disabledLabel: string;
  locale: SupportedLocale;
  nextAction: string;
  nextActionDueAt: string;
  ownerName: string;
  returnPath: string;
}) {
  const copy = getFollowUpManagerCopy(props.locale);
  const [state, action] = useActionState(saveManagerFollowUpAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack field-span-full">
          <span>{copy.nextAction}</span>
          <textarea
            className="textarea-shell"
            defaultValue={props.nextAction}
            disabled={!props.canManage}
            name="nextAction"
            required
            rows={4}
          />
        </label>
        <label className="field-stack">
          <span>{copy.nextActionDueAt}</span>
          <input
            className="input-shell"
            defaultValue={toDateTimeLocalValue(props.nextActionDueAt)}
            disabled={!props.canManage}
            name="nextActionDueAt"
            required
            type="datetime-local"
          />
        </label>
        <label className="field-stack">
          <span>{copy.ownerName}</span>
          <input className="input-shell" defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
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

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}
