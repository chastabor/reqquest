import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { lookupModelField, isBooleanShape, isNumericShape } from '../../src/ir/fields.js'
import type { ResolvedRegularModel } from '../../src/ir/types.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function loadIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

describe('lookupModelField', () => {
  it('finds a top-level property', async () => {
    const r = await loadIR()
    const yard = r.modelById.get('HaveYardPrompt') as ResolvedRegularModel
    expect(lookupModelField(yard, r.modelById, 'haveYard').found).toBe(true)
    expect(isBooleanShape(lookupModelField(yard, r.modelById, 'haveYard').shape)).toBe(true)
    expect(isNumericShape(lookupModelField(yard, r.modelById, 'squareFootage').shape)).toBe(true)
  })

  it('walks into nested inline objects', async () => {
    const r = await loadIR()
    const review = r.modelById.get('VaccineReviewPrompt') as ResolvedRegularModel
    const result = lookupModelField(review, r.modelById, 'distemper.satisfactory')
    expect(result.found).toBe(true)
    expect(isBooleanShape(result.shape)).toBe(true)
  })

  it('walks into a referenced model', async () => {
    const r = await loadIR()
    const vax = r.modelById.get('OtherCatsVaccinesPrompt') as ResolvedRegularModel
    const result = lookupModelField(vax, r.modelById, 'distemperDoc.size')
    expect(result.found).toBe(true)
    expect(isNumericShape(result.shape)).toBe(true)
  })

  it('reports missing top-level fields', async () => {
    const r = await loadIR()
    const yard = r.modelById.get('HaveYardPrompt') as ResolvedRegularModel
    const result = lookupModelField(yard, r.modelById, 'nope')
    expect(result.found).toBe(false)
    expect(result.reason).toMatch(/unknown field "nope"/)
  })

  it('reports indexing into a primitive', async () => {
    const r = await loadIR()
    const yard = r.modelById.get('HaveYardPrompt') as ResolvedRegularModel
    const result = lookupModelField(yard, r.modelById, 'haveYard.foo')
    expect(result.found).toBe(false)
    expect(result.reason).toMatch(/cannot index "foo"/)
  })
})
