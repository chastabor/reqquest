import {
  IDValuesExtraDataPromptSchema,
  IDValuesPromptSchema,
  SSNValuePromptSchema,
  Step1PostResidencePromptSchema,
  Step2PostResidencePromptSchema,
  Step3PostResidencePromptSchema,
  ThanksOrNoThanksPromptSchema
} from '../models/step.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const step1PostResidencePrompt: PromptDefinition = {
  key: 'step1_post_residence_prompt',
  title: 'Accessible prompt 1 of 2, req 2',
  description:
    'Identifies whether requirement+prompts show post previous req that returns disqualifying.',
  schema: Step1PostResidencePromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.allow == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'allow',
        message: 'Please confirm if allowed to continue'
      })
    if (data.allow != null && [false].includes(data.allow))
      messages.push({
        type: MutationMessageType.error,
        message:
          'Validation type error creates hard ui flow stop, prevents continuing to next prompt'
      })
    return messages
  }
}

export const step2PostResidencePrompt: PromptDefinition = {
  key: 'step2_post_residence_prompt',
  title: 'Accessible prompt 2 of 2, req 2',
  description:
    'Identifies whether requirement+prompts show post previous req that returns disqualifying.',
  schema: Step2PostResidencePromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.allow == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'allow',
        message: 'Please confirm if allowed to continue'
      })
    if (data.allow != null && [false].includes(data.allow))
      messages.push({
        type: MutationMessageType.warning,
        message: 'Validation type warning does not stop UI flow to next prompt'
      })
    return messages
  }
}

export const step3PostResidencePrompt: PromptDefinition = {
  key: 'step3_post_residence_prompt',
  title: 'Accessible prompt 1 of 1, req 3',
  description:
    'Identifies whether requirement+prompts show post previous req that returns disqualifying.',
  schema: Step3PostResidencePromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.allow == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'allow',
        message: 'Please confirm if allowed to continue'
      })
    if (data.allow != null && [false].includes(data.allow))
      messages.push({
        type: MutationMessageType.warning,
        message: 'Validation type warning does not stop UI flow to next prompt'
      })
    return messages
  }
}

export const thanksOrNoThanksPrompt: PromptDefinition = {
  key: 'thanks_or_no_thanks_prompt',
  title: 'Thanks or no thanks',
  description: 'Simulate a prompt within a requirement that a user may not want.',
  schema: ThanksOrNoThanksPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.thanks == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'thanks',
        message: 'Please confirm thanks or no thanks'
      })
    return messages
  }
}

export const idValuesPrompt: PromptDefinition = {
  key: 'id_values_prompt',
  title: 'DODId or SSN',
  description: 'Give me a DODId or SSN.',
  schema: IDValuesPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.type == null)
      messages.push({ type: MutationMessageType.error, arg: 'type', message: 'Id type required' })
    if (data.type === 'ssn' && data.ssnValue == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'ssnValue',
        message: 'SSN value required'
      })
    if (data.type === 'dodid' && data.dodidValue == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'dodidValue',
        message: 'DODId value required'
      })
    return messages
  }
}

export const idValuesExtraDataPrompt: PromptDefinition = {
  key: 'id_values_extra_data_prompt',
  title: 'Extra data before SSN optional Prompt',
  description: 'Collect extra data before the optional SSN prompt.',
  schema: IDValuesExtraDataPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.allow == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'allow',
        message: 'Allow value required'
      })
    return messages
  }
}

export const ssnValuePrompt: PromptDefinition = {
  key: 'ssn_value_prompt',
  title: 'SSN',
  description: 'Give me your SSN.',
  schema: SSNValuePromptSchema
}
