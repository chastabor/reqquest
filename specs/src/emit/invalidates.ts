import type { ResolvedPrompt, ResolvedSpec } from '../ir/types.js'
import type { PromptDef } from '../spec/schema.js'
import { quoteString } from '../codegen/ts.js'

export interface InvalidatesResult {
  /** TS expression to assign to invalidUponChange / validUponChange. */
  expr: string
  /** Prompts that need to be imported into the emitting file. */
  externalRefs: ResolvedPrompt[]
}

// Three input forms — static array, declarative whenAnyFalse/whenAllTrue,
// or 'dynamic'. The 'dynamic' form is wired through the logic-stub path,
// not this emitter.
export function emitInvalidates (
  block: NonNullable<PromptDef['invalidates']>,
  spec: ResolvedSpec
): InvalidatesResult {
  if (block === 'dynamic') {
    throw new Error('emitInvalidates does not handle the dynamic form; use the logic-stub path')
  }
  const targets = Array.isArray(block)
    ? block.map(id => ({ promptId: id }))
    : block.targets.map(t => typeof t === 'string' ? { promptId: t } : t)
  const guard = Array.isArray(block) ? null : combineBoolean(block.whenAnyFalse, 'someFalse')
  return renderTargets(targets, guard, 'invalidate', spec)
}

export function emitRevalidates (
  block: NonNullable<PromptDef['revalidates']>,
  spec: ResolvedSpec
): InvalidatesResult {
  if (block === 'dynamic') {
    throw new Error('emitRevalidates does not handle the dynamic form; use the logic-stub path')
  }
  const targets = Array.isArray(block)
    ? block.map(id => ({ promptId: id }))
    : block.targets.map(t => typeof t === 'string' ? { promptId: t } : t)
  const guard = Array.isArray(block) ? null : combineBoolean(block.whenAllTrue, 'allTrue')
  return renderTargets(targets, guard, 'revalidate', spec)
}

interface Target { promptId: string, reason?: string }

function renderTargets (
  targets: Target[],
  guard: string | null,
  payload: 'invalidate' | 'revalidate',
  spec: ResolvedSpec
): InvalidatesResult {
  const refs = targets.map(t => spec.promptById.get(t.promptId)!)
  const items = payload === 'invalidate'
    ? targets.map((t, i) => {
      const reasonPart = t.reason != null ? `, reason: ${quoteString(t.reason)}` : ''
      return `{ promptKey: ${refs[i]!.symbolName}.key${reasonPart} }`
    }).join(', ')
    : refs.map(p => `${p.symbolName}.key`).join(', ')

  if (guard == null) {                                                      // static array form
    return {
      expr: payload === 'invalidate' ? `[${items}]` : `() => [${items}]`,
      externalRefs: refs
    }
  }
  return {
    expr: `(data, config, appRequestData, allPeriodConfig) => ${guard} ? [${items}] : []`,
    externalRefs: refs
  }
}

function combineBoolean (paths: string[], mode: 'someFalse' | 'allTrue'): string {
  if (mode === 'someFalse') {
    return paths.map(p => `data?.${p.split('.').join('?.')} === false`).join(' || ')
  }
  return paths.map(p => `data?.${p.split('.').join('?.')} === true`).join(' && ')
}
