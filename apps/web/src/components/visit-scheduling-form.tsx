"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import {
  TextInput,
  fieldGridClassName,
  fieldLabelClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName
} from "@real-estate-ai/ui";

import { initialFormActionState, scheduleVisitAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getVisitCopy } from "@/lib/live-copy";

export function VisitSchedulingForm(props: {
  caseId: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const copy = getVisitCopy(props.locale);
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(scheduleVisitAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.location}</span>
          <TextInput name="location" placeholder={messages.forms.visitScheduling.locationPlaceholder} required type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.scheduledAt}</span>
          <TextInput name="scheduledAt" required type="datetime-local" />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton idleLabel={copy.action} pendingLabel={messages.forms.pendingSchedule} />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}
