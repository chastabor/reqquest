import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { validateExpression, validateInterpolations } from '../../src/expr/validate.js'
import type { PromptScope, RequirementScope, ExtractScope, ConfigScope } from '../../src/expr/scope.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function loadIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

function logger () {
  const issues: string[] = []
  return { issues, log: (m: string) => issues.push(m) }
}

describe('validateExpression — prompt scope', () => {
  it('accepts a known field', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const { issues, log } = logger()
    validateExpression('haveYard', { kind: 'prompt', prompt }, { modelById: r.modelById, ctx: 'test', log })
    expect(issues).toEqual([])
  })

  it('rejects an unknown field', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const { issues, log } = logger()
    validateExpression('nope', { kind: 'prompt', prompt }, { modelById: r.modelById, ctx: 'test', log })
    expect(issues.length).toBe(1)
    expect(issues[0]).toMatch(/unknown field "nope"/)
  })

  it('accepts data.* as the escape hatch', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const { issues, log } = logger()
    validateExpression('data.anything.goes', { kind: 'prompt', prompt }, { modelById: r.modelById, ctx: 'test', log })
    expect(issues).toEqual([])
  })

  it('validates config.<x> against gatherConfig sources', async () => {
    const r = await loadIR()
    const exercise = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt: exercise }
    const okLog = logger()
    validateExpression('config.minExerciseHours', scope, { modelById: r.modelById, ctx: 't', log: okLog.log })
    expect(okLog.issues).toEqual([])
    const badLog = logger()
    validateExpression('config.notGathered', scope, { modelById: r.modelById, ctx: 't', log: badLog.log })
    expect(badLog.issues[0]).toMatch(/not gathered/)
  })
})

describe('validateExpression — requirement scope', () => {
  it('accepts a prompt-id-prefixed field', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('whichStatePrompt.state', { kind: 'requirement', requirement: req }, { modelById: r.modelById, ctx: 't', log })
    expect(issues).toEqual([])
  })

  it('rejects an out-of-scope prompt', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('haveYardPrompt.haveYard', { kind: 'requirement', requirement: req }, { modelById: r.modelById, ctx: 't', log })
    expect(issues[0]).toMatch(/must be a prompt in requirement/)
  })

  it('rejects a bare prompt id without field access', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('whichStatePrompt', { kind: 'requirement', requirement: req }, { modelById: r.modelById, ctx: 't', log })
    expect(issues[0]).toMatch(/used bare/)
  })

  it('accepts allConfig.<reqId>.<field> when both resolve', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('allConfig.mustExerciseYourDogReq.minExerciseHours',
      { kind: 'requirement', requirement: req },
      { modelById: r.modelById, requirementById: r.requirementById, ctx: 't', log })
    expect(issues).toEqual([])
  })

  it('rejects allConfig with an unknown requirement id', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('allConfig.notARequirement.x',
      { kind: 'requirement', requirement: req },
      { modelById: r.modelById, requirementById: r.requirementById, ctx: 't', log })
    expect(issues[0]).toMatch(/unknown requirement id/)
  })

  it('rejects allConfig field path that does not exist on the target requirement config', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('allConfig.mustExerciseYourDogReq.bogus',
      { kind: 'requirement', requirement: req },
      { modelById: r.modelById, requirementById: r.requirementById, ctx: 't', log })
    expect(issues[0]).toMatch(/unknown field "bogus"/)
  })

  it('rejects allConfig.X with no field segment', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const { issues, log } = logger()
    validateExpression('allConfig.mustExerciseYourDogReq',
      { kind: 'requirement', requirement: req },
      { modelById: r.modelById, requirementById: r.requirementById, ctx: 't', log })
    expect(issues[0]).toMatch(/<requirementId>\.<field>/)
  })
})

describe('validateExpression — extract scope', () => {
  it('accepts any prompt id from the spec', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: ExtractScope = { kind: 'extract', promptById: r.promptById }
    const { issues, log } = logger()
    validateExpression('[whichStatePrompt.state]', scope, { modelById: r.modelById, ctx: 't', log })
    expect(issues).toEqual([])
  })

  it('rejects an unknown identifier', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: ExtractScope = { kind: 'extract', promptById: r.promptById }
    const { issues, log } = logger()
    validateExpression('[notAPrompt.x]', scope, { modelById: r.modelById, ctx: 't', log })
    expect(issues[0]).toMatch(/must be a prompt id/)
  })
})

describe('validateInterpolations', () => {
  it('extracts and validates each segment', async () => {
    const r = await loadIR()
    const exercise = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt: exercise }
    const { issues, log } = logger()
    validateInterpolations(
      'You must exercise your dog {{config.minExerciseHours}} hours; total is {{nope}}',
      scope,
      { modelById: r.modelById, ctx: 't', log }
    )
    expect(issues.length).toBe(1)
    expect(issues[0]).toMatch(/unknown field "nope"/)
  })
})
