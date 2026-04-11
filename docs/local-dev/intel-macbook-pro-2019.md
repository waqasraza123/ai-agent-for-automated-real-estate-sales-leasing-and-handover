# Intel MacBook Pro 2019 Local Development

## Purpose

Define a realistic local-development standard for building this product on an Intel MacBook Pro 2019 without wasting resources or forcing heavyweight services too early.

## Baseline Assumption

- Intel MacBook Pro 2019
- 16 GB RAM preferred
- SSD with at least 60 GB free
- Docker Desktop available but used conservatively

## Local Toolchain Direction

- Node.js 24 LTS primary target
- `pnpm` workspace management
- Docker Desktop for PostgreSQL, Redis, object-storage emulator, and email sandbox when needed
- Playwright browsers installed locally

## Service Profiles

### `demo-web`

Runs:

- web app only
- seeded fixture data only

Use for:

- Phase 1A product-shell work
- visual iteration
- route and interaction work

### `core-app`

Runs:

- web
- api
- PostgreSQL
- Redis

Use for:

- Phase 2 workflow implementation
- domain and persistence work

### `with-workers`

Runs:

- core-app
- worker

Use for:

- reminder, follow-up, and scheduled-job work

### `full-test`

Runs:

- with-workers
- object-storage emulator
- email sandbox
- full browser automation

Use for:

- CI-like local verification
- release candidate checks

## Intel-Friendly Rules

- Do not require all services for everyday frontend work
- Keep the default profile on the web app and fixtures only
- Add workers and storage emulators only when the task truly needs them
- Keep browser-test parallelism conservative on Intel hardware
- Avoid memory-heavy local indexing or analytics services in the early roadmap

## Suggested Docker Resource Budget

- Default Docker Desktop memory: 4 GB
- Increase to 6 GB only for `full-test` or heavier integration work
- Keep CPU allocation conservative to preserve system responsiveness

## Suggested Local Ports

- web: `3000`
- api: `4000`
- postgres: `5432`
- redis: `6379`
- object storage API: `9000`
- object storage console: `9001`
- mail sandbox SMTP: `1025`
- mail sandbox UI: `8025`

## Fixture And Seed Strategy

- Maintain convincing bilingual demo fixtures from the start
- Seed realistic cases for dashboard, inbox, conversation, document, and handover views
- Keep separate fixture sets for English-heavy, Arabic-heavy, and mixed-language scenarios

## Test Execution Guidance

- Default local loop: typecheck, unit tests, and a narrow browser smoke suite
- Use wider Playwright suites intentionally, not on every small iteration
- Avoid full environment resets unless schema or queue state becomes unreliable

## Operational Expectations

Once implementation begins, the local developer experience should expose:

- one bootstrap command
- one web-only demo command
- one core-app command
- one worker-enabled command
- one seed command
- one reset command

These commands should map directly to the service profiles in this document.

## What To Avoid

- Requiring API, worker, database, storage emulator, and full browser tests just to edit UI
- Pulling in heavyweight infrastructure before Phase 2 needs it
- Choosing tooling that assumes Apple Silicon-only workflows
