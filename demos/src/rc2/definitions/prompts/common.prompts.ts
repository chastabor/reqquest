import { recommendationLetterApplicantPromptPreProcessData } from '../logic/common.logic.js'
import {
  AvailableHoursPerWeekPromptSchema,
  GPAPromptSchema,
  ParticipationAcknowledgementPromptSchema,
  RecommendationLetterApplicantPromptSchema,
  RecommendationLetterReviewerPromptSchema,
  ratingLevels5
} from '../models/common.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const minimumGPAPrompt: PromptDefinition = {
  key: 'minimum_gpa_prompt',
  title: 'Minimum GPA',
  description: 'The minimum GPA that must be met for some programs.\n',
  schema: GPAPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.gpa == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'gpa',
        message: 'Please enter your current GPA.'
      })
    return messages
  }
}

export const availableHoursPerWeekPrompt: PromptDefinition = {
  key: 'available_hours_per_week_prompt',
  title: 'Available Hours Per Week',
  description: 'Available Hours per Week to participate in the program.\n',
  schema: AvailableHoursPerWeekPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.minHours == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'minHours',
        message: 'Please enter the minimum number of hours you are available per week.'
      })
    if (data.maxHours != null && data.maxHours < 0)
      messages.push({
        type: MutationMessageType.error,
        arg: 'maxHours',
        message: 'Please enter a valid minimum number of hours.'
      })
    if (data.maxHours == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'maxHours',
        message: 'Please enter the maximum number of hours you are available per week.'
      })
    if (data.maxHours != null && data.maxHours < data.minHours)
      messages.push({
        type: MutationMessageType.error,
        arg: 'maxHours',
        message:
          'Please enter a maximum number of Hours equal to or greater than minimum number of Hours.'
      })
    return messages
  }
}

export const participationAcknowledgementPrompt: PromptDefinition = {
  key: 'participation_acknowledgement_prompt',
  title: 'Acknowledgement of participation expectations',
  description: 'Please acknowledge the expectation of your participation.\n',
  schema: ParticipationAcknowledgementPromptSchema
}

export const recommendationLetterApplicantPrompt: PromptDefinition = {
  key: 'recommendation_letter_applicant_prompt',
  title: 'Recommendation Letter',
  description: 'Provide a recommendation letter from a past or current TXST professor.\n',
  schema: RecommendationLetterApplicantPromptSchema,
  preProcessData: recommendationLetterApplicantPromptPreProcessData,
  preValidate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.letter?.size != null && data.letter.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'letter',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    return messages
  },
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.letter == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'letter',
        message: 'Please upload your recommendation letter from faculty.'
      })
    return messages
  }
}

export const recommendationLetterReviewerPrompt: PromptDefinition = {
  key: 'recommendation_letter_reviewer_prompt',
  title: 'Recommendation Letter Review',
  description: 'Rate the strength of the faculty recommendation letter.',
  schema: RecommendationLetterReviewerPromptSchema,
  fetch: async () => ({ ratingLevels5 }),
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.letter?.rating == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'letter.rating',
        message: 'Please rate the faculty recommendation letter.'
      })
    if (
      data.letter?.ratingName != null &&
      data.letter?.ratingName !== ratingLevels5.find(s => s.value === data.letter?.rating)?.label
    )
      messages.push({
        type: MutationMessageType.error,
        arg: 'letter.ratingName',
        message: 'Rating level does not match rating entry.'
      })
    return messages
  }
}
