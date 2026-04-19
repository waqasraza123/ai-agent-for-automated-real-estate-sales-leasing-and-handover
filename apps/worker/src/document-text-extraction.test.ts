import { describe, expect, it, vi } from "vitest";

import {
  createCompositeDocumentTextExtractionAdapter,
  createPreviewDocumentTextExtractionAdapter,
  createTesseractDocumentTextExtractionAdapter,
  createWorkerDocumentTextExtractionAdapter
} from "./document-text-extraction";

describe("document text extraction", () => {
  it("extracts preview text from pdf-like content", async () => {
    const adapter = createPreviewDocumentTextExtractionAdapter();
    const result = await adapter.extractText({
      bytes: new Uint8Array(Buffer.from("Passport number 123456 Government ID Saudi Arabia", "utf8")),
      fileName: "government-id.pdf",
      mimeType: "application/pdf"
    });

    expect(result.status).toBe("extracted");
    expect(result.source).toBe("text_preview");
    expect(result.preview).toContain("Passport number");
  });

  it("returns not_available for images when only preview extraction is enabled", async () => {
    const adapter = createWorkerDocumentTextExtractionAdapter({
      ocrMode: "preview_only",
      tesseractLanguages: "eng+ara",
      tesseractPath: "tesseract",
      tesseractPsm: 6,
      tesseractTimeoutMs: 15000
    });
    const result = await adapter.extractText({
      bytes: new Uint8Array(Buffer.from([1, 2, 3, 4])),
      fileName: "scan.png",
      mimeType: "image/png"
    });

    expect(result.status).toBe("not_available");
    expect(result.source).toBe("none");
  });

  it("uses tesseract OCR for image uploads when configured", async () => {
    const execFileImplementation = vi.fn(async () => ({
      stderr: "",
      stdout: "National ID Kingdom of Saudi Arabia"
    }));
    const adapter = createTesseractDocumentTextExtractionAdapter({
      execFileImplementation,
      languages: "eng+ara",
      psm: 6,
      tesseractPath: "/usr/local/bin/tesseract",
      timeoutMs: 5000
    });
    const result = await adapter.extractText({
      bytes: new Uint8Array(Buffer.from([1, 2, 3, 4])),
      fileName: "id-card.png",
      mimeType: "image/png"
    });

    expect(result.status).toBe("extracted");
    expect(result.source).toBe("tesseract_ocr");
    expect(result.preview).toContain("National ID");
  });

  it("marks OCR failures explicitly instead of pretending no text was available", async () => {
    const execFileImplementation = vi.fn(async () => {
      throw new Error("spawn tesseract ENOENT");
    });
    const adapter = createTesseractDocumentTextExtractionAdapter({
      execFileImplementation,
      languages: "eng+ara",
      psm: 6,
      tesseractPath: "/missing/tesseract",
      timeoutMs: 5000
    });
    const result = await adapter.extractText({
      bytes: new Uint8Array(Buffer.from([1, 2, 3, 4])),
      fileName: "scan.jpg",
      mimeType: "image/jpeg"
    });

    expect(result.status).toBe("failed");
    expect(result.source).toBe("tesseract_ocr");
    expect(result.failureDetail).toContain("ENOENT");
  });

  it("falls back to preview extraction for non-image files in composite mode", async () => {
    const composite = createCompositeDocumentTextExtractionAdapter({
      fallback: createPreviewDocumentTextExtractionAdapter(),
      ocr: createTesseractDocumentTextExtractionAdapter({
        execFileImplementation: vi.fn(async () => ({
          stderr: "",
          stdout: "ignored"
        })),
        languages: "eng+ara",
        psm: 6,
        tesseractPath: "/usr/local/bin/tesseract",
        timeoutMs: 5000
      })
    });
    const result = await composite.extractText({
      bytes: new Uint8Array(Buffer.from("Employment letter salary employer HR department", "utf8")),
      fileName: "employment-letter.pdf",
      mimeType: "application/pdf"
    });

    expect(result.status).toBe("extracted");
    expect(result.source).toBe("text_preview");
    expect(result.preview).toContain("Employment letter");
  });
});
