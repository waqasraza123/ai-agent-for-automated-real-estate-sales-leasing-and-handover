import { randomUUID } from "node:crypto";

import { PGlite } from "@electric-sql/pglite";
import type {
  AutomationStatus,
  CaseStage,
  CreateWebsiteLeadInput,
  CreateWebsiteLeadResult,
  DocumentRequestStatus,
  DocumentRequestType,
  FollowUpStatus,
  ManageCaseFollowUpInput,
  ManagerInterventionSeverity,
  ManagerInterventionStatus,
  ManagerInterventionType,
  PersistedCaseDetail,
  PersistedCaseSummary,
  PersistedDocumentRequest,
  PersistedManagerIntervention,
  QualifyCaseInput,
  QualificationReadiness,
  ScheduleVisitInput,
  SupportedLocale
} from "@real-estate-ai/contracts";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const defaultOwnerName = "Revenue Ops Queue";
const defaultDocumentTypes: DocumentRequestType[] = ["government_id", "proof_of_funds", "employment_letter"];
const followUpWatchJobType = "follow_up_watch";

const leads = pgTable("leads", {
  budget: text("budget"),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  id: uuid("id").primaryKey(),
  message: text("message").notNull(),
  phone: text("phone"),
  preferredLocale: text("preferred_locale").notNull(),
  projectInterest: text("project_interest").notNull(),
  source: text("source").notNull()
});

const cases = pgTable("cases", {
  automationStatus: text("automation_status").notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  currentNextAction: text("current_next_action").notNull(),
  id: uuid("id").primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, {
      onDelete: "cascade"
    }),
  nextActionDueAt: timestamp("next_action_due_at", {
    mode: "string",
    withTimezone: true
  }).notNull(),
  ownerName: text("owner_name").notNull(),
  stage: text("stage").notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull()
});

