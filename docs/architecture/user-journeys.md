# User Journeys

## Purpose

Define the journeys that should shape the product architecture, route structure, data model, and testing priorities.

## Journey Selection Rules

- Favor journeys that prove commercial value in demos and early production
- Cover both operator value and customer-facing bilingual experience
- Prefer journeys that exercise ownership, stage visibility, and auditability

## Journey 1: New Buyer Lead To Site Visit

### Why It Matters

This is the most commercially important journey for the first functional alpha.

### Actors

- Prospect
- Conversation Agent
- Qualification Agent
- Scheduling Agent
- Sales agent
- Sales manager

### Trigger

New lead arrives from website form, portal, WhatsApp, email, or manual entry.

### Flow

1. Lead is created with source, language hint, project context, and owner rule
2. Conversation opens with an immediate reply in the preferred language
3. Qualification questions capture budget, timing, intent, and fit
4. Case score and recommended next action become visible
5. Prospect books a site visit or call
6. Manager can inspect the full timeline and current status

### Failure And Escalation Paths

- Duplicate lead detected
- Language cannot be inferred confidently
- Prospect asks for unapproved pricing or terms
- No suitable appointment slot is available
- Sales agent takes over manually

### Product Surfaces

- Dashboard
- Lead inbox
- Prospect profile
- Conversation console
- Qualification panel
- Scheduling panel
- Manager command center

### Phase Coverage

- Phase 1A: fully demoable with fixtures
- Phase 2: production-capable end to end

## Journey 2: Arabic Leasing Inquiry To Documents In Progress

### Why It Matters

This proves bilingual leasing value and prevents the product from being framed as sales-only.

### Actors

- Prospect
- Conversation Agent
- Qualification Agent
- Document Agent
- Leasing manager

### Trigger

Arabic inquiry arrives for a rental unit or property.

### Flow

1. Inquiry enters the inbox already marked for Arabic handling
2. Conversation stays in Arabic while staff can inspect the normalized interpretation
3. Qualification confirms move-in timing, budget, employer or company type, and likely blockers
4. Viewing is proposed or booked
5. Required leasing documents are requested and shown as missing, received, or blocked
6. Leasing manager sees exact blockers from a single timeline

### Failure And Escalation Paths

- Mixed-language thread needs operator review
- Required document is rejected
- Prospect is not a fit for the unit or policy

### Product Surfaces

- Lead inbox
- Conversation console
- Qualification workspace
- Document center

### Phase Coverage

- Phase 1A: demoable visually
- Phase 3: production-capable

## Journey 3: Silent Prospect Follow-Up And Manager Intervention

### Why It Matters

This journey proves operational discipline rather than just fast first response.

### Actors

- Follow-Up Agent
- Sales manager
- Assigned rep

### Trigger

A qualified or scheduled case goes quiet beyond SLA.

### Flow

1. Case becomes overdue for the next action
2. Follow-up recommendation or automated nudge is generated
3. Timeline shows why the case is at risk
4. Manager dashboard highlights overdue and risky cases
5. Manager intervenes, reassigns, or pauses automation

### Failure And Escalation Paths

- Repeated silence
- Customer frustration
- Follow-up automation paused by manager

### Product Surfaces

- Home dashboard
- Lead inbox
- Prospect profile
- Manager command center

### Phase Coverage

- Phase 1A: visual and seeded analytics
- Phase 2: live rule-driven behavior

## Journey 4: Human Takeover During A Sensitive Conversation

### Why It Matters

Enterprise trust depends on safe escalation and transparent human control.

### Actors

- Prospect
- Conversation Agent
- Sales or leasing agent
- QA reviewer

### Trigger

Customer asks for an exception, becomes frustrated, or enters a sensitive topic.

### Flow

1. The case is flagged as requiring human takeover
2. Drafted automation remains visible but not auto-sent
3. Human operator sees original text, interpretation, and draft history
4. Human sends the approved response and the timeline records the override

### Failure And Escalation Paths

- Policy risk
- Potential discrimination issue
- Repeated misunderstanding across languages

### Product Surfaces

- Conversation console
- Prospect profile
- QA or admin workspace

### Phase Coverage

- Phase 1A: visible UX controls and states
- Phase 2: enforceable approval behavior

## Journey 5: Approved Case To Handover Readiness

### Why It Matters

This is a core differentiator versus generic lead-management products.

### Actors

- Handover coordinator
- Handover Agent
- Operations staff
- Customer
- Manager

### Trigger

Sales or leasing case moves into handover or move-in preparation.

### Flow

1. Handover case is opened from the original case
2. Milestones, dependencies, and blockers become visible
3. Customer updates appear on the timeline in the correct language
4. Managers see readiness risk before customer confidence drops

### Failure And Escalation Paths

- Missing internal dependency owner
- Readiness item overdue
- Customer update blocked due to unresolved issue

### Product Surfaces

- Handover workspace
- Prospect or case timeline
- Manager command center

### Phase Coverage

- Phase 1A: high-polish demo state
- Phase 4: production-capable

## Journey 6: Executive Daily Review

### Why It Matters

Executives and owners buy clarity, not just automation.

### Actors

- Executive or owner
- Manager Insight Agent

### Trigger

Daily review of portfolio or project health.

### Flow

1. Dashboard surfaces new leads, SLA breaches, visits, document blockers, and handover risk
2. Executive can drill into the projects or teams that need attention
3. Brief cards summarize where revenue is being lost or saved

### Product Surfaces

- Home dashboard
- Manager command center
- Reports and analytics

### Phase Coverage

- Phase 1A: seeded analytics and strong visual storytelling
- Phase 5: deeper reporting and controls

## Journeys That Drive The First Build

The first implementation phase should optimize for:

- Journey 1 visual completeness
- Journey 3 visibility and intervention cues
- Journey 4 takeover controls
- Journey 5 handover storytelling
- Journey 6 executive dashboard credibility
