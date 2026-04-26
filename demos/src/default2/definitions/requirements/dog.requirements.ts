import type { ExerciseConfigData } from '../models/dog.models.js'
import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const mustExerciseYourDogReq: RequirementDefinition<ExerciseConfigData> = {
  type: RequirementType.QUALIFICATION,
  key: 'must_exercise_your_dog_req',
  title: 'Agreement to Exercise the Dog',
  navTitle: 'Exercise Per Week',
  description: 'The applicant must exercise their dog a certain number of hours a week.',
  promptKeys: ['must_exercise_your_dog_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.must_exercise_your_dog_prompt?.exerciseHours == null)
      return { status: RequirementStatus.PENDING }
    if (data.must_exercise_your_dog_prompt?.exerciseHours >= config.minExerciseHours)
      return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.WARNING,
      reason: `You must exercise your dog ${config.minExerciseHours} hours a week.`
    }
  },
  configuration: {
    default: { minExerciseHours: 10 },
    validate: data => {
      const messages: MutationMessage[] = []
      if (data.minExerciseHours == null)
        messages.push({
          type: MutationMessageType.error,
          arg: 'minExerciseHours',
          message: 'Please enter the minimum number of hours to exercise the dog.'
        })
      if (data.minExerciseHours != null && data.minExerciseHours < 0)
        messages.push({
          type: MutationMessageType.error,
          arg: 'minExerciseHours',
          message: 'Please enter a valid number of hours.'
        })
      return messages
    }
  }
}
