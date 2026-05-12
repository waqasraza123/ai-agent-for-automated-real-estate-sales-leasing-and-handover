"use client";

import { useActionState } from "react";

import type { CommercialFactKind, CommercialFactProposal, CommercialSourceType, SupportedLocale } from "@real-estate-ai/contracts";
import {
  Select,
  TextArea,
  TextInput,
  cx,
  fieldGridClassName,
  fieldLabelClassName,
  fieldSpanFullClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName
} from "@real-estate-ai/ui";

import {
  approveCommercialFactProposalAction,
  createCommercialSourceAction,
  createManualCommercialFactAction,
  importCommercialInventoryAction,
  initialFormActionState,
  rejectCommercialFactProposalAction
} from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

export function CommercialSourceCreateForm(props: {
  canManage: boolean;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const [state, action] = useActionState(createCommercialSourceAction, initialFormActionState);
  const sourceTypes: CommercialSourceType[] = ["inventory_csv", "sales_sheet", "policy_pack", "manual_entry", "compliance_reference"];

  return (
    <form action={action} className={formStackClassName}>
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "رمز المشروع" : "Project code"}</span>
          <TextInput disabled={!props.canManage} name="projectCode" required />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "اسم المصدر" : "Source name"}</span>
          <TextInput disabled={!props.canManage} name="sourceName" required />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "نوع المصدر" : "Source type"}</span>
          <Select disabled={!props.canManage} name="sourceType" required>
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "وصف مختصر" : "Short description"}</span>
          <TextArea disabled={!props.canManage} name="description" rows={3} />
        </label>
      </div>
      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.locale === "ar" ? "يتطلب صلاحية المدير" : "Manager permission required"}
          idleLabel={props.locale === "ar" ? "إنشاء المصدر" : "Create source"}
          pendingLabel={props.locale === "ar" ? "جارٍ الإنشاء..." : "Creating..."}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}

export function InventoryImportForm(props: {
  canManage: boolean;
  locale: SupportedLocale;
  returnPath: string;
  sourceId: string;
}) {
  const [state, action] = useActionState(importCommercialInventoryAction, initialFormActionState);

  return (
    <form action={action} className={formStackClassName}>
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <input name="sourceId" type="hidden" value={props.sourceId} />
      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "اسم المستورد" : "Imported by"}</span>
          <TextInput disabled={!props.canManage} name="importedByName" />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "وسم النسخة" : "Version label"}</span>
          <TextInput disabled={!props.canManage} name="sourceLabel" />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "CSV المخزون" : "Inventory CSV"}</span>
          <TextArea
            disabled={!props.canManage}
            name="csvText"
            placeholder="projectCode,unitCode,unitType,bedrooms,areaSqm,floor,view,priceSar,availabilityStatus,paymentPlanCode,handoverDate,sourceUpdatedAt"
            required
            rows={8}
          />
        </label>
      </div>
      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          disabledLabel={props.locale === "ar" ? "يتطلب صلاحية المدير" : "Manager permission required"}
          idleLabel={props.locale === "ar" ? "استيراد المخزون" : "Import inventory"}
          pendingLabel={props.locale === "ar" ? "جارٍ الاستيراد..." : "Importing..."}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}

export function ProposalDecisionForms(props: {
  canManage: boolean;
  locale: SupportedLocale;
  proposal: CommercialFactProposal;
  returnPath: string;
}) {
  const [approveState, approveAction] = useActionState(approveCommercialFactProposalAction, initialFormActionState);
  const [rejectState, rejectAction] = useActionState(rejectCommercialFactProposalAction, initialFormActionState);

  if (props.proposal.state !== "pending_review") {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form action={approveAction} className={formStackClassName}>
        <input name="locale" type="hidden" value={props.locale} />
        <input name="proposalId" type="hidden" value={props.proposal.proposalId} />
        <input name="returnPath" type="hidden" value={props.returnPath} />
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "اعتمد بواسطة" : "Approved by"}</span>
          <TextInput disabled={!props.canManage} name="approvedByName" />
        </label>
        <div className={formActionsRowClassName}>
          <FormSubmitButton
            disabled={!props.canManage}
            idleLabel={props.locale === "ar" ? "اعتماد" : "Approve"}
            pendingLabel={props.locale === "ar" ? "جارٍ الاعتماد..." : "Approving..."}
          />
          <p className={formFeedbackClassName(approveState.status)}>{approveState.message}</p>
        </div>
      </form>
      <form action={rejectAction} className={formStackClassName}>
        <input name="locale" type="hidden" value={props.locale} />
        <input name="proposalId" type="hidden" value={props.proposal.proposalId} />
        <input name="returnPath" type="hidden" value={props.returnPath} />
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "سبب الرفض" : "Rejection reason"}</span>
          <TextInput disabled={!props.canManage} name="rejectionReason" required />
        </label>
        <div className={formActionsRowClassName}>
          <FormSubmitButton
            disabled={!props.canManage}
            idleLabel={props.locale === "ar" ? "رفض" : "Reject"}
            pendingLabel={props.locale === "ar" ? "جارٍ الرفض..." : "Rejecting..."}
          />
          <p className={formFeedbackClassName(rejectState.status)}>{rejectState.message}</p>
        </div>
      </form>
    </div>
  );
}

export function ManualCommercialFactForm(props: {
  canManage: boolean;
  locale: SupportedLocale;
  returnPath: string;
}) {
  const [state, action] = useActionState(createManualCommercialFactAction, initialFormActionState);
  const factKinds: CommercialFactKind[] = ["policy", "document_requirement", "fees", "visit_terms"];

  return (
    <form action={action} className={formStackClassName}>
      <input name="locale" type="hidden" value={props.locale} />
      <input name="returnPath" type="hidden" value={props.returnPath} />
      <div className={fieldGridClassName}>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "رمز المشروع" : "Project code"}</span>
          <TextInput disabled={!props.canManage} name="projectCode" required />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "اللغة" : "Locale"}</span>
          <Select defaultValue={props.locale} disabled={!props.canManage} name="factLocale">
            <option value="ar">ar</option>
            <option value="en">en</option>
          </Select>
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "النوع" : "Kind"}</span>
          <Select disabled={!props.canManage} name="kind">
            {factKinds.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </Select>
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "العنوان" : "Title"}</span>
          <TextInput disabled={!props.canManage} name="title" required />
        </label>
        <label className={fieldStackClassName}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "دليل المصدر" : "Evidence label"}</span>
          <TextInput disabled={!props.canManage} name="evidenceLabel" required />
        </label>
        <label className={cx(fieldStackClassName, fieldSpanFullClassName)}>
          <span className={fieldLabelClassName}>{props.locale === "ar" ? "المحتوى المعتمد" : "Approved content"}</span>
          <TextArea disabled={!props.canManage} name="content" required rows={4} />
        </label>
      </div>
      <div className={formActionsRowClassName}>
        <FormSubmitButton
          disabled={!props.canManage}
          idleLabel={props.locale === "ar" ? "إضافة حقيقة" : "Add fact"}
          pendingLabel={props.locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>
    </form>
  );
}
