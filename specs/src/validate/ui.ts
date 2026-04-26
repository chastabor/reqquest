import type { ResolvedSpec, ResolvedPrompt, ResolvedRequirement, ResolvedRegularModel, ResolvedModel } from '../ir/types.js'
import type { PromptScope, ConfigScope } from '../expr/scope.js'
import { validateExpression, validateInterpolations } from '../expr/validate.js'
import { isFromRefShorthand } from '../codegen/svelte.js'
import { lookupModelField } from '../ir/fields.js'

type Logger = (msg: string) => void

interface SlotWalkCtx {
  scope: PromptScope | ConfigScope
  scopeModel: ResolvedRegularModel
  /** referenceData ids whose const will be in `fetched` at runtime. Used to validate `{ from: X }` shorthand. */
  fetchedRefDataIds: Set<string>
}

// Recognized keys per slot:
//   path / labelPath / *Path  → field on the scope model
//   conditional / when        → expression
//   text                      → string with `{{ … }}` interpolation
//   { from: <RefDataId> }     → reference to fetched referenceData
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
  const fetchedRefDataIds = new Set<string>()
  if (prompt.fetchModel) fetchedRefDataIds.add(prompt.fetchModel.id)

  walkSlot(ui.form, { scope: promptScope, scopeModel: prompt.model, fetchedRefDataIds }, `${ctxPrefix}.form`, spec, log)
  walkSlot(ui.display, { scope: promptScope, scopeModel: prompt.model, fetchedRefDataIds }, `${ctxPrefix}.display`, spec, log)

  // Configure slot: own configuration model; `fetched` populated only when
  // `configuration.fetch:` is set (refdata-shorthand isn't supported on
  // prompt configurations yet, so the set is always empty here).
  walkConfigureSlot(ui.configure, prompt.configurationModel, new Set(), `${ctxPrefix}.configure`, spec, log)
}

function walkRequirement (req: ResolvedRequirement, spec: ResolvedSpec, log: Logger): void {
  const slot = req.raw.ui?.configure ?? req.raw.configuration?.ui?.configure
  if (slot == null) return
  const fetchedRefDataIds = new Set<string>()
  if (req.configurationFetchModel) fetchedRefDataIds.add(req.configurationFetchModel.id)
  const ctxLabel = `requirements.${req.id}.${req.raw.ui?.configure ? 'ui' : 'configuration.ui'}.configure`
  walkConfigureSlot(slot, req.configurationModel, fetchedRefDataIds, ctxLabel, spec, log)
}

function walkConfigureSlot (
  slot: unknown,
  configModel: ResolvedModel | null,
  fetchedRefDataIds: Set<string>,
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
  walkSlot(slot, { scope, scopeModel: configModel, fetchedRefDataIds }, ctx, spec, log)
}

function walkSlot (slot: unknown, walk: SlotWalkCtx, ctx: string, spec: ResolvedSpec, log: Logger): void {
  if (slot == null || typeof slot !== 'object') return
  walkAny(slot, walk, ctx, spec, log)
}

/**
 * Recursive walker. Inspects each string-valued property by key name:
 * known keys go through validation; unknown keys are inert. Single-key
 * `{ from: <RefDataId> }` objects are validated as referenceData
 * references.
 */
function walkAny (node: unknown, walk: SlotWalkCtx, ctx: string, spec: ResolvedSpec, log: Logger): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkAny(item, walk, `${ctx}[${i}]`, spec, log))
    return
  }
  if (node == null || typeof node !== 'object') return

  if (isFromRefShorthand(node)) {
    handleFromRef(node.from, walk, ctx, spec, log)
    return
  }

  for (const [key, value] of Object.entries(node)) {
    const childCtx = `${ctx}.${key}`
    if (typeof value === 'string') {
      handleStringField(key, value, walk, childCtx, spec, log)
    } else if (typeof value === 'object' && value !== null) {
      walkAny(value, walk, childCtx, spec, log)
    }
  }
}

function handleFromRef (refId: string, walk: SlotWalkCtx, ctx: string, spec: ResolvedSpec, log: Logger): void {
  const model = spec.modelById.get(refId)
  if (!model) {
    log(`${ctx}: { from: "${refId}" } — unknown model`)
    return
  }
  if (model.kind !== 'referenceData') {
    log(`${ctx}: { from: "${refId}" } — "${refId}" is not a referenceData model`)
    return
  }
  if (!walk.fetchedRefDataIds.has(refId)) {
    log(`${ctx}: { from: "${refId}" } — referenceData not in scope; declare \`fetch: ${refId}\` on the prompt or \`configuration.fetch: ${refId}\` on the requirement`)
  }
}

function handleStringField (
  key: string,
  value: string,
  walk: SlotWalkCtx,
  ctx: string,
  spec: ResolvedSpec,
  log: Logger
): void {
  if (isPathKey(key)) {
    const result = lookupModelField(walk.scopeModel, spec.modelById, value)
    if (!result.found) log(`${ctx}: ${result.reason} on ${walk.scopeModel.id}`)
  } else if (key === 'conditional' || key === 'when') {
    validateExpression(value, walk.scope, { modelById: spec.modelById, ctx, log })
  } else {
    // Field/template props (and `text:`) may contain `{{ … }}`
    // interpolations. Strings without interpolations are inert.
    validateInterpolations(value, walk.scope, { modelById: spec.modelById, ctx, log })
  }
}

function isPathKey (key: string): boolean {
  return key === 'path' || key === 'labelPath' || (key.endsWith('Path') && key !== 'Path')
}
