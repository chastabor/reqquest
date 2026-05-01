import type { AvailableHoursPerWeekConfigData, GPAConfigData } from '../models/common.models.js'
import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const minimumGPAReq: RequirementDefinition<GPAConfigData> = {
  type: RequirementType.PREQUAL,
  key: 'minimum_gpa_req',
  title: 'Minimum GPA',
  navTitle: 'Min GPA',
  description: 'Minumum GPA to qualify for specific Programs.',
  promptKeys: ['minimum_gpa_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.minimum_gpa_prompt?.gpa == null) return { status: RequirementStatus.PENDING }
    if (data.minimum_gpa_prompt?.gpa >= config.minGPA) return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.DISQUALIFYING,
      reason: `You must have a minimum GPA of ${config.minGPA} to qualify.`
    }
  },
  configuration: {
    default: { minGPA: 3 },
    validate: data => {
      const messages: MutationMessage[] = []
      if (data.minGPA == null)
        messages.push({
          type: MutationMessageType.error,
          arg: 'minGPA',
          message: 'Please enter minimum GPA to be met.'
        })
      if (data.minGPA != null && data.minGPA < 0)
        messages.push({
          type: MutationMessageType.error,
          arg: 'minGPA',
          message: 'Please enter a valid minimum GPA.'
        })
      return messages
    }
  }
}

export const availableHoursPerWeekReq: RequirementDefinition<AvailableHoursPerWeekConfigData> = {
  type: RequirementType.PREQUAL,
  key: 'available_hours_per_week_req',
  title: 'Available Hours/Week',
  navTitle: 'Avail Hrs/Wk',
  description: 'Applicant must be available between a range of hours per week.',
  promptKeys: ['available_hours_per_week_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.available_hours_per_week_prompt?.minHours == null)
      return { status: RequirementStatus.PENDING }
    if (data.available_hours_per_week_prompt?.minHours <= config.minHours)
      return {
        status: RequirementStatus.DISQUALIFYING,
        reason: `You must be available between ${config.minHours} and ${config.maxHours} hours to qualify.`
      }
    if (data.available_hours_per_week_prompt?.maxHours == null)
      return { status: RequirementStatus.PENDING }
    if (data.available_hours_per_week_prompt?.maxHours >= config.maxHours)
      return {
        status: RequirementStatus.DISQUALIFYING,
        reason: `You must be available from ${config.minHours} and ${config.maxHours} hours to qualify.`
      }
    return { status: RequirementStatus.MET }
  },
  configuration: {
    default: { minHours: 5, maxHours: 10 },
    validate: data => {
      const messages: MutationMessage[] = []
      if (data.minHours == null)
        messages.push({
          type: MutationMessageType.error,
          arg: 'minHours',
          message: 'Please enter minimum Hours to be available.'
        })
      if (data.minHours != null && data.minHours < 0)
        messages.push({
          type: MutationMessageType.error,
          arg: 'minHours',
          message: 'Please enter a valid minimum number of Hours.'
        })
      if (data.maxHours == null)
        messages.push({
          type: MutationMessageType.error,
          arg: 'maxHours',
          message: 'Please enter maximum Hours to be avaialbe.'
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
}

export const participationAcknowledgementReq: RequirementDefinition = {
  type: RequirementType.PREQUAL,
  key: 'participation_acknowledgement_req',
  title: 'Acknowledgement of participation expectations',
  navTitle: 'Acknowledgment',
  description: 'Acknowledgment of the expectation of participation.',
  promptKeys: ['participation_acknowledgement_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.participation_acknowledgement_prompt?.acknowledged == null)
      return { status: RequirementStatus.PENDING }
    if (data.participation_acknowledgement_prompt?.acknowledged)
      return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.DISQUALIFYING,
      reason: 'You must acknowledge the expectation of your participation to qualify.'
    }
  }
}

export const recommendationLetterApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'recommendation_letter_applicant_req',
  title: 'Recommendation Letter',
  navTitle: 'Letter',
  description: 'Provide a recommendation letter from a past or current TXST professor.',
  promptKeys: ['recommendation_letter_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.recommendation_letter_applicant_prompt?.letter != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const recommendationLetterReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'recommendation_letter_reviewer_req',
  title: 'Assess Recommendation Letter',
  description: 'Rate the strength of the recommendation',
  promptKeys: ['recommendation_letter_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.recommendation_letter_reviewer_prompt?.letter.rating != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}
