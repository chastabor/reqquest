# UI Template Library

Reusable parameterized Svelte components referenced from `*.spec.yml` files
via:

```yaml
ui:
  form:    { template: <Name>, props: { ... } }
  display: { template: <Name>, props: { ... } }
```

The generator wraps each template with a thin file in
`ui/src/local/<project>/<group>/` that imports from this directory and
forwards the prompt's `data` / `fetched` props plus the spec-supplied
`props`.

| Template                       | Pairs with                       | Used for                                              |
|--------------------------------|----------------------------------|-------------------------------------------------------|
| `BooleanSummary`               | (display only)                   | "Yes/No/unknown" three-way text summary               |
| `YesNoFollowUp`                | `YesNoFollowUpDisplay`           | Boolean radio + 1+ typed conditional follow-ups (checkbox / number / text / radio) |
| `YesNoFollowUpDisplay`         | `YesNoFollowUp`                  | "label: Yes/No" line + conditional detail rows        |
| `CardGridSelect`               | (custom or BooleanSummary)       | Accept-radio gates a sortable card grid; selected `id` mirrored into a hidden field |
| `DocumentSet`                  | `DocumentSetDisplay`             | Multiple labeled `FieldUpload`s on one prompt         |
| `DocumentSetDisplay`           | `DocumentSet`                    | Read-only document list with name + KB size           |
| `SatisfactoryReviewSet`        | `SatisfactoryReviewSetDisplay`   | Per-item yes/no review (writes to `<path>.satisfactory`) |
| `SatisfactoryReviewSetDisplay` | `SatisfactoryReviewSet`          | "<label> is (un)satisfactory." per-item readout       |
| `StateSelect`                  | (BooleanSummary or value text)   | `FieldSelect` over fetched `{value,label}` list, with optional label mirror |
| `QuestionnairePrompt`          | —                                | Layout wrapper for `fields:` (intro block, external links, container width) — used via `wrap.template:` |
| `LabeledFields`                | (display only)                   | `<dl>` of `path: label` rows; combine with `cases:` for conditional readouts |
| `ResidencePrompt`              | `ResidencePromptDisplay`         | Applicant residency block: name + contact + address + optional state Select + optional id-doc upload; optional outer boolean gate |
| `ResidencePromptDisplay`       | `ResidencePrompt`                | Formatted address read-out + Modal that fetches the id-doc upload via the framework `/download/...` endpoint |

## Authoring conventions

- Every template's first two props are `data` (always passed by the
  generator) and (when relevant) `fetched`. The remaining props come from
  the spec's `props:` block.
- Keep templates *parametric* — no project-specific labels, paths, or
  enum values. Anything that varies between prompts is a prop.
- When a template binds form fields, paths are passed as strings and
  forwarded directly to the matching `@txstate-mws/carbon-svelte` field
  component's `path` prop.
- Display-only templates render `data` directly; they should not call
  GraphQL or otherwise have side effects.
