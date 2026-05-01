import { PUBLIC_DEMO_INSTANCE } from '$env/static/public'
import { UIRegistry } from '$lib'
/** default */
import DogWalker from 'carbon-icons-svelte/lib/DogWalker.svelte'
import Gamification from 'carbon-icons-svelte/lib/Gamification.svelte'
import PedestrianFamily from 'carbon-icons-svelte/lib/PedestrianFamily.svelte'
import YardPromptDisplay from './default/YardPromptDisplay.svelte'
import YardPrompt from './default/YardPrompt.svelte'
import CatTowerPromptDisplay from './default/CatTowerPromptDisplay.svelte'
import CatTowerPrompt from './default/CatTowerPrompt.svelte'
import TunaAllergyPromptDisplay from './default/TunaAllergyPromptDisplay.svelte'
import TunaAllergyPrompt from './default/TunaAllergyPrompt.svelte'
import SeemsNicePrompt from './default/SeemsNicePrompt.svelte'
import SeemsNicePromptDisplay from './default/SeemsNicePromptDisplay.svelte'
import ExerciseConfigure from './default/ExerciseConfigure.svelte'
import ExercisePrompt from './default/ExercisePrompt.svelte'
import ExercisePromptDisplay from './default/ExercisePromptDisplay.svelte'
import StatePrompt from './default/StatePrompt.svelte'
import StatePromptDisplay from './default/StatePromptDisplay.svelte'
import OtherCatsPrompt from './default/OtherCatsPrompt.svelte'
import OtherCatsPromptDisplay from './default/OtherCatsPromptDisplay.svelte'
import OtherCatsVaccinesPrompt from './default/OtherCatsVaccinesPrompt.svelte'
import OtherCatsVaccinesPromptDisplay from './default/OtherCatsVaccinesPromptDisplay.svelte'
import VaccineReviewPrompt from './default/VaccineReviewPrompt.svelte'
import VaccineReviewPromptDisplay from './default/VaccineReviewPromptDisplay.svelte'

/** simple */
import ResidencePrompt from './simple/ResidencePrompt.svelte'
import ResidencePromptDisplay from './simple/ResidencePromptDisplay.svelte'
import ResidenceConfig from './simple/ResidenceConfig.svelte'
import ResidenceConfirmationReviewPrompt from './simple/ResidenceConfirmationReviewPrompt.svelte'
import ResidenceConfirmationReviewPromptDisplay from './simple/ResidenceConfirmationReviewPromptDisplay.svelte'
import Step1PostResidencePrompt from './simple/Step1PostResidencePrompt.svelte'
import Step1PostResidencePromptDisplay from './simple/Step1PostResidencePromptDisplay.svelte'
import Step2PostResidencePrompt from './simple/Step2PostResidencePrompt.svelte'
import Step2PostResidencePromptDisplay from './simple/Step2PostResidencePromptDisplay.svelte'
import Step3PostResidencePrompt from './simple/Step3PostResidencePrompt.svelte'
import Step3PostResidencePromptDisplay from './simple/Step3PostResidencePromptDisplay.svelte'
import ThanksOrNoThanksPrompt from './simple/ThanksOrNoThanksPrompt.svelte'
import ThanksOrNoThanksPromptDisplay from './simple/ThanksOrNoThanksPromptDisplay.svelte'
import IDValuesPrompt from './simple/IDValuesPrompt.svelte'
import IDValuesPromptDisplay from './simple/IDValuesPromptDisplay.svelte'
import IDValuesExtraDataPrompt from './simple/IDValuesExtraDataPrompt.svelte'
import IDValuesExtraDataPromptDisplay from './simple/IDValuesExtraDataPromptDisplay.svelte'
import SSNValuePrompt from './simple/SSNValuePrompt.svelte'
import SSNValuePromptDisplay from './simple/SSNValuePromptDisplay.svelte'

