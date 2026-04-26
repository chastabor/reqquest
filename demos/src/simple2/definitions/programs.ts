import type { ProgramDefinition } from '@reqquest/api'

export const adoptAPetProgram: ProgramDefinition = {
  key: 'adopt_a_pet_program',
  title: 'Adopt a Pet',
  requirementKeys: [
    'state_residence_req',
    'step1_post_residence_req',
    'step3_post_residence_req',
    'id_type_req',
    'state_residence_confirmation_req'
  ]
}

export const thanksOrNoThanksProgram: ProgramDefinition = {
  key: 'thanks_or_no_thanks_program',
  title: 'Thanks or No Thanks Program',
  requirementKeys: ['thanks_or_no_thanks_req']
}
