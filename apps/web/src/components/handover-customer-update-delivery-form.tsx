"use client";

import { useActionState } from "react";

import type { HandoverCustomerUpdateStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, prepareHandoverCustomerUpdateDeliveryAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverDeliveryPreparationCopy } from "@/lib/live-copy";

export function HandoverCustomerUpdateDeliveryForm(props: {
  customerUpdateId: string;
  deliverySummary: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverCustomerUpdateStatus;
}) {
  const copy = getHandoverDeliveryPreparationCopy(props.locale);
  const [state, action] = useActionState(prepareHandoverCustomerUpdateDeliveryAction, initialFormActionState);
  const isPrepared = props.status === "prepared_for_delivery" || props.status === "ready_to_dispatch";

  return (
    <form action={action} className="form-stack">
      <input name="customerUpdateId" type="hidden" value={props.customerUpdateId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="prepared_for_delivery" />

      <label className="field-stack field-span-full">
        <span>{copy.deliverySummary}</span>
        <textarea className="textarea-shell" defaultValue={props.deliverySummary} name="deliverySummary" required rows={4} />
      </label>

      <div className="form-actions-row">
        {isPrepared ? (
          <button className="primary-button" disabled type="button">
            {props.locale === "ar" ? "تم التجهيز" : "Already prepared"}
          </button>
        ) : (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ التجهيز..." : "Preparing..."} />
        )}
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
