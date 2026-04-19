import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface DocumentStorage {
  deleteUpload(storagePath: string): Promise<void>;
  readUpload(storagePath: string): Promise<Buffer>;
  saveUpload(input: {
    bytes: Buffer;
    caseId: string;
    documentRequestId: string;
    fileName: string;
    uploadId?: string;
  }): Promise<{
    checksumSha256: string;
    documentUploadId: string;
    sizeBytes: number;
    storagePath: string;
  }>;
}

export function createLocalDocumentStorage(basePath: string): DocumentStorage {
  return {
    async deleteUpload(storagePath) {
      try {
        await unlink(path.join(basePath, storagePath));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },
    async readUpload(storagePath) {
      return readFile(path.join(basePath, storagePath));
    },
    async saveUpload(input) {
      const documentUploadId = input.uploadId ?? randomUUID();
      const sanitizedFileName = sanitizeFileName(input.fileName);
      const relativeDirectory = path.join(input.caseId, input.documentRequestId);
      const relativePath = path.join(relativeDirectory, `${documentUploadId}-${sanitizedFileName}`);
      const absoluteDirectory = path.join(basePath, relativeDirectory);
      const absolutePath = path.join(basePath, relativePath);
      const temporaryPath = `${absolutePath}.tmp-${randomUUID()}`;

      await mkdir(absoluteDirectory, { recursive: true });
      await writeFile(temporaryPath, input.bytes);
      await rename(temporaryPath, absolutePath);

      return {
        checksumSha256: createHash("sha256").update(input.bytes).digest("hex"),
        documentUploadId,
        sizeBytes: input.bytes.byteLength,
        storagePath: relativePath
      };
    }
  };
}

function sanitizeFileName(fileName: string) {
  const normalized = path.basename(fileName).replace(/[^a-zA-Z0-9._-]+/g, "-");

  return normalized.length > 0 ? normalized : "document.bin";
}
