import type { FieldValidateRuleDef, ResolveRuleDef } from '../spec/schema.js'
import type { Scope } from '../expr/scope.js'
import { rewriteExpression, rewriteInterpolation } from '../expr/rewrite.js'
import { lowerFirstChar, printValue, quoteString } from '../codegen/ts.js'

export function emitFieldValidateBody (rules: FieldValidateRuleDef[], scope: Scope): string {
  const lines: string[] = ['const messages: MutationMessage[] = []']
  for (const rule of rules) lines.push(emitFieldRule(rule, scope))
  lines.push('return messages')
  // ConfigurationDefinition.validate is `(data) => MutationMessage[]`; PromptDefinition.validate is `(data, config, …)`.
  const sig = scope.kind === 'config' ? '(data)' : '(data, config)'
  return `${sig} => {\n${lines.map(l => '  ' + l).join('\n')}\n}`
}

export function emitResolveBody (rules: ResolveRuleDef[], scope: Scope): string {
  const lines = rules.map(rule => emitResolveRule(rule, scope))
  return `(data, config, configLookup) => {\n${lines.map(l => '  ' + l).join('\n')}\n}`
}

// =============================================================================
// Field-validate rule emission
// =============================================================================

function emitFieldRule (rule: FieldValidateRuleDef, scope: Scope): string {
  const dataPath = fieldPath(rule.field)
  const conds: string[] = []
  if (rule.requiredWhen != null) conds.push(`(${rewriteExpression(rule.requiredWhen, scope)})`)

  let predicate: string
  if (rule.min != null) {
    const v = sizeOrNumExpr(rule.min, scope)
    predicate = [...conds, `${dataPath} != null`, `${dataPath} < ${v}`].join(' && ')
  } else if (rule.max != null) {
    const v = sizeOrNumExpr(rule.max, scope)
    predicate = [...conds, `${dataPath} != null`, `${dataPath} > ${v}`].join(' && ')
  } else if (rule.maxSize != null) {
    const bytes = parseSize(rule.maxSize, rule.field)
    predicate = [...conds, `${dataPath}?.size != null`, `${dataPath}.size > ${bytes}`].join(' && ')
  } else if (rule.equalsLabelOf != null && rule.source != null) {
    const constName = lowerFirstChar(rule.source)
    const otherPath = fieldPath(rule.equalsLabelOf)
    predicate = [...conds,
      `${dataPath} != null`,
      `${dataPath} !== ${constName}.find(s => s.value === ${otherPath})?.label`
    ].join(' && ')
  } else if (rule.matches != null) {
    const re = new RegExp(rule.matches, rule.matchesFlags ?? '')
    predicate = [...conds, `${dataPath} != null`, `!${re.toString()}.test(${dataPath})`].join(' && ')
  } else if (rule.oneOf != null) {
    predicate = [...conds, `${dataPath} != null`, `!${printValue(rule.oneOf)}.includes(${dataPath})`].join(' && ')
  } else if (rule.noneOf != null) {
    predicate = [...conds, `${dataPath} != null`, `${printValue(rule.noneOf)}.includes(${dataPath})`].join(' && ')
  } else {
    predicate = [...conds, `${dataPath} == null`].join(' && ')
  }

  const typeExpr = rule.messageType === 'warning' ? 'MutationMessageType.warning' : 'MutationMessageType.error'
  const messageExpr = rewriteInterpolation(rule.message, scope)
  const push = `messages.push({ type: ${typeExpr}, arg: ${quoteString(rule.field)}, message: ${messageExpr} })`
  return `if (${predicate}) ${push}`
}

// =============================================================================
// Resolve rule emission
// =============================================================================

function emitResolveRule (rule: ResolveRuleDef, scope: Scope): string {
  const reasonPart = rule.reason != null ? `, reason: ${rewriteInterpolation(rule.reason, scope)}` : ''
  const ret = `return { status: RequirementStatus.${rule.status}${reasonPart} }`
  if ('else' in rule && rule.else === true) return ret
  return `if (${rewriteExpression((rule as { when: string }).when, scope)}) ${ret}`
}

// =============================================================================
// Helpers
// =============================================================================

function fieldPath (field: string): string {
  return 'data.' + field.split('.').join('?.')
}

function sizeOrNumExpr (v: string | number, scope: Scope): string {
  return typeof v === 'string' ? `(${rewriteExpression(v, scope)})` : String(v)
}

const SIZE_RE = /^(\d+(?:\.\d+)?)\s*([KMGT]?B?)?$/i
const SIZE_FACTORS: Record<string, number> = {
  '': 1, B: 1,
  K: 1024, KB: 1024,
  M: 1024 ** 2, MB: 1024 ** 2,
  G: 1024 ** 3, GB: 1024 ** 3,
  T: 1024 ** 4, TB: 1024 ** 4
}

function parseSize (input: string | number, field: string): number {
  if (typeof input === 'number') return input
  const m = input.trim().match(SIZE_RE)
  if (!m) throw new Error(`rule on field "${field}": maxSize "${input}" is not a valid size literal (expected e.g. "10MB", "1024", "5KB")`)
  const factor = SIZE_FACTORS[(m[2] ?? '').toUpperCase()]
  if (factor == null) throw new Error(`rule on field "${field}": maxSize unit "${m[2]}" is not recognized (use B/KB/MB/GB/TB)`)
  return Math.round(Number(m[1]) * factor)
}
