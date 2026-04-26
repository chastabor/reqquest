import type { SchemaObject } from '@txstate-mws/fastify-shared'
import type { FromSchema } from 'json-schema-to-ts'

export const CatTowerPromptSchema = {
  type: 'object',
  properties: { haveCatTower: { type: 'boolean' }, willPurchaseCatTower: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type CatTowerPromptData = FromSchema<typeof CatTowerPromptSchema>

export const TunaAllergyPromptSchema = {
  type: 'object',
  properties: { allergicToTuna: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type TunaAllergyPromptData = FromSchema<typeof TunaAllergyPromptSchema>

export const ApplicantSeemsNicePromptSchema = {
  type: 'object',
  properties: { seemsNice: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type ApplicantSeemsNicePromptData = FromSchema<typeof ApplicantSeemsNicePromptSchema>

export const OtherCatsPromptSchema = {
  type: 'object',
  properties: { hasOtherCats: { type: 'boolean' } },
  additionalProperties: false
} as const satisfies SchemaObject
export type OtherCatsPromptData = FromSchema<typeof OtherCatsPromptSchema>

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

export const OtherCatsVaccinesPromptSchema = {
  type: 'object',
  properties: {
    distemperDoc: UploadInfoSchema,
    rabiesDoc: UploadInfoSchema,
    felineLeukemiaDoc: UploadInfoSchema,
    felineHIVDoc: UploadInfoSchema
  },
  additionalProperties: false
} as const satisfies SchemaObject
export type OtherCatsVaccinesPromptData = FromSchema<typeof OtherCatsVaccinesPromptSchema>

export const VaccineReviewPromptSchema = {
  type: 'object',
  properties: {
    distemper: {
      type: 'object',
      properties: { satisfactory: { type: 'boolean' } },
      additionalProperties: false
    },
    rabies: {
      type: 'object',
      properties: { satisfactory: { type: 'boolean' } },
      additionalProperties: false
    },
    felineLeukemia: {
      type: 'object',
      properties: { satisfactory: { type: 'boolean' } },
      additionalProperties: false
    },
    felineHIV: {
      type: 'object',
      properties: { satisfactory: { type: 'boolean' } },
      additionalProperties: false
    }
  },
  additionalProperties: false
} as const satisfies SchemaObject
export type VaccineReviewPromptData = FromSchema<typeof VaccineReviewPromptSchema>
