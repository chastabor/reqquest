import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const logicalThinkingApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'logical_thinking_applicant_req',
  title: 'Describe solution to a problem to demonstrate logical thinking.',
  description: 'Describe a logical solution to a programming problem.',
  promptKeys: ['logical_thinking_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.logical_thinking_applicant_prompt?.solution != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const logicalThinkingReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'logical_thinking_reviewer_req',
  title: 'Score logical solution.',
  description: "Score the applicant's logical solution.",
  promptKeys: ['logical_thinking_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.logical_thinking_reviewer_prompt?.scored != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const interestInBuildingApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'interest_in_building_applicant_req',
  title: 'Has applicant contributed to another project?',
  navTitle: 'Automation',
  description: 'Have you ever contributed to another project?',
  promptKeys: ['interest_in_building_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.interest_in_building_applicant_prompt?.isContributed == null)
      return { status: RequirementStatus.PENDING }
    if (data.interest_in_building_applicant_prompt?.isContributed)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.WARNING, reason: 'Must show interest in building.' }
  }
}

export const interestInBuildingReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'interest_in_building_reviewer_req',
  title: 'Score interest in building.',
  description: "Score the applicant's interest in independent technical building.",
  promptKeys: ['interest_in_building_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (
      data.interest_in_building_reviewer_prompt?.isInterested != null &&
      data.interest_in_building_reviewer_prompt?.explanation != null
    )
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const creativeProblemSolvingApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'creative_problem_solving_applicant_req',
  title: 'Creative Problem Solving',
  navTitle: 'Problem Solving',
  description:
    'What is one website or app you use for school that frustrates you? If you were the developer, what one feature would you add or change to make it easier for students to use?\n',
  promptKeys: ['creative_problem_solving_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.creative_problem_solving_applicant_prompt?.issueAndSolution != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const creativeProblemSolvingReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'creative_problem_solving_reviewer_req',
  title: 'Creative Problem Solving Review',
  description:
    'The applicant must be able to analyze shortcomings in current technologies and consider alternate solutions. Assess the validity of the reported issue and solution.\n',
  promptKeys: ['creative_problem_solving_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (
      data.creative_problem_solving_reviewer_prompt?.isIssueReal != null &&
      data.creative_problem_solving_reviewer_prompt?.isSolutionFeasible != null
    )
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}
