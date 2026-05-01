import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const abilityToAutomateTasksApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'ability_to_automate_tasks_applicant_req',
  title: 'Has applicant automate tasks?',
  navTitle: 'Automation',
  description: 'Have you ever written a script to automate a repetitive task?',
  promptKeys: ['ability_to_automate_tasks_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.ability_to_automate_tasks_applicant_prompt?.isAutomated == null)
      return { status: RequirementStatus.PENDING }
    if (data.ability_to_automate_tasks_applicant_prompt?.isAutomated)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.WARNING, reason: 'Must show ability to automate tasks.' }
  }
}

export const abilityToAutomateTasksReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'ability_to_automate_tasks_reviewer_req',
  title: 'Review of Applicant script ability',
  description: 'Approval of applicant choice of tasks to automate and quality of scripting',
  promptKeys: ['ability_to_automate_tasks_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.ability_to_automate_tasks_reviewer_prompt?.isSuited != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const futureCareerInterestApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'future_career_interest_applicant_req',
  title: 'Describe career in dev/ops interests',
  navTitle: 'Career Interests',
  description: 'What interests you most about operations as a career?',
  promptKeys: ['future_career_interest_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.future_career_interest_applicant_prompt?.interests != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const futureCareerInterestReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'future_career_interest_reviewer_req',
  title: 'Rate Career Interest Response',
  description:
    'Rate the applicants response. Did they show that they have investigated future career paths.\n',
  promptKeys: ['future_career_interest_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.future_career_interest_reviewer_prompt?.rating != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}
