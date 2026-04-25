import type {
  ResolvedSpec, ResolvedModel, ResolvedRegularModel, ResolvedReferenceDataModel
} from '../ir/types.js'
import type { PropShape } from '../spec/schema.js'
import { modelFilePath, indexBarrelFilePath } from '../ir/derive.js'
import { lowerFirstChar, printValue, objectKey, quoteString } from '../codegen/ts.js'
import { formatTS } from '../codegen/format.js'
import type { OutputBundle } from './files.js'

export async function emitModels (spec: ResolvedSpec, bundle: OutputBundle): Promise<void> {
  const byGroup = new Map<string, ResolvedModel[]>()
  for (const m of spec.models) {
    const list = byGroup.get(m.group) ?? []
    list.push(m)
    byGroup.set(m.group, list)
  }

  const sources: Array<readonly [string, string]> = [...byGroup.entries()].map(([group, members]) => [
    modelFilePath(spec.project.id, group),
    printGroupFile(group, topoSort(members), spec)
  ])
  const groups = [...byGroup.keys()].sort()
  const barrelPath = indexBarrelFilePath(`demos/src/${spec.project.id}/definitions/models`)
  sources.push([barrelPath, groups.map(g => `export * from './${g}.models.js'`).join('\n') + '\n'])

  // Prettier dominates emit time; format every file in parallel.
  const formatted = await Promise.all(sources.map(async ([path, raw]) => [path, await formatTS(raw)] as const))
  for (const [path, src] of formatted) bundle.set(path, src)
}

const PRIMITIVES = new Set(['string', 'number', 'boolean'])

function topoSort (models: ResolvedModel[]): ResolvedModel[] {
  const byId = new Map(models.map(m => [m.id, m]))
  const visited = new Set<string>()
  const sorted: ResolvedModel[] = []
  const visit = (m: ResolvedModel): void => {
    if (visited.has(m.id)) return
    visited.add(m.id)
    if (m.kind === 'regular') {
      for (const depId of collectDeps(m.raw.properties)) {
        const dep = byId.get(depId)
        if (dep) visit(dep)                                                   // skip cross-group deps; resolved via imports
      }
    }
    sorted.push(m)
  }
  for (const m of models) visit(m)
  return sorted
}

function collectDeps (props: Record<string, PropShape>): string[] {
  const deps: string[] = []
  const walk = (shape: PropShape): void => {
    if (typeof shape === 'string') {
      if (!PRIMITIVES.has(shape)) deps.push(shape)
      return
    }
    if ('enum' in shape) { deps.push(shape.enum); return }
    if ('array' in shape) { walk(shape.array); return }
    if ('properties' in shape) {
      for (const sub of Object.values(shape.properties)) walk(sub)
    }
  }
  for (const sub of Object.values(props)) walk(sub)
  return deps
}

interface Ctx {
  ownGroup: string
  spec: ResolvedSpec
  externalRefs: Map<string, Set<string>>                                    // group → symbols to import
}

function printGroupFile (group: string, models: ResolvedModel[], spec: ResolvedSpec): string {
  const ctx: Ctx = { ownGroup: group, spec, externalRefs: new Map() }
  const bodies = models.map(m => m.kind === 'referenceData' ? printReferenceData(m) : printRegularModel(m, ctx))

  const imports: string[] = []
  imports.push("import type { SchemaObject } from '@txstate-mws/fastify-shared'")
  imports.push("import type { FromSchema } from 'json-schema-to-ts'")
  for (const [extGroup, syms] of [...ctx.externalRefs.entries()].sort()) {
    imports.push(`import { ${[...syms].sort().join(', ')} } from './${extGroup}.models.js'`)
  }
  return [...imports, '', ...bodies.flatMap(b => [b, ''])].join('\n')
}

function printReferenceData (model: ResolvedReferenceDataModel): string {
  const constName = lowerFirstChar(model.id)
  const provenance = `// Inlined from ${model.sourceLabel} (spec: ${model.id}.fixture).`

  if (model.compute != null) {
    return [provenance, `export const ${constName} = ${model.compute}`].join('\n')
  }
  if (model.values == null) {
    throw new Error(`models.${model.id}: referenceData with no values, fixture, or compute (resolver invariant violated)`)
  }
  return [provenance, `export const ${constName} = ${printValue(model.values)} as const`].join('\n')
}

function printRegularModel (model: ResolvedRegularModel, ctx: Ctx): string {
  const { schemaConst, dataType } = model.apiSymbols
  const body = printSchemaObject(model.raw.properties, model.raw.required, ctx, `models.${model.id}.properties`)
  return [
    `export const ${schemaConst} = ${body} as const satisfies SchemaObject`,
    `export type ${dataType} = FromSchema<typeof ${schemaConst}>`
  ].join('\n')
}

function printSchemaObject (
  props: Record<string, PropShape>,
  required: string[] | undefined,
  ctx: Ctx,
  location: string
): string {
  const propsBody = Object.entries(props)
    .map(([k, shape]) => `${objectKey(k)}: ${printShape(shape, ctx, `${location}.${k}`)}`)
    .join(', ')
  const requiredPart = required && required.length > 0 ? `, required: ${printValue(required)}` : ''
  return `{ type: 'object', properties: { ${propsBody} }, additionalProperties: false${requiredPart} }`
}

function printShape (shape: PropShape, ctx: Ctx, location: string): string {
  if (typeof shape === 'string' && PRIMITIVES.has(shape)) {
    return `{ type: ${quoteString(shape)} }`
  }
  if (typeof shape === 'string') {
    const ref = ctx.spec.modelById.get(shape)
    if (!ref) {
      throw new Error(`${location}: references model "${shape}" but no model with that id exists`)
    }
    if (ref.kind !== 'regular') {
      throw new Error(`${location}: references model "${shape}" but it is referenceData (use \`enum: ${shape}\` for value/label projections instead of inlining)`)
    }
    noteExternalRef(ctx, ref, ref.apiSymbols.schemaConst)
    return ref.apiSymbols.schemaConst
  }
  if ('format' in shape) {
    return `{ type: 'string', format: ${quoteString(shape.format)} }`
  }
  if ('enum' in shape) {
    const ref = ctx.spec.modelById.get(shape.enum)
    if (!ref) {
      throw new Error(`${location}.enum: references "${shape.enum}" but no model with that id exists`)
    }
    if (ref.kind !== 'referenceData') {
      throw new Error(`${location}.enum: "${shape.enum}" must be a referenceData model (got regular model)`)
    }
    const constName = lowerFirstChar(ref.id)
    noteExternalRef(ctx, ref, constName)
    const proj = shape.by === 'label' ? 'label' : 'value'
    return `{ type: 'string', enum: ${constName}.map(s => s.${proj}) }`
  }
  if ('array' in shape) {
    return `{ type: 'array', items: ${printShape(shape.array, ctx, `${location}.items`)} }`
  }
  if ('properties' in shape) {
    return printSchemaObject(shape.properties, shape.required, ctx, location)
  }
  throw new Error(`${location}: unknown shape ${JSON.stringify(shape)}`)
}

function noteExternalRef (ctx: Ctx, model: ResolvedModel, symbol: string): void {
  if (model.group === ctx.ownGroup) return
  const set = ctx.externalRefs.get(model.group) ?? new Set<string>()
  set.add(symbol)
  ctx.externalRefs.set(model.group, set)
}
