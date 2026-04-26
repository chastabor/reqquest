import type { ResolvedSpec, ResolvedPrompt, ResolvedRequirement, ResolvedRegularModel, ResolvedModel } from '../ir/types.js'
import type { PromptDef } from '../spec/schema.js'
import { lookupModelField, isBooleanShape, isStringShape } from '../ir/fields.js'

type Logger = (msg: string) => void
type RuleBlock = NonNullable<PromptDef['validate']>

export function validateFields (spec: ResolvedSpec, log: Logger): void {
  for (const prompt of spec.prompts) walkPrompt(prompt, spec, log)
  for (const req of spec.requirements) walkRequirement(req, spec, log)
}

function walkPrompt (prompt: ResolvedPrompt, spec: ResolvedSpec, log: Logger): void {
  const ctxPrefix = `prompts.${prompt.id}`

  if (prompt.model.kind !== 'regular') {
    log(`${ctxPrefix}.model: must be a regular model, got referenceData "${prompt.model.id}"`)
    return
  }
  const promptModel = prompt.model

  walkRules(prompt.raw.validate, promptModel, spec.modelById, `${ctxPrefix}.validate`, log)
  walkRules(prompt.raw.preValidate, promptModel, spec.modelById, `${ctxPrefix}.preValidate`, log)

  prompt.raw.indexes?.forEach((idx, i) => {
    if (typeof idx.extract === 'object') {
      const result = lookupModelField(promptModel, spec.modelById, idx.extract.map)
      if (!result.found) {
        log(`${ctxPrefix}.indexes[${i}].extract.map: ${result.reason} on ${promptModel.id}`)
      }
    }
  })

  checkBooleanPaths(extractPaths(prompt.raw.invalidates, 'whenAnyFalse'),
    promptModel, spec.modelById, `${ctxPrefix}.invalidates.whenAnyFalse`, log)
  checkBooleanPaths(extractPaths(prompt.raw.revalidates, 'whenAllTrue'),
    promptModel, spec.modelById, `${ctxPrefix}.revalidates.whenAllTrue`, log)

  // gatherConfig fields must exist on each source's configuration model.
  for (const source of prompt.gatherConfigSources) {
    const sourceCfg = source.source.configurationModel
    if (!sourceCfg) {
      log(`${ctxPrefix}.gatherConfig.${source.source.id}: source has no configuration block`)
      continue
    }
    if (sourceCfg.kind !== 'regular') {
      log(`${ctxPrefix}.gatherConfig.${source.source.id}: configuration model "${sourceCfg.id}" is not a regular model`)
      continue
    }
    for (const field of source.fields) {
      const result = lookupModelField(sourceCfg, spec.modelById, field)
      if (!result.found) {
        log(`${ctxPrefix}.gatherConfig.${source.source.id}: ${result.reason} on configuration model ${sourceCfg.id}`)
      }
    }
  }

  // Configuration.validate.rules.field on the configuration model.
  if (prompt.raw.configuration && prompt.configurationModel) {
    walkRules(prompt.raw.configuration.validate, prompt.configurationModel, spec.modelById,
      `${ctxPrefix}.configuration.validate`, log)
  }
}

function walkRequirement (req: ResolvedRequirement, spec: ResolvedSpec, log: Logger): void {
  const ctxPrefix = `requirements.${req.id}`
  if (req.raw.configuration && req.configurationModel) {
    walkRules(req.raw.configuration.validate, req.configurationModel, spec.modelById,
      `${ctxPrefix}.configuration.validate`, log)
  }
}

function walkRules (
  block: RuleBlock | undefined,
  model: ResolvedModel,
  modelById: Map<string, ResolvedModel>,
  ctxPrefix: string,
  log: Logger
): void {
  if (!block || typeof block !== 'object') return
  if (model.kind !== 'regular') {
    log(`${ctxPrefix}: cannot validate rules against referenceData model "${model.id}"`)
    return
  }
  block.rules.forEach((rule, i) => {
    const ctx = `${ctxPrefix}.rules[${i}]`
    const result = lookupModelField(model, modelById, rule.field)
    if (!result.found) {
      log(`${ctx}.field: ${result.reason} on ${model.id}`)
    }
    if (rule.equalsLabelOf) {
      const eq = lookupModelField(model, modelById, rule.equalsLabelOf)
      if (!eq.found) {
        log(`${ctx}.equalsLabelOf: ${eq.reason} on ${model.id}`)
      }
    }
    if (rule.source) {
      const src = modelById.get(rule.source)
      if (!src) {
        log(`${ctx}.source: unknown model "${rule.source}"`)
      } else if (src.kind !== 'referenceData') {
        log(`${ctx}.source: "${rule.source}" must be a referenceData model`)
      }
    }
    if (rule.matches != null) {
      try {
        new RegExp(rule.matches, rule.matchesFlags ?? '')
      } catch (e: any) {
        log(`${ctx}.matches: invalid regex pattern: ${e.message}`)
      }
      if (result.found && !isStringShape(result.shape)) {
        log(`${ctx}.matches: field "${rule.field}" must be a string-typed field on ${model.id}`)
      }
    }
    if (rule.matchesFlags != null && rule.matches == null) {
      log(`${ctx}.matchesFlags: requires "matches" to be set`)
    }
  })
}

function extractPaths (
  block: PromptDef['invalidates'] | PromptDef['revalidates'],
  key: 'whenAnyFalse' | 'whenAllTrue'
): string[] | undefined {
  if (!block || block === 'dynamic' || Array.isArray(block)) return undefined
  return (block as Record<string, string[] | undefined>)[key]
}

function checkBooleanPaths (
  paths: string[] | undefined,
  model: ResolvedRegularModel,
  modelById: Map<string, ResolvedModel>,
  ctxPrefix: string,
  log: Logger
): void {
  if (!paths) return
  paths.forEach((path, i) => {
    const result = lookupModelField(model, modelById, path)
    if (!result.found) {
      log(`${ctxPrefix}[${i}]: ${result.reason} on ${model.id}`)
      return
    }
    if (!isBooleanShape(result.shape)) {
      log(`${ctxPrefix}[${i}]: "${path}" should resolve to a boolean field on ${model.id}`)
    }
  })
}
