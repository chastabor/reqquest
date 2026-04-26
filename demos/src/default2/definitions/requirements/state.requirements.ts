import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const whichStateReq: RequirementDefinition = {
  type: RequirementType.PREQUAL,
  key: 'which_state_req',
  title: 'Applicant provides state of residence.',
  navTitle: 'State',
  description: 'Applicants must tell us which state they live in.',
  promptKeys: ['which_state_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.which_state_prompt?.state == null) return { status: RequirementStatus.PENDING }
    return { status: RequirementStatus.MET }
  }
}
