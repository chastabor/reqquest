import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'

export const ExercisePromptSchema = {
  type: 'object',
  properties: { exerciseHours: { type: 'number' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type ExercisePromptData = FromSchema<typeof ExercisePromptSchema>

export const ExerciseConfigSchema = {
  type: 'object',
  properties: { minExerciseHours: { type: 'number' } },
  additionalProperties: false,
  required: ['minExerciseHours']
} as const satisfies SchemaObject
export type ExerciseConfigData = FromSchema<typeof ExerciseConfigSchema>
