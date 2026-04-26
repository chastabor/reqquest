# ReqQuest Framework — Project Setup & Component Design

A reference for developers building or maintaining a ReqQuest-based project. Written after reviewing `api/`, `ui/`, and the example `demos/` (specifically `default`, `simple`, `complex`, `multi`, and placeholder `rc`).

---

## 1. What ReqQuest Is

ReqQuest is a platform for any process where an organization offers a benefit to applicants who must prove eligibility.
The framework provides the infrastructure (API server, GraphQL schema, database migrations, access control, dashboards, forms engine, workflow engine),
and a downstream project supplies three concrete building blocks:

- **Programs** — the benefits offered
- **Requirements** — business rules that gate eligibility
- **Prompts** — web forms that collect the data needed to evaluate requirements

A single submission (an **AppRequest**) can contain one or more applications — one per program.
Each application proceeds through a well-defined lifecycle:
  PREQUAL → QUALIFICATION → POSTQUAL → READY_TO_SUBMIT → PREAPPROVAL → APPROVAL → [WORKFLOW_BLOCKING] → REVIEW_COMPLETE → ACCEPTANCE → [WORKFLOW_NONBLOCKING] → COMPLETE.
See `README.md` for the full lifecycle spec.

---

## 2. Repository Layout

```
reqquest-chas/
├── api/           # @reqquest/api — framework backend (Fastify + GraphQL + MySQL)
│   └── src/
│       ├── index.ts              # RQServer + RQStartOpts (public entry)
│       ├── internal.ts           # re-exports used internally
│       ├── registry/             # ProgramRegistry, RequirementRegistry, PromptRegistry, AppRequest types
│       ├── program/              # program.{model,resolver,service,database}.ts
│       ├── requirement/          # requirement.{model,resolver,service,database,initialize}.ts
│       ├── prompt/               # prompt.{model,resolver,service,database,initialize}.ts
│       ├── application/          # per-program application lifecycle
│       ├── appRequest/           # AppRequest (the submission container)
│       ├── access/               # roles, grants, exceptions, controls, tags
│       ├── period/               # time windows (and per-period configuration)
│       ├── notes/, download/, scalar/, util/, common/, migrations.ts
├── ui/            # @reqquest/ui — framework frontend (SvelteKit + Carbon components)
│   └── src/
│       ├── lib/
│       │   ├── registry.ts       # UIRegistry + UIConfig (public shape downstream consumes)
│       │   ├── components/       # shared generic form/display components
│       │   ├── api.ts, types.ts, typed-client/
│       ├── routes/               # SvelteKit pages (dashboards, requests, periods, roles)
│       └── local/                # PROJECT-SPECIFIC Svelte components + uiRegistry assembly
├── demos/         # Example downstream API project (multiple demo instances)
│   └── src/
│       ├── index.ts              # picks a demo by DEMO_INSTANCE env var, boots RQServer
│       ├── default/, simple/, multi/, complex/, rc/
│       │   ├── definitions/
│       │   │   ├── programs.ts
│       │   │   ├── requirements/   (*.requirements.ts + index.ts)
│       │   │   ├── prompts/        (*.prompts.ts + index.ts)
│       │   │   └── models/         (JSON schemas + TS types for prompt data)
│       │   └── testdata.ts         (migrations for seed data / test users)
├── docs/          # sitemap.md + user-story docs (applicant, reviewer, configuration, roles)
├── specs/         # spec-driven authoring of downstream projects
│   ├── README.md          # operator guide (write a spec, run the generator)
│   ├── SPECS.md           # spec format reference (every field, every shape)
│   ├── DESIGN.md          # this file (framework background)
│   ├── src/               # the generator (TypeScript, Node CLI)
│   │   ├── cli.ts            # `reqquest-gen` entry; --emit / --dry-run / --verify
│   │   ├── spec/             # YAML parser + zod schema + fixture loader
│   │   ├── ir/               # ResolvedSpec (cross-refs linked, names derived)
│   │   ├── validate/         # invariants, fields, expressions, UI checks
│   │   ├── expr/             # rule-grammar parser + scope-aware rewriter
│   │   ├── emit/             # per-phase emitters (models / prompts / reqs / programs / bootstrap / ui)
│   │   ├── codegen/          # TS + Svelte source primitives, prettier wrapper
│   │   └── verify/           # tsc + svelte-check runner
│   ├── test/              # vitest — 24 files / 175 tests
│   ├── requirements/      # demo-*.spec.yml — one YAML per downstream project
│   └── resources/         # author-supplied assets the generator inlines / copies
│       ├── data/             # static fixtures referenced by `kind: referenceData` (e.g. states.yml)
│       └── ui-templates/     # curated parametric Svelte templates (see INDEX.md)
├── test/          # Playwright E2E tests
├── docker-compose.yml  # api + ui + mysql + fakeauth
└── README.md      # canonical domain spec
```

