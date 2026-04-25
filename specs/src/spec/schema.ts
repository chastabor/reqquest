import { z } from 'zod'

// =============================================================================
// Primitive helpers
// =============================================================================

const HookFlag = z.union([z.literal(true), z.literal(false)])
const HookOrDynamic = z.union([HookFlag, z.literal('dynamic')])

export const StatusName = z.enum([
  'PENDING',
  'MET',
  'DISQUALIFYING',
  'WARNING',
  'NOT_APPLICABLE'
])
export type Status = z.infer<typeof StatusName>

const PhaseName = z.enum([
  'PREQUAL',
  'QUALIFICATION',
  'POSTQUAL',
  'PREAPPROVAL',
  'APPROVAL',
  'ACCEPTANCE',
  'WORKFLOW'
])

// =============================================================================
// Schema property shorthand (CLAUDE.md §5)
//
// Accepts: 'string' | 'number' | 'boolean'
//        | <ModelId>  (PascalCase reference)
//        | { format: 'date-time' }
//        | { enum: ModelId, by?: 'label' }
//        | { array: PropShape }
//        | { properties: Record<string, PropShape>, required?: string[] }
// =============================================================================

export type PropShape =
  | 'string' | 'number' | 'boolean'
  | string                             // PascalCase model ref
  | { format: 'date-time' }
  | { enum: string, by?: 'label' }
  | { array: PropShape }
  | { properties: Record<string, PropShape>, required?: string[] }

const PropShape: z.ZodType<PropShape> = z.lazy(() =>
  z.union([
    z.literal('string'),
    z.literal('number'),
    z.literal('boolean'),
    z.string(),                                                             // ModelId — distinguished from primitives by zod ordering
    z.object({ format: z.literal('date-time') }).strict(),
    z.object({ enum: z.string(), by: z.literal('label').optional() }).strict(),
    z.object({ array: PropShape }).strict(),
    z.object({
      properties: z.record(z.string(), PropShape),
      required: z.array(z.string()).optional()
    }).strict()
  ])
)

// =============================================================================
// Models (CLAUDE.md §5)
// =============================================================================

const ReferenceDataShape = z.union([
  z.string(),
  z.record(z.string(), PropShape)
])

const ReferenceDataValues = z.array(z.record(z.string(), z.unknown()))

const RegularModel = z.object({
  group: z.string(),
  required: z.array(z.string()).optional(),
  properties: z.record(z.string(), PropShape)
}).strict()

const ReferenceDataModel = z.object({
  group: z.string(),
  kind: z.literal('referenceData'),
  shape: ReferenceDataShape,
  values: ReferenceDataValues.optional(),
  fixture: z.string().optional(),
  compute: z.string().optional()
}).strict().refine(
  m => Number(m.values != null) + Number(m.fixture != null) + Number(m.compute != null) === 1,
  { message: 'referenceData model must have exactly one of values / fixture / compute' }
)

export const ModelDef = z.union([RegularModel, ReferenceDataModel])
export type ModelDef = z.infer<typeof ModelDef>

// =============================================================================
// Rules (CLAUDE.md §6.5)
// =============================================================================

const FieldValidateRule = z.object({
  field: z.string(),
  required: z.boolean().optional(),
  requiredWhen: z.string().optional(),
  min: z.union([z.number(), z.string()]).optional(),
  max: z.union([z.number(), z.string()]).optional(),
  maxSize: z.union([z.number(), z.string()]).optional(),
  messageType: z.enum(['error', 'warning']).optional(),
  message: z.string(),
  equalsLabelOf: z.string().optional(),                                     // cross-field equality (e.g. stateName equals label of state)
  source: z.string().optional()                                             // referenceData source for equalsLabelOf
}).strict()

const ResolveRule = z.union([
  z.object({
    when: z.string(),
    status: StatusName,
    reason: z.string().optional()
  }).strict(),
  z.object({
    else: z.literal(true),
    status: StatusName,
    reason: z.string().optional()
  }).strict()
])

