"use client";

import { useActionState } from "react";

import type {
  HandoverBlockerSeverity,
  HandoverBlockerStatus,
  SupportedLocale
} from "@real-estate-ai/contracts";
import {
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  Select,
  TextArea,
  TextInput
} from "@real-estate-ai/ui";

import { initialFormActionState, updateHandoverBlockerAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  getHandoverBlockerCopy,
  getHandoverBlockerSeverityLabel,
  getHandoverBlockerStatusLabel
} from "@/lib/live-copy";

export function HandoverBlockerStatusForm(props: {
  blockerId: string;
  canManage: boolean;
  disabledLabel: string;
  dueAt: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  ownerName: string;
  returnPath: string;
  severity: HandoverBlockerSeverity;
  status: HandoverBlockerStatus;
  summary: string;
}) {
  const copy = getHandoverBlockerCopy(props.locale);
  const [state, action] = useActionState(updateHandoverBlockerAction, initialFormActionState);
  const statusOptions: HandoverBlockerStatus[] = ["open", "in_progress", "resolved"];
  const severityOptions: HandoverBlockerSeverity[] = ["warning", "critical"];

  return (
    <form action={action} className={formStackClassName}>
      <input name="blockerId" type="hidden" value={props.blockerId} />
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.status}</span>
          <Select defaultValue={props.status} disabled={!props.canManage} name="status">
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getHandoverBlockerStatusLabel(props.locale, statusOption)}
              </option>
            ))}
          </Select>
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.severity}</span>
          <Select defaultValue={props.severity} disabled={!props.canManage} name="severity">
            {severityOptions.map((severityOption) => (
              <option key={severityOption} value={severityOption}>
                {getHandoverBlockerSeverityLabel(props.locale, severityOption)}
              </option>
            ))}
          </Select>
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.dueAt}</span>
          <TextInput defaultValue={props.dueAt} disabled={!props.canManage} name="dueAt" required type="datetime-local" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.summary}</span>
          <TextArea defaultValue={props.summary} disabled={!props.canManage} name="summary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={props.locale === "ar" ? "حفظ العائق" : "Save blocker"}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