/** Complex */
import ComplexResidencePrompt from './complex/residence/ResidencePrompt.svelte'
import ComplexResidenceDisplayPrompt from './complex/residence/ResidenceDisplayPrompt.svelte'
import ComplexResidenceConfig from './complex/residence/ResidenceConfig.svelte'
import ComplexPetOwnerPrompt from './complex/petOwner/PetOwnerPrompt.svelte'
import ComplexPetOwnerDisplayPrompt from './complex/petOwner/PetOwnerDisplayPrompt.svelte'
import ComplexPreviousDogOwnerPrompt from './complex/dogOwner/PreviousDogOwnerPrompt.svelte'
import ComplexPreviousDogOwnerDisplayPrompt from './complex/dogOwner/PreviousDogOwnerDisplayPrompt.svelte'
import ComplexCurrentDogOwnerPrompt from './complex/dogOwner/CurrentDogOwnerPrompt.svelte'
import ComplexCurrentDogOwnerDisplayPrompt from './complex/dogOwner/CurrentDogOwnerDisplayPrompt.svelte'
import ComplexCurrentDogConfig from './complex/dogOwner/CurrentDogConfig.svelte'
import ComplexYardConfig from './complex/yard/YardConfig.svelte'
import ComplexYardPrompt from './complex/yard/YardPrompt.svelte'
import ComplexYardDisplayPrompt from './complex/yard/YardDisplayPrompt.svelte'
import ComplexOwnerDogAllergyPrompt from './complex/dogOwner/OwnerDogAllergyPrompt.svelte'
import ComplexOwnerDogAllergyDisplayPrompt from './complex/dogOwner/OwnerDogAllergyDisplayPrompt.svelte'
import ComplexDogExerciseConfig from './complex/dogOwner/DogExerciseConfig.svelte'
import ComplexDogExercisePrompt from './complex/dogOwner/DogExercisePrompt.svelte'
import ComplexDogExerciseDisplayPrompt from './complex/dogOwner/DogExerciseDisplayPrompt.svelte'
import ComplexPreviousCatOwnerPrompt from './complex/catOwner/PreviousCatOwnerPrompt.svelte'
import ComplexPreviousCatOwnerDisplayPrompt from './complex/catOwner/PreviousCatOwnerDisplayPrompt.svelte'
import ComplexCurrentCatConfig from './complex/catOwner/CurrentCatConfig.svelte'
import ComplexCurrentCatOwnerPrompt from './complex/catOwner/CurrentCatOwnerPrompt.svelte'
import ComplexCurrentCatOwnerDisplayPrompt from './complex/catOwner/CurrentCatOwnerDisplayPrompt.svelte'
import ComplexLivingSpaceConfig from './complex/livingSpace/LivingSpaceConfig.svelte'
import ComplexLivingSpacePrompt from './complex/livingSpace/LivingSpacePrompt.svelte'
import ComplexLivingSpaceDisplayPrompt from './complex/livingSpace/LivingSpaceDisplayPrompt.svelte'
import ComplexOwnerCatAllergyPrompt from './complex/catOwner/OwnerCatAllergyPrompt.svelte'
import ComplexOwnerCatAllergyDisplayPrompt from './complex/catOwner/OwnerCatAllergyDisplayPrompt.svelte'
import ComplexOwnerCatMicrochipServicePrompt from './complex/catOwner/OwnerCatMicrochipServicePrompt.svelte'
import ComplexOwnerCatMicrochipServiceDisplayPrompt from './complex/catOwner/OwnerCatMicrochipServiceDisplayPrompt.svelte'
import ComplexChildrenConfig from './complex/children/ChildrenConfig.svelte'
import ComplexChildrenPrompt from './complex/children/ChildrenPrompt.svelte'
import ComplexChildrenDisplayPrompt from './complex/children/ChildrenDisplayPrompt.svelte'
import ComplexReviewApplicantResidenceInfoPrompt from './complex/residence/ReviewApplicantResidenceInfoPrompt.svelte'
import ComplexReviewApplicantResidenceInfoPromptDisplay from './complex/residence/ReviewApplicantResidenceInfoPromptDisplay.svelte'
import ComplexReviewApplicantCatInfoPrompt from './complex/catOwner/ReviewApplicantCatInfoPrompt.svelte'
import ComplexReviewApplicantCatInfoPromptDisplay from './complex/catOwner/ReviewApplicantCatInfoPromptDisplay.svelte'
import ComplexReviewApplicantDogInfoPrompt from './complex/dogOwner/ReviewApplicantDogInfoPrompt.svelte'
import ComplexReviewApplicantDogInfoPromptDisplay from './complex/dogOwner/ReviewApplicantDogInfoPromptDisplay.svelte'
import ComplexReviewApplicantFosterAPetPrompt from './complex/petOwner/ReviewApplicantFosterAPetPrompt.svelte'
import ComplexReviewApplicantFosterAPetPromptDisplay from './complex/petOwner/ReviewApplicantFosterAPetPromptDisplay.svelte'
import ComplexTermsAndConditionsConfig from './complex/termsAndConditions/TermsAndConditionsConfig.svelte'
import ComplexTermsAndConditionsPrompt from './complex/termsAndConditions/TermsAndConditionsPrompt.svelte'
import ComplexTermsAndConditionsPromptDisplay from './complex/termsAndConditions/TermsAndConditionsPromptDisplay.svelte'
import ComplexApproveReviewerExerciseExemptionConfig from './complex/dogOwner/ApproveReviewerExerciseExemptionConfig.svelte'
import ComplexApproveReviewerExerciseExemptionPrompt from './complex/dogOwner/ApproveReviewerExerciseExemptionPrompt.svelte'
import ComplexApproveReviewerExerciseExemptionPromptDisplay from './complex/dogOwner/ApproveReviewerExerciseExemptionPromptDisplay.svelte'
import ComplexPreviousDogSurrenderPrompt from './complex/dogOwner/PreviousDogSurrenderPrompt.svelte'
import ComplexPreviousDogSurrenderDisplayPrompt from './complex/dogOwner/PreviousDogSurrenderDisplayPrompt.svelte'
import ComplexBridgeOfDeathPrompt from './complex/optional/BridgeOfDeathPrompt.svelte'
import ComplexBridgeOfDeathDisplayPrompt from './complex/optional/BridgeOfDeathDisplayPrompt.svelte'
import ComplexReviewMovieLoverPrompt from './complex/optional/ReviewMovieLoverPrompt.svelte'
import ComplexReviewMovieLoverDisplayPrompt from './complex/optional/ReviewMovieLoverDisplayPrompt.svelte'
import ComplexAcceptCatPrompt from './complex/catOwner/AcceptCatPrompt.svelte'
import ComplexAcceptCatDisplayPrompt from './complex/catOwner/AcceptCatDisplayPrompt.svelte'
import ComplexAcceptDogPrompt from './complex/dogOwner/AcceptDogPrompt.svelte'
import ComplexAcceptDogDisplayPrompt from './complex/dogOwner/AcceptDogDisplayPrompt.svelte'
import ComplexAcceptFosterPetPrompt from './complex/petOwner/AcceptFosterPetPrompt.svelte'
import ComplexAcceptFosterPetDisplayPrompt from './complex/petOwner/AcceptFosterPetDisplayPrompt.svelte'
import ComplexConfirmCatMircochipServicePrompt from './complex/catOwner/ConfirmCatMircochipServicePrompt.svelte'
import ComplexConfirmCatMircochipServiceDisplayPrompt from './complex/catOwner/ConfirmCatMircochipServiceDisplayPrompt.svelte'

