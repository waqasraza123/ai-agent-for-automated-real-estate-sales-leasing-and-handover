import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import type { DocumentTextExtractionSource, DocumentTextExtractionStatus } from "@real-estate-ai/contracts";

const execFile = promisify(execFileCallback);

type ExecFileRunner = (
  file: string,
  args: readonly string[],
  options: {
    timeout: number;
  }
) => Promise<{
  stderr: string;
  stdout: string;
}>;

export interface DocumentTextExtractionResult {
  failureDetail: string | null;
  preview: string | null;
  source: DocumentTextExtractionSource;
  status: DocumentTextExtractionStatus;
}

export interface DocumentTextExtractionAdapter {
  extractText(input: {
    bytes: Uint8Array;
    fileName: string;
    mimeType: string;
  }): Promise<DocumentTextExtractionResult>;
  mode: string;
}

export interface TesseractDocumentTextExtractionConfiguration {
  execFileImplementation?: ExecFileRunner;
  languages: string;
  psm: number;
  tesseractPath: string;
  timeoutMs: number;
}

export function createWorkerDocumentTextExtractionAdapter(input: {
  ocrMode: "preview_only" | "tesseract";
  tesseractLanguages: string;
  tesseractPath: string;
  tesseractPsm: number;
  tesseractTimeoutMs: number;
}) {
  if (input.ocrMode === "tesseract") {
    return createCompositeDocumentTextExtractionAdapter({
      fallback: createPreviewDocumentTextExtractionAdapter(),
      ocr: createTesseractDocumentTextExtractionAdapter({
        languages: input.tesseractLanguages,
        psm: input.tesseractPsm,
        tesseractPath: input.tesseractPath,
        timeoutMs: input.tesseractTimeoutMs
      })
    });
  }

  return createPreviewDocumentTextExtractionAdapter();
}

export function createPreviewDocumentTextExtractionAdapter(): DocumentTextExtractionAdapter {
  return {
    async extractText(input) {
      if (input.bytes.byteLength === 0) {
        return {
          failureDetail: null,
          preview: null,
          source: "none",
          status: "not_available"
        };
      }

      if (input.mimeType !== "application/pdf" && !input.mimeType.startsWith("text/")) {
        return {
          failureDetail: null,
          preview: null,
          source: "none",
          status: "not_available"
        };
      }

      const rawText = Buffer.from(input.bytes).toString("latin1");
      const candidateSegments = rawText.match(/[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF\s:/#().,-]{8,120}/g) ?? [];
      const uniqueSegments = Array.from(
        new Set(candidateSegments.map((segment) => segment.replace(/\s+/g, " ").trim()))
      ).filter((segment) => segment.length >= 8);
      const preview = uniqueSegments.slice(0, 10).join(" | ").slice(0, 1200);

      return {
        failureDetail: null,
        preview: preview.length > 0 ? preview : null,
        source: preview.length > 0 ? "text_preview" : "none",
        status: preview.length > 0 ? "extracted" : "not_available"
      };
    },
    mode: "preview_only"
  };
}

export function createTesseractDocumentTextExtractionAdapter(
  input: TesseractDocumentTextExtractionConfiguration
): DocumentTextExtractionAdapter {
  const runExecFile = input.execFileImplementation ?? execFile;

  return {
    async extractText(fileInput) {
      if (!fileInput.mimeType.startsWith("image/")) {
        return {
          failureDetail: null,
          preview: null,
          source: "none",
          status: "not_available"
        };
      }

      const tempDirectory = await mkdtemp(path.join(tmpdir(), "rea-doc-ocr-"));
      const tempFilePath = path.join(tempDirectory, sanitizeTemporaryFileName(fileInput.fileName));

      try {
        await writeFile(tempFilePath, fileInput.bytes);
        const { stdout } = await runExecFile(
          input.tesseractPath,
          [
            tempFilePath,
            "stdout",
            "-l",
            input.languages,
            "--psm",
            String(input.psm)
          ],
          {
            timeout: input.timeoutMs
          }
        );
        const normalizedPreview = stdout.replace(/\s+/g, " ").trim().slice(0, 1200);

        if (normalizedPreview.length === 0) {
          return {
            failureDetail: null,
            preview: null,
            source: "none",
            status: "not_available"
          };
        }

        return {
          failureDetail: null,
          preview: normalizedPreview,
          source: "tesseract_ocr",
          status: "extracted"
        };
      } catch (error) {
        return {
          failureDetail: error instanceof Error ? error.message : "unknown_ocr_failure",
          preview: null,
          source: "tesseract_ocr",
          status: "failed"
        };
      } finally {
        await rm(tempDirectory, {
          force: true,
          recursive: true
        });
      }
    },
    mode: "tesseract_ocr"
  };
}

export function createCompositeDocumentTextExtractionAdapter(input: {
  fallback: DocumentTextExtractionAdapter;
  ocr: DocumentTextExtractionAdapter;
}): DocumentTextExtractionAdapter {
  return {
    async extractText(fileInput) {
      if (fileInput.mimeType.startsWith("image/")) {
        const ocrResult = await input.ocr.extractText(fileInput);

        if (ocrResult.status === "extracted" || ocrResult.status === "failed") {
          return ocrResult;
        }
      }

      return input.fallback.extractText(fileInput);
    },
    mode: `${input.fallback.mode}+${input.ocr.mode}`
  };
}

function sanitizeTemporaryFileName(fileName: string) {
  const sanitized = fileName.replace(/[^A-Za-z0-9._-]/g, "_");

  return sanitized.length > 0 ? sanitized : "document-upload.bin";
}
