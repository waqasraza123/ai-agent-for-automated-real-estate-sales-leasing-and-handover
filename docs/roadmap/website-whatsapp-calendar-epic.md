# Website To WhatsApp To Calendar Epic

## Objective

Implement one end-to-end operational workflow for the narrowed MVP:

`website lead capture -> persisted case -> immediate bilingual WhatsApp reply -> qualification/follow-up orchestration -> Google Calendar booking -> manager-visible delivery and risk state`

This epic makes the existing core wedge real for one live workflow without broadening the product into handover or deeper governance work.

## Product Boundaries

- Primary live messaging channel: Meta WhatsApp Cloud API
- Primary live booking provider: Google Calendar
- Core surfaces in scope:
  - lead inbox
  - case timeline and conversation console
  - manager queue
  - scheduling and document readiness views
- Explicitly out of scope:
  - CRM sync
  - handover workflow expansion
  - multi-provider breadth

## Delivery Shape

### Shared Integration Layer

- Add a shared `integrations` workspace package
- Expose provider-backed interfaces for:
  - WhatsApp outbound send
  - Google Calendar event booking
  - Meta webhook payload parsing
- Keep provider details behind typed interfaces so API and worker logic stay provider-aware but not provider-entangled

### Contracts And Persistence

- Extend shared contracts to expose:
  - lead source including `whatsapp`
  - case channel summary
  - outbound delivery status and failure state
  - latest inbound WhatsApp activity
  - visit booking summary and provider event status
- Extend persistence with:
  - normalized phone storage
  - case channel state
  - visit booking state
  - richer automation job payload and retry metadata
- Keep the conversation console projection audit-backed rather than introducing a separate message aggregate in this step

### API And Worker

- Website intake continues to create the case and now also queues an initial WhatsApp reply when the case is eligible
- Cases without a usable phone number stay visible but surface a blocked outbound state instead of silently pretending delivery
- Meta webhook endpoints handle:
  - inbound messages
  - outbound status updates
- Google Calendar booking runs on visit save and records confirmed vs failed booking state
- Worker processes queued initial WhatsApp replies, bounded retries, and terminal failure escalation into the manager queue

### Web Behavior

- Lead and manager views expose:
  - latest channel
  - latest outbound delivery status
  - latest inbound contact time
  - booking confirmation state
  - provider failure signals
- Conversation view shows outbound send state and inbound WhatsApp messages from audit-backed projections
- Scheduling view shows local visit state plus Google Calendar confirmation or failure

## Defaults

- WhatsApp provider: Meta Cloud API
- Calendar provider: Google Calendar
- Phone matching key for inbound WhatsApp: normalized phone number
- Website leads without phone numbers:
  - create the case
  - do not queue outbound send
  - surface a blocked outbound state and manager-visible follow-up need
- QA holds block automated customer-facing sends
- Initial retry policy:
  - retry transient WhatsApp send failures with bounded attempts
  - stop and open manager attention on terminal failure

## Verification

- Website lead with valid phone queues and sends the first WhatsApp reply
- Website lead without phone creates a case with blocked outbound state
- QA-held case suppresses automated outbound send until the hold clears
- Inbound WhatsApp message attaches to the correct case by normalized phone
- Google Calendar booking persists confirmed or failed booking state on the visit
- Manager views surface delivery failure, booking failure, and overdue follow-up risk without silent success states
