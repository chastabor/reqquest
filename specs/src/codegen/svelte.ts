import { rewriteExpression } from '../expr/rewrite.js'
import type { Scope } from '../expr/scope.js'
import { extractInterpolations } from '../expr/interpolate.js'
import { printValue, quoteString } from './ts.js'

const EXPRESSION_PROP_KEYS = new Set(['conditional', 'when'])

/**
 * Emit a single attribute on a Svelte component invocation. Supports:
 *
 *   string  → `name="value"`
 *   `true`  → `name`           (Svelte boolean shorthand)
 *   `false` → `name={false}`
 *   number  → `name={n}`
 *   array/object → `name={literal}`
 *   conditional / when → expression-rewritten binding
 */
export function printSvelteAttr (name: string, value: unknown, scope: Scope): string {
  if (EXPRESSION_PROP_KEYS.has(name) && typeof value === 'string') {
    return `${name}={${rewriteExpression(value, scope)}}`
  }
  if (value === true) return name
  if (value === false) return `${name}={false}`
  if (typeof value === 'string') return `${name}=${quoteString(value)}`
  if (typeof value === 'number') return `${name}={${value}}`
  if (typeof value === 'object' && value !== null) return `${name}={${printValue(value)}}`
  return ''
}

export function printSvelteAttrs (
  props: Record<string, unknown> | undefined,
  scope: Scope
): string {
  if (!props) return ''
  return Object.entries(props)
    .map(([k, v]) => printSvelteAttr(k, v, scope))
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
    out += `{${rewriteExpression(expr, scope)}}`
    cursor = offset + length
  }
  out += source.slice(cursor)
  return out
}
