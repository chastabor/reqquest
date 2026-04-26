import { stateList, type StateResidenceConfigData } from '../models/residence.models.js'
import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const stateResidenceReq: RequirementDefinition<StateResidenceConfigData> = {
  type: RequirementType.QUALIFICATION,
  key: 'state_residence_req',
  title: 'Must be a resident of required state',
  navTitle: 'Residency',
  description: 'Applicant must be a resident of the required state.',
  promptKeys: ['state_residence_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.state_residence_prompt?.residentOfRequiredState == null)
      return { status: RequirementStatus.PENDING }
    if (data.state_residence_prompt?.residentOfRequiredState)
      return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.DISQUALIFYING,
      reason: `You must reside in ${config.residentOfState} to qualify.`
    }
  },
  configuration: {
    default: { residentOfState: 'Texas' },
    validate: data => {
      const messages: MutationMessage[] = []
      if (data.residentOfState == null)
        messages.push({
          type: MutationMessageType.error,
          arg: 'residentOfState',
          message: 'Please specify the state to which an applicant must reside.'
        })
      return messages
    },
    fetch: async () => ({ stateList })
  }
}

export const stateResidenceConfirmationReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'state_residence_confirmation_req',
  title: 'Confirm resident of required state',
  navTitle: 'Confirm residency',
  description: 'Reviewer must validate ID provided and confirm as resident of state.',
  promptKeys: ['state_residence_confirmation_prompt'],
  resolve: (data, config, configLookup) => {
    if (
      data.state_residence_confirmation_prompt?.residentOfRequiredState == null ||
      data.state_residence_confirmation_prompt?.residenceIsHome == null
    )
      return { status: RequirementStatus.PENDING }
    if (
      data.state_residence_confirmation_prompt?.residentOfRequiredState &&
      data.state_residence_confirmation_prompt?.residenceIsHome
    )
      return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.DISQUALIFYING,
      reason: `Applicant does not reside in a home in ${configLookup.state_residence_req.residentOfState}.`
    }
  }
}
