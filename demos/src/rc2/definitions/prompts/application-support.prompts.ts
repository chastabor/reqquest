import {
  AttentionToDetailApplicantPromptSchema,
  AttentionToDetailReviewerPromptSchema,
  ProcessAdherenceApplicantPromptSchema,
  ProcessAdherenceReviewerPromptSchema,
  WrittenCommunicationApplicantPromptSchema,
  WrittenCommunicationReviewerPromptSchema
} from '../models/application-support.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const attentionToDetailApplicantPrompt: PromptDefinition = {
  key: 'attention_to_detail_applicant_prompt',
  title: 'Attention To Detail',
  description: 'Describe a time you had to check something carefully for mistakes or accuracy.\n',
  schema: AttentionToDetailApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.detailed == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'detailed',
        message: 'Please fill out prompt.'
      })
    return messages
  }
}

export const attentionToDetailReviewerPrompt: PromptDefinition = {
  key: 'attention_to_detail_reviewer_prompt',
  title: 'Review Applicant Attention To Detail',
  description: 'Does the applicant demonstrate attention to detail?',
  schema: AttentionToDetailReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isDetailed == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isDetailed',
        message: 'Please review applicant response.'
      })
    return messages
  }
}

export const processAdherenceApplicantPrompt: PromptDefinition = {
  key: 'process_adherence_applicant_prompt',
  title: 'Process Adherence',
  description: 'Describe a time you had to follow detailed instructions to complete a task.\n',
  schema: ProcessAdherenceApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.adherence == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'adherence',
        message: 'Please fill out prompt.'
      })
    return messages
  }
}

export const processAdherenceReviewerPrompt: PromptDefinition = {
  key: 'process_adherence_reviewer_prompt',
  title: 'Review Applicant Process Adherence',
  description: 'Can the applicant follow and validate a process?',
  schema: ProcessAdherenceReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isAttentive == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isAttentive',
        message: 'Please review applicant response.'
      })
    return messages
  }
}

export const writtenCommunicationApplicantPrompt: PromptDefinition = {
  key: 'written_communication_applicant_prompt',
  title: 'Written Communication',
  description:
    'Write a short set of instructions explaining how to complete complete a simple task (e.g., submit an assignment, reset a password).\n',
  schema: WrittenCommunicationApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.instructions == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'instructions',
        message: 'Please fill out prompt.'
      })
    return messages
  }
}

export const writtenCommunicationReviewerPrompt: PromptDefinition = {
  key: 'written_communication_reviewer_prompt',
  title: 'Review Applicant Written Communication',
  description: "Is the applicant's writing clear and easy to follow?",
  schema: WrittenCommunicationReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isWellDefined == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isWellDefined',
        message: 'Please review applicant response.'
      })
    return messages
  }
}
