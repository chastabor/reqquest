import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { validateSpec, SpecValidationError } from '../../src/validate/index.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function ir (yaml: string, fakePath = '<inline>') {
  const spec = parseSpecFromString(yaml, fakePath)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: fakePath })
}

describe('validateSpec — demo-default2', () => {
  it('validates the canonical spec without issues', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    expect(() => validateSpec(r)).not.toThrow()
  })
})

describe('validateSpec — invariants', () => {
  it('flags apiKey collisions across prompts and requirements', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  shared: { title: P, model: M }
requirements:
  shared:
    phase: APPROVAL
    title: R
    prompts: [shared]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [shared] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/apiKey collision: "shared"/)
  })

  it('flags WORKFLOW phase used outside a workflow stage', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p: { title: P, model: M }
requirements:
  wfReq:
    phase: WORKFLOW
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [wfReq] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/phase WORKFLOW/)
  })
})

describe('validateSpec — fields', () => {
  it('flags an unknown rule.field', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: notReal, required: true, message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    try {
      validateSpec(r)
      throw new Error('expected validation error')
    } catch (err: any) {
      expect(err).toBeInstanceOf(SpecValidationError)
      expect(err.message).toMatch(/unknown field "notReal"/)
    }
  })

  it('flags an invalidates path that is not boolean', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { num: number } }
prompts:
  p:
    title: P
    model: M
    invalidates:
      whenAnyFalse: [num]
      targets: [p]
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/should resolve to a boolean field/)
  })

  it('flags an invalid regex pattern in matches', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: x, matches: "[unclosed", message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/invalid regex pattern/)
  })

  it('flags matches on a non-string field', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { n: number } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: n, matches: "^\\\\d+$", message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/must be a string-typed field/)
  })

  it('flags matchesFlags without matches', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: x, matchesFlags: "i", message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/requires "matches" to be set/)
  })

  it('flags oneOf on a number field with string values', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { n: number } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: n, oneOf: ["a", "b"], message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/not compatible with field "n"/)
  })

  it('flags both oneOf and noneOf set on the same rule', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: x, oneOf: ["a"], noneOf: ["b"], message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/cannot set both "oneOf" and "noneOf"/)
  })

  it('flags oneOf with empty list', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: x, oneOf: [], message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/list cannot be empty/)
  })

  it('accepts oneOf with matching value types on a nested string field', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { doc: Upload } }
  Upload: { group: g, properties: { mime: string, size: number } }
prompts:
  p:
    title: P
    model: M
    preValidate:
      rules:
        - { field: doc.mime, oneOf: ["image/jpeg", "image/png"], message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).not.toThrow()
  })

  it('accepts a valid regex on a string field', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: x, matches: "^[A-Z]{2}$", matchesFlags: "i", message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).not.toThrow()
  })

  it('flags gatherConfig referencing a non-existent property on the source', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M:    { group: g, properties: { x: string } }
  Cfg:  { group: g, properties: { real: number } }
prompts:
  p:
    title: P
    model: M
    gatherConfig:
      r: [missing]
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
    configuration: { model: Cfg, default: { real: 1 } }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/gatherConfig\.r/)
  })
})

describe('validateSpec — expressions', () => {
  it('flags an unknown identifier in a resolve rule', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p: { title: P, model: M }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve:
      rules:
        - { when: "p.bogus == null", status: PENDING }
        - { else: true, status: MET }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "bogus"/)
  })

  it('flags an unknown field in interpolation', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    validate:
      rules:
        - { field: x, required: true, message: "got {{ ghost }}" }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "ghost"/)
  })
})

describe('validateSpec — UI', () => {
  it('flags an unknown path in a Shape A field', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    ui:
      form:
        fields:
          - FieldText: { path: doesNotExist, labelText: Lol }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "doesNotExist"/)
  })

  it('flags an unknown identifier in a Shape A conditional', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string, y: string } }
prompts:
  p:
    title: P
    model: M
    ui:
      form:
        fields:
          - FieldText: { path: y, conditional: "missing" }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "missing"/)
  })

  it('flags an unknown interpolation in display text', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    ui:
      display:
        text: "{{ ghost }}"
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "ghost"/)
  })

  it('flags an unknown interpolation in a Shape A field prop', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    ui:
      form:
        fields:
          - FieldText: { path: x, labelText: "Hello {{ ghost }}" }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "ghost"/)
  })

  it('flags an unknown interpolation inside a Shape B template prop', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    ui:
      form:
        template: SomeTemplate
        props: { label: "Hello {{ ghost }}" }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown field "ghost"/)
  })

  it('accepts a {{ config.X }} interpolation when X is gathered', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
  C: { group: g, required: [k], properties: { k: string } }
prompts:
  p:
    title: P
    model: M
    gatherConfig:
      r: [k]
    ui:
      form:
        fields:
          - FieldText: { path: x, labelText: "Hello {{ config.k }}" }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
    configuration:
      model: C
      default: { k: hi }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).not.toThrow()
  })

  it('accepts { from: <RefDataId> } when the requirement configuration fetches it', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
  RefList: { group: g, kind: referenceData, shape: { value: string, label: string }, values: [{ value: a, label: A }] }
  C: { group: g, required: [chosen], properties: { chosen: { enum: RefList } } }
prompts:
  p: { title: P, model: M }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
    configuration:
      model: C
      default: { chosen: a }
      fetch: RefList
      ui:
        configure:
          fields:
            - FieldSelect: { path: chosen, labelText: Chosen, items: { from: RefList } }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).not.toThrow()
  })

  it('flags { from: X } when X is not a referenceData', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
  C: { group: g, required: [chosen], properties: { chosen: string } }
prompts:
  p: { title: P, model: M }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
    configuration:
      model: C
      default: { chosen: a }
      ui:
        configure:
          fields:
            - FieldSelect: { path: chosen, labelText: Chosen, items: { from: M } }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/not a referenceData/)
  })

  it('flags { from: X } when the slot does not fetch X', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
  RefList: { group: g, kind: referenceData, shape: { value: string, label: string }, values: [{ value: a, label: A }] }
  C: { group: g, required: [chosen], properties: { chosen: { enum: RefList } } }
prompts:
  p: { title: P, model: M }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
    configuration:
      model: C
      default: { chosen: a }
      ui:
        configure:
          fields:
            - FieldSelect: { path: chosen, labelText: Chosen, items: { from: RefList } }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/not in scope/)
  })

  it('flags { from: X } when X is an unknown model id', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
  RefList: { group: g, kind: referenceData, shape: { value: string, label: string }, values: [{ value: a, label: A }] }
prompts:
  p:
    title: P
    model: M
    fetch: RefList
    ui:
      form:
        fields:
          - FieldSelect: { path: x, items: { from: Ghost } }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const r = await ir(yaml)
    expect(() => validateSpec(r)).toThrow(/unknown model/)
  })
})