const qualificationSnapshots = pgTable("qualification_snapshots", {
  budgetBand: text("budget_band").notNull(),
  caseId: uuid("case_id")
    .notNull()
    .unique()
    .references(() => cases.id, {
      onDelete: "cascade"
    }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  id: uuid("id").primaryKey(),
  intentSummary: text("intent_summary").notNull(),
  moveInTimeline: text("move_in_timeline").notNull(),
  readiness: text("readiness").notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull()
});

const visits = pgTable("visits", {
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, {
      onDelete: "cascade"
    }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  id: uuid("id").primaryKey(),
  location: text("location").notNull(),
  scheduledAt: timestamp("scheduled_at", {
    mode: "string",
    withTimezone: true
  }).notNull()
});

const documentRequests = pgTable("document_requests", {
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, {
      onDelete: "cascade"
    }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  id: uuid("id").primaryKey(),
  status: text("status").notNull(),
  type: text("type").notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull()
});

const managerInterventions = pgTable("manager_interventions", {
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, {
      onDelete: "cascade"
    }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  id: uuid("id").primaryKey(),
  resolutionNote: text("resolution_note"),
  resolvedAt: timestamp("resolved_at", {
    mode: "string",
    withTimezone: true
  }),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  summary: text("summary").notNull(),
  type: text("type").notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull()
});

const automationJobs = pgTable("automation_jobs", {
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, {
      onDelete: "cascade"
    }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  id: uuid("id").primaryKey(),
  jobType: text("job_type").notNull(),
  runAfter: timestamp("run_after", {
    mode: "string",
    withTimezone: true
  }).notNull(),
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull()
});

const auditEvents = pgTable("audit_events", {
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, {
      onDelete: "cascade"
    }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).defaultNow().notNull(),
  eventType: text("event_type").notNull(),
  id: uuid("id").primaryKey(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull()
});

export interface FollowUpCycleResult {
  openedInterventions: number;
  processedJobs: number;
  touchedCaseIds: string[];
}

export interface LeadCaptureStore {
  applyQualification(
    caseId: string,
    input: QualifyCaseInput & {
      nextAction: string;
      nextActionDueAt: string;
    }
  ): Promise<PersistedCaseDetail | null>;
  close(): Promise<void>;
  createWebsiteLeadCase(input: CreateWebsiteLeadInput & {
    nextAction: string;
    nextActionDueAt: string;
  }): Promise<CreateWebsiteLeadResult>;
  getCaseDetail(caseId: string): Promise<PersistedCaseDetail | null>;
  listCases(): Promise<PersistedCaseSummary[]>;
  manageCaseFollowUp(caseId: string, input: ManageCaseFollowUpInput): Promise<PersistedCaseDetail | null>;
  runDueFollowUpCycle(input: {
    limit: number;
    runAt: string;
  }): Promise<FollowUpCycleResult>;
  scheduleVisit(
    caseId: string,
    input: ScheduleVisitInput & {
      nextAction: string;
      nextActionDueAt: string;
    }
  ): Promise<PersistedCaseDetail | null>;
  setAutomationStatus(
    caseId: string,
    input: {
      status: AutomationStatus;
    }
  ): Promise<PersistedCaseDetail | null>;
  updateDocumentRequestStatus(
    caseId: string,
    documentRequestId: string,
    input: {
      nextAction: string;
      nextActionDueAt: string;
      status: DocumentRequestStatus;
    }
  ): Promise<PersistedCaseDetail | null>;
}

export async function createAlphaLeadCaptureStore(options?: {
  dataPath?: string;
  inMemory?: boolean;
}): Promise<LeadCaptureStore> {
  const client = options?.inMemory ? new PGlite() : new PGlite(options?.dataPath ?? ".data/phase2-alpha");
  const db = drizzle(client, {
    schema: {
      auditEvents,
      automationJobs,
      cases,
      documentRequests,
      leads,
      managerInterventions,
      qualificationSnapshots,
      visits
    }
  });

  await client.exec(`
    create table if not exists leads (
      id uuid primary key,
      source text not null,
      customer_name text not null,
      email text not null,
      phone text,
      preferred_locale text not null,
      project_interest text not null,
      budget text,
      message text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists cases (
      id uuid primary key,
      lead_id uuid not null unique references leads(id) on delete cascade,
      stage text not null,
      owner_name text not null,
      current_next_action text not null,
      next_action_due_at timestamptz not null,
      automation_status text not null default 'active',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    alter table cases add column if not exists automation_status text not null default 'active';

    create table if not exists qualification_snapshots (
      id uuid primary key,
      case_id uuid not null unique references cases(id) on delete cascade,
      budget_band text not null,
      move_in_timeline text not null,
      intent_summary text not null,
      readiness text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists visits (
      id uuid primary key,
      case_id uuid not null references cases(id) on delete cascade,
      location text not null,
      scheduled_at timestamptz not null,
      created_at timestamptz not null default now()
    );

    create table if not exists document_requests (
      id uuid primary key,
      case_id uuid not null references cases(id) on delete cascade,
      type text not null,
      status text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists manager_interventions (
      id uuid primary key,
      case_id uuid not null references cases(id) on delete cascade,
      type text not null,
      severity text not null,
      status text not null,
      summary text not null,
      resolution_note text,
      resolved_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists automation_jobs (
      id uuid primary key,
      case_id uuid not null references cases(id) on delete cascade,
      job_type text not null,
      run_after timestamptz not null,
      status text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists audit_events (
      id uuid primary key,
      case_id uuid not null references cases(id) on delete cascade,
      event_type text not null,
      payload jsonb not null,
      created_at timestamptz not null default now()
    );

    create index if not exists cases_created_at_idx on cases (created_at desc);
    create index if not exists visits_case_id_idx on visits (case_id, scheduled_at desc);
    create index if not exists document_requests_case_id_idx on document_requests (case_id, created_at asc);
    create index if not exists audit_events_case_id_idx on audit_events (case_id, created_at asc);
    create index if not exists manager_interventions_case_id_idx on manager_interventions (case_id, created_at desc);
    create index if not exists manager_interventions_open_case_idx on manager_interventions (case_id, status);
    create index if not exists automation_jobs_due_idx on automation_jobs (status, run_after asc);
  `);

  const getPersistedCaseDetail = async (caseId: string): Promise<PersistedCaseDetail | null> => {
    const persistedCase = await db
      .select({
        automationStatus: cases.automationStatus,
        budget: leads.budget,
        caseId: cases.id,
        createdAt: cases.createdAt,
        customerName: leads.customerName,
        email: leads.email,
        message: leads.message,
        nextAction: cases.currentNextAction,
        nextActionDueAt: cases.nextActionDueAt,
        ownerName: cases.ownerName,
        phone: leads.phone,
        preferredLocale: leads.preferredLocale,
        projectInterest: leads.projectInterest,
        source: leads.source,
        stage: cases.stage,
        updatedAt: cases.updatedAt
      })
      .from(cases)
      .innerJoin(leads, eq(cases.leadId, leads.id))
      .where(eq(cases.id, caseId))
      .limit(1);

    const caseRecord = persistedCase[0];

    if (!caseRecord) {
      return null;
    }

    const [caseAuditEvents, qualificationRecord, currentVisit, persistedDocumentRequests, persistedInterventions] = await Promise.all([
      db
        .select({
          createdAt: auditEvents.createdAt,
          eventType: auditEvents.eventType,
          payload: auditEvents.payload
        })
        .from(auditEvents)
        .where(eq(auditEvents.caseId, caseId))
        .orderBy(asc(auditEvents.createdAt)),
      db
        .select({
          budgetBand: qualificationSnapshots.budgetBand,
          intentSummary: qualificationSnapshots.intentSummary,
          moveInTimeline: qualificationSnapshots.moveInTimeline,
          readiness: qualificationSnapshots.readiness,
          updatedAt: qualificationSnapshots.updatedAt
        })
        .from(qualificationSnapshots)
        .where(eq(qualificationSnapshots.caseId, caseId))
        .limit(1),
      db
        .select({
          createdAt: visits.createdAt,
          location: visits.location,
          scheduledAt: visits.scheduledAt,
          visitId: visits.id
        })
        .from(visits)
        .where(eq(visits.caseId, caseId))
        .orderBy(desc(visits.scheduledAt))
        .limit(1),
      db
        .select({
          createdAt: documentRequests.createdAt,
          documentRequestId: documentRequests.id,
          status: documentRequests.status,
          type: documentRequests.type,
          updatedAt: documentRequests.updatedAt
        })
        .from(documentRequests)
        .where(eq(documentRequests.caseId, caseId))
        .orderBy(asc(documentRequests.createdAt)),
      db
        .select({
          createdAt: managerInterventions.createdAt,
          interventionId: managerInterventions.id,
          resolutionNote: managerInterventions.resolutionNote,
          resolvedAt: managerInterventions.resolvedAt,
          severity: managerInterventions.severity,
          status: managerInterventions.status,
          summary: managerInterventions.summary,
          type: managerInterventions.type
        })
        .from(managerInterventions)
        .where(eq(managerInterventions.caseId, caseId))
        .orderBy(desc(managerInterventions.createdAt))
    ]);

    const hydratedInterventions = persistedInterventions.map((intervention) => hydrateManagerIntervention(intervention));
    const openInterventionsCount = hydratedInterventions.filter((intervention) => intervention.status === "open").length;

    return {
      auditEvents: caseAuditEvents.map((event) => ({
        createdAt: event.createdAt,
        eventType: event.eventType,
        payload: event.payload
      })),
      automationStatus: toAutomationStatus(caseRecord.automationStatus),
      budget: caseRecord.budget,
      caseId: caseRecord.caseId,
      createdAt: caseRecord.createdAt,
      currentVisit: currentVisit[0]
        ? {
            createdAt: currentVisit[0].createdAt,
            location: currentVisit[0].location,
            scheduledAt: currentVisit[0].scheduledAt,
            visitId: currentVisit[0].visitId
          }
        : null,
      customerName: caseRecord.customerName,
      documentRequests: persistedDocumentRequests.map((documentRequest) => ({
        createdAt: documentRequest.createdAt,
        documentRequestId: documentRequest.documentRequestId,
        status: toDocumentRequestStatus(documentRequest.status),
        type: toDocumentRequestType(documentRequest.type),
        updatedAt: documentRequest.updatedAt
      })),
      email: caseRecord.email,
      followUpStatus: toFollowUpStatus(caseRecord.nextActionDueAt),
      managerInterventions: hydratedInterventions,
      message: caseRecord.message,
      nextAction: caseRecord.nextAction,
      nextActionDueAt: caseRecord.nextActionDueAt,
      openInterventionsCount,
      ownerName: caseRecord.ownerName,
      phone: caseRecord.phone,
      preferredLocale: toSupportedLocale(caseRecord.preferredLocale),
      projectInterest: caseRecord.projectInterest,
      qualificationSnapshot: qualificationRecord[0]
        ? {
            budgetBand: qualificationRecord[0].budgetBand,
            intentSummary: qualificationRecord[0].intentSummary,
            moveInTimeline: qualificationRecord[0].moveInTimeline,
            readiness: toQualificationReadiness(qualificationRecord[0].readiness),
            updatedAt: qualificationRecord[0].updatedAt
          }
        : null,
      source: toLeadSource(caseRecord.source),
      stage: toCaseStage(caseRecord.stage),
      updatedAt: caseRecord.updatedAt
    };
  };

  const listOpenInterventionCounts = async (caseIds: string[]) => {
    if (caseIds.length === 0) {
      return new Map<string, number>();
    }

    const records = await db
      .select({
        caseId: managerInterventions.caseId
      })
      .from(managerInterventions)
      .where(and(inArray(managerInterventions.caseId, caseIds), eq(managerInterventions.status, "open")));

    return records.reduce((counts, record) => {
      counts.set(record.caseId, (counts.get(record.caseId) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
  };

  const resolveOpenInterventions = async (
    transaction: Parameters<Parameters<typeof db.transaction>[0]>[0],
    input: {
      caseId: string;
      resolutionNote: string;
      resolvedAt: string;
    }
  ) => {
    await transaction
      .update(managerInterventions)
      .set({
        resolutionNote: input.resolutionNote,
        resolvedAt: input.resolvedAt,
        status: "resolved",
        updatedAt: input.resolvedAt
      })
      .where(
        and(
          eq(managerInterventions.caseId, input.caseId),
          eq(managerInterventions.status, "open"),
          eq(managerInterventions.type, "follow_up_overdue")
        )
      );
  };

  const syncFollowUpJob = async (
    transaction: Parameters<Parameters<typeof db.transaction>[0]>[0],
    input: {
      automationStatus: AutomationStatus;
      caseId: string;
      runAfter: string;
      updatedAt: string;
    }
  ) => {
    await transaction
      .update(automationJobs)
      .set({
        status: "cancelled",
        updatedAt: input.updatedAt
      })
      .where(
        and(eq(automationJobs.caseId, input.caseId), eq(automationJobs.jobType, followUpWatchJobType), eq(automationJobs.status, "queued"))
      );

    if (input.automationStatus === "paused") {
      return;
    }

    await transaction.insert(automationJobs).values({
      caseId: input.caseId,
      createdAt: input.updatedAt,
      id: randomUUID(),
      jobType: followUpWatchJobType,
      runAfter: input.runAfter,
      status: "queued",
      updatedAt: input.updatedAt
    });
  };

  return {
    async applyQualification(caseId, input) {
      const caseRecord = await getPersistedCaseDetail(caseId);

      if (!caseRecord) {
        return null;
      }

      const qualificationSnapshotId = randomUUID();
      const auditEventId = randomUUID();
      const updatedAt = new Date().toISOString();

      await db.transaction(async (transaction) => {
        await transaction
          .insert(qualificationSnapshots)
          .values({
            budgetBand: input.budgetBand,
            caseId,
            createdAt: updatedAt,
            id: qualificationSnapshotId,
            intentSummary: input.intentSummary,
            moveInTimeline: input.moveInTimeline,
            readiness: input.readiness,
            updatedAt
          })
          .onConflictDoUpdate({
            set: {
              budgetBand: input.budgetBand,
              intentSummary: input.intentSummary,
              moveInTimeline: input.moveInTimeline,
              readiness: input.readiness,
              updatedAt
            },
            target: qualificationSnapshots.caseId
          });

        await transaction
          .update(cases)
          .set({
            currentNextAction: input.nextAction,
            nextActionDueAt: input.nextActionDueAt,
            stage: "qualified",
            updatedAt
          })
          .where(eq(cases.id, caseId));

        await transaction.insert(auditEvents).values({
          caseId,
          createdAt: updatedAt,
          eventType: "case_qualified",
          id: auditEventId,
          payload: {
            budgetBand: input.budgetBand,
            intentSummary: input.intentSummary,
            moveInTimeline: input.moveInTimeline,
            readiness: input.readiness
          }
        });

        await syncFollowUpJob(transaction, {
          automationStatus: caseRecord.automationStatus,
          caseId,
          runAfter: input.nextActionDueAt,
          updatedAt
        });
      });

      return getPersistedCaseDetail(caseId);
    },
    async close() {
      await client.close();
    },
    async createWebsiteLeadCase(input) {
      const createdLeadId = randomUUID();
      const createdCaseId = randomUUID();
      const createdAuditEventId = randomUUID();
      const createdAt = new Date().toISOString();

      await db.transaction(async (transaction) => {
        await transaction.insert(leads).values({
          budget: input.budget,
          createdAt,
          customerName: input.customerName,
          email: input.email,
          id: createdLeadId,
          message: input.message,
          phone: input.phone,
          preferredLocale: input.preferredLocale,
          projectInterest: input.projectInterest,
          source: "website"
        });

        await transaction.insert(cases).values({
          automationStatus: "active",
          createdAt,
          currentNextAction: input.nextAction,
          id: createdCaseId,
          leadId: createdLeadId,
          nextActionDueAt: input.nextActionDueAt,
          ownerName: defaultOwnerName,
          stage: "new",
          updatedAt: createdAt
        });

        await transaction.insert(auditEvents).values({
          caseId: createdCaseId,
          createdAt,
          eventType: "website_lead_received",
          id: createdAuditEventId,
          payload: {
            customerName: input.customerName,
            preferredLocale: input.preferredLocale,
            projectInterest: input.projectInterest,
            source: "website"
          }
        });

        await transaction.insert(documentRequests).values(
          defaultDocumentTypes.map((type) => ({
            caseId: createdCaseId,
            createdAt,
            id: randomUUID(),
            status: "requested",
            type,
            updatedAt: createdAt
          }))
        );

        await syncFollowUpJob(transaction, {
          automationStatus: "active",
          caseId: createdCaseId,
          runAfter: input.nextActionDueAt,
          updatedAt: createdAt
        });
      });

      const persistedCase = await db
        .select({
          automationStatus: cases.automationStatus,
          caseId: cases.id,
          createdAt: cases.createdAt,
          customerName: leads.customerName,
          leadId: leads.id,
          nextAction: cases.currentNextAction,
          nextActionDueAt: cases.nextActionDueAt,
          ownerName: cases.ownerName,
          preferredLocale: leads.preferredLocale,
          projectInterest: leads.projectInterest,
          source: leads.source,
          stage: cases.stage,
          updatedAt: cases.updatedAt
        })
        .from(cases)
        .innerJoin(leads, eq(cases.leadId, leads.id))
        .where(eq(cases.id, createdCaseId))
        .limit(1);

      const createdCase = persistedCase[0];

      if (!createdCase) {
        throw new Error("failed_to_persist_website_lead_case");
      }

      return {
        automationStatus: toAutomationStatus(createdCase.automationStatus),
        caseId: createdCase.caseId,
        createdAt: createdCase.createdAt,
        customerName: createdCase.customerName,
        followUpStatus: toFollowUpStatus(createdCase.nextActionDueAt),
        leadId: createdCase.leadId,
        nextAction: createdCase.nextAction,
        nextActionDueAt: createdCase.nextActionDueAt,
        openInterventionsCount: 0,
        ownerName: createdCase.ownerName,
        preferredLocale: toSupportedLocale(createdCase.preferredLocale),
        projectInterest: createdCase.projectInterest,
        source: toLeadSource(createdCase.source),
        stage: toCaseStage(createdCase.stage),
        updatedAt: createdCase.updatedAt
      };
    },
    async getCaseDetail(caseId) {
      return getPersistedCaseDetail(caseId);
    },
    async listCases() {
      const persistedCases = await db
        .select({
          automationStatus: cases.automationStatus,
          caseId: cases.id,
          createdAt: cases.createdAt,
          customerName: leads.customerName,
          nextAction: cases.currentNextAction,
          nextActionDueAt: cases.nextActionDueAt,
          ownerName: cases.ownerName,
          preferredLocale: leads.preferredLocale,
          projectInterest: leads.projectInterest,
          source: leads.source,
          stage: cases.stage,
          updatedAt: cases.updatedAt
        })
        .from(cases)
        .innerJoin(leads, eq(cases.leadId, leads.id))
        .orderBy(desc(cases.createdAt));

      const openInterventionCounts = await listOpenInterventionCounts(persistedCases.map((caseRecord) => caseRecord.caseId));

      return persistedCases.map((caseRecord) => ({
        automationStatus: toAutomationStatus(caseRecord.automationStatus),
        caseId: caseRecord.caseId,
        createdAt: caseRecord.createdAt,
        customerName: caseRecord.customerName,
        followUpStatus: toFollowUpStatus(caseRecord.nextActionDueAt),
        nextAction: caseRecord.nextAction,
        nextActionDueAt: caseRecord.nextActionDueAt,
        openInterventionsCount: openInterventionCounts.get(caseRecord.caseId) ?? 0,
        ownerName: caseRecord.ownerName,
        preferredLocale: toSupportedLocale(caseRecord.preferredLocale),
        projectInterest: caseRecord.projectInterest,
        source: toLeadSource(caseRecord.source),
        stage: toCaseStage(caseRecord.stage),
        updatedAt: caseRecord.updatedAt
      }));
    },
    async manageCaseFollowUp(caseId, input) {
      const caseRecord = await getPersistedCaseDetail(caseId);

      if (!caseRecord) {
        return null;
      }

      const updatedAt = new Date().toISOString();
      const nextOwnerName = input.ownerName ?? caseRecord.ownerName;

      await db.transaction(async (transaction) => {
        await transaction
          .update(cases)
          .set({
            currentNextAction: input.nextAction,
            nextActionDueAt: input.nextActionDueAt,
            ownerName: nextOwnerName,
            updatedAt
          })
          .where(eq(cases.id, caseId));

        await resolveOpenInterventions(transaction, {
          caseId,
          resolutionNote: "manager_follow_up_reset",
          resolvedAt: updatedAt
        });

        await transaction.insert(auditEvents).values({
          caseId,
          createdAt: updatedAt,
          eventType: "manager_follow_up_updated",
          id: randomUUID(),
          payload: {
            nextAction: input.nextAction,
            nextActionDueAt: input.nextActionDueAt,
            ownerName: nextOwnerName
          }
        });

        await syncFollowUpJob(transaction, {
          automationStatus: caseRecord.automationStatus,
          caseId,
          runAfter: input.nextActionDueAt,
          updatedAt
        });
      });

      return getPersistedCaseDetail(caseId);
    },
    async runDueFollowUpCycle(input) {
      const dueJobs = await db
        .select({
          caseId: automationJobs.caseId,
          jobId: automationJobs.id,
          runAfter: automationJobs.runAfter
        })
        .from(automationJobs)
        .where(and(eq(automationJobs.jobType, followUpWatchJobType), eq(automationJobs.status, "queued")))
        .orderBy(asc(automationJobs.runAfter))
        .limit(input.limit);

      const dueTimestamp = new Date(input.runAt).getTime();
      let processedJobs = 0;
      let openedInterventions = 0;
      const touchedCaseIds = new Set<string>();

      for (const job of dueJobs) {
        if (new Date(job.runAfter).getTime() > dueTimestamp) {
          continue;
        }

        processedJobs += 1;

        const cycleOutcome = await db.transaction(async (transaction) => {
          const [caseRecord] = await transaction
            .select({
              automationStatus: cases.automationStatus,
              caseId: cases.id,
              nextActionDueAt: cases.nextActionDueAt,
              ownerName: cases.ownerName,
              preferredLocale: leads.preferredLocale
            })
            .from(cases)
            .innerJoin(leads, eq(cases.leadId, leads.id))
            .where(eq(cases.id, job.caseId))
            .limit(1);

          await transaction
            .update(automationJobs)
            .set({
              status: "completed",
              updatedAt: input.runAt
            })
            .where(eq(automationJobs.id, job.jobId));

          if (!caseRecord) {
            return {
              caseId: job.caseId,
              openedIntervention: false
            };
          }

          const automationStatus = toAutomationStatus(caseRecord.automationStatus);

          if (automationStatus === "paused") {
            return {
              caseId: caseRecord.caseId,
              openedIntervention: false
            };
          }

          if (new Date(caseRecord.nextActionDueAt).getTime() > dueTimestamp) {
            return {
              caseId: caseRecord.caseId,
              openedIntervention: false
            };
          }

          const openIntervention = await transaction
            .select({
              interventionId: managerInterventions.id
            })
            .from(managerInterventions)
            .where(
              and(
                eq(managerInterventions.caseId, caseRecord.caseId),
                eq(managerInterventions.status, "open"),
                eq(managerInterventions.type, "follow_up_overdue")
              )
            )
            .limit(1);

          if (openIntervention[0]) {
            return {
              caseId: caseRecord.caseId,
              openedIntervention: false
            };
          }

          const overdueHours = Math.max(0, (dueTimestamp - new Date(caseRecord.nextActionDueAt).getTime()) / (60 * 60 * 1000));
          const severity = overdueHours >= 12 ? "critical" : "warning";
          const createdAt = input.runAt;

          await transaction.insert(managerInterventions).values({
            caseId: caseRecord.caseId,
            createdAt,
            id: randomUUID(),
            resolutionNote: null,
            resolvedAt: null,
            severity,
            status: "open",
            summary: buildFollowUpInterventionSummary(),
            type: "follow_up_overdue",
            updatedAt: createdAt
          });

          await transaction.insert(auditEvents).values({
            caseId: caseRecord.caseId,
            createdAt,
            eventType: "follow_up_intervention_opened",
            id: randomUUID(),
            payload: {
              nextActionDueAt: caseRecord.nextActionDueAt,
              overdueHours: Number(overdueHours.toFixed(2)),
              ownerName: caseRecord.ownerName,
              preferredLocale: caseRecord.preferredLocale,
              severity
            }
          });

          return {
            caseId: caseRecord.caseId,
            openedIntervention: true
          };
        });

        touchedCaseIds.add(cycleOutcome.caseId);

        if (cycleOutcome.openedIntervention) {
          openedInterventions += 1;
        }
      }

      return {
        openedInterventions,
        processedJobs,
        touchedCaseIds: Array.from(touchedCaseIds)
      };
    },
    async scheduleVisit(caseId, input) {
      const caseRecord = await getPersistedCaseDetail(caseId);

      if (!caseRecord) {
        return null;
      }

      const visitId = randomUUID();
      const auditEventId = randomUUID();
      const createdAt = new Date().toISOString();

      await db.transaction(async (transaction) => {
        await transaction.insert(visits).values({
          caseId,
          createdAt,
          id: visitId,
          location: input.location,
          scheduledAt: input.scheduledAt
        });

        await transaction
          .update(cases)
          .set({
            currentNextAction: input.nextAction,
            nextActionDueAt: input.nextActionDueAt,
            stage: "visit_scheduled",
            updatedAt: createdAt
          })
          .where(eq(cases.id, caseId));

        await transaction.insert(auditEvents).values({
          caseId,
          createdAt,
          eventType: "visit_scheduled",
          id: auditEventId,
          payload: {
            location: input.location,
            scheduledAt: input.scheduledAt
          }
        });

        await syncFollowUpJob(transaction, {
          automationStatus: caseRecord.automationStatus,
          caseId,
          runAfter: input.nextActionDueAt,
          updatedAt: createdAt
        });
      });

      return getPersistedCaseDetail(caseId);
    },
    async setAutomationStatus(caseId, input) {
      const caseRecord = await getPersistedCaseDetail(caseId);

      if (!caseRecord) {
        return null;
      }

      const updatedAt = new Date().toISOString();
      const nextStatus = input.status;

      await db.transaction(async (transaction) => {
        await transaction
          .update(cases)
          .set({
            automationStatus: nextStatus,
            updatedAt
          })
          .where(eq(cases.id, caseId));

        await transaction.insert(auditEvents).values({
          caseId,
          createdAt: updatedAt,
          eventType: nextStatus === "paused" ? "automation_paused" : "automation_resumed",
          id: randomUUID(),
          payload: {
            status: nextStatus
          }
        });

        await syncFollowUpJob(transaction, {
          automationStatus: nextStatus,
          caseId,
          runAfter: caseRecord.nextActionDueAt,
          updatedAt
        });
      });

      return getPersistedCaseDetail(caseId);
    },
    async updateDocumentRequestStatus(caseId, documentRequestId, input) {
      const documentRequest = await db
        .select({
          documentRequestId: documentRequests.id
        })
        .from(documentRequests)
        .where(and(eq(documentRequests.caseId, caseId), eq(documentRequests.id, documentRequestId)))
        .limit(1);

      if (!documentRequest[0]) {
        return null;
      }

      const caseRecord = await getPersistedCaseDetail(caseId);

      if (!caseRecord) {
        return null;
      }

      const updatedAt = new Date().toISOString();
      const auditEventId = randomUUID();

      await db.transaction(async (transaction) => {
        await transaction
          .update(documentRequests)
          .set({
            status: input.status,
            updatedAt
          })
          .where(and(eq(documentRequests.caseId, caseId), eq(documentRequests.id, documentRequestId)));

        await transaction
          .update(cases)
          .set({
            currentNextAction: input.nextAction,
            nextActionDueAt: input.nextActionDueAt,
            stage: "documents_in_progress",
            updatedAt
          })
          .where(eq(cases.id, caseId));

        await transaction.insert(auditEvents).values({
          caseId,
          createdAt: updatedAt,
          eventType: "document_request_updated",
          id: auditEventId,
          payload: {
            documentRequestId,
            status: input.status
          }
        });

        await syncFollowUpJob(transaction, {
          automationStatus: caseRecord.automationStatus,
          caseId,
          runAfter: input.nextActionDueAt,
          updatedAt
        });
      });

      return getPersistedCaseDetail(caseId);
    }
  };
}

function buildFollowUpInterventionSummary() {
  return "Manager follow-up is required because the next action is overdue.";
}

function hydrateManagerIntervention(value: {
  createdAt: string;
  interventionId: string;
  resolutionNote: string | null;
  resolvedAt: string | null;
  severity: string;
  status: string;
  summary: string;
  type: string;
}): PersistedManagerIntervention {
  return {
    createdAt: value.createdAt,
    interventionId: value.interventionId,
    resolutionNote: value.resolutionNote,
    resolvedAt: value.resolvedAt,
    severity: toManagerInterventionSeverity(value.severity),
    status: toManagerInterventionStatus(value.status),
    summary: value.summary,
    type: toManagerInterventionType(value.type)
  };
}

function toAutomationStatus(value: string): AutomationStatus {
  if (value === "active" || value === "paused") {
    return value;
  }

  throw new Error(`unsupported_automation_status:${value}`);
}

function toCaseStage(value: string): CaseStage {
  if (value === "new" || value === "qualified" || value === "visit_scheduled" || value === "documents_in_progress") {
    return value;
  }

  throw new Error(`unsupported_case_stage:${value}`);
}

function toDocumentRequestStatus(value: string): DocumentRequestStatus {
  if (value === "requested" || value === "under_review" || value === "accepted" || value === "rejected") {
    return value;
  }

  throw new Error(`unsupported_document_request_status:${value}`);
}

function toDocumentRequestType(value: string): DocumentRequestType {
  if (value === "government_id" || value === "proof_of_funds" || value === "employment_letter") {
    return value;
  }

  throw new Error(`unsupported_document_request_type:${value}`);
}

function toFollowUpStatus(nextActionDueAt: string): FollowUpStatus {
  return new Date(nextActionDueAt).getTime() <= Date.now() ? "attention" : "on_track";
}

function toLeadSource(value: string): "website" {
  if (value !== "website") {
    throw new Error(`unsupported_lead_source:${value}`);
  }

  return value;
}

function toManagerInterventionSeverity(value: string): ManagerInterventionSeverity {
  if (value === "warning" || value === "critical") {
    return value;
  }

  throw new Error(`unsupported_manager_intervention_severity:${value}`);
}

function toManagerInterventionStatus(value: string): ManagerInterventionStatus {
  if (value === "open" || value === "resolved") {
    return value;
  }

  throw new Error(`unsupported_manager_intervention_status:${value}`);
}

function toManagerInterventionType(value: string): ManagerInterventionType {
  if (value === "follow_up_overdue") {
    return value;
  }

  throw new Error(`unsupported_manager_intervention_type:${value}`);
}

function toQualificationReadiness(value: string): QualificationReadiness {
  if (value === "watch" || value === "medium" || value === "high") {
    return value;
  }

  throw new Error(`unsupported_qualification_readiness:${value}`);
}

function toSupportedLocale(value: string): SupportedLocale {
  if (value === "en" || value === "ar") {
    return value;
  }

  throw new Error(`unsupported_locale:${value}`);
}

export function deriveDocumentWorkflowNextAction(documentRequests: PersistedDocumentRequest[], locale: SupportedLocale) {
  if (documentRequests.some((documentRequest) => documentRequest.status === "rejected")) {
    return locale === "ar" ? "معالجة المستندات المرفوضة وطلب نسخة بديلة" : "Resolve rejected documents and request replacements";
  }

  if (documentRequests.every((documentRequest) => documentRequest.status === "accepted")) {
    return locale === "ar" ? "رفع الحالة إلى مراجعة الإدارة بعد اكتمال المستندات" : "Escalate the case for manager review after documents are complete";
  }

  return locale === "ar" ? "متابعة المستندات المطلوبة مع العميل" : "Track the outstanding document requests with the prospect";
}