const ValidateBlock = z.union([HookFlag, z.object({ rules: z.array(FieldValidateRule) }).strict()])
const ResolveBlock = z.union([HookFlag, z.object({ rules: z.array(ResolveRule) }).strict()])

// =============================================================================
// UI binding (CLAUDE.md §8) — Shapes A/B/C/D
// =============================================================================

// A FieldEntry is a single-key object like { FieldRadio: { path, ... } }.
// Properties pass through to the carbon-svelte component verbatim.
const FieldEntry = z.record(z.string(), z.record(z.string(), z.unknown()))
  .refine(o => Object.keys(o).length === 1, { message: 'fields entry must have exactly one key (the component name)' })

const WrapDef = z.union([
  z.object({ template: z.string(), props: z.record(z.string(), z.unknown()).optional() }).strict(),
  z.object({ component: z.string(), import: z.string().optional(), props: z.record(z.string(), z.unknown()).optional() }).strict()
])

// Shape A — field shorthand (form / configure)
const ShapeA = z.object({
  fields: z.array(FieldEntry),
  wrap: WrapDef.optional()
}).strict()

// Shape B — template reference (form / display / configure)
const ShapeB = z.object({
  template: z.string(),
  props: z.record(z.string(), z.unknown()).optional()
}).strict()

// Shape D — escape hatch (form / display / configure)
const ShapeD = z.object({
  component: z.string(),
  import: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional()
}).strict()

// Shape C — declarative display only
type CaseBranch = z.infer<typeof CaseBranchInternal>
const CaseBranchInternal = z.union([
  z.object({ when: z.string(), text: z.string() }).strict(),
  z.object({ when: z.string(), template: z.string(), props: z.record(z.string(), z.unknown()).optional() }).strict(),
  z.object({ else: z.literal(true), text: z.string() }).strict(),
  z.object({ else: z.literal(true), template: z.string(), props: z.record(z.string(), z.unknown()).optional() }).strict()
])

const ShapeCText = z.object({ text: z.string() }).strict()
const ShapeCCases = z.object({ cases: z.array(CaseBranchInternal) }).strict()

const FormSlot = z.union([ShapeA, ShapeB, ShapeD])
const DisplaySlot = z.union([ShapeB, ShapeCText, ShapeCCases, ShapeD])
const ConfigureSlot = z.union([ShapeA, ShapeB, ShapeD])

const PromptUI = z.object({
  form: FormSlot.optional(),
  display: DisplaySlot.optional(),
  configure: ConfigureSlot.optional()
}).strict()

const RequirementUI = z.object({
  configure: ConfigureSlot.optional()
}).strict()

// =============================================================================
// Indexes / Tags
// =============================================================================

const ExtractMap = z.object({
  map: z.string(),
  true: z.union([z.string(), z.boolean()]).optional(),
  false: z.union([z.string(), z.boolean()]).optional()
}).strict()

const IndexDef = z.object({
  category: z.string(),
  extract: z.union([z.string(), ExtractMap]),
  labels: z.record(z.string(), z.string()).optional(),
  useInAppRequestList: z.number().optional(),
  useInListFilters: z.number().optional(),
  useInReviewerDashboard: z.number().optional()
}).strict()

const TagDef = z.object({
  category: z.string(),
  categoryLabel: z.string().optional(),
  description: z.string().optional(),
  extract: z.string(),                                                      // expression-string form
  source: z.string().optional(),                                            // referenceData id for getTags + getLabel
  useInAppRequestList: z.number().optional(),
  useInListFilters: z.number().optional(),
  useInReviewerDashboard: z.number().optional()
}).strict()

// =============================================================================
// Configuration block (shared by prompts and requirements)
// =============================================================================

const ConfigDef = z.object({
  model: z.string(),
  default: z.unknown().optional(),
  fetch: HookFlag.optional(),
  preProcessData: HookFlag.optional(),
  validate: ValidateBlock.optional(),
  ui: z.object({ configure: ConfigureSlot.optional() }).strict().optional()
}).strict()

