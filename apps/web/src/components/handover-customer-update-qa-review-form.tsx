"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
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
  TextArea,
  TextInput
} from "@real-estate-ai/ui";

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
    <form action={action} className={formStackClassName}>
      <input name="customerUpdateId" type="hidden" value={props.customerUpdateId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.reviewerName}</span>
          <TextInput
            defaultValue={props.defaultReviewerName}
            disabled={!props.canManage}
            name="reviewerName"
            type="text"
          />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "القرار" : "Decision"}</span>
          <Select defaultValue="approved" disabled={!props.canManage} name="status">
            <option value="approved">{copy.approved}</option>
            <option value="follow_up_required">{copy.followUpRequired}</option>
          </Select>
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.reviewSummary}</span>
          <TextArea disabled={!props.canManage} name="reviewSummary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