The `api`, `ui`, and `demos` packages are independently buildable.
Downstream projects follow the same shape:
 publish an API service that depends on `@reqquest/api`,
 and a SvelteKit UI that depends on `@reqquest/ui`.

---

## 3. Core Domain Objects

### Program (`api/src/registry/program.ts`)
```ts
interface ProgramDefinition {
  key: string                         // stable, unique
  title: string
  navTitle?: string
  requirementKeys: string[]           // ordered list — drives navigation + evaluation order
  workflowStages?: WorkflowStage[]    // optional blocking / non-blocking review stages
}
```
Example (`demos/src/default/definitions/programs.ts`):
```ts
export const adopt_a_dog_program: ProgramDefinition = {
  key: 'adopt_a_dog_program',
  title: 'Adopt a Dog',
  requirementKeys: ['which_state_req', 'have_big_yard_req', ...]
}
```
Workflow stages are also requirement-lists, but represent a second set of eyes on a completed review. They can be blocking (must complete before release to applicant) or non-blocking (audit-only, runs after release).

### Requirement (`api/src/registry/requirement.ts`)
```ts
interface RequirementDefinition<Config = any> {
  key: string
  type: RequirementType             // PREQUAL | QUALIFICATION | POSTQUAL | PREAPPROVAL
                                    //   | APPROVAL | ACCEPTANCE | WORKFLOW
  title, navTitle?, description
  smartTitle?(config)               // title using configuration data
  promptKeys?: string[]             // ordered; prompts revealed one-at-a-time
  promptKeysAnyOrder?: string[]     // all revealed together once promptKeys done
  promptKeysNoDisplay?: string[]    // depended on but hidden (e.g. automation-fed, or
                                    //   cross-program exclusivity)
  resolve(data, config, configLookup): { status: RequirementStatus, reason?: string }
  configuration?: ConfigurationDefinition    // admin-tunable params per period
}
```
`resolve()` is synchronous — any async work must have been stored by a prompt. It only receives data from prompts required by this requirement and earlier-ordered ones (to prevent later answers from silently reshaping earlier decisions).

Statuses: `PENDING | MET | DISQUALIFYING | WARNING | NOT_APPLICABLE`.

### Prompt (`api/src/registry/prompt.ts`)
```ts
interface PromptDefinition<Data = any, InputData = Data, Config = any, Fetch = any> {
  key: string
  title, navTitle?, description?
  schema?: SchemaObject                        // JSON Schema (ajv) — safety not UX
  preValidate?(data, ...)                      // errors here BLOCK save (e.g. oversized upload)
  preProcessData?(data, ctx, ...)              // transform post-save (e.g. hash uploaded files)
  validate?(data, ...)                         // UX errors — do NOT block save; block resolution
  preload?(appRequest, ...)                    // prefill on first open
  fetch?(appRequest, ...)                      // data passed to Svelte component as `fetched`
  exposeToApplicant?(data)                     // redacted subset of reviewer-only prompt for applicant view
  gatherConfig?(allPeriodConfig)               // pull other reqs/prompts' config into this prompt's display
  gatherConfigForApplicant?(allPeriodConfig)
  invalidUponChange?, validUponChange?         // cross-prompt invalidation (reviewer-applicant loops)
  migrations?: AppRequestMigration[]           // forward-migrate stored appRequest data
  indexes?: PromptIndexDefinition[]            // drive list columns / filters
  tags?: PromptTagDefinition[]                 // drive access-control restrictions
  configuration?: ConfigurationDefinition      // admin-tunable params per period
}
```
The prompt is the primary extension point. It owns the data shape, validation logic, side-effects (file processing), and the index/tag values attached to AppRequests.

