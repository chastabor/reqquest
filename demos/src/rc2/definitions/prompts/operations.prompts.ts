import { ratingLevels5 } from '../models/common.models.js'
import {
  AbilityToAutomateTasksApplicantPromptSchema,
  AbilityToAutomateTasksReviewerPromptSchema,
  FutureCareerInterestApplicantPromptSchema,
  FutureCareerInterestReviewerPromptSchema
} from '../models/operations.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const abilityToAutomateTasksApplicantPrompt: PromptDefinition = {
  key: 'ability_to_automate_tasks_applicant_prompt',
  title: 'Ability to Automate Tasks',
  description: 'Describe your ability to automate manual, repetitive tasks.',
  schema: AbilityToAutomateTasksApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isAutomated == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isAutomated',
        message: 'Please choose an option.'
      })
    return messages
  }
}

export const abilityToAutomateTasksReviewerPrompt: PromptDefinition = {
  key: 'ability_to_automate_tasks_reviewer_prompt',
  title: 'Review Ability to Automate Tasks',
  description: 'Applicant must have the ability to automate manual, repetitive tasks.',
  schema: AbilityToAutomateTasksReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isSuited == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isSuited',
        message: 'Please review approval of automation.'
      })
    return messages
  }
}

export const futureCareerInterestApplicantPrompt: PromptDefinition = {
  key: 'future_career_interest_applicant_prompt',
  title: 'Future Interest',
  description: 'Must have a future interest in having a career in dev/ops.',
  schema: FutureCareerInterestApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.interests == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'interests',
        message: 'Please describe your future dev/ops career interests.'
      })
    return messages
  }
}

export const futureCareerInterestReviewerPrompt: PromptDefinition = {
  key: 'future_career_interest_reviewer_prompt',
  title: 'Rate applicants career interests',
  description: 'Rate the applicants future dev/ops career interests.',
  schema: FutureCareerInterestReviewerPromptSchema,
  fetch: async () => ({ ratingLevels5 }),
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.rating == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'rating',
        message: 'Score the free text response.'
      })
    if (
      data.ratingName != null &&
      data.ratingName !== ratingLevels5.find(s => s.value === data.rating)?.label
    )
      messages.push({
        type: MutationMessageType.error,
        arg: 'ratingName',
        message: 'Rating level does not match rating entry.'
      })
    return messages
  }
}
