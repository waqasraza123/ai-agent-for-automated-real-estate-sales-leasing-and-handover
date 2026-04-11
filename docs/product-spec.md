# Product Spec

## Product Name

AI Agent for Automated Real Estate Sales, Leasing & Handover

## Product Truth

This document is the authoritative product source of truth for this repository until implementation maturity requires a broader architecture and delivery document set.

## Product Positioning

This product is a premium bilingual operating layer for real-estate companies. It automates repetitive operational work around sales, leasing, and handover without pretending to replace human closers, managers, or coordinators.

The product should help teams capture leads, respond instantly, qualify prospects, schedule visits, run follow-up discipline, request and track documents, coordinate internal teams, and make handover visible and accountable.

The commercial promise is operational excellence, not vague AI magic:

- Faster response
- Better follow-up discipline
- Higher visit-booking throughput
- Clearer document readiness
- Stronger manager visibility
- More controlled handover execution
- Premium bilingual customer experience

## Markets And Languages

### Primary Markets

- United States
- Saudi Arabia

### Supported Languages

- English
- Arabic

Arabic is a first-class product language and must be treated as a full RTL experience across navigation, layout, forms, tables, messaging, reporting, and customer-facing flows.

## Primary Buyers

- Brokerages
- Real-estate developers
- Compounds and residential communities
- Leasing teams and operators
- Property-management groups

## Primary Users

- Executive and owner stakeholders
- Sales managers
- Leasing managers
- Sales and leasing agents
- Handover coordinators
- Marketing and lead-operations staff
- Compliance and QA reviewers
- Operations and admin staff

## Why Buyers Will Pay

Buyers already feel the cost of:

- Missed or delayed lead response
- Weak follow-up discipline
- Inconsistent qualification
- Scattered channel conversations
- Manual document chasing
- Poor manager visibility into stalled deals
- Chaotic handover coordination

The first commercial wedge is revenue and operations discipline before optional payment or escrow layers.

## Core Problems To Solve

### Lead Capture And First Response

- Missed calls after hours, on weekends, or during campaigns
- Website, portal, WhatsApp, SMS, and email leads landing in separate places
- Slow or inconsistent first response quality
- No automatic language handling for Arabic and English
- No shared evidence of who responded, what was said, and what happens next

### Qualification And Appointment Management

- No consistent definition of a qualified buyer or tenant
- Site visits booked before readiness is checked
- No-show risk not handled proactively
- Project-specific qualification rules living in people’s heads

### Follow-Up And Pipeline Discipline

- Warm prospects vanishing after silence, shift changes, or overload
- Managers seeing pipeline counts without follow-up quality
- Cases stalling without visible reasons

### Documents, Approvals, And Reservation

- IDs, approvals, employer letters, trade licenses, proof-of-funds, and forms collected manually
- Missing or outdated documents discovered too late
- Approval steps lacking owner, SLA, and escalation logic

### Handover Execution

- Sales, operations, project, and customer-care teams working from separate lists
- Customers receiving mixed messages
- Managers discovering readiness issues late

## Core Outcomes

- Capture and unify inbound leads from multiple channels
- Reply immediately in Arabic or English
- Qualify prospects with consistent AI-supported logic
- Recommend suitable properties or units
- Book calls, viewings, and site visits intelligently
- Keep leads warm automatically through disciplined follow-up
- Move cases through sales and leasing stages with visible ownership
- Request, track, and escalate missing documents
- Support manager oversight, approvals, and interventions
- Coordinate handover tasks, milestones, and customer communications
- Provide strong dashboards, auditability, and operational visibility

## Product Principles

- Lead with operational credibility, not generic AI language
- Keep humans visibly in control of commercial judgment
- Show exact timelines, owners, status states, and auditability
- Prioritize response speed without sacrificing trust
- Treat bilingual workflows as a product advantage, not a translation layer
- Treat manager insight as a core workflow, not a reporting afterthought
- Treat handover as part of the revenue lifecycle, not a separate side process

## Customer Types And Deployment Model

### Customer Types

- Brokerage: portal leads, website forms, ad leads, WhatsApp inquiries, showing coordination
- Developer sales team: project inquiry handling, reservation flow, site visits, document chase
- Leasing operator: tenant qualification, viewing scheduling, paperwork, renewal workflows
- Compound or community operator: move-in coordination, resident inquiries, readiness and handover
- Property-management group: tenant lifecycle, renewals, notices, service communication, readiness workflows

### Recommended Commercial Model

- Start with one office, one project, or one leasing team as a design-partner deployment
- Sell onboarding and workflow design separately from the ongoing platform subscription
- Include bilingual setup, knowledge-base import, channel configuration, and a manager dashboard in the first paid package
- Keep a premium enterprise tier for multi-office rollout, stricter approvals, QA tooling, and deeper reporting

