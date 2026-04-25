import type { ResolvedPrompt, ResolvedRequirement, ResolvedRegularModel } from '../ir/types.js'

export type Scope = PromptScope | RequirementScope | ConfigScope | ExtractScope

export interface PromptScope {
  kind: 'prompt'
  prompt: ResolvedPrompt
}

export interface RequirementScope {
  kind: 'requirement'
  requirement: ResolvedRequirement
}

export interface ConfigScope {
  kind: 'config'
  model: ResolvedRegularModel
}

/**
 * Tag/index extract expressions run against the full AppRequest data
 * namespace — a top-level identifier must be a prompt id from anywhere
 * in the spec.
 */
export interface ExtractScope {
  kind: 'extract'
  promptById: Map<string, ResolvedPrompt>
}
