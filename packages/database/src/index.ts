import { randomUUID } from "node:crypto";

import { PGlite } from "@electric-sql/pglite";
import type {
  CaseStage,
  CreateWebsiteLeadInput,
  CreateWebsiteLeadResult,
  DocumentRequestStatus,
  DocumentRequestType,
  FollowUpStatus,
  PersistedCaseDetail,
  PersistedCaseSummary,
  PersistedDocumentRequest,
  QualifyCaseInput,
  QualificationReadiness,
  ScheduleVisitInput,
  SupportedLocale
} from "@real-estate-ai/contracts";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const defaultOwnerName = "Revenue Ops Queue";
const defaultDocumentTypes: DocumentRequestType[] = ["government_id", "proof_of_funds", "employment_letter"];

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
  scheduleVisit(
    caseId: string,
    input: ScheduleVisitInput & {
      nextAction: string;
      nextActionDueAt: string;
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
      cases,
      documentRequests,
      leads,
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
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

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
  `);

  const getPersistedCaseDetail = async (caseId: string): Promise<PersistedCaseDetail | null> => {
    const persistedCase = await db
      .select({
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

    const [caseAuditEvents, qualificationRecord, currentVisit, persistedDocumentRequests] = await Promise.all([
      db
        .select({
          createdAt: auditEvents.createdAt,
          eventType: auditEvents.eventType,
          payload: auditEvents.payload
        })
        .from(auditEvents)
        .where(eq(auditEvents.caseId, caseId))
        .orderBy(auditEvents.createdAt),
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
        .orderBy(documentRequests.createdAt)
    ]);

    return {
      auditEvents: caseAuditEvents.map((event) => ({
        createdAt: event.createdAt,
        eventType: event.eventType,
        payload: event.payload
      })),
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
      message: caseRecord.message,
      nextAction: caseRecord.nextAction,
      nextActionDueAt: caseRecord.nextActionDueAt,
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
      });

      const persistedCase = await db
        .select({
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
        caseId: createdCase.caseId,
        createdAt: createdCase.createdAt,
        customerName: createdCase.customerName,
        followUpStatus: toFollowUpStatus(createdCase.nextActionDueAt),
        leadId: createdCase.leadId,
        nextAction: createdCase.nextAction,
        nextActionDueAt: createdCase.nextActionDueAt,
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

      return persistedCases.map((caseRecord) => ({
        caseId: caseRecord.caseId,
        createdAt: caseRecord.createdAt,
        customerName: caseRecord.customerName,
        followUpStatus: toFollowUpStatus(caseRecord.nextActionDueAt),
        nextAction: caseRecord.nextAction,
        nextActionDueAt: caseRecord.nextActionDueAt,
        ownerName: caseRecord.ownerName,
        preferredLocale: toSupportedLocale(caseRecord.preferredLocale),
        projectInterest: caseRecord.projectInterest,
        source: toLeadSource(caseRecord.source),
        stage: toCaseStage(caseRecord.stage),
        updatedAt: caseRecord.updatedAt
      }));
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
      });

      return getPersistedCaseDetail(caseId);
    }
  };
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
