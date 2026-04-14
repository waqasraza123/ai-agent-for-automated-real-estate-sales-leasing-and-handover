"use client";

import { useActionState, useState } from "react";

import type { SupportedLocale } from "@real-estate-ai/contracts";
import { cx, StatusBadge } from "@real-estate-ai/ui";

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
    <form action={action} className="form-stack">
      <input name="expectedCurrentOwnerName" type="hidden" value={props.ownerName} />
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      {selectedCaseIds.map((caseId) => (
        <input key={caseId} name="caseIds" type="hidden" value={caseId} />
      ))}

      <div className="stack-tight">
        <p className="field-note">
          {props.locale === "ar"
            ? `طبّق خطة متابعة موحدة فقط على التسليمات المتصاعدة المحددة التي ما زالت مملوكة حالياً إلى ${props.ownerName}.`
            : `Apply one shared follow-up plan only to the selected escalated handoffs that are still currently owned by ${props.ownerName}.`}
        </p>
        <div className="status-row-wrap">
          <StatusBadge>{props.ownerName}</StatusBadge>
          <StatusBadge tone={selectedCaseIds.length > 0 ? "warning" : "success"}>
            {props.locale === "ar"
              ? `${selectedCaseIds.length} محددة من ${props.cases.length}`
              : `${selectedCaseIds.length} of ${props.cases.length} selected`}
          </StatusBadge>
        </div>
      </div>

      <div className="status-row-wrap">
        <button
          className="role-switcher-button"
          onClick={() => {
            setSelectedCaseIds(allSelected ? [] : props.cases.map((caseItem) => caseItem.caseId));
          }}
          type="button"
        >
          {allSelected
            ? props.locale === "ar"
              ? "مسح التحديد"
              : "Clear selection"
            : props.locale === "ar"
              ? "تحديد الكل"
              : "Select all visible"}
        </button>
      </div>

      <div className="bulk-follow-up-selection">
        {props.cases.map((caseItem) => {
          const checked = selectedCaseIds.includes(caseItem.caseId);

          return (
            <label
              key={caseItem.caseId}
              className={cx("bulk-follow-up-option", checked && "bulk-follow-up-option-selected")}
            >
              <input
                checked={checked}
                className="bulk-follow-up-checkbox"
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
              <div className="stack-tight">
                <div className="row-between">
                  <strong>{caseItem.customerName}</strong>
                  <span className="case-link-meta">{buildCaseReferenceCode(caseItem.caseId)}</span>
                </div>
                <p className="case-link-meta">{caseItem.nextAction}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="field-grid">
        <label className="field-stack field-span-full">
          <span>{copy.nextAction}</span>
          <textarea className="textarea-shell" disabled={!props.canManage} name="nextAction" required rows={4} />
        </label>
        <label className="field-stack">
          <span>{copy.nextActionDueAt}</span>
          <input className="input-shell" disabled={!props.canManage} name="nextActionDueAt" required type="datetime-local" />
        </label>
        <label className="field-stack">
          <span>{copy.ownerName}</span>
          <input className="input-shell" defaultValue={props.ownerName} disabled={!props.canManage} name="ownerName" type="text" />
        </label>
      </div>

      <div className="form-actions-row">
        <FormSubmitButton
          disabled={submitDisabled}
          disabledLabel={submitDisabledLabel}
          idleLabel={props.locale === "ar" ? "حفظ على الحالات المحددة" : "Save across selected cases"}
          pendingLabel={props.locale === "ar" ? "جارٍ حفظ الإجراء الجماعي..." : "Saving bulk action..."}
        />
        <p className={cx("form-feedback", state.status === "error" && "form-feedback-error", state.status === "success" && "form-feedback-success")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
