# Domain Model

## Purpose

Define the product domains, main entities, ownership boundaries, and invariants before application code starts.

## Modeling Principles

- Model explicit business objects, not vague chat sessions
- Separate operational truth from derived analytics
- Keep customer-facing language preference separate from staff UI locale
- Keep every high-value action auditable
- Prefer append-friendly timelines over destructive state overwrites

## Bounded Contexts

### Tenant And Access

Owns:

- Organization
- Office
- User
- Role assignment
- Project membership

### Catalog And Market Context

Owns:

- Project
- Property or unit
- Inventory status
- Market and locale defaults
- Qualification policy

### Lead And Case Management

Owns:

- Lead
- Prospect
- Case
- Stage history
- Source attribution
- Ownership

### Conversation And Messaging

Owns:

- Conversation
- Message
- Message translation view
- Draft
- Customer language preference

### Scheduling

Owns:

- Visit
- Appointment slot
- Reminder state
- Outcome

### Documents And Approvals

Owns:

- Document checklist template
- Document requirement
- Document request
- Document submission
- Review outcome
- Approval request

### Handover

Owns:

- Handover case
- Milestone
- Dependency task
- Snag item
- Customer update

### Automation And Audit

Owns:

- Agent action
- Automation run
- Escalation
- Audit event
- SLA breach

## Core Entities

| Entity | Purpose | Notes |
| --- | --- | --- |
| Organization | Customer account boundary | Top-level tenant |
| Office | Operational subdivision | Useful for brokerages and multi-team deployments |
| User | Human operator | Managers, agents, leasing staff, coordinators |
| Project | Real-estate development or portfolio context | Holds market, policies, and knowledge boundaries |
| PropertyUnit | Inventory item or leasable unit | Optional in early phases if project-level demo is enough |
| Lead | Initial inbound inquiry | Channel and source attribution start here |
| Prospect | Structured contact after initial enrichment | Person or company |
| Case | Operational record that moves through the funnel | Central aggregate for most workflows |
| Conversation | Channel thread tied to a case | Multiple conversations may belong to one case |
| Message | Individual inbound or outbound communication | Stores original content and reviewed render forms |
| QualificationSnapshot | Current qualification state | Derived from structured answers and policy rules |
| Visit | Call, viewing, or site visit | Key conversion event |
| Task | Internal or external next action | Owner, due date, SLA status |
| DocumentRequirement | Required item definition | Often project- or workflow-specific |
| DocumentRequest | Required item requested from the customer | Tracks status and due date |
| DocumentSubmission | Received artifact or confirmation | May be approved or rejected |
| ApprovalRequest | Internal decision step | Used more heavily after Phase 2 |
| HandoverCase | Post-sale or lease-start execution record | Separate from pre-close case while linked |
| HandoverMilestone | Trackable readiness milestone | Visible to staff and sometimes customer |
| AgentAction | Proposed or executed AI action | Core for inspection and safety |
| AuditEvent | Immutable event trail | Must exist for critical actions |

## Recommended Aggregate Boundaries

### Case Aggregate

Contains or references:

- Lead or Prospect identity
- Stage
- Owner
- Source
- Qualification summary
- Current next action
- Linked conversations
- Linked visits
- Linked tasks

Invariants:

- A case has one active stage at a time
- Stage changes must write stage history
- A case must always have an owner or explicit unassigned state
- A case cannot silently move backward without a recorded reason

### Conversation Aggregate

Contains or references:

- Conversation metadata
- Messages
- Drafts
- Human takeover state
- Escalation flags

Invariants:

- Message order must be preserved
- Original customer message must remain available
- Sensitive outbound messages must remain inspectable

### Document Aggregate

Contains or references:

- Requirement
- Request
- Submission
- Review result
- Due state

Invariants:

- Each requirement has an explicit status
- Rejections require a reason
- Missing documents must remain visible in case and manager views

### Handover Aggregate

Contains or references:

- Handover case
- Milestones
- Dependencies
- Customer communications
- Risk state

Invariants:

- A handover case must expose current readiness and blockers
- Milestone completion must be attributable to an actor or system action

## Workflow State Model

### Lead Lifecycle

`new -> acknowledged -> engaged -> qualified -> scheduled -> visited -> active_deal -> won | lost | paused`

### Leasing Lifecycle

`new -> engaged -> qualified -> viewing_booked -> documents_in_progress -> under_review -> approved | declined -> lease_start`

### Document Lifecycle

`requested -> partially_received -> under_review -> accepted | rejected -> complete`

### Handover Lifecycle

`pending_readiness -> internal_tasks_open -> customer_scheduling_ready -> scheduled -> in_progress -> completed | delayed`

### Agent Action Lifecycle

`proposed -> approved -> executed -> completed | failed | escalated`

## Data Relationships That Matter Early

- One organization has many offices, users, and projects
- One project has many cases, units, document rules, and handover rules
- One case may have many conversations, tasks, visits, document requests, and agent actions
- One prospect may be linked to multiple cases over time
- One handover case is linked to one pre-existing case or deal

## Cross-Cutting Policies

- All timestamps are stored in UTC and rendered with market-aware formatting
- Every important status change creates an audit event
- Every automation must record trigger, result, and confidence or approval state where relevant
- Language preference belongs to the customer record and can differ from operator UI locale

## Phase 1 Domain Subset

The first implementation phase does not need the full model. It only needs:

- Project
- Lead
- Prospect
- Case
- Conversation
- Message
- Visit
- Task
- DocumentRequest
- HandoverCase
- HandoverMilestone

Use this subset to support a polished flagship demo without committing to deeper approval or integration complexity too early.
