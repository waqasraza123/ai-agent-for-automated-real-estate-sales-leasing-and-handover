"use client";

import { useActionState } from "react";

import type { HandoverCustomerUpdateStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { Button, formActionsRowClassName, formFeedbackClassName, formStackClassName } from "@real-estate-ai/ui";

import { approveHandoverCustomerUpdateAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverCustomerUpdateApprovalCopy } from "@/lib/live-copy";

export function HandoverCustomerUpdateApprovalForm(props: {
  canManage: boolean;
  customerUpdateId: string;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverCustomerUpdateStatus;
}) {
  const copy = getHandoverCustomerUpdateApprovalCopy(props.locale);
  const [state, action] = useActionState(approveHandoverCustomerUpdateAction, initialFormActionState);
  const isReady = props.status === "ready_for_approval";
  const isApproved = props.status === "approved" || props.status === "prepared_for_delivery" || props.status === "ready_to_dispatch";

  return (
    <form action={action} className={formStackClassName}>
      <input name="customerUpdateId" type="hidden" value={props.customerUpdateId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="approved" />

      <div className={formActionsRowClassName}>
        {isReady ? (
          <FormSubmitButton
            disabled={!props.canManage}
            disabledLabel={props.disabledLabel}
            idleLabel={copy.action}
            pendingLabel={props.locale === "ar" ? "جارٍ الاعتماد..." : "Approving..."}
          />
        ) : (
          <Button disabled type="button">
            {isApproved ? (props.locale === "ar" ? "تم الاعتماد" : "Already approved") : (props.locale === "ar" ? "بانتظار الجاهزية" : "Waiting for readiness")}
          </Button>
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
