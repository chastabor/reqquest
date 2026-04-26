import { rewriteExpression, rewriteInterpolation } from '../expr/rewrite.js'
import type { Scope } from '../expr/scope.js'
import { extractInterpolations } from '../expr/interpolate.js'
import type { ResolvedModel } from '../ir/types.js'
import { lowerFirstChar, objectKey, printValue, quoteString } from './ts.js'

const EXPRESSION_PROP_KEYS = new Set(['conditional', 'when'])
const SVELTE = { target: 'svelte' as const }

/** Side-channel for resolving `{ from: <RefDataId> }` shorthand. Optional — without it, `{ from: X }` falls through to a plain object literal. */
export interface SvelteRefDataCtx {
  modelById: Map<string, ResolvedModel>
  fetchedRefDataIds: Set<string>
}

export function isFromRefShorthand (v: unknown): v is { from: string } {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false
  if (!('from' in v)) return false
  const obj = v as Record<string, unknown>
  return Object.keys(obj).length === 1 && typeof obj.from === 'string'
}

function emitFromRef (refId: string, refData: SvelteRefDataCtx): string {
  const model = refData.modelById.get(refId)
  if (!model) throw new Error(`{ from: "${refId}" }: unknown referenceData model`)
  if (model.kind !== 'referenceData') throw new Error(`{ from: "${refId}" }: model "${refId}" is not a referenceData`)
  if (!refData.fetchedRefDataIds.has(refId)) {
    throw new Error(`{ from: "${refId}" }: referenceData not in scope — declare \`fetch: ${refId}\` on the prompt or \`configuration.fetch: ${refId}\` on the requirement`)
  }
  return `fetched.${lowerFirstChar(refId)}`
}

function printSvelteValue (v: unknown, scope: Scope, refData?: SvelteRefDataCtx): string {
  if (refData && isFromRefShorthand(v)) return emitFromRef(v.from, refData)
  if (typeof v === 'string') return emitSvelteString(v, scope)
  if (Array.isArray(v)) return '[' + v.map(item => printSvelteValue(item, scope, refData)).join(', ') + ']'
  if (v !== null && typeof v === 'object') {
    const entries = Object.entries(v).map(([k, val]) => `${objectKey(k)}: ${printSvelteValue(val, scope, refData)}`)
    return '{ ' + entries.join(', ') + ' }'
  }
  return printValue(v)
}

/**
 * Render a string as the contents of a Svelte expression binding,
 * rewriting `{{ … }}` interpolations against the prompt scope.
 *
 *   no interpolation                → `"value"`           (quoted literal)
 *   single full-string `{{ expr }}` → `<expr>`            (bare expression)
 *   mixed text + interpolations     → `\`…${expr}…\``     (template literal)
 *
 * Caller wraps in `{...}` (or `={...}` for an attribute) as needed.
 */
function emitSvelteString (value: string, scope: Scope): string {
  const segs = extractInterpolations(value)
  if (segs.length === 0) return quoteString(value)
  if (segs.length === 1 && segs[0]!.offset === 0 && segs[0]!.length === value.length) {
    return rewriteExpression(segs[0]!.expr, scope, SVELTE)
  }
  return rewriteInterpolation(value, scope, SVELTE, segs)
}

/**
 * Emit a single attribute on a Svelte component invocation. Supports:
 *
 *   string                 → `name="value"`
 *   string with `{{ … }}`  → `name={<expr>}` (single full-string interp)
 *                            or `name={`…`}` (template literal otherwise)
 *   `true`                 → `name`           (Svelte boolean shorthand)
 *   `false`                → `name={false}`
 *   number                 → `name={n}`
 *   array/object           → `name={literal}` (interpolations recursed into)
 *   `{ from: <RefDataId>}` → `name={fetched.<constName>}` (when refData passed)
 *   conditional / when     → expression-rewritten binding
 */
export function printSvelteAttr (name: string, value: unknown, scope: Scope, refData?: SvelteRefDataCtx): string {
  if (EXPRESSION_PROP_KEYS.has(name) && typeof value === 'string') {
    return `${name}={${rewriteExpression(value, scope, SVELTE)}}`
  }
  if (refData && isFromRefShorthand(value)) {
    return `${name}={${emitFromRef(value.from, refData)}}`
  }
  if (value === true) return name
  if (value === false) return `${name}={false}`
  if (typeof value === 'string') {
    const rendered = emitSvelteString(value, scope)
    return rendered.startsWith('"') ? `${name}=${rendered}` : `${name}={${rendered}}`
  }
  if (typeof value === 'number') return `${name}={${value}}`
  if (typeof value === 'object' && value !== null) {
    return `${name}={${printSvelteValue(value, scope, refData)}}`
  }
  return ''
}

export function printSvelteAttrs (
  props: Record<string, unknown> | undefined,
  scope: Scope,
  refData?: SvelteRefDataCtx
): string {
  if (!props) return ''
  return Object.entries(props)
    .map(([k, v]) => printSvelteAttr(k, v, scope, refData))
    .filter(Boolean)
    .join(' ')
}

/**
 * Splice a `{{ expr }}` interpolated string into Svelte template syntax —
 * each `{{ … }}` becomes `{rewriteExpression(…)}`; literal segments pass
 * through.
 */
export function rewriteSvelteText (source: string, scope: Scope): string {
  const segs = extractInterpolations(source)
  if (segs.length === 0) return source
  let out = ''
  let cursor = 0
  for (const { expr, offset, length } of segs) {
    out += source.slice(cursor, offset)
    out += `{${rewriteExpression(expr, scope, SVELTE)}}`
    cursor = offset + length
  }
  out += source.slice(cursor)
  return out
}
