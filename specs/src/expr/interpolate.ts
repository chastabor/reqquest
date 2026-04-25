/** A {{ … }} segment lifted out of a string literal, with its 1-based char offset. */
export interface Interpolation {
  expr: string
  offset: number
}

const PATTERN = /\{\{\s*([\s\S]*?)\s*\}\}/g

/**
 * Extract every `{{ ... }}` segment from a string. Empty segments are
 * dropped. Used by validators and (in emit) by the rule-body printer to
 * splice expressions into messages, reasons, and display text.
 */
export function extractInterpolations (source: string): Interpolation[] {
  const out: Interpolation[] = []
  for (const match of source.matchAll(PATTERN)) {
    const inner = match[1]?.trim() ?? ''
    if (inner.length === 0) continue
    out.push({ expr: inner, offset: match.index ?? 0 })
  }
  return out
}
