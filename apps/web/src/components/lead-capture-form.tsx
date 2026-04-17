"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import { cx } from "@real-estate-ai/ui";

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
    <form action={action} className="form-stack">
      <input name="locale" type="hidden" value={props.locale} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.customerName}</span>
          <input className="input-shell" name="customerName" placeholder={messages.forms.leadCapture.customerNamePlaceholder} required type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.email}</span>
          <input className="input-shell input-shell-ltr" dir="ltr" name="email" placeholder={messages.forms.leadCapture.emailPlaceholder} required type="email" />
        </label>
        <label className="field-stack">
          <span>{copy.phone}</span>
          <input className="input-shell input-shell-ltr" dir="ltr" name="phone" placeholder={messages.forms.leadCapture.phonePlaceholder} type="tel" />
        </label>
        <label className="field-stack">
          <span>{copy.projectInterest}</span>
          <input
            className="input-shell"
            name="projectInterest"
            placeholder={messages.forms.leadCapture.projectInterestPlaceholder}
            required
            type="text"
          />
        </label>
        <label className="field-stack">
          <span>{copy.budget}</span>
          <input className="input-shell input-shell-ltr" dir="ltr" name="budget" placeholder={messages.forms.leadCapture.budgetPlaceholder} type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.preferredLanguage}</span>
          <select className="select-shell" defaultValue={props.locale} name="preferredLocale">
            <option value="ar">{messages.forms.leadCapture.preferredLanguageAr}</option>
            <option value="en">{messages.forms.leadCapture.preferredLanguageEn}</option>
          </select>
        </label>
      </div>

      <label className="field-stack">
        <span>{copy.message}</span>
        <textarea
          className="textarea-shell"
          name="message"
          placeholder={messages.forms.leadCapture.messagePlaceholder}
          required
          rows={5}
        />
      </label>

      <p className="form-helper">{copy.helper}</p>

      <div className="form-actions-row">
        <FormSubmitButton idleLabel={copy.action} pendingLabel={messages.forms.pendingCreate} />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
