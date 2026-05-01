import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec, SpecResolveError } from '../../src/ir/resolve.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

describe('resolveSpec — demo-default2', () => {
  it('resolves the full default2 spec without issues', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    expect(r.project.id).toBe('default2')
    expect(r.models.length).toBe(Object.keys(spec.models).length)
    expect(r.prompts.length).toBe(Object.keys(spec.prompts).length)
    expect(r.requirements.length).toBe(Object.keys(spec.requirements).length)
    expect(r.programs.length).toBe(Object.keys(spec.programs).length)
  })

  it('inlines fixture values for StateList', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const stateList = r.modelById.get('StateList')!
    expect(stateList.kind).toBe('referenceData')
    if (stateList.kind === 'referenceData') {
      expect(stateList.values).not.toBeNull()
      expect(stateList.values!.length).toBe(50)
      expect(stateList.sourceLabel).toBe('specs/resources/data/states.yml')
    }
  })

  it('inherits prompt group from its model', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const which = r.promptById.get('whichStatePrompt')!
    expect(which.group).toBe('state')
    expect(which.apiKey).toBe('which_state_prompt')
    expect(which.filePath).toBe('demos/src/default2/definitions/prompts/state.prompts.ts')
  })

  it('inherits requirement group from its first prompt', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const req = r.requirementById.get('whichStateReq')!
    expect(req.group).toBe('state')
    expect(req.apiKey).toBe('which_state_req')
  })

  it('links fetch model when fetch is a referenceData id', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const which = r.promptById.get('whichStatePrompt')!
    expect(which.fetchModel?.id).toBe('StateList')
  })

  it('links gatherConfig sources to requirements', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const exercise = r.promptById.get('mustExerciseYourDogPrompt')!
    expect(exercise.gatherConfigSources.length).toBe(1)
    expect(exercise.gatherConfigSources[0]!.source.id).toBe('mustExerciseYourDogReq')
    expect(exercise.gatherConfigSources[0]!.fields).toEqual(['minExerciseHours'])
  })

  it('links invalidates / revalidates targets', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const review = r.promptById.get('vaccineReviewPrompt')!
    expect(review.invalidatesTargets.map(p => p.id)).toEqual(['otherCatsVaccinesPrompt'])
    expect(review.revalidatesTargets.map(p => p.id)).toEqual(['otherCatsVaccinesPrompt'])
  })

  it('derives emits from resolve rules', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const big = r.requirementById.get('haveBigYardReq')!
    expect(new Set(big.emits)).toEqual(new Set(['PENDING', 'MET', 'DISQUALIFYING']))
  })

  it('respects explicit emits when resolve: true', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const space = r.requirementById.get('haveAdequatePersonalSpaceReq')!
    expect(new Set(space.emits)).toEqual(new Set(['PENDING', 'MET', 'DISQUALIFYING']))
  })

  it('attaches workflow stages with default blocking=true', async () => {
    // demo-default2 doesn't use workflow stages — exercise via an inline spec.
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
    description: D
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog:
    title: Prog
    requirements: [r]
    workflow:
      review:
        title: Review
        requirements: [r]
      audit:
        blocking: false
        requirements: [r]
`
    const spec = parseSpecFromString(yaml)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    const prog = r.programById.get('prog')!
    expect(prog.workflow.length).toBe(2)
    expect(prog.workflow[0]!.id).toBe('review')
    expect(prog.workflow[0]!.blocking).toBe(true)
    expect(prog.workflow[0]!.apiKey).toBe('review')
    expect(prog.workflow[1]!.blocking).toBe(false)
  })
})

describe('resolveSpec — error accumulation', () => {
  it('reports multiple cross-ref misses in one error', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p: { title: P, model: NotAModel }
requirements:
  r:
    phase: APPROVAL
    title: R
    description: D
    prompts: [notAPrompt]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [notAReq] }
`
    const spec = parseSpecFromString(yaml)
    await expect(resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' }))
      .rejects.toThrow(SpecResolveError)
    try {
      await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    } catch (err: any) {
      const msg: string = err.message
      expect(msg).toContain('NotAModel')
      expect(msg).toContain('notAPrompt')
      expect(msg).toContain('notAReq')
    }
  })
})
