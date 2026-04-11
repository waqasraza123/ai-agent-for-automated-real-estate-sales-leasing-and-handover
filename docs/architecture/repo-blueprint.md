# Repo Blueprint

## Purpose

Define a TypeScript monorepo structure that supports a premium bilingual real-estate operations product without forcing heavy infrastructure before the first valuable slice ships.

## Architectural Position

- Use a single TypeScript monorepo with shared contracts, domain logic, UI primitives, and testing utilities
- Keep durable business rules out of the web app
- Treat async automation as worker-owned behavior, not request-time web logic
- Keep the first implementation phase fixture-backed where that improves speed without creating throwaway structure
- Optimize for local development on an Intel MacBook Pro 2019

## Recommended Stack

- Monorepo: `pnpm` workspaces with `turbo`
- Web app: Next.js App Router
- API: Fastify with TypeScript and Zod-based request and response validation
- Worker: Node.js worker service using BullMQ on Redis
- Database: PostgreSQL
- ORM and migrations: Drizzle ORM with SQL migrations
- Object storage: S3-compatible storage interface with local emulator in development
- Browser automation: Playwright
- Unit and integration tests: Vitest

## Repository Layout

```text
.
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
├── packages/
│   ├── analytics/
│   ├── config/
│   ├── contracts/
│   ├── database/
│   ├── domain/
│   ├── i18n/
│   ├── integrations/
│   ├── testing/
│   ├── ui/
│   └── workflows/
├── docs/
└── turbo.json
```

## App Responsibilities

### `apps/web`

- Primary operator experience for managers, agents, leasing teams, and handover teams
- Locale-aware routing and RTL-aware rendering
- Reads typed contracts from shared packages
- Owns page composition, state presentation, and UI interaction logic
- Must not own core business rules, queue orchestration, or integration adapter logic

### `apps/api`

- System of entry for typed business operations
- Owns tenant-aware application services, read models, webhook intake, and manager-facing query endpoints
- Enforces validation, authorization, workflow permissions, and audit event creation
- Exposes stable internal APIs for the web app and worker

### `apps/worker`

- Owns durable background jobs: reminders, follow-up nudges, summaries, retries, SLA checks, and scheduled digests
- Consumes queue jobs and writes auditable results back to the core data model
- Must be idempotent and safe to retry

## Package Responsibilities

### `packages/domain`

- Core domain types, enums, state transitions, and policy logic
- No framework or database dependencies
- Shared by web, api, worker, and tests

### `packages/contracts`

- API schemas, DTOs, event payloads, and public typed boundaries
- Zod-first so runtime validation and TypeScript types stay aligned

### `packages/database`

- Drizzle schema, migrations, seed definitions, and database access helpers
- No UI logic

### `packages/workflows`

- Workflow-level orchestration rules that combine domain entities and async steps
- Examples: lead qualification progression, follow-up cadence eligibility, document reminder scheduling

### `packages/ui`

- Design-system primitives and product-specific composed components
- Must support bilingual typography, logical spacing, and RTL-safe patterns by default

### `packages/i18n`

- Locale definitions, copy catalogs, message helpers, direction helpers, and bilingual formatting rules

### `packages/integrations`

- Provider adapters for WhatsApp, email, SMS, website forms, storage, and future calendar or CRM connectors
- Phase 1 should use stub adapters behind the same interfaces

### `packages/analytics`

- Read-model shaping, KPI definitions, and report calculation helpers
- Keep metrics logic outside page components

### `packages/testing`

- Shared test factories, fixtures, Playwright helpers, mock servers, and assertion utilities

### `packages/config`

- Shared TypeScript, lint, format, environment, and build configuration

## Dependency Rules

- `apps/web` may depend on `contracts`, `domain`, `ui`, `i18n`, and thin query clients
- `apps/api` may depend on `contracts`, `domain`, `database`, `workflows`, `integrations`, `analytics`, and `i18n`
- `apps/worker` may depend on `domain`, `database`, `workflows`, `integrations`, `analytics`, and `i18n`
- `packages/domain` must not depend on framework code
- `packages/ui` must not depend on `database` or integration adapters
- `packages/integrations` must not import UI or page code

## Product Domains Mapped To Code Ownership

- Tenant and access control: `apps/api`, `packages/domain`, `packages/database`
- Lead intake and case creation: `apps/api`, `apps/worker`, `packages/workflows`
- Conversation and bilingual messaging: `apps/web`, `apps/api`, `packages/i18n`, `packages/integrations`
- Qualification and next-action logic: `packages/domain`, `packages/workflows`
- Scheduling: `apps/api`, `packages/workflows`, later `packages/integrations`
- Documents and approvals: `apps/api`, `packages/domain`, `packages/workflows`
- Handover: `apps/api`, `packages/domain`, `packages/workflows`
- Manager insight and dashboards: `apps/api`, `packages/analytics`, `apps/web`
- Safety and auditability: `apps/api`, `apps/worker`, `packages/domain`

## Data And Integration Topology

- PostgreSQL is the operational source of truth
- Redis backs queues, retries, and scheduled jobs
- Object storage holds customer documents and generated artifacts
- External providers are isolated behind adapter interfaces
- Every high-value state transition must emit an audit event

## Recommended Environment Profiles

- `demo-web`: web app plus fixture data only
- `core-app`: web, api, PostgreSQL, Redis
- `with-workers`: core-app plus worker
- `full-test`: with-workers plus object-storage emulator, email sandbox, and Playwright browsers

## First Implementation Phase Shape

The first implementation phase should create only the repo structure needed for a polished flagship demo:

- `apps/web`
- `packages/ui`
- `packages/i18n`
- `packages/domain`
- `packages/testing`
- Optional minimal `packages/contracts` if typed fixture data starts crossing app boundaries

Defer `apps/api`, `apps/worker`, `packages/database`, and `packages/integrations` until the demo shell is stable enough that real workflow implementation will not cause avoidable rework.

## Decisions Locked By This Blueprint

- The repo will be a modern TypeScript monorepo
- Next.js is the product frontend
- Fastify is the planned application API
- BullMQ plus Redis is the planned durable async layer
- Drizzle plus PostgreSQL is the planned persistence direction
- The first implementation phase is intentionally web-first and fixture-backed
