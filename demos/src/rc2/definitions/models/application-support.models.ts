import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'

export const AttentionToDetailApplicantPromptSchema = {
  type: 'object',
  properties: { detailed: { type: 'string' } },
  additionalProperties: false,
  required: ['detailed']
} as const satisfies SchemaObject
export type AttentionToDetailApplicantPromptData = FromSchema<
  typeof AttentionToDetailApplicantPromptSchema
>

export const AttentionToDetailReviewerPromptSchema = {
  type: 'object',
  properties: { isDetailed: { type: 'boolean' } },
  additionalProperties: false,
  required: ['isDetailed']
} as const satisfies SchemaObject
export type AttentionToDetailReviewerPromptData = FromSchema<
  typeof AttentionToDetailReviewerPromptSchema
>

export const ProcessAdherenceApplicantPromptSchema = {
  type: 'object',
  properties: { adherence: { type: 'string' } },
  additionalProperties: false,
  required: ['adherence']
} as const satisfies SchemaObject
export type ProcessAdherenceApplicantPromptData = FromSchema<
  typeof ProcessAdherenceApplicantPromptSchema
>

export const ProcessAdherenceReviewerPromptSchema = {
  type: 'object',
  properties: { isAttentive: { type: 'boolean' } },
  additionalProperties: false,
  required: ['isAttentive']
} as const satisfies SchemaObject
export type ProcessAdherenceReviewerPromptData = FromSchema<
  typeof ProcessAdherenceReviewerPromptSchema
>

export const WrittenCommunicationApplicantPromptSchema = {
  type: 'object',
  properties: { instructions: { type: 'string' } },
  additionalProperties: false,
  required: ['instructions']
} as const satisfies SchemaObject
export type WrittenCommunicationApplicantPromptData = FromSchema<
  typeof WrittenCommunicationApplicantPromptSchema
>

export const WrittenCommunicationReviewerPromptSchema = {
  type: 'object',
  properties: { isWellDefined: { type: 'boolean' } },
  additionalProperties: false,
  required: ['isWellDefined']
} as const satisfies SchemaObject
export type WrittenCommunicationReviewerPromptData = FromSchema<
  typeof WrittenCommunicationReviewerPromptSchema
>
