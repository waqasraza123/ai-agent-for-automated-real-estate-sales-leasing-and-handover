# Automation Strategy

## Purpose

Define a practical testing and browser-automation strategy that protects premium UX, bilingual quality, workflow correctness, and operator trust.

## Testing Priorities

- Protect the demo path from visual and interaction regressions
- Protect domain rules and state transitions with fast tests
- Protect bilingual rendering and RTL layout from the start
- Protect safety boundaries before live automation is introduced

## Recommended Tooling

- Unit and package tests: Vitest
- API integration tests: Vitest with application test harnesses
- Browser automation: Playwright
- Network mocking in browser tests: MSW
- Accessibility assertions: Playwright plus axe-based checks
- Visual regression: Playwright snapshot baselines on top demo pages

## Practical Test Pyramid

### 1. Static And Type Gates

- TypeScript project references and strict type checking
- Linting and formatting gates
- Schema validation tests for contracts and fixtures

### 2. Unit Tests

Target:

- domain transitions
- qualification rules
- visit eligibility
- document completeness calculations
- SLA windows
- bilingual fallback logic

Characteristics:

- fastest layer
- no browser
- no network

### 3. Component And Interaction Tests

Target:

- conversation thread rendering
- bilingual message cards
- inbox filters
- scheduler cards
- document checklist states
- handover milestone rows

Characteristics:

- run in real browser context when the interaction is layout-sensitive
- prefer fixture-backed components over full app boot for speed

### 4. Integration Tests

Target:

- page data adapters
- API handlers
- workflow services
- audit event creation
- persistence rules once Phase 2 begins

Characteristics:

- use deterministic fixture data
- avoid full provider dependencies

### 5. End-To-End Browser Automation

Target:

- flagship demo path
- functional alpha lead flow
- manager intervention flow
- Arabic route and RTL path

Characteristics:

- run against seeded local environment
- no brittle selectors
- keep critical path suite small and reliable

## Browser Automation Strategy By Phase

### Phase 1A

Automate:

- dashboard renders in English
- dashboard renders in Arabic with correct direction
- inbox filter interaction
- conversation console renders takeover state
- scheduling view opens and confirms a seeded appointment state
- document center shows blocked and complete states
- handover workspace shows milestone and blocker states

### Phase 2

Add:

- website lead creation
- qualification submission
- visit booking
- overdue follow-up visibility
- manager review of the same persisted case

### Later Phases

Add:

- Arabic leasing inquiry path
- document request and rejection path
- handover progression path
- provider failure and retry path

## AI And Safety Evaluation

Do not wait for full live automation before defining test shape.

Maintain deterministic evaluation fixtures for:

- approved vs blocked response classes
- escalation-required prompts
- mixed-language customer messages
- Arabic tone checks
- pricing and legal boundary checks

These should run as repeatable evaluation suites, not manual spot checks.

## Accessibility And Localization Gates

Every release candidate must verify:

- keyboard navigation on primary surfaces
- focus handling in drawers and dialogs
- contrast on high-importance status elements
- English and Arabic route rendering
- RTL-safe layout on conversation and dashboard surfaces

## Intel Mac Local Testing Rules

- Keep default local feedback loops fast: typecheck, unit, and a very small browser smoke suite
- Reserve full visual regression and wider browser matrices for opt-in local runs and CI
- Avoid test setups that boot every service for every small change

## Suggested Command Tiers

- `test:fast`: typecheck, lint, unit tests
- `test:web-smoke`: top Playwright demo path only
- `test:integration`: app-level integration tests
- `test:full`: all suites including visual regression

These commands should exist once implementation begins.

## Release Gates

- No broken EN or AR route
- No broken top-tier page render
- No regression in takeover visibility, stage visibility, or document blocker visibility
- No failing critical-path browser smoke
- No failing accessibility or visual checks on key demo pages
