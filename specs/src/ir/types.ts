import type {
  PromptDef, RequirementDef, ProgramDef, Status,
  RegularModelDef, ReferenceDataModelDef
} from '../spec/schema.js'
import type { ModelSymbols } from './derive.js'

export interface ResolvedSpec {
  source: { specPath: string, repoRoot: string }
  project: ResolvedProject
  models: ResolvedModel[]
  modelById: Map<string, ResolvedModel>
  prompts: ResolvedPrompt[]
  promptById: Map<string, ResolvedPrompt>
  requirements: ResolvedRequirement[]
  requirementById: Map<string, ResolvedRequirement>
  programs: ResolvedProgram[]
  programById: Map<string, ResolvedProgram>
}

export interface ResolvedProject {
  id: string
  name: string
  multipleRequestsPerPeriod: boolean
  ui: Record<string, unknown>
}

export type ResolvedModel = ResolvedRegularModel | ResolvedReferenceDataModel

interface ResolvedModelBase {
  id: string                                                                // PascalCase
  group: string
  apiSymbols: ModelSymbols
  filePath: string
}

export interface ResolvedRegularModel extends ResolvedModelBase {
  kind: 'regular'
  raw: RegularModelDef
}

export interface ResolvedReferenceDataModel extends ResolvedModelBase {
  kind: 'referenceData'
  raw: ReferenceDataModelDef
  /** Inlined values (from `values:`, loaded from `fixture:`, or computed via `compute:`). */
  values: unknown[] | null                                                  // null when `compute:` is used — generator emits the expression, not a literal
  /** The TS expression from `compute:`, if used. */
  compute: string | null
  /** Source pointer used in the provenance comment. */
  sourceLabel: string
}

export interface ResolvedPrompt {
  id: string                                                                // camelCase
  apiKey: string                                                            // snake_case
  symbolName: string                                                        // = id, the TS const name
  group: string                                                             // inherited from model unless overridden
  model: ResolvedModel
  filePath: string
  uiDir: string
  raw: PromptDef

  // Cross-references (filled in after the initial prompts pass):
  fetchModel: ResolvedReferenceDataModel | null                             // when fetch is a referenceData id
  preloadCopyFrom: ResolvedPrompt | null
  invalidatesTargets: ResolvedPrompt[]
  revalidatesTargets: ResolvedPrompt[]
  gatherConfigSources: GatherConfigSource[]
  configurationModel: ResolvedModel | null
}

export interface GatherConfigSource {
  /** The id used in the spec — points at either a requirement or a prompt that has its own configuration. */
  source: ResolvedRequirement | ResolvedPrompt
  /** Field names plucked from the source's configuration model. */
  fields: string[]
}

export interface ResolvedRequirement {
  id: string                                                                // camelCase
  apiKey: string
  symbolName: string
  group: string                                                             // inherited from first prompt (raw.prompts[0])
  filePath: string
  raw: RequirementDef

  prompts: ResolvedPrompt[]
  hidden: ResolvedPrompt[]
  anyOrder: ResolvedPrompt[]
  configurationModel: ResolvedModel | null
  /** Resolved model when `configuration.fetch:` is a referenceData id. */
  configurationFetchModel: ResolvedReferenceDataModel | null
  /** Status set this requirement may emit. Derived from rules when present, else taken from raw.emits. */
  emits: Status[]
}

export interface ResolvedProgram {
  id: string
  apiKey: string
  symbolName: string
  raw: ProgramDef
  requirements: ResolvedRequirement[]
  workflow: ResolvedWorkflowStage[]
}

export interface ResolvedWorkflowStage {
  id: string
  apiKey: string
  title: string | null
  blocking: boolean                                                         // default true; nonBlocking = !blocking
  requirements: ResolvedRequirement[]
}
