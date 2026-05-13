"use client";

import { useActionState } from "react";

import type { CaseReplyGroundingPreview, SupportedLocale } from "@real-estate-ai/contracts";
import {
  DetailGrid,
  DetailItem,
  StatusBadge,
  TextArea,
  caseMetaClassName,
  cx,
  fieldLabelClassName,
  fieldStackClassName,
  formActionsRowClassName,
  formFeedbackClassName,
  formStackClassName,
  statusRowWrapClassName
} from "@real-estate-ai/ui";

import { initialFormActionState } from "@/app/actions";
import { previewCaseReplyGroundingAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

interface GroundingPreviewState {
  message: string | null;
  preview: CaseReplyGroundingPreview | null;
  status: "idle" | "error" | "success";
}

const initialGroundingPreviewState: GroundingPreviewState = {
  ...initialFormActionState,
  preview: null
};

export function CaseReplyGroundingPreviewForm(props: {
  caseId: string;
  defaultDraftMessage?: string | null;
  locale: SupportedLocale;
}) {
  const [state, action] = useActionState(previewCaseReplyGroundingAction, initialGroundingPreviewState);
  const preview = state.preview;

  return (
    <form action={action} className={formStackClassName}>
      <input name="caseId" type="hidden" value={props.caseId} />
      <input name="locale" type="hidden" value={props.locale} />

      <label className={fieldStackClassName}>
        <span className={fieldLabelClassName}>
          {props.locale === "ar" ? "مسودة الرد المراد فحصها" : "Reply draft to inspect"}
        </span>
        <TextArea
          defaultValue={preview?.draftMessage ?? props.defaultDraftMessage ?? ""}
          name="draftMessage"
          placeholder={
            props.locale === "ar"
              ? "اكتب الرد المقترح هنا لمعاينة الحقائق التجارية المعتمدة التي ستدعمه."
              : "Paste the proposed reply here to preview which approved commercial facts support it."
          }
          required
          rows={5}
        />
      </label>

      <div className={formActionsRowClassName}>
        <FormSubmitButton
          idleLabel={props.locale === "ar" ? "معاينة الأدلة" : "Preview evidence"}
          pendingLabel={props.locale === "ar" ? "جارٍ الفحص..." : "Checking..."}
        />
        <p className={formFeedbackClassName(state.status)}>{state.message}</p>
      </div>

      {preview ? <GroundingPreviewResult locale={props.locale} preview={preview} /> : null}
    </form>
  );
}

function GroundingPreviewResult(props: {
  locale: SupportedLocale;
  preview: CaseReplyGroundingPreview;
}) {
  const statusTone = props.preview.status === "grounded" ? "success" : props.preview.status === "missing_required_evidence" ? "critical" : "neutral";

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-canvas-line/70 bg-white/70 p-4">
      <div className={statusRowWrapClassName}>
        <StatusBadge tone={statusTone}>
          {formatGroundingStatus(props.preview.status, props.locale)}
        </StatusBadge>
        {props.preview.requiredKinds.map((kind) => (
          <StatusBadge key={kind}>{kind}</StatusBadge>
        ))}
      </div>

      {props.preview.warnings.length > 0 ? (
        <div className="grid gap-1">
          {props.preview.warnings.map((warning) => (
            <p key={warning} className={cx(caseMetaClassName, "text-danger-700")}>
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      {props.preview.references.length > 0 ? (
        <div className="grid gap-3">
          {props.preview.references.map((reference) => (
            <div key={reference.factId} className="rounded-3xl border border-canvas-line/70 bg-white/72 p-4">
              <div className={statusRowWrapClassName}>
                <StatusBadge tone="success">{reference.kind}</StatusBadge>
                <StatusBadge>{reference.locale}</StatusBadge>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{reference.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{reference.content}</p>
              <DetailGrid className="mt-3">
                <DetailItem label={props.locale === "ar" ? "المصدر" : "Source"} value={reference.sourceLabel} />
                <DetailItem label={props.locale === "ar" ? "المرجع" : "Reference"} value={reference.sourceReference} />
                <DetailItem label={props.locale === "ar" ? "تنتهي" : "Expires"} value={reference.expiresAt ?? "-"} />
              </DetailGrid>
            </div>
          ))}
        </div>
      ) : (
        <p className={caseMetaClassName}>
          {props.locale === "ar"
            ? "لم تتطلب هذه المسودة دليلاً تجارياً معتمداً."
            : "This draft did not require an approved commercial evidence reference."}
        </p>
      )}
    </div>
  );
}

function formatGroundingStatus(status: CaseReplyGroundingPreview["status"], locale: SupportedLocale) {
  const labels: Record<SupportedLocale, Record<CaseReplyGroundingPreview["status"], string>> = {
    ar: {
      grounded: "مدعوم بأدلة",
      missing_required_evidence: "أدلة ناقصة",
      not_required: "لا يتطلب دليلاً"
    },
    en: {
      grounded: "Grounded",
      missing_required_evidence: "Missing evidence",
      not_required: "No evidence required"
    }
  };

  return labels[locale][status];
}
