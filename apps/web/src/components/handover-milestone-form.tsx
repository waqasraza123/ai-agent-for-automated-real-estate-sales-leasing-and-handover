"use client";

import { useActionState } from "react";

import type { HandoverMilestoneStatus, SupportedLocale } from "@real-estate-ai/contracts";
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
  TextInput
} from "@real-estate-ai/ui";

import { initialFormActionState, updateHandoverMilestoneAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getHandoverMilestoneCopy, getHandoverMilestoneStatusLabel } from "@/lib/live-copy";

export function HandoverMilestoneForm(props: {
  canManage: boolean;
  disabledLabel: string;
  handoverCaseId: string;
  locale: SupportedLocale;
  milestoneId: string;
  ownerName: string;
  returnPath: string;
  status: HandoverMilestoneStatus;
  targetAt: string;
}) {
  const copy = getHandoverMilestoneCopy(props.locale);
  const [state, action] = useActionState(updateHandoverMilestoneAction, initialFormActionState);
  const statusOptions: HandoverMilestoneStatus[] = ["planned", "blocked", "ready"];

  return (
    <form action={action} className={formStackClassName}>
      <input name="handoverCaseId" type="hidden" value={props.handoverCaseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="milestoneId" type="hidden" value={props.milestoneId} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.status}</span>
          <Select defaultValue={props.status} disabled={!props.canManage} name="status">
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getHandoverMilestoneStatusLabel(props.locale, statusOption)}
              </option>
            ))}
          </Select>
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.targetAt}</span>
          <TextInput
            defaultValue={props.targetAt}
            disabled={!props.canManage}
            name="targetAt"
            required
            type="datetime-local"
          />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.disabledLabel}
          idleLabel={copy.action}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
