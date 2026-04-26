import { rewriteExpression, rewriteInterpolation } from '../expr/rewrite.js'
import type { Scope } from '../expr/scope.js'
import { extractInterpolations } from '../expr/interpolate.js'
import { printValue, quoteString } from './ts.js'

const EXPRESSION_PROP_KEYS = new Set(['conditional', 'when'])
const SVELTE = { target: 'svelte' as const }

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
 *   conditional / when     → expression-rewritten binding
 */
export function printSvelteAttr (name: string, value: unknown, scope: Scope): string {
  if (EXPRESSION_PROP_KEYS.has(name) && typeof value === 'string') {
    return `${name}={${rewriteExpression(value, scope, SVELTE)}}`
  }
  if (value === true) return name
  if (value === false) return `${name}={false}`
  if (typeof value === 'string') {
    const rendered = emitSvelteString(value, scope)
    return rendered.startsWith('"') ? `${name}=${rendered}` : `${name}={${rendered}}`
  }
  if (typeof value === 'number') return `${name}={${value}}`
  if (typeof value === 'object' && value !== null) {
    return `${name}={${printValue(value, s => emitSvelteString(s, scope))}}`
  }
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
    out += `{${rewriteExpression(expr, scope, SVELTE)}}`
    cursor = offset + length
  }
  out += source.slice(cursor)
  return out
}
