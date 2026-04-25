// Output is deliberately unformatted — prettier runs as a final pass.

const IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

export function isValidIdent (s: string): boolean {
  return IDENT_RE.test(s)
}

export function lowerFirstChar (s: string): string {
  return s.length === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1)
}

export function quoteString (s: string): string {
  return JSON.stringify(s)                                                  // double-quoted; prettier converts to single
}

/** Emit `key: value` with the key bare when it's a valid identifier, else quoted. */
export function objectKey (key: string): string {
  return isValidIdent(key) ? key : quoteString(key)
}

/**
 * Recursively emit a JSON-like value as a TS literal. Handles primitives,
 * arrays, and plain objects. Throws on unsupported values (functions,
 * symbols, etc.) — callers should sanitize input first.
 */
export function printValue (v: unknown): string {
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'string') return quoteString(v)
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return '[' + v.map(printValue).join(', ') + ']'
  if (typeof v === 'object') {
    const entries = Object.entries(v).map(([k, val]) => `${objectKey(k)}: ${printValue(val)}`)
    return '{ ' + entries.join(', ') + ' }'
  }
  throw new Error(`cannot print value of type ${typeof v}`)
}
