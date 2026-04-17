import type { AppMessages } from "./types";

import { enApp } from "./en/app";
import { enCommon } from "./en/common";
import { enActions, enErrors, enForms, enValidation } from "./en/feedback";
import { enNavigation } from "./en/navigation";
import { enStates } from "./en/states";
import {
  enConversation,
  enDashboard,
  enDocuments,
  enHandover,
  enLanding,
  enLeads,
  enManager,
  enProfile,
  enQa,
  enSchedule
} from "./en/workspaces";

export const enMessages: AppMessages = {
  app: enApp,
  navigation: enNavigation,
  landing: enLanding,
  dashboard: enDashboard,
  leads: enLeads,
  profile: enProfile,
  conversation: enConversation,
  schedule: enSchedule,
  documents: enDocuments,
  handover: enHandover,
  manager: enManager,
  qa: enQa,
  common: enCommon,
  roles: {
    sales_manager: "Sales manager",
    handover_coordinator: "Handover coordinator",
    handover_manager: "Handover manager",
    qa_reviewer: "QA reviewer",
    admin: "Admin"
  },
  states: enStates,
  validation: enValidation,
  errors: enErrors,
  forms: enForms,
  actions: enActions
};
