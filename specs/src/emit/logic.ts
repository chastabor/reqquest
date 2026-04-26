import { readFile } from 'node:fs/promises'
import { resolve as resolvePath } from 'node:path'
import { Project, type SourceFile } from 'ts-morph'
import type { ResolvedSpec, ResolvedPrompt, ResolvedRequirement } from '../ir/types.js'
import { logicFilePath } from '../ir/derive.js'
import { upperFirstChar } from '../codegen/ts.js'
import { formatTS } from '../codegen/format.js'
import { type ImportCollector, logicImportPath } from '../codegen/imports.js'
import type { OutputBundle } from './files.js'
import type { EmitOpts } from './index.js'

interface StubSpec {
  /** Exported function name. */
  name: string
  /** Argument list as TS source, e.g. "data: HaveYardPromptData, config: any". */
  signature: string
  /** Return type as TS source. */
  returnType: string
  /** Body source — already includes the surrounding braces. */
  body: string
  /** Imports this stub needs (deduped at the file level). */
  imports: ImportRef[]
}

interface ImportRef {
  /** Module specifier (e.g. '../models/cat.models.js'). */
  from: string
  /** Symbol name to bring in. */
  name: string
  /** Type-only import (`import type`). */
  type: boolean
}

// Existing function declarations in the on-disk file are preserved; only
// missing stubs are appended. The author owns the bodies.
export async function emitLogicStubs (spec: ResolvedSpec, bundle: OutputBundle, opts: EmitOpts): Promise<void> {
  const stubsByGroup = new Map<string, StubSpec[]>()
  const collect = (group: string, stubs: StubSpec[]): void => {
    if (stubs.length === 0) return
    const list = stubsByGroup.get(group) ?? []
    list.push(...stubs)
    stubsByGroup.set(group, list)
  }
  for (const prompt of spec.prompts) collect(prompt.group, stubsForPrompt(prompt))
  for (const req of spec.requirements) collect(req.group, stubsForRequirement(req))

  for (const [group, stubs] of stubsByGroup) {
    const path = logicFilePath(spec.project.id, group)
    const merged = await mergeLogicFile(path, stubs, opts.outRoot)
    bundle.set(path, await formatTS(merged))
  }
}

// =============================================================================
// Hook → stub spec
// =============================================================================

function stubsForPrompt (prompt: ResolvedPrompt): StubSpec[] {
  const out: StubSpec[] = []
  const r = prompt.raw
  const dataType = prompt.model.apiSymbols.dataType
  const dataImport = modelDataImport(prompt)

  if (r.preProcessData === true) {
    out.push({
      name: stubName(prompt.id, 'preProcessData'),
      signature: `data: ${dataType}, ctx: any, appRequest: any, appRequestData: any, allPeriodConfig: any, db: any`,
      returnType: dataType,
      body: '{\n  return data\n}',
      imports: [dataImport]
    })
  }
  if (r.validate === true) {
    out.push({
      name: stubName(prompt.id, 'validate'),
      signature: `data: ${dataType}, config: any, appRequestData: any, allPeriodConfig: any, db: any`,
      returnType: 'MutationMessage[]',
      body: '{\n  return []\n}',
      imports: [dataImport, MUTATION_MESSAGE_IMPORT]
    })
  }
  if (r.preValidate === true) {
    out.push({
      name: stubName(prompt.id, 'preValidate'),
      signature: `data: ${dataType}, config: any, appRequestData: any, allPeriodConfig: any, db: any`,
      returnType: 'MutationMessage[]',
      body: '{\n  return []\n}',
      imports: [dataImport, MUTATION_MESSAGE_IMPORT]
    })
  }
  if (r.preload === true) {
    out.push({
      name: stubName(prompt.id, 'preload'),
      signature: 'appRequest: any, config: any, appRequestData: any, allPeriodConfig: any, ctx: any',
      returnType: dataType,
      body: '{\n  return {} as any\n}',
      imports: [dataImport]
    })
  }
  if (r.fetch === true) {
    out.push({
      name: stubName(prompt.id, 'fetch'),
      signature: 'appRequest: any, config: any, appRequestData: any, allPeriodConfig: any, ctx: any',
      returnType: 'any',
      body: '{\n  return {}\n}',
      imports: []
    })
  }
  if (r.invalidates === 'dynamic') {
    out.push({
      name: stubName(prompt.id, 'invalidUponChange'),
      signature: 'data: any, config: any, appRequestData: any, allPeriodConfig: any',
      returnType: 'InvalidatedResponse[]',
      body: '{\n  return []\n}',
      imports: [INVALIDATED_RESPONSE_IMPORT]
    })
  }
  if (r.revalidates === 'dynamic') {
    out.push({
      name: stubName(prompt.id, 'validUponChange'),
      signature: 'data: any, config: any, appRequestData: any, allPeriodConfig: any',
      returnType: 'string[]',
      body: '{\n  return []\n}',
      imports: []
    })
  }
  return out
}

