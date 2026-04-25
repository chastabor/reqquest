import type {
  ResolvedSpec, ResolvedPrompt, ResolvedRequirement, ResolvedReferenceDataModel
} from '../ir/types.js'
import type { PromptDef, FieldValidateRuleDef } from '../spec/schema.js'
import { promptFilePath, indexBarrelFilePath, logicFilePath } from '../ir/derive.js'
import { lowerFirstChar, quoteString, objectKey, printValue } from '../codegen/ts.js'
import { formatTS } from '../codegen/format.js'
import type { OutputBundle } from './files.js'
import type { PromptScope, ExtractScope } from '../expr/scope.js'
import { rewriteExpression } from '../expr/rewrite.js'
import { emitFieldValidateBody } from './ruleBodies.js'
import { emitInvalidates, emitRevalidates } from './invalidates.js'
import { stubName } from './logic.js'

export async function emitPrompts (spec: ResolvedSpec, bundle: OutputBundle): Promise<void> {
  const byGroup = new Map<string, ResolvedPrompt[]>()
  for (const p of spec.prompts) {
    const list = byGroup.get(p.group) ?? []
    list.push(p)
    byGroup.set(p.group, list)
  }

  const sources: Array<readonly [string, string]> = []
  for (const [group, prompts] of byGroup) {
    sources.push([promptFilePath(spec.project.id, group), printGroupFile(group, prompts, spec)])
  }
  const groups = [...byGroup.keys()].sort()
  const barrel = groups.map(g => `export * from './${g}.prompts.js'`).join('\n') + '\n'
  sources.push([indexBarrelFilePath(`demos/src/${spec.project.id}/definitions/prompts`), barrel])

  const formatted = await Promise.all(sources.map(async ([p, raw]) => [p, await formatTS(raw)] as const))
  for (const [path, src] of formatted) bundle.set(path, src)
}

// =============================================================================
// File-level context (collects imports across all prompts in one file)
// =============================================================================

interface FileCtx {
  ownGroup: string
  spec: ResolvedSpec
  /** module specifier → value imports. */
  imports: Map<string, Set<string>>
  /** module specifier → type-only imports. */
  typeImports: Map<string, Set<string>>
}

function noteImport (ctx: FileCtx, from: string, name: string): void {
  const set = ctx.imports.get(from) ?? new Set<string>()
  set.add(name)
  ctx.imports.set(from, set)
}

function noteTypeImport (ctx: FileCtx, from: string, name: string): void {
  const set = ctx.typeImports.get(from) ?? new Set<string>()
  set.add(name)
  ctx.typeImports.set(from, set)
}

function modelsImport (group: string): string {
  return `../models/${group}.models.js`
}

// =============================================================================
// File printer
// =============================================================================

function printGroupFile (group: string, prompts: ResolvedPrompt[], spec: ResolvedSpec): string {
  const ctx: FileCtx = {
    ownGroup: group,
    spec,
    imports: new Map(),
    typeImports: new Map()
  }
  noteTypeImport(ctx, '@reqquest/api', 'PromptDefinition')

  const bodies = prompts.map(p => printPrompt(p, ctx))
  const importLines = renderImports(ctx)
  return [...importLines, '', ...bodies.flatMap(b => [b, ''])].join('\n')
}

function renderImports (ctx: FileCtx): string[] {
  const modules = [...new Set([...ctx.typeImports.keys(), ...ctx.imports.keys()])].sort()
  return modules.map(mod => {
    const types = ctx.typeImports.get(mod)
    const values = ctx.imports.get(mod)
    if (types && (!values || values.size === 0)) {
      return `import type { ${[...types].sort().join(', ')} } from ${quoteString(mod)}`
    }
    const merged = [
      ...(types ? [...types].map(n => `type ${n}`) : []),
      ...(values ? [...values] : [])
    ].sort()
    return `import { ${merged.join(', ')} } from ${quoteString(mod)}`
  })
}

// =============================================================================
// Single-prompt emission
// =============================================================================

