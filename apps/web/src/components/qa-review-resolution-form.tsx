"use client";

import { useActionState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
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

import { initialFormActionState, resolveCaseQaReviewAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getQaReviewResolutionCopy } from "@/lib/live-copy";

export function QaReviewResolutionForm(props: {
  canManage: boolean;
  caseId: string;
  currentStatus: "pending_review" | "approved" | "follow_up_required";
  defaultReviewerName: string;
  disabledLabel: string;
  locale: SupportedLocale;
  qaReviewId: string;
  returnPath: string;
}) {
  const copy = getQaReviewResolutionCopy(props.locale);
  const [state, action] = useActionState(resolveCaseQaReviewAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="qaReviewId" type="hidden" value={props.qaReviewId} />
      <input name="returnPath" type="hidden" value={props.returnPath} />

      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.reviewerName}</span>
          <TextInput
            defaultValue={props.defaultReviewerName}
            disabled={!props.canManage}
            name="reviewerName"
            type="text"
          />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "القرار" : "Decision"}</span>
          <Select defaultValue="approved" disabled={!props.canManage} name="status">
            <option value="approved">{copy.approved}</option>
            <option value="follow_up_required">{copy.followUpRequired}</option>
          </Select>
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.reviewSummary}</span>
          <TextArea
            defaultValue={props.currentStatus === "pending_review" ? "" : undefined}
            disabled={!props.canManage}
            name="reviewSummary"
            required
            rows={4}
          />
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
