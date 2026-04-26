import { WhichStatePromptSchema, stateList } from '../models/state.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const whichStatePrompt: PromptDefinition = {
  key: 'which_state_prompt',
  title: 'Where do you live?',
  description: 'Applicants will enter the state they live in.',
  schema: WhichStatePromptSchema,
  fetch: async () => ({ stateList }),
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.state == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'state',
        message: 'Please enter the state you live in.'
      })
    if (
      data.stateName != null &&
      data.stateName !== stateList.find(s => s.value === data.state)?.label
    )
      messages.push({
        type: MutationMessageType.error,
        arg: 'stateName',
        message: 'State abbreviation does not match state name.'
      })
    return messages
  },
  tags: [
    {
      category: 'state',
      categoryLabel: 'State',
      description: 'Limit based on the state the applicant lives in.',
      extract: (data: any) => [data.which_state_prompt?.state],
      getTags: () => [...stateList],
      getLabel: (tag: string) => stateList.find(s => s.value === tag)?.label ?? tag,
      useInAppRequestList: 1,
      useInListFilters: 1,
      useInReviewerDashboard: 1
    }
  ]
}
