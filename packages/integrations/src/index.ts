import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import type { SupportedLocale } from "@real-estate-ai/contracts";

export type IntegrationFailureKind = "retryable" | "terminal";

export interface OutboundMessageRequest {
  body: string;
  locale: SupportedLocale;
  referenceId: string;
  to: string;
}

export type OutboundMessageResult =
  | {
      acceptedAt: string;
      kind: "sent";
      providerMessageId: string;
      providerStatus: string | null;
    }
  | {
      code: string;
      detail: string;
      kind: "failed";
      retryable: boolean;
    };

export interface WhatsAppClient {
  sendTextMessage(input: OutboundMessageRequest): Promise<OutboundMessageResult>;
}

export interface CalendarBookingRequest {
  customerName: string;
  description: string;
  endAt: string;
  location: string;
  startAt: string;
  title: string;
}

export type CalendarBookingResult =
  | {
      confirmedAt: string;
      kind: "confirmed";
      providerEventId: string;
    }
  | {
      code: string;
      detail: string;
      kind: "failed";
      retryable: boolean;
    };

export interface CalendarBookingClient {
  createBooking(input: CalendarBookingRequest): Promise<CalendarBookingResult>;
}

export interface MetaWhatsAppClientConfig {
  accessToken: string;
  apiVersion: string;
  phoneNumberId: string;
}

export interface GoogleCalendarClientConfig {
  accessToken: string;
  calendarId: string;
}

const metaWebhookMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  text: z.object({
    body: z.string()
  }),
  timestamp: z.string(),
  type: z.literal("text")
});

const metaWebhookStatusErrorSchema = z.object({
  code: z.number().optional(),
  details: z.string().optional(),
  title: z.string().optional()
});

const metaWebhookStatusSchema = z.object({
  errors: z.array(metaWebhookStatusErrorSchema).optional(),
  id: z.string(),
  recipient_id: z.string().optional(),
  status: z.string(),
  timestamp: z.string()
});

const metaWebhookProfileSchema = z.object({
  name: z.string().optional()
});

const metaWebhookContactSchema = z.object({
  profile: metaWebhookProfileSchema.optional(),
  wa_id: z.string()
});

const metaWebhookValueSchema = z.object({
  contacts: z.array(metaWebhookContactSchema).optional(),
  messages: z.array(metaWebhookMessageSchema).optional(),
  statuses: z.array(metaWebhookStatusSchema).optional()
});

const metaWebhookChangeSchema = z.object({
  value: metaWebhookValueSchema
});

const metaWebhookEntrySchema = z.object({
  changes: z.array(metaWebhookChangeSchema)
});

const metaWebhookPayloadSchema = z.object({
  entry: z.array(metaWebhookEntrySchema)
});

export interface ParsedMetaInboundMessage {
  messageId: string;
  phoneNumber: string;
  profileName: string | null;
  textBody: string;
  timestamp: string;
}

export interface ParsedMetaDeliveryStatus {
  failureCode: string | null;
  failureDetail: string | null;
  phoneNumber: string | null;
  providerMessageId: string;
  status: string;
  timestamp: string;
}

export function createMetaWhatsAppWebhookSignature(input: {
  appSecret: string;
  rawBody: string;
}) {
  return `sha256=${createHmac("sha256", input.appSecret).update(input.rawBody, "utf8").digest("hex")}`;
}

