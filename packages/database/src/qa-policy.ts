import type { HandoverCustomerUpdateQaPolicySignal, SupportedLocale } from "@real-estate-ai/contracts";

export type QaPolicySignal = "discrimination_risk" | "exception_request" | "frustrated_customer_language" | "legal_escalation_risk";

export interface QaPolicyMatch {
  evidence: string;
  signal: QaPolicySignal;
}

export interface HandoverCustomerUpdateQaPolicyMatch {
  evidence: string;
  signal: HandoverCustomerUpdateQaPolicySignal;
}

const qaPolicyLexicon: Array<{
  patterns: RegExp[];
  signal: QaPolicySignal;
}> = [
  {
    patterns: [
      /\bexception\b/i,
      /\bwaive\b/i,
      /\bdiscount\b/i,
      /\bspecial approval\b/i,
      /\bcustom payment plan\b/i,
      /استثناء/u,
      /خصم/u,
      /موافقة خاصة/u
    ],
    signal: "exception_request"
  },
  {
    patterns: [
      /\bangry\b/i,
      /\bupset\b/i,
      /\bfrustrated\b/i,
      /\bunacceptable\b/i,
      /\bcomplaint\b/i,
      /\bmisleading\b/i,
      /غاضب/u,
      /منزعج/u,
      /مستاء/u,
      /شكوى/u,
      /غير مقبول/u
    ],
    signal: "frustrated_customer_language"
  },
  {
    patterns: [
      /\bnationality only\b/i,
      /\bmale only\b/i,
      /\bfemale only\b/i,
      /\bno kids\b/i,
      /\bfamily only\b/i,
      /\breligion\b/i,
      /\brace\b/i,
      /جنسية/u,
      /للعائلات فقط/u,
      /للرجال فقط/u,
      /للنساء فقط/u,
      /بدون أطفال/u
    ],
    signal: "discrimination_risk"
  },
  {
    patterns: [
      /\blawyer\b/i,
      /\blegal notice\b/i,
      /\blawsuit\b/i,
      /\bsue\b/i,
      /\bcontract dispute\b/i,
      /\bregulator\b/i,
      /محامي/u,
      /قانوني/u,
      /دعوى/u,
      /شكوى رسمية/u,
      /نزاع/u
    ],
    signal: "legal_escalation_risk"
  }
];

const handoverCustomerUpdateQaPolicyLexicon: Array<{
  patterns: RegExp[];
  signal: HandoverCustomerUpdateQaPolicySignal;
}> = [
  {
    patterns: [
      /\bguarantee(?:d|s)?\b/i,
      /\bpromise(?:d|s)?\b/i,
      /\bkeys? (?:on|by|before)\b/i,
      /\bpossession (?:on|by|before)\b/i,
      /\bmove[- ]in (?:on|by|before)\b/i,
      /نضمن/u,
      /مضمون/u,
      /المفاتيح/u,
      /التسليم (?:في|قبل|بحلول)/u,
      /الاستلام (?:في|قبل|بحلول)/u
    ],
    signal: "possession_date_promise"
  },
  {
    patterns: [
      /\bdiscount\b/i,
      /\bwaive\b/i,
      /\bfee waiver\b/i,
      /\bexception\b/i,
      /\bspecial approval\b/i,
      /\bflexible payment\b/i,
      /خصم/u,
      /إعفاء/u,
      /استثناء/u,
      /موافقة خاصة/u,
      /دفعات مرنة/u
    ],
    signal: "pricing_or_exception_promise"
  },
  {
    patterns: [
      /\blegally guaranteed\b/i,
      /\bno legal issue\b/i,
      /\bno liability\b/i,
      /\bcontractually guaranteed\b/i,
      /\bregulator(?:y)? approval\b/i,
      /ضمان قانوني/u,
      /لا توجد مسؤولية/u,
      /موافقة تنظيمية/u,
      /مضمون قانونياً/u
    ],
    signal: "legal_claim_risk"
  },
  {
    patterns: [
      /\bnationality only\b/i,
      /\bmale only\b/i,
      /\bfemale only\b/i,
      /\bfamily only\b/i,
      /\bno kids\b/i,
      /جنسية/u,
      /للرجال فقط/u,
      /للنساء فقط/u,
      /للعائلات فقط/u,
      /بدون أطفال/u
    ],
    signal: "discrimination_risk"
  }
];

