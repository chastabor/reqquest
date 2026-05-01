import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitLogicStubs } from '../../src/emit/logic.js'
import { emitRequirements } from '../../src/emit/requirements.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

let tmp: string
beforeEach(async () => { tmp = await mkdtemp(join(tmpdir(), 'rq-reqs-')) })
afterEach(async () => { await rm(tmp, { recursive: true, force: true }) })

async function emit () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
  const bundle = new OutputBundle()
  await emitLogicStubs(ir, bundle, { repoRoot: REPO_ROOT, outRoot: tmp })
  await emitRequirements(ir, bundle)
  return bundle
}

describe('emitRequirements — demo-default2', () => {
  it('emits one requirements file per group + a barrel', async () => {
    const bundle = await emit()
    const paths = bundle.paths().filter(p => p.includes('definitions/requirements/'))
    expect(paths).toEqual([
      'demos/src/default2/definitions/requirements/cat.requirements.ts',
      'demos/src/default2/definitions/requirements/dog.requirements.ts',
      'demos/src/default2/definitions/requirements/index.ts',
      'demos/src/default2/definitions/requirements/state.requirements.ts',
      'demos/src/default2/definitions/requirements/yard.requirements.ts'
    ])
  })

  it('emits RequirementDefinition with phase → RequirementType', async () => {
    const bundle = await emit()
    const state = bundle.get('demos/src/default2/definitions/requirements/state.requirements.ts')!
    expect(state).toMatch(/export const whichStateReq: RequirementDefinition = \{/)
    expect(state).toMatch(/type: RequirementType\.PREQUAL/)
    expect(state).toMatch(/key: 'which_state_req'/)
    expect(state).toMatch(/promptKeys: \['which_state_prompt'\]/)
  })

  it('emits resolve body from rule list with rewritten prompt-id chains', async () => {
    const bundle = await emit()
    const yard = bundle.get('demos/src/default2/definitions/requirements/yard.requirements.ts')!
    expect(yard).toMatch(/data\.have_yard_prompt\?\.haveYard == null/)
    expect(yard).toMatch(/return \{ status: RequirementStatus\.PENDING \}/)
    expect(yard).toMatch(/return \{[^}]*status: RequirementStatus\.DISQUALIFYING/)
  })

  it('emits resolve as a logic stub when resolve: true', async () => {
    const bundle = await emit()
    const cat = bundle.get('demos/src/default2/definitions/requirements/cat.requirements.ts')!
    expect(cat).toMatch(/resolve: otherCatsApplicantReqResolve/)
    expect(cat).toMatch(/resolve: otherCatsReviewerReqResolve/)
    expect(cat).toMatch(/import \{ otherCatsApplicantReqResolve, otherCatsReviewerReqResolve \} from '\.\.\/logic\/cat\.logic\.js'/)
  })

  it('emits configuration block with default + rule-based validate', async () => {
    const bundle = await emit()
    const dog = bundle.get('demos/src/default2/definitions/requirements/dog.requirements.ts')!
    expect(dog).toMatch(/RequirementDefinition<ExerciseConfigData>/)
    expect(dog).toMatch(/configuration: \{/)
    expect(dog).toMatch(/default: \{ minExerciseHours: 10 \}/)
    // configuration.validate uses single-arg `(data) => ...`
    expect(dog).toMatch(/validate: data => \{/)
    expect(dog).toMatch(/data\.minExerciseHours == null/)
  })

  it('emits a barrel that re-exports every group', async () => {
    const bundle = await emit()
    const barrel = bundle.get('demos/src/default2/definitions/requirements/index.ts')!
    expect(barrel).toContain("export * from './cat.requirements.js'")
    expect(barrel).toContain("export * from './dog.requirements.js'")
    expect(barrel).toContain("export * from './state.requirements.js'")
    expect(barrel).toContain("export * from './yard.requirements.js'")
  })

  it('interpolates {{config.X}} in resolve reasons as template literals', async () => {
    const bundle = await emit()
    const dog = bundle.get('demos/src/default2/definitions/requirements/dog.requirements.ts')!
    expect(dog).toMatch(/reason: `[^`]*\$\{config\.minExerciseHours\}[^`]*`/)
  })

  it('emits configuration.fetch as a refdata-returning async fn when given a referenceData id', async () => {
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
    description: D
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
    configuration:
      model: C
      default: { chosen: a }
      fetch: RefList
programs:
  prog: { title: Prog, requirements: [r] }
`
    const spec = parseSpecFromString(yaml)
    const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    const bundle = new OutputBundle()
    await emitRequirements(ir, bundle)
    const file = bundle.get('demos/src/t/definitions/requirements/g.requirements.ts')!
    expect(file).toMatch(/import \{[^}]*refList[^}]*\} from '\.\.\/models\/g\.models\.js'/)
    expect(file).toMatch(/fetch: async \(\) => \(\{ refList \}\)/)
  })

  it('emits hidden / anyOrder prompt key arrays when present', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  visiblePrompt:  { title: V, model: M }
  hiddenPrompt:   { title: H, model: M }
  anyOrderPrompt: { title: A, model: M }
requirements:
  r:
    phase: APPROVAL
    title: R
    description: D
    prompts: [visiblePrompt]
    hidden: [hiddenPrompt]
    anyOrder: [anyOrderPrompt]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const spec = parseSpecFromString(yaml)
    const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    const bundle = new OutputBundle()
    await emitRequirements(ir, bundle)
    const file = bundle.get('demos/src/default2/definitions/requirements/g.requirements.ts')
      ?? bundle.get('demos/src/t/definitions/requirements/g.requirements.ts')!
    expect(file).toMatch(/promptKeys: \['visible_prompt'\]/)
    expect(file).toMatch(/promptKeysAnyOrder: \['any_order_prompt'\]/)
    expect(file).toMatch(/promptKeysNoDisplay: \['hidden_prompt'\]/)
  })
})
