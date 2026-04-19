"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { formFeedbackClassName, formStackClassName } from "@real-estate-ai/ui";

import { initialFormActionState, uploadDocumentAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

export function DocumentUploadForm(props: {
  caseId: string;
  documentRequestId: string;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const [state, action] = useActionState(uploadDocumentAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="documentRequestId" type="hidden" value={props.documentRequestId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <input
        accept="application/pdf,image/png,image/jpeg"
        className="block w-full rounded-3xl border border-canvas-line/70 bg-white/90 px-4 py-3 text-sm text-ink shadow-panel-soft transition file:me-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
        name="documentFile"
        required
        type="file"
      />

      <FormSubmitButton
        idleLabel={props.locale === "ar" ? "رفع الملف" : "Upload file"}
        pendingLabel={props.locale === "ar" ? "جارٍ رفع الملف..." : "Uploading file..."}
      />

      <p className={formFeedbackClassName(state.status)}>{state.message}</p>
    </form>
  );
}
