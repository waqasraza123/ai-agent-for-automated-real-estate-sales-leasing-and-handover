import Fastify from "fastify";

import {
  createWebsiteLeadInputSchema,
  qualifyCaseInputSchema,
  scheduleVisitInputSchema,
  updateDocumentRequestInputSchema
} from "@real-estate-ai/contracts";
import type { LeadCaptureStore } from "@real-estate-ai/database";
import {
  getPersistedCaseDetail,
  listPersistedCases,
  qualifyPersistedCase,
  schedulePersistedVisit,
  submitWebsiteLead,
  updatePersistedDocumentRequest
} from "@real-estate-ai/workflows";

export function buildApiApp(dependencies: {
  store: LeadCaptureStore;
}) {
  const app = Fastify({
    logger: false
  });

  app.get("/health", async () => ({
    status: "ok"
  }));

  app.post("/v1/website-leads", async (request, reply) => {
    const result = createWebsiteLeadInputSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "invalid_request",
        issues: result.error.issues
      });
    }

    const createdCase = await submitWebsiteLead(dependencies.store, result.data);

    return reply.status(201).send(createdCase);
  });

  app.get("/v1/cases", async () => {
    return {
      cases: await listPersistedCases(dependencies.store)
    };
  });

  app.get<{
    Params: {
      caseId: string;
    };
  }>("/v1/cases/:caseId", async (request, reply) => {
    const caseDetail = await getPersistedCaseDetail(dependencies.store, request.params.caseId);

    if (!caseDetail) {
      return reply.status(404).send({
        error: "case_not_found"
      });
    }

    return caseDetail;
  });

  app.post<{
    Params: {
      caseId: string;
    };
  }>("/v1/cases/:caseId/qualification", async (request, reply) => {
    const result = qualifyCaseInputSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "invalid_request",
        issues: result.error.issues
      });
    }

    const caseDetail = await qualifyPersistedCase(dependencies.store, request.params.caseId, result.data);

    if (!caseDetail) {
      return reply.status(404).send({
        error: "case_not_found"
      });
    }

    return reply.status(200).send(caseDetail);
  });

  app.post<{
    Params: {
      caseId: string;
    };
  }>("/v1/cases/:caseId/visits", async (request, reply) => {
    const result = scheduleVisitInputSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "invalid_request",
        issues: result.error.issues
      });
    }

    const caseDetail = await schedulePersistedVisit(dependencies.store, request.params.caseId, result.data);

    if (!caseDetail) {
      return reply.status(404).send({
        error: "case_not_found"
      });
    }

    return reply.status(200).send(caseDetail);
  });

  app.patch<{
    Params: {
      caseId: string;
      documentRequestId: string;
    };
  }>("/v1/cases/:caseId/documents/:documentRequestId", async (request, reply) => {
    const result = updateDocumentRequestInputSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "invalid_request",
        issues: result.error.issues
      });
    }

    const caseDetail = await updatePersistedDocumentRequest(
      dependencies.store,
      request.params.caseId,
      request.params.documentRequestId,
      result.data
    );

    if (!caseDetail) {
      return reply.status(404).send({
        error: "resource_not_found"
      });
    }

    return reply.status(200).send(caseDetail);
  });

  return app;
}
