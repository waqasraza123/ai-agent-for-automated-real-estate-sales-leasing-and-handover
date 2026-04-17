"use client";

import { useActionState } from "react";

import type { HandoverCustomerUpdateQaReviewStatus, HandoverCustomerUpdateStatus, SupportedLocale } from "@real-estate-ai/contracts";
import {
  Button,
  cx,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  TextArea
} from "@real-estate-ai/ui";

import { initialFormActionState, prepareHandoverCustomerUpdateDeliveryAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverDeliveryPreparationCopy } from "@/lib/live-copy";

export function HandoverCustomerUpdateDeliveryForm(props: {
  canManage: boolean;
  customerUpdateId: string;
  disabledLabel: string;
  deliverySummary: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  qaReviewStatus: HandoverCustomerUpdateQaReviewStatus;
  returnPath: string;
  status: HandoverCustomerUpdateStatus;
}) {
  const copy = getHandoverDeliveryPreparationCopy(props.locale);
  const [state, action] = useActionState(prepareHandoverCustomerUpdateDeliveryAction, initialFormActionState);
  const isDispatchReady = props.status === "ready_to_dispatch";
  const isPendingQaReview = props.qaReviewStatus === "pending_review";
  const isPrepared = props.status === "prepared_for_delivery" && props.qaReviewStatus !== "follow_up_required";

  return (
    <form action={action} className={formStackClassName}>
      <input name="customerUpdateId" type="hidden" value={props.customerUpdateId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="prepared_for_delivery" />

      <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
        <span className={fieldLabelClassName}>{copy.deliverySummary}</span>
        <TextArea
          defaultValue={props.deliverySummary}
          disabled={!props.canManage}
          name="deliverySummary"
          required
          rows={4}
        />
      </label>

      <div className={formActionsRowClassName}>
        {isDispatchReady ? (
          <Button disabled type="button">
            {props.locale === "ar" ? "جاهز للإرسال" : "Ready to dispatch"}
          </Button>
        ) : isPendingQaReview ? (
          <Button disabled type="button">
            {props.locale === "ar" ? "بانتظار الجودة" : "Pending QA review"}
          </Button>
        ) : isPrepared ? (
          <Button disabled type="button">
            {props.locale === "ar" ? "تم التجهيز" : "Already prepared"}
          </Button>
        ) : (
          <FormSubmitButton
            disabled={!props.canManage}
            disabledLabel={props.disabledLabel}
            idleLabel={copy.action}
            pendingLabel={props.locale === "ar" ? "جارٍ التجهيز..." : "Preparing..."}
          />
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
