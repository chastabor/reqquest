# ReqQuest Spec Generator

Author a single YAML spec; emit a complete, compilable downstream ReqQuest project (API definitions + Svelte UI + bootstrap).

For framework background, read `DESIGN.md`. For the spec format reference, read `../CLAUDE.md`. This file is the operator guide — how to write a spec, run the generator, and iterate.

---

## Quick Start

```bash
# 1. Install (once)
cd specs
npm install

# 2. Author or copy a spec
cp requirements/demo-default2.spec.yml requirements/myproject.spec.yml
$EDITOR requirements/myproject.spec.yml

# 3. Validate (parse + cross-references; no files written)
npm run gen requirements/myproject.spec.yml

# 4. Emit (writes into demos/ and ui/ at the repo root)
npm run gen requirements/myproject.spec.yml -- --emit

# 5. Optionally verify the emit (runs tsc + svelte-check)
npm run gen requirements/myproject.spec.yml -- --emit --verify
```

`npm run gen` is the development shorthand for `npx tsx src/cli.ts`. After `npm run build`, the binary is exposed as `reqquest-gen` for downstream tooling.

After step 4, your project lives at:
- `demos/src/<project-id>/` — API definitions + bootstrap
- `ui/src/local/<project-id>/` — Svelte components + UIRegistry

---

## CLI

```
reqquest-gen <spec-path> [--repo-root <path>] [--out <path>] [--emit] [--dry-run] [--verify]
```

| Flag           | Default       | Behavior                                                                  |
|----------------|---------------|---------------------------------------------------------------------------|
| _no flags_     | —             | Parse + validate only. Reports parse / cross-ref / invariant errors.      |
| `--emit`       | off           | Write generated files to disk.                                            |
| `--dry-run`    | off           | Compute the bundle and list paths it would write; no disk writes.         |
| `--verify`     | off           | After `--emit`, run `tsc --noEmit` (demos/) and `svelte-check` (ui/).     |
| `--repo-root`  | `cwd`         | Where the generator looks for `specs/resources/` fixtures and templates.  |
| `--out`        | `--repo-root` | Where files are written. Use a temp dir for dry-experiments.              |

The CLI exits non-zero if parsing, validation, or `--verify` fails.

---

## Authoring a spec

A spec is a single YAML file under `specs/requirements/`. Top-level shape:

```yaml
specVersion: 2
project:
  id: myproject              # → emits to demos/src/myproject/ and ui/src/local/myproject/
  name: My Project           # → UIRegistry.appName
  multipleRequestsPerPeriod: false
  ui:                        # → forwarded verbatim into UIConfig
    applicantDashboardIntroHeader: "Welcome"
    applicantDashboardRecentDays: 30

models:                      # JSON-Schema shorthand keyed by PascalCase ids
  HaveYardPrompt:
    group: yard              # → emit file: demos/.../models/yard.models.ts
    properties:
      haveYard: boolean
      squareFootage: number

prompts:                     # camelCase ids
  haveYardPrompt:
    title: Tell us about your yard
    model: HaveYardPrompt
    ui:
      form:
        fields:
          - FieldRadio: { path: haveYard, boolean: true, items: [...] }
      display:
        cases:
          - { when: "!haveYard", text: "No yard." }
          - else: true
            template: LabeledFields
            props: { entries: [{ path: squareFootage, label: "Sq Ft" }] }
    validate:
      rules:
        - { field: haveYard, required: true, message: "Please indicate." }

requirements:
  haveBigYardReq:
    phase: PREQUAL
    title: Have a big yard
    prompts: [haveYardPrompt]
    resolve:
      rules:
        - { when: "haveYardPrompt.haveYard == null", status: PENDING }
        - { when: "haveYardPrompt.squareFootage >= 1000", status: MET }
        - { else: true, status: DISQUALIFYING, reason: "Yard too small." }

programs:
  adoptADogProgram:
    title: Adopt a Dog
    icon: DogWalker          # → carbon-icons-svelte/lib/DogWalker.svelte
    requirements: [haveBigYardReq]
```