function printPrompt (prompt: ResolvedPrompt, ctx: FileCtx): string {
  const r = prompt.raw
  const promptScope: PromptScope = { kind: 'prompt', prompt }
  const extractScope: ExtractScope = { kind: 'extract', promptById: ctx.spec.promptById }
  const fields: string[] = []

  fields.push(`key: ${quoteString(prompt.apiKey)}`)
  fields.push(`title: ${quoteString(r.title)}`)
  if (r.description != null) fields.push(`description: ${quoteString(r.description)}`)
  if (r.navTitle != null) fields.push(`navTitle: ${quoteString(r.navTitle)}`)

  // schema
  noteImport(ctx, modelsImport(prompt.model.group), prompt.model.apiSymbols.schemaConst)
  fields.push(`schema: ${prompt.model.apiSymbols.schemaConst}`)

  // fetch
  if (typeof r.fetch === 'string') {
    const refModel = ctx.spec.modelById.get(r.fetch) as ResolvedReferenceDataModel
    const constName = lowerFirstChar(refModel.id)
    noteImport(ctx, modelsImport(refModel.group), constName)
    fields.push(`fetch: async () => ({ ${constName} })`)
  } else if (r.fetch === true) {
    fields.push(`fetch: ${importLogicStub(ctx, prompt, 'fetch')}`)
  }

  // gatherConfig
  if (r.gatherConfig != null) {
    fields.push(`gatherConfig: ${printGatherConfig(prompt, ctx)}`)
  }

  // preload
  if (r.preload === true) {
    fields.push(`preload: ${importLogicStub(ctx, prompt, 'preload')}`)
  } else if (r.preload != null && typeof r.preload === 'object' && 'copyFrom' in r.preload) {
    fields.push(`preload: ${printPreloadCopy(prompt, ctx)}`)
  }

  // preProcessData
  if (r.preProcessData === true) {
    fields.push(`preProcessData: ${importLogicStub(ctx, prompt, 'preProcessData')}`)
  }

  // preValidate
  if (typeof r.preValidate === 'object') {
    noteImport(ctx, '@txstate-mws/graphql-server', 'MutationMessageType')
    noteTypeImport(ctx, '@txstate-mws/graphql-server', 'MutationMessage')
    fields.push(`preValidate: ${emitFieldValidateBody(r.preValidate.rules, promptScope)}`)
  } else if (r.preValidate === true) {
    fields.push(`preValidate: ${importLogicStub(ctx, prompt, 'preValidate')}`)
  }

  // validate
  if (typeof r.validate === 'object') {
    noteImport(ctx, '@txstate-mws/graphql-server', 'MutationMessageType')
    noteTypeImport(ctx, '@txstate-mws/graphql-server', 'MutationMessage')
    addValidateRefDataImports(r.validate.rules, ctx)
    fields.push(`validate: ${emitFieldValidateBody(r.validate.rules, promptScope)}`)
  } else if (r.validate === true) {
    fields.push(`validate: ${importLogicStub(ctx, prompt, 'validate')}`)
  }

  // invalidates
  if (r.invalidates != null) {
    const inv = emitInvalidates(r.invalidates, ctx.spec)
    for (const ref of inv.externalRefs) noteOtherPromptImport(ctx, ref)
    fields.push(`invalidUponChange: ${inv.expr}`)
  }

  // revalidates
  if (r.revalidates != null) {
    const rev = emitRevalidates(r.revalidates, ctx.spec)
    for (const ref of rev.externalRefs) noteOtherPromptImport(ctx, ref)
    fields.push(`validUponChange: ${rev.expr}`)
  }

  // tags
  if (r.tags != null && r.tags.length > 0) {
    fields.push(`tags: [${r.tags.map(t => printTag(t, ctx, extractScope)).join(', ')}]`)
  }

  // indexes
  if (r.indexes != null && r.indexes.length > 0) {
    fields.push(`indexes: [${r.indexes.map(i => printIndex(i, prompt, ctx, extractScope)).join(', ')}]`)
  }

  // configuration
  if (r.configuration != null) {
    fields.push(`configuration: ${printPromptConfiguration(prompt, ctx)}`)
  }

  return `export const ${prompt.symbolName}: PromptDefinition = {\n  ${fields.join(',\n  ')}\n}`
}

// =============================================================================
// Sub-printers
// =============================================================================

function printGatherConfig (prompt: ResolvedPrompt, _ctx: FileCtx): string {
  // Declarative: { sourceId: [field1, field2] }
  // Emit: (allPeriodConfig) => ({ field1: allPeriodConfig.<source.apiKey>?.field1, ... })
  const r = prompt.raw.gatherConfig!
  const lines: string[] = []
  for (const [sourceId, fields] of Object.entries(r)) {
    const source = prompt.gatherConfigSources.find(s => s.source.id === sourceId)
    if (!source) continue
    for (const f of fields) {
      lines.push(`${f}: allPeriodConfig.${source.source.apiKey}?.${f}`)
    }
  }
  return `(allPeriodConfig: any) => ({ ${lines.join(', ')} })`
}

