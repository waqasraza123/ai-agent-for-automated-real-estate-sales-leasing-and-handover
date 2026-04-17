"use client";

import { useActionState } from "react";

import type { HandoverAppointmentStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { Button, formActionsRowClassName, formFeedbackClassName, formStackClassName } from "@real-estate-ai/ui";

import { confirmHandoverAppointmentAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverAppointmentConfirmationCopy } from "@/lib/live-copy";

export function HandoverAppointmentConfirmationForm(props: {
  appointmentId: string;
  canManage: boolean;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverAppointmentStatus;
}) {
  const copy = getHandoverAppointmentConfirmationCopy(props.locale);
  const [state, action] = useActionState(confirmHandoverAppointmentAction, initialFormActionState);
  const isConfirmed = props.status === "internally_confirmed";

  return (
    <form action={action} className={formStackClassName}>
      <input name="appointmentId" type="hidden" value={props.appointmentId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="internally_confirmed" />

      <div className={formActionsRowClassName}>
        {isConfirmed ? (
          <Button disabled type="button">
            {props.locale === "ar" ? "تم التأكيد" : "Already confirmed"}
          </Button>
        ) : (
          <FormSubmitButton
            disabled={!props.canManage}
            disabledLabel={props.disabledLabel}
            idleLabel={copy.action}
            pendingLabel={props.locale === "ar" ? "جارٍ التأكيد..." : "Confirming..."}
          />
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
