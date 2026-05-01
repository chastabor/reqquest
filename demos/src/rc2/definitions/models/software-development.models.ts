import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'
import { UploadInfoSchema } from './common.models.js'

export const LogicalThinkingApplicantPromptSchema = {
  type: 'object',
  properties: { solution: { type: 'string' }, documentation: UploadInfoSchema },
  additionalProperties: false,
  required: ['solution']
} as const satisfies SchemaObject
export type LogicalThinkingApplicantPromptData = FromSchema<
  typeof LogicalThinkingApplicantPromptSchema
>

export const LogicalThinkingReviewerPromptSchema = {
  type: 'object',
  properties: { scored: { type: 'number' }, explanation: { type: 'string' } },
  additionalProperties: false,
  required: ['scored']
} as const satisfies SchemaObject
export type LogicalThinkingReviewerPromptData = FromSchema<
  typeof LogicalThinkingReviewerPromptSchema
>

export const InterestInBuildingApplicantPromptSchema = {
  type: 'object',
  properties: { isContributed: { type: 'boolean' }, recap: { type: 'string' } },
  additionalProperties: false,
  required: ['isContributed']
} as const satisfies SchemaObject
export type InterestInBuildingApplicantPromptData = FromSchema<
  typeof InterestInBuildingApplicantPromptSchema
>

export const InterestInBuildingReviewerPromptSchema = {
  type: 'object',
  properties: { isInterested: { type: 'boolean' }, explanation: { type: 'string' } },
  additionalProperties: false,
  required: ['isInterested']
} as const satisfies SchemaObject
export type InterestInBuildingReviewerPromptData = FromSchema<
  typeof InterestInBuildingReviewerPromptSchema
>

export const CreativeProblemSolvingApplicantPromptSchema = {
  type: 'object',
  properties: { issueAndSolution: { type: 'string' } },
  additionalProperties: false,
  required: ['issueAndSolution']
} as const satisfies SchemaObject
export type CreativeProblemSolvingApplicantPromptData = FromSchema<
  typeof CreativeProblemSolvingApplicantPromptSchema
>

export const CreativeProblemSolvingReviewerPromptSchema = {
  type: 'object',
  properties: { isIssueReal: { type: 'boolean' }, isSolutionFeasible: { type: 'boolean' } },
  additionalProperties: false,
  required: ['issueReal', 'solutionFeasible']
} as const satisfies SchemaObject
export type CreativeProblemSolvingReviewerPromptData = FromSchema<
  typeof CreativeProblemSolvingReviewerPromptSchema
>
