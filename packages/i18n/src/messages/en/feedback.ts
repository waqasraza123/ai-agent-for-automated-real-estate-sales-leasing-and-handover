import type { ActionMessagesSection, ErrorsSection, FormsSection, ValidationSection } from "../types";

export const enValidation: ValidationSection = {
  generic: "Review the required fields and submit the form again."
};

export const enErrors: ErrorsSection = {
  genericAction: "The current action could not be completed. Check the local services and try again.",
  liveServicesUnavailable: "The live alpha services are not available right now. Start apps/api and apps/worker, then try again.",
  localRoleRequired: "This action requires an eligible role in local control mode."
};

export const enForms: FormsSection = {
  pendingCreate: "Creating...",
  pendingSave: "Saving...",
  pendingSend: "Sending...",
  pendingUpdate: "Updating...",
  pendingStart: "Starting...",
  pendingComplete: "Completing...",
  pendingApprove: "Approving...",
  pendingPrepare: "Preparing...",
  pendingSchedule: "Saving appointment...",
  updateAction: "Update",
  alreadyStarted: "Already started",
  alreadyCompleted: "Completed",
  waitingForScheduling: "Waiting for scheduling",
  waitingForExecution: "Waiting for execution",
  leadCapture: {
    customerNamePlaceholder: "Maha Al-Qahtani",
    emailPlaceholder: "maha@example.com",
    phonePlaceholder: "+966 5X XXX XXXX",
    projectInterestPlaceholder: "Sunrise Residences",
    budgetPlaceholder: "SAR 1.8M to 2.1M",
    messagePlaceholder: "Serious buyer looking for a three-bedroom apartment and prefers a weekend site visit.",
    preferredLanguageAr: "Arabic",
    preferredLanguageEn: "English"
  },
  visitScheduling: {
    locationPlaceholder: "Sunrise Residences Sales Pavilion"
  }
};

export const enActions: ActionMessagesSection = {
  qualificationSaved: "Qualification saved and the case has been updated.",
  visitScheduled: "The visit was scheduled successfully.",
  automationPaused: "Automation was paused for this case.",
  automationResumed: "Automation was resumed for this case.",
  documentUpdated: "The document state was updated.",
  handoverTaskUpdated: "The handover readiness item was updated.",
  handoverExecutionStarted: "The handover-day execution state was started on the live record.",
  handoverExecutionBlocked: "Execution cannot start until the handover is internally scheduled and all open blockers are cleared.",
  handoverCompleted: "The handover day was closed with a controlled completion summary.",
  handoverCompletionBlocked: "Handover completion requires an active execution state with no open blockers."
};
