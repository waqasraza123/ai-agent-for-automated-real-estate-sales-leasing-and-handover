import { fileURLToPath } from "node:url";

import { z } from "zod";

const defaultDatabasePath = fileURLToPath(new URL("../.data/phase2-alpha", import.meta.url));

const apiEnvSchema = z.object({
  API_DATABASE_PATH: z.string().min(1).default(defaultDatabasePath),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(4000)
});

export type ApiEnvironment = z.infer<typeof apiEnvSchema>;

export function parseApiEnvironment(environment: NodeJS.ProcessEnv): ApiEnvironment {
  return apiEnvSchema.parse(environment);
}
