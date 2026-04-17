import type { StatesSection } from "../types";

export const enStates: StatesSection = {
  loadingTitle: "Preparing the interface",
  loadingSummary: "Loading the Arabic-first application shell while keeping route transitions clear and stable.",
  errorTitle: "The page could not finish rendering",
  errorSummary: "The app frame is still intact, but this page needs another attempt before work can continue.",
  retry: "Try again",
  emptyAlertsTitle: "No alerts right now",
  emptyAlertsSummary: "Manager and QA signals will appear here as soon as the live or demo layer provides them.",
  emptyCasesTitle: "No cases available",
  emptyCasesSummary: "This route is ready for live pipeline visibility, but the current scope has no cases.",
  emptyMessagesTitle: "No messages yet",
  emptyMessagesSummary: "The conversation surface is ready, but this case does not currently include message history.",
  emptyDocumentsTitle: "No document blockers right now",
  emptyDocumentsSummary: "Document tracking will appear here as soon as required items are opened on the case.",
  emptyTimelineTitle: "No timeline events yet",
  emptyTimelineSummary: "Timeline context will appear here once seeded or persisted events arrive.",
  emptyMilestonesTitle: "No handover milestones right now",
  emptyMilestonesSummary: "The handover view is ready, but this record does not currently include active milestones."
};
