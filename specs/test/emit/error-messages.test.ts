import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitModels } from '../../src/emit/models.js'
import { emitPrompts } from '../../src/emit/prompts.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')

async function ir (yaml: string) {
  const spec = parseSpecFromString(yaml)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
}

describe('emit-time errors include spec location', () => {
  it('models — unknown referenced model points at the property path', async () => {
    const r = await ir(`
specVersion: 2
project: { id: t, name: T }
models:
  Top: { group: g, properties: { inner: GhostModel } }
prompts: {}
requirements: {}
programs: {}
`)
    const bundle = new OutputBundle()
    await expect(emitModels(r, bundle)).rejects.toThrow(
      /models\.Top\.properties\.inner: references model "GhostModel" but no model with that id exists/
    )
  })

  it('models — referenceData inlined as object ref tells you to use enum:', async () => {
    const r = await ir(`
specVersion: 2
project: { id: t, name: T }
models:
  Refs:
    group: g
    kind: referenceData
    shape: { value: string }
    values: [{ value: a }]
  Top: { group: g, properties: { picked: Refs } }
prompts: {}
requirements: {}
programs: {}
`)
    const bundle = new OutputBundle()
    await expect(emitModels(r, bundle)).rejects.toThrow(
      /models\.Top\.properties\.picked: references model "Refs" but it is referenceData \(use `enum: Refs`/
    )
  })

  it('models — enum source pointing at a regular model gives a precise location', async () => {
    const r = await ir(`
specVersion: 2
project: { id: t, name: T }
models:
  NotRefData: { group: g, properties: { x: string } }
  Top: { group: g, properties: { f: { enum: NotRefData } } }
prompts: {}
requirements: {}
programs: {}
`)
    const bundle = new OutputBundle()
    await expect(emitModels(r, bundle)).rejects.toThrow(
      /models\.Top\.properties\.f\.enum: "NotRefData" must be a referenceData model/
    )
  })

  it('models — array items errors include the .items segment', async () => {
    const r = await ir(`
specVersion: 2
project: { id: t, name: T }
models:
  Top: { group: g, properties: { list: { array: GhostModel } } }
prompts: {}
requirements: {}
programs: {}
`)
    const bundle = new OutputBundle()
    await expect(emitModels(r, bundle)).rejects.toThrow(
      /models\.Top\.properties\.list\.items: references model "GhostModel"/
    )
  })

  it('rule maxSize — bad literal points at the field name', async () => {
    const r = await ir(`
specVersion: 2
project: { id: t, name: T }
models:
  Up:
    group: g
    properties:
      doc: { properties: { _type: string, multipartIndex: number, name: string, mime: string, size: number } }
prompts:
  p:
    title: P
    model: Up
    preValidate:
      rules:
        - { field: doc, maxSize: "12 zaps", message: "..." }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`)
    const bundle = new OutputBundle()
    await emitModels(r, bundle)
    await expect(emitPrompts(r, bundle)).rejects.toThrow(
      /rule on field "doc": maxSize "12 zaps" is not a valid size literal/
    )
  })
})
