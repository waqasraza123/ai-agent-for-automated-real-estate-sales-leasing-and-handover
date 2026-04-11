"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createWebsiteLeadInputSchema,
  qualifyCaseInputSchema,
  scheduleVisitInputSchema,
  supportedLocaleSchema,
  updateDocumentRequestInputSchema
} from "@real-estate-ai/contracts";

import { initialFormActionState, type FormActionState } from "@/lib/form-action-state";
import { WebApiError, createWebsiteLead, qualifyCase, scheduleVisit, updateDocumentRequest } from "@/lib/live-api";

export async function saveQualificationAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  const locale = getLocale(formData.get("locale"));
  const caseId = formData.get("caseId");
  const returnPath = formData.get("returnPath");

  if (typeof caseId !== "string" || typeof returnPath !== "string") {
    return getLocalizedError(locale);
  }

  const result = qualifyCaseInputSchema.safeParse({
    budgetBand: formData.get("budgetBand"),
    intentSummary: formData.get("intentSummary"),
    moveInTimeline: formData.get("moveInTimeline"),
    readiness: formData.get("readiness")
  });

  if (!result.success) {
    return {
      message: getValidationMessage(locale),
      status: "error"
    };
  }

  try {
    await qualifyCase(caseId, result.data);
    revalidatePath(returnPath);
    revalidatePath(`/${locale}/leads`);
    revalidatePath(`/${locale}/manager`);

    return {
      message: locale === "ar" ? "تم حفظ التأهيل وتحديث الحالة." : "Qualification saved and the case has been updated.",
      status: "success"
    };
  } catch (error) {
    return getActionError(locale, error);
  }
}

export async function scheduleVisitAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  const locale = getLocale(formData.get("locale"));
  const caseId = formData.get("caseId");
  const returnPath = formData.get("returnPath");
  const scheduledAt = formData.get("scheduledAt");

  if (typeof caseId !== "string" || typeof returnPath !== "string" || typeof scheduledAt !== "string") {
    return getLocalizedError(locale);
  }

  const result = scheduleVisitInputSchema.safeParse({
    location: formData.get("location"),
    scheduledAt: toIsoDateTimeOrEmpty(scheduledAt)
  });

  if (!result.success) {
    return {
      message: getValidationMessage(locale),
      status: "error"
    };
  }

  try {
    await scheduleVisit(caseId, result.data);
    revalidatePath(returnPath);
    revalidatePath(`/${locale}/leads`);
    revalidatePath(`/${locale}/manager`);

    return {
      message: locale === "ar" ? "تم حفظ موعد الزيارة." : "The visit was scheduled successfully.",
      status: "success"
    };
  } catch (error) {
    return getActionError(locale, error);
  }
}

export async function submitWebsiteLeadAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  const locale = getLocale(formData.get("locale"));

  const result = createWebsiteLeadInputSchema.safeParse({
    budget: normalizeOptionalString(formData.get("budget")),
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    message: formData.get("message"),
    phone: normalizeOptionalString(formData.get("phone")),
    preferredLocale: formData.get("preferredLocale"),
    projectInterest: formData.get("projectInterest")
  });

  if (!result.success) {
    return {
      message: getValidationMessage(locale),
      status: "error"
    };
  }

  try {
    const createdCase = await createWebsiteLead(result.data);
    revalidatePath(`/${locale}/leads`);
    revalidatePath(`/${locale}/manager`);
    redirect(`/${locale}/leads/${createdCase.caseId}`);
  } catch (error) {
    return getActionError(locale, error);
  }
}

export async function updateDocumentStatusAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  const locale = getLocale(formData.get("locale"));
  const caseId = formData.get("caseId");
  const documentRequestId = formData.get("documentRequestId");
  const returnPath = formData.get("returnPath");

  if (typeof caseId !== "string" || typeof documentRequestId !== "string" || typeof returnPath !== "string") {
    return getLocalizedError(locale);
  }

  const result = updateDocumentRequestInputSchema.safeParse({
    status: formData.get("status")
  });

  if (!result.success) {
    return {
      message: getValidationMessage(locale),
      status: "error"
    };
  }

  try {
    await updateDocumentRequest(caseId, documentRequestId, result.data);
    revalidatePath(returnPath);
    revalidatePath(`/${locale}/leads`);
    revalidatePath(`/${locale}/manager`);

    return {
      message: locale === "ar" ? "تم تحديث حالة المستند." : "The document state was updated.",
      status: "success"
    };
  } catch (error) {
    return getActionError(locale, error);
  }
}

function getActionError(locale: "en" | "ar", error: unknown): FormActionState {
  if (error instanceof WebApiError && error.status >= 500) {
    return {
      message:
        locale === "ar"
          ? "خدمة الواجهة الحية غير متاحة حالياً. شغّل apps/api ثم أعد المحاولة."
          : "The live alpha API is not available right now. Start apps/api and try again.",
      status: "error"
    };
  }

  return getLocalizedError(locale);
}

function getLocalizedError(locale: "en" | "ar"): FormActionState {
  return {
    message:
      locale === "ar"
        ? "تعذر إكمال العملية الحالية. تحقق من تشغيل الخدمات المحلية ثم أعد المحاولة."
        : "The current action could not be completed. Check the local services and try again.",
    status: "error"
  };
}

function getLocale(value: FormDataEntryValue | null) {
  const result = supportedLocaleSchema.safeParse(value);

  return result.success ? result.data : "en";
}

function getValidationMessage(locale: "en" | "ar") {
  return locale === "ar"
    ? "راجع الحقول المطلوبة ثم أعد الإرسال."
    : "Review the required fields and submit the form again.";
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function toIsoDateTimeOrEmpty(value: string) {
  const normalizedDate = new Date(value);

  return Number.isNaN(normalizedDate.getTime()) ? "" : normalizedDate.toISOString();
}

export { initialFormActionState };
