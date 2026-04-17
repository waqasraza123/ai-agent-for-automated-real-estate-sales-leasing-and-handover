import type { AppMessages } from "./types";

import { arApp } from "./ar/app";
import { arCommon } from "./ar/common";
import { arActions, arErrors, arForms, arValidation } from "./ar/feedback";
import { arNavigation } from "./ar/navigation";
import { arStates } from "./ar/states";
import {
  arConversation,
  arDashboard,
  arDocuments,
  arHandover,
  arLanding,
  arLeads,
  arManager,
  arProfile,
  arQa,
  arSchedule
} from "./ar/workspaces";

export const arMessages: AppMessages = {
  app: arApp,
  navigation: arNavigation,
  landing: arLanding,
  dashboard: arDashboard,
  leads: arLeads,
  profile: arProfile,
  conversation: arConversation,
  schedule: arSchedule,
  documents: arDocuments,
  handover: arHandover,
  manager: arManager,
  qa: arQa,
  common: arCommon,
  roles: {
    sales_manager: "مدير المبيعات",
    handover_coordinator: "منسق التسليم",
    handover_manager: "مدير التسليم",
    qa_reviewer: "مراجع الجودة",
    admin: "المشرف"
  },
  states: arStates,
  validation: arValidation,
  errors: arErrors,
  forms: arForms,
  actions: arActions
};