## User Roles And Their Core Needs

- Executive or owner: top-line visibility into lead volume, response speed, visits, reservations, leasing throughput, handover readiness, and team performance
- Sales manager: assignment control, follow-up SLA visibility, quality review, call summaries, visit throughput, and weak-performer detection
- Leasing manager: qualification, document completeness, viewing outcomes, approval status, renewal queues, and blocked-case visibility
- Sales or leasing agent: clean inbox, suggested replies, next actions, summaries, reminders, and less repetitive admin work
- Handover coordinator: readiness checklist, blocker owner, dependency timeline, customer history, and escalation tools
- Marketing or lead operations: source attribution, lead-quality feedback, channel performance, and campaign learning loops
- Compliance or QA reviewer: conversation visibility, disclosure safety, escalation handling, and evidence that AI stayed inside approved boundaries

## Product Surfaces And Workspaces

### Core Workspaces

- Executive workspace
- Sales workspace
- Leasing workspace
- Handover workspace
- Marketing and lead-operations workspace
- Admin and QA workspace

### Core Page Set

- Landing and sign-in
- Home and overview dashboard
- Lead inbox
- Lead or prospect profile
- Conversation console
- Qualification workspace
- Scheduling workspace
- Document center
- Deal board
- Project or property page
- Handover workspace
- Manager command center
- Reports and analytics
- Settings and governance

### Page State Requirements

- Every major page must have polished empty, loading, partial-data, and error states
- No critical view should rely on an unexplained blocking spinner
- Every critical case detail page must show owner, current stage, next action, last meaningful change, and escalation path
- Tables must stay usable on desktop, laptop, and tablet

## Agent System Design

The product should use a supervised multi-agent system with explicit responsibilities and visible handoffs rather than one opaque assistant.

### Core Agents

- Lead Intake Agent: consolidates leads, deduplicates, enriches context, classifies source and urgency, opens the case timeline
- Conversation Agent: sends first reply, asks next-best question, adapts to English or Arabic, captures intent
- Qualification Agent: applies qualification logic and scores seriousness, fit, affordability, timing, and readiness
- Scheduling Agent: offers slots, confirms appointments, sends reminders, manages reschedules, captures outcomes
- Follow-Up Agent: runs next-action discipline, summarizes what is missing, keeps the case warm
- Document Agent: requests documents, validates checklist completeness, reminds prospects, escalates missing items
- Deal Progress Agent: summarizes the case, updates status, highlights blockers, prepares handoff notes
- Handover Agent: coordinates readiness tasks, customer communication, snag visibility, access and key steps, milestone completion
- Manager Insight Agent: surfaces bottlenecks, overdue tasks, risky cases, trends, and recommended interventions
- QA and Safety Agent: checks drafts, disclosure boundaries, policy compliance, language quality, escalation rules, and hallucination risk

### Human Override And Escalation Rules

- No agent may commit legal promises, pricing exceptions, financial approvals, or possession dates outside explicit approved rules
- Low-confidence cases, angry customers, sensitive escalations, discrimination-risk language, and exception requests must route to a human owner
- Every automated suggestion must be inspectable: trigger, inference, next action, and approval or override state
- Managers must be able to pause an agent, workflow, channel, or project-level automation immediately

## Core Workflows

### Buyer Lead Workflow

1. Lead Intake Agent creates the case, checks duplicates, and assigns source and project context
2. Conversation Agent replies immediately in the preferred language and asks the minimum next-best qualification question
3. Qualification Agent scores seriousness and fit once enough data exists
4. Scheduling Agent offers a call or site visit when thresholds are met
5. Follow-Up Agent keeps the thread alive if the buyer pauses
6. Managers keep full visibility into timeline, score, and next action

### Leasing Workflow

1. Conversation Agent confirms property interest, move-in timeline, budget, employer or company type, and document readiness
2. Qualification Agent flags likely blockers early
3. Scheduling Agent books a viewing or leasing call
4. Document Agent requests and tracks leasing documents
5. Leasing manager approves, rejects, or requests clarification from one visible timeline

### Reservation And Document Workflow

1. Deal Progress Agent moves the case into reservation or application mode
2. Document Agent requests each required item with due dates and reminders
3. Internal approval tasks are created with owner and SLA
4. The case cannot silently stall; blockers must always be visible

### Handover Workflow

1. Handover Agent opens a project-specific readiness checklist and milestone timeline
2. Internal dependencies are assigned to named owners with due dates
3. Customer updates are sent at approved milestones in Arabic or English
4. Managers see readiness, blockers, snag state, appointments, and completion risk before customer confidence drops

## Domain Model

### Core Business Objects