### AppRequest + Application
One submission per applicant+period (or more, if `multipleRequestsPerPeriod`). The AppRequest spawns one Application per program it pre-qualified for. Each Application advances through phases independently after submission. The Application's `ApplicationRequirement` is the per-application evaluation cache of a Requirement's `resolve()` output.

Authoritative schema is in `README.md` §"Detailed Definitions".

---

## 4. The Registry Pattern (how definitions become behavior)

The three registries (`programRegistry`, `requirementRegistry`, `promptRegistry`) are module-level singletons in `@reqquest/api`. Bootstrap flow from `api/src/index.ts::RQServer.start()`:

```
for (const prompt      of options.prompts)       promptRegistry.register(prompt)
for (const requirement of options.requirements)  requirementRegistry.register(requirement)
for (const program     of options.programs)      programRegistry.register(program, true)
programRegistry.finalize()     // calls requirementRegistry.finalize()
                               //   which calls promptRegistry.finalize()
```

`finalize()` does the cross-wiring:

- `programRegistry.finalize`: computes `allRequirementKeys[programKey]`, `workflowStagesByKey`, and `workflowStageByProgramAndRequirementKey`.
- `requirementRegistry.finalize`: narrows down to `reachable` requirements (those actually referenced by an active program or stage), precomputes `visiblePromptKeys` / `visiblePrompts` per requirement, builds `promptKeySet / anyOrderPromptKeySet / noDisplayPromptKeySet`.
- `promptRegistry.finalize`: narrows `reachable` prompts, collects `indexCategories` and `tagCategories` from prompt definitions, and — most importantly — computes **authorizationKeys** for every prompt and requirement. These are the tag-strings used by the access-control system to resolve grants/exceptions:

```
requirementRegistry.authorizationKeys[reqKey]  = [type, stageKey?, reqKey, programKey, ...]
promptRegistry.authorizationKeys[promptKey]    = [type, stageKey?, promptKey, reqKey, programKey, ...]
```

This is why keys must be globally unique across prompts and requirements — they're used as tags in ACL decisions (see README §Restrictions/Tags).

---

## 5. API Bootstrap — `RQServer.start(options)`

`RQServer` (`api/src/index.ts`) extends `GQLServer` from `@txstate-mws/graphql-server`. `start()` accepts an `RQStartOpts`:

```ts
interface RQStartOpts {
  appConfig: AppDefinition       // userLookups, groups, hooks, multipleRequestsPerPeriod, scopes
  programs: ProgramDefinition[]
  pastPrograms?: ProgramDefinition[]    // retired — still renderable, not re-enable-able
  requirements: RequirementDefinition[]
  prompts: PromptDefinition[]
  migrations?: DatabaseMigration[]      // app-owned DB migrations
  resolvers?, overrideResolvers?, scalarsMap?, customContext?, ...
}
```

Sequence performed by `start()`:

1. Register `multipartPlugin` (file uploads, 100 MB / 5 files).
2. Concatenate built-in resolvers (`AppRequestResolver`, `ApplicationResolver`, `PeriodResolver`, `AccessResolver`, `PromptResolver`, etc.) with any `options.resolvers` and apply `overrideResolvers` swaps.
3. Install built-in scalars (`SnakeCaseString`, `DateTime`) plus caller-provided ones.
4. Wrap `customContext` with `rqContextMixin`.
5. Assign the `AppDefinition` to the shared `appConfig` singleton.
6. Register all prompts → requirements → programs, then `programRegistry.finalize()`.
7. `initializeDb([...periodMigrations, ...promptMigrations, ...requirementMigrations, ...accessMigrations, ...appRequestMigrations, ...applicationMigrations, ...noteMigrations, schedulerMigration, ...options.migrations])`.
8. `initAccess()` — install seed access roles.
9. Install download + app-request HTTP routes.
10. `ensureConfigurationRecords()` — create per-period configuration rows for new prompts/requirements using their `configuration.default`.
11. `super.start({ resolvers, ... })` — stand up Fastify + GraphQL + Swagger.
12. Start the background `scheduler`.

Every prompt's `validate` is wired into evaluation: a requirement's `resolve()` is only given a prompt's data after the prompt's `validate()` returns no errors. This enforces README §Prompts: *"The Requirement is not given the information from the Prompt until it has been fully answered."*