function stubsForRequirement (req: ResolvedRequirement): StubSpec[] {
  const out: StubSpec[] = []
  const r = req.raw
  if (r.resolve === true) {
    const statusUnion = req.emits.map(s => `RequirementStatus.${s}`).join(' | ')
    const defaultStatus = req.emits.includes('PENDING') ? 'PENDING' : req.emits[0]
    out.push({
      name: stubName(req.id, 'resolve'),
      signature: 'data: any, config: any, configLookup: any',
      returnType: `{ status: ${statusUnion}, reason?: string }`,
      body: `{\n  return { status: RequirementStatus.${defaultStatus} }\n}`,
      imports: [REQUIREMENT_STATUS_IMPORT]
    })
  }
  if (r.configuration?.validate === true) {
    out.push({
      name: stubName(req.id, 'configurationValidate'),
      signature: 'data: any',
      returnType: 'MutationMessage[]',
      body: '{\n  return []\n}',
      imports: [MUTATION_MESSAGE_IMPORT]
    })
  }
  if (r.configuration?.fetch === true) {
    out.push({
      name: stubName(req.id, 'configurationFetch'),
      signature: 'period: any',
      returnType: 'any',
      body: '{\n  return {}\n}',
      imports: []
    })
  }
  if (r.configuration?.preProcessData === true) {
    out.push({
      name: stubName(req.id, 'configurationPreProcessData'),
      signature: 'data: any, ctx: any',
      returnType: 'any',
      body: '{\n  return data\n}',
      imports: []
    })
  }
  return out
}

const MUTATION_MESSAGE_IMPORT: ImportRef = {
  from: '@txstate-mws/graphql-server', name: 'MutationMessage', type: true
}
const INVALIDATED_RESPONSE_IMPORT: ImportRef = {
  from: '@reqquest/api', name: 'InvalidatedResponse', type: true
}
const REQUIREMENT_STATUS_IMPORT: ImportRef = {
  from: '@reqquest/api', name: 'RequirementStatus', type: false
}

function modelDataImport (prompt: ResolvedPrompt): ImportRef {
  return {
    from: `../models/${prompt.model.group}.models.js`,
    name: prompt.model.apiSymbols.dataType,
    type: true
  }
}

export function stubName (id: string, hook: string): string {
  return `${id}${upperFirstChar(hook)}`
}

/** Add a logic-stub import to `imports` and return the symbol name to reference. */
export function importLogicStub (imports: ImportCollector, owner: { id: string, group: string }, hook: string): string {
  const name = stubName(owner.id, hook)
  imports.add(logicImportPath(owner.group), name)
  return name
}

// =============================================================================
// ts-morph merge: keep existing, add missing
// =============================================================================

async function mergeLogicFile (relPath: string, stubs: StubSpec[], outRoot: string): Promise<string> {
  const fullPath = resolvePath(outRoot, relPath)
  let existing = ''
  try {
    existing = await readFile(fullPath, 'utf8')
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err
  }

  const project = new Project({ useInMemoryFileSystem: true, skipAddingFilesFromTsConfig: true })
  const sf = project.createSourceFile('virtual.ts', existing)

  const existingFunctions = new Set(sf.getFunctions().map(f => f.getName()))
  for (const stub of stubs) {
    if (existingFunctions.has(stub.name)) continue
    ensureImports(sf, stub.imports)
    sf.addStatements(`\nexport function ${stub.name} (${stub.signature}): ${stub.returnType} ${stub.body}`)
  }
  return sf.getFullText()
}

function ensureImports (sf: SourceFile, refs: ImportRef[]): void {
  for (const ref of refs) {
    let decl = sf.getImportDeclaration(d => d.getModuleSpecifierValue() === ref.from)
    if (!decl) {
      decl = sf.addImportDeclaration({ moduleSpecifier: ref.from })
    }
    const named = decl.getNamedImports().map(n => n.getName())
    if (named.includes(ref.name)) continue
    if (ref.type) {
      decl.addNamedImport({ name: ref.name, isTypeOnly: !decl.isTypeOnly() })
    } else {
      decl.addNamedImport({ name: ref.name })
    }
  }
}