export function buildAutomaticQaSampleSummary(locale: SupportedLocale, signals: QaPolicySignal[]) {
  const labels = signals.map((signal) => getQaPolicySignalSummary(locale, signal));

  if (labels.length === 0) {
    return locale === "ar"
      ? "تم فتح مراجعة جودة تلقائية بسبب إشارات سياسة تحتاج اعتماداً بشرياً."
      : "An automatic QA review was opened because the inbound message matched human-review policy signals.";
  }

  const joinedLabels = joinLabels(locale, labels);

  return locale === "ar"
    ? `تم فتح مراجعة جودة تلقائية لأن الرسالة الواردة تضمنت ${joinedLabels}.`
    : `An automatic QA review was opened because the inbound message included ${joinedLabels}.`;
}

export function detectQaPolicyMatches(message: string): QaPolicyMatch[] {
  return collectMatches(message, qaPolicyLexicon);
}

export function detectHandoverCustomerUpdateQaPolicyMatches(message: string): HandoverCustomerUpdateQaPolicyMatch[] {
  return collectMatches(message, handoverCustomerUpdateQaPolicyLexicon);
}

export function buildHandoverCustomerUpdateQaSampleSummary(
  locale: SupportedLocale,
  signals: HandoverCustomerUpdateQaPolicySignal[]
) {
  const labels = signals.map((signal) => getHandoverCustomerUpdateQaPolicySignalSummary(locale, signal));

  if (labels.length === 0) {
    return locale === "ar"
      ? "يتطلب هذا التحديث موافقة جودة بشرية قبل اعتباره جاهزاً للإرسال."
      : "This customer update requires explicit human QA approval before it can be treated as dispatch-ready.";
  }

  const joinedLabels = joinLabels(locale, labels);

  return locale === "ar"
    ? `يتطلب هذا التحديث موافقة جودة بشرية لأن الصياغة المجهزة تضمنت ${joinedLabels}.`
    : `This customer update requires human QA approval because the prepared draft included ${joinedLabels}.`;
}

function getQaPolicySignalSummary(locale: SupportedLocale, signal: QaPolicySignal) {
  const labels = {
    ar: {
      discrimination_risk: "إشارات تمييز أو عدالة حساسة",
      exception_request: "طلب استثناء أو موافقة خاصة",
      frustrated_customer_language: "لغة عميل غاضبة أو متصاعدة",
      legal_escalation_risk: "إشارات قانونية أو تنظيمية"
    },
    en: {
      discrimination_risk: "discrimination or fairness-risk language",
      exception_request: "an exception or special-approval request",
      frustrated_customer_language: "frustrated or escalated customer language",
      legal_escalation_risk: "legal or regulatory escalation language"
    }
  } as const;

  return labels[locale][signal];
}

function getHandoverCustomerUpdateQaPolicySignalSummary(locale: SupportedLocale, signal: HandoverCustomerUpdateQaPolicySignal) {
  const labels = {
    ar: {
      discrimination_risk: "صياغة قد تخلق تمييزاً أو عدالة حساسة",
      legal_claim_risk: "ادعاءات قانونية أو تنظيمية غير آمنة",
      possession_date_promise: "وعد صريح بموعد تسليم أو مفاتيح",
      pricing_or_exception_promise: "وعد سعري أو استثناء يحتاج اعتماداً"
    },
    en: {
      discrimination_risk: "discrimination or fairness-risk language",
      legal_claim_risk: "unsafe legal or regulatory claims",
      possession_date_promise: "an explicit possession-date or key-release promise",
      pricing_or_exception_promise: "a pricing or exception promise that needs approval"
    }
  } as const;

  return labels[locale][signal];
}

function collectMatches<TSignal extends string>(
  message: string,
  lexicon: Array<{
    patterns: RegExp[];
    signal: TSignal;
  }>
) {
  const normalizedMessage = message.trim();

  if (normalizedMessage.length === 0) {
    return [];
  }

  const matches: Array<{ evidence: string; signal: TSignal }> = [];
  const seenSignals = new Set<TSignal>();

  for (const rule of lexicon) {
    for (const pattern of rule.patterns) {
      const match = normalizedMessage.match(pattern);

      if (!match || seenSignals.has(rule.signal)) {
        continue;
      }

      matches.push({
        evidence: match[0],
        signal: rule.signal
      });
      seenSignals.add(rule.signal);
      break;
    }
  }

  return matches;
}

function joinLabels(locale: SupportedLocale, labels: string[]) {
  if (labels.length <= 1) {
    return labels[0] ?? "";
  }

  if (labels.length === 2) {
    return locale === "ar" ? labels.join(" و") : labels.join(" and ");
  }

  const leadingLabels = labels.slice(0, -1).join(", ");
  const trailingLabel = labels.at(-1);

  return locale === "ar" ? `${leadingLabels} و${trailingLabel}` : `${leadingLabels}, and ${trailingLabel}`;
}