---

## 6. Access Control

Three concepts (see `api/src/access/` and README §Role Management):

- **Controls** grouped into **Control Groups**. Example groups: `AppRequestOwn`, `AppRequest`, `PromptAnswer`, `Prompt`, `Requirement`, `Program`, `Period`, `Role`. Each group scopes to a subject type and allowable restrictions.
- **Grants** — a role may hold controls from a group, optionally restricted to a tag-set.
- **Exceptions** — subtract from the grant (e.g. "review all … _except_ College of Engineering").

Tags come from three places:
- Framework-defined (program key, requirement key, prompt key, phase type, workflow stage key — wired automatically via `authorizationKeys`).
- `PromptTagDefinition.getTags()` — for enumerated external categories (departments, states, …).
- `PromptIndexDefinition.extract()` results — for dynamic filters/columns.

Effective permission = union of all grants across a user's roles, minus each role's exceptions (exceptions only apply within the role that declared them).

---

## 7. Configuration, Periods & Migrations

- Each **Period** (admissions year, semester, etc.) holds a frozen configuration per prompt/requirement/program. Administrators tune values per period (income thresholds, minimum exercise hours, etc.).
- `ConfigurationDefinition` on a prompt or requirement controls:
  - `schema` — ajv-validated shape
  - `preProcessData` + `validate` — admin input pipeline
  - `fetch` — populate the config form from external data
  - `migrations` — forward-migrate stored config when the code shape changes
  - `default` — used for first period after the key is introduced (and as reset target)
- `ensureConfigurationRecords()` writes defaults for newly-registered definitions.
- AppRequest data has its own migration chain (`AppRequestMigration` inside `PromptDefinition.migrations`), keyed by `savedAtVersion` (YYYYMMDDHHMMSS). Closed AppRequests keep their historical configuration but get migrated forward on re-open.

DB schema migrations are assembled from the framework's built-ins (`periodMigrations`, `promptMigrations`, etc.) plus the project's own `migrations`. See `demos/src/default/testdata.ts` for the pattern — migrations receive `(db, installTestData)` and can seed users, periods, and pre-filled AppRequests.

---

## 8. UI Architecture

### The UIRegistry (`ui/src/lib/registry.ts`)
Mirror image of the API registries — the downstream UI project gives each prompt / requirement / program key a set of Svelte components:

```ts
interface PromptDefinition {
  key: string
  formComponent?: Component            // apply/review form; omit => automation-only prompt
  formMode?: 'small' | 'large' | 'full'
  displayComponent: Component          // read-only summary (required)
  displayMode?: 'small' | 'large'
  configureComponent?: Component       // admin config form
  configureDisplayComponent?: Component
  automation?: boolean
  icon?: Component
}
```

`RequirementDefinition` and `ProgramDefinition` similarly attach `icon`, `configureComponent`, `configureDisplayComponent`.
Keys link UI definitions back to API definitions.

`UIConfig` also carries global `appName`, dashboard copy, terminology overrides (customize "App Request" → "Application", etc.),
and UI slots (`reviewerSidebarCard`, `reviewerSidebar`).

