import type { ProgramDefinition } from '@reqquest/api'

export const operationsAndInfrastructureProgram: ProgramDefinition = {
  key: 'operations_and_infrastructure_program',
  title: 'Operations & Infrastructure Program',
  requirementKeys: [
    'minimum_gpa_req',
    'available_hours_per_week_req',
    'participation_acknowledgement_req',
    'ability_to_automate_tasks_applicant_req',
    'ability_to_automate_tasks_reviewer_req',
    'future_career_interest_applicant_req',
    'future_career_interest_reviewer_req',
    'recommendation_letter_applicant_req',
    'recommendation_letter_reviewer_req'
  ]
}

export const softwareDevelopmentProgram: ProgramDefinition = {
  key: 'software_development_program',
  title: 'Software Development Program',
  requirementKeys: [
    'minimum_gpa_req',
    'available_hours_per_week_req',
    'participation_acknowledgement_req',
    'recommendation_letter_applicant_req',
    'recommendation_letter_reviewer_req',
    'logical_thinking_applicant_req',
    'logical_thinking_reviewer_req',
    'interest_in_building_applicant_req',
    'interest_in_building_reviewer_req',
    'creative_problem_solving_applicant_req',
    'creative_problem_solving_reviewer_req'
  ]
}

export const projectManagementProgram: ProgramDefinition = {
  key: 'project_management_program',
  title: 'Project Management Program',
  requirementKeys: [
    'available_hours_per_week_req',
    'participation_acknowledgement_req',
    'recommendation_letter_applicant_req',
    'recommendation_letter_reviewer_req',
    'organization_applicant_req',
    'organization_reviewer_req',
    'communication_applicant_req',
    'communication_reviewer_req',
    'attention_to_detail_assessment_reviewer_req'
  ]
}

export const applicationManagementAndSupportProgram: ProgramDefinition = {
  key: 'application_management_and_support_program',
  title: 'Application Management & Support Program',
  requirementKeys: [
    'available_hours_per_week_req',
    'participation_acknowledgement_req',
    'recommendation_letter_applicant_req',
    'recommendation_letter_reviewer_req',
    'attention_to_detail_applicant_req',
    'attention_to_detail_reviewer_req',
    'process_adherence_applicant_req',
    'process_adherence_reviewer_req',
    'written_communication_applicant_req',
    'written_communication_reviewer_req'
  ]
}
