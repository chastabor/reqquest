import type {
  ResolvedSpec, ResolvedRequirement, ResolvedPrompt
} from '../ir/types.js'
import { requirementFilePath, indexBarrelFilePath } from '../ir/derive.js'
import { lowerFirstChar, quoteString, printValue } from '../codegen/ts.js'
import { formatTS } from '../codegen/format.js'
import { ImportCollector, modelsImportPath } from '../codegen/imports.js'
import type { OutputBundle } from './files.js'
import type { RequirementScope, ConfigScope } from '../expr/scope.js'
import { emitFieldValidateBody, emitResolveBody } from './ruleBodies.js'
import { importLogicStub } from './logic.js'

export async function emitRequirements (spec: ResolvedSpec, bundle: OutputBundle): Promise<void> {
  const byGroup = new Map<string, ResolvedRequirement[]>()
  for (const r of spec.requirements) {
    const list = byGroup.get(r.group) ?? []
    list.push(r)
    byGroup.set(r.group, list)
  }

  const sources: Array<readonly [string, string]> = [...byGroup.entries()].map(([group, reqs]) => [
    requirementFilePath(spec.project.id, group),
    printGroupFile(group, reqs, spec)
  ])
  const groups = [...byGroup.keys()].sort()
  const barrelPath = indexBarrelFilePath(`demos/src/${spec.project.id}/definitions/requirements`)
  sources.push([barrelPath, groups.map(g => `export * from './${g}.requirements.js'`).join('\n') + '\n'])

  const formatted = await Promise.all(sources.map(async ([path, raw]) => [path, await formatTS(raw)] as const))
  for (const [path, src] of formatted) bundle.set(path, src)
}

interface FileCtx {
  spec: ResolvedSpec
  imports: ImportCollector
}

function printGroupFile (_group: string, reqs: ResolvedRequirement[], spec: ResolvedSpec): string {
  const ctx: FileCtx = { spec, imports: new ImportCollector() }
  ctx.imports.add('@reqquest/api', 'RequirementType')
  ctx.imports.addType('@reqquest/api', 'RequirementDefinition')

  const bodies = reqs.map(r => printRequirement(r, ctx))
  return [...ctx.imports.render(), '', ...bodies.flatMap(b => [b, ''])].join('\n')
}

// =============================================================================
// Single-requirement emission
// =============================================================================

function printRequirement (req: ResolvedRequirement, ctx: FileCtx): string {
  const r = req.raw
  const reqScope: RequirementScope = { kind: 'requirement', requirement: req }
  const fields: string[] = []

  fields.push(`type: RequirementType.${r.phase}`)
  fields.push(`key: ${quoteString(req.apiKey)}`)
  fields.push(`title: ${quoteString(r.title)}`)
  if (r.navTitle != null) fields.push(`navTitle: ${quoteString(r.navTitle)}`)
  if (r.description != null) fields.push(`description: ${quoteString(r.description)}`)

  if (req.prompts.length > 0) fields.push(`promptKeys: ${printPromptKeys(req.prompts)}`)
  if (req.anyOrder.length > 0) fields.push(`promptKeysAnyOrder: ${printPromptKeys(req.anyOrder)}`)
  if (req.hidden.length > 0) fields.push(`promptKeysNoDisplay: ${printPromptKeys(req.hidden)}`)

  if (typeof r.resolve === 'object') {
    ctx.imports.add('@reqquest/api', 'RequirementStatus')
    fields.push(`resolve: ${emitResolveBody(r.resolve.rules, reqScope)}`)
  } else if (r.resolve === true) {
    fields.push(`resolve: ${importLogicStub(ctx.imports, req, 'resolve')}`)
  }

  if (r.configuration != null) {
    fields.push(`configuration: ${printConfiguration(req, ctx)}`)
  }

  const generic = configGeneric(req, ctx)
  return `export const ${req.symbolName}: RequirementDefinition${generic} = {\n  ${fields.join(',\n  ')}\n}`
}

function printPromptKeys (prompts: ResolvedPrompt[]): string {
  return printValue(prompts.map(p => p.apiKey))
}

function configGeneric (req: ResolvedRequirement, ctx: FileCtx): string {
  if (!req.configurationModel) return ''
  const dataType = req.configurationModel.apiSymbols.dataType
  ctx.imports.addType(modelsImportPath(req.configurationModel.group), dataType)
  return `<${dataType}>`
}

function printConfiguration (req: ResolvedRequirement, ctx: FileCtx): string {
  const cfg = req.raw.configuration!
  const fields: string[] = []

  if (cfg.default != null) fields.push(`default: ${printValue(cfg.default)}`)

  if (typeof cfg.validate === 'object') {
    if (req.configurationModel?.kind !== 'regular') {
      throw new Error(`requirements.${req.id}.configuration.model: must resolve to a regular model for rule-based validate`)
    }
    const configScope: ConfigScope = { kind: 'config', model: req.configurationModel }
    ctx.imports.add('@txstate-mws/graphql-server', 'MutationMessageType')
    ctx.imports.addType('@txstate-mws/graphql-server', 'MutationMessage')
    fields.push(`validate: ${emitFieldValidateBody(cfg.validate.rules, configScope)}`)
  } else if (cfg.validate === true) {
    fields.push(`validate: ${importLogicStub(ctx.imports, req, 'configurationValidate')}`)
  }

  if (typeof cfg.fetch === 'string' && req.configurationFetchModel) {
    const ref = req.configurationFetchModel
    const constName = lowerFirstChar(ref.id)
    ctx.imports.add(modelsImportPath(ref.group), constName)
    fields.push(`fetch: async () => ({ ${constName} })`)
  } else if (cfg.fetch === true) {
    fields.push(`fetch: ${importLogicStub(ctx.imports, req, 'configurationFetch')}`)
  }
  if (cfg.preProcessData === true) {
    fields.push(`preProcessData: ${importLogicStub(ctx.imports, req, 'configurationPreProcessData')}`)
  }

  return `{ ${fields.join(', ')} }`
}
