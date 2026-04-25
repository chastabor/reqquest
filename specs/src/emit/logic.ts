import { readFile } from 'node:fs/promises'
import { resolve as resolvePath } from 'node:path'
import { Project, SyntaxKind, type SourceFile } from 'ts-morph'
import type { ResolvedSpec, ResolvedPrompt } from '../ir/types.js'
import { logicFilePath } from '../ir/derive.js'
import { formatTS } from '../codegen/format.js'
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
  for (const prompt of spec.prompts) {
    for (const stub of stubsForPrompt(prompt)) {
      const list = stubsByGroup.get(prompt.group) ?? []
      list.push(stub)
      stubsByGroup.set(prompt.group, list)
    }
  }

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
  const dataImport = modelDataImport(prompt)

  if (r.preProcessData === true) {
    out.push({
      name: stubName(prompt, 'preProcessData'),
      signature: `data: ${prompt.model.apiSymbols.dataType}, ctx: any, appRequest: any, appRequestData: any, allPeriodConfig: any, db: any`,
      returnType: prompt.model.apiSymbols.dataType,
      body: '{\n  return data\n}',
      imports: [dataImport]
    })
  }
  if (r.validate === true) {
    out.push({
      name: stubName(prompt, 'validate'),
      signature: `data: ${prompt.model.apiSymbols.dataType}, config: any, appRequestData: any, allPeriodConfig: any, db: any`,
      returnType: 'MutationMessage[]',
      body: '{\n  return []\n}',
      imports: [dataImport, MUTATION_MESSAGE_IMPORT]
    })
  }
  if (r.preValidate === true) {
    out.push({
      name: stubName(prompt, 'preValidate'),
      signature: `data: ${prompt.model.apiSymbols.dataType}, config: any, appRequestData: any, allPeriodConfig: any, db: any`,
      returnType: 'MutationMessage[]',
      body: '{\n  return []\n}',
      imports: [dataImport, MUTATION_MESSAGE_IMPORT]
    })
  }
  if (r.preload === true) {
    out.push({
      name: stubName(prompt, 'preload'),
      signature: 'appRequest: any, config: any, appRequestData: any, allPeriodConfig: any, ctx: any',
      returnType: prompt.model.apiSymbols.dataType,
      body: '{\n  return {} as any\n}',
      imports: [dataImport]
    })
  }
  if (r.fetch === true) {
    out.push({
      name: stubName(prompt, 'fetch'),
      signature: 'appRequest: any, config: any, appRequestData: any, allPeriodConfig: any, ctx: any',
      returnType: 'any',
      body: '{\n  return {}\n}',
      imports: []
    })
  }
  if (r.invalidates === 'dynamic') {
    out.push({
      name: stubName(prompt, 'invalidUponChange'),
      signature: 'data: any, config: any, appRequestData: any, allPeriodConfig: any',
      returnType: 'InvalidatedResponse[]',
      body: '{\n  return []\n}',
      imports: [INVALIDATED_RESPONSE_IMPORT]
    })
  }
  if (r.revalidates === 'dynamic') {
    out.push({
      name: stubName(prompt, 'validUponChange'),
      signature: 'data: any, config: any, appRequestData: any, allPeriodConfig: any',
      returnType: 'string[]',
      body: '{\n  return []\n}',
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

function modelDataImport (prompt: ResolvedPrompt): ImportRef {
  return {
    from: `../models/${prompt.model.group}.models.js`,
    name: prompt.model.apiSymbols.dataType,
    type: true
  }
}

export function stubName (prompt: ResolvedPrompt, hook: string): string {
  return `${prompt.id}${capitalize(hook)}`
}

function capitalize (s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
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
