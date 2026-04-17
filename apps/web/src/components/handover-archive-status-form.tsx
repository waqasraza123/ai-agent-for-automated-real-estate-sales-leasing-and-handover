"use client";

import { useActionState } from "react";

import type { HandoverArchiveStatus, SupportedLocale } from "@real-estate-ai/contracts";
import {
  Button,
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  Select,
  TextArea
} from "@real-estate-ai/ui";

import { initialFormActionState, updateHandoverArchiveStatusAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverArchiveStatusCopy, getHandoverArchiveStatusLabel } from "@/lib/live-copy";

export function HandoverArchiveStatusForm(props: {
  handoverCaseId: string;
  locale: SupportedLocale;
  returnPath: string;
  status: HandoverArchiveStatus;
  statusOptions: HandoverArchiveStatus[];
  summary: string;
}) {
  const copy = getHandoverArchiveStatusCopy(props.locale);
  const [state, action] = useActionState(updateHandoverArchiveStatusAction, initialFormActionState);
  const isArchived = props.status === "archived";

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.status}</span>
          <Select defaultValue={props.status} disabled={isArchived} name="status">
            {props.statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getHandoverArchiveStatusLabel(props.locale, statusOption)}
              </option>
            ))}
          </Select>
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.summary}</span>
          <TextArea defaultValue={props.summary} disabled={isArchived} name="summary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        {isArchived ? (
          <Button disabled tone="primary" type="button">
            {props.locale === "ar" ? "مؤرشف" : "Archived"}
          </Button>
        ) : (
          <FormSubmitButton idleLabel={copy.action} pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."} />
        )}
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
