import { ExercisePromptSchema } from '../models/dog.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const mustExerciseYourDogPrompt: PromptDefinition = {
  key: 'must_exercise_your_dog_prompt',
  title: 'Dog Exercise Agreement',
  description: 'The applicant will agree to exercise their dog a certain number of hours a week.\n',
  schema: ExercisePromptSchema,
  gatherConfig: (allPeriodConfig: any) => ({
    minExerciseHours: allPeriodConfig.must_exercise_your_dog_req?.minExerciseHours
  }),
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.exerciseHours == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'exerciseHours',
        message: 'Please enter the number of hours you will exercise your dog.'
      })
    if (data.exerciseHours != null && data.exerciseHours < config.minExerciseHours)
      messages.push({
        type: MutationMessageType.warning,
        arg: 'exerciseHours',
        message: `You must exercise your dog an average of ${config.minExerciseHours} hours a week in order to successfully adopt.`
      })
    return messages
  }
}
