# Product Spec

## Product Name

AI Agent for Automated Real Estate Sales, Leasing & Handover

## Product Truth

This document is the authoritative product source of truth for this repository until implementation maturity requires a broader architecture and delivery document set.

## Product Positioning

This product is a bilingual real-estate operations system for teams that lose revenue and trust through slow response, weak follow-up discipline, inconsistent qualification, and scattered customer communication.

The product is not positioned as a generic AI platform and is not sold on autonomous deal-closing claims. It is sold on operational control:

- faster first response
- stronger follow-up discipline
- more consistent qualification
- cleaner document readiness
- clearer manager visibility
- safer human takeover and escalation
- premium Arabic and English customer experience

## Current Product Focus

The current product focus is intentionally narrow:

- primary use case: inbound sales and leasing inquiries
- core wedge: bilingual lead response and follow-up operations
- main workflow: `lead -> qualify -> schedule -> follow up -> documents -> manager visibility`

Handover remains part of the long-term product vision, but it is not the near-term product wedge and should not dominate roadmap decisions before the core operational workflow is proven with real channels and measurable KPI improvement.

## Markets And Languages

### Primary Market

- Saudi Arabia

### Secondary Expansion Market

- United States, only after the primary wedge is proven

### Supported Languages

- Arabic
- English

Arabic is a first-class product language and must be treated as a full RTL experience across navigation, layout, forms, tables, messaging, reporting, and customer-facing flows.

## Primary Buyer

The default buyer for the next phase of product development is:

- Saudi real-estate developer sales and leasing teams

This buyer is the priority because the product has a real point of differentiation there:

- bilingual Arabic and English customer handling
- high operational pressure on inbound response and follow-up
- document-heavy qualification and reservation steps
- manager need for visible SLA control and escalation

## Secondary Buyers

Secondary buyers are future expansion candidates, not equal near-term targets:

- brokerages
- leasing operators
- compounds and community operators
- property-management groups

## Primary Users

- sales managers
- leasing managers
- sales and leasing agents
- lead-operations staff
- document or coordination staff

Executive reporting, QA reviewers, and handover coordinators remain valid users later, but they are not the primary design center for the next execution phase.

## Why Buyers Will Pay

Buyers already feel the cost of:

- delayed response to inbound leads
- weak follow-up after the first contact
- inconsistent qualification between agents
- fragmented communication across channels
- poor visibility into stalled cases
- manual document chasing with no clear owner or SLA

The first commercial wedge is operational revenue discipline, not broad workflow coverage.

## Core Problems To Solve

### Lead Capture And First Response

- inbound leads arrive across multiple channels
- after-hours and high-volume periods create missed or delayed replies
- bilingual handling is inconsistent
- teams lack one shared view of the case and conversation history

### Qualification And Scheduling

- qualification logic is inconsistent between agents
- visits are booked before seriousness, fit, or readiness are clear
- next-best action is often left implicit instead of assigned

### Follow-Up And Manager Visibility

- prospects go silent and cases stall without clear reasons
- managers see pipeline counts without follow-up quality
- reassignment, intervention, and pause decisions happen too late

### Documents

- required documents are requested manually
- missing or outdated documents are discovered too late
- document readiness is not visible from one manager-readable timeline

## Core Outcomes

- capture inbound leads into one operational queue
- respond immediately in Arabic or English
- guide qualification through consistent structured prompts
- schedule calls or visits when thresholds are met
- maintain disciplined follow-up with visible next actions and due times
- track document readiness with clear status, owner, and escalation
- give managers a live view of risky, overdue, and blocked cases
- preserve safe human takeover, approvals, and auditability

## Product Principles

- lead with operational credibility, not generic AI language
- keep humans visibly in control of commercial judgment
- make timelines, owners, due times, and blockers explicit
- prioritize response speed without sacrificing trust
- treat bilingual workflows as a product advantage, not a translation layer
- treat manager intervention as a workflow, not a reporting afterthought
- avoid broad platform claims before the core wedge is proven

## Recommended Commercial Model

- start with one Saudi developer sales or leasing team as a design-partner deployment
- sell onboarding and workflow configuration separately from the recurring subscription
- include bilingual setup, channel setup, qualification logic, follow-up rules, and manager queue views in the first paid package
- defer broader enterprise packaging until KPI proof exists on the primary workflow

## MVP Scope

The near-term MVP is intentionally limited to four surfaces:

- lead inbox
- case timeline and conversation console
- manager SLA and risk queue
- document checklist and readiness view

These four surfaces are the product. Additional surfaces must justify themselves against the core wedge.

