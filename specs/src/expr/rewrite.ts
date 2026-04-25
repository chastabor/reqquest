import { parseExpression, walkIdents, type IdentRoot } from './parse.js'
import type { Scope } from './scope.js'
import { extractInterpolations } from './interpolate.js'

const PASSTHROUGH = new Set(['data', 'config', 'undefined', 'NaN', 'Infinity'])

/**
 * Rewrite an expression string for emission. Identifier-resolution rules
 * mirror expr/validate.ts but produce TS source instead of issues:
 *
 *   prompt scope    : bare `field`           → `data.field`
 *   requirement     : `promptId.field`        → `data.<snake>?.field`
 *   extract         : same as requirement, lookup over the whole spec
 *   config          : bare `field`           → `data.field` (data IS the config)
 *
 * `data.*` and `config.*` are passed through unchanged.
 */
export function rewriteExpression (source: string, scope: Scope): string {
  const ast = parseExpression(source)
  if (!ast) return source

  interface Edit { start: number, end: number, replacement: string }
  const edits: Edit[] = []
  walkIdents(ast, ident => {
    const replacement = rewriteIdent(ident, scope)
    if (replacement == null) return
    edits.push({
      start: ident.node.getStart() - 1,                                     // -1 for the wrapping `(` injected during parse
      end: ident.node.getEnd() - 1,
      replacement
    })
  })
  if (edits.length === 0) return source

  edits.sort((a, b) => a.start - b.start)
  let out = ''
  let cursor = 0
  for (const e of edits) {
    out += source.slice(cursor, e.start) + e.replacement
    cursor = e.end
  }
  out += source.slice(cursor)
  return out
}

/**
 * Rewrite a string with `{{ … }}` interpolations into a TS template
 * literal. Strings without interpolations come back as a plain string
 * literal (single-quoted via JSON-then-prettier).
 */
export function rewriteInterpolation (source: string, scope: Scope): string {
  const segs = extractInterpolations(source)
  if (segs.length === 0) return JSON.stringify(source)

  let out = '`'
  let cursor = 0
  for (const { expr, offset, length } of segs) {
    out += escapeTemplateLiteral(source.slice(cursor, offset))
    out += '${' + rewriteExpression(expr, scope) + '}'
    cursor = offset + length
  }
  out += escapeTemplateLiteral(source.slice(cursor))
  out += '`'
  return out
}

function rewriteIdent (ident: IdentRoot, scope: Scope): string | null {
  const { root, chain } = ident
  if (PASSTHROUGH.has(root)) return null
  switch (scope.kind) {
    case 'prompt':
      return ['data', root, ...chain].join('.')
    case 'config':
      return ['data', root, ...chain].join('.')
    case 'requirement': {
      const inScope = [...scope.requirement.prompts, ...scope.requirement.hidden, ...scope.requirement.anyOrder]
      const target = inScope.find(p => p.id === root)
      if (!target) return null
      return chain.length === 0
        ? `data.${target.apiKey}`
        : `data.${target.apiKey}?.${chain.join('.')}`
    }
    case 'extract': {
      const target = scope.promptById.get(root)
      if (!target) return null
      return chain.length === 0
        ? `data.${target.apiKey}`
        : `data.${target.apiKey}?.${chain.join('.')}`
    }
  }
}

function escapeTemplateLiteral (s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}
