import { describe, expect, it } from 'vitest'
import {
  toSnakeCase, modelSymbols,
  modelFilePath, promptFilePath, requirementFilePath, programsFilePath,
  bootstrapFilePath, uiComponentDir, uiRegistryFilePath
} from '../../src/ir/derive.js'

describe('toSnakeCase', () => {
  // Cases from CLAUDE.md §3.
  it('converts camelCase', () => {
    expect(toSnakeCase('stateResidencePrompt')).toBe('state_residence_prompt')
    expect(toSnakeCase('stateResidencePrequalReq')).toBe('state_residence_prequal_req')
  })

  it('converts PascalCase', () => {
    expect(toSnakeCase('StateResidencePrompt')).toBe('state_residence_prompt')
  })

  it('handles consecutive caps', () => {
    expect(toSnakeCase('IDValuesPrompt')).toBe('id_values_prompt')
  })

  it('preserves single-word lumps', () => {
    expect(toSnakeCase('petowner')).toBe('petowner')
  })

  it('splits single-letter words', () => {
    expect(toSnakeCase('adoptADogProgram')).toBe('adopt_a_dog_program')
  })

  it('handles long compound ids', () => {
    expect(toSnakeCase('approveReviewerExerciseExemptionAdoptADogWorkflow'))
      .toBe('approve_reviewer_exercise_exemption_adopt_a_dog_workflow')
  })
})

describe('modelSymbols', () => {
  it('appends Schema and Data', () => {
    expect(modelSymbols('StateResidencePrompt')).toEqual({
      schemaConst: 'StateResidencePromptSchema',
      dataType: 'StateResidencePromptData'
    })
  })
})

describe('file path derivation', () => {
  it('routes by group', () => {
    expect(modelFilePath('default2', 'state'))
      .toBe('demos/src/default2/definitions/models/state.models.ts')
    expect(promptFilePath('default2', 'cat'))
      .toBe('demos/src/default2/definitions/prompts/cat.prompts.ts')
    expect(requirementFilePath('default2', 'yard'))
      .toBe('demos/src/default2/definitions/requirements/yard.requirements.ts')
  })

  it('places top-level files under the project root', () => {
    expect(programsFilePath('default2')).toBe('demos/src/default2/definitions/programs.ts')
    expect(bootstrapFilePath('default2')).toBe('demos/src/default2/index.ts')
    expect(uiRegistryFilePath('default2')).toBe('ui/src/local/default2/uiRegistry.ts')
  })

  it('places UI components under group dirs', () => {
    expect(uiComponentDir('default2', 'cat')).toBe('ui/src/local/default2/cat')
  })
})
