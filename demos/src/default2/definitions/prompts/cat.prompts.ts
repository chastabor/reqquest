import { otherCatsVaccinesPromptPreProcessData } from '../logic/cat.logic.js'
import {
  ApplicantSeemsNicePromptSchema,
  CatTowerPromptSchema,
  OtherCatsPromptSchema,
  OtherCatsVaccinesPromptSchema,
  TunaAllergyPromptSchema,
  VaccineReviewPromptSchema
} from '../models/cat.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const haveACatTowerPrompt: PromptDefinition = {
  key: 'have_a_cat_tower_prompt',
  title: 'Cat Owner Equipment',
  description: 'Applicants will indicate whether they own a cat tower or will purchase one.\n',
  schema: CatTowerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.haveCatTower == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'haveCatTower',
        message: 'Please indicate whether you have a cat tower.'
      })
    if (data.haveCatTower === false && data.willPurchaseCatTower == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'willPurchaseCatTower',
        message: 'Please indicate whether you will purchase a cat tower.'
      })
    return messages
  }
}

export const notAllergicToTunaPrompt: PromptDefinition = {
  key: 'not_allergic_to_tuna_prompt',
  title: 'Tuna Allergy',
  description: 'Applicants will indicate whether they are allergic to tuna.',
  schema: TunaAllergyPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.allergicToTuna == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'allergicToTuna',
        message: 'Please indicate whether you are allergic to tuna.'
      })
    return messages
  }
}

export const applicantSeemsNicePrompt: PromptDefinition = {
  key: 'applicant_seems_nice_prompt',
  title: "Assess Applicant's Niceness",
  description: 'Reviewer will indicate whether the applicant seems nice.',
  navTitle: 'Niceness',
  schema: ApplicantSeemsNicePromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.seemsNice == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'seemsNice',
        message: 'Please indicate whether the applicant seems nice.'
      })
    return messages
  },
  indexes: [
    {
      category: 'nice',
      extract: (data: any) =>
        data.applicant_seems_nice_prompt?.seemsNice === true
          ? ['yes']
          : data.applicant_seems_nice_prompt?.seemsNice === false
            ? ['no']
            : [],
      getLabel: (tag: string) => (({ yes: 'Yes', no: 'No' }) as Record<string, string>)[tag],
      useInAppRequestList: 1,
      useInListFilters: 1
    }
  ]
}

export const otherCatsPrompt: PromptDefinition = {
  key: 'other_cats_prompt',
  title: 'Do you have other cats?',
  description: 'Applicants will indicate whether they have other cats in the household.\n',
  schema: OtherCatsPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.hasOtherCats == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'hasOtherCats',
        message: 'Please indicate whether you have other cats.'
      })
    return messages
  }
}

export const otherCatsVaccinesPrompt: PromptDefinition = {
  key: 'other_cats_vaccines_prompt',
  title: 'Other Cats Vaccination Records',
  description: 'Upload vaccination records for other cats in the household.',
  schema: OtherCatsVaccinesPromptSchema,
  preProcessData: otherCatsVaccinesPromptPreProcessData,
  preValidate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.distemperDoc?.size != null && data.distemperDoc.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'distemperDoc',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    if (data.rabiesDoc?.size != null && data.rabiesDoc.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'rabiesDoc',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    if (data.felineLeukemiaDoc?.size != null && data.felineLeukemiaDoc.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'felineLeukemiaDoc',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    if (data.felineHIVDoc?.size != null && data.felineHIVDoc.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'felineHIVDoc',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    return messages
  },
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.distemperDoc == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'distemperDoc',
        message: 'Please upload distemper vaccination record.'
      })
    if (data.rabiesDoc == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'rabiesDoc',
        message: 'Please upload rabies vaccination record.'
      })
    if (data.felineLeukemiaDoc == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'felineLeukemiaDoc',
        message: 'Please upload feline leukemia vaccination record.'
      })
    if (data.felineHIVDoc == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'felineHIVDoc',
        message: 'Please upload feline HIV vaccination record.'
      })
    return messages
  }
}

export const vaccineReviewPrompt: PromptDefinition = {
  key: 'vaccine_review_prompt',
  title: 'Vaccine Review',
  description: "Review the vaccination records for the applicant's cats.",
  schema: VaccineReviewPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.distemper == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'distemper',
        message: 'Please review distemper vaccination record.'
      })
    if (data.rabies == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'rabies',
        message: 'Please review rabies vaccination record.'
      })
    if (data.felineLeukemia == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'felineLeukemia',
        message: 'Please review feline leukemia vaccination record.'
      })
    if (data.felineHIV == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'felineHIV',
        message: 'Please review feline HIV vaccination record.'
      })
    return messages
  },
  invalidUponChange: (data, config, appRequestData, allPeriodConfig) =>
    data?.distemper?.satisfactory === false ||
    data?.rabies?.satisfactory === false ||
    data?.felineLeukemia?.satisfactory === false ||
    data?.felineHIV?.satisfactory === false
      ? [
          {
            promptKey: otherCatsVaccinesPrompt.key,
            reason: 'One or more vaccination documents are invalid. Please re-upload.'
          }
        ]
      : [],
  validUponChange: (data, config, appRequestData, allPeriodConfig) =>
    data?.distemper?.satisfactory === true &&
    data?.rabies?.satisfactory === true &&
    data?.felineLeukemia?.satisfactory === true &&
    data?.felineHIV?.satisfactory === true
      ? [otherCatsVaccinesPrompt.key]
      : []
}
