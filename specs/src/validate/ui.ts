import type { ResolvedSpec, ResolvedPrompt, ResolvedRequirement, ResolvedRegularModel, ResolvedModel } from '../ir/types.js'
import type { Scope, PromptScope, ConfigScope } from '../expr/scope.js'
import { validateExpression, validateInterpolations } from '../expr/validate.js'
import { lookupModelField } from '../ir/fields.js'

type Logger = (msg: string) => void

// Recognized keys per slot:
//   path / labelPath / *Path → field on the scope model
//   conditional / when       → expression
//   text                     → string with `{{ … }}` interpolation
// Other string props are inspected for `{{ … }}` interpolations and
// validated against the scope; static strings pass through unchanged.
export function validateUI (spec: ResolvedSpec, log: Logger): void {
  for (const prompt of spec.prompts) walkPrompt(prompt, spec, log)
  for (const req of spec.requirements) walkRequirement(req, spec, log)
}

function walkPrompt (prompt: ResolvedPrompt, spec: ResolvedSpec, log: Logger): void {
  const ui = prompt.raw.ui
  if (!ui) return
  const ctxPrefix = `prompts.${prompt.id}.ui`

  if (prompt.model.kind !== 'regular') {
    log(`${ctxPrefix}: cannot validate UI against referenceData model "${prompt.model.id}"`)
    return
  }
  const promptScope: PromptScope = { kind: 'prompt', prompt }

  walkSlot(ui.form, promptScope, prompt.model, `${ctxPrefix}.form`, spec, log)
  walkSlot(ui.display, promptScope, prompt.model, `${ctxPrefix}.display`, spec, log)
  walkConfigureSlot(ui.configure, prompt.configurationModel, `${ctxPrefix}.configure`, spec, log)
}

function walkRequirement (req: ResolvedRequirement, spec: ResolvedSpec, log: Logger): void {
  if (!req.raw.ui) return
  walkConfigureSlot(req.raw.ui.configure, req.configurationModel,
    `requirements.${req.id}.ui.configure`, spec, log)
}

function walkConfigureSlot (
  slot: unknown,
  configModel: ResolvedModel | null,
  ctx: string,
  spec: ResolvedSpec,
  log: Logger
): void {
  if (slot == null) return
  if (!configModel) {
    log(`${ctx}: configure slot present but no configuration block`)
    return
  }
  if (configModel.kind !== 'regular') {
    log(`${ctx}: configuration model "${configModel.id}" is not a regular model`)
    return
  }
  const scope: ConfigScope = { kind: 'config', model: configModel }
  walkSlot(slot, scope, configModel, ctx, spec, log)
}

function walkSlot (
  slot: unknown,
  scope: PromptScope | ConfigScope,
  scopeModel: ResolvedRegularModel,
  ctx: string,
  spec: ResolvedSpec,
  log: Logger
): void {
  if (slot == null || typeof slot !== 'object') return
  walkAny(slot, scope, scopeModel, ctx, spec, log)
}

/**
 * Recursive walker. Inspects each string-valued property by key name:
 * known keys go through validation; unknown keys are inert.
 */
function walkAny (
  node: unknown,
  scope: PromptScope | ConfigScope,
  scopeModel: ResolvedRegularModel,
  ctx: string,
  spec: ResolvedSpec,
  log: Logger
): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkAny(item, scope, scopeModel, `${ctx}[${i}]`, spec, log))
    return
  }
  if (node == null || typeof node !== 'object') return

  for (const [key, value] of Object.entries(node)) {
    const childCtx = `${ctx}.${key}`
    if (typeof value === 'string') {
      handleStringField(key, value, scope, scopeModel, childCtx, spec, log)
    } else if (typeof value === 'object' && value !== null) {
      walkAny(value, scope, scopeModel, childCtx, spec, log)
    }
  }
}

function handleStringField (
  key: string,
  value: string,
  scope: PromptScope | ConfigScope,
  scopeModel: ResolvedRegularModel,
  ctx: string,
  spec: ResolvedSpec,
  log: Logger
): void {
  if (isPathKey(key)) {
    const result = lookupModelField(scopeModel, spec.modelById, value)
    if (!result.found) log(`${ctx}: ${result.reason} on ${scopeModel.id}`)
  } else if (key === 'conditional' || key === 'when') {
    validateExpression(value, scope, { modelById: spec.modelById, ctx, log })
  } else {
    // Field/template props (and `text:`) may contain `{{ … }}`
    // interpolations. Strings without interpolations are inert.
    validateInterpolations(value, scope, { modelById: spec.modelById, ctx, log })
  }
}

function isPathKey (key: string): boolean {
  return key === 'path' || key === 'labelPath' || (key.endsWith('Path') && key !== 'Path')
}
