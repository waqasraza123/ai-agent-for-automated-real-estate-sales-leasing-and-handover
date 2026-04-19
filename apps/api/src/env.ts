import { fileURLToPath } from "node:url";

import { z } from "zod";

const defaultDatabasePath = fileURLToPath(new URL("../.data/phase2-alpha", import.meta.url));

const apiEnvSchema = z.object({
  API_DATABASE_PATH: z.string().min(1).default(defaultDatabasePath),
  API_GOOGLE_CALENDAR_ACCESS_TOKEN: z.string().min(1).optional(),
  API_GOOGLE_CALENDAR_ID: z.string().min(1).optional(),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_META_WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  API_META_WHATSAPP_APP_SECRET: z.string().min(1).optional(),
  API_META_WHATSAPP_API_VERSION: z.string().min(1).default("v20.0"),
  API_META_WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  API_META_WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1).optional(),
  API_PORT: z.coerce.number().int().positive().default(4000)
}).superRefine((environment, context) => {
  if (Boolean(environment.API_GOOGLE_CALENDAR_ACCESS_TOKEN) !== Boolean(environment.API_GOOGLE_CALENDAR_ID)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "API_GOOGLE_CALENDAR_ACCESS_TOKEN and API_GOOGLE_CALENDAR_ID must be set together.",
      path: ["API_GOOGLE_CALENDAR_ACCESS_TOKEN"]
    });
  }

  if (Boolean(environment.API_META_WHATSAPP_ACCESS_TOKEN) !== Boolean(environment.API_META_WHATSAPP_PHONE_NUMBER_ID)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "API_META_WHATSAPP_ACCESS_TOKEN and API_META_WHATSAPP_PHONE_NUMBER_ID must be set together.",
      path: ["API_META_WHATSAPP_ACCESS_TOKEN"]
    });
  }
});

export type ApiEnvironment = z.infer<typeof apiEnvSchema>;

export function parseApiEnvironment(environment: NodeJS.ProcessEnv): ApiEnvironment {
  return apiEnvSchema.parse(environment);
}
