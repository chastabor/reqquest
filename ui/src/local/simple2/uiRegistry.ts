import { UIRegistry } from '@reqquest/ui'
import StateResidencePrompt from './residence/StateResidencePrompt.svelte'
import StateResidencePromptDisplay from './residence/StateResidencePromptDisplay.svelte'
import StateResidenceConfirmationPrompt from './residence/StateResidenceConfirmationPrompt.svelte'
import StateResidenceConfirmationPromptDisplay from './residence/StateResidenceConfirmationPromptDisplay.svelte'
import Step1PostResidencePrompt from './step/Step1PostResidencePrompt.svelte'
import Step1PostResidencePromptDisplay from './step/Step1PostResidencePromptDisplay.svelte'
import Step2PostResidencePrompt from './step/Step2PostResidencePrompt.svelte'
import Step2PostResidencePromptDisplay from './step/Step2PostResidencePromptDisplay.svelte'
import Step3PostResidencePrompt from './step/Step3PostResidencePrompt.svelte'
import Step3PostResidencePromptDisplay from './step/Step3PostResidencePromptDisplay.svelte'
import ThanksOrNoThanksPrompt from './step/ThanksOrNoThanksPrompt.svelte'
import ThanksOrNoThanksPromptDisplay from './step/ThanksOrNoThanksPromptDisplay.svelte'
import IdValuesPrompt from './step/IdValuesPrompt.svelte'
import IdValuesPromptDisplay from './step/IdValuesPromptDisplay.svelte'
import IdValuesExtraDataPrompt from './step/IdValuesExtraDataPrompt.svelte'
import IdValuesExtraDataPromptDisplay from './step/IdValuesExtraDataPromptDisplay.svelte'
import SsnValuePrompt from './step/SsnValuePrompt.svelte'
import SsnValuePromptDisplay from './step/SsnValuePromptDisplay.svelte'
import StateResidenceReqConfigure from './residence/StateResidenceReqConfigure.svelte'

export const uiRegistry = new UIRegistry({
  appName: 'Simple Pet Adoption',
  programs: [{ key: 'adopt_a_pet_program' }, { key: 'thanks_or_no_thanks_program' }],
  requirements: [
    { key: 'state_residence_req', configureComponent: StateResidenceReqConfigure },
    { key: 'state_residence_confirmation_req' },
    { key: 'step1_post_residence_req' },
    { key: 'step3_post_residence_req' },
    { key: 'thanks_or_no_thanks_req' },
    { key: 'id_type_req' }
  ],
  prompts: [
    {
      key: 'state_residence_prompt',
      formComponent: StateResidencePrompt,
      displayComponent: StateResidencePromptDisplay
    },
    {
      key: 'state_residence_confirmation_prompt',
      formComponent: StateResidenceConfirmationPrompt,
      displayComponent: StateResidenceConfirmationPromptDisplay
    },
    {
      key: 'step1_post_residence_prompt',
      formComponent: Step1PostResidencePrompt,
      displayComponent: Step1PostResidencePromptDisplay
    },
    {
      key: 'step2_post_residence_prompt',
      formComponent: Step2PostResidencePrompt,
      displayComponent: Step2PostResidencePromptDisplay
    },
    {
      key: 'step3_post_residence_prompt',
      formComponent: Step3PostResidencePrompt,
      displayComponent: Step3PostResidencePromptDisplay
    },
    {
      key: 'thanks_or_no_thanks_prompt',
      formComponent: ThanksOrNoThanksPrompt,
      displayComponent: ThanksOrNoThanksPromptDisplay
    },
    {
      key: 'id_values_prompt',
      formComponent: IdValuesPrompt,
      displayComponent: IdValuesPromptDisplay
    },
    {
      key: 'id_values_extra_data_prompt',
      formComponent: IdValuesExtraDataPrompt,
      displayComponent: IdValuesExtraDataPromptDisplay
    },
    {
      key: 'ssn_value_prompt',
      formComponent: SsnValuePrompt,
      displayComponent: SsnValuePromptDisplay
    }
  ]
})
