import { fileURLToPath } from "node:url";

import { z } from "zod";

const defaultDatabasePath = fileURLToPath(new URL("../../api/.data/phase2-alpha", import.meta.url));

const workerEnvironmentSchema = z.object({
  WORKER_BATCH_LIMIT: z.coerce.number().int().positive().default(25),
  WORKER_DATABASE_PATH: z.string().min(1).default(defaultDatabasePath),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(15000)
});

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;

export function parseWorkerEnvironment(environment: NodeJS.ProcessEnv): WorkerEnvironment {
  return workerEnvironmentSchema.parse(environment);
}
