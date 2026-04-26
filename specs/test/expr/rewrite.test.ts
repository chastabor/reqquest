import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { rewriteExpression, rewriteInterpolation } from '../../src/expr/rewrite.js'
import type { PromptScope, RequirementScope, ExtractScope, ConfigScope } from '../../src/expr/scope.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function loadIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

describe('rewriteExpression — prompt scope', () => {
  it('rewrites bare identifiers', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteExpression('haveYard', scope)).toBe('data.haveYard')
    expect(rewriteExpression('!haveYard', scope)).toBe('!data.haveYard')
  })

  it('rewrites property chains', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('vaccineReviewPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteExpression('distemper.satisfactory', scope)).toBe('data.distemper.satisfactory')
  })

  it('passes data.* and config.* through', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteExpression('config.minExerciseHours', scope)).toBe('config.minExerciseHours')
    expect(rewriteExpression('data.foo.bar', scope)).toBe('data.foo.bar')
  })
})

describe('rewriteExpression — requirement scope', () => {
  it('rewrites prompt-id chains to data.<snake>?.<chain>', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const scope: RequirementScope = { kind: 'requirement', requirement: req }
    expect(rewriteExpression('whichStatePrompt.state == null', scope))
      .toBe('data.which_state_prompt?.state == null')
  })

  it('handles multi-segment chains', async () => {
    const r = await loadIR()
    // Requirement scope where vaccineReviewPrompt is used (otherCatsReviewerReq)
    const req = r.requirementById.get('otherCatsReviewerReq')!
    const scope: RequirementScope = { kind: 'requirement', requirement: req }
    expect(rewriteExpression('vaccineReviewPrompt.distemper.satisfactory', scope))
      .toBe('data.vaccine_review_prompt?.distemper.satisfactory')
  })
})

describe('rewriteExpression — extract scope', () => {
  it('rewrites any prompt id from the spec', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: ExtractScope = { kind: 'extract', promptById: r.promptById }
    expect(rewriteExpression('[whichStatePrompt.state]', scope))
      .toBe('[data.which_state_prompt?.state]')
  })
})

describe('rewriteInterpolation', () => {
  it('returns plain string when no interpolation', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteInterpolation('hello', scope)).toBe('"hello"')
  })

  it('returns template literal when interpolated', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteInterpolation('exercise {{config.minExerciseHours}} hours', scope))
      .toBe('`exercise ${config.minExerciseHours} hours`')
  })

  it('escapes backticks and ${ in literal segments', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteInterpolation('a `b` c {{ haveYard }}', scope))
      .toBe('`a \\`b\\` c ${data.haveYard}`')
  })
})

describe('rewriteExpression — svelte target', () => {
  it('rewrites config.X to gatheredConfigData.X in prompt scope', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteExpression('config.minExerciseHours', scope, { target: 'svelte' }))
      .toBe('gatheredConfigData.minExerciseHours')
  })

  it('still rewrites bare data identifiers in svelte target', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteExpression('haveYard', scope, { target: 'svelte' })).toBe('data.haveYard')
  })

  it('keeps config.X passthrough with default ts target', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteExpression('config.minExerciseHours', scope))
      .toBe('config.minExerciseHours')
  })
})

describe('rewriteInterpolation — svelte target', () => {
  it('routes config.X to gatheredConfigData.X', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    expect(rewriteInterpolation('exercise {{config.minExerciseHours}} hours', scope, { target: 'svelte' }))
      .toBe('`exercise ${gatheredConfigData.minExerciseHours} hours`')
  })
})
