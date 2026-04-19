import { createAlphaLeadCaptureStore } from "@real-estate-ai/database";
import { createGoogleCalendarClient } from "@real-estate-ai/integrations";

import { buildApiApp } from "./app";
import { parseApiEnvironment } from "./env";

const environment = parseApiEnvironment(process.env);
const store = await createAlphaLeadCaptureStore({
  dataPath: environment.API_DATABASE_PATH
});
const calendarClient =
  environment.API_GOOGLE_CALENDAR_ACCESS_TOKEN && environment.API_GOOGLE_CALENDAR_ID
    ? createGoogleCalendarClient(fetch, {
        accessToken: environment.API_GOOGLE_CALENDAR_ACCESS_TOKEN,
        calendarId: environment.API_GOOGLE_CALENDAR_ID
      })
    : null;
const app = buildApiApp({
  calendarClient,
  store,
  whatsappWebhookAppSecret: environment.API_META_WHATSAPP_APP_SECRET ?? null,
  whatsappWebhookVerifyToken: environment.API_META_WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? null
});

const stop = async () => {
  await app.close();
  await store.close();
};

process.on("SIGINT", () => {
  void stop();
});

process.on("SIGTERM", () => {
  void stop();
});

await app.listen({
  host: environment.API_HOST,
  port: environment.API_PORT
});