export function verifyMetaWhatsAppWebhookSignature(input: {
  appSecret: string;
  rawBody: string;
  signatureHeader: string | string[] | null | undefined;
}) {
  if (typeof input.signatureHeader !== "string") {
    return false;
  }

  const expectedSignature = createMetaWhatsAppWebhookSignature({
    appSecret: input.appSecret,
    rawBody: input.rawBody
  });
  const receivedSignature = input.signatureHeader.trim();
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function normalizePhoneNumber(rawValue: string | null | undefined) {
  if (!rawValue) {
    return null;
  }

  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const normalizedDigits = trimmedValue.replace(/[^\d+]/g, "");

  if (normalizedDigits.length < 7) {
    return null;
  }

  if (normalizedDigits.startsWith("+")) {
    const digits = normalizedDigits.slice(1).replace(/[^\d]/g, "");
    return digits.length >= 7 ? `+${digits}` : null;
  }

  if (normalizedDigits.startsWith("00")) {
    const digits = normalizedDigits.slice(2).replace(/[^\d]/g, "");
    return digits.length >= 7 ? `+${digits}` : null;
  }

  const digits = normalizedDigits.replace(/[^\d]/g, "");
  return digits.length >= 7 ? `+${digits}` : null;
}

export function parseMetaWhatsAppWebhook(payload: unknown): {
  deliveryStatuses: ParsedMetaDeliveryStatus[];
  inboundMessages: ParsedMetaInboundMessage[];
} {
  const result = metaWebhookPayloadSchema.safeParse(payload);

  if (!result.success) {
    return {
      deliveryStatuses: [],
      inboundMessages: []
    };
  }

  const inboundMessages: ParsedMetaInboundMessage[] = [];
  const deliveryStatuses: ParsedMetaDeliveryStatus[] = [];

  for (const entry of result.data.entry) {
    for (const change of entry.changes) {
      const contactsByPhone = new Map<string, string | null>();

      for (const contact of change.value.contacts ?? []) {
        const normalizedContactPhone = normalizePhoneNumber(contact.wa_id);

        if (!normalizedContactPhone) {
          continue;
        }

        contactsByPhone.set(normalizedContactPhone, contact.profile?.name ?? null);
      }

      for (const message of change.value.messages ?? []) {
        const normalizedPhone = normalizePhoneNumber(message.from);

        if (!normalizedPhone) {
          continue;
        }

        inboundMessages.push({
          messageId: message.id,
          phoneNumber: normalizedPhone,
          profileName: contactsByPhone.get(normalizedPhone) ?? null,
          textBody: message.text.body,
          timestamp: new Date(Number(message.timestamp) * 1000).toISOString()
        });
      }

      for (const status of change.value.statuses ?? []) {
        const normalizedPhone = normalizePhoneNumber(status.recipient_id ?? null);
        const firstError = status.errors?.[0];

        deliveryStatuses.push({
          failureCode: firstError?.code ? String(firstError.code) : null,
          failureDetail: firstError?.details ?? firstError?.title ?? null,
          phoneNumber: normalizedPhone,
          providerMessageId: status.id,
          status: status.status,
          timestamp: new Date(Number(status.timestamp) * 1000).toISOString()
        });
      }
    }
  }

  return {
    deliveryStatuses,
    inboundMessages
  };
}

export function createMetaWhatsAppClient(
  fetchImplementation: typeof fetch,
  config: MetaWhatsAppClientConfig
): WhatsAppClient {
  return {
    async sendTextMessage(input) {
      const response = await fetchImplementation(
        `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
        {
          body: JSON.stringify({
            messaging_product: "whatsapp",
            preview_url: false,
            text: {
              body: input.body
            },
            to: input.to.replace(/^\+/, ""),
            type: "text"
          }),
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json"
          },
          method: "POST"
        }
      );

      const body = (await readJsonSafely(response)) as
        | {
            error?: {
              code?: number;
              message?: string;
              type?: string;
            };
            messages?: Array<{
              id?: string;
              message_status?: string;
            }>;
          }
        | null;

      if (!response.ok) {
        const errorCode = body?.error?.code ? String(body.error.code) : `meta_http_${response.status}`;
        const errorDetail = body?.error?.message ?? body?.error?.type ?? "Meta WhatsApp send failed";

        return {
          code: errorCode,
          detail: errorDetail,
          kind: "failed",
          retryable: response.status === 429 || response.status >= 500
        };
      }

      const providerMessage = body?.messages?.[0];

      if (!providerMessage?.id) {
        return {
          code: "meta_missing_message_id",
          detail: "Meta WhatsApp accepted the request without returning a provider message id.",
          kind: "failed",
          retryable: true
        };
      }

      return {
        acceptedAt: new Date().toISOString(),
        kind: "sent",
        providerMessageId: providerMessage.id,
        providerStatus: providerMessage.message_status ?? null
      };
    }
  };
}

export function createGoogleCalendarClient(
  fetchImplementation: typeof fetch,
  config: GoogleCalendarClientConfig
): CalendarBookingClient {
  return {
    async createBooking(input) {
      const response = await fetchImplementation(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events`,
        {
          body: JSON.stringify({
            description: input.description,
            end: {
              dateTime: input.endAt
            },
            location: input.location,
            start: {
              dateTime: input.startAt
            },
            summary: input.title
          }),
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json"
          },
          method: "POST"
        }
      );

      const body = (await readJsonSafely(response)) as
        | {
            error?: {
              code?: number;
              message?: string;
              status?: string;
            };
            id?: string;
          }
        | null;

      if (!response.ok) {
        const errorCode = body?.error?.code ? String(body.error.code) : `google_calendar_http_${response.status}`;
        const errorDetail = body?.error?.message ?? body?.error?.status ?? "Google Calendar booking failed";

        return {
          code: errorCode,
          detail: errorDetail,
          kind: "failed",
          retryable: response.status === 429 || response.status >= 500
        };
      }

      if (!body?.id) {
        return {
          code: "google_calendar_missing_event_id",
          detail: "Google Calendar accepted the request without returning an event id.",
          kind: "failed",
          retryable: true
        };
      }

      return {
        confirmedAt: new Date().toISOString(),
        kind: "confirmed",
        providerEventId: body.id
      };
    }
  };
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
