import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitModels } from '../../src/emit/models.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function emitToBundle (yaml: string, fakePath = '<inline>') {
  const spec = parseSpecFromString(yaml, fakePath)
  const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: fakePath })
  const bundle = new OutputBundle()
  await emitModels(r, bundle)
  return bundle
}

describe('emitModels — demo-default2', () => {
  async function bundle () {
    const spec = await parseSpec(DEMO_DEFAULT2)
    const r = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
    const b = new OutputBundle()
    await emitModels(r, b)
    return b
  }

  it('emits one file per group + an index barrel', async () => {
    const b = await bundle()
    expect(b.paths()).toEqual([
      'demos/src/default2/definitions/models/cat.models.ts',
      'demos/src/default2/definitions/models/dog.models.ts',
      'demos/src/default2/definitions/models/index.ts',
      'demos/src/default2/definitions/models/state.models.ts',
      'demos/src/default2/definitions/models/yard.models.ts'
    ])
  })

  it('emits the StateList referenceData with provenance comment', async () => {
    const b = await bundle()
    const state = b.get('demos/src/default2/definitions/models/state.models.ts')!
    expect(state).toMatch(/Inlined from specs\/resources\/data\/states\.yml/)
    expect(state).toMatch(/export const stateList = \[/)
    expect(state).toMatch(/\] as const/)
  })

  it('emits a regular schema with FromSchema type', async () => {
    const b = await bundle()
    const yard = b.get('demos/src/default2/definitions/models/yard.models.ts')!
    expect(yard).toMatch(/export const HaveYardPromptSchema = \{/)
    expect(yard).toMatch(/as const satisfies SchemaObject/)
    expect(yard).toMatch(/export type HaveYardPromptData = FromSchema<typeof HaveYardPromptSchema>/)
    expect(yard).toMatch(/haveYard: \{ type: 'boolean' \}/)
    expect(yard).toMatch(/squareFootage: \{ type: 'number' \}/)
  })

  it('emits enum projections off the reference-data const', async () => {
    const b = await bundle()
    const state = b.get('demos/src/default2/definitions/models/state.models.ts')!
    expect(state).toMatch(/state: \{ type: 'string', enum: stateList\.map\(s => s\.value\) \}/)
    expect(state).toMatch(/stateName: \{ type: 'string', enum: stateList\.map\(s => s\.label\) \}/)
  })

  it('inlines a model-id reference as the existing schema const', async () => {
    const b = await bundle()
    const cat = b.get('demos/src/default2/definitions/models/cat.models.ts')!
    expect(cat).toMatch(/distemperDoc: UploadInfoSchema/)
    expect(cat).toMatch(/rabiesDoc: UploadInfoSchema/)
  })

  it('emits required fields', async () => {
    const b = await bundle()
    const cat = b.get('demos/src/default2/definitions/models/cat.models.ts')!
    expect(cat).toMatch(/required: \['_type', 'multipartIndex', 'name', 'mime', 'size'\]/)
  })

  it('emits inline object shapes recursively', async () => {
    const b = await bundle()
    const cat = b.get('demos/src/default2/definitions/models/cat.models.ts')!
    expect(cat).toMatch(/distemper: \{[\s\S]*?type: 'object',[\s\S]*?satisfactory: \{ type: 'boolean' \}/)
  })

  it('emits a barrel that re-exports every group', async () => {
    const b = await bundle()
    const barrel = b.get('demos/src/default2/definitions/models/index.ts')!
    expect(barrel).toContain("export * from './cat.models.js'")
    expect(barrel).toContain("export * from './dog.models.js'")
    expect(barrel).toContain("export * from './state.models.js'")
    expect(barrel).toContain("export * from './yard.models.js'")
  })
})

describe('emitModels — cross-group refs', () => {
  it('imports a referenced schema from its own group file', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  Helper: { group: a, properties: { x: string } }
  Top:    { group: b, properties: { inner: Helper } }
prompts: {}
requirements: {}
programs: {}
`
    const b = await emitToBundle(yaml)
    const fileB = b.get('demos/src/t/definitions/models/b.models.ts')!
    expect(fileB).toMatch(/import \{ HelperSchema \} from '\.\/a\.models\.js'/)
    expect(fileB).toMatch(/inner: HelperSchema/)
  })

  it('imports a referenceData const from its own group file', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  Colors:
    group: ref
    kind: referenceData
    shape: { value: string, label: string }
    values:
      - { value: red, label: Red }
      - { value: blue, label: Blue }
  Picker:
    group: ui
    properties:
      pick: { enum: Colors }
prompts: {}
requirements: {}
programs: {}
`
    const b = await emitToBundle(yaml)
    const fileUI = b.get('demos/src/t/definitions/models/ui.models.ts')!
    expect(fileUI).toMatch(/import \{ colors \} from '\.\/ref\.models\.js'/)
    expect(fileUI).toMatch(/enum: colors\.map\(s => s\.value\)/)
  })
})

describe('emitModels — topological sort', () => {
  it('emits dependency before dependent within a group regardless of spec order', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  Outer: { group: g, properties: { inner: Inner } }
  Inner: { group: g, properties: { x: string } }
prompts: {}
requirements: {}
programs: {}
`
    const b = await emitToBundle(yaml)
    const file = b.get('demos/src/t/definitions/models/g.models.ts')!
    const innerIdx = file.indexOf('export const InnerSchema')
    const outerIdx = file.indexOf('export const OuterSchema')
    expect(innerIdx).toBeGreaterThan(0)
    expect(outerIdx).toBeGreaterThan(innerIdx)
  })
})
