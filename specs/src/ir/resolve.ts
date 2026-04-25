import type { Spec, PromptDef, RequirementDef, ModelDef, Status } from '../spec/schema.js'
import { loadFixture } from '../spec/fixtures.js'
import {
  toSnakeCase, modelSymbols,
  modelFilePath, promptFilePath, requirementFilePath, uiComponentDir
} from './derive.js'
import type {
  ResolvedSpec, ResolvedModel, ResolvedReferenceDataModel,
  ResolvedPrompt, ResolvedRequirement, ResolvedProgram,
  ResolvedWorkflowStage, GatherConfigSource
} from './types.js'

export class SpecResolveError extends Error {
  readonly issues: string[]
  constructor (specPath: string, issues: string[]) {
    super(`spec resolve failed at ${specPath}:\n  - ${issues.join('\n  - ')}`)
    this.name = 'SpecResolveError'
    this.issues = issues
  }
}

export interface ResolveOpts {
  repoRoot: string
  specPath: string
}

/**
 * Build a ResolvedSpec from a parsed Spec. Loads referenceData fixtures
 * from disk, links every cross-reference, and derives names + file paths.
 *
 * Errors are accumulated. If any cross-reference is missing, throws
 * SpecResolveError listing all of them at once.
 */
export async function resolveSpec (spec: Spec, opts: ResolveOpts): Promise<ResolvedSpec> {
  const issues: string[] = []
  const log = (msg: string) => { issues.push(msg) }

  // ---- Phase 1: Models (fixture loads run in parallel) ----
  const modelEntries = Object.entries(spec.models)
  for (const [id] of modelEntries) {
    if (!isPascalCase(id)) log(`models.${id}: id must be PascalCase`)
  }
  const builtModels = await Promise.all(
    modelEntries.map(([id, raw]) => buildModel(id, raw, spec.project.id, opts, log))
  )
  const models: ResolvedModel[] = builtModels
  const modelById = new Map<string, ResolvedModel>(models.map(m => [m.id, m]))

  // ---- Phase 2: Prompts (link model only — back-refs filled in Phase 5) ----
  const prompts: ResolvedPrompt[] = []
  const promptById = new Map<string, ResolvedPrompt>()
  for (const [id, raw] of Object.entries(spec.prompts)) {
    if (!isCamelCase(id)) {
      log(`prompts.${id}: id must be camelCase`)
    }
    const model = modelById.get(raw.model)
    if (!model) {
      log(`prompts.${id}.model: unknown model "${raw.model}"`)
      continue
    }
    const group = raw.group ?? model.group
    const prompt: ResolvedPrompt = {
      id,
      apiKey: toSnakeCase(id),
      symbolName: id,
      group,
      model,
      filePath: promptFilePath(spec.project.id, group),
      uiDir: uiComponentDir(spec.project.id, group),
      raw,
      fetchModel: null,
      preloadCopyFrom: null,
      invalidatesTargets: [],
      revalidatesTargets: [],
      gatherConfigSources: [],
      configurationModel: null
    }
    prompts.push(prompt)
    promptById.set(id, prompt)
  }

  // ---- Phase 3: Requirements (link prompts) ----
  const requirements: ResolvedRequirement[] = []
  const requirementById = new Map<string, ResolvedRequirement>()
  for (const [id, raw] of Object.entries(spec.requirements)) {
    if (!isCamelCase(id)) {
      log(`requirements.${id}: id must be camelCase`)
    }
    const promptRefs = lookupMany(`requirements.${id}.prompts`, raw.prompts, promptById, 'prompt', log)
    const hiddenRefs = lookupMany(`requirements.${id}.hidden`, raw.hidden ?? [], promptById, 'prompt', log)
    const anyOrderRefs = lookupMany(`requirements.${id}.anyOrder`, raw.anyOrder ?? [], promptById, 'prompt', log)
    const group = raw.group ?? promptRefs[0]?.group ?? 'default'
    const configurationModel = raw.configuration
      ? lookupOne(`requirements.${id}.configuration.model`, raw.configuration.model, modelById, 'model', log)
      : null
    const emits = deriveEmits(`requirements.${id}`, raw, log)
    const req: ResolvedRequirement = {
      id,
      apiKey: toSnakeCase(id),
      symbolName: id,
      group,
      filePath: requirementFilePath(spec.project.id, group),
      raw,
      prompts: promptRefs,
      hidden: hiddenRefs,
      anyOrder: anyOrderRefs,
      configurationModel,
      emits
    }
    requirements.push(req)
    requirementById.set(id, req)
  }

  // ---- Phase 4: Programs (link requirements) ----
  const programs: ResolvedProgram[] = []
  const programById = new Map<string, ResolvedProgram>()
  for (const [id, raw] of Object.entries(spec.programs)) {
    if (!isCamelCase(id)) {
      log(`programs.${id}: id must be camelCase`)
    }
    const reqs = lookupMany(`programs.${id}.requirements`, raw.requirements, requirementById, 'requirement', log)
    const workflow: ResolvedWorkflowStage[] = []
    if (raw.workflow) {
      for (const [stageId, stage] of Object.entries(raw.workflow)) {
        const stageReqs = lookupMany(
          `programs.${id}.workflow.${stageId}.requirements`,
          stage.requirements,
          requirementById,
          'requirement',
          log
        )
        workflow.push({
          id: stageId,
          apiKey: toSnakeCase(stageId),
          title: stage.title ?? null,
          blocking: stage.blocking ?? true,
          requirements: stageReqs
        })
      }
    }
    const prog: ResolvedProgram = {
      id,
      apiKey: toSnakeCase(id),
      symbolName: id,
      raw,
      requirements: reqs,
      workflow
    }
    programs.push(prog)
    programById.set(id, prog)
  }

  // ---- Phase 5: Back-fill prompt cross-refs that depend on later phases ----
  for (const prompt of prompts) {
    const r: PromptDef = prompt.raw

    if (typeof r.fetch === 'string') {
      const m = modelById.get(r.fetch)
      if (!m) {
        log(`prompts.${prompt.id}.fetch: unknown model "${r.fetch}"`)
      } else if (m.kind !== 'referenceData') {
        log(`prompts.${prompt.id}.fetch: "${r.fetch}" must be a referenceData model`)
      } else {
        prompt.fetchModel = m
      }
    }

    if (r.preload && typeof r.preload === 'object' && 'copyFrom' in r.preload) {
      const target = promptById.get(r.preload.copyFrom)
      if (!target) {
        log(`prompts.${prompt.id}.preload.copyFrom: unknown prompt "${r.preload.copyFrom}"`)
      } else {
        prompt.preloadCopyFrom = target
      }
    }

    prompt.invalidatesTargets = collectInvalidateTargets(
      `prompts.${prompt.id}.invalidates`,
      r.invalidates,
      promptById,
      log
    )
    prompt.revalidatesTargets = collectInvalidateTargets(
      `prompts.${prompt.id}.revalidates`,
      r.revalidates,
      promptById,
      log
    )

    if (r.gatherConfig) {
      const sources: GatherConfigSource[] = []
      for (const [refId, fields] of Object.entries(r.gatherConfig)) {
        const req = requirementById.get(refId)
        const otherPrompt = promptById.get(refId)
        if (!req && !otherPrompt) {
          log(`prompts.${prompt.id}.gatherConfig.${refId}: unknown requirement or prompt`)
          continue
        }
        sources.push({ source: (req ?? otherPrompt)!, fields })
      }
      prompt.gatherConfigSources = sources
    }

    if (r.configuration) {
      prompt.configurationModel = lookupOne(
        `prompts.${prompt.id}.configuration.model`,
        r.configuration.model,
        modelById,
        'model',
        log
      )
    }
  }

  if (issues.length > 0) {
    throw new SpecResolveError(opts.specPath, issues)
  }

  return {
    source: { specPath: opts.specPath, repoRoot: opts.repoRoot },
    project: {
      id: spec.project.id,
      name: spec.project.name,
      multipleRequestsPerPeriod: spec.project.multipleRequestsPerPeriod ?? false,
      ui: spec.project.ui ?? {}
    },
    models,
    modelById,
    prompts,
    promptById,
    requirements,
    requirementById,
    programs,
    programById
  }
}

