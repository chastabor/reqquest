import { UIRegistry } from '@reqquest/ui'
import DogWalker from 'carbon-icons-svelte/lib/DogWalker.svelte'
import PetImageF from 'carbon-icons-svelte/lib/PetImageF.svelte'
import WhichStatePrompt from './state/WhichStatePrompt.svelte'
import WhichStatePromptDisplay from './state/WhichStatePromptDisplay.svelte'
import HaveYardPrompt from './yard/HaveYardPrompt.svelte'
import HaveYardPromptDisplay from './yard/HaveYardPromptDisplay.svelte'
import MustExerciseYourDogPrompt from './dog/MustExerciseYourDogPrompt.svelte'
import MustExerciseYourDogPromptDisplay from './dog/MustExerciseYourDogPromptDisplay.svelte'
import HaveACatTowerPrompt from './cat/HaveACatTowerPrompt.svelte'
import HaveACatTowerPromptDisplay from './cat/HaveACatTowerPromptDisplay.svelte'
import NotAllergicToTunaPrompt from './cat/NotAllergicToTunaPrompt.svelte'
import NotAllergicToTunaPromptDisplay from './cat/NotAllergicToTunaPromptDisplay.svelte'
import ApplicantSeemsNicePrompt from './cat/ApplicantSeemsNicePrompt.svelte'
import ApplicantSeemsNicePromptDisplay from './cat/ApplicantSeemsNicePromptDisplay.svelte'
import OtherCatsPrompt from './cat/OtherCatsPrompt.svelte'
import OtherCatsPromptDisplay from './cat/OtherCatsPromptDisplay.svelte'
import OtherCatsVaccinesPrompt from './cat/OtherCatsVaccinesPrompt.svelte'
import OtherCatsVaccinesPromptDisplay from './cat/OtherCatsVaccinesPromptDisplay.svelte'
import VaccineReviewPrompt from './cat/VaccineReviewPrompt.svelte'
import VaccineReviewPromptDisplay from './cat/VaccineReviewPromptDisplay.svelte'
import MustExerciseYourDogReqConfigure from './dog/MustExerciseYourDogReqConfigure.svelte'

export const uiRegistry = new UIRegistry({
  appName: 'Adopt a Pet',
  applicantDashboardIntroHeader: 'Start your Pet Journey Here!',
  applicantDashboardIntroDetail:
    'Submitting an adoption application is the first step in adopting a pet. Based on your responses you will receive a list of "eligible benefits."\n',
  applicantDashboardRecentDays: 30,
  programs: [
    { key: 'adopt_a_dog_program', icon: DogWalker },
    { key: 'adopt_a_cat_program', icon: PetImageF }
  ],
  requirements: [
    { key: 'which_state_req' },
    { key: 'have_big_yard_req' },
    { key: 'have_adequate_personal_space_req' },
    { key: 'must_exercise_your_dog_req', configureComponent: MustExerciseYourDogReqConfigure },
    { key: 'have_a_cat_tower_req' },
    { key: 'not_allergic_to_tuna_req' },
    { key: 'applicant_seems_nice_req' },
    { key: 'other_cats_applicant_req' },
    { key: 'other_cats_reviewer_req' }
  ],
  prompts: [
    {
      key: 'which_state_prompt',
      formComponent: WhichStatePrompt,
      displayComponent: WhichStatePromptDisplay
    },
    {
      key: 'have_yard_prompt',
      formComponent: HaveYardPrompt,
      displayComponent: HaveYardPromptDisplay
    },
    {
      key: 'must_exercise_your_dog_prompt',
      formComponent: MustExerciseYourDogPrompt,
      displayComponent: MustExerciseYourDogPromptDisplay
    },
    {
      key: 'have_a_cat_tower_prompt',
      formComponent: HaveACatTowerPrompt,
      displayComponent: HaveACatTowerPromptDisplay
    },
    {
      key: 'not_allergic_to_tuna_prompt',
      formComponent: NotAllergicToTunaPrompt,
      displayComponent: NotAllergicToTunaPromptDisplay
    },
    {
      key: 'applicant_seems_nice_prompt',
      formComponent: ApplicantSeemsNicePrompt,
      displayComponent: ApplicantSeemsNicePromptDisplay
    },
    {
      key: 'other_cats_prompt',
      formComponent: OtherCatsPrompt,
      displayComponent: OtherCatsPromptDisplay
    },
    {
      key: 'other_cats_vaccines_prompt',
      formComponent: OtherCatsVaccinesPrompt,
      displayComponent: OtherCatsVaccinesPromptDisplay
    },
    {
      key: 'vaccine_review_prompt',
      formComponent: VaccineReviewPrompt,
      displayComponent: VaccineReviewPromptDisplay
    }
  ]
})
