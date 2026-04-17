"use client";

import { useActionState } from "react";

import type { HandoverBlockerSeverity, HandoverBlockerType, SupportedLocale } from "@real-estate-ai/contracts";
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

import { createHandoverBlockerAction, initialFormActionState } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  getHandoverBlockerCopy,
  getHandoverBlockerSeverityLabel,
  getHandoverBlockerTypeLabel
} from "@/lib/live-copy";

export function HandoverBlockerForm(props: {
  canManage: boolean;
  disabledLabel: string;
  dueAt: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  ownerName: string;
  returnPath: string;
}) {
  const copy = getHandoverBlockerCopy(props.locale);
  const [state, action] = useActionState(createHandoverBlockerAction, initialFormActionState);
  const typeOptions: HandoverBlockerType[] = ["unit_snag", "access_blocker", "document_gap"];
  const severityOptions: HandoverBlockerSeverity[] = ["warning", "critical"];

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="status" type="hidden" value="open" />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.severity}</span>
          <Select defaultValue="warning" disabled={!props.canManage} name="severity">
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
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "نوع العائق" : "Blocker type"}</span>
          <Select defaultValue="unit_snag" disabled={!props.canManage} name="type">
            {typeOptions.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {getHandoverBlockerTypeLabel(props.locale, typeOption)}
              </option>
            ))}
          </Select>
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.summary}</span>
          <TextArea disabled={!props.canManage} name="summary" required rows={4} />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ التسجيل..." : "Logging..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