The full grammar (every field, hook value, rule key, UI shape) is documented in `../CLAUDE.md`. Use `requirements/demo-default2.spec.yml` as a working reference covering most features.

### Identifier rules

- **Models** — `PascalCase` (e.g. `HaveYardPrompt`).
- **Prompts / requirements / programs / workflow stages** — `camelCase` (e.g. `haveYardPrompt`, `mustExerciseYourDogReq`).
- The generator derives `snake_case` API keys, TS const names, file paths, and Svelte component names from these. Don't repeat keys across the spec.

### Reference data

For enumerated lookups (states, departments, …) declare a `referenceData` model. Provide values inline, from a YAML/JSON fixture, or as a TS expression:

```yaml
models:
  StateList:
    group: state
    kind: referenceData
    shape: { value: string, label: string }
    fixture: specs/resources/data/states.yml      # repo-root-relative
```

Then reference it from a prompt's model:

```yaml
WhichStatePrompt:
  properties:
    state:     { enum: StateList }                # value side
    stateName: { enum: StateList, by: label }     # label side
```

### UI shapes

Each prompt slot (`form` / `display` / optional `configure`) accepts one of four shapes:

| Shape | Form         | When to use                                                       |
|-------|--------------|-------------------------------------------------------------------|
| A     | `fields:`    | Inline carbon-svelte primitives (`FieldRadio`, `FieldNumber`, …). |
| B     | `template:`  | Reuse a template from `specs/resources/ui-templates/`.            |
| C     | `text:` / `cases:` | Tiny display readouts (display slot only).                  |
| D     | `component:` | Hand-written escape hatch — generator emits a stub if missing.    |

`text:` and `message:` strings support `{{ expression }}` interpolation; `conditional:` / `when:` are full TS expressions. Identifier resolution rules (bare → `data.<field>`, prompt-id → `data.<snake>?.…`) are in CLAUDE.md §6.5.

### Hook values

Validation, resolution, and side-effect hooks accept three forms:

| Value             | Meaning                                                                   |
|-------------------|---------------------------------------------------------------------------|
| `{ rules: [...] }`| Declarative — generator emits the function body inline.                   |
| `true`            | Author-written — generator emits a typed stub in `<group>.logic.ts`.      |
| `false`           | Explicit no-op (omitted from the emit).                                   |

Logic-file emission is **idempotent** — re-running the generator only adds new stubs; existing function bodies are preserved.

---

## Pipeline (what `--emit` actually does)

```
parse → resolve (cross-refs) → validate → emit phases → flush → optional --verify
```

Emit phases run in order, each producing files into a shared in-memory bundle:

1. **Models** — per-group `models/<group>.models.ts` (JSON Schema const + `FromSchema` type) and `models/index.ts` barrel. Reference data emits as an `as const` literal with a provenance comment.
2. **Logic** — per-group `logic/<group>.logic.ts` with stubs for every `true` / `dynamic` hook in scope. **Idempotent via ts-morph**: existing function bodies preserved, missing stubs appended.
3. **Prompts** — per-group `prompts/<group>.prompts.ts` (`PromptDefinition` literal per prompt). Rule-based hooks emit inline; `true` hooks import from `logic/`.
4. **Requirements** — per-group `requirements/<group>.requirements.ts` (`RequirementDefinition` literal). `phase` → `RequirementType.<X>`, declarative `resolve.rules` → first-match function body, `configuration: { default, validate }` block.
5. **Programs** — single `programs.ts` with one `ProgramDefinition` per program. Workflow stages flatten to `workflowStages: [{ key, title, nonBlocking?, requirementKeys }]` (default `blocking: true`).
6. **Bootstrap** — `index.ts` calling `RQServer.start({...})`. Includes a development `userLookups.byLogins` stub. **Idempotent (write-only-if-missing)**: author edits survive re-runs.
7. **UI** — Svelte components per prompt slot (Shape A/B/C/D), templates copied into `_templates/`, plus a complete `uiRegistry.ts`. Shape D files are write-only-if-missing.

Author-owned files marked **idempotent** above are safe to edit; the generator never clobbers them.

