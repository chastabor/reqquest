import type { ResolvedSpec } from '../ir/types.js'
import { validateInvariants } from './invariants.js'
import { validateFields } from './fields.js'
import { validateExpressions } from './expressions.js'
import { validateUI } from './ui.js'

export class SpecValidationError extends Error {
  readonly issues: string[]
  constructor (specPath: string, issues: string[]) {
    super(`spec validation failed at ${specPath}:\n  - ${issues.join('\n  - ')}`)
    this.name = 'SpecValidationError'
    this.issues = issues
  }
}

/**
 * Run every Phase 1B validator over a resolved spec. Issues from all
 * passes are collected; if any are present, throws SpecValidationError.
 */
export function validateSpec (spec: ResolvedSpec): void {
  const issues: string[] = []
  const log = (msg: string) => { issues.push(msg) }

  validateInvariants(spec, log)
  validateFields(spec, log)
  validateExpressions(spec, log)
  validateUI(spec, log)

  if (issues.length > 0) {
    throw new SpecValidationError(spec.source.specPath, issues)
  }
}
