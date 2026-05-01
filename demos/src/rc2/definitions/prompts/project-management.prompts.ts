import {
  AttentionToDetailAssessmentReviewerPromptSchema,
  CommunicationApplicantPromptSchema,
  CommunicationReviewerPromptSchema,
  OrganizationApplicantPromptSchema,
  OrganizationReviewerPromptSchema
} from '../models/project-management.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const organizationApplicantPrompt: PromptDefinition = {
  key: 'organization_applicant_prompt',
  title: 'Organization',
  description:
    'Describe a time you had to organize tasks or coordinate something (school, event, group project, etc.).\n',
  schema: OrganizationApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.orchestration == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'orchestration',
        message: 'Please fill about organization/coordination tasks.'
      })
    return messages
  }
}

export const organizationReviewerPrompt: PromptDefinition = {
  key: 'organization_reviewer_prompt',
  title: 'Organization Review',
  description: 'Does the applicant demonstrate organization and task management?',
  schema: OrganizationReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isOrchestrated == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isOrchestrated',
        message: 'Please choose an option.'
      })
    return messages
  }
}

export const communicationApplicantPrompt: PromptDefinition = {
  key: 'communication_applicant_prompt',
  title: 'Communication',
  description:
    "You are leading a group project. One teammate is doing all the work, and another hasn't responded to texts in three days. How do you handle this scenario?\n",
  schema: CommunicationApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.arbitration == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'arbitration',
        message: 'Please fill about organization/coordination tasks.'
      })
    return messages
  }
}

export const communicationReviewerPrompt: PromptDefinition = {
  key: 'communication_reviewer_prompt',
  title: 'Organization Review',
  description: 'Does applicant show able to facilitate conversations between team members?',
  schema: CommunicationReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isArbitor == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isArbitor',
        message: 'Please choose an option.'
      })
    return messages
  }
}

export const attentionToDetailAssessmentReviewerPrompt: PromptDefinition = {
  key: 'attention_to_detail_assessment_reviewer_prompt',
  title: 'Attention To Detail Assessment',
  description: 'Assess all applicant submitted answers and materials.',
  schema: AttentionToDetailAssessmentReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isCompliant == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isCompliant',
        message: 'Please choose an option.'
      })
    if (data.isProofread == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isProofread',
        message: 'Please choose an option.'
      })
    return messages
  }
}
