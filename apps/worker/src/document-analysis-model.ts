import { z } from "zod";

import {
  createDeterministicDocumentUploadAnalysisModelAdapter,
  type DocumentUploadAnalysisDecision,
  type DocumentUploadAnalysisInput,
  type DocumentUploadAnalysisModelAdapter
} from "@real-estate-ai/workflows";

const defaultOpenAiBaseUrl = "https://api.openai.com/v1";

const documentAnalysisDecisionSchema = z.object({
  confidence: z.number().min(0).max(1),
  detectedType: z.enum(["government_id", "proof_of_funds", "employment_letter"]).nullable(),
  evidence: z.array(z.string().min(3).max(200)).max(4),
  recommendation: z.enum(["accept", "request_reupload", "manual_review"]),
  summary: z.string().min(10).max(400)
});

interface OpenAiResponsesEnvelope {
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
    type?: string;
  }>;
  output_text?: string;
}

export interface WorkerOpenAiDocumentAnalysisConfiguration {
  apiKey: string | undefined;
  baseUrl: string;
  fetchImplementation?: typeof fetch;
  model: string | undefined;
  timeoutMs: number;
}

export function createWorkerDocumentUploadAnalysisModelAdapter(
  input: WorkerOpenAiDocumentAnalysisConfiguration
): DocumentUploadAnalysisModelAdapter {
  if (!input.apiKey || !input.model) {
    return createDeterministicDocumentUploadAnalysisModelAdapter();
  }

  return createOpenAiDocumentUploadAnalysisModelAdapter({
    apiKey: input.apiKey,
    baseUrl: input.baseUrl,
    fetchImplementation: input.fetchImplementation ?? fetch,
    model: input.model,
    timeoutMs: input.timeoutMs
  });
}

export function createOpenAiDocumentUploadAnalysisModelAdapter(input: {
  apiKey: string;
  baseUrl?: string;
  fetchImplementation?: typeof fetch;
  model: string;
  timeoutMs?: number;
}): DocumentUploadAnalysisModelAdapter {
  const requestFetch = input.fetchImplementation ?? fetch;
  const baseUrl = input.baseUrl ?? defaultOpenAiBaseUrl;
  const timeoutMs = input.timeoutMs ?? 15000;

  return {
    modelMode: "openai_document_analysis_v1",
    async analyzeDocument(modelInput) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await requestFetch(`${baseUrl}/responses`, {
          body: JSON.stringify({
            input: [
              {
                content: [
                  {
                    text:
                      "You review uploaded real-estate customer documents. Return one structured decision only. Be conservative. Auto-accept only on strong text-based evidence. Prefer manual_review when uncertain.",
                    type: "input_text"
                  }
                ],
                role: "system"
              },
              {
                content: [
                  {
                    text: JSON.stringify(buildOpenAiDocumentAnalysisPromptInput(modelInput)),
                    type: "input_text"
                  }
                ],
                role: "user"
              }
            ],
            model: input.model,
            text: {
              format: {
                name: "document_upload_analysis",
                schema: {
                  additionalProperties: false,
                  properties: {
                    confidence: {
                      maximum: 1,
                      minimum: 0,
                      type: "number"
                    },
                    detectedType: {
                      anyOf: [
                        {
                          enum: ["government_id", "proof_of_funds", "employment_letter"],
                          type: "string"
                        },
                        {
                          type: "null"
                        }
                      ]
                    },
                    evidence: {
                      items: {
                        maxLength: 200,
                        minLength: 3,
                        type: "string"
                      },
                      maxItems: 4,
                      type: "array"
                    },
                    recommendation: {
                      enum: ["accept", "request_reupload", "manual_review"],
                      type: "string"
                    },
                    summary: {
                      maxLength: 400,
                      minLength: 10,
                      type: "string"
                    }
                  },
                  required: ["confidence", "detectedType", "evidence", "recommendation", "summary"],
                  type: "object"
                },
                strict: true,
                type: "json_schema"
              }
            }
          }),
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`openai_responses_http_${response.status}`);
        }

        const payload = (await response.json()) as OpenAiResponsesEnvelope;
        const outputText = readOpenAiOutputText(payload);

        if (!outputText) {
          throw new Error("openai_responses_missing_output");
        }

        return documentAnalysisDecisionSchema.parse(JSON.parse(outputText) as DocumentUploadAnalysisDecision);
      } finally {
        clearTimeout(timeoutHandle);
      }
    }
  };
}

export function extractDocumentTextPreview(input: {
  bytes: Uint8Array;
  mimeType: string;
}) {
  if (input.bytes.byteLength === 0) {
    return null;
  }

  if (input.mimeType !== "application/pdf" && !input.mimeType.startsWith("text/")) {
    return null;
  }

  const rawText = Buffer.from(input.bytes).toString("latin1");
  const candidateSegments = rawText.match(/[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF\s:/#().,-]{8,120}/g) ?? [];
  const uniqueSegments = Array.from(new Set(candidateSegments.map((segment) => segment.replace(/\s+/g, " ").trim()))).filter(
    (segment) => segment.length >= 8
  );
  const preview = uniqueSegments.slice(0, 10).join(" | ").slice(0, 1200);

  return preview.length > 0 ? preview : null;
}

function buildOpenAiDocumentAnalysisPromptInput(input: DocumentUploadAnalysisInput) {
  return {
    constraints: {
      autoAcceptOnlyForStrongTextPdfSignals: true,
      preferManualReviewWhenUnsure: true
    },
    document: {
      caseLocale: input.caseDetail.preferredLocale,
      customerName: input.caseDetail.customerName,
      expectedType: input.documentRequest.type,
      extractedTextPreview: input.extractedTextPreview,
      fileName: input.upload.fileName,
      mimeType: input.upload.mimeType,
      sizeBytes: input.upload.sizeBytes
    }
  };
}

function readOpenAiOutputText(payload: OpenAiResponsesEnvelope) {
  if (typeof payload.output_text === "string" && payload.output_text.length > 0) {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const contentItem of item.content ?? []) {
      if (contentItem.type === "output_text" && typeof contentItem.text === "string" && contentItem.text.length > 0) {
        return contentItem.text;
      }
    }
  }

  return null;
}