## Product Surfaces And Workspaces

### Core Workspaces

- sales workspace
- leasing workspace
- manager workspace

### Core Page Set

- landing and sign-in
- lead inbox
- lead or case detail
- conversation console
- scheduling panel
- document checklist
- manager command center

### Deferred Or Secondary Surfaces

- executive workspace
- full reports and analytics suite
- marketing workspace
- handover command center
- broad admin governance surfaces

### Page State Requirements

- every major page must have polished empty, loading, partial-data, and error states
- no critical view should rely on an unexplained blocking spinner
- every critical case detail page must show owner, current stage, next action, last meaningful change, and escalation path
- tables must stay usable on desktop, laptop, and tablet

## System Design

The product should be described externally as three supervised systems, not a large collection of named agents.

### Core Systems

- Intake and Conversation System: captures leads, deduplicates basic records, opens the case, sends first reply, and asks structured next-best questions in Arabic or English
- Workflow and Follow-Up System: drives qualification state, scheduling readiness, reminders, next actions, due times, and document chase logic
- QA and Escalation System: enforces human takeover, policy checks, approval boundaries, and auditability

Internal implementation can still use smaller services or agent-like components, but the product plan should not depend on a complex many-agent narrative.

### Human Override And Escalation Rules

- no automated system may commit pricing exceptions, incentives, legal promises, or possession commitments outside approved rules
- low-confidence cases, angry customers, sensitive escalations, discrimination-risk language, and exception requests must route to a human owner
- every automated suggestion must be inspectable by trigger, inference, next action, and approval or override state
- managers must be able to pause an automation path immediately

## Core Workflows

### Buyer Or Tenant Lead Workflow

1. Lead enters through a real channel and opens a case
2. The system replies immediately in the preferred language
3. Qualification captures timing, budget, property fit, and readiness
4. Scheduling is offered only when the case meets defined thresholds
5. Follow-up keeps the case active when the prospect pauses
6. Manager views show owner, stage, risk, and next action

### Document Workflow

1. Once the case reaches document mode, required items are requested from one visible checklist
2. Each requested item has status, due date, and owner visibility
3. Missing or rejected items remain visible in the case and manager views
4. The case cannot silently stall without a visible blocker

### Manager Intervention Workflow

1. A case becomes overdue, blocked, or risky
2. The manager queue shows the reason, current owner, and next action gap
3. The manager reassigns, edits the plan, pauses automation, or forces takeover
4. The action is recorded in the case history

## Bilingual Experience Requirements

- every core workflow must be usable in Arabic and English from day one
- Arabic must support true RTL layout without visual compromise
- each case must store customer preferred language separately from staff UI language
- staff must be able to inspect original text and normalized interpretation where needed
- templates, tone rules, disclosures, and project knowledge should be configurable per language rather than machine-translated at send time

### Arabic UX Rules

- the Arabic experience must look designed for Arabic, not merely translated
- cards, tables, forms, and threads must remain fully legible in RTL
- original text and translation or summary should remain visible in sensitive situations
- Arabic tone must feel professional and locally appropriate for Saudi real-estate contexts

## AI Behavior Boundaries

### AI May Do Automatically

- answer approved project, property, and process questions
- ask standard qualification questions
- propose or confirm appointments within approved logic
- send reminders, nudges, summaries, and document requests
- prepare manager summaries, call notes, and case briefs

### AI Must Not Do Without Human Approval

- commit pricing, discounts, incentives, or commercial terms outside approved rules
- promise handover, approval, possession, or inventory that is not explicitly available
- provide legal, financing, or regulatory advice beyond approved content
- invent availability, status, or document readiness
- continue sensitive discussions after repeated confusion, frustration, or compliance risk

### Escalation Triggers

- low confidence or conflicting data
- angry or legally sensitive customer language
- fairness, discrimination, or policy-risk signals
- exception requests outside approved workflow
- high-value or VIP-case rules if configured

## Design And Experience Standard

The product must feel premium, calm, bilingual, and operationally serious from the first demo, but visual polish must support the operational wedge rather than distract from it.

### Visual Direction

- strong hierarchy
- calm and premium bilingual typography
- restrained but confident color use
- operational command-center feel
- clear status and risk communication

### Deliberate Wow Moments

- inbox clarity under high inbound volume
- bilingual conversation console with visible human takeover controls
- case timeline that makes follow-up and document readiness legible
- manager queue that makes intervention decisions obvious

## Quality Bar

- premium, credible UX
- clean information architecture
- maintainable, typed, modular codebase
- strong local development experience
- testing that protects core workflows

