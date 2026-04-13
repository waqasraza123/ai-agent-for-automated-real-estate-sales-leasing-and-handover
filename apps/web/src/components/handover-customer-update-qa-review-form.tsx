"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, resolveHandoverCustomerUpdateQaReviewAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverCustomerUpdateQaReviewCopy } from "@/lib/live-copy";

export function HandoverCustomerUpdateQaReviewForm(props: {
  canManage: boolean;
  customerUpdateId: string;
  defaultReviewerName: string;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getHandoverCustomerUpdateQaReviewCopy(props.locale);
  const [state, action] = useActionState(resolveHandoverCustomerUpdateQaReviewAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="customerUpdateId" type="hidden" value={props.customerUpdateId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.reviewerName}</span>
          <input
            className="input-shell"
            defaultValue={props.defaultReviewerName}
            disabled={!props.canManage}
            name="reviewerName"
            type="text"
          />
        </label>
        <label className="field-stack">
          <span>{props.locale === "ar" ? "القرار" : "Decision"}</span>
          <select className="input-shell" defaultValue="approved" disabled={!props.canManage} name="status">
            <option value="approved">{copy.approved}</option>
            <option value="follow_up_required">{copy.followUpRequired}</option>
          </select>
        </label>
        <label className="field-stack field-span-full">
          <span>{copy.reviewSummary}</span>
          <textarea className="textarea-shell" disabled={!props.canManage} name="reviewSummary" required rows={4} />
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
