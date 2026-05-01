import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'
import { ratingLevels5 } from './common.models.js'

export const AbilityToAutomateTasksApplicantPromptSchema = {
  type: 'object',
  properties: { isAutomated: { type: 'boolean' }, descriptionOfAutomation: { type: 'string' } },
  additionalProperties: false,
  required: ['isAutomated']
} as const satisfies SchemaObject
export type AbilityToAutomateTasksApplicantPromptData = FromSchema<
  typeof AbilityToAutomateTasksApplicantPromptSchema
>

export const AbilityToAutomateTasksReviewerPromptSchema = {
  type: 'object',
  properties: { isSuited: { type: 'boolean' }, comment: { type: 'string' } },
  additionalProperties: false,
  required: ['isSuited']
} as const satisfies SchemaObject
export type AbilityToAutomateTasksReviewerPromptData = FromSchema<
  typeof AbilityToAutomateTasksReviewerPromptSchema
>

export const FutureCareerInterestApplicantPromptSchema = {
  type: 'object',
  properties: { interests: { type: 'string' } },
  additionalProperties: false,
  required: ['interests']
} as const satisfies SchemaObject
export type FutureCareerInterestApplicantPromptData = FromSchema<
  typeof FutureCareerInterestApplicantPromptSchema
>

export const FutureCareerInterestReviewerPromptSchema = {
  type: 'object',
  properties: {
    rating: { type: 'string', enum: ratingLevels5.map(s => s.value) },
    ratingName: { type: 'string', enum: ratingLevels5.map(s => s.label) }
  },
  additionalProperties: false
} as const satisfies SchemaObject
export type FutureCareerInterestReviewerPromptData = FromSchema<
  typeof FutureCareerInterestReviewerPromptSchema
>
