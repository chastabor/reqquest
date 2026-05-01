import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { emitInvalidates, emitRevalidates } from '../../src/emit/invalidates.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function loadIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

describe('emitInvalidates — declarative whenAnyFalse', () => {
  it('produces an InvalidatorFunction with OR-of-falses guard', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('vaccineReviewPrompt')!
    const result = emitInvalidates(prompt.raw.invalidates!, r)
    expect(result.expr).toContain('data?.distemper?.satisfactory === false')
    expect(result.expr).toContain('|| data?.rabies?.satisfactory === false')
    expect(result.expr).toContain('promptKey: otherCatsVaccinesPrompt.key')
    expect(result.expr).toContain("reason: \"One or more vaccination documents are invalid. Please re-upload.\"")
    expect(result.externalRefs.map(p => p.id)).toEqual(['otherCatsVaccinesPrompt'])
  })
})

describe('emitRevalidates — declarative whenAllTrue', () => {
  it('produces a RevalidatorFunction returning string keys', async () => {
    const r = await loadIR()
    const prompt = r.promptById.get('vaccineReviewPrompt')!
    const result = emitRevalidates(prompt.raw.revalidates!, r)
    expect(result.expr).toContain('data?.distemper?.satisfactory === true')
    expect(result.expr).toContain('&& data?.rabies?.satisfactory === true')
    expect(result.expr).toContain('? [otherCatsVaccinesPrompt.key] : []')
  })
})

describe('emit{In,Re}validates — static array form', () => {
  it('invalidates static array → literal InvalidatedResponse[]', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  source:
    title: Source
    model: M
    invalidates: [target]
  target:
    title: Target
    model: M
requirements:
  r:
    phase: APPROVAL
    title: R
    description: D
    prompts: [source, target]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const spec = parseSpecFromString(yaml)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    const prompt = r.promptById.get('source')!
    const result = emitInvalidates(prompt.raw.invalidates!, r)
    expect(result.expr).toBe('[{ promptKey: target.key }]')
  })

  it('revalidates static array → arrow function returning [keys]', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  source:
    title: Source
    model: M
    revalidates: [target]
  target:
    title: Target
    model: M
requirements:
  r:
    phase: APPROVAL
    title: R
    description: D
    prompts: [source, target]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const spec = parseSpecFromString(yaml)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    const prompt = r.promptById.get('source')!
    const result = emitRevalidates(prompt.raw.revalidates!, r)
    expect(result.expr).toBe('() => [target.key]')
  })
})
