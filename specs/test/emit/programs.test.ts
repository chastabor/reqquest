import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitPrograms } from '../../src/emit/programs.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function emit (yaml?: string) {
  const spec = yaml ? parseSpecFromString(yaml) : await parseSpec(DEMO_DEFAULT2)
  const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: yaml ? '<inline>' : DEMO_DEFAULT2 })
  const bundle = new OutputBundle()
  await emitPrograms(ir, bundle)
  return bundle
}

describe('emitPrograms — demo-default2', () => {
  it('emits a single programs.ts file', async () => {
    const bundle = await emit()
    expect(bundle.paths()).toEqual(['demos/src/default2/definitions/programs.ts'])
  })

  it('emits ProgramDefinition with snake_case key + camelCase symbol', async () => {
    const bundle = await emit()
    const src = bundle.get('demos/src/default2/definitions/programs.ts')!
    expect(src).toMatch(/export const adoptADogProgram: ProgramDefinition = \{/)
    expect(src).toMatch(/key: 'adopt_a_dog_program'/)
    expect(src).toMatch(/title: 'Adopt a Dog'/)
  })

  it('emits requirementKeys in spec order with snake_case ids', async () => {
    const bundle = await emit()
    const src = bundle.get('demos/src/default2/definitions/programs.ts')!
    expect(src).toMatch(/requirementKeys: \[\s*'which_state_req',\s*'have_big_yard_req'/)
  })

  it('omits workflowStages when no workflow is declared', async () => {
    const bundle = await emit()
    const src = bundle.get('demos/src/default2/definitions/programs.ts')!
    expect(src).not.toMatch(/workflowStages/)
  })
})

describe('emitPrograms — workflow stages', () => {
  it('emits blocking stage with key/title/requirementKeys (no nonBlocking flag)', async () => {
    const bundle = await emit(`
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
    resolve: { rules: [ { else: true, status: MET } ] }
  reviewReq:
    phase: WORKFLOW
    title: Review Step
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog:
    title: Prog
    requirements: [r]
    workflow:
      reviewStage:
        title: Review
        requirements: [reviewReq]
`)
    const src = bundle.get('demos/src/t/definitions/programs.ts')!
    expect(src).toMatch(/workflowStages: \[\{ key: 'review_stage', title: 'Review', requirementKeys: \['review_req'\] \}\]/)
    expect(src).not.toMatch(/nonBlocking/)
  })

  it('emits nonBlocking: true when blocking: false', async () => {
    const bundle = await emit(`
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
    resolve: { rules: [ { else: true, status: MET } ] }
  auditReq:
    phase: WORKFLOW
    title: Audit
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog:
    title: Prog
    requirements: [r]
    workflow:
      auditStage:
        title: Audit
        blocking: false
        requirements: [auditReq]
`)
    const src = bundle.get('demos/src/t/definitions/programs.ts')!
    expect(src).toMatch(/nonBlocking: true/)
  })

  it('falls back to stage id when title is omitted', async () => {
    const bundle = await emit(`
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
    resolve: { rules: [ { else: true, status: MET } ] }
  wfReq:
    phase: WORKFLOW
    title: WF
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog:
    title: Prog
    requirements: [r]
    workflow:
      bareStage:
        requirements: [wfReq]
`)
    const src = bundle.get('demos/src/t/definitions/programs.ts')!
    expect(src).toMatch(/title: 'bareStage'/)
  })
})
