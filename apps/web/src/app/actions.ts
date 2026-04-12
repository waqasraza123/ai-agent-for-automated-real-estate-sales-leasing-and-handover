"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createWebsiteLeadInputSchema,
  manageCaseFollowUpInputSchema,
  qualifyCaseInputSchema,
  scheduleVisitInputSchema,
  supportedLocaleSchema,
  updateAutomationStatusInputSchema,
  updateDocumentRequestInputSchema
} from "@real-estate-ai/contracts";

import { initialFormActionState, type FormActionState } from "@/lib/form-action-state";
import {
  WebApiError,
  createWebsiteLead,
  manageCaseFollowUp,
  qualifyCase,
  scheduleVisit,
  updateAutomationStatus,
  updateDocumentRequest
} from "@/lib/live-api";

export async function saveManagerFollowUpAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  const locale = getLocale(formData.get("locale"));
  const caseId = formData.get("caseId");
  const returnPath = formData.get("returnPath");
  const nextActionDueAt = formData.get("nextActionDueAt");

  if (typeof caseId !== "string" || typeof returnPath !== "string" || typeof nextActionDueAt !== "string") {
    return getLocalizedError(locale);
  }

  const result = manageCaseFollowUpInputSchema.safeParse({
    nextAction: formData.get("nextAction"),
    nextActionDueAt: toIsoDateTimeOrEmpty(nextActionDueAt),
    ownerName: normalizeOptionalString(formData.get("ownerName"))
  });

  if (!result.success) {
    return {
      message: getValidationMessage(locale),
      status: "error"
    };
  }

  try {
    await manageCaseFollowUp(caseId, result.data);
    revalidatePaths(locale, returnPath, caseId);

    return {
      message:
        locale === "ar"
          ? "تم تحديث خطة المتابعة وإزالة التدخل المفتوح."
          : "The follow-up plan was updated and the open intervention was cleared.",
      status: "success"
    };
  } catch (error) {
    return getActionError(locale, error);
  }
}

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
    revalidatePaths(locale, returnPath, caseId);

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
    revalidatePaths(locale, returnPath, caseId);

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

export async function updateAutomationStatusAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  const locale = getLocale(formData.get("locale"));
  const caseId = formData.get("caseId");
  const returnPath = formData.get("returnPath");

  if (typeof caseId !== "string" || typeof returnPath !== "string") {
    return getLocalizedError(locale);
  }

  const result = updateAutomationStatusInputSchema.safeParse({
    status: formData.get("status")
  });

  if (!result.success) {
    return {
      message: getValidationMessage(locale),
      status: "error"
    };
  }

  try {
    await updateAutomationStatus(caseId, result.data);
    revalidatePaths(locale, returnPath, caseId);

    return {
      message:
        locale === "ar"
          ? result.data.status === "paused"
            ? "تم إيقاف الأتمتة لهذه الحالة."
            : "تمت إعادة تشغيل الأتمتة لهذه الحالة."
          : result.data.status === "paused"
            ? "Automation was paused for this case."
            : "Automation was resumed for this case.",
      status: "success"
    };
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
    revalidatePaths(locale, returnPath, caseId);

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
          ? "خدمة الواجهة الحية غير متاحة حالياً. شغّل apps/api وapps/worker ثم أعد المحاولة."
          : "The live alpha services are not available right now. Start apps/api and apps/worker, then try again.",
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

function revalidatePaths(locale: "en" | "ar", returnPath: string, caseId: string) {
  revalidatePath(returnPath);
  revalidatePath(`/${locale}/leads`);
  revalidatePath(`/${locale}/leads/${caseId}`);
  revalidatePath(`/${locale}/manager`);
}

function toIsoDateTimeOrEmpty(value: string) {
  const normalizedDate = new Date(value);

  return Number.isNaN(normalizedDate.getTime()) ? "" : normalizedDate.toISOString();
}

export { initialFormActionState };
