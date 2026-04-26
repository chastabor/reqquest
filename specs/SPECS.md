# Working with ReqQuest Project Specs

Purpose: enable a reader (human or Claude) to take one of the spec files
under `requirements/` and produce a runnable ReqQuest downstream project.
Read alongside `DESIGN.md` (framework background) and the canonical
example spec at `requirements/demo-default2.spec.yml`.

The generator implementation lives in `src/` and is invoked via
`npm run gen <spec> -- --emit` (or `reqquest-gen` after `npm run build`).
For the operator-facing guide — install, run, iterate, troubleshoot — see
`README.md`. This file is the **spec format reference** for both authors
and the generator.

---

## 1. What the spec is (and isn't)

The spec is the **single source of truth for structure, keys, schemas, and
wiring**. It declares:

- which models, prompts, requirements, programs exist
- their data shapes (JSON Schemas), titles, phases, ordering
- how prompts/requirements reference each other (invalidates, gatherConfig,
  prompt→requirement→program chains)
- which hooks the author will provide (resolve, validate, preload, fetch, …)
- per-period configuration defaults and the admin config model
- UI component bindings (form / display / configure)

The spec intentionally does **not** contain imperative logic — `resolve()`,
`validate()`, `preProcessData()`, Svelte component bodies, etc. are written
by the author in the files the generator emits. The spec captures the
*contract*; the code fills in the *behavior*.

---

## 2. Two invariants the generator must enforce

1. **Identifiers are authoritative.** A typo in a cross-reference is a
   generation-time error, never a runtime error. If `programs.adoptADogProgram.requirements`
   lists `yardQualReq`, the generator must find a sibling entry under
   `requirements:` with that exact id (and the same for every prompt/model
   lookup).
2. **Nothing is named twice.** There is no `key:` field next to identifier
   fields, no filename on any entry, no separate function-binding section.
   If a piece of information can be derived from the id + conventions in
   §3–§5, it MUST be derived.

---

## 3. Identifier → derived names

| Spec section     | Id style    | API key              | TS symbol             | Example                                                                      |
|------------------|-------------|----------------------|-----------------------|------------------------------------------------------------------------------|
| `models.X`       | PascalCase  | —                    | `XSchema`, `XData`    | `StateResidencePrompt` → `StateResidencePromptSchema`, `StateResidencePromptData` |
| `prompts.x`      | camelCase   | `snake_case_of(x)`   | const `x`             | `stateResidencePrompt` → key `state_residence_prompt`                        |
| `requirements.x` | camelCase   | `snake_case_of(x)`   | const `x`             | `stateResidencePrequalReq` → key `state_residence_prequal_req`               |
| `programs.x`     | camelCase   | `snake_case_of(x)`   | const `x`             | `adoptADogProgram` → key `adopt_a_dog_program`                               |
| `programs.x.workflow.y` | camelCase | `snake_case_of(y)` | —               | `approveReviewerExerciseExemptionAdoptADogWorkflow` → `approve_reviewer_exercise_exemption_adopt_a_dog_workflow` |

Conversion rule: insert `_` before any capital letter (except the first
char), then lowercase. Consecutive caps stay glued (`IDValuesPrompt` →
`id_values_prompt`). If an id contains intentional single-word lumps like
`petowner`, preserve them — the camelCase in the spec encodes the
intention.

---

## 4. File placement is derived

Only models declare a `group:`. Prompts inherit it through `model:`;
requirements inherit it through their first prompt in `prompts:`. Programs
have no group — they go in a single file.

| Item         | Emitted path                                                          |
|--------------|-----------------------------------------------------------------------|
| Model        | `demos/src/<project>/definitions/models/<group>.models.ts`            |
| Prompt       | `demos/src/<project>/definitions/prompts/<group>.prompts.ts`          |
| Requirement  | `demos/src/<project>/definitions/requirements/<group>.requirements.ts`|
| Logic stubs  | `demos/src/<project>/definitions/logic/<group>.logic.ts`              |
| Programs     | `demos/src/<project>/definitions/programs.ts`                         |
| Barrel       | `index.ts` in each folder re-exports all siblings                     |
| API boot     | `demos/src/<project>/index.ts` calls `RQServer.start({...})`          |
| Svelte       | `ui/src/local/<project>/<group>/<Component>.svelte`                   |
| UI registry  | `ui/src/local/<project>/uiRegistry.ts`                                |

