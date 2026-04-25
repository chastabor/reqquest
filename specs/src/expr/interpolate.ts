export interface Interpolation {
  /** The trimmed expression string between the braces. */
  expr: string
  /** Byte offset of `{{` in the original source. */
  offset: number
  /** Total length of the `{{ … }}` block — needed by the rewriter to splice into a template literal. */
  length: number
}

const PATTERN = /\{\{\s*([\s\S]*?)\s*\}\}/g

export function extractInterpolations (source: string): Interpolation[] {
  const out: Interpolation[] = []
  for (const match of source.matchAll(PATTERN)) {
    const inner = match[1]?.trim() ?? ''
    if (inner.length === 0) continue
    out.push({ expr: inner, offset: match.index ?? 0, length: match[0].length })
  }
  return out
}