### Assembly (`ui/src/local/index.ts`)
The downstream project's `ui/src/local/index.ts` exports a singleton `uiRegistry = new UIRegistry({...})`. This file imports every project-specific `.svelte` component and binds it to a key.
The demos branch on `PUBLIC_DEMO_INSTANCE` at runtime (using a deliberate build-time obfuscation so vite/rollup doesn't tree-shake the alternates — see the `tmpDemoInstance` dance).

### SvelteKit Routes (`ui/src/routes`)
Framework-provided, generic pages:
- `dashboards/applicant`, `dashboards/reviewer`
- `requests/[id]` — the AppRequest detail view (applicant + reviewer)
- `periods/[id]` — period configuration
- `roles/[id]` + `roles/users` — access management

The routes consume `uiRegistry.getPrompt(key)` / `getRequirement(key)` / `getProgram(key)` to render the project-specific components inside the generic frames.

### Prompt Components
Form component receives `data` (two-way bound) and `fetched` (from `PromptDefinition.fetch`). Display component receives `data`, and for cross-user prompts, an `isApplicantView` flag when `exposeToApplicant` is used.

Example pair from `ui/src/local/default/`:
```svelte
<!-- CatTowerPrompt.svelte -->
<script lang="ts">
  import { FieldCheckbox, FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: CatTowerData
</script>
<FieldRadio boolean path="haveCatTower"
            legendText="Do you have a cat tower in your house?"
            items={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
<FieldCheckbox boolean path="willPurchaseCatTower"
               labelText="I agree to purchase a cat tower upon adoption."
               conditional={data.haveCatTower === false} />

<!-- CatTowerPromptDisplay.svelte -->
<script lang="ts">export let data: CatTowerData</script>
{#if !!data.haveCatTower} Already owns a cat tower.
{:else if !!data.willPurchaseCatTower} Will purchase a cat tower.
{:else if !data.haveCatTower} No cat tower.
{/if}
```

Shared form primitives come from `@txstate-mws/carbon-svelte` (`FieldRadio`, `FieldCheckbox`, `FieldSelect`, `FieldNumber`, `FieldUpload`, …). The `path` prop ties the field to a key in the prompt's `data` object, matching the JSON Schema for that prompt.

---

## 9. End-to-End Wiring — A Concrete Trace

Tracing the *"applicant must own a cat tower"* requirement through the `default` demo:

| Layer | File | Responsibility |
|---|---|---|
| Data model | `demos/src/default/definitions/models/cat.models.ts` | `CatTowerPromptSchema` (JSON Schema) + `CatTowerPromptData` (TS type via `FromSchema`) |
| Prompt API | `demos/src/default/definitions/prompts/cat.prompts.ts` | `have_a_cat_tower_prompt`: `schema = CatTowerPromptSchema`, `validate()` checks fields |
| Requirement API | `demos/src/default/definitions/requirements/cat.requirements.ts` | `have_a_cat_tower_req`: `type: QUALIFICATION`, `promptKeys: ['have_a_cat_tower_prompt']`, `resolve()` returns PENDING / MET / DISQUALIFYING |
| Program API | `demos/src/default/definitions/programs.ts` | `adopt_a_cat_program.requirementKeys` includes `'have_a_cat_tower_req'` |
| Boot API | `demos/src/index.ts` | imports the above and calls `RQServer.start({ programs, requirements, prompts, migrations, appConfig })` |
| Prompt UI form | `ui/src/local/default/CatTowerPrompt.svelte` | Svelte form using `CatTowerData` |
| Prompt UI display | `ui/src/local/default/CatTowerPromptDisplay.svelte` | Read-only summary |
| UI registration | `ui/src/local/index.ts` | `{ key: 'have_a_cat_tower_prompt', formComponent: CatTowerPrompt, displayComponent: CatTowerPromptDisplay }` |

**Runtime flow when the applicant reaches this requirement:**

1. The AppRequest's current phase and the program's ordered `requirementKeys` produce a nav of visible requirements.
2. `requirementRegistry.get('have_a_cat_tower_req')` returns the processed definition whose `visiblePrompts[0]` is `have_a_cat_tower_prompt`.
3. The UI renders that prompt's `formComponent` from `uiRegistry`.
4. User submits → Fastify route validates against `CatTowerPromptSchema` → runs `preValidate` → runs `preProcessData` → persists → runs `validate`.
5. After save, `resolve()` is re-run for each requirement whose `promptKeySet` contains `have_a_cat_tower_prompt`, but only if every dependent prompt has zero validation errors.
6. New `ApplicationRequirement.status` is written; `ApplicationPhase` / `AppRequestStatus` may advance; `AppDefinition.hooks.applicationPhase` fires.
7. Invalidation: if any other prompt lists this one in `invalidUponChange`, those other prompts may be marked unanswered.

**A more interesting example — the vaccine review loop** (`cat.prompts.ts`):
- Reviewer's `vaccine_review_prompt` has `invalidUponChange(data)` returning `[{ promptKey: 'other_cats_vaccines_prompt', reason: ... }]` when any `satisfactory === false`.
- It also has `validUponChange(data)` returning `['other_cats_vaccines_prompt']` when all `satisfactory === true`.
- Effect: a reviewer rejection bounces the applicant's upload back to "needs answer"; the reviewer later flipping all four checkboxes back to yes silently revalidates — so we don't strand the AppRequest waiting on an applicant who isn't needed.

---

## 10. Patterns Observed Across the Demos

| Demo | Complexity it illustrates |
|---|---|
| `default` | Two programs, shared and program-specific requirements, file uploads, reviewer↔applicant invalidation loops, an indexed field (`applicant_seems_nice_prompt.indexes`) |
| `simple` | One program + a side "thanks or no thanks" program, per-requirement `configuration.default`, a reviewer confirmation requirement that reads another requirement's config via `allConfig` |
| `multi` | Toggles `multipleRequestsPerPeriod: true`; same definition set as default |
| `complex` | PREQUAL/QUALIFICATION/POSTQUAL/APPROVAL/ACCEPTANCE all exercised, both blocking and non-blocking workflow stages, cross-program shared requirements, rich `configuration.fetch` (state lists), separate review prompts per program |
| `rc` | Scaffolded but commented out — placeholder for a new project |

Conventions worth following:

- One file per topical group: `cat.prompts.ts`, `cat.requirements.ts`, `cat.models.ts`. Barrel-export via `index.ts`.
- Naming: `snake_case_key` for API definitions (used as DB tags & auth tags); `PascalCase` Svelte component and data-type names.
- `{topic}_prompt` vs `{topic}_req` — keys must not collide across prompts and requirements (they share the auth-tag namespace).
- Put every JSON Schema in `models/`, derive TS types with `FromSchema<typeof Schema>`; share the schema between `PromptDefinition.schema` and the UI's field `path` props by naming consistency.
- Requirements that need config either use `configuration.default` (simple) or `configuration.fetch` (external data) + a matching `configureComponent` on the UI side.

---

## 11. Development Workflow

- `docker-compose.yml` starts `mysql`, `fakeauth`, `api` (port 81), `ui` (port 80). Selecting an example project: `DEMO_INSTANCE=complex docker compose up`.
- `api/package.json` + nodemon config rebuilds `@reqquest/api` then the demo on file changes under `api/src` or `demos/src`.
- `ui/` is a SvelteKit app served by vite in dev, static-exported in production (`@sveltejs/adapter-static`). Its `local/index.ts` builds the `uiRegistry` used by every framework route.
- DB is reset on startup in dev (`RESET_DB_ON_STARTUP: true`). Seeds come from the project's `DatabaseMigration[]` passed into `RQServer.start()`.
- `test/` holds Playwright suites; `test.sh` runs them against a compose-composed stack.

---

## 12. Building a New Downstream Project

For greenfield projects, the recommended path is **spec-driven**: author a single YAML in `specs/requirements/` and run the generator. Operator guide at `specs/README.md`; spec format reference at `specs/SPECS.md`. One command produces a complete, compilable project:

```bash
cd specs && npm run gen requirements/<name>.spec.yml -- --emit --verify
```

Output lands at `demos/src/<project>/` (API definitions, programs, bootstrap, idempotent `logic.ts` stubs) and `ui/src/local/<project>/` (per-prompt Svelte components, copied templates, `uiRegistry.ts`). The generator tracks idempotency for hand-authored files (`logic.ts`, the bootstrap, and Shape D escape components) so re-runs preserve author edits.

What the spec author writes vs. what the generator emits:

| Author writes                | Generator emits                                                              |
|------------------------------|------------------------------------------------------------------------------|
| YAML spec (1 file)           | JSON Schemas + `FromSchema` types, prompt/requirement/program definitions    |
| Optional logic-stub bodies   | Function stubs for any `validate: true` / `resolve: true` / `dynamic` hooks  |
| Optional Shape D components  | Minimal Svelte stubs for `component:` slots (only when missing)              |
| Optional bootstrap edits     | A starting `index.ts` that calls `RQServer.start({...})`                     |

The framework owns: persistence, lifecycle transitions, phase/status computation, authorization evaluation, dashboards, list filters, period management, role management, audit logs, email hooks, file downloads, workflow stage advancement, and the GraphQL API.
The project owns: data shapes, business rules (rule expressions or imperative bodies), form UX, display UX, and the auth-source wiring at the bootstrap.

If you'd rather hand-author (no generator), the produced project shape is the contract: a `definitions/` tree with `models/`, `prompts/`, `requirements/`, `programs.ts`, optional `logic/`, and a `RQServer.start(...)` bootstrap. See any `demos/src/*` for working hand-written examples.
