import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const attentionToDetailApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'attention_to_detail_applicant_req',
  title: 'Attention To Detail',
  navTitle: 'Detailed',
  description: 'Describe a time you had to check something carefully for mistakes or accuracy.\n',
  promptKeys: ['attention_to_detail_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.attention_to_detail_applicant_prompt?.detailed != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const attentionToDetailReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'attention_to_detail_reviewer_req',
  title: 'Review Applicant Attention To Detail',
  description: 'Does the applicant demonstrate attention to detail?',
  promptKeys: ['attention_to_detail_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.attention_to_detail_reviewer_prompt?.isDetailed != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const processAdherenceApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'process_adherence_applicant_req',
  title: 'Describe a time you had to follow detailed instructions to complete a task.\n',
  navTitle: 'Adherence',
  description: 'Can the applicant follow and validate a process?',
  promptKeys: ['process_adherence_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.process_adherence_applicant_prompt?.adherence != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const processAdherenceReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'process_adherence_reviewer_req',
  title: 'Review Applicant Process Adherence',
  description: 'Can the applicant follow and validate a process?',
  promptKeys: ['process_adherence_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.process_adherence_reviewer_prompt?.isAttentive != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const writtenCommunicationApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'written_communication_applicant_req',
  title: 'Written Communication',
  navTitle: 'Written Comms',
  description:
    'Write a short set of instructions explaining how to complete complete a simple task (e.g., submit an assignment, reset a password).\n',
  promptKeys: ['written_communication_applicant_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.written_communication_applicant_prompt?.instructions != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}

export const writtenCommunicationReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'written_communication_reviewer_req',
  title: 'Review Applicant Written Communication',
  description: "Is the applicant's writing clear and easy to follow?",
  promptKeys: ['written_communication_reviewer_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.written_communication_reviewer_prompt?.isWellDefined != null)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.PENDING }
  }
}