// =============================================================================
// Internals
// =============================================================================

async function buildModel (
  id: string,
  raw: ModelDef,
  projectId: string,
  opts: ResolveOpts,
  log: (msg: string) => void
): Promise<ResolvedModel> {
  const filePath = modelFilePath(projectId, raw.group)
  const apiSymbols = modelSymbols(id)

  if ('kind' in raw && raw.kind === 'referenceData') {
    let values: unknown[] | null = null
    let compute: string | null = null
    let sourceLabel: string

    if (raw.values != null) {
      values = raw.values
      sourceLabel = 'inline values:'
    } else if (raw.fixture != null) {
      sourceLabel = raw.fixture
      try {
        values = await loadFixture(raw.fixture, { repoRoot: opts.repoRoot })
      } catch (err: any) {
        log(`models.${id}.fixture: ${err.message}`)
        values = []
      }
    } else if (raw.compute != null) {
      compute = raw.compute
      sourceLabel = `compute: ${raw.compute}`
    } else {
      // Should already have been caught by zod's refine.
      log(`models.${id}: referenceData requires one of values / fixture / compute`)
      sourceLabel = '<missing>'
    }

    const model: ResolvedReferenceDataModel = {
      id,
      group: raw.group,
      apiSymbols,
      filePath,
      kind: 'referenceData',
      raw,
      values,
      compute,
      sourceLabel
    }
    return model
  }

  return {
    id,
    group: raw.group,
    apiSymbols,
    filePath,
    kind: 'regular',
    raw
  }
}