If an entry needs to live in a non-default file (rare), add `group:` on
that entry to override.

---

## 5. Schema shorthand

Every model entry produces:
```ts
export const <Id>Schema = { ...json schema... } as const satisfies SchemaObject
export type   <Id>Data   = FromSchema<typeof <Id>Schema>
```

Property forms accepted in `properties:` (or a model's inline body):

| Spec syntax                           | Emitted JSON-Schema                                                                 |
|---------------------------------------|-------------------------------------------------------------------------------------|
| `name: string` / `number` / `boolean` | `{ type: 'string' }` / `'number'` / `'boolean'`                                     |
| `name: { format: date-time }`         | `{ type: 'string', format: 'date-time' }`                                           |
| `name: { enum: StateList }`           | `{ type: 'string', enum: stateList.map(s => s.value) }` — value side (default)      |
| `name: { enum: StateList, by: label }`| `{ type: 'string', enum: stateList.map(s => s.label) }` — label side                |
| `name: <ModelId>`                     | inlined `<ModelId>Schema` object                                                    |
| `name: { array: <type> }`             | `{ type: 'array', items: <type> }` (`<type>` recurses using these same rules)       |

Top-level model fields:
- `required: [names]` — top-level `required` array (default: none).
- `properties: {...}` — the property map. Root `additionalProperties: false`
  is always emitted (no opt-out in the spec).
- `kind: referenceData` — emit a typed `as const` literal array, not a
  schema. Sub-fields:
  - `shape:` — element type (object-literal shorthand or a `<ModelId>` ref).
  - `values:` — inline literal array. Preferred for small, stable lists
    (≲ 10 entries) that read well in the spec itself.
  - `fixture:` — path (repo-root-relative) to a `.yml` / `.yaml` / `.json`
    file whose contents the generator reads and inlines verbatim as the
    `as const` literal at generation time. Prefer YAML for parity with
    spec files and better human editability; JSON is accepted. Use for
    large or externally curated lists (e.g. `specs/resources/data/states.yml`). The
    generator is the one that reads the fixture — downstream code sees a
    plain inlined array, no runtime I/O. Conventionally fixtures live
    under `specs/resources/data/`, but the path is free-form.
  - `compute:` — a TS expression used for derived lists (e.g.
    `"[...AdoptADogList, ...AdoptACatList]"`).
  Exactly one of `values` / `fixture` / `compute` must be present.
  Emit a provenance comment above the `as const` literal pointing at the
  source (`// Inlined from specs/resources/data/states.yml (spec: StateList.fixture).`)
  so readers can trace the values back to the spec.

---

## 6. Hook value vocabulary

Each hook field on a prompt, requirement, or configuration accepts one of:

| Value                              | Meaning                                                                                      |
|------------------------------------|----------------------------------------------------------------------------------------------|
| `true`                             | Author provides a named function. Generator emits a typed stub in `<group>.logic.ts` and imports it. |
| `false`                            | Hook is intentionally a no-op; generator omits it (or emits an empty function where required). |
| `dynamic`                          | Same as `true` but signals "function form of an otherwise declarative field" (used for `invalidates` / `revalidates`). |
| `<ReferenceDataId>`                | `fetch` only: emit `async () => ({ <constName> })` — the prompt's `fetched` receives the inlined reference-data array under its lowercased const name (e.g. `stateList`). |
| `[promptId, ...]`                  | `invalidates` / `revalidates` static list form. Emits `invalidUponChange: [{ promptKey: ... }, ...]`. |
| `{ whenAnyFalse / whenAllTrue: [paths], targets: [...] }` | `invalidates` / `revalidates` declarative form. Generator synthesizes the function body that fires `targets` when any/all of the boolean `paths` (within the prompt's own data) match. Each `targets:` entry is either a bare prompt id or `{ promptId, reason }`. |
| `{ from: id, fields: [...] }`-map  | `gatherConfig` declarative form. Emits the appropriate pluck function body.                  |
| `{ copyFrom: promptId, fields? }`  | `preload` declarative form — copy a (possibly partial) answer from another prompt when present. |
| `{ rules: [...] }`                 | `validate` / `preValidate` / `resolve` / `configuration.validate` declarative form. See §6.5. |
| `{ map: <field>, true: <tag>, false: <tag>, labels: {...} }` | `indexes.<x>.extract` declarative form for boolean-derived tags. Generator emits an extract that returns `[<tag>]` based on the value of `<field>` on the prompt's data. `labels:` populates `getLabel`. |
| `<expression-string>`              | `indexes.<x>.extract` / `tags.<x>.extract` shorthand. The string is an expression returning the array of tags (e.g. `"[data.state]"`); see §6.5 for the evaluation rules. |
| `<ReferenceDataId>`                | `tags.<x>.source`: pulls `getTags()` and `getLabel()` from the named reference data. Pairs with the expression form of `extract`. |

Hook-to-signature mapping for the `true` / `dynamic` stubs:

| Field on prompt                    | Emitted signature                                                  |
|------------------------------------|--------------------------------------------------------------------|
| `validate`                         | `(data, config, appRequestData, allPeriodConfig, db) => MutationMessage[]` |
| `preValidate`                      | same as `validate` but runs pre-save                               |
| `preProcessData`                   | `(data, ctx, appRequest, appRequestData, allPeriodConfig, db) => Data` |
| `preload`                          | `(appRequest, config, appRequestData, allPeriodConfig, ctx) => Data` |
| `fetch`                            | `(appRequest, config, appRequestData, allPeriodConfig, ctx) => FetchType` |
| `invalidates` / `revalidates` = `dynamic` | `InvalidatorFunction` / `RevalidatorFunction`                |

| Field on requirement / config      | Emitted signature                                                  |
|------------------------------------|--------------------------------------------------------------------|
| `resolve`                          | `(appRequestData, config, configLookup) => { status, reason? }`    |
| `configuration.validate`           | `(data) => MutationMessage[]`                                      |
| `configuration.fetch`              | `(period) => any`                                                  |
| `configuration.preProcessData`     | `(data, ctx) => ConfigData`                                        |

Each stub import binds to `<group>.logic.ts`. The logic file is the author's
workspace; the generator should re-run safely without overwriting existing
bodies (e.g. emit stubs only when the symbol is missing).

---

## 6.5. Rule grammar (declarative `validate` / `preValidate` / `resolve`)

When a hook is given as `{ rules: [...] }`, the generator emits the
function body itself rather than a stub. Two rule families exist:

### Field-validation rules (`validate`, `preValidate`, `configuration.validate`)

Each rule binds to one field on the prompt's own data shape and emits one
or more `MutationMessage`s. Common keys:

| Key                | Meaning                                                                  |
|--------------------|--------------------------------------------------------------------------|
| `field:`           | Name (or dot-path) on the prompt's model. **Required**, validated against the model schema. |
| `required: true`   | Empty/null/undefined emits `message`.                                  |
| `requiredWhen:`    | Expression (§6.5 rules below). Field is required only when truthy.      |
| `min:` / `max:`    | Numeric bound. Value can be a literal or an expression (e.g. `"config.minExerciseHours"`). Failing values emit `message`. |
| `maxSize:`         | Upload size limit (`"10MB"`, `1024`, …); `preValidate` only.             |
| `equalsLabelOf:`   | Cross-field equality. Asserts `data.<field>` equals the matching label of `data.<equalsLabelOf>` from `source:`. Used for `value`/`label` mirrors over reference data. |
| `source:`          | A `<ReferenceDataId>` (referenceData model id). Required when `equalsLabelOf:` is set. |
| `messageType:`     | `error` (default) or `warning`. `warning` does not block save but blocks resolution. |
| `message:`         | The user-facing string. Supports `{{...}}` interpolation (§6.5 expressions). |

Each rule emits exactly one conditional `messages.push(...)`; the rules
list is walked in order with no deduplication. Authors should keep rules
distinct (different `field:` or different predicate keys).

### Resolve rules (`resolve`)

Each rule maps a guard to a status. **First match wins.**

| Key       | Meaning                                                                   |
|-----------|---------------------------------------------------------------------------|
| `when:`   | Expression returning truthy/falsy. Required unless `else: true` is set.   |
| `else: true` | Catch-all clause; must appear last and only once.                      |
| `status:` | One of `PENDING` / `MET` / `DISQUALIFYING` / `WARNING` / `NOT_APPLICABLE`. |
| `reason:` | Optional reason string. Supports `{{...}}` interpolation.                 |

### Expression evaluation

Rule expressions (`when:`, `requiredWhen:`, `min:`/`max:` value, and
`{{...}}` interpolation in `message:`/`reason:`/`text:`) are TypeScript-
syntax strings the generator parses, validates, and emits. The
identifier resolution rules are:

**In a prompt-scope hook** (`prompts.<x>.validate` / `preValidate` / UI
`conditional`/`cases.when`/text interpolation):

- Bare identifiers (e.g. `haveCatTower`) resolve against the prompt's own
  model schema; the generator emits `data.<field>`.
- `config.<name>` resolves against the requirement(s) the prompt
  contributes to via `gatherConfig:`. Generator validates `<name>` exists
  on at least one gathered config schema.
- `data.<snake_case_key>` is **escape-hatch only** — accepted verbatim,
  not validated. Prefer the symbolic form.

**In a requirement-scope hook** (`requirements.<x>.resolve`):

- A top-level identifier matching a prompt id in this requirement's
  `prompts:` / `hidden:` / `anyOrder:` list is treated as that prompt's
  data namespace. `whichStatePrompt.state` emits
  `data.which_state_prompt?.state` (with `?.` injected at the prompt
  boundary).
- Field paths after a prompt id are validated against that prompt's
  model schema; nested chains (`.satisfactory`) are validated through
  nested object models.
- `config.<name>` resolves against the requirement's
  `configuration.model`. Generator validates `<name>` exists.
- A bare identifier that is **not** a prompt id in scope is a
  generation-time error.

**Interpolation:** `{{ <expression> }}` appearing inside a string field
is replaced at emit time with the same evaluation. Used for messages
that include config (`"...{{config.minExerciseHours}} hours..."`),
prompt fields in display text (`"{{ stateName ?? state }}"`), and
field/template props in Shape A and Shape B (e.g.
`legendText: "Are you a resident of {{config.residentOfState}}?"`).

In the **Svelte UI** (Shape A field props, Shape B template props,
Shape C `text:` and `cases.when:`/`cases.text:`), `config.<name>`
resolves to the framework-supplied `gatheredConfigData` prop the UI
passes to each prompt component. The emitted Svelte file declares
`export let gatheredConfigData: any` whenever the prompt has
`gatherConfig:`. Single full-string interpolations emit as bare
expression bindings (`label={data.stateName ?? data.state}`); mixed
strings become Svelte template-literal bindings
(`legendText={\`Are you a resident of ${gatheredConfigData.residentOfState}?\`}`).
Configure-slot UI is admin-side and does **not** receive
`gatheredConfigData`, so `config.<name>` is not available there.

### emits derivation

When `resolve.rules:` is present, `emits:` is **derived** from the unique
`status:` values across the rule list — declaring it again is the kind
of double-entry §2 forbids. If a spec includes both, the validator
asserts the explicit `emits:` exactly equals the derived set.

`emits:` is **required** only when `resolve: true` (the generator can't
see what an author-written function may return). It is also accepted on
rule-based requirements as documentation, but is checked for parity, not
used.

---

## 7. Cross-reference rules

| Location                            | What it must resolve to                          |
|-------------------------------------|--------------------------------------------------|
| `prompts.x.model`                   | a `models.<PascalCase>` id                       |
| `prompts.x.gatherConfig` keys       | a `requirements.<id>` or `prompts.<id>` id       |
| `prompts.x.gatherConfig` values     | property names that exist on the target's config schema |
| `prompts.x.invalidates` entries     | a `prompts.<id>` id                              |
| `prompts.x.preload.copyFrom`        | a `prompts.<id>` id                              |
| `prompts.x.fetch`                   | a `models.<PascalCase>` id with `kind: referenceData` |
| `prompts.x.configuration.model`    | a `models.<PascalCase>` id                       |
| `requirements.x.prompts` entries    | a `prompts.<id>` id                              |
| `requirements.x.hidden` entries     | a `prompts.<id>` id                              |
| `requirements.x.anyOrder` entries   | a `prompts.<id>` id                              |
| `requirements.x.configuration.model`| a `models.<PascalCase>` id                       |
| `programs.x.requirements` entries   | a `requirements.<id>` id                         |
| `programs.x.workflow.<k>.requirements` | a `requirements.<id>` id                      |
| Rule expression bare identifier (prompt-scope) | a property name on the prompt's `models.<...>` schema |
| Rule expression top-level identifier (requirement-scope) | a `prompts.<id>` id in this requirement's `prompts` / `hidden` / `anyOrder` list |
| Rule expression chain after a prompt id | a property name on that prompt's model (recursively) |
| Rule expression `config.<name>`     | a property on the requirement's `configuration.model` schema, or — in prompt scope — a property gathered via `gatherConfig:` |
| `validate.rules.<n>.field`          | a property name on the prompt's (or configuration's) model schema |
| `invalidates.targets` / `revalidates.targets` entries | a `prompts.<id>` id (bare or as `{ promptId, reason }`) |
| `invalidates.whenAnyFalse` / `revalidates.whenAllTrue` paths | a property dot-path on this prompt's model |

Additional validations:

- Every prompt id referenced by any requirement must exist in `prompts:`.
- A requirement whose `phase` is `WORKFLOW` is used only from
  `programs.<x>.workflow.<y>.requirements`, never from
  `programs.<x>.requirements`.
- Status codes in `emits` must be a subset of `{PENDING, MET, DISQUALIFYING,
  WARNING, NOT_APPLICABLE}`. The generator can add a dev-mode runtime assert
  around the resolve function that every returned `status` is listed.
- When `resolve.rules:` is present, `emits:` is derived from the rule
  list and need not be declared (see §6.5 "emits derivation"). An
  explicit `emits:` alongside `rules:` must match the derived set
  exactly.
- A prompt appearing in multiple requirements' `prompts` lists is allowed
  and expected (see README on shared prompts); the generator does not emit
  duplicate UI registry entries.

---

## 8. UI binding

A prompt's `ui:` block has two slots — `form:` and `display:` (plus
`configure:` for admin-side prompts). Each slot accepts one of four
shapes; the generator resolves the chosen shape into a real
`ui/src/local/<project>/<group>/<Name>.svelte` file plus the matching
`uiRegistry.ts` entry.