---

## Output layout

```
demos/src/<project-id>/
├── index.ts                                 # bootstrap (RQServer.start)
└── definitions/
    ├── models/
    │   ├── <group>.models.ts (× N)
    │   └── index.ts
    ├── logic/
    │   └── <group>.logic.ts (× N)           # author-owned (idempotent)
    ├── prompts/
    │   ├── <group>.prompts.ts (× N)
    │   └── index.ts
    ├── requirements/
    │   ├── <group>.requirements.ts (× N)
    │   └── index.ts
    └── programs.ts

ui/src/local/<project-id>/
├── _templates/                              # Copies of referenced templates
│   └── <Template>.svelte (× N)
├── <group>/
│   ├── <PromptId>.svelte                    # form slot
│   ├── <PromptId>Display.svelte             # display slot
│   └── <ReqId>Configure.svelte              # configure slot (when present)
└── uiRegistry.ts                            # UIRegistry({...})
```

For demo-default2 the generator emits 48 files total.

---

## Iterating

Typical loop after the first emit:

1. Edit the YAML spec.
2. Re-run `npx tsx src/cli.ts <spec> --emit`.
3. If a hook is `true`, fill in the body in `demos/src/<project>/definitions/logic/<group>.logic.ts` (your edits are preserved across re-runs).
4. If a slot is `component:` Shape D, fill in the Svelte stub at `ui/src/local/<project>/<group>/<Component>.svelte`.
5. Run `--verify` to confirm `tsc` and `svelte-check` are clean.

### Wiring into the running stack

The repo's compose stack picks a project by `DEMO_INSTANCE`, which is dispatched in `demos/src/index.ts` and `ui/src/local/index.ts`. To actually boot a freshly generated project:

1. Add an `else if` branch for your project id in `demos/src/index.ts` that wires `programs`, `requirements`, `prompts` from `./<project-id>/definitions/...`.
2. Add a matching branch in `ui/src/local/index.ts` (or import from the generated `ui/src/local/<project-id>/uiRegistry.ts` directly).
3. Boot:

   ```bash
   DEMO_INSTANCE=<project-id> docker compose up
   ```

For greenfield deployments, the generated `demos/src/<project-id>/index.ts` is already a complete `RQServer.start(...)` entry — point your service at it directly and skip the dispatcher.

See `docker-compose.yml` and `DESIGN.md` §11 for the local stack details.

### Resetting

Most generated files are overwritten on each `--emit`. Three categories survive:

- `demos/src/<project>/definitions/logic/<group>.logic.ts` — function bodies you've written.
- `demos/src/<project>/index.ts` — the bootstrap (auth wiring, custom `appConfig`).
- `ui/src/local/<project>/<group>/<Component>.svelte` — Shape D escape-hatch components.

To start completely fresh:

```bash
rm -rf demos/src/<project-id> ui/src/local/<project-id>
npm run gen requirements/<project-id>.spec.yml -- --emit
```

---

## Validation errors

The generator surfaces every problem it finds in one pass. Examples:

- **Parse errors** — Zod schema violations with `<path>: <message>`.
- **Resolve errors** — unknown cross-references (`prompts.foo.model: unknown model "Bar"`).
- **Validation errors** — invariant violations (apiKey collisions, WORKFLOW phase used outside workflow stages, rule expressions referencing fields that don't exist on the model).
- **Emit-time errors** — when validation misses something, errors include the spec location (e.g. `models.HaveYardPrompt.properties.foo: references model "X" but no model with that id exists`).

---

## Troubleshooting

| Symptom                                                                     | Likely cause / fix                                                                                                        |
|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `unknown prompt "foo"` during resolve                                       | Typo in the prompt id, or it's not declared at the spec's top-level `prompts:` map.                                       |
| `apiKey collision: "foo"`                                                   | A prompt and a requirement share a snake_case key. Rename one of the camelCase ids — they share an auth-tag namespace.    |
| `unknown field "X" on model Y` in a rule expression                         | The expression references a field that doesn't exist on the prompt's model. Check the model's `properties:` block.        |
| `phase WORKFLOW; WORKFLOW requirements may only appear under …workflow.…`   | A `phase: WORKFLOW` requirement is listed in `programs.<x>.requirements`. Move it under `programs.<x>.workflow.<stage>.requirements`. |
| `tsc` fails after `--emit` complaining about a hand-edited `.logic.ts`      | Your stub body has a type error. Fix the function in `demos/src/<project>/definitions/logic/<group>.logic.ts`.             |
| `svelte-check` fails with `node:util styleText` in `--verify`               | Node version too old. `svelte-check` requires Node 20+; `tsc` still runs cleanly.                                          |
| `binary not found at …/node_modules/.bin/tsc` during `--verify`             | Run `npm install` in the package the binary is missing from (`demos/` or `ui/`).                                          |
| Re-running `--emit` doesn't pick up your `logic.ts` rewrite                 | Working as intended — `logic.ts` is author-owned. The generator only adds new stubs; existing function bodies survive.    |
| Want to revert a hand-edited Shape D component to a fresh stub              | Delete the `.svelte` file at `ui/src/local/<project>/<group>/<Name>.svelte`, then re-run `--emit`.                         |
| Reference data values look stale                                            | `fixture:` is read at generation time, not runtime. Re-run `--emit` after editing `specs/resources/data/<file>.yml`.       |

---

## Development (working on the generator itself)

```bash
cd specs
npm install
npm test            # vitest run — 175 tests
npm run build       # tsc → dist/
npm run lint        # eslint
```

Source layout:

| Path                       | Purpose                                                   |
|----------------------------|-----------------------------------------------------------|
| `src/cli.ts`               | CLI entry. argv → parse → resolve → validate → emit → verify |
| `src/spec/`                | Zod schema, YAML parser, fixture loader                   |
| `src/ir/`                  | `ResolvedSpec` types, name derivation, cross-ref linking, model field lookup |
| `src/validate/`            | Invariants, fields, expressions, UI checks                |
| `src/expr/`                | Rule-grammar parser + scope-aware identifier rewriter     |
| `src/emit/`                | Per-phase emitters; `OutputBundle` virtual-fs            |
| `src/emit/ui/`             | UI-specific emit (shapes A/B/C/D, templates, registry)   |
| `src/codegen/`             | TS literal printers, Svelte primitives, prettier wrapper, ImportCollector |
| `src/util/`                | Generic helpers (`fileExists`)                            |
| `src/verify/`              | `tsc` + `svelte-check` runner                             |

---

## Limitations

- **`svelte-check` requires Node 20+.** On older Node the verify pass reports it as failing with a setup error; `tsc` still runs cleanly.
- **`'dynamic'` invalidates / revalidates** are not yet wired through `emit/invalidates.ts` (declarative `whenAnyFalse` / `whenAllTrue` and static `[promptId, …]` arrays are fully supported).
- **Cross-package imports** in tests assume the standard repo layout (`<repo>/specs`, `<repo>/demos`, `<repo>/ui`); custom layouts via `--out` are supported but `--verify` only runs against `demos/` and `ui/` under that root.
- **Source mapping back to the spec** for `tsc` / `svelte-check` failures is best-effort — the file path tells you which group/section to look at, but line numbers point into emitted code, not the YAML.

---

## Where to read next

- **`../CLAUDE.md`** — canonical spec format reference: every field, every hook value, every rule key, every UI shape, every cross-reference rule. Read this when authoring.
- **`DESIGN.md`** — framework background: how `RQServer`, `UIRegistry`, prompts/requirements/programs, access control, and the lifecycle phases fit together. Read this when the spec format isn't enough and you need to understand what the generated project does at runtime.
- **`requirements/demo-default2.spec.yml`** — a reference spec that exercises every supported shape (Shape A/B/C, fetch from referenceData, gatherConfig, declarative invalidates/revalidates, indexes, tags, configuration with default + validate rules, workflow-stage-free programs).
- **`resources/ui-templates/INDEX.md`** — catalog of the curated parametric Svelte templates available via Shape B (`template: <Name>`).