function lookupOne<T> (
  ctx: string,
  id: string,
  index: Map<string, T>,
  kind: string,
  log: (msg: string) => void
): T | null {
  const v = index.get(id)
  if (!v) {
    log(`${ctx}: unknown ${kind} "${id}"`)
    return null
  }
  return v
}

function lookupMany<T> (
  ctx: string,
  ids: string[],
  index: Map<string, T>,
  kind: string,
  log: (msg: string) => void
): T[] {
  const out: T[] = []
  for (const id of ids) {
    const v = lookupOne(ctx, id, index, kind, log)
    if (v) out.push(v)
  }
  return out
}

type InvalidateBlock = PromptDef['invalidates'] | PromptDef['revalidates']

function collectInvalidateTargets (
  ctx: string,
  block: InvalidateBlock,
  index: Map<string, ResolvedPrompt>,
  log: (msg: string) => void
): ResolvedPrompt[] {
  if (block == null || block === 'dynamic') return []
  if (Array.isArray(block)) {
    return lookupMany(ctx, block, index, 'prompt', log)
  }
  const targets = block.targets.map(t => typeof t === 'string' ? t : t.promptId)
  return lookupMany(ctx, targets, index, 'prompt', log)
}

function deriveEmits (
  ctx: string,
  raw: RequirementDef,
  log: (msg: string) => void
): Status[] {
  const declared = raw.emits ?? null
  if (raw.resolve === true) {
    if (!declared) {
      log(`${ctx}.emits: required when resolve: true (status set is opaque)`)
      return []
    }
    return declared
  }
  if (raw.resolve === false) {
    return declared ?? []
  }
  const fromRules = [...new Set(raw.resolve.rules.map(r => r.status))]
  if (declared) {
    const declaredSet = new Set(declared)
    const derivedSet = new Set(fromRules)
    if (declaredSet.size !== derivedSet.size || [...declaredSet].some(s => !derivedSet.has(s))) {
      log(`${ctx}.emits: explicit set [${[...declaredSet].sort().join(', ')}] does not match derived [${[...derivedSet].sort().join(', ')}]`)
    }
  }
  return fromRules
}

function isCamelCase (id: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(id)
}

function isPascalCase (id: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(id)
}