## Delivery And Technical Direction

This section is product-directional, not an instruction to begin implementation immediately.

### Product Delivery Phases

- Phase 1: focused product reset
  rewrite the product story around the primary ICP, freeze the MVP to the four core surfaces, and remove near-term roadmap pressure from broad handover and governance work
- Phase 2: operational MVP with real channels
  make the core workflow production-capable through website lead capture, WhatsApp messaging, qualification state, visit scheduling, follow-up visibility, and manager review
- Phase 3: document workflow depth
  add document request tracking, status visibility, rejection reasons, and blocked-case handling
- Phase 4: reporting and controls that directly support the proven wedge
  add the smallest useful set of analytics, approvals, and QA controls tied to the live workflow
- Phase 5: handover as an add-on workflow
  add handover only after the core sales and leasing operating wedge is proven with design-partner KPI movement

### Recommended Technical Direction

- web application: Next.js App Router
- internationalization: `next-intl` with robust Arabic and English routing and RTL-aware rendering
- backend and BFF: typed Node.js services with dedicated background workers
- data and storage: relational database, queue-backed workers, and object storage
- testing: Playwright for end-to-end and browser-based component testing
- local development: containerized workflows with conservative Intel MacBook Pro 2019 resource assumptions

### Real Integration Priorities

Before broader workflow depth, the next product milestone should include real integrations for:

- website lead capture
- WhatsApp inbound and outbound messaging
- calendar scheduling
- document upload and storage
- CRM export or synchronization

## Quality Strategy

### Test Layers Required Early

- unit tests for workflow rules
- component tests in a real browser context
- integration tests across services and persistence
- contract tests for adapters and APIs
- end-to-end tests for the real lead-to-manager journey
- localization tests for Arabic, English, and RTL
- accessibility tests
- security tests around roles, documents, and auditability
- prompt and policy evaluation tests for tone and escalation behavior

### Critical Flows That Must Always Pass

- English website lead to response to qualification to visit booking to manager visibility
- Arabic WhatsApp lead to Arabic response to qualification to document request to manager visibility
- silent prospect handled correctly by follow-up automation with manager visibility
- human takeover without losing history or state
- restricted request escalating instead of receiving an unsafe automated answer
- provider failure not causing silent message loss or duplicate sending

### Release Gates

- no regression in bilingual routing, Arabic layout, or mixed-language rendering
- no conversation-state bug that can double-send, lose ownership, or corrupt stage history
- no AI path that bypasses a high-risk escalation rule
- no unresolved access-control issue involving conversations, documents, or manager views
- no performance regression that makes inbox or manager queues feel sluggish on realistic data

## Reliability, Security, Auditability, And Observability

### Reliability

- no silent failure for outbound messages, reminders, or document requests
- every important job must show queued, running, completed, failed, retried, or escalated state
- duplicate suppression and idempotency are required for provider callbacks and sends
- operators must be able to re-run or cancel stuck actions safely

### Auditability

- every automated message, suggestion, summary, and state change must be attributable to source and timestamp
- human overrides, approvals, and pauses must capture actor, reason, and time
- important case pages should expose a readable event timeline

### Security

- role-based access must be enforced consistently across documents, conversations, cases, and manager views
- sensitive documents and customer data must never be exposed through weak URLs or weak client-only checks
- environment secrets, provider tokens, and audit logs are first-class infrastructure concerns

### Observability

- operational dashboards must show message failures, queue backlog, scheduler issues, and policy anomalies
- each release must leave enough traces and logs to support practical production debugging

## KPI Proof For Design Partners

The product should be judged first on these five metrics:

- first-response median and 90th percentile
- lead contact rate within 15 minutes
- qualified-to-visit rate
- overdue follow-up rate
- average document completion time

Secondary metrics can be added later, but these five are the proof of the wedge.

## Scope Boundaries And Explicit Non-Claims

- the product is not a promise of autonomous deal closing
- the product does not replace sales managers, leasing managers, or agents
- the product is not currently optimized for multi-market breadth
- handover is part of the long-term vision, not the near-term proof point
- no pricing, financing, or legal automation should be implied beyond approved content and workflows

## References Embedded In The Source Spec

- REGA Saudi PropTech Hub
- Saudi Vision 2030 housing program
- NAR responsible AI guidance
- NAR AI policy references
- Zillow buyer behavior research
- Next.js internationalization guidance
- `next-intl` documentation
- Playwright documentation
- Docker Desktop for Mac documentation
- Node.js LTS guidance
