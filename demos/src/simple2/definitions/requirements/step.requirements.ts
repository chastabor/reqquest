import { idTypeReqResolve } from '../logic/step.logic.js'
import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const step1PostResidenceReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'step1_post_residence_req',
  title: 'Accessible validation stop 1?',
  navTitle: 'Accessible validation stop 1?',
  description:
    'Identifies whether requirement+prompts show post previous req that returns disqualifying.',
  promptKeys: ['step1_post_residence_prompt', 'step2_post_residence_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.step1_post_residence_prompt?.allow == null)
      return { status: RequirementStatus.PENDING }
    if (data.step2_post_residence_prompt?.allow == null)
      return { status: RequirementStatus.PENDING }
    if (data.step1_post_residence_prompt?.allow && data.step2_post_residence_prompt?.allow)
      return { status: RequirementStatus.MET }
    return { status: RequirementStatus.DISQUALIFYING, reason: 'Not allowed.' }
  }
}

export const step3PostResidenceReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'step3_post_residence_req',
  title: 'Accessible post hard req stop?',
  navTitle: 'Accessible post hard req stop?',
  description:
    'Identifies whether requirement+prompts show post previous req that returns disqualifying.',
  promptKeys: ['step3_post_residence_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.step3_post_residence_prompt?.allow == null)
      return { status: RequirementStatus.PENDING }
    if (data.step3_post_residence_prompt?.allow) return { status: RequirementStatus.MET }
    return { status: RequirementStatus.DISQUALIFYING, reason: 'Not allowed.' }
  }
}

export const thanksOrNoThanksReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'thanks_or_no_thanks_req',
  title: 'May or may not want',
  navTitle: 'May or may not want',
  description: 'Simulate a requirement within a program/track that a user may not want.',
  promptKeys: ['thanks_or_no_thanks_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.thanks_or_no_thanks_prompt?.thanks == null)
      return { status: RequirementStatus.PENDING }
    if (data.thanks_or_no_thanks_prompt?.thanks) return { status: RequirementStatus.MET }
    return { status: RequirementStatus.DISQUALIFYING, reason: 'Not allowed.' }
  }
}

export const idTypeReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'id_type_req',
  title: 'DODId or SSN',
  navTitle: 'DODId or SSN',
  description: 'Simulate collecting potential similar data from two different prompt screens.',
  promptKeys: ['id_values_prompt', 'id_values_extra_data_prompt', 'ssn_value_prompt'],
  resolve: idTypeReqResolve
}
