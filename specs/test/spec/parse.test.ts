import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString, SpecParseError } from '../../src/spec/parse.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

describe('parseSpec', () => {
  it('parses demo-default2.spec.yml without errors', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    expect(spec.specVersion).toBe(2)
    expect(spec.project.id).toBe('default2')
    expect(spec.project.name).toBe('Adopt a Pet')
    expect(Object.keys(spec.models).length).toBeGreaterThan(5)
    expect(Object.keys(spec.prompts).length).toBeGreaterThan(5)
    expect(Object.keys(spec.requirements).length).toBeGreaterThan(5)
    expect(Object.keys(spec.programs)).toEqual(['adoptADogProgram', 'adoptACatProgram'])
  })

  it('exposes typed prompt blocks', async () => {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const yard = spec.prompts.haveYardPrompt
    expect(yard).toBeDefined()
    expect(yard.model).toBe('HaveYardPrompt')
    expect(yard.ui?.form).toBeDefined()
  })
})

describe('parseSpecFromString', () => {
  const minimal = `
specVersion: 2
project: { id: t, name: T }
models: {}
prompts: {}
requirements: {}
programs: {}
`

  it('accepts a minimal spec', () => {
    const spec = parseSpecFromString(minimal)
    expect(spec.project.id).toBe('t')
  })

  it('rejects an unknown top-level key', () => {
    expect(() => parseSpecFromString(minimal + 'extraKey: 1\n'))
      .toThrow(SpecParseError)
  })

  it('rejects a missing required field', () => {
    expect(() => parseSpecFromString(`
specVersion: 2
project: { name: T }
models: {}
prompts: {}
requirements: {}
programs: {}
`)).toThrow(SpecParseError)
  })
})
