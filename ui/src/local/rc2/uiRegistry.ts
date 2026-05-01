import { UIRegistry } from '@reqquest/ui'
import MinimumGPAPrompt from './common/MinimumGPAPrompt.svelte'
import MinimumGPAPromptDisplay from './common/MinimumGPAPromptDisplay.svelte'
import AvailableHoursPerWeekPrompt from './common/AvailableHoursPerWeekPrompt.svelte'
import AvailableHoursPerWeekPromptDisplay from './common/AvailableHoursPerWeekPromptDisplay.svelte'
import ParticipationAcknowledgementPrompt from './common/ParticipationAcknowledgementPrompt.svelte'
import RecommendationLetterApplicantPrompt from './common/RecommendationLetterApplicantPrompt.svelte'
import RecommendationLetterApplicantPromptDisplay from './common/RecommendationLetterApplicantPromptDisplay.svelte'
import RecommendationLetterReviewerPrompt from './common/RecommendationLetterReviewerPrompt.svelte'
import RecommendationLetterReviewerPromptDisplay from './common/RecommendationLetterReviewerPromptDisplay.svelte'
import AbilityToAutomateTasksApplicantPrompt from './operations/AbilityToAutomateTasksApplicantPrompt.svelte'
import AbilityToAutomateTasksReviewerPrompt from './operations/AbilityToAutomateTasksReviewerPrompt.svelte'
import FutureCareerInterestApplicantPrompt from './operations/FutureCareerInterestApplicantPrompt.svelte'
import FutureCareerInterestReviewerPrompt from './operations/FutureCareerInterestReviewerPrompt.svelte'
import FutureCareerInterestReviewerPromptDisplay from './operations/FutureCareerInterestReviewerPromptDisplay.svelte'
import LogicalThinkingApplicantPrompt from './software-development/LogicalThinkingApplicantPrompt.svelte'
import LogicalThinkingApplicantPromptDisplay from './software-development/LogicalThinkingApplicantPromptDisplay.svelte'
import LogicalThinkingReviewerPrompt from './software-development/LogicalThinkingReviewerPrompt.svelte'
import InterestInBuildingApplicantPrompt from './software-development/InterestInBuildingApplicantPrompt.svelte'
import InterestInBuildingReviewerPrompt from './software-development/InterestInBuildingReviewerPrompt.svelte'
import CreativeProblemSolvingApplicantPrompt from './software-development/CreativeProblemSolvingApplicantPrompt.svelte'
import CreativeProblemSolvingReviewerPrompt from './software-development/CreativeProblemSolvingReviewerPrompt.svelte'
import OrganizationApplicantPrompt from './project-management/OrganizationApplicantPrompt.svelte'
import OrganizationReviewerPrompt from './project-management/OrganizationReviewerPrompt.svelte'
import CommunicationApplicantPrompt from './project-management/CommunicationApplicantPrompt.svelte'
import CommunicationReviewerPrompt from './project-management/CommunicationReviewerPrompt.svelte'
import AttentionToDetailAssessmentReviewerPrompt from './project-management/AttentionToDetailAssessmentReviewerPrompt.svelte'
import AttentionToDetailApplicantPrompt from './application-support/AttentionToDetailApplicantPrompt.svelte'
import AttentionToDetailReviewerPrompt from './application-support/AttentionToDetailReviewerPrompt.svelte'
import ProcessAdherenceApplicantPrompt from './application-support/ProcessAdherenceApplicantPrompt.svelte'
import ProcessAdherenceReviewerPrompt from './application-support/ProcessAdherenceReviewerPrompt.svelte'
import WrittenCommunicationApplicantPrompt from './application-support/WrittenCommunicationApplicantPrompt.svelte'
import WrittenCommunicationReviewerPrompt from './application-support/WrittenCommunicationReviewerPrompt.svelte'
import MinimumGPAReqConfigure from './common/MinimumGPAReqConfigure.svelte'
import AvailableHoursPerWeekReqConfigure from './common/AvailableHoursPerWeekReqConfigure.svelte'

export const uiRegistry = new UIRegistry({
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
})
