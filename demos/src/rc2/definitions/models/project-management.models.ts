import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'

export const OrganizationApplicantPromptSchema = {
  type: 'object',
  properties: { orchestration: { type: 'string' } },
  additionalProperties: false,
  required: ['orchestration']
} as const satisfies SchemaObject
export type OrganizationApplicantPromptData = FromSchema<typeof OrganizationApplicantPromptSchema>

export const OrganizationReviewerPromptSchema = {
  type: 'object',
  properties: { isOrchestrated: { type: 'boolean' } },
  additionalProperties: false,
  required: ['isOrchestrated']
} as const satisfies SchemaObject
export type OrganizationReviewerPromptData = FromSchema<typeof OrganizationReviewerPromptSchema>

export const CommunicationApplicantPromptSchema = {
  type: 'object',
  properties: { arbitration: { type: 'string' } },
  additionalProperties: false,
  required: ['arbitration']
} as const satisfies SchemaObject
export type CommunicationApplicantPromptData = FromSchema<typeof CommunicationApplicantPromptSchema>

export const CommunicationReviewerPromptSchema = {
  type: 'object',
  properties: { isArbitor: { type: 'boolean' } },
  additionalProperties: false,
  required: ['isArbitor']
} as const satisfies SchemaObject
export type CommunicationReviewerPromptData = FromSchema<typeof CommunicationReviewerPromptSchema>

export const AttentionToDetailAssessmentReviewerPromptSchema = {
  type: 'object',
  properties: { isCompliant: { type: 'boolean' }, isProofread: { type: 'boolean' } },
  additionalProperties: false,
  required: ['isCompliant', 'isProofread']
} as const satisfies SchemaObject
export type AttentionToDetailAssessmentReviewerPromptData = FromSchema<
  typeof AttentionToDetailAssessmentReviewerPromptSchema
>
