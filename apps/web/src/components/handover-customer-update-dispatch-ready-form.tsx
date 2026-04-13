"use client";

import { useActionState } from "react";

import type { HandoverCustomerUpdateQaReviewStatus, HandoverCustomerUpdateStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, markHandoverCustomerUpdateDispatchReadyAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverDispatchReadyCopy } from "@/lib/live-copy";

export function HandoverCustomerUpdateDispatchReadyForm(props: {
  canManage: boolean;
  customerUpdateId: string;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  qaReviewStatus: HandoverCustomerUpdateQaReviewStatus;
  returnPath: string;
  status: HandoverCustomerUpdateStatus;
}) {
  const copy = getHandoverDispatchReadyCopy(props.locale);
  const [state, action] = useActionState(markHandoverCustomerUpdateDispatchReadyAction, initialFormActionState);
  const isPrepared = props.status === "prepared_for_delivery";
  const isDispatchReady = props.status === "ready_to_dispatch";
  const isPendingQaReview = props.qaReviewStatus === "pending_review";
  const requiresQaFollowUp = props.qaReviewStatus === "follow_up_required";

  return (
    <form action={action} className="form-stack">
      <input name="customerUpdateId" type="hidden" value={props.customerUpdateId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="ready_to_dispatch" />

      <div className="form-actions-row">
        {isDispatchReady ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "جاهز للإرسال" : "Ready to dispatch"}
          </button>
        ) : isPendingQaReview ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "بانتظار الجودة" : "Pending QA review"}
          </button>
        ) : requiresQaFollowUp ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "مطلوب تعديل الصياغة" : "Draft changes required"}
          </button>
        ) : isPrepared ? (
          <FormSubmitButton
            disabled={!props.canManage}
            disabledLabel={props.disabledLabel}
            idleLabel={copy.action}
            pendingLabel={props.locale === "ar" ? "جارٍ التحويل..." : "Marking..."}
          />
        ) : (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "بانتظار التجهيز" : "Waiting for preparation"}
          </button>
        )}
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
