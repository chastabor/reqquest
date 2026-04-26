import { stateResidencePromptPreProcessData } from '../logic/residence.logic.js'
import {
  StateResidenceConfirmationPromptSchema,
  StateResidencePromptSchema
} from '../models/residence.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const stateResidencePrompt: PromptDefinition = {
  key: 'state_residence_prompt',
  title: 'State residency, prompt 1 of 1, req 1',
  description: 'Applicant will identify if they reside in the required state.',
  schema: StateResidencePromptSchema,
  gatherConfig: (allPeriodConfig: any) => ({
    residentOfState: allPeriodConfig.state_residence_req?.residentOfState
  }),
  preProcessData: stateResidencePromptPreProcessData,
  preValidate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.residentIdDoc?.size != null && data.residentIdDoc.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'residentIdDoc',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    if (data.residentIdDoc?.mime != null && !['image/jpeg'].includes(data.residentIdDoc?.mime))
      messages.push({
        type: MutationMessageType.error,
        arg: 'residentIdDoc',
        message: 'File must be of type .jpeg or .jpg'
      })
    return messages
  },
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.residentOfRequiredState == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'residentOfRequiredState',
        message: 'Please confirm whether you are a resident of the state.'
      })
    if (data.residentOfRequiredState && data.firstName == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'firstName',
        message: 'First name required'
      })
    if (data.residentOfRequiredState && data.lastName == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'lastName',
        message: 'Last name required'
      })
    if (data.residentOfRequiredState && data.streetAddress == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'streetAddress',
        message: 'Street address required'
      })
    if (data.residentOfRequiredState && data.city == null)
      messages.push({ type: MutationMessageType.error, arg: 'city', message: 'City required' })
    if (
      data.residentOfRequiredState &&
      data.phoneNumber &&
      data.phoneNumber != null &&
      !/^[0-9]{10,12}$/.test(data.phoneNumber)
    )
      messages.push({
        type: MutationMessageType.error,
        arg: 'phoneNumber',
        message: 'Invalid phone number'
      })
    if (
      data.residentOfRequiredState &&
      data.emailAddress &&
      data.emailAddress != null &&
      !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.emailAddress)
    )
      messages.push({
        type: MutationMessageType.error,
        arg: 'emailAddress',
        message: 'Invalid email address'
      })
    if (data.residentOfRequiredState && data.zipCode == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'zipCode',
        message: 'Zipcode required'
      })
    if (data.residentOfRequiredState && data.zipCode != null && !/^[0-9]{5}$/.test(data.zipCode))
      messages.push({ type: MutationMessageType.error, arg: 'zipCode', message: 'Invalid zipcode' })
    if (data.residentOfRequiredState && data.residentIdDoc == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'residentIdDoc',
        message: 'Identifying documentation required'
      })
    return messages
  }
}

export const stateResidenceConfirmationPrompt: PromptDefinition = {
  key: 'state_residence_confirmation_prompt',
  title: 'State residency confirmation',
  description: "Reviewer will confirm the applicant's residency.",
  schema: StateResidenceConfirmationPromptSchema,
  gatherConfig: (allPeriodConfig: any) => ({
    residentOfState: allPeriodConfig.state_residence_req?.residentOfState
  }),
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.residentOfRequiredState == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'residentOfRequiredState',
        message: `Please confirm whether applicant is a resident of ${config.residentOfState}.`
      })
    if (data.residenceIsHome == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'residenceIsHome',
        message: `Please validate whether applicant address provided is a home in ${config.residentOfState}.`
      })
    return messages
  }
}
