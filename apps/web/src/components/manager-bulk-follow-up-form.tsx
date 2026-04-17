"use client";

import { useActionState, useState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import {
  Button,
  cardBaseClassName,
  caseMetaClassName,
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  fieldNoteClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  rowBetweenClassName,
  StatusBadge,
  statusRowWrapClassName,
  TextArea,
  TextInput
} from "@real-estate-ai/ui";

import { initialFormActionState, saveBulkManagerFollowUpAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getFollowUpManagerCopy } from "@/lib/live-copy";
import { buildCaseReferenceCode } from "@/lib/persisted-case-presenters";

interface BulkFollowUpCaseOption {
  caseId: string;
  customerName: string;
  nextAction: string;
}

export function ManagerBulkFollowUpForm(props: {
  canManage: boolean;
  cases: BulkFollowUpCaseOption[];
  disabledLabel: string;
  locale: SupportedLocale;
  ownerName: string;
  returnPath: string;
}) {
  const copy = getFollowUpManagerCopy(props.locale);
  const [state, action] = useActionState(saveBulkManagerFollowUpAction, initialFormActionState);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);

  const allSelected = selectedCaseIds.length === props.cases.length;
  const submitDisabled = !props.canManage || selectedCaseIds.length === 0;
  const submitDisabledLabel = !props.canManage
    ? props.disabledLabel
    : props.locale === "ar"
      ? "اختر حالة واحدة على الأقل"
      : "Select at least one case";

  return (
    <form action={action} className={formStackClassName}>
      <input name="expectedCurrentOwnerName" type="hidden" value={props.ownerName} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      {selectedCaseIds.map((caseId) => (
        <input key={caseId} name="caseIds" type="hidden" value={caseId} />
      ))}

      <div className="flex flex-col gap-1.5">
        <p className={fieldNoteClassName}>
          {props.locale === "ar"
            ? `طبّق خطة متابعة موحدة فقط على التسليمات المتصاعدة المحددة التي ما زالت مملوكة حالياً إلى ${props.ownerName}.`
            : `Apply one shared follow-up plan only to the selected escalated handoffs that are still currently owned by ${props.ownerName}.`}
        </p>
        <div className={statusRowWrapClassName}>
          <StatusBadge>{props.ownerName}</StatusBadge>
          <StatusBadge tone={selectedCaseIds.length > 0 ? "warning" : "success"}>
            {props.locale === "ar"
              ? `${selectedCaseIds.length} محددة من ${props.cases.length}`
              : `${selectedCaseIds.length} of ${props.cases.length} selected`}
          </StatusBadge>
        </div>
      </div>

      <div className={statusRowWrapClassName}>
        <Button
          className="min-h-10"
          onClick={() => {
            setSelectedCaseIds(allSelected ? [] : props.cases.map((caseItem) => caseItem.caseId));
          }}
          tone="ghost"
          type="button"
        >
          {allSelected
            ? props.locale === "ar"
              ? "مسح التحديد"
              : "Clear selection"
            : props.locale === "ar"
              ? "تحديد الكل"
              : "Select all visible"}
        </Button>
      </div>

      <div className="grid gap-3">
        {props.cases.map((caseItem) => {
          const checked = selectedCaseIds.includes(caseItem.caseId);

          return (
            <label
              key={caseItem.caseId}
              className={cx(
                cardBaseClassName,
                "cursor-pointer p-4 sm:p-5",
                checked && "border-brand-200 bg-brand-50/70 shadow-brand-glow"
              )}
            >
              <input
                checked={checked}
                className="mt-1 h-4 w-4 rounded border-canvas-line/80 text-brand-600 focus:ring-brand-300"
                disabled={!props.canManage}
                onChange={(event) => {
                  setSelectedCaseIds((currentValue) =>
                    event.target.checked
                      ? [...currentValue, caseItem.caseId]
                      : currentValue.filter((currentCaseId) => currentCaseId !== caseItem.caseId)
                  );
                }}
                type="checkbox"
              />
              <div className="ms-4 flex flex-col gap-1.5">
                <div className={rowBetweenClassName}>
                  <strong>{caseItem.customerName}</strong>
                  <span className={caseMetaClassName}>{buildCaseReferenceCode(caseItem.caseId)}</span>
                </div>
                <p className={caseMetaClassName}>{caseItem.nextAction}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className={fieldGridClassName}>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{copy.nextAction}</span>
          <TextArea disabled={!props.canManage} name="nextAction" required rows={4} />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.nextActionDueAt}</span>
          <TextInput disabled={!props.canManage} name="nextActionDueAt" required type="datetime-local" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{copy.ownerName}</span>
          <TextInput defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
      </div>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={submitDisabled}
          disabledLabel={submitDisabledLabel}
          idleLabel={props.locale === "ar" ? "حفظ على الحالات المحددة" : "Save across selected cases"}
          pendingLabel={props.locale === "ar" ? "جارٍ حفظ الإجراء الجماعي..." : "Saving bulk action..."}
        />
        <p className={formFeedbackClassName(state.status)}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
