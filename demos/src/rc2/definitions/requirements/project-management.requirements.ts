import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const organizationApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'organization_applicant_req',
  title: 'Has applicant organized/coordinated tasks?',
  navTitle: 'Organization',
  description:
    'Describe a time you had to organize tasks or coordinate something (school, event, group project, etc.).\n',
  promptKeys: ['organization_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.organization_applicant_prompt?.orchestration != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const organizationReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'organization_reviewer_req',
  title: 'Review of Applicant organization/coordination ability',
  description: 'Does the applicant demonstrate organization and task management?',
  promptKeys: ['organization_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.organization_reviewer_prompt?.isOrchestrated != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const communicationApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'communication_applicant_req',
  title: 'Must be able to facilitate conversations between team members.',
  navTitle: 'Communication',
  description:
    "You are leading a group project. One teammate is doing all the work, and another hasn't responded to texts in three days. How do you handle this scenario?\n",
  promptKeys: ['communication_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.communication_applicant_prompt?.arbitration != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const communicationReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'communication_reviewer_req',
  title: 'Review of Applicant ability to facilitate conversations between team members.',
  description: 'Does applicant show able to facilitate conversations between team members?',
  promptKeys: ['communication_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.communication_reviewer_prompt?.isArbitor != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const attentionToDetailAssessmentReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'attention_to_detail_assessment_reviewer_req',
  title: 'Attention To Detail Assessment',
  description:
    'Applicant must demonstrate overall attention to detail in communications and documents.\n',
  promptKeys: ['attention_to_detail_assessment_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (
      data.attention_to_detail_assessment_reviewer_prompt?.isCompliant != null &&
      data.attention_to_detail_assessment_reviewer_prompt?.isProofread != null
    )
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}
