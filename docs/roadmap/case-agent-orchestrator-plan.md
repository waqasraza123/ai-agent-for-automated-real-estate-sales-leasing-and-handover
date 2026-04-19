# CaseAgentOrchestrator V1

## Summary

Build a production-grade `CaseAgentOrchestrator` inside the worker that makes this product genuinely agent-based for the core wedge. The first release fully owns three trigger classes end-to-end:

- new lead
- no-response follow-up
- document-missing cases

The orchestrator uses a deterministic, resumable worker loop with explicit tools, persisted case memory, typed model I/O, and a hybrid authority model:

- auto-send only for low-risk, policy-safe cases
- draft or escalate for everything else
- route unresolved cases into the existing manager queue first

The orchestrator remains provider-agnostic at the model boundary so a real LLM provider can be plugged in later without rewriting worker orchestration, policies, or storage.

## Key Changes

### 1. Agent runtime and orchestration

- Add a dedicated `CaseAgentOrchestrator` entrypoint that consumes due agent jobs and executes one decision cycle per case.
- Keep the current raw outbound WhatsApp send cycle as a lower-level delivery worker. The orchestrator enqueues sends through explicit tools rather than sending directly.
- The orchestrator loop must:
  - load current case detail plus compact agent memory
  - derive the triggering reason
  - evaluate hard deterministic policy gates first
  - call the model adapter only when the trigger is eligible for agent reasoning
  - validate the result against typed contracts
  - execute one approved action through explicit tools
  - persist the decision, action outcome, and next wake-up time

### 2. Contracts, persisted state, and read models

Add agent contracts for:

- `CaseAgentTriggerType`
  - `new_lead`
  - `no_response_follow_up`
  - `document_missing`
- `CaseAgentRunStatus`
  - `completed`
  - `waiting`
  - `escalated`
  - `blocked`
  - `failed`
- `CaseAgentDecision`
  - trigger
  - recommended action
  - confidence
  - risk level
  - rationale summary
  - proposed message
  - proposed next action
  - proposed due time
  - escalation reason
- `CaseAgentActionType`
  - `send_whatsapp_message`
  - `save_follow_up_plan`
  - `request_manager_intervention`
  - `pause_automation`
  - `request_document_follow_up`
  - `create_reply_draft`

Add persisted state for:

- compact `case_agent_memory`
- `case_agent_runs`
- agent-owned automation job payloads

Expose agent state on case summary and detail:

- latest agent trigger
- latest agent decision status
- latest agent recommended action
- latest agent escalation reason
- latest agent run timestamp

### 3. Trigger model

#### New lead

- Trigger on persisted website lead creation after the case exists.
- Agent decides whether it may auto-send the first WhatsApp reply.
- If safe:
  - prepare localized first reply
  - set next follow-up plan
  - enqueue outbound send
- If not safe:
  - save draft or escalate to manager

#### No-response follow-up

- Trigger when a case reaches its due follow-up window and automation is still active.
- Agent decides whether to:
  - send a follow-up
  - adjust timing
  - escalate for manager intervention
- Hard blocks:
  - open QA review
  - automation paused
  - missing phone
  - client credentials pending

#### Document-missing

- Trigger when document workflow is active and required items remain missing or rejected beyond the allowed interval.
- Agent decides whether to:
  - send a document chase message
  - update next action timing
  - escalate to manager when the case is stalled or repeatedly ignored

### 4. Tool surface and execution rules

Add explicit orchestrator tools:

- `sendWhatsAppMessage(caseId, message, reason)`
- `saveFollowUpPlan(caseId, nextAction, dueAt, owner?)`
- `openManagerIntervention(caseId, summary, severity)`
- `createReplyDraft(caseId, message, reason)`
- `pauseAutomation(caseId, reason)`
- `recordDocumentFollowUp(caseId, summary, dueAt)`

Execution rules:

- only one customer-facing action per run
- all tools append auditable metadata
- auto-send is allowed only when:
  - no QA hold
  - no explicit policy hit
  - confidence above threshold
  - trigger class is supported
  - no blocked integration dependency
- if any gate fails, downgrade to draft or manager escalation

### 5. Model integration

Add a shared model adapter interface:

- `generateCaseAgentDecision(input): Promise<CaseAgentDecision>`

The adapter input includes:

- case snapshot
- compact agent memory
- trigger payload
- allowed tools and actions
- hard constraints
- bilingual response requirements

The adapter output is structured and schema-validated. Free-form model text must never directly drive execution.

## Important API / Interface Additions

- `CaseAgentDecision`
- `CaseAgentTriggerType`
- `CaseAgentActionType`
- `CaseAgentRunStatus`
- `CaseAgentMemory`
- `PersistedCaseSummary.agentState`
- `PersistedCaseDetail.agentRuns`
- database/store methods for:
  - enqueueing agent jobs
  - loading and updating case agent memory
  - saving agent runs
  - deduping trigger jobs
- worker-local tool interfaces for:
  - message send enqueue
  - follow-up mutation
  - intervention creation
  - draft creation
  - automation pause

## Test Plan

### Contract and unit coverage

- schema validation for all agent decision and tool-result types
- policy gate tests for QA hold, automation paused, missing phone, client credentials pending, and policy-sensitive lead content

### Worker integration scenarios

- new lead, low-risk, configured channel
- new lead, policy-sensitive
- no-response trigger, safe case
- no-response trigger, credentials pending
- document-missing trigger
- trigger while QA is open
- duplicate trigger dedupe
- model adapter failure

### Acceptance scenarios

- managers can see why the agent acted or escalated
- customer-facing message state remains truthful and auditable
- agent never bypasses existing QA and automation control rules
- Arabic and English outputs respect preferred locale
- existing human reply path continues to coexist with agent actions

## Assumptions and defaults

- V1 scope is limited to `new_lead`, `no_response_follow_up`, and `document_missing`
- escalation target defaults to the existing manager queue
- authority defaults to hybrid:
  - low-risk auto-send allowed
  - otherwise draft or escalate
- the model integration is provider-agnostic
- the current lower-level WhatsApp outbound job system remains the transport layer under the orchestrator
