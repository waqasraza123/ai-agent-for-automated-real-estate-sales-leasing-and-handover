"use client";

import { useActionState } from "react";

import type { DocumentRequestStatus, SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import { cx } from "@real-estate-ai/ui";

import { initialFormActionState, updateDocumentStatusAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getDocumentRequestStatusLabel } from "@/lib/live-copy";

export function DocumentStatusForm(props: {
  caseId: string;
  documentRequestId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: DocumentRequestStatus;
}) {
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(updateDocumentStatusAction, initialFormActionState);
  const statusOptions: DocumentRequestStatus[] = ["requested", "under_review", "accepted", "rejected"];

  return (
    <form action={action} className="document-update-form">
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="documentRequestId" type="hidden" value={props.documentRequestId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <select className="select-shell" defaultValue={props.status} name="status">
        {statusOptions.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {getDocumentRequestStatusLabel(props.locale, statusOption)}
          </option>
        ))}
      </select>

      <FormSubmitButton idleLabel={messages.forms.updateAction} pendingLabel={messages.forms.pendingSave} />

      <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
        {state.message}
      </p>
    </form>
  );
}
