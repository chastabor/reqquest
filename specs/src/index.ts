export { parseSpec, parseSpecFromString, SpecParseError } from './spec/parse.js'
export { loadFixture, FixtureLoadError } from './spec/fixtures.js'
export { resolveSpec, SpecResolveError } from './ir/resolve.js'
export { validateSpec, SpecValidationError } from './validate/index.js'
export type { Spec, Status } from './spec/schema.js'
export type {
  ResolvedSpec,
  ResolvedModel,
  ResolvedRegularModel,
  ResolvedReferenceDataModel,
  ResolvedPrompt,
  ResolvedRequirement,
  ResolvedProgram
} from './ir/types.js'
