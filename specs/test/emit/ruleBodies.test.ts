import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { emitFieldValidateBody, emitResolveBody } from '../../src/emit/ruleBodies.js'
import type { PromptScope, RequirementScope } from '../../src/expr/scope.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function loadIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

describe('emitFieldValidateBody', () => {
  it('emits required check', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'haveYard', required: true, message: 'pick one' }
    ], scope)
    expect(body).toContain('if (data.haveYard == null) messages.push(')
    expect(body).toContain('arg: "haveYard"')
    expect(body).toContain('message: "pick one"')
    expect(body).toContain('MutationMessageType.error')
  })

  it('emits requiredWhen + min compound check', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('haveYardPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'squareFootage', requiredWhen: 'haveYard', min: 1, message: 'too small' }
    ], scope)
    expect(body).toContain('(data.haveYard) && data.squareFootage != null && data.squareFootage < 1')
  })

  it('emits min as expression with config rewrite', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('mustExerciseYourDogPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'exerciseHours', min: 'config.minExerciseHours', messageType: 'warning', message: 'low' }
    ], scope)
    expect(body).toContain('data.exerciseHours < (config.minExerciseHours)')
    expect(body).toContain('MutationMessageType.warning')
  })

  it('emits maxSize check with parsed bytes', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('otherCatsVaccinesPrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'distemperDoc', maxSize: '10MB', message: 'too big' }
    ], scope)
    expect(body).toContain('data.distemperDoc.size > 10485760')
  })

  it('emits equalsLabelOf check using the source const', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'stateName', equalsLabelOf: 'state', source: 'StateList', message: 'mismatch' }
    ], scope)
    expect(body).toContain('stateList.find(s => s.value === data.state)?.label')
  })

  it('emits regex match check from `matches`', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'state', matches: '^[A-Z]{2}$', message: 'use 2-letter code' }
    ], scope)
    expect(body).toContain('data.state != null && !/^[A-Z]{2}$/.test(data.state)')
  })

  it('emits regex with flags from `matchesFlags`', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'stateName', matches: 'texas', matchesFlags: 'i', message: 'must contain texas' }
    ], scope)
    expect(body).toContain('!/texas/i.test(data.stateName)')
  })

  it('combines matches with requiredWhen', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('whichStatePrompt')!
    const scope: PromptScope = { kind: 'prompt', prompt }
    const body = emitFieldValidateBody([
      { field: 'stateName', requiredWhen: 'state', matches: '^[A-Z]', message: 'caps please' }
    ], scope)
    expect(body).toContain('(data.state) && data.stateName != null && !/^[A-Z]/.test(data.stateName)')
  })
})

describe('emitResolveBody', () => {
  it('emits guarded returns + an else fallback', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('whichStateReq')!
    const scope: RequirementScope = { kind: 'requirement', requirement: req }
    const body = emitResolveBody([
      { when: 'whichStatePrompt.state == null', status: 'PENDING' },
      { else: true, status: 'MET' }
    ], scope)
    expect(body).toContain('if (data.which_state_prompt?.state == null) return { status: RequirementStatus.PENDING }')
    expect(body).toContain('return { status: RequirementStatus.MET }')
  })

  it('interpolates reason text', async () => {
    const r = await loadIR()
    const req = r.requirementById.get('mustExerciseYourDogReq')!
    const scope: RequirementScope = { kind: 'requirement', requirement: req }
    const body = emitResolveBody([
      { else: true, status: 'WARNING', reason: 'must exercise {{config.minExerciseHours}} hours' }
    ], scope)
    expect(body).toContain('reason: `must exercise ${config.minExerciseHours} hours`')
  })
})
