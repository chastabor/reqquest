import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'

export const GPAPromptSchema = {
  type: 'object',
  properties: { gpa: { type: 'number' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type GPAPromptData = FromSchema<typeof GPAPromptSchema>

export const GPAConfigSchema = {
  type: 'object',
  properties: { minGPA: { type: 'number' } },
  additionalProperties: false,
  required: ['minGPA']
} as const satisfies SchemaObject
export type GPAConfigData = FromSchema<typeof GPAConfigSchema>

export const AvailableHoursPerWeekPromptSchema = {
  type: 'object',
  properties: { minHours: { type: 'number' }, maxHours: { type: 'number' } },
  additionalProperties: false,
  required: ['minHours', 'maxHours']
} as const satisfies SchemaObject
export type AvailableHoursPerWeekPromptData = FromSchema<typeof AvailableHoursPerWeekPromptSchema>

export const AvailableHoursPerWeekConfigSchema = {
  type: 'object',
  properties: { minHours: { type: 'number' }, maxHours: { type: 'number' } },
  additionalProperties: false,
  required: ['minHours', 'maxHours']
} as const satisfies SchemaObject
export type AvailableHoursPerWeekConfigData = FromSchema<typeof AvailableHoursPerWeekConfigSchema>

export const ParticipationAcknowledgementPromptSchema = {
  type: 'object',
  properties: { acknowledged: { type: 'boolean' } },
  additionalProperties: false,
  required: ['acknowledged']
} as const satisfies SchemaObject
export type ParticipationAcknowledgementPromptData = FromSchema<
  typeof ParticipationAcknowledgementPromptSchema
>

// Inlined from specs/resources/data/rating_levels_5.yml (spec: RatingLevels5.fixture).
export const ratingLevels5 = [
  { value: '1', label: 'Unacceptable' },
  { value: '2', label: 'Poor' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Good' },
  { value: '5', label: 'Excellent' }
] as const

export const UploadInfoSchema = {
  type: 'object',
  properties: {
    _type: { type: 'string' },
    multipartIndex: { type: 'number' },
    name: { type: 'string' },
    mime: { type: 'string' },
    size: { type: 'number' },
    shasum: { type: 'string' }
  },
  additionalProperties: false,
  required: ['_type', 'multipartIndex', 'name', 'mime', 'size']
} as const satisfies SchemaObject
export type UploadInfoData = FromSchema<typeof UploadInfoSchema>

export const RecommendationLetterApplicantPromptSchema = {
  type: 'object',
  properties: { letter: UploadInfoSchema },
  additionalProperties: false
} as const satisfies SchemaObject
export type RecommendationLetterApplicantPromptData = FromSchema<
  typeof RecommendationLetterApplicantPromptSchema
>

export const RecommendationLetterReviewerPromptSchema = {
  type: 'object',
  properties: {
    letter: {
      type: 'object',
      properties: {
        rating: { type: 'string', enum: ratingLevels5.map(s => s.value) },
        ratingName: { type: 'string', enum: ratingLevels5.map(s => s.label) }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
} as const satisfies SchemaObject
export type RecommendationLetterReviewerPromptData = FromSchema<
  typeof RecommendationLetterReviewerPromptSchema
>
