# Phase Plan

## Purpose

Translate the product specification into a realistic execution sequence that proves one commercially useful wedge before broadening the platform.

## Planning Assumptions

- start with one ICP and one narrow workflow
- prioritize real operational value over broad surface coverage
- prove the product with real channels before expanding workflow depth
- treat bilingual Arabic and English quality as a first-order product advantage
- keep handover in the long-term vision but out of the near-term critical path

## Exact Next Product Phase

### Phase 1: Focus Reset And MVP Narrowing

This is the immediate next product phase.

Its job is to lock the product around the primary ICP and freeze the near-term MVP so future work is judged against the core wedge instead of broad platform ambition.

## Phase 1 In Scope

- rewrite the product story around Saudi developer sales and leasing teams
- narrow the near-term MVP to:
  - lead inbox
  - case timeline and conversation console
  - manager SLA and risk queue
  - document checklist
- demote broad handover, executive, and governance surfaces from near-term roadmap priority
- align product copy, route priorities, and design decisions with the core operational wedge
- define the KPI proof set:
  - first-response time
  - 15-minute contact rate
  - qualified-to-visit rate
  - overdue follow-up rate
  - average document completion time

## Phase 1 Out Of Scope

- expanding the number of target buyer categories
- treating the United States as a co-equal primary market
- deeper handover execution workflow work
- broader reporting suites beyond what supports the core wedge
- new internal complexity justified only by the many-agent narrative

## Phase 1 Exit Criteria

- the source spec and roadmap clearly describe one primary ICP
- the MVP is explicitly limited to the four core surfaces
- non-core surfaces are clearly marked as deferred or secondary
- KPI proof is defined and becomes the basis for roadmap decisions

## Phase 2: Operational MVP With Real Channels

### Goal

Make the core workflow real end to end:

`lead capture -> bilingual response -> qualification -> scheduling -> follow-up visibility -> manager review`

### Scope

- real website lead capture
- real WhatsApp inbound and outbound messaging
- case creation and ownership rules
- qualification state capture
- calendar-backed visit or call scheduling
- follow-up rules, overdue detection, and manager queue visibility
- audit trail for automated and human actions

### Exit Criteria

- a real inbound lead can become a persisted case through a live channel
- the system can respond in Arabic or English through a real channel
- a visit or call can be scheduled through a real calendar path
- overdue follow-up appears in manager views with actionable context
- core end-to-end tests protect the live workflow

## Phase 3: Document Workflow Depth

### Goal

Add the minimum document workflow needed to support the proven wedge.

### Scope

- document request tracking
- document upload and storage
- requirement status visibility
- rejection reasons and re-request handling
- blocked-case visibility in case and manager views

### Exit Criteria

- required documents are visible from one checklist
- missing, received, rejected, and complete states are manager-readable
- document delays can be tied to owner, due date, and current blocker

## Phase 4: Wedge-Supporting Controls And Reporting

### Goal

Add only the controls and analytics that directly improve the live operating workflow.

### Scope

- manager KPI reporting for the five proof metrics
- minimal QA and escalation controls on risky automated paths
- role and permission hardening on the live workflow
- operational retry and failure visibility for live channels

### Exit Criteria

- design partners can see whether the product is improving the core KPIs
- risky automated interactions can be paused, reviewed, and overridden safely
- production debugging is practical for message, scheduling, and document failures

## Phase 5: Handover Add-On

### Goal

Expand into handover only after the core sales and leasing operating wedge is proven.

### Scope

- handover case creation from upstream approved cases
- milestones, dependencies, blockers, and customer update flows
- manager readiness and risk visibility

### Entry Rule

Do not prioritize this phase until the core workflow is live with real integrations and the primary KPI set shows credible improvement for at least one design-partner deployment.

## Sequence Rules

- do not broaden ICP before proving the primary one
- do not build deep handover workflow before real channel integrations exist
- do not add broad governance and analytics suites before the core workflow is live
- do not let internal multi-agent decomposition drive roadmap scope
- do not start payment, escrow, or financing layers in the initial roadmap

## Recommended Delivery Rhythm

- one narrow product decision at a time
- one commercially meaningful workflow at a time
- one real-channel milestone before broader workflow depth
- expand test coverage with each phase rather than deferring proof
