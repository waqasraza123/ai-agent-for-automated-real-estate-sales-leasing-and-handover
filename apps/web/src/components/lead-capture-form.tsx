"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, submitWebsiteLeadAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getIntakeCopy } from "@/lib/live-copy";

export function LeadCaptureForm(props: {
  locale: SupportedLocale;
}) {
  const copy = getIntakeCopy(props.locale);
  const [state, action] = useActionState(submitWebsiteLeadAction, initialFormActionState);

  return (
    <form action={action} className="form-stack">
      <input name="locale" type="hidden" value={props.locale} />

      <div className="field-grid">
        <label className="field-stack">
          <span>{copy.customerName}</span>
          <input className="input-shell" name="customerName" placeholder="Maha Al-Qahtani" required type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.email}</span>
          <input className="input-shell" name="email" placeholder="maha@example.com" required type="email" />
        </label>
        <label className="field-stack">
          <span>{copy.phone}</span>
          <input className="input-shell" name="phone" placeholder="+966 5X XXX XXXX" type="tel" />
        </label>
        <label className="field-stack">
          <span>{copy.projectInterest}</span>
          <input className="input-shell" name="projectInterest" placeholder="Sunrise Residences" required type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.budget}</span>
          <input className="input-shell" name="budget" placeholder="SAR 1.8M to 2.1M" type="text" />
        </label>
        <label className="field-stack">
          <span>{copy.preferredLanguage}</span>
          <select className="select-shell" defaultValue={props.locale} name="preferredLocale">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
      </div>

      <label className="field-stack">
        <span>{copy.message}</span>
        <textarea
          className="textarea-shell"
          name="message"
          placeholder={
            props.locale === "ar"
              ? "عميلة جادة تبحث عن شقة ثلاث غرف نوم وتفضّل زيارة نهاية الأسبوع."
              : "Serious buyer looking for a three-bedroom apartment and prefers a weekend site visit."
          }
          required
          rows={5}
        />
      </label>

      <p className="form-helper">{copy.helper}</p>

      <div className="form-actions-row">
        <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ إنشاء الحالة..." : "Creating case..."} />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
