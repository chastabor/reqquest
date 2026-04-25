import type { ResolvedSpec, ResolvedPrompt, ResolvedRequirement } from '../ir/types.js'
import type { PromptDef, FieldValidateRuleDef } from '../spec/schema.js'
import type { Scope, ConfigScope, ExtractScope, PromptScope, RequirementScope } from '../expr/scope.js'
import { validateExpression, validateInterpolations, type ValidateExprOpts } from '../expr/validate.js'

type Logger = (msg: string) => void
type RuleBlock = NonNullable<PromptDef['validate']>

export function validateExpressions (spec: ResolvedSpec, log: Logger): void {
  for (const prompt of spec.prompts) walkPrompt(prompt, spec, log)
  for (const req of spec.requirements) walkRequirement(req, spec, log)
}

function walkPrompt (prompt: ResolvedPrompt, spec: ResolvedSpec, log: Logger): void {
  const scope: PromptScope = { kind: 'prompt', prompt }
  const base = { modelById: spec.modelById, log }
  const ctxPrefix = `prompts.${prompt.id}`

  walkValidateBlock(prompt.raw.validate, scope, `${ctxPrefix}.validate`, base)
  walkValidateBlock(prompt.raw.preValidate, scope, `${ctxPrefix}.preValidate`, base)

  const extractScope: ExtractScope = { kind: 'extract', promptById: spec.promptById }

  prompt.raw.tags?.forEach((tag, i) => {
    validateExpression(tag.extract, extractScope, { ...base, ctx: `${ctxPrefix}.tags[${i}].extract` })
  })

  prompt.raw.indexes?.forEach((idx, i) => {
    if (typeof idx.extract === 'string') {
      validateExpression(idx.extract, extractScope, { ...base, ctx: `${ctxPrefix}.indexes[${i}].extract` })
    }
  })

  if (prompt.raw.configuration && prompt.configurationModel?.kind === 'regular') {
    const cscope: ConfigScope = { kind: 'config', model: prompt.configurationModel }
    walkValidateBlock(prompt.raw.configuration.validate, cscope, `${ctxPrefix}.configuration.validate`, base)
  }
}

function walkRequirement (req: ResolvedRequirement, spec: ResolvedSpec, log: Logger): void {
  const scope: RequirementScope = { kind: 'requirement', requirement: req }
  const base = { modelById: spec.modelById, log }
  const ctxPrefix = `requirements.${req.id}`

  if (typeof req.raw.resolve === 'object') {
    req.raw.resolve.rules.forEach((rule, i) => {
      const ctx = `${ctxPrefix}.resolve.rules[${i}]`
      if ('when' in rule && rule.when) {
        validateExpression(rule.when, scope, { ...base, ctx: `${ctx}.when` })
      }
      if (rule.reason) {
        validateInterpolations(rule.reason, scope, { ...base, ctx: `${ctx}.reason` })
      }
    })
  }

  if (req.raw.configuration && req.configurationModel?.kind === 'regular') {
    const cscope: ConfigScope = { kind: 'config', model: req.configurationModel }
    walkValidateBlock(req.raw.configuration.validate, cscope, `${ctxPrefix}.configuration.validate`, base)
  }
}

function walkValidateBlock (
  block: RuleBlock | undefined,
  scope: Scope,
  ctxPrefix: string,
  base: Omit<ValidateExprOpts, 'ctx'>
): void {
  if (!block || typeof block !== 'object') return
  block.rules.forEach((rule, i) => walkRule(rule, scope, `${ctxPrefix}.rules[${i}]`, base))
}

function walkRule (
  rule: FieldValidateRuleDef,
  scope: Scope,
  ctx: string,
  base: Omit<ValidateExprOpts, 'ctx'>
): void {
  if (rule.requiredWhen) {
    validateExpression(rule.requiredWhen, scope, { ...base, ctx: `${ctx}.requiredWhen` })
  }
  if (typeof rule.min === 'string') {
    validateExpression(rule.min, scope, { ...base, ctx: `${ctx}.min` })
  }
  if (typeof rule.max === 'string') {
    validateExpression(rule.max, scope, { ...base, ctx: `${ctx}.max` })
  }
  if (rule.message) {
    validateInterpolations(rule.message, scope, { ...base, ctx: `${ctx}.message` })
  }
}
