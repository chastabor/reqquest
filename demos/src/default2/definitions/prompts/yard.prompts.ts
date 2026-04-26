import { HaveYardPromptSchema } from '../models/yard.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const haveYardPrompt: PromptDefinition = {
  key: 'have_yard_prompt',
  title: 'Tell us about your yard',
  description:
    'Applicants will enter information about their yard including how large it is and how many pets will share it.\n',
  schema: HaveYardPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.haveYard == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'haveYard',
        message: 'Please indicate whether you have a yard.'
      })
    if (data.haveYard && data.squareFootage == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'squareFootage',
        message: 'Please enter the square footage of your yard.'
      })
    if (data.haveYard && data.squareFootage != null && data.squareFootage < 1)
      messages.push({
        type: MutationMessageType.error,
        arg: 'squareFootage',
        message: 'Please enter a valid square footage.'
      })
    if (data.haveYard && data.totalPets == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'totalPets',
        message: 'Please enter the number of pets.'
      })
    if (data.haveYard && data.totalPets != null && data.totalPets < 1)
      messages.push({
        type: MutationMessageType.error,
        arg: 'totalPets',
        message: 'Please enter a valid number of pets. Remember to include this pet in your total.'
      })
    return messages
  }
}