### Shape A — field shorthand (form / configure)

```yaml
ui:
  form:
    fields:
      - FieldRadio:    { path: haveCatTower, boolean: true,
                         legendText: "Do you have a cat tower?",
                         items: [{ label: Yes, value: true }, { label: No, value: false }] }
      - FieldCheckbox: { path: willPurchaseCatTower, boolean: true,
                         labelText: "I agree to purchase one.",
                         conditional: "haveCatTower === false" }
```

Each list entry is a single-key object whose key is a
`@txstate-mws/carbon-svelte` component name (`FieldRadio`,
`FieldCheckbox`, `FieldSelect`, `FieldNumber`, `FieldText`,
`FieldUpload`, `FieldHidden`, …). Properties pass through to the
component verbatim, with two derived behaviors:

- `path:` is validated against the prompt's model schema (§7).
- `conditional:` (and any other expression-shaped prop) follows the §6.5
  expression rules — bare identifiers resolve to fields on the prompt's
  own data, and the generator emits `data.<field>`.

Optional `wrap:` puts the field list inside an outer Svelte component
that exposes a default `<slot/>`:

```yaml
ui:
  form:
    wrap:
      template: QuestionnairePrompt           # specs/resources/ui-templates/<Name>.svelte
      props: { title: "...", description: "...", externalLinks: [...] }
    fields: [ ... ]
```

