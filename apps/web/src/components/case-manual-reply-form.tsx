"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { getMessages } from "@real-estate-ai/i18n";
import {
  TextArea,
  TextInput,
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  fieldNoteClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName
} from "@real-estate-ai/ui";

import { initialFormActionState, sendCaseReplyAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCaseManualReplyCopy } from "@/lib/live-copy";

export function CaseManualReplyForm(props: {
  canSend: boolean;
  caseId: string;
  defaultMessage?: string | null;
  defaultNextAction: string;
  defaultNextActionDueAt: string;
  defaultSentByName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  returnPath: string;
  showApprovedDraftNote: boolean;
}) {
  const copy = getCaseManualReplyCopy(props.locale);
  const messages = getMessages(props.locale);
  const [state, action] = useActionState(sendCaseReplyAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.sentByName}</span>
          <TextInput defaultValue={props.defaultSentByName} disabled={!props.canSend} name="sentByName" type="text" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.message}</span>
          <TextArea defaultValue={props.defaultMessage ?? ""} disabled={!props.canSend} name="message" required rows={5} />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.nextAction}</span>
          <TextArea defaultValue={props.defaultNextAction} disabled={!props.canSend} name="nextAction" required rows={3} />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.nextActionDueAt}</span>
          <TextInput
            defaultValue={toDateTimeLocalValue(props.defaultNextActionDueAt)}
            disabled={!props.canSend}
            name="nextActionDueAt"
            required
            type="datetime-local"
          />
        </label>
      </div>

      {props.showApprovedDraftNote ? <p className={fieldNoteClassName}>{copy.approvedDraftNote}</p> : null}

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canSend}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={messages.forms.pendingSave}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}