function printPreloadCopy (prompt: ResolvedPrompt, _ctx: FileCtx): string {
  const r = prompt.raw.preload as { copyFrom: string, fields?: string[] }
  const target = prompt.preloadCopyFrom!
  if (r.fields && r.fields.length > 0) {
    const picks = r.fields.map(f => `${f}: appRequestData.${target.apiKey}?.${f}`).join(', ')
    return `(appRequest: any, config: any, appRequestData: any) => ({ ${picks} })`
  }
  return `(appRequest: any, config: any, appRequestData: any) => appRequestData.${target.apiKey} ?? {}`
}

function printTag (
  tag: NonNullable<PromptDef['tags']>[number],
  ctx: FileCtx,
  scope: ExtractScope
): string {
  const fields: string[] = []
  fields.push(`category: ${quoteString(tag.category)}`)
  if (tag.categoryLabel != null) fields.push(`categoryLabel: ${quoteString(tag.categoryLabel)}`)
  if (tag.description != null) fields.push(`description: ${quoteString(tag.description)}`)
  fields.push(`extract: (data: any) => ${rewriteExpression(tag.extract, scope)}`)
  if (tag.source != null) {
    const ref = ctx.spec.modelById.get(tag.source) as ResolvedReferenceDataModel
    const constName = lowerFirstChar(ref.id)
    noteImport(ctx, modelsImport(ref.group), constName)
    fields.push(`getTags: () => [...${constName}]`)
    fields.push(`getLabel: (tag: string) => ${constName}.find(s => s.value === tag)?.label ?? tag`)
  }
  for (const flag of ['useInAppRequestList', 'useInListFilters', 'useInReviewerDashboard'] as const) {
    if (tag[flag] != null) fields.push(`${flag}: ${tag[flag]}`)
  }
  return `{ ${fields.join(', ')} }`
}

function printIndex (
  idx: NonNullable<PromptDef['indexes']>[number],
  prompt: ResolvedPrompt,
  _ctx: FileCtx,
  scope: ExtractScope
): string {
  const fields: string[] = []
  fields.push(`category: ${quoteString(idx.category)}`)
  if (typeof idx.extract === 'string') {
    fields.push(`extract: (data: any) => ${rewriteExpression(idx.extract, scope)}`)
  } else {
    const m = idx.extract
    const path = `data.${prompt.apiKey}?.${m.map}`
    const trueArm = m.true != null ? `[${quoteString(String(m.true))}]` : '[]'
    const falseArm = m.false != null ? `[${quoteString(String(m.false))}]` : '[]'
    fields.push(`extract: (data: any) => ${path} === true ? ${trueArm} : ${path} === false ? ${falseArm} : []`)
  }
  if (idx.labels != null) {
    fields.push(`getLabel: (tag: string) => (${printValue(idx.labels)} as Record<string, string>)[tag]`)
  }
  for (const flag of ['useInAppRequestList', 'useInListFilters', 'useInReviewerDashboard'] as const) {
    if (idx[flag] != null) fields.push(`${flag}: ${idx[flag]}`)
  }
  return `{ ${fields.join(', ')} }`
}

function printPromptConfiguration (prompt: ResolvedPrompt, ctx: FileCtx): string {
  const cfg = prompt.raw.configuration!
  const fields: string[] = []
  if (prompt.configurationModel) {
    noteImport(ctx, modelsImport(prompt.configurationModel.group), prompt.configurationModel.apiSymbols.schemaConst)
    fields.push(`schema: ${prompt.configurationModel.apiSymbols.schemaConst}`)
  }
  if (cfg.default != null) fields.push(`default: ${printValue(cfg.default)}`)
  return `{ ${fields.join(', ')} }`
}

// =============================================================================
// Helpers for cross-references
// =============================================================================

function noteOtherPromptImport (ctx: FileCtx, target: ResolvedPrompt): void {
  if (target.group === ctx.ownGroup) return                                 // same file
  noteImport(ctx, `./${target.group}.prompts.js`, target.symbolName)
}

function importLogicStub (ctx: FileCtx, prompt: ResolvedPrompt, hook: string): string {
  const name = stubName(prompt, hook)
  noteImport(ctx, `../logic/${prompt.group}.logic.js`, name)
  return name
}

function addValidateRefDataImports (rules: FieldValidateRuleDef[], ctx: FileCtx): void {
  for (const rule of rules) {
    if (rule.source != null) {
      const ref = ctx.spec.modelById.get(rule.source) as ResolvedReferenceDataModel | undefined
      if (ref) noteImport(ctx, modelsImport(ref.group), lowerFirstChar(ref.id))
    }
  }
}