- Lead: inbound inquiry before deep qualification
- Prospect: more qualified person or company with structured details and active intent
- Property or project: inventory or project context tied to the case
- Conversation: channel-specific message thread with summaries and actions
- Task: required action with owner and due date
- Visit: scheduled call, viewing, or site visit with outcome
- Document request: required item or checklist entry
- Deal or application: active commercial case after qualification
- Handover case: journey from readiness to completed handover
- Agent action: AI-proposed or AI-executed action

### Suggested Workflow States

#### Lead Lifecycle

`new -> acknowledged -> engaged -> qualified -> scheduled -> visited -> active deal -> won | lost | paused`

#### Leasing Lifecycle

`new -> engaged -> qualified -> viewing booked -> documents in progress -> under review -> approved | declined -> lease start`

#### Document Lifecycle

`requested -> partially received -> under review -> accepted | rejected -> complete`

#### Handover Lifecycle

`pending readiness -> internal tasks open -> customer scheduling ready -> scheduled -> in progress -> completed | delayed`

#### Agent Action Lifecycle

`proposed -> approved -> executed -> completed | failed | escalated`

## Bilingual Experience Requirements

- Every major workflow must be usable in English and Arabic from day one
- Arabic must support true RTL layout without visual compromise
- Each case must store customer preferred language separately from staff UI language
- Staff must be able to inspect original text and translated or normalized interpretation where needed
- Templates, tone rules, disclosures, and project knowledge should be configurable per language rather than purely machine-translated at runtime

### Arabic UX Rules

- The Arabic experience must look designed for Arabic, not merely translated
- Cards, tables, forms, and threads must remain fully legible in RTL
- Original text and translation or summary should be visible in sensitive or disputed situations
- Arabic tone must feel professional, clear, and appropriate for local real-estate contexts

## AI Behavior Boundaries

### AI May Do Automatically

- Answer approved project, property, and process questions
- Ask standard qualification questions
- Propose or confirm appointments within approved logic
- Send reminders, nudges, summaries, and checklist requests
- Prepare manager summaries, call notes, and case briefs

### AI Must Not Do Without Human Approval

- Commit pricing, discounts, incentives, or commercial terms outside approved rules
- Promise possession, handover, approval, or inventory that is not explicitly available
- Provide legal, financing, or regulatory advice beyond approved content
- Invent availability, status, or document readiness
- Continue sensitive discussions after repeated confusion, frustration, or compliance risk

### Escalation Triggers

- Low confidence or conflicting data
- High-value or VIP-case rules
- Angry or legally sensitive customer language
- Fairness, discrimination, or policy-risk signals
- Exception requests outside approved workflow

## Design And Experience Standard

The product must feel premium, calm, expensive, multilingual, and operationally serious from the first demo.

### Visual Direction

- Large confident headings
- Generous whitespace
- Strong hierarchy
- Restrained but luxurious color use
- Command-center feel with deep neutral foundations, crisp contrast, rich cards, and refined status chips
- Premium bilingual typography that reads cleanly in Arabic and English

### Motion And Interaction Standards

- Immediate visual response under normal conditions
- Skeletons and progressive status instead of blank blocking spinners
- Calm insertion and update animation for new messages and timeline events
- Strong confirmation patterns for approvals and milestone actions
- Clear progress states for long-running actions
- Mobile-safe interactions for field reps and coordinators

### Deliberate Wow Moments

- Home dashboard that feels like a revenue nerve center
- Bilingual conversation console with premium human-takeover controls
- Case timeline that makes messy operations legible
- Handover command center that replaces spreadsheet chaos with visible readiness
- Executive brief cards that surface intervention-worthy insight

## Quality Bar

- Premium, world-class, highly polished UX
- Smooth motion and transitions
- Clean information architecture
- Production-grade foundations
- Strong local development experience on an Intel MacBook Pro 2019
- Testing must matter from the beginning
- Maintainable, scalable, typed, modular codebase
- No code comments unless truly necessary

## Non-Negotiable Engineering Rules

- No comments in code unless truly necessary
- Use descriptive and consistent names
- Prefer reusable modules and components over large multi-purpose files
- Write production-grade code with maintainable structure, strong typing, validation, and error handling
- Do not guess missing requirements; state assumptions explicitly
- Avoid hardcoded values, hacks, and tightly coupled logic
- Keep code modular, testable, and scalable
- Keep commit messages under 140 characters

## Delivery And Technical Direction

This section is product-directional, not an instruction to begin implementation immediately.

### Product Delivery Phases

- Phase 1: flagship demo
  Focus on the visual product story: landing, dashboard, lead inbox, bilingual conversation console, site-visit flow, document center, handover board, and seeded analytics
- Phase 2: functional alpha
  Make one workflow production-capable: lead capture to qualification to visit scheduling to follow-up to manager review