// =============================================================================
// Invalidates / revalidates
// =============================================================================

const InvalidateTarget = z.union([
  z.string(),
  z.object({ promptId: z.string(), reason: z.string().optional() }).strict()
])

const InvalidatesBlock = z.union([
  z.literal('dynamic'),
  z.array(z.string()),
  z.object({
    whenAnyFalse: z.array(z.string()),
    targets: z.array(InvalidateTarget)
  }).strict()
])

const RevalidatesBlock = z.union([
  z.literal('dynamic'),
  z.array(z.string()),
  z.object({
    whenAllTrue: z.array(z.string()),
    targets: z.array(InvalidateTarget)
  }).strict()
])

// =============================================================================
// Prompts
// =============================================================================

const GatherConfig = z.record(z.string(), z.array(z.string()))

const PreloadBlock = z.union([
  HookFlag,
  z.object({ copyFrom: z.string(), fields: z.array(z.string()).optional() }).strict()
])

const FetchBlock = z.union([HookFlag, z.string()])                          // string = referenceData id

export const PromptDef = z.object({
  group: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  navTitle: z.string().optional(),
  model: z.string(),
  gatherConfig: GatherConfig.optional(),
  fetch: FetchBlock.optional(),
  preload: PreloadBlock.optional(),
  preProcessData: HookFlag.optional(),
  validate: ValidateBlock.optional(),
  preValidate: ValidateBlock.optional(),
  invalidates: InvalidatesBlock.optional(),
  revalidates: RevalidatesBlock.optional(),
  ui: PromptUI.optional(),
  indexes: z.array(IndexDef).optional(),
  tags: z.array(TagDef).optional(),
  configuration: ConfigDef.optional()
}).strict()
export type PromptDef = z.infer<typeof PromptDef>

// =============================================================================
// Requirements
// =============================================================================

export const RequirementDef = z.object({
  group: z.string().optional(),
  phase: PhaseName,
  title: z.string(),
  description: z.string().optional(),
  navTitle: z.string().optional(),
  prompts: z.array(z.string()),
  hidden: z.array(z.string()).optional(),
  anyOrder: z.array(z.string()).optional(),
  emits: z.array(StatusName).optional(),
  resolve: ResolveBlock,
  configuration: ConfigDef.optional(),
  ui: RequirementUI.optional()
}).strict()
export type RequirementDef = z.infer<typeof RequirementDef>

// =============================================================================
// Programs
// =============================================================================

const WorkflowStageDef = z.object({
  title: z.string().optional(),
  blocking: z.boolean().optional(),
  requirements: z.array(z.string())
}).strict()

export const ProgramDef = z.object({
  title: z.string(),
  navTitle: z.string().optional(),
  icon: z.string().optional(),
  requirements: z.array(z.string()),
  workflow: z.record(z.string(), WorkflowStageDef).optional()
}).strict()
export type ProgramDef = z.infer<typeof ProgramDef>

// =============================================================================
// Project block
// =============================================================================

// project.ui keys are forwarded verbatim into UIConfig (see CLAUDE.md §10
// step 6). We accept any string-keyed value here; the validator separately
// checks that keys match the real UIConfig field names.
const ProjectUI = z.record(z.string(), z.unknown())

const ProjectDef = z.object({
  id: z.string(),
  name: z.string(),
  multipleRequestsPerPeriod: z.boolean().optional(),
  ui: ProjectUI.optional()
}).strict()

// =============================================================================
// Top-level Spec
// =============================================================================

export const Spec = z.object({
  specVersion: z.number(),
  project: ProjectDef,
  models: z.record(z.string(), ModelDef),
  prompts: z.record(z.string(), PromptDef),
  requirements: z.record(z.string(), RequirementDef),
  programs: z.record(z.string(), ProgramDef)
}).strict()
export type Spec = z.infer<typeof Spec>