/** RC2 */
import MinimumGPAPrompt from './rc2/common/MinimumGPAPrompt.svelte'
import MinimumGPAPromptDisplay from './rc2/common/MinimumGPAPromptDisplay.svelte'
import AvailableHoursPerWeekPrompt from './rc2/common/AvailableHoursPerWeekPrompt.svelte'
import AvailableHoursPerWeekPromptDisplay from './rc2/common/AvailableHoursPerWeekPromptDisplay.svelte'
import ParticipationAcknowledgementPrompt from './rc2/common/ParticipationAcknowledgementPrompt.svelte'
import RecommendationLetterApplicantPrompt from './rc2/common/RecommendationLetterApplicantPrompt.svelte'
import RecommendationLetterApplicantPromptDisplay from './rc2/common/RecommendationLetterApplicantPromptDisplay.svelte'
import RecommendationLetterReviewerPrompt from './rc2/common/RecommendationLetterReviewerPrompt.svelte'
import RecommendationLetterReviewerPromptDisplay from './rc2/common/RecommendationLetterReviewerPromptDisplay.svelte'
import AbilityToAutomateTasksApplicantPrompt from './rc2/operations/AbilityToAutomateTasksApplicantPrompt.svelte'
import AbilityToAutomateTasksReviewerPrompt from './rc2/operations/AbilityToAutomateTasksReviewerPrompt.svelte'
import FutureCareerInterestApplicantPrompt from './rc2/operations/FutureCareerInterestApplicantPrompt.svelte'
import FutureCareerInterestReviewerPrompt from './rc2/operations/FutureCareerInterestReviewerPrompt.svelte'
import FutureCareerInterestReviewerPromptDisplay from './rc2/operations/FutureCareerInterestReviewerPromptDisplay.svelte'
import LogicalThinkingApplicantPrompt from './rc2/software-development/LogicalThinkingApplicantPrompt.svelte'
import LogicalThinkingApplicantPromptDisplay from './rc2/software-development/LogicalThinkingApplicantPromptDisplay.svelte'
import LogicalThinkingReviewerPrompt from './rc2/software-development/LogicalThinkingReviewerPrompt.svelte'
import InterestInBuildingApplicantPrompt from './rc2/software-development/InterestInBuildingApplicantPrompt.svelte'
import InterestInBuildingReviewerPrompt from './rc2/software-development/InterestInBuildingReviewerPrompt.svelte'
import CreativeProblemSolvingApplicantPrompt from './rc2/software-development/CreativeProblemSolvingApplicantPrompt.svelte'
import CreativeProblemSolvingReviewerPrompt from './rc2/software-development/CreativeProblemSolvingReviewerPrompt.svelte'
import OrganizationApplicantPrompt from './rc2/project-management/OrganizationApplicantPrompt.svelte'
import OrganizationReviewerPrompt from './rc2/project-management/OrganizationReviewerPrompt.svelte'
import CommunicationApplicantPrompt from './rc2/project-management/CommunicationApplicantPrompt.svelte'
import CommunicationReviewerPrompt from './rc2/project-management/CommunicationReviewerPrompt.svelte'
import AttentionToDetailAssessmentReviewerPrompt from './rc2/project-management/AttentionToDetailAssessmentReviewerPrompt.svelte'
import AttentionToDetailApplicantPrompt from './rc2/application-support/AttentionToDetailApplicantPrompt.svelte'
import AttentionToDetailReviewerPrompt from './rc2/application-support/AttentionToDetailReviewerPrompt.svelte'
import ProcessAdherenceApplicantPrompt from './rc2/application-support/ProcessAdherenceApplicantPrompt.svelte'
import ProcessAdherenceReviewerPrompt from './rc2/application-support/ProcessAdherenceReviewerPrompt.svelte'
import WrittenCommunicationApplicantPrompt from './rc2/application-support/WrittenCommunicationApplicantPrompt.svelte'
import WrittenCommunicationReviewerPrompt from './rc2/application-support/WrittenCommunicationReviewerPrompt.svelte'
import MinimumGPAReqConfigure from './rc2/common/MinimumGPAReqConfigure.svelte'
import AvailableHoursPerWeekReqConfigure from './rc2/common/AvailableHoursPerWeekReqConfigure.svelte'