- Phase 3: leasing and document workflows
  Add leasing-specific qualification, document chase, approvals, and blocked-case logic
- Phase 4: handover command center
  Add readiness checklists, dependency ownership, customer updates, and milestone tracking
- Phase 5: hardening and enterprise controls
  Add QA sampling, approvals, deeper reporting, policy controls, audit views, and stronger multi-role security

### Recommended Technical Direction

- Web application: Next.js App Router
- Internationalization: `next-intl` with robust English and Arabic routing and RTL-aware rendering
- Backend and BFF: strongly typed Node.js services with dedicated workers for durable background jobs
- Data and storage: relational database, queue-backed workers, and object storage
- Testing: Playwright for end-to-end and browser-based component testing
- Local development: containerized workflows with conservative Intel MacBook Pro 2019 resource assumptions

### Local Development Expectations

- Node.js 24 LTS as the primary target, with Node.js 22 LTS compatibility testing if ecosystem constraints appear
- `pnpm` as package manager
- Docker Desktop for Mac Intel with conservative resource profiles
- Local PostgreSQL, Redis, object-storage emulator, email sandbox, and seeded bilingual demo data
- App-only, app-plus-workers, and full-stack test modes
- Seed, smoke, test, and reset commands as first-class developer workflows

## Quality Strategy

### Test Layers Required Early

- Unit tests for business rules
- Component tests in a real browser context
- Integration tests across services and persistence
- Contract tests for adapters and APIs
- End-to-end tests for real journeys
- Localization tests for English, Arabic, and RTL
- Accessibility tests
- Visual regression tests for top demo pages
- Performance tests on realistic data volumes
- Resilience and failure-path tests
- Security tests around roles, documents, and auditability
- Prompt and AI evaluation tests for policy and tone

### Critical Flows That Must Always Pass

- English website lead to response to qualification to visit booking to manager visibility
- Arabic WhatsApp lead to Arabic response to document upload to leasing review
- Silent prospect handled correctly by follow-up automation with manager visibility
- Sales case transitioning cleanly into handover execution
- Human takeover without losing history or state
- Restricted request escalating instead of receiving an unsafe AI answer
- Provider failure not causing silent message loss or duplicate sending

### Release Gates

- No regression in bilingual routing, Arabic layout, or mixed-language rendering
- No visual regression on top-tier demo pages
- No conversation-state bug that can double-send, lose ownership, or corrupt stage history
- No AI path that bypasses a high-risk escalation rule
- No unresolved access-control issue involving documents, conversations, or handover details
- No performance regression that makes the dashboard or inbox feel sluggish on realistic data

## Reliability, Security, Auditability, And Observability

### Reliability

- No silent failure for outbound messages, reminders, or document requests
- Every important job must show queued, running, completed, failed, retried, or escalated state
- Duplicate suppression and idempotency are required for provider callbacks and sends
- Operators must be able to re-run or cancel stuck actions safely

### Auditability

- Every AI-generated message, suggestion, summary, and state change must be attributable to source and timestamp
- Human overrides, approvals, and pauses must capture actor, reason, and time
- Important case pages should expose a readable event timeline

### Security

- Role-based access must be enforced consistently across projects, offices, documents, cases, and reports
- Sensitive documents and customer data must never be exposed through weak URLs or weak client-only checks
- Environment secrets, provider tokens, and audit logs are first-class infrastructure concerns

### Observability

- Operational dashboards must show message failures, queue backlog, scheduler issues, and AI-evaluation anomalies
- Each release must leave enough traces and logs to support practical production debugging

## KPIs For Design Partners

- First-response median and 90th percentile by channel and language
- Lead contact rate within 15 minutes, 1 hour, and 24 hours
- Visit booking rate and visit show rate
- Lead-to-qualified rate and qualified-to-visit rate
- Average days waiting on customer documents
- Average days from approval-ready to handover-ready
- Manager intervention rate by team and project
- AI-to-human takeover rate and takeover reasons
- Customer sentiment trend across the lifecycle

## Scope Boundaries And Explicit Non-Claims

- The product is not a promise of autonomous deal closing
- The product does not replace brokers, sales managers, leasing managers, or handover coordinators
- No implementation stack has been built yet in this repository
- No integrations are implemented yet
- No market-specific compliance logic is implemented yet
- No pricing, financing, or legal automation should be implied beyond approved content and workflows

## References Embedded In The Source Spec

- REGA Saudi PropTech Hub
- Saudi Vision 2030 real-estate strategy
- Saudi Vision 2030 housing program
- SAMA open-banking policy and licensing signals
- NAR AI in real estate and responsible AI guidance
- Next.js internationalization guidance
- `next-intl` documentation
- Playwright documentation
- Docker Desktop for Mac documentation
- Node.js LTS guidance