`wrap:` accepts the same three sources as the slots themselves:

| Form                                       | Resolves to                                                |
|--------------------------------------------|------------------------------------------------------------|
| `template: <Name>`                         | `specs/resources/ui-templates/<Name>.svelte` — preferred (keeps the spec self-contained when it's later generated into a fresh project) |
| `component: <Name>`                        | `ui/src/local/<project>/<group>/<Name>.svelte` (project-owned, hand-written) |
| `component: <Name>, import: <package>`     | named export from an external package (e.g. `'@reqquest/ui'`); use only when the wrapper truly belongs to a published library |

### Shape B — template reference

```yaml
ui:
  form:    { template: YesNoFollowUp,  props: { ... } }
  display: { template: BooleanSummary, props: { path: haveCatTower, yes: "...", no: "..." } }
```

The generator emits a thin wrapper that imports
`specs/resources/ui-templates/<Template>.svelte` and forwards the prompt's
`data` / `fetched` plus the spec-supplied `props`. Templates are
parametric and project-agnostic — see `specs/resources/ui-templates/INDEX.md`
for the curated library.

The library currently covers six themes:

| Theme                       | Templates                                                                  |
|-----------------------------|----------------------------------------------------------------------------|
| Boolean shapes              | `BooleanSummary`, `YesNoFollowUp`, `YesNoFollowUpDisplay`                  |
| Document handling           | `DocumentSet`, `DocumentSetDisplay`                                        |
| Reviewer rubrics            | `SatisfactoryReviewSet`, `SatisfactoryReviewSetDisplay`                    |
| Domain blocks               | `StateSelect`, `ResidencePrompt`, `ResidencePromptDisplay`                 |
| Display readouts            | `LabeledFields`                                                            |
| Selection / layout          | `CardGridSelect`, `QuestionnairePrompt`                                    |

When a downstream project has a recurring shape that does not fit any of
these themes, prefer **adding a new template** over forking a project-
specific component — the threshold is two unrelated prompts using the
same shape.

A template's `props.path` (or any other path-shaped prop) is validated
against the prompt's model schema the same way Shape A's `path:` is.

### Shape C — declarative display (display only)

The display slot accepts two compact shorthands so trivial readouts
don't need a Svelte file or a template:

```yaml
display:
  text: "{{ stateName ?? state }}"      # interpolated single-string display

display:
  cases:                                 # first-match case tree
    - { when: "haveCatTower",         text: "Already owns a cat tower." }
    - { when: "willPurchaseCatTower", text: "Will purchase a cat tower." }
    - { when: "haveCatTower === false", text: "No cat tower." }
    - { else: true,                   text: "" }
```

`text:`/`when:` follow the §6.5 expression rules (prompt-scope; bare
identifiers are model-validated).

Each `cases:` branch may render `text:` **or** a template reference:

```yaml
display:
  cases:
    - { when: "!haveYard", text: "No yard." }
    - else: true
      template: LabeledFields
      props:
        entries:
          - { path: squareFootage, label: "Square Footage" }
          - { path: totalPets,     label: "Total Pets" }
```

The generator emits one `{#if}` / `{:else if}` / `{:else}` per branch and
either inlines the `text:` (with `{{...}}` interpolation) or instantiates
the named template with its props, forwarding `data` and `fetched`.

### Shape D — escape hatch (hand-written component)

```yaml
ui:
  form:    { component: HaveYardPrompt }
  display: { component: HaveYardPromptDisplay }
```

Resolves to `ui/src/local/<project>/<group>/<Name>.svelte`. When the
referenced file doesn't exist, the generator emits a **minimal stub**
(typed against the matching `<Id>Data`) so the project compiles. Authors
then fill the stub in. The escape hatch composes with everything: any
slot can opt out independently (e.g. shorthand form + hand-written
display).

### Requirement and program UI

- Requirements may have `ui: { configure: X }` only — admin-side
  configuration form. Same four shapes apply (typically Shape D).
- Programs may have `icon: Name` which resolves to
  `carbon-icons-svelte/lib/<Name>.svelte`.

---

## 9. What the generator emits — end-to-end

For each `models.<Id>`:
- A JSON-Schema const + `FromSchema` type in the derived file.

For each `prompts.<id>`:
- An exported `PromptDefinition` object literal in the derived prompts file.
- Named hook stubs in the group's `logic.ts` for any `true` / `dynamic`
  hooks.
- One or two (or three) Svelte component stubs under `ui/src/local/`.
- A UIRegistry entry in `uiRegistry.ts` binding the key to the components.

For each `requirements.<id>`:
- An exported `RequirementDefinition` object literal.
- A named `resolve` stub (plus configuration hooks) in the group's logic
  file.
- A `ui.configure` Svelte stub if declared.
- A UIRegistry entry for the requirement.

For each `programs.<id>`:
- Entry in `programs.ts`.
- Optional workflow-stage entries attached to the program.
- A UIRegistry entry carrying the `icon`.

Top level:
- `demos/src/<project>/index.ts` — imports the above and calls
  `new RQServer().start({ appConfig, programs, requirements, prompts })`.
  Idempotent (`setOnce`) — author edits to `userLookups`, custom
  `appConfig` extras, and `validOrigins` survive re-runs.
- `ui/src/local/<project>/uiRegistry.ts` — collects the UI bindings and
  exports `new UIRegistry({...})`.

Idempotency: re-running the generator on an updated spec should only touch
the generated definition/registry files. Hand-authored `<group>.logic.ts`
and Svelte components are added to when new ids appear but never rewritten
in place.

---

## 10. Quick generation checklist

When asked to "generate the project from `requirements/demo-default2.spec.yml`":

1. Parse + validate the spec (all §7 cross-references resolve; no duplicate
   snake_case keys after conversion; `emits` values are valid statuses;
   required models present for any `model:` / `config.model:` binding).
2. Walk `models:` → emit per-group `*.models.ts` + barrel.
3. Walk `prompts:` → emit per-group `*.prompts.ts`, UI component stubs,
   logic-file hook stubs, and `uiRegistry.ts` entries. Set
   `promptKeysNoDisplay` from any `hidden:` listed on consuming requirements.
4. Walk `requirements:` → emit `*.requirements.ts`, logic stubs, config UI
   stubs, UI registry entries. `promptKeys` order = the order listed on
   the requirement.
5. Walk `programs:` → emit `programs.ts`. Workflow stages become
   `workflowStages: [{ key, title, nonBlocking, requirementKeys }]` with
   `nonBlocking = !blocking` (default `blocking: true`).
6. Emit `index.ts` bootstrap that imports all barrels and calls
   `RQServer.start(...)` with an `appConfig` matching `project.ui` plus
   conventional `userLookups` defaults. Keys under `project.ui:` are
   passed verbatim into `UIConfig` (see `ui/src/lib/registry.ts`) — use
   the real field names (e.g. `applicantDashboardIntroHeader`,
   `applicantDashboardIntroDetail`, `applicantDashboardRecentDays`), not
   abbreviations. The validator rejects unknown keys.
7. Run `tsc` and `svelte-check` — exposed as `--verify` on the CLI.
   Anything that fails to type-check is either a bug in the generator
   or a broken cross-reference in the spec (the validator in step 1
   should have caught it). `svelte-check` requires Node 20+; older Node
   reports it as failing with a setup error while `tsc` still runs.

If the user asks you to write a new project from scratch, author a spec in
this format first, let them review, then run the generator. That keeps the
review surface tiny (one YAML file) instead of sprawling across dozens of
TS / Svelte files. Operator-side instructions for invoking the generator
(install, flags, troubleshooting) are in `README.md`.
