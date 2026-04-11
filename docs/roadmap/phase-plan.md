# Phase Plan

## Purpose

Translate the product specification into a realistic sequence of implementation phases that can be executed cleanly from this empty repository.

## Planning Assumptions

- Start narrow and ship a polished first slice
- Avoid real provider integrations until the product shell and workflow language are stable
- Use the demo phase to lock UX, route structure, domain vocabulary, and testing habits
- Treat bilingual quality and auditability as first-order concerns from the start

## Exact First Implementation Phase

### Phase 1A: Flagship Demo Core

This is the first implementation phase.

Its job is to create a polished, bilingual, fixture-backed product shell that proves the visual story, route structure, and core workflow vocabulary without claiming real automation or production integrations.

## Phase 1A In Scope

- Monorepo foundation for the first buildable packages and apps
- Next.js web app with English and Arabic routing
- Premium shared UI system tuned for dashboard, inbox, timeline, document, and handover views
- Seeded fixture data representing realistic leads, visits, document blockers, and handover states
- Route-level experience for:
  - home dashboard
  - lead inbox
  - lead or prospect profile
  - conversation console
  - scheduling view
  - document center
  - handover workspace
  - manager command center
- Human takeover states and visible automation status states in the UI
- Responsive desktop and laptop layouts with usable tablet fallbacks
- Playwright smoke coverage for the primary demo journeys
- Basic accessibility, visual regression, and bilingual rendering checks for top-tier pages

## Phase 1A Out Of Scope

- Real authentication and organization management
- Real database persistence
- Real API and worker services
- Real omnichannel ingestion
- Real WhatsApp, email, SMS, calendar, storage, or CRM integrations
- Real AI inference, live qualification scoring, or automated follow-up execution
- Production approval engine
- Full leasing workflow enforcement
- Real document uploads
- Multi-office enterprise controls

## Phase 1A Exit Criteria

- A high-quality demo can be run locally with convincing seeded data
- English and Arabic routes both look intentional and stable
- Core product surfaces feel coherent and premium
- Navigation, page states, and key interaction patterns are set well enough that later backend work will not force a major redesign
- Browser automation catches obvious regressions on the demo path

## Phase 1B: Demo Hardening

- Improve motion, loading states, empty states, and responsive quality
- Expand seeded analytics and state variants
- Add higher-confidence visual regression coverage
- Tighten design-system consistency before real backend work expands

## Phase 2: Functional Alpha

### Goal

Make one workflow real end to end:

`lead capture -> qualification -> visit scheduling -> follow-up visibility -> manager review`

### Scope

- Introduce `apps/api`, `apps/worker`, `packages/contracts`, `packages/database`, and `packages/workflows`
- Persist cases, conversations, visits, tasks, and audit events in PostgreSQL
- Implement one ingestion path first, ideally website lead capture
- Implement queue-backed follow-up and SLA checks
- Add manager-visible state transitions and audit history

### Exit Criteria

- A new inbound lead can become a persisted case
- Qualification data can be captured and reviewed
- A visit can be scheduled and reflected in the case timeline
- Overdue follow-up appears in manager views
- Playwright and integration coverage protect the core alpha flow

## Phase 3: Leasing And Document Workflows

- Add leasing-specific qualification rules
- Add document request and completeness tracking
- Add rejection reasons and blocked-case visibility
- Add Arabic-first leasing scenarios to test coverage

## Phase 4: Handover Command Center

- Add handover case creation from upstream deal state
- Add milestones, dependencies, blockers, and customer update flows
- Add manager risk visibility for handover readiness

## Phase 5: Enterprise Controls And Hardening

- Add stronger role and permission enforcement
- Add QA sampling and approval rules
- Add deeper analytics and reporting
- Add provider adapters and operational retry tooling
- Add stronger observability and release gates

## Sequence Rules

- Do not start provider integrations before Phase 2 core state and auditability are in place
- Do not start heavy enterprise controls before the core operating flow is credible
- Do not start payment, escrow, or financing layers in the initial roadmap

## Recommended Delivery Rhythm

- One narrow implementation phase at a time
- Keep route structure and domain terms stable before broadening backend scope
- Expand test coverage with every phase rather than deferring test discipline
