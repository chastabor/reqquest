import { parseExpression, walkIdents, type IdentRoot } from './parse.js'
import type { Scope } from './scope.js'
import type { ResolvedModel, ResolvedPrompt, ResolvedRequirement } from '../ir/types.js'
import { lookupModelField } from '../ir/fields.js'
import { extractInterpolations } from './interpolate.js'

// Built-in identifiers that look like names but aren't model fields. `data`
// and `config` are handled specially in validateIdent.
const VERBATIM_HEADS = new Set(['undefined', 'NaN', 'Infinity'])

export interface ValidateExprOpts {
  modelById: Map<string, ResolvedModel>
  /** Prefix prepended to every issue, e.g. `requirements.foo.resolve.rules[2].when`. */
  ctx: string
  /** Issue sink. */
  log: (msg: string) => void
}

/** Validate a single expression against a scope. Issues go through `log`. */
export function validateExpression (source: string, scope: Scope, opts: ValidateExprOpts): void {
  const ast = parseExpression(source)
  if (!ast) {
    opts.log(`${opts.ctx}: cannot parse expression "${source}"`)
    return
  }
  walkIdents(ast, ident => validateIdent(ident, scope, opts))
}

/** Validate every `{{ ... }}` interpolation inside a string. */
export function validateInterpolations (source: string, scope: Scope, opts: ValidateExprOpts): void {
  if (!source.includes('{{')) return                                          // fast path — most string props have no interpolations
  for (const { expr } of extractInterpolations(source)) {
    validateExpression(expr, scope, { ...opts, ctx: `${opts.ctx}: {{${expr}}}` })
  }
}

function validateIdent (ident: IdentRoot, scope: Scope, opts: ValidateExprOpts): void {
  const { root, chain } = ident
  if (VERBATIM_HEADS.has(root)) return
  if (root === 'data') return                                                // escape hatch — accepted verbatim
  if (root === 'config') {
    validateConfig(chain, scope, opts)
    return
  }
  switch (scope.kind) {
    case 'requirement': return validateRequirementRoot(root, chain, scope, opts)
    case 'extract':     return validateExtractRoot(root, chain, scope, opts)
    case 'prompt':      return validateOnRegularModel([root, ...chain].join('.'), scope.prompt.model, opts)
    case 'config':      return validateOnRegularModel([root, ...chain].join('.'), scope.model, opts)
  }
}

function validateConfig (chain: string[], scope: Scope, opts: ValidateExprOpts): void {
  if (chain.length === 0) {
    opts.log(`${opts.ctx}: "config" must be followed by a property name`)
    return
  }
  const prop = chain[0]!
  if (scope.kind === 'prompt') {
    const gathered = scope.prompt.gatherConfigSources.some(s => s.fields.includes(prop))
    if (!gathered) {
      opts.log(`${opts.ctx}: config.${prop} is not gathered by "${scope.prompt.id}" via gatherConfig`)
    }
    return
  }
  if (scope.kind === 'requirement') {
    const cfg = scope.requirement.configurationModel
    if (!cfg) {
      opts.log(`${opts.ctx}: config.${prop} but requirement "${scope.requirement.id}" has no configuration block`)
      return
    }
    validateOnRegularModel(prop, cfg, opts)
    return
  }
  if (scope.kind === 'config') {
    validateOnRegularModel(prop, scope.model, opts)
    return
  }
  // extract scope — config.X is meaningless here, would be an authoring error.
  opts.log(`${opts.ctx}: config.${prop} is not valid in tag/index extract expressions`)
}

function validateRequirementRoot (root: string, chain: string[], scope: { requirement: ResolvedRequirement }, opts: ValidateExprOpts): void {
  const inScope = [
    ...scope.requirement.prompts,
    ...scope.requirement.hidden,
    ...scope.requirement.anyOrder
  ]
  const matched = inScope.find(p => p.id === root)
  if (!matched) {
    opts.log(`${opts.ctx}: identifier "${root}" must be a prompt in requirement "${scope.requirement.id}" (prompts/hidden/anyOrder)`)
    return
  }
  if (chain.length === 0) {
    opts.log(`${opts.ctx}: prompt id "${root}" used bare; expected a field access (e.g. ${root}.someField)`)
    return
  }
  validateOnRegularModel(chain.join('.'), matched.model, opts)
}

function validateExtractRoot (
  root: string,
  chain: string[],
  scope: { promptById: Map<string, ResolvedPrompt> },
  opts: ValidateExprOpts
): void {
  const target = scope.promptById.get(root)
  if (!target) {
    opts.log(`${opts.ctx}: identifier "${root}" must be a prompt id (or use data.* for the escape hatch)`)
    return
  }
  if (chain.length === 0) return                                             // bare prompt-id reference is fine in extract scope (e.g. existence check)
  validateOnRegularModel(chain.join('.'), target.model, opts)
}

function validateOnRegularModel (path: string, model: ResolvedModel, opts: ValidateExprOpts): void {
  if (model.kind !== 'regular') {
    opts.log(`${opts.ctx}: cannot index "${path}" on referenceData model "${model.id}"`)
    return
  }
  const result = lookupModelField(model, opts.modelById, path)
  if (!result.found) {
    opts.log(`${opts.ctx}: ${result.reason} on model ${model.id}`)
  }
}