const { appName, applicantDashboardIntroHeader, applicantDashboardIntroDetail, applicantDashboardRecentDays, programs, requirements, prompts } = configureDemoInstanceParams()

export const uiRegistry = new UIRegistry({
  appName,
  applicantDashboardIntroHeader,
  applicantDashboardIntroDetail,
  applicantDashboardRecentDays,
  programs,
  requirements,
  prompts
})

function configureDemoInstanceParams () {
  /**
   * So here's a fun hack. PUBLIC_DEMO_INSTANCE is one of our environment variables, but we
   * have a bit of a custom system for injecting environment at startup time rather than build time.
   *
   * So at build time, PUBLIC_DEMO_INSTANCE is set to '$PUBLIC_DEMO_INSTANCE' (literally). At container
   * startup, our apply-env.sh script replaces that with the actual value we want.
   *
   * The catch is, vite/rollup looks for dead code during build, and at build, it can clearly see that
   * PUBLIC_DEMO_INSTANCE is a constant string '$PUBLIC_DEMO_INSTANCE', so any conditional branches
   * depending on its value are optimized away. To avoid that, we do a little string manipulation
   * here to prevent vite/rollup from being able to tell what the value is at build time.
   */
  let tmpDemoInstance = PUBLIC_DEMO_INSTANCE + ' '
  tmpDemoInstance = tmpDemoInstance.trim()
  if (tmpDemoInstance === 'simple') {
    return {
      appName: 'Adopt a Pet',
      applicantDashboardIntroHeader: 'Start your Pet Journey Here!',
      applicantDashboardIntroDetail: 'Submitting an adoption application is the first step in adopting a pet. Based on your responses you will receive a list of "eligible benefits."',
      applicantDashboardRecentDays: 30,
      programs: [{ key: 'adopt_a_pet_program', icon: DogWalker },
        { key: 'thanks_or_no_thanks_program', icon: Gamification }
      ],
      requirements: [
        { key: 'state_residence_req', configureComponent: ResidenceConfig },
        { key: 'state_residence_confirmation_req' },
        { key: 'step1_post_residence_req' },
        { key: 'step3_post_residence_req' },
        { key: 'id_type_req' }
      ],
      prompts: [{
        key: 'state_residence_prompt',
        formComponent: ResidencePrompt,
        displayComponent: ResidencePromptDisplay
      },
      {
        key: 'state_residence_confirmation_prompt',
        formComponent: ResidenceConfirmationReviewPrompt,
        displayComponent: ResidenceConfirmationReviewPromptDisplay
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
        formComponent: IDValuesPrompt,
        displayComponent: IDValuesPromptDisplay
      },
      {
        key: 'id_values_extra_data_prompt',
        formComponent: IDValuesExtraDataPrompt,
        displayComponent: IDValuesExtraDataPromptDisplay
      },
      {
        key: 'ssn_value_prompt',
        formComponent: SSNValuePrompt,
        displayComponent: SSNValuePromptDisplay
      }
      ]
    }
  } else if (tmpDemoInstance === 'multi') { // TODO - Update one spec for multi complete, currently mirror demo
    return {
      appName: 'Adopt a Critter',
      applicantDashboardIntroHeader: 'Start your Pet Journey Here!',
      applicantDashboardIntroDetail: 'Submitting an adoption application is the first step in adopting a cat or dog. Based on your responses you will receive a list of "eligible benefits."',
      applicantDashboardRecentDays: 30,
      programs: [{
        key: 'adopt_a_dog_program',
        icon: DogWalker
      }],
      requirements: [
        { key: 'have_big_yard_req' },
        { key: 'have_adequate_personal_space_req' },
        { key: 'have_a_cat_tower_req' },
        { key: 'not_allergic_to_tuna_req' },
        { key: 'applicant_seems_nice_req' },
        { key: 'must_exercise_your_dog_req', configureComponent: ExerciseConfigure },
        { key: 'which_state_req' },
        { key: 'other_cats_applicant_req' },
        { key: 'other_cats_reviewer_req' }
      ],
      prompts: [{
        key: 'have_yard_prompt',
        formComponent: YardPrompt,
        displayComponent: YardPromptDisplay
      }, {
        key: 'have_a_cat_tower_prompt',
        formComponent: CatTowerPrompt,
        displayComponent: CatTowerPromptDisplay
      }, {
        key: 'not_allergic_to_tuna_prompt',
        formComponent: TunaAllergyPrompt,
        displayComponent: TunaAllergyPromptDisplay
      }, {
        key: 'applicant_seems_nice_prompt',
        formComponent: SeemsNicePrompt,
        displayComponent: SeemsNicePromptDisplay
      }, {
        key: 'must_exercise_your_dog_prompt',
        formComponent: ExercisePrompt,
        displayComponent: ExercisePromptDisplay
      }, {
        key: 'which_state_prompt',
        formComponent: StatePrompt,
        displayComponent: StatePromptDisplay
      }, {
        key: 'other_cats_prompt',
        formComponent: OtherCatsPrompt,
        displayComponent: OtherCatsPromptDisplay
      }, {
        key: 'other_cats_vaccines_prompt',
        formComponent: OtherCatsVaccinesPrompt,
        displayComponent: OtherCatsVaccinesPromptDisplay
      }, {
        key: 'vaccine_review_prompt',
        formComponent: VaccineReviewPrompt,
        displayComponent: VaccineReviewPromptDisplay
      }]
    }
  } else if (tmpDemoInstance === 'complex') {
    return {
      appName: 'Pet lover',
      applicantDashboardIntroHeader: 'Keep your love of pets alive!',
      applicantDashboardIntroDetail: 'Submitting an application is the first step in making the life of a pet better! Based on your responses you will receive a list of "eligible benefits."',
      applicantDashboardRecentDays: 30,
      programs: [{ key: 'adopt_a_dog_program', icon: DogWalker },
        { key: 'adopt_a_cat_program', icon: PedestrianFamily },
        { key: 'foster_a_pet_program', icon: Gamification }
      ],
      requirements: [
        { key: 'state_residence_prequal_req', configureComponent: ComplexResidenceConfig },
        { key: 'petowner_prequal_req' },
        { key: 'previous_dogwowner_qual_req' },
        { key: 'current_dogowner_qual_req', configureComponent: ComplexCurrentDogConfig },
        { key: 'yard_qual_req', configureComponent: ComplexYardConfig },
        { key: 'owner_dog_allergy_qual_req' },
        { key: 'dog_exercise_qual_req', configureComponent: ComplexDogExerciseConfig },
        { key: 'previous_catowner_qual_req' },
        { key: 'current_catowner_qual_req', configureComponent: ComplexCurrentCatConfig },
        { key: 'living_space_qual_req', configureComponent: ComplexLivingSpaceConfig },
        { key: 'owner_cat_allergy_qual_req' },
        { key: 'owner_cat_microchip_servive_qual_req' },
        { key: 'children_qual_req', configureComponent: ComplexChildrenConfig },
        { key: 'movie_lover_qual_req' },
        { key: 'terms_and_conditions_post_qual_req' },
        { key: 'review_applicant_state_residence_app_req' },
        { key: 'review_applicant_cat_info_app_req' },
        { key: 'review_applicant_dog_info_app_req' },
        { key: 'review_application_foster_a_pet_app_req' },
        { key: 'review_movie_lover_app_req' },
        { key: 'previous_dog_surrender_qual_req' },
        { key: 'previous_dog_surrender_foster_qual_req' },
        { key: 'approve_reviewer_exercise_exemption_workflow_req', configureComponent: ComplexApproveReviewerExerciseExemptionConfig },
        { key: 'accept_adopt_cat_req' },
        { key: 'accept_adopt_dog_req' },
        { key: 'accept_fost_pet_req' },
        { key: 'confirm_cat_microchip_service_workflow_req' }
      ],
      prompts: [
        { key: 'state_residence_prompt', formComponent: ComplexResidencePrompt, displayComponent: ComplexResidenceDisplayPrompt },
        { key: 'petowner_prompt', formComponent: ComplexPetOwnerPrompt, displayComponent: ComplexPetOwnerDisplayPrompt },
        { key: 'previous_dogowner_prompt', formComponent: ComplexPreviousDogOwnerPrompt, displayComponent: ComplexPreviousDogOwnerDisplayPrompt },
        { key: 'current_dogowner_prompt', formComponent: ComplexCurrentDogOwnerPrompt, displayComponent: ComplexCurrentDogOwnerDisplayPrompt },
        { key: 'yard_prompt', formComponent: ComplexYardPrompt, displayComponent: ComplexYardDisplayPrompt },
        { key: 'owner_dog_allergy_prompt', formComponent: ComplexOwnerDogAllergyPrompt, displayComponent: ComplexOwnerDogAllergyDisplayPrompt },
        { key: 'dog_exercise_prompt', formComponent: ComplexDogExercisePrompt, displayComponent: ComplexDogExerciseDisplayPrompt },
        { key: 'previous_catowner_prompt', formComponent: ComplexPreviousCatOwnerPrompt, displayComponent: ComplexPreviousCatOwnerDisplayPrompt },
        { key: 'current_catowner_prompt', formComponent: ComplexCurrentCatOwnerPrompt, displayComponent: ComplexCurrentCatOwnerDisplayPrompt },
        { key: 'living_space_prompt', formComponent: ComplexLivingSpacePrompt, displayComponent: ComplexLivingSpaceDisplayPrompt },
        { key: 'owner_cat_allergy_prompt', formComponent: ComplexOwnerCatAllergyPrompt, displayComponent: ComplexOwnerCatAllergyDisplayPrompt },
        { key: 'owner_cat_microchip_service_prompt', formComponent: ComplexOwnerCatMicrochipServicePrompt, displayComponent: ComplexOwnerCatMicrochipServiceDisplayPrompt },
        { key: 'children_prompt', formComponent: ComplexChildrenPrompt, displayComponent: ComplexChildrenDisplayPrompt },
        { key: 'bridge_of_death_prompt', formComponent: ComplexBridgeOfDeathPrompt, displayComponent: ComplexBridgeOfDeathDisplayPrompt },
        { key: 'review_applicant_state_residence_info_prompt', formComponent: ComplexReviewApplicantResidenceInfoPrompt, displayComponent: ComplexReviewApplicantResidenceInfoPromptDisplay },
        { key: 'review_applicant_cat_info_prompt', formComponent: ComplexReviewApplicantCatInfoPrompt, displayComponent: ComplexReviewApplicantCatInfoPromptDisplay },
        { key: 'review_applicant_dog_info_prompt', formComponent: ComplexReviewApplicantDogInfoPrompt, displayComponent: ComplexReviewApplicantDogInfoPromptDisplay },
        { key: 'review_applicant_foster_a_pet_info_prompt', formComponent: ComplexReviewApplicantFosterAPetPrompt, displayComponent: ComplexReviewApplicantFosterAPetPromptDisplay },
        { key: 'review_movie_lover_answers_prompt', formComponent: ComplexReviewMovieLoverPrompt, displayComponent: ComplexReviewMovieLoverDisplayPrompt },
        { key: 'terms_and_conditions_prompt', configureComponent: ComplexTermsAndConditionsConfig, formComponent: ComplexTermsAndConditionsPrompt, displayComponent: ComplexTermsAndConditionsPromptDisplay },
        { key: 'previous_dog_surrender_prompt', formComponent: ComplexPreviousDogSurrenderPrompt, displayComponent: ComplexPreviousDogSurrenderDisplayPrompt },
        { key: 'previous_dog_surrender_foster_prompt', formComponent: ComplexPreviousDogSurrenderPrompt, displayComponent: ComplexPreviousDogSurrenderDisplayPrompt },
        { key: 'approve_reviewer_exercise_exemption_prompt', formComponent: ComplexApproveReviewerExerciseExemptionPrompt, displayComponent: ComplexApproveReviewerExerciseExemptionPromptDisplay },
        { key: 'accept_cat_prompt', formComponent: ComplexAcceptCatPrompt, displayComponent: ComplexAcceptCatDisplayPrompt },
        { key: 'accept_dog_prompt', formComponent: ComplexAcceptDogPrompt, displayComponent: ComplexAcceptDogDisplayPrompt },
        { key: 'accept_foster_pet_prompt', formComponent: ComplexAcceptFosterPetPrompt, displayComponent: ComplexAcceptFosterPetDisplayPrompt },
        { key: 'confirm_cat_microchip_service_prompt', formComponent: ComplexConfirmCatMircochipServicePrompt, displayComponent: ComplexConfirmCatMircochipServiceDisplayPrompt }
      ]
    }
  }
  else if (tmpDemoInstance === 'rc2') {
    return {
      appName: 'Technical Mentorship Experience',
      programs: [
        { key: 'operations_and_infrastructure_program' },
        { key: 'software_development_program' },
        { key: 'project_management_program' },
        { key: 'application_management_and_support_program' }
      ],
      requirements: [
        { key: 'minimum_gpa_req', configureComponent: MinimumGPAReqConfigure },
        { key: 'available_hours_per_week_req', configureComponent: AvailableHoursPerWeekReqConfigure },
        { key: 'participation_acknowledgement_req' },
        { key: 'recommendation_letter_applicant_req' },
        { key: 'recommendation_letter_reviewer_req' },
        { key: 'ability_to_automate_tasks_applicant_req' },
        { key: 'ability_to_automate_tasks_reviewer_req' },
        { key: 'future_career_interest_applicant_req' },
        { key: 'future_career_interest_reviewer_req' },
        { key: 'logical_thinking_applicant_req' },
        { key: 'logical_thinking_reviewer_req' },
        { key: 'interest_in_building_applicant_req' },
        { key: 'interest_in_building_reviewer_req' },
        { key: 'creative_problem_solving_applicant_req' },
        { key: 'creative_problem_solving_reviewer_req' },
        { key: 'organization_applicant_req' },
        { key: 'organization_reviewer_req' },
        { key: 'communication_applicant_req' },
        { key: 'communication_reviewer_req' },
        { key: 'attention_to_detail_assessment_reviewer_req' },
        { key: 'attention_to_detail_applicant_req' },
        { key: 'attention_to_detail_reviewer_req' },
        { key: 'process_adherence_applicant_req' },
        { key: 'process_adherence_reviewer_req' },
        { key: 'written_communication_applicant_req' },
        { key: 'written_communication_reviewer_req' }
      ],
      prompts: [
        {
          key: 'minimum_gpa_prompt',
          formComponent: MinimumGPAPrompt,
          displayComponent: MinimumGPAPromptDisplay
        },
        {
          key: 'available_hours_per_week_prompt',
          formComponent: AvailableHoursPerWeekPrompt,
          displayComponent: AvailableHoursPerWeekPromptDisplay
        },
        {
          key: 'participation_acknowledgement_prompt',
          formComponent: ParticipationAcknowledgementPrompt
        },
        {
          key: 'recommendation_letter_applicant_prompt',
          formComponent: RecommendationLetterApplicantPrompt,
          displayComponent: RecommendationLetterApplicantPromptDisplay
        },
        {
          key: 'recommendation_letter_reviewer_prompt',
          formComponent: RecommendationLetterReviewerPrompt,
          displayComponent: RecommendationLetterReviewerPromptDisplay
        },
        {
          key: 'ability_to_automate_tasks_applicant_prompt',
          formComponent: AbilityToAutomateTasksApplicantPrompt
        },
        {
          key: 'ability_to_automate_tasks_reviewer_prompt',
          formComponent: AbilityToAutomateTasksReviewerPrompt
        },
        {
          key: 'future_career_interest_applicant_prompt',
          formComponent: FutureCareerInterestApplicantPrompt
        },
        {
          key: 'future_career_interest_reviewer_prompt',
          formComponent: FutureCareerInterestReviewerPrompt,
          displayComponent: FutureCareerInterestReviewerPromptDisplay
        },
        {
          key: 'logical_thinking_applicant_prompt',
          formComponent: LogicalThinkingApplicantPrompt,
          displayComponent: LogicalThinkingApplicantPromptDisplay
        },
        { key: 'logical_thinking_reviewer_prompt', formComponent: LogicalThinkingReviewerPrompt },
        {
          key: 'interest_in_building_applicant_prompt',
          formComponent: InterestInBuildingApplicantPrompt
        },
        {
          key: 'interest_in_building_reviewer_prompt',
          formComponent: InterestInBuildingReviewerPrompt
        },
        {
          key: 'creative_problem_solving_applicant_prompt',
          formComponent: CreativeProblemSolvingApplicantPrompt
        },
        {
          key: 'creative_problem_solving_reviewer_prompt',
          formComponent: CreativeProblemSolvingReviewerPrompt
        },
        { key: 'organization_applicant_prompt', formComponent: OrganizationApplicantPrompt },
        { key: 'organization_reviewer_prompt', formComponent: OrganizationReviewerPrompt },
        { key: 'communication_applicant_prompt', formComponent: CommunicationApplicantPrompt },
        { key: 'communication_reviewer_prompt', formComponent: CommunicationReviewerPrompt },
        {
          key: 'attention_to_detail_assessment_reviewer_prompt',
          formComponent: AttentionToDetailAssessmentReviewerPrompt
        },
        {
          key: 'attention_to_detail_applicant_prompt',
          formComponent: AttentionToDetailApplicantPrompt
        },
        { key: 'attention_to_detail_reviewer_prompt', formComponent: AttentionToDetailReviewerPrompt },
        { key: 'process_adherence_applicant_prompt', formComponent: ProcessAdherenceApplicantPrompt },
        { key: 'process_adherence_reviewer_prompt', formComponent: ProcessAdherenceReviewerPrompt },
        {
          key: 'written_communication_applicant_prompt',
          formComponent: WrittenCommunicationApplicantPrompt
        },
        {
          key: 'written_communication_reviewer_prompt',
          formComponent: WrittenCommunicationReviewerPrompt
        }
      ]
    }
  }
  return {
    appName: 'Adopt a Critter',
    applicantDashboardIntroHeader: 'Start your Pet Journey Here!',
    applicantDashboardIntroDetail: 'Submitting an adoption application is the first step in adopting a cat or dog. Based on your responses you will receive a list of "eligible benefits."',
    applicantDashboardRecentDays: 30,
    programs: [{
      key: 'adopt_a_dog_program',
      icon: DogWalker
    }],
    requirements: [
      { key: 'have_big_yard_req' },
      { key: 'have_adequate_personal_space_req' },
      { key: 'have_a_cat_tower_req' },
      { key: 'not_allergic_to_tuna_req' },
      { key: 'applicant_seems_nice_req' },
      { key: 'must_exercise_your_dog_req', configureComponent: ExerciseConfigure },
      { key: 'which_state_req' },
      { key: 'other_cats_applicant_req' },
      { key: 'other_cats_reviewer_req' }
    ],
    prompts: [{
      key: 'have_yard_prompt',
      formComponent: YardPrompt,
      displayComponent: YardPromptDisplay
    }, {
      key: 'have_a_cat_tower_prompt',
      formComponent: CatTowerPrompt,
      displayComponent: CatTowerPromptDisplay
    }, {
      key: 'not_allergic_to_tuna_prompt',
      formComponent: TunaAllergyPrompt,
      displayComponent: TunaAllergyPromptDisplay
    }, {
      key: 'applicant_seems_nice_prompt',
      formComponent: SeemsNicePrompt,
      displayComponent: SeemsNicePromptDisplay
    }, {
      key: 'must_exercise_your_dog_prompt',
      formComponent: ExercisePrompt,
      displayComponent: ExercisePromptDisplay
    }, {
      key: 'which_state_prompt',
      formComponent: StatePrompt,
      displayComponent: StatePromptDisplay
    }, {
      key: 'other_cats_prompt',
      formComponent: OtherCatsPrompt,
      displayComponent: OtherCatsPromptDisplay
    }, {
      key: 'other_cats_vaccines_prompt',
      formComponent: OtherCatsVaccinesPrompt,
      displayComponent: OtherCatsVaccinesPromptDisplay
    }, {
      key: 'vaccine_review_prompt',
      formComponent: VaccineReviewPrompt,
      displayComponent: VaccineReviewPromptDisplay
    }]
  }
}
