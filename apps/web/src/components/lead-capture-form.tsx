"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import {
  Select,
  TextArea,
  TextInput,
  fieldGridClassName,
  fieldLabelClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formHelperClassName,
  formStackClassName,
  technicalValueClassName
} from "@real-estate-ai/ui";

import { initialFormActionState, submitWebsiteLeadAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getIntakeCopy } from "@/lib/live-copy";

export function LeadCaptureForm(props: {
  locale: SupportedLocale;
}) {
  const copy = getIntakeCopy(props.locale);
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(submitWebsiteLeadAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="locale" type="hidden" value={props.locale} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.customerName}</span>
          <TextInput name="customerName" placeholder={messages.forms.leadCapture.customerNamePlaceholder} required type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.email}</span>
          <TextInput className={technicalValueClassName} dir="ltr" name="email" placeholder={messages.forms.leadCapture.emailPlaceholder} required type="email" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.phone}</span>
          <TextInput className={technicalValueClassName} dir="ltr" name="phone" placeholder={messages.forms.leadCapture.phonePlaceholder} type="tel" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.projectInterest}</span>
          <TextInput name="projectInterest" placeholder={messages.forms.leadCapture.projectInterestPlaceholder} required type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.budget}</span>
          <TextInput className={technicalValueClassName} dir="ltr" name="budget" placeholder={messages.forms.leadCapture.budgetPlaceholder} type="text" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.preferredLanguage}</span>
          <Select defaultValue={props.locale} name="preferredLocale">
            <option value="ar">{messages.forms.leadCapture.preferredLanguageAr}</option>
            <option value="en">{messages.forms.leadCapture.preferredLanguageEn}</option>
          </Select>
        </label>
      </div>

      <label className={fieldStackClassName}>
        <span className={fieldLabelClassName}>{copy.message}</span>
        <TextArea name="message" placeholder={messages.forms.leadCapture.messagePlaceholder} required rows={5} />
      </label>

      <p className={formHelperClassName}>{copy.helper}</p>

      <div className={formActionsRowClassName}>
        <FormSubmitButton idleLabel={copy.action} pendingLabel={messages.forms.pendingCreate} />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}
