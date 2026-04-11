# English Arabic RTL Strategy

## Purpose

Define how the product will treat English and Arabic as first-class experiences rather than bolting Arabic on later.

## Core Rules

- English and Arabic are equal product languages
- Arabic is not a translation mode; it is a first-class RTL product experience
- Customer language preference is separate from operator UI locale
- Sensitive customer communication must not rely on runtime machine translation alone

## Locale Model

### UI Locales

- `en`
- `ar`

### Market Context

Use market context separately from UI locale for formatting and policy defaults:

- United States defaults: `en-US`
- Saudi Arabia defaults: `ar-SA` and market-aware English formatting where needed

This avoids overcoupling route structure to market deployment.

## Routing Strategy

- Use locale-prefixed routes from the start
- Keep route names consistent across locales
- Do not create Arabic-only or English-only feature branches in navigation structure

Examples:

- `/en/dashboard`
- `/ar/dashboard`
- `/en/leads/[caseId]`
- `/ar/leads/[caseId]`

## Copy Ownership Strategy

- Store approved English and Arabic copy separately
- Keep product UI labels, disclosures, workflow messages, and canned templates versioned by language
- Do not generate Arabic copy by translating English strings at send time for sensitive workflows

## Layout And Styling Rules

- Use logical CSS properties, not hard-coded left and right assumptions
- Support direction switching at the layout root
- Ensure tables, filters, drawers, chips, and timelines remain legible in RTL
- Design components so icons, chevrons, and affordances mirror correctly when direction changes

## Typography Rules

- Choose typefaces that hold quality in both Arabic and English
- Avoid pairing that makes one script feel secondary
- Test headings, chips, timestamps, cards, and dense tables in both languages

## Message And Conversation Rules

- Preserve original inbound customer text
- Allow operators to inspect normalized interpretation where needed
- Show whether a draft was written directly in the target language or translated from another internal representation
- Keep bilingual thread rendering readable without forcing constant context switching

## Template And Disclosure Rules

- Maintain approved templates per language
- Maintain disclosure language per language
- Maintain project knowledge entries in both languages where customer-facing content is required
- Mark content that is approved for automation vs content that requires human review

## Data Model Requirements

Each customer-facing case should store:

- preferred customer language
- source language if known
- operator UI locale
- market context
- original message body
- normalized or translated interpretation when created

## UX Requirements For Phase 1A

- Every planned flagship demo route must exist in both English and Arabic
- Both locales must have realistic seeded content
- Dashboard, inbox, conversation, document, and handover views must be reviewed in RTL
- Empty, loading, and error states must exist in both languages

## Testing Requirements

- Playwright must cover at least one English and one Arabic route from the start
- Visual regression baselines should include Arabic dashboard and conversation views
- Accessibility checks must run in both locales on critical pages

## Non-Negotiable Anti-Patterns

- No mirrored screenshots pretending to be real Arabic design
- No untranslated fallback strings on key surfaces
- No left-to-right assumptions in timeline, drawer, or table components
- No hidden dependence on English for agent controls or manager visibility
