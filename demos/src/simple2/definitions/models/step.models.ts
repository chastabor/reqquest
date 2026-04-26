import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'

export const Step1PostResidencePromptSchema = {
  type: 'object',
  properties: { allow: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type Step1PostResidencePromptData = FromSchema<typeof Step1PostResidencePromptSchema>

export const Step2PostResidencePromptSchema = {
  type: 'object',
  properties: { allow: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type Step2PostResidencePromptData = FromSchema<typeof Step2PostResidencePromptSchema>

export const Step3PostResidencePromptSchema = {
  type: 'object',
  properties: { allow: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type Step3PostResidencePromptData = FromSchema<typeof Step3PostResidencePromptSchema>

export const ThanksOrNoThanksPromptSchema = {
  type: 'object',
  properties: { thanks: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type ThanksOrNoThanksPromptData = FromSchema<typeof ThanksOrNoThanksPromptSchema>

export const IDValuesPromptSchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    dodidValue: { type: 'string' },
    ssnValue: { type: 'string' }
  },
  additionalProperties: false
} as const satisfies SchemaObject
export type IDValuesPromptData = FromSchema<typeof IDValuesPromptSchema>

export const IDValuesExtraDataPromptSchema = {
  type: 'object',
  properties: { allow: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type IDValuesExtraDataPromptData = FromSchema<typeof IDValuesExtraDataPromptSchema>

export const SSNValuePromptSchema = {
  type: 'object',
  properties: { value: { type: 'string' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type SSNValuePromptData = FromSchema<typeof SSNValuePromptSchema>
